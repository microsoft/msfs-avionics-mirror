import {
  AccessibleUtils, BitFlags, DisplayComponent, FSComponent, NumberFormatter, NumberUnitInterface, ReadonlyFloat64Array,
  Subject, Subscribable, SubscribableUtils, Subscription, Unit, UnitFamily, UnitType, VNode
} from '@microsoft/msfs-sdk';

import { UnitFormatter } from '../../graphics/text/UnitFormatter';
import { UnitsDistanceSettingMode } from '../../settings/UnitsUserSettings';
import { GarminChartDisplayLayer } from './GarminChartDisplayLayer';
import { GarminChartDisplayProjection, GarminChartDisplayProjectionChangeFlags } from './GarminChartDisplayProjection';

/**
 * Component props for {@link GarminChartScaleBarLayer}.
 */
export interface GarminChartScaleBarLayerProps {
  /** The mode to apply to the scale bar's displayed units. */
  displayUnitsMode: Subscribable<UnitsDistanceSettingMode>;

  /**
   * The limits to enforce on the scale bar's length, as `[min, max]` in pixels. The scale bar will attempt to choose
   * the largest range such that the length of the bar lies within these limits. The minimum limit has priority over
   * the maximum limit (in other words, if forced to violate one of the minimum or maximum limits, the scale bar will
   * preferentially violate the maximum limit).
   */
  scaleBarLengthBounds: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;

  /**
   * A function that formats range values for display in the scale bar's label. Defaults to a function that formats
   * numbers with up to one decimal place precision.
   * @param value The value to format.
   * @returns The formatted value.
   */
  numberFormatter?: (value: number) => string;

  /**
   * A function that formats unit types for display in the scale bar's label. Defaults to an upper-case unit formatter
   * created from {@link UnitFormatter}.
   * @param unit The unit to format.
   * @returns The formatted unit.
   */
  unitFormatter?: (unit: Unit<UnitFamily.Distance>) => string;

  /**
   * The text to display when there are no geo-referencing data available for the displayed chart. Defaults to
   * `'NOT TO SCALE'`.
   */
  notToScaleText?: string;
}

/**
 * A Garmin terminal (airport) chart display layer that renders a scale bar. The scale bar depicts a nominal
 * geographical range value chosen such that the length of the projected range lies within certain limits.
 */
