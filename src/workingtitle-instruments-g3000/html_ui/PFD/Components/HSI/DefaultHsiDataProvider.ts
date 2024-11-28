import {
  AdcEvents, AhrsEvents, APEvents, ConsumerSubject, EventBus, GeoPoint, GeoPointInterface, GeoPointSubject, GNSSEvents,
  LNavEvents, MappedSubject, Subject, Subscribable, SubscribableMapFunctions, SubscribableUtils, Subscription
} from '@microsoft/msfs-sdk';

import {
  AhrsSystemEvents, DefaultObsSuspDataProvider, FmsPositionMode, FmsPositionSystemEvents, HeadingSyncEvents,
  LNavDataEvents
} from '@microsoft/msfs-garminsdk';

import { G3000NavIndicator } from '@microsoft/msfs-wtg3000-common';

import { HsiDataProvider } from './HsiDataProvider';

/**
 * A default implementation of {@link HsiDataProvider}.
 */
export class DefaultHsiDataProvider implements HsiDataProvider {
  private readonly _headingMag = ConsumerSubject.create(null, 0).pause();
  /** @inheritdoc */
  public readonly headingMag = this._headingMag as Subscribable<number>;

  private readonly _turnRate = ConsumerSubject.create(null, 0).pause();
  /** @inheritdoc */
  public readonly turnRate = this._turnRate as Subscribable<number>;

  private readonly isOnGround = ConsumerSubject.create(null, false).pause();
  private readonly trackMagSource = ConsumerSubject.create(null, 0).pause();
  /** @inheritdoc */
  public readonly trackMag = Subject.create(0) as Subscribable<number>;

  private readonly _position = GeoPointSubject.create(new GeoPoint(0, 0));
  /** @inheritdoc */
  public readonly position = this._position as Subscribable<GeoPointInterface>;

  private readonly _magVar = ConsumerSubject.create(null, 0).pause();
  /** @inheritdoc */
  public readonly magVar = this._magVar as Subscribable<number>;

  private readonly _selectedHeadingMag = ConsumerSubject.create(null, 0).pause();
  /** @inheritdoc */
  public readonly selectedHeadingMag = this._selectedHeadingMag as Subscribable<number>;

  private readonly _isHdgSyncModeActive = ConsumerSubject.create(null, false).pause();
  /** @inheritdoc */
  public readonly isHdgSyncModeActive = this._isHdgSyncModeActive as Subscribable<boolean>;

  private readonly isLNavTracking = ConsumerSubject.create(null, false).pause();
  private readonly lnavXtkSource = ConsumerSubject.create(null, 0).pause();
  /** @inheritdoc */
  public readonly lnavXtk = MappedSubject.create(
    ([isLNavTracking, lnavXtkSource]): number | null => {
      return isLNavTracking ? lnavXtkSource : null;
    },
    this.isLNavTracking,
    this.lnavXtkSource
  ) as Subscribable<number | null>;

  private readonly obsSuspDataProvider = new DefaultObsSuspDataProvider(this.bus);

  /** @inheritdoc */
  public readonly obsSuspMode = this.obsSuspDataProvider.mode;
  /** @inheritdoc */
  public readonly obsCourse = this.obsSuspDataProvider.obsCourse;

  private readonly isHeadingDataValid = ConsumerSubject.create(null, true).pause();
  /** @inheritdoc */
  public readonly isHeadingDataFailed = this.isHeadingDataValid.map(SubscribableMapFunctions.not()) as Subscribable<boolean>;

  private readonly fmsPosMode = ConsumerSubject.create(null, FmsPositionMode.None).pause();
  /** @inheritdoc */
  public readonly isGpsDataFailed = this.fmsPosMode.map(mode => mode === FmsPositionMode.None) as Subscribable<boolean>;

  private readonly ahrsIndex: Subscribable<number>;
  private readonly fmsPosIndex: Subscribable<number>;

  private readonly pauseable: Subscription[] = [
    this._headingMag,
    this._turnRate,
    this.isOnGround,
    this.trackMagSource,
    this._magVar,
    this._selectedHeadingMag,
    this._isHdgSyncModeActive,
    this.isLNavTracking,
    this.lnavXtkSource,
    this.isHeadingDataValid,
    this.fmsPosMode,
  ];

  private isInit = false;
  private isAlive = true;
  private isPaused = true;

