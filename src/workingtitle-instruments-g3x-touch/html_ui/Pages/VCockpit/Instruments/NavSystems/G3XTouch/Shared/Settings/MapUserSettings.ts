import { DefaultUserSettingManager, EventBus, UserSettingDefinition, UserSettingManager, UserSettingMap } from '@microsoft/msfs-sdk';

import {
  MapDeclutterSettingMode, MapOrientationSettingMode, MapTerrainSettingMode, MapTrafficAlertLevelSettingMode, MapUserSettingTypes
} from '@microsoft/msfs-garminsdk';

/**
 * Names of Garmin map user settings that delegate to a G3X-specific user setting.
 */
export type G3XMapDelegatedUserSettingNames = never;

/**
 * Names of Garmin map user settings that are not supported by the G3X Touch.
 */
export type G3XMapOmittedUserSettingNames = 'mapTrackVectorShow';

/**
 * Map label text size setting modes.
 */
export enum G3XMapLabelTextSizeSettingMode {
  None = 'None',
  Small = 'Small',
  Medium = 'Medium',
  Large = 'Large'
}

/**
 * Map track vector setting modes.
 */
export enum G3XMapTrackVectorSettingMode {
  Off = 'Off',
  Distance = 'Distance',
  Time = 'Time'
}

/**
 * G3X Touch-specific map user settings.
 */
export type G3XSpecificMapUserSettingTypes = {
  /** Whether to show the compass arc. */
  mapCompassArcShow: boolean;

  /** Airport runway label maximum range. */
  mapRunwayLabelRangeIndex: number;

  /** The size of large airport label text. */
  mapAirportLargeTextSize: G3XMapLabelTextSizeSettingMode;

  /** The size of medium airport label text. */
  mapAirportMediumTextSize: G3XMapLabelTextSizeSettingMode;

  /** The size of small airport label text. */
  mapAirportSmallTextSize: G3XMapLabelTextSizeSettingMode;

  /** The size of VOR label text. */
  mapVorTextSize: G3XMapLabelTextSizeSettingMode;

  /** The size of NDB label text. */
  mapNdbTextSize: G3XMapLabelTextSizeSettingMode;

  /** The size of intersection label text. */
  mapIntersectionTextSize: G3XMapLabelTextSizeSettingMode;

  /** The size of user waypoint label text. */
  mapUserWaypointTextSize: G3XMapLabelTextSizeSettingMode;

  /** The track vector mode. */
  mapTrackVectorMode: G3XMapTrackVectorSettingMode;

  /** The track vector distance, in nautical miles. */
  mapTrackVectorDistance: number;

  /** Whether to show weather data products. */
  mapWeatherShow: boolean;
}

/**
 * Aliased G3X Touch map user settings.
 */
export type G3XMapUserSettingTypes
  = Omit<MapUserSettingTypes, G3XMapDelegatedUserSettingNames | G3XMapOmittedUserSettingNames>
  & G3XSpecificMapUserSettingTypes;

/**
 * True G3X Touch map user settings.
 */
export type G3XMapTrueUserSettingTypes = {
  [P in keyof G3XMapUserSettingTypes as `${P}_g3x`]: G3XMapUserSettingTypes[P];
};

/**
 * Utility class for retrieving G3X Touch map user setting managers.
 */
export class MapUserSettings {
  private static masterInstance?: UserSettingManager<G3XMapTrueUserSettingTypes>;
  private static standardInstance?: UserSettingManager<G3XMapUserSettingTypes & MapUserSettingTypes>;

  /**
   * Retrieves a manager for all true map settings.
   * @param bus The event bus.
   * @returns A manager for all true map settings.
   */
  public static getMasterManager(bus: EventBus): UserSettingManager<G3XMapTrueUserSettingTypes> {
    return MapUserSettings.masterInstance ??= new DefaultUserSettingManager(bus, MapUserSettings.getStandardSettingDefs(), true);
  }

