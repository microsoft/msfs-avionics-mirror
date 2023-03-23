import { ComponentProps, DisplayComponent, FSComponent, MarkerBeaconState, ObjectSubject, SetSubject, Subject, Subscribable, Subscription, VNode } from '@microsoft/msfs-sdk';
import { MarkerBeaconDataProvider } from './MarkerBeaconDataProvider';

/**
 * Component props for MarkerBeaconDisplay.
 */
export interface MarkerBeaconDisplayProps extends ComponentProps {
  /** A provider of marker beacon data. */
  dataProvider: MarkerBeaconDataProvider;

  /** Whether the display should be decluttered. */
  declutter: Subscribable<boolean>;
}

/**
 * The PFD marker beacon annunciation display.
 */
export class MarkerBeaconDisplay extends DisplayComponent<MarkerBeaconDisplayProps> {
  private static readonly TEXT = {
    [MarkerBeaconState.Inactive]: '',
    [MarkerBeaconState.Outer]: 'O',
    [MarkerBeaconState.Middle]: 'M',
    [MarkerBeaconState.Inner]: 'I',
  };

  private readonly rootStyle = ObjectSubject.create({
    display: 'none'
  });

  private readonly rootCssClass = SetSubject.create(['marker-beacon']);

  private readonly text = Subject.create('');

  private stateSub?: Subscription;
  private isDataFailedSub?: Subscription;
  private declutterSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    const stateSub = this.stateSub = this.props.dataProvider.markerBeaconState.sub(state => {
      if (state === MarkerBeaconState.Inactive) {
        this.rootStyle.set('display', 'none');
      } else {
        this.rootStyle.set('display', '');
      }

      this.rootCssClass.toggle('marker-beacon-outer', state === MarkerBeaconState.Outer);
      this.rootCssClass.toggle('marker-beacon-middle', state === MarkerBeaconState.Middle);
      this.rootCssClass.toggle('marker-beacon-inner', state === MarkerBeaconState.Inner);

      this.text.set(MarkerBeaconDisplay.TEXT[state]);
    }, false, true);

    const isDataFailedSub = this.isDataFailedSub = this.props.dataProvider.isDataFailed.sub(isFailed => {
      if (isFailed) {
        stateSub.pause();
        this.rootStyle.set('display', 'none');
      } else {
        stateSub.resume(true);
      }
    }, false, true);

    this.declutterSub = this.props.declutter.sub(declutter => {
      if (declutter) {
        isDataFailedSub.pause();
        this.rootStyle.set('display', 'none');
      } else {
        isDataFailedSub.resume(true);
      }
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.rootCssClass} style={this.rootStyle}>{this.text}</div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.stateSub?.destroy();
    this.isDataFailedSub?.destroy();
    this.declutterSub?.destroy();

    super.destroy();
  }
}
