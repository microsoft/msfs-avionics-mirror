import {
  BitFlags, EventBus, Subject, Subscribable, Subscription, Tcas, TcasEvents, TcasResolutionAdvisoryFlags, TcasResolutionAdvisoryType, UnitType
} from '@microsoft/msfs-sdk';

/**
 * A provider of TCAS-II resolution advisory vertical speed commands.
 */
export interface TcasRaCommandDataProvider {
  /**
   * The minimum allowed vertical speed, in feet per minute, commanded by the current resolution advisory, or `null`
   * if there is no such value.
   */
  readonly raMinVs: Subscribable<number | null>;

  /**
   * The maximum allowed vertical speed, in feet per minute, commanded by the current resolution advisory, or `null`
   * if there is no such value.
   */
  readonly raMaxVs: Subscribable<number | null>;

  /**
   * The lower bound vertical speed, in feet per minute, of the current resolution advisory's fly-to command, or
   * `null` if there is no such value.
   */
  readonly raFlyToMinVs: Subscribable<number | null>;

  /**
   * The upper bound vertical speed, in feet per minute, of the current resolution advisory's fly-to command, or
   * `null` if there is no such value.
   */
  readonly raFlyToMaxVs: Subscribable<number | null>;
}

/**
 * A default implementation of {@link TcasRaCommandDataProvider}.
 */
export class DefaultTcasRaCommandDataProvider implements TcasRaCommandDataProvider {

  private readonly _raMinVs = Subject.create<number | null>(null);
  /** @inheritdoc */
  public readonly raMinVs = this._raMinVs as Subscribable<number | null>;

  private readonly _raMaxVs = Subject.create<number | null>(null);
  /** @inheritdoc */
  public readonly raMaxVs = this._raMaxVs as Subscribable<number | null>;

  private readonly _raFlyToMinVs = Subject.create<number | null>(null);
  /** @inheritdoc */
  public readonly raFlyToMinVs = this._raFlyToMinVs as Subscribable<number | null>;

  private readonly _raFlyToMaxVs = Subject.create<number | null>(null);
  /** @inheritdoc */
  public readonly raFlyToMaxVs = this._raFlyToMaxVs as Subscribable<number | null>;

  private isInit = false;
  private isAlive = true;
  private isPaused = false;

  private readonly tcasRaSubs: Subscription[] = [];

  /**
   * Constructor.
   * @param bus The event bus.
   * @param tcas The TCAS which from which this data provider sources resolution advisory commands.
   */
  constructor(private readonly bus: EventBus, public readonly tcas: Tcas) {
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
      throw new Error('DefaultTcasRaCommandDataProvider: cannot initialize a dead provider');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;
    this.isPaused = paused;

    const sub = this.bus.getSubscriber<TcasEvents>();

    const updateRaSpeeds = this.updateRaSpeeds.bind(this);

    updateRaSpeeds();
    this.tcasRaSubs.push(
      sub.on('tcas_ra_issued').handle(updateRaSpeeds),
      sub.on('tcas_ra_updated').handle(updateRaSpeeds),
      sub.on('tcas_ra_canceled').handle(updateRaSpeeds)
    );

    if (paused) {
      this.pause();
    }
  }

  /**
   * Update vertical speeds commanded by TCAS resolution advisories.
   */
  private updateRaSpeeds(): void {
    const host = this.tcas.getResolutionAdvisoryHost();

    if (host.primaryType === TcasResolutionAdvisoryType.Clear) {
      this._raMinVs.set(null);
      this._raMaxVs.set(null);
      this._raFlyToMinVs.set(null);
      this._raFlyToMaxVs.set(null);
      return;
    }

    const minVsFpm = host.minVerticalSpeed.asUnit(UnitType.FPM);
    const maxVsFpm = host.maxVerticalSpeed.asUnit(UnitType.FPM);

    if (host.secondaryType === null) {
      // Single RA

      if (BitFlags.isAll(host.primaryFlags, TcasResolutionAdvisoryFlags.UpSense)) {
        // Upward sense
        this._raMaxVs.set(null);
        this._raMinVs.set(minVsFpm > -100 && minVsFpm < 100 ? -100 : minVsFpm);
      } else {
        // Downward sense
        this._raMinVs.set(null);
        this._raMaxVs.set(maxVsFpm > -100 && maxVsFpm < 100 ? 100 : maxVsFpm);
      }

      if (BitFlags.isAny(host.primaryFlags, TcasResolutionAdvisoryFlags.Climb | TcasResolutionAdvisoryFlags.Descend)) {
        // Corrective positive
        this._raFlyToMaxVs.set(maxVsFpm);
        this._raFlyToMinVs.set(minVsFpm);
      } else if (host.primaryType === TcasResolutionAdvisoryType.ReduceDescent) {
        // Corrective upward negative
        this._raFlyToMinVs.set(-100);
        this._raFlyToMaxVs.set(500);
      } else if (host.primaryType === TcasResolutionAdvisoryType.ReduceClimb) {
        // Corrective downward negative
        this._raFlyToMinVs.set(-500);
        this._raFlyToMaxVs.set(100);
      } else {
        // Preventative
        this._raFlyToMinVs.set(null);
        this._raFlyToMaxVs.set(null);
      }
    } else {
      // Composite RA

      const minVs = minVsFpm > -100 && minVsFpm < 100 ? -100 : minVsFpm;
      const maxVs = maxVsFpm > -100 && maxVsFpm < 100 ? 100 : maxVsFpm;

      this._raMinVs.set(minVs);
      this._raMaxVs.set(maxVs);

      if (host.primaryType === TcasResolutionAdvisoryType.ReduceDescent) {
        // Corrective upward negative primary
        this._raFlyToMinVs.set(-100);
        this._raFlyToMaxVs.set(Math.min(maxVs, 500));
      } else if (host.primaryType === TcasResolutionAdvisoryType.ReduceClimb) {
        // Corrective downward negative primary
        this._raFlyToMinVs.set(Math.max(minVs, -500));
        this._raFlyToMaxVs.set(100);
      } else {
        // Preventative primary
        this._raFlyToMinVs.set(null);
        this._raFlyToMaxVs.set(null);
      }
    }
  }

  /**
   * Resumes this data provider. Once resumed, this data provider will continuously update its data until paused or
   * destroyed.
   * @throws Error if this data provider has been destroyed.
   */
  public resume(): void {
    if (!this.isAlive) {
      throw new Error('DefaultTcasRaCommandDataProvider: cannot resume a dead provider');
    }

    if (!this.isPaused) {
      return;
    }

    this.isPaused = false;

    this.updateRaSpeeds();
    this.tcasRaSubs.forEach(sub => { sub.resume(); });
  }

  /**
   * Pauses this data provider. Once paused, this data provider will not update its data until it is resumed.
   * @throws Error if this data provider has been destroyed.
   */
  public pause(): void {
    if (!this.isAlive) {
      throw new Error('DefaultTcasRaCommandDataProvider: cannot pause a dead provider');
    }

    if (this.isPaused) {
      return;
    }

    this.tcasRaSubs.forEach(sub => { sub.pause(); });

    this.isPaused = true;
  }

  /**
   * Destroys this data provider. Once destroyed, this data provider will no longer update its provided data, and can
   * no longer be paused or resumed.
   */
  public destroy(): void {
    this.isAlive = false;

    this.tcasRaSubs.forEach(sub => { sub.destroy(); });
  }
}
