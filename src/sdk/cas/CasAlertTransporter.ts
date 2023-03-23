import { AnnunciationType } from '../components/Annunciatons';
import { EventBus } from '../data/EventBus';
import { ClockEvents } from '../instruments/Clock';
import { MathUtils } from '../math/MathUtils';
import { Subscribable } from '../sub/Subscribable';
import { Subscription } from '../sub/Subscription';
import { CasEvents } from './CasSystem';

/**
 * An entry describing an update function without associated state used to bind the state of an alert.
 */
type AlertTransporterNoStateUpdateEntry = {
  /** Whether this entry is paused. */
  isPaused: boolean;

  /** Whether this entry has an associated state. */
  hasState: false;

  /** This entry's update function. */
  func: (deltaTime: number) => void;
}

/**
 * An entry describing an update function with associated state used to bind the state of an alert.
 */
type AlertTransporterStateUpdateEntry = {
  /** Whether this entry is paused. */
  isPaused: boolean;

  /** Whether this entry has an associated state. */
  hasState: true;

  /** This entry's update function. */
  func: (deltaTime: number, state: any) => void;

  /** This entry's state. */
  state: any;
}

/**
 * An entry describing an update function used to bind the state of an alert.
 */
type AlertTransporterUpdateEntry = AlertTransporterNoStateUpdateEntry | AlertTransporterStateUpdateEntry;

/**
 * Transports an alert state to the CAS via the event bus.
 */
export class CasAlertTransporter {
  private static updateEntries?: AlertTransporterUpdateEntry[];
  private static previousTimestamp = -1;

  private currentValue = false;

  private readonly subs: Subscription[] = [];
  private readonly updateEntries: AlertTransporterUpdateEntry[] = [];

  private isAlive = true;
  private isPaused = false;

  /**
   * Creates an instance of a CasAlertTransporter.
   * @param bus The event bus to use with this instance.
   * @param uuid The alert UUID.
   * @param priority The alert priority.
   * @param suffix The alert suffix.
   */
  private constructor(private readonly bus: EventBus, private readonly uuid: string, private readonly priority: AnnunciationType, private readonly suffix?: string) { }

  /**
   * Sets whether or not the alert is active.
   * @param active Whether or not the alert is active.
   * @throws Error if this transporter has been destroyed.
   */
  public set(active: boolean): void {
    if (!this.isAlive) {
      throw new Error('CasAlertTransporter: cannot change an alert with a dead transporter');
    }

    if (this.currentValue !== active) {
      if (active) {
        this.bus.getPublisher<CasEvents>().pub('cas_activate_alert', { key: { uuid: this.uuid, suffix: this.suffix }, priority: this.priority }, true, false);
      } else {
        this.bus.getPublisher<CasEvents>().pub('cas_deactivate_alert', { key: { uuid: this.uuid, suffix: this.suffix }, priority: this.priority }, true, false);
      }

      this.currentValue = active;
    }
  }

  /**
   * Binds an alert state to a subscribable value.
   * @param toWatch The subscribable value to watch.
   * @param predicate The predicate that transforms the value into a boolean alert activity state.
   * @returns The modified alert transporter.
   * @throws Error if this transporter has been destroyed.
   */
  public bind<T>(toWatch: Subscribable<T>, predicate: (value: T) => boolean): this {
    if (!this.isAlive) {
      throw new Error('CasAlertTransporter: cannot bind an alert state using a dead transporter');
    }

    this.subs.push(toWatch.sub(v => this.set(predicate(v)), true, this.isPaused));
    return this;
  }

  /**
   * Binds the alert state to an update loop.
   * @param predicate The predicate that transforms the value into a boolean alert activity state.
   * @returns The modified alert transporter.
   * @throws Error if this transporter has been destroyed.
   */
  public bindUpdate(predicate: (deltaTime: number) => boolean): this {
    if (!this.isAlive) {
      throw new Error('CasAlertTransporter: cannot bind an alert state using a dead transporter');
    }

    const entry: AlertTransporterNoStateUpdateEntry = {
      isPaused: this.isPaused,
      hasState: false,
      func: (deltaTime) => this.set(predicate(deltaTime))
    };

    this.updateEntries.push(entry);

    this.initUpdateFuncs();
    CasAlertTransporter.updateEntries?.push(entry);

    return this;
  }

