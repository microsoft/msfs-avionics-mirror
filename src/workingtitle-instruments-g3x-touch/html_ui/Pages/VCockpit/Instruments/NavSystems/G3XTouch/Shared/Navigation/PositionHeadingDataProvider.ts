import {
  AdcEvents, ClockEvents, ConsumerSubject, EventBus, GeoPoint, GeoPointInterface, GeoPointSubject, GNSSEvents,
  Subject, Subscribable, SubscribableMapFunctions, SubscribableUtils, Subscription
} from '@microsoft/msfs-sdk';

import { AhrsSystemEvents, FmsPositionMode, FmsPositionSystemEvents } from '@microsoft/msfs-garminsdk';

/**
 * A provider of airplane position and heading data.
 */
export interface PositionHeadingDataProvider {
  /** The current position of the airplane. */
  readonly ppos: Subscribable<GeoPointInterface>;

  /** The current position of the airplane, or `(NaN, NaN)` when GPS data is in a failed state. */
  readonly pposWithFailure: Subscribable<GeoPointInterface>;

  /** The current true heading of the airplane, in degrees. */
  readonly headingTrue: Subscribable<number>;

  /** The current true heading of the airplane, in degrees, or `NaN` when heading data is in a failed state. */
  readonly headingTrueWithFailure: Subscribable<number>;

  /** Whether this provider's heading data is in a failed state. */
  readonly isHeadingDataFailed: Subscribable<boolean>;

  /** Whether GPS position is in dead reckoning mode. */
  readonly isGpsDeadReckoning: Subscribable<boolean>;

  /** Whether GPS data is in a failed state. */
  readonly isGpsDataFailed: Subscribable<boolean>;
}

/**
 * A default implementation of {@link PositionHeadingDataProvider}.
 */
export class DefaultPositionHeadingDataProvider implements PositionHeadingDataProvider {
  private readonly _ppos = GeoPointSubject.create(new GeoPoint(0, 0));
  /** @inheritdoc */
  public readonly ppos = this._ppos as Subscribable<GeoPointInterface>;

  private readonly _pposWithFailure = GeoPointSubject.create(new GeoPoint(0, 0));
  /** @inheritdoc */
  public readonly pposWithFailure = this._pposWithFailure as Subscribable<GeoPointInterface>;

  private readonly _headingTrue = ConsumerSubject.create(null, 0);
  /** @inheritdoc */
  public readonly headingTrue = this._headingTrue as Subscribable<number>;

  private readonly _headingTrueWithFailure = Subject.create<number>(0, SubscribableUtils.NUMERIC_NAN_EQUALITY);
  /** @inheritdoc */
  public readonly headingTrueWithFailure = this._headingTrueWithFailure as Subscribable<number>;

  private readonly _isHeadingDataValid = ConsumerSubject.create(null, true);
  /** @inheritdoc */
  public readonly isHeadingDataFailed = this._isHeadingDataValid.map(SubscribableMapFunctions.not()) as Subscribable<boolean>;

  private readonly fmsPosMode = ConsumerSubject.create(null, FmsPositionMode.None);

  /** @inheritdoc */
  public readonly isGpsDeadReckoning = this.fmsPosMode.map(mode => {
    return mode === FmsPositionMode.DeadReckoning || mode === FmsPositionMode.DeadReckoningExpired;
  }) as Subscribable<boolean>;

  /** @inheritdoc */
  public readonly isGpsDataFailed = this.fmsPosMode.map(mode => mode === FmsPositionMode.None) as Subscribable<boolean>;

  private readonly fmsPosIndex: Subscribable<number>;
  private readonly ahrsIndex: Subscribable<number>;

  private isInit = false;
  private isAlive = true;
  private isPaused = false;

  private pposSub?: Subscription;
  private pposPipe?: Subscription;
  private headingPipe?: Subscription;
  private isGpsDataFailedSub?: Subscription;
  private isHeadingDataFailedSub?: Subscription;

