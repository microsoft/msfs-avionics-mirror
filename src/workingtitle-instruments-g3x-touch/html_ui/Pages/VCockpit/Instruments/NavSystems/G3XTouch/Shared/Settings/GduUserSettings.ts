import { Consumer, DefaultUserSettingManager, EventBus, UserSetting, UserSettingDefinition, UserSettingManager, UserSettingMap, UserSettingRecord, UserSettingValue } from '@microsoft/msfs-sdk';
import { GduDefsConfig } from '../AvionicsConfig/GduDefsConfig';

/**
 * GDU user settings.
 */
export type GduUserSettingTypes = {
  /** The index of the ADC used by a GDU. */
  gduAdcIndex: number;

  /** The index of the AHRS used by a GDU. */
  gduAhrsIndex: number;
};

/**
 * All true GDU user settings.
 */
export type GduAllUserSettingTypes = {
  [Name in keyof GduUserSettingTypes as `${Name}_${number}_g3x`]: GduUserSettingTypes[Name];
};

/**
 * A manager for GDU user settings.
 */
export class GduUserSettingManager implements UserSettingManager<GduAllUserSettingTypes> {
  private static readonly INDEXED_SETTING_NAMES: readonly (keyof GduUserSettingTypes)[] = [
    'gduAdcIndex',
    'gduAhrsIndex'
  ];

  /** The number of GDUs supported by this manager. */
  public readonly gduCount: number;

  private readonly manager: DefaultUserSettingManager<GduAllUserSettingTypes>;

  private readonly aliasedManagers: UserSettingManager<GduUserSettingTypes>[] = [];

  /**
   * Creates a new instance of GduUserSettingManager.
   * @param bus The event bus.
   * @param gduDefsConfig A configuration object which defines GDU options.
   */
  public constructor(bus: EventBus, gduDefsConfig: GduDefsConfig) {
    const settingDefs: UserSettingDefinition<any>[] = [];

    this.gduCount = gduDefsConfig.count;

    for (let i = 1; i <= gduDefsConfig.count; i++) {
      const def = gduDefsConfig.definitions[i];
      settingDefs.push(
        {
          name: `gduAdcIndex_${i}_g3x`,
          defaultValue: def.defaultAdcIndex
        },
        {
          name: `gduAhrsIndex_${i}_g3x`,
          defaultValue: def.defaultAhrsIndex
        },
      );
    }

    this.manager = new DefaultUserSettingManager(bus, settingDefs);

    for (let i = 1; i <= gduDefsConfig.count; i++) {
      this.aliasedManagers[i] = this.manager.mapTo(GduUserSettingManager.getAliasMap(i));
    }
  }

  /** @inheritDoc */
  public tryGetSetting<K extends string>(name: K): K extends keyof GduAllUserSettingTypes ? UserSetting<GduAllUserSettingTypes[K]> : undefined {
    return this.manager.tryGetSetting(name) as any;
  }

  /** @inheritDoc */
  public getSetting<K extends keyof GduAllUserSettingTypes & string>(name: K): UserSetting<NonNullable<GduAllUserSettingTypes[K]>> {
    return this.manager.getSetting(name);
  }

  /** @inheritDoc */
  public whenSettingChanged<K extends keyof GduAllUserSettingTypes & string>(name: K): Consumer<NonNullable<GduAllUserSettingTypes[K]>> {
    return this.manager.whenSettingChanged(name);
  }

  /** @inheritDoc */
  public getAllSettings(): UserSetting<UserSettingValue>[] {
    return this.manager.getAllSettings();
  }

  /** @inheritDoc */
  public mapTo<M extends UserSettingRecord>(map: UserSettingMap<M, GduAllUserSettingTypes>): UserSettingManager<M & GduAllUserSettingTypes> {
    return this.manager.mapTo(map);
  }

  /**
   * Gets a manager for aliased GDU user settings for an indexed GDU.
   * @param index The index of the GDU for which to get an aliased setting manager.
   * @returns A manager for aliased GDU user settings for the specified GDU.
   * @throws RangeError if `index` is less than 1 or greater than the number of GDUs supported by this manager.
   */
  public getAliasedManager(index: number): UserSettingManager<GduUserSettingTypes> {
    if (index < 1 || index > this.gduCount) {
      throw new RangeError();
    }

    return this.aliasedManagers[index];
  }

  /**
   * Gets a setting name alias mapping for an GDU.
   * @param index The index of the GDU.
   * @returns A setting name alias mapping for the specified GDU.
   */
  private static getAliasMap(index: number): UserSettingMap<GduUserSettingTypes, GduAllUserSettingTypes> {
    const map: UserSettingMap<GduUserSettingTypes, GduAllUserSettingTypes> = {};

    for (const name of GduUserSettingManager.INDEXED_SETTING_NAMES) {
      map[name] = `${name}_${index}_g3x`;
    }

    return map;
  }
}