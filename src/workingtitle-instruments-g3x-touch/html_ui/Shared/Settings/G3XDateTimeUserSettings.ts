import { DefaultUserSettingManager, EventBus, UserSettingDefinition, UserSettingManager, UserSettingMap } from '@microsoft/msfs-sdk';

import { DateTimeFormatSettingMode, DateTimeUserSettingTypes } from '@microsoft/msfs-garminsdk';

/**
 * True G3X Touch date/time user settings.
 */
export type G3XDateTimeTrueUserSettingTypes = {
  [P in keyof DateTimeUserSettingTypes as `${P}_g3x`]: DateTimeUserSettingTypes[P];
};

/**
 * A utility class for retrieving G3X Touch date/time user setting managers.
 */
export class G3XDateTimeUserSettings {
  private static INSTANCE: UserSettingManager<DateTimeUserSettingTypes> | undefined;

  /**
   * Retrieves a manager for G3X Touch date/time user settings.
   * @param bus The event bus.
   * @returns A manager for G3X Touch date/time user settings.
   */
  public static getManager(bus: EventBus): UserSettingManager<DateTimeUserSettingTypes> {
    return G3XDateTimeUserSettings.INSTANCE ??= new DefaultUserSettingManager(
      bus,
      G3XDateTimeUserSettings.getSettingDefs()
    ).mapTo(G3XDateTimeUserSettings.getAliasMap());
  }

  /**
   * Gets the default values for a full set of aliased date/time user settings.
   * @returns The default values for a full set of aliased date/time user settings.
   */
  private static getDefaultValues(): DateTimeUserSettingTypes {
    return {
      ['dateTimeFormat']: DateTimeFormatSettingMode.UTC,
      ['dateTimeLocalOffset']: 0
    };
  }

  /**
   * Gets an array of definitions for true date/time user settings.
   * @returns An array of definitions for true date/time user settings.
   */
  private static getSettingDefs(): readonly UserSettingDefinition<DateTimeUserSettingTypes[keyof DateTimeUserSettingTypes]>[] {
    const values = G3XDateTimeUserSettings.getDefaultValues();
    return Object.keys(values).map(name => {
      return {
        name: `${name}_g3x`,
        defaultValue: values[name as keyof typeof values]
      };
    });
  }

  /**
   * Gets a setting name alias mapping from aliased to true date/time settings.
   * @returns A setting name alias mapping from aliased to true date/time settings.
   */
  private static getAliasMap(): UserSettingMap<DateTimeUserSettingTypes, G3XDateTimeTrueUserSettingTypes> {
    const map: UserSettingMap<DateTimeUserSettingTypes, G3XDateTimeTrueUserSettingTypes> = {};

    for (const name of Object.keys(G3XDateTimeUserSettings.getDefaultValues()) as (keyof DateTimeUserSettingTypes)[]) {
      map[name] = `${name}_g3x`;
    }

    return map;
  }
}