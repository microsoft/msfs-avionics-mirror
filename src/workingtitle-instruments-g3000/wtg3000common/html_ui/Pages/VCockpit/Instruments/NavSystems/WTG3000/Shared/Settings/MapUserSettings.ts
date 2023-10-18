import { DefaultUserSettingManager, EventBus, UserSettingDefinition, UserSettingManager, UserSettingMap } from '@microsoft/msfs-sdk';

import {
  MapDeclutterSettingMode, MapOrientationSettingMode, MapTerrainSettingMode, MapTrafficAlertLevelSettingMode, MapUserSettingsUtils, MapUserSettingTypes
} from '@microsoft/msfs-garminsdk';

import { PfdIndex } from '../CommonTypes';
import { ControllableDisplayPaneIndex, DisplayPaneIndex } from '../Components/DisplayPanes/DisplayPaneTypes';

/**
 * Names of map user settings that delegate to a G3000-specific user setting.
 */
export type G3000MapDelegatedUserSettingNames =
  'mapAirspaceClassBShow' | 'mapAirspaceClassCShow' | 'mapAirspaceClassDShow' | 'mapAirspaceRestrictedShow' | 'mapAirspaceMoaShow' | 'mapAirspaceOtherShow'
  | 'mapAirportLargeShow' | 'mapAirportMediumShow' | 'mapAirportSmallShow';

/**
 * Map inset setting modes.
 */
export enum MapInsetSettingMode {
  None = 'None',
  FlightPlanText = 'FlightPlanText',
  VertSituationDisplay = 'VertSituationDisplay',
  FlightPlanProgress = 'FlightPlanProgress',
}

/**
 * G3000-specific map user settings.
 */
export type G3000SpecificMapUserSettingTypes = {
  /** Whether to show all airspace types. */
  mapAirspaceShow: boolean;

  /** Whether to show all airport types. */
  mapAirportShow: boolean;

  /** The map inset mode. */
  mapInsetMode: MapInsetSettingMode;

  /** Whether the map flight plan text inset shows cumulative data for distance and ETE. */
  mapInsetTextCumulative: boolean;
}

/**
 * G3000 map user settings.
 */
export type G3000MapUserSettingTypes = Omit<MapUserSettingTypes, G3000MapDelegatedUserSettingNames> & G3000SpecificMapUserSettingTypes;

/**
 * True map settings for display pane maps.
 */
export type MapDisplayPaneUserSettingTypes<Index extends ControllableDisplayPaneIndex> = {
  [Name in keyof G3000MapUserSettingTypes as `${Name}_${Index}`]: G3000MapUserSettingTypes[Name];
};

/**
 * Aliased map settings that are split (independent) between the PFD inset/HSI maps and the PFD display pane maps.
 */
type MapSplitUserSettingTypes = Pick<MapUserSettingTypes,
  'mapRangeIndex'
  | 'mapDeclutter'
  | 'mapTerrainMode'
  | 'mapTrafficShow'
  | 'mapNexradShow'
>;

/**
 * True map settings for PFD inset/HSI maps that are split (independent) between the PFD maps and the PFD display pane
 * maps.
 */
export type MapPfdSplitUserSettingTypes<Index extends PfdIndex> = {
  [Name in keyof MapSplitUserSettingTypes as `${Name}Pfd_${Index}`]: MapSplitUserSettingTypes[Name];
};

/**
 * True map settings for PFD inset/HSI maps.
 */
export type MapPfdUserSettingTypes<Index extends PfdIndex> = {
  [Name in keyof G3000MapUserSettingTypes as Name extends keyof MapSplitUserSettingTypes ? `${Name}Pfd_${Index}` : `${Name}_${Index extends 1 ? DisplayPaneIndex.LeftPfd : DisplayPaneIndex.RightPfd}`]: G3000MapUserSettingTypes[Name];
};

/**
 * All true map settings.
 */
export type MapAllUserSettingTypes
  = MapDisplayPaneUserSettingTypes<DisplayPaneIndex.LeftPfd>
  & MapDisplayPaneUserSettingTypes<DisplayPaneIndex.LeftMfd>
  & MapDisplayPaneUserSettingTypes<DisplayPaneIndex.RightMfd>
  & MapDisplayPaneUserSettingTypes<DisplayPaneIndex.RightPfd>
  & MapPfdSplitUserSettingTypes<1>
  & MapPfdSplitUserSettingTypes<2>;

/**
 * Utility class for retrieving G3000 map user setting managers.
 */
