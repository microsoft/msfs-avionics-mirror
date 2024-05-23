import { DefaultUserSettingManager, EventBus, UserSettingDefinition, UserSettingManager, UserSettingMap } from '@microsoft/msfs-sdk';


/**
 * Backlight control user setting modes.
 */
export enum BacklightControlSettingMode {
  Manual = 'Manual',
  LightBus = 'LightBus',
  PhotoCell = 'PhotoCell'
}

/**
 * Backlight user settings.
 */
export type BacklightUserSettingTypes = {
  /** The selected backlight control mode. */
  displayBacklightMode: BacklightControlSettingMode;

  /** The manual backlight intensity level, in the range `[0, 1]`. */
  displayBacklightManualLevel: number;
};

/**
 * True backlight user settings.
 */
export type BacklightTrueUserSettingTypes = {
  [P in keyof BacklightUserSettingTypes as `${P}_g3x`]: BacklightUserSettingTypes[P];
};

/**
 * A utility class for retrieving backlight user setting managers.
 */
export class BacklightUserSettings {
  private static INSTANCE: UserSettingManager<BacklightUserSettingTypes> | undefined;

  /**
   * Retrieves a manager for backlight user settings.
   * @param bus The event bus.
   * @returns a manager for backlight user settings.
   */
  public static getManager(bus: EventBus): UserSettingManager<BacklightUserSettingTypes> {
    return BacklightUserSettings.INSTANCE ??= new DefaultUserSettingManager(
      bus,
      BacklightUserSettings.getSettingDefs(),
      true
    ).mapTo(BacklightUserSettings.getAliasMap());
  }

  /**
   * Gets the default values for a full set of aliased backlight settings.
   * @returns The default values for a full set of aliased backlight settings.
   */
  private static getDefaultValues(): BacklightUserSettingTypes {
    return {
      ['displayBacklightMode']: BacklightControlSettingMode.Manual,
      ['displayBacklightManualLevel']: 1
    };
  }

  /**
   * Gets an array of definitions for true backlight settings.
   * @returns An array of definitions for true backlight settings.
   */
  private static getSettingDefs(): readonly UserSettingDefinition<BacklightUserSettingTypes[keyof BacklightUserSettingTypes]>[] {
    const values = BacklightUserSettings.getDefaultValues();
    return Object.keys(values).map(name => {
      return {
        name: `${name}_g3x`,
        defaultValue: values[name as keyof typeof values]
      };
    });
  }

  /**
   * Gets a setting name alias mapping from aliased to true backlight settings.
   * @returns A setting name alias mapping from aliased to true backlight settings.
   */
  private static getAliasMap(): UserSettingMap<BacklightUserSettingTypes, BacklightTrueUserSettingTypes> {
    const map: UserSettingMap<BacklightUserSettingTypes, BacklightTrueUserSettingTypes> = {};

    for (const name of Object.keys(BacklightUserSettings.getDefaultValues()) as (keyof BacklightUserSettingTypes)[]) {
      map[name] = `${name}_g3x`;
    }

    return map;
  }
}
