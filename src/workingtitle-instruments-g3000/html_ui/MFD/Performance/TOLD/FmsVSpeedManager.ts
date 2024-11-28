import { UserSetting } from '@microsoft/msfs-sdk';
import { VSpeedUserSettingManager } from '@microsoft/msfs-wtg3000-common';

/**
 * An entry for a V-speed reference.
 */
type VSpeedEntry = {
  /** The name of the V-speed. */
  name: string;

  /** The user setting that holds the FMS-defined value for the V-speed. */
  fmsValueSetting: UserSetting<number>;

  /** The user setting that controls the visibility of the V-speed bug on the PFD airspeed indicator. */
  showSetting: UserSetting<boolean>;

  /** The user setting that holds the user-defined value for the V-speed. */
  userValueSetting: UserSetting<number>;
};

/**
 * A manager for FMS-defined V-speed values. Handles setting and clearing FMS-defined V-speed values.
 */
export class FmsVSpeedManager {
  private readonly entries = new Map<string, VSpeedEntry>();

  /**
   * Constructor.
   * @param vSpeedSettingManager A manager of reference V-speed user settings.
   */
  public constructor(
    private readonly vSpeedSettingManager: VSpeedUserSettingManager
  ) {
    for (const group of vSpeedSettingManager.vSpeedGroups.values()) {
      for (let i = 0; i < group.vSpeedDefinitions.length; i++) {
        const def = group.vSpeedDefinitions[i];
        this.entries.set(def.name, {
          name: def.name,
          fmsValueSetting: vSpeedSettingManager.getSetting(`vSpeedFmsValue_${def.name}`),
          showSetting: vSpeedSettingManager.getSetting(`vSpeedShow_${def.name}`),
          userValueSetting: vSpeedSettingManager.getSetting(`vSpeedUserValue_${def.name}`)
        });
      }
    }
  }

  /**
   * Sets the FMS-defined value of a V-speed.
   * @param name The name of the V-speed for which to set an FMS-defined value.
   * @param value The value to set, in knots.
   * @param forceShow Whether to force the V-speed to be displayed on the PFD airspeed indicator. Defaults to `false`.
   * @param clearUserValue Whether the clear the user-defined value for the V-speed. Defaults to `false`.
   */
  public setValue(name: string, value: number, forceShow = false, clearUserValue = false): void {
    if (value < 0) {
      return;
    }

    const entry = this.entries.get(name);

    if (entry === undefined) {
      return;
    }

    entry.fmsValueSetting.value = Math.round(value);

    if (forceShow) {
      entry.showSetting.value = true;
    }

    if (clearUserValue) {
      entry.userValueSetting.value = -1;
    }
  }

  /**
   * Clears the FMS-defined value of a V-speed.
   * @param name The name of the V-speed for which to clear the FMS-defined value.
   * @param forceHide Whether to force the V-speed to be hidden on the PFD airspeed indicator. Ignored if a
   * user-defined value for the V-speed exists. Defaults to `false`.
   */
  public clearValue(name: string, forceHide = false): void {
    const entry = this.entries.get(name);

    if (entry === undefined) {
      return;
    }

    entry.fmsValueSetting.value = -1;

    if (forceHide && entry.userValueSetting.value < 0) {
      entry.showSetting.value = false;
    }
  }
}