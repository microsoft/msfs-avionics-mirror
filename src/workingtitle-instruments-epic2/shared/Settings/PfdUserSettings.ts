import {
  Consumer, DefaultUserSettingManager, EventBus, UserSetting, UserSettingDefinition, UserSettingManager, UserSettingMap, UserSettingRecord, UserSettingValue
} from '@microsoft/msfs-sdk';

import { DisplayUnitIndices } from '../InstrumentIndices';
import { TerrWxState } from '../Map/EpicMapCommon';

/** PFD baro correction units. */
export enum BaroCorrectionUnit {
  /** Inches of mercury. */
  In = 'In',
  /** Hectopascals. */
  Hpa = 'Hpa',
}

export enum WindFormat {
  /** Winds in vector format (bearing/magnitude). */
  Vector = 'Vector',
  /** Windows in x/y component format. */
  Xy = 'Xy',
}

export enum HeadingFormat {
  True = 'True',
  Magnetic = 'Magnetic',
}

/** PFD flight director mode. */
export enum FlightDirectorMode {
  /** Single-cue flight director mode. */
  SCue = 'SCue',
  /** Crosspointer flight director mode. */
  XPtr = 'XPtr',
  /** Flight path flight director mode. Available when SmartView is installed. */
  FltPath = 'FltPath',
}

/** PFD keyboard layout. */
export enum PopupKeyboardLayout {
  Abc = 'Abc',
  Qwerty = 'Qwerty',
}


/** HSI range in nautical miles. */
export type HsiRange = 5 | 10 | 25 | 50 | 100 | 200 | 300 | 400 | 500 | 1000 | 2000;

export enum HsiDisplayFormat {
  Full = 'Full',
  Partial = 'Partial',
}

/**
 * PFD user settings.
 */
export type PfdAliasedUserSettingTypes = {
  /** The type of wind display, defaults to X-Y. */
  windFormat: WindFormat,
  /** The type of heading reference, defaults to magnetic. */
  headingFormat: HeadingFormat,
  /** The flight director display mode. Default S-Cue. */
  flightDirectorMode: FlightDirectorMode,
  /** Whether the thrust director ids displayed. Greyed out and on when the autothrottle is engaged. Default On. */
  thrustDirectorEnabled: boolean,
  /** Whether the popup keyboard is enabled. Default to true. */
  popupKeyboardEnabled: boolean,
  /** The popup keyboard key order. Default ABC. */
  popupKeyboardLayout: PopupKeyboardLayout,
  /** Whether the flight path symbol (FPV) is shown. Greyed out and on when flight director is set to Flt Path. Default on. */
  fpsEnabled: boolean,
  /** the HSI map range in nautical miles. */
  hsiRange: HsiRange,
  /** The HSI display format. */
  hsiDisplayFormat: HsiDisplayFormat,
  /** Which of terrain or weather map is displayed on the HSI map. */
  terrWxState: TerrWxState,
  /** Whether traffic/TCAS display is enabled on the HSI map. */
  trafficEnabled: boolean,
  /** Whether lighting strike information is displayed on the HSI map. */
  lightningEnabled: boolean,
  /** Baro correction units, defaults to in.Hg. */
  baroCorrectionUnit: BaroCorrectionUnit,
  /** Whether metric altitude display is enabled, defaults to disabled. */
  altMetric: boolean,
  /** Whether synchronisation of baro settings is enabled, defaults to true. */
  baroSynchEnabled: boolean,
  /** Whether the synthetic vision should be enabled, defaults to false. */
  syntheticVisionEnabled: boolean,
};

/**
 * Aliased indexed PFD user settings.
 */
type PfdAliasedIndexedUserSettingTypes = Omit<PfdAliasedUserSettingTypes, 'baroCorrectionUnit' | 'altMetric' | 'baroSynchEnabled' |
  'flightDirectorMode' | 'fpsEnabled' | 'thrustDirectorEnabled' | 'windFormat' | 'headingFormat' |
  'popupKeyboardEnabled' | 'popupKeyboardLayout'>;

/**
 * Non-indexed PFD user settings.
 */
type PfdNonIndexedUserSettingTypes = Pick<PfdAliasedUserSettingTypes, 'baroCorrectionUnit' | 'altMetric' | 'baroSynchEnabled' |
  'flightDirectorMode' | 'fpsEnabled' | 'thrustDirectorEnabled' | 'windFormat' | 'headingFormat' |
  'popupKeyboardEnabled' | 'popupKeyboardLayout'>;

/**
 * True indexed PFD user settings for an indexed PFD.
 */
type PfdIndexedUserSettingTypes<Index extends number> = {
  [Name in keyof PfdAliasedIndexedUserSettingTypes as `${Name}_${Index}`]: PfdAliasedUserSettingTypes[Name];
};

/**
 * All true PFD user settings.
 */
export type PfdAllUserSettingTypes = PfdIndexedUserSettingTypes<number> & PfdNonIndexedUserSettingTypes;


/**
 * A manager for PFD user settings. The indexed settings are saved in crew profiles, while non-indexed settings are temporal.
 */
