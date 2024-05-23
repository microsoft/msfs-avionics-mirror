import {
  AdcEvents, AhrsEvents, APEvents, AvionicsSystemState, AvionicsSystemStateEvent, ConsumerSubject, EventBus,
  GNSSEvents, LNavEvents, LNavUtils, MappedSubject, Subject, Subscribable, SubscribableMapFunctions, SubscribableUtils,
  Subscription, UserSettingManager
} from '@microsoft/msfs-sdk';

import {
  AhrsSystemEvents, DefaultObsSuspDataProvider, FmsPositionMode, FmsPositionSystemEvents, HeadingSyncEvents,
  LNavDataEvents, ObsSuspModes
} from '@microsoft/msfs-garminsdk';

import { G3XFplSourceDataProvider } from '../../../Shared/FlightPlan/G3XFplSourceDataProvider';
import { G3XFplSource } from '../../../Shared/FlightPlan/G3XFplSourceTypes';
import { G3XTouchNavIndicator } from '../../../Shared/NavReference/G3XTouchNavReference';
import { PfdHsiOrientationSettingMode, PfdHsiUserSettingTypes } from '../../../Shared/Settings/PfdUserSettings';
import { HsiOrientationMode } from './HsiTypes';

/**
 * A data provider for an HSI.
 */
export interface HsiDataProvider {
  /** The current active orientation mode. */
  readonly orientationMode: Subscribable<HsiOrientationMode>;

  /** The current magnetic heading, in degrees. */
  readonly headingMag: Subscribable<number>;

  /** The current turn rate, in degrees per second. */
  readonly turnRate: Subscribable<number>;

  /** The current magnetic ground track, in degrees, or `null` if ground track is not available. */
  readonly trackMag: Subscribable<number | null>;

  /** The magnetic variation at the plane's current position, in degrees. */
  readonly magVar: Subscribable<number>;

  /** The nav indicator for the active nav source. */
  readonly activeNavIndicator: G3XTouchNavIndicator;

  /** The nav indicator for bearing pointer 1. */
  readonly bearing1Indicator: G3XTouchNavIndicator;

  /** The nav indicator for bearing pointer 2. */
  readonly bearing2Indicator: G3XTouchNavIndicator;

  /** The current selected magnetic heading, in degrees. */
  readonly selectedHeadingMag: Subscribable<number>;

  /** The current LNAV cross-track error, in nautical miles, or `null` if LNAV is not tracking a path. */
  readonly lnavXtk: Subscribable<number | null>;

  /** The current LNAV OBS/suspend mode. */
  readonly obsSuspMode: Subscribable<ObsSuspModes>;

  /** The current magnetic OBS course, in degrees. */
  readonly obsCourse: Subscribable<number>;

  /** The number of supported external flight plan sources. */
  readonly externalFplSourceCount: 0 | 1 | 2;

  /** The current flight plan source. */
  readonly fplSource: Subscribable<G3XFplSource>;

  /** Whether heading data is in a failure state. */
  readonly isHeadingDataFailed: Subscribable<boolean>;

  /** Whether the AHRS that is this provider's source of heading data is aligning. */
  readonly isAhrsAligning: Subscribable<boolean>;

  /** Whether GPS data is in a failure state. */
  readonly isGpsDataFailed: Subscribable<boolean>;
}

/**
 * A default implementation of {@link HsiDataProvider}.
 */
export class DefaultHsiDataProvider implements HsiDataProvider {
  private readonly isTrackValid = Subject.create(false);
  private readonly isApHdgModeActive = ConsumerSubject.create(null, false).pause();
  private readonly _orientationMode = MappedSubject.create(
    ([setting, isTrackValid, isApHdgModeActive]) => {
      return setting === PfdHsiOrientationSettingMode.Auto && isTrackValid && !isApHdgModeActive
        ? HsiOrientationMode.Track
        : HsiOrientationMode.Heading;
    },
    this.settingManager.getSetting('pfdHsiOrientationMode'),
    this.isTrackValid,
    this.isApHdgModeActive
  ).pause();
  /** @inheritDoc */
  public readonly orientationMode = this._orientationMode as Subscribable<HsiOrientationMode>;

  private readonly _headingMag = ConsumerSubject.create(null, 0).pause();
  /** @inheritDoc */
  public readonly headingMag = this._headingMag as Subscribable<number>;

  private readonly _turnRate = ConsumerSubject.create(null, 0).pause();
  /** @inheritDoc */
  public readonly turnRate = this._turnRate as Subscribable<number>;

