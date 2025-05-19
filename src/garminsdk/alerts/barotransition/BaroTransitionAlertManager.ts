import {
  ConsumerSubject, EventBus, MappedSubject, Subject, Subscribable, SubscribableMapFunctions, SubscribableUtils,
  Subscription, UserSettingManager, Value
} from '@microsoft/msfs-sdk';

import { AdcSystemEvents } from '../../system/AdcSystem';
import { BaroTransitionAlertUserSettingTypes } from '../../settings/BaroTransitionAlertUserSettings';
import { BaroTransitionAlertEvents } from './BaroTransitionAlertEvents';

/**
 * Configuration options for {@link BaroTransitionAlertManager}.
 */
export type BaroTransitionAlertManagerOptions = {
  /**
   * The ID to assign the manager. Event bus topics published by the manager will be suffixed with its ID. Cannot be
   * the empty string.
   */
  id: string;

  /** The index of the ADC from which to source altitude and barometric setting data. */
  adcIndex: number | Subscribable<number>;
};

/**
 * Barometric transition alert states.
 */
enum AlertState {
  Off = 'Off',
  Unarmed = 'Unarmed',
  Armed = 'Armed',
  Active = 'Active',
  ActiveLocked = 'ActiveLocked',
}

/**
 * A manager that controls the state of a set of barometric transition alerts. Each manager controls a transition
 * altitude alert, which is triggered when climbing through a transition altitude without changing an altimeter's
 * barometric setting to standard, and a transition level alert, which is triggered when descending through a
 * transition level without changing an altimeter's barometric setting out of standard. The states of the alerts are
 * published to the topics defined in {@link BaroTransitionAlertEvents}.
 * 
 * The manager requires that the topics defined in {@link AdcSystemEvents} are published to the event bus.
 */
export class BaroTransitionAlertManager {
  private static readonly ALTITUDE_MARGIN = 200; // feet
  private static readonly ALTITUDE_HYSTERESIS = 80; // feet

  private readonly publisher = this.bus.getPublisher<BaroTransitionAlertEvents>();

  private readonly id: string;

  private readonly adcIndex: Subscribable<number>;

  private readonly isAltitudeDataValid = ConsumerSubject.create(null, false);
  private readonly indicatedAlt = ConsumerSubject.create(null, 0);
  private readonly baroIsStdActive = ConsumerSubject.create(null, false);

  private readonly indicatedAltRounded = this.indicatedAlt.map(SubscribableMapFunctions.withPrecision(1));

  private readonly canAlertAltitude = MappedSubject.create(
    ([isEnabled, threshold, isAltitudeDataValid, isStdActive]) => isEnabled && threshold >= 0 && isAltitudeDataValid && !isStdActive,
    this.settingManager.getSetting('baroTransitionAlertAltitudeEnabled'),
    this.settingManager.getSetting('baroTransitionAlertAltitudeThreshold'),
    this.isAltitudeDataValid,
    this.baroIsStdActive,
  );
  private readonly canAlertLevel = MappedSubject.create(
    ([isEnabled, threshold, isAltitudeDataValid, isStdActive]) => isEnabled && threshold >= 0 && isAltitudeDataValid && isStdActive,
    this.settingManager.getSetting('baroTransitionAlertLevelEnabled'),
    this.settingManager.getSetting('baroTransitionAlertLevelThreshold'),
    this.isAltitudeDataValid,
    this.baroIsStdActive,
  );

  private readonly altitudeInputs = MappedSubject.create(
    this.settingManager.getSetting('baroTransitionAlertAltitudeThreshold'),
    this.indicatedAltRounded
  );
  private readonly levelInputs = MappedSubject.create(
    this.settingManager.getSetting('baroTransitionAlertLevelThreshold'),
    this.indicatedAltRounded
  );

  private readonly altitudeAlertState = Subject.create(AlertState.Off);
  private readonly altitudeLastActiveAlt = Value.create(0);

  private readonly levelAlertState = Subject.create(AlertState.Off);
  private readonly levelLastActiveAlt = Value.create(0);

  private isAlive = true;
  private isInit = false;
  private isResumed = false;

  private adcIndexSub?: Subscription;

  private altitudeInputsSub?: Subscription;
  private levelInputsSub?: Subscription;

  private altitudeCanAlertSub?: Subscription;
  private levelCanAlertSub?: Subscription;

