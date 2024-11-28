import { DefaultUserSettingManager, EventBus } from '@microsoft/msfs-sdk';

import { NavDataBarSettingTypes, NavDataBarUserSettings, NavDataFieldType } from '@microsoft/msfs-garminsdk';

/**
 * Utility class for retrieving MFD navigation data bar user setting managers.
 */
export class MFDNavDataBarUserSettings {
  private static INSTANCE: DefaultUserSettingManager<NavDataBarSettingTypes> | undefined;

  /**
   * Retrieves a manager for MFD navigation data bar user settings.
   * @param bus The event bus.
   * @returns a manager for MFD navigation data bar user settings.
   */
  public static getManager(bus: EventBus): DefaultUserSettingManager<NavDataBarSettingTypes> {
    return MFDNavDataBarUserSettings.INSTANCE ??= NavDataBarUserSettings.createManager(bus, [
      NavDataFieldType.GroundSpeed,
      NavDataFieldType.DesiredTrack,
      NavDataFieldType.GroundTrack,
      NavDataFieldType.TimeToWaypoint
    ]);
  }
}