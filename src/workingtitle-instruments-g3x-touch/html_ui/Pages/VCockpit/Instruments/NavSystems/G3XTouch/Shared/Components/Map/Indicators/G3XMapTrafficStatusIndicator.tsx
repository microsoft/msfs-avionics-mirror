import { ComponentProps, DisplayComponent, FSComponent, Subscribable, TcasOperatingMode, VNode } from '@microsoft/msfs-sdk';

import { G3XTouchFilePaths } from '../../../G3XTouchFilePaths';

import './G3XMapTrafficStatusIndicator.css';

/**
 * Component props for G3XMapTrafficStatusIndicator.
 */
export interface G3XMapTrafficStatusIndicatorProps extends ComponentProps {
  /** Whether to show the indicator. */
  show: Subscribable<boolean>;

  /** The current traffic system operating mode. */
  operatingMode: Subscribable<TcasOperatingMode>;
}

/**
 * Displays a traffic operating status indication.
 */
export class G3XMapTrafficStatusIndicator extends DisplayComponent<G3XMapTrafficStatusIndicatorProps> {
  private static readonly FAILED_MODES = new Set([
    TcasOperatingMode.Off,
    TcasOperatingMode.Standby,
    TcasOperatingMode.Failed,
    TcasOperatingMode.Test
  ]);

  private readonly rootDisplay = this.props.show.map(show => show ? '' : 'none');

  private readonly isFailed = this.props.operatingMode.map(mode => G3XMapTrafficStatusIndicator.FAILED_MODES.has(mode));
  private readonly failedDisplay = this.isFailed.map(isFailed => isFailed ? '' : 'none');

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div
        class={{
          'map-traffic-status': true,
          'map-traffic-status-fail-state': this.isFailed
        }}
        style={{ 'display': this.rootDisplay }}
      >
        <div class='map-traffic-status-icon-container'>
          <img src={`${G3XTouchFilePaths.ASSETS_PATH}/Images/Map/map_icon_traffic.png`} class='map-traffic-status-icon' />
          <svg class='map-traffic-status-failed' viewBox='0 0 100 100' style={{ 'display': this.failedDisplay }}>
            <path class='map-traffic-status-failed-cross map-traffic-status-failed-cross-outline' d='M 0 0 L 100 100 M 0 100 L 100 0' />
            <path class='map-traffic-status-failed-cross map-traffic-status-failed-cross-stroke' d='M 0 0 L 100 100 M 0 100 L 100 0' />
          </svg>
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.rootDisplay.destroy();
    this.isFailed.destroy();

    super.destroy();
  }
}