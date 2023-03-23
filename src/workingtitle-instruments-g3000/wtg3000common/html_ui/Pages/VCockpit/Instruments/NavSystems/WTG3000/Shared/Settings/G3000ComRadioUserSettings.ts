import { DefaultUserSettingManager, EventBus, UserSettingManager } from '@microsoft/msfs-sdk';
import { ComRadioSpacingSettingMode, ComRadioUserSettingTypes } from '@microsoft/msfs-garminsdk';
import { ComRadioReceiveMode } from '../Radio/G3000Radio';

/**
 * G3000 settings related to COM radios.
 */
export type G3000ComRadioUserSettingTypes = ComRadioUserSettingTypes & {
  /** The transmitting COM radio. */
  comRadioTransmit: 'COM1' | 'COM2';

  /** The receive/monitor mode of COM radio 1. */
  comRadio1ReceiveMode: ComRadioReceiveMode;

  /** The receive/monitor mode of COM radio 2. */
  comRadio2ReceiveMode: ComRadioReceiveMode;
}

/**
 * Utility class for retrieving G3000 COM radio user settings managers.
 */
export class G3000ComRadioUserSettings {
  private static INSTANCE: DefaultUserSettingManager<G3000ComRadioUserSettingTypes> | undefined;

  /**
   * Retrieves a manager for G3000 COM radio settings.
   * @param bus The event bus.
   * @returns A manager for G3000 COM radio settings.
   */
  public static getManager(bus: EventBus): UserSettingManager<G3000ComRadioUserSettingTypes> {
    return G3000ComRadioUserSettings.INSTANCE ??= new DefaultUserSettingManager(bus, [
      {
        name: 'comRadioSpacing',
        defaultValue: ComRadioSpacingSettingMode.Spacing25Khz
      },
      {
        name: 'comRadioTransmit',
        defaultValue: 'COM1',
      },
      {
        name: 'comRadio1ReceiveMode',
        defaultValue: ComRadioReceiveMode.TransmitOnly,
      },
      {
        name: 'comRadio2ReceiveMode',
        defaultValue: ComRadioReceiveMode.TransmitOnly,
      }
    ]);
  }
}