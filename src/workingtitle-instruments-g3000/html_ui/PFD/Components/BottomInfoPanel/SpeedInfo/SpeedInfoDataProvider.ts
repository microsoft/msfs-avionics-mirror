import {
  AdcEvents, AvionicsSystemState, AvionicsSystemStateEvent, ConsumerSubject, EventBus, Subject, Subscribable,
  SubscribableUtils, Subscription
} from '@microsoft/msfs-sdk';
import { AdcSystemEvents, FmsPositionMode, FmsPositionSystemEvents } from '@microsoft/msfs-garminsdk';

/**
 * A data provider for a speed information display.
 */
export interface SpeedInfoDataProvider {
  /** The current true airspeed, in knots. */
  readonly tasKnots: Subscribable<number>;

  /** The current ground speed, in knots. */
  readonly gsKnots: Subscribable<number>;

  /** Whether air data is in a failed state. */
  readonly isAirDataFailed: Subscribable<boolean>;

  /** Whether GPS position is in dead reckoning mode. */
  readonly isGpsDeadReckoning: Subscribable<boolean>;

  /** Whether GPS data is in a failed state. */
  readonly isGpsDataFailed: Subscribable<boolean>;
}

/**
 * A default implementation of {@link SpeedInfoDataProvider}.
 */
export class DefaultSpeedInfoDataProvider implements SpeedInfoDataProvider {
  private readonly _tasKnots = ConsumerSubject.create(null, 0);
  /** @inheritdoc */
  public readonly tasKnots = this._tasKnots as Subscribable<number>;

  private readonly _gsKnots = ConsumerSubject.create(null, 0);
  /** @inheritdoc */
  public readonly gsKnots = this._gsKnots as Subscribable<number>;

  private readonly _isAirDataFailed = Subject.create(false);
  /** @inheritdoc */
  public readonly isAirDataFailed = this._isAirDataFailed as Subscribable<boolean>;

  private readonly fmsPosMode = ConsumerSubject.create(null, FmsPositionMode.None);

  /** @inheritdoc */
  public readonly isGpsDeadReckoning = this.fmsPosMode.map(mode => {
    return mode === FmsPositionMode.DeadReckoning || mode === FmsPositionMode.DeadReckoningExpired;
  }) as Subscribable<boolean>;

  /** @inheritdoc */
  public readonly isGpsDataFailed = this.fmsPosMode.map(mode => mode === FmsPositionMode.None) as Subscribable<boolean>;

  private readonly adcIndex: Subscribable<number>;
  private readonly adcSystemState = ConsumerSubject.create<AvionicsSystemStateEvent>(null, { previous: undefined, current: undefined });

  private readonly fmsPosIndex: Subscribable<number>;

  private isInit = false;
  private isAlive = true;
  private isPaused = false;

  private adcIndexSub?: Subscription;
  private fmsPosIndexSub?: Subscription;

  /**
   * Constructor.
   * @param bus The event bus.
   * @param adcIndex The index of the ADC that is the source of this provider's airspeed data.
   * @param fmsPosIndex The index of the FMS geo-positioning system that is the source of this provider's ground speed
   * data.
   */
  constructor(
    private readonly bus: EventBus,
    adcIndex: number | Subscribable<number>,
    fmsPosIndex: number | Subscribable<number>
  ) {
    this.adcIndex = SubscribableUtils.toSubscribable(adcIndex, true);
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
      throw new Error('DefaultSpeedInfoDataProvider: cannot initialize a dead provider');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;
    this.isPaused = paused;

    const sub = this.bus.getSubscriber<AdcEvents & AdcSystemEvents & FmsPositionSystemEvents>();

    this.adcIndexSub = this.adcIndex.sub(index => {
      this._tasKnots.setConsumer(sub.on(`adc_tas_${index}`));
      this.adcSystemState.setConsumer(sub.on(`adc_state_${index}`));
    }, true);

    this.adcSystemState.sub(state => {
      if (state.current === undefined || state.current === AvionicsSystemState.On) {
        this._isAirDataFailed.set(false);
      } else {
        this._isAirDataFailed.set(true);
      }
    }, true);

    this.fmsPosIndexSub = this.fmsPosIndex.sub(index => {
      this.fmsPosMode.setConsumer(sub.on(`fms_pos_mode_${index}`));
      this._gsKnots.setConsumer(sub.on(`fms_pos_ground_speed_${index}`));
    }, true);

    if (paused) {
      this.pause();
    }
  }

  /**
   * Resumes this data provider. Once resumed, this data provider will continuously update its data until paused or
   * destroyed.
   * @throws Error if this data provider is dead.
   */
  public resume(): void {
    if (!this.isAlive) {
      throw new Error('DefaultSpeedInfoDataProvider: cannot resume a dead provider');
    }

    if (!this.isPaused) {
      return;
    }

    this.isPaused = false;

    this._tasKnots.resume();
    this._gsKnots.resume();

    this.adcSystemState.resume();
    this.fmsPosMode.resume();
  }

  /**
   * Pauses this data provider. Once paused, this data provider will not update its data until it is resumed.
   * @throws Error if this data provider is dead.
   */
  public pause(): void {
    if (!this.isAlive) {
      throw new Error('DefaultSpeedInfoDataProvider: cannot pause a dead provider');
    }

    if (this.isPaused) {
      return;
    }

    this._tasKnots.pause();
    this._gsKnots.pause();

    this.adcSystemState.pause();
    this.fmsPosMode.pause();
  }

  /**
   * Destroys this data provider. Once destroyed, this data provider will no longer update its provided data, and can
   * no longer be paused or resumed.
   */
  public destroy(): void {
    this.isAlive = false;

    this._tasKnots.destroy();
    this._gsKnots.destroy();

    this.adcSystemState.destroy();
    this.fmsPosMode.destroy();

    this.adcIndexSub?.destroy();
    this.fmsPosIndexSub?.destroy();
  }
}