/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  APLateralModes, AvionicsSystemState, AvionicsSystemStateEvent, ConsumerSubject, ConsumerValue, EventBus, KeyEventData,
  KeyEventManager, KeyEvents, MappedSubject, SimVarValueType, Subscription, Wait
} from '@microsoft/msfs-sdk';
import { AdcSystemEvents } from '../system/AdcSystem';
import { AhrsSystemEvents } from '../system/AhrsSystem';
import { FmaData, FmaDataEvents } from './FmaData';

/**
 * A manager which handles activation and deactivation of Low Bank Mode for Garmin autopilots. The manager ensures that
 * Low Bank Mode is active only when supported by the autopilot's active lateral mode. Optionally, it will also
 * automatically toggle Low Bank Mode in response to changes in indicated altitude.
 */
export class GarminLowBankManager {
  private static readonly LOW_BANK_SUPPORTED_MODES = new Set([
    APLateralModes.HEADING,
    APLateralModes.NAV,
    APLateralModes.VOR,
    APLateralModes.LOC,
    APLateralModes.BC,
    APLateralModes.GPSS
  ]);

  private keyEventManager?: KeyEventManager;

  private readonly apFmaData = ConsumerSubject.create<FmaData | null>(null, null);
  private readonly isLowBankSupported = this.apFmaData.map(fmaData => {
    if (fmaData === null) {
      return false;
    }

    return GarminLowBankManager.LOW_BANK_SUPPORTED_MODES.has(fmaData.lateralActive);
  });

  private readonly adcIndexes: number[];
  private readonly adcStates: ConsumerSubject<AvionicsSystemStateEvent>[] = [];
  private adcIndex?: MappedSubject<AvionicsSystemStateEvent[], number>;

  private readonly ahrsIndexes: number[];
  private readonly ahrsStates: ConsumerSubject<AvionicsSystemStateEvent>[] = [];
  private ahrsIndex?: MappedSubject<AvionicsSystemStateEvent[], number>;

  private readonly indicatedAlt = ConsumerSubject.create(null, 0);
  private readonly bank = ConsumerValue.create(null, 0);

  private isActivateArmed = false;
  private isDeactivateArmed = false;

  private isAlive = true;
  private isInit = false;
  private isAutoTogglePaused = true;

  // eslint-disable-next-line jsdoc/require-jsdoc
  private readonly keyEventManagerReadyPromises: { resolve: () => void, reject: (reason?: any) => void }[] = [];

  private keyEventSub?: Subscription;
  private altitudeSub?: Subscription;

  /**
   * Creates a new instance of GarminLowBankManager. The new manager is created as uninitialized and with auto-toggle
   * paused.
   * @param bus The event bus.
   * @param activateAltitude The indicated altitude threshold, in feet, for automatic activation of low-bank mode. If
   * defined and auto-toggle is supported, this manager will automatically activate low-bank mode when the airplane
   * climbs from below to above this altitude.
   * @param deactivateAltitude The indicated altitude threshold, in feet, for automatic deactivation of low-bank mode.
   * If defined and auto-toggle is supported, this manager will automatically deactivate low-bank mode when the
   * airplane descends from above to below this altitude.
   * @param supportedAdcIndexes An iterable of ADC system indexes from which the manager can source indicated altitude
   * data. Required for auto-toggle behavior. The manager will source data from the first ADC system (in the order
   * returned by the iterable) whose state is equal to `AvionicsSystemState.On`.
   * @param autoToggleBankLimit The bank angle, in degrees, above which auto-toggle is disabled.
   * @param supportedAhrsIndexes An iterable of AHRS system indexes from which the manager can source bank angle data.
   * Required for auto-toggle behavior to be limited by aircraft bank. The manager will source data from the first AHRS
   * system (in the order returned by the iterable) whose state is equal to `AvionicsSystemState.On`.
   * @throws Error if `activateAltitude` is less than `deactivateAltitude`.
   */
  public constructor(
    private readonly bus: EventBus,
    private readonly activateAltitude?: number,
    private readonly deactivateAltitude?: number,
    supportedAdcIndexes?: Iterable<number>,
    private readonly autoToggleBankLimit = 0,
    supportedAhrsIndexes?: Iterable<number>
  ) {
    if (activateAltitude !== undefined && deactivateAltitude !== undefined && activateAltitude < deactivateAltitude) {
      throw new Error(`GarminLowBankManager: activateAltitude (${activateAltitude}) is lower than deactivateAltitude (${deactivateAltitude})`);
    }

    // Remove duplicates
    this.adcIndexes = Array.from(new Set(supportedAdcIndexes));
    this.ahrsIndexes = Array.from(new Set(supportedAhrsIndexes));

    KeyEventManager.getManager(this.bus).then(manager => {
      this.keyEventManager = manager;
      while (this.isAlive && this.keyEventManagerReadyPromises.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.keyEventManagerReadyPromises.shift()!.resolve();
      }
    });
  }

