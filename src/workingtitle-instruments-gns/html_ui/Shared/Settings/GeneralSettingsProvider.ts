import { ComSpacing, DefaultUserSettingManager, EventBus, UserSettingManager, UserSettingRecord } from '@microsoft/msfs-sdk';

/**
 * Settings for the `nearest_airport_surface_type` key
 */
export enum SurfaceTypeOption {
  Any,
  HardOnly,
  HardOrSoft,
  Water,
}

/**
 * Settings available on the map of the GNS units.
 */
export interface GeneralSettings extends UserSettingRecord {
  /**
   * Surface type filter for NEAREST AIRPORT searches
   */
  nearest_airport_criteria_surface_type: SurfaceTypeOption

  /**
   * Minimum length filter for NEAREST AIRPORT searches
   */
  nearest_airport_criteria_min_length: number,

  /**
   * COM frequency spacing
   */
  com_frequency_spacing: ComSpacing,
}

const generalSettings = [
  {
    name: 'nearest_airport_criteria_surface_type',
    defaultValue: SurfaceTypeOption.Any as SurfaceTypeOption,
  },
  {
    name: 'nearest_airport_criteria_min_length',
    defaultValue: 0 as number,
  },
  {
    name: 'com_frequency_spacing',
    defaultValue: ComSpacing.Spacing833Khz as ComSpacing,
  },
  {
    name: 'baroHpa',
    defaultValue: false
  }
] as const;

/**
 * Utility class for retrieving general setting managers.
 */
export class GeneralUserSettingsManager {
  private static INSTANCE: DefaultUserSettingManager<GeneralSettings> | undefined;

  /**
   * Retrieves a setting manager with all general user settings.
   * @param bus The event bus.
   * @returns A setting manager with all general user settings.
   */
  public static getManager(bus: EventBus): UserSettingManager<GeneralSettings> {
    return GeneralUserSettingsManager.INSTANCE ??= new DefaultUserSettingManager(bus, generalSettings, true);
  }
}