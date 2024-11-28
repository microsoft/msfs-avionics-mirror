import {
  AdcEvents, AvionicsSystemState, AvionicsSystemStateEvent, ClockEvents, ConsumerSubject, EventBus, ExpSmoother,
  Subject, Subscribable, SubscribableUtils, Subscription
} from '@microsoft/msfs-sdk';
import { AdcSystemEvents } from '../../../system/AdcSystem';
import { AoaSystemEvents } from '../../../system/AoaSystem';

/**
 * A provider of angle of attack data.
 */
export interface AoaDataProvider {
  /** The current angle of attack, in degrees. */
  readonly aoa: Subscribable<number>;

  /** The current normalized angle of attack. A value of `0` is equal to zero-lift AoA, and a value of `1` is equal to stall AoA. */
  readonly normAoa: Subscribable<number>;

  /** The current stall (critical) angle of attack, in degrees. */
  readonly stallAoa: Subscribable<number>;

  /** The current zero-lift angle of attack, in degrees. */
  readonly zeroLiftAoa: Subscribable<number>;

  /**
   * The correlation coefficient between a given normalized angle of attack and the estimated indicated airspeed in
   * knots required to maintain level flight at that angle of attack for the current aircraft configuration and
   * environment, or `null` if such a value cannot be calculated.
   */
  readonly normAoaIasCoef: Subscribable<number | null>;

  /** Whether the airplane is on the ground. */
  readonly isOnGround: Subscribable<boolean>;

  /** Whether this provider's AoA data is in a failed state. */
  readonly isDataFailed: Subscribable<boolean>;

  /**
   * Converts an absolute angle of attack value in degrees to a normalized angle of attack value. Normalized angle of
   * attack is defined such that `0` equals zero-lift AoA, and `1` equals stall AoA.
   * @param aoa An absolute angle of attack value, in degrees.
   * @returns The normalized equivalent of the specified angle of attack.
   */
  aoaToNormAoa(aoa: number): number;

  /**
   * Converts a normalized angle of attack value to an absolute angle of attack value in degrees. Normalized angle of
   * attack is defined such that `0` equals zero-lift AoA, and `1` equals stall AoA.
   * @param normAoa A normalized angle of attack value.
   * @returns The absolute equivalent of the specified normalized angle of attack, in degrees.
   */
  normAoaToAoa(normAoa: number): number;

  /**
   * Estimates the indicated airspeed, in knots, required to maintain level flight at a given angle of attack value
   * for the current aircraft configuration and environment.
   * @param aoa An angle of attack value, in degrees.
   * @returns The estimated indicated airspeed, in knots, required to maintain level flight at the specified angle of
   * attack, or `NaN` if an estimate cannot be made.
   */
  estimateIasFromAoa(aoa: number): number;

  /**
   * Estimates the indicated airspeed, in knots, required to maintain level flight at a given normalized angle of
   * attack value for the current aircraft configuration and environment. Normalized angle of attack is defined such
   * that `0` equals zero-lift AoA, and `1` equals stall AoA.
   * @param normAoa A normalized angle of attack value.
   * @returns The estimated indicated airspeed, in knots, required to maintain level flight at the specified angle of
   * attack, or `NaN` if an estimate cannot be made.
   */
  estimateIasFromNormAoa(normAoa: number): number;
}

/**
 * A default implementation of {@link AoaDataProvider}.
 */
export class DefaultAoaDataProvider implements AoaDataProvider {
  private static readonly AOA_COEF_SMOOTHING_TAU = 2000 / Math.LN2;

  private readonly _aoa = ConsumerSubject.create(null, 0);
  /** @inheritdoc */
  public readonly aoa = this._aoa as Subscribable<number>;

  private readonly _normAoa = ConsumerSubject.create(null, 0);
  /** @inheritdoc */
  public readonly normAoa = this._normAoa as Subscribable<number>;

  private readonly _stallAoa = ConsumerSubject.create(null, 0);
  /** @inheritdoc */
  public readonly stallAoa = this._stallAoa as Subscribable<number>;

