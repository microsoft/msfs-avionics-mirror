import {
  AdcEvents, AvionicsSystemState, AvionicsSystemStateEvent, ClockEvents, ConsumerSubject, ConsumerValue, EventBus, ExpSmoother, GNSSEvents, NavMath, Subject,
  Subscribable, SubscribableUtils, Subscription
} from '@microsoft/msfs-sdk';
import { AdcSystemEvents } from '../system/AdcSystem';
import { AhrsSystemEvents } from '../system/AhrsSystem';
import { FmsPositionMode, FmsPositionSystemEvents } from '../system/FmsPositionSystem';

/**
 * A provider of wind data.
 */
export interface WindDataProvider {
  /** The current wind direction, in degrees true. */
  readonly windDirection: Subscribable<number>;

  /**
   * The current wind direction relative to airplane heading, in degrees. A value of zero degrees indicates a direct
   * headwind, with positive angles proceeding clockwise.
   */
  readonly windDirectionRelative: Subscribable<number>;

  /** The current wind speed, in knots. */
  readonly windSpeed: Subscribable<number>;

  /** The current headwind component, in knots. Positive values indicate headwind, negative values indicate tailwind. */
  readonly headwind: Subscribable<number>;

  /**
   * The current crosswind component, in knots. Positive values indicate wind from the right, negative values indicate
   * wind from the left.
   */
  readonly crosswind: Subscribable<number>;

  /** The magnetic variation, in degrees, at the airplane's location. */
  readonly magVar: Subscribable<number>;

  /** Whether GPS position is in dead reckoning mode. */
  readonly isGpsDeadReckoning: Subscribable<boolean>;

  /** Whether this provider's wind data is in a failed state. */
  readonly isDataFailed: Subscribable<boolean>;
}

/**
 * A default implementation of {@link WindDataProvider}.
 */
export class DefaultWindDataProvider implements WindDataProvider {
  private static readonly DEFAULT_SMOOTHING_TAU = 3000 / Math.LN2; // milliseconds
  private static readonly DEFAULT_ACCUMULATE_TIME = 3000; // milliseconds

  /** The minimum true airspeed, in knots, required to provide valid wind data. */
  private static readonly MIN_TAS = 30;

  private readonly _windDirection = Subject.create(0);
  /** @inheritdoc */
  public readonly windDirection = this._windDirection as Subscribable<number>;

  private readonly _windDirectionRelative = Subject.create(0);
  /** @inheritdoc */
  public readonly windDirectionRelative = this._windDirectionRelative as Subscribable<number>;

  private readonly _windSpeed = Subject.create(0);
  /** @inheritdoc */
  public readonly windSpeed = this._windSpeed as Subscribable<number>;

  private readonly _headwind = Subject.create(0);
  /** @inheritdoc */
  public readonly headwind = this._headwind as Subscribable<number>;

  private readonly _crosswind = Subject.create(0);
  /** @inheritdoc */
  public readonly crosswind = this._crosswind as Subscribable<number>;

  private readonly _magVar = ConsumerSubject.create(null, 0).pause();
  /** @inheritdoc */
  public readonly magVar = this._magVar as Subscribable<number>;

  private readonly _isGpsDeadReckoning = Subject.create(false);
  /** @inheritdoc */
  public readonly isGpsDeadReckoning = this._isGpsDeadReckoning as Subscribable<boolean>;

  private readonly _isDataFailed = Subject.create(false);
  /** @inheritdoc */
  public readonly isDataFailed = this._isDataFailed as Subscribable<boolean>;

  private readonly windDirectionSource = ConsumerValue.create(null, 0).pause();
  private readonly windSpeedSource = ConsumerValue.create(null, 0).pause();

  private readonly isOnGround = ConsumerValue.create(null, false).pause();
  private readonly tas = ConsumerValue.create(null, 0).pause();
  private readonly headingTrue = ConsumerValue.create(null, 0).pause();

