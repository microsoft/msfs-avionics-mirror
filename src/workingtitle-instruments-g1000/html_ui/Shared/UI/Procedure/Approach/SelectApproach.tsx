import {
  AdditionalApproachType, AirportFacility, ApproachProcedure, ControlEvents, EventBus, ExtendedApproachType, FacilitySearchType, FlightPathCalculator, FocusPosition, FSComponent,
  MathUtils, MinimumsEvents, NodeReference, SortedMappedSubscribableArray, Subject, UnitType, VNode,
} from '@microsoft/msfs-sdk';

import { ApproachListItem, Fms, TransitionListItem } from '@microsoft/msfs-garminsdk';

import { ApproachNameDisplay } from '../../../../Shared/UI/FPL';
import { ContextMenuDialog, ContextMenuItemDefinition, ContextMenuPosition } from '../../Dialogs/ContextMenuDialog';
import { FmsHEvent } from '../../FmsHEvent';
import { UiControlGroup, UiControlGroupProps } from '../../UiControlGroup';
import { ArrowToggle } from '../../UIControls/ArrowToggle';
import { GenericControl } from '../../UIControls/GenericControl';
import { NumberInput } from '../../UIControls/NumberInput';
import { WaypointInput } from '../../UIControls/WaypointInput';
import { SelectControl2 } from '../../UiControls2/SelectControl';
import { ViewService } from '../../ViewService';
import { SelectApproachController } from './SelectApproachController';
import { SelectApproachStore } from './SelectApproachStore';

/**
 * Component props for SelectApproach.
 */
export interface SelectApproachProps extends UiControlGroupProps {
  /** A view service. */
  viewService: ViewService;

  /** The fms */
  fms: Fms;

  /** The event bus */
  bus: EventBus;

  /** A flight path calculator to use to build preview flight plans. */
  calculator: FlightPathCalculator;

  /** Whether this instance of the G1000 has a Radio Altimeter. */
  hasRadioAltimeter: boolean;
}

/**
 * A component for selecting approaches.
 */
export abstract class SelectApproach<P extends SelectApproachProps = SelectApproachProps> extends UiControlGroup<P>{
  protected static readonly APPROACH_TYPE_PRIORITIES: Record<ExtendedApproachType, number> = {
    [ApproachType.APPROACH_TYPE_ILS]: 0,
    [ApproachType.APPROACH_TYPE_LOCALIZER]: 1,
    [ApproachType.APPROACH_TYPE_LOCALIZER_BACK_COURSE]: 2,
    [ApproachType.APPROACH_TYPE_LDA]: 3,
    [ApproachType.APPROACH_TYPE_SDF]: 4,
    [ApproachType.APPROACH_TYPE_RNAV]: 5,
    [ApproachType.APPROACH_TYPE_GPS]: 6,
    [ApproachType.APPROACH_TYPE_VORDME]: 7,
    [ApproachType.APPROACH_TYPE_VOR]: 8,
    [ApproachType.APPROACH_TYPE_NDBDME]: 9,
    [ApproachType.APPROACH_TYPE_NDB]: 10,
    [AdditionalApproachType.APPROACH_TYPE_VISUAL]: 11,
    [ApproachType.APPROACH_TYPE_UNKNOWN]: 12
  };
  protected static readonly APPROACH_RUNWAY_DESIGNATOR_PRIORITIES_FWD: Record<RunwayDesignator, number> = {
    [RunwayDesignator.RUNWAY_DESIGNATOR_NONE]: 0,
    [RunwayDesignator.RUNWAY_DESIGNATOR_CENTER]: 1,
    [RunwayDesignator.RUNWAY_DESIGNATOR_LEFT]: 2,
    [RunwayDesignator.RUNWAY_DESIGNATOR_RIGHT]: 3,
    [RunwayDesignator.RUNWAY_DESIGNATOR_WATER]: 4,
    [RunwayDesignator.RUNWAY_DESIGNATOR_B]: 5,
    [RunwayDesignator.RUNWAY_DESIGNATOR_A]: 6,
  };
  protected static readonly APPROACH_RUNWAY_DESIGNATOR_PRIORITIES_REV: Record<RunwayDesignator, number> = {
    [RunwayDesignator.RUNWAY_DESIGNATOR_NONE]: 0,
    [RunwayDesignator.RUNWAY_DESIGNATOR_CENTER]: 1,
    [RunwayDesignator.RUNWAY_DESIGNATOR_LEFT]: 3,
    [RunwayDesignator.RUNWAY_DESIGNATOR_RIGHT]: 2,
    [RunwayDesignator.RUNWAY_DESIGNATOR_WATER]: 4,
    [RunwayDesignator.RUNWAY_DESIGNATOR_B]: 5,
    [RunwayDesignator.RUNWAY_DESIGNATOR_A]: 6,
  };

