/* eslint-disable @typescript-eslint/ban-types */
import { DefaultUserSettingManager, EventBus, UserSettingDefinition, UserSettingManager, UserSettingMap } from '@microsoft/msfs-sdk';

import { ControllableDisplayPaneIndex, DisplayPaneIndex, GtcIndex } from '@microsoft/msfs-wtg3000-common';

/** A type of DataField to display in the right most column on the flight plan page. */
export enum FlightPlanDataFieldType {
  CUM_CumulativeDistance = 'CUM',
  DIS_Distance = 'DIS',
  DTK_DesiredTrack = 'DTK',
  ESA_EnrouteSafeAltitude = 'ESA',
  ETA_EstTimeOfArrival = 'ETA',
  ETE_EstTimeEnroute = 'ETE',
  FUEL_FuelToDestination = 'FUEL',
}

/**
 * GTC user settings aliased by instrument.
 */
type GtcInstrumentAliasedUserSettingTypes = {
  /** The data to show for data field 1. */
  flightPlanDataField1: FlightPlanDataFieldType;

  /** The data to show for data field 2. */
  flightPlanDataField2: FlightPlanDataFieldType;

  /** Whether to sort the airway exits alphabetically or not. */
  airwaySelectionSortAZ: boolean;

  /** When true, new airways will load collapsed, if false they will load expanded. */
  loadNewAirwaysCollapsed: boolean;
};

/**
 * GTC user settings aliased by display pane.
 */
type GtcDisplayPaneAliasedUserSettingTypes = {
  /** Whether to show the flight plan preview. */
  gtcShowFlightPlanPreview: boolean;
}

/**
 * True display pane-indexed GTC user settings.
 */
type GtcDisplayPaneIndexedUserSettingTypes<Index extends ControllableDisplayPaneIndex> = {
  [Name in keyof GtcDisplayPaneAliasedUserSettingTypes as `${Name}${Index}`]: GtcDisplayPaneAliasedUserSettingTypes[Name];
}

/**
 * Non-instrument-indexed GTC user settings.
 */
type GtcNonInstrumentIndexedUserSettingTypes
  = GtcDisplayPaneIndexedUserSettingTypes<DisplayPaneIndex.LeftPfd>
  & GtcDisplayPaneIndexedUserSettingTypes<DisplayPaneIndex.LeftMfd>
  & GtcDisplayPaneIndexedUserSettingTypes<DisplayPaneIndex.RightMfd>
  & GtcDisplayPaneIndexedUserSettingTypes<DisplayPaneIndex.RightPfd>;

/**
 * True instrument-indexed GTC user settings.
 */
type GtcInstrumentIndexedUserSettingTypes<Index extends GtcIndex> = {
  [Name in keyof GtcInstrumentAliasedUserSettingTypes as `${Name}_${Index}`]: GtcAliasedUserSettingTypes[Name];
};

/**
 * Aliased GTC user settings.
 */
export type GtcAliasedUserSettingTypes = GtcInstrumentAliasedUserSettingTypes & GtcNonInstrumentIndexedUserSettingTypes;

/**
 * All true GTC user settings.
 */
export type GtcAllUserSettingTypes = GtcInstrumentIndexedUserSettingTypes<1> & GtcInstrumentIndexedUserSettingTypes<2> & GtcNonInstrumentIndexedUserSettingTypes;

/**
 * Utility class for retrieving GTC user setting managers.
 */
export class GtcUserSettings {
  private static readonly INDEXED_SETTING_NAMES: readonly (keyof GtcInstrumentAliasedUserSettingTypes)[] = [
    'flightPlanDataField1',
    'flightPlanDataField2',
    'airwaySelectionSortAZ',
    'loadNewAirwaysCollapsed',
  ];

  private static masterInstance?: UserSettingManager<GtcAllUserSettingTypes>;
  private static readonly aliasedInstances: UserSettingManager<GtcAliasedUserSettingTypes>[] = [];

