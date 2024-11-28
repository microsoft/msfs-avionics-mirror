import { DefaultUserSettingManager, EventBus, UserSettingManager } from '@microsoft/msfs-sdk';

/**
 * Types of map user setting sync.
 */
export enum MapSettingSync {
  /** No synchronization. */
  None = 'None',

  /** Synchronizes onside display panes. */
  Onside = 'Onside',

  /** Synchronizes all display panes. */
  All = 'All',
}

/**
 * Map user setting synchronization settings.
 */
export type MapSettingSyncUserSettingTypes = {
  /** Map settings sync type for the left side display panes. */
  mapUserSettingSyncLeft: MapSettingSync;

  /** Map settings sync type for the right side display panes. */
  mapUserSettingSyncRight: MapSettingSync;
};

/**
 * Utility class for retrieving G3000 synced map user setting managers.
 */
export class MapSettingSyncUserSettings {
  private static instance?: UserSettingManager<MapSettingSyncUserSettingTypes>;
  /**
   * Retrieves a manager for map setting sync user settings.
   * @param bus The event bus.
   * @returns A manager for map setting sync user settings.
   */
  public static getManager(bus: EventBus): UserSettingManager<MapSettingSyncUserSettingTypes> {
    return MapSettingSyncUserSettings.instance ??= new DefaultUserSettingManager(
      bus,
      [
        {
          name: 'mapUserSettingSyncLeft',
          defaultValue: MapSettingSync.None
        },
        {
          name: 'mapUserSettingSyncRight',
          defaultValue: MapSettingSync.None
        }
      ]
    );
  }
}