  /**
   * Constructor.
   * @param bus The event bus.
   * @param fmsPosIndex The index of the FMS geo-positioning system that is the source of this provider's data.
   * @param ahrsIndex The index of the AHRS that is the source of this provider's data.
   * @param updateFreq The frequency at which this provider updates its position and heading data.
   */
  constructor(
    private readonly bus: EventBus,
    fmsPosIndex: number | Subscribable<number>,
    ahrsIndex: number | Subscribable<number>,
    private readonly updateFreq: number
  ) {
    this.fmsPosIndex = SubscribableUtils.toSubscribable(fmsPosIndex, true);
    this.ahrsIndex = SubscribableUtils.toSubscribable(ahrsIndex, true);
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
      throw new Error('DefaultPositionHeadingDataProvider: cannot initialize a dead provider');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    const sub = this.bus.getSubscriber<ClockEvents & AdcEvents & GNSSEvents & AhrsSystemEvents & FmsPositionSystemEvents>();

    const pposPipe = this.pposPipe = this._ppos.pipe(this._pposWithFailure, true);
    const headingPipe = this.headingPipe = this._headingTrue.pipe(this._headingTrueWithFailure, true);

    this.isGpsDataFailedSub = this.isGpsDataFailed.sub(isFailed => {
      if (isFailed) {
        pposPipe.pause();
        this._pposWithFailure.set(NaN, NaN);
      } else {
        pposPipe.resume(true);
      }
    }, true);

    this.isHeadingDataFailedSub = this.isHeadingDataFailed.sub(isFailed => {
      if (isFailed) {
        headingPipe.pause();
        this._headingTrueWithFailure.set(NaN);
      } else {
        headingPipe.resume(true);
      }
    }, true);

    this.fmsPosIndex.sub(index => {
      this.fmsPosMode.setConsumer(sub.on(`fms_pos_mode_${index}`));

      this.pposSub?.destroy();
      this.pposSub = sub.on(`fms_pos_gps-position_${index}`).atFrequency(this.updateFreq, true).handle(lla => {
        this._ppos.set(lla.lat, lla.long);
      }, this.isPaused);
    }, true);

    this.ahrsIndex.sub(index => {
      this._headingTrue.setConsumer(sub.on(`ahrs_hdg_deg_true_${index}`).atFrequency(this.updateFreq, true));
      this._isHeadingDataValid.setConsumer(sub.on(`ahrs_heading_data_valid_${index}`));
    }, true);

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
      throw new Error('DefaultPositionHeadingDataProvider: cannot resume a dead provider');
    }

    if (!this.isPaused) {
      return;
    }

    this.isPaused = false;

    this.fmsPosMode.resume();
    this.pposSub?.resume(true);

    this._headingTrue.resume();
    this._isHeadingDataValid.resume();

    this.isGpsDataFailedSub?.resume(true);
    this.isHeadingDataFailedSub?.resume(true);
  }

  /**
   * Pauses this data provider. Once paused, this data provider will not update its data until it is resumed.
   * @throws Error if this data provider is dead.
   */
  public pause(): void {
    if (!this.isAlive) {
      throw new Error('DefaultPositionHeadingDataProvider: cannot pause a dead provider');
    }

    if (this.isPaused) {
      return;
    }

    this.fmsPosMode.pause();
    this.pposSub?.pause();

    this._headingTrue.pause();
    this._isHeadingDataValid.pause();

    this.pposPipe?.pause();
    this.headingPipe?.pause();
    this.isGpsDataFailedSub?.pause();
    this.isHeadingDataFailedSub?.pause();

    this.isPaused = true;
  }

  /**
   * Destroys this data provider. Once destroyed, this data provider will no longer update its provided data, and can
   * no longer be paused or resumed.
   */
  public destroy(): void {
    this.isAlive = false;

    this.fmsPosMode.destroy();
    this.pposSub?.destroy();

    this._headingTrue.destroy();
    this._isHeadingDataValid.destroy();

    this.pposPipe?.destroy();
    this.headingPipe?.destroy();
    this.isGpsDataFailedSub?.destroy();
    this.isHeadingDataFailedSub?.destroy();
  }
}