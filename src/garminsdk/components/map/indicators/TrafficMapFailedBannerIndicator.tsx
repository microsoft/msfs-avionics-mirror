import { ComponentProps, DisplayComponent, FSComponent, Subscribable, TcasOperatingMode, VNode } from '@microsoft/msfs-sdk';

import { MapBannerIndicator } from './MapBannerIndicator';

/**
 * Component props for TrafficMapFailedBannerIndicator.
 */
export interface TrafficMapFailedBannerIndicatorProps extends ComponentProps {
  /** A subscribable which provides the current traffic system operating mode. */
  operatingMode: Subscribable<TcasOperatingMode>;
}

/**
 * Displays a traffic system failed mode banner indicator.
 */
export class TrafficMapFailedBannerIndicator extends DisplayComponent<TrafficMapFailedBannerIndicatorProps> {
  private readonly show = this.props.operatingMode.map(mode => mode === TcasOperatingMode.Off || mode === TcasOperatingMode.Failed);
  private readonly text = this.props.operatingMode.map(mode => mode === TcasOperatingMode.Failed ? 'FAILED' : 'NO DATA');

  /** @inheritdoc */
  public render(): VNode {
    return (
      <MapBannerIndicator show={this.show} class='traffic-map-banner-failed'>
        {this.text}
      </MapBannerIndicator>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.show.destroy();
    this.text.destroy();
  }
}