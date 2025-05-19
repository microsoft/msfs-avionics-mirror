/* eslint-disable @typescript-eslint/no-non-null-assertion */

import {
  APLateralModes, ClockEvents, ConsumerSubject, ConsumerValue, EventBus, HEvent, KeyEventData,
  KeyEventManager, KeyEvents, Subscribable, SubscribableUtils, Subscription
} from '@microsoft/msfs-sdk';

import { AhrsSystemEvents } from '../system/AhrsSystem';
import { FmaData, FmaDataEvents } from './FmaData';
import { HeadingSyncEvents } from './data/HeadingSyncEvents';

/**
 * Options for {@link GarminHeadingSyncManager}.
 */
export type GarminHeadingSyncManagerOptions = {
  /**
   * Whether to support automatic selected heading adjustment after receiving a heading sync event while HDG mode is
   * active and the aircraft is banked. Defaults to `false`.
   */
  supportTurnHeadingAdjust?: boolean;

  /**
   * Whether to support toggling HDG sync mode after receiving a heading sync event while a NAV mode is active.
   * Defaults to `false`.
   */
  supportHeadingSyncMode?: boolean;

  /**
   * The bank threshold, in degrees, below which the manager will not automatically adjust selected heading after
   * receiving a heading sync event while HDG mode is active. Ignored if `supportTurnHeadingAdjust` is `false`.
   * Defaults to 6 degrees.
   */
  turnHeadingAdjustBankThreshold?: number;

  /** The H event to map to heading sync events. Defaults to `Garmin_AP_HDG_Sync`. */
  headingSyncHEvent?: string;
};

/**
 * A manager which handles heading sync events for the Garmin autopilot. The manager syncs the autopilot's selected
 * heading to current heading in response to heading sync H events. In addition, the manager has option support for
 * automatic adjustment of selected heading during turns while HDG mode is active and for heading sync mode while an
 * autopilot NAV mode is active.
 */
export class GarminHeadingSyncManager {
  private static readonly AP_NAV_MODES = new Set([
    APLateralModes.NAV,
    APLateralModes.VOR,
    APLateralModes.LOC,
    APLateralModes.BC,
    APLateralModes.GPSS
  ]);

  private static readonly DEFAULT_TURN_HDG_ADJUST_BANK_THRESHOLD = 6;
  private static readonly DEFAULT_HDG_SYNC_H_EVENT = 'Garmin_AP_HDG_Sync';

  private readonly publisher = this.bus.getPublisher<HeadingSyncEvents>();

  private keyEventManager?: KeyEventManager;

  private readonly supportTurnHeadingAdjust: boolean;
  private readonly supportHeadingSyncMode: boolean;
  private readonly turnHeadingAdjustBankThreshold: number;
  private readonly headingSyncHEvent: string;

  private readonly apFmaData = ConsumerSubject.create<FmaData | null>(null, null);
  private readonly isApHdgModeActive = this.apFmaData.map(fmaData => {
    if (fmaData === null) {
      return false;
    }

    return fmaData.lateralActive === APLateralModes.HEADING;
  });
  private readonly isApNavModeActive = this.apFmaData.map(fmaData => {
    if (fmaData === null) {
      return false;
    }

    return GarminHeadingSyncManager.AP_NAV_MODES.has(fmaData.lateralActive);
  });

  private readonly ahrsIndex: Subscribable<number>;

  private readonly isAttitudeDataValid = ConsumerValue.create(null, false);
  private readonly isHeadingDataValid = ConsumerValue.create(null, false);
  private readonly bank = ConsumerValue.create(null, 0);
  private readonly heading = ConsumerValue.create(null, 0);

  private lastSetHeadingValue = 0;

  private isTurnHeadingAdjustActive = false;
  private isHeadingSyncModeActive = false;

  private isAlive = true;
  private isInit = false;
  private isPaused = true;

