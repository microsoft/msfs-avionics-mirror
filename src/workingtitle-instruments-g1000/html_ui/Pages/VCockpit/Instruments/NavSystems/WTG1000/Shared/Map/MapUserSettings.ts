import { DefaultUserSettingManager, EventBus, UserSettingManager } from 'msfssdk';

import { MapDeclutterSettingMode, MapOrientationSettingMode, MapTerrainSettingMode, MapTrafficAlertLevelSettingMode, MapUserSettingTypes } from 'garminsdk';

/**
 * Map user settings that are independent between the PFD and MFD.
 */
export type SplitMapUserSettingTypes = {
  /** The map range index setting. */
  mapRangeIndex: number;

  /** Declutter setting. */
  mapDeclutter: MapDeclutterSettingMode;

  /** The terrain display setting. */
  mapTerrainMode: MapTerrainSettingMode;

  /** Whether to show traffic. */
  mapTrafficShow: boolean;

  /** Whether to show NEXRAD weather or not. */
  mapNexradShow: boolean;
}

/**
 * All map user settings.
 */
export type AllMapUserSettingTypes = Omit<MapUserSettingTypes, keyof SplitMapUserSettingTypes> & {
  /** The map range index setting for the MFD. */
  mapMfdRangeIndex: number;

  /** The map range index setting for the PFD. */
  mapPfdRangeIndex: number;

  /** Declutter setting for the MFD. */
  mapMfdDeclutter: MapDeclutterSettingMode;

  /** Declutter setting for the PFD. */
  mapPfdDeclutter: MapDeclutterSettingMode;

  /** The terrain display setting for the MFD. */
  mapMfdTerrainMode: MapTerrainSettingMode;

  /** The terrain display setting for the PFD. */
  mapPfdTerrainMode: MapTerrainSettingMode;

  /** Whether to show NEXRAD weather or not on the MFD. */
  mapMfdNexradShow: boolean;

  /** Whether to show NEXRAD weather or not on the PFD. */
  mapPfdNexradShow: boolean;

  /** Whether to show traffic on the MFD. */
  mapMfdTrafficShow: boolean;

  /** Whether to show traffic on the PFD. */
  mapPfdTrafficShow: boolean;
}

/**
 * Utility class for retrieving map user setting managers.
 */
export class MapUserSettings {
  private static INSTANCE: DefaultUserSettingManager<AllMapUserSettingTypes> | undefined;
  private static PFD_INSTANCE: UserSettingManager<MapUserSettingTypes> | undefined;
  private static MFD_INSTANCE: UserSettingManager<MapUserSettingTypes> | undefined;