  private ahrsIndexSub?: Subscription;
  private fmsPosIndexSub?: Subscription;
  private positionSub?: Subscription;

  /**
   * Constructor.
   * @param bus The event bus.
   * @param ahrsIndex The index of the ADC that is the source of this provider's data.
   * @param fmsPosIndex The index of the FMS geo-positioning system that is the source of this provider's data.
   * @param activeNavIndicator The nav indicator for the active nav source.
   * @param approachPreviewIndicator The nav indicator for the approach course preview.
   * @param bearing1Indicator The nav indicator for bearing pointer 1.
   * @param bearing2Indicator The nav indicator for bearing pointer 2.
   */
  public constructor(
    private readonly bus: EventBus,
    ahrsIndex: number | Subscribable<number>,
    fmsPosIndex: number | Subscribable<number>,
    public readonly activeNavIndicator: G3000NavIndicator,
    public readonly approachPreviewIndicator: G3000NavIndicator,
    public readonly bearing1Indicator: G3000NavIndicator,
    public readonly bearing2Indicator: G3000NavIndicator
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
    this.isPaused = paused;

    const sub = this.bus.getSubscriber<
      AhrsEvents & AhrsSystemEvents & FmsPositionSystemEvents & AdcEvents & GNSSEvents & APEvents & LNavEvents
      & LNavDataEvents & HeadingSyncEvents
    >();

    this.ahrsIndexSub = this.ahrsIndex.sub(index => {
      this._headingMag.setConsumer(sub.on(`ahrs_hdg_deg_${index}`));
      this._turnRate.setConsumer(sub.on(`ahrs_delta_heading_rate_${index}`));
      this.isHeadingDataValid.setConsumer(sub.on(`ahrs_heading_data_valid_${index}`));
    }, true);

    this.fmsPosIndexSub = this.fmsPosIndex.sub(index => {
      this.fmsPosMode.setConsumer(sub.on(`fms_pos_mode_${index}`));

      this.positionSub?.destroy();
      this.positionSub = sub.on(`fms_pos_gps-position_${index}`).handle(lla => {
        this._position.set(lla.lat, lla.long);
      }, this.isPaused);

      this.trackMagSource.setConsumer(sub.on(`fms_pos_track_deg_magnetic_${index}`));
    }, true);

    this.isOnGround.setConsumer(sub.on('on_ground'));

    const trackTrackPipe = this.trackMagSource.pipe(this.trackMag as Subject<number>, true);
    const headingTrackPipe = this._headingMag.pipe(this.trackMag as Subject<number>, true);

    this.isOnGround.sub(isOnGround => {
      if (isOnGround) {
        trackTrackPipe.pause();
        headingTrackPipe.resume(true);
      } else {
        headingTrackPipe.pause();
        trackTrackPipe.resume(true);
      }
    }, true);

    this._magVar.setConsumer(sub.on('magvar'));

    this._selectedHeadingMag.setConsumer(sub.on('ap_heading_selected'));

    this._isHdgSyncModeActive.setConsumer(sub.on('hdg_sync_mode_active'));

    this.isLNavTracking.setConsumer(sub.on('lnav_is_tracking'));
    this.lnavXtkSource.setConsumer(sub.on('lnavdata_xtk'));

    this.obsSuspDataProvider.init(true);

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

    for (const sub of this.pauseable) {
      sub.resume(true);
    }

    this.obsSuspDataProvider.resume();

    this.positionSub?.resume(true);
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

    for (const sub of this.pauseable) {
      sub.pause();
    }

    this.obsSuspDataProvider.pause();

    this.positionSub?.pause();
  }

  /**
   * Destroys this data provider. Once destroyed, this data provider will no longer update its provided data, and can
   * no longer be paused or resumed.
   */
  public destroy(): void {
    this.isAlive = false;

    this._headingMag.destroy();
    this._turnRate.destroy();
    this.isHeadingDataValid.destroy();

    this.fmsPosMode.destroy();

    this.isOnGround.destroy();
    this.trackMagSource.destroy();

    this.positionSub?.destroy();
    this._magVar.destroy();

    this._selectedHeadingMag.destroy();
    this._isHdgSyncModeActive.destroy();

    this.isLNavTracking.destroy();
    this.lnavXtkSource.destroy();

    this.ahrsIndexSub?.destroy();
    this.fmsPosIndexSub?.destroy();

    this.obsSuspDataProvider.destroy();
  }
}
