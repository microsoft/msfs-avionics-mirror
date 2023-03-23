import { ConsumerSubject, ControlEvents, EventBus, Subscribable, SubscribableUtils, Subscription, XPDRMode, XPDRSimVarEvents } from '@microsoft/msfs-sdk';
import { TrafficOperatingModeSetting, TrafficUserSettings } from '../settings';

/**
 * A manager which reconciles the operating modes of the active transponder and the Garmin TCAS-II traffic system.
 * The manager ensures that any time the active transponder is set to a non-altitude reporting mode, TCAS-II is set to
 * standby mode, and anytime TCAS-II is set to a non-standby mode, the active transponder is set to altitude reporting
 * mode.
 */
export class GarminXpdrTcasManager {
  private readonly controlPublisher = this.bus.getPublisher<ControlEvents>();

  private readonly activeXpdrIndex: Subscribable<number>;
  private readonly xpdrMode = ConsumerSubject.create(null, XPDRMode.OFF);

  private readonly trafficOperatingModeSetting = TrafficUserSettings.getManager(this.bus).getSetting('trafficOperatingMode');

  private xpdrIndexSub?: Subscription;
  private xpdrModeSub?: Subscription;
  private trafficModeSub?: Subscription;

  private isAlive = true;
  private isInit = false;
  private isPaused = false;

  /**
   * Constructor.
   * @param bus The event bus.
   * @param activeXpdrIndex The index of the active transponder.
   */
  public constructor(
    private readonly bus: EventBus,
    activeXpdrIndex: number | Subscribable<number>
  ) {
    this.activeXpdrIndex = SubscribableUtils.toSubscribable(activeXpdrIndex, true);
  }

  /**
   * Initializes this manager. This will perform an immediate reconciliation of transponder and TCAS operating modes
   * (the transponder mode takes precedence), and from this point on the manager will keep the two modes in a valid
   * state until it is destroyed.
   * @param paused Whether to initialize this manager as paused.
   * @throws Error if this manager has been destroyed.
   */
  public init(paused = false): void {
    if (!this.isAlive) {
      throw new Error('GarminXpdrTcasManager: cannot initialize a dead manager');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;
    this.isPaused = paused;

    const sub = this.bus.getSubscriber<XPDRSimVarEvents>();

    this.xpdrIndexSub = this.activeXpdrIndex.sub(index => {
      this.xpdrMode.setConsumer(sub.on(`xpdr_mode_${index}`));
    }, true);

    this.xpdrModeSub = this.xpdrMode.sub(mode => {
      if (mode !== XPDRMode.ALT && this.trafficOperatingModeSetting.value !== TrafficOperatingModeSetting.Standby) {
        this.trafficOperatingModeSetting.value = TrafficOperatingModeSetting.Standby;
      }
    }, false, paused);

    this.trafficModeSub = this.trafficOperatingModeSetting.sub(mode => {
      if (mode !== TrafficOperatingModeSetting.Standby && this.xpdrMode.get() !== XPDRMode.ALT) {
        this.controlPublisher.pub(`publish_xpdr_mode_${this.activeXpdrIndex.get()}`, XPDRMode.ALT);
      }
    }, !paused, paused); // Perform an initial reconciliation (TCAS setting has precedence) if not paused.
  }

  /**
   * Resumes this manager. Once this manager is resumed, it will automatically reconcile TCAS operating and transponder
   * modes.
   * @throws Error if this manager has been destroyed.
   */
  public resume(): void {
    if (!this.isAlive) {
      throw new Error('GarminXpdrTcasManager: cannot resume a dead manager');
    }

    if (!this.isInit || !this.isPaused) {
      return;
    }

    this.isPaused = false;

    this.xpdrModeSub?.resume();
    this.trafficModeSub?.resume(true);
  }

  /**
   * Pauses this manager. Once this manager is paused, it will no longer automatically reconcile TCAS operating and
   * transponder modes until resumed.
   * @throws Error if this manager has been destroyed.
   */
  public pause(): void {
    if (!this.isAlive) {
      throw new Error('GarminXpdrTcasManager: cannot pause a dead manager');
    }

    if (!this.isInit || this.isPaused) {
      return;
    }

    this.isPaused = true;

    this.xpdrModeSub?.pause();
    this.trafficModeSub?.pause();
  }

  /**
   * Resets this manager. Sets the TCAS operating mode to AUTO and the transponder mode to ALT reporting. Has no effect
   * if this manager is not initialized.
   * @throws Error if this manager has been destroyed.
   */
  public reset(): void {
    if (!this.isAlive) {
      throw new Error('GarminXpdrTcasManager: cannot reset a dead manager');
    }

    if (!this.isInit) {
      return;
    }

    this.trafficOperatingModeSetting.value = TrafficOperatingModeSetting.Auto;
    this.controlPublisher.pub(`publish_xpdr_mode_${this.activeXpdrIndex.get()}`, XPDRMode.ALT);
  }

  /**
   * Destroys this manager.
   */
  public destroy(): void {
    this.isAlive = false;

    this.xpdrMode.destroy();

    this.xpdrIndexSub?.destroy();
    this.trafficModeSub?.destroy();
  }
}