import { DefaultUserSettingManager, EventBus } from 'msfssdk';
import { WeatherRadarOperatingMode, WeatherRadarScanMode, WeatherRadarUserSettingTypes } from 'garminsdk';

/**
 * Utility class for retrieving weather radar user setting managers.
 */
export class WeatherRadarUserSettings {
  private static INSTANCE: DefaultUserSettingManager<WeatherRadarUserSettingTypes> | undefined;

  /**
   * Retrieves a manager for weather radar user settings.
   * @param bus The event bus.
   * @returns A manager for weather radar user settings.
   */
  public static getManager(bus: EventBus): DefaultUserSettingManager<WeatherRadarUserSettingTypes> {
    return WeatherRadarUserSettings.INSTANCE ??= new DefaultUserSettingManager(bus, [
      {
        name: 'wxrActive',
        defaultValue: false
      },
      {
        name: 'wxrOperatingMode',
        defaultValue: WeatherRadarOperatingMode.Standby
      },
      {
        name: 'wxrScanMode',
        defaultValue: WeatherRadarScanMode.Horizontal
      },
      {
        name: 'wxrRangeIndex',
        defaultValue: 2
      },
      {
        name: 'wxrShowBearingLine',
        defaultValue: false
      },
      {
        name: 'wxrShowTiltLine',
        defaultValue: false
      }
    ]);
  }
}