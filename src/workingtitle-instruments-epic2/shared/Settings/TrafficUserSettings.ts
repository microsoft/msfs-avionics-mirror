import { DefaultUserSettingManager, EventBus, UserSettingManager } from '@microsoft/msfs-sdk';

import { TcasVerticalRange } from './MfdUserSettings';

/** TCAS operating mode setting values. */
export enum TcasOperatingModeSetting {
  TA_RA = 'TA_RA',
  TAOnly = 'TAOnly',
  Standby = 'Standby',
  On = 'On',
}

const trafficSettings = [
  {
    name: 'trafficOperatingMode',
    defaultValue: TcasOperatingModeSetting.TAOnly as TcasOperatingModeSetting
  },
  {
    name: 'trafficAlternativeMode',
    defaultValue: TcasOperatingModeSetting.Standby as TcasOperatingModeSetting
  },
  {
    name: 'trafficShowOther',
    defaultValue: true as boolean
  },
  {
    name: 'trafficAltitudeRelative',
    defaultValue: true as boolean
  },
  {
    name: 'trafficShowAbove',
    defaultValue: false as boolean
  },
  {
    name: 'trafficShowBelow',
    defaultValue: false as boolean
  },
  {
    name: 'tcasVerticalRange',
    defaultValue: TcasVerticalRange.Norm as TcasVerticalRange,
  },
  {
    name: 'trafficAdsbEnabled',
    defaultValue: true as boolean
  }
] as const;

/** Type definitions for traffic settings. */
export type TrafficSettings = {
  readonly [Item in typeof trafficSettings[number]as Item['name']]: Item['defaultValue'];
};

/** Utility class for retrieving the traffic user setting manager. */
export class TrafficUserSettings {
  private static INSTANCE: DefaultUserSettingManager<TrafficSettings> | undefined;

  /**
   * Retrieves a setting manager with traffic user settings.
   * @param bus The event bus.
   * @returns A setting manager with traffic user settings.
   */
  public static getManager(bus: EventBus): UserSettingManager<TrafficSettings> {
    return TrafficUserSettings.INSTANCE ??= new DefaultUserSettingManager(bus, trafficSettings);
  }
}
