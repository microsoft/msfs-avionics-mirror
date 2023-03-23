import { ClockEvents, ConsumerSubject, EventBus, FlightTimerEvents, Subscribable } from '@microsoft/msfs-sdk';
import { GarminTimerManager } from '@microsoft/msfs-garminsdk';

/**
 * A data provider for a time information display.
 */
export interface TimeInfoDataProvider {
  /** The current sim time, as a UNIX timestamp in milliseconds. */
  readonly time: Subscribable<number>;

  /** The current timer value, in milliseconds. */
  readonly timerValue: Subscribable<number>;
}

/**
 * A default implementation of {@link TimeInfoDataProvider}.
 */
export class DefaultTimeInfoDataProvider implements TimeInfoDataProvider {
  private readonly _time = ConsumerSubject.create(null, 0);
  /** @inheritdoc */
  public readonly time = this._time as Subscribable<number>;

  private readonly _timerValue = ConsumerSubject.create(null, 0);
  /** @inheritdoc */
  public readonly timerValue = this._timerValue as Subscribable<number>;

  private isInit = false;
  private isAlive = true;
  private isPaused = false;

  /**
   * Constructor.
   * @param bus The event bus.
   * @param genericTimerIndex The index of the generic timer used by this data provider.
   */
  constructor(private readonly bus: EventBus, private readonly genericTimerIndex: number) {
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
      throw new Error('DefaultTimeInfoDataProvider: cannot initialize a dead provider');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;
    this.isPaused = paused;

    const sub = this.bus.getSubscriber<ClockEvents & FlightTimerEvents>();

    this._time.setConsumer(sub.on('simTime'));
    this._timerValue.setConsumer(sub.on(`timer_value_ms_${GarminTimerManager.GENERIC_TIMER_INDEX + this.genericTimerIndex - 1}`));

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
      throw new Error('DefaultTimeInfoDataProvider: cannot resume a dead provider');
    }

    if (!this.isPaused) {
      return;
    }

    this.isPaused = false;

    this._time.resume();
    this._timerValue.resume();
  }

  /**
   * Pauses this data provider. Once paused, this data provider will not update its data until it is resumed.
   * @throws Error if this data provider is dead.
   */
  public pause(): void {
    if (!this.isAlive) {
      throw new Error('DefaultTimeInfoDataProvider: cannot pause a dead provider');
    }

    if (this.isPaused) {
      return;
    }

    this._time.pause();
    this._timerValue.pause();
  }

  /**
   * Destroys this data provider. Once destroyed, this data provider will no longer update its provided data, and can
   * no longer be paused or resumed.
   */
  public destroy(): void {
    this.isAlive = false;

    this._time.destroy();
    this._timerValue.destroy();
  }
}