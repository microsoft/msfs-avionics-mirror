import { ConsumerSubject, EventBus, MappedSubject, Subject, Subscribable, SubscribableUtils, Subscription } from '@microsoft/msfs-sdk';
import { FmsPositionMode, FmsPositionSystemEvents } from '../system/FmsPositionSystem';
import { CDIScaleLabel, LNavDataEvents } from './LNavDataEvents';

/**
 * A provider of GPS integrity data.
 */
export interface GpsIntegrityDataProvider {
  /** The current data mode used by the FMS geo-positioning system. */
  fmsPosMode: Subscribable<FmsPositionMode>;

  /** Whether the current GPS integrity is sufficient for the current phase of flight. */
  isIntegritySufficient: Subscribable<boolean>;
}

/**
 * A default implementation of {@link GpsIntegrityDataProvider}.
 */
export class DefaultGpsIntegrityDataProvider implements GpsIntegrityDataProvider {

  private readonly _fmsPosMode = ConsumerSubject.create(null, FmsPositionMode.None);
  /** @inheritdoc */
  public readonly fmsPosMode = this._fmsPosMode as Subscribable<FmsPositionMode>;

  private readonly _isIntegritySufficient = Subject.create(false);
  /** @inheritdoc */
  public readonly isIntegritySufficient = this._isIntegritySufficient as Subscribable<boolean>;

  private readonly cdiScalingMode = ConsumerSubject.create(null, CDIScaleLabel.Enroute);

  private readonly fmsPosIndex: Subscribable<number>;

  private isInit = false;
  private isAlive = true;
  private isPaused = false;

  private fmsPosIndexSub?: Subscription;

  /**
   * Constructor.
   * @param bus The event bus.
   * @param fmsPosIndex The index of the FMS geo-positioning system that is the source of this provider's data.
   */
  constructor(
    private readonly bus: EventBus,
    fmsPosIndex: number | Subscribable<number>
  ) {
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
      throw new Error('DefaultGpsIntegrityDataProvider: cannot initialize a dead provider');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;
    this.isPaused = paused;

    const sub = this.bus.getSubscriber<FmsPositionSystemEvents & LNavDataEvents>();

    this.fmsPosIndexSub = this.fmsPosIndex.sub(index => {
      this._fmsPosMode.setConsumer(sub.on(`fms_pos_mode_${index}`));
    }, true);

    this.cdiScalingMode.setConsumer(sub.on('lnavdata_cdi_scale_label'));

    const state = MappedSubject.create(this._fmsPosMode, this.cdiScalingMode);

    state.pipe(this._isIntegritySufficient, ([fmsPosMode, cdiScalingMode]) => {
      switch (fmsPosMode) {
        case FmsPositionMode.DeadReckoning:
          return cdiScalingMode === CDIScaleLabel.Enroute || cdiScalingMode === CDIScaleLabel.Oceanic;
        case FmsPositionMode.Gps:
        case FmsPositionMode.Dme:
        case FmsPositionMode.Hns:
          return true;
        default:
          return false;
      }
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
      throw new Error('DefaultGpsIntegrityDataProvider: cannot resume a dead provider');
    }

    if (!this.isPaused) {
      return;
    }

    this.isPaused = false;

    this._fmsPosMode.resume();
    this.cdiScalingMode.resume();
  }

  /**
   * Pauses this data provider. Once paused, this data provider will not update its data until it is resumed.
   * @throws Error if this data provider is dead.
   */
  public pause(): void {
    if (!this.isAlive) {
      throw new Error('DefaultGpsIntegrityDataProvider: cannot pause a dead provider');
    }

    if (this.isPaused) {
      return;
    }

    this._fmsPosMode.pause();
    this.cdiScalingMode.pause();

    this.isPaused = true;
  }

  /**
   * Destroys this data provider. Once destroyed, this data provider will no longer update its provided data, and can
   * no longer be paused or resumed.
   */
  public destroy(): void {
    this.isAlive = false;

    this._fmsPosMode.destroy();
    this.cdiScalingMode.destroy();

    this.fmsPosIndexSub?.destroy();
  }
}