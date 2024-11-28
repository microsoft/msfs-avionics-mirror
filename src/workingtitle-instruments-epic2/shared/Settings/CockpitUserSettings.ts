import { DefaultUserSettingManager, EventBus, MinimumsMode, SimVarValueType, Subscription } from '@microsoft/msfs-sdk';

const refsSettings = [
  {
    name: 'minimumsMode',
    defaultValue: MinimumsMode.BARO as (MinimumsMode.BARO | MinimumsMode.RA),
  },
  {
    name: 'decisionHeightFeet',
    defaultValue: 0 as number,
  },
  {
    name: 'decisionAltitudeFeet',
    defaultValue: 0 as number,
  },
  {
    name: 'fltNumber',
    defaultValue: '' as string,
  },
  {
    name: 'captureKeyboardInput',
    defaultValue: false as boolean,
  }
] as const;

/** Generates the UserSettingDefinition type based on the settings object */
export type RefsSettings = {
  readonly [Item in typeof refsSettings[number]as Item['name']]: Item['defaultValue'];
}

/** Utility class for retrieving Refs user setting managers. */
export class CockpitUserSettings {
  private static INSTANCE: DefaultUserSettingManager<RefsSettings> | undefined;

  private static subs = [] as Subscription[];

  /**
   * Retrieves a manager for Refs user settings.
   * @param bus The event bus.
   * @returns a manager for Refs user settings.
   */
  public static getManager(bus: EventBus): DefaultUserSettingManager<RefsSettings> {
    if (CockpitUserSettings.INSTANCE === undefined) {
      CockpitUserSettings.INSTANCE = new DefaultUserSettingManager<RefsSettings>(bus, refsSettings);
      CockpitUserSettings.wireSettings(CockpitUserSettings.INSTANCE);
    }

    return CockpitUserSettings.INSTANCE;
  }

  /**
   * Wires up any special setttings handlers.
   * @param settingsManager The settings manager.
   */
  private static wireSettings(settingsManager: DefaultUserSettingManager<RefsSettings>): void {
    CockpitUserSettings.subs.push(
      settingsManager.getSetting('fltNumber').sub(fltNumber => {
        // strip the first 1-3 letters from the callsign to get only the numbers to feed to the default ATC
        const justTheNumber = fltNumber.includes('-') || fltNumber.length === 0
          ? '0'
          : fltNumber.replace(/^([A-Z]{1,3})/, '');

        SimVar.SetSimVarValue('ATC FLIGHT NUMBER', SimVarValueType.String, justTheNumber);
      }),
    );
  }
}
