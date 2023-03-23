import {
  CompiledMapSystem, ComponentProps, DisplayComponent, EventBus, FlightPlanner, MapIndexedRangeModule, MapSystemBuilder, ReadonlyFloat64Array, Subscribable,
  VecNMath, VNode
} from '@microsoft/msfs-sdk';
import { GarminMapKeys, TrafficMapRangeController, TrafficSystem, TrafficUserSettings, UnitsUserSettings } from '@microsoft/msfs-garminsdk';
import { DisplayPaneViewEvent, IauUserSettingManager, MapBuilder, MapConfig, MapUserSettings, PfdIndex } from '@microsoft/msfs-wtg3000-common';

import './TrafficInsetMap.css';

/**
 * Component props for TrafficInsetMap.
 */
export interface TrafficInsetMapProps extends ComponentProps {
  /** The event bus. */
  bus: EventBus;

  /** The flight planner. */
  flightPlanner: FlightPlanner;

  /** The traffic system used by the map to display traffic. */
  trafficSystem: TrafficSystem;

  /** The index of the PFD to which the map belongs. */
  pfdIndex: PfdIndex;

  /** The projected size of the map. */
  projectedSize: Subscribable<ReadonlyFloat64Array>;

  /** A manager for all IAU user settings. */
  iauSettingManager: IauUserSettingManager;

  /** A configuration object defining options for the map. */
  config: MapConfig;
}

/**
 * A PFD traffic inset map.
 */
export class TrafficInsetMap extends DisplayComponent<TrafficInsetMapProps> {
  private static readonly UPDATE_FREQ = 4; // Hz
  private static readonly UPDATE_PERIOD = 1000 / TrafficInsetMap.UPDATE_FREQ;

  private static readonly DATA_UPDATE_FREQ = 4; // Hz

  private readonly mapSettingManager = MapUserSettings.getPfdManager(this.props.bus, this.props.pfdIndex);

  private readonly compiledMap = MapSystemBuilder.create(this.props.bus)
    .with(MapBuilder.trafficMap, {
      trafficSystem: this.props.trafficSystem,

      dataUpdateFreq: TrafficInsetMap.DATA_UPDATE_FREQ,

      rangeEndpoints: VecNMath.create(4, 0.5, 0.5, 0.95, 0.5),

      trafficIconOptions: {
        iconSize: 30,
        font: 'DejaVuSans-SemiBold',
        fontSize: 14
      },

      rangeRingOptions: {
        outerLabelRadial: 135,
        innerLabelRadial: 135,
        innerStrokeWidth: this.props.config.trafficRangeInnerRingShow ? undefined : 0,
        innerMinorTickSize: this.props.config.trafficRangeInnerRingShow ? 0 : undefined
      },

      flightPlanner: this.props.flightPlanner,

      ...MapBuilder.ownAirplaneIconOptions(this.props.config),

      miniCompassImgSrc: MapBuilder.miniCompassIconSrc(),

      trafficSettingManager: TrafficUserSettings.getManager(this.props.bus),
      mapRangeSettingManager: this.mapSettingManager,
      unitsSettingManager: UnitsUserSettings.getManager(this.props.bus),

      iauIndex: this.props.pfdIndex,
      iauSettingManager: this.props.iauSettingManager
    })
    .withProjectedSize(this.props.projectedSize)
    .build('traffic-inset-map') as CompiledMapSystem<
      {
        /** The range module. */
        [GarminMapKeys.Range]: MapIndexedRangeModule;
      },
      any,
      {
        /** The range controller. */
        [GarminMapKeys.TrafficRange]: TrafficMapRangeController;
      },
      any
    >;

  private readonly mapRangeController = this.compiledMap.context.getController(GarminMapKeys.TrafficRange);

  private lastUpdateTime = 0;

  private isInit = false;
  private isAwake = false;

  /** @inheritdoc */
  public onAfterRender(): void {
    if (!this.isAwake) {
      this.compiledMap.ref.instance.sleep();
    }

    this.isInit = true;
  }

  /**
   * Wakes this map.
   */
  public wake(): void {
    if (this.isAwake) {
      return;
    }

    this.isAwake = true;

    if (!this.isInit) {
      return;
    }

    this.compiledMap.ref.instance.wake();
  }

  /**
   * Wakes this map.
   */
  public sleep(): void {
    if (!this.isAwake) {
      return;
    }

    this.isAwake = false;

    if (!this.isInit) {
      return;
    }

    this.compiledMap.ref.instance.sleep();
  }

  /**
   * Updates this map.
   * @param time The current real time, as a UNIX timestamp in milliseconds.
   */
  public update(time: number): void {
    if (!this.isInit || !this.isAwake) {
      return;
    }

    if (time - this.lastUpdateTime >= TrafficInsetMap.UPDATE_PERIOD) {
      this.compiledMap.ref.instance.update(time);

      this.lastUpdateTime = time;
    }
  }

  /**
   * Responds to display pane view events.
   * @param event A display pane view event.
   */
  public onEvent(event: DisplayPaneViewEvent): void {
    switch (event.eventType) {
      case 'display_pane_map_range_inc':
        this.mapRangeController.changeRangeIndex(1);
        return;
      case 'display_pane_map_range_dec':
        this.mapRangeController.changeRangeIndex(-1);
        return;
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return this.compiledMap.map;
  }

  /** @inheritdoc */
  public destroy(): void {
    this.compiledMap.ref.getOrDefault()?.destroy();

    super.destroy();
  }
}