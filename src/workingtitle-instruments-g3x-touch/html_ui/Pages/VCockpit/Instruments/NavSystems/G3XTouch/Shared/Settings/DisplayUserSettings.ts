import { Consumer, DefaultUserSettingManager, EventBus, UserSetting, UserSettingDefinition, UserSettingManager, UserSettingMap, UserSettingRecord, UserSettingValue } from '@microsoft/msfs-sdk';

import { UiViewKeys } from '../UiSystem/UiViewKeys';

/**
 * Display screen side user setting modes.
 */
export enum DisplayScreenSideSettingMode {
  Left = 'Left',
  Right = 'Right'
}

/**
 * Display location user setting modes.
 */
export enum DisplayLocationSettingMode {
  MFD = 'MFD',
  PFD = 'PFD',
  Both = 'Both'
}

/**
 * Display user settings.
 */
export type DisplayUserSettingTypes = {
  /** Whether to initialize to split screen mode on start-up. */
  displayStartupSplitMode: boolean;

  /** Whether to support toggling split screen mode with the Back key. */
  displayToggleSplitWithBack: boolean;

  /** The screen side on which the PFD pane is located. */
  displayPfdPaneSide: DisplayScreenSideSettingMode;

  /** The key of the page to display on the PFD pane when the GDU is operating as an MFD and is in split screen mode. */
  displayMfdSplitScreenPageKey: string;

  /** The instrument types on which the EIS is displayed. */
  displayEisLocation: DisplayLocationSettingMode;

  /** The screen side on which the EIS display is located. */
  displayEisScreenSide: DisplayScreenSideSettingMode;

  /** The instrument types on which the CNS data bar COM radio buttons are displayed. */
  displayComRadioLocation: DisplayLocationSettingMode;

  /** The instrument types on which the CNS data bar NAV radio buttons are displayed. */
  displayNavRadioLocation: DisplayLocationSettingMode;

  /** The instrument types on which the CNS data bar audio panel button is displayed. */
  displayAudioPanelLocation: DisplayLocationSettingMode;

  /** The instrument types on which the CNS data bar transponder button is displayed. */
  displayTransponderLocation: DisplayLocationSettingMode;

  /** Whether to show on-screen zoom buttons on maps and charts. */
  displayMapZoomButtonShow: boolean;

  /** Whether to the reverse the direction of zooming when using the bezel rotary knobs. */
  displayKnobZoomReverse: boolean;
};

/**
 * Aliased non-indexed display user settings.
 */
type DisplayAliasedNonIndexedUserSettingTypes = Pick<
  DisplayUserSettingTypes,
  'displayEisLocation' | 'displayComRadioLocation' | 'displayNavRadioLocation' | 'displayAudioPanelLocation'
  | 'displayTransponderLocation'
>;

/**
 * Aliased indexed display user settings.
 */
type DisplayAliasedIndexedUserSettingTypes = Omit<DisplayUserSettingTypes, keyof DisplayAliasedNonIndexedUserSettingTypes>;

/**
 * True non-indexed display user settings.
 */
type DisplayNonIndexedUserSettingTypes = {
  [Name in keyof DisplayAliasedNonIndexedUserSettingTypes as `${Name}_g3x`]: DisplayAliasedNonIndexedUserSettingTypes[Name];
};

/**
 * True indexed display user settings for an indexed GDU.
 */
type DisplayIndexedUserSettingTypes<Index extends number> = {
  [Name in keyof DisplayAliasedIndexedUserSettingTypes as `${Name}_${Index}_g3x`]: DisplayUserSettingTypes[Name];
};

/**
 * All true display user settings.
 */
export type DisplayAllUserSettingTypes = DisplayIndexedUserSettingTypes<number> & DisplayNonIndexedUserSettingTypes;

/**
 * A manager for display user settings.
 */
export class DisplayUserSettingManager implements UserSettingManager<DisplayAllUserSettingTypes> {
  private static readonly NON_INDEXED_SETTING_NAMES
    = Object.keys(DisplayUserSettingManager.getNonIndexedDefaultValues()) as readonly (keyof DisplayAliasedNonIndexedUserSettingTypes)[];

  private static readonly INDEXED_SETTING_NAMES
    = Object.keys(DisplayUserSettingManager.getIndexedDefaultValues()) as readonly (keyof DisplayAliasedIndexedUserSettingTypes)[];

  private readonly manager: DefaultUserSettingManager<DisplayAllUserSettingTypes>;

  private readonly aliasedManagers: UserSettingManager<DisplayUserSettingTypes>[] = [];

  /**
   * Creates a new instance of DisplayUserSettingManager.
   * @param bus The event bus.
   * @param gduCount The number of GDUs supported by this manager.
   */
  public constructor(bus: EventBus, public readonly gduCount: number) {
    const settingDefs: UserSettingDefinition<any>[] = [];

    for (let i = 1; i <= gduCount; i++) {
      settingDefs.push(...DisplayUserSettingManager.getIndexedSettingDefs(i));
    }
    settingDefs.push(...DisplayUserSettingManager.getNonIndexedSettingDefs());

    this.manager = new DefaultUserSettingManager(bus, settingDefs);

    for (let i = 1; i <= gduCount; i++) {
      this.aliasedManagers[i] = this.manager.mapTo(DisplayUserSettingManager.getAliasMap(i));
    }
  }

