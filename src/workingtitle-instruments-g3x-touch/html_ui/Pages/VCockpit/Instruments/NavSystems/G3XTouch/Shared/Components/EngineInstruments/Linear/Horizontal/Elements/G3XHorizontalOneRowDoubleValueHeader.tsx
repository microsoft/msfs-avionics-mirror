import { Subject, Subscribable, DisplayComponent, FSComponent, VNode, MappedSubject } from '@microsoft/msfs-sdk';
import { G3XGaugeValueText } from '../../Elements/G3XGaugeValueText';
import { G3XLabel } from '../../Elements/G3XLabel';
import { G3XPeakingGaugeProps } from '../../../../G3XGaugesConfigFactory/Gauges/G3XPeakingGaugeProps';
import { G3XGaugeColorZoneColor } from '../../../../G3XGaugesConfigFactory';

/** Properties for the display of the value text for a single-value gauge. */
interface TwinValueProps {
  /** The subject to semaphore alerting. */
  alert: Subscribable<boolean>;
  /** The left value. */
  leftValue: Subscribable<number>;
  /** The right value. */
  rightValue: Subscribable<number>;
  /** Title for header. */
  label: Subscribable<string>;
  /** Show left visuals related to peak mode. */
  showPeakVisualsLeft: Subscribable<boolean>;
  /** Show right visuals related to peak mode. */
  showPeakVisualsRight: Subscribable<boolean>;
}

/** Controller for the display of the text value for a single-value gauge. */
export class G3XHorizontalOneRowDoubleValueHeader extends DisplayComponent<Partial<G3XPeakingGaugeProps> & TwinValueProps> {
  static readonly DEFAULT_ZONE_COLOR = 'var(--g3x-color-white)';
  static readonly PEAK_FONT_COLOR = 'var(--g3x-color-cyan)';

  private readonly leftValueZoneColorSubject = Subject.create<G3XGaugeColorZoneColor | undefined>(undefined);
  protected readonly leftTextColorSubject = MappedSubject.create(
    ([showPeakVisuals, zoneColor]) => {
      if (showPeakVisuals && this.props.reflectPeakModeInHeader) {
        return G3XHorizontalOneRowDoubleValueHeader.PEAK_FONT_COLOR;
      }

      switch (zoneColor) {
        case G3XGaugeColorZoneColor.Red:
          return 'var(--g3x-color-white)';
        case G3XGaugeColorZoneColor.Yellow:
          return 'var(--g3x-color-black)';
        default:
          return G3XHorizontalOneRowDoubleValueHeader.DEFAULT_ZONE_COLOR;
      }
    },
    this.props.showPeakVisualsLeft,
    this.leftValueZoneColorSubject
  );
  protected readonly leftBackgroundColorSubject = MappedSubject.create(
    ([showPeakVisuals, zoneColor]) =>
      showPeakVisuals
        ? 'none'
        : zoneColor === undefined
          ? 'none'
          : zoneColor,
    this.props.showPeakVisualsLeft,
    this.leftValueZoneColorSubject
  );

  private readonly rightValueZoneColorSubject = Subject.create<G3XGaugeColorZoneColor | undefined>(undefined);
  protected readonly rightTextColorSubject = MappedSubject.create(
    ([showPeakVisuals, zoneColor]) =>
      (showPeakVisuals && this.props.reflectPeakModeInHeader)
        ? G3XHorizontalOneRowDoubleValueHeader.PEAK_FONT_COLOR
        : zoneColor === undefined
          ? G3XHorizontalOneRowDoubleValueHeader.DEFAULT_ZONE_COLOR
          : zoneColor === G3XGaugeColorZoneColor.Red ? 'var(--g3x-color-white)' : 'var(--g3x-color-black)',
    this.props.showPeakVisualsRight,
    this.rightValueZoneColorSubject
  );
  protected readonly rightBackgroundColorSubject = MappedSubject.create(
    ([showPeakVisuals, zoneColor]) =>
      showPeakVisuals
        ? 'none'
        : zoneColor === undefined
          ? 'none'
          : zoneColor,
    this.props.showPeakVisualsRight,
    this.rightValueZoneColorSubject
  );

