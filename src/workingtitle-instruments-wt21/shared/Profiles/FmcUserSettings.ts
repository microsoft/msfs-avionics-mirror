import { DefaultUserSettingManager, EventBus } from '@microsoft/msfs-sdk';

/**
 * Type description for pfd user settings
 */
export type FmcSettingsManagerType = {
  /**
   * The baro unit setting.
   */
  baroHpa: boolean,
  /**
   * The flight number setting.
   */
  flightNumber: string,
}

/**
 * Utility class for retrieving PFD user setting managers.
 */
export class FmcUserSettings {
  private static INSTANCE: DefaultUserSettingManager<FmcSettingsManagerType> | undefined;

  /**
   * Retrieves a manager for map user settings.
   * @param bus The event bus.
   * @returns a manager for map user settings.
   */
  public static getManager(bus: EventBus): DefaultUserSettingManager<FmcSettingsManagerType> {
    return FmcUserSettings.INSTANCE ??= new DefaultUserSettingManager(bus, [
      {
        name: 'baroHpa',
        defaultValue: false
      },
      {
        name: 'flightNumber',
        defaultValue: ''
      },
    ]);
  }
}
