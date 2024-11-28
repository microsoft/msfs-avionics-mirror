import { DefaultUserSettingManager, EventBus, UserSettingDefinition, UserSettingManager, UserSettingMap } from '@microsoft/msfs-sdk';

import { FlightPlanDataFieldType } from '../FlightPlan/FlightPlanDataField';

/**
 * Flight planning display user settings.
 */
export type FplDisplayUserSettingTypes = {
  /** Whether to show the map on the MFD FPL page. */
  fplShowMap: boolean;

  /** The type of the first MFD FPL page data field. */
  fplDataField1: FlightPlanDataFieldType;

  /** The type of the second MFD FPL page data field. */
  fplDataField2: FlightPlanDataFieldType;

  /** The type of the third MFD FPL page data field. */
  fplDataField3: FlightPlanDataFieldType;
};

/**
 * True flight planning display user settings.
 */
export type FplDisplayTrueUserSettingTypes = {
  [P in keyof FplDisplayUserSettingTypes as `${P}_g3x`]: FplDisplayUserSettingTypes[P];
};

/**
 * A utility class for retrieving flight planning display user setting managers.
 */
export class FplDisplayUserSettings {
  private static INSTANCE: UserSettingManager<FplDisplayUserSettingTypes> | undefined;

  /**
   * Retrieves a manager for flight planning display user settings.
   * @param bus The event bus.
   * @returns a manager for flight planning display user settings.
   */
  public static getManager(bus: EventBus): UserSettingManager<FplDisplayUserSettingTypes> {
    return FplDisplayUserSettings.INSTANCE ??= new DefaultUserSettingManager(
      bus,
      FplDisplayUserSettings.getSettingDefs(),
      true
    ).mapTo(FplDisplayUserSettings.getAliasMap());
  }

  /**
   * Gets the default values for a full set of aliased flight planning display settings.
   * @returns The default values for a full set of aliased flight planning display settings.
   */
  private static getDefaultValues(): FplDisplayUserSettingTypes {
    return {
      ['fplShowMap']: true,
      ['fplDataField1']: FlightPlanDataFieldType.Dtk,
      ['fplDataField2']: FlightPlanDataFieldType.LegDistance,
      ['fplDataField3']: FlightPlanDataFieldType.LegEte
    };
  }

  /**
   * Gets an array of definitions for true flight planning display settings.
   * @returns An array of definitions for true flight planning display settings.
   */
  private static getSettingDefs(): readonly UserSettingDefinition<FplDisplayUserSettingTypes[keyof FplDisplayUserSettingTypes]>[] {
    const values = FplDisplayUserSettings.getDefaultValues();
    return Object.keys(values).map(name => {
      return {
        name: `${name}_g3x`,
        defaultValue: values[name as keyof typeof values]
      };
    });
  }

  /**
   * Gets a setting name alias mapping from aliased to true flight planning display settings.
   * @returns A setting name alias mapping from aliased to true flight planning display settings.
   */
  private static getAliasMap(): UserSettingMap<FplDisplayUserSettingTypes, FplDisplayTrueUserSettingTypes> {
    const map: UserSettingMap<FplDisplayUserSettingTypes, FplDisplayTrueUserSettingTypes> = {};

    for (const name of Object.keys(FplDisplayUserSettings.getDefaultValues()) as (keyof FplDisplayUserSettingTypes)[]) {
      map[name] = `${name}_g3x`;
    }

    return map;
  }
}