  /**
   * Creates a new instance of BaroTransitionAlertManager. The manager is created in an uninitialized and paused state.
   * @param bus The event bus.
   * @param settingManager A manager for barometric transition alert user settings.
   * @param options Options with which to configure the manager.
   * @throws Error if `options.id` is the empty string.
   */
  public constructor(
    private readonly bus: EventBus,
    private readonly settingManager: UserSettingManager<BaroTransitionAlertUserSettingTypes>,
    options: Readonly<BaroTransitionAlertManagerOptions>,
  ) {
    if (options.id === '') {
      throw new Error('BaroTransitionAlertManager: ID cannot be the empty string');
    }

    this.id = options.id;

    this.adcIndex = SubscribableUtils.toSubscribable(options.adcIndex, true);
  }

  /**
   * Initializes this manager. Once initialized, the manager will be ready to automatically control the states of its
   * barometric transition alerts.
   * @throws Error if this manager has been destroyed.
   */
  public init(): void {
    if (!this.isAlive) {
      throw new Error('BaroTransitionAlertManager::init(): cannot initialize a dead manager');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    const isAlertActive = (state: AlertState): boolean => state === AlertState.Active || state === AlertState.ActiveLocked;
    this.altitudeAlertState.map(isAlertActive).sub(this.publishEvent.bind(this, `baro_transition_alert_altitude_active_${this.id}`), true);
    this.levelAlertState.map(isAlertActive).sub(this.publishEvent.bind(this, `baro_transition_alert_level_active_${this.id}`), true);

    this.adcIndexSub = this.adcIndex.sub(this.onAdcIndexChanged.bind(this), true);

    this.altitudeInputsSub = this.altitudeInputs.sub(this.updateAlertState.bind(this, this.altitudeAlertState, this.altitudeLastActiveAlt, 1), false, true);
    this.levelInputsSub = this.levelInputs.sub(this.updateAlertState.bind(this, this.levelAlertState, this.levelLastActiveAlt, -1), false, true);

    this.altitudeCanAlertSub = this.canAlertAltitude.sub(this.onCanAlertChanged.bind(this, this.altitudeAlertState, this.altitudeInputsSub), false, true);
    this.levelCanAlertSub = this.canAlertLevel.sub(this.onCanAlertChanged.bind(this, this.levelAlertState, this.levelInputsSub), false, true);
  }

  /**
   * Resets this manager such that its managed alerts are deactivated. This method has no effect if the manager is not
   * initialized.
   * @throws Error if this manager has been destroyed.
   */
  public reset(): void {
    if (!this.isAlive) {
      throw new Error('BaroTransitionAlertManager::reset(): cannot reset a dead manager');
    }

    if (!this.isInit) {
      return;
    }

    if (this.canAlertAltitude.get()) {
      this.altitudeAlertState.set(AlertState.Unarmed);
    }

    if (this.canAlertLevel.get()) {
      this.levelAlertState.set(AlertState.Unarmed);
    }
  }

  /**
   * Resumes this manager. When the manager is resumed, it will automatically control the states of its barometric
   * transition alerts. This method has no effect if the manager is not initialized.
   * @throws Error if this manager has been destroyed.
   */
  public resume(): void {
    if (!this.isAlive) {
      throw new Error('BaroTransitionAlertManager::resume(): cannot resume a dead manager');
    }

    if (!this.isInit || this.isResumed) {
      return;
    }

    this.isAltitudeDataValid.resume();
    this.indicatedAlt.resume();
    this.baroIsStdActive.resume();

    this.canAlertAltitude.resume();
    this.canAlertLevel.resume();

    this.altitudeInputs.resume();
    this.levelInputs.resume();

    this.altitudeCanAlertSub!.resume(true);
    this.levelCanAlertSub!.resume(true);
  }

  /**
   * Pauses this manager. When the manager is paused, it will not change the states of its barometric transition
   * alerts, and the alerts will remain in the state they were in when the manager was paused. This method has no
   * effect if the manager is not initialized.
   * @throws Error if this manager has been destroyed.
   */
  public pause(): void {
    if (!this.isAlive) {
      throw new Error('BaroTransitionAlertManager::pause(): cannot pause a dead manager');
    }

    if (!this.isInit || !this.isResumed) {
      return;
    }

    this.isAltitudeDataValid.pause();
    this.indicatedAlt.pause();
    this.baroIsStdActive.pause();

    this.canAlertAltitude.pause();
    this.canAlertLevel.pause();

    this.altitudeInputs.pause();
    this.levelInputs.pause();

    this.altitudeCanAlertSub!.pause();
    this.levelCanAlertSub!.pause();

    this.altitudeInputsSub!.pause();
    this.levelInputsSub!.pause();
  }

  /**
   * Publishes an event bus topic from `BaroTransitionAlertEvents`.
   * @param topic The topic to publish.
   * @param data The topic data.
   */
  private publishEvent<K extends keyof BaroTransitionAlertEvents>(topic: K, data: BaroTransitionAlertEvents[K]): void {
    this.publisher.pub(topic, data, true, true);
  }

  /**
   * Responds to when the index of the ADC from which this manager sources data changes.
   * @param index The index of the new ADC from which this manager sources data.
   */
  private onAdcIndexChanged(index: number): void {
    const sub = this.bus.getSubscriber<AdcSystemEvents>();

    if (index >= 0) {
      this.isAltitudeDataValid.reset(false, sub.on(`adc_altitude_data_valid_${index}`));
      this.indicatedAlt.reset(0, sub.on(`adc_indicated_alt_${index}`));
      this.baroIsStdActive.reset(false, sub.on(`adc_altimeter_baro_is_std_${index}`));
    } else {
      this.isAltitudeDataValid.reset(false);
      this.indicatedAlt.reset(0);
      this.baroIsStdActive.reset(false);
    }
  }

  /**
   * Responds to when whether one of this manager's alerts can be activated changes.
   * @param alertState The state of the alert.
   * @param inputsSub The subscription that updates the state of the alert when it can be activated.
   * @param canAlert Whether the alert can be activated.
   */
  private onCanAlertChanged(alertState: Subject<AlertState>, inputsSub: Subscription, canAlert: boolean): void {
    if (canAlert) {
      alertState.set(AlertState.Unarmed);
      inputsSub.resume(true);
    } else {
      inputsSub.pause();
      alertState.set(AlertState.Off);
    }
  }

  /**
   * Updates the state of one of this manager's alerts.
   * @param alertState The state of the alert to update.
   * @param lastActiveAlt The altitude threshold, in feet, that triggered the most recent activation of the alert to
   * update.
   * @param direction +1 if the alert is activated while climbing through its altitude threshold, or -1 if the alert is
   * activated while descending through the threshold.
   * @param inputs The input data for the alert state, as
   * `[alert altitude threshold (feet), indicated altitude (feet)]`.
   */
  private updateAlertState(
    alertState: Subject<AlertState>,
    lastActiveAlt: Value<number>,
    direction: 1 | -1,
    inputs: readonly [number, number]
  ): void {
    const threshold = inputs[0];
    const thresholdWithMargin = threshold * direction - BaroTransitionAlertManager.ALTITUDE_MARGIN;
    const altitude = inputs[1] * direction;

    const state = alertState.get();
    switch (state) {
      case AlertState.Active:
        if (threshold === lastActiveAlt.get()) {
          if (altitude < thresholdWithMargin - BaroTransitionAlertManager.ALTITUDE_HYSTERESIS) {
            alertState.set(AlertState.Armed);
          }
          break;
        } else {
          // If the alert is active but the threshold altitude has changed, then lock the alert to the active state
          // until it meets the activation criteria for the new threshold, at which point we revert back to the normal
          // active state.
          alertState.set(AlertState.ActiveLocked);
        }
      // fallthrough
      case AlertState.ActiveLocked:
      case AlertState.Armed:
        if (altitude >= thresholdWithMargin) {
          alertState.set(AlertState.Active);
          lastActiveAlt.set(threshold);
        }
        break;
      default: // Unarmed or Off
        if (altitude < thresholdWithMargin) {
          alertState.set(AlertState.Armed);
        }
    }
  }

  /**
   * Destroys this manager. Destroying the manager stops it from automatically controlling the states of its barometric
   * transition alerts and allows resources used by the manager to be freed.
   */
  public destroy(): void {
    this.isAlive = false;

    this.adcIndexSub?.destroy();

    this.isAltitudeDataValid.destroy();
    this.indicatedAlt.destroy();
    this.baroIsStdActive.destroy();

    this.canAlertAltitude.destroy();
    this.canAlertLevel.destroy();

    this.altitudeInputs.destroy();
    this.levelInputs.destroy();
  }
}
