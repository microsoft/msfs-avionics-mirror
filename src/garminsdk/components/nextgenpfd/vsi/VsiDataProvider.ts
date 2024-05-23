import {
  APEvents, ConsumerSubject, EventBus, MappedSubject, Subscribable, SubscribableMapFunctions, SubscribableUtils,
  Subscription
} from '@microsoft/msfs-sdk';

import { VNavDataProvider, VNavTargetAltitudeRestriction } from '../../../navigation/VNavDataProvider';
import { AdcSystemEvents } from '../../../system/AdcSystem';

/**
 * A data provider for a vertical speed indicator.
 */
export interface VsiDataProvider {
  /** The current vertical speed, in feet per minute. */
  readonly verticalSpeed: Subscribable<number>;

  /** The current selected vertical speed, in feet per minute. */
  readonly selectedVs: Subscribable<number | null>;

  /** The target VNAV altitude restriction. */
  readonly targetRestriction: Subscribable<VNavTargetAltitudeRestriction | null>;

  /** The current vertical speed required to meet the next VNAV altitude restriction, in feet per minute. */
  readonly vsRequired: Subscribable<number | null>;

  /** Whether vertical speed data is in a failure state. */
  readonly isDataFailed: Subscribable<boolean>;
}

/**
 * A default implementation of {@link VsiDataProvider}.
 */
export class DefaultVsiDataProvider implements VsiDataProvider {

  private readonly _verticalSpeed = ConsumerSubject.create(null, 0);
  public readonly verticalSpeed = this._verticalSpeed as Subscribable<number>;

  private readonly selectedVsSource = ConsumerSubject.create(null, 0);
  private readonly isVsHoldActive = ConsumerSubject.create(null, false);
  private readonly _selectedVs = MappedSubject.create(
    ([selectedVsSource, isVsHoldActive]): number | null => {
      return isVsHoldActive ? selectedVsSource : null;
    },
    this.selectedVsSource,
    this.isVsHoldActive
  );
  /** @inheritdoc */
  public readonly selectedVs = this._selectedVs as Subscribable<number | null>;

  /** @inheritdoc */
  public readonly targetRestriction = this.vnavDataProvider.targetRestriction;

  /** @inheritdoc */
  public readonly vsRequired = this.vnavDataProvider.vsRequired;

  private readonly isAltitudeDataValid = ConsumerSubject.create(null, false);
  /** @inheritdoc */
  public readonly isDataFailed = this.isAltitudeDataValid.map(SubscribableMapFunctions.not()) as Subscribable<boolean>;

  private readonly adcIndex: Subscribable<number>;

  private isInit = false;
  private isAlive = true;
  private isPaused = false;

  private adcIndexSub?: Subscription;

  /**
   * Constructor.
   * @param bus The event bus.
   * @param adcIndex The index of the ADC that is the source of this provider's data.
   * @param vnavDataProvider A provider of VNAV data.
   */
  constructor(
    private readonly bus: EventBus,
    adcIndex: number | Subscribable<number>,
    private readonly vnavDataProvider: VNavDataProvider
  ) {
    this.adcIndex = SubscribableUtils.toSubscribable(adcIndex, true);
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
      throw new Error('DefaultVsiDataProvider: cannot initialize a dead provider');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;
    this.isPaused = paused;

    const sub = this.bus.getSubscriber<AdcSystemEvents & APEvents>();

    this.adcIndexSub = this.adcIndex.sub(index => {
      this._verticalSpeed.setConsumer(sub.on(`adc_vertical_speed_${index}`));
      this.isAltitudeDataValid.setConsumer(sub.on(`adc_altitude_data_valid_${index}`));
    }, true);

    this.selectedVsSource.setConsumer(sub.on('ap_vs_selected'));
    this.isVsHoldActive.setConsumer(sub.on('ap_vs_hold'));

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
      throw new Error('DefaultVsiDataProvider: cannot resume a dead provider');
    }

    if (!this.isPaused) {
      return;
    }

    this.isPaused = false;

    this._verticalSpeed.resume();

    this.selectedVsSource.resume();
    this.isVsHoldActive.resume();

    this.isAltitudeDataValid.resume();
  }

  /**
   * Pauses this data provider. Once paused, this data provider will not update its data until it is resumed.
   * @throws Error if this data provider is dead.
   */
  public pause(): void {
    if (!this.isAlive) {
      throw new Error('DefaultVsiDataProvider: cannot pause a dead provider');
    }

    if (this.isPaused) {
      return;
    }

    this._verticalSpeed.pause();

    this.selectedVsSource.pause();
    this.isVsHoldActive.pause();

    this.isAltitudeDataValid.pause();

    this.isPaused = true;
  }

  /**
   * Destroys this data provider. Once destroyed, this data provider will no longer update its provided data, and can
   * no longer be paused or resumed.
   */
  public destroy(): void {
    this.isAlive = false;

    this._verticalSpeed.destroy();

    this.selectedVsSource.destroy();
    this.isVsHoldActive.destroy();

    this.isAltitudeDataValid.destroy();

    this.adcIndexSub?.destroy();
  }
}