export class MapUserSettings {
  private static readonly SPLIT_SETTING_NAMES = [
    'mapRangeIndex',
    'mapDeclutter',
    'mapTerrainMode',
    'mapTrafficShow',
    'mapNexradShow'
  ] as readonly (keyof MapSplitUserSettingTypes)[];

  private static masterInstance?: UserSettingManager<MapAllUserSettingTypes>;
  private static readonly displayPaneInstances: UserSettingManager<G3000MapUserSettingTypes & MapUserSettingTypes>[] = [];
  private static readonly pfdInstances: UserSettingManager<G3000MapUserSettingTypes & MapUserSettingTypes>[] = [];

  /**
   * Retrieves a manager for all true map settings.
   * @param bus The event bus.
   * @returns A manager for all true map settings.
   */
  public static getMasterManager(bus: EventBus): UserSettingManager<MapAllUserSettingTypes> {
    return MapUserSettings.masterInstance ??= new DefaultUserSettingManager(bus, [
      ...MapUserSettings.getDisplayPaneSettingDefs(DisplayPaneIndex.LeftPfd),
      ...MapUserSettings.getDisplayPaneSettingDefs(DisplayPaneIndex.LeftMfd),
      ...MapUserSettings.getDisplayPaneSettingDefs(DisplayPaneIndex.RightMfd),
      ...MapUserSettings.getDisplayPaneSettingDefs(DisplayPaneIndex.RightPfd),
      ...MapUserSettings.getPfdSettingDefs(1),
      ...MapUserSettings.getPfdSettingDefs(2)
    ]);
  }

  /**
   * Retrieves a manager for aliased map settings for a single display pane.
   * @param bus The event bus.
   * @param index The index of the display pane.
   * @returns A manager for aliased map settings for the specified display pane.
   */
  public static getDisplayPaneManager(bus: EventBus, index: ControllableDisplayPaneIndex): UserSettingManager<G3000MapUserSettingTypes & MapUserSettingTypes> {
    return MapUserSettings.displayPaneInstances[index] ??= MapUserSettings.getMasterManager(bus).mapTo(
      MapUserSettings.getDisplayPaneAliasMap(index)
    );
  }

  /**
   * Retrieves a manager for aliased map settings for a PFD.
   * @param bus The event bus.
   * @param index The index of the PFD.
   * @returns A manager for aliased map settings for the specified PFD.
   */
  public static getPfdManager(bus: EventBus, index: PfdIndex): UserSettingManager<G3000MapUserSettingTypes & MapUserSettingTypes> {
    return MapUserSettings.pfdInstances[index] ??= MapUserSettings.getMasterManager(bus).mapTo(
      MapUserSettings.getPfdAliasMap(index)
    );
  }

  /**
   * Gets the default values for a full set of aliased map settings.
   * @returns The default values for a full set of aliased map settings.
   */
  public static getDefaultValues(): G3000MapUserSettingTypes {
    return {
      ['mapRangeIndex']: 11, // 2.5 NM/5 km
      ['mapOrientation']: MapOrientationSettingMode.HeadingUp,
      ['mapAutoNorthUpActive']: true,
      ['mapAutoNorthUpRangeIndex']: 27, // 1000 NM/2000 km
      ['mapDeclutter']: MapDeclutterSettingMode.All,
      ['mapTerrainMode']: MapTerrainSettingMode.Absolute,
      ['mapTerrainRangeIndex']: 27, // 1000 NM/2000 km
      ['mapTerrainScaleShow']: false,
      ['mapAirportShow']: true,
      ['mapAirportLargeRangeIndex']: 21, // 100 NM/250 km
      ['mapAirportMediumRangeIndex']: 19, // 50 NM/100 km
      ['mapAirportSmallRangeIndex']: 17, // 25 NM/50 km
      ['mapVorShow']: true,
      ['mapVorRangeIndex']: 19, // 50 NM/100 km
      ['mapNdbShow']: true,
      ['mapNdbRangeIndex']: 17, // 25 NM/50 km
      ['mapIntersectionShow']: true,
      ['mapIntersectionRangeIndex']: 17, // 25 NM/50 km
      ['mapUserWaypointShow']: true,
      ['mapUserWaypointRangeIndex']: 17, // 25 NM/50 km
      ['mapAirspaceShow']: true,
      ['mapAirspaceClassBRangeIndex']: 19, // 50 NM/100 km
      ['mapAirspaceClassCRangeIndex']: 19, // 50 NM/100 km
      ['mapAirspaceClassDRangeIndex']: 15, // 10 NM/20 km
      ['mapAirspaceRestrictedRangeIndex']: 19, // 50 NM/100 km
      ['mapAirspaceMoaRangeIndex']: 19, // 50 NM/100 km
      ['mapAirspaceOtherRangeIndex']: 19, // 50 NM/100 km
      ['mapTrafficShow']: false,
      ['mapTrafficRangeIndex']: 17, // 25 NM/50 km
      ['mapTrafficLabelShow']: true,
      ['mapTrafficLabelRangeIndex']: 17, // 25 NM/50 km
      ['mapTrafficAlertLevelMode']: MapTrafficAlertLevelSettingMode.All,
      ['mapNexradShow']: false,
      ['mapNexradRangeIndex']: 27, // 1000 NM/2000 km
      ['mapTrackVectorShow']: false,
      ['mapTrackVectorLookahead']: 60, // seconds
      ['mapAltitudeArcShow']: false,
      ['mapWindVectorShow']: false,
      ['mapInsetMode']: MapInsetSettingMode.None,
      ['mapInsetTextCumulative']: false,
    };
  }

