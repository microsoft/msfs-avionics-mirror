import { DefaultUserSettingManager, EventBus } from '@microsoft/msfs-sdk';

/**
 * Type description for WT21 related user settings
 */
const userSettings = [
] as const;

/** Generates the UserSettingDefinition type based on the settings object */
export type WT21Settings = {
  readonly [Item in typeof userSettings[number]as Item['name']]: Item['defaultValue'];
};

/**
 * Utility class for retrieving WT21 related user setting managers.
 */
export class WT21UserSettings {
  private static INSTANCE: DefaultUserSettingManager<WT21Settings> | undefined;

  /**
   * Retrieves a manager for map user settings.
   * @param bus The event bus.
   * @returns a manager for map user settings.
   */
  public static getManager(bus: EventBus): DefaultUserSettingManager<WT21Settings> {
    return WT21UserSettings.INSTANCE ??= new DefaultUserSettingManager<WT21Settings>(bus, userSettings);
  }
}
