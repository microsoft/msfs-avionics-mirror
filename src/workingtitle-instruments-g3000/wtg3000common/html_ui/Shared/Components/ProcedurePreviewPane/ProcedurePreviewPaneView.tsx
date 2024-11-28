import {
  AirportFacilityDataFlags, CompiledMapSystem, EventBus, FacilityType, FlightPathCalculator, FSComponent, ICAO,
  MapIndexedRangeModule, MapSystemBuilder, RunwayUtils, Subscription, Vec2Math, Vec2Subject, VecNMath, VNode
} from '@microsoft/msfs-sdk';

import {
  Fms, FmsUtils, GarminMapKeys, MapFlightPlanFocusModule, MapPointerController, MapPointerInfoLayerSize,
  MapPointerModule, MapProcedurePreviewModule, MapRangeController, NextGenGarminMapUtils, ProcedureType,
  UnitsUserSettings
} from '@microsoft/msfs-garminsdk';

import { G3000FlightPlannerId } from '../../CommonTypes';
import { PfdControllerJoystickEventMapHandler } from '../../Input/PfdControllerJoystickEventMapHandler';
import { DisplayPanesUserSettings } from '../../Settings/DisplayPanesUserSettings';
import { MapUserSettings } from '../../Settings/MapUserSettings';
import { PfdSensorsUserSettingManager } from '../../Settings/PfdSensorsUserSettings';
import { BingUtils } from '../Bing/BingUtils';
import { ApproachNameDisplay } from '../Common/ApproachNameDisplay';
import { ControllableDisplayPaneIndex, DisplayPaneIndex, DisplayPaneSizeMode } from '../DisplayPanes/DisplayPaneTypes';
import { DisplayPaneView, DisplayPaneViewProps } from '../DisplayPanes/DisplayPaneView';
import { DisplayPaneViewEvent } from '../DisplayPanes/DisplayPaneViewEvents';
import { G3000MapBuilder } from '../Map/G3000MapBuilder';
import { MapConfig } from '../Map/MapConfig';
import { ProcedurePreviewPaneProcData, ProcedurePreviewPaneViewEventTypes } from './ProcedurePreviewPaneViewEvents';

import '../Map/CommonMap.css';

/**
 * Component props for ProcedurePreviewPaneView.
 */
export interface ProcedurePreviewPaneViewProps extends DisplayPaneViewProps {
  /** The event bus. */
  bus: EventBus;

  /** The FMS. */
  fms: Fms<G3000FlightPlannerId>;

  /** The flight path calculator to use to calculate the procedure previews. */
  flightPathCalculator: FlightPathCalculator;

  /** A manager for all PFD sensors user settings. */
  pfdSensorsSettingManager: PfdSensorsUserSettingManager;

  /** A configuration object defining options for the map. */
  config: MapConfig;
}

/**
 * A display pane view which displays a procedure preview.
 */
export class ProcedurePreviewPaneView extends DisplayPaneView<ProcedurePreviewPaneViewProps, DisplayPaneViewEvent<ProcedurePreviewPaneViewEventTypes>> {

  private static readonly DATA_UPDATE_FREQ = 30; // Hz

  private static readonly AIRPORT_FACILITY_DATA_FLAGS
    = NextGenGarminMapUtils.AIRPORT_DATA_FLAGS
    | AirportFacilityDataFlags.Departures
    | AirportFacilityDataFlags.Arrivals
    | AirportFacilityDataFlags.Approaches;

  private readonly size = Vec2Subject.create(Vec2Math.create(100, 100));

  private readonly mapSettingManager = MapUserSettings.getDisplayPaneManager(this.props.bus, this.props.index as ControllableDisplayPaneIndex);

