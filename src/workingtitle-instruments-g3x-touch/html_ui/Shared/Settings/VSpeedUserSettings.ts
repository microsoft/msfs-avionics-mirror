import {
  Consumer, DefaultUserSettingManager, EventBus, UserSetting, UserSettingDefinition, UserSettingManager,
  UserSettingMap, UserSettingRecord, UserSettingValue
} from '@microsoft/msfs-sdk';

import { VSpeedUserSettingTypes } from '@microsoft/msfs-garminsdk';
import { VSpeedDefinition } from '../VSpeed/VSpeed';

/**
 * True G3X Touch reference V-speed user settings.
 */
export type G3XVSpeedTrueUserSettingTypes = {
  [P in keyof VSpeedUserSettingTypes as `${P}_g3x`]: VSpeedUserSettingTypes[P];
};

/**
 * A manager for reference V-speed user settings.
 */
export class VSpeedUserSettingManager implements UserSettingManager<VSpeedUserSettingTypes> {
  /** An map of groups (keyed on group type) containing the reference V-speeds for which this manager contains settings. */
  public readonly vSpeedDefs: readonly VSpeedDefinition[];

  private readonly manager: DefaultUserSettingManager<G3XVSpeedTrueUserSettingTypes>;
  private readonly aliasedManager: UserSettingManager<VSpeedUserSettingTypes>;

  /**
   * Creates a new instance of VSpeedUserSettingManager.
   * @param bus The event bus.
   * @param vSpeedDefs Definitions for each reference V-speed for which to create settings.
   */
  public constructor(bus: EventBus, vSpeedDefs: readonly VSpeedDefinition[]) {
    this.vSpeedDefs = vSpeedDefs.slice();
    const settingDefs: UserSettingDefinition<any>[] = [];
    const aliasMap: UserSettingMap<VSpeedUserSettingTypes, G3XVSpeedTrueUserSettingTypes> = {};

    for (const vSpeed of this.vSpeedDefs) {
      const showNameAliased = `vSpeedShow_${vSpeed.name}` as const;
      const defaultValueNameAliased = `vSpeedDefaultValue_${vSpeed.name}` as const;
      const userValueNameAliased = `vSpeedUserValue_${vSpeed.name}` as const;
      const fmsValueNameAliased = `vSpeedFmsValue_${vSpeed.name}` as const;
      const fmsConfigMiscompareNameAliased = `vSpeedFmsConfigMiscompare_${vSpeed.name}` as const;

      const showName = `${showNameAliased}_g3x` as const;
      const defaultValueName = `${defaultValueNameAliased}_g3x` as const;
      const userValueName = `${userValueNameAliased}_g3x` as const;
      const fmsValueName = `${fmsValueNameAliased}_g3x` as const;
      const fmsConfigMiscompareName = `${fmsConfigMiscompareNameAliased}_g3x` as const;

      settingDefs.push(
        {
          name: showName,
          defaultValue: true
        },
        {
          name: defaultValueName,
          defaultValue: vSpeed.defaultValue
        },
        {
          name: userValueName,
          defaultValue: -1
        },
        {
          name: fmsValueName,
          defaultValue: -1
        },
        {
          name: fmsConfigMiscompareName,
          defaultValue: false
        }
      );

      aliasMap[showNameAliased] = showName;
      aliasMap[defaultValueNameAliased] = defaultValueName;
      aliasMap[userValueNameAliased] = userValueName;
      aliasMap[fmsValueNameAliased] = fmsValueName;
      aliasMap[fmsConfigMiscompareNameAliased] = fmsConfigMiscompareName;
    }

    this.manager = new DefaultUserSettingManager(bus, settingDefs, true);
    this.aliasedManager = this.manager.mapTo(aliasMap);
  }

  /** @inheritDoc */
  public tryGetSetting<K extends string>(name: K): K extends keyof VSpeedUserSettingTypes ? UserSetting<VSpeedUserSettingTypes[K]> : undefined {
    return this.aliasedManager.tryGetSetting(name) as any;
  }

  /** @inheritDoc */
  public getSetting<K extends keyof VSpeedUserSettingTypes & string>(name: K): UserSetting<NonNullable<VSpeedUserSettingTypes[K]>> {
    return this.aliasedManager.getSetting(name);
  }

  /** @inheritDoc */
  public whenSettingChanged<K extends keyof VSpeedUserSettingTypes & string>(name: K): Consumer<NonNullable<VSpeedUserSettingTypes[K]>> {
    return this.aliasedManager.whenSettingChanged(name);
  }

  /** @inheritDoc */
  public getAllSettings(): UserSetting<UserSettingValue>[] {
    return this.manager.getAllSettings();
  }

  /** @inheritDoc */
  public mapTo<M extends UserSettingRecord>(map: UserSettingMap<M, VSpeedUserSettingTypes>): UserSettingManager<M & VSpeedUserSettingTypes> {
    return this.aliasedManager.mapTo(map);
  }
}