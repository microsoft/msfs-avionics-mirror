import { ComponentProps, DisplayComponent, EventBus, FSComponent, MinimumsMode, ObjectSubject, SetSubject, Subject, Subscribable, Subscription, VNode } from '@microsoft/msfs-sdk';
import { MinimumsAlertState } from '../minimums/MinimumsAlerter';
import { RadarAltimeterDataProvider } from './RadarAltimeterDataProvider';

/**
 * Component props for RadarAltimeter.
 */
export interface RadarAltimeterProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** A data provider for the indicator. */
  dataProvider: RadarAltimeterDataProvider;

  /** The current active minimums mode. */
  minimumsMode: Subscribable<MinimumsMode>;

  /** The current minimums alert state. */
  minimumsAlertState: Subscribable<MinimumsAlertState>;
}

/**
 * A next-generation (NXi, G3000, etc) Garmin PFD radar altimeter.
 */
export class RadarAltimeter extends DisplayComponent<RadarAltimeterProps> {
  private readonly rootStyle = ObjectSubject.create({
    display: 'none'
  });
  private readonly failedStyle = ObjectSubject.create({
    display: 'none'
  });
  private readonly operatingStyle = ObjectSubject.create({
    display: 'none'
  });

  private readonly rootCssClass = SetSubject.create(['radar-altimeter']);

  private readonly valueText = Subject.create('');

  private isVisibleSub?: Subscription;
  private failedSub?: Subscription;
  private radarAltSub?: Subscription;
  private minimumsModeSub?: Subscription;
  private minimumsAlertSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    const minimumsAlertSub = this.minimumsAlertSub = this.props.minimumsAlertState.sub(state => {
      this.rootCssClass.delete('minimums-alert-atorbelow');

      if (state === MinimumsAlertState.AtOrBelow) {
        this.rootCssClass.add('minimums-alert-atorbelow');
      }
    }, false, true);

    const minimumsModeSub = this.minimumsModeSub = this.props.minimumsMode.sub(mode => {
      if (mode === MinimumsMode.RA) {
        minimumsAlertSub.resume(true);
      } else {
        minimumsAlertSub.pause();

        this.rootCssClass.delete('minimums-alert-atorbelow');
      }
    }, false, true);

    const radarAltSub = this.radarAltSub = this.props.dataProvider.radarAlt.sub(radarAlt => {
      this.valueText.set(isNaN(radarAlt) ? '' : radarAlt.toFixed(0));
    }, false, true);

    const isVisibleSub = this.isVisibleSub = this.props.dataProvider.radarAlt.sub(radarAlt => {
      if (isNaN(radarAlt)) {
        radarAltSub.pause();
        minimumsModeSub.pause();
        minimumsAlertSub.pause();

        this.rootStyle.set('display', 'none');
      } else {
        radarAltSub.resume(true);
        minimumsModeSub.resume(true);

        this.rootStyle.set('display', '');
      }
    }, false, true);

    this.failedSub = this.props.dataProvider.isDataFailed.sub(isFailed => {
      if (isFailed) {
        isVisibleSub.pause();
        radarAltSub.pause();
        minimumsModeSub.pause();
        minimumsAlertSub.pause();

        this.rootCssClass.delete('minimums-alert-atorbelow');

        this.rootStyle.set('display', '');
        this.operatingStyle.set('display', 'none');
        this.failedStyle.set('display', '');
      } else {
        this.failedStyle.set('display', 'none');
        this.operatingStyle.set('display', '');

        isVisibleSub.resume(true);
      }
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.rootCssClass} style={this.rootStyle}>
        <div class='radar-altimeter-failed' style={this.failedStyle}>RA FAIL</div>
        <div class='radar-altimeter-operating' style={this.operatingStyle}>
          <div class='radar-altimeter-title'>RA</div>
          <div class='radar-altimeter-value'>{this.valueText}</div>
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.isVisibleSub?.destroy();
    this.radarAltSub?.destroy();
    this.failedSub?.destroy();
    this.minimumsModeSub?.destroy();
    this.minimumsAlertSub?.destroy();
  }
}