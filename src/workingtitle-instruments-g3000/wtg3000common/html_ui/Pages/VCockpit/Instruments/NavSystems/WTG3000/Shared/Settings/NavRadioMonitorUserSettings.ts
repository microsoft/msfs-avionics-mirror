import { DefaultUserSettingManager, EventBus } from '@microsoft/msfs-sdk';

/**
 * Type descriptions for NAV radio audio monitoring user settings.
 */
export type NavRadioMonitorUserSettingTypes = {
  /** Whether NAV1 radio has been selected for monitoring. */
  navRadioMonitorSelected1: boolean;

  /** Whether NAV1 radio IDENT audio is enabled. */
  navRadioMonitorIdentEnabled1: boolean;

  /** Whether NAV2 radio has been selected for monitoring. */
  navRadioMonitorSelected2: boolean;

  /** Whether NAV2 radio IDENT audio is enabled. */
  navRadioMonitorIdentEnabled2: boolean;
};

/**
 * Utility class for retrieving NAV radio audio monitoring user setting managers.
 */
export class NavRadioMonitorUserSettings {
  private static INSTANCE: DefaultUserSettingManager<NavRadioMonitorUserSettingTypes> | undefined;

  /**
   * Retrieves a manager for NAV radio audio monitoring user settings.
   * @param bus The event bus.
   * @returns A manager for NAV radio audio monitoring user settings.
   */
  public static getManager(bus: EventBus): DefaultUserSettingManager<NavRadioMonitorUserSettingTypes> {
    return NavRadioMonitorUserSettings.INSTANCE ??= new DefaultUserSettingManager(bus, [
      {
        name: 'navRadioMonitorSelected1',
        defaultValue: false
      },
      {
        name: 'navRadioMonitorIdentEnabled1',
        defaultValue: false
      },
      {
        name: 'navRadioMonitorSelected2',
        defaultValue: false
      },
      {
        name: 'navRadioMonitorIdentEnabled2',
        defaultValue: false
      }
    ]);
  }
}