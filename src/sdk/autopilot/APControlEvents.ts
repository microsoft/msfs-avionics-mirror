/**
 * Events used for controlling the autopilot
 */
export interface APControlEvents {
  /** The maximum nose up pitch angle the autopilot can command in degrees. */
  ap_set_max_nose_up_pitch: number

  /** The maximum nose down pitch angle the autopilot can command in degrees. */
  ap_set_max_nose_down_pitch: number
}
