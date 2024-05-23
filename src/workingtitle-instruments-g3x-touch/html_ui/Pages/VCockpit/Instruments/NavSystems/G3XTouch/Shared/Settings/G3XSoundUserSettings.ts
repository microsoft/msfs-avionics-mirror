import { DefaultUserSettingManager, EventBus } from '@microsoft/msfs-sdk';

/**
 * G3X sound alerts user settings.
 */
export type G3XSoundUserSettingTypes = {
  /**
   * Should the minimums alert be played.
   */
  g3xSoundMinimumsAlertEnabled: boolean;

  /**
   * Should the altitude alert be played.
   */
  g3xSoundAltitudeAlertEnabled: boolean;
};

/**
 * A utility class for retrieving G3X sound user setting managers.
 */
export class G3XSoundUserSettings {
  private static INSTANCE: DefaultUserSettingManager<G3XSoundUserSettingTypes> | undefined;

  /**
   * Retrieves a manager for G3X sound user settings.
   * @param bus The event bus.
   * @returns a manager for G3X sound user settings.
   */
  public static getManager(bus: EventBus): DefaultUserSettingManager<G3XSoundUserSettingTypes> {
    return G3XSoundUserSettings.INSTANCE ??= new DefaultUserSettingManager(bus, [
      {
        name: 'g3xSoundMinimumsAlertEnabled',
        defaultValue: true
      },
      {
        name: 'g3xSoundAltitudeAlertEnabled',
        defaultValue: true
      },
    ], false);
  }
}