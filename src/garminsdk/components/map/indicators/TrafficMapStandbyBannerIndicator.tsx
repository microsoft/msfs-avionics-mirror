import { ComponentProps, DisplayComponent, FSComponent, SetSubject, Subscribable, Subscription, TcasOperatingMode, VNode } from '@microsoft/msfs-sdk';

import { MapBannerIndicator } from './MapBannerIndicator';

/**
 * Component props for TrafficMapStandbyBannerIndicator.
 */
export interface TrafficMapStandbyBannerIndicatorProps extends ComponentProps {
  /** A subscribable which provides the current traffic system operating mode. */
  operatingMode: Subscribable<TcasOperatingMode>;

  /** A subscribable which provides whether the airplane is on the ground. */
  isOnGround: Subscribable<boolean>;
}

/**
 * Displays a traffic system standby mode banner indicator.
 */
export class TrafficMapStandbyBannerIndicator extends DisplayComponent<TrafficMapStandbyBannerIndicatorProps> {
  private readonly show = this.props.operatingMode.map(mode => mode === TcasOperatingMode.Standby);
  private readonly cssClassSet = SetSubject.create(['traffic-map-banner-standby']);

  private isOnGroundSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.isOnGroundSub = this.props.isOnGround.sub(isOnGround => {
      isOnGround
        ? this.cssClassSet.add('traffic-map-banner-standby-onground')
        : this.cssClassSet.delete('traffic-map-banner-standby-onground');
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <MapBannerIndicator show={this.show} class={this.cssClassSet}>
        STANDBY
      </MapBannerIndicator>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.show.destroy();
    this.isOnGroundSub?.destroy();
  }
}