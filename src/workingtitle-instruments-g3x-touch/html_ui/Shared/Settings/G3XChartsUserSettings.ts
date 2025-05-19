import {
  Consumer,
  DefaultUserSettingManager, EventBus, UserSetting, UserSettingDefinition, UserSettingManager, UserSettingMap,
  UserSettingRecord,
  UserSettingValue
} from '@microsoft/msfs-sdk';

/**
 * G3X Touch electronic charts display color modes.
 */
export enum G3XChartsColorModeSettingMode {
  Day = 'Day',
  Night = 'Night',
  Auto = 'Auto',
}

/**
 * Aliased G3X Touch electronic charts user settings.
 */
export type G3XChartsUserSettingTypes = {
  /** The unique ID (UID) of the preferred charts source. */
  chartsPreferredSource: string;

  /** The charts display color mode. */
  chartsColorMode: G3XChartsColorModeSettingMode;
};

/**
 * Aliased non-indexed electronic charts user settings.
 */
type G3XChartsAliasedNonIndexedUserSettingTypes = Pick<
  G3XChartsUserSettingTypes,
  'chartsPreferredSource'
>;

/**
 * Aliased indexed electronic charts user settings.
 */
type G3XChartsAliasedIndexedUserSettingTypes = Omit<G3XChartsUserSettingTypes, keyof G3XChartsAliasedNonIndexedUserSettingTypes>;

/**
 * True non-indexed electronic charts user settings.
 */
type G3XChartsNonIndexedUserSettingTypes = {
  [Name in keyof G3XChartsAliasedNonIndexedUserSettingTypes as `${Name}_g3x`]: G3XChartsAliasedNonIndexedUserSettingTypes[Name];
};

/**
 * True indexed electronic charts user settings for an indexed GDU.
 */
type G3XChartsIndexedUserSettingTypes<Index extends number> = {
  [Name in keyof G3XChartsAliasedIndexedUserSettingTypes as `${Name}_${Index}_g3x`]: G3XChartsUserSettingTypes[Name];
};

/**
 * All true G3X Touch electronic charts user settings.
 */
export type G3XChartsAllUserSettingTypes = G3XChartsIndexedUserSettingTypes<number> & G3XChartsNonIndexedUserSettingTypes;

/**
 * A manager for G3X Touch electronic charts user settings.
 */
export class G3XChartsUserSettingManager implements UserSettingManager<G3XChartsAllUserSettingTypes> {
  private static readonly NON_INDEXED_SETTING_NAMES
    = Object.keys(G3XChartsUserSettingManager.getNonIndexedDefaultValues()) as readonly (keyof G3XChartsAliasedNonIndexedUserSettingTypes)[];

  private static readonly INDEXED_SETTING_NAMES
    = Object.keys(G3XChartsUserSettingManager.getIndexedDefaultValues()) as readonly (keyof G3XChartsAliasedIndexedUserSettingTypes)[];

  private readonly manager: DefaultUserSettingManager<G3XChartsAllUserSettingTypes>;

  private readonly aliasedManagers: UserSettingManager<G3XChartsUserSettingTypes>[] = [];

  /**
   * Creates a new instance of G3XChartsUserSettingManager.
   * @param bus The event bus.
   * @param gduCount The number of GDUs supported by this manager.
   */
  public constructor(bus: EventBus, public readonly gduCount: number) {
    const settingDefs: UserSettingDefinition<any>[] = [];

    for (let i = 1; i <= gduCount; i++) {
      settingDefs.push(...G3XChartsUserSettingManager.getIndexedSettingDefs(i));
    }
    settingDefs.push(...G3XChartsUserSettingManager.getNonIndexedSettingDefs());

    this.manager = new DefaultUserSettingManager(bus, settingDefs);

    for (let i = 1; i <= gduCount; i++) {
      this.aliasedManagers[i] = this.manager.mapTo(G3XChartsUserSettingManager.getAliasMap(i));
    }
  }

  /** @inheritDoc */
  public tryGetSetting<K extends string>(name: K): K extends keyof G3XChartsAllUserSettingTypes ? UserSetting<G3XChartsAllUserSettingTypes[K]> : undefined {
    return this.manager.tryGetSetting(name) as any;
  }

