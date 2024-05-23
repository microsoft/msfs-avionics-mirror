import { ArraySubject, EventBus, SubscribableArray, Subscription } from '@microsoft/msfs-sdk';

import { G3XNavComControlEvents, SavedFrequenciesData } from '../NavCom/G3XNavComEventPublisher';

/**
 * A data provider for saved radio frequencies.
 */
export interface RadioSavedFrequenciesDataProvider {
  /** The recently used com frequencies. */
  readonly recentComFrequencies: SubscribableArray<SavedFrequenciesData>;
  /** The user-defined com frequencies. */
  readonly userComFrequencies: SubscribableArray<SavedFrequenciesData>;
  /** The recently used nav frequencies. */
  readonly recentNavFrequencies: SubscribableArray<SavedFrequenciesData>;
  /** The user-defined nav frequencies. */
  readonly userNavFrequencies: SubscribableArray<SavedFrequenciesData>;
}

/**
 * A default data provider for ${@link RadioSavedFrequenciesDataProvider}.
 */
export class DefaultRadioSavedFrequenciesDataProvider {
  private readonly _recentComFrequencies = ArraySubject.create<SavedFrequenciesData>([]);
  public readonly recentComFrequencies = this._recentComFrequencies as SubscribableArray<SavedFrequenciesData>;

  private readonly _userComFrequencies = ArraySubject.create<SavedFrequenciesData>([]);
  public readonly userComFrequencies = this._userComFrequencies as SubscribableArray<SavedFrequenciesData>;

  private readonly _recentNavFrequencies = ArraySubject.create<SavedFrequenciesData>([]);
  public readonly recentNavFrequencies = this._recentNavFrequencies as SubscribableArray<SavedFrequenciesData>;

  private readonly _userNavFrequencies = ArraySubject.create<SavedFrequenciesData>([]);
  public readonly userNavFrequencies = this._userNavFrequencies as SubscribableArray<SavedFrequenciesData>;

  private isInit = false;
  private isAlive = true;
  private isPaused = false;

  private readonly navComSub = this.bus.getSubscriber<G3XNavComControlEvents>();
  private navComSubscription?: Subscription;

  /**
   * Constructor for the provider.
   * @param bus The event bus.
   */
  public constructor(private readonly bus: EventBus) {
  }

  /**
   * Initializes the provider.
   * @param paused Whether the provider should be paused after initialization. Defaults to false.
   * @throws Error if this data provider is dead.
   */
  public init(paused = false): void {
    if (!this.isAlive) {
      throw new Error('SavedNavComFrequencyDataProvider: cannot initialize a dead provider');
    }

    if (this.isInit) {
      return;
    }

    this.navComSubscription = this.navComSub.on('frequency_array_changed').handle(event => {
      if (event.radioType === 'com') {
        if (event.frequencyType === 'recent') {
          this._recentComFrequencies.set(event.frequencyArray);
        } else {
          this._userComFrequencies.set(event.frequencyArray);
        }
      } else {
        if (event.frequencyType === 'recent') {
          this._recentNavFrequencies.set(event.frequencyArray);
        } else {
          this._userNavFrequencies.set(event.frequencyArray);
        }
      }
    });


    this.isInit = true;
    this.isPaused = paused;

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
      throw new Error('SavedNavComFrequencyDataProvider: cannot resume a dead provider');
    }

    if (!this.isPaused) {
      return;
    }

    this.navComSubscription?.resume();
    this.isPaused = false;
  }

  /**
   * Pauses this data provider. Once paused, this data provider will not update its data until it is resumed.
   * @throws Error if this data provider is dead.
   */
  public pause(): void {
    if (!this.isAlive) {
      throw new Error('SavedNavComFrequencyDataProvider: cannot pause a dead provider');
    }

    if (this.isPaused) {
      return;
    }

    this.navComSubscription?.pause();
    this.isPaused = true;
  }

  /**
   * Destroys this data provider. Once destroyed, this data provider will no longer update its provided data, and can
   * no longer be paused or resumed.
   */
  public destroy(): void {
    this.isAlive = false;

    this.navComSubscription?.destroy();
  }
}