  /**
   * Gets an array of user setting definitions for a full set of aliased map settings.
   * @returns An array of user setting definitions for a full set of aliased map settings.
   */
  public static getAliasedSettingDefs(): readonly UserSettingDefinition<G3000MapUserSettingTypes[keyof G3000MapUserSettingTypes]>[] {
    const defaultValues = MapUserSettings.getDefaultValues();
    return Object.keys(defaultValues).map(name => {
      return {
        name,
        defaultValue: defaultValues[name as keyof typeof defaultValues]
      };
    });
  }

  /**
   * Gets an array of definitions for true map settings for a single display pane.
   * @param index The index of the display pane.
   * @returns An array of definitions for true map settings for the specified display pane.
   */
  private static getDisplayPaneSettingDefs(
    index: DisplayPaneIndex
  ): readonly UserSettingDefinition<MapDisplayPaneUserSettingTypes<ControllableDisplayPaneIndex>[keyof MapDisplayPaneUserSettingTypes<ControllableDisplayPaneIndex>]>[] {
    const values = MapUserSettings.getDefaultValues();
    return Object.keys(values).map(name => {
      return {
        name: `${name}_${index}`,
        defaultValue: values[name as keyof typeof values]
      };
    });
  }

  /**
   * Gets an array of definitions for true independent map settings for a PFD.
   * @param index The index of the PFD.
   * @returns An array of definitions for true independent map settings for the specified PFD.
   */
  private static getPfdSettingDefs(
    index: PfdIndex
  ): readonly UserSettingDefinition<MapPfdSplitUserSettingTypes<PfdIndex>[keyof MapPfdSplitUserSettingTypes<PfdIndex>]>[] {
    const values = MapUserSettings.getDefaultValues();
    const splitSettingNames = Object.keys(values).filter(
      name => MapUserSettings.SPLIT_SETTING_NAMES.includes(name as any)
    ) as Extract<keyof G3000MapUserSettingTypes, keyof MapSplitUserSettingTypes>[];

    return splitSettingNames.map(name => {
      return {
        name: `${name}Pfd_${index}`,
        defaultValue: values[name]
      };
    });
  }

  /**
   * Gets a setting name alias mapping for a display pane.
   * @param index The index of the display pane.
   * @returns A setting name alias mapping for the specified display pane.
   */
  private static getDisplayPaneAliasMap<Index extends ControllableDisplayPaneIndex>(
    index: Index
  ): UserSettingMap<G3000MapUserSettingTypes & MapUserSettingTypes, MapDisplayPaneUserSettingTypes<Index>> {
    const map: UserSettingMap<G3000MapUserSettingTypes & MapUserSettingTypes, MapDisplayPaneUserSettingTypes<Index>> = {};

    for (const name of MapUserSettingsUtils.SETTING_NAMES) {
      if (name in G3000MapUserSettingUtils.DELEGATE_MAP) {
        map[name] = `${G3000MapUserSettingUtils.DELEGATE_MAP[name as G3000MapDelegatedUserSettingNames]}_${index}`;
      } else {
        map[name] = `${name as keyof G3000MapUserSettingTypes}_${index}`;
      }
    }

    for (const name of G3000MapUserSettingUtils.SPECIFIC_SETTING_NAMES) {
      map[name] = `${name}_${index}`;
    }

    return map;
  }

