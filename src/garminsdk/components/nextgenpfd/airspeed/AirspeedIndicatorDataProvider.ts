import {
  AdcEvents, APEvents, BitFlags, ClockEvents, ConsumerSubject, EventBus, ExpSmoother, MappedSubject, MappedSubscribable, Subject, Subscribable,
  SubscribableUtils, Subscription
} from 'msfssdk';

import { AdcSystemEvents } from '../../../system/AdcSystem';
import { AirspeedDefinitionFactory } from './AirspeedDefinitionFactory';

/**
 * Types of airspeed alerts.
 */
export enum AirspeedAlert {
  None = 0,
  Overspeed = 1 << 0,
  TrendOverspeed = 1 << 1,
  Underspeed = 1 << 2,
  TrendUnderspeed = 1 << 3
}

/**
 * A data provider for an airspeed indicator.
 */
export interface AirspeedIndicatorDataProvider {
  /** The current indicated airspeed, in knots. */
  readonly iasKnots: Subscribable<number>;

  /** The current true airspeed, in knots. */
  readonly tasKnots: Subscribable<number>;

  /** The current mach number. */
  readonly mach: Subscribable<number>;

  /** The current conversion factor from mach number to knots indicated airspeed. */
  readonly machToKias: Subscribable<number>;

  /** The current pressure altitude, in feet. */
  readonly pressureAlt: Subscribable<number>;

  /** The current airspeed trend, in knots. */
  readonly iasTrend: Subscribable<number>;

  /** The current reference indicated airspeed, or `null` if no such value exists. */
  readonly referenceIas: Subscribable<number | null>;

  /** The current reference mach number, or `null` if no such value exists. */
  readonly referenceMach: Subscribable<number | null>;

  /** Whether an airspeed hold mode is active on the flight director. */
  readonly isAirspeedHoldActive: Subscribable<boolean>;

  /** The current active airspeed alerts, as bitflags. */
  readonly airspeedAlerts: Subscribable<number>;

  /** Whether autopilot overspeed protection is active. */
  readonly isOverspeedProtectionActive: Subscribable<boolean>;

  /** Whether autopilot underspeed protection is active. */
  readonly isUnderspeedProtectionActive: Subscribable<boolean>;
}

/**
 * Configuration options for {@link AirspeedIndicatorDataProvider}.
 */
export type AirspeedIndicatorDataProviderOptions = {
  /** The lookahead time for the airspeed trend, in seconds. */
  trendLookahead: number | Subscribable<number>;

  /** A factory which generates the overspeed threshold in knots. */
  overspeedThreshold: AirspeedDefinitionFactory;

  /** A factory which generates the underspeed threshold in knots. */
  underspeedThreshold: AirspeedDefinitionFactory;
};

/**
 * A default implementation of {@link AirspeedIndicatorDataProvider}.
 */
export class DefaultAirspeedIndicatorDataProvider implements AirspeedIndicatorDataProvider {
  private readonly _iasKnots = ConsumerSubject.create(null, 0);
  /** @inheritdoc */
  public readonly iasKnots = this._iasKnots as Subscribable<number>;

  private readonly _tasKnots = ConsumerSubject.create(null, 0);
  /** @inheritdoc */
  public readonly tasKnots = this._tasKnots as Subscribable<number>;

  private readonly _mach = ConsumerSubject.create(null, 0);
  /** @inheritdoc */
  public readonly mach = this._mach as Subscribable<number>;

  private readonly _machToKias = ConsumerSubject.create(null, 0);
  /** @inheritdoc */
  public readonly machToKias = this._machToKias as Subscribable<number>;

  private readonly _pressureAlt = ConsumerSubject.create(null, 0);
  /** @inheritdoc */
  public readonly pressureAlt = this._pressureAlt as Subscribable<number>;

  private readonly _iasTrend = Subject.create(0);
  /** @inheritdoc */
  public readonly iasTrend = this._iasTrend as Subscribable<number>;

