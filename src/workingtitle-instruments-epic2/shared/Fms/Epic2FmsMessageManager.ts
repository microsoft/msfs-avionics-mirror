import {
  AdcEvents, APEvents, ConsumerSubject, DebounceTimer, EngineEvents, EventBus, GameStateProvider, Instrument, LNavDataEvents, MappedSubject,
  SimpleMovingAverage, Subject, Subscribable, Wait
} from '@microsoft/msfs-sdk';

import { FmsMessageKey, FmsMessageTransmitter } from '../FmsMessageSystem';
import { FuelTotalizerEvents } from '../Fuel';
import { AirGroundDataProvider, AltitudeDataProvider } from '../Instruments';
import { Epic2PerformancePlan } from '../Performance';
import { FmsPositionSystemEvents } from '../Systems';

/**
 * Manager for FMS fuel messages
 */
export class FmsMessageManager implements Instrument {
  private static readonly MESSAGE_DEBOUNCE_DELAY_MS = 500;
  private static readonly UNABLE_RNP_HYSTERESIS_NM = 0.02;

  private readonly sub = this.bus.getSubscriber<FuelTotalizerEvents & EngineEvents & AdcEvents>();
  private readonly fmsMessageTransmitter = new FmsMessageTransmitter(this.bus);

  private readonly vsFilter = new SimpleMovingAverage(20);

  private readonly isOnGround = Subject.create(true);

  /** Fuel Variables */

  private readonly acftFuelWeight = ConsumerSubject.create(this.sub.on('fuel_total_weight'), 0);
  private readonly fmsFuelWeight = ConsumerSubject.create(this.sub.on('fuel_totalizer_remaining'), 0);
  private readonly isFmsFuelWeightIncorrect = MappedSubject.create(
    ([acftFuelWeight, fmsFuelWeight, onGround]) => !onGround && Math.abs(acftFuelWeight - fmsFuelWeight) > 50,
    this.acftFuelWeight, this.fmsFuelWeight, this.isOnGround
  );

  /** Position Variables */

  private readonly preselectAltitude = ConsumerSubject.create(this.bus.getSubscriber<APEvents>().on('ap_altitude_selected'), 0);
  private readonly cruiseAltitude = this.perfPlan.cruiseAltitude;

  private readonly isCruiseLessThanPresel = MappedSubject.create(
    ([preselAlt, cruiseAlt]) => cruiseAlt !== null && cruiseAlt < preselAlt,
    this.preselectAltitude, this.cruiseAltitude
  );

  private readonly isBaroIncorrect = Subject.create(false);

  /** GPS Variables */

  private readonly epu = ConsumerSubject.create(this.bus.getSubscriber<FmsPositionSystemEvents>().on('fms_pos_epu_1'), 0);
  private readonly rnp = ConsumerSubject.create(this.bus.getSubscriber<LNavDataEvents>().on('lnavdata_cdi_scale'), 0);

  private readonly isGpsDegraded = MappedSubject.create<[number, number], boolean>(
    ([epu, rnp], wasDegraded) => (wasDegraded ? epu + FmsMessageManager.UNABLE_RNP_HYSTERESIS_NM : epu) > rnp,
    this.epu,
    this.rnp,
  );

  /** @inheritdoc */
  constructor (
    private readonly bus: EventBus,
    private readonly perfPlan: Epic2PerformancePlan,
    private readonly airGroundDataProvider: AirGroundDataProvider,
    private readonly altitudeDataProvider: AltitudeDataProvider,
  ) {}

  /** @inheritdoc */
  public init(): void {
    this.airGroundDataProvider.isOnGround.pipe(this.isOnGround);

    // delay the messages until everything has a chance to setup, to avoid spurious message on spawn
    Wait.awaitSubscribable(GameStateProvider.get(), s => s === GameState.ingame, true).then(() => {
      Wait.awaitFrames(5).then(() => {
        this.setupFuelMessages();
        this.setupGpsMessages();
        this.setupPositionMessages();
      });
    });
  }

  /** @inheritdoc */
  public onUpdate(): void {
    this.updateBaroSetting();
  }

  /**
   * Updates the baro setting check.
   */
  private updateBaroSetting(): void {
    const vs = this.altitudeDataProvider.verticalSpeed.get();
    const averageVs = vs !== null ? this.vsFilter.getAverage(vs) : null;
    if (vs === null) {
      this.vsFilter.reset();
    }

    if (this.altitudeDataProvider.isInStdMode.get()) {
      const pressureAlt = this.altitudeDataProvider.pressureAltitude.get();
      const transLevel = this.perfPlan.transitionLevel.get();
      if (pressureAlt === null) {
        this.isBaroIncorrect.set(false);
        return;
      }

      const altBelowTransLevel = transLevel - pressureAlt;
      const isLatched = this.isBaroIncorrect.get() && altBelowTransLevel > 250;
      this.isBaroIncorrect.set(isLatched || altBelowTransLevel > 1000 || (altBelowTransLevel > 250 && averageVs !== null && Math.abs(averageVs) < 150));
    } else {
      const alt = this.altitudeDataProvider.altitude.get();
      const transAlt = this.perfPlan.transitionAltitude.get();
      if (alt === null) {
        this.isBaroIncorrect.set(false);
        return;
      }

      const altAboveTransAlt = alt - transAlt;
      const isLatched = this.isBaroIncorrect.get() && altAboveTransAlt > 250;
      this.isBaroIncorrect.set(isLatched || altAboveTransAlt > 1000 || (altAboveTransAlt > 250 && averageVs !== null && Math.abs(averageVs) < 150));
    }
  }

  /** Handles fuel related messages */
  private setupFuelMessages(): void {
    this.setupMessage(FmsMessageKey.CompareFuelQty, this.isFmsFuelWeightIncorrect);
  }

  /** Handles position related messages */
  private setupPositionMessages(): void {
    this.setupMessage(FmsMessageKey.ResetAltSel, this.isCruiseLessThanPresel);
    this.setupMessage(FmsMessageKey.CheckBaroSet, this.isBaroIncorrect);
  }

  /** Handles GPS related messages */
  private setupGpsMessages(): void {
    this.setupMessage(FmsMessageKey.UnableRnp, this.isGpsDegraded);
  }

  /**
   * Sets up a message to be transmitted, and automatically cleared.
   * @param key The message key to send.
   * @param condition The condition to activate the message.
   */
  private setupMessage(key: FmsMessageKey, condition: Subscribable<boolean>): void {
    const timer = new DebounceTimer();
    condition.sub(
      (sendMessage) => {
        if (sendMessage) {
          timer.schedule(() => this.fmsMessageTransmitter.sendMessage(key), FmsMessageManager.MESSAGE_DEBOUNCE_DELAY_MS);
        } else {
          timer.schedule(() => this.fmsMessageTransmitter.clearMessage(key), FmsMessageManager.MESSAGE_DEBOUNCE_DELAY_MS);
        }
    });
  }
}
