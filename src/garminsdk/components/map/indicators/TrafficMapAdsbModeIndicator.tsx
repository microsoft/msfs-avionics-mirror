import { AdsbOperatingMode, ComponentProps, DisplayComponent, FSComponent, Subscribable, VNode } from 'msfssdk';

/**
 * Component props for TrafficMapBdsbModeIndicator.
 */
export interface TrafficMapAdsbModeIndicatorProps extends ComponentProps {
  /** A subscribable which provides the current ADS-B operating mode. */
  operatingMode: Subscribable<AdsbOperatingMode>;

  /** The text to display for each operating mode. */
  text: Partial<Record<AdsbOperatingMode, string>>;
}

/**
 * Displays an ADS-B operating mode indication.
 */
export class TrafficMapAdsbModeIndicator extends DisplayComponent<TrafficMapAdsbModeIndicatorProps> {
  private readonly text = this.props.operatingMode.map(mode => this.props.text[mode] ?? '');

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='map-traffic-adsb-opmode'>{this.text}</div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.text.destroy();
  }
}