  private readonly _zeroLiftAoa = ConsumerSubject.create(null, 0);
  /** @inheritdoc */
  public readonly zeroLiftAoa = this._zeroLiftAoa as Subscribable<number>;

  private readonly ias = ConsumerSubject.create(null, 0);
  private readonly _isOnGround = ConsumerSubject.create(null, false);
  /** @inheritdoc */
  public readonly isOnGround = this._isOnGround as Subscribable<boolean>;

  private readonly aoaCoefSmoother = new ExpSmoother(DefaultAoaDataProvider.AOA_COEF_SMOOTHING_TAU);
  private lastAoaCoefTime?: number;

  private readonly _normAoaIasCoef = Subject.create<number | null>(null);
  /** @inheritdoc */
  public readonly normAoaIasCoef = this._normAoaIasCoef as Subscribable<number | null>;

  private readonly _isDataFailed = Subject.create(false);
  /** @inheritdoc */
  public readonly isDataFailed = this._isDataFailed as Subscribable<boolean>;

  private readonly aoaIndex: Subscribable<number>;
  private readonly aoaSystemState = ConsumerSubject.create<AvionicsSystemStateEvent>(null, { previous: undefined, current: undefined });

  private readonly adcIndex: Subscribable<number>;
  private readonly adcSystemState = ConsumerSubject.create<AvionicsSystemStateEvent>(null, { previous: undefined, current: undefined });
  private isAdcDataFailed = false;

  private isInit = false;
  private isAlive = true;
  private isPaused = false;

  private aoaIndexSub?: Subscription;
  private adcIndexSub?: Subscription;
  private clockSub?: Subscription;

  /**
   * Constructor.
   * @param bus The event bus.
   * @param aoaIndex The index of the AoA computer that is the source of this provider's data.
   * @param adcIndex The index of the ADC that is the source of this provider's data.
   */
  constructor(
    private readonly bus: EventBus,
    aoaIndex: number | Subscribable<number>,
    adcIndex: number | Subscribable<number>
  ) {
    this.aoaIndex = SubscribableUtils.toSubscribable(aoaIndex, true);
    this.adcIndex = SubscribableUtils.toSubscribable(adcIndex, true);
  }