  /**
   * Retrieves a manager for aliased map settings for a standard map.
   * @param bus The event bus.
   * @returns A manager for aliased map settings for a standard map.
   */
  public static getStandardManager(bus: EventBus): UserSettingManager<G3XMapUserSettingTypes & Omit<MapUserSettingTypes, G3XMapOmittedUserSettingNames>> {
    return MapUserSettings.standardInstance ??= MapUserSettings.getMasterManager(bus).mapTo(
      MapUserSettings.getStandardAliasMap()
    );
  }

  /**
   * Gets the default values for a full set of aliased map settings.
   * @returns The default values for a full set of aliased map settings.
   */
  public static getDefaultValues(): G3XMapUserSettingTypes {
    // TODO: All default range indexes are temporary.
    return {
      ['mapRangeIndex']: 5,
      ['mapOrientation']: MapOrientationSettingMode.NorthUp,
      ['mapAutoNorthUpActive']: true,
      ['mapAutoNorthUpRangeIndex']: 19, // 200 nm
      ['mapGroundNorthUpActive']: true,
      ['mapDeclutter']: MapDeclutterSettingMode.All,
      ['mapTerrainMode']: MapTerrainSettingMode.Absolute,
      ['mapTerrainRangeIndex']: Infinity,
      ['mapTerrainScaleShow']: true,
      ['mapAirportLargeShow']: true,
      ['mapAirportLargeRangeIndex']: 15,
      ['mapAirportMediumShow']: true,
      ['mapAirportMediumRangeIndex']: 13,
      ['mapAirportSmallShow']: true,
      ['mapAirportSmallRangeIndex']: 11,
      ['mapVorShow']: true,
      ['mapVorRangeIndex']: 13,
      ['mapNdbShow']: true,
      ['mapNdbRangeIndex']: 11,
      ['mapIntersectionShow']: true,
      ['mapIntersectionRangeIndex']: 11,
      ['mapUserWaypointShow']: true,
      ['mapUserWaypointRangeIndex']: 11,
      ['mapAirspaceClassBShow']: true,
      ['mapAirspaceClassBRangeIndex']: 13,
      ['mapAirspaceClassCShow']: true,
      ['mapAirspaceClassCRangeIndex']: 13,
      ['mapAirspaceClassDShow']: true,
      ['mapAirspaceClassDRangeIndex']: 9,
      ['mapAirspaceRestrictedShow']: true,
      ['mapAirspaceRestrictedRangeIndex']: 13,
      ['mapAirspaceMoaShow']: true,
      ['mapAirspaceMoaRangeIndex']: 13,
      ['mapAirspaceOtherShow']: true,
      ['mapAirspaceOtherRangeIndex']: 13,
      ['mapTrafficShow']: false,
      ['mapTrafficRangeIndex']: 12, // 8 nm (TODO: confirm the default)
      ['mapTrafficLabelShow']: true,
      ['mapTrafficLabelRangeIndex']: 12, // 8 nm (TODO: confirm the default)
      ['mapTrafficAlertLevelMode']: MapTrafficAlertLevelSettingMode.All,
      ['mapNexradShow']: true,
      ['mapNexradRangeIndex']: 0,
      ['mapTrackVectorLookahead']: 60, // seconds
      ['mapAltitudeArcShow']: false,
      ['mapWindVectorShow']: false,
      ['mapCompassArcShow']: true,
      ['mapRunwayLabelRangeIndex']: 9, // 2 nm
      ['mapAirportLargeTextSize']: G3XMapLabelTextSizeSettingMode.Large,
      ['mapAirportMediumTextSize']: G3XMapLabelTextSizeSettingMode.Medium,
      ['mapAirportSmallTextSize']: G3XMapLabelTextSizeSettingMode.Medium,
      ['mapVorTextSize']: G3XMapLabelTextSizeSettingMode.Medium,
      ['mapNdbTextSize']: G3XMapLabelTextSizeSettingMode.Medium,
      ['mapIntersectionTextSize']: G3XMapLabelTextSizeSettingMode.Small,
      ['mapUserWaypointTextSize']: G3XMapLabelTextSizeSettingMode.Medium,
      ['mapTrackVectorMode']: G3XMapTrackVectorSettingMode.Off,
      ['mapTrackVectorDistance']: 10,
      ['mapWeatherShow']: false
    };
  }

