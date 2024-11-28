import { AliasedUserSettingManager, DefaultUserSettingManager, EventBus, UserSettingDefinition, UserSettingManager } from '@microsoft/msfs-sdk';

import { WT21InstrumentType } from '../Config';

/** A format for the HSI compass. */
export type HSIFormat = typeof MapUserSettings.hsiFormatsAll[number];

/** TERR/WX state */
export type TerrWxState = typeof MapUserSettings.terrWxStates[number];

/** A format for the HSI compass. */
export type MapRange = typeof MapUserSettings.mapRanges[number];

/** Bitflags that describe which map waypoint types should be displayed. */
export enum MapWaypointsDisplay {
  None = 0,
  NearestAirports = 1 << 0,
  HiNavaids = 1 << 1,
  LoNavaids = 1 << 2,
  Intersections = 1 << 3,
  TerminalWaypoints = 1 << 4,
  ETA = 1 << 5,
  Speed = 1 << 6,
  Altitude = 1 << 7,
  Airports = 1 << 8,
  NDBs = 1 << 9,
  MissedApproach = 1 << 10,
}

/** Creates an indexed user setting type. Indexed settings have keys of the form `setting_[index]`. */
export type IndexedUserSettings<Settings extends { [setting: string]: any }, Index extends number> = {
  [Setting in keyof Settings as `${Setting & string}_${Index}`]: Settings[Setting];
};

/** The base map user setting types for the PFD */
export type BasePfdMapUserSettingTypes = {
  /** The format used for the HSI */
  hsiFormatPFD: HSIFormat,
  /** The map range */
  mapRange: MapRange,
  /** Whether traffic appears on the map */
  tfcEnabledPFD: boolean,
  /** Whether to show the selected altitude banana on the map  */
  mapAltitudeArcShowPFD: boolean,
  /** The state of the terrain and weather displayed on the map */
  terrWxStatePFD: TerrWxState,
  /** A union of bit flags which describes the map waypoints being displayed */
  mapWaypointsDisplayPFD: number,
}

/** The base map user setting types for the MFD */
export type BaseMfdMapUserSettingTypes = {
  /** The format used for the HSI */
  hsiFormatMFD: HSIFormat,
  /** The map range */
  mapRange: MapRange,
  /** Whether traffic appears on the map */
  tfcEnabledMFD: boolean,
  /** Whether to show the selected altitude banana on the map  */
  mapAltitudeArcShowMFD: boolean,
  /** The state of the terrain and weather displayed on the map */
  terrWxStateMFD: TerrWxState,
  /** A union of bit flags which describes the map waypoints being displayed */
  mapWaypointsDisplayMFD: number,
  /** Whether nexrad is displayed on the map */
  nexradEnabledMFD: boolean,
  /** Whether the map is extended */
  mapExtendedMFD: boolean,
}

/** The actual PFD map user setting types */
export type PfdMapUserSettingTypes = IndexedUserSettings<BasePfdMapUserSettingTypes, 1 | 2>

/** The actual MFD map user setting types */
export type MfdMapUserSettingTypes = IndexedUserSettings<BaseMfdMapUserSettingTypes, 1 | 2>

/** Type definitions for all map settings. */
export type MapSettings = PfdMapUserSettingTypes & MfdMapUserSettingTypes

/** Type definitions for aliased PFD/MFD map settings. */
export type MapSettingsPfdAliased = {
  [K in keyof BasePfdMapUserSettingTypes as K extends `${infer Prefix}PFD` ? `${Prefix}` : K]: BasePfdMapUserSettingTypes[K];
}

/** Type definitions for aliased PFD/MFD map settings. */
export type MapSettingsMfdAliased = {
  [K in keyof BaseMfdMapUserSettingTypes as K extends `${infer Prefix}MFD` ? `${Prefix}` : K]: BaseMfdMapUserSettingTypes[K];
}