  /**
   * Initializes this data provider. Once initialized, this data provider will continuously update its data until
   * paused or destroyed.
   * @param paused Whether to initialize this data provider as paused. If `true`, this data provider will provide an
   * initial set of data but will not update the provided data until it is resumed. Defaults to `false`.
   * @throws Error if this data provider is dead.
   */
  public init(paused = false): void {
    if (!this.isAlive) {
      throw new Error('DefaultAoaDataProvider: cannot initialize a dead provider');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;
    this.isPaused = paused;

    const sub = this.bus.getSubscriber<ClockEvents & AoaSystemEvents & AdcSystemEvents & AdcEvents>();

    this._isOnGround.setConsumer(sub.on('on_ground'));

    this.aoaIndexSub = this.aoaIndex.sub(index => {
      this._aoa.setConsumer(sub.on(`aoa_aoa_${index}`));
      this._normAoa.setConsumer(sub.on(`aoa_norm_aoa_${index}`));
      this._stallAoa.setConsumer(sub.on(`aoa_stall_aoa_${index}`));
      this._zeroLiftAoa.setConsumer(sub.on(`aoa_zero_lift_aoa_${index}`));
      this.aoaSystemState.setConsumer(sub.on(`aoa_state_${index}`));
    }, true);

    this.adcIndexSub = this.adcIndex.sub(index => {
      this.ias.setConsumer(sub.on(`adc_ias_${index}`));
      this.adcSystemState.setConsumer(sub.on(`adc_state_${index}`));
    }, true);

    this.aoaSystemState.sub(state => {
      if (state.current === undefined || state.current === AvionicsSystemState.On) {
        this._isDataFailed.set(false);
      } else {
        this._isDataFailed.set(true);
      }
    }, true);

    this.adcSystemState.sub(state => {
      this.isAdcDataFailed = !(state.current === undefined || state.current === AvionicsSystemState.On);
    }, true);

    this.clockSub = sub.on('realTime').handle(this.update.bind(this));

    if (paused) {
      this.pause();
    }
  }

  /** @inheritdoc */
  public aoaToNormAoa(aoa: number): number {
    const zeroLiftAoa = this._zeroLiftAoa.get();
    return (aoa - zeroLiftAoa) / (this._stallAoa.get() - zeroLiftAoa);
  }

  /** @inheritdoc */
  public normAoaToAoa(normAoa: number): number {
    const zeroLiftAoa = this._zeroLiftAoa.get();
    return normAoa * (this._stallAoa.get() - zeroLiftAoa) + zeroLiftAoa;
  }

  /** @inheritdoc */
  public estimateIasFromAoa(aoa: number): number {
    return this.estimateIasFromNormAoa(this.aoaToNormAoa(aoa));
  }

  /** @inheritdoc */
  public estimateIasFromNormAoa(normAoa: number): number {
    return Math.sqrt((this._normAoaIasCoef.get() ?? NaN) / normAoa);
  }

  /**
   * Resumes this data provider. Once resumed, this data provider will continuously update its data until paused or
   * destroyed.
   * @throws Error if this data provider is dead.
   */
  public resume(): void {
    if (!this.isAlive) {
      throw new Error('DefaultAoaDataProvider: cannot resume a dead provider');
    }

    if (!this.isPaused) {
      return;
    }

    this.isPaused = false;

    this._aoa.resume();
    this._normAoa.resume();
    this._stallAoa.resume();
    this._zeroLiftAoa.resume();

    this.ias.resume();
    this._isOnGround.resume();

    this.aoaSystemState.resume();
    this.adcSystemState.resume();

    this.clockSub?.resume(true);
  }

  /**
   * Pauses this data provider. Once paused, this data provider will not update its data until it is resumed.
   * @throws Error if this data provider is dead.
   */
  public pause(): void {
    if (!this.isAlive) {
      throw new Error('DefaultAoaDataProvider: cannot pause a dead provider');
    }

    if (this.isPaused) {
      return;
    }

    this._aoa.pause();
    this._normAoa.pause();
    this._stallAoa.pause();
    this._zeroLiftAoa.pause();

    this.ias.pause();
    this._isOnGround.pause();

    this.aoaSystemState.pause();
    this.adcSystemState.pause();

    this.clockSub?.pause();
    this.lastAoaCoefTime = undefined;

    this.aoaCoefSmoother.reset();

    this.isPaused = true;
  }

  /**
   * Updates this data provider.
   * @param time The current real (operating system) time, as a UNIX timestamp in milliseconds.
   */
  private update(time: number): void {
    if (this._isDataFailed.get() || this.isAdcDataFailed || this._isOnGround.get()) {
      this._normAoaIasCoef.set(null);
      this.aoaCoefSmoother.reset();
      this.lastAoaCoefTime = undefined;
      return;
    }

    const dt = this.lastAoaCoefTime === undefined ? 0 : Math.max(0, time - this.lastAoaCoefTime);
    this.lastAoaCoefTime = time;

    const normAoa = this._normAoa.get();
    const ias = this.ias.get();
    const iasSquared = ias * ias;
    const coef = normAoa * iasSquared;

    if (isFinite(coef)) {
      this._normAoaIasCoef.set(this.aoaCoefSmoother.next(coef, dt));
    } else {
      this._normAoaIasCoef.set(this.aoaCoefSmoother.reset());
    }
  }

  /**
   * Destroys this data provider. Once destroyed, this data provider will no longer update its provided data, and can
   * no longer be paused or resumed.
   */
  public destroy(): void {
    this.isAlive = false;

    this._aoa.destroy();
    this._normAoa.destroy();
    this._stallAoa.destroy();
    this._zeroLiftAoa.destroy();

    this.ias.destroy();
    this._isOnGround.destroy();

    this.aoaSystemState.destroy();
    this.adcSystemState.destroy();

    this.aoaIndexSub?.destroy();
    this.adcIndexSub?.destroy();
    this.clockSub?.destroy();
  }
}