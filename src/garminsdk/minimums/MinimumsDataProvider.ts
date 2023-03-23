import { ClockEvents, ConsumerSubject, EventBus, MappedSubject, MinimumsEvents, MinimumsMode, Subject, Subscribable } from '@microsoft/msfs-sdk';

/**
 * A data provider for a minimums display.
 */
export interface MinimumsDataProvider {
  /** The current minimums mode. */
  readonly mode: Subscribable<MinimumsMode>;

  /** The current active minimums, in feet, or `null` if no such value exists. */
  readonly minimums: Subscribable<number | null>;

  /** The current baro minimums, in feet. */
  readonly baroMinimums: Subscribable<number>;

  /** The current radar minimums, in feet. */
  readonly radarMinimums: Subscribable<number>;
}

/**
 * A default implementation of {@link MinimumsDataProvider}.
 */
export class DefaultMinimumsDataProvider implements MinimumsDataProvider {
  private readonly _mode = ConsumerSubject.create(null, MinimumsMode.OFF);
  public readonly mode = this._mode as Subscribable<MinimumsMode>;

  private readonly _minimums = Subject.create<number | null>(null);
  /** @inheritdoc */
  public readonly minimums = this._minimums as Subscribable<number | null>;

  private readonly baroMinimumsSource = ConsumerSubject.create(null, 0);
  /** @inheritdoc */
  public readonly baroMinimums = this.baroMinimumsSource as Subscribable<number>;

  private readonly radarMinimumsSource = ConsumerSubject.create(null, 0);
  /** @inheritdoc */
  public readonly radarMinimums = this.radarMinimumsSource as Subscribable<number>;

  private isInit = false;
  private isAlive = true;
  private isPaused = false;

  /**
   * Constructor.
   * @param bus The event bus.
   * @param supportRadarMinimums Whether to support radar minimums.
   */
  constructor(private readonly bus: EventBus, private readonly supportRadarMinimums: boolean) {
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
      throw new Error('DefaultMinimumsDataProvider: cannot initialize a dead provider');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;
    this.isPaused = paused;

    const sub = this.bus.getSubscriber<MinimumsEvents & ClockEvents>();

    this._mode.setConsumer(sub.on('minimums_mode'));
    this.baroMinimumsSource.setConsumer(sub.on('decision_altitude_feet'));

    const baroMinimums = MappedSubject.create(
      ([minimumsMode, baroMinimumsSource]): number | null => {
        return minimumsMode === MinimumsMode.BARO ? baroMinimumsSource : null;
      },
      this._mode,
      this.baroMinimumsSource
    );

    if (this.supportRadarMinimums) {
      this.radarMinimumsSource.setConsumer(sub.on('decision_height_feet'));

      baroMinimums.pause();
      const baroPipe = baroMinimums.pipe(this._minimums, true);

      const radarMinimums = MappedSubject.create(
        ([minimumsMode, radarMinimumsSource]): number | null => {
          return minimumsMode === MinimumsMode.RA ? radarMinimumsSource : null;
        },
        this._mode,
        this.radarMinimumsSource
      );
      radarMinimums.pause();
      const radarPipe = radarMinimums.pipe(this._minimums, true);

      this._mode.sub(minimumsMode => {
        baroMinimums.pause();
        baroPipe.pause();

        radarMinimums.pause();
        radarPipe.pause();

        switch (minimumsMode) {
          case MinimumsMode.BARO:
            baroMinimums.resume();
            baroPipe.resume(true);
            break;
          case MinimumsMode.RA:
            radarMinimums.resume();
            radarPipe.resume(true);
            break;
          default:
            this._minimums.set(null);
        }
      }, true);
    } else {
      baroMinimums.pipe(this._minimums);
    }

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
      throw new Error('DefaultMinimumsDataProvider: cannot resume a dead provider');
    }

    if (!this.isPaused || !this.isInit) {
      return;
    }

    this.isPaused = false;

    this._mode.resume();
    this.baroMinimumsSource.resume();
    this.radarMinimumsSource.resume();
  }

  /**
   * Pauses this data provider. Once paused, this data provider will not update its data until it is resumed.
   * @throws Error if this data provider is dead.
   */
  public pause(): void {
    if (!this.isAlive) {
      throw new Error('DefaultMinimumsDataProvider: cannot pause a dead provider');
    }

    if (this.isPaused || !this.isInit) {
      return;
    }

    this._mode.pause();
    this.baroMinimumsSource.pause();
    this.radarMinimumsSource.pause();

    this.isPaused = true;
  }

  /**
   * Destroys this data provider. Once destroyed, this data provider will no longer update its provided data, and can
   * no longer be paused or resumed.
   */
  public destroy(): void {
    this.isAlive = false;

    this._mode.destroy();
    this.baroMinimumsSource.destroy();
    this.radarMinimumsSource.destroy();
  }
}