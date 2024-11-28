import { ConsumerSubject, EventBus, Subscribable, SubscribableUtils, Subscription } from '@microsoft/msfs-sdk';
import { AhrsSystemEvents } from '@microsoft/msfs-garminsdk';

/**
 * A data provider for a turn coordinator.
 */
export interface SlipSkidDataProvider {
  /** The current slip/skid ball position, in pixels. */
  readonly slipSkidBallPosition: Subscribable<number>;

  /** Whether this provider's data is in a failed state. */
  readonly isAhrsDataValid: Subscribable<boolean>;
}

/**
 * A default implementation of {@link SlipSkidDataProvider}.
 */
export class DefaultSlipSkidDataProvider implements SlipSkidDataProvider {
  private readonly _slipSkidBallPosition = ConsumerSubject.create(null, 0);
  /** @inheritdoc */
  public readonly slipSkidBallPosition = this._slipSkidBallPosition as Subscribable<number>;

  private readonly _isAhrsDataValid = ConsumerSubject.create(null, false);
  /** @inheritdoc */
  public readonly isAhrsDataValid = this._isAhrsDataValid as Subscribable<boolean>;

  private readonly ahrsIndex: Subscribable<number>;

  private isInit = false;
  private isAlive = true;
  private isPaused = false;

  private ahrsIndexSub?: Subscription;

  /**
   * Constructor.
   * @param bus The event bus.
   * @param ahrsIndex The index of the AHRS that is the source of this provider's turn coordinator data.
   */
  constructor(
    private readonly bus: EventBus,
    ahrsIndex: number | Subscribable<number>
  ) {
    this.ahrsIndex = SubscribableUtils.toSubscribable(ahrsIndex, true);
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
      throw new Error('DefaultSlipSkidDataProvider: cannot initialize a dead provider');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;
    this.isPaused = paused;

    const sub = this.bus.getSubscriber<AhrsSystemEvents>();

    this.ahrsIndexSub = this.ahrsIndex.sub((ahrsIndex) => {
      this._slipSkidBallPosition.setConsumer(sub.on(`ahrs_turn_coordinator_ball_${ahrsIndex}`));
      this._isAhrsDataValid.setConsumer(sub.on(`ahrs_attitude_data_valid_${ahrsIndex}`));
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
      throw new Error('DefaultSlipSkidDataProvider: cannot resume a dead provider');
    }

    if (!this.isPaused) {
      return;
    }

    this.isPaused = false;

    this._slipSkidBallPosition.resume();
    this._isAhrsDataValid.resume();
    this.ahrsIndexSub?.resume();
  }

  /**
   * Pauses this data provider. While paused, this data provider will not update its data.
   * @throws Error if this data provider is dead.
   */
  public pause(): void {
    if (!this.isAlive) {
      throw new Error('DefaultSlipSkidDataProvider: cannot pause a dead provider');
    }

    if (this.isPaused) {
      return;
    }

    this.isPaused = true;

    this._slipSkidBallPosition.pause();
    this._isAhrsDataValid.pause();
    this.ahrsIndexSub?.pause();
  }

  /**
   * Destroys this data provider. Once destroyed, this data provider will no longer update its provided data, and can
   * no longer be paused or resumed.
   */
  public destroy(): void {
    this.isAlive = false;

    this._slipSkidBallPosition.destroy();
    this._isAhrsDataValid.destroy();
    this.ahrsIndexSub?.destroy();
  }
}
