/**
 * Events related to LNAV data keyed by base topic names.
 */
export interface BaseLNavDataEvents {
  /** The current nominal desired track, in degrees true. */
  lnavdata_dtk_true: number;

  /** The current nominal desired track, in degrees magnetic. */
  lnavdata_dtk_mag: number;

  /**
   * The current nominal crosstrack error, in nautical miles. Negative values indicate deviation to the left, as viewed
   * when facing in the direction of the track. Positive values indicate deviation to the right.
   */
  lnavdata_xtk: number;

  /** The current CDI scale, in nautical miles. */
  lnavdata_cdi_scale: number;

  /** The nominal bearing to the next waypoint currently tracked by LNAV, in degrees true. */
  lnavdata_waypoint_bearing_true: number;

  /** The nominal bearing to the next waypoint tracked by LNAV, in degrees magnetic. */
  lnavdata_waypoint_bearing_mag: number;

  /** The nominal distance remaining to the next waypoint currently tracked by LNAV, in nautical miles. */
  lnavdata_waypoint_distance: number;

  /** The nominal distance remaining to the destination, in nautical miles. */
  lnavdata_destination_distance: number;

  /** The nominal ident of the next waypoint tracked by LNAV. */
  lnavdata_waypoint_ident: string;
}

/**
 * Events related to LNAV keyed by indexed topic names.
 */
export type IndexedLNavDataEvents<Index extends number = number> = {
  [P in keyof BaseLNavDataEvents as `${P}_${Index}`]: BaseLNavDataEvents[P];
};

/**
 * Events related to LNAV.
 */
export interface LNavDataEvents extends BaseLNavDataEvents, IndexedLNavDataEvents {
}
