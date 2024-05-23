import { ArraySubject, ConsumerSubject, ConsumerValue, DebounceTimer, EventBus, NavComEvents, SimVarValueType, Subscription, UserSetting } from '@microsoft/msfs-sdk';

import { G3XNavComControlEvents, G3XNavComControlPublisher, SavedFrequenciesData } from './G3XNavComEventPublisher';
import { SavedFrequenciesUserSettingsManager, SavedFrequencyIndex } from '../Settings';
import { RadiosConfig } from '../AvionicsConfig';

/** Interface for radio data. */
interface RadioData {
  /** The index of the radio in the sim. */
  simIndex: number;
  /** The debounce timer for the name resolve. */
  nameResolveDebounce: DebounceTimer;
}

/** Interface for COM radio data. */
interface ComRadioData extends RadioData {
  /** The active frequency subject. */
  comActiveFrequencySubject: ConsumerSubject<number>;
  /** The active ident value. */
  comActiveIdentValue: ConsumerValue<string>;
  /** The active type value. */
  comActiveTypeValue: ConsumerValue<string>;
}

/** Interface for NAV radio data. */
interface NavRadioData extends RadioData {
  /** The active frequency subject. */
  navActiveFrequencySubject: ConsumerSubject<number>;
  /** The active ident value. */
  navActiveAirportIdentValue: ConsumerValue<string>;
}

/** A manager for saved nav com frequencies. */
export class SavedNavComFrequencyManager {
  private readonly MAXIMUM_FREQUENCY_SLOTS = 16;
  private readonly facilityTypeMap = new Map<string, string>([
    ['ATIS', 'ATIS'],
    ['UNI', 'Unicom'],
    ['CTAF', 'CTAF'],
    ['GND', 'Ground'],
    ['TWR', 'Tower'],
    ['CLR', 'Clearance'],
    ['APPR', 'Approach'],
    ['DEP', 'Departure'],
    ['FSS', 'FSS'],
    ['AWS', 'AWOS']
  ]);

  private readonly _recentComFrequencies = ArraySubject.create<SavedFrequenciesData>();
  private readonly _userComFrequencies = ArraySubject.create<SavedFrequenciesData>();
  private readonly _recentNavFrequencies = ArraySubject.create<SavedFrequenciesData>();
  private readonly _userNavFrequencies = ArraySubject.create<SavedFrequenciesData>();

  private readonly navComControlSub = this.bus.getSubscriber<G3XNavComControlEvents>();
  private readonly navComSub = this.bus.getSubscriber<NavComEvents>();

  private readonly comRadioMap = new Map<number, ComRadioData>();
  private readonly navRadioMap = new Map<number, NavRadioData>();

  private readonly pausableSubscriptions: Subscription[] = [];

  private isInit = false;
  private isAlive = true;
  private isPaused = false;

  /**
   * Creates a new instance of SavedNavComFrequencyManager.
   * @param bus The event bus.
   * @param savedFrequencySettingManager The user settings manager.
   * @param radiosConfig The radios config.
   * @param publisher The G3X NavCom control event publisher.
   */
  constructor(
    private readonly bus: EventBus,
    private readonly savedFrequencySettingManager: SavedFrequenciesUserSettingsManager,
    private readonly radiosConfig: RadiosConfig,
    private readonly publisher: G3XNavComControlPublisher,
  ) {
  }

