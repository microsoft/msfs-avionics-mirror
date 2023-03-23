import {
  AvionicsSystemState, AvionicsSystemStateEvent, ConsumerSubject, EventBus, MarkerBeaconState, Subject, Subscribable,
  SubscribableUtils, Subscription
} from '@microsoft/msfs-sdk';
import { MarkerBeaconSystemEvents } from '../../../system/MarkerBeaconSystem';

/**
 * A provider of marker beacon data.
 */
export interface MarkerBeaconDataProvider {
  /** The current marker beacon receiving state. */
  readonly markerBeaconState: Subscribable<MarkerBeaconState>;

  /** Whether marker beacon data is in a failed state. */
  readonly isDataFailed: Subscribable<boolean>;
}

/**
 * A default implementation of {@link MarkerBeaconDataProvider}.
 */
export class DefaultMarkerBeaconDataProvider implements MarkerBeaconDataProvider {
  private readonly _markerBeaconState = ConsumerSubject.create(null, 0);
  /** @inheritdoc */
  public readonly markerBeaconState = this._markerBeaconState as Subscribable<number>;

  private readonly _isDataFailed = Subject.create(false);
  /** @inheritdoc */
  public readonly isDataFailed = this._isDataFailed as Subscribable<boolean>;

  private readonly markerBeaconIndex: Subscribable<number>;
  private readonly markerSystemState = ConsumerSubject.create<AvionicsSystemStateEvent>(null, { previous: undefined, current: undefined });

  private isInit = false;
  private isAlive = true;
  private isPaused = false;

  private markerBeaconIndexSub?: Subscription;

  /**
   * Constructor.
   * @param bus The event bus.
   * @param markerBeaconIndex The index of the AoA computer that is the source of this provider's data.
   */
  constructor(
    private readonly bus: EventBus,
    markerBeaconIndex: number | Subscribable<number>
  ) {
    this.markerBeaconIndex = SubscribableUtils.toSubscribable(markerBeaconIndex, true);
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
      throw new Error('DefaultMarkerBeaconDataProvider: cannot initialize a dead provider');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;
    this.isPaused = paused;

    const sub = this.bus.getSubscriber<MarkerBeaconSystemEvents>();

    this.markerBeaconIndexSub = this.markerBeaconIndex.sub(index => {
      this._markerBeaconState.setConsumer(sub.on(`marker_mkr_bcn_state_${index}`));
      this.markerSystemState.setConsumer(sub.on(`marker_state_${index}`));
    }, true);

    this.markerSystemState.sub(state => {
      if (state.current === undefined || state.current === AvionicsSystemState.On) {
        this._isDataFailed.set(false);
      } else {
        this._isDataFailed.set(true);
      }
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
      throw new Error('DefaultMarkerBeaconDataProvider: cannot resume a dead provider');
    }

    if (!this.isInit || !this.isPaused) {
      return;
    }

    this.isPaused = false;

    this._markerBeaconState.resume();
    this.markerSystemState.resume();
  }

  /**
   * Pauses this data provider. Once paused, this data provider will not update its data until it is resumed.
   * @throws Error if this data provider is dead.
   */
  public pause(): void {
    if (!this.isAlive) {
      throw new Error('DefaultMarkerBeaconDataProvider: cannot pause a dead provider');
    }

    if (!this.isInit || this.isPaused) {
      return;
    }

    this.isPaused = true;

    this._markerBeaconState.pause();
    this.markerSystemState.pause();
  }

  /**
   * Destroys this data provider. Once destroyed, this data provider will no longer update its provided data, and can
   * no longer be paused or resumed.
   */
  public destroy(): void {
    this.isAlive = false;

    this._markerBeaconState.destroy();
    this.markerSystemState.destroy();

    this.markerBeaconIndexSub?.destroy();
  }
}