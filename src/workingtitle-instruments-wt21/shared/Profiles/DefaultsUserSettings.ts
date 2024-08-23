import { DefaultUserSettingManager, EventBus } from '@microsoft/msfs-sdk';

// NOTE: These should not be persistent, they will live from DEFAULTS
const defaultsSettings = [
  {
    name: 'basicOperatingWeight',
    defaultValue: 9860 as number,
  },
  {
    name: 'averagePassengerWeight',
    defaultValue: 170 as number,
  },
  {
    name: 'reserveFuel',
    defaultValue: 200 as number,
  },
  {
    name: 'maxMapSymbols',
    defaultValue: 40 as number,
  },
  {
    name: 'climbTargetSpeedIas',
    defaultValue: 240 as number,
  },
  {
    name: 'climbTargetSpeedMach',
    defaultValue: 0.64 as number,
  },
  {
    name: 'cruiseTargetSpeedIas',
    defaultValue: 300 as number,
  },
  {
    name: 'cruiseTargetSpeedMach',
    defaultValue: 0.74 as number,
  },
  {
    name: 'descentTargetSpeedIas',
    defaultValue: 240 as number,
  },
  {
    name: 'descentTargetSpeedMach',
    defaultValue: 0.64 as number,
  },
  {
    name: 'descentVPA',
    defaultValue: 3 as number,
  },
  {
    name: 'speedLimitIas',
    defaultValue: 250 as number,
  },
  {
    name: 'altitudeLimit',
    defaultValue: 10000 as number,
  },
  {
    name: 'transitionAltitude',
    defaultValue: 18000 as number,
  },
  {
    name: 'dmeUsage',
    defaultValue: true as boolean,
  },
  {
    name: 'vorUsage',
    defaultValue: true as boolean,
  },
  {
    name: 'nearestAirportsMinRunway',
    defaultValue: 4000 as number,
  },
  {
    name: 'flightLogOnLanding',
    defaultValue: true as boolean,
  },
  {
    name: 'takeoffFlaps',
    defaultValue: 1 as 0 | 1,
  },
  {
    name: 'takeoffAntiIce',
    defaultValue: false as boolean,
  }
] as const;

/** Generates the UserSettingDefinition type based on the settings object */
export type DefaultsSettings = {
  readonly [Item in typeof defaultsSettings[number]as Item['name']]: Item['defaultValue'];
};

/** Utility class for retrieving VNAV user setting managers. */
export class DefaultsUserSettings {
  private static INSTANCE: DefaultUserSettingManager<DefaultsSettings> | undefined;
  /**
   * Retrieves a manager for DEFAULTS user settings.
   * @param bus The event bus.
   * @returns a manager for DEFAULTS user settings.
   */
  public static getManager(bus: EventBus): DefaultUserSettingManager<DefaultsSettings> {
    return DefaultsUserSettings.INSTANCE ??= new DefaultUserSettingManager<DefaultsSettings>(bus, defaultsSettings);
  }
}