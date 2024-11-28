import { LNavTransitionMode } from './LNavTypes';

/**
 * A LNAV tracking state.
 */
export type LNavTrackingState = {
  /** Whether LNAV is currently tracking a flight path. */
  isTracking: boolean;

  /** The global index of the tracked flight plan leg. */
  globalLegIndex: number;

  /** The LNAV transition mode. */
  transitionMode: LNavTransitionMode;

  /** The index of the tracked flight path vector. */
  vectorIndex: number;

  /** Whether LNAV sequencing is suspended. */
  isSuspended: boolean;
};

/**
 * Events published by LNAV keyed by base topic names.
 */
export interface BaseLNavEvents {
  /** The current desired track, in degrees true. */
  lnav_dtk: number;

  /**
   * The current crosstrack error, in nautical miles. Negative values indicate deviation to the left, as viewed when
   * facing in the direction of the track. Positive values indicate deviation to the right.
   */
  lnav_xtk: number;

  /** Whether LNAV is tracking a path. */
  lnav_is_tracking: boolean;

  /** The global leg index of the flight plan leg LNAV is currently tracking. */
  lnav_tracked_leg_index: number;

  /** The currently active LNAV transition mode. */
  lnav_transition_mode: LNavTransitionMode;

  /** The index of the vector LNAV is currently tracking. */
  lnav_tracked_vector_index: number;

  /** The current course LNAV is attempting to steer, in degrees true, or `null` if LNAV cannot compute a course to steer. */
  lnav_course_to_steer: number | null;

  /** Whether LNAV is attempting to steer to follow a constant heading instead of a track. */
  lnav_is_steer_heading: boolean;

  /** Whether LNAV sequencing is suspended. */
  lnav_is_suspended: boolean;

  /**
   * The along-track distance from the start of the currently tracked leg to the plane's present position, in nautical
   * miles. A negative distance indicates the plane is before the start of the leg.
   */
  lnav_leg_distance_along: number;

  /**
   * The along-track distance remaining in the currently tracked leg, in nautical miles. A negative distance indicates
   * the plane is past the end of the leg.
   */
  lnav_leg_distance_remaining: number;

  /**
   * The along-track distance from the start of the currently tracked vector to the plane's present position, in
   * nautical miles. A negative distance indicates the plane is before the start of the vector.
   */
  lnav_vector_distance_along: number;

  /**
   * The along-track distance remaining in the currently tracked vector, in nautical miles. A negative distance
   * indicates the plane is past the end of the vector.
   */
  lnav_vector_distance_remaining: number;

  /**
   * The along-track distance from the current vector end where LNAV will sequence to the next vector in nautical miles.
   * A positive value means the vector will be sequenced this distance prior to the vector end.
   */
  lnav_vector_anticipation_distance: number;

  /** The current along-track ground speed of the airplane, in knots. */
  lnav_along_track_speed: number;

  /** The current LNAV tracking state. */
  lnav_tracking_state: LNavTrackingState;

  /** Whether LNAV tracking is currently paused while awaiting lateral flight path calculations to finish. */
  lnav_is_awaiting_calc: boolean;
}

/**
 * Events published by LNAV keyed by indexed topic names.
 */
export type IndexedLNavEvents<Index extends number = number> = {
  [P in keyof BaseLNavEvents as `${P}_${Index}`]: BaseLNavEvents[P];
};

/**
 * Events published by LNAV.
 */
export interface LNavEvents extends BaseLNavEvents, IndexedLNavEvents {
}
