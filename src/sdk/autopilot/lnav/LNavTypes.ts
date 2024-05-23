import { GeoPointInterface } from '../../geo/GeoPoint';

/**
 * LNAV transition modes.
 */
export enum LNavTransitionMode {
  /** LNAV is attempting to track a non-transition vector. */
  None,

  /** LNAV is attempting to track an ingress vector. */
  Ingress,

  /** LNAV is attempting to track an egress vector. */
  Egress,

  /**
   * LNAV is attempting to track a non-transition vector prior to where the ingress transition joins the base flight
   * path after deactivating suspend mode.
   */
  Unsuspend
}

/**
 * An object describing the airplane's state used by LNAV.
 */
export type LNavAircraftState = {
  /** The airplane's position. */
  planePos: GeoPointInterface;

  /** The airplane's ground speed, in knots. */
  gs: number;

  /** The airplane's true ground track, in degrees. */
  track: number;

  /** The airplane's true airspeed, in knots. */
  tas: number;
};

/**
 * An object describing an LNAV tracking state.
 */
export type LNavState = {
  /** The global index of the tracked flight plan leg. */
  globalLegIndex: number;

  /** The transition mode. */
  transitionMode: LNavTransitionMode;

  /** The index of the tracked flight path vector. */
  vectorIndex: number;

  /** Whether leg sequencing is suspended. */
  isSuspended: boolean;

  /** The global index of the flight plan leg for which suspend is inhibited, or `-1` if there is no such leg. */
  inhibitedSuspendLegIndex: number;

  /** Whether to reset the tracked vector to the beginning of the suspended leg once suspend ends. */
  resetVectorsOnSuspendEnd: boolean;

  /** Whether the missed approach is active. */
  isMissedApproachActive: boolean;
};

/**
 * A steering command generated by LNAV.
 */
export type LNavSteerCommand = {
  /** Whether this command is valid. */
  isValid: boolean;

  /** The desired bank angle, in degrees. Positive values indicate left bank. */
  desiredBankAngle: number;

  /** The current desired track, in degrees true. */
  dtk: number;

  /**
   * The current cross-track error, in nautical miles. Positive values indicate that the plane is to the right of the
   * desired track.
   */
  xtk: number;

  /** The current track angle error, in degrees in the range `[-180, 180)`. */
  tae: number;
};