  /** @inheritDoc */
  public tryGetSetting<K extends string>(name: K): K extends keyof DisplayAllUserSettingTypes ? UserSetting<DisplayAllUserSettingTypes[K]> : undefined {
    return this.manager.tryGetSetting(name) as any;
  }

  /** @inheritDoc */
  public getSetting<K extends keyof DisplayAllUserSettingTypes & string>(name: K): UserSetting<NonNullable<DisplayAllUserSettingTypes[K]>> {
    return this.manager.getSetting(name);
  }

  /** @inheritDoc */
  public whenSettingChanged<K extends keyof DisplayAllUserSettingTypes & string>(name: K): Consumer<NonNullable<DisplayAllUserSettingTypes[K]>> {
    return this.manager.whenSettingChanged(name);
  }

  /** @inheritDoc */
  public getAllSettings(): UserSetting<UserSettingValue>[] {
    return this.manager.getAllSettings();
  }

  /** @inheritDoc */
  public mapTo<M extends UserSettingRecord>(map: UserSettingMap<M, DisplayAllUserSettingTypes>): UserSettingManager<M & DisplayAllUserSettingTypes> {
    return this.manager.mapTo(map);
  }

  /**
   * Gets a manager for aliased display user settings for an indexed GDU.
   * @param index The index of the GDU for which to get an aliased setting manager.
   * @returns A manager for aliased display user settings for the specified GDU.
   * @throws RangeError if `index` is less than 1 or greater than the number of GDUs supported by this manager.
   */
  public getAliasedManager(index: number): UserSettingManager<DisplayUserSettingTypes> {
    if (index < 1 || index > this.gduCount) {
      throw new RangeError();
    }

    return this.aliasedManagers[index];
  }

  /**
   * Gets an array of definitions for true display settings for a single GDU.
   * @param index The index of the GDU.
   * @returns An array of definitions for true display settings for the specified GDU.
   */
  private static getIndexedSettingDefs(
    index: number
  ): readonly UserSettingDefinition<DisplayIndexedUserSettingTypes<number>[keyof DisplayIndexedUserSettingTypes<number>]>[] {
    const values = DisplayUserSettingManager.getIndexedDefaultValues();
    return Object.keys(values).map(name => {
      return {
        name: `${name}_${index}_g3x`,
        defaultValue: values[name as keyof typeof values]
      };
    });
  }

  /**
   * Gets an array of definitions for non-indexed display settings.
   * @returns An array of definitions for non-indexed display settings.
   */
  private static getNonIndexedSettingDefs(): readonly UserSettingDefinition<DisplayNonIndexedUserSettingTypes[keyof DisplayNonIndexedUserSettingTypes]>[] {
    const values = DisplayUserSettingManager.getNonIndexedDefaultValues();
    return Object.keys(values).map(name => {
      return {
        name: `${name}_g3x`,
        defaultValue: values[name as keyof typeof values]
      };
    });
  }

  /**
   * Gets the default values for a full set of aliased indexed display settings.
   * @returns The default values for a full set of aliased indexed display settings.
   */
  private static getIndexedDefaultValues(): DisplayAliasedIndexedUserSettingTypes {
    return {
      'displayStartupSplitMode': false,
      'displayToggleSplitWithBack': true,
      'displayPfdPaneSide': DisplayScreenSideSettingMode.Left,
      'displayMfdSplitScreenPageKey': UiViewKeys.PfdInstruments,
      'displayEisScreenSide': DisplayScreenSideSettingMode.Left,
      'displayMapZoomButtonShow': true,
      'displayKnobZoomReverse': false
    };
  }

  /**
   * Gets the default values for all non-indexed display settings.
   * @returns The default values for all non-indexed display settings.
   */
  private static getNonIndexedDefaultValues(): DisplayAliasedNonIndexedUserSettingTypes {
    return {
      'displayEisLocation': DisplayLocationSettingMode.Both,
      'displayComRadioLocation': DisplayLocationSettingMode.Both,
      'displayNavRadioLocation': DisplayLocationSettingMode.Both,
      'displayAudioPanelLocation': DisplayLocationSettingMode.Both,
      'displayTransponderLocation': DisplayLocationSettingMode.Both
    };
  }

  /**
   * Gets a setting name alias mapping for a GDU.
   * @param index The index of the GDU.
   * @returns A setting name alias mapping for the specified GDU.
   */
  private static getAliasMap<Index extends number>(
    index: Index
  ): UserSettingMap<DisplayUserSettingTypes, DisplayIndexedUserSettingTypes<Index> & DisplayNonIndexedUserSettingTypes> {
    const map: UserSettingMap<DisplayUserSettingTypes, DisplayIndexedUserSettingTypes<Index> & DisplayNonIndexedUserSettingTypes> = {};

    for (const name of DisplayUserSettingManager.NON_INDEXED_SETTING_NAMES) {
      map[name] = `${name}_g3x`;
    }

    for (const name of DisplayUserSettingManager.INDEXED_SETTING_NAMES) {
      map[name] = `${name}_${index}_g3x`;
    }

    return map;
  }
}