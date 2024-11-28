import {
  Consumer, DefaultUserSettingManager, EventBus, UserSetting, UserSettingDefinition, UserSettingManager,
  UserSettingMap, UserSettingRecord, UserSettingValue
} from '@microsoft/msfs-sdk';

import { VSpeedUserSettingTypes } from '@microsoft/msfs-garminsdk';
import { VSpeedGroup } from './VSpeed';

/**
 * A manager for reference V-speed user settings.
 */
export class VSpeedUserSettingManager implements UserSettingManager<VSpeedUserSettingTypes> {
  /** An map of groups (keyed on group type) containing the reference V-speeds for which this manager contains settings. */
  public readonly vSpeedGroups: ReadonlyMap<string, VSpeedGroup>;

  private readonly manager: DefaultUserSettingManager<VSpeedUserSettingTypes>;

  /**
   * Creates a new instance of VSpeedUserSettingManager.
   * @param bus The event bus.
   * @param vSpeedGroups Definitions for each reference V-speed for which to create settings, organized into groups.
   */
  public constructor(bus: EventBus, vSpeedGroups: ReadonlyMap<string, VSpeedGroup>) {
    const groupsCopy = new Map<string, VSpeedGroup>();
    const settingDefs: UserSettingDefinition<any>[] = [];

    for (const group of vSpeedGroups.values()) {
      groupsCopy.set(group.name, {
        name: group.name,
        vSpeedDefinitions: Array.from(group.vSpeedDefinitions)
      });

      for (const vSpeed of group.vSpeedDefinitions) {
        settingDefs.push(
          {
            name: `vSpeedShow_${vSpeed.name}`,
            defaultValue: true
          },
          {
            name: `vSpeedDefaultValue_${vSpeed.name}`,
            defaultValue: vSpeed.defaultValue
          },
          {
            name: `vSpeedUserValue_${vSpeed.name}`,
            defaultValue: -1
          },
          {
            name: `vSpeedFmsValue_${vSpeed.name}`,
            defaultValue: -1
          },
          {
            name: `vSpeedFmsConfigMiscompare_${vSpeed.name}`,
            defaultValue: false
          }
        );
      }
    }

    this.vSpeedGroups = groupsCopy;
    this.manager = new DefaultUserSettingManager(bus, settingDefs);
  }

  /** @inheritdoc */
  public tryGetSetting<K extends string>(name: K): K extends keyof VSpeedUserSettingTypes ? UserSetting<VSpeedUserSettingTypes[K]> : undefined {
    return this.manager.tryGetSetting(name) as any;
  }

  /** @inheritdoc */
  public getSetting<K extends keyof VSpeedUserSettingTypes & string>(name: K): UserSetting<NonNullable<VSpeedUserSettingTypes[K]>> {
    return this.manager.getSetting(name);
  }

  /** @inheritdoc */
  public whenSettingChanged<K extends keyof VSpeedUserSettingTypes & string>(name: K): Consumer<NonNullable<VSpeedUserSettingTypes[K]>> {
    return this.manager.whenSettingChanged(name);
  }

  /** @inheritdoc */
  public getAllSettings(): UserSetting<UserSettingValue>[] {
    return this.manager.getAllSettings();
  }

  /** @inheritdoc */
  public mapTo<M extends UserSettingRecord>(map: UserSettingMap<M, VSpeedUserSettingTypes>): UserSettingManager<M & VSpeedUserSettingTypes> {
    return this.manager.mapTo(map);
  }
}