  private readonly groundSpeed = ConsumerSubject.create(null, 0).pause();
  private readonly trackMagSource = ConsumerSubject.create(null, 0).pause();
  private readonly _trackMag = Subject.create<number | null>(null);
  /** @inheritDoc */
  public readonly trackMag = this._trackMag as Subscribable<number | null>;

  private readonly _magVar = ConsumerSubject.create(null, 0).pause();
  /** @inheritDoc */
  public readonly magVar = this._magVar as Subscribable<number>;

  private readonly _selectedHeadingMag = ConsumerSubject.create(null, 0).pause();
  /** @inheritDoc */
  public readonly selectedHeadingMag = this._selectedHeadingMag as Subscribable<number>;

  private readonly isLNavIndexValid = Subject.create(false);
  private readonly isLNavTracking = ConsumerSubject.create(null, false).pause();
  private readonly lnavXtkSource = ConsumerSubject.create(null, 0).pause();
  private readonly _lnavXtk = MappedSubject.create(
    ([isLNavIndexValid, isLNavTracking, lnavXtkSource]): number | null => {
      return isLNavIndexValid && isLNavTracking ? lnavXtkSource : null;
    },
    this.isLNavIndexValid,
    this.isLNavTracking,
    this.lnavXtkSource
  ).pause();
  /** @inheritDoc */
  public readonly lnavXtk = this._lnavXtk as Subscribable<number | null>;

  private readonly obsSuspDataProvider = new DefaultObsSuspDataProvider(this.bus, { lnavIndex: this.fplSourceDataProvider.lnavIndex });

  /** @inheritDoc */
  public readonly obsSuspMode = this.obsSuspDataProvider.mode;
  /** @inheritDoc */
  public readonly obsCourse = this.obsSuspDataProvider.obsCourse;

  /** @inheritDoc */
  public readonly externalFplSourceCount = this.fplSourceDataProvider.externalSourceCount;
  /** @inheritDoc */
  public readonly fplSource = this.fplSourceDataProvider.source;

  private readonly isHeadingDataValid = ConsumerSubject.create(null, true).pause();
  /** @inheritDoc */
  public readonly isHeadingDataFailed = this.isHeadingDataValid.map(SubscribableMapFunctions.not()) as Subscribable<boolean>;

  private readonly ahrsState = ConsumerSubject.create<AvionicsSystemStateEvent | undefined>(null, undefined).pause();
  /** @inheritDoc */
  public readonly isAhrsAligning = this.ahrsState.map(state => state !== undefined && state.current === AvionicsSystemState.Initializing) as Subscribable<boolean>;

  private readonly fmsPosMode = ConsumerSubject.create(null, FmsPositionMode.None).pause();
  /** @inheritDoc */
  public readonly isGpsDataFailed = this.fmsPosMode.map(mode => mode === FmsPositionMode.None) as Subscribable<boolean>;

  private readonly ahrsIndex: Subscribable<number>;
  private readonly fmsPosIndex: Subscribable<number>;

  private isInit = false;
  private isAlive = true;
  private isPaused = true;

  private readonly subscriptions: Subscription[] = [
    this.isApHdgModeActive,
    this._orientationMode,
    this._headingMag,
    this._turnRate,
    this.groundSpeed,
    this.trackMagSource,
    this._magVar,
    this._selectedHeadingMag,
    this.isLNavTracking,
    this.lnavXtkSource,
    this.isHeadingDataValid,
    this.ahrsState,
    this.fmsPosMode
  ];

