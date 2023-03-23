import { DefaultUserSettingManager, EventBus, UserSettingManager, UserSettingRecord } from '@microsoft/msfs-sdk';

export enum GnsVnavRefMode {
  Before,
  After,
}

export enum GnsVnavTargetAltitudeMode {
  Msl,
  Agl,
}

/**
 * GNS VNAV configuration
 */
export interface GnsVnavSettings extends UserSettingRecord {
  /**
   * Target altitude, in feet
   */
  target_altitude: number,

  /**
   * Target altitude mode
   */
  target_altitude_mode: GnsVnavTargetAltitudeMode,

  /**
   * Distance from waypoint, in nautical miles
   */
  ref_distance: number,

  /**
   * Whether the distance is before or after the waypoint
   */
  ref_mode: GnsVnavRefMode,

  /**
   * Leg index of the waypoint
   */
  ref_leg_index: number,

  /**
   * Profile V/S
   */
  profile_vs: number,

  /**
   * Whether VNAV messages are on
   */
  messages_on: boolean,
}

const gnsVnavSettings = [
  {
    name: 'target_altitude',
    defaultValue: 1000 as number,
  },
  {
    name: 'target_altitude_mode',
    defaultValue: GnsVnavTargetAltitudeMode.Msl as GnsVnavTargetAltitudeMode,
  },
  {
    name: 'ref_distance',
    defaultValue: 4 as number,
  },
  {
    name: 'ref_mode',
    defaultValue: GnsVnavRefMode.Before as GnsVnavRefMode,
  },
  {
    name: 'ref_leg_index',
    defaultValue: 3 as number,
  },
  {
    name: 'profile_vs',
    defaultValue: -400 as number,
  },
  {
    name: 'messages_on',
    defaultValue: true as boolean,
  },
] as const;

/**
 * Utility class for retrieving GNS VNAV setting managers.
 */
export class GnsVnavSettingsManager {
  private static INSTANCE: DefaultUserSettingManager<GnsVnavSettings> | undefined;

  /**
   * Retrieves a setting manager with all VNAV settings.
   * @param bus The event bus.
   * @returns A setting manager with all VNAV settings.
   */
  public static getManager(bus: EventBus): UserSettingManager<GnsVnavSettings> {
    return GnsVnavSettingsManager.INSTANCE ??= new DefaultUserSettingManager(bus, gnsVnavSettings);
  }
}