/** Utility class for retrieving map user setting managers. */
export class MapUserSettings {
  private static INSTANCE_MASTER: DefaultUserSettingManager<MapSettings> | undefined;
  private static INSTANCE_PFD = [] as AliasedUserSettingManager<MapSettingsPfdAliased>[];
  private static INSTANCE_MFD = [] as AliasedUserSettingManager<MapSettingsMfdAliased>[];

  public static readonly hsiFormatsAll = ['ROSE', 'ARC', 'PPOS', 'PLAN', 'GWX', 'TCAS'] as const;
  public static readonly hsiFormatsPFD = ['ROSE', 'ARC', 'PPOS'] as HSIFormat[];
  public static readonly hsiFormatsMFD = ['ROSE', 'ARC', 'PPOS', 'PLAN', 'GWX', 'TCAS'] as HSIFormat[];
  public static readonly terrWxStates = ['OFF', 'TERR', 'WX'] as const;
  public static readonly mapRanges = [5, 10, 25, 50, 100, 200, 300, 600] as const;

  /**
   * Retrieves a setting manager with all map user settings.
   * @param bus The event bus.
   * @returns A setting manager with all map user settings.
   */
  public static getMasterManager(bus: EventBus): UserSettingManager<MapSettings> {
    return MapUserSettings.INSTANCE_MASTER ??= new DefaultUserSettingManager(bus, MapUserSettings.getDefaultDefinitions());
  }

  /* eslint-disable jsdoc/require-jsdoc */
  public static getAliasedManager(bus: EventBus, instrumentType: WT21InstrumentType.Pfd, instrumentIndex: number): UserSettingManager<MapSettingsPfdAliased>;
  public static getAliasedManager(bus: EventBus, instrumentType: WT21InstrumentType.Mfd, instrumentIndex: number): UserSettingManager<MapSettingsMfdAliased>;
  public static getAliasedManager(bus: EventBus, instrumentType: WT21InstrumentType, instrumentIndex: number): UserSettingManager<MapSettingsPfdAliased | MapSettingsMfdAliased>;
  /* eslint-enable jsdoc/require-jsdoc */

  /**
   * Retrieves a setting manager with aliased map user settings specific to the PFD or MFD.
   * @param bus The event bus.
   * @param instrumentType The instrument type to get
   * @param instrumentIndex The instrument index
   * @returns A setting manager with aliased map user settings specific to the PFD or MFD.
   */
  public static getAliasedManager(
    bus: EventBus,
    instrumentType: WT21InstrumentType,
    instrumentIndex: number
  ): UserSettingManager<MapSettingsPfdAliased> | UserSettingManager<MapSettingsMfdAliased> {
    return instrumentType === WT21InstrumentType.Pfd ? MapUserSettings.getPfdManager(bus, instrumentIndex as 1 | 2) : MapUserSettings.getMfdManager(bus, instrumentIndex as 1 | 2);
  }

  /**
   * Retrieves a setting manager with aliased PFD map user settings.
   * @param bus The event bus.
   * @param index The instrument index
   * @returns A setting manager with aliased PFD map user settings.
   */
  public static getPfdManager(bus: EventBus, index: 1 | 2): UserSettingManager<MapSettingsPfdAliased> {
    if (MapUserSettings.INSTANCE_PFD[index] === undefined) {
      MapUserSettings.INSTANCE_PFD[index] = new AliasedUserSettingManager<MapSettingsPfdAliased>(bus, MapUserSettings.getAliasedDefaultDefinitions('MFD'));

      MapUserSettings.INSTANCE_PFD[index].useAliases(MapUserSettings.getMasterManager(bus), {
        hsiFormat: `hsiFormatPFD_${index}`,
        tfcEnabled: `tfcEnabledPFD_${index}`,
        terrWxState: `terrWxStatePFD_${index}`,
        mapWaypointsDisplay: `mapWaypointsDisplayPFD_${index}`,
        mapAltitudeArcShow: `mapAltitudeArcShowPFD_${index}`,
        mapRange: `mapRange_${index}`,
      });
    }

    return MapUserSettings.INSTANCE_PFD[index];
  }

