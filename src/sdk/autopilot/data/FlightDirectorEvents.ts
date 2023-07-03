

/**
 * Events related to flight director values.
 * NOTE: This interface is specifically for internal avionics FD events and not for sim-derived flight director values.
 */
export interface FlightDirectorEvents {
  /** The current target bank angle, in degrees (negative values represent right bank, positive values left bank). */
  fd_target_bank: number;

  /** The current target pitch angle, in degrees (negative values represent up pitch, positive values down pitch). */
  fd_target_pitch: number;

  /**
   * The centerline deviation for takeoff mode, in feet, or `null` when deviation is not available. Positive values
   * indicate airplane deviation to the right of the centerline.
   */
  fd_takeoff_deviation: number | null;
}
