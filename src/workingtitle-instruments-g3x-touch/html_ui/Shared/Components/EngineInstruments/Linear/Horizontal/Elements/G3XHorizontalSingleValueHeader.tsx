import { DisplayComponent, FSComponent, MappedSubject, Subject, Subscribable, VNode } from '@microsoft/msfs-sdk';

import { G3XGaugeColorZoneColor } from '../../../../G3XGaugesConfigFactory/Definitions/G3XGaugeColorZone';
import { G3XPeakingGaugeProps } from '../../../../G3XGaugesConfigFactory/Gauges/G3XPeakingGaugeProps';
import { G3XGaugeValueText } from '../../Elements/G3XGaugeValueText';
import { G3XLabel } from '../../Elements/G3XLabel';

/** Properties for the display of the value text for a single-value gauge. */
interface SingleValueProps {
  /** The subject to semaphore alerting. */
  alertSubject: Subscribable<boolean>;
  /** The current value. */
  valueSubject: Subscribable<number>;
  /** Title for header. */
  label: Subscribable<string>;
  /** Show visuals related to peak mode. */
  showPeakVisuals: Subscribable<boolean>;
}

/** Controller for the display of the text value for a single-value gauge. */
export class G3XHorizontalSingleValueHeader extends DisplayComponent<Partial<G3XPeakingGaugeProps> & SingleValueProps> {
  static readonly DEFAULT_ZONE_COLOR = 'var(--g3x-color-white)';
  static readonly PEAK_FONT_COLOR = 'var(--g3x-color-cyan)';
  private readonly valueZoneColorSubject = Subject.create(G3XHorizontalSingleValueHeader.DEFAULT_ZONE_COLOR);

  protected readonly textColorSubject = MappedSubject.create(
    ([showPeakVisuals, zoneColor]) => {
      if (showPeakVisuals && this.props.reflectPeakModeInHeader) {
        return G3XHorizontalSingleValueHeader.PEAK_FONT_COLOR;
      }

      switch (zoneColor) {
        case G3XGaugeColorZoneColor.Red:
          return 'var(--g3x-color-white)';
        case G3XGaugeColorZoneColor.Yellow:
          return 'var(--g3x-color-black)';
        default:
          return G3XHorizontalSingleValueHeader.DEFAULT_ZONE_COLOR;
      }
    },
    this.props.showPeakVisuals,
    this.valueZoneColorSubject
  );

  protected readonly backgroundColorSubject = MappedSubject.create(
    ([showPeakVisuals, zoneColor]) =>
      showPeakVisuals
        ? 'none'
        : zoneColor === G3XHorizontalSingleValueHeader.DEFAULT_ZONE_COLOR
          ? 'none'
          : zoneColor,
    this.props.showPeakVisuals,
    this.valueZoneColorSubject
  );

  protected readonly animationSubject = this.props.alertSubject.map((alerting) => {
    if (alerting) {
      return 'gauge-alert-blink-red 1s infinite step-end';
    } else {
      return '';
    }
  });

  private readonly valueSubject = this.props.valueSubject.sub((value) => {
    if (this.props.colorZones) {
      let colorSet = false;
      for (const range of this.props.colorZones) {
        if (value >= range.begin.getValueAsNumber() && value <= range.end.getValueAsNumber() && this.mapColorToIsWarningZoneValue(range.color)) {
          this.valueZoneColorSubject.set(range.color);
          colorSet = true;
          break;
        }
      }
      if (!colorSet) {
        this.valueZoneColorSubject.set(G3XHorizontalSingleValueHeader.DEFAULT_ZONE_COLOR);
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
          color: this.textColorSubject,
          background: this.backgroundColorSubject,
          animation: this.animationSubject,
        }}
      >
        <G3XLabel
          label={this.props.label}
          unit={this.props.unit}
        />
        <G3XGaugeValueText
          valueSubject={this.props.valueSubject}
          textIncrement={this.props.style?.textIncrement}
          valuePrecision={this.props.style?.valuePrecision}
          displayPlus={this.props.style?.displayPlus}
        />
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    super.destroy();
    this.animationSubject.destroy();
    this.backgroundColorSubject.destroy();
    this.textColorSubject.destroy();
    this.valueSubject.destroy();
  }
}