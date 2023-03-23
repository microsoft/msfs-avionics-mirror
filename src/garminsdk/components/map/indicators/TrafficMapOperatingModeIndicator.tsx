import { ComponentProps, DisplayComponent, FSComponent, Subscribable, TcasOperatingMode, VNode } from '@microsoft/msfs-sdk';

/**
 * Component props for TrafficMapOperatingModeIndicator.
 */
export interface TrafficMapOperatingModeIndicatorProps extends ComponentProps {
  /** A subscribable which provides the current traffic system operating mode. */
  operatingMode: Subscribable<TcasOperatingMode>;

  /** The text to display for each operating mode. */
  text: Partial<Record<TcasOperatingMode, string>>;
}

/**
 * Displays a traffic system operating mode indication.
 */
export class TrafficMapOperatingModeIndicator extends DisplayComponent<TrafficMapOperatingModeIndicatorProps> {
  private readonly text = this.props.operatingMode.map(mode => this.props.text[mode] ?? '');

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='traffic-map-opmode'>{this.text}</div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.text.destroy();
  }
}