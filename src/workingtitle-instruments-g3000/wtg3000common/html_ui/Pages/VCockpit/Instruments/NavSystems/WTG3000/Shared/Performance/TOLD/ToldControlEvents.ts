/**
 * Events used to control the TOLD (takeoff/landing) performance computer.
 */
export interface ToldControlEvents {
  /** A command to load takeoff data into landing data for an emergency return. */
  told_load_emergency_return: void;
}