  private readonly keyEventManagerReadyPromise: Promise<KeyEventManager>;
  private keyEventManagerReadyPromiseReject?: (reason?: any) => void;

  private keyEventSub?: Subscription;
  private hEventSub?: Subscription;
  private ahrsIndexSub?: Subscription;
  private updateSub?: Subscription;

  /**
   * Creates a new instance of GarminHeadingSyncManager. The new manager is created uninitialized and paused.
   * @param bus The event bus.
   * @param ahrsIndex The index of the AHRS used by the autopilot.
   * @param options Options with which to configure the manager.
   */
  public constructor(
    private readonly bus: EventBus,
    ahrsIndex: number | Subscribable<number>,
    options?: Readonly<GarminHeadingSyncManagerOptions>
  ) {
    this.supportTurnHeadingAdjust = options?.supportTurnHeadingAdjust ?? false;
    this.supportHeadingSyncMode = options?.supportHeadingSyncMode ?? false;
    this.turnHeadingAdjustBankThreshold = options?.turnHeadingAdjustBankThreshold ?? GarminHeadingSyncManager.DEFAULT_TURN_HDG_ADJUST_BANK_THRESHOLD;
    this.headingSyncHEvent = options?.headingSyncHEvent ?? GarminHeadingSyncManager.DEFAULT_HDG_SYNC_H_EVENT;

    this.ahrsIndex = SubscribableUtils.toSubscribable(ahrsIndex, true);

    this.keyEventManagerReadyPromise = new Promise((resolve, reject) => {
      this.keyEventManagerReadyPromiseReject = reject;

      KeyEventManager.getManager(this.bus).then(manager => {
        if (this.isAlive) {
          this.keyEventManagerReadyPromiseReject = undefined;
          this.keyEventManager = manager;
          resolve(manager);
        }
      });
    });

    // Initialize published event bus topics.
    this.publisher.pub('hdg_sync_turn_adjust_active', false, true, true);
    this.publisher.pub('hdg_sync_mode_active', false, true, true);
  }

  /**
   * Waits for this manager's key event manager to be ready.
   * @returns A Promise which will be fulfilled when this manager's key event manager is ready, or rejected if this
   * manager is destroyed before then.
   */
  private awaitKeyEventManagerReady(): Promise<KeyEventManager> {
    return this.keyEventManagerReadyPromise;
  }

  /**
   * Initializes this manager. Once this manager is initialized, it will automatically adjust the autopilot's selected
   * heading in response to heading sync H events and whether turn heading adjustment or heading sync mode are active.
   * @throws Error if this manager has been destroyed.
   */
  public async init(): Promise<void> {
    if (!this.isAlive) {
      throw new Error('GarminHeadingSyncManager: cannot initialize a dead manager');
    }

    const keyEventManager = await this.awaitKeyEventManagerReady();

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    this.apFmaData.setConsumer(this.bus.getSubscriber<FmaDataEvents>().on('fma_data'));

    keyEventManager.interceptKey('HEADING_BUG_INC', true);
    keyEventManager.interceptKey('HEADING_BUG_DEC', true);
    keyEventManager.interceptKey('HEADING_BUG_SET', true);
    keyEventManager.interceptKey('AP_HEADING_BUG_SET_EX1', true);
    keyEventManager.interceptKey('AP_HDG_CURRENT_HDG_SET', true);

    const sub = this.bus.getSubscriber<KeyEvents & HEvent & AhrsSystemEvents & ClockEvents>();

    this.ahrsIndexSub = this.ahrsIndex!.sub(index => {
      if (index <= 0) {
        this.isHeadingDataValid.setConsumer(null);
        this.heading.setConsumer(null);

        if (this.supportTurnHeadingAdjust) {
          this.isAttitudeDataValid.setConsumer(null);
          this.bank.setConsumer(null);
        }
      } else {
        this.isHeadingDataValid.setConsumer(sub.on(`ahrs_heading_data_valid_${index}`));
        this.heading.setConsumer(sub.on(`ahrs_hdg_deg_${index}`));

        if (this.supportTurnHeadingAdjust) {
          this.isAttitudeDataValid.setConsumer(sub.on(`ahrs_attitude_data_valid_${index}`));
          this.bank.setConsumer(sub.on(`ahrs_roll_deg_${index}`));
        }
      }
    }, true);

    this.keyEventSub = sub.on('key_intercept').handle(this.onKeyIntercepted.bind(this), this.isPaused);

    if (this.headingSyncHEvent !== '') {
      this.hEventSub = sub.on('hEvent').handle(this.onHEvent.bind(this), this.isPaused);
    }

    this.updateSub = sub.on('realTime').handle(this.update.bind(this), this.isPaused);
  }

