import {
  Consumer, DefaultUserSettingManager, EventBus, UserSetting, UserSettingDefinition, UserSettingManager, UserSettingMap, UserSettingRecord, UserSettingValue
} from '@microsoft/msfs-sdk';

import { AvionicsConfig } from '../AvionicsConfig';
import { DisplayUnitIndices } from '../InstrumentIndices';
import { MapWaypointsDisplay, TerrWxState } from '../Map/EpicMapCommon';

export enum MapDisplayMode {
  NorthUp = 'NorthUp',
  HeadingUp = 'HeadingUp',
  TrackUp = 'TrackUp',
}

export enum WeatherMode {
  /** SirusXM weather. */
  SxmWeather = 'SxmWeather',
  /** Uplinked weather data. */
  UplinkWeather = 'UplinkWeather',
  /** Onboard WX radar data. */
  WxRadar = 'WxRadar',
  /** All WX data off. */
  Off = 'Off',
}

export enum TcasVerticalRange {
  /** Display traffic from 9900 feet below to 9900 feet above. */
  AboveBelow = 'AboveBelow',
  /** Display traffic from 2700 feet below to 2700 feet above. */
  Norm = 'Norm',
}

export enum PerfMode {
  /** Use pilot entered cruise speed and fuel flow for predictions. */
  PilotSpeedFF = 'PilotSpeedFF',
  /** Use current/live cruise speed and fuel flow for predictions. */
  CurrentGSFF = 'CurrentGSFF',
}

export enum UpperMfdDisplayPage {
  Charts,
  Inav,
}

/**
 * MFD user settings.
 */
export type MfdAliasedUserSettingTypes = {
  /** INAV map orientation. */
  mapDisplayMode: MapDisplayMode,
  /** Whether airports are displayed on the INAV map when the range is 150 NM or less (symbol depends on airport type and range). */
  airportEnabled: boolean,
  /** Whether VORs are displayed on the INAV map when the range is 200 NM or less (white dots at >= 105 NM). */
  vorEnabled: boolean,
  /** Whether NDBs are displayed on the INAV map when the range is 25 NM or less. */
  ndbEnabled: boolean,
  /** Whether database intersections are displayed on the INAV map when the range is 2.5 NM or less. */
  intersectionEnabled: boolean,
  /** Whether pilot-entered waypoints are displayed on the INAV map when the range is 50 NM or less. */
  pilotEnteredEnabled: boolean,
  /**
   * Whether high altitude airways are displaed on the INAV map when the range is 25 NM or less or heading up mode,
   * or 50 NM or less in north up mode.
   * Note: outside of north america all airways are displayed when either lo or hi altitude is selected.
   */
  hiAltAirwaysEnabled: boolean,
  /**
   * Whether low altitude airways are displaed on the INAV map when the range is 5 NM or less or heading up mode,
   * or 10 NM or less in north up mode.
   * Note: outside of north america all airways are displayed when either lo or hi altitude is selected.
   */
  loAltAirwaysEnabled: boolean,
  /** Whether terminal/control airspaces are displayed on the INAV map. */
  terminalAirspacesEnabled: boolean,
  /** Whether special use airspaces are displayed on the INAV map. */
  specialAirspacesEnabled: boolean,
  /** Whether to display the missed approach route at the destination on the INAV map. */
  missedAppEnabled: boolean,
  /** Whether to display the alternate route on the INAV map. */
  alternateEnabled: boolean,
  /** Whether to display constraints (angle, speed, time, altitude) on the INAV map. */
  constraintsEnabled: boolean,
  /** Whether politcal/country boundaries, and rivers/lakes (when less than 150 NM) are displayed on the INAV map. */
  boundariesEnabled: boolean,
  /** Whether to display highways on the INAV map. */
  majorRoadwaysEnabled: boolean,
  /** Whether to display local highways and roadways on the INAV map. */
  minorRoadwaysEnabled: boolean,
  /** Whether to display cities (> 20000 pop) on the INAV map below 30 NM range. Below 10 NM range the name is also shown. */
  citiesEnabled: boolean,
  /** Whether to display railways on the INAV map below 30 NM range. */
  railwaysEnabled: boolean,
  /** Whether to display VFR reference points (VRPs) on the INAV map when the range is at or below 6 NM. */
  vfrRefPointsEnabled: boolean,
  /** Whether to display water highlights when a river or lake is hovered over on the INAV map. */
  waterHighlightsEnabled: boolean,
  /** Whether to display topographical terrain on the INAV map. Colour is based on absolute altitude. */
  terrainEnabled: boolean,
  /** Whether to display situational awareness (EGPWS) terrain on the INAV map. Colour is relative to aircraft altitude. */
  saTerrainEnabled: boolean,
  /** The selected weather mode for display on the INAV map. */
  weatherMode: WeatherMode,
  // We skip SirusXM products here... huge list that we don't implement.
  // We also skip uplink weather settings.
  /** The page to show on the upper MFD */
  upperMfdDisplayPage: UpperMfdDisplayPage,
  /** Whether to display the VSD on the lower portion of the MFD. */
  vsdEnabled: boolean,
  /** Whether the TCAS data is displayed on the INAV map when in TA or TA/RA mode. */
  trafficEnabled: boolean,
  /** Whether to display trend vectors for intruders on the INAV map. */
  tcasTrendVectorEnabled: boolean,
  /** Whether to display the aircraft position symbol on geo-referenced charts. */
  aircraftOnChartsEnabled: boolean,
  /** The current wx and terr state. */
  terrWxState: TerrWxState,
  /** TFC Enabled.  */
  tfcEnabled: boolean,
  /** Terr WX contrast 0 to 1. */
  terrWxContrast: number,
  /** Map range in NM. */
  mapRange: number,
  /** Map waypoints display flags. */
  mapWaypointsDisplay: MapWaypointsDisplay,
  /** Basic Operating Weight [lbs]. */
  basicOperatingWeightLbs: number,
  /** Average passenger weight [lbs]. */
  passengerWeightLbs: number,
  /** Target cruise speed in kts */
  cruiseSpeedKts: number,
  /** Target cruise speed in mach */
  cruiseSpeedMach: number
};

