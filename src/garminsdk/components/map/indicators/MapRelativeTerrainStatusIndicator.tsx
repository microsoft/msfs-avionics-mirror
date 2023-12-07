import { ComponentProps, DisplayComponent, FSComponent, ObjectSubject, Subscribable, Subscription, VNode } from '@microsoft/msfs-sdk';

/**
 * Component props for MapRelativeTerrainStatusIndicator.
 */
export interface MapRelativeTerrainStatusIndicatorProps extends ComponentProps {
  /** The path to the indicator icon's image file. */
  iconFilePath: string;

  /** Whether to show the indicator. */
  show: Subscribable<boolean>;

  /** Whether relative terrain mode is in a failed state. */
  isFailed: Subscribable<boolean>;
}

/**
 * Displays a relative terrain mode status indication.
 */
export class MapRelativeTerrainStatusIndicator extends DisplayComponent<MapRelativeTerrainStatusIndicatorProps> {
  private readonly rootStyle = ObjectSubject.create({ display: '' });
  private readonly failedStyle = ObjectSubject.create({ display: '' });

  private showSub?: Subscription;
  private isFailedSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.showSub = this.props.show.sub(show => {
      this.rootStyle.set('display', show ? '' : 'none');
    }, true);

    this.isFailedSub = this.props.isFailed.sub(isFailed => {
      this.failedStyle.set('display', isFailed ? '' : 'none');
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div style={this.rootStyle} class='map-rel-terrain-status'>
        <div class='map-rel-terrain-status-icon-container'>
          <img src={this.props.iconFilePath} class='map-rel-terrain-status-icon' />
          <svg class='map-rel-terrain-status-failed' viewBox='0 0 100 100' style={this.failedStyle}>
            <path class='map-rel-terrain-status-failed-cross map-rel-terrain-status-failed-cross-outline' d='M 0 0 L 100 100 M 0 100 L 100 0' />
            <path class='map-rel-terrain-status-failed-cross map-rel-terrain-status-failed-cross-stroke' d='M 0 0 L 100 100 M 0 100 L 100 0' />
          </svg>
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.showSub?.destroy();
    this.isFailedSub?.destroy();
  }
}