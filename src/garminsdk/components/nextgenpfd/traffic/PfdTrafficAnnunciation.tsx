import {
  ComponentProps, DebounceTimer, DisplayComponent, FSComponent, ObjectSubject, SetSubject, Subject,
  Subscribable, SubscribableSetEventType, Subscription, TcasAdvisoryDataProvider, TcasAlertLevel, TcasOperatingMode, VNode
} from '@microsoft/msfs-sdk';
import { TrafficSystem } from '../../../traffic/TrafficSystem';
import { TrafficSystemType } from '../../../traffic/TrafficSystemType';

/**
 * Component props for PfdTrafficAnnunciation.
 */
export interface PfdTrafficAnnunciationProps extends ComponentProps {
  /** The traffic system. */
  trafficSystem: TrafficSystem;

  /** A provider of TCAS advisory data. */
  advisoryDataProvider: TcasAdvisoryDataProvider;

  /** Whether to declutter the annunciation. */
  declutter: Subscribable<boolean>;
}

/**
 * A PFD traffic annunciation alert type.
 */
type AlertType = 'none' | 'TAOnly' | 'TA' | 'RA';

/**
 * A next-generation (NXi, G3000, etc) Garmin PFD traffic annunciation.
 */
export class PfdTrafficAnnunciation extends DisplayComponent<PfdTrafficAnnunciationProps> {
  private static readonly FLASH_DURATION = 5000; // milliseconds

  private readonly rootStyle = ObjectSubject.create({
    display: 'none'
  });

  private readonly rootCssClass = SetSubject.create(['traffic-annunc']);

  private readonly isTcasII = this.props.trafficSystem.type === TrafficSystemType.TcasII;

  private readonly flashTimer = new DebounceTimer();
  private readonly removeFlashFunc = (): void => { this.rootCssClass.delete('traffic-annunc-flash'); };

  private readonly text = Subject.create('');

  private activeAlertType: AlertType = 'none';

  private declutterSub?: Subscription;
  private taSub?: Subscription;
  private raSub?: Subscription;
  private operatingModeSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    const taSub = this.taSub = this.props.advisoryDataProvider.taIntruders.sub((set, type) => {
      this.onAdvisoryChanged(TcasAlertLevel.TrafficAdvisory, type);
    }, false, true);
    const raSub = this.raSub = this.props.advisoryDataProvider.raIntruders.sub((set, type) => {
      this.onAdvisoryChanged(TcasAlertLevel.ResolutionAdvisory, type);
    }, false, true);

    if (this.isTcasII) {
      this.operatingModeSub = this.props.trafficSystem.getEventSubscriber().on('tcas_operating_mode').whenChanged().handle(() => {
        this.onAdvisoryChanged();
      }, true);
    }

    this.declutterSub = this.props.declutter.sub(declutter => {
      if (declutter) {
        taSub.pause();
        raSub.pause();
        this.operatingModeSub?.pause();

        this.rootStyle.set('display', 'none');
        this.flashTimer.clear();
        this.rootCssClass.delete('traffic-annunc-flash');
      } else {
        this.onAdvisoryChanged();
        taSub.resume();
        raSub.resume();
        this.operatingModeSub?.resume();
      }
    }, true);
  }

  /**
   * Responds to when an advisory is issued or cancelled.
   * @param alertLevel The level of the changed advisory.
   * @param type The type of change: whether the advisory was added or removed.
   */
  private onAdvisoryChanged(
    alertLevel?: TcasAlertLevel.TrafficAdvisory | TcasAlertLevel.ResolutionAdvisory,
    type?: SubscribableSetEventType
  ): void {
    const raCount = this.props.advisoryDataProvider.raIntruders.size;
    const taCount = this.props.advisoryDataProvider.taIntruders.size;

    let alertType: AlertType;
    let shouldFlash = false;

    if (raCount > 0) {
      alertType = 'RA';
      shouldFlash = alertLevel === TcasAlertLevel.ResolutionAdvisory && type === SubscribableSetEventType.Added;
    } else if (taCount > 0) {
      alertType = 'TA';
      shouldFlash = alertLevel === TcasAlertLevel.TrafficAdvisory && type === SubscribableSetEventType.Added;
    } else if (this.isTcasII && this.props.trafficSystem.getOperatingMode() === TcasOperatingMode.TAOnly) {
      alertType = 'TAOnly';
    } else {
      alertType = 'none';
    }

    this.text.set(alertType === 'TAOnly' ? 'TA ONLY' : 'TRAFFIC');

    this.rootCssClass.toggle('traffic-annunc-taonly', alertType === 'TAOnly');
    this.rootCssClass.toggle('traffic-annunc-ta', alertType === 'TA');
    this.rootCssClass.toggle('traffic-annunc-ra', alertType === 'RA');
    if (shouldFlash) {
      this.rootCssClass.add('traffic-annunc-flash');
      this.flashTimer.schedule(this.removeFlashFunc, PfdTrafficAnnunciation.FLASH_DURATION);
    } else if (this.activeAlertType !== alertType) {
      this.flashTimer.clear();
      this.rootCssClass.delete('traffic-annunc-flash');
    }

    this.activeAlertType = alertType;

    this.rootStyle.set('display', alertType === 'none' ? 'none' : '');
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.rootCssClass} style={this.rootStyle}>{this.text}</div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.declutterSub?.destroy();
    this.taSub?.destroy();
    this.raSub?.destroy();
    this.operatingModeSub?.destroy();

    super.destroy();
  }
}