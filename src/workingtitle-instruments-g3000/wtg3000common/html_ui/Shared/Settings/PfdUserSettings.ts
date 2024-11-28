import { DefaultUserSettingManager, EventBus, UserSettingDefinition, UserSettingManager, UserSettingMap } from '@microsoft/msfs-sdk';

import { AltimeterUserSettingTypes, SynVisUserSettingTypes } from '@microsoft/msfs-garminsdk';

import { PfdIndex } from '../CommonTypes';

/**
 * Setting modes for flight director format.
 */
export enum FlightDirectorFormatSettingMode {
  Single = 'Single',
  Dual = 'Dual'
}

/**
 * Flight director user settings.
 */
export type FlightDirectorUserSettingTypes = {
  /** The format of the flight director. */
  flightDirectorFormat: FlightDirectorFormatSettingMode;
};

/**
 * Setting modes for angle of attack indicator display.
 */
export enum AoaIndicatorDisplaySettingMode {
  Off = 'Off',
  On = 'On',
  Auto = 'Auto'
}

/**
 * Angle of attack indicator user settings.
 */
export type AoaIndicatorUserSettingTypes = {
  /** The display mode of the angle of attack indicator. */
  aoaDisplayMode: AoaIndicatorDisplaySettingMode;
};

/**
 * Setting modes for wind display options.
 */
export enum WindDisplaySettingMode {
  Off = 'Off',
  Option1 = 'Option1',
  Option2 = 'Option2',
  Option3 = 'Option3'
}

/**
 * Wind display user settings.
 */
export type WindDisplayUserSettingTypes = {
  /** The display mode of the wind display. */
  windDisplayMode: WindDisplaySettingMode;
};

/**
 * Setting modes for PFD map layout.
 */
export enum PfdMapLayoutSettingMode {
  Off = 'Off',
  Inset = 'Inset',
  Hsi = 'Hsi',
  Traffic = 'Traffic'
}

/**
 * PFD map layout user settings.
 */
export type PfdMapLayoutUserSettingTypes = {
  /** The layout mode of the PFD map. */
  pfdMapLayout: PfdMapLayoutSettingMode;
};

/**
 * Bearing pointer source modes.
 */
export enum PfdBearingPointerSource {
  None = 'None',
  Nav1 = 'Nav1',
  Nav2 = 'Nav2',
  Fms1 = 'Fms1',
  Fms2 = 'Fms2',
  Adf1 = 'Adf1',
  Adf2 = 'Adf2'
}

/**
 * PFD map layout user settings.
 */
export type PfdBearingPointerUserSettingTypes = {
  /** The data source of bearing pointer 1. */
  pfdBearingPointer1Source: PfdBearingPointerSource;

  /** The data source of bearing pointer 2. */
  pfdBearingPointer2Source: PfdBearingPointerSource;
};

/**
 * Aliased PFD user settings.
 */
export type PfdAliasedUserSettingTypes =
  SynVisUserSettingTypes
  & AltimeterUserSettingTypes
  & FlightDirectorUserSettingTypes
  & AoaIndicatorUserSettingTypes
  & WindDisplayUserSettingTypes
  & PfdMapLayoutUserSettingTypes
  & PfdBearingPointerUserSettingTypes;

/**
 * Aliased indexed PFD user settings.
 */
type PfdAliasedIndexedUserSettingTypes = Omit<PfdAliasedUserSettingTypes, 'altMetric'>;

/**
 * Non-indexed PFD user settings.
 */
type PfdNonIndexedUserSettingTypes = Pick<PfdAliasedUserSettingTypes, 'altMetric'>;

/**
 * True indexed PFD user settings for an indexed PFD.
 */
type PfdIndexedUserSettingTypes<Index extends PfdIndex> = {
  [Name in keyof PfdAliasedIndexedUserSettingTypes as `${Name}_${Index}`]: PfdAliasedUserSettingTypes[Name];
};

/**
 * All true PFD user settings.
 */
export type PfdAllUserSettingTypes = PfdIndexedUserSettingTypes<1> & PfdIndexedUserSettingTypes<2> & PfdNonIndexedUserSettingTypes;

/**
 * Utility class for retrieving PFD user setting managers.
 */
