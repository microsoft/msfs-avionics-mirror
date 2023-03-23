import {
  AdcEvents, APEvents, AvionicsSystemState, AvionicsSystemStateEvent, BitFlags, ConsumerSubject, EventBus, MappedSubject, Subject,
  Subscribable, SubscribableUtils, Subscription, Tcas, TcasEvents, TcasResolutionAdvisoryFlags, TcasResolutionAdvisoryType, UnitType, VNavDataEvents, VNavEvents
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

  /**
   * The current vertical speed required to meet the next VNAV altitude restriction, in feet per minute.
   */
  readonly vsRequired: Subscribable<number | null>;

  /**
   * The minimum allowed vertical speed, in feet per minute, commanded by the current resolution advisory, or `null`
   * if there is no such value.
   */
  readonly raMinVs: Subscribable<number | null>;

  /**
   * The maximum allowed vertical speed, in feet per minute, commanded by the current resolution advisory, or `null`
   * if there is no such value.
   */
  readonly raMaxVs: Subscribable<number | null>;

  /**
   * The lower bound vertical speed, in feet per minute, of the current resolution advisory's fly-to command, or
   * `null` if there is no such value.
   */
  readonly raFlyToMinVs: Subscribable<number | null>;

  /**
   * The upper bound vertical speed, in feet per minute, of the current resolution advisory's fly-to command, or
   * `null` if there is no such value.
   */
  readonly raFlyToMaxVs: Subscribable<number | null>;

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

  private readonly _raMinVs = Subject.create<number | null>(null);
  /** @inheritdoc */
  public readonly raMinVs = this._raMinVs as Subscribable<number | null>;

  private readonly _raMaxVs = Subject.create<number | null>(null);
  /** @inheritdoc */
  public readonly raMaxVs = this._raMaxVs as Subscribable<number | null>;

  private readonly _raFlyToMinVs = Subject.create<number | null>(null);
  /** @inheritdoc */
  public readonly raFlyToMinVs = this._raFlyToMinVs as Subscribable<number | null>;

  private readonly _raFlyToMaxVs = Subject.create<number | null>(null);
  /** @inheritdoc */
  public readonly raFlyToMaxVs = this._raFlyToMaxVs as Subscribable<number | null>;

  private readonly _isDataFailed = Subject.create(false);
  /** @inheritdoc */
  public readonly isDataFailed = this._isDataFailed as Subscribable<boolean>;

  private readonly adcIndex: Subscribable<number>;
  private readonly adcSystemState = ConsumerSubject.create<AvionicsSystemStateEvent>(null, { previous: undefined, current: undefined });

  private isInit = false;
  private isAlive = true;
  private isPaused = false;

  private adcIndexSub?: Subscription;
  private readonly tcasRaSubs: Subscription[] = [];

  /**
   * Constructor.
   * @param bus The event bus.
   * @param adcIndex The index of the ADC that is the source of this provider's data.
   * @param vnavDataProvider A provider of VNAV data.
   * @param tcas The TCAS which from which this data provider sources resolution advisory fly-to commands. If not
   * defined, this data provider does not support RA fly-to commands.
   */
  constructor(
    private readonly bus: EventBus,
    adcIndex: number | Subscribable<number>,
    private readonly vnavDataProvider: VNavDataProvider,
    public readonly tcas?: Tcas
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

    const sub = this.bus.getSubscriber<AdcEvents & AdcSystemEvents & APEvents & VNavEvents & VNavDataEvents & TcasEvents>();

    this.adcIndexSub = this.adcIndex.sub(index => {
      this._verticalSpeed.setConsumer(sub.on(`adc_vertical_speed_${index}`));
      this.adcSystemState.setConsumer(sub.on(`adc_state_${index}`));
    }, true);

    this.selectedVsSource.setConsumer(sub.on('ap_vs_selected'));
    this.isVsHoldActive.setConsumer(sub.on('ap_vs_hold'));

    this.adcSystemState.sub(state => {
      if (state.current === undefined || state.current === AvionicsSystemState.On) {
        this._isDataFailed.set(false);
      } else {
        this._isDataFailed.set(true);
      }
    }, true);

    if (this.tcas !== undefined) {
      const updateRaSpeeds = this.updateRaSpeeds.bind(this);

      updateRaSpeeds();
      this.tcasRaSubs.push(
        sub.on('tcas_ra_issued').handle(updateRaSpeeds),
        sub.on('tcas_ra_updated').handle(updateRaSpeeds),
        sub.on('tcas_ra_canceled').handle(updateRaSpeeds)
      );
    }

    if (paused) {
      this.pause();
    }
  }

  /**
   * Update vertical speeds commaned by TCAS resolution advisories.
   */
  private updateRaSpeeds(): void {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const host = this.tcas!.getResolutionAdvisoryHost();

    if (host.primaryType === TcasResolutionAdvisoryType.Clear) {
      this._raMinVs.set(null);
      this._raMaxVs.set(null);
      this._raFlyToMinVs.set(null);
      this._raFlyToMaxVs.set(null);
      return;
    }

    const minVsFpm = host.minVerticalSpeed.asUnit(UnitType.FPM);
    const maxVsFpm = host.maxVerticalSpeed.asUnit(UnitType.FPM);

    if (host.secondaryType === null) {
      // Single RA

      if (BitFlags.isAll(host.primaryFlags, TcasResolutionAdvisoryFlags.UpSense)) {
        // Upward sense
        this._raMaxVs.set(null);
        this._raMinVs.set(minVsFpm > -100 && minVsFpm < 100 ? -100 : minVsFpm);
      } else {
        // Downward sense
        this._raMinVs.set(null);
        this._raMaxVs.set(maxVsFpm > -100 && maxVsFpm < 100 ? 100 : maxVsFpm);
      }

      if (BitFlags.isAny(host.primaryFlags, TcasResolutionAdvisoryFlags.Climb | TcasResolutionAdvisoryFlags.Descend)) {
        // Positive
        this._raFlyToMaxVs.set(maxVsFpm);
        this._raFlyToMinVs.set(minVsFpm);
      } else {
        // Negative
        this._raFlyToMinVs.set(null);
        this._raFlyToMaxVs.set(null);
      }
    } else {
      // Composite RA

      this._raFlyToMinVs.set(null);
      this._raFlyToMaxVs.set(null);

      this._raMinVs.set(minVsFpm > -100 && minVsFpm < 100 ? -100 : minVsFpm);
      this._raMaxVs.set(maxVsFpm > -100 && maxVsFpm < 100 ? 100 : maxVsFpm);
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

    this.adcSystemState.resume();

    this.updateRaSpeeds();
    this.tcasRaSubs.forEach(sub => { sub.resume(); });
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

    this.adcSystemState.pause();

    this.tcasRaSubs.forEach(sub => { sub.pause(); });

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

    this.adcSystemState.destroy();

    this.adcIndexSub?.destroy();
    this.tcasRaSubs.forEach(sub => { sub.destroy(); });
  }
}