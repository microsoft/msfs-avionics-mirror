import { DefaultUserSettingManager, EventBus, UserSettingDefinition, UserSettingManager, UserSettingMap } from '@microsoft/msfs-sdk';

/**
 * Flight planning calculation user settings.
 */
export type FplCalculationUserSettingTypes = {
  /** The user-defined flight plan ground speed, in knots. */
  fplSpeed: number;

  /** The user-defined flight plan fuel flow, in gallons per hour. */
  fplFuelFlow: number;
};

/**
 * True flight planning calculation user settings.
 */
export type FplCalculationTrueUserSettingTypes = {
  [P in keyof FplCalculationUserSettingTypes as `${P}_g3x`]: FplCalculationUserSettingTypes[P];
};

/**
 * A utility class for retrieving flight planning calculation user setting managers.
 */
export class FplCalculationUserSettings {
  private static INSTANCE: UserSettingManager<FplCalculationUserSettingTypes> | undefined;

  /**
   * Retrieves a manager for flight planning calculation user settings.
   * @param bus The event bus.
   * @returns a manager for flight planning calculation user settings.
   */
  public static getManager(bus: EventBus): UserSettingManager<FplCalculationUserSettingTypes> {
    return FplCalculationUserSettings.INSTANCE ??= new DefaultUserSettingManager(
      bus,
      FplCalculationUserSettings.getSettingDefs()
    ).mapTo(FplCalculationUserSettings.getAliasMap());
  }

  /**
   * Gets the default values for a full set of aliased flight planning calculation settings.
   * @returns The default values for a full set of aliased flight planning calculation settings.
   */
  private static getDefaultValues(): FplCalculationUserSettingTypes {
    return {
      ['fplSpeed']: 120,
      ['fplFuelFlow']: 10
    };
  }

  /**
   * Gets an array of definitions for true flight planning calculation settings.
   * @returns An array of definitions for true flight planning calculation settings.
   */
  private static getSettingDefs(): readonly UserSettingDefinition<FplCalculationUserSettingTypes[keyof FplCalculationUserSettingTypes]>[] {
    const values = FplCalculationUserSettings.getDefaultValues();
    return Object.keys(values).map(name => {
      return {
        name: `${name}_g3x`,
        defaultValue: values[name as keyof typeof values]
      };
    });
  }

  /**
   * Gets a setting name alias mapping from aliased to true flight planning calculation settings.
   * @returns A setting name alias mapping from aliased to true flight planning calculation settings.
   */
  private static getAliasMap(): UserSettingMap<FplCalculationUserSettingTypes, FplCalculationTrueUserSettingTypes> {
    const map: UserSettingMap<FplCalculationUserSettingTypes, FplCalculationTrueUserSettingTypes> = {};

    for (const name of Object.keys(FplCalculationUserSettings.getDefaultValues()) as (keyof FplCalculationUserSettingTypes)[]) {
      map[name] = `${name}_g3x`;
    }

    return map;
  }
}
