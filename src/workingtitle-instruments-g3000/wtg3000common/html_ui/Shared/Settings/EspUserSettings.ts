import { DefaultUserSettingManager, EventBus, UserSettingManager } from '@microsoft/msfs-sdk';

/**
 * Electronic stability and protection (ESP) user settings.
 */
export type EspUserSettingTypes = {
  /** Whether ESP is enabled. */
  espEnabled: boolean;
}

/**
 * Utility class for retrieving electronic stability and protection (ESP) user settings managers.
 */
export class EspUserSettings {
  private static INSTANCE: DefaultUserSettingManager<EspUserSettingTypes> | undefined;

  /**
   * Gets an instance of the ESP user settings manager.
   * @param bus The event bus.
   * @returns An instance of the ESP user settings manager.
   */
  public static getManager(bus: EventBus): UserSettingManager<EspUserSettingTypes> {
    return EspUserSettings.INSTANCE ??= new DefaultUserSettingManager(bus, [
      {
        name: 'espEnabled',
        defaultValue: true
      }
    ]);
  }
}
