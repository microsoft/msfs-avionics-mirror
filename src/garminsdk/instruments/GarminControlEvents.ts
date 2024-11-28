/** General Garmin-related control events. */
export interface GarminControlEvents {
  /**
   * An event that indicates whether or not OBS is available.
   * @deprecated Use the equivalent topic defined in `LNavDataEvents` instead.
   */
  obs_available: boolean;

  /** Signals that the flight director is not installed if `true`. */
  fd_not_installed: boolean;
}