  private readonly _referenceIas = Subject.create<number | null>(0);
  /** @inheritdoc */
  public readonly referenceIas = this._referenceIas as Subscribable<number | null>;

  private readonly _referenceMach = Subject.create<number | null>(0);
  /** @inheritdoc */
  public readonly referenceMach = this._referenceMach as Subscribable<number | null>;

  private readonly _isAirspeedHoldActive: MappedSubscribable<boolean>;
  /** @inheritdoc */
  public readonly isAirspeedHoldActive: Subscribable<boolean>;

  private readonly _airspeedAlerts = Subject.create(0);
  /** @inheritdoc */
  public readonly airspeedAlerts = this._airspeedAlerts as Subscribable<number>;

  private readonly _isOverspeedProtectionActive = Subject.create(false);
  /** @inheritdoc */
  public readonly isOverspeedProtectionActive = this._isOverspeedProtectionActive as Subscribable<boolean>;

  private readonly _isUnderspeedProtectionActive = Subject.create(false);
  /** @inheritdoc */
  public readonly isUnderspeedProtectionActive = this._isUnderspeedProtectionActive as Subscribable<boolean>;

  private readonly adcIndex: Subscribable<number>;

  private readonly simTime = ConsumerSubject.create(null, 0);
  private readonly isOnGround = ConsumerSubject.create(null, false);

  private readonly referenceIasSource = ConsumerSubject.create(null, 0);
  private readonly referenceMachSource = ConsumerSubject.create(null, 0);
  private readonly isReferenceInMach = ConsumerSubject.create(null, false);

  private readonly referenceIasPipe = this.referenceIasSource.pipe(this._referenceIas, true);
  private readonly referenceMachPipe = this.referenceMachSource.pipe(this._referenceMach, true);

  private readonly isFlcActive = ConsumerSubject.create(null, false);

  private readonly trendLookahead: Subscribable<number>;
  private readonly iasTrendSmoother = new ExpSmoother(2000 / Math.LN2);
  private lastTrendKnots: number | undefined = undefined;
  private lastTrendTime = 0;

  private readonly overspeedThreshold: Subscribable<number>;
  private readonly underspeedThreshold: Subscribable<number>;

  private readonly isOverspeed: MappedSubscribable<boolean>;
  private readonly isTrendOverspeed: MappedSubscribable<boolean>;
  private readonly isUnderspeed: MappedSubscribable<boolean>;
  private readonly isTrendUnderspeed: MappedSubscribable<boolean>;

  private isInit = false;
  private isAlive = true;
  private isPaused = false;

  private adcIndexSub?: Subscription;
  private trendLookaheadSub?: Subscription;

  /**
   * Constructor.
   * @param bus The event bus.
   * @param adcIndex The index of the ADC that is the source of this provider's data.
   * @param options Configuration options for this provider.
   */
  constructor(
    private readonly bus: EventBus,
    adcIndex: number | Subscribable<number>,
    options: Readonly<AirspeedIndicatorDataProviderOptions>,
  ) {
    this.adcIndex = SubscribableUtils.toSubscribable(adcIndex, true);

    this.trendLookahead = SubscribableUtils.toSubscribable(options.trendLookahead, true);
    this.overspeedThreshold = SubscribableUtils.toSubscribable(options.overspeedThreshold(this), true);
    this.underspeedThreshold = SubscribableUtils.toSubscribable(options.underspeedThreshold(this), true);

    // TODO: Add handling for auto-throttle
    this._isAirspeedHoldActive = MappedSubject.create(
      ([isFlcActive]): boolean => isFlcActive,
      this.isFlcActive
    );
    this.isAirspeedHoldActive = this._isAirspeedHoldActive;

    this.isOverspeed = MappedSubject.create(
      ([iasKnots, threshold]): boolean => iasKnots >= threshold,
      this._iasKnots,
      this.overspeedThreshold
    );

    this.isTrendOverspeed = MappedSubject.create(
      ([iasKnots, iasTrend, threshold]): boolean => iasKnots + iasTrend >= threshold,
      this._iasKnots,
      this._iasTrend,
      this.overspeedThreshold
    );

    this.isUnderspeed = MappedSubject.create(
      ([iasKnots, threshold, isOnGround]): boolean => !isOnGround && iasKnots <= threshold,
      this._iasKnots,
      this.underspeedThreshold,
      this.isOnGround
    );

    this.isTrendUnderspeed = MappedSubject.create(
      ([iasKnots, iasTrend, threshold, isOnGround]): boolean => !isOnGround && iasKnots + iasTrend <= threshold,
      this._iasKnots,
      this._iasTrend,
      this.underspeedThreshold,
      this.isOnGround
    );
  }

