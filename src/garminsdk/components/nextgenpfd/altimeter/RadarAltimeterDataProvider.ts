import { AvionicsSystemState, ClockEvents, ConsumerSubject, EventBus, LinearServo, MathUtils, Subject, Subscribable, SubscribableUtils, Subscription } from 'msfssdk';

import { RadarAltimeterSystemEvents } from '../../../system/RadarAltimeterSystem';

/**
 * A data provider for a radar altimeter.
 */
export interface RadarAltimeterDataProvider {
  /** The current radar altitude, in feet, or `NaN` if the radar altitude is above the maximum threshold (2500 feet). */
  readonly radarAlt: Subscribable<number>;

  /** Whether radar altitude data is in a failure state. */
  readonly isDataFailed: Subscribable<boolean>;
}

/**
 * A default implementation of {@link RadarAltimeterDataProvider}.
 */
export class DefaultRadarAltimeterDataProvider implements RadarAltimeterDataProvider {
  private static readonly ROUND_FUNC = (radarAlt: number): number => {
    if (radarAlt > 1500) {
      return MathUtils.round(radarAlt, 50);
    } else if (radarAlt > 200) {
      return MathUtils.round(radarAlt, 10);
    } else {
      return Math.max(MathUtils.round(radarAlt, 5), 0);
    }
  };

  private readonly radarAltSource = ConsumerSubject.create(null, 0);
  private readonly radarAltRounded = this.radarAltSource.map(
    radarAlt => {
      if (radarAlt > 2500) {
        return NaN;
      } else {
        return DefaultRadarAltimeterDataProvider.ROUND_FUNC(radarAlt);
      }
    },
    SubscribableUtils.NUMERIC_NAN_EQUALITY
  );
  private readonly _radarAlt = Subject.create<number>(0, SubscribableUtils.NUMERIC_NAN_EQUALITY);
  /** @inheritdoc */
  public readonly radarAlt = this._radarAlt as Subscribable<number>;

  private readonly _isDataFailed = Subject.create(false);
  /** @inheritdoc */
  public readonly isDataFailed = this._isDataFailed as Subscribable<boolean>;

  private readonly servo = new LinearServo(150);
  private currentValue = NaN;

  private radarAltSystemStateSub?: Subscription;
  private radarAltRoundedSub?: Subscription;
  private clockSub?: Subscription;

  private isInit = false;
  private isAlive = true;
  private isPaused = false;

  /**
   * Constructor.
   * @param bus The event bus.
   */
  constructor(private readonly bus: EventBus) {
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
      throw new Error('DefaultRadarAltimeterDataProvider: cannot initialize a dead provider');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;
    this.isPaused = paused;

    const sub = this.bus.getSubscriber<RadarAltimeterSystemEvents & ClockEvents>();

    this.radarAltSystemStateSub = sub.on('radaralt_state_1').handle(state => {
      if (state.current === AvionicsSystemState.On) {
        this._isDataFailed.set(false);
      } else {
        this._isDataFailed.set(true);
      }
    });

    this.radarAltSource.setConsumer(sub.on('radaralt_radio_alt_1'));

    this.radarAltRoundedSub = this.radarAltRounded.sub(() => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.radarAltRoundedSub!.pause();

      this.servo.drive(this.currentValue, this.currentValue); // reset servo's internal clock
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.clockSub!.resume(true);
    }, false, true);

    this.clockSub = sub.on('realTime').handle(() => {
      const rounded = this.radarAltRounded.get();

      if (isNaN(rounded) || isNaN(this.currentValue)) {
        this.currentValue = this.servo.drive(rounded, rounded);
      } else {
        this.currentValue = this.servo.drive(this.currentValue, rounded);
      }

      this._radarAlt.set(isNaN(this.currentValue) ? NaN : DefaultRadarAltimeterDataProvider.ROUND_FUNC(this.currentValue));

      if (isNaN(this.currentValue) || this.currentValue === rounded) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.clockSub!.pause();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.radarAltRoundedSub!.resume();
      }
    }, true);

    this.radarAltRoundedSub.resume(true);

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
      throw new Error('DefaultRadarAltimeterDataProvider: cannot resume a dead provider');
    }

    if (!this.isPaused || !this.isInit) {
      return;
    }

    this.isPaused = false;

    this.radarAltSource.resume();
    this.radarAltRoundedSub?.resume(true);
    this.radarAltSystemStateSub?.resume(true);
  }

  /**
   * Pauses this data provider. Once paused, this data provider will not update its data until it is resumed.
   * @throws Error if this data provider is dead.
   */
  public pause(): void {
    if (!this.isAlive) {
      throw new Error('DefaultRadarAltimeterDataProvider: cannot pause a dead provider');
    }

    if (this.isPaused || !this.isInit) {
      return;
    }

    this.radarAltSystemStateSub?.pause();
    this.radarAltSource.pause();
    this.clockSub?.pause();

    this.currentValue = NaN;

    this.isPaused = true;
  }

  /**
   * Destroys this data provider. Once destroyed, this data provider will no longer update its provided data, and can
   * no longer be paused or resumed.
   */
  public destroy(): void {
    this.isAlive = false;

    this.radarAltSource.destroy();
    this.clockSub?.destroy();
    this.radarAltSystemStateSub?.destroy();
  }
}