  /**
   * Initializes the manager.
   * @param paused Whether the manager is paused.
   * @throws Error if the manager is dead.
   */
  public init(paused = false): void {
    if (!this.isAlive) {
      throw new Error('SavedNavComFrequencyManager: cannot initialize a dead manager');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;
    this.isPaused = paused;

    // Initialize the recent and user-defined COM and NAV frequencies from the user settings.
    this.initFromUserSettings();

    // Initialize radios
    this.initComRadios();
    this.initNavRadios();

    // Initialize handlers for the "add_saved_frequency" and "remove_saved_frequency" events.
    this.pausableSubscriptions.push(
      this.navComControlSub.on('add_saved_frequency').handle(this.handleAddSavedFrequency.bind(this), paused),
      this.navComControlSub.on('remove_saved_frequency').handle(this.handleRemoveSavedFrequency.bind(this), paused),
    );

    // Initialize publishing the changed frequency arrays.
    this.initArrayUpdates();

    if (paused) {
      this.pause();
    }
  }

  /**
   * Initializes the recent and user-defined COM and NAV frequencies from the user settings.
   */
  private initFromUserSettings(): void {
    const manager = this.savedFrequencySettingManager.getManager();
    for (let i = 1 as SavedFrequencyIndex; i <= this.MAXIMUM_FREQUENCY_SLOTS; i++) {
      const comRecent = this.parseFrequencyFromUserSetting(manager.getSetting(`frequencyComRecent_${i}_g3x`));
      if (comRecent) {
        this._recentComFrequencies.insert(comRecent);
      }
      const comUser = this.parseFrequencyFromUserSetting(manager.getSetting(`frequencyComUser_${i}_g3x`));
      if (comUser) {
        this._userComFrequencies.insert(comUser);
      }
      const navRecent = this.parseFrequencyFromUserSetting(manager.getSetting(`frequencyNavRecent_${i}_g3x`));
      if (navRecent) {
        this._recentNavFrequencies.insert(navRecent);
      }
      const navUser = this.parseFrequencyFromUserSetting(manager.getSetting(`frequencyNavUser_${i}_g3x`));
      if (navUser) {
        this._userNavFrequencies.insert(navUser);
      }
    }
  }

  /**
   * Initializes the COM radios.
   */
  private initComRadios(): void {
    for (let i = 1 as 1 | 2; i <= this.radiosConfig.comCount; i++) {
      const comRadio = this.radiosConfig.comDefinitions[i];
      if (!comRadio) {
        continue;
      }
      this.comRadioMap.set(comRadio.index, {
        simIndex: comRadio.simIndex,
        comActiveFrequencySubject: ConsumerSubject.create(this.navComSub.on(`com_active_frequency_${comRadio.simIndex}`), 0),
        comActiveIdentValue: ConsumerValue.create(this.navComSub.on(`com_active_facility_ident_${comRadio.simIndex}`), ''),
        comActiveTypeValue: ConsumerValue.create(this.navComSub.on(`com_active_facility_type_${comRadio.simIndex}`), ''),
        nameResolveDebounce: new DebounceTimer(),
      });
    }

    this.comRadioMap.forEach(comRadio => {
      this.pausableSubscriptions.push(comRadio.comActiveFrequencySubject.sub(freq => {
        if (freq === 0) {
          // frequency can be 0 on initialization, in this case, skip the update
          return;
        }
        // leave time for the ident and type to update
        comRadio.nameResolveDebounce.schedule(() => {
          const name = this.getComFacilityName(comRadio);
          this.publisher.publishEvent('add_saved_frequency', {
            radioType: 'com',
            frequencyType: 'recent',
            frequency: freq,
            name: name ?? '',
          });
        }, 500);
      }, !this.isPaused));
    });
  }

  /**
   * Initializes the NAV radios.
   */
  private initNavRadios(): void {
    for (let i = 1 as 1 | 2; i <= this.radiosConfig.navCount; i++) {
      const navRadio = this.radiosConfig.navDefinitions[i];
      if (!navRadio) {
        continue;
      }
      this.navRadioMap.set(navRadio.index, {
        simIndex: navRadio.simIndex,
        navActiveFrequencySubject: ConsumerSubject.create(this.navComSub.on(`nav_active_frequency_${navRadio.simIndex}`), 0),
        navActiveAirportIdentValue: ConsumerValue.create(this.navComSub.on(`nav_loc_airport_ident_${navRadio.simIndex}`), ''),
        nameResolveDebounce: new DebounceTimer(),
      });
    }

    this.navRadioMap.forEach((navRadio) => {
      this.pausableSubscriptions.push(navRadio.navActiveFrequencySubject.sub(freq => {
        if (freq === 0) {
          // frequency can be 0 on initialization, in this case, skip the update
          return;
        }
        // leave time for the ident and type to update - takes more than for COM radios to populate
        navRadio.nameResolveDebounce.schedule(() => {
          this.publisher.publishEvent('add_saved_frequency', {
            radioType: 'nav',
            frequencyType: 'recent',
            frequency: freq,
            name: this.getNavFacilityName(navRadio) ?? '',
          });
        }, 1000);
      }, !this.isPaused));
    });
  }

  /**
   * Initializes publishing the changed frequency arrays.
   */
  private initArrayUpdates(): void {
    this.pausableSubscriptions.push(
      this._recentComFrequencies.sub((index, type, item, array) => {
        this.publisher.publishEvent('frequency_array_changed', {
          radioType: 'com',
          frequencyType: 'recent',
          frequencyArray: array,
        });
      }, true),
      this._userComFrequencies.sub((index, type, item, array) => {
        this.publisher.publishEvent('frequency_array_changed', {
          radioType: 'com',
          frequencyType: 'user',
          frequencyArray: array,
        });
      }, true),
      this._recentNavFrequencies.sub((index, type, item, array) => {
        this.publisher.publishEvent('frequency_array_changed', {
          radioType: 'nav',
          frequencyType: 'recent',
          frequencyArray: array,
        });
      }, true),
      this._userNavFrequencies.sub((index, type, item, array) => {
        this.publisher.publishEvent('frequency_array_changed', {
          radioType: 'nav',
          frequencyType: 'user',
          frequencyArray: array,
        });
      }, true),
    );
  }

  /**
   * Finds the index of a frequency in the list of recently used COM/NAV frequencies.
   * @param frequency The frequency, in MHz.
   * @param recentFrequencies The list of recently used COM/NAV frequencies.
   * @returns The index of the frequency, or `-1` if the frequency is not in the list.
   */
  private findRecentFrequencyIndex(frequency: number, recentFrequencies: readonly SavedFrequenciesData[]): number {
    // accounting for floating point errors
    return recentFrequencies.findIndex(data => Math.abs(data.frequency - frequency) < 0.001);
  }

  /**
   * Inserts a frequency into the list of recently used COM/NAV frequencies.
   * @param frequency The frequency, in MHz.
   * @param name The name of the facility.
   * @param type The type of radio. Either `'com'` or `'nav'`.
   */
  private insertRecentFrequency(frequency: number, name: string, type: 'com' | 'nav'): void {
    let array = type === 'com' ? this._recentComFrequencies.getArray().slice() : this._recentNavFrequencies.getArray().slice();
    const frequencyIndex = this.findRecentFrequencyIndex(frequency, array);

    if (frequencyIndex === -1 || frequencyIndex === this.MAXIMUM_FREQUENCY_SLOTS - 1) {
      array = array.slice(0, this.MAXIMUM_FREQUENCY_SLOTS - 1);
      array.unshift({frequency, name});
    } else {
      array.splice(frequencyIndex, 1);
      array.unshift({frequency, name});
    }

    if (type === 'com') {
      this._recentComFrequencies.set(array);
      this.updateComRecentFrequencySettings();
    } else {
      this._recentNavFrequencies.set(array);
      this.updateNavRecentFrequencySettings();
    }
  }

  /**
   * Inserts a frequency into the list of user-defined COM/NAV frequencies.
   * @param frequency The frequency, in MHz.
   * @param name The name of the facility.
   * @param type The type of radio. Either `'com'` or `'nav'`.
   * @private
   */
  private insertUserFrequency(frequency: number, name: string, type: 'com' | 'nav'): void {
    const arraySubject = type === 'com' ? this._userComFrequencies : this._userNavFrequencies;

    if (arraySubject.getArray().length < this.MAXIMUM_FREQUENCY_SLOTS) {
      arraySubject.insert({frequency, name});
      if (type === 'com') {
        this.updateComUserFrequencySettings();
      } else {
        this.updateNavUserFrequencySettings();
      }
    }
  }

  /**
   * Handles the "add_saved_frequency" event by adding the frequency to the proper array.
   * @param event The "add_saved_frequency" event.
   */
  private handleAddSavedFrequency(event: G3XNavComControlEvents['add_saved_frequency']): void {
    if (event.frequencyType === 'recent') {
      this.insertRecentFrequency(event.frequency, event.name, event.radioType);
    } else {
      this.insertUserFrequency(event.frequency, event.name, event.radioType);
    }
  }

  /**
   * Handles the "remove_saved_frequency" event by removing the frequency from the array.
   * @param event The "remove_saved_frequency" event.
   */
  private handleRemoveSavedFrequency(event: G3XNavComControlEvents['remove_saved_frequency']): void {
    if (event.frequencyType === 'recent') {
      // Cannot manually remove a recent frequency.
      return;
    }
    const arraySubject = event.radioType === 'com' ? this._userComFrequencies : this._userNavFrequencies;

    const index = arraySubject.getArray().findIndex(f => f.frequency === event.frequency && f.name === event.name);
    if (index > -1) {
      arraySubject.removeAt(index);
      if (event.radioType === 'com') {
        this.updateComUserFrequencySettings();
      } else {
        this.updateNavUserFrequencySettings();
      }
    }
  }

  /**
   * Updates the user settings for recent COM frequencies.
   */
  private updateComRecentFrequencySettings(): void {
    const array = this._recentComFrequencies.getArray();
    const manager = this.savedFrequencySettingManager.getManager();
    for (let i = 1 as SavedFrequencyIndex; i <= 16; i++) {
      const data = array[i-1];
      if (data) {
        manager.getSetting(`frequencyComRecent_${i}_g3x`).set(`${data.name};${data.frequency}`);
      }
    }
  }

  /**
   * Updates the user settings for user COM frequencies.
   */
  private updateComUserFrequencySettings(): void {
    const array = this._userComFrequencies.getArray();
    const manager = this.savedFrequencySettingManager.getManager();
    for (let i = 1 as SavedFrequencyIndex; i <= 16; i++) {
      const data = array[i-1];
      if (data) {
        manager.getSetting(`frequencyComUser_${i}_g3x`).set(`${data.name};${data.frequency}`);
      }
    }
  }

  /**
   * Updates the user settings for recent NAV frequencies.
   */
  private updateNavRecentFrequencySettings(): void {
    const array = this._recentNavFrequencies.getArray();
    const manager = this.savedFrequencySettingManager.getManager();
    for (let i = 1 as SavedFrequencyIndex; i <= 16; i ++) {
      const data = array[i - 1];
      if (data) {
        manager.getSetting(`frequencyNavRecent_${ i }_g3x`).set(`${ data.name };${ data.frequency }`);
      }
    }
  }

  /**
   * Updates the user settings for user NAV frequencies.
   */
  private updateNavUserFrequencySettings(): void {
    const array = this._userNavFrequencies.getArray();
    const manager = this.savedFrequencySettingManager.getManager();
    for (let i = 1 as SavedFrequencyIndex; i <= 16; i ++) {
      const data = array[i - 1];
      if (data) {
        manager.getSetting(`frequencyNavUser_${ i }_g3x`).set(`${ data.name };${ data.frequency }`);
      }
    }
  }


  /**
   * Parses a frequency from a user setting, if data is present in the setting.
   * @param setting The user setting.
   * @returns The parsed frequency, or `null` if no data was present in the setting.
   */
  private parseFrequencyFromUserSetting(setting: UserSetting<string>): SavedFrequenciesData | null {
    const data = setting.get().split(';');
    const name = data[0];
    const freq = Number(data[1]);
    return name && freq ? {frequency: Number(data[1]), name: data[0]} : null;
  }

  /**
   * Gets the name of a COM radio facility.
   * @param radio The radio data
   * @returns The name of the facility, or null if the facility is not a known station in the area.
   */
  private getComFacilityName(radio: ComRadioData): string | null {
    const ident = radio.comActiveIdentValue.get();
    const type = radio.comActiveTypeValue.get();
    return (ident && type && ident !== 'COM' && type !== 'ACTIVE') ? `${ident} ${this.facilityTypeMap.get(type) ?? type}` : '';
  }

  /**
   * Gets the name of a NAV radio facility.
   * @param radio The radio data.
   * @returns The name of the facility, or null if the facility is not a known station in the area.
   */
  private getNavFacilityName(radio: NavRadioData): string | null {
    const ident = radio.navActiveAirportIdentValue.get();
    const name = SimVar.GetSimVarValue(`NAV NAME:${radio.simIndex}`, SimVarValueType.String);
    return ident ? `${ident} ${name}` : name;
  }

  /**
   * Resumes this data provider. Once resumed, this data provider will continuously update its data until paused or
   * destroyed.
   * @throws Error if this data provider is dead.
   */
  public resume(): void {
    if (!this.isAlive) {
      throw new Error('SavedNavComFrequencyManager: cannot resume a dead manager');
    }

    if (!this.isPaused) {
      return;
    }

    this.isPaused = false;
  }

  /**
   * Pauses this manager. Once paused, this manager will not update its data until it is resumed.
   * @throws Error if this data provider is dead.
   */
  public pause(): void {
    if (!this.isAlive) {
      throw new Error('SavedNavComFrequencyManager: cannot pause a dead manager');
    }

    if (this.isPaused) {
      return;
    }

    this.pausableSubscriptions.forEach(s => s.pause());
    this.publisher.stopPublish();
  }

  /**
   * Resumes this manager. Once resumed, this manager will no longer update its provided data, and can
   * no longer be paused or resumed.
   */
  public destroy(): void {
    this.isAlive = false;
    this.isInit = false;
    this.pausableSubscriptions.forEach(s => s.destroy());
    this.publisher.stopPublish();
  }
}
