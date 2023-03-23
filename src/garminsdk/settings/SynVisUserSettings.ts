/**
 * Synthetic vision technology (SVT) user settings.
 */
export type SynVisUserSettingTypes = {
  /** Whether SVT is enabled. */
  svtEnabled: boolean;

  /** Whether to show the flight path marker when SVT is disabled. */
  svtDisabledFpmShow: boolean;

  /** Whether to show SVT horizon heading labels. */
  svtHeadingLabelShow: boolean;

  /** Whether to show SVT airport signs. */
  svtAirportSignShow: boolean;

  /** Whether to show SVT pathways. */
  svtPathwaysShow: boolean;

  /** Whether to show SVT traffic. */
  svtTrafficShow: boolean;
};