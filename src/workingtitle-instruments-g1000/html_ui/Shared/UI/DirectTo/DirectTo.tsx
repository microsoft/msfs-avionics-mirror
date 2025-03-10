import { AhrsEvents, EventBus, FacilitySearchType, FSComponent, GeoPoint, GeoPointSubject, GNSSEvents, NumberFormatter, Subject, Subscription, VNode } from '@microsoft/msfs-sdk';

import { Fms } from '@microsoft/msfs-garminsdk';

import { UnitsUserSettings } from '../../Units/UnitsUserSettings';
import { BearingDisplay } from '../Common/BearingDisplay';
import { NumberUnitDisplay } from '../Common/NumberUnitDisplay';
import { FmsHEvent } from '../FmsHEvent';
import { NumberInput } from '../UIControls/NumberInput';
import { WaypointInput } from '../UIControls/WaypointInput';
import { DigitInput } from '../UiControls2/DigitInput';
import { G1000UiControlWrapper } from '../UiControls2/G1000UiControlWrapper';
import { CourseNumberInput } from '../UiControls2/CourseNumberInput';
import { UiView, UiViewProps } from '../UiView';
import { DirectToController } from './DirectToController';
import { DirectToStore } from './DirectToStore';

/**
 * The properties on the procedures popout component.
 */
export interface DirectToProps extends UiViewProps {
  /** A fms state manager. */
  fms: Fms;

  /** The event bus */
  bus: EventBus;
}

/**
 * The properties for Direct To Input Data.
 */
export interface DirectToInputData {
  /** The selected segment index for the direct to existing. */
  segmentIndex?: number;
  /** The selected leg index for the direct to existing. */
  legIndex?: number;
  /** The icao of the fix */
  icao: string;
}

/**
 * A view which provides control of the Direct-To function.
 */
export abstract class DirectTo extends UiView<DirectToProps, undefined, DirectToInputData> {
  protected readonly courseOnesRef = FSComponent.createRef<NumberInput>();
  protected readonly courseTensRef = FSComponent.createRef<NumberInput>();

  protected readonly planePos = GeoPointSubject.create(new GeoPoint(NaN, NaN));
  protected readonly planeHeading = Subject.create(NaN);

  protected readonly store = new DirectToStore(this.planePos);
  protected readonly controller = new DirectToController(this.store, this.props.fms, this.props.viewService, this.gotoActivateButton.bind(this));

  protected readonly unitSettingManager = UnitsUserSettings.getManager(this.props.bus);

  protected isOpen = false;

  private planePosSub?: Subscription;
  private planeHeadingSub?: Subscription;

  /** @inheritDoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onAfterRender(node: VNode): void {
    const sub = this.props.bus.getSubscriber<GNSSEvents & AhrsEvents>();
    this.planePosSub = sub.on('gps-position').handle(this.onPlanePosChanged.bind(this), true);
    this.planeHeadingSub = sub.on('hdg_deg_true').atFrequency(1).handle(this.onPlaneHeadingChanged.bind(this), true);
  }

  /** @inheritdoc */
  public onInputDataSet(directToInputData: DirectToInputData | undefined): void {
    if (this.isOpen) {
      this.controller.initializeTarget(directToInputData);
    }
  }

  /**
   * Sets the course subject based on the number input fields.
   */
  protected setCourse(): void {
    const input = this.store.courseInputValue.get();
    this.store.course.set(input === 0 ? 360 : input);
  }

  /** @inheritdoc */
  public onInteractionEvent(evt: FmsHEvent): boolean {
    switch (evt) {
      case FmsHEvent.DIRECTTO:
      case FmsHEvent.CLR:
        this.close();
        return true;
    }
    return false;
  }

  /** @inheritdoc */
  protected gotoActivateButton(): void {
    this.scrollController.gotoIndex(this.getActivateScrollIndex());
  }

  /**
   * Method to get the activate scroll index for this instance.
   * @returns The Activate Scroll Index.
   */
  protected getActivateScrollIndex(): number {
    return 2;
  }

  /**
   * Callback for when the Hold button is pressed.
   */
  public onHoldButtonPressed = (): void => {
    this.controller.activateSelected(true);
  };

