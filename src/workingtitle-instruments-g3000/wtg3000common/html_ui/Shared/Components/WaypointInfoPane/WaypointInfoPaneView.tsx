import {
  AirportRunway, CompiledMapSystem, EventBus, FacilityLoader, FacilityType, FacilityUtils, ICAO,
  MapIndexedRangeModule, MapSystemBuilder, Subscription, Vec2Math, Vec2Subject, VecNMath, VNode
} from '@microsoft/msfs-sdk';

import {
  AirportWaypoint, GarminFacilityWaypointCache, GarminMapKeys, MapPointerController, MapPointerInfoLayerSize,
  MapPointerModule, MapRangeController, NextGenGarminMapUtils, UnitsUserSettings, WaypointMapRTRController,
  WaypointMapSelectionModule
} from '@microsoft/msfs-garminsdk';

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
import { WaypointInfoPaneSelectionData, WaypointInfoPaneViewEventTypes } from './WaypointInfoPaneViewEvents';

import '../Map/CommonMap.css';

/**
 * Component props for WaypointInfoPaneView.
 */
export interface WaypointInfoPaneViewProps extends DisplayPaneViewProps {
  /** The event bus. */
  bus: EventBus;

  /** A facility loader. */
  facLoader: FacilityLoader;

  /** A manager for all PFD sensors user settings. */
  pfdSensorsSettingManager: PfdSensorsUserSettingManager;

  /** A configuration object defining options for the map. */
  config: MapConfig;
}

/**
 * A display pane view which displays a waypoint information map.
 */
export class WaypointInfoPaneView extends DisplayPaneView<WaypointInfoPaneViewProps, DisplayPaneViewEvent<WaypointInfoPaneViewEventTypes>> {

  private static readonly DATA_UPDATE_FREQ = 30; // Hz

  private static readonly DEFAULT_RANGE_INDEX = 14; // 7.5 nm / 15 km

  private static readonly TITLE_TEXT: Partial<Record<FacilityType, string>> = {
    [FacilityType.Airport]: 'Airport Information',
    [FacilityType.VOR]: 'VOR Information',
    [FacilityType.NDB]: 'NDB Information',
    [FacilityType.Intersection]: 'Intersection Information',
    [FacilityType.USR]: 'User Wpt Information'
  };

  private readonly size = Vec2Subject.create(Vec2Math.create(100, 100));

  private readonly facWaypointCache = GarminFacilityWaypointCache.getCache(this.props.bus);

  private readonly mapSettingManager = MapUserSettings.getDisplayPaneManager(this.props.bus, this.props.index as ControllableDisplayPaneIndex);

  private readonly compiledMap = MapSystemBuilder.create(this.props.bus)
    .with(G3000MapBuilder.waypointMap, {
      facilityLoader: this.props.facLoader,

      bingId: `pane_map_${this.props.index}`,
      bingDelay: BingUtils.getBindDelayForPane(this.props.index),

      dataUpdateFreq: WaypointInfoPaneView.DATA_UPDATE_FREQ,

      supportAirportAutoRange: true,
      airportAutoRangeMargins: VecNMath.create(4, 40, 40, 40, 40),

      includeRunwayOutlines: true,

      rangeRingOptions: {
        showLabel: true
      },

      ...G3000MapBuilder.ownAirplaneIconOptions(this.props.config),

      pointerBoundsOffset: VecNMath.create(4, 0.1, 0.1, 0.1, 0.1),
      pointerInfoSize: MapPointerInfoLayerSize.Full,

      miniCompassImgSrc: G3000MapBuilder.miniCompassIconSrc(),

      includeDetailIndicator: true,
      showDetailIndicatorTitle: true,

      settingManager: this.mapSettingManager,
      unitsSettingManager: UnitsUserSettings.getManager(this.props.bus),

      pfdIndex: G3000MapBuilder.getPfdIndexForDisplayPane(this.props.index, this.props.pfdSensorsSettingManager.pfdCount),
      pfdSensorsSettingManager: this.props.pfdSensorsSettingManager
    })
    .withProjectedSize(this.size)
    .build('common-map wpt-map') as CompiledMapSystem<
      {
        /** The range module. */
        [GarminMapKeys.Range]: MapIndexedRangeModule;
        /** The pointer module. */
        [GarminMapKeys.Pointer]: MapPointerModule;
        /** The waypoint selection module. */
        [GarminMapKeys.WaypointSelection]: WaypointMapSelectionModule;
      },
      any,
      {
        /** The range controller. */
        [GarminMapKeys.Range]: MapRangeController;
        /** The pointer controller. */
        [GarminMapKeys.Pointer]: MapPointerController;
        /** The waypoint RTR controller. */
        [GarminMapKeys.WaypointRTR]: WaypointMapRTRController;
      },
      any
    >;

  private readonly mapRangeModule = this.compiledMap.context.model.getModule(GarminMapKeys.Range);
  private readonly mapWptSelectionModule = this.compiledMap.context.model.getModule(GarminMapKeys.WaypointSelection);
  private readonly mapPointerModule = this.compiledMap.context.model.getModule(GarminMapKeys.Pointer);

  private readonly mapPointerController = this.compiledMap.context.getController(GarminMapKeys.Pointer);
  private readonly mapRangeController = this.compiledMap.context.getController(GarminMapKeys.Range);
  private readonly mapWptRTRController = this.compiledMap.context.getController(GarminMapKeys.WaypointRTR);

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

    this.mapRangeController.setRangeIndex(WaypointInfoPaneView.DEFAULT_RANGE_INDEX);

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
  public onEvent(event: DisplayPaneViewEvent<WaypointInfoPaneViewEventTypes>): void {
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
      case 'display_pane_waypoint_info_set':
        this.setWaypoint(event.eventData as WaypointInfoPaneSelectionData);
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
  private async setWaypoint(selectionData: WaypointInfoPaneSelectionData): Promise<void> {
    if (!ICAO.isValueFacility(selectionData.icao)) {
      this.clearWaypoint();
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
      this.clearWaypoint();
      return;
    }

    let runway: AirportRunway | null = null;

    if (FacilityUtils.isFacilityType(facility, FacilityType.Airport)) {
      runway = facility.runways[selectionData.runwayIndex] ?? null;
    }

    const waypoint = this.facWaypointCache.get(facility);

    this._title.set(WaypointInfoPaneView.TITLE_TEXT[ICAO.getFacilityTypeFromValue(facility.icaoStruct)] ?? '');
    this.mapWptSelectionModule.waypoint.set(waypoint);
    this.mapWptSelectionModule.runway.set(runway);

    if (selectionData.resetRange) {
      this.resetRange();
    }
  }

  /**
   * Clears the selected waypoint.
   */
  private clearWaypoint(): void {
    this._title.set('');
    this.mapWptSelectionModule.waypoint.set(null);
    this.mapWptSelectionModule.runway.set(null);
  }

  /**
   * Resets this view's map range index.
   */
  private resetRange(): void {
    if (this.mapWptSelectionModule.waypoint.get() instanceof AirportWaypoint) {
      this.mapWptRTRController.tryTargetWaypoint(true);
    } else {
      this.mapRangeController.setRangeIndex(WaypointInfoPaneView.DEFAULT_RANGE_INDEX);
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
    this.isReadyPromiseReject('WaypointInfoPaneView: view was destroyed');

    this.compiledMap.ref.instance.destroy();

    this.pointerActivePipe?.destroy();

    super.destroy();
  }
}
