import {
  AdcEvents, ConsumerSubject, EventBus, MappedSubject, MappedSubscribable, Subject, Subscribable, SubscribableUtils,
  Subscription, UserSetting, UserSettingManager
} from '@microsoft/msfs-sdk';

import { FmsEvents } from '../../../flightplan/FmsEvents';
import { FmsFlightPhase } from '../../../flightplan/FmsTypes';
import { FmsUtils } from '../../../flightplan/FmsUtils';
import { VSpeedUserSettingTypes } from '../../../settings/VSpeedUserSettings';

/**
 * V-speed annunciation types.
 */
export enum VSpeedAnnunciation {
  None = 'None',
  Takeoff = 'Takeoff',
  Landing = 'Landing'
}

/**
 * A provider of PFD V-speed annunciation data.
 */
export interface VSpeedAnnunciationDataProvider {
  /** The currently active V-speed annunciation. */
  readonly annunciation: Subscribable<VSpeedAnnunciation>;
}

/**
 * Configuration options for {@link DefaultVSpeedAnnunciationDataProvider}.
 */
export type DefaultVSpeedAnnunciationDataProviderOptions = {
  /** The ID of the FMS from which to source flight phase data. Defaults to the empty ID (`''`). */
  fmsId?: string | Subscribable<string>;
};

/**
 * A default implementation of {@link VSpeedAnnunciationDataProvider}.
 */
export class DefaultVSpeedAnnunciationDataProvider implements VSpeedAnnunciationDataProvider {

  private static readonly COUNT_TRUE_FUNC = (sum: number, v: boolean): number => sum + (v ? 1 : 0);

  private readonly fmsId: Subscribable<string>;

  private readonly _annunciation = Subject.create(VSpeedAnnunciation.None);
  /** @inheritdoc */
  public readonly annunciation = this._annunciation as Subscribable<VSpeedAnnunciation>;

  private readonly isOnGround = ConsumerSubject.create(null, false);

  private readonly flightPhase = ConsumerSubject.create<Readonly<FmsFlightPhase>>(null, {
    isApproachActive: false,
    isToFaf: false,
    isPastFaf: false,
    isInMissedApproach: false
  }, FmsUtils.flightPhaseEquals);

  private readonly takeoffVSpeedShowSettings: UserSetting<boolean>[];
  private readonly landingVSpeedShowSettings: UserSetting<boolean>[];

  private readonly takeoffVSpeedShowCount: MappedSubscribable<number>;
  private readonly landingVSpeedShowCount: MappedSubscribable<number>;

  private isInit = false;
  private isAlive = true;
  private isPaused = false;

  private fmsIdSub?: Subscription;
  private isOnGroundSub?: Subscription;
  private takeoffAnnuncPipe?: Subscription;
  private landingAnnuncPipe?: Subscription;

  /**
   * Constructor.
   * @param bus The event bus.
   * @param vSpeedSettingManager A manager for V-speed user settings.
   * @param takeoffVSpeedNames The names of every takeoff V-speed.
   * @param landingVSpeedNames The names of every landing V-speed.
   * @param options Options with which to configure the data provider.
   */
  constructor(
    private readonly bus: EventBus,
    vSpeedSettingManager: UserSettingManager<VSpeedUserSettingTypes>,
    takeoffVSpeedNames: Iterable<string>,
    landingVSpeedNames: Iterable<string>,
    options?: Readonly<DefaultVSpeedAnnunciationDataProviderOptions>
  ) {
    this.fmsId = SubscribableUtils.toSubscribable(options?.fmsId ?? '', true);

    this.takeoffVSpeedShowSettings = Array.from(takeoffVSpeedNames)
      .map(name => vSpeedSettingManager.tryGetSetting(`vSpeedShow_${name}`))
      .filter(setting => setting !== undefined) as UserSetting<boolean>[];

    this.landingVSpeedShowSettings = Array.from(landingVSpeedNames)
      .map(name => vSpeedSettingManager.tryGetSetting(`vSpeedShow_${name}`))
      .filter(setting => setting !== undefined) as UserSetting<boolean>[];

    this.takeoffVSpeedShowCount = MappedSubject.create(
      settings => settings.reduce(DefaultVSpeedAnnunciationDataProvider.COUNT_TRUE_FUNC, 0),
      ...this.takeoffVSpeedShowSettings
    ).pause();

    this.landingVSpeedShowCount = MappedSubject.create(
      settings => settings.reduce(DefaultVSpeedAnnunciationDataProvider.COUNT_TRUE_FUNC, 0),
      ...this.landingVSpeedShowSettings
    ).pause();
  }

