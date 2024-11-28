import {
  Consumer, DefaultUserSettingManager, EventBus, UserSetting, UserSettingDefinition, UserSettingManager,
  UserSettingMap, UserSettingRecord, UserSettingValue
} from '@microsoft/msfs-sdk';

import { GduDefsConfig } from '../AvionicsConfig/GduDefsConfig';
import { SensorsConfig } from '../AvionicsConfig/SensorsConfig';
import { PfdIndex } from '../CommonTypes';

/**
 * Aliased PFD sensors user settings.
 */
export type PfdSensorsUserSettingTypes = {
  /** The index of the ADC used by a PFD. */
  pfdAdcIndex: number;

  /** The index of the AHRS used by a PFD. */
  pfdAhrsIndex: number;
};

/**
 * All true PFD sensors user settings.
 */
export type PfdSensorsAllUserSettingTypes = {
  [Name in keyof PfdSensorsUserSettingTypes as `${Name}_${PfdIndex}`]: PfdSensorsUserSettingTypes[Name];
};

/**
 * A manager for PFD sensors user settings.
 */
export class PfdSensorsUserSettingManager implements UserSettingManager<PfdSensorsAllUserSettingTypes> {
  private static readonly INDEXED_SETTING_NAMES: readonly (keyof PfdSensorsUserSettingTypes)[] = [
    'pfdAdcIndex',
    'pfdAhrsIndex'
  ];

  /** The number of PFDs supported by this manager. */
  public readonly pfdCount: 1 | 2;

  private readonly manager: DefaultUserSettingManager<PfdSensorsAllUserSettingTypes>;

  private readonly aliasedManagers: UserSettingManager<PfdSensorsUserSettingTypes>[] = [];

  /**
   * Creates a new instance of PfdSensorsUserSettingManager.
   * @param bus The event bus.
   * @param gduDefsConfig A configuration object which defines GDU options.
   * @param sensorsConfig A configuration object which defines sensors options.
   */
  public constructor(bus: EventBus, gduDefsConfig: GduDefsConfig, sensorsConfig: SensorsConfig) {
    const settingDefs: UserSettingDefinition<any>[] = [];

    this.pfdCount = gduDefsConfig.pfdCount;

    for (let i = 1; i <= this.pfdCount; i++) {
      const def = gduDefsConfig.pfds[i];
      const adcIndexOffset = (i - 1) * sensorsConfig.adcCount;
      settingDefs.push(
        {
          name: `pfdAdcIndex_${i}`,
          defaultValue: adcIndexOffset + def.defaultAdcIndex
        },
        {
          name: `pfdAhrsIndex_${i}`,
          defaultValue: def.defaultAhrsIndex
        },
      );
    }

    this.manager = new DefaultUserSettingManager(bus, settingDefs);

    for (let i = 1; i <= this.pfdCount; i++) {
      this.aliasedManagers[i] = this.manager.mapTo(PfdSensorsUserSettingManager.getAliasMap(i as PfdIndex));
    }
  }

  /** @inheritdoc */
  public tryGetSetting<K extends string>(name: K): K extends keyof PfdSensorsAllUserSettingTypes ? UserSetting<PfdSensorsAllUserSettingTypes[K]> : undefined {
    return this.manager.tryGetSetting(name) as any;
  }

  /** @inheritdoc */
  public getSetting<K extends keyof PfdSensorsAllUserSettingTypes & string>(name: K): UserSetting<NonNullable<PfdSensorsAllUserSettingTypes[K]>> {
    return this.manager.getSetting(name);
  }

  /** @inheritdoc */
  public whenSettingChanged<K extends keyof PfdSensorsAllUserSettingTypes & string>(name: K): Consumer<NonNullable<PfdSensorsAllUserSettingTypes[K]>> {
    return this.manager.whenSettingChanged(name);
  }

  /** @inheritdoc */
  public getAllSettings(): UserSetting<UserSettingValue>[] {
    return this.manager.getAllSettings();
  }

  /** @inheritdoc */
  public mapTo<M extends UserSettingRecord>(map: UserSettingMap<M, PfdSensorsAllUserSettingTypes>): UserSettingManager<M & PfdSensorsAllUserSettingTypes> {
    return this.manager.mapTo(map);
  }

  /**
   * Gets a manager for aliased IAU user settings for an indexed IAU.
   * @param index The index of the IAU for which to get an aliased setting manager.
   * @returns A manager for aliased IAU user settings for the specified IAU.
   * @throws RangeError if `index` is less than 1 or greater than the number of IAUs supported by this manager.
   */
  public getAliasedManager(index: PfdIndex): UserSettingManager<PfdSensorsUserSettingTypes> {
    if (index < 1 || index > this.pfdCount) {
      throw new RangeError();
    }

    return this.aliasedManagers[index];
  }

  /**
   * Gets a setting name alias mapping for an IAU.
   * @param index The index of the IAU.
   * @returns A setting name alias mapping for the specified IAU.
   */
  private static getAliasMap(index: PfdIndex): UserSettingMap<PfdSensorsUserSettingTypes, PfdSensorsAllUserSettingTypes> {
    const map: UserSettingMap<PfdSensorsUserSettingTypes, PfdSensorsAllUserSettingTypes> = {};

    for (const name of PfdSensorsUserSettingManager.INDEXED_SETTING_NAMES) {
      map[name] = `${name}_${index}` as const;
    }

    return map;
  }
}