  /**
   * Gets an array of user setting definitions for a full set of aliased map settings.
   * @returns An array of user setting definitions for a full set of aliased map settings.
   */
  public static getAliasedSettingDefs(): readonly UserSettingDefinition<G3XMapUserSettingTypes[keyof G3XMapUserSettingTypes]>[] {
    const defaultValues = MapUserSettings.getDefaultValues();
    return Object.keys(defaultValues).map(name => {
      return {
        name,
        defaultValue: defaultValues[name as keyof typeof defaultValues]
      };
    });
  }

  /**
   * Gets an array of definitions for true map settings.
   * @returns An array of definitions for true map settings.
   */
  private static getStandardSettingDefs(): readonly UserSettingDefinition<G3XMapUserSettingTypes[keyof G3XMapUserSettingTypes]>[] {
    const values = MapUserSettings.getDefaultValues();
    return Object.keys(values).map(name => {
      return {
        name: `${name}_g3x`,
        defaultValue: values[name as keyof typeof values]
      };
    });
  }

  /**
   * Gets a setting name alias mapping for a standard map.
   * @returns A setting name alias mapping for a standard map.
   */
  private static getStandardAliasMap(): UserSettingMap<G3XMapUserSettingTypes & MapUserSettingTypes, G3XMapTrueUserSettingTypes> {
    const map: UserSettingMap<G3XMapUserSettingTypes & MapUserSettingTypes, G3XMapTrueUserSettingTypes> = {};

    for (const name of G3XMapUserSettingUtils.SETTING_NAMES) {
      if (name in G3XMapUserSettingUtils.DELEGATE_MAP) {
        map[name] = `${G3XMapUserSettingUtils.DELEGATE_MAP[name as G3XMapDelegatedUserSettingNames]}_g3x`;
      } else {
        map[name] = `${name}_g3x`;
      }
    }

    return map;
  }
}

/**
 * A utility class for working with G3X Touch map user settings.
 */
export class G3XMapUserSettingUtils {
  /** An array of all G3X Touch map user setting names. */
  public static readonly SETTING_NAMES: readonly (keyof G3XMapUserSettingTypes)[] = [
    'mapRangeIndex',
    'mapOrientation',
    'mapAutoNorthUpActive',
    'mapAutoNorthUpRangeIndex',
    'mapGroundNorthUpActive',
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
    'mapTrackVectorLookahead',
    'mapAltitudeArcShow',
    'mapWindVectorShow',
    'mapCompassArcShow',
    'mapRunwayLabelRangeIndex',
    'mapAirportLargeTextSize',
    'mapAirportMediumTextSize',
    'mapAirportSmallTextSize',
    'mapVorTextSize',
    'mapNdbTextSize',
    'mapIntersectionTextSize',
    'mapUserWaypointTextSize',
    'mapTrackVectorMode',
    'mapTrackVectorDistance',
    'mapWeatherShow'
  ];

  /** An array of names of all G3X Touch-specific map user settings. */
  public static readonly SPECIFIC_SETTING_NAMES: readonly (keyof G3XSpecificMapUserSettingTypes)[] = [
    'mapCompassArcShow',
    'mapRunwayLabelRangeIndex',
    'mapAirportLargeTextSize',
    'mapAirportMediumTextSize',
    'mapAirportSmallTextSize',
    'mapVorTextSize',
    'mapNdbTextSize',
    'mapIntersectionTextSize',
    'mapUserWaypointTextSize',
    'mapTrackVectorMode',
    'mapTrackVectorDistance',
    'mapWeatherShow'
  ];

  /** A mapping of delegated map user settings to the user setting to which each is delegated. */
  public static readonly DELEGATE_MAP: Record<G3XMapDelegatedUserSettingNames, keyof G3XSpecificMapUserSettingTypes> = {};
}