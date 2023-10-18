import { DefaultUserSettingManager, EventBus } from '@microsoft/msfs-sdk';

export enum CabinLightsMode {
  OFF = 0,
  ON = 1,
  DIM = 2,
  AUTO = 3,
}

/**
 * Type description for CJ4 related user settings
 */
const userSettings = [
  {
    name: 'cabinLightsMode',
    defaultValue: CabinLightsMode.DIM as CabinLightsMode,
  }
] as const;

/** Generates the UserSettingDefinition type based on the settings object */
export type CJ4Settings = {
  readonly [Item in typeof userSettings[number]as Item['name']]: Item['defaultValue'];
};

/**
 * Utility class for retrieving CJ4 related user setting managers.
 */
export class CJ4UserSettings {
  private static INSTANCE: DefaultUserSettingManager<CJ4Settings> | undefined;

  /**
   * Retrieves a manager for map user settings.
   * @param bus The event bus.
   * @returns a manager for map user settings.
   */
  public static getManager(bus: EventBus): DefaultUserSettingManager<CJ4Settings> {
    return CJ4UserSettings.INSTANCE ??= new DefaultUserSettingManager<CJ4Settings>(bus, userSettings);
  }
}
