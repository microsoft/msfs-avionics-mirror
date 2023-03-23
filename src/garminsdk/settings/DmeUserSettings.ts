import { DefaultUserSettingManager, EventBus } from '@microsoft/msfs-sdk';

/**
 * Setting modes for DME tuning.
 */
export enum DmeTuneSettingMode {
  Nav1 = 'Nav1',
  Nav2 = 'Nav2',
  Hold = 'Hold'
}

/**
 * Type descriptions for DME user settings.
 */
export type DmeUserSettingTypes = {
  /** Tuning mode for DME radio 1. */
  dme1TuneMode: DmeTuneSettingMode;

  /** Tuning mode for DME radio 2. */
  dme2TuneMode: DmeTuneSettingMode;
}

/**
 * Utility class for retrieving DME user setting managers.
 */
export class DmeUserSettings {
  private static INSTANCE: DefaultUserSettingManager<DmeUserSettingTypes> | undefined;

  /**
   * Retrieves a manager for DME user settings.
   * @param bus The event bus.
   * @returns A manager for DME user settings.
   */
  public static getManager(bus: EventBus): DefaultUserSettingManager<DmeUserSettingTypes> {
    return DmeUserSettings.INSTANCE ??= new DefaultUserSettingManager(bus, [
      {
        name: 'dme1TuneMode',
        defaultValue: DmeTuneSettingMode.Nav1
      },
      {
        name: 'dme2TuneMode',
        defaultValue: DmeTuneSettingMode.Nav2
      }
    ]);
  }
}