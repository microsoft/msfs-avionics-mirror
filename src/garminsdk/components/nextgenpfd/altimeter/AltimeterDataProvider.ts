import {
  AdcEvents, AltitudeSelectEvents, APEvents, ClockEvents, ConsumerSubject, EventBus, MappedSubject, MappedSubscribable,
  MinimumsEvents, MinimumsMode, Subject, Subscribable, SubscribableMapFunctions, SubscribableUtils, Subscription
} from '@microsoft/msfs-sdk';

import { AdcSystemEvents } from '../../../system/AdcSystem';
import { RadarAltimeterSystemEvents } from '../../../system/RadarAltimeterSystem';
import { RadarAltimeterDataProvider } from './RadarAltimeterDataProvider';

/**
 * A data provider for an altimeter.
 */
export interface AltimeterDataProvider {
  /** The current indicated altitude, in feet. */
  readonly indicatedAlt: Subscribable<number>;

  /** The current indicated altitude trend, in feet. */
  readonly altitudeTrend: Subscribable<number>;

  /** The current barometric pressure setting, in inches of mercury. */
  readonly baroSetting: Subscribable<number>;

  /** Whether STD BARO mode is active. */
  readonly baroIsStdActive: Subscribable<boolean>;

  /** The current preselected barometric pressure setting, in inches of mercury. */
  readonly baroPreselect: Subscribable<number>;

  /** The current selected altitude, or `null` if no such value exists. */
  readonly selectedAlt: Subscribable<number | null>;

  /** The current active minimums, in feet indicated altitude, or `null` if no such value exists. */
  readonly minimums: Subscribable<number | null>;

  /** The current radar altitude, in feet, or `null` if there is no valid radar altitude. */
  readonly radarAlt: Subscribable<number | null>;

  /** Whether altitude data is in a failure state. */
  readonly isDataFailed: Subscribable<boolean>;
}

/**
 * Configuration options for {@link AltimeterDataProvider}.
 */
export type AltimeterDataProviderOptions = {
  /** The lookahead time for the altitude trend, in seconds. */
  trendLookahead: number | Subscribable<number>;
};

/**
 * A default implementation of {@link AltimeterDataProvider}.
 */
export class DefaultAltimeterDataProvider implements AltimeterDataProvider {
  private readonly _indicatedAlt = ConsumerSubject.create(null, 0);
  /** @inheritdoc */
  public readonly indicatedAlt = this._indicatedAlt as Subscribable<number>;

  private readonly verticalSpeed = ConsumerSubject.create(null, 0);
  private readonly trendLookahead: Subscribable<number>;

  private readonly _altitudeTrend: MappedSubscribable<number>;
  /** @inheritdoc */
  public readonly altitudeTrend: Subscribable<number>;

  private readonly _baroSetting = ConsumerSubject.create(null, 0);
  /** @inheritdoc */
  public readonly baroSetting = this._baroSetting as Subscribable<number>;

  private readonly _baroIsStdActive = ConsumerSubject.create(null, false);
  /** @inheritdoc */
  public readonly baroIsStdActive = this._baroIsStdActive as Subscribable<boolean>;

  private readonly _baroPreselect = ConsumerSubject.create(null, 0);
  /** @inheritdoc */
  public readonly baroPreselect = this._baroPreselect as Subscribable<number>;

  private readonly selectedAltSource = ConsumerSubject.create(null, 0);
  private readonly selectedAltIsInit = ConsumerSubject.create(null, false);

  private readonly _selectedAlt = MappedSubject.create(
    ([selectedAltSource, isInit]): number | null => {
      return isInit ? selectedAltSource : null;
    },
    this.selectedAltSource,
    this.selectedAltIsInit
  );
  /** @inheritdoc */
  public readonly selectedAlt = this._selectedAlt as Subscribable<number | null>;

  private readonly minimumsMode = ConsumerSubject.create(null, MinimumsMode.OFF);
  private readonly baroMinimumsSource = ConsumerSubject.create(null, 0);
  private readonly radarMinimumsSource = ConsumerSubject.create(null, 0);

