import {
  CompiledMapSystem, EventBus, FacilityLoader, FlightPlanner, ICAO, MapIndexedRangeModule, MapSystemBuilder,
  Subscription, Vec2Math, Vec2Subject, VecNMath, VNode
} from '@microsoft/msfs-sdk';

import {
  GarminFacilityWaypointCache, GarminMapKeys, MapPointerController, MapPointerInfoLayerSize, MapPointerModule,
  MapRangeController, MapWaypointHighlightModule, NearestMapRTRController, NextGenGarminMapUtils, TrafficSystem,
  TrafficUserSettings, UnitsUserSettings, WindDataProvider
} from '@microsoft/msfs-garminsdk';

import { G3000FlightPlannerId } from '../../CommonTypes';
import { PfdControllerJoystickEventMapHandler } from '../../Input/PfdControllerJoystickEventMapHandler';
import { DisplayPanesUserSettings } from '../../Settings/DisplayPanesUserSettings';
import { MapUserSettings } from '../../Settings/MapUserSettings';
import { PfdSensorsUserSettingManager } from '../../Settings/PfdSensorsUserSettings';
import { BingUtils } from '../Bing/BingUtils';
import { ControllableDisplayPaneIndex, DisplayPaneIndex, DisplayPaneSizeMode } from '../DisplayPanes/DisplayPaneTypes';
import { DisplayPaneView, DisplayPaneViewProps } from '../DisplayPanes/DisplayPaneView';
import { DisplayPaneViewEvent } from '../DisplayPanes/DisplayPaneViewEvents';
import { G3000MapBuilder } from '../Map/G3000MapBuilder';
import { MapConfig } from '../Map/MapConfig';
import { NearestPaneSelectionData, NearestPaneSelectionType, NearestPaneViewEventTypes } from './NearestPaneViewEvents';

import '../Map/CommonMap.css';

/**
 * Component props for NearestPaneView.
 */
export interface NearestPaneViewProps extends DisplayPaneViewProps {
  /** The event bus. */
  bus: EventBus;

  /** A facility loader. */
  facLoader: FacilityLoader;

  /** The flight planner. */
  flightPlanner: FlightPlanner<G3000FlightPlannerId>;

  /** The traffic system used by the map to display traffic. */
  trafficSystem: TrafficSystem;

  /** A provider of wind data. Required to display the map wind vector. */
  windDataProvider?: WindDataProvider;

  /** A manager for all PFD sensors user settings. */
  pfdSensorsSettingManager: PfdSensorsUserSettingManager;

  /** A configuration object defining options for the map. */
  config: MapConfig;
}

/**
 * A display pane view which displays a nearest map.
 */
export class NearestPaneView extends DisplayPaneView<NearestPaneViewProps, DisplayPaneViewEvent<NearestPaneViewEventTypes>> {

  private static readonly DATA_UPDATE_FREQ = 30; // Hz

  private static readonly TITLE_TEXT: Record<NearestPaneSelectionType, string> = {
    [NearestPaneSelectionType.Airport]: 'Nearest Airport',
    [NearestPaneSelectionType.Vor]: 'Nearest VOR',
    [NearestPaneSelectionType.Ndb]: 'Nearest NDB',
    [NearestPaneSelectionType.Intersection]: 'Nearest Intersection',
    [NearestPaneSelectionType.User]: 'Nearest User Wpt',
    [NearestPaneSelectionType.Weather]: 'Nearest Weather'
  };

  private readonly size = Vec2Subject.create(Vec2Math.create(100, 100));

  private readonly facWaypointCache = GarminFacilityWaypointCache.getCache(this.props.bus);

  private readonly mapSettingManager = MapUserSettings.getDisplayPaneManager(this.props.bus, this.props.index as ControllableDisplayPaneIndex);

