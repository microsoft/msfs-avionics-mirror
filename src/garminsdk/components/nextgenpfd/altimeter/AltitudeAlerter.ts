import {
  AdcEvents, AltitudeSelectEvents, APEvents, ApproachGuidanceMode, ConsumerSubject, DebounceTimer, EventBus, MappedSubject, Subject, Subscribable,
  SubscribableUtils, Subscription, VNavEvents
} from '@microsoft/msfs-sdk';

import { AdcSystemEvents } from '../../../system/AdcSystem';

/**
 * Events used to control altitude alerters.
 */
export interface AltitudeAlerterControlEvents {
  /** Resets an alerter's state to Disabled. */
  [alt_alert_disable: `alt_alert_disable_${number}`]: void;
}

/**
 * Altitude alert states.
 */
export enum AltitudeAlertState {
  /** Disabled. */
  Disabled = 'Disabled',
  /** Inhibited. */
  Inhibited = 'Inhibited',
  /** Armed and outside of 1000 feet of selected altitude prior to capture. */
  Armed = 'Armed',
  /** Within 1000 feet of selected altitude prior to capture. */
  Within1000 = 'Within1000',
  /** Within 200 feet of selected altitude prior to capture. */
  Within200 = 'Within200',
  /** Captured the selected altitude. */
  Captured = 'Captured',
  /** Deviation from captured altitude is greater than 200 feet. */
  Deviation = 'Deviation'
}

/**
 * Maintains an altitude alert state based on the relationship between indicated altitude and selected altitude.
 */
export class AltitudeAlerter {
  private static readonly SELECTED_ALT_CHANGE_INHIBIT_DURATION = 3000; // milliseconds

  private readonly _state = Subject.create(AltitudeAlertState.Disabled);
  public readonly state = this._state as Subscribable<AltitudeAlertState>;

  private readonly stateChangeQueue: AltitudeAlertState[] = [];
  private isChangingState = false;

  private readonly adcIndex: Subscribable<number>;

  private readonly indicatedAlt = ConsumerSubject.create(null, 0);

  private readonly selectedAltSource = ConsumerSubject.create(null, 0);
  private readonly selectedAltIsInit = ConsumerSubject.create(null, false);
  private readonly selectedAlt = MappedSubject.create(
    ([selectedAlt, isInit]): number | null => {
      return isInit ? selectedAlt : null;
    },
    this.selectedAltSource,
    this.selectedAltIsInit
  );

  private readonly isOnGround = ConsumerSubject.create(null, false);
  private readonly gpApproachMode = ConsumerSubject.create(null, ApproachGuidanceMode.None);

  private readonly isGsGpActive = Subject.create(false);

  private readonly isAlertInhibited = MappedSubject.create(
    ([isOnGround, isGsGpActive, selectedAltIsInit]): boolean => {
      return isOnGround || isGsGpActive || !selectedAltIsInit;
    },
    this.isOnGround,
    this.isGsGpActive,
    this.selectedAltIsInit
  );

  private targetAltitude = NaN;

  private readonly inhibitTimer = new DebounceTimer();

  private adcIndexSub?: Subscription;
  private apLockSub?: Subscription;
  private disableSub?: Subscription;
  private selectedAltSub?: Subscription;
  private indicatedAltSub?: Subscription;

  private isInit = false;
  private isAlive = true;

  /**
   * Creates an instance of AltitudeAlerter.
   * @param index The index of this alerter.
   * @param bus The event bus.
   * @param adcIndex The index of the ADC from which this alerter sources indicated altitude data.
   */
  constructor(public readonly index: number, private readonly bus: EventBus, adcIndex: number | Subscribable<number>) {
    this.adcIndex = SubscribableUtils.toSubscribable(adcIndex, true);
  }