/**
 * Non-indexed MFD user settings.
 */
type MfdNonIndexedUserSettingTypes = {
  /** The vertical range for TCAS traffic displayed on the INAV map. */
  tcasVerticalRange: TcasVerticalRange,
  /** Performance predictions mode. */
  perfMode: PerfMode,
};

/**
 * True indexed MFD user settings for an indexed MFD.
 */
type MfdIndexedUserSettingTypes<Index extends number> = {
  [Name in keyof MfdAliasedUserSettingTypes as `${Name}_${Index}`]: MfdAliasedUserSettingTypes[Name];
};

/**
 * All true MFD user settings.
 */
export type MfdAllUserSettingTypes = MfdIndexedUserSettingTypes<number> & MfdNonIndexedUserSettingTypes;


/**
 * A manager for MFD user settings. All settings are saved in crew profiles.
 */
export class MfdUserSettingManager implements UserSettingManager<MfdAllUserSettingTypes> {
  private static readonly INDEXED_SETTING_NAMES: readonly (keyof MfdAliasedUserSettingTypes)[] = [
    'mapDisplayMode',
    'airportEnabled',
    'vorEnabled',
    'ndbEnabled',
    'intersectionEnabled',
    'pilotEnteredEnabled',
    'hiAltAirwaysEnabled',
    'loAltAirwaysEnabled',
    'terminalAirspacesEnabled',
    'specialAirspacesEnabled',
    'missedAppEnabled',
    'alternateEnabled',
    'constraintsEnabled',
    'boundariesEnabled',
    'majorRoadwaysEnabled',
    'minorRoadwaysEnabled',
    'citiesEnabled',
    'railwaysEnabled',
    'vfrRefPointsEnabled',
    'waterHighlightsEnabled',
    'terrainEnabled',
    'saTerrainEnabled',
    'weatherMode',
    'upperMfdDisplayPage',
    'vsdEnabled',
    'trafficEnabled',
    'tcasTrendVectorEnabled',
    'aircraftOnChartsEnabled',
    'mapWaypointsDisplay',
    'mapRange',
    'terrWxState',
    'terrWxContrast',
    'tfcEnabled',
    'basicOperatingWeightLbs',
    'passengerWeightLbs',
    'cruiseSpeedKts',
    'cruiseSpeedMach'
  ];

