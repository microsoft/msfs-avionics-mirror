import { ComSpacing, ConsumerSubject, EventBus, MappedSubject, NavComEvents, Subscribable } from '@microsoft/msfs-sdk';

import { RadiosConfig } from '../AvionicsConfig/RadiosConfig';

/**
 * A provider of COM radio frequency spacing mode data.
 */
export interface ComRadioSpacingDataProvider {
  /** The spacing mode of the COM1 radio. If COM1 is not supported, then this value defaults to `ComSpacing.Spacing25Khz`. */
  readonly com1Spacing: Subscribable<ComSpacing>;

  /** The spacing mode of the COM2 radio. If COM2 is not supported, then this value defaults to `ComSpacing.Spacing25Khz`. */
  readonly com2Spacing: Subscribable<ComSpacing>;

  /**
   * The combined spacing mode of all supported COM radios. If any supported COM radio is in 8.33 kHz mode, then the
   * combined spacing mode is `ComSpacing.Spacing833Khz`. Otherwise, the combined spacing mode is
   * `ComSpacing.Spacing25Khz`. If no COM radios are supported, then this value defaults to `ComSpacing.Spacing25Khz`.
   */
  readonly combinedComSpacing: Subscribable<ComSpacing>;
}

/**
 * A default implementation of {@link ComRadioSpacingDataProvider}.
 */
export class DefaultComRadioSpacingDataProvider implements ComRadioSpacingDataProvider {
  private readonly _com1Spacing = ConsumerSubject.create(null, ComSpacing.Spacing25Khz);
  /** @inheritDoc */
  public readonly com1Spacing = this._com1Spacing as Subscribable<ComSpacing>;

  private readonly _com2Spacing = ConsumerSubject.create(null, ComSpacing.Spacing25Khz);
  /** @inheritDoc */
  public readonly com2Spacing = this._com2Spacing as Subscribable<ComSpacing>;

  /** @inheritDoc */
  public readonly combinedComSpacing: Subscribable<ComSpacing>;

  private isInit = false;
  private isAlive = true;
  private isPaused = true;

  /**
   * Creates a new instance of DefaultComRadioSpacingDataProvider.
   * @param bus The event bus.
   * @param config A configuration object defining options for radios.
   */
  public constructor(private readonly bus: EventBus, private readonly config: RadiosConfig) {
    if (config.comCount === 2) {
      this.combinedComSpacing = MappedSubject.create(
        ([com1Spacing, com2Spacing]) => {
          return com1Spacing === ComSpacing.Spacing833Khz || com2Spacing === ComSpacing.Spacing833Khz
            ? ComSpacing.Spacing833Khz
            : ComSpacing.Spacing25Khz;
        },
        this._com1Spacing,
        this._com2Spacing
      );
    } else {
      this.combinedComSpacing = this._com1Spacing;
    }
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
      throw new Error('DefaultComRadioSpacingDataProvider: cannot initialize a dead provider');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    const sub = this.bus.getSubscriber<NavComEvents>();

    if (this.config.comDefinitions[1]) {
      this._com1Spacing.setConsumer(sub.on(`com_spacing_mode_${this.config.comDefinitions[1].simIndex}`));
    }
    if (this.config.comDefinitions[2]) {
      this._com2Spacing.setConsumer(sub.on(`com_spacing_mode_${this.config.comDefinitions[2].simIndex}`));
    }

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
      throw new Error('DefaultComRadioSpacingDataProvider: cannot resume a dead provider');
    }

    if (!this.isInit || !this.isPaused) {
      return;
    }

    this.isPaused = false;

    this._com1Spacing.resume();
    this._com2Spacing.resume();
  }

  /**
   * Pauses this data provider. Once paused, this data provider will not update its data until it is resumed.
   * @throws Error if this data provider is dead.
   */
  public pause(): void {
    if (!this.isAlive) {
      throw new Error('DefaultComRadioSpacingDataProvider: cannot pause a dead provider');
    }

    if (!this.isInit || this.isPaused) {
      return;
    }

    this.isPaused = true;

    this._com1Spacing.pause();
    this._com2Spacing.pause();
  }

  /**
   * Destroys this data provider. Once destroyed, this data provider will no longer update its provided data, and can
   * no longer be paused or resumed.
   */
  public destroy(): void {
    this.isAlive = false;

    this._com1Spacing.destroy();
    this._com2Spacing.destroy();
  }
}