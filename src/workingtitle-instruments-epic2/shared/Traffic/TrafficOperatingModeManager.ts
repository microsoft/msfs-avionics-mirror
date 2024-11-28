import { ConsumerSubject, DebounceTimer, EventBus, Subscription } from '@microsoft/msfs-sdk';

import { AirGroundDataProviderEvents } from '../Instruments/AirGroundDataProvider';
import { TcasOperatingModeSetting, TrafficUserSettings } from '../Settings';

/**
 * A manager for automatically changing traffic system operating mode on takeoff and landing.
 */
export class TrafficOperatingModeManager {
  private static readonly DEFAULT_TAKEOFF_DELAY = 8; // seconds
  private static readonly DEFAULT_LANDING_DELAY = 24; // seconds

  private readonly trafficSettingManager = TrafficUserSettings.getManager(this.bus);
  private readonly operatingModeSetting = this.trafficSettingManager.getSetting('trafficOperatingMode');

  private readonly isOnGround = ConsumerSubject.create<boolean | undefined>(null, undefined);
  private hasFirstOnGroundValue = false;
  private operatingArmed = false;
  private standbyArmed = false;

  private readonly operatingModeChangeTimer = new DebounceTimer();

  private isAlive = true;
  private isInit = false;
  private isPaused = false;

  private operatingModeSub?: Subscription;
  private isOnGroundSub?: Subscription;

  /**
   * Constructor.
   * @param bus The event bus.
   * @param takeoffDelay The delay, in seconds, after takeoff before this manager switches the traffic system to its
   * operating mode. Defaults to {@link TrafficOperatingModeManager.DEFAULT_TAKEOFF_DELAY}.
   * @param landingDelay The delay, in seconds, after landing before this manager switches the traffic system to its
   * standby mode. Defaults to {@link TrafficOperatingModeManager.DEFAULT_LANDING_DELAY}.
   * @param operatingMode The traffic system operating mode that is automatically set by this manager after takeoff.
   * Defaults to {@link TrafficOperatingModeSetting.Operating}.
   */
  public constructor(
    private readonly bus: EventBus,
    private readonly takeoffDelay = TrafficOperatingModeManager.DEFAULT_TAKEOFF_DELAY,
    private readonly landingDelay = TrafficOperatingModeManager.DEFAULT_LANDING_DELAY,
    private readonly operatingMode = TcasOperatingModeSetting.TA_RA
  ) {
  }

  /**
   * Initializes this manager. Once this manager is initialized, it will automatically change traffic system operating
   * mode on takeoff and landing. Additionally, at the time of initialization, the traffic system will be set to
   * operate if the airplane is already in the air.
   * @param paused Whether to initialize this manager as paused.
   * @throws Error if this manager has been destroyed.
   */
  public init(paused = false): void {
    if (!this.isAlive) {
      throw new Error('TrafficOperatingModeManager: cannot initialize a dead manager');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;
    this.isPaused = paused;

    this.operatingModeSub = this.operatingModeSetting.sub(this.cancelOperatingModeChange.bind(this), false, paused);
    this.isOnGround.setConsumer(this.bus.getSubscriber<AirGroundDataProviderEvents>().on('air_ground_is_on_ground'));
    this.isOnGroundSub = this.isOnGround.sub(this.onGroundChanged.bind(this), !paused, paused);
  }

  /**
   * A callback which is called when whether own airplane is on the ground changes.
   * @param isOnGround Whether own airplane is on the ground.
   */
  private onGroundChanged(isOnGround: boolean | undefined): void {
    if (isOnGround === undefined) {
      return;
    }

    if (!this.hasFirstOnGroundValue) {
      this.hasFirstOnGroundValue = true;

      if (!isOnGround) {
        this.operatingArmed = false;
        this.standbyArmed = true;
        this.operatingModeSetting.value = this.operatingMode;
      } else {
        this.operatingArmed = true;
        this.standbyArmed = false;
      }

      return;
    }

    this.cancelOperatingModeChange();

    if (isOnGround) {
      if (this.standbyArmed && this.operatingModeSetting.value !== TcasOperatingModeSetting.Standby) {
        this.scheduleOperatingModeChange(TcasOperatingModeSetting.Standby, this.landingDelay * 1000);
      }
      this.operatingArmed = true;
      this.standbyArmed = false;
    } else {
      if (this.operatingArmed && this.operatingModeSetting.value === TcasOperatingModeSetting.Standby) {
        this.scheduleOperatingModeChange(this.operatingMode, this.takeoffDelay * 1000);
      }
      this.operatingArmed = false;
      this.standbyArmed = true;
    }
  }

  /**
   * Schedules a delayed operating mode change.
   * @param toMode The target operating mode.
   * @param delay The delay, in milliseconds.
   */
  private scheduleOperatingModeChange(toMode: TcasOperatingModeSetting, delay: number): void {
    this.operatingModeChangeTimer.schedule(() => {
      this.operatingModeSetting.value = toMode;
    }, delay);
  }

  /**
   * Cancels the currently scheduled operating mode change, if one exists.
   */
  private cancelOperatingModeChange(): void {
    this.operatingModeChangeTimer.clear();
  }

  /**
   * Resumes this manager. Once this manager is resumed, it will automatically change traffic system operating
   * mode on takeoff and landing.
   * @throws Error if this manager has been destroyed.
   */
  public resume(): void {
    if (!this.isAlive) {
      throw new Error('TrafficOperatingModeManager: cannot resume a dead manager');
    }

    if (!this.isInit || !this.isPaused) {
      return;
    }

    this.isPaused = false;

    this.operatingModeSub?.resume();
    this.isOnGroundSub?.resume(true);
  }

  /**
   * Pauses this manager. Once this manager is paused, it will no longer automatically change traffic system operating
   * mode on takeoff and landing until resumed.
   * @throws Error if this manager has been destroyed.
   */
  public pause(): void {
    if (!this.isAlive) {
      throw new Error('TrafficOperatingModeManager: cannot pause a dead manager');
    }

    if (!this.isInit || this.isPaused) {
      return;
    }

    this.isPaused = true;

    this.cancelOperatingModeChange();
    this.operatingModeSub?.pause();
    this.isOnGroundSub?.pause();
  }

  /**
   * Resets this manager. Sets the traffic systems operating mode to standby and arms (but does not schedule) the
   * transition to operating or standby modes based on whether the airplane is currently on the ground or in the air.
   * Has no effect if this manager is not initialized.
   * @throws Error if this manager has been destroyed.
   */
  public reset(): void {
    if (!this.isAlive) {
      throw new Error('TrafficOperatingModeManager: cannot reset a dead manager');
    }

    if (!this.isInit) {
      return;
    }

    const isOnGround = this.isOnGround.get();
    if (isOnGround !== undefined) {
      if (isOnGround) {
        this.operatingArmed = true;
        this.standbyArmed = false;
      } else {
        this.operatingArmed = false;
        this.standbyArmed = true;
      }
    }
    this.operatingModeSetting.value = TcasOperatingModeSetting.Standby;
  }

  /**
   * Destroys this manager.
   */
  public destroy(): void {
    this.isAlive = false;

    this.cancelOperatingModeChange();

    this.isOnGround.destroy();
    this.operatingModeSub?.destroy();
  }
}