  /**
   * Binds the alert state to an update loop.
   * @param predicate The predicate that transforms the value into a boolean alert activity state.
   * @param state The optional state to pass into the predicate.
   * @returns The modified alert transporter.
   * @throws Error if this transporter has been destroyed.
   */
  public bindStateUpdate<T>(predicate: (deltaTime: number, state: T) => boolean, state: T): this {
    if (!this.isAlive) {
      throw new Error('CasAlertTransporter: cannot bind an alert state using a dead transporter');
    }

    const entry: AlertTransporterStateUpdateEntry = {
      isPaused: this.isPaused,
      hasState: true,
      func: (deltaTime, stateInner) => this.set(predicate(deltaTime, stateInner)),
      state
    };

    this.updateEntries.push(entry);

    this.initUpdateFuncs();
    CasAlertTransporter.updateEntries?.push(entry);

    return this;
  }

  /**
   * Resumes this transporter. When this transporter is paused, any subscribables or update loops used to bind the state
   * of this transporter's alert are also resumed. On resumption, the values of bound subscribables are evaluated
   * immediately, while the values of bound update loops will be evaluated during the next update cycle.
   * @returns This transporter, after it has been resumed.
   * @throws Error if this transporter has been destroyed.
   */
  public resume(): this {
    if (!this.isAlive) {
      throw new Error('CasAlertTransporter: cannot resume a dead transporter');
    }

    if (!this.isPaused) {
      return this;
    }

    this.isPaused = false;

    this.subs.forEach(sub => { sub.resume(true); });
    this.updateEntries.forEach(entry => { entry.isPaused = false; });

    return this;
  }

  /**
   * Pauses this transporter. When this transporter is paused, any subscribables or update loops used to bind the state
   * of this transporter's alert are also paused.
   * @returns This transporter, after it has been paused.
   * @throws Error if this transporter has been destroyed.
   */
  public pause(): this {
    if (!this.isAlive) {
      throw new Error('CasAlertTransporter: cannot pause a dead transporter');
    }

    if (this.isPaused) {
      return this;
    }

    this.isPaused = true;

    this.subs.forEach(sub => { sub.pause(); });
    if (CasAlertTransporter.updateEntries) {
      this.updateEntries.forEach(entry => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const index = CasAlertTransporter.updateEntries!.indexOf(entry);
        if (index >= 0) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          CasAlertTransporter.updateEntries!.splice(index, 1);
        }
      });
    }

    return this;
  }

  /**
   * Destroys this transporter. This will destroy any subscribables or update loops used to bind the state of this
   * transporter's alert. Once this transporter has been destroyed, it cannot be used to change the state of its alert,
   * bind the state of its alert, or be paused or resumed.
   */
  public destroy(): void {
    this.isAlive = false;

    this.subs.forEach(sub => { sub.destroy(); });
    this.updateEntries.forEach(entry => { entry.isPaused = true; });
  }

  /**
   * Creates an instance of an AlertTransporter.
   * @param bus The event bus to use with this instance.
   * @param uuid The alert UUID.
   * @param priority The alert priority.
   * @param suffix The alert suffix.
   * @returns The created AlertTransporter.
   */
  public static create(bus: EventBus, uuid: string, priority: AnnunciationType, suffix?: string): CasAlertTransporter {
    return new CasAlertTransporter(bus, uuid, priority, suffix);
  }

  /**
   * Initializes the update functions.
   */
  private initUpdateFuncs(): void {
    if (CasAlertTransporter.updateEntries === undefined) {
      CasAlertTransporter.updateEntries = [];
      this.bus.getSubscriber<ClockEvents>().on('simTime').handle((timestamp) => {
        if (CasAlertTransporter.previousTimestamp === -1) {
          CasAlertTransporter.previousTimestamp = timestamp;
        }

        const deltaTime = MathUtils.clamp(timestamp - CasAlertTransporter.previousTimestamp, 0, 10000);

        if (CasAlertTransporter.updateEntries !== undefined) {
          for (let i = 0; i < CasAlertTransporter.updateEntries.length; i++) {
            const entry = CasAlertTransporter.updateEntries[i];
            if (entry.isPaused) {
              continue;
            }
            if (entry.hasState) {
              entry.func(deltaTime, entry.state);
            } else {
              entry.func(deltaTime);
            }
          }
        }

        CasAlertTransporter.previousTimestamp = timestamp;
      });
    }
  }
}