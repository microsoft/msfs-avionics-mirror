import { DefaultUserSettingManager, EventBus, UserSettingDefinition, UserSettingManager, UserSettingMap } from '@microsoft/msfs-sdk';

import { NearestAirportUserSettingTypes } from '@microsoft/msfs-garminsdk';

/**
 * Aliased G3X Touch nearest airport user settings.
 */
export type G3XNearestAirportUserSettingTypes = NearestAirportUserSettingTypes & {
  /** Whether to show city names for nearest airports instead of facility names. */
  nearestAptShowCity: boolean;
};

/**
 * True G3X Touch nearest airport user settings.
 */
export type G3XNearestAirportTrueUserSettingTypes = {
  [P in keyof G3XNearestAirportUserSettingTypes as `${P}_g3x`]: G3XNearestAirportUserSettingTypes[P];
};

/**
 * Utility class for retrieving G3X Touch nearest airport user setting managers.
 */
export class G3XNearestAirportUserSettings {
  private static INSTANCE: UserSettingManager<G3XNearestAirportUserSettingTypes> | undefined;

  /**
   * Retrieves a manager for nearest airport user settings.
   * @param bus The event bus.
   * @returns a manager for nearest airport user settings.
   */
  public static getManager(bus: EventBus): UserSettingManager<G3XNearestAirportUserSettingTypes> {
    return G3XNearestAirportUserSettings.INSTANCE ??= new DefaultUserSettingManager(
      bus,
      G3XNearestAirportUserSettings.getSettingDefs(),
      true
    ).mapTo(G3XNearestAirportUserSettings.getAliasMap());
  }

  /**
   * Gets the default values for a full set of aliased nearest airport settings.
   * @returns The default values for a full set of aliased nearest airport settings.
   */
  private static getDefaultValues(): G3XNearestAirportUserSettingTypes {
    return {
      ['nearestAptRunwayLength']: 0,
      ['nearestAptRunwaySurfaceTypes']: ~0,
      ['nearestAptShowCity']: true,
    };
  }

  /**
   * Gets an array of definitions for true nearest airport settings.
   * @returns An array of definitions for true nearest airport settings.
   */
  private static getSettingDefs(): readonly UserSettingDefinition<G3XNearestAirportUserSettingTypes[keyof G3XNearestAirportUserSettingTypes]>[] {
    const values = G3XNearestAirportUserSettings.getDefaultValues();
    return Object.keys(values).map(name => {
      return {
        name: `${name}_g3x`,
        defaultValue: values[name as keyof typeof values]
      };
    });
  }

  /**
   * Gets a setting name alias mapping from aliased to true nearest airport settings.
   * @returns A setting name alias mapping from aliased to true nearest airport settings.
   */
  private static getAliasMap(): UserSettingMap<G3XNearestAirportUserSettingTypes, G3XNearestAirportTrueUserSettingTypes> {
    const map: UserSettingMap<G3XNearestAirportUserSettingTypes, G3XNearestAirportTrueUserSettingTypes> = {};

    for (const name of Object.keys(G3XNearestAirportUserSettings.getDefaultValues()) as (keyof G3XNearestAirportUserSettingTypes)[]) {
      map[name] = `${name}_g3x`;
    }

    return map;
  }
}