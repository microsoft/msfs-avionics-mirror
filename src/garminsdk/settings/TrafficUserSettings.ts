import { DefaultUserSettingManager, EventBus, UserSettingManager } from '@microsoft/msfs-sdk';

export enum TrafficOperatingModeSetting {
  Standby = 'Standby',
  Operating = 'Operating',
  Auto = 'Auto',
  TAOnly = 'TAOnly',
  Test = 'Test'
}

export enum TrafficAltitudeModeSetting {
  Below = 'Below',
  Normal = 'Normal',
  Above = 'Above',
  Unrestricted = 'Unrestricted',
}

export enum TrafficMotionVectorModeSetting {
  Off = 'Off',
  Absolute = 'Absolute',
  Relative = 'Relative'
}

/**
 * Traffic user settings.
 */
export type TrafficUserSettingTypes = {
  /** The traffic system operating mode setting. */
  trafficOperatingMode: TrafficOperatingModeSetting;

  /** The ADS-B operating mode setting. */
  trafficAdsbEnabled: boolean;

  /** The traffic system altitude mode setting. */
  trafficAltitudeMode: TrafficAltitudeModeSetting;

  /** The traffic system relative altitude label setting.  */
  trafficAltitudeRelative: boolean;

  /** The traffic system motion vector mode setting. */
  trafficMotionVectorMode: TrafficMotionVectorModeSetting;

  /** The traffic system motion vector lookahead setting. */
  trafficMotionVectorLookahead: number;
}

/**
 * Utility class for retrieving traffic user setting managers.
 */
export class TrafficUserSettings {
  private static INSTANCE: UserSettingManager<TrafficUserSettingTypes> | undefined;

  /**
   * Gets an instance of the traffic user settings manager.
   * @param bus The event bus.
   * @returns An instance of the traffic user settings manager.
   */
  public static getManager(bus: EventBus): UserSettingManager<TrafficUserSettingTypes> {
    return TrafficUserSettings.INSTANCE ??= new DefaultUserSettingManager(bus, [
      {
        name: 'trafficOperatingMode',
        defaultValue: TrafficOperatingModeSetting.Standby
      },
      {
        name: 'trafficAdsbEnabled',
        defaultValue: true
      },
      {
        name: 'trafficAltitudeMode',
        defaultValue: TrafficAltitudeModeSetting.Unrestricted
      },
      {
        name: 'trafficAltitudeRelative',
        defaultValue: true
      },
      {
        name: 'trafficMotionVectorMode',
        defaultValue: TrafficMotionVectorModeSetting.Off
      },
      {
        name: 'trafficMotionVectorLookahead',
        defaultValue: 60
      }
    ]);
  }
}
