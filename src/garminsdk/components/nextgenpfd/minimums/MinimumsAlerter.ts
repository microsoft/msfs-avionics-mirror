import {
  AdcEvents, AvionicsSystemState, CombinedSubject, ConsumerSubject, EventBus, MappedSubject, MinimumsEvents, MinimumsMode, Subject, Subscribable,
  SubscribableUtils, Subscription
} from '@microsoft/msfs-sdk';

import { AdcSystemEvents } from '../../../system/AdcSystem';
import { RadarAltimeterSystemEvents } from '../../../system/RadarAltimeterSystem';

/**
 * Minimums alert states.
 */
export enum MinimumsAlertState {
  /** Inhibited. */
  Inhibited = 'Inhibited',

  /** Armed. */
  Armed = 'Armed',

  /** Greater than 100 feet above minimums. */
  Above100 = 'Above100',

  /** Less than or equal to 100 feet above minimums. */
  Within100 = 'Within100',

  /** At or below minimums. */
  AtOrBelow = 'AtOrBelow'
}

/**
 * Maintains a minimums alert state based on the relationship between indicated/radar altitude and the appropriate
 * minimums setting.
 */
export class MinimumsAlerter {
  private readonly _minimumsMode = ConsumerSubject.create(null, MinimumsMode.OFF);
  public readonly minimumsMode = this._minimumsMode as Subscribable<MinimumsMode>;

  private readonly _state = Subject.create(MinimumsAlertState.Inhibited);
  public readonly state = this._state as Subscribable<MinimumsAlertState>;

  private readonly stateChangeQueue: MinimumsAlertState[] = [];
  private isChangingState = false;

  private readonly adcIndex: Subscribable<number>;

  private readonly indicatedAlt = ConsumerSubject.create(null, 0);
  private readonly radarAlt = ConsumerSubject.create(null, 0);

  private readonly baroMinimumsSource = ConsumerSubject.create(null, 0);
  private readonly radarMinimumsSource = ConsumerSubject.create(null, 0);

  private readonly isAdcOperating = Subject.create(true);
  private readonly isRadarAltimeterOperating = Subject.create(true);

  private readonly minimumsDelta = Subject.create<number | null>(null);

  private readonly isOnGround = ConsumerSubject.create(null, false);

  private readonly isAlertInhibited = MappedSubject.create(
    ([minimumsDelta, isOnGround]): boolean => {
      return isOnGround || minimumsDelta === null;
    },
    this._minimumsMode,
    this.isOnGround
  );

  private adcIndexSub?: Subscription;
  private adcSystemStateSub?: Subscription;
  private radarAltSystemStateSub?: Subscription;
  private minimumsDeltaSub?: Subscription;

  private isInit = false;
  private isAlive = true;

  /**
   * Creates an instance of AltitudeAlerter.
   * @param bus The event bus.
   * @param adcIndex The index of the ADC from which this alerter sources indicated altitude data.
   * @param supportRadarMins Whether to support radar minimums.
   */
  constructor(
    private readonly bus: EventBus,
    adcIndex: number | Subscribable<number>,
    private readonly supportRadarMins: boolean
  ) {
    this.adcIndex = SubscribableUtils.toSubscribable(adcIndex, true);
  }

