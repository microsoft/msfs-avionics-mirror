/**
 * Barometric transition alert user settings.
 */
export type BaroTransitionAlertUserSettingTypes = {
  /** Whether the barometric transition altitude alert is enabled. */
  baroTransitionAlertAltitudeEnabled: boolean;

  /**
   * The altitude at which to activate the barometric transition altitude alert, in feet. Values less than zero will
   * effectively disable the alert.
   */
  baroTransitionAlertAltitudeThreshold: number;

  /** Whether the barometric transition level alert is enabled. */
  baroTransitionAlertLevelEnabled: boolean;

  /**
   * The altitude at which to activate the barometric transition level alert, in feet. Values less than zero will
   * effectively disable the alert.
   */
  baroTransitionAlertLevelThreshold: number;
};