export class GarminChartScaleBarLayer
  extends DisplayComponent<GarminChartScaleBarLayerProps>
  implements GarminChartDisplayLayer {

  private static readonly DEFAULT_SCALE_STEPS = {
    [UnitsDistanceSettingMode.Nautical]: [
      ...[50, 100, 250, 500, 1000, 2000].map(value => UnitType.FOOT.createNumber(value)),
      ...[0.5, 1, 2, 4, 10, 20, 40, 100].map(value => UnitType.NMILE.createNumber(value)),
    ],

    [UnitsDistanceSettingMode.Metric]: [
      ...[25, 50, 100, 250, 500].map(value => UnitType.METER.createNumber(value)),
      ...[1, 2, 4, 10, 20, 40, 100, 200].map(value => UnitType.KILOMETER.createNumber(value)),
    ],

    [UnitsDistanceSettingMode.Statute]: [
      ...[50, 100, 250, 500, 1000].map(value => UnitType.FOOT.createNumber(value)),
      ...[0.5, 1, 2, 4, 10, 20, 40, 100].map(value => UnitType.MILE.createNumber(value)),
    ],
  };

  private static readonly UPDATE_CHANGE_FLAGS
    = GarminChartDisplayProjectionChangeFlags.IsValid
    | GarminChartDisplayProjectionChangeFlags.IsGeoReferenced
    | GarminChartDisplayProjectionChangeFlags.GeoReferenceProjection
    | GarminChartDisplayProjectionChangeFlags.ChartScale;

  private static readonly DEFAULT_BASE_UNIT_FORMATTER = UnitFormatter.create(undefined, 'upper');

  /** @inheritDoc */
  public readonly isTerminalChartDisplayLayer = true;

  private readonly scaleBarLengthBounds = AccessibleUtils.toAccessible(this.props.scaleBarLengthBounds, true);

  private readonly numberFormatter = this.props.numberFormatter
    ?? NumberFormatter.create({ precision: 0.1, forceDecimalZeroes: false });

  private readonly unitFormatter = this.props.unitFormatter
    ?? ((unit: Unit<UnitFamily.Distance>) => ` ${GarminChartScaleBarLayer.DEFAULT_BASE_UNIT_FORMATTER(unit)}`);

  private readonly mainDisplay = Subject.create('none');
  private readonly notToScaleDisplay = Subject.create('none');

  private showScale = false;
  private scaleLength = 0;

  private readonly mainWidth = Subject.create('0px');

  private readonly barLeft = Subject.create('0px');
  private readonly barWidth = Subject.create('0px');

  private readonly leftLabelRef = FSComponent.createRef<HTMLDivElement>();
  private readonly rightLabelRef = FSComponent.createRef<HTMLDivElement>();

  private readonly rightLabelNumber = Subject.create(0);
  private readonly rightLabelUnit = Subject.create<Unit<UnitFamily.Distance>>(UnitType.NMILE, (a, b) => a.equals(b));

  private needUpdateScale = false;
  private needRefreshStyle = false;

  private readonly subscriptions: Subscription[] = [];

  /** @inheritDoc */
  public onAttached(): void {
    this.needUpdateScale = true;

    const scheduleUpdateScale = (): void => {
      if (this.showScale) {
        this.needUpdateScale = true;
      }
    };

    this.subscriptions.push(
      this.props.displayUnitsMode.sub(scheduleUpdateScale)
    );

    if (SubscribableUtils.isSubscribable(this.props.scaleBarLengthBounds)) {
      this.subscriptions.push(
        this.props.scaleBarLengthBounds.sub(scheduleUpdateScale)
      );
    }
  }

  /**
   * Schedules a refresh of this layer's scale bar. The refresh will occur the next time the layer's parent display is
   * updated. This method should be called when the width of the scale bar's left or right labels is changed
   * independently of its text content due to outside styling.
   */
  public refreshStyle(): void {
    if (this.showScale) {
      this.needRefreshStyle = true;
    }
  }

  /** @inheritDoc */
  public onProjectionChanged(projection: GarminChartDisplayProjection, changeFlags: number): void {
    this.needUpdateScale ||= BitFlags.isAny(changeFlags, GarminChartScaleBarLayer.UPDATE_CHANGE_FLAGS);
  }

  /** @inheritDoc */
  public onUpdate(time: number, projection: GarminChartDisplayProjection): void {
    if (this.needUpdateScale) {
      this.updateScale(projection);
      this.needUpdateScale = false;
    }

    if (this.needRefreshStyle) {
      this.doRefreshStyle();
      this.needRefreshStyle = false;
    }
  }

  /**
   * Updates the position of this layer's icon.
   * @param projection The projection of this layer's parent display.
   */
  private updateScale(projection: GarminChartDisplayProjection): void {
    const showScale = projection.isValid() && projection.isGeoReferenced();

    if (showScale) {
      const totalScaleFactor = projection.getGeoReferenceScaleFactor() * projection.getChartScale();
      const range = this.selectScaleRange(totalScaleFactor);

      const length = range.asUnit(UnitType.GA_RADIAN) * totalScaleFactor;

      if (isFinite(length)) {
        this.scaleLength = Math.round(length);

        this.rightLabelNumber.set(range.number);
        this.rightLabelUnit.set(range.unit);

        this.showScale = true;
      } else {
        this.showScale = false;
      }
    } else {
      this.showScale = false;
    }

    if (this.showScale) {
      this.mainDisplay.set('');
      this.notToScaleDisplay.set('none');
      this.needRefreshStyle = true;
    } else {
      this.mainDisplay.set('none');
      this.notToScaleDisplay.set(projection.isValid() ? '' : 'none');
    }
  }

  /**
   * Selects an appropriate range for this layer's scale bar given a scale factor.
   * @param scaleFactor The scale factor relating great-arc radians to pixels.
   * @returns An appropriate range for this layer's scale bar given the specified scale factor.
   */
  private selectScaleRange(scaleFactor: number): NumberUnitInterface<UnitFamily.Distance> {
    const steps = GarminChartScaleBarLayer.DEFAULT_SCALE_STEPS[this.props.displayUnitsMode.get()]
      ?? GarminChartScaleBarLayer.DEFAULT_SCALE_STEPS[UnitsDistanceSettingMode.Nautical];

    const lengthBounds = this.scaleBarLengthBounds.get();

    const minRangeRad = lengthBounds[0] / scaleFactor;
    const maxRangeRad = lengthBounds[1] / scaleFactor;

    let minRangeIndex = steps.length - 1;
    for (let i = 0; i < steps.length; i++) {
      const compare = steps[i].compare(minRangeRad, UnitType.GA_RADIAN);
      if (compare >= 0) {
        minRangeIndex = i;
        break;
      }
    }

    let rangeIndex = minRangeIndex;
    for (let i = rangeIndex + 1; i < steps.length; i++) {
      const compare = steps[i].compare(maxRangeRad, UnitType.GA_RADIAN);
      if (compare <= 0) {
        rangeIndex = i;
        break;
      }
    }

    return steps[rangeIndex];
  }

  /**
   * Refreshes this layer's scale bar styling. This will recalculate the scale bar's total width based on the bar
   * length and width of the left and right labels and position the labels and bar at appropriate positions along the
   * horizontal axis.
   */
  private doRefreshStyle(): void {
    const leftLabelWidth = this.leftLabelRef.instance.offsetWidth;
    const rightLabelWidth = this.rightLabelRef.instance.offsetWidth;

    const leftLabelOffset = Math.floor(leftLabelWidth / 2);
    const rightLabelOffset = Math.floor(rightLabelWidth / 2);

    const totalWidth = leftLabelOffset + this.scaleLength + (rightLabelWidth - rightLabelOffset);

    this.mainWidth.set(`${totalWidth}px`);

    this.barLeft.set(`${leftLabelOffset}px`);
    this.barWidth.set(`${this.scaleLength}px`);
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='terminal-chart-display-scale-bar'>
        <div
          class='terminal-chart-display-scale-bar-main'
          style={{
            'display': this.mainDisplay,
            'position': 'relative',
            'width': this.mainWidth,
          }}
        >
          <svg
            viewBox='0 0 100 10'
            preserveAspectRatio='none'
            class='terminal-chart-display-scale-bar-bar'
            style={{
              'position': 'absolute',
              'left': this.barLeft,
              'width': this.barWidth
            }}
          >
            <path d='M 0 0 v 10 h 100 v -10' class='terminal-chart-display-scale-bar-bar-line terminal-chart-display-scale-bar-bar-outline' />
            <path d='M 0 0 v 10 h 100 v -10' class='terminal-chart-display-scale-bar-bar-line terminal-chart-display-scale-bar-bar-stroke' />
          </svg>
          <div
            ref={this.leftLabelRef}
            class='terminal-chart-display-scale-bar-label terminal-chart-display-scale-bar-label-left'
            style={{
              'position': 'absolute',
              'left': '0px',
            }}
          >
            <span class='terminal-chart-display-scale-bar-label-number'>0</span>
          </div>
          <div
            ref={this.rightLabelRef}
            class='terminal-chart-display-scale-bar-label terminal-chart-display-scale-bar-label-right'
            style={{
              'position': 'absolute',
              'right': '0px',
            }}
          >
            <span class='terminal-chart-display-scale-bar-label-number'>{this.rightLabelNumber.map(this.numberFormatter)}</span>
            <span class='terminal-chart-display-scale-bar-label-unit'>{this.rightLabelUnit.map(this.unitFormatter)}</span>
          </div>
        </div>
        {this.props.notToScaleText !== '' && (
          <div
            class='terminal-chart-display-scale-bar-not-to-scale'
            style={{
              'display': this.notToScaleDisplay
            }}
          >
            {this.props.notToScaleText ?? 'NOT TO SCALE'}
          </div>
        )}
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}