export class PfdUserSettings {
  private static readonly INDEXED_SETTING_NAMES: readonly (keyof PfdAliasedIndexedUserSettingTypes)[] = [
    'svtEnabled',
    'svtDisabledFpmShow',
    'svtHeadingLabelShow',
    'svtAirportSignShow',
    'svtPathwaysShow',
    'svtTrafficShow',
    'altimeterBaroMetric',
    'flightDirectorFormat',
    'aoaDisplayMode',
    'windDisplayMode',
    'pfdMapLayout',
    'pfdBearingPointer1Source',
    'pfdBearingPointer2Source'
  ];

  private static masterInstance?: UserSettingManager<PfdAllUserSettingTypes>;
  private static readonly aliasedInstances: UserSettingManager<PfdAliasedUserSettingTypes>[] = [];

  /**
   * Retrieves a manager for all true PFD settings.
   * @param bus The event bus.
   * @returns A manager for all true PFD settings.
   */
  public static getMasterManager(bus: EventBus): UserSettingManager<PfdAllUserSettingTypes> {
    return PfdUserSettings.masterInstance ??= new DefaultUserSettingManager(bus, [
      ...PfdUserSettings.getIndexedSettingDefs(1),
      ...PfdUserSettings.getIndexedSettingDefs(2),
      ...PfdUserSettings.getNonIndexedSettingDefs()
    ]);
  }

  /**
   * Retrieves a manager for aliased PFD settings for a single PFD.
   * @param bus The event bus.
   * @param index The index of the PFD.
   * @returns A manager for aliased PFD settings for the specified PFD.
   */
  public static getAliasedManager<Index extends PfdIndex>(bus: EventBus, index: Index): UserSettingManager<PfdAliasedUserSettingTypes> {
    return PfdUserSettings.aliasedInstances[index] ??= PfdUserSettings.getMasterManager(bus).mapTo(
      PfdUserSettings.getAliasMap(index)
    );
  }

  /**
   * Gets an array of definitions for true PFD settings for a single PFD.
   * @param index The index of the display pane.
   * @returns An array of definitions for true PFD settings for the specified PFD.
   */
  private static getIndexedSettingDefs(
    index: PfdIndex
  ): readonly UserSettingDefinition<PfdIndexedUserSettingTypes<PfdIndex>[keyof PfdIndexedUserSettingTypes<PfdIndex>]>[] {
    const values = PfdUserSettings.getIndexedDefaultValues();
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
  ): readonly UserSettingDefinition<PfdNonIndexedUserSettingTypes[keyof PfdNonIndexedUserSettingTypes]>[] {
    const values = PfdUserSettings.getNonIndexedDefaultValues();
    return Object.keys(values).map(name => {
      return {
        name,
        defaultValue: values[name as keyof typeof values]
      };
    });
  }

  /**
   * Gets the default values for a full set of aliased indexed PFD settings.
   * @returns The default values for a full set of aliased indexed PFD settings.
   */
  private static getIndexedDefaultValues(): PfdAliasedIndexedUserSettingTypes {
    return {
      'svtEnabled': false,
      'svtDisabledFpmShow': false,
      'svtHeadingLabelShow': true,
      'svtAirportSignShow': false,
      'svtPathwaysShow': false,
      'svtTrafficShow': false,
      'altimeterBaroMetric': false,
      'flightDirectorFormat': FlightDirectorFormatSettingMode.Single,
      'aoaDisplayMode': AoaIndicatorDisplaySettingMode.Auto,
      'windDisplayMode': WindDisplaySettingMode.Off,
      'pfdMapLayout': PfdMapLayoutSettingMode.Off,
      'pfdBearingPointer1Source': PfdBearingPointerSource.None,
      'pfdBearingPointer2Source': PfdBearingPointerSource.None
    };
  }

  /**
   * Gets the default values for all non-indexed PFD settings.
   * @returns The default values for all non-indexed PFD settings.
   */
  private static getNonIndexedDefaultValues(): PfdNonIndexedUserSettingTypes {
    return {
      'altMetric': false
    };
  }

  /**
   * Gets a setting name alias mapping for a PFD.
   * @param index The index of the PFD.
   * @returns A setting name alias mapping for the specified PFD.
   */
  private static getAliasMap<Index extends PfdIndex>(
    index: Index
  ): UserSettingMap<PfdAliasedUserSettingTypes, PfdIndexedUserSettingTypes<Index>> {
    const map: UserSettingMap<PfdAliasedUserSettingTypes, PfdIndexedUserSettingTypes<Index>> = {};

    for (const name of PfdUserSettings.INDEXED_SETTING_NAMES) {
      map[name] = `${name}_${index}` as const;
    }

    return map;
  }
}