  /**
   * Gets a setting name alias mapping for a PFD.
   * @param index The index of the PFD.
   * @returns A setting name alias mapping for the specified PFD.
   */
  private static getPfdAliasMap<Index extends PfdIndex>(index: Index): UserSettingMap<G3000MapUserSettingTypes & MapUserSettingTypes, MapPfdUserSettingTypes<Index>> {
    const map: UserSettingMap<G3000MapUserSettingTypes & MapUserSettingTypes, MapPfdUserSettingTypes<Index>> = {};

    const displayPaneSettingNames = MapUserSettingsUtils.SETTING_NAMES.filter(
      name => !MapUserSettings.SPLIT_SETTING_NAMES.includes(name as any)
    ) as Exclude<keyof MapUserSettingTypes, keyof MapSplitUserSettingTypes>[];

    const displayPaneIndex = (index === 1 ? DisplayPaneIndex.LeftPfd : DisplayPaneIndex.RightPfd) as Index extends 1 ? DisplayPaneIndex.LeftPfd : DisplayPaneIndex.RightPfd;

    for (const name of displayPaneSettingNames) {
      if (name in G3000MapUserSettingUtils.DELEGATE_MAP) {
        map[name] = `${G3000MapUserSettingUtils.DELEGATE_MAP[name as G3000MapDelegatedUserSettingNames]}_${displayPaneIndex}`;
      } else {
        map[name] = `${name as Exclude<keyof G3000MapUserSettingTypes, keyof MapSplitUserSettingTypes>}_${displayPaneIndex}`;
      }
    }

    for (const name of G3000MapUserSettingUtils.SPECIFIC_SETTING_NAMES) {
      map[name] = `${name}_${displayPaneIndex}`;
    }

    for (const name of MapUserSettings.SPLIT_SETTING_NAMES) {
      map[name] = `${name}Pfd_${index}`;
    }

    return map;
  }
}

/**
 * A utility class for working with G3000 map user settings.
 */
export class G3000MapUserSettingUtils {
  /** An array of all G3000 map user setting names. */
  public static readonly SETTING_NAMES: readonly (keyof G3000MapUserSettingTypes)[] = [
    'mapRangeIndex',
    'mapOrientation',
    'mapAutoNorthUpActive',
    'mapAutoNorthUpRangeIndex',
    'mapDeclutter',
    'mapTerrainMode',
    'mapTerrainRangeIndex',
    'mapTerrainScaleShow',
    'mapAirportShow',
    'mapAirportLargeRangeIndex',
    'mapAirportMediumRangeIndex',
    'mapAirportSmallRangeIndex',
    'mapVorShow',
    'mapVorRangeIndex',
    'mapNdbShow',
    'mapNdbRangeIndex',
    'mapIntersectionShow',
    'mapIntersectionRangeIndex',
    'mapUserWaypointShow',
    'mapUserWaypointRangeIndex',
    'mapAirspaceShow',
    'mapAirspaceClassBRangeIndex',
    'mapAirspaceClassCRangeIndex',
    'mapAirspaceClassDRangeIndex',
    'mapAirspaceRestrictedRangeIndex',
    'mapAirspaceMoaRangeIndex',
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
    'mapWindVectorShow',
    'mapInsetMode',
    'mapInsetTextCumulative',
  ];

  /** An array of names of all G3000-specific map user settings. */
  public static readonly SPECIFIC_SETTING_NAMES: readonly (keyof G3000SpecificMapUserSettingTypes)[] = [
    'mapAirportShow',
    'mapAirspaceShow',
    'mapInsetMode',
    'mapInsetTextCumulative',
  ];

  /** A mapping of delegated map user settings to the user setting to which each is delegated. */
  public static readonly DELEGATE_MAP: Record<G3000MapDelegatedUserSettingNames, keyof G3000SpecificMapUserSettingTypes> = {
    'mapAirportLargeShow': 'mapAirportShow',
    'mapAirportMediumShow': 'mapAirportShow',
    'mapAirportSmallShow': 'mapAirportShow',
    'mapAirspaceClassBShow': 'mapAirspaceShow',
    'mapAirspaceClassCShow': 'mapAirspaceShow',
    'mapAirspaceClassDShow': 'mapAirspaceShow',
    'mapAirspaceRestrictedShow': 'mapAirspaceShow',
    'mapAirspaceMoaShow': 'mapAirspaceShow',
    'mapAirspaceOtherShow': 'mapAirspaceShow'
  };
}