  /**
   * Resumes this manager. Once resumed, this manager will automatically adjust the autopilot's selected heading in
   * response to heading sync H events and whether turn heading adjustment or heading sync mode are active.
   * @throws Error if this manager has been destroyed.
   */
  public resume(): void {
    if (!this.isAlive) {
      throw new Error('GarminHeadingSyncManager: cannot resume a dead manager');
    }

    if (!this.isPaused) {
      return;
    }

    this.apFmaData.resume();
    this.isAttitudeDataValid.resume();
    this.isHeadingDataValid.resume();
    this.bank.resume();
    this.heading.resume();

    this.isPaused = false;
    this.keyEventSub?.resume();
    this.hEventSub?.resume();
    this.updateSub?.resume(true);
  }

  /**
   * Pauses this manager. Once paused, this manager will no longer automatically adjust the autopilot's selected
   * heading.
   * @throws Error if this manager has been destroyed.
   */
  public pause(): void {
    if (!this.isAlive) {
      throw new Error('GarminHeadingSyncManager: cannot pause a dead manager');
    }

    if (this.isPaused) {
      return;
    }

    this.isPaused = true;
    this.keyEventSub?.pause();
    this.hEventSub?.pause();
    this.updateSub?.pause();

    this.apFmaData.pause();
    this.isAttitudeDataValid.pause();
    this.isHeadingDataValid.pause();
    this.bank.pause();
    this.heading.pause();
  }

  /**
   * Resets this manager. Deactivates both turn heading adjustment and heading sync mode if they were active.
   */
  public reset(): void {
    this.setTurnHeadingAdjustActive(false);
    this.setHeadingSyncModeActive(false);
  }

  /**
   * Responds to a key event intercept.
   * @param data Data describing the intercepted key event.
   */
  private onKeyIntercepted(data: KeyEventData): void {
    switch (data.key) {
      case 'HEADING_BUG_INC':
      case 'HEADING_BUG_DEC':
      case 'HEADING_BUG_SET':
      case 'AP_HEADING_BUG_SET_EX1':
        this.setTurnHeadingAdjustActive(false);
        this.setHeadingSyncModeActive(false);
        this.publisher.pub('hdg_sync_manual_select', undefined, true, false);
        break;
      case 'AP_HDG_CURRENT_HDG_SET':
        this.onHeadingSyncInput();
        break;
    }
  }

  /**
   * Responds to when an H event is triggered.
   * @param hEvent The triggered H event.
   */
  private onHEvent(hEvent: string): void {
    if (hEvent === this.headingSyncHEvent) {
      this.onHeadingSyncInput();
    }
  }

  /**
   * Responds to when a heading sync input is received.
   */
  private onHeadingSyncInput(): void {
    if (this.isHeadingSyncModeActive) {
      this.setHeadingSyncModeActive(false);
    } else {
      if (this.ahrsIndex.get() > 0 && this.isHeadingDataValid.get()) {
        this.setSelectedHeading(Math.round(this.heading.get()));
      }

      this.publisher.pub('hdg_sync_manual_select', undefined, true, false);

      if (this.supportHeadingSyncMode && this.isApNavModeActive.get()) {
        this.setHeadingSyncModeActive(true);
      } else if (this.supportTurnHeadingAdjust && this.isApHdgModeActive.get()) {
        this.setTurnHeadingAdjustActive(true);
      }
    }
  }