  /**
   * Initializes this data provider. Once initialized
   * @param paused Whether to initialize this data provider as paused. If `true`, this data provider will provide an
   * initial set of data but will not update the provided data until it is resumed. Defaults to `false`.
   * @throws Error if this data provider is dead.
   */
  public init(paused = false): void {
    if (!this.isAlive) {
      throw new Error('DefaultAirspeedIndicatorDataProvider: cannot initialize a dead provider');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;
    this.isPaused = paused;

    const sub = this.bus.getSubscriber<AdcEvents & AdcSystemEvents & ClockEvents & APEvents>();

    this.simTime.setConsumer(sub.on('simTime'));
    this.isOnGround.setConsumer(sub.on('on_ground'));

    this.adcIndexSub = this.adcIndex.sub(index => {
      this._iasKnots.setConsumer(sub.on(`adc_ias_${index}`));
      this._tasKnots.setConsumer(sub.on(`adc_tas_${index}`));
      this._mach.setConsumer(sub.on(`adc_mach_number_${index}`));
      this._machToKias.setConsumer(sub.on(`adc_mach_to_kias_factor_${index}`));
      this._pressureAlt.setConsumer(sub.on(`adc_pressure_alt_${index}`));
    }, true);

    this.referenceIasSource.setConsumer(sub.on('ap_ias_selected'));
    this.referenceMachSource.setConsumer(sub.on('ap_mach_selected'));
    this.isReferenceInMach.setConsumer(sub.on('ap_selected_speed_is_mach'));

    this.isFlcActive.setConsumer(sub.on('ap_flc_hold'));

    if (paused) {
      this.pause();
    }

    this.trendLookaheadSub = this.trendLookahead.sub(() => {
      this._iasTrend.set(0);
      this.iasTrendSmoother.reset();
    });

    this.simTime.sub(simTime => {
      const dt = simTime - this.lastTrendTime;
      const iasKnots = this.iasKnots.get();
      const oldKnots = this.lastTrendKnots;

      this.lastTrendKnots = iasKnots;
      this.lastTrendTime = simTime;

      let trend: number;

      if (dt < 0) {
        trend = 0;
        this.iasTrendSmoother.reset();
      } else if (dt > 0) {
        if (oldKnots === undefined) {
          trend = 0;
          this.iasTrendSmoother.reset();
        } else {
          trend = this.iasTrendSmoother.next((iasKnots - oldKnots) / dt * 1000 * this.trendLookahead.get(), dt);
        }
      } else {
        trend = this.iasTrendSmoother.last() ?? 0;
      }

      this._iasTrend.set(trend);
    }, true);

    this.isReferenceInMach.sub(isReferenceInMach => {
      if (isReferenceInMach) {
        this.referenceIasPipe.pause();
        this._referenceIas.set(null);
        this.referenceMachPipe.resume(true);
      } else {
        this.referenceMachPipe.pause();
        this._referenceMach.set(null);
        this.referenceIasPipe.resume(true);
      }
    }, true);

    this.isOverspeed.sub(isOverspeed => {
      const alerts = this._airspeedAlerts.get();
      this._airspeedAlerts.set(BitFlags.set(alerts, isOverspeed ? AirspeedAlert.Overspeed : AirspeedAlert.None, AirspeedAlert.Overspeed));
    }, true);
    this.isTrendOverspeed.sub(isTrendOverspeed => {
      const alerts = this._airspeedAlerts.get();
      this._airspeedAlerts.set(BitFlags.set(alerts, isTrendOverspeed ? AirspeedAlert.TrendOverspeed : AirspeedAlert.None, AirspeedAlert.TrendOverspeed));
    }, true);
    this.isUnderspeed.sub(isUnderspeed => {
      const alerts = this._airspeedAlerts.get();
      this._airspeedAlerts.set(BitFlags.set(alerts, isUnderspeed ? AirspeedAlert.Underspeed : AirspeedAlert.None, AirspeedAlert.Underspeed));
    }, true);
    this.isTrendUnderspeed.sub(isTrendUnderspeed => {
      const alerts = this._airspeedAlerts.get();
      this._airspeedAlerts.set(BitFlags.set(alerts, isTrendUnderspeed ? AirspeedAlert.TrendUnderspeed : AirspeedAlert.None, AirspeedAlert.TrendUnderspeed));
    }, true);
  }

  /**
   * Resumes this data provider. Once resumed, this data provider will continuously update its data until paused or
   * destroyed.
   * @throws Error if this data provider is dead.
   */
  public resume(): void {
    if (!this.isAlive) {
      throw new Error('DefaultAirspeedIndicatorDataProvider: cannot resume a dead provider');
    }

    if (!this.isPaused) {
      return;
    }

    this.isPaused = false;

    this.simTime.resume();
    this.isOnGround.resume();

    this._iasKnots.resume();
    this._tasKnots.resume();
    this._mach.resume();
    this._machToKias.resume();
    this._pressureAlt.resume();

    this.referenceIasSource.resume();
    this.referenceMachSource.resume();
    this.isReferenceInMach.resume();

    this.isFlcActive.resume();

    this.isOverspeed.resume();
    this.isTrendOverspeed.resume();
    this.isUnderspeed.resume();
    this.isTrendUnderspeed.resume();
  }

  /**
   * Pauses this data provider. Once paused, this data provider will not update its data until it is resumed.
   * @throws Error if this data provider is dead.
   */
  public pause(): void {
    if (!this.isAlive) {
      throw new Error('DefaultAirspeedIndicatorDataProvider: cannot pause a dead provider');
    }

    if (this.isPaused) {
      return;
    }

    this.simTime.pause();
    this.isOnGround.pause();

    this._iasKnots.pause();
    this._tasKnots.pause();
    this._mach.pause();
    this._machToKias.pause();
    this._pressureAlt.pause();

    this.referenceIasSource.pause();
    this.referenceMachSource.pause();
    this.isReferenceInMach.pause();

    this.isFlcActive.pause();

    this.isOverspeed.pause();
    this.isTrendOverspeed.pause();
    this.isUnderspeed.pause();
    this.isTrendUnderspeed.pause();

    this.lastTrendKnots = undefined;

    this.isPaused = true;
  }

  /**
   * Destroys this data provider. Once destroyed, this data provider will no longer update its provided data, and can
   * no longer be paused or resumed.
   */
  public destroy(): void {
    this.isAlive = false;

    this.simTime.destroy();
    this.isOnGround.destroy();

    this._iasKnots.destroy();
    this._tasKnots.destroy();
    this._mach.destroy();
    this._machToKias.destroy();
    this._pressureAlt.destroy();

    this.referenceIasSource.destroy();
    this.referenceMachSource.destroy();
    this.isReferenceInMach.destroy();

    this.isFlcActive.destroy();

    this.isOverspeed.destroy();
    this.isTrendOverspeed.destroy();
    this.isUnderspeed.destroy();
    this.isTrendUnderspeed.destroy();

    this.adcIndexSub?.destroy();
    this.trendLookaheadSub?.destroy();
  }
}