  /** @inheritDoc */
  protected onViewOpened(): void {
    this.isOpen = true;

    this.planePosSub!.resume(true);
    this.planeHeadingSub!.resume(true);

    this.controller.initializeTarget(this.inputData.get());
  }

  /** @inheritDoc */
  protected onViewClosed(): void {
    this.isOpen = false;

    this.planePosSub!.pause();
    this.planeHeadingSub!.pause();
  }

  /**
   * A callback which is called when the plane's current position changes.
   * @param pos The new position.
   */
  private onPlanePosChanged(pos: LatLongAlt): void {
    this.planePos.set(pos.lat, pos.long);
  }

  /**
   * A callback which is called when the plane's current true heading changes.
   * @param heading The new heading, in degrees.
   */
  private onPlaneHeadingChanged(heading: number): void {
    this.planeHeading.set(heading);
  }

  /**
   * Renders a waypoint input component.
   * @returns a waypoint input component, as a VNode.
   */
  protected renderWaypointInput(): VNode {
    return (
      <WaypointInput
        bus={this.props.bus}
        viewService={this.props.viewService}
        onRegister={this.register}
        onInputEnterPressed={this.controller.inputEnterPressedHandler}
        onWaypointChanged={this.controller.waypointChangedHandler}
        onMatchedWaypointsChanged={this.controller.matchedWaypointsChangedHandler}
        selectedIcao={this.controller.inputIcao}
        filter={FacilitySearchType.All}
      />
    );
  }

  /**
   * Renders a component which displays the bearing to the store's selected waypoint.
   * @param cssClass CSS class(es) to apply to the root of the component.
   * @returns a component which displays the bearing to the store's selected waypoint, as a VNode.
   */
  protected renderBearing(cssClass?: string): VNode {
    return (
      <BearingDisplay
        value={this.store.waypointInfoStore.bearing} displayUnit={this.unitSettingManager.navAngleUnits}
        formatter={NumberFormatter.create({ precision: 1, pad: 3, nanString: '___' })}
        class={cssClass}
      />
    );
  }

  /**
   * Renders a component which displays the distance to the store's selected waypoint.
   * @param cssClass CSS class(es) to apply to the root of the component.
   * @returns a component which displays the distance to the store's selected waypoint, as a VNode.
   */
  protected renderDistance(cssClass?: string): VNode {
    return (
      <NumberUnitDisplay
        value={this.store.waypointInfoStore.distance} displayUnit={this.unitSettingManager.distanceUnitsLarge}
        formatter={NumberFormatter.create({ precision: 0.1, maxDigits: 3, forceDecimalZeroes: true, nanString: '__._' })}
        class={cssClass}
      />
    );
  }

  /**
   * Renders a component which allows the user to input the direct-to course.
   * @param cssClass CSS class(es) to apply to the root of the component.
   * @returns A component which allows the user to input the direct-to course, as a VNode.
   */
  protected renderCourseInput(cssClass?: string): VNode {
    const tensValueSub = Subject.create(0);
    const onesValueSub = Subject.create(0);
    const setCourse = this.setCourse.bind(this);

    return (
      <G1000UiControlWrapper onRegister={this.register}>
        <CourseNumberInput
          value={this.store.courseInputValue}
          digitizer={(value, signValues, digitValues): void => {
            digitValues[0].set(Math.floor(value / 10) * 10);
            digitValues[1].set(value % 10);
          }}
          renderInactiveValue={(value): string => {
            return `${value === 0 ? '360' : value.toFixed().padStart(3, '0')}°`;
          }}
          onInputAccepted={setCourse} onInputRejected={setCourse}
          class={cssClass}
        >
          <DigitInput value={tensValueSub} minValue={0} maxValue={onesValueSub.map(ones => ones === 0 ? 37 : 36)} increment={1} scale={10} formatter={(value): string => value.toFixed().padStart(2, '0')} wrap />
          <DigitInput value={onesValueSub} minValue={0} maxValue={tensValueSub.map(tens => tens === 360 ? 1 : 10)} increment={1} scale={1} wrap />
          <span>°</span>
        </CourseNumberInput>
      </G1000UiControlWrapper>
    );
  }

  /**
   * A callback which is called when the Load action is executed.
   */
  protected onLoadExecuted = (): void => {
    this.controller.activateSelected();
    this.close();
  };
}