  /**
   * Sets the autopilot's selected heading, in degrees.
   * @param heading The selected heading to set, in degrees.
   */
  private setSelectedHeading(heading: number): void {
    this.keyEventManager!.triggerKey('HEADING_BUG_SET', true, this.lastSetHeadingValue = heading, 1);
  }

  /**
   * Checks whether turn heading adjustment can be activated.
   * @returns Whether turn heading adjustment  can be activated.
   */
  private canActivateTurnHeadingAdjust(): boolean {
    return this.isApHdgModeActive.get()
      && this.ahrsIndex.get() > 0
      && this.isAttitudeDataValid.get()
      && this.isHeadingDataValid.get()
      && Math.abs(this.bank.get()) >= this.turnHeadingAdjustBankThreshold;
  }

  /**
   * Checks whether heading sync mode can be activated.
   * @returns Whether heading sync mode can be activated.
   */
  private canActivateHeadingSyncMode(): boolean {
    return this.isApNavModeActive.get()
      && this.ahrsIndex.get() > 0
      && this.isHeadingDataValid.get();
  }

  /**
   * Sets whether turn heading adjustment is active. This method will not activate turn heading adjustment if current
   * conditions do not allow for its activation. If this manager does not support turn heading adjustment, then this
   * method does nothing.
   * @param active Whether to activate turn heading adjustment.
   */
  private setTurnHeadingAdjustActive(active: boolean): void {
    if (!this.supportTurnHeadingAdjust || active === this.isTurnHeadingAdjustActive) {
      return;
    }

    if (active && !this.canActivateTurnHeadingAdjust()) {
      return;
    }

    this.isTurnHeadingAdjustActive = active;

    this.publisher.pub('hdg_sync_turn_adjust_active', active, true, true);
  }

  /**
   * Sets whether heading sync mode is active. This method will not activate heading sync mode if current conditions do
   * not allow for its activation. If this manager does not support heading sync mode, then this method does nothing.
   * @param active Whether to activate heading sync mode.
   */
  private setHeadingSyncModeActive(active: boolean): void {
    if (!this.supportHeadingSyncMode || active === this.isHeadingSyncModeActive) {
      return;
    }

    if (active && !this.canActivateHeadingSyncMode()) {
      return;
    }

    this.isHeadingSyncModeActive = active;

    this.publisher.pub('hdg_sync_mode_active', active, true, true);
  }

  /**
   * Updates this manager.
   */
  private update(): void {
    if (this.isTurnHeadingAdjustActive && !this.canActivateTurnHeadingAdjust()) {
      this.setTurnHeadingAdjustActive(false);
    }

    if (this.isHeadingSyncModeActive && !this.canActivateHeadingSyncMode()) {
      this.setHeadingSyncModeActive(false);
    }

    if (this.isTurnHeadingAdjustActive || this.isHeadingSyncModeActive) {
      // Sync selected heading to current heading if current heading differs from the selected heading
      // by at least 0.7 degrees (this provides 0.2 degrees of hysteresis after rounding).
      const currentHeading = this.heading.get();
      if (Math.abs(currentHeading - this.lastSetHeadingValue) >= 0.7) {
        this.setSelectedHeading(Math.round(currentHeading));
      }
    }
  }

  /**
   * Destroys this manager.
   */
  public destroy(): void {
    this.isAlive = false;

    this.keyEventManagerReadyPromiseReject?.('GarminHeadingSyncManager: handler was destroyed');

    this.apFmaData.destroy();
    this.isAttitudeDataValid.destroy();
    this.isHeadingDataValid.destroy();
    this.bank.destroy();

    this.keyEventSub?.destroy();
    this.hEventSub?.destroy();
    this.ahrsIndexSub?.destroy();
    this.updateSub?.destroy();
  }
}