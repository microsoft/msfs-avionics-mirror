import { DefaultUserSettingManager, EventBus, UserSettingDefinition, UserSettingManager, UserSettingMap } from '@microsoft/msfs-sdk';

/**
 * Flight plan source setting modes.
 */
export enum G3XFplSourceSettingMode {
  Internal = 'Internal',
  External = 'External'
}

/**
 * Flight plan source user settings.
 */
export type FplSourceUserSettingTypes = {
  /** The desired flight plan source. */
  fplSource: G3XFplSourceSettingMode;
};

/**
 * True flight plan source user settings.
 */
export type FplSourceTrueUserSettingTypes = {
  [P in keyof FplSourceUserSettingTypes as `${P}_g3x`]: FplSourceUserSettingTypes[P];
};

/**
 * A utility class for retrieving flight plan source user setting managers.
 */
export class FplSourceUserSettings {
  private static INSTANCE: UserSettingManager<FplSourceUserSettingTypes> | undefined;

  /**
   * Retrieves a manager for flight plan source user settings.
   * @param bus The event bus.
   * @returns a manager for flight plan source user settings.
   */
  public static getManager(bus: EventBus): UserSettingManager<FplSourceUserSettingTypes> {
    return FplSourceUserSettings.INSTANCE ??= new DefaultUserSettingManager(
      bus,
      FplSourceUserSettings.getSettingDefs()
    ).mapTo(FplSourceUserSettings.getAliasMap());
  }

  /**
   * Gets the default values for a full set of aliased flight plan source settings.
   * @returns The default values for a full set of aliased flight plan source settings.
   */
  private static getDefaultValues(): FplSourceUserSettingTypes {
    return {
      ['fplSource']: G3XFplSourceSettingMode.Internal
    };
  }

  /**
   * Gets an array of definitions for true flight plan source settings.
   * @returns An array of definitions for true flight plan source settings.
   */
  private static getSettingDefs(): readonly UserSettingDefinition<FplSourceUserSettingTypes[keyof FplSourceUserSettingTypes]>[] {
    const values = FplSourceUserSettings.getDefaultValues();
    return Object.keys(values).map(name => {
      return {
        name: `${name}_g3x`,
        defaultValue: values[name as keyof typeof values]
      };
    });
  }

  /**
   * Gets a setting name alias mapping from aliased to true flight plan source settings.
   * @returns A setting name alias mapping from aliased to true flight plan source settings.
   */
  private static getAliasMap(): UserSettingMap<FplSourceUserSettingTypes, FplSourceTrueUserSettingTypes> {
    const map: UserSettingMap<FplSourceUserSettingTypes, FplSourceTrueUserSettingTypes> = {};

    for (const name of Object.keys(FplSourceUserSettings.getDefaultValues()) as (keyof FplSourceUserSettingTypes)[]) {
      map[name] = `${name}_g3x`;
    }

    return map;
  }
}
