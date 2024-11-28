/**
 * Types of reset operations for takeoff/landing (TOLD) data.
 */
export enum ToldResetType {
  /** Reset takeoff data. */
  Takeoff = 'Takeoff',

  /** Reset landing data. */
  Landing = 'Landing',

  /** Reset takeoff and landing data. */
  All = 'All'
}

/**
 * Events used to control takeoff/landing (TOLD) data.
 */
export interface ToldControlEvents {
  /** A command to reset TOLD data. */
  told_reset: ToldResetType;

  /** A command to load TOLD takeoff performance data into landing performance data for an emergency return. */
  told_load_emergency_return: void;
}
