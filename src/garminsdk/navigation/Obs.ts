import {
  ConsumerSubject, EventBus, LNavEvents, LNavObsEvents, LNavUtils, MappedSubject, Subject, Subscribable, SubscribableUtils,
  Subscription
} from '@microsoft/msfs-sdk';

import { LNavDataEvents } from './LNavDataEvents';

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
 * Configuration options for {@link DefaultObsSuspDataProvider}.
 */
export type DefaultObsSuspDataProviderOptions = {
  /** The index of the LNAV from which to source data. Defaults to `0`. */
  lnavIndex?: number | Subscribable<number>;
}

/**
 * A default implementation of {@link ObsSuspDataProvider}.
 */
export class DefaultObsSuspDataProvider implements ObsSuspDataProvider {
  private readonly lnavIndex: Subscribable<number>;

  private readonly isLNavIndexValid = Subject.create(false);
  private readonly isLNavSuspended = ConsumerSubject.create(null, false).pause();
  private readonly isObsActive = ConsumerSubject.create(null, false).pause();

  /** @inheritDoc */
  public readonly mode = MappedSubject.create(
    ([isLNavIndexValid, isLNavSuspended, isObsActive]): ObsSuspModes => {
      if (!isLNavIndexValid) {
        return ObsSuspModes.NONE;
      }

      return isObsActive
        ? ObsSuspModes.OBS
        : isLNavSuspended ? ObsSuspModes.SUSP : ObsSuspModes.NONE;
    },
    this.isLNavIndexValid,
    this.isLNavSuspended,
    this.isObsActive
  ) as Subscribable<ObsSuspModes>;

  private readonly _isObsAvailable = ConsumerSubject.create(null, false).pause();
  /** @inheritDoc */
  public readonly isObsAvailable = this._isObsAvailable as Subscribable<boolean>;

  private readonly _obsCourse = ConsumerSubject.create(null, 0).pause();
  /** @inheritDoc */
  public readonly obsCourse = this._obsCourse as Subscribable<number>;

  private isAlive = true;
  private isInit = false;
  private isPaused = true;

  private lnavIndexSub?: Subscription;

  /**
   * Creates a new instance of DefaultObsSuspDataProvider.
   * @param bus The event bus.
   * @param options Options with which to configure the data provider.
   */
  public constructor(
    private readonly bus: EventBus,
    options?: Readonly<DefaultObsSuspDataProviderOptions>
  ) {
    this.lnavIndex = SubscribableUtils.toSubscribable(options?.lnavIndex ?? 0, true);
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
      throw new Error('DefaultObsSuspDataProvider: cannot initialize a dead provider');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    const sub = this.bus.getSubscriber<LNavEvents & LNavDataEvents & LNavObsEvents>();

    this.lnavIndexSub = this.lnavIndex.sub(index => {
      if (Number.isInteger(index) && index >= 0) {
        const suffix = LNavUtils.getEventBusTopicSuffix(index);
        this.isLNavSuspended.setConsumer(sub.on(`lnav_is_suspended${suffix}`));
        this._isObsAvailable.setConsumer(sub.on(`obs_available${suffix}`));
        this.isObsActive.setConsumer(sub.on(`lnav_obs_active${suffix}`));
        this._obsCourse.setConsumer(sub.on(`lnav_obs_course${suffix}`));
        this.isLNavIndexValid.set(true);
      } else {
        this.isLNavIndexValid.set(false);
        this.isLNavSuspended.setConsumer(null);
        this._isObsAvailable.setConsumer(null);
        this.isObsActive.setConsumer(null);
        this._obsCourse.setConsumer(null);
      }
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
      throw new Error('DefaultObsSuspDataProvider: cannot resume a dead provider');
    }

    if (!this.isInit || !this.isPaused) {
      return;
    }

    this.isPaused = false;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.lnavIndexSub!.resume(true);

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

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.lnavIndexSub!.pause();

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

    this.lnavIndexSub?.destroy();
  }
}