  private readonly adcIndex: Subscribable<number>;
  private readonly adcSystemState = ConsumerSubject.create<AvionicsSystemStateEvent>(null, { previous: undefined, current: undefined }).pause();
  private readonly isAdcDataValid = this.adcSystemState.map(state => state.current === undefined || state.current === AvionicsSystemState.On);

  private readonly ahrsIndex: Subscribable<number>;
  private readonly isHeadingDataValid = ConsumerValue.create(null, false).pause();

  private readonly fmsPosIndex: Subscribable<number>;
  private readonly fmsPosMode = ConsumerValue.create(null, FmsPositionMode.None).pause();

  private readonly directionSmoother = new ExpSmoother(this.smoothingTau);
  private readonly speedSmoother = new ExpSmoother(this.smoothingTau);
  private lastUpdateTime = 0;
  private lastDeadTime = 0;

  private isInit = false;
  private isAlive = true;
  private isPaused = true;

  private readonly pauseable = [
    this.windDirectionSource,
    this.windSpeedSource,
    this._magVar,
    this.isOnGround,
    this.tas,
    this.headingTrue,
    this.adcSystemState,
    this.isHeadingDataValid,
    this.fmsPosMode,
  ];

  private adcIndexSub?: Subscription;
  private ahrsIndexSub?: Subscription;
  private fmsPosIndexSub?: Subscription;
  private clockSub?: Subscription;

  /**
   * Constructor.
   * @param bus The event bus.
   * @param adcIndex The index of the ADC that is the source of this provider's data.
   * @param ahrsIndex The index of the AHRS that is the source of this provider's data.
   * @param fmsPosIndex The index of the FMS geo-positioning system that is the source of this provider's data.
   * @param smoothingTau The smoothing time constant, in milliseconds, used to apply smoothing to wind speed and
   * direction. Defaults to {@link DefaultWindDataProvider.DEFAULT_SMOOTHING_TAU}.
   * @param accumulateTime The time required for this provider to accumulate enough source data to generate valid wind
   * data.
   */
  constructor(
    private readonly bus: EventBus,
    adcIndex: number | Subscribable<number>,
    ahrsIndex: number | Subscribable<number>,
    fmsPosIndex: number | Subscribable<number>,
    private readonly smoothingTau = DefaultWindDataProvider.DEFAULT_SMOOTHING_TAU,
    private readonly accumulateTime = DefaultWindDataProvider.DEFAULT_ACCUMULATE_TIME
  ) {
    this.adcIndex = SubscribableUtils.toSubscribable(adcIndex, true);
    this.ahrsIndex = SubscribableUtils.toSubscribable(ahrsIndex, true);
    this.fmsPosIndex = SubscribableUtils.toSubscribable(fmsPosIndex, true);
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
      throw new Error('DefaultWindDataProvider: cannot initialize a dead provider');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    const sub = this.bus.getSubscriber<ClockEvents & AdcEvents & GNSSEvents & AdcSystemEvents & AhrsSystemEvents & FmsPositionSystemEvents>();

    this.windDirectionSource.setConsumer(sub.on('ambient_wind_direction'));
    this.windSpeedSource.setConsumer(sub.on('ambient_wind_velocity'));
    this._magVar.setConsumer(sub.on('magvar'));

    this.isOnGround.setConsumer(sub.on('on_ground'));

    this.adcIndexSub = this.adcIndex.sub(index => {
      this.tas.setConsumer(sub.on(`adc_tas_${index}`));
      this.adcSystemState.setConsumer(sub.on(`adc_state_${index}`));
    }, true);

    this.ahrsIndexSub = this.ahrsIndex.sub(index => {
      this.headingTrue.setConsumer(sub.on(`ahrs_hdg_deg_true_${index}`));
      this.isHeadingDataValid.setConsumer(sub.on(`ahrs_heading_data_valid_${index}`));
    }, true);

    this.fmsPosIndexSub = this.fmsPosIndex.sub(index => {
      this.fmsPosMode.setConsumer(sub.on(`fms_pos_mode_${index}`));
    }, true);

    this.clockSub = sub.on('simTime').handle(this.update.bind(this));

    if (!paused) {
      this.resume();
    }
  }

