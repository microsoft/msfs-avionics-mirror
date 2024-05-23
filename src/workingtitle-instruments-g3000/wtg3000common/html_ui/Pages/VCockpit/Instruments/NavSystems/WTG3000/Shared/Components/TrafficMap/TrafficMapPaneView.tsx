import {
  CompiledMapSystem, EventBus, FlightPlanner, MapIndexedRangeModule, MapSystemBuilder, Vec2Math, Vec2Subject, VecNMath,
  VecNSubject, VNode
} from '@microsoft/msfs-sdk';

import { GarminMapKeys, TrafficMapRangeController, TrafficSystem, TrafficUserSettings, UnitsUserSettings } from '@microsoft/msfs-garminsdk';

import { G3000FlightPlannerId } from '../../CommonTypes';
import { IauUserSettingManager } from '../../Settings/IauUserSettings';
import { MapUserSettings } from '../../Settings/MapUserSettings';
import { ControllableDisplayPaneIndex, DisplayPaneSizeMode } from '../DisplayPanes/DisplayPaneTypes';
import { DisplayPaneView, DisplayPaneViewProps } from '../DisplayPanes/DisplayPaneView';
import { DisplayPaneViewEvent } from '../DisplayPanes/DisplayPaneViewEvents';
import { MapBuilder } from '../Map/MapBuilder';
import { MapConfig } from '../Map/MapConfig';

import './TrafficMapPaneView.css';

/**
 * Component props for TrafficMapPaneView.
 */
export interface TrafficMapPaneViewProps extends DisplayPaneViewProps {
  /** The event bus. */
  bus: EventBus;

  /** The flight planner. */
  flightPlanner: FlightPlanner<G3000FlightPlannerId>;

  /** The traffic system used by the map. */
  trafficSystem: TrafficSystem;

  /** A manager for all IAU user settings. */
  iauSettingManager: IauUserSettingManager;

  /** A configuration object defining options for the map. */
  config: MapConfig;
}

/**
 * A display pane view which displays a traffic map.
 */
export class TrafficMapPaneView extends DisplayPaneView<TrafficMapPaneViewProps> {

  private static readonly DATA_UPDATE_FREQ = 30; // Hz

  private readonly size = Vec2Subject.create(Vec2Math.create(100, 100));
  private readonly rangeEndpoints = VecNSubject.create(VecNMath.create(4, 0.5, 0.5, 0.5, 0.95));

  private readonly trafficSettingManager = TrafficUserSettings.getManager(this.props.bus);
  private readonly mapSettingManager = MapUserSettings.getDisplayPaneManager(this.props.bus, this.props.index as ControllableDisplayPaneIndex);

  private readonly compiledMap = MapSystemBuilder.create(this.props.bus)
    .with(MapBuilder.trafficMap, {
      trafficSystem: this.props.trafficSystem,

      dataUpdateFreq: TrafficMapPaneView.DATA_UPDATE_FREQ,

      rangeEndpoints: this.rangeEndpoints,

      trafficIconOptions: {
        iconSize: 52,
        font: 'DejaVuSans-SemiBold',
        fontSize: 24
      },

      rangeRingOptions: {
        outerLabelRadial: this.props.config.trafficRangeLabelRadial,
        innerLabelRadial: this.props.config.trafficRangeLabelRadial,
        innerStrokeWidth: this.props.config.trafficRangeInnerRingShow ? undefined : 0,
        innerMinorTickSize: this.props.config.trafficRangeInnerRingShow ? 0 : undefined
      },

      flightPlanner: this.props.flightPlanner,

      ...MapBuilder.ownAirplaneIconOptions(this.props.config, false),

      miniCompassImgSrc: MapBuilder.miniCompassIconSrc(),

      trafficSettingManager: this.trafficSettingManager,
      mapRangeSettingManager: this.mapSettingManager,
      unitsSettingManager: UnitsUserSettings.getManager(this.props.bus),

      iauIndex: MapBuilder.getIauIndexForDisplayPane(this.props.index),
      iauSettingManager: this.props.iauSettingManager
    })
    .withProjectedSize(this.size)
    .build('traffic-map') as CompiledMapSystem<
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

  /** @inheritdoc */
  public override onAfterRender(): void {
    this._title.set('Traffic Map');

    this.compiledMap.ref.instance.sleep();
  }

  /** @inheritdoc */
  public override onResume(size: DisplayPaneSizeMode, width: number, height: number): void {
    this.updateSize(width, height);
    this.compiledMap.ref.instance.wake();
  }

  /** @inheritdoc */
  public override onPause(): void {
    this.compiledMap.ref.instance.sleep();
  }

  /** @inheritdoc */
  public override onResize(size: DisplayPaneSizeMode, width: number, height: number): void {
    this.updateSize(width, height);
  }

  /**
   * Updates the size of the map.
   * @param width The width of the map, in pixels.
   * @param height The height of the map, in pixels.
   */
  private updateSize(width: number, height: number): void {
    this.size.set(width, height);

    // To not overflow the range rings, we need to set range endpoints based on the shortest dimension
    if (width >= height) {
      this.rangeEndpoints.set(0.5, 0.5, 0.5, 0.95);
    } else {
      this.rangeEndpoints.set(0.5, 0.5, 0.95, 0.5);
    }
  }

  /** @inheritdoc */
  public override onUpdate(time: number): void {
    this.compiledMap.ref.instance.update(time);
  }

  /** @inheritdoc */
  public override onEvent(event: DisplayPaneViewEvent): void {
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
  public override render(): VNode | null {
    return (
      this.compiledMap.map
    );
  }

  /** @inheritdoc */
  public override destroy(): void {
    super.destroy();

    this.compiledMap.ref.instance.destroy();
  }
}