export class PfdUserSettingManager implements UserSettingManager<PfdAllUserSettingTypes> {
  private static readonly INDEXED_SETTING_NAMES: readonly (keyof PfdAliasedIndexedUserSettingTypes)[] = [
    'hsiRange',
    'hsiDisplayFormat',
    'terrWxState',
    'trafficEnabled',
    'lightningEnabled',
    'syntheticVisionEnabled'
  ];

  private readonly manager: DefaultUserSettingManager<PfdAllUserSettingTypes>;

  private readonly aliasedManagers: UserSettingManager<PfdAliasedUserSettingTypes>[] = [];

  /**
   * Constructor.
   * @param bus The event bus.
   * @param displayIndices The indices of the Displays for which to get a manager.
   */
  constructor(bus: EventBus, public readonly displayIndices: DisplayUnitIndices[]) {
    const settingDefs: UserSettingDefinition<any>[] = [];

    for (let i = 0; i < displayIndices.length; i++) {
      settingDefs.push(...PfdUserSettingManager.getIndexedSettingDefs(displayIndices[i]));
    }
    settingDefs.push(...PfdUserSettingManager.getNonIndexedSettingDefs());

    this.manager = new DefaultUserSettingManager(bus, settingDefs);

    for (let i = 0; i < displayIndices.length; i++) {
      this.aliasedManagers[displayIndices[i]] = this.manager.mapTo(PfdUserSettingManager.getAliasMap(displayIndices[i]));
    }
  }

  /** @inheritdoc */
  public tryGetSetting<K extends string>(name: K): K extends keyof PfdAllUserSettingTypes ? UserSetting<PfdAllUserSettingTypes[K]> : undefined {
    return this.manager.tryGetSetting(name) as any;
  }

  /** @inheritdoc */
  public getSetting<K extends keyof PfdAllUserSettingTypes & string>(name: K): UserSetting<NonNullable<PfdAllUserSettingTypes[K]>> {
    return this.manager.getSetting(name);
  }

  /** @inheritdoc */
  public whenSettingChanged<K extends keyof PfdAllUserSettingTypes & string>(name: K): Consumer<NonNullable<PfdAllUserSettingTypes[K]>> {
    return this.manager.whenSettingChanged(name);
  }

  /** @inheritdoc */
  public getAllSettings(): UserSetting<UserSettingValue>[] {
    return this.manager.getAllSettings();
  }

  /** @inheritdoc */
  public mapTo<M extends UserSettingRecord>(map: UserSettingMap<M, PfdAllUserSettingTypes>): UserSettingManager<M & PfdAllUserSettingTypes> {
    return this.manager.mapTo(map);
  }

  /**
   * Gets a manager for aliased PFD user settings for an indexed GDU.
   * @param displayIndex The index of the GDU for which to get an aliased setting manager.
   * @returns A manager for aliased PFD user settings for the specified GDU.
   * @throws RangeError if `index` is less than 1 or greater than the number of GDUs supported by this manager.
   */
  public getAliasedManager(displayIndex: DisplayUnitIndices): UserSettingManager<PfdAliasedUserSettingTypes> {
    if (!this.displayIndices.includes(displayIndex)) {
      throw new RangeError();
    }

    return this.aliasedManagers[displayIndex];
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
    const values = PfdUserSettingManager.getNonIndexedDefaultValues();
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
      'hsiRange': 50,
      'hsiDisplayFormat': HsiDisplayFormat.Partial,
      'terrWxState': 'OFF',
      'trafficEnabled': true,
      'lightningEnabled': false,
      'syntheticVisionEnabled': false
    };
  }

  /**
   * Gets the default values for all non-indexed PFD settings.
   * @returns The default values for all non-indexed PFD settings.
   */
  private static getNonIndexedDefaultValues(): PfdNonIndexedUserSettingTypes {
    return {
      'popupKeyboardEnabled': true,
      'popupKeyboardLayout': PopupKeyboardLayout.Abc,
      'windFormat': WindFormat.Xy,
      'headingFormat': HeadingFormat.Magnetic,
      'baroCorrectionUnit': BaroCorrectionUnit.In,
      'altMetric': false,
      'baroSynchEnabled': true,
      'flightDirectorMode': FlightDirectorMode.SCue,
      'thrustDirectorEnabled': true,
      'fpsEnabled': true,
    };
  }

  /**
   * Gets a setting name alias mapping for a GDU.
   * @param index The index of the GDU.
   * @returns A setting name alias mapping for the specified GDU.
   */
  private static getAliasMap<Index extends number>(
    index: Index
  ): UserSettingMap<PfdAliasedUserSettingTypes, PfdIndexedUserSettingTypes<Index>> {
    const map: UserSettingMap<PfdAliasedUserSettingTypes, PfdIndexedUserSettingTypes<Index>> = {};

    for (const name of PfdUserSettingManager.INDEXED_SETTING_NAMES) {
      map[name] = `${name}_${index}`;
    }

    return map;
  }
}