  /** @inheritDoc */
  public getSetting<K extends keyof G3XChartsAllUserSettingTypes & string>(name: K): UserSetting<NonNullable<G3XChartsAllUserSettingTypes[K]>> {
    return this.manager.getSetting(name);
  }

  /** @inheritDoc */
  public whenSettingChanged<K extends keyof G3XChartsAllUserSettingTypes & string>(name: K): Consumer<NonNullable<G3XChartsAllUserSettingTypes[K]>> {
    return this.manager.whenSettingChanged(name);
  }

  /** @inheritDoc */
  public getAllSettings(): UserSetting<UserSettingValue>[] {
    return this.manager.getAllSettings();
  }

  /** @inheritDoc */
  public mapTo<M extends UserSettingRecord>(map: UserSettingMap<M, G3XChartsAllUserSettingTypes>): UserSettingManager<M & G3XChartsAllUserSettingTypes> {
    return this.manager.mapTo(map);
  }

  /**
   * Gets a manager for aliased electronic charts user settings for an indexed GDU.
   * @param index The index of the GDU for which to get an aliased setting manager.
   * @returns A manager for aliased electronic charts user settings for the specified GDU.
   * @throws RangeError if `index` is less than 1 or greater than the number of GDUs supported by this manager.
   */
  public getAliasedManager(index: number): UserSettingManager<G3XChartsUserSettingTypes> {
    if (index < 1 || index > this.gduCount) {
      throw new RangeError();
    }

    return this.aliasedManagers[index];
  }

  /**
   * Gets an array of definitions for true electronic charts settings for a single GDU.
   * @param index The index of the GDU.
   * @returns An array of definitions for true electronic charts settings for the specified GDU.
   */
  private static getIndexedSettingDefs(
    index: number
  ): readonly UserSettingDefinition<G3XChartsIndexedUserSettingTypes<number>[keyof G3XChartsIndexedUserSettingTypes<number>]>[] {
    const values = G3XChartsUserSettingManager.getIndexedDefaultValues();
    return Object.keys(values).map(name => {
      return {
        name: `${name}_${index}_g3x`,
        defaultValue: values[name as keyof typeof values]
      };
    });
  }

  /**
   * Gets an array of definitions for non-indexed electronic charts settings.
   * @returns An array of definitions for non-indexed electronic charts settings.
   */
  private static getNonIndexedSettingDefs(): readonly UserSettingDefinition<G3XChartsNonIndexedUserSettingTypes[keyof G3XChartsNonIndexedUserSettingTypes]>[] {
    const values = G3XChartsUserSettingManager.getNonIndexedDefaultValues();
    return Object.keys(values).map(name => {
      return {
        name: `${name}_g3x`,
        defaultValue: values[name as keyof typeof values]
      };
    });
  }

  /**
   * Gets the default values for a full set of aliased indexed electronic charts settings.
   * @returns The default values for a full set of aliased indexed electronic charts settings.
   */
  private static getIndexedDefaultValues(): G3XChartsAliasedIndexedUserSettingTypes {
    return {
      'chartsColorMode': G3XChartsColorModeSettingMode.Day,
    };
  }

  /**
   * Gets the default values for all non-indexed electronic charts settings.
   * @returns The default values for all non-indexed electronic charts settings.
   */
  private static getNonIndexedDefaultValues(): G3XChartsAliasedNonIndexedUserSettingTypes {
    return {
      'chartsPreferredSource': '',
    };
  }

  /**
   * Gets a setting name alias mapping for a GDU.
   * @param index The index of the GDU.
   * @returns A setting name alias mapping for the specified GDU.
   */
  private static getAliasMap<Index extends number>(
    index: Index
  ): UserSettingMap<G3XChartsUserSettingTypes, G3XChartsIndexedUserSettingTypes<Index> & G3XChartsNonIndexedUserSettingTypes> {
    const map: UserSettingMap<G3XChartsUserSettingTypes, G3XChartsIndexedUserSettingTypes<Index> & G3XChartsNonIndexedUserSettingTypes> = {};

    for (const name of G3XChartsUserSettingManager.NON_INDEXED_SETTING_NAMES) {
      map[name] = `${name}_g3x`;
    }

    for (const name of G3XChartsUserSettingManager.INDEXED_SETTING_NAMES) {
      map[name] = `${name}_${index}_g3x`;
    }

    return map;
  }
}
