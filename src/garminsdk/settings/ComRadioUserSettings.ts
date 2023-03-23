import { DefaultUserSettingManager, EventBus, UserSettingManager } from '@microsoft/msfs-sdk';

/**
 * Setting modes for COM radio channel spacing.
 */
export enum ComRadioSpacingSettingMode {
  Spacing25Khz = '25Khz',
  Spacing8_33Khz = '8.33Khz'
}

/**
 * COM radio user settings.
 */
export type ComRadioUserSettingTypes = {
  /** COM radio channel spacing mode. */
  comRadioSpacing: ComRadioSpacingSettingMode;
};

/**
 * Utility class for retrieving COM radio user setting managers.
 */
export class ComRadioUserSettings {
  private static INSTANCE: DefaultUserSettingManager<ComRadioUserSettingTypes> | undefined;

  /**
   * Retrieves a manager for COM radio user settings.
   * @param bus The event bus.
   * @returns A manager for COM radio user settings.
   */
  public static getManager(bus: EventBus): UserSettingManager<ComRadioUserSettingTypes> {
    return ComRadioUserSettings.INSTANCE ??= new DefaultUserSettingManager(bus, [
      {
        name: 'comRadioSpacing',
        defaultValue: ComRadioSpacingSettingMode.Spacing25Khz
      }
    ]);
  }
}