  protected readonly titleColorSubject = MappedSubject.create(
    ([showPeakVisualsLeft, showPeakVisualsRight]) => {
      if (showPeakVisualsLeft || showPeakVisualsRight) {
        return G3XHorizontalOneRowDoubleValueHeader.PEAK_FONT_COLOR;
      } else {
        return G3XHorizontalOneRowDoubleValueHeader.DEFAULT_ZONE_COLOR;
      }
    },
    this.props.showPeakVisualsLeft,
    this.props.showPeakVisualsRight
  );

  protected readonly animationSubject = this.props.alert.map((alerting) => {
    if (alerting) {
      return 'gauge-alert-blink-red 1s infinite step-end';
    } else {
      return '';
    }
  });

  private readonly leftValueSubscription = this.props.leftValue.sub((v) => {
    if (this.props.colorZones) {
      let colorSet = false;
      for (const range of this.props.colorZones) {
        if (v >= range.begin.getValueAsNumber() && v <= range.end.getValueAsNumber() && this.mapColorToIsWarningZoneValue(range.color)) {
          this.leftValueZoneColorSubject.set(range.color);
          colorSet = true;
          break;
        }
      }
      if (!colorSet) {
        this.leftValueZoneColorSubject.set(undefined);
      }
    }
  });

  private readonly rightValueSubscription = this.props.rightValue.sub((v) => {
    if (this.props.colorZones) {
      let colorSet = false;
      for (const range of this.props.colorZones) {
        if (v >= range.begin.getValueAsNumber() && v <= range.end.getValueAsNumber() && this.mapColorToIsWarningZoneValue(range.color)) {
          this.rightValueZoneColorSubject.set(range.color);
          colorSet = true;
          break;
        }
      }
      if (!colorSet) {
        this.rightValueZoneColorSubject.set(undefined);
      }
    }
  });

  /**
   * Maps color into isWarningZone boolean
   * @param color - The zone color
   * @returns The boolean value of isWarningZone
   */
  protected mapColorToIsWarningZoneValue(color: G3XGaugeColorZoneColor): boolean {
    switch (color) {
      case G3XGaugeColorZoneColor.Red:
      case G3XGaugeColorZoneColor.Yellow:
        return true;
      default:
        return false;
    }
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div
        class='text-frame'
        style={{
          animation: this.animationSubject,
        }}
      >
        <div
          style={{
            color: this.leftTextColorSubject,
            background: this.leftBackgroundColorSubject,
          }}
        >
          <G3XGaugeValueText
            valueSubject={this.props.leftValue}
            textIncrement={this.props.style?.textIncrement}
            valuePrecision={this.props.style?.valuePrecision}
            displayPlus={this.props.style?.displayPlus}
          />
        </div>
        <div
          style={{
            color: this.titleColorSubject,
          }}
        >
          <G3XLabel
            label={this.props.label}
            unit={this.props.unit}
          />
        </div>
        <div
          style={{
            color: this.rightTextColorSubject,
            background: this.rightBackgroundColorSubject,
          }}
        >
          <G3XGaugeValueText
            valueSubject={this.props.rightValue}
            textIncrement={this.props.style?.textIncrement}
            valuePrecision={this.props.style?.valuePrecision}
            displayPlus={this.props.style?.displayPlus}
          />
        </div>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    super.destroy();
    this.leftTextColorSubject.destroy();
    this.leftBackgroundColorSubject.destroy();
    this.rightTextColorSubject.destroy();
    this.rightBackgroundColorSubject.destroy();
    this.titleColorSubject.destroy();
    this.animationSubject.destroy();
    this.leftValueSubscription.destroy();
    this.rightValueSubscription.destroy();
  }
}