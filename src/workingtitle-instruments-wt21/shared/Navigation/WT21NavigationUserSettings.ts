import { DefaultUserSettingManager, EventBus } from '@microsoft/msfs-sdk';

import { WT21NavSourceNames } from './WT21NavIndicators';

const navigationSettings = [
  {
    name: 'lastFmsPos',
    defaultValue: '0,0' as string,
  },
  {
    name: 'advisoryVnavEnabled',
    defaultValue: true as boolean
  },
  {
    name: 'bearingPointer1Source',
    defaultValue: false as WT21NavSourceNames[number] | false,
  },
  {
    name: 'bearingPointer2Source',
    defaultValue: false as WT21NavSourceNames[number] | false,
  },
] as const;

/** Generates the UserSettingDefinition type based on the settings object */
export type WT21NavigationSettings = {
  readonly [Item in typeof navigationSettings[number]as Item['name']]: Item['defaultValue'];
};

/** Utility class for retrieving the navigation user setting managers. */
export class WT21NavigationUserSettings {
  private static INSTANCE: DefaultUserSettingManager<WT21NavigationSettings> | undefined;
  /**
   * Retrieves a manager for navigation user settings.
   * @param bus The event bus.
   * @returns a manager for navigation user settings.
   */
  public static getManager(bus: EventBus): DefaultUserSettingManager<WT21NavigationSettings> {
    return WT21NavigationUserSettings.INSTANCE ??= new DefaultUserSettingManager<WT21NavigationSettings>(bus, navigationSettings);
  }
}