  private readonly compiledMap = MapSystemBuilder.create(this.props.bus)
    .with(G3000MapBuilder.nearestMap, {
      facilityLoader: this.props.facLoader,

      bingId: `pane_map_${this.props.index}`,
      bingDelay: BingUtils.getBindDelayForPane(this.props.index),

      dataUpdateFreq: NearestPaneView.DATA_UPDATE_FREQ,

      includeRunwayOutlines: true,

      rangeRingOptions: {
        showLabel: true
      },

      rangeCompassOptions: {
        showLabel: true,
        showHeadingBug: true,
        supportHeadingSync: true,
        bearingTickMajorLength: 10,
        bearingTickMinorLength: 5,
        bearingLabelFont: 'DejaVuSans-SemiBold',
        bearingLabelFontSize: 17
      },

      flightPlanner: this.props.flightPlanner,

      ...G3000MapBuilder.ownAirplaneIconOptions(this.props.config),

      trafficSystem: this.props.trafficSystem,
      trafficIconOptions: {
        iconSize: 30,
        font: 'DejaVuSans-SemiBold',
        fontSize: 14
      },

      windDataProvider: this.props.windDataProvider,

      pointerBoundsOffset: VecNMath.create(4, 0.1, 0.1, 0.1, 0.1),
      pointerInfoSize: MapPointerInfoLayerSize.Full,

      miniCompassImgSrc: G3000MapBuilder.miniCompassIconSrc(),

      includeTerrainScale: false,

      settingManager: this.mapSettingManager,
      unitsSettingManager: UnitsUserSettings.getManager(this.props.bus),
      trafficSettingManager: TrafficUserSettings.getManager(this.props.bus),

      pfdIndex: G3000MapBuilder.getPfdIndexForDisplayPane(this.props.index, this.props.pfdSensorsSettingManager.pfdCount),
      pfdSensorsSettingManager: this.props.pfdSensorsSettingManager
    })
    .withProjectedSize(this.size)
    .build('common-map nearest-map') as CompiledMapSystem<
      {
        /** The range module. */
        [GarminMapKeys.Range]: MapIndexedRangeModule;
        /** The pointer module. */
        [GarminMapKeys.Pointer]: MapPointerModule;
        /** The waypoint highlight module. */
        [GarminMapKeys.WaypointHighlight]: MapWaypointHighlightModule;
      },
      any,
      {
        /** The range controller. */
        [GarminMapKeys.Range]: MapRangeController;
        /** The pointer controller. */
        [GarminMapKeys.Pointer]: MapPointerController;
        /** The waypoint RTR controller. */
        [GarminMapKeys.Nearest]: NearestMapRTRController;
      },
      any
    >;

  private readonly mapRangeModule = this.compiledMap.context.model.getModule(GarminMapKeys.Range);
  private readonly mapWptHighlightModule = this.compiledMap.context.model.getModule(GarminMapKeys.WaypointHighlight);
  private readonly mapPointerModule = this.compiledMap.context.model.getModule(GarminMapKeys.Pointer);

  private readonly mapPointerController = this.compiledMap.context.getController(GarminMapKeys.Pointer);
  private readonly mapRangeController = this.compiledMap.context.getController(GarminMapKeys.Range);
  private readonly mapNrstRTRController = this.compiledMap.context.getController(GarminMapKeys.Nearest);

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

  private setWaypointOpId = 0;

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
  public onEvent(event: DisplayPaneViewEvent<NearestPaneViewEventTypes>): void {
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
      case 'display_pane_nearest_set':
        this.setWaypoint(event.eventData as NearestPaneSelectionData);
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
   * Sets the selected waypoint.
   * @param selectionData Data describing the selected waypoint.
   */
  private async setWaypoint(selectionData: NearestPaneSelectionData): Promise<void> {
    this._title.set(NearestPaneView.TITLE_TEXT[selectionData.type] ?? '');

    if (!ICAO.isValueFacility(selectionData.icao)) {
      this.mapWptHighlightModule.waypoint.set(null);
      return;
    }

    const opId = ++this.setWaypointOpId;

    const [facility] = await Promise.all([
      this.props.facLoader.tryGetFacility(ICAO.getFacilityTypeFromValue(selectionData.icao), selectionData.icao, NextGenGarminMapUtils.AIRPORT_DATA_FLAGS),
      this.awaitReady()
    ]);

    if (opId !== this.setWaypointOpId) {
      return;
    }

    if (!facility) {
      this.mapWptHighlightModule.waypoint.set(null);
      return;
    }

    const waypoint = this.facWaypointCache.get(facility);
    this.mapWptHighlightModule.waypoint.set(waypoint);

    if (selectionData.resetRange) {
      this.mapNrstRTRController.trySetRangeForWaypoint();
    }
  }

  /**
   * Waits until this view's map is ready to target selected waypoints.
   * @returns A Promise which will be fulfilled when this view's map is ready to target selected waypoints, or
   * rejected if this view is destroyed before the map is ready.
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
    this.isReadyPromiseReject('NearestPaneView: view was destroyed');

    this.compiledMap.ref.instance.destroy();

    this.pointerActivePipe?.destroy();

    super.destroy();
  }
}