  /**
   * Retrieves a manager for all true GTC settings.
   * @param bus The event bus.
   * @returns A manager for all true GTC settings.
   */
  public static getMasterManager(bus: EventBus): UserSettingManager<GtcAllUserSettingTypes> {
    return GtcUserSettings.masterInstance ??= new DefaultUserSettingManager(bus, [
      ...GtcUserSettings.getIndexedSettingDefs(1),
      ...GtcUserSettings.getIndexedSettingDefs(2),
      ...GtcUserSettings.getIndexedSettingDefs(3),
      ...GtcUserSettings.getIndexedSettingDefs(4),
      ...GtcUserSettings.getNonIndexedSettingDefs()
    ]);
  }

  /**
   * Retrieves a manager for aliased GTC settings for a single GTC.
   * @param bus The event bus.
   * @param index The index of the GTC.
   * @returns A manager for aliased GTC settings for the specified GTC.
   */
  public static getAliasedManager<Index extends GtcIndex>(bus: EventBus, index: Index): UserSettingManager<GtcAliasedUserSettingTypes> {
    return GtcUserSettings.aliasedInstances[index] ??= GtcUserSettings.getMasterManager(bus).mapTo(
      GtcUserSettings.getAliasMap(index)
    );
  }

  /**
   * Gets an array of definitions for true GTC settings for a single GTC.
   * @param index The index of the display pane.
   * @returns An array of definitions for true GTC settings for the specified GTC.
   */
  private static getIndexedSettingDefs(
    index: GtcIndex
  ): readonly UserSettingDefinition<GtcInstrumentIndexedUserSettingTypes<GtcIndex>[keyof GtcInstrumentIndexedUserSettingTypes<GtcIndex>]>[] {
    const values = GtcUserSettings.getIndexedDefaultValues();
    return Object.keys(values).map(name => {
      return {
        name: `${name}_${index}`,
        defaultValue: values[name as keyof typeof values]
      };
    });
  }

  /**
   * Gets an array of definitions for non-indexed GTC settings.
   * @returns An array of definitions for non-indexed GTC settings.
   */
  private static getNonIndexedSettingDefs(
  ): readonly UserSettingDefinition<GtcNonInstrumentIndexedUserSettingTypes[keyof GtcNonInstrumentIndexedUserSettingTypes]>[] {
    const values = GtcUserSettings.getNonIndexedDefaultValues();
    return Object.keys(values).map(name => {
      return {
        name,
        defaultValue: values[name as keyof typeof values]
      };
    });
  }

  /**
   * Gets the default values for a full set of aliased indexed GTC settings.
   * @returns The default values for a full set of aliased indexed GTC settings.
   */
  private static getIndexedDefaultValues(): GtcInstrumentAliasedUserSettingTypes {
    return {
      'flightPlanDataField1': FlightPlanDataFieldType.DTK_DesiredTrack,
      'flightPlanDataField2': FlightPlanDataFieldType.DIS_Distance,
      'airwaySelectionSortAZ': false,
      'loadNewAirwaysCollapsed': true,
    };
  }

  /**
   * Gets the default values for all non-indexed GTC settings.
   * @returns The default values for all non-indexed GTC settings.
   */
  private static getNonIndexedDefaultValues(): GtcNonInstrumentIndexedUserSettingTypes {
    return {
      'gtcShowFlightPlanPreview1': false,
      'gtcShowFlightPlanPreview2': false,
      'gtcShowFlightPlanPreview3': false,
      'gtcShowFlightPlanPreview4': false
    };
  }

  /**
   * Gets a setting name alias mapping for a GTC.
   * @param index The index of the GTC.
   * @returns A setting name alias mapping for the specified GTC.
   */
  private static getAliasMap<Index extends GtcIndex>(
    index: Index
  ): UserSettingMap<GtcAliasedUserSettingTypes, GtcInstrumentIndexedUserSettingTypes<Index>> {
    const map: UserSettingMap<GtcAliasedUserSettingTypes, GtcInstrumentIndexedUserSettingTypes<Index>> = {};

    for (const name of GtcUserSettings.INDEXED_SETTING_NAMES) {
      map[name] = `${name}_${index}`;
    }

    return map;
  }
}