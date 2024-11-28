import {
  AdcEvents, APEvents, BitFlags, ClockEvents, ConsumerSubject, EventBus, ExpSmoother, Lookahead, MappedSubject,
  MappedSubscribable, Subject, Subscribable, SubscribableMapFunctions, SubscribableUtils, Subscription
} from '@microsoft/msfs-sdk';

import { AdcSystemEvents } from '../../../system/AdcSystem';
import { AirspeedAoaDataProvider } from './AirspeedAoaDataProvider';
import { AirspeedDefinition } from './AirspeedDefinition';
import { AirspeedDefinitionFactory } from './AirspeedDefinitionFactory';
import { AirspeedAlert, AirspeedIndicatorDataProvider } from './AirspeedIndicatorDataProvider';

/**
 * Configuration options for {@link AirspeedIndicatorDataProvider}.
 */
export type AirspeedIndicatorDataProviderOptions = {
  /**
   * Whether airspeed hold is active. If not defined, airspeed hold is considered active if and only if the flight
   * director is in FLC mode.
   */
  isAirspeedHoldActive?: boolean | Subscribable<boolean>;

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
  private static readonly SPEED_CONVERSION_SMOOTHING_TAU = 5000 / Math.LN2; // milliseconds
  private static readonly DEFAULT_IAS_TREND_INPUT_SMOOTHING_TAU = 2000 / Math.LN2; // milliseconds
  private static readonly DEFAULT_IAS_TREND_TREND_SMOOTHING_TAU = 1000 / Math.LN2; // milliseconds

  private readonly _iasKnots = ConsumerSubject.create(null, 0);
  /** @inheritDoc */
  public readonly iasKnots = this._iasKnots as Subscribable<number>;

  private readonly _tasKnots = ConsumerSubject.create(null, 0);
  /** @inheritDoc */
  public readonly tasKnots = this._tasKnots as Subscribable<number>;

  private readonly _mach = ConsumerSubject.create(null, 0);
  /** @inheritDoc */
  public readonly mach = this._mach as Subscribable<number>;

  private readonly _machToKias = Subject.create(0);
  /** @inheritDoc */
  public readonly machToKias = this._machToKias as Subscribable<number>;

  private readonly _tasToIas = Subject.create(0);
  /** @inheritDoc */
  public readonly tasToIas = this._tasToIas as Subscribable<number>;

  private readonly _pressureAlt = ConsumerSubject.create(null, 0);
  /** @inheritDoc */
  public readonly pressureAlt = this._pressureAlt as Subscribable<number>;

  private readonly _iasTrend = Subject.create(0);
  /** @inheritDoc */
  public readonly iasTrend = this._iasTrend as Subscribable<number>;

  private readonly _referenceIas = Subject.create<number | null>(0);
  /** @inheritDoc */
  public readonly referenceIas = this._referenceIas as Subscribable<number | null>;

  private readonly _referenceMach = Subject.create<number | null>(0);
  /** @inheritDoc */
  public readonly referenceMach = this._referenceMach as Subscribable<number | null>;

  private readonly _referenceIsManual = ConsumerSubject.create(null, true);
  /** @inheritDoc */
  public readonly referenceIsManual = this._referenceIsManual as Subscribable<boolean>;

  /** @inheritDoc */
  public readonly isAirspeedHoldActive: Subscribable<boolean>;

  private readonly _airspeedAlerts = Subject.create(0);
  /** @inheritDoc */
  public readonly airspeedAlerts = this._airspeedAlerts as Subscribable<number>;

  private readonly _isOverspeedProtectionActive = Subject.create(false);
  /** @inheritDoc */
  public readonly isOverspeedProtectionActive = this._isOverspeedProtectionActive as Subscribable<boolean>;

  private readonly _isUnderspeedProtectionActive = Subject.create(false);
  /** @inheritDoc */
  public readonly isUnderspeedProtectionActive = this._isUnderspeedProtectionActive as Subscribable<boolean>;

  /** @inheritDoc */
  public readonly normAoaIasCoef = this.aoaDataProvider?.normAoaIasCoef ?? Subject.create(null);

  private readonly isAirspeedDataValid = ConsumerSubject.create(null, false);
  /** @inheritDoc */
  public readonly isDataFailed = this.isAirspeedDataValid.map(SubscribableMapFunctions.not()) as Subscribable<boolean>;

  private readonly adcIndex: Subscribable<number>;

  private readonly machToKiasSmoother = new ExpSmoother(DefaultAirspeedIndicatorDataProvider.SPEED_CONVERSION_SMOOTHING_TAU);
  private lastMachToKiasTime = 0;

  private readonly tasToIasSmoother = new ExpSmoother(DefaultAirspeedIndicatorDataProvider.SPEED_CONVERSION_SMOOTHING_TAU);
  private lastTasToIasTime = 0;

  private readonly simTime = ConsumerSubject.create(null, 0);
  private readonly isOnGround = ConsumerSubject.create(null, false);

  private readonly referenceIasSource = ConsumerSubject.create(null, 0);
  private readonly referenceMachSource = ConsumerSubject.create(null, 0);
  private readonly referenceIsMach = ConsumerSubject.create(null, false);

  private readonly referenceIasPipe = this.referenceIasSource.pipe(this._referenceIas, ias => ias > 0 ? ias : null, true);
  private readonly referenceMachPipe = this.referenceMachSource.pipe(this._referenceMach, mach => mach > 0 ? mach : null, true);

  private readonly isFlcActive?: ConsumerSubject<boolean>;

  private readonly trendLookahead: Subscribable<number>;
  private readonly iasLookahead: Lookahead;
  private lastTrendTime?: number;

  private readonly overspeedThresholdDef: AirspeedDefinition;
  /** @inheritDoc */
  public readonly overspeedThreshold: Subscribable<number>;

  private readonly underspeedThresholdDef: AirspeedDefinition;
  /** @inheritDoc */
  public readonly underspeedThreshold: Subscribable<number>;

  private readonly isOverspeed: MappedSubscribable<boolean>;
  private readonly isTrendOverspeed: MappedSubscribable<boolean>;
  private readonly isUnderspeed: MappedSubscribable<boolean>;
  private readonly isTrendUnderspeed: MappedSubscribable<boolean>;

  private isInit = false;
  private isAlive = true;
  private isPaused = false;

  private adcIndexSub?: Subscription;
  private machToKiasSub?: Subscription;
  private tasToIasSub?: Subscription;
  private trendLookaheadSub?: Subscription;

  /**
   * Constructor.
   * @param bus The event bus.
   * @param adcIndex The index of the ADC that is the source of this provider's data.
   * @param options Configuration options for this provider.
   * @param aoaDataProvider A provider of angle of attack data.
   * @param trendInputSmoothingTau The smoothing time constant, in milliseconds, to apply to the IAS lookahead trend's
   * input values. Defaults to `2000 / ln(2)`.
   * @param trendTrendSmoothingTau The smoothing time constant, in milliseconds, to apply to the IAS lookahead trend
   * values. Defaults to `1000 / ln(2)`.
   */
  constructor(
    public readonly bus: EventBus,
    adcIndex: number | Subscribable<number>,
    options: Readonly<AirspeedIndicatorDataProviderOptions>,
    private readonly aoaDataProvider?: AirspeedAoaDataProvider,
    trendInputSmoothingTau = DefaultAirspeedIndicatorDataProvider.DEFAULT_IAS_TREND_INPUT_SMOOTHING_TAU,
    trendTrendSmoothingTau = DefaultAirspeedIndicatorDataProvider.DEFAULT_IAS_TREND_TREND_SMOOTHING_TAU
  ) {
    this.adcIndex = SubscribableUtils.toSubscribable(adcIndex, true);

    this.trendLookahead = SubscribableUtils.toSubscribable(options.trendLookahead, true);
    this.iasLookahead = new Lookahead(this.trendLookahead.get() * 1000, trendInputSmoothingTau, trendTrendSmoothingTau);

    this.overspeedThresholdDef = options.overspeedThreshold(this);
    this.underspeedThresholdDef = options.underspeedThreshold(this);

    this.overspeedThreshold = SubscribableUtils.toSubscribable(this.overspeedThresholdDef.value, true);
    this.underspeedThreshold = SubscribableUtils.toSubscribable(this.underspeedThresholdDef.value, true);

    this.isAirspeedHoldActive = options.isAirspeedHoldActive
      ? SubscribableUtils.toSubscribable(options.isAirspeedHoldActive, true)
      : this.isFlcActive = ConsumerSubject.create<boolean>(null, false);

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
      this.machToKiasSub?.destroy();
      this.machToKiasSmoother.reset();

      this.tasToIasSub?.destroy();
      this.tasToIasSmoother.reset();

      this._iasKnots.setConsumer(sub.on(`adc_ias_${index}`));
      this._tasKnots.setConsumer(sub.on(`adc_tas_${index}`));
      this._mach.setConsumer(sub.on(`adc_mach_number_${index}`));
      this._pressureAlt.setConsumer(sub.on(`adc_pressure_alt_${index}`));
      this.isAirspeedDataValid.setConsumer(sub.on(`adc_airspeed_data_valid_${index}`));

      this.machToKiasSub = sub.on(`adc_mach_to_kias_factor_${index}`).handle(machToKcas => {
        const time = Date.now();
        this._machToKias.set(this.machToKiasSmoother.next(machToKcas, time - this.lastMachToKiasTime));
        this.lastMachToKiasTime = time;
      });

      this.tasToIasSub = sub.on(`adc_tas_to_ias_factor_${index}`).handle(tasToCas => {
        const time = Date.now();
        this._tasToIas.set(this.tasToIasSmoother.next(tasToCas, time - this.lastTasToIasTime));
        this.lastTasToIasTime = time;
      });
    }, true);

    this.referenceIasSource.setConsumer(sub.on('ap_ias_selected'));
    this.referenceMachSource.setConsumer(sub.on('ap_mach_selected'));
    this.referenceIsMach.setConsumer(sub.on('ap_selected_speed_is_mach'));
    this._referenceIsManual.setConsumer(sub.on('ap_selected_speed_is_manual'));

    this.isFlcActive?.setConsumer(sub.on('ap_flc_hold'));

    if (paused) {
      this.pause();
    }

    this.trendLookaheadSub = this.trendLookahead.sub(lookahead => {
      this._iasTrend.set(0);
      this.iasLookahead.lookahead = lookahead * 1000;
      this.iasLookahead.reset();
    });

    this.simTime.sub(simTime => {
      const dt = simTime - (this.lastTrendTime ?? simTime);
      const iasKnots = this.iasKnots.get();

      this.lastTrendTime = simTime;

      this._iasTrend.set(this.iasLookahead.nextTrend(iasKnots, dt));
    }, true);

    this.referenceIsMach.sub(isReferenceInMach => {
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

  /** @inheritdoc */
  public estimateIasFromNormAoa(normAoa: number): number {
    return this.aoaDataProvider?.estimateIasFromNormAoa(normAoa) ?? NaN;
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
    this.machToKiasSub?.resume(true);
    this.tasToIasSub?.resume(true);
    this._pressureAlt.resume();

    this.referenceIasSource.resume();
    this.referenceMachSource.resume();
    this.referenceIsMach.resume();
    this._referenceIsManual.resume();

    this.isFlcActive?.resume();

    this.isOverspeed.resume();
    this.isTrendOverspeed.resume();
    this.isUnderspeed.resume();
    this.isTrendUnderspeed.resume();

    this.isAirspeedDataValid.resume();
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
    this.machToKiasSub?.pause();
    this.tasToIasSub?.pause();
    this._pressureAlt.pause();

    this.machToKiasSmoother.reset();

    this.referenceIasSource.pause();
    this.referenceMachSource.pause();
    this.referenceIsMach.pause();
    this._referenceIsManual.pause();

    this.isFlcActive?.pause();

    this.isOverspeed.pause();
    this.isTrendOverspeed.pause();
    this.isUnderspeed.pause();
    this.isTrendUnderspeed.pause();

    this.isAirspeedDataValid.pause();

    this.lastTrendTime = undefined;
    this.iasLookahead.reset();

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
    this._pressureAlt.destroy();

    this.referenceIasSource.destroy();
    this.referenceMachSource.destroy();
    this.referenceIsMach.destroy();
    this._referenceIsManual.destroy();

    this.isFlcActive?.destroy();

    this.overspeedThresholdDef.destroy?.();
    this.underspeedThresholdDef.destroy?.();

    this.isOverspeed.destroy();
    this.isTrendOverspeed.destroy();
    this.isUnderspeed.destroy();
    this.isTrendUnderspeed.destroy();

    this.isAirspeedDataValid.destroy();

    this.adcIndexSub?.destroy();
    this.machToKiasSub?.destroy();
    this.tasToIasSub?.destroy();
    this.trendLookaheadSub?.destroy();
  }
}
