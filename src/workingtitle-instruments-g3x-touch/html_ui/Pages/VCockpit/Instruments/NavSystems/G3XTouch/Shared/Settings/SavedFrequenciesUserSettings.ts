import {
  Consumer, DefaultUserSettingManager, EventBus, UserSetting, UserSettingDefinition, UserSettingManager, UserSettingMap, UserSettingRecord, UserSettingValue,
} from '@microsoft/msfs-sdk';

/** The user settings for the COM frequencies. */
export type ComFrequencyUserSettingTypes = {
  /** The name and frequency of the radio station, separated by ';'. */
  frequencyComRecent: string;
  /** The name and frequency of the radio station, separated by ';'. */
  frequencyComUser: string;
}

/** The user settings for the NAV frequencies. */
export type NavFrequencyUserSettingTypes = {
  /** The name and frequency of the radio station, separated by ';'. */
  frequencyNavRecent: string;
  /** The name and frequency of the radio station, separated by ';'. */
  frequencyNavUser: string;
}

/** The user settings for the saved frequencies. */
export type SavedFrequencyUserSettingTypes = ComFrequencyUserSettingTypes & NavFrequencyUserSettingTypes;

/** Valid index types for saved frequencies. */
export type SavedFrequencyIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16;

/** The user settings for the saved frequencies, indexed by {@link SavedFrequencyIndex}. */
type SavedFrequencyIndexedUserSettingTypes<Index extends SavedFrequencyIndex> = {
  [Name in keyof SavedFrequencyUserSettingTypes as `${Name}_${Index}_g3x`]: SavedFrequencyUserSettingTypes[Name];
};

/** The user settings for the saved frequencies, indexed by {@link SavedFrequencyIndex}. */
export type SavedFrequencyAllUserSettingTypes = SavedFrequencyIndexedUserSettingTypes<SavedFrequencyIndex>;

/**
 * A user setting manager for saved frequencies.
 */
export class SavedFrequenciesUserSettingsManager implements UserSettingManager<SavedFrequencyAllUserSettingTypes> {
  private readonly manager: DefaultUserSettingManager<SavedFrequencyAllUserSettingTypes>;

  /**
   * Creates a new instance of SavedFrequenciesUserSettingsManager.
   * @param bus The event bus.
   */
  public constructor(bus: EventBus) {
    const settingDefs: UserSettingDefinition<any>[] = [];

    for (let i: SavedFrequencyIndex = 1; i <= 16; i++) {
      settingDefs.push(...SavedFrequenciesUserSettingsManager.getIndexedSettingDefs(i as SavedFrequencyIndex));
    }

    this.manager = new DefaultUserSettingManager(bus, settingDefs);
  }

  /** @inheritDoc */
  public tryGetSetting<K extends string>(name: K): K extends keyof SavedFrequencyAllUserSettingTypes ? UserSetting<SavedFrequencyAllUserSettingTypes[K]> : undefined {
    return this.manager.tryGetSetting(name) as any;
  }

  /** @inheritDoc */
  public getSetting<K extends keyof SavedFrequencyAllUserSettingTypes & string>(name: K): UserSetting<NonNullable<SavedFrequencyAllUserSettingTypes[K]>> {
    return this.manager.getSetting(name);
  }

  /** @inheritDoc */
  public whenSettingChanged<K extends keyof SavedFrequencyAllUserSettingTypes & string>(name: K): Consumer<NonNullable<SavedFrequencyAllUserSettingTypes[K]>> {
    return this.manager.whenSettingChanged(name);
  }

  /** @inheritdoc */
  public getAllSettings(): UserSetting<UserSettingValue>[] {
    return this.manager.getAllSettings();
  }

  /** @inheritDoc */
  public mapTo<M extends UserSettingRecord>(map: UserSettingMap<M, SavedFrequencyAllUserSettingTypes>): UserSettingManager<M & SavedFrequencyAllUserSettingTypes> {
    return this.manager.mapTo(map);
  }

  /**
   * Gets a manager for Saved Frequency user settings.
   * @returns A manager for Saved Frequency user settings.
   */
  public getManager(): DefaultUserSettingManager<SavedFrequencyAllUserSettingTypes> {
    return this.manager;
  }

  /**
   * Gets an array of definitions for true Saved Frequency settings for a single saved frequency slot.
   * @param index The index of the saved frequency slot.
   * @returns An array of definitions for true Saved Frequency settings for the specified saved frequency slot.
   */
  private static getIndexedSettingDefs(index: SavedFrequencyIndex): readonly UserSettingDefinition<any>[] {
    const values = SavedFrequenciesUserSettingsManager.getIndexedDefaultValues();
    return Object.keys(values).map((name) => {
      return {
        name: `${name}_${index}_g3x`,
        defaultValue: values[name as keyof typeof values],
      };
    });
  }

  /**
   * Gets the default values for a full set of aliased indexed Saved Frequency settings.
   * @returns The default values for a full set of aliased indexed Saved Frequency settings.
   */
  private static getIndexedDefaultValues(): SavedFrequencyUserSettingTypes {
    return {
      frequencyComRecent: '',
      frequencyComUser: '',
      frequencyNavRecent: '',
      frequencyNavUser: '',
    };
  }
}