  /**
   * Retrieves a setting manager with aliased MFD map user settings.
   * @param bus The event bus.
   * @param index The instrument index
   * @returns A setting manager with aliased MFD map user settings.
   */
  public static getMfdManager(bus: EventBus, index: 1 | 2): UserSettingManager<MapSettingsMfdAliased> {
    if (MapUserSettings.INSTANCE_MFD[index] === undefined) {
      MapUserSettings.INSTANCE_MFD[index] = new AliasedUserSettingManager<MapSettingsMfdAliased>(bus, MapUserSettings.getAliasedDefaultDefinitions('PFD'));

      MapUserSettings.INSTANCE_MFD[index].useAliases(MapUserSettings.getMasterManager(bus), {
        hsiFormat: `hsiFormatMFD_${index}`,
        tfcEnabled: `tfcEnabledMFD_${index}`,
        terrWxState: `terrWxStateMFD_${index}`,
        nexradEnabled: `nexradEnabledMFD_${index}`,
        mapWaypointsDisplay: `mapWaypointsDisplayMFD_${index}`,
        mapAltitudeArcShow: `mapAltitudeArcShowMFD_${index}`,
        mapExtended: `mapExtendedMFD_${index}`,
        mapRange: `mapRange_${index}`
      });
    }

    return MapUserSettings.INSTANCE_MFD[index];
  }

  /**
   * Gets the default values for the master map user settings
   * @returns A map settings object containing the default values
   */
  private static getDefaultValues(): MapSettings {
    return {
      hsiFormatPFD_1: 'ARC',
      hsiFormatPFD_2: 'ARC',
      hsiFormatMFD_1: 'PPOS',
      hsiFormatMFD_2: 'PPOS',
      mapRange_1: 5,
      mapRange_2: 25,
      tfcEnabledPFD_1: true,
      tfcEnabledPFD_2: true,
      tfcEnabledMFD_1: true,
      tfcEnabledMFD_2: true,
      terrWxStatePFD_1: 'OFF',
      terrWxStatePFD_2: 'OFF',
      terrWxStateMFD_1: 'OFF',
      terrWxStateMFD_2: 'OFF',
      mapAltitudeArcShowPFD_1: false,
      mapAltitudeArcShowPFD_2: false,
      mapAltitudeArcShowMFD_1: false,
      mapAltitudeArcShowMFD_2: false,
      mapWaypointsDisplayPFD_1: MapWaypointsDisplay.HiNavaids | MapWaypointsDisplay.LoNavaids,
      mapWaypointsDisplayPFD_2: MapWaypointsDisplay.HiNavaids | MapWaypointsDisplay.LoNavaids,
      mapWaypointsDisplayMFD_1: MapWaypointsDisplay.HiNavaids | MapWaypointsDisplay.LoNavaids,
      mapWaypointsDisplayMFD_2: MapWaypointsDisplay.HiNavaids | MapWaypointsDisplay.LoNavaids,
      nexradEnabledMFD_1: false,
      nexradEnabledMFD_2: false,
      mapExtendedMFD_1: false,
      mapExtendedMFD_2: false,
    };
  }

  /**
   * Gets an object that defines the default master map user settings definitions
   * @returns Default map user settings definition
   */
  private static getDefaultDefinitions(): UserSettingDefinition<MapSettings[keyof MapSettings]>[] {
    return Object.entries(MapUserSettings.getDefaultValues()).map(([name, defaultValue]) => {
      return {
        name,
        defaultValue
      };
    });
  }

  /**
   * Gets an object that defines the default master map user settings definitions
   * @param exclude Whether to exclude PFD or MFD definitions
   * @returns Default map user settings definition
   */
  private static getAliasedDefaultDefinitions(exclude: 'PFD' | 'MFD'): UserSettingDefinition<MapSettings[keyof MapSettings]>[] {
    return Object.entries(MapUserSettings.getDefaultValues()).filter(([name]) => !name.includes(exclude) && name.endsWith('1')).map(([name, defaultValue]) => {
      return {
        name: name.replace(/(PFD|MFD)?_\d/, ''),
        defaultValue
      };
    });
  }
}