  private readonly compiledMap = MapSystemBuilder.create(this.props.bus)
    .with(G3000MapBuilder.procMap, {
      bingId: `pane_map_${this.props.index}`,
      bingDelay: BingUtils.getBindDelayForPane(this.props.index),

      dataUpdateFreq: ProcedurePreviewPaneView.DATA_UPDATE_FREQ,

      nominalFocusMargins: VecNMath.create(4, 40, 40, 40, 40),

      rangeRingOptions: {
        showLabel: true
      },

      ...G3000MapBuilder.ownAirplaneIconOptions(this.props.config),

      pointerBoundsOffset: VecNMath.create(4, 0.1, 0.1, 0.1, 0.1),
      pointerInfoSize: MapPointerInfoLayerSize.Full,

      miniCompassImgSrc: G3000MapBuilder.miniCompassIconSrc(),

      settingManager: this.mapSettingManager,
      unitsSettingManager: UnitsUserSettings.getManager(this.props.bus),

      pfdIndex: G3000MapBuilder.getPfdIndexForDisplayPane(this.props.index, this.props.pfdSensorsSettingManager.pfdCount),
      pfdSensorsSettingManager: this.props.pfdSensorsSettingManager
    })
    .withProjectedSize(this.size)
    .build('common-map proc-map') as CompiledMapSystem<
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
        /** The pointer controller. */
        [GarminMapKeys.Pointer]: MapPointerController;
        /** The range controller. */
        [GarminMapKeys.Range]: MapRangeController;
      },
      any
    >;

  private readonly mapRangeModule = this.compiledMap.context.model.getModule(GarminMapKeys.Range);
  private readonly mapProcPreviewModule = this.compiledMap.context.model.getModule(GarminMapKeys.ProcedurePreview);
  private readonly mapFocusModule = this.compiledMap.context.model.getModule(GarminMapKeys.FlightPlanFocus);
  private readonly mapPointerModule = this.compiledMap.context.model.getModule(GarminMapKeys.Pointer);

  private readonly mapPointerController = this.compiledMap.context.getController(GarminMapKeys.Pointer);
  private readonly mapRangeController = this.compiledMap.context.getController(GarminMapKeys.Range);

  private readonly mapPointerActiveSetting = DisplayPanesUserSettings.getDisplayPaneManager(this.props.bus, this.props.index).getSetting('displayPaneMapPointerActive');

  private readonly pfdControllerJoystickEventHandler = this.props.index === DisplayPaneIndex.LeftPfd || this.props.index === DisplayPaneIndex.RightPfd
    ? new PfdControllerJoystickEventMapHandler({
      onPointerToggle: this.onJoystickPointerToggle.bind(this),
      onPointerMove: this.onJoystickPointerMove.bind(this),
      onRangeChange: this.onJoystickRangeChange.bind(this)
    })
    : undefined;

  // Map projection parameters are not fully initialized until after the first time the map is updated, so we flag the
  // map as not ready until the first update is finished.
  private isReady = false;
  private readonly isReadyPromiseResolve!: () => void;
  private readonly isReadyPromiseReject!: (reason?: any) => void;
  private readonly isReadyPromise = new Promise<void>((resolve, reject) => {
    (this.isReadyPromiseResolve as () => void) = resolve;
    (this.isReadyPromiseReject as (reason?: any) => void) = reject;
  });

  private setProcedureOpId = 0;

  private pointerActivePipe?: Subscription;

  /** @inheritdoc */
  public override onAfterRender(): void {
    this.compiledMap.ref.instance.sleep();

    this.pointerActivePipe = this.mapPointerModule.isActive.pipe(this.mapPointerActiveSetting, true);
  }

  /** @inheritdoc */
  public override onResume(size: DisplayPaneSizeMode, width: number, height: number): void {
    this.size.set(width, height);
    this.compiledMap.ref.instance.wake();
    this.pointerActivePipe?.resume(true);
  }

  /** @inheritdoc */
  public override onPause(): void {
    this.mapPointerController.setPointerActive(false);
    this.compiledMap.ref.instance.sleep();
    this.pointerActivePipe?.pause();
    this.mapPointerActiveSetting.value = false;
  }

  /** @inheritdoc */
  public override onResize(size: DisplayPaneSizeMode, width: number, height: number): void {
    this.size.set(width, height);
  }

  /** @inheritdoc */
  public override onUpdate(time: number): void {
    this.compiledMap.ref.instance.update(time);

    if (!this.isReady) {
      this.isReady = true;
      this.isReadyPromiseResolve();
    }
  }

  /** @inheritdoc */
  public onEvent(event: DisplayPaneViewEvent<ProcedurePreviewPaneViewEventTypes>): void {
    switch (event.eventType) {
      case 'display_pane_map_range_inc':
        this.changeRangeIndex(1);
        break;
      case 'display_pane_map_range_dec':
        this.changeRangeIndex(-1);
        break;
      case 'display_pane_map_pointer_active_set':
        this.mapPointerController.setPointerActive(event.eventData as boolean);
        break;
      case 'display_pane_map_pointer_active_toggle':
        this.mapPointerController.togglePointerActive();
        break;
      case 'display_pane_map_pointer_move': {
        if (this.mapPointerModule.isActive.get()) {
          const eventData = event.eventData as [number, number];
          this.mapPointerController.movePointer(eventData[0], eventData[1]);
        }
        break;
      }
      case 'display_pane_procedure_preview_set':
        this.setProcedure(event.eventData as ProcedurePreviewPaneProcData);
        break;
    }
  }

  /** @inheritDoc */
  public onInteractionEvent(event: string): boolean {
    if (this.pfdControllerJoystickEventHandler) {
      return this.pfdControllerJoystickEventHandler.onInteractionEvent(event);
    }

    return false;
  }

  /**
   * Responds to when a map pointer toggle event is commanded by the PFD controller joystick.
   * @returns Whether the event was handled.
   */
  private onJoystickPointerToggle(): boolean {
    this.mapPointerController.togglePointerActive();
    return true;
  }

  /**
   * Responds to when a map pointer move event is commanded by the PFD controller joystick.
   * @param dx The horizontal displacement, in pixels.
   * @param dy The vertical displacement, in pixels.
   * @returns Whether the event was handled.
   */
  private onJoystickPointerMove(dx: number, dy: number): boolean {
    this.mapPointerController.movePointer(dx, dy);
    return true;
  }

  /**
   * Responds to when a map range change event is commanded by the PFD controller joystick.
   * @param direction The direction in which to change the map range.
   * @returns Whether the event was handled.
   */
  private onJoystickRangeChange(direction: 1 | -1): boolean {
    this.changeRangeIndex(direction);
    return true;
  }

  /**
   * Changes this view's map range index.
   * @param delta The change in index to apply.
   */
  private changeRangeIndex(delta: number): void {
    const oldIndex = this.mapRangeModule.nominalRangeIndex.get();
    const newIndex = this.mapRangeController.changeRangeIndex(delta);

    if (newIndex !== oldIndex) {
      this.mapPointerController.targetPointer();
    }
  }

  /**
   * Sets the previewed procedure.
   * @param procedureData Data describing the previewed procedure.
   */
  private async setProcedure(procedureData: ProcedurePreviewPaneProcData): Promise<void> {
    if (
      !ICAO.isValueFacility(procedureData.airportIcao, FacilityType.Airport)
      || (procedureData.procedureIndex < 0 && procedureData.type !== ProcedureType.VISUALAPPROACH)
    ) {
      this.clearProcedure();
      return;
    }

    const opId = ++this.setProcedureOpId;

    const [airport] = await Promise.all([
      this.props.fms.facLoader.tryGetFacility(FacilityType.Airport, procedureData.airportIcao, ProcedurePreviewPaneView.AIRPORT_FACILITY_DATA_FLAGS),
      this.awaitReady()
    ]);

    if (opId !== this.setProcedureOpId) {
      return;
    }

    if (!airport) {
      this.clearProcedure();
      return;
    }

    const oneWayRunway = procedureData.runwayDesignation === ''
      ? undefined
      : RunwayUtils.matchOneWayRunwayFromDesignation(airport, procedureData.runwayDesignation);

    if (procedureData.type === ProcedureType.VISUALAPPROACH && oneWayRunway === undefined) {
      this.clearProcedure();
      return;
    }

    const runwayNumber = oneWayRunway?.direction;
    const runwayDesignator = oneWayRunway?.runwayDesignator;

    const previewPlan = await this.props.fms.buildProcedurePreviewPlan(
      this.props.flightPathCalculator,
      airport,
      procedureData.type,
      procedureData.procedureIndex,
      procedureData.transitionIndex,
      oneWayRunway,
      procedureData.runwayTransitionIndex,
      runwayNumber,
      runwayDesignator
    );

    if (opId !== this.setProcedureOpId) {
      return;
    }

    let title: string | VNode;
    switch (procedureData.type) {
      case ProcedureType.DEPARTURE:
        title = `Departure – ${FmsUtils.getDepartureNameAsString(airport, airport.departures[procedureData.procedureIndex], procedureData.transitionIndex, oneWayRunway)}`;
        break;
      case ProcedureType.ARRIVAL:
        title = `Arrival – ${FmsUtils.getArrivalNameAsString(airport, airport.arrivals[procedureData.procedureIndex], procedureData.transitionIndex, oneWayRunway)}`;
        break;
      case ProcedureType.APPROACH:
        title = (
          <ApproachNameDisplay
            approach={airport.approaches[procedureData.procedureIndex]}
            airport={airport}
            prefix='Approach – '
          />
        );
        break;
      case ProcedureType.VISUALAPPROACH: {
        title = (
          <ApproachNameDisplay
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            approach={FmsUtils.buildEmptyVisualApproach(oneWayRunway!)}
            airport={airport}
            prefix='Approach – '
          />
        );
        break;
      }
      default:
        title = '';
    }

    this._title.set(title);
    this.mapProcPreviewModule.procedureType.set(procedureData.type);
    this.mapProcPreviewModule.procedurePlan.set(previewPlan);
    this.mapFocusModule.focus.set([...previewPlan.legs()]);
  }

  /**
   * Clears the previewed procedure.
   */
  private clearProcedure(): void {
    this._title.set('');
    this.mapProcPreviewModule.procedureType.set(ProcedureType.DEPARTURE);
    this.mapProcPreviewModule.procedurePlan.set(null);
    this.mapFocusModule.focus.set(null);
  }

  /**
   * Waits until this view's map is ready to preview procedures.
   * @returns A Promise which will be fulfilled when this view's map is ready to preview procedures, or rejected if
   * this view is destroyed before the map is ready.
   */
  private awaitReady(): Promise<void> {
    return this.isReadyPromise;
  }

  /** @inheritdoc */
  public override render(): VNode | null {
    return (
      this.compiledMap.map
    );
  }

  /** @inheritdoc */
  public override destroy(): void {
    this.isReadyPromiseReject('ProcedurePreviewPaneView: view was destroyed');

    this.compiledMap.ref.instance.destroy();

    this.pointerActivePipe?.destroy();

    super.destroy();
  }
}
