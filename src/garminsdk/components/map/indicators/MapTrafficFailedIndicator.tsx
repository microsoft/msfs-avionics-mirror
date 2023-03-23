import { ComponentProps, DisplayComponent, FSComponent, Subject, Subscribable, Subscription, TcasOperatingMode, VNode } from '@microsoft/msfs-sdk';

/**
 * Component props for MapTrafficFailedIndicator.
 */
export interface MapTrafficFailedIndicatorProps extends ComponentProps {
  /** Whether to show the indicator. */
  show: Subscribable<boolean>;

  /** The traffic system operating mode. */
  operatingMode: Subscribable<TcasOperatingMode>;
}

/**
 * Displays a traffic failed indication.
 */
export class MapTrafficFailedIndicator extends DisplayComponent<MapTrafficFailedIndicatorProps> {
  private readonly ref = FSComponent.createRef<HTMLDivElement>();

  private readonly text = Subject.create('');

  private operatingModeSub?: Subscription;
  private showSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    const operatingModeSub = this.operatingModeSub = this.props.operatingMode.sub(this.onModeChanged.bind(this), false, true);

    this.showSub = this.props.show.sub(show => {
      if (show) {
        operatingModeSub.resume(true);
      } else {
        operatingModeSub.pause();
        this.ref.instance.classList.add('failed-mode-off');
      }
    }, true);
  }

  /**
   * A callback which is called when the traffic system operating mode changes.
   * @param mode The new mode.
   */
  private onModeChanged(mode: TcasOperatingMode): void {
    switch (mode) {
      case TcasOperatingMode.Off:
        this.text.set('NO TRFC DATA');
        this.ref.instance.classList.remove('failed-mode-off');
        break;
      case TcasOperatingMode.Failed:
        this.text.set('TRFC FAIL');
        this.ref.instance.classList.remove('failed-mode-off');
        break;
      default:
        this.text.set('');
        this.ref.instance.classList.add('failed-mode-off');
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div ref={this.ref} class='map-traffic-failed'>{this.text}</div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.operatingModeSub?.destroy();
    this.showSub?.destroy();
  }
}