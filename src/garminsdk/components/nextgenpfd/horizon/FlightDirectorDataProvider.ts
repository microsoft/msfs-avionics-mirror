import {
  APEvents, ClockEvents, ConsumerSubject, ConsumerValue, EventBus, ExpSmoother, Subject, Subscribable, Subscription
} from '@microsoft/msfs-sdk';

import { GarminControlEvents } from '../../../instruments/GarminControlEvents';

/**
 * A data provider for a flight director.
 */
export interface FlightDirectorDataProvider {
  /** Whether the flight director is active. */
  readonly isFdActive: Subscribable<boolean>;

  /** The pitch commanded by the flight director, in degrees. Positive values indicated upward pitch. */
  readonly fdPitch: Subscribable<number>;

  /** The bank commanded by the flight director, in degrees. Positive values indicate rightward bank. */
  readonly fdBank: Subscribable<number>;
}

/**
 * A default implementation of {@link FlightDirectorDataProvider} which smooths pitch and bank commands.
 */
export class DefaultFlightDirectorDataProvider implements FlightDirectorDataProvider {
  private readonly _isFdActive = Subject.create(false);
  /** @inheritdoc */
  public readonly isFdActive = this._isFdActive as Subscribable<boolean>;

  private readonly _fdPitch = Subject.create(0);
  /** @inheritdoc */
  public readonly fdPitch = this._fdPitch as Subscribable<number>;

  private readonly _fdBank = Subject.create(0);
  /** @inheritdoc */
  public readonly fdBank = this._fdBank as Subscribable<number>;

  private readonly isFdActiveSource = ConsumerSubject.create(null, false).pause();
  private readonly fdPitchSource = ConsumerValue.create(null, 0).pause();
  private readonly fdBankSource = ConsumerValue.create(null, 0).pause();

  private readonly simRate = ConsumerValue.create(null, 1).pause();

  private readonly pitchSmoother: ExpSmoother;
  private readonly bankSmoother: ExpSmoother;

  private isFdNotInstalled = false;

  private lastUpdateTime: number | undefined = undefined;

  private readonly pauseable = [
    this.isFdActiveSource,
    this.fdPitchSource,
    this.fdBankSource,
    this.simRate
  ];

  private fdNotInstalledSub?: Subscription;

  private isInit = false;
  private isAlive = true;
  private isPaused = true;

  /**
   * Constructor.
   * @param bus The event bus.
   * @param pitchSmoothingTau The time constant used for smoothing pitch commands, in milliseconds.
   * @param bankSmoothingTau The time constant used for smoothing bank commands, in milliseconds.
   */
  constructor(
    private readonly bus: EventBus,
    pitchSmoothingTau: number,
    bankSmoothingTau: number
  ) {
    this.pitchSmoother = new ExpSmoother(pitchSmoothingTau);
    this.bankSmoother = new ExpSmoother(bankSmoothingTau);
  }

  /**
   * Initializes this data provider. Once initialized, this data provider will continuously update its data until
   * paused or destroyed.
   * @param paused Whether to initialize this data provider as paused. If `true`, this data provider will provide an
   * initial set of data but will not update the provided data until it is resumed. Defaults to `false`.
   * @throws Error if this data provider has been destroyed.
   */
  public init(paused = false): void {
    if (!this.isAlive) {
      throw new Error('DefaultFlightDirectorDataProvider: cannot initialize a dead provider');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    const sub = this.bus.getSubscriber<APEvents & GarminControlEvents & ClockEvents>();

    this.isFdActiveSource.pipe(this._isFdActive);

    this.isFdActiveSource.setConsumer(sub.on('flight_director_is_active_1'));
    this.fdPitchSource.setConsumer(sub.on('flight_director_pitch'));
    this.fdBankSource.setConsumer(sub.on('flight_director_bank'));

    this.simRate.setConsumer(sub.on('simRate'));

    this.fdNotInstalledSub = sub.on('fd_not_installed').handle(value => {
      if (value) {
        this.isFdNotInstalled = true;

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.fdNotInstalledSub!.destroy();
        this.isFdActiveSource.setConsumer(null);
        this.fdPitchSource.setConsumer(null);
        this.fdBankSource.setConsumer(null);
        this.simRate.setConsumer(null);

        this._isFdActive.set(false);
        this._fdPitch.set(0);
        this._fdBank.set(0);
      }
    }, true);
    this.fdNotInstalledSub.resume(true);

    if (!paused) {
      this.resume();
    }
  }

  /**
   * Resumes this data provider. Once resumed, this data provider will continuously update its data until paused or
   * destroyed.
   * @throws Error if this data provider has been destroyed.
   */
  public resume(): void {
    if (!this.isAlive) {
      throw new Error('DefaultFlightDirectorDataProvider: cannot resume a dead provider');
    }

    if (!this.isPaused || !this.isInit) {
      return;
    }

    this.isPaused = false;

    for (const pauseable of this.pauseable) {
      pauseable.resume();
    }
  }

  /**
   * Pauses this data provider. Once paused, this data provider will not update its data until it is resumed.
   * @throws Error if this data provider has been destroyed.
   */
  public pause(): void {
    if (!this.isAlive) {
      throw new Error('DefaultFlightDirectorDataProvider: cannot pause a dead provider');
    }

    if (this.isPaused || !this.isInit) {
      return;
    }

    this.isPaused = true;

    for (const pauseable of this.pauseable) {
      pauseable.pause();
    }

    this.pitchSmoother.reset();
    this.bankSmoother.reset();
  }

  /**
   * Updates this data provider.
   * @param time The current real (operating system) time, as a UNIX timestamp in milliseconds.
   */
  public update(time: number): void {
    if (this.isFdNotInstalled) {
      return;
    }

    const dt = (this.lastUpdateTime === undefined ? 0 : Math.max(0, time - this.lastUpdateTime)) * this.simRate.get();
    this.lastUpdateTime = time;

    // Sim flight director pitch/bank are positive-down/left, respectively.
    this._fdPitch.set(this.pitchSmoother.next(-this.fdPitchSource.get(), dt));
    this._fdBank.set(this.bankSmoother.next(-this.fdBankSource.get(), dt));
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

    this.fdNotInstalledSub?.destroy();
  }
}