import { FSComponent, MapLayer, MapLayerProps, Subscription, TcasAdvisoryDataProvider, TcasIntruder, VNode } from '@microsoft/msfs-sdk';

import './TrafficBannerLayer.css';

/**
 * Props for the TrafficBannerLayer component.
 */
interface TrafficBannerLayerProps extends MapLayerProps<any> {
  /** The traffic advisory data provider to use. */
  tcasDataProvider: TcasAdvisoryDataProvider;
}

/**
 * A map layer that displays a traffic advisory banner.
 */
export class TrafficBannerLayer extends MapLayer<TrafficBannerLayerProps> {
  private readonly el = FSComponent.createRef<HTMLDivElement>();
  private readonly bannerEl = FSComponent.createRef<HTMLSpanElement>();
  private taSub?: Subscription;

  /** @inheritdoc */
  public onAttached(): void {
    super.onAttached();
    this.taSub = this.props.tcasDataProvider.taIntruders.sub(this.onTrafficAdvisoriesChanged.bind(this));
  }

  /**
   * Handles when the number of TAs changes.
   * @param set The set containing the current TAs.
   */
  private onTrafficAdvisoriesChanged(set: ReadonlySet<TcasIntruder>): void {
    if (set.size > 0) {
      this.bannerEl.instance.classList.remove('hide-element');
    } else {
      this.bannerEl.instance.classList.add('hide-element');
    }
  }

  /** @inheritdoc */
  public onSleep(): void {
    super.onSleep();
    this.taSub?.pause();
  }

  /** @inheritdoc */
  public onWake(): void {
    super.onWake();

    this.onTrafficAdvisoriesChanged(this.props.tcasDataProvider.taIntruders.get());
    this.taSub?.resume();
  }

  /** @inheritdoc */
  public onVisibilityChanged(isVisible: boolean): void {
    super.onVisibilityChanged(isVisible);
    if (isVisible) {
      this.el.instance.classList.remove('hide-element');
    } else {
      this.el.instance.classList.add('hide-element');
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='map-traffic-banner-layer' ref={this.el}>
        <span class='map-traffic-banner hide-element' ref={this.bannerEl}>TRAFFIC</span>
      </div>
    );
  }
}