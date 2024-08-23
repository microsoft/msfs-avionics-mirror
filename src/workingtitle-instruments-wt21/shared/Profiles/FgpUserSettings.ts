import { DefaultUserSettingManager, EventBus } from '@microsoft/msfs-sdk';

export enum VorTuningMode {
  /** Manual VOR tuning */
  Manual,
  /** Automatic VOR tuning */
  Auto,
}

const fgpSettings = [
  {
    name: 'selectedHeading',
    defaultValue: 0 as number,
  },
  {
    name: 'course1',
    defaultValue: 0 as number,
  },
  {
    name: 'course2',
    defaultValue: 0 as number,
  },
  {
    name: 'nav1VorTuningMode',
    defaultValue: VorTuningMode.Auto as VorTuningMode,
  },
  {
    name: 'nav2VorTuningMode',
    defaultValue: VorTuningMode.Auto as VorTuningMode,
  }
] as const;

/** Generates the UserSettingDefinition type based on the settings object */
export type FgpSettings = {
  readonly [Item in typeof fgpSettings[number]as Item['name']]: Item['defaultValue'];
};

/** Utility class for retrieving FGP (Flight Guidance Panel) user setting managers. */
export class FgpUserSettings {
  private static INSTANCE: DefaultUserSettingManager<FgpSettings> | undefined;
  /**
   * Retrieves a manager for FGP user settings.
   * @param bus The event bus.
   * @returns a manager for FGP user settings.
   */
  public static getManager(bus: EventBus): DefaultUserSettingManager<FgpSettings> {
    return FgpUserSettings.INSTANCE ??= new DefaultUserSettingManager<FgpSettings>(bus, fgpSettings);
  }
}