  /**
   * Resumes this data provider. Once resumed, this data provider will continuously update its data until paused or
   * destroyed.
   * @throws Error if this data provider is dead.
   */
  public resume(): void {
    if (!this.isAlive) {
      throw new Error('DefaultWindDataProvider: cannot resume a dead provider');
    }

    if (!this.isInit || !this.isPaused) {
      return;
    }

    this.isPaused = false;

    for (const pauseable of this.pauseable) {
      pauseable.resume();
    }

    this.clockSub?.resume(true);
  }

  /**
   * Pauses this data provider. Once paused, this data provider will not update its data until it is resumed.
   * @throws Error if this data provider is dead.
   */
  public pause(): void {
    if (!this.isAlive) {
      throw new Error('DefaultWindDataProvider: cannot pause a dead provider');
    }

    if (!this.isInit || this.isPaused) {
      return;
    }

    this.isPaused = true;

    for (const pauseable of this.pauseable) {
      pauseable.pause();
    }

    this.clockSub?.pause();

    this.directionSmoother.reset();
    this.speedSmoother.reset();
  }

  /**
   * Updates this data provider.
   * @param simTime The current simulation time, as a UNIX timestamp in milliseconds.
   */
  private update(simTime: number): void {
    const fmsPosMode = this.fmsPosMode.get();

    const isDead
      = this.isOnGround.get()
      || this.tas.get() < DefaultWindDataProvider.MIN_TAS
      || !this.isAdcDataValid.get()
      || !this.isHeadingDataValid.get()
      || fmsPosMode === FmsPositionMode.None;

    const dt = Math.max(0, simTime - this.lastUpdateTime);
    this.lastUpdateTime = simTime;

    if (isDead) {
      this.lastDeadTime = simTime;
    } else {
      this.lastDeadTime = Math.min(this.lastDeadTime, simTime);
    }

    this._isGpsDeadReckoning.set(fmsPosMode === FmsPositionMode.DeadReckoning || fmsPosMode === FmsPositionMode.DeadReckoningExpired);
    this._isDataFailed.set(isDead || simTime - this.lastDeadTime < this.accumulateTime);

    let windDirection = this.windDirectionSource.get();
    const windSpeed = this.windSpeedSource.get();

    const lastWindDirection = this.directionSmoother.last();
    if (lastWindDirection !== null) {
      // need to handle wraparounds
      windDirection = lastWindDirection + NavMath.diffAngle(lastWindDirection, windDirection);
    }

    // Keep the smoothed direction in the range [0, 360).
    const windDirectionSmoothed = this.directionSmoother.reset(NavMath.normalizeHeading(this.directionSmoother.next(windDirection, dt)));
    const windSpeedSmoothed = this.speedSmoother.next(windSpeed, dt);

    const headingTrue = this.headingTrue.get();

    const relativeDirection = (windDirectionSmoothed - headingTrue + 360) % 360;
    const relativeDirectionRad = relativeDirection * Avionics.Utils.DEG2RAD;

    const headwind = windSpeedSmoothed * Math.cos(relativeDirectionRad);
    const crosswind = windSpeedSmoothed * Math.sin(relativeDirectionRad);

    this._windDirection.set(windDirectionSmoothed);
    this._windSpeed.set(windSpeedSmoothed);
    this._windDirectionRelative.set(relativeDirection);
    this._headwind.set(headwind);
    this._crosswind.set(crosswind);
  }

  /**
   * Destroys this data provider. Once destroyed, this data provider will no longer update its provided data, and can
   * no longer be paused or resumed.
   */
  public destroy(): void {
    this.isAlive = false;

    for (const pauseable of this.pauseable) {
      pauseable.destroy();
    }

    this.adcIndexSub?.destroy();
    this.ahrsIndexSub?.destroy();
    this.fmsPosIndexSub?.destroy();
    this.clockSub?.destroy();
  }
}