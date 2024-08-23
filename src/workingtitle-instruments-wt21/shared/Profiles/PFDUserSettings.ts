import { DefaultUserSettingManager, EventBus } from '@microsoft/msfs-sdk';

/** A format for the AOA component. */
export type AOAFormat = typeof PFDUserSettings.aoaFormatOptions[number];

const pfdSettings = [
  {
    name: 'pressureUnitHPA',
    defaultValue: true as boolean,
  },
  {
    name: 'fltDirStyle',
    defaultValue: true as boolean,
  },
  {
    name: 'altMetric',
    defaultValue: false as boolean,
  },
  {
    name: 'flightLevelAlert',
    defaultValue: true as boolean,
  },
  {
    name: 'aoaFormat',
    defaultValue: 'AUTO' as AOAFormat,
  }
] as const;

/** Generates the UserSettingDefinition type based on the settings object */
export type PFDSettings = {
  readonly [Item in typeof pfdSettings[number]as Item['name']]: Item['defaultValue'];
};

/** Utility class for retrieving PFD user setting managers. */
export class PFDUserSettings {
  private static INSTANCE: DefaultUserSettingManager<PFDSettings> | undefined;
  public static readonly aoaFormatOptions = ['OFF', 'ON', 'AUTO'] as const;
  /**
   * Retrieves a manager for PFD user settings.
   * @param bus The event bus.
   * @returns a manager for PFD user settings.
   */
  public static getManager(bus: EventBus): DefaultUserSettingManager<PFDSettings> {
    return PFDUserSettings.INSTANCE ??= new DefaultUserSettingManager<PFDSettings>(bus, pfdSettings);
  }
}
