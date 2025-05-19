import { DefaultUserSettingManager, EventBus, UserSettingManager } from '@microsoft/msfs-sdk';

import { BaroTransitionAlertUserSettingTypes } from '@microsoft/msfs-garminsdk';

/**
 * G3000 barometric transition alert user settings.
 */
export type G3000BaroTransitionAlertUserSettingTypes = BaroTransitionAlertUserSettingTypes & {
  /**
   * The manually defined altitude at which to activate the barometric transition altitude alert, in feet. Values less
   * than zero are treated as undefined.
   */
  baroTransitionAlertAltitudeManualThreshold: number;

  /**
   * The automatically defined altitude at which to activate the barometric transition altitude alert, in feet. Values
   * less than zero are treated as undefined.
   */
  baroTransitionAlertAltitudeAutoThreshold: number;

  /**
   * The manually defined altitude at which to activate the barometric transition level alert, in feet. Values less
   * than zero are treated as undefined.
   */
  baroTransitionAlertLevelManualThreshold: number;

  /**
   * The automatically defined altitude at which to activate the barometric transition level alert, in feet. Values
   * less than zero are treated as undefined.
   */
  baroTransitionAlertLevelAutoThreshold: number;
};

/**
 * Utility class for retrieving G3000 barometric transition alert user settings managers.
 */
export class BaroTransitionAlertUserSettings {
  private static INSTANCE: DefaultUserSettingManager<G3000BaroTransitionAlertUserSettingTypes> | undefined;

  /**
   * Gets an instance of the barometric transition alert user settings manager.
   * @param bus The event bus.
   * @returns An instance of the barometric transition alert user settings manager.
   */
  public static getManager(bus: EventBus): UserSettingManager<G3000BaroTransitionAlertUserSettingTypes> {
    return BaroTransitionAlertUserSettings.INSTANCE ??= new DefaultUserSettingManager(bus, [
      {
        name: 'baroTransitionAlertAltitudeEnabled',
        defaultValue: true
      },
      {
        name: 'baroTransitionAlertAltitudeThreshold',
        defaultValue: -1
      },
      {
        name: 'baroTransitionAlertAltitudeManualThreshold',
        defaultValue: -1
      },
      {
        name: 'baroTransitionAlertAltitudeAutoThreshold',
        defaultValue: -1
      },
      {
        name: 'baroTransitionAlertLevelEnabled',
        defaultValue: true
      },
      {
        name: 'baroTransitionAlertLevelThreshold',
        defaultValue: -1
      },
      {
        name: 'baroTransitionAlertLevelManualThreshold',
        defaultValue: -1
      },
      {
        name: 'baroTransitionAlertLevelAutoThreshold',
        defaultValue: -1
      },
    ]);
  }
}
