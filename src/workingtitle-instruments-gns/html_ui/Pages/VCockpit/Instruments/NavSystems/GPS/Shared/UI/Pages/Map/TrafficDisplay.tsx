import {
  ComponentProps, DisplayComponent, EventBus, FSComponent, MapSystemBuilder, NumberFormatter, ReadonlyFloat64Array, Subscribable, UnitType, VNode
} from '@microsoft/msfs-sdk';

import {
  GarminMapKeys, MapGarminTrafficModule, MapOrientation, MapTrafficAltitudeRestrictionMode, MapTrafficMotionVectorMode, TrafficMapBuilder, TrafficMapOptions,
  TrafficMapRangeController, TrafficRangeRingOptions, TrafficSystem
} from '@microsoft/msfs-garminsdk';

import { GNSType } from '../../../UITypes';
import { GNSNumberUnitDisplay } from '../../Controls/GNSNumberUnitDisplay';
import { GNSTrafficIcons } from './GNSMapSystem';
import { OwnshipIconPath } from './MapSystemConfig';

import './TrafficDisplay.css';

/**
 * Props on the TrafficMapComponent component.
 */
interface TrafficMapComponentProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** An instance of the traffic system. */
  trafficSystem: TrafficSystem

  /** The size of the traffic display. */
  size: Subscribable<ReadonlyFloat64Array>;

  /** The type of GNS to display this traffic on. */
  gnsType: GNSType;
}

/**
 * A component that displays a traffic map.
 */
export class TrafficDisplay extends DisplayComponent<TrafficMapComponentProps> {

  private readonly rangeRingOptions: TrafficRangeRingOptions = {
    renderLabel: (range, unit) => <GNSNumberUnitDisplay class='tfc-display-range-label' value={range} displayUnit={unit} formatter={NumberFormatter.create({ precision: 0.1, forceDecimalZeroes: false })} />,
    outerStrokeWidth: 1,
    outerStrokeDash: [1, 3],
    outerMajorTickSize: 4,
    outerMinorTickSize: 4,
    outerStrokeStyle: 'cyan',
    outerLabelRadial: 135,
    innerStrokeWidth: 1,
    innerStrokeDash: [1, 3],
    innerMajorTickSize: 4,
    innerMinorTickSize: 0,
    innerLabelRadial: 135,
    innerStrokeStyle: 'cyan'
  };

  private readonly options: TrafficMapOptions = {
    trafficSystem: this.props.trafficSystem,
    dataUpdateFreq: 0.5,
    orientation: MapOrientation.TrackUp,
    trafficIconOptions: GNSTrafficIcons.IconOptions(this.props.gnsType),
    includeRangeRings: true,
    rangeRingOptions: this.rangeRingOptions,
    includeOperatingModeIndicator: false,
    includeAdsbModeIndicator: false,
    includeAdsbOffBanner: false,
    includeAltitudeModeIndicator: false,
    includeOrientationIndicator: false,
    includeStandbyBanner: false,
    includeFailedBanner: false,
    airplaneIconSrc: OwnshipIconPath,
    airplaneIconAnchor: new Float64Array([0.5, 0.5]),
    airplaneIconSize: this.props.gnsType === 'wt430' ? 22 : 16,
    nauticalRangeArray: [1, 2, 6, 12, 24, 40].map(v => UnitType.NMILE.createNumber(v))
  };

  private readonly trafficMap = MapSystemBuilder.create(this.props.bus)
    .withProjectedSize(this.props.size)
    .with(TrafficMapBuilder.build, this.options)
    .withClockUpdate(6)
    // eslint-disable-next-line jsdoc/require-jsdoc
    .build<{ [GarminMapKeys.Traffic]: MapGarminTrafficModule }, any, { [GarminMapKeys.TrafficRange]: TrafficMapRangeController }, any>();

  /** @inheritdoc */
  public onAfterRender(): void {
    this.trafficMap.context.getController(GarminMapKeys.TrafficRange).setRangeIndex(2);
    this.trafficMap.context.model.getModule(GarminMapKeys.Traffic).show.set(true);
    this.trafficMap.context.model.getModule(GarminMapKeys.Traffic).motionVectorMode.set(MapTrafficMotionVectorMode.Absolute);
    this.trafficMap.context.model.getModule(GarminMapKeys.Traffic).motionVectorLookahead.set(UnitType.SECOND.createNumber(15));
  }

  /**
   * Changes the range of the traffic map.
   * @param direction The direction to change the range towards.
   */
  public changeRange(direction: 'inc' | 'dec'): void {
    if (direction === 'inc') {
      this.trafficMap.context.getController(GarminMapKeys.TrafficRange).changeRangeIndex(1);
    } else {
      this.trafficMap.context.getController(GarminMapKeys.TrafficRange).changeRangeIndex(-1);
    }
  }

  /**
   * Sets the display altitude restriction mode.
   * @param mode The display altitude restriction mode.
   */
  public setAltitudeRestrictionMode(mode: MapTrafficAltitudeRestrictionMode): void {
    this.trafficMap.context.model.getModule(GarminMapKeys.Traffic).altitudeRestrictionMode.set(mode);
  }

  /**
   * Puts the traffic display to sleep.
   */
  public sleep(): void {
    this.trafficMap.ref.instance.sleep();
  }

  /**
   * Wakes the traffic display.
   */
  public wake(): void {
    this.trafficMap.ref.instance.wake();
  }

  /** @inheritdoc */
  public render(): VNode {
    return this.trafficMap.map;
  }

  /** @inheritdoc */
  public destroy(): void {
    this.trafficMap.ref.instance.destroy();
  }
}