  private readonly manager: DefaultUserSettingManager<MfdAllUserSettingTypes>;

  private readonly aliasedManagers: UserSettingManager<MfdAliasedUserSettingTypes>[] = [];

  /**
   * Constructor.
   * @param bus The event bus.
   * @param displayIndices The indices of the Displays for which to get a manager.
   * @param config The avionics config
   */
  constructor(bus: EventBus, public readonly displayIndices: DisplayUnitIndices[], config: AvionicsConfig) {
    const settingDefs: UserSettingDefinition<any>[] = [];

    for (let i = 0; i < displayIndices.length; i++) {
      settingDefs.push(...MfdUserSettingManager.getIndexedSettingDefs(displayIndices[i], config));
    }
    settingDefs.push(...MfdUserSettingManager.getNonIndexedSettingDefs());

    this.manager = new DefaultUserSettingManager(bus, settingDefs);

    for (let i = 0; i < displayIndices.length; i++) {
      this.aliasedManagers[displayIndices[i]] = this.manager.mapTo(MfdUserSettingManager.getAliasMap(displayIndices[i]));
    }
  }

  /** @inheritdoc */
  public tryGetSetting<K extends string>(name: K): K extends keyof MfdAllUserSettingTypes ? UserSetting<MfdAllUserSettingTypes[K]> : undefined {
    return this.manager.tryGetSetting(name) as any;
  }

  /** @inheritdoc */
  public getSetting<K extends keyof MfdAllUserSettingTypes & string>(name: K): UserSetting<NonNullable<MfdAllUserSettingTypes[K]>> {
    return this.manager.getSetting(name);
  }

  /** @inheritdoc */
  public whenSettingChanged<K extends keyof MfdAllUserSettingTypes & string>(name: K): Consumer<NonNullable<MfdAllUserSettingTypes[K]>> {
    return this.manager.whenSettingChanged(name);
  }

  /** @inheritdoc */
  public getAllSettings(): UserSetting<UserSettingValue>[] {
    return this.manager.getAllSettings();
  }

  /** @inheritdoc */
  public mapTo<M extends UserSettingRecord>(map: UserSettingMap<M, MfdAllUserSettingTypes>): UserSettingManager<M & MfdAllUserSettingTypes> {
    return this.manager.mapTo(map);
  }

  /**
   * Gets a manager for aliased MFD user settings for an indexed GDU.
   * @param displayIndex The index of the GDU for which to get an aliased setting manager.
   * @returns A manager for aliased MFD user settings for the specified GDU.
   * @throws RangeError if `index` is less than 1 or greater than the number of GDUs supported by this manager.
   */
  public getAliasedManager(displayIndex: DisplayUnitIndices): UserSettingManager<MfdAliasedUserSettingTypes> {
    if (!this.displayIndices.includes(displayIndex)) {
      throw new RangeError();
    }

    return this.aliasedManagers[displayIndex];
  }

  /**
   * Gets an array of definitions for true PFD settings for a single GDU.
   * @param index The index of the GDU.
   * @param config The avionics config object
   * @returns An array of definitions for true PFD settings for the specified GDU.
   */
  private static getIndexedSettingDefs(
    index: number,
    config: AvionicsConfig
  ): readonly UserSettingDefinition<MfdIndexedUserSettingTypes<number>[keyof MfdIndexedUserSettingTypes<number>]>[] {
    const values = MfdUserSettingManager.getIndexedDefaultValues(config);
    return Object.keys(values).map(name => {
      return {
        name: `${name}_${index}`,
        defaultValue: values[name as keyof typeof values]
      };
    });
  }

