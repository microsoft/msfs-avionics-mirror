import { ComponentProps, DisplayComponent, FSComponent, Subscribable, Subscription, VNode } from 'msfssdk';

import { MapTrafficOffScaleStatus } from '../MapTrafficOffScaleStatus';

/**
 * Component props for MapTrafficIntruderOffScaleIndicator.
 */
export interface MapTrafficOffScaleIndicatorProps extends ComponentProps {
  /** A subscribable which provides the indicator mode. */
  status: Subscribable<MapTrafficOffScaleStatus>;
}

/**
 * Displays a traffic off-scale indication.
 */
export class MapTrafficOffScaleIndicator extends DisplayComponent<MapTrafficOffScaleIndicatorProps> {
  private static readonly CLASSES = {
    [MapTrafficOffScaleStatus.None]: 'offscale-mode-off',
    [MapTrafficOffScaleStatus.TA]: 'offscale-mode-ta',
    [MapTrafficOffScaleStatus.RA]: 'offscale-mode-ra'
  };
  private static readonly TEXT = {
    [MapTrafficOffScaleStatus.None]: '',
    [MapTrafficOffScaleStatus.TA]: 'TA OFF SCALE',
    [MapTrafficOffScaleStatus.RA]: 'RA OFF SCALE'
  };

  private readonly ref = FSComponent.createRef<HTMLDivElement>();

  private readonly text = this.props.status.map(status => {
    return MapTrafficOffScaleIndicator.TEXT[status];
  });

  private statusSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.statusSub = this.props.status.sub(this.onModeChanged.bind(this), true);
  }

  /**
   * A callback which is called when the indicator mode changes.
   * @param mode The new mode.
   */
  private onModeChanged(mode: MapTrafficOffScaleStatus): void {
    this.ref.instance.classList.remove('offscale-mode-off', 'offscale-mode-ta', 'offscale-mode-ra');
    this.ref.instance.classList.add(MapTrafficOffScaleIndicator.CLASSES[mode]);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div ref={this.ref} class='map-traffic-offscale'>{this.text}</div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.statusSub?.destroy();
  }
}