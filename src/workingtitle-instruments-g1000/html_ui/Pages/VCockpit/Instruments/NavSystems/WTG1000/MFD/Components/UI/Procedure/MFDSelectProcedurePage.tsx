import {
  CompiledMapSystem, EventBus, FlightPathCalculator, FSComponent, MapIndexedRangeModule, MapSystemBuilder, MathUtils, Subject, Vec2Math, VecNMath, VNode
} from 'msfssdk';

import {
  Fms, GarminMapKeys, MapFlightPlanFocusModule, MapPointerController, MapPointerInfoLayerSize, MapPointerModule, MapProcedurePreviewModule, MapRangeController,
  ProcedureType, UnitsUserSettings
} from 'garminsdk';

import { G1000ControlEvents } from '../../../../Shared/G1000Events';
import { MapBuilder } from '../../../../Shared/Map/MapBuilder';
import { MapUserSettings } from '../../../../Shared/Map/MapUserSettings';
import { MapWaypointIconImageCache } from '../../../../Shared/Map/MapWaypointIconImageCache';
import { FmsHEvent } from '../../../../Shared/UI/FmsHEvent';
import { UiControlGroup } from '../../../../Shared/UI/UiControlGroup';
import { MFDUiPage, MFDUiPageProps } from '../MFDUiPage';
import { MFDSelectApproach } from './Approach/MFDSelectApproach';
import { MFDSelectArrival } from './DepArr/MFDSelectArrival';
import { MFDSelectDeparture } from './DepArr/MFDSelectDeparture';

import './MFDSelectProcedurePage.css';

/**
 * An MFD select procedure component.
 */
export interface MFDSelectProcedure extends UiControlGroup {
  /**
   * Activates this component.
   */
  activate(): void;

  /**
   * Deactivates this component.
   */
  deactivate(): void;
}

/**
 * A map of procedure types to MFD select procedure component types.
 */
export type MFDSelectProcedureTypeComponentMap = {
  /** Departures. */
  [ProcedureType.DEPARTURE]: MFDSelectDeparture;
  /** Arrivals. */
  [ProcedureType.ARRIVAL]: MFDSelectArrival;
  /** Approaches. */
  [ProcedureType.APPROACH]: MFDSelectApproach;
  /** Visual approaches. */
  [ProcedureType.VISUALAPPROACH]: MFDSelectApproach;
}

/**
 * Component props for MFDSelectProcedurePage.
 */
export interface MFDSelectProcedurePageProps extends MFDUiPageProps {
  /** The event bus. */
  bus: EventBus;

  /** The flight management system. */
  fms: Fms;

  /** A flight path calculator to use to build preview flight plans. */
  calculator: FlightPathCalculator;

  /** Whether this instance of the G1000 has a Radio Altimeter. */
  hasRadioAltimeter: boolean;
}

/**
 * An MFD select procedure page.
 */
export class MFDSelectProcedurePage extends MFDUiPage<MFDSelectProcedurePageProps> {
  protected static readonly MAP_UPDATE_FREQ = 30; // Hz
  protected static readonly MAP_POINTER_MOVE_INCREMENT = 5; // pixels

  protected readonly selectDepartureRef = FSComponent.createRef<MFDSelectDeparture>();
  protected readonly selectArrivalRef = FSComponent.createRef<MFDSelectArrival>();
  protected readonly selectApproachRef = FSComponent.createRef<MFDSelectApproach>();

  private readonly mapSettingManager = MapUserSettings.getMfdManager(this.props.bus);

