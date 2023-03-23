import { EventBus } from '../data/EventBus';
import { SetSubject } from '../sub/SetSubject';
import { SubscribableSet } from '../sub/SubscribableSet';
import { Subscription } from '../sub/Subscription';
import { Tcas, TcasAlertLevel, TcasEvents, TcasIntruder } from './Tcas';

/**
 * A data provider for TCAS advisories.
 */
export interface TcasAdvisoryDataProvider {
  /** The set of intruders associated with active proximity advisories. */
  readonly paIntruders: SubscribableSet<TcasIntruder>;

  /** The set of intruders associated with active traffic advisories. */
  readonly taIntruders: SubscribableSet<TcasIntruder>;

  /** The set of intruders associated with active resolution advisories. */
  readonly raIntruders: SubscribableSet<TcasIntruder>;
}

/**
 * A default implementation of {@link TcasAdvisoryDataProvider}.
 */
export class DefaultTcasAdvisoryDataProvider implements TcasAdvisoryDataProvider {

  private readonly _paIntruders = SetSubject.create<TcasIntruder>();
  public readonly paIntruders = this._paIntruders as SubscribableSet<TcasIntruder>;

  private readonly _taIntruders = SetSubject.create<TcasIntruder>();
  public readonly taIntruders = this._taIntruders as SubscribableSet<TcasIntruder>;

  private readonly _raIntruders = SetSubject.create<TcasIntruder>();
  public readonly raIntruders = this._raIntruders as SubscribableSet<TcasIntruder>;

  private isInit = false;
  private isAlive = true;
  private isPaused = false;

  private intruderAlertLevelSub?: Subscription;
  private intruderRemovedSub?: Subscription;

  /**
   * Constructor.
   * @param bus The event bus.
   * @param tcas The TCAS instance.
   */
  constructor(
    private readonly bus: EventBus,
    private readonly tcas: Tcas
  ) {
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
      throw new Error('DefaultTcasAdvisoryDataProvider: cannot initialize a dead provider');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;
    this.isPaused = paused;

    this.updateIntruders();

    const sub = this.bus.getSubscriber<TcasEvents>();

    this.intruderAlertLevelSub = sub.on('tcas_intruder_alert_changed').handle(intruder => {
      const alertLevel = intruder.alertLevel.get();

      this._paIntruders.toggle(intruder, alertLevel === TcasAlertLevel.ProximityAdvisory);
      this._taIntruders.toggle(intruder, alertLevel === TcasAlertLevel.TrafficAdvisory);
      this._raIntruders.toggle(intruder, alertLevel === TcasAlertLevel.ResolutionAdvisory);
    });

    this.intruderRemovedSub = sub.on('tcas_intruder_removed').handle(intruder => {
      this._paIntruders.delete(intruder);
      this._taIntruders.delete(intruder);
      this._raIntruders.delete(intruder);
    });

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
      throw new Error('DefaultTcasAdvisoryDataProvider: cannot resume a dead provider');
    }

    if (!this.isPaused) {
      return;
    }

    this.isPaused = false;

    this.updateIntruders();

    this.intruderAlertLevelSub?.resume();
    this.intruderRemovedSub?.resume();
  }

  /**
   * Pauses this data provider. Once paused, this data provider will not update its data until it is resumed.
   * @throws Error if this data provider is dead.
   */
  public pause(): void {
    if (!this.isAlive) {
      throw new Error('DefaultTcasAdvisoryDataProvider: cannot pause a dead provider');
    }

    if (this.isPaused) {
      return;
    }

    this.isPaused = true;

    this.intruderAlertLevelSub?.pause();
    this.intruderRemovedSub?.pause();
  }

  /**
   * Updates this provider's sets of intruders associated with active advisories.
   */
  private updateIntruders(): void {
    const paIntruders = new Set<TcasIntruder>();
    const taIntruders = new Set<TcasIntruder>();
    const raIntruders = new Set<TcasIntruder>();

    // Collect the sets of intruders associated with each type of advisory.

    const intruders = this.tcas.getIntruders();
    for (let i = 0; i < intruders.length; i++) {
      const intruder = intruders[i];
      switch (intruder.alertLevel.get()) {
        case TcasAlertLevel.ProximityAdvisory:
          paIntruders.add(intruder);
          break;
        case TcasAlertLevel.TrafficAdvisory:
          taIntruders.add(intruder);
          break;
        case TcasAlertLevel.ResolutionAdvisory:
          raIntruders.add(intruder);
          break;
      }
    }

    // From each set, remove all intruders no longer associated with that type of advisory.

    for (const intruder of this._paIntruders.get()) {
      if (!paIntruders.delete(intruder)) {
        this._paIntruders.delete(intruder);
      }
    }
    for (const intruder of this._taIntruders.get()) {
      if (!taIntruders.delete(intruder)) {
        this._taIntruders.delete(intruder);
      }
    }
    for (const intruder of this._raIntruders.get()) {
      if (!raIntruders.delete(intruder)) {
        this._raIntruders.delete(intruder);
      }
    }

    // Add the new intruders associated with each type of advisory to each set.

    for (const intruder of paIntruders) {
      this._paIntruders.add(intruder);
    }
    for (const intruder of taIntruders) {
      this._taIntruders.add(intruder);
    }
    for (const intruder of raIntruders) {
      this._raIntruders.add(intruder);
    }
  }

  /**
   * Destroys this data provider. Once destroyed, this data provider will no longer update its provided data, and can
   * no longer be paused or resumed.
   */
  public destroy(): void {
    this.isAlive = false;

    this.intruderAlertLevelSub?.destroy();
    this.intruderRemovedSub?.destroy();
  }
}