  /**
   * Waits for this handler's key event manager to be ready.
   * @returns A Promise which will be fulfilled when this handler's key event manager is ready, or rejected if this
   * handler is destroyed before then.
   */
  private awaitKeyEventManagerReady(): Promise<void> {
    if (this.keyEventManager !== undefined) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => { this.keyEventManagerReadyPromises.push({ resolve, reject }); });
  }

  /**
   * Initializes this manager. Once this manager is initialized, it will ensure that Low Bank Mode is active only when
   * it is supported by the autopilot's active lateral mode. Additionally, it will automatically toggle Low Bank Mode
   * in response to changes in indicated altitude if the function is supported and resumed.
   * @throws Error if this manager has been destroyed.
   */
  public async init(): Promise<void> {
    if (!this.isAlive) {
      throw new Error('GarminLowBankManager: cannot initialize a dead manager');
    }

    await this.awaitKeyEventManagerReady();

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    this.apFmaData.setConsumer(this.bus.getSubscriber<FmaDataEvents>().on('fma_data'));

    this.keyEventManager!.interceptKey('AP_MAX_BANK_SET', false);
    this.keyEventManager!.interceptKey('AP_MAX_BANK_INC', false);
    this.keyEventManager!.interceptKey('AP_MAX_BANK_DEC', false);

    // Wait one frame for the key intercepts to be established.
    await Wait.awaitDelay(0);

    const sub = this.bus.getSubscriber<KeyEvents & AdcSystemEvents & AhrsSystemEvents>();

    this.keyEventSub = sub.on('key_intercept').handle(this.onKeyIntercepted.bind(this));

    this.isLowBankSupported.sub(this.onLowBankSupportedChanged.bind(this), true);

    if (this.adcIndexes.length > 0 && (this.activateAltitude !== undefined || this.deactivateAltitude !== undefined)) {

      // Initialize bank data.
      if (this.ahrsIndexes.length > 0 && this.autoToggleBankLimit > 0) {
        for (let i = 0; i < this.ahrsIndexes.length; i++) {
          this.ahrsStates[i] = ConsumerSubject.create(sub.on(`ahrs_state_${this.ahrsIndexes[i]}`), { previous: undefined, current: AvionicsSystemState.Off });
        }

        this.ahrsIndex = MappedSubject.create(
          GarminLowBankManager.selectSystemIndex.bind(undefined, this.ahrsIndexes),
          ...this.ahrsStates
        );

        this.ahrsIndex.sub(index => {
          if (index <= 0) {
            this.bank.setConsumer(null);
          } else {
            this.bank.setConsumer(sub.on(`ahrs_roll_deg_${index}`));
          }
        }, true);
      }

      // Initialize indicated altitude data.
      for (let i = 0; i < this.adcIndexes.length; i++) {
        this.adcStates[i] = ConsumerSubject.create(sub.on(`adc_state_${this.adcIndexes[i]}`), { previous: undefined, current: AvionicsSystemState.Off });
      }

      this.adcIndex = MappedSubject.create(
        GarminLowBankManager.selectSystemIndex.bind(undefined, this.adcIndexes),
        ...this.adcStates
      );

      this.adcIndex.sub(index => {
        if (index <= 0) {
          this.altitudeSub?.pause();
          this.indicatedAlt.setConsumer(null);
          this.isActivateArmed = false;
          this.isDeactivateArmed = false;
        } else {
          this.indicatedAlt.setConsumer(sub.on(`adc_indicated_alt_${index}`));
          if (!this.isAutoTogglePaused) {
            this.altitudeSub?.resume(true);
          }
        }
      }, true);

      this.altitudeSub = this.indicatedAlt.sub(this.onAltitudeChanged.bind(this), !this.isAutoTogglePaused, this.isAutoTogglePaused);
    }
  }

  /**
   * Resumes this manager's auto-toggle behavior. Once resumed, this manager will automatically activate/deactivate
   * Low Bank Mode based on changes in indicated altitude. If this manager has not been initialized, auto-toggle
   * behavior will begin when initialization is complete.
   * @throws Error if this manager has been destroyed.
   */
  public resumeAutoToggle(): void {
    if (!this.isAlive) {
      throw new Error('GarminLowBankManager: cannot resume auto-toggle on a dead manager');
    }

    if (!this.isAutoTogglePaused) {
      return;
    }

    this.isAutoTogglePaused = false;
    if (this.altitudeSub !== undefined && this.adcIndex !== undefined && this.adcIndex.get() > 0) {
      this.altitudeSub.resume(true);
    }
  }

  /**
   * Pauses this manager's auto-toggle behavior. Once paused, this manager will no longer automatically
   * activate/deactivate Low Bank Mode until auto-toggle is resumed.
   * @throws Error if this manager has been destroyed.
   */
  public pauseAutoToggle(): void {
    if (!this.isAlive) {
      throw new Error('GarminLowBankManager: cannot pause auto-toggle on a dead manager');
    }

    if (this.isAutoTogglePaused) {
      return;
    }

    this.isAutoTogglePaused = true;
    this.altitudeSub?.pause();
    this.isActivateArmed = false;
    this.isDeactivateArmed = false;
  }

  /**
   * Sets the active state of Low Bank Mode.
   * @param active Whether to activate Low Bank Mode.
   */
  public setLowBankActive(active: boolean): void {
    if (!this.isLowBankSupported.get() && active) {
      return;
    }

    this.keyEventManager!.triggerKey('AP_MAX_BANK_SET', true, active ? 1 : 0);
  }

  /**
   * Responds to when Low Bank Mode support changes.
   * @param isLowBankSupported Whether Low Bank Mode is supported.
   */
  private onLowBankSupportedChanged(isLowBankSupported: boolean): void {
    if (!isLowBankSupported) {
      this.setLowBankActive(false);
    }
  }

  /**
   * Responds to when the indicated altitude changes.
   * @param altitude The indicated altitude, in feet.
   */
  private onAltitudeChanged(altitude: number): void {
    if (this.activateAltitude !== undefined) {
      if (altitude < this.activateAltitude) {
        this.isActivateArmed = true;
      } else {
        if (this.isActivateArmed) {
          if (this.ahrsIndex === undefined || (this.ahrsIndex.get() > 0 && Math.abs(this.bank.get()) <= this.autoToggleBankLimit)) {
            this.setLowBankActive(true);
          }
          this.isActivateArmed = false;
        }
      }
    }

    if (this.deactivateAltitude !== undefined) {
      if (altitude >= this.deactivateAltitude) {
        this.isDeactivateArmed = true;
      } else {
        if (this.isDeactivateArmed) {
          if (this.ahrsIndex === undefined || (this.ahrsIndex.get() > 0 && Math.abs(this.bank.get()) <= this.autoToggleBankLimit)) {
            this.setLowBankActive(false);
          }
          this.isDeactivateArmed = false;
        }
      }
    }
  }

  /**
   * Handles a key event intercept.
   * @param data Data describing the intercepted key event.
   */
  private onKeyIntercepted(data: KeyEventData): void {
    switch (data.key) {
      case 'AP_MAX_BANK_SET': {
        const value = data.value0 ?? 0;
        if (value < 2) {
          this.setLowBankActive(value === 1);
        }
        break;
      }
      case 'AP_MAX_BANK_INC':
      case 'AP_MAX_BANK_DEC': {
        this.setLowBankActive(SimVar.GetSimVarValue('AUTOPILOT MAX BANK ID', SimVarValueType.Number) !== 1);
        break;
      }
    }
  }

  /**
   * Destroys this manager.
   */
  public destroy(): void {
    this.isAlive = false;

    this.keyEventManagerReadyPromises.forEach(promise => { promise.reject('GarminLowBankManager: handler was destroyed'); });

    this.apFmaData.destroy();
    this.adcStates.forEach(sub => { sub.destroy(); });
    this.ahrsStates.forEach(sub => { sub.destroy(); });
    this.indicatedAlt.destroy();
    this.bank.destroy();

    this.keyEventSub?.destroy();
  }

  /**
   * Selects the index of the first system in an array whose state is equal to `AvionicsSystemState.On`.
   * @param indexes The indexes of the systems from which to select.
   * @param states The states of the systems from which to select.
   * @returns The index of the first system in the specified array whose state is equal to `AvionicsSystemState.On`.
   */
  private static selectSystemIndex(indexes: readonly number[], states: readonly AvionicsSystemStateEvent[]): number {
    for (let i = 0; i < states.length; i++) {
      const state = states[i];
      if (state.current === undefined || state.current === AvionicsSystemState.On) {
        return indexes[i];
      }
    }

    return -1;
  }
}