  protected readonly approachSelectRef = FSComponent.createRef<SelectControl2<ApproachListItem>>();
  protected readonly transitionSelectRef = FSComponent.createRef<SelectControl2<TransitionListItem>>();
  protected readonly minsToggleComponent = FSComponent.createRef<ArrowToggle>();

  protected readonly store = this.createStore();
  protected readonly controller = this.createController(this.store);

  protected readonly sortedApproachSub = SortedMappedSubscribableArray.create(this.store.procedures, this.sortApproaches.bind(this));
  protected readonly controlPub = this.props.bus.getPublisher<ControlEvents>();

  /**
   * Creates an instance of an approach selection component data store.
   * @returns An approach selection component data store.
   */
  protected abstract createStore(): SelectApproachStore;

  /**
   * Creates an instance of an approach selection component controller.
   * @param store This component's data store.
   * @returns An approach selection component controller.
   */
  protected abstract createController(store: SelectApproachStore): SelectApproachController;

  /** @inheritDoc */
  public onInteractionEvent(evt: FmsHEvent): boolean {
    switch (evt) {
      case FmsHEvent.CLR:
        this.controller.inputIcao.set('');
        return true;
    }

    return false;
  }

  /** Goto and activate next select control. */
  protected gotoNextSelect(): void {
    this.scrollController.gotoNext();
    setTimeout(() => {
      const focusedCtrl = this.scrollController.getFocusedUiControl();
      if (focusedCtrl instanceof GenericControl) {
        if (((focusedCtrl.props.children as unknown as VNode[])[0].instance as SelectControl2<any>).menuItems.length > 1) {
          focusedCtrl.onUpperKnobInc();
        } else {
          this.gotoNextSelect();
        }
      }
    }, 50);
  }

  /** @inheritDoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);
    const minimumsSub = this.props.bus.getSubscriber<MinimumsEvents>();

    if (this.props.hasRadioAltimeter) {
      this.store.minsToggleOptions = ['Off', 'BARO', 'RA'];
    } else {
      this.store.minsToggleOptions = ['Off', 'BARO'];
    }

    this.minsToggleComponent.instance.props.options = this.store.minsToggleOptions;

    minimumsSub.on('minimums_mode').handle((mode) => {
      this.store.minimumsMode.set(mode);
    });

    minimumsSub.on('set_da_distance_unit').handle((unit) => {
      // Since the G1000 sets both DA and DH units the same, we can always rely on just this event for our units.
      this.store.minimumsUnit.set(unit === 'meters' ? UnitType.METER : UnitType.FOOT);
    });

    minimumsSub.on('decision_height_feet').handle((dh) => {
      this.store.decisionHeight.set(dh, UnitType.FOOT);
    });
    minimumsSub.on('decision_altitude_feet').handle((da) => {
      this.store.decisionAltitude.set(da, UnitType.FOOT);
    });

  }

  /**
   * Sorts approaches into the order they should appear in the approach list.
   * @param a An approach list item.
   * @param b An approach list item.
   * @returns 0 if the two approaches are to be sorted identically, a negative number if approach `a` is to be sorted
   * before `b`, or a positive number if approach `a` is to be sorted after `b`.
   */
  protected sortApproaches(a: ApproachListItem, b: ApproachListItem): number {
    // sort first by approach type (ILS, LOC, RNAV, etc)
    let compare = SelectApproach.APPROACH_TYPE_PRIORITIES[a.approach.approachType] - SelectApproach.APPROACH_TYPE_PRIORITIES[b.approach.approachType];
    if (compare === 0) {
      // then sort by runway (circling approaches go last)
      compare = (a.approach.runwayNumber === 0 ? 37 : a.approach.runwayNumber) - (b.approach.runwayNumber === 0 ? 37 : b.approach.runwayNumber);
      if (compare === 0) {
        // then sort by L, C, R (order depends on if runway number is <= 18)
        const priorities = a.approach.runwayNumber <= 18
          ? SelectApproach.APPROACH_RUNWAY_DESIGNATOR_PRIORITIES_FWD
          : SelectApproach.APPROACH_RUNWAY_DESIGNATOR_PRIORITIES_REV;
        compare = priorities[a.approach.runwayDesignator] - priorities[b.approach.runwayDesignator];
        if (compare === 0) {
          // finally sort by approach suffix
          compare = a.approach.approachSuffix.localeCompare(b.approach.approachSuffix);
        }
      }
    }

    return compare;
  }