  private readonly _minimums = Subject.create<number | null>(null);
  /** @inheritdoc */
  public readonly minimums = this._minimums as Subscribable<number | null>;

  private readonly _radarAlt = Subject.create<number | null>(null);
  public readonly radarAlt = this._radarAlt as Subscribable<number | null>;

  private readonly isAltitudeDataValid = ConsumerSubject.create(null, false);
  /** @inheritdoc */
  public readonly isDataFailed = this.isAltitudeDataValid.map(SubscribableMapFunctions.not()) as Subscribable<boolean>;

  private readonly adcIndex: Subscribable<number>;

  private readonly simTime = ConsumerSubject.create(null, 0);
  private readonly isOnGround = ConsumerSubject.create(null, false);

  private isInit = false;
  private isAlive = true;
  private isPaused = false;

  private adcIndexSub?: Subscription;
  private radarAltIsFailedSub?: Subscription;
  private radarAltPipe?: Subscription;

  /**
   * Constructor.
   * @param bus The event bus.
   * @param adcIndex The index of the ADC that is the source of this provider's data.
   * @param options Configuration options for this provider.
   * @param radarAltimeterDataProvider A radar altimeter data provider. If not defined, this data provider will not
   * support radar altitude or radar minimums.
   */
  constructor(
    private readonly bus: EventBus,
    adcIndex: number | Subscribable<number>,
    options: Readonly<AltimeterDataProviderOptions>,
    private readonly radarAltimeterDataProvider?: RadarAltimeterDataProvider
  ) {
    this.adcIndex = SubscribableUtils.toSubscribable(adcIndex, true);

    this.trendLookahead = SubscribableUtils.toSubscribable(options.trendLookahead, true);

    this._altitudeTrend = MappedSubject.create(
      ([verticalSpeed, lookahead]): number => {
        return verticalSpeed * lookahead / 60;
      },
      this.verticalSpeed,
      this.trendLookahead
    );
    this.altitudeTrend = this._altitudeTrend as Subscribable<number>;
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
      throw new Error('DefaultAltimeterDataProvider: cannot initialize a dead provider');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;
    this.isPaused = paused;

    const sub = this.bus.getSubscriber<AdcEvents & AdcSystemEvents & RadarAltimeterSystemEvents & ClockEvents & APEvents & AltitudeSelectEvents & MinimumsEvents>();

    this.simTime.setConsumer(sub.on('simTime'));
    this.isOnGround.setConsumer(sub.on('on_ground'));

    this.adcIndexSub = this.adcIndex.sub(index => {
      this._indicatedAlt.setConsumer(sub.on(`adc_indicated_alt_${index}`));
      this._baroSetting.setConsumer(sub.on(`adc_altimeter_baro_setting_inhg_${index}`));
      this._baroIsStdActive.setConsumer(sub.on(`adc_altimeter_baro_is_std_${index}`));
      this._baroPreselect.setConsumer(sub.on(`adc_altimeter_baro_preselect_inhg_${index}`));
      this.verticalSpeed.setConsumer(sub.on(`adc_vertical_speed_${index}`));
      this.isAltitudeDataValid.setConsumer(sub.on(`adc_altitude_data_valid_${index}`));
    }, true);

    this.selectedAltSource.setConsumer(sub.on('ap_altitude_selected'));
    this.selectedAltIsInit.setConsumer(sub.on('alt_select_is_initialized'));

    this.minimumsMode.setConsumer(sub.on('minimums_mode'));
    this.baroMinimumsSource.setConsumer(sub.on('decision_altitude_feet'));

    const baroMinimums = MappedSubject.create(
      ([minimumsMode, baroMinimumsSource]): number | null => {
        return minimumsMode === MinimumsMode.BARO ? baroMinimumsSource : null;
      },
      this.minimumsMode,
      this.baroMinimumsSource
    );

    if (this.radarAltimeterDataProvider !== undefined) {
      this.radarAltPipe = this.radarAltimeterDataProvider.radarAlt.pipe(this._radarAlt, true);

      this.radarAltIsFailedSub = this.radarAltimeterDataProvider.isDataFailed.sub(isFailed => {
        if (isFailed) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          this.radarAltPipe!.pause();
          this._radarAlt.set(null);
        } else {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          this.radarAltPipe!.resume(true);
        }
      }, true);

      this.radarMinimumsSource.setConsumer(sub.on('decision_height_feet'));

      baroMinimums.pause();
      const baroPipe = baroMinimums.pipe(this._minimums, true);

      const radarMinimums = MappedSubject.create(
        ([minimumsMode, radarMinimumsSource, radarAlt, indicatedAlt]): number | null => {
          return minimumsMode === MinimumsMode.RA && radarAlt !== null && !isNaN(radarAlt)
            ? indicatedAlt - radarAlt + radarMinimumsSource
            : null;
        },
        this.minimumsMode,
        this.radarMinimumsSource,
        this.radarAlt,
        this._indicatedAlt
      );
      radarMinimums.pause();
      const radarPipe = radarMinimums.pipe(this._minimums, true);

      this.minimumsMode.sub(minimumsMode => {
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
      throw new Error('DefaultAltimeterDataProvider: cannot resume a dead provider');
    }

    if (!this.isPaused || !this.isInit) {
      return;
    }

    this.isPaused = false;

    this.simTime.resume();
    this.isOnGround.resume();

    this._indicatedAlt.resume();
    this._baroSetting.resume();
    this._baroIsStdActive.resume();
    this._baroPreselect.resume();

    this.verticalSpeed.resume();
    this._altitudeTrend.resume();

    this.selectedAltSource.resume();
    this.selectedAltIsInit.resume();

    this.radarAltIsFailedSub?.resume(true);

    this.minimumsMode.resume();
    this.baroMinimumsSource.resume();
    this.radarMinimumsSource.resume();

    this.isAltitudeDataValid.resume();
  }

  /**
   * Pauses this data provider. Once paused, this data provider will not update its data until it is resumed.
   * @throws Error if this data provider is dead.
   */
  public pause(): void {
    if (!this.isAlive) {
      throw new Error('DefaultAltimeterDataProvider: cannot pause a dead provider');
    }

    if (this.isPaused || !this.isInit) {
      return;
    }

    this.simTime.pause();
    this.isOnGround.pause();

    this._indicatedAlt.pause();
    this._baroSetting.pause();
    this._baroIsStdActive.pause();
    this._baroPreselect.pause();

    this.verticalSpeed.pause();
    this._altitudeTrend.pause();

    this.selectedAltSource.pause();
    this.selectedAltIsInit.pause();

    this.radarAltIsFailedSub?.pause();
    this.radarAltPipe?.pause();

    this.minimumsMode.pause();
    this.baroMinimumsSource.pause();
    this.radarMinimumsSource.pause();

    this.isAltitudeDataValid.pause();

    this.isPaused = true;
  }

  /**
   * Destroys this data provider. Once destroyed, this data provider will no longer update its provided data, and can
   * no longer be paused or resumed.
   */
  public destroy(): void {
    this.isAlive = false;

    this.simTime.destroy();
    this.isOnGround.destroy();

    this._indicatedAlt.destroy();
    this._baroSetting.destroy();
    this._baroIsStdActive.destroy();
    this._baroPreselect.destroy();

    this.verticalSpeed.destroy();
    this._altitudeTrend.destroy();

    this.selectedAltSource.destroy();
    this.selectedAltIsInit.destroy();

    this.minimumsMode.destroy();
    this.baroMinimumsSource.destroy();
    this.radarMinimumsSource.destroy();

    this.isAltitudeDataValid.destroy();

    this.adcIndexSub?.destroy();
    this.radarAltIsFailedSub?.destroy();
    this.radarAltPipe?.destroy();
  }
}