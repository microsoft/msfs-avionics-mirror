import { ConsumerSubject, EventBus, LNavEvents, MappedSubject, NavEvents, Subscribable } from '@microsoft/msfs-sdk';
import { GarminControlEvents } from '../instruments/GarminControlEvents';

/**
 * LNAV OBS/suspend modes.
 */
export enum ObsSuspModes {
  NONE,
  SUSP,
  OBS
}

/**
 * A provider for LNAV OBS/suspend data.
 */
export interface ObsSuspDataProvider {
  /** The current LNAV OBS/suspend mode. */
  readonly mode: Subscribable<ObsSuspModes>;

  /** Whether OBS mode can be activated. */
  readonly isObsAvailable: Subscribable<boolean>;

  /** The current magnetic OBS course, in degrees. */
  readonly obsCourse: Subscribable<number>;
}

/**
 * A default implementation of {@link ObsSuspDataProvider}.
 */
export class DefaultObsSuspDataProvider implements ObsSuspDataProvider {
  private readonly isLNavSuspended = ConsumerSubject.create(null, false);
  private readonly isObsActive = ConsumerSubject.create(null, false);

  public readonly mode = MappedSubject.create(
    ([isLNavSuspended, isObsActive]): ObsSuspModes => {
      return isObsActive
        ? ObsSuspModes.OBS
        : isLNavSuspended ? ObsSuspModes.SUSP : ObsSuspModes.NONE;
    },
    this.isLNavSuspended,
    this.isObsActive
  ) as Subscribable<ObsSuspModes>;

  private readonly _isObsAvailable = ConsumerSubject.create(null, false);
  /** @inheritdoc */
  public readonly isObsAvailable = this._isObsAvailable as Subscribable<boolean>;

  private readonly _obsCourse = ConsumerSubject.create(null, 0);
  /** @inheritdoc */
  public readonly obsCourse = this._obsCourse as Subscribable<number>;

  private isAlive = true;
  private isInit = false;
  private isPaused = false;

  /**
   * Constructor.
   * @param bus The event bus.
   */
  public constructor(private readonly bus: EventBus) {
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
      throw new Error('DefaultHsiDataProvider: cannot initialize a dead provider');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;
    this.isPaused = paused;

    const sub = this.bus.getSubscriber<LNavEvents & NavEvents & GarminControlEvents>();

    this.isLNavSuspended.setConsumer(sub.on('lnav_is_suspended'));
    this.isObsActive.setConsumer(sub.on('gps_obs_active'));

    this._isObsAvailable.setConsumer(sub.on('obs_available'));
    this._obsCourse.setConsumer(sub.on('gps_obs_value'));

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
      throw new Error('DefaultObsSuspDataProvider: cannot resume a dead provider');
    }

    if (!this.isInit || !this.isPaused) {
      return;
    }

    this.isPaused = false;

    this.isLNavSuspended.resume();
    this.isObsActive.resume();

    this._isObsAvailable.resume();
    this._obsCourse.resume();
  }

  /**
   * Pauses this data provider. Once paused, this data provider will not update its data until it is resumed.
   * @throws Error if this data provider is dead.
   */
  public pause(): void {
    if (!this.isAlive) {
      throw new Error('DefaultObsSuspDataProvider: cannot pause a dead provider');
    }

    if (!this.isInit || this.isPaused) {
      return;
    }

    this.isLNavSuspended.pause();
    this.isObsActive.pause();

    this._isObsAvailable.resume();
    this._obsCourse.pause();

    this.isPaused = true;
  }

  /**
   * Destroys this data provider. Once destroyed, this data provider will no longer update its provided data, and can
   * no longer be paused or resumed.
   */
  public destroy(): void {
    this.isAlive = false;

    this.isLNavSuspended.destroy();
    this.isObsActive.destroy();

    this._isObsAvailable.destroy();
    this._obsCourse.destroy();
  }
}