  private readonly compiledMap = MapSystemBuilder.create(this.props.bus)
    .with(MapBuilder.procMap, {
      bingId: 'mfd-page-map',
      dataUpdateFreq: MFDSelectProcedurePage.MAP_UPDATE_FREQ,

      nominalFocusMargins: VecNMath.create(4, 40, 40, 40, 40),

      waypointIconImageCache: MapWaypointIconImageCache.getCache(),

      rangeRingOptions: {
        showLabel: true
      },

      ...MapBuilder.ownAirplaneIconOptions(),

      pointerBoundsOffset: VecNMath.create(4, 0.1, 0.1, 0.1, 0.1),
      pointerInfoSize: MapPointerInfoLayerSize.Medium,

      miniCompassImgSrc: MapBuilder.miniCompassIconSrc(),

      settingManager: this.mapSettingManager as any,
      unitsSettingManager: UnitsUserSettings.getManager(this.props.bus)
    })
    .withProjectedSize(Vec2Math.create(578, 734))
    .withDeadZone(VecNMath.create(4, 0, 56, 0, 0))
    .withClockUpdate(MFDSelectProcedurePage.MAP_UPDATE_FREQ)
    .build('mfd-procmap') as CompiledMapSystem<
      {
        /** The range module. */
        [GarminMapKeys.Range]: MapIndexedRangeModule;

        /** The procedure preview module. */
        [GarminMapKeys.ProcedurePreview]: MapProcedurePreviewModule;

        /** The flight plan focus module. */
        [GarminMapKeys.FlightPlanFocus]: MapFlightPlanFocusModule;

        /** The pointer module. */
        [GarminMapKeys.Pointer]: MapPointerModule;
      },
      any,
      {
        /** The range controller. */
        [GarminMapKeys.Range]: MapRangeController;

        /** The pointer controller. */
        [GarminMapKeys.Pointer]: MapPointerController;
      },
      any
    >;

  private readonly mapRangeModule = this.compiledMap.context.model.getModule(GarminMapKeys.Range);
  private readonly mapProcPreviewModule = this.compiledMap.context.model.getModule(GarminMapKeys.ProcedurePreview);
  private readonly mapFocusModule = this.compiledMap.context.model.getModule(GarminMapKeys.FlightPlanFocus);
  private readonly mapPointerModule = this.compiledMap.context.model.getModule(GarminMapKeys.Pointer);

  private readonly mapRangeController = this.compiledMap.context.getController(GarminMapKeys.Range);
  private readonly mapPointerController = this.compiledMap.context.getController(GarminMapKeys.Pointer);

  private activeSelectProcedure?: MFDSelectProcedure;
  private activeProcedureType = Subject.create(ProcedureType.APPROACH);

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    super.onAfterRender(thisNode);

    this.compiledMap.ref.instance.sleep();

    // Select procedure pages are always scroll enabled.
    this.setScrollEnabled(true);

    this.selectDepartureRef.instance.deactivate();
    this.selectArrivalRef.instance.deactivate();
    this.selectApproachRef.instance.deactivate();
    this._setActiveProcedureType(this.activeProcedureType.get());

    this.props.bus.getSubscriber<G1000ControlEvents>().on('mfd_proc_page_type').whenChanged().handle(type => {
      this._setActiveProcedureType(type);
    });