  /**
   * Gets an array of definitions for non-indexed PFD settings.
   * @returns An array of definitions for non-indexed PFD settings.
   */
  private static getNonIndexedSettingDefs(
  ): readonly UserSettingDefinition<MfdNonIndexedUserSettingTypes[keyof MfdNonIndexedUserSettingTypes]>[] {
    const values = MfdUserSettingManager.getNonIndexedDefaultValues();
    return Object.keys(values).map(name => {
      return {
        name,
        defaultValue: values[name as keyof typeof values]
      };
    });
  }

  /**
   * Gets the default values for a full set of aliased indexed PFD settings.
   * @param config The avionics config object
   * @returns The default values for a full set of aliased indexed PFD settings.
   */
  private static getIndexedDefaultValues(config: AvionicsConfig): MfdAliasedUserSettingTypes {
    return {
      'mapDisplayMode': MapDisplayMode.NorthUp,
      'airportEnabled': true,
      'vorEnabled': false,
      'ndbEnabled': false,
      'intersectionEnabled': false,
      'pilotEnteredEnabled': false,
      'hiAltAirwaysEnabled': false,
      'loAltAirwaysEnabled': false,
      'terminalAirspacesEnabled': false,
      'specialAirspacesEnabled': false,
      'missedAppEnabled': true,
      'alternateEnabled': false,
      'constraintsEnabled': false,
      'boundariesEnabled': true,
      'majorRoadwaysEnabled': false,
      'minorRoadwaysEnabled': false,
      'citiesEnabled': false,
      'railwaysEnabled': false,
      'vfrRefPointsEnabled': false,
      'waterHighlightsEnabled': false,
      'terrainEnabled': true,
      'saTerrainEnabled': false,
      'weatherMode': WeatherMode.Off,
      'upperMfdDisplayPage': UpperMfdDisplayPage.Inav,
      'vsdEnabled': false,
      'trafficEnabled': true,
      'tcasTrendVectorEnabled': true,
      'aircraftOnChartsEnabled': true,
      'terrWxState': 'OFF',
      'tfcEnabled': false,
      'terrWxContrast': 1,
      'mapRange': 20,
      'mapWaypointsDisplay': MapWaypointsDisplay.MissedApproach,
      'basicOperatingWeightLbs': config.airframe.basicOperatingWeight ?? NaN,
      'passengerWeightLbs': config.airframe.avgPaxWeight ?? NaN,
      'cruiseSpeedKts': config.speedSchedules.cruiseSchedule.ias ?? NaN,
      'cruiseSpeedMach': config.speedSchedules.cruiseSchedule.mach ?? NaN,
    };
  }

  /**
   * Gets the default values for all non-indexed PFD settings.
   * @returns The default values for all non-indexed PFD settings.
   */
  private static getNonIndexedDefaultValues(): MfdNonIndexedUserSettingTypes {
    return {
      'tcasVerticalRange': TcasVerticalRange.Norm,
      'perfMode': PerfMode.PilotSpeedFF,
    };
  }

  /**
   * Gets a setting name alias mapping for a GDU.
   * @param index The index of the GDU.
   * @returns A setting name alias mapping for the specified GDU.
   */
  private static getAliasMap<Index extends number>(
    index: Index
  ): UserSettingMap<MfdAliasedUserSettingTypes, MfdIndexedUserSettingTypes<Index>> {
    const map: UserSettingMap<MfdAliasedUserSettingTypes, MfdIndexedUserSettingTypes<Index>> = {};

    for (const name of MfdUserSettingManager.INDEXED_SETTING_NAMES) {
      map[name] = `${name}_${index}`;
    }

    return map;
  }
}
