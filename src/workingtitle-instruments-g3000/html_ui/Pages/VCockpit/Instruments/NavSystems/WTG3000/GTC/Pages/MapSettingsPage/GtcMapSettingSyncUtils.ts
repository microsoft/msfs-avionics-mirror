import { UserSettingManager } from '@microsoft/msfs-sdk';
import { G3000MapUserSettingTypes, G3000MapUserSettingUtils } from '@microsoft/msfs-wtg3000-common';

/**
 * A utility class for syncing map user settings across different display panes.
 */
export class GtcMapSettingSyncUtils {
  private static readonly syncedSettingNames = G3000MapUserSettingUtils.SETTING_NAMES.filter(setting => setting !== 'mapRangeIndex');

  /**
   * Syncs map user settings from a source display pane to zero or more target display panes.
   * @param source The source display pane's map user settings manager.
   * @param targets The map user settings managers for the target display panes.
   */
  public static syncSettings(source: UserSettingManager<G3000MapUserSettingTypes>, targets: readonly UserSettingManager<G3000MapUserSettingTypes>[]): void {
    for (let i = 0; i < GtcMapSettingSyncUtils.syncedSettingNames.length; i++) {
      const settingName = GtcMapSettingSyncUtils.syncedSettingNames[i];
      const value = source.getSetting(settingName).value;
      for (let j = 0; j < targets.length; j++) {
        targets[j].getSetting(settingName).value = value;
      }
    }
  }
}