  /**
   * A callback which is called when enter is pressed on certain controls.
   * @returns Whether or not the control handled the event. Always true here.
   */
  protected onEnterPressedAdvance(): boolean {
    this.gotoNextSelect();
    return true;
  }

  /**
   * Sets the facility and approach input data for the select approach pane.
   * @param facility The facility to set.
   * @param approach The approach to set.
   */
  public setFacilityAndApproach(facility: AirportFacility, approach: ApproachProcedure): void {
    this.controller.onAfterFacilityLoad = (): void => {
      this.gotoNextSelect();

      const index = this.sortedApproachSub.getArray().findIndex(x => x.approach.name === approach.name);
      this.approachSelectRef.instance.selectedIndex.set(index);
      this.approachSelectRef.instance.props.onItemSelected(index, this.approachSelectRef.instance.props.data.get(index), false);

      this.controller.onAfterFacilityLoad = undefined;
    };

    const currentAirport = this.store.selectedFacility.get();
    if (currentAirport?.icao !== facility.icao) {
      this.controller.inputIcao.set(facility.icao);
    } else {
      this.controller.onAfterFacilityLoad();
    }
  }

  /**
   * Initializes the default approach selection page display.
   */
  public initDefaults(): void {
    this.controller.initialize();
  }

  /**
   * Builds a approach procedure menu item.
   * @param proc The approach procedure.
   * @returns A menu item definition.
   */
  protected buildApprMenuItem(proc: ApproachListItem): ContextMenuItemDefinition {
    return {
      renderContent: (): VNode => (
        <ApproachNameDisplay approach={Subject.create(proc.approach)} />
      ),
      estimatedWidth: proc.approach.name.length * ContextMenuDialog.CHAR_WIDTH,
      onFocused: this.controller.approachFocusedHandler.bind(this.controller, proc)
    };
  }

  /**
   * Builds a transition menu item.
   * @param trans The transition.
   * @returns A menu item definition.
   */
  protected buildTransMenuItem(trans: TransitionListItem): ContextMenuItemDefinition {
    return {
      renderContent: (): VNode => <span>{trans.name}</span>,
      estimatedWidth: trans.name.length * ContextMenuDialog.CHAR_WIDTH,
      onFocused: this.controller.transFocusedHandler.bind(this.controller, trans)
    };
  }

  /**
   * Renders the waypoint input component.
   * @returns The rendered waypoint input component, as a VNode.
   */
  protected renderWaypointInput(): VNode {
    return (
      <WaypointInput
        bus={this.props.bus}
        viewService={this.props.viewService}
        onRegister={this.register} onInputEnterPressed={this.gotoNextSelect.bind(this)} selectedIcao={this.controller.inputIcao}
        onFacilityChanged={this.controller.facilityChangedHandler} filter={FacilitySearchType.Airport}
      />
    );
  }

  /**
   * Renders the approach select control component.
   * @param container A reference to the container that constrains the position of the select control pop-up.
   * @param dialogPosition The position of the pop-up context menu dialog spawned by the select control.
   * @returns The rendered approach select control component, as a VNode.
   */
  protected renderApproachSelectControl(container: NodeReference<HTMLElement>, dialogPosition?: ContextMenuPosition): VNode {
    return (
      <GenericControl
        onRegister={this.register}
        onFocused={(): void => { this.approachSelectRef.instance.focus(FocusPosition.First); }}
        onBlurred={(): void => { this.approachSelectRef.instance.blur(); }}
        onUpperKnobInc={(): void => { this.approachSelectRef.instance.onInteractionEvent(FmsHEvent.UPPER_INC); }}
        onUpperKnobDec={(): void => { this.approachSelectRef.instance.onInteractionEvent(FmsHEvent.UPPER_DEC); }}
        class='slct-appr-value'
      >
        <SelectControl2<ApproachListItem>
          ref={this.approachSelectRef}
          viewService={this.props.viewService}
          outerContainer={container}
          data={this.sortedApproachSub} onItemSelected={this.controller.approachSelectedHandler} buildMenuItem={this.buildApprMenuItem.bind(this)}
          dialogPosition={dialogPosition}
          onSelectionDialogClosed={this.controller.approachSelectionClosedHandler}
        />
      </GenericControl>
    );
  }