  /**
   * Initializes this alerter. Once initialized, this alerter will continuously update its alert state until destroyed.
   * @throws Error if this alerter is dead.
   */
  public init(): void {
    if (!this.isAlive) {
      throw new Error('AltitudeAlerter: cannot initialize a dead alerter');
    }

    if (this.isInit) {
      return;
    }

    const sub = this.bus.getSubscriber<AdcEvents & AdcSystemEvents & APEvents & VNavEvents & AltitudeSelectEvents & AltitudeAlerterControlEvents>();

    this.adcIndexSub = this.adcIndex.sub(index => {
      this.indicatedAlt.setConsumer(sub.on(`adc_indicated_alt_${index}`));
    }, true);

    this.selectedAltSource.setConsumer(sub.on('ap_altitude_selected'));
    this.selectedAltIsInit.setConsumer(sub.on('alt_select_is_initialized'));

    this.isOnGround.setConsumer(sub.on('on_ground'));
    this.gpApproachMode.setConsumer(sub.on('gp_approach_mode'));

    this.gpApproachMode.sub(mode => {
      switch (mode) {
        case ApproachGuidanceMode.GSActive:
        case ApproachGuidanceMode.GPActive:
          this.isGsGpActive.set(true);
          break;
        default:
          this.isGsGpActive.set(false);
      }
    }, true);

    this.disableSub = sub.on(`alt_alert_disable_${this.index}`).handle(() => {
      this.changeState(AltitudeAlertState.Disabled);
    });

    this.selectedAltSub = this.selectedAlt.sub(selectedAlt => {
      if (selectedAlt !== null && selectedAlt !== this.targetAltitude) {
        this.changeState(AltitudeAlertState.Inhibited);

        this.inhibitTimer.schedule(() => {
          this.changeState(AltitudeAlertState.Armed);
        }, AltitudeAlerter.SELECTED_ALT_CHANGE_INHIBIT_DURATION);
      }
    }, false, true);

    this.isAlertInhibited.sub(isInhibited => {
      if (isInhibited) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.selectedAltSub!.pause();
        this.inhibitTimer.clear();
        this.changeState(AltitudeAlertState.Inhibited);
      } else {
        this.changeState(AltitudeAlertState.Disabled);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.selectedAltSub!.resume(true);
      }
    }, true);
  }

  /**
   * Requests a change in the state of this alerter. If no state change is currently in progress, the request will be
   * processed immediately. If a state change is currently in progress, the request will be queued and processed after
   * all pending state change requests are processed if no state change other than the one currently in progress is
   * carried out.
   * @param state The alert state to which to change.
   */
  private changeState(state: AltitudeAlertState): void {
    if (this.isChangingState) {
      this.stateChangeQueue.push(state);
    } else {
      this.processStateChange(state);
    }
  }

  /**
   * Processes a state change request.
   * @param state The alert state to which to change.
   */
  private processStateChange(state: AltitudeAlertState): void {
    const currentState = this._state.get();

    if (currentState === state) {
      this.dequeueStateChange();
      return;
    }

    if (state !== AltitudeAlertState.Inhibited && this.isAlertInhibited.get()) {
      this.dequeueStateChange();
      return;
    }

    this.isChangingState = true;

    if (state === AltitudeAlertState.Armed) {
      this.targetAltitude = this.selectedAlt.get() as number;

      // If attempting to arm, check if we can directly enter one of the less deviated states
      const delta = Math.abs(this.targetAltitude - this.indicatedAlt.get());
      if (delta < 150) {
        state = AltitudeAlertState.Captured;
      } else if (delta < 200) {
        state = AltitudeAlertState.Within200;
      } else if (delta < 1000) {
        state = AltitudeAlertState.Within1000;
      }
    }

    this.indicatedAltSub?.destroy();
    this.indicatedAltSub = undefined;

    this.stateChangeQueue.length = 0;
    this._state.set(state);

    switch (state) {
      case AltitudeAlertState.Armed:
        this.indicatedAltSub = this.indicatedAlt.sub(indicatedAlt => {
          const delta = Math.abs(this.targetAltitude - indicatedAlt);
          if (delta < 200) {
            this.changeState(AltitudeAlertState.Within200);
          } else if (delta < 1000) {
            this.changeState(AltitudeAlertState.Within1000);
          }
        }, false, true);
        this.indicatedAltSub.resume(true);
        break;

      case AltitudeAlertState.Within1000:
        this.indicatedAltSub = this.indicatedAlt.sub(indicatedAlt => {
          const delta = Math.abs(this.targetAltitude - indicatedAlt);
          if (delta < 200) {
            this.changeState(AltitudeAlertState.Within200);
          }
        }, false, true);
        this.indicatedAltSub.resume(true);
        break;

      case AltitudeAlertState.Within200:
        this.indicatedAltSub = this.indicatedAlt.sub(indicatedAlt => {
          const delta = Math.abs(this.targetAltitude - indicatedAlt);
          if (delta < 150) {
            this.changeState(AltitudeAlertState.Captured);
          } else if (delta > 250) {
            this.changeState(AltitudeAlertState.Deviation);
          }
        }, false, true);
        this.indicatedAltSub.resume(true);
        break;

      case AltitudeAlertState.Captured:
        this.indicatedAltSub = this.indicatedAlt.sub(indicatedAlt => {
          const delta = Math.abs(this.targetAltitude - indicatedAlt);
          if (delta > 200) {
            this.changeState(AltitudeAlertState.Deviation);
          }
        }, false, true);

        this.indicatedAltSub.resume(true);
        break;

      case AltitudeAlertState.Deviation:
        this.indicatedAltSub = this.indicatedAlt.sub(indicatedAlt => {
          const delta = Math.abs(this.targetAltitude - indicatedAlt);
          if (delta < 150) {
            this.changeState(AltitudeAlertState.Captured);
          }
        }, false, true);

        this.indicatedAltSub.resume(true);
        break;
    }

    this.isChangingState = false;
    this.dequeueStateChange();
  }

  /**
   * Processes the next state change request in the queue, if one exists.
   */
  private dequeueStateChange(): void {
    const state = this.stateChangeQueue.shift();

    if (state !== undefined) {
      this.processStateChange(state);
    }
  }

  /**
   * Destroys this alerter. Once destroyed, this alerter will no longer update its alert state.
   */
  public destroy(): void {
    this.isAlive = false;

    this.inhibitTimer.clear();

    this.indicatedAlt.destroy();

    this.selectedAltSource.destroy();
    this.selectedAltIsInit.destroy();

    this.isOnGround.destroy();
    this.gpApproachMode.destroy();

    this.adcIndexSub?.destroy();
    this.apLockSub?.destroy();
    this.disableSub?.destroy();
  }
}