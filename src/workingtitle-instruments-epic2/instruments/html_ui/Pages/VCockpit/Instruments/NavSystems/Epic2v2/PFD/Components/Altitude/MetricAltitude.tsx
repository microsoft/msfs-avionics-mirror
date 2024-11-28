import { ComponentProps, DisplayComponent, FSComponent, Subscribable, UserSettingManager, VNode } from '@microsoft/msfs-sdk';

import { PfdAliasedUserSettingTypes } from '@microsoft/msfs-epic2-shared';

import './MetricAltitude.css';

/** The metric altitude props. */
export interface MetricAltitudeProps extends ComponentProps {
  /** Altitude in feet, or null when invalid. */
  metricAltitude: Subscribable<number | null>;
  /** The aliased PFD settings manager. */
  pfdSettingsManager: UserSettingManager<PfdAliasedUserSettingTypes>;
}

/** The metric altitude component. */
export class MetricAltitude extends DisplayComponent<MetricAltitudeProps> {
  private readonly metricAltitudeText = this.props.metricAltitude.map(alt => alt === null ? '' : alt);

  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onAfterRender(node: VNode): void {
    this.props.pfdSettingsManager.getSetting('altMetric').sub(metric => {
      if (metric) {
        this.metricAltitudeText.resume();
      } else {
        this.metricAltitudeText.pause();
      }
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode | null {
    return (
      <div
        class={{
          'metric-altitude': true,
          'border-box': true,
          'shaded-box': true,
          'hidden': this.props.pfdSettingsManager.getSetting('altMetric').map(v => !v) || this.props.metricAltitude.map(v => v === null)
        }}
      >
        <span class="metric-value">{this.metricAltitudeText}<span class="metric-unit">M</span></span>
      </div>
    );
  }
}