  /**
   * Renders the transition select control component.
   * @param container A reference to the container that constrains the position of the select control pop-up.
   * @param dialogPosition The position of the pop-up context menu dialog spawned by the select control.
   * @returns The rendered transition select control component, as a VNode.
   */
  protected renderTransitionSelectControl(container: NodeReference<HTMLElement>, dialogPosition?: ContextMenuPosition): VNode {
    return (
      <GenericControl
        onRegister={this.register}
        onFocused={(): void => { this.transitionSelectRef.instance.focus(FocusPosition.First); }}
        onBlurred={(): void => { this.transitionSelectRef.instance.blur(); }}
        onUpperKnobInc={(): void => { this.transitionSelectRef.instance.onInteractionEvent(FmsHEvent.UPPER_INC); }}
        onUpperKnobDec={(): void => { this.transitionSelectRef.instance.onInteractionEvent(FmsHEvent.UPPER_DEC); }}
        class='slct-appr-trans-value'
      >
        <SelectControl2<TransitionListItem>
          ref={this.transitionSelectRef}
          viewService={this.props.viewService}
          outerContainer={container}
          data={this.store.transitions} onItemSelected={this.controller.transSelectedHandler} buildMenuItem={this.buildTransMenuItem.bind(this)}
          dialogPosition={dialogPosition}
          onSelectionDialogClosed={this.controller.transSelectionClosedHandler}
        />
      </GenericControl>
    );
  }

  /**
   * Renders the minimums number input component.
   * @param cssClass CSS class(es) to apply to the number input component.
   * @returns The minimums number input component, as a VNode.
   */
  protected renderMinimumsNumberInput(cssClass?: string): VNode {
    return (
      <MinimumsNumberInput
        onRegister={this.register} quantize={true} onValueChanged={this.controller.updateMinimumsValue} dataSubject={this.store.minimumsSubject}
        minValue={0} maxValue={16000} increment={10} wrap={false} defaultDisplayValue={'_ _ _ _ _'} onEnter={this.onEnterPressedAdvance.bind(this)}
        class={cssClass}
      />
    );
  }
}

/**
 * A number input component for minimums.
 */
class MinimumsNumberInput extends NumberInput {
  protected readonly digitInputEvents = [
    FmsHEvent.D0,
    FmsHEvent.D1,
    FmsHEvent.D2,
    FmsHEvent.D3,
    FmsHEvent.D4,
    FmsHEvent.D5,
    FmsHEvent.D6,
    FmsHEvent.D7,
    FmsHEvent.D8,
    FmsHEvent.D9,
  ];

  private keyboardEditing = false;

  /** @inheritDoc */
  public onInteractionEvent(evt: FmsHEvent): boolean {
    switch (evt) {
      case FmsHEvent.BKSP:
        return this.handleBackspaceInput();
      case FmsHEvent.CLR:
        this.props.dataSubject.set(0);
        this.keyboardEditing = false;
        return true;
    }

    if (this.digitInputEvents.includes(evt)) {
      return this.handleMinimumsDigitInput(evt);
    }

    return super.onInteractionEvent(evt);
  }

  /** @inheritDoc */
  public onDeactivated(): void {
    super.onDeactivated();

    this.props.dataSubject.set(MathUtils.round(this.props.dataSubject.get(), 10));
    this.keyboardEditing = false;
  }

  /** @inheritDoc */
  public onEnter(): boolean {
    this.props.dataSubject.set(MathUtils.round(this.props.dataSubject.get(), 10));
    this.keyboardEditing = false;
    return super.onEnter();
  }

  /**
   * Handles digit input for the minimums number input component.
   * @param evt The digit input event.
   * @returns Whether or not the event was handled.
   */
  protected handleMinimumsDigitInput(evt: FmsHEvent): boolean {
    const digit = Number(evt);
    if (isNaN(digit)) {
      return false;
    }

    if (!this.keyboardEditing) {
      this.props.dataSubject.set(digit);
      this.keyboardEditing = true;
      return true;
    }

    const minimums = this.props.dataSubject.get();
    const newValue = minimums < 10000 ? minimums * 10 + digit : Math.floor(minimums / 10) * 10 + digit;
    this.props.dataSubject.set(MathUtils.clamp(newValue, 0, 16000));
    return true;
  }

  /**
   * Handles backspace input for the minimums number input component.
   * @returns Whether or not the event was handled.
   */
  protected handleBackspaceInput(): boolean {
    if (this.keyboardEditing) {
      const minimums = this.props.dataSubject.get();
      this.props.dataSubject.set(Math.floor(minimums / 10));
    } else {
      this.props.dataSubject.set(0);
      this.keyboardEditing = true;
    }

    return true;
  }
}
