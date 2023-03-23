import {
  AdcEvents, AvionicsSystemState, AvionicsSystemStateEvent, ConsumerSubject, EventBus, GNSSEvents, MappedSubject, Subject, Subscribable,
  SubscribableUtils, Subscription
} from '@microsoft/msfs-sdk';
import { AdcSystemEvents } from '@microsoft/msfs-garminsdk';

/**
 * A data provider for a temperature information display.
 */
export interface TemperatureInfoDataProvider {
  /** The current outside (static) air temperature, in degrees Celsius. */
  readonly oat: Subscribable<number>;

  /** The current deviation of outside air temperature from ISA, in degrees Celsius. */
  readonly deltaIsa: Subscribable<number>;

  /** Whether this provider's data is in a failed state. */
  readonly isDataFailed: Subscribable<boolean>;
}

/**
 * A default implementation of {@link TemperatureInfoDataProvider}.
 */
export class DefaultTemperatureInfoDataProvider implements TemperatureInfoDataProvider {
  private readonly _oat = ConsumerSubject.create(null, 0);
  /** @inheritdoc */
  public readonly oat = this._oat as Subscribable<number>;

  private readonly isa = ConsumerSubject.create(null, 0);
  private readonly _deltaIsa = MappedSubject.create(
    ([oat, isa]): number => oat - isa,
    this._oat,
    this.isa
  );
  /** @inheritdoc */
  public readonly deltaIsa = this._deltaIsa as Subscribable<number>;

  private readonly _isDataFailed = Subject.create(false);
  /** @inheritdoc */
  public readonly isDataFailed = this._isDataFailed as Subscribable<boolean>;

  private readonly adcIndex: Subscribable<number>;
  private readonly adcSystemState = ConsumerSubject.create<AvionicsSystemStateEvent>(null, { previous: undefined, current: undefined });

  private isInit = false;
  private isAlive = true;
  private isPaused = false;

  private adcIndexSub?: Subscription;

  /**
   * Constructor.
   * @param bus The event bus.
   * @param adcIndex The index of the ADC that is the source of this provider's airspeed data.
   */
  constructor(
    private readonly bus: EventBus,
    adcIndex: number | Subscribable<number>
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
      throw new Error('DefaultTemperatureInfoDataProvider: cannot initialize a dead provider');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;
    this.isPaused = paused;

    const sub = this.bus.getSubscriber<AdcEvents & AdcSystemEvents & GNSSEvents>();

    this.adcIndexSub = this.adcIndex.sub(index => {
      this._oat.setConsumer(sub.on(`adc_ambient_temp_c_${index}`));
      this.isa.setConsumer(sub.on(`adc_isa_temp_c_${index}`));
      this.adcSystemState.setConsumer(sub.on(`adc_state_${index}`));
    }, true);

    this.adcSystemState.sub(state => {
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
      throw new Error('DefaultTemperatureInfoDataProvider: cannot resume a dead provider');
    }

    if (!this.isPaused) {
      return;
    }

    this.isPaused = false;

    this._oat.resume();

    this.adcSystemState.resume();
  }

  /**
   * Pauses this data provider. Once paused, this data provider will not update its data until it is resumed.
   * @throws Error if this data provider is dead.
   */
  public pause(): void {
    if (!this.isAlive) {
      throw new Error('DefaultTemperatureInfoDataProvider: cannot pause a dead provider');
    }

    if (this.isPaused) {
      return;
    }

    this._oat.pause();

    this.adcSystemState.pause();
  }

  /**
   * Destroys this data provider. Once destroyed, this data provider will no longer update its provided data, and can
   * no longer be paused or resumed.
   */
  public destroy(): void {
    this.isAlive = false;

    this._oat.destroy();

    this.adcSystemState.destroy();

    this.adcIndexSub?.destroy();
  }
}