  /**
   * Initializes this alerter. Once initialized, this alerter will continuously update its alert state until destroyed.
   * @throws Error if this alerter is dead.
   */
  public init(): void {
    if (!this.isAlive) {
      throw new Error('MinimumsAlerter: cannot initialize a dead alerter');
    }

    if (this.isInit) {
      return;
    }

    const sub = this.bus.getSubscriber<AdcEvents & AdcSystemEvents & RadarAltimeterSystemEvents & MinimumsEvents>();

    this.adcIndexSub = this.adcIndex.sub(index => {
      this.adcSystemStateSub?.destroy();

      this.adcSystemStateSub = sub.on(`adc_state_${index}`).handle(state => {
        if (state.current === AvionicsSystemState.On) {
          this.isAdcOperating.set(true);
        } else {
          this.isAdcOperating.set(false);
        }
      });

      this.indicatedAlt.setConsumer(sub.on(`adc_indicated_alt_${index}`));
    }, true);

    if (this.supportRadarMins) {
      this.radarAlt.setConsumer(sub.on('radaralt_radio_alt_1'));

      this.radarAltSystemStateSub = sub.on('radaralt_state_1').handle(state => {
        if (state.current === AvionicsSystemState.On) {
          this.isRadarAltimeterOperating.set(true);
        } else {
          this.isRadarAltimeterOperating.set(false);
        }
      });
    }

    this._minimumsMode.setConsumer(sub.on('minimums_mode'));
    this.baroMinimumsSource.setConsumer(sub.on('decision_altitude_feet'));
    this.radarMinimumsSource.setConsumer(sub.on('decision_height_feet'));

    const baroMinimumsState = CombinedSubject.create(
      this.indicatedAlt,
      this.baroMinimumsSource,
      this.isAdcOperating
    );

    const baroMinimumsSub = baroMinimumsState.sub(([indicatedAlt, baroMinimumsSource, isAdcOperating]) => {
      if (isAdcOperating) {
        this.minimumsDelta.set(indicatedAlt - baroMinimumsSource);
      } else {
        this.minimumsDelta.set(null);
      }
    }, false, true);

    const radarMinimumsState = CombinedSubject.create(
      this.radarAlt,
      this.radarMinimumsSource,
      this.isRadarAltimeterOperating
    );

    const radarMinimumsSub = radarMinimumsState.sub(([radarAlt, radarMinimumsSource, isRadarAltimeterOperating]) => {
      if (isRadarAltimeterOperating) {
        this.minimumsDelta.set(radarAlt - radarMinimumsSource);
      } else {
        this.minimumsDelta.set(null);
      }
    }, false, true);

    this._minimumsMode.sub(mode => {
      baroMinimumsSub.pause();
      radarMinimumsSub.pause();

      switch (mode) {
        case MinimumsMode.BARO:
          baroMinimumsSub.resume(true);
          break;
        case MinimumsMode.RA:
          if (this.supportRadarMins) {
            radarMinimumsSub.resume(true);
            break;
          }
        // eslint-disable-next-line no-fallthrough
        default:
          this.minimumsDelta.set(null);
      }
    }, true);

    this.isOnGround.setConsumer(sub.on('on_ground'));

    this.isAlertInhibited.sub(isInhibited => {
      if (isInhibited) {
        this.changeState(MinimumsAlertState.Inhibited);
      } else {
        this.changeState(MinimumsAlertState.Armed);
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
  private changeState(state: MinimumsAlertState): void {
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
  private processStateChange(state: MinimumsAlertState): void {
    const currentState = this._state.get();

    if (currentState === state) {
      this.dequeueStateChange();
      return;
    }

    if (state !== MinimumsAlertState.Inhibited && this.isAlertInhibited.get()) {
      this.dequeueStateChange();
      return;
    }

    this.isChangingState = true;

    this.minimumsDeltaSub?.destroy();
    this.minimumsDeltaSub = undefined;

    this.stateChangeQueue.length = 0;
    this._state.set(state);

    switch (state) {
      case MinimumsAlertState.Armed:
        this.minimumsDeltaSub = this.minimumsDelta.sub(delta => {
          if (delta !== null && delta > 150) {
            this.changeState(MinimumsAlertState.Above100);
          }
        }, true);
        break;

      case MinimumsAlertState.Above100:
        this.minimumsDeltaSub = this.minimumsDelta.sub(delta => {
          if (delta !== null && delta <= 100) {
            this.changeState(MinimumsAlertState.Within100);
          }
        }, true);
        break;

      case MinimumsAlertState.Within100:
        this.minimumsDeltaSub = this.minimumsDelta.sub(delta => {
          if (delta === null) {
            return;
          }

          if (delta > 150) {
            this.changeState(MinimumsAlertState.Above100);
          } else if (delta <= 0) {
            this.changeState(MinimumsAlertState.AtOrBelow);
          }
        }, true);
        break;

      case MinimumsAlertState.AtOrBelow:
        this.minimumsDeltaSub = this.minimumsDelta.sub(delta => {
          if (delta !== null && delta > 50) {
            this.changeState(MinimumsAlertState.Within100);
          }
        }, true);
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

    this.indicatedAlt.destroy();
    this.radarAlt.destroy();

    this._minimumsMode.destroy();
    this.baroMinimumsSource.destroy();
    this.radarMinimumsSource.destroy();

    this.isOnGround.destroy();

    this.adcIndexSub?.destroy();
    this.adcSystemStateSub?.destroy();
    this.radarAltSystemStateSub?.destroy();
  }
}