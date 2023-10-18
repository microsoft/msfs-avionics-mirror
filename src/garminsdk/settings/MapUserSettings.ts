/**
 * Setting modes for map orientation.
 */
export enum MapOrientationSettingMode {
  NorthUp = 'NorthUp',
  TrackUp = 'TrackUp',
  HeadingUp = 'HeadingUp'
}

/**
 * Setting modes for map terrain display.
 */
export enum MapTerrainSettingMode {
  None = 'None',
  Absolute = 'Absolute',
  Relative = 'Relative'
}

/**
 * Setting modes for map declutter.
 */
export enum MapDeclutterSettingMode {
  All = 'All',
  Level3 = 'Level3',
  Level2 = 'Level2',
  Level1 = 'Level1'
}

export enum MapTrafficAlertLevelSettingMode {
  All = 'All',
  Advisories = 'Advisories',
  TA_RA = 'TA/RA',
  RA = 'RA'
}

/**
 * Type descriptions for map user settings.
 */
export type MapUserSettingTypes = {
  /** The map range index setting. */
  mapRangeIndex: number;

  /** The orientation setting. */
  mapOrientation: MapOrientationSettingMode;

  /** The auto-north-up active setting. */
  mapAutoNorthUpActive: boolean;

  /** The auto-north-up range setting. */
  mapAutoNorthUpRangeIndex: number;

  /** Declutter setting. */
  mapDeclutter: MapDeclutterSettingMode;

  /** The terrain display setting. */
  mapTerrainMode: MapTerrainSettingMode;

  /** The terrain maximum range setting. */
  mapTerrainRangeIndex: number;

  /** The terrain scale show setting. */
  mapTerrainScaleShow: boolean;

  /** Large airport symbol show setting. */
  mapAirportLargeShow: boolean;

  /** Large airport maximum range setting. */
  mapAirportLargeRangeIndex: number;

  /** Medium airport symbol show setting. */
  mapAirportMediumShow: boolean;

  /** Medium airport maximum range setting. */
  mapAirportMediumRangeIndex: number;

  /** Small airport symbol show setting. */
  mapAirportSmallShow: boolean;

  /** Small airport maximum range setting. */
  mapAirportSmallRangeIndex: number;

  /** VOR symbol show setting. */
  mapVorShow: boolean;

  /** VOR maximum range setting. */
  mapVorRangeIndex: number;

  /** NDB symbol show setting. */
  mapNdbShow: boolean;

  /** NDB maximum range setting. */
  mapNdbRangeIndex: number;

  /** Intersection symbol show setting. */
  mapIntersectionShow: boolean;

  /** Intersection maximum range setting. */
  mapIntersectionRangeIndex: number;

  /** User waypoint symbol show setting. */
  mapUserWaypointShow: boolean;

  /** User waypoint maximum range setting. */
  mapUserWaypointRangeIndex: number;

  /** Class B airspace show setting. */
  mapAirspaceClassBShow: boolean;

  /** Class B airspace maximum range setting. */
  mapAirspaceClassBRangeIndex: number;

  /** Class C airspace show setting. */
  mapAirspaceClassCShow: boolean;

  /** Class C airspace maximum range setting. */
  mapAirspaceClassCRangeIndex: number;

  /** Class D airspace show setting. */
  mapAirspaceClassDShow: boolean;

  /** Class D airspace maximum range setting. */
  mapAirspaceClassDRangeIndex: number;

  /** Restricted airspace show setting. */
  mapAirspaceRestrictedShow: boolean;

  /** Restricted airspace maximum range setting. */
  mapAirspaceRestrictedRangeIndex: number;

  /** MOA airspace show setting. */
  mapAirspaceMoaShow: boolean;

  /** MOA airspace maximum range setting. */
  mapAirspaceMoaRangeIndex: number;

  /** Other airspace show setting. */
  mapAirspaceOtherShow: boolean;

  /** Other airspace maximum range setting. */
  mapAirspaceOtherRangeIndex: number;

  /** Whether to show traffic. */
  mapTrafficShow: boolean;

  /** Traffic maximum range setting. */
  mapTrafficRangeIndex: number;

  /** Whether to show traffic labels. */
  mapTrafficLabelShow: boolean;

  /** Traffic label maximum range setting. */
  mapTrafficLabelRangeIndex: number;

  /** Traffic alert level mode setting. */
  mapTrafficAlertLevelMode: MapTrafficAlertLevelSettingMode;

  /** Whether to show NEXRAD weather or not. */
  mapNexradShow: boolean;

  /** NEXRAD maximum range setting. */
  mapNexradRangeIndex: number;

  /** Whether to show the track vector. */
  mapTrackVectorShow: boolean;

  /** The track vector lookahead time, in seconds. */
  mapTrackVectorLookahead: number;

  /** Whether to show the altitude intercept arc. */
  mapAltitudeArcShow: boolean;

  /** Whether to show the wind vector. */
  mapWindVectorShow: boolean;
}

/**
 * A utility class for working with map user settings.
 */
export class MapUserSettingsUtils {
  /** An array of all map user setting names. */
  public static readonly SETTING_NAMES = [
    'mapRangeIndex',
    'mapOrientation',
    'mapAutoNorthUpActive',
    'mapAutoNorthUpRangeIndex',
    'mapDeclutter',
    'mapTerrainMode',
    'mapTerrainRangeIndex',
    'mapTerrainScaleShow',
    'mapAirportLargeShow',
    'mapAirportLargeRangeIndex',
    'mapAirportMediumShow',
    'mapAirportMediumRangeIndex',
    'mapAirportSmallShow',
    'mapAirportSmallRangeIndex',
    'mapVorShow',
    'mapVorRangeIndex',
    'mapNdbShow',
    'mapNdbRangeIndex',
    'mapIntersectionShow',
    'mapIntersectionRangeIndex',
    'mapUserWaypointShow',
    'mapUserWaypointRangeIndex',
    'mapAirspaceClassBShow',
    'mapAirspaceClassBRangeIndex',
    'mapAirspaceClassCShow',
    'mapAirspaceClassCRangeIndex',
    'mapAirspaceClassDShow',
    'mapAirspaceClassDRangeIndex',
    'mapAirspaceRestrictedShow',
    'mapAirspaceRestrictedRangeIndex',
    'mapAirspaceMoaShow',
    'mapAirspaceMoaRangeIndex',
    'mapAirspaceOtherShow',
    'mapAirspaceOtherRangeIndex',
    'mapTrafficShow',
    'mapTrafficRangeIndex',
    'mapTrafficLabelShow',
    'mapTrafficLabelRangeIndex',
    'mapTrafficAlertLevelMode',
    'mapNexradShow',
    'mapNexradRangeIndex',
    'mapTrackVectorShow',
    'mapTrackVectorLookahead',
    'mapAltitudeArcShow',
    'mapWindVectorShow'
  ] as readonly (keyof MapUserSettingTypes)[];
}