  /**
   * Creates a new instance of DefaultHsiDataProvider.
   * @param bus The event bus.
   * @param ahrsIndex The index of the AHRS from which to source data.
   * @param fmsPosIndex The index of the FMS geo-positioning system from which to source data.
   * @param activeNavIndicator The nav indicator for the active nav source.
   * @param bearing1Indicator The nav indicator for bearing pointer 1.
   * @param bearing2Indicator The nav indicator for bearing pointer 2.
   * @param fplSourceDataProvider A provider of flight plan source data.
   * @param settingManager A manager for HSI user settings.
   * @param supportAutopilot Whether autopilot mode sensing is supported.
   */
  public constructor(
    private readonly bus: EventBus,
    ahrsIndex: number | Subscribable<number>,
    fmsPosIndex: number | Subscribable<number>,
    public readonly activeNavIndicator: G3XTouchNavIndicator,
    public readonly bearing1Indicator: G3XTouchNavIndicator,
    public readonly bearing2Indicator: G3XTouchNavIndicator,
    private readonly fplSourceDataProvider: G3XFplSourceDataProvider,
    private readonly settingManager: UserSettingManager<PfdHsiUserSettingTypes>,
    private readonly supportAutopilot: boolean
  ) {
    this.ahrsIndex = SubscribableUtils.toSubscribable(ahrsIndex, true);
    this.fmsPosIndex = SubscribableUtils.toSubscribable(fmsPosIndex, true);
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

    const sub = this.bus.getSubscriber<
      AhrsEvents & AhrsSystemEvents & FmsPositionSystemEvents & AdcEvents & GNSSEvents & APEvents & LNavEvents
      & LNavDataEvents & HeadingSyncEvents
    >();

    if (this.supportAutopilot) {
      this.isApHdgModeActive.setConsumer(sub.on('ap_heading_hold'));
    }

    this.subscriptions.push(

      this.ahrsIndex.sub(index => {
        this.ahrsState.setConsumer(sub.on(`ahrs_state_${index}`));
        this.isHeadingDataValid.setConsumer(sub.on(`ahrs_heading_data_valid_${index}`));

        this._headingMag.setConsumer(sub.on(`ahrs_hdg_deg_${index}`));
        this._turnRate.setConsumer(sub.on(`ahrs_delta_heading_rate_${index}`));
      }, true),

      this.fmsPosIndex.sub(index => {
        this.fmsPosMode.setConsumer(sub.on(`fms_pos_mode_${index}`));
        this.groundSpeed.setConsumer(sub.on(`fms_pos_ground_speed_${index}`));
        this.trackMagSource.setConsumer(sub.on(`fms_pos_track_deg_magnetic_${index}`));
      }, true)

    );

    const trackPipe = this.trackMagSource.pipe(this._trackMag, true);

    this.groundSpeed.map((gs, previousVal) => gs >= (previousVal ? 15 : 20)).sub(isTrackValid => {
      if (isTrackValid) {
        trackPipe.resume(true);
        this.isTrackValid.set(true);
      } else {
        this.isTrackValid.set(false);
        trackPipe.pause();
        this._trackMag.set(null);
      }
    }, true);

    this._magVar.setConsumer(sub.on('magvar'));

    this._selectedHeadingMag.setConsumer(sub.on('ap_heading_selected'));

    this.subscriptions.push(
      this.fplSourceDataProvider.lnavIndex.sub(index => {
        if (LNavUtils.isValidLNavIndex(index)) {
          const suffix = LNavUtils.getEventBusTopicSuffix(index);
          this.isLNavTracking.setConsumer(sub.on(`lnav_is_tracking${suffix}`));
          this.lnavXtkSource.setConsumer(sub.on(`lnavdata_xtk${suffix}`));
          this.isLNavIndexValid.set(true);
        } else {
          this.isLNavTracking.setConsumer(null);
          this.lnavXtkSource.setConsumer(null);
          this.isLNavIndexValid.set(false);
        }
      }, true)
    );

    this.obsSuspDataProvider.init(paused);

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
      throw new Error('DefaultHsiDataProvider: cannot resume a dead provider');
    }

    if (!this.isInit || !this.isPaused) {
      return;
    }

    this.isPaused = false;

    this.isApHdgModeActive.resume();
    this._orientationMode.resume();

    this._headingMag.resume();
    this._turnRate.resume();
    this.isHeadingDataValid.resume();
    this.ahrsState.resume();

    this.fmsPosMode.resume();

    this.groundSpeed.resume();
    this.trackMagSource.resume();

    this._magVar.resume();

    this._selectedHeadingMag.resume();

    this.isLNavTracking.resume();
    this.lnavXtkSource.resume();
    this._lnavXtk.resume();

    this.obsSuspDataProvider.resume();
  }

  /**
   * Pauses this data provider. Once paused, this data provider will not update its data until it is resumed.
   * @throws Error if this data provider is dead.
   */
  public pause(): void {
    if (!this.isAlive) {
      throw new Error('DefaultHsiDataProvider: cannot pause a dead provider');
    }

    if (!this.isInit || this.isPaused) {
      return;
    }

    this.isPaused = true;

    this.isApHdgModeActive.pause();
    this._orientationMode.pause();

    this._headingMag.pause();
    this._turnRate.pause();
    this.isHeadingDataValid.pause();
    this.ahrsState.pause();

    this.fmsPosMode.pause();

    this.groundSpeed.pause();
    this.trackMagSource.pause();

    this._magVar.pause();

    this._selectedHeadingMag.pause();

    this.isLNavTracking.pause();
    this.lnavXtkSource.pause();
    this._lnavXtk.pause();

    this.obsSuspDataProvider.pause();
  }

  /**
   * Destroys this data provider. Once destroyed, this data provider will no longer update its provided data, and can
   * no longer be paused or resumed.
   */
  public destroy(): void {
    this.isAlive = false;

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    this.obsSuspDataProvider.destroy();
  }
}