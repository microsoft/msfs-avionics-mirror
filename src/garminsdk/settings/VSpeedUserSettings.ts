/**
 * Type descriptions for reference V-speed user settings.
 */
export type VSpeedUserSettingTypes = {
  /** The current value of a V-speed reference, in knots. */
  [value: `vSpeedValue_${string}`]: number;

  /** Whether to show a V-speed reference on the PFD airspeed indicator. */
  [show: `vSpeedShow_${string}`]: boolean;
};