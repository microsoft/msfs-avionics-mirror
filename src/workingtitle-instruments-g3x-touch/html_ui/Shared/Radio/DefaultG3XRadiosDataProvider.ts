import {
  ComRadioIndex, ComSpacing, ConsumerSubject, ElectricalEvents, EventBus, NavComEvents, NavRadioIndex, Subscribable
} from '@microsoft/msfs-sdk';

import { ComRadioDefinition, NavRadioDefinition, RadiosConfig } from '../AvionicsConfig/RadiosConfig';
import { ComRadioSpacingDataProvider, DefaultComRadioSpacingDataProvider } from './ComRadioSpacingDataProvider';
import { G3XComRadioDataProvider, G3XNavRadioDataProvider, G3XRadiosDataProvider } from './G3XRadiosDataProvider';
import { ComRadio, NavRadio } from './G3XRadioTypes';

/**
 * A default implementation of {@link G3XRadiosDataProvider}.
 */
export class DefaultG3XRadiosDataProvider implements G3XRadiosDataProvider {
  private readonly _comRadioSpacingDataProvider: DefaultComRadioSpacingDataProvider;
  /** A provider of COM radio frequency spacing mode data. */
  public readonly comRadioSpacingDataProvider: ComRadioSpacingDataProvider;

  private readonly _comRadioDataProviders: Readonly<Partial<Record<1 | 2, DefaultG3XComRadioDataProvider>>>;
  /** @inheritDoc */
  public readonly comRadioDataProviders: Readonly<Partial<Record<1 | 2, G3XComRadioDataProvider>>>;

  private readonly _navRadioDataProviders: Readonly<Partial<Record<1 | 2, DefaultG3XNavRadioDataProvider>>>;
  /** @inheritDoc */
  public readonly navRadioDataProviders: Readonly<Partial<Record<1 | 2, G3XNavRadioDataProvider>>>;

  private isAlive = true;
  private isInit = false;
  private isResumed = false;

  /**
   * Creates a new instance of DefaultG3XRadiosDataProvider.
   * @param bus The event bus.
   * @param radiosConfig A configuration object that defines options for radios.
   */
  public constructor(bus: EventBus, radiosConfig: RadiosConfig) {
    this._comRadioSpacingDataProvider = new DefaultComRadioSpacingDataProvider(bus, radiosConfig);
    this.comRadioSpacingDataProvider = this._comRadioSpacingDataProvider;

    const comRadioDataProviders: Partial<Record<1 | 2, DefaultG3XComRadioDataProvider>> = {};
    for (const index of [1, 2] as const) {
      const def = radiosConfig.comDefinitions[index];
      if (def) {
        comRadioDataProviders[index] = new DefaultG3XComRadioDataProvider(
          bus,
          def,
          this._comRadioSpacingDataProvider
        );
      }
    }
    this._comRadioDataProviders = comRadioDataProviders;
    this.comRadioDataProviders = this._comRadioDataProviders;

    const navRadioDataProviders: Partial<Record<1 | 2, DefaultG3XNavRadioDataProvider>> = {};
    for (const index of [1, 2] as const) {
      const def = radiosConfig.navDefinitions[index];
      if (def) {
        navRadioDataProviders[index] = new DefaultG3XNavRadioDataProvider(bus, def);
      }
    }
    this._navRadioDataProviders = navRadioDataProviders;
    this.navRadioDataProviders = this._navRadioDataProviders;
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
      throw new Error('DefaultG3XRadiosDataProvider: cannot initialize a dead provider');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    this._comRadioSpacingDataProvider.init();
    this._comRadioDataProviders[1]?.init();
    this._comRadioDataProviders[2]?.init();
    this._navRadioDataProviders[1]?.init();
    this._navRadioDataProviders[2]?.init();

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
      throw new Error('DefaultG3XRadiosDataProvider: cannot resume a dead provider');
    }

    if (!this.isInit || this.isResumed) {
      return;
    }

    this.isResumed = true;

    this._comRadioSpacingDataProvider.resume();
    this._comRadioDataProviders[1]?.resume();
    this._comRadioDataProviders[2]?.resume();
    this._navRadioDataProviders[1]?.resume();
    this._navRadioDataProviders[2]?.resume();
  }

  /**
   * Pauses this data provider. Once paused, this data provider will not update its data until it is resumed.
   * @throws Error if this data provider is dead.
   */
  public pause(): void {
    if (!this.isAlive) {
      throw new Error('DefaultG3XRadiosDataProvider: cannot pause a dead provider');
    }

    if (!this.isInit || !this.isResumed) {
      return;
    }

    this.isResumed = false;

    this._comRadioSpacingDataProvider.pause();
    this._comRadioDataProviders[1]?.pause();
    this._comRadioDataProviders[2]?.pause();
    this._navRadioDataProviders[1]?.pause();
    this._navRadioDataProviders[2]?.pause();
  }

  /**
   * Destroys this data provider. Once destroyed, this data provider will no longer update its provided data, and can
   * no longer be paused or resumed.
   */
  public destroy(): void {
    this.isAlive = false;

    this._comRadioSpacingDataProvider.destroy();
    this._comRadioDataProviders[1]?.destroy();
    this._comRadioDataProviders[2]?.destroy();
    this._navRadioDataProviders[1]?.destroy();
    this._navRadioDataProviders[2]?.destroy();
  }
}

/**
 * A provider of common data for a G3X Touch NAV or COM radio.
 */
