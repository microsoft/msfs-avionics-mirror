/**
 * Events used to control LNAV OBS keyed by base topic names.
 */
export interface BaseLNavObsControlEvents {
  /** Sets whether OBS is active. */
  lnav_obs_set_active: boolean;

  /** Toggles whether OBS is active. */
  lnav_obs_toggle_active: void;

  /** Sets the magnetic OBS course, in degrees. */
  lnav_obs_set_course: number;

  /** Increments the OBS course by one degree. */
  lnav_obs_inc_course: void;

  /** Decrements the OBS course by one degree. */
  lnav_obs_dec_course: void;
}

/**
 * Events used to control LNAV OBS keyed by indexed topic names.
 */
export type IndexedLNavObsControlEvents<Index extends number = number> = {
  [P in keyof BaseLNavObsControlEvents as `${P}_${Index}`]: BaseLNavObsControlEvents[P];
};

/**
 * Events used to control LNAV OBS.
 */
export type LNavObsControlEvents = BaseLNavObsControlEvents & IndexedLNavObsControlEvents;