  /**
   * Initializes this data provider. Once initialized
   * @param paused Whether to initialize this data provider as paused. If `true`, this data provider will provide an
   * initial set of data but will not update the provided data until it is resumed. Defaults to `false`.
   * @throws Error if this data provider is dead.
   */
  public init(paused = false): void {
    if (!this.isAlive) {
      throw new Error('DefaultVSpeedAnnunciationDataProvider: cannot initialize a dead provider');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    if (this.takeoffVSpeedShowSettings.length > 0 || this.landingVSpeedShowSettings.length > 0) {
      const sub = this.bus.getSubscriber<AdcEvents & FmsEvents>();

      this.fmsIdSub = this.fmsId.sub(id => {
        this.flightPhase.setConsumer(FmsUtils.onFmsEvent(id, sub, 'fms_flight_phase'));
      }, true);

      this.isOnGround.setConsumer(sub.on('on_ground'));

      this.takeoffVSpeedShowCount.resume();
      this.landingVSpeedShowCount.resume();

      if (this.takeoffVSpeedShowSettings.length > 0) {
        this.takeoffAnnuncPipe = MappedSubject.create(
          ([takeoffCount, landingCount]) => {
            if (takeoffCount === this.takeoffVSpeedShowSettings.length || landingCount > 0) {
              return VSpeedAnnunciation.None;
            } else {
              return VSpeedAnnunciation.Takeoff;
            }
          },
          this.takeoffVSpeedShowCount,
          this.landingVSpeedShowCount
        ).pipe(this._annunciation, true);
      }

      if (this.landingVSpeedShowSettings.length > 0) {
        this.landingAnnuncPipe = MappedSubject.create(
          ([takeoffCount, landingCount, flightPhase]) => {
            if (!flightPhase.isApproachActive || landingCount === this.landingVSpeedShowSettings.length || takeoffCount > 0) {
              return VSpeedAnnunciation.None;
            } else {
              return VSpeedAnnunciation.Landing;
            }
          },
          this.takeoffVSpeedShowCount,
          this.landingVSpeedShowCount,
          this.flightPhase
        ).pipe(this._annunciation, true);
      }

      this.isOnGroundSub = this.isOnGround.sub(isOnGround => {
        if (isOnGround) {
          this.landingAnnuncPipe?.pause();
          this.takeoffAnnuncPipe?.resume(true);
        } else {
          this.takeoffAnnuncPipe?.pause();
          this.landingAnnuncPipe?.resume(true);
        }
      }, true);
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
      throw new Error('DefaultVSpeedAnnunciationDataProvider: cannot resume a dead provider');
    }

    if (!this.isInit || !this.isPaused) {
      return;
    }

    this.isPaused = false;

    this.isOnGround.resume();
    this.flightPhase.resume();
    this.takeoffVSpeedShowCount.resume();
    this.landingVSpeedShowCount.resume();

    this.isOnGroundSub?.resume(true);
  }

  /**
   * Pauses this data provider. Once paused, this data provider will not update its data until it is resumed.
   * @throws Error if this data provider is dead.
   */
  public pause(): void {
    if (!this.isAlive) {
      throw new Error('DefaultVSpeedAnnunciationDataProvider: cannot pause a dead provider');
    }

    if (!this.isInit || this.isPaused) {
      return;
    }

    this.isPaused = true;

    this.isOnGround.pause();
    this.flightPhase.pause();
    this.takeoffVSpeedShowCount.pause();
    this.landingVSpeedShowCount.pause();

    this.isOnGroundSub?.pause();
    this.takeoffAnnuncPipe?.pause();
    this.landingAnnuncPipe?.pause();
  }

  /**
   * Resets this data provider to provide an annunciation type of `VSpeedAnnunciation.None`.
   */
  public reset(): void {
    this._annunciation.set(VSpeedAnnunciation.None);
  }

  /**
   * Destroys this data provider. Once destroyed, this data provider will no longer update its provided data, and can
   * no longer be paused or resumed.
   */
  public destroy(): void {
    this.isAlive = false;

    this.isOnGround.destroy();
    this.flightPhase.destroy();
    this.takeoffVSpeedShowCount.destroy();
    this.landingVSpeedShowCount.destroy();

    this.fmsIdSub?.destroy();
  }
}