    this.activeProcedureType.pipe(this.mapProcPreviewModule.procedureType);
  }

  /**
   * Sets the active procedure type for this page, activating the corresponding select procedure component. Procedure
   * selection is restricted to the active procedure type.
   * @param type A procedure type.
   * @returns The select procedure component that was activated, or undefined if this page is not yet initialized.
   */
  public setActiveProcedureType<T extends ProcedureType>(type: T): MFDSelectProcedureTypeComponentMap[T] | undefined {
    this.props.bus.pub('mfd_proc_page_type', type, false);
    return this.activeSelectProcedure as MFDSelectProcedureTypeComponentMap[T] | undefined;
  }

  /**
   * Sets the active procedure type for this page, activating the corresponding select procedure component.
   * @param type A procedure type.
   */
  private _setActiveProcedureType(type: ProcedureType): void {
    this.activeProcedureType.set(type);

    if (this.activeSelectProcedure) {
      this.activeSelectProcedure.deactivate();
      this.scrollController.unregisterCtrl(this.activeSelectProcedure);
    }

    let selectProc: MFDSelectProcedure | undefined;
    switch (type) {
      case ProcedureType.DEPARTURE:
        selectProc = this.selectDepartureRef.instance;
        this._title.set('PROC – Departure Loading');
        break;
      case ProcedureType.ARRIVAL:
        selectProc = this.selectArrivalRef.instance;
        this._title.set('PROC – Arrival Loading');
        break;
      case ProcedureType.APPROACH:
      case ProcedureType.VISUALAPPROACH:
        selectProc = this.selectApproachRef.instance;
        this._title.set('PROC – Approach Loading');
        break;
    }

    this.activeSelectProcedure = selectProc;
    if (selectProc) {
      this.scrollController.registerCtrl(selectProc);
      this.scrollController.gotoFirst();
      selectProc.activate();
    }
  }

  /** @inheritdoc */
  public onInteractionEvent(evt: FmsHEvent): boolean {
    switch (evt) {
      case FmsHEvent.UPPER_PUSH:
        this.props.viewService.openLastPage();
        return true;
      case FmsHEvent.RANGE_DEC:
        this.changeMapRangeIndex(-1);
        return true;
      case FmsHEvent.RANGE_INC:
        this.changeMapRangeIndex(1);
        return true;
      case FmsHEvent.JOYSTICK_PUSH:
        this.mapPointerController.togglePointerActive();
        return true;
    }

    return this.handleMapPointerMoveEvent(evt) || super.onInteractionEvent(evt);
  }

  /**
   * Changes the MFD map range index setting.
   * @param delta The change in index to apply.
   */
  private changeMapRangeIndex(delta: number): void {
    const currentIndex = this.mapRangeModule.nominalRangeIndex.get();
    const newIndex = MathUtils.clamp(currentIndex + delta, 0, this.mapRangeModule.nominalRanges.get().length - 1);

    if (newIndex !== currentIndex) {
      this.mapPointerController.targetPointer();
      this.mapRangeController.setRangeIndex(newIndex);
    }
  }

  /**
   * Handles events that move the map pointer.
   * @param evt The event.
   * @returns Whether the event was handled.
   */
  private handleMapPointerMoveEvent(evt: FmsHEvent): boolean {
    if (!this.mapPointerModule.isActive.get()) {
      return false;
    }

    switch (evt) {
      case FmsHEvent.JOYSTICK_LEFT:
        this.mapPointerController?.movePointer(-MFDSelectProcedurePage.MAP_POINTER_MOVE_INCREMENT, 0);
        return true;
      case FmsHEvent.JOYSTICK_UP:
        this.mapPointerController?.movePointer(0, -MFDSelectProcedurePage.MAP_POINTER_MOVE_INCREMENT);
        return true;
      case FmsHEvent.JOYSTICK_RIGHT:
        this.mapPointerController?.movePointer(MFDSelectProcedurePage.MAP_POINTER_MOVE_INCREMENT, 0);
        return true;
      case FmsHEvent.JOYSTICK_DOWN:
        this.mapPointerController?.movePointer(0, MFDSelectProcedurePage.MAP_POINTER_MOVE_INCREMENT);
        return true;
    }

    return false;
  }

  /** @inheritdoc */
  protected onViewOpened(): void {
    super.onViewOpened();

    this.props.menuSystem.clear();
    this.props.menuSystem.pushMenu('selectproc-root');

    this.compiledMap.ref.instance.wake();
  }

  /** @inheritdoc */
  protected onViewClosed(): void {
    this.mapPointerController.setPointerActive(false);
    this.compiledMap.ref.instance.sleep();
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div ref={this.viewContainerRef} class='mfd-page'>
        {this.compiledMap.map}
        <MFDSelectDeparture
          ref={this.selectDepartureRef}
          viewService={this.props.viewService}
          bus={this.props.bus}
          fms={this.props.fms}
          calculator={this.props.calculator}
          procedurePlan={this.mapProcPreviewModule.procedurePlan}
          transitionPlan={this.mapProcPreviewModule.transitionPlan}
          focus={this.mapFocusModule.focus}
        />
        <MFDSelectArrival
          ref={this.selectArrivalRef}
          viewService={this.props.viewService}
          bus={this.props.bus}
          fms={this.props.fms}
          calculator={this.props.calculator}
          procedurePlan={this.mapProcPreviewModule.procedurePlan}
          transitionPlan={this.mapProcPreviewModule.transitionPlan}
          focus={this.mapFocusModule.focus}
        />
        <MFDSelectApproach
          ref={this.selectApproachRef}
          viewService={this.props.viewService}
          bus={this.props.bus}
          fms={this.props.fms}
          calculator={this.props.calculator}
          procedurePlan={this.mapProcPreviewModule.procedurePlan}
          transitionPlan={this.mapProcPreviewModule.transitionPlan}
          focus={this.mapFocusModule.focus}
          hasRadioAltimeter={this.props.hasRadioAltimeter}
        />
      </div>
    );
  }
}