abstract class AbstractG3XNavComRadioDataProvider {
  protected readonly _isPowered = ConsumerSubject.create(null, false).pause();
  /** @inheritDoc */
  public readonly isPowered = this._isPowered as Subscribable<boolean>;

  protected readonly _activeFrequency = ConsumerSubject.create(null, 0).pause();
  /** @inheritDoc */
  public readonly activeFrequency = this._activeFrequency as Subscribable<number>;

  protected readonly _standbyFrequency = ConsumerSubject.create(null, 0).pause();
  /** @inheritDoc */
  public readonly standbyFrequency = this._standbyFrequency as Subscribable<number>;

  protected readonly _volume = ConsumerSubject.create(null, 0).pause();
  /** @inheritDoc */
  public readonly volume = this._volume as Subscribable<number>;

  /**
   * Creates a new instance of AbstractG3XNavComRadioDataProvider.
   * @param bus The event bus.
   */
  public constructor(protected readonly bus: EventBus) {
  }

  /**
   * Resumes this data provider. Once resumed, this data provider will continuously update its data until paused or
   * destroyed.
   * @throws Error if this data provider is dead.
   */
  public resume(): void {
    this._isPowered.resume();
    this._activeFrequency.resume();
    this._standbyFrequency.resume();
    this._volume.resume();
  }

  /**
   * Pauses this data provider. Once paused, this data provider will not update its data until it is resumed.
   * @throws Error if this data provider is dead.
   */
  public pause(): void {
    this._isPowered.pause();
    this._activeFrequency.pause();
    this._standbyFrequency.pause();
    this._volume.pause();
  }

  /**
   * Destroys this data provider. Once destroyed, this data provider will no longer update its provided data, and can
   * no longer be paused or resumed.
   */
  public destroy(): void {
    this._isPowered.destroy();
    this._activeFrequency.destroy();
    this._standbyFrequency.destroy();
    this._volume.destroy();
  }
}

/**
 * An implementation of {@link G3XComRadioDataProvider} used by {@link DefaultG3XRadiosDataProvider}.
 */
class DefaultG3XComRadioDataProvider extends AbstractG3XNavComRadioDataProvider implements G3XComRadioDataProvider {
  /** @inheritDoc */
  public readonly index: 1 | 2;

  /** @inheritDoc */
  public readonly id: ComRadio;

  /** @inheritDoc */
  public readonly simIndex: ComRadioIndex;

  /** @inheritDoc */
  public readonly frequencySpacing: Subscribable<ComSpacing>;

  /**
   * Creates a new instance of DefaultG3XComRadioDataProvider.
   * @param bus The event bus.
   * @param radioDef The definition for the provider's radio.
   * @param comRadioSpacingDataProvider A provider of COM radio frequency spacing mode data.
   */
  public constructor(
    bus: EventBus,
    radioDef: Readonly<ComRadioDefinition>,
    comRadioSpacingDataProvider: ComRadioSpacingDataProvider
  ) {
    super(bus);

    this.index = radioDef.index;
    this.id = radioDef.index === 2 ? 'COM2' : 'COM1';
    this.simIndex = radioDef.simIndex;

    this.frequencySpacing = radioDef.index === 2 ? comRadioSpacingDataProvider.com2Spacing : comRadioSpacingDataProvider.com1Spacing;
  }

  /**
   * Initializes this data provider. Once initialized, this data provider will continuously update its data until
   * paused or destroyed.
   */
  public init(): void {
    const sub = this.bus.getSubscriber<NavComEvents & ElectricalEvents>();

    this._isPowered.setConsumer(sub.on(`elec_circuit_com_on_${this.simIndex}`));
    this._activeFrequency.setConsumer(sub.on(`com_active_frequency_${this.simIndex}`));
    this._standbyFrequency.setConsumer(sub.on(`com_standby_frequency_${this.simIndex}`));
    this._volume.setConsumer(sub.on(`com_volume_${this.simIndex}`));
  }
}

/**
 * An implementation of {@link G3XNavRadioDataProvider} used by {@link DefaultG3XRadiosDataProvider}.
 */
class DefaultG3XNavRadioDataProvider extends AbstractG3XNavComRadioDataProvider implements G3XNavRadioDataProvider {
  /** @inheritDoc */
  public readonly index: 1 | 2;

  /** @inheritDoc */
  public readonly id: NavRadio;

  /** @inheritDoc */
  public readonly simIndex: NavRadioIndex;

  /**
   * Creates a new instance of DefaultG3XNavRadioDataProvider.
   * @param bus The event bus.
   * @param radioDef The definition for the provider's radio.
   */
  public constructor(bus: EventBus, radioDef: Readonly<NavRadioDefinition>) {
    super(bus);

    this.index = radioDef.index;
    this.id = radioDef.index === 2 ? 'NAV2' : 'NAV1';
    this.simIndex = radioDef.simIndex;
  }

  /**
   * Initializes this data provider. Once initialized, this data provider will continuously update its data until
   * paused or destroyed.
   */
  public init(): void {
    const sub = this.bus.getSubscriber<NavComEvents & ElectricalEvents>();

    this._isPowered.setConsumer(sub.on(`elec_circuit_nav_on_${this.simIndex}`));
    this._activeFrequency.setConsumer(sub.on(`nav_active_frequency_${this.simIndex}`));
    this._standbyFrequency.setConsumer(sub.on(`nav_standby_frequency_${this.simIndex}`));
    this._volume.setConsumer(sub.on(`nav_volume_${this.simIndex}`));
  }
}
