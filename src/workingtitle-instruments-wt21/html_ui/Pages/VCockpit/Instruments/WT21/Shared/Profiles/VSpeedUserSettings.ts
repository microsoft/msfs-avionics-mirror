import { DefaultUserSettingManager, EventBus, UserSetting, UserSettingDefinition } from '@microsoft/msfs-sdk';

import { VSpeedType } from '../ReferenceSpeeds';

/** */
export type VSpeedData = {
  /** The set value of this vspeed */
  value: number,
  /** Indicates if this vspeed was modified by the pilot. */
  manual: boolean,
  /** Indicates if this vspeed should be shown. */
  show: boolean
}

/** */
export type VSpeedDataAliased = {
  /** The type of this vspeed. */
  [type: `vspeed_type_${string}`]: VSpeedType;

  /** The set value of this vspeed */
  [value: `vspeed_value_${string}`]: number;

  /** Indicates if this vspeed was modified by the pilot. */
  [isManual: `vspeed_manual_${string}`]: boolean;

  /** Indicates if this vspeed should be shown. */
  [show: `vspeed_show_${string}`]: boolean;
};

/** */
type VSpeedSettingsDef = {
  [Name in keyof VSpeedDataAliased as `${Name}`]: VSpeedDataAliased[Name];
};

/**
 * Utility class for retrieving the vspeeds user setting manager.
 */
export class VSpeedUserSettings {
  private readonly manager: DefaultUserSettingManager<VSpeedSettingsDef>;

  /**
   * Ctor
   * @param bus The event bus.
   */
  constructor(bus: EventBus) {
    const settingDefs: UserSettingDefinition<any>[] = [];

    for (const vspeed in VSpeedType) {
      settingDefs.push(
        {
          name: `vspeed_value_${vspeed}`,
          defaultValue: 0 as number
        },
        {
          name: `vspeed_manual_${vspeed}`,
          defaultValue: true as boolean
        },
        {
          name: `vspeed_show_${vspeed}`,
          defaultValue: false as boolean
        }
      );
    }

    this.manager = new DefaultUserSettingManager(bus, settingDefs);

  }

  /**
   * Returns an object containing relevant {@link UserSetting}s for a given {@link VSpeedType}
   *
   * @param type the `VSpeedType` to return settings for
   *
   * @returns a record
   */
  public getSettings(type: VSpeedType): ({ [k in keyof VSpeedData]: UserSetting<VSpeedData[k]> }) {
    return {
      'value': this.manager.getSetting(`vspeed_value_${type}`),
      'manual': this.manager.getSetting(`vspeed_manual_${type}`),
      'show': this.manager.getSetting(`vspeed_show_${type}`),
    };
  }
}