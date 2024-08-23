import { DefaultUserSettingManager, EventBus, MinimumsMode } from '@microsoft/msfs-sdk';

const refsSettings = [
  {
    name: 'minsmode',
    defaultValue: MinimumsMode.OFF as MinimumsMode,
  },
  {
    name: 'baromins',
    defaultValue: 0 as number,
  },
  {
    name: 'radiomins',
    defaultValue: 0 as number,
  }
] as const;

/** Generates the UserSettingDefinition type based on the settings object */
export type RefsSettings = {
  readonly [Item in typeof refsSettings[number]as Item['name']]: Item['defaultValue'];
};

/** Utility class for retrieving Refs user setting managers. */
export class RefsUserSettings {
  private static INSTANCE: DefaultUserSettingManager<RefsSettings> | undefined;
  public static readonly aoaFormatOptions = ['OFF', 'ON', 'AUTO'] as const;
  /**
   * Retrieves a manager for Refs user settings.
   * @param bus The event bus.
   * @returns a manager for Refs user settings.
   */
  public static getManager(bus: EventBus): DefaultUserSettingManager<RefsSettings> {
    return RefsUserSettings.INSTANCE ??= new DefaultUserSettingManager<RefsSettings>(bus, refsSettings);
  }
}