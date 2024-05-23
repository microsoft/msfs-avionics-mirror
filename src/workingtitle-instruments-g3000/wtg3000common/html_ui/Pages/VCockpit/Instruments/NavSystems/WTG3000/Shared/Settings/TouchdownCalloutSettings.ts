import { DefaultUserSettingManager, EventBus, UserSetting } from '@microsoft/msfs-sdk';

import { GarminTawsVoiceCalloutAltitude } from '@microsoft/msfs-garminsdk';

/**
 * Touchdown callout user settings.
 */
export type TouchdownCalloutUserSettingTypes = {
  /** Whether touchdown callouts are enabled. */
  touchdownCalloutMasterEnabled: boolean;

  /** Whether the 500-foot touchdown callout is enabled. */
  touchdownCallout500Enabled: boolean;

  /** Whether the 450-foot touchdown callout is enabled. */
  touchdownCallout450Enabled: boolean;

  /** Whether the 400-foot touchdown callout is enabled. */
  touchdownCallout400Enabled: boolean;

  /** Whether the 350-foot touchdown callout is enabled. */
  touchdownCallout350Enabled: boolean;

  /** Whether the 300-foot touchdown callout is enabled. */
  touchdownCallout300Enabled: boolean;

  /** Whether the 250-foot touchdown callout is enabled. */
  touchdownCallout250Enabled: boolean;

  /** Whether the 200-foot touchdown callout is enabled. */
  touchdownCallout200Enabled: boolean;

  /** Whether the 150-foot touchdown callout is enabled. */
  touchdownCallout150Enabled: boolean;

  /** Whether the 100-foot touchdown callout is enabled. */
  touchdownCallout100Enabled: boolean;

  /** Whether the 50-foot touchdown callout is enabled. */
  touchdownCallout50Enabled: boolean;

  /** Whether the 40-foot touchdown callout is enabled. */
  touchdownCallout40Enabled: boolean;

  /** Whether the 30-foot touchdown callout is enabled. */
  touchdownCallout30Enabled: boolean;

  /** Whether the 20-foot touchdown callout is enabled. */
  touchdownCallout20Enabled: boolean;

  /** Whether the 10-foot touchdown callout is enabled. */
  touchdownCallout10Enabled: boolean;
}

/**
 * A manager of touchdown callout user settings.
 */
export class TouchdownCalloutUserSettings extends DefaultUserSettingManager<TouchdownCalloutUserSettingTypes> {
  private static readonly ENABLED_SETTING_NAMES: Record<GarminTawsVoiceCalloutAltitude, keyof TouchdownCalloutUserSettingTypes> = {
    [500]: 'touchdownCallout500Enabled',
    [450]: 'touchdownCallout450Enabled',
    [400]: 'touchdownCallout400Enabled',
    [350]: 'touchdownCallout350Enabled',
    [300]: 'touchdownCallout300Enabled',
    [250]: 'touchdownCallout250Enabled',
    [200]: 'touchdownCallout200Enabled',
    [150]: 'touchdownCallout150Enabled',
    [100]: 'touchdownCallout100Enabled',
    [50]: 'touchdownCallout50Enabled',
    [40]: 'touchdownCallout40Enabled',
    [30]: 'touchdownCallout30Enabled',
    [20]: 'touchdownCallout20Enabled',
    [10]: 'touchdownCallout10Enabled',
  };

  private static INSTANCE: TouchdownCalloutUserSettings | undefined;

  /**
   * Creates a new instance of TouchdownCalloutUserSettings.
   * @param bus The event bus.
   */
  private constructor(bus: EventBus) {
    super(bus, [
      {
        name: 'touchdownCalloutMasterEnabled',
        defaultValue: true,
      },
      {
        name: 'touchdownCallout500Enabled',
        defaultValue: false,
      },
      {
        name: 'touchdownCallout450Enabled',
        defaultValue: false,
      },
      {
        name: 'touchdownCallout400Enabled',
        defaultValue: false,
      },
      {
        name: 'touchdownCallout350Enabled',
        defaultValue: false,
      },
      {
        name: 'touchdownCallout300Enabled',
        defaultValue: false,
      },
      {
        name: 'touchdownCallout250Enabled',
        defaultValue: false,
      },
      {
        name: 'touchdownCallout200Enabled',
        defaultValue: false,
      },
      {
        name: 'touchdownCallout150Enabled',
        defaultValue: false,
      },
      {
        name: 'touchdownCallout100Enabled',
        defaultValue: false,
      },
      {
        name: 'touchdownCallout50Enabled',
        defaultValue: false,
      },
      {
        name: 'touchdownCallout40Enabled',
        defaultValue: false,
      },
      {
        name: 'touchdownCallout30Enabled',
        defaultValue: false,
      },
      {
        name: 'touchdownCallout20Enabled',
        defaultValue: false,
      },
      {
        name: 'touchdownCallout10Enabled',
        defaultValue: false,
      },
    ]);
  }

  /**
   * Gets the setting for whether the callout for a given altitude is enabled.
   * @param altitude The altitude for which to get the setting.
   * @returns The setting for whether the callout for the specified altitude is enabled.
   */
  public getEnabledSetting(altitude: GarminTawsVoiceCalloutAltitude): UserSetting<boolean> {
    return this.getSetting(TouchdownCalloutUserSettings.ENABLED_SETTING_NAMES[altitude]);
  }

  /**
   * Gets an instance of the touchdown callout user settings manager.
   * @param bus The event bus.
   * @returns An instance of the touchdown callout user settings manager.
   */
  public static getManager(bus: EventBus): TouchdownCalloutUserSettings {
    return TouchdownCalloutUserSettings.INSTANCE ??= new TouchdownCalloutUserSettings(bus);
  }
}