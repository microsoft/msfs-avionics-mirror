import { DefaultUserSettingManager, EventBus, RunwaySurfaceCategory } from '@microsoft/msfs-sdk';

/**
 * Type description for nearest airport user settings.
 */
export type NearestAirportUserSettingTypes = {
  /** The minimum runway length, in feet, required for an airport to be included in the nearest list. */
  nearestAptRunwayLength: number;

  /** Bitflags of the supported runway surface types for an airport to be included in the nearest list.  */
  nearestAptRunwaySurfaceTypes: number;
}

/**
 * Utility class for retrieving nearest airport user setting managers.
 */
export class NearestAirportUserSettings {
  private static INSTANCE: DefaultUserSettingManager<NearestAirportUserSettingTypes> | undefined;

  /**
   * Retrieves a manager for airport search settings.
   * @param bus The event bus.
   * @returns a manager for airport search settings.
   */
  public static getManager(bus: EventBus): DefaultUserSettingManager<NearestAirportUserSettingTypes> {
    return NearestAirportUserSettings.INSTANCE ??= new DefaultUserSettingManager(bus, [
      {
        name: 'nearestAptRunwayLength',
        defaultValue: 3000
      },
      {
        name: 'nearestAptRunwaySurfaceTypes',
        defaultValue: RunwaySurfaceCategory.Hard
      }
    ]);
  }
}