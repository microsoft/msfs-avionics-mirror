import { AdsbOperatingMode, ComponentProps, DisplayComponent, FSComponent, MappedSubject, Subscribable, TcasOperatingMode, VNode } from 'msfssdk';

import { MapBannerIndicator } from './MapBannerIndicator';

/**
 * Component props for TrafficMapAdsbOffBannerIndicator.
 */
export interface TrafficMapAdsbOffBannerIndicatorProps extends ComponentProps {
  /** A subscribable which provides the current ADS-B operating mode. */
  adsbOperatingMode: Subscribable<AdsbOperatingMode>;

  /** A subscribable which provides the current traffic system operating mode. */
  trafficOperatingMode: Subscribable<TcasOperatingMode>;
}

/**
 * Displays an ADS-B Off banner indicator.
 */
export class TrafficMapAdsbOffBannerIndicator extends DisplayComponent<TrafficMapAdsbOffBannerIndicatorProps> {
  private readonly show = MappedSubject.create(
    ([adsbMode, trafficMode]): boolean => {
      return adsbMode === AdsbOperatingMode.Standby && trafficMode !== TcasOperatingMode.Standby;
    },
    this.props.adsbOperatingMode,
    this.props.trafficOperatingMode
  );

  /** @inheritdoc */
  public render(): VNode {
    return (
      <MapBannerIndicator show={this.show} class='map-adsb-standby'>
        ADS-B TRFC OFF
      </MapBannerIndicator>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.show.destroy();
  }
}