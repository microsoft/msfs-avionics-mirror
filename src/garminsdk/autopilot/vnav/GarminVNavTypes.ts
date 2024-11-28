import { Accessible, VNavAltCaptureType, VNavPathMode, VNavState } from '@microsoft/msfs-sdk';

import { TodBodDetails } from '@microsoft/msfs-sdk';

/**
 * Glidepath service levels.
 */
export enum GlidepathServiceLevel {
  /** No glidepath. */
  None,

  /** Visual. */
  Visual,

  /** Visual with baro-VNAV. */
  VisualBaro,

  /** LNAV+V. */
  LNavPlusV,

  /** LNAV+V with baro-VNAV. */
  LNavPlusVBaro,

  /** LNAV/VNAV. */
  LNavVNav,

  /** LNAV/VNAV with baro-VNAV. */
  LNavVNavBaro,

  /** LP+V. */
  LpPlusV,

  /** LPV. */
  Lpv,

  /** RNP. */
  Rnp,

  /** RNP with baro-VNAV. */
  RnpBaro,
}

/**
 * Details about the next TOD and BOD for Garmin VNAV.
 */
export interface GarminTodBodDetails extends Omit<TodBodDetails, 'currentConstraintLegIndex'> {
  /** The index of the VNAV constraint defining the BOD altitude, or `-1` if there is no BOD. */
  bodConstraintIndex: number;

  /** The index of the VNAV constraint defining the descent path along which the TOD lies, or `-1` if there is no TOD. */
  todConstraintIndex: number;
}

/**
 * Autopilot values used by a Garmin VNAV computer.
 */
export type GarminVNavComputerAPValues = {
  /** The selected reference altitude, in feet. */
  selectedAltitude: Accessible<number>;

  /** The selected reference vertical speed, in feet per minute. */
  selectedVerticalSpeed: Accessible<number>;

  /** The active lateral mode. */
  lateralActive: Accessible<number>;

  /** The active vertical mode. */
  verticalActive: Accessible<number>;

  /** The armed vertical mode. */
  verticalArmed: Accessible<number>;
};

/**
 * An object describing Garmin VNAV guidance.
 */
export type GarminVNavGuidance = {
  /** The state of VNAV. */
  state: VNavState;

  /** Whether VNAV guidance is active. */
  isActive: boolean;

  /** The current VNAV path mode. */
  pathMode: VNavPathMode;

  /** The climb mode to arm. */
  armedClimbMode: number;

  /** Whether the armed climb mode should be activated. */
  shouldActivateClimbMode: boolean;

  /** The current VNAV altitude capture type. */
  altitudeCaptureType: VNavAltCaptureType;

  /** Whether an altitude should be captured. */
  shouldCaptureAltitude: boolean;

  /** The altitude to capture, in feet. */
  altitudeToCapture: number;
};

/**
 * Vertical path guidance issued by Garmin VNAV.
 */
export type GarminVNavPathGuidance = {
  /** Whether this guidance is valid. */
  isValid: boolean;

  /**
   * The flight path angle of the vertical track, in degrees. Positive angles indicate a downward-sloping
   * track.
   */
  fpa: number;

  /**
   * The deviation of the vertical track from the airplane, in feet. Positive values indicate the track lies above
   * the airplane.
   */
  deviation: number;
};

/**
 * Glidepath guidance issued by Garmin VNAV.
 */
export type GarminVNavGlidepathGuidance = {
  /** Whether the currently loaded approach has glidepath guidance. */
  approachHasGlidepath: boolean;

  /** Whether this guidance is valid. */
  isValid: boolean;

  /** Whether the glidepath can be captured from an armed state. */
  canCapture: boolean;

  /** The flight path angle of the glidepath, in degrees. Positive angles indicate a downward-sloping path. */
  fpa: number;

  /**
   * The deviation of the glidepath from the airplane, in feet. Positive values indicate the path lies above the
   * airplane.
   */
  deviation: number;
};