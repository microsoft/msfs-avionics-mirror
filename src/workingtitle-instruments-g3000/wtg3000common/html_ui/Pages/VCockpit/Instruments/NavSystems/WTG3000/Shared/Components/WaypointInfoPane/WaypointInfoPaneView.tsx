import {
  AirportRunway, CompiledMapSystem, EventBus, FacilityLoader, FacilityType, FacilityUtils, FSComponent, ICAO,
  MapIndexedRangeModule, MapSystemBuilder, Subscription, Vec2Math, Vec2Subject, VecNMath, VNode
} from '@microsoft/msfs-sdk';

import {
  AirportWaypoint, GarminFacilityWaypointCache, GarminMapKeys, MapPointerController, MapPointerInfoLayerSize,
  MapPointerModule, MapRangeController, UnitsUserSettings, WaypointMapRTRController, WaypointMapSelectionModule
} from '@microsoft/msfs-garminsdk';

import { DisplayPanesUserSettings } from '../../Settings/DisplayPanesUserSettings';
import { IauUserSettingManager } from '../../Settings/IauUserSettings';
import { MapUserSettings } from '../../Settings/MapUserSettings';
import { BingUtils } from '../Bing/BingUtils';
import { ControllableDisplayPaneIndex, DisplayPaneSizeMode } from '../DisplayPanes/DisplayPaneTypes';
import { DisplayPaneView, DisplayPaneViewProps } from '../DisplayPanes/DisplayPaneView';
import { DisplayPaneViewEvent } from '../DisplayPanes/DisplayPaneViewEvents';
import { MapBuilder } from '../Map/MapBuilder';
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

  /** A manager for all IAU user settings. */
  iauSettingManager: IauUserSettingManager;

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
    .with(MapBuilder.waypointMap, {
      bingId: `pane_map_${this.props.index}`,
      bingDelay: BingUtils.getBindDelayForPane(this.props.index),

      dataUpdateFreq: WaypointInfoPaneView.DATA_UPDATE_FREQ,

      supportAirportAutoRange: true,
      airportAutoRangeMargins: VecNMath.create(4, 40, 40, 40, 40),

      includeRunwayOutlines: true,

      rangeRingOptions: {
        showLabel: true
      },

      ...MapBuilder.ownAirplaneIconOptions(this.props.config),

      pointerBoundsOffset: VecNMath.create(4, 0.1, 0.1, 0.1, 0.1),
      pointerInfoSize: MapPointerInfoLayerSize.Full,

      miniCompassImgSrc: MapBuilder.miniCompassIconSrc(),

      includeDetailIndicator: true,
      showDetailIndicatorTitle: true,

      settingManager: this.mapSettingManager,
      unitsSettingManager: UnitsUserSettings.getManager(this.props.bus),

      iauIndex: MapBuilder.getIauIndexForDisplayPane(this.props.index),
      iauSettingManager: this.props.iauSettingManager
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

  // Map projection parameters are not fully initialized until after the first time the map is updated, so we flag the
  // map as not ready until the first update is finished.
  private isReady = false;
  private readonly isReadyResolveQueue: (() => void)[] = [];
  private readonly isReadyRejectQueue: ((reason?: any) => void)[] = [];

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
      this.isReadyResolveQueue.forEach(resolve => resolve());
      this.isReadyResolveQueue.length = 0;
      this.isReadyRejectQueue.length = 0;

      this.isReady = true;
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
    if (!ICAO.isFacility(selectionData.icao)) {
      this.clearWaypoint();
      return;
    }

    const opId = ++this.setWaypointOpId;

    const [facility] = await Promise.all([
      this.props.facLoader.getFacility(ICAO.getFacilityType(selectionData.icao), selectionData.icao),
      this.awaitReady()
    ]);

    if (opId !== this.setWaypointOpId) {
      return;
    }

    let runway: AirportRunway | null = null;

    if (FacilityUtils.isFacilityType(facility, FacilityType.Airport)) {
      runway = facility.runways[selectionData.runwayIndex] ?? null;
    }

    const waypoint = this.facWaypointCache.get(facility);

    this._title.set(WaypointInfoPaneView.TITLE_TEXT[ICAO.getFacilityType(facility.icao)] ?? '');
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
    if (this.isReady) {
      return Promise.resolve();
    } else {
      return new Promise((resolve, reject) => {
        this.isReadyResolveQueue.push(resolve);
        this.isReadyRejectQueue.push(reject);
      });
    }
  }

  /** @inheritdoc */
  public override render(): VNode | null {
    return (
      this.compiledMap.map
    );
  }

  /** @inheritdoc */
  public override destroy(): void {
    this.isReadyRejectQueue.forEach(reject => reject('WaypointInfoPaneView: view was destroyed'));
    this.isReadyResolveQueue.length = 0;
    this.isReadyRejectQueue.length = 0;

    this.compiledMap.ref.instance.destroy();

    this.pointerActivePipe?.destroy();

    super.destroy();
  }
}