  /**
   * Retrieves a manager for map user settings.
   * @param bus The event bus.
   * @returns a manager for map user settings.
   */
  public static getManager(bus: EventBus): DefaultUserSettingManager<AllMapUserSettingTypes> {
    return MapUserSettings.INSTANCE ??= new DefaultUserSettingManager<AllMapUserSettingTypes>(bus, [
      {
        name: 'mapPfdRangeIndex',
        defaultValue: 11
      },
      {
        name: 'mapMfdRangeIndex',
        defaultValue: 11
      },
      {
        name: 'mapOrientation',
        defaultValue: MapOrientationSettingMode.HeadingUp
      },
      {
        name: 'mapAutoNorthUpActive',
        defaultValue: true
      },
      {
        name: 'mapAutoNorthUpRangeIndex',
        defaultValue: 27
      },
      {
        name: 'mapPfdDeclutter',
        defaultValue: MapDeclutterSettingMode.All
      },
      {
        name: 'mapMfdDeclutter',
        defaultValue: MapDeclutterSettingMode.All
      },
      {
        name: 'mapPfdTerrainMode',
        defaultValue: MapTerrainSettingMode.Absolute
      },
      {
        name: 'mapMfdTerrainMode',
        defaultValue: MapTerrainSettingMode.Absolute
      },
      {
        name: 'mapTerrainRangeIndex',
        defaultValue: 27
      },
      {
        name: 'mapTerrainScaleShow',
        defaultValue: false
      },
      {
        name: 'mapAirportLargeShow',
        defaultValue: true
      },
      {
        name: 'mapAirportLargeRangeIndex',
        defaultValue: 21
      },
      {
        name: 'mapAirportMediumShow',
        defaultValue: true
      },
      {
        name: 'mapAirportMediumRangeIndex',
        defaultValue: 19
      },
      {
        name: 'mapAirportSmallShow',
        defaultValue: true
      },
      {
        name: 'mapAirportSmallRangeIndex',
        defaultValue: 17
      },
      {
        name: 'mapVorShow',
        defaultValue: true
      },
      {
        name: 'mapVorRangeIndex',
        defaultValue: 19
      },
      {
        name: 'mapNdbShow',
        defaultValue: true
      },
      {
        name: 'mapNdbRangeIndex',
        defaultValue: 17
      },
      {
        name: 'mapIntersectionShow',
        defaultValue: true
      },
      {
        name: 'mapIntersectionRangeIndex',
        defaultValue: 17
      },
      {
        name: 'mapUserWaypointShow',
        defaultValue: true
      },
      {
        name: 'mapUserWaypointRangeIndex',
        defaultValue: 17
      },
      {
        name: 'mapAirspaceClassBShow',
        defaultValue: true
      },
      {
        name: 'mapAirspaceClassBRangeIndex',
        defaultValue: 19
      },
      {
        name: 'mapAirspaceClassCShow',
        defaultValue: true
      },
      {
        name: 'mapAirspaceClassCRangeIndex',
        defaultValue: 19
      },
      {
        name: 'mapAirspaceClassDShow',
        defaultValue: true
      },
      {
        name: 'mapAirspaceClassDRangeIndex',
        defaultValue: 15
      },
      {
        name: 'mapAirspaceRestrictedShow',
        defaultValue: true
      },
      {
        name: 'mapAirspaceRestrictedRangeIndex',
        defaultValue: 19
      },
      {
        name: 'mapAirspaceMoaShow',
        defaultValue: true
      },
      {
        name: 'mapAirspaceMoaRangeIndex',
        defaultValue: 19
      },
      {
        name: 'mapAirspaceOtherShow',
        defaultValue: true
      },
      {
        name: 'mapAirspaceOtherRangeIndex',
        defaultValue: 19
      },
      {
        name: 'mapPfdTrafficShow',
        defaultValue: false
      },
      {
        name: 'mapMfdTrafficShow',
        defaultValue: false
      },
      {
        name: 'mapTrafficRangeIndex',
        defaultValue: 17
      },
      {
        name: 'mapTrafficLabelShow',
        defaultValue: true
      },
      {
        name: 'mapTrafficLabelRangeIndex',
        defaultValue: 17
      },
      {
        name: 'mapTrafficAlertLevelMode',
        defaultValue: MapTrafficAlertLevelSettingMode.All
      },
      {
        name: 'mapPfdNexradShow',
        defaultValue: false
      },
      {
        name: 'mapMfdNexradShow',
        defaultValue: false
      },
      {
        name: 'mapNexradRangeIndex',
        defaultValue: 27
      },
      {
        name: 'mapTrackVectorShow',
        defaultValue: false
      },
      {
        name: 'mapTrackVectorLookahead',
        defaultValue: 60
      },
      {
        name: 'mapAltitudeArcShow',
        defaultValue: false
      }
    ]);
  }

  /**
   * Retrieves a manager for PFD map user settings.
   * @param bus The event bus.
   * @returns a manager for PFD map user settings.
   */
  public static getPfdManager(bus: EventBus): UserSettingManager<MapUserSettingTypes> {
    return MapUserSettings.PFD_INSTANCE ??= MapUserSettings.getManager(bus).mapTo<SplitMapUserSettingTypes>({
      mapRangeIndex: 'mapPfdRangeIndex',
      mapDeclutter: 'mapPfdDeclutter',
      mapNexradShow: 'mapPfdNexradShow',
      mapTerrainMode: 'mapPfdTerrainMode',
      mapTrafficShow: 'mapPfdTrafficShow'
    }) as UserSettingManager<MapUserSettingTypes>;
  }

  /**
   * Retrieves a manager for MFD map user settings.
   * @param bus The event bus.
   * @returns a manager for PFD map user settings.
   */
  public static getMfdManager(bus: EventBus): UserSettingManager<MapUserSettingTypes> {
    return MapUserSettings.MFD_INSTANCE ??= MapUserSettings.getManager(bus).mapTo<SplitMapUserSettingTypes>({
      mapRangeIndex: 'mapMfdRangeIndex',
      mapDeclutter: 'mapMfdDeclutter',
      mapNexradShow: 'mapMfdNexradShow',
      mapTerrainMode: 'mapMfdTerrainMode',
      mapTrafficShow: 'mapMfdTrafficShow'
    }) as UserSettingManager<MapUserSettingTypes>;
  }
}