import {
  APEvents, APLateralModes, AvionicsSystemState, AvionicsSystemStateEvent, ConsumerSubject, EventBus, KeyEventData,
  KeyEventManager, KeyEvents, MappedSubject, SimVarValueType, Subject, Subscription, Wait
} from '@microsoft/msfs-sdk';

import { AdcSystemEvents } from '../system/AdcSystem';
import { AhrsSystemEvents } from '../system/AhrsSystem';
import { FmaData, FmaDataEvents } from './FmaData';

/**
 * Configuration options for {@link GarminLowBankManager}.
 */
export type GarminLowBankManagerOptions = {
  /**
   * The indicated altitude threshold, in feet, for automatic activation of low-bank mode. If defined and auto-toggle
   * is supported, then this manager will automatically activate low-bank mode when the airplane climbs from below to
   * above this altitude.
   */
  activateAltitude?: number;

  /**
   * The indicated altitude threshold, in feet, for automatic deactivation of low-bank mode. If defined and auto-toggle
   * is supported, then this manager will automatically deactivate low-bank mode when the airplane descends from above
   * to below this altitude.
   */
  deactivateAltitude?: number;

  /**
   * An iterable of ADC system indexes from which the manager can source indicated altitude data. Required for
   * auto-toggle behavior. The manager will source data from the first ADC system (in the order returned by the
   * iterable) whose state is equal to `AvionicsSystemState.On`.
   */
  supportedAdcIndexes?: Iterable<number>;

  /**
   * The bank angle, in degrees, above which auto-toggle is inhibited. If this value is less than or equal to zero,
   * then bank angle will not affect whether auto-toggle is inhibited. Defaults to `0`.
   */
  autoToggleBankLimit?: number;

  /**
   * An iterable of AHRS system indexes from which the manager can source bank angle data. Required for auto-toggle
   * behavior to be limited by aircraft bank. The manager will source data from the first AHRS system (in the order
   * returned by the iterable) whose state is equal to `AvionicsSystemState.On`.
   */
  supportedAhrsIndexes?: Iterable<number>;

  /**
   * Whether the manager should enforce the Low Bank Mode state requested by auto-toggle logic. If auto-toggle is
   * enforced, then Low Bank Mode will be forced to be active when the airplane is above the automatic activation
   * altitude and inactive when the airplane is below the automatic deactivation altitude. 
   */
  enforceAutoToggle?: boolean;
};

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
  private readonly keyEventManagerPromise: Promise<void>;
  private keyEventManagerPromiseReject?: (reason?: any) => void;

  private readonly activateAltitude?: number;
  private readonly deactivateAltitude?: number;
  private readonly autoToggleBankLimit: number;
  private readonly enforceAutoToggle?: boolean;

  private readonly apFmaData = ConsumerSubject.create<FmaData | null>(null, null);
  private readonly isLowBankSupported = this.apFmaData.map(fmaData => {
    if (fmaData === null) {
      return false;
    }

    return GarminLowBankManager.LOW_BANK_SUPPORTED_MODES.has(fmaData.lateralActive);
  });

  private readonly apMaxBankId = ConsumerSubject.create(null, 0);

  private readonly adcIndexes: number[];
  private readonly adcStates: ConsumerSubject<AvionicsSystemStateEvent>[] = [];
  private adcIndex?: MappedSubject<AvionicsSystemStateEvent[], number>;

  private readonly ahrsIndexes: number[];
  private readonly ahrsStates: ConsumerSubject<AvionicsSystemStateEvent>[] = [];
  private ahrsIndex?: MappedSubject<AvionicsSystemStateEvent[], number>;

  private readonly indicatedAlt = ConsumerSubject.create(null, 0);
  private readonly bank = ConsumerSubject.create(null, 0);

  private readonly isAutoToggleInhibitedByBank = Subject.create(false);

  private isActivateArmed = false;
  private isDeactivateArmed = false;

  private readonly isLowBankActiveDesired = Subject.create(false);

  private isAlive = true;
  private isInit = false;
  private isAutoTogglePaused = true;

  private keyEventSub?: Subscription;
  private altitudeSub?: Subscription;
  private enforceSub?: Subscription;
  private canEnforceSub?: Subscription;

  /**
   * Creates a new instance of GarminLowBankManager. The new manager is created as uninitialized and with auto-toggle
   * paused.
   * @param bus The event bus.
   * @param options Options with which to configure the manager.
   * @throws Error if `options.activateAltitude` is less than `options.deactivateAltitude`.
   */
  public constructor(
    bus: EventBus,
    options?: Readonly<GarminLowBankManagerOptions>
  );
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
   * @param autoToggleBankLimit The bank angle, in degrees, above which auto-toggle is inhibited. If this value is less
   * than or equal to zero, then bank angle will not affect whether auto-toggle is inhibited. Defaults to `0`.
   * @param supportedAhrsIndexes An iterable of AHRS system indexes from which the manager can source bank angle data.
   * Required for auto-toggle behavior to be limited by aircraft bank. The manager will source data from the first AHRS
   * system (in the order returned by the iterable) whose state is equal to `AvionicsSystemState.On`.
   * @throws Error if `activateAltitude` is less than `deactivateAltitude`.
   */
  public constructor(
    bus: EventBus,
    activateAltitude?: number,
    deactivateAltitude?: number,
    supportedAdcIndexes?: Iterable<number>,
    autoToggleBankLimit?: number,
    supportedAhrsIndexes?: Iterable<number>
  );
  // eslint-disable-next-line jsdoc/require-jsdoc
  public constructor(
    private readonly bus: EventBus,
    arg2?: number | Readonly<GarminLowBankManagerOptions>,
    deactivateAltitude?: number,
    supportedAdcIndexes?: Iterable<number>,
    autoToggleBankLimit?: number,
    supportedAhrsIndexes?: Iterable<number>
  ) {
    let opts: Readonly<GarminLowBankManagerOptions> | undefined;
    if (typeof arg2 === 'number') {
      opts = {
        activateAltitude: arg2,
        deactivateAltitude,
        supportedAdcIndexes,
        autoToggleBankLimit,
        supportedAhrsIndexes
      };
    } else {
      opts = arg2;
    }

    this.activateAltitude = opts?.activateAltitude;
    this.deactivateAltitude = opts?.deactivateAltitude;

    if (this.activateAltitude !== undefined && this.deactivateAltitude !== undefined && this.activateAltitude < this.deactivateAltitude) {
      throw new Error(`GarminLowBankManager: activateAltitude (${this.activateAltitude}) is lower than deactivateAltitude (${this.deactivateAltitude})`);
    }

    this.autoToggleBankLimit = opts?.autoToggleBankLimit ?? 0;
    this.enforceAutoToggle = opts?.enforceAutoToggle === true && this.activateAltitude !== undefined && this.deactivateAltitude !== undefined;

    // Remove duplicates
    this.adcIndexes = Array.from(new Set(opts?.supportedAdcIndexes));
    this.ahrsIndexes = Array.from(new Set(opts?.supportedAhrsIndexes));

    this.keyEventManagerPromise = this.createKeyEventManagerPromise();
  }

  /**
   * Creates a Promise that is fulfilled when the key event manager has been retrieved.
   */
  private createKeyEventManagerPromise(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.keyEventManagerPromiseReject = reject;
      KeyEventManager.getManager(this.bus).then(manager => {
        this.keyEventManager = manager;
        resolve();
      });
    });
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

    await this.keyEventManagerPromise;

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

    const sub = this.bus.getSubscriber<KeyEvents & APEvents & AdcSystemEvents & AhrsSystemEvents>();

    if (!this.enforceAutoToggle) {
      this.keyEventSub = sub.on('key_intercept').handle(this.onKeyIntercepted.bind(this));
    }

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

        const bankPipe = this.bank.pipe(this.isAutoToggleInhibitedByBank, bank => bank > this.autoToggleBankLimit, true);

        this.ahrsIndex.sub(index => {
          if (index <= 0) {
            this.bank.setConsumer(null);
            bankPipe.pause();
            this.isAutoToggleInhibitedByBank.set(false);
          } else {
            this.bank.setConsumer(sub.on(`ahrs_roll_deg_${index}`));
            bankPipe.resume(true);
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

          // If enforce toggle is enabled, deactivate Low Bank Mode if we have no altitude data.
          this.isLowBankActiveDesired.set(false);
        } else {
          this.indicatedAlt.setConsumer(sub.on(`adc_indicated_alt_${index}`));
          if (!this.isAutoTogglePaused) {
            this.altitudeSub?.resume(true);
          }
        }
      }, true);

      const altitudeHandler = this.enforceAutoToggle ? this.onAltitudeChangedEnforce.bind(this) : this.onAltitudeChanged.bind(this);
      this.altitudeSub = this.indicatedAlt.sub(altitudeHandler, !this.isAutoTogglePaused, this.isAutoTogglePaused);
    }

    if (!this.isLowBankSupported.get()) {
      this._setLowBankActive(false);
    }
    this.isLowBankSupported.sub(this.onLowBankSupportedChanged.bind(this));

    if (this.enforceAutoToggle) {
      this.apMaxBankId.setConsumer(sub.on('ap_max_bank_id'));

      this.enforceSub = MappedSubject.create(this.apMaxBankId, this.isLowBankActiveDesired).sub(this.onEnforceStateChanged.bind(this), false, true);
      this.canEnforceSub = MappedSubject.create(
        ([isLowBankSupported, isAutoToggleInhibitedByBank]) => isLowBankSupported && !isAutoToggleInhibitedByBank,
        this.isLowBankSupported,
        this.isAutoToggleInhibitedByBank
      ).sub(this.onCanEnforceChanged.bind(this), !this.isAutoTogglePaused, this.isAutoTogglePaused);
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

    this.canEnforceSub?.resume(true);
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
    this.enforceSub?.pause();
    this.canEnforceSub?.pause();
    this.isActivateArmed = false;
    this.isDeactivateArmed = false;
  }

  /**
   * Sets the active state of Low Bank Mode. This method does not activate Low Bank Mode when it is not supported by
   * the current lateral flight director mode. This method does nothing if this manager enforces auto-toggle and
   * auto-toggle is resumed.
   * @param active Whether to activate Low Bank Mode.
   */
  public setLowBankActive(active: boolean): void {
    if (
      !this.keyEventManager
      || (this.enforceAutoToggle && !this.isAutoTogglePaused)
      || (!this.isLowBankSupported.get() && active)
    ) {
      return;
    }

    this._setLowBankActive(active);
  }

  /**
   * Sets the active state of Low Bank Mode.
   * @param active Whether to activate Low Bank Mode.
   */
  private _setLowBankActive(active: boolean): void {
    this.keyEventManager!.triggerKey('AP_MAX_BANK_SET', true, active ? 1 : 0);
  }

  /**
   * Responds to when Low Bank Mode support changes.
   * @param isLowBankSupported Whether Low Bank Mode is supported.
   */
  private onLowBankSupportedChanged(isLowBankSupported: boolean): void {
    if (!isLowBankSupported) {
      this._setLowBankActive(false);
    }
  }

  /**
   * Responds to when the indicated altitude changes and auto-toggle is not enforced.
   * @param altitude The indicated altitude, in feet.
   */
  private onAltitudeChanged(altitude: number): void {
    if (this.activateAltitude !== undefined) {
      if (altitude < this.activateAltitude) {
        this.isActivateArmed = true;
      } else {
        if (this.isActivateArmed) {
          this.isActivateArmed = false;
          if (this.isLowBankSupported.get() && !this.isAutoToggleInhibitedByBank.get()) {
            this._setLowBankActive(true);
          }
        }
      }
    }

    if (this.deactivateAltitude !== undefined) {
      if (altitude >= this.deactivateAltitude) {
        this.isDeactivateArmed = true;
      } else {
        if (this.isDeactivateArmed) {
          this.isDeactivateArmed = false;
          if (!this.isAutoToggleInhibitedByBank.get()) {
            this.setLowBankActive(false);
          }
        }
      }
    }
  }

  /**
   * Responds to when the indicated altitude changes and auto-toggle is enforced.
   * @param altitude The indicated altitude, in feet.
   */
  private onAltitudeChangedEnforce(altitude: number): void {
    if (altitude < this.deactivateAltitude!) {
      this.isLowBankActiveDesired.set(false);
    } else if (altitude >= this.activateAltitude!) {
      this.isLowBankActiveDesired.set(true);
    }
  }

  /**
   * Responds to when the state of auto-toggle enforcement changes.
   * @param state The new state of auto-toggle enforcement, as `[id, desired]`, where `id` is the current autopilot
   * max bank ID and `desired` is whether Low Bank Mode should be active.
   */
  private onEnforceStateChanged(state: readonly [number, boolean]): void {
    const [apMaxBankId, isLowBankActiveDesired] = state;
    if (apMaxBankId !== (isLowBankActiveDesired ? 1 : 0)) {
      this._setLowBankActive(isLowBankActiveDesired);
    }
  }

  /**
   * Responds to when whether this manager can enforce auto-toggle changes.
   * @param canEnforce Whether this manager can enforce auto-toggle.
   */
  private onCanEnforceChanged(canEnforce: boolean): void {
    if (canEnforce) {
      this.enforceSub!.resume(true);
    } else {
      this.enforceSub!.pause();
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

    this.keyEventManagerPromiseReject?.('GarminLowBankManager: manager was destroyed');

    this.apFmaData.destroy();
    this.apMaxBankId.destroy();
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