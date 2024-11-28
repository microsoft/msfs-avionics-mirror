import {
  ComSpacing, Consumer, ControlEvents, DefaultUserSettingManager, EventBus, UserSetting, UserSettingDefinition, UserSettingManager, UserSettingMap,
  UserSettingRecord, UserSettingValue
} from '@microsoft/msfs-sdk';

export enum AdfMode {
  BFO,
  ANT,
  ADF,
}

export enum NavMode {
  BRG,
  RAD,
  STBY,
}

export enum XpdrSelectMode {
  XPDR1,
  XPDR2,
}

/** How the altitude of other traffic is depicted on the displays. */
export enum TcasRelativeAbsoluteMode {
  /** Shows the absolute altitude of other aircraft. */
  ABS,
  /** Altitudes of other traffic are displayed relative to aircraft altitude. */
  REL,
}

/** Type description for NAV/COM user settings. */
export type NavComAliasedUserSettingTypes = {
  /** The COM spacing setting. */
  comSpacing: ComSpacing;
  /** The ADF mode setting. */
  adfMode: AdfMode;
  /** The NAV mode setting. */
  navMode: NavMode;
  /** The XPDR Select mode setting. */
  xpdrSelectMode: XpdrSelectMode;
  /** The VFR transponder code in base-10/decimal. */
  // TODO save persistently
  vfrCode: number;
  /**
   * Whether the DME pairing is swapped.
   * In dual DME installations this means DME1 is associated with NAV2 and DME2 with NAV1.
   * In single DME installations it means the DME is associated with NAV2 rather than NAV1.
   */
  dmePairSwapped: boolean;
  /** Whether DME hold is on for DME1. */
  dme1HoldOn: boolean;
  /** Whether DME hold is on for DME2 (for dual DME installations). */
  dme2HoldOn: boolean;
}

/** Type description NAV/COM user settings. */
export type NavComNonIndexedUserSettingTypes = Pick<NavComAliasedUserSettingTypes, 'adfMode' | 'xpdrSelectMode' | 'vfrCode' | 'dmePairSwapped' | 'dme1HoldOn' | 'dme2HoldOn'>

/** Aliased indexed NAV/COM user settings. */
export type NavComAliasedIndexedUserSettingTypes = Omit<NavComAliasedUserSettingTypes, 'adfMode' | 'xpdrSelectMode' | 'vfrCode' | 'dmePairSwapped' | 'dme1HoldOn' | 'dme2HoldOn'>;

/** True indexed NAV/COM user settings for an indexed setting. */
export type NavComIndexedUserSettingTypes<Index extends number> = {
  [Name in keyof NavComAliasedIndexedUserSettingTypes as `${Name}_${Index}`]: NavComAliasedUserSettingTypes[Name];
};

/** All true NAV/COM user settings. */
export type NavComAllUserSettingTypes = NavComIndexedUserSettingTypes<number> & NavComNonIndexedUserSettingTypes;

/** Utility class for retrieving NAV/COM user setting managers. */
export class NavComUserSettingManager {

  private readonly manager: DefaultUserSettingManager<NavComAllUserSettingTypes>;

  /**
   * Constructor.
   * @param bus The event bus.
   * @param maxIndex The number of indexed versions of a setting supported by this manager.
   */
  constructor(private readonly bus: EventBus, maxIndex: number) {
    const settingDefs: UserSettingDefinition<any>[] = [];

    settingDefs.push(...NavComUserSettingManager.getNonIndexedSettingDefs());
    for (let i = 1; i <= maxIndex; i++) {
      settingDefs.push(...NavComUserSettingManager.getIndexedSettingDefs(i));
    }

    this.manager = new DefaultUserSettingManager(this.bus, settingDefs);

    this.manager.whenSettingChanged('comSpacing_1').handle((spacing: ComSpacing) => {
      const pub = this.bus.getPublisher<ControlEvents>();
      pub.pub('com_spacing_set', { index: 1, spacing: spacing }, true, false);
    });

    this.manager.whenSettingChanged('comSpacing_2').handle((spacing: ComSpacing) => {
      const pub = this.bus.getPublisher<ControlEvents>();
      pub.pub('com_spacing_set', { index: 2, spacing: spacing }, true, false);
    });
  }

  /** @inheritdoc */
  public tryGetSetting<K extends string>(name: K): K extends keyof NavComAllUserSettingTypes ? UserSetting<NavComAllUserSettingTypes[K]> : undefined {
    return this.manager.tryGetSetting(name) as any;
  }

  /** @inheritdoc */
  public getSetting<K extends keyof NavComAllUserSettingTypes & string>(name: K): UserSetting<NonNullable<NavComAllUserSettingTypes[K]>> {
    return this.manager.getSetting(name);
  }

  /** @inheritdoc */
  public whenSettingChanged<K extends keyof NavComAllUserSettingTypes & string>(name: K): Consumer<NonNullable<NavComAllUserSettingTypes[K]>> {
    return this.manager.whenSettingChanged(name);
  }

  /** @inheritdoc */
  public getAllSettings(): UserSetting<UserSettingValue>[] {
    return this.manager.getAllSettings();
  }

  /** @inheritdoc */
  public mapTo<M extends UserSettingRecord>(map: UserSettingMap<M, NavComAllUserSettingTypes>): UserSettingManager<M & NavComAllUserSettingTypes> {
    return this.manager.mapTo(map);
  }

  /**
   * Gets an array of definitions for true PFD settings for a single GDU.
   * @param index The index of the PFD.
   * @returns An array of definitions for true PFD settings for the specified GDU.
   */
  private static getIndexedSettingDefs(
    index: number
  ): readonly UserSettingDefinition<NavComIndexedUserSettingTypes<number>[keyof NavComIndexedUserSettingTypes<number>]>[] {
    const values = NavComUserSettingManager.getIndexedDefaultValues();
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
  ): readonly UserSettingDefinition<NavComNonIndexedUserSettingTypes[keyof NavComNonIndexedUserSettingTypes]>[] {
    const values = NavComUserSettingManager.getNonIndexedDefaultValues();
    return Object.keys(values).map(name => {
      return {
        name,
        defaultValue: values[name as keyof typeof values]
      };
    });
  }

  /**
   * Gets the non-indexed default values for all non-indexed NavCom settings.
   * @returns The non-indexed default values for all non-indexed NavCom settings.
   */
  private static getNonIndexedDefaultValues(): NavComNonIndexedUserSettingTypes {
    return {
      'adfMode': AdfMode.ADF,
      'xpdrSelectMode': XpdrSelectMode.XPDR1,
      'vfrCode': parseInt('1200', 8),
      'dmePairSwapped': false,
      'dme1HoldOn': false,
      'dme2HoldOn': false,
    };
  }

  /**
   * Gets the indexed default values for all indexed NavCom settings.
   * @returns The indexed default values for all indexed NavCom settings.
   */
  private static getIndexedDefaultValues(): NavComAliasedIndexedUserSettingTypes {
    return {
      'comSpacing': ComSpacing.Spacing833Khz,
      'navMode': NavMode.STBY,
    };
  }
}
