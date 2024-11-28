import {
  Consumer, DefaultUserSettingManager, EventBus, UserSetting, UserSettingDefinition, UserSettingManager,
  UserSettingMap, UserSettingRecord, UserSettingValue
} from '@microsoft/msfs-sdk';

import { SynVisUserSettingTypes } from '@microsoft/msfs-garminsdk';

/**
 * G3X synthetic vision user settings.
 */
export type G3XSynVisUserSettingTypes = Pick<SynVisUserSettingTypes, 'svtEnabled' | 'svtTrafficShow'> & {
  /** Whether to show the flight path marker. */
  svtFpmShow: boolean;
};

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
 * Attitude indicator user settings.
 */
export type AttitudeIndicatorUserSettingTypes = {
  /** Whether to show the standard rate turn bank angle pointers. */
  pfdStandardRateTurnPointerShow: boolean;
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
  HeadXWind = 'HeadXWind',
  SpeedDir = 'SpeedDir',
}

/**
 * Wind display user settings.
 */
export type WindDisplayUserSettingTypes = {
  /** The display mode of the wind display. */
  windDisplayMode: WindDisplaySettingMode;
};

/**
 * PFD inset user settings.
 */
export type PfdInsetUserSettingTypes = {
  /** The key of the selected left PFD inset. */
  pfdInsetLeftKey: string;

  /** The key of the selected right PFD inset. */
  pfdInsetRightKey: string;
};

/**
 * Bearing pointer source modes.
 */
export enum PfdBearingPointerSource {
  None = 'None',
  Nav1 = 'Nav1',
  Nav2 = 'Nav2',
  Gps = 'Gps',
  NearestAirport = 'NearestAirport'
}

/**
 * PFD bearing pointer user settings.
 */
export type PfdBearingPointerUserSettingTypes = {
  /** The data source of bearing pointer 1. */
  pfdBearingPointer1Source: PfdBearingPointerSource;

  /** The data source of bearing pointer 2. */
  pfdBearingPointer2Source: PfdBearingPointerSource;
};

/**
 * HSI orientation setting modes.
 */
export enum PfdHsiOrientationSettingMode {
  Heading = 'Heading',
  Auto = 'Auto'
}

/**
 * PFD HSI user settings.
 */
export type PfdHsiUserSettingTypes = {
  /** The data source of bearing pointer 1. */
  pfdHsiOrientationMode: PfdHsiOrientationSettingMode;

  /** Whether to show the upper lateral deviation indicator. */
  pfdHsiShowUpperDeviationIndicator: boolean;
};

/**
 * PFD knob action setting modes.
 */
export enum PfdKnobActionSettingMode {
  HeadingAltitude = 'Heading/Altitude',
  FdBugBaro = 'FdBug/Baro',
  CourseBaro = 'Course/Baro',
}

/**
 * PFD knob user settings.
 */
export type PfdKnobUserSettingTypes = {
  /** The action bound to the knob on the split-screen side. */
  pfdKnobSplitScreenSideAction: PfdKnobActionSettingMode;

  /** Whether pressing a knob should temporarily toggle the action bound to the knob. */
  pfdKnobPressToToggleAction: boolean;
};

/**
 * Aliased PFD user settings.
 */
export type PfdUserSettingTypes =
  G3XSynVisUserSettingTypes
  & FlightDirectorUserSettingTypes
  & AttitudeIndicatorUserSettingTypes
  & AoaIndicatorUserSettingTypes
  & WindDisplayUserSettingTypes
  & PfdInsetUserSettingTypes
  & PfdBearingPointerUserSettingTypes
  & PfdHsiUserSettingTypes
  & PfdKnobUserSettingTypes;

/**
 * True indexed PFD user settings for an indexed GDU.
 */
type PfdIndexedUserSettingTypes<Index extends number> = {
  [Name in keyof PfdUserSettingTypes as `${Name}_${Index}_g3x`]: PfdUserSettingTypes[Name];
};

/**
 * All true PFD user settings.
 */
export type PfdAllUserSettingTypes = PfdIndexedUserSettingTypes<number>;

/**
 * A manager for PFD user settings.
 */
export class PfdUserSettingManager implements UserSettingManager<PfdAllUserSettingTypes> {
  private static readonly INDEXED_SETTING_NAMES: readonly (keyof PfdUserSettingTypes)[] = [
    'svtEnabled',
    'svtFpmShow',
    'svtTrafficShow',
    'flightDirectorFormat',
    'pfdStandardRateTurnPointerShow',
    'aoaDisplayMode',
    'windDisplayMode',
    'pfdInsetLeftKey',
    'pfdInsetRightKey',
    'pfdBearingPointer1Source',
    'pfdBearingPointer2Source',
    'pfdHsiOrientationMode',
    'pfdHsiShowUpperDeviationIndicator',
    'pfdKnobSplitScreenSideAction',
    'pfdKnobPressToToggleAction'
  ];

  private readonly manager: DefaultUserSettingManager<PfdAllUserSettingTypes>;

  private readonly aliasedManagers: UserSettingManager<PfdUserSettingTypes>[] = [];

  /**
   * Creates a new instance of PfdUserSettingManager.
   * @param bus The event bus.
   * @param gduCount The number of GDUs supported by this manager.
   */
  public constructor(bus: EventBus, public readonly gduCount: number) {
    const settingDefs: UserSettingDefinition<any>[] = [];

    for (let i = 1; i <= gduCount; i++) {
      settingDefs.push(...PfdUserSettingManager.getIndexedSettingDefs(i));
    }

    this.manager = new DefaultUserSettingManager(bus, settingDefs);

    for (let i = 1; i <= gduCount; i++) {
      this.aliasedManagers[i] = this.manager.mapTo(PfdUserSettingManager.getAliasMap(i));
    }
  }

  /** @inheritDoc */
  public tryGetSetting<K extends string>(name: K): K extends keyof PfdAllUserSettingTypes ? UserSetting<PfdAllUserSettingTypes[K]> : undefined {
    return this.manager.tryGetSetting(name) as any;
  }

  /** @inheritDoc */
  public getSetting<K extends keyof PfdAllUserSettingTypes & string>(name: K): UserSetting<NonNullable<PfdAllUserSettingTypes[K]>> {
    return this.manager.getSetting(name);
  }

  /** @inheritDoc */
  public whenSettingChanged<K extends keyof PfdAllUserSettingTypes & string>(name: K): Consumer<NonNullable<PfdAllUserSettingTypes[K]>> {
    return this.manager.whenSettingChanged(name);
  }

  /** @inheritdoc */
  public getAllSettings(): UserSetting<UserSettingValue>[] {
    return this.manager.getAllSettings();
  }

  /** @inheritDoc */
  public mapTo<M extends UserSettingRecord>(map: UserSettingMap<M, PfdAllUserSettingTypes>): UserSettingManager<M & PfdAllUserSettingTypes> {
    return this.manager.mapTo(map);
  }

  /**
   * Gets a manager for aliased PFD user settings for an indexed GDU.
   * @param index The index of the GDU for which to get an aliased setting manager.
   * @returns A manager for aliased PFD user settings for the specified GDU.
   * @throws RangeError if `index` is less than 1 or greater than the number of GDUs supported by this manager.
   */
  public getAliasedManager(index: number): UserSettingManager<PfdUserSettingTypes> {
    if (index < 1 || index > this.gduCount) {
      throw new RangeError();
    }

    return this.aliasedManagers[index];
  }

  /**
   * Gets an array of definitions for true PFD settings for a single GDU.
   * @param index The index of the GDU.
   * @returns An array of definitions for true PFD settings for the specified GDU.
   */
  private static getIndexedSettingDefs(
    index: number
  ): readonly UserSettingDefinition<PfdIndexedUserSettingTypes<number>[keyof PfdIndexedUserSettingTypes<number>]>[] {
    const values = PfdUserSettingManager.getIndexedDefaultValues();
    return Object.keys(values).map(name => {
      return {
        name: `${name}_${index}_g3x`,
        defaultValue: values[name as keyof typeof values]
      };
    });
  }

  /**
   * Gets the default values for a full set of aliased indexed PFD settings.
   * @returns The default values for a full set of aliased indexed PFD settings.
   */
  private static getIndexedDefaultValues(): PfdUserSettingTypes {
    return {
      'svtEnabled': true,
      'svtFpmShow': true,
      'svtTrafficShow': false,
      'flightDirectorFormat': FlightDirectorFormatSettingMode.Single,
      'pfdStandardRateTurnPointerShow': true,
      'aoaDisplayMode': AoaIndicatorDisplaySettingMode.Auto,
      'windDisplayMode': WindDisplaySettingMode.Off,
      'pfdInsetLeftKey': '',
      'pfdInsetRightKey': '',
      'pfdBearingPointer1Source': PfdBearingPointerSource.None,
      'pfdBearingPointer2Source': PfdBearingPointerSource.None,
      'pfdHsiOrientationMode': PfdHsiOrientationSettingMode.Heading,
      'pfdHsiShowUpperDeviationIndicator': true,
      'pfdKnobSplitScreenSideAction': PfdKnobActionSettingMode.CourseBaro,
      'pfdKnobPressToToggleAction': false
    };
  }

  /**
   * Gets a setting name alias mapping for a GDU.
   * @param index The index of the GDU.
   * @returns A setting name alias mapping for the specified GDU.
   */
  private static getAliasMap<Index extends number>(
    index: Index
  ): UserSettingMap<PfdUserSettingTypes, PfdIndexedUserSettingTypes<Index>> {
    const map: UserSettingMap<PfdUserSettingTypes, PfdIndexedUserSettingTypes<Index>> = {};

    for (const name of PfdUserSettingManager.INDEXED_SETTING_NAMES) {
      map[name] = `${name}_${index}_g3x`;
    }

    return map;
  }
}