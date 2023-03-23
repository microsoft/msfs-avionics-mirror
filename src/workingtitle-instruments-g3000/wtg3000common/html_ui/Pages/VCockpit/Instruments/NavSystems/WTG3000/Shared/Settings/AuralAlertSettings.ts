import { DefaultUserSettingManager, EventBus, Subscribable } from '@microsoft/msfs-sdk';

/**
 * Aural alert voice types.
 */
export enum AuralAlertVoiceSetting {
  Male = 'Male',
  Female = 'Female'
}

/**
 * Aural alert user settings.
 */
export type AuralAlertUserSettingTypes = {
  /** The voice type to use for aural alerts. */
  auralAlertVoice: AuralAlertVoiceSetting;
}

/**
 * A manager of aural alert user settings.
 */
export class AuralAlertUserSettings extends DefaultUserSettingManager<AuralAlertUserSettingTypes> {
  private static INSTANCE: AuralAlertUserSettings | undefined;

  /**
   * The voice type to use for aural alerts, derived from the user setting. Defaults to the female type if the setting
   * has an invalid value.
   */
  public readonly voice: Subscribable<AuralAlertVoiceSetting> = this.getSetting('auralAlertVoice')
    .map(voiceSetting => voiceSetting === AuralAlertVoiceSetting.Male ? AuralAlertVoiceSetting.Male : AuralAlertVoiceSetting.Female);

  /**
   * Creates a new instance of AuralAlertUserSettings.
   * @param bus The event bus.
   */
  private constructor(bus: EventBus) {
    super(bus, [
      {
        name: 'auralAlertVoice',
        defaultValue: AuralAlertVoiceSetting.Female,
      }
    ]);
  }

  /**
   * Gets an instance of the aural alert user settings manager.
   * @param bus The event bus.
   * @returns An instance of the aural alert user settings manager.
   */
  public static getManager(bus: EventBus): AuralAlertUserSettings {
    return AuralAlertUserSettings.INSTANCE ??= new AuralAlertUserSettings(bus);
  }
}