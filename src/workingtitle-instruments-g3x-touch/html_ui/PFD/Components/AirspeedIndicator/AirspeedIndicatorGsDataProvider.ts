import { ConsumerSubject, EventBus, Subscribable, SubscribableUtils, Subscription } from '@microsoft/msfs-sdk';

import { FmsPositionMode, FmsPositionSystemEvents } from '@microsoft/msfs-garminsdk';

/**
 * A ground speed data provider for an airspeed indicator.
 */
export interface AirspeedIndicatorGsDataProvider {
  /** The current ground speed, in knots. */
  readonly gsKnots: Subscribable<number>;

  /** Whether ground speed data is in a failure state. */
  readonly isDataFailed: Subscribable<boolean>;
}

/**
 * A default implementation of {@link AirspeedIndicatorGsDataProvider}.
 */
export class DefaultAirspeedIndicatorGsDataProvider implements AirspeedIndicatorGsDataProvider {
  private readonly fmsPosIndex: Subscribable<number>;
  private readonly fmsPosMode = ConsumerSubject.create<FmsPositionMode>(null, FmsPositionMode.None);

  private readonly _gsKnots = ConsumerSubject.create(null, 0);
  /** @inheritDoc */
  public readonly gsKnots = this._gsKnots as Subscribable<number>;

  /** @inheritDoc */
  public readonly isDataFailed = this.fmsPosMode.map(mode => mode === FmsPositionMode.None) as Subscribable<boolean>;

  private isInit = false;
  private isAlive = true;
  private isPaused = true;

  private fmsPosIndexSub?: Subscription;

  /**
   * Creates a new instance of DefaultAirspeedIndicatorGsDataProvider.
   * @param bus The event bus.
   * @param fmsPosIndex The index of the FMS geo-positioning system that is the source of this provider's data.
   */
  constructor(
    private readonly bus: EventBus,
    fmsPosIndex: number | Subscribable<number>,
  ) {
    this.fmsPosIndex = SubscribableUtils.toSubscribable(fmsPosIndex, true);
  }

  /**
   * Initializes this data provider. Once initialized
   * @param paused Whether to initialize this data provider as paused. If `true`, this data provider will provide an
   * initial set of data but will not update the provided data until it is resumed. Defaults to `false`.
   * @throws Error if this data provider is dead.
   */
  public init(paused = false): void {
    if (!this.isAlive) {
      throw new Error('DefaultAirspeedIndicatorGsDataProvider: cannot initialize a dead provider');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    const sub = this.bus.getSubscriber<FmsPositionSystemEvents>();

    this.fmsPosIndexSub = this.fmsPosIndex.sub(index => {
      this._gsKnots.setConsumer(sub.on(`fms_pos_ground_speed_${index}`));
      this.fmsPosMode.setConsumer(sub.on(`fms_pos_mode_${index}`));
    }, true);

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
      throw new Error('DefaultAirspeedIndicatorGsDataProvider: cannot resume a dead provider');
    }

    if (!this.isPaused) {
      return;
    }

    this.isPaused = false;

    this._gsKnots.resume();
    this.fmsPosMode.resume();
  }

  /**
   * Pauses this data provider. Once paused, this data provider will not update its data until it is resumed.
   * @throws Error if this data provider is dead.
   */
  public pause(): void {
    if (!this.isAlive) {
      throw new Error('DefaultAirspeedIndicatorGsDataProvider: cannot pause a dead provider');
    }

    if (this.isPaused) {
      return;
    }

    this.isPaused = true;

    this._gsKnots.pause();
    this.fmsPosMode.pause();
  }

  /**
   * Destroys this data provider. Once destroyed, this data provider will no longer update its provided data, and can
   * no longer be paused or resumed.
   */
  public destroy(): void {
    this.isAlive = false;

    this.fmsPosIndexSub?.destroy();

    this._gsKnots.destroy();
    this.fmsPosMode.destroy();
  }
}