import { Consumer, DefaultUserSettingManager, EventBus, UserSetting, UserSettingDefinition, UserSettingManager, UserSettingMap, UserSettingRecord, UserSettingValue } from '@microsoft/msfs-sdk';
import { IauDefsConfig } from '../AvionicsConfig/IauDefsConfig';

/**
 * IAU user settings.
 */
export type IauUserSettingTypes = {
  /** The index of the ADC used by an IAU. */
  iauAdcIndex: number;

  /** The index of the AHRS used by an IAU. */
  iauAhrsIndex: number;
};

/**
 * All true IAU user settings.
 */
export type IauAllUserSettingTypes = {
  [Name in keyof IauUserSettingTypes as `${Name}_${number}`]: IauUserSettingTypes[Name];
};

/**
 * A manager for IAU user settings.
 */
export class IauUserSettingManager implements UserSettingManager<IauAllUserSettingTypes> {
  private static readonly INDEXED_SETTING_NAMES: readonly (keyof IauUserSettingTypes)[] = [
    'iauAdcIndex',
    'iauAhrsIndex'
  ];

  /** The number of IAUs supported by this manager. */
  public readonly iauCount: number;

  private readonly manager: DefaultUserSettingManager<IauAllUserSettingTypes>;

  private readonly aliasedManagers: UserSettingManager<IauUserSettingTypes>[] = [];

  /**
   * Constructor.
   * @param bus The event bus.
   * @param iauDefsConfig A configuration object which defines IAU options.
   */
  constructor(bus: EventBus, iauDefsConfig: IauDefsConfig) {
    const settingDefs: UserSettingDefinition<any>[] = [];

    this.iauCount = iauDefsConfig.count;

    for (let i = 1; i <= iauDefsConfig.count; i++) {
      const def = iauDefsConfig.definitions[i];
      settingDefs.push(
        {
          name: `iauAdcIndex_${i}`,
          defaultValue: def.defaultAdcIndex
        },
        {
          name: `iauAhrsIndex_${i}`,
          defaultValue: def.defaultAhrsIndex
        },
      );
    }

    this.manager = new DefaultUserSettingManager(bus, settingDefs);

    for (let i = 1; i <= iauDefsConfig.count; i++) {
      this.aliasedManagers[i] = this.manager.mapTo(IauUserSettingManager.getAliasMap(i));
    }
  }

  /** @inheritdoc */
  public tryGetSetting<K extends string>(name: K): K extends keyof IauAllUserSettingTypes ? UserSetting<IauAllUserSettingTypes[K]> : undefined {
    return this.manager.tryGetSetting(name) as any;
  }

  /** @inheritdoc */
  public getSetting<K extends keyof IauAllUserSettingTypes & string>(name: K): UserSetting<NonNullable<IauAllUserSettingTypes[K]>> {
    return this.manager.getSetting(name);
  }

  /** @inheritdoc */
  public whenSettingChanged<K extends keyof IauAllUserSettingTypes & string>(name: K): Consumer<NonNullable<IauAllUserSettingTypes[K]>> {
    return this.manager.whenSettingChanged(name);
  }

  /** @inheritdoc */
  public getAllSettings(): UserSetting<UserSettingValue>[] {
    return this.manager.getAllSettings();
  }

  /** @inheritdoc */
  public mapTo<M extends UserSettingRecord>(map: UserSettingMap<M, IauAllUserSettingTypes>): UserSettingManager<M & IauAllUserSettingTypes> {
    return this.manager.mapTo(map);
  }

  /**
   * Gets a manager for aliased IAU user settings for an indexed IAU.
   * @param index The index of the IAU for which to get an aliased setting manager.
   * @returns A manager for aliased IAU user settings for the specified IAU.
   * @throws RangeError if `index` is less than 1 or greater than the number of IAUs supported by this manager.
   */
  public getAliasedManager(index: number): UserSettingManager<IauUserSettingTypes> {
    if (index < 1 || index > this.iauCount) {
      throw new RangeError();
    }

    return this.aliasedManagers[index];
  }

  /**
   * Gets a setting name alias mapping for an IAU.
   * @param index The index of the IAU.
   * @returns A setting name alias mapping for the specified IAU.
   */
  private static getAliasMap(index: number): UserSettingMap<IauUserSettingTypes, IauAllUserSettingTypes> {
    const map: UserSettingMap<IauUserSettingTypes, IauAllUserSettingTypes> = {};

    for (const name of IauUserSettingManager.INDEXED_SETTING_NAMES) {
      map[name] = `${name}_${index}`;
    }

    return map;
  }
}