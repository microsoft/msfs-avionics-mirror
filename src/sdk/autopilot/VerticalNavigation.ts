import { SpeedConstraint } from '../flightplan';
import { AltitudeRestrictionType } from '../navigation';

/**
 * The current vertical navigation state.
 */
export enum VNavState {
  /** VNAV Disabled. */
  Disabled,

  /** VNAV Enabled and Inactive. */
  Enabled_Inactive,

  /** VNAV Enabled and Active. */
  Enabled_Active
}

/**
 * The current VNAV path mode.
 */
export enum VNavPathMode {
  /** VNAV path is not active. */
  None,

  /** VNAV path is armed for capture. */
  PathArmed,

  /** VNAV path is actively navigating. */
  PathActive,

  /** The current VNAV path is not valid. */
  PathInvalid
}

/**
 * The current Approach Guidance Mode.
 */
export enum ApproachGuidanceMode {
  /** VNAV is not currently following approach guidance. */
  None,

  /** VNAV has armed ILS glideslope guidance for capture. */
  GSArmed,

  /** VNAV is actively following ILS glideslope guidance. */
  GSActive,

  /** VNAV RNAV glidepath guidance is armed for capture. */
  GPArmed,

  /** VNAV is actively follow RNAV glidepath guidance. */
  GPActive
}

/**
 * The current VNAV altitude capture type.
 */
export enum VNavAltCaptureType {
  /** Altitude capture is not armed. */
  None,

  /** Altitude will capture the selected altitude. */
  Selected,

  /** Altitude will capture the VANV target altitude. */
  VNAV
}

/**
 * A Vertical Flight Plan cooresponding to a lateral flight plan.
 */
export interface VerticalFlightPlan {

  /** The Flight Plan Index */
  planIndex: number;

  /** The number of legs in this flight plan. */
  length: number;

  /** The Flight Plan Segments in the VerticalFlightPlan (should always be the same as the lateral plan) */
  segments: VNavPlanSegment[];

  /** The VNav Constraints in this Vertical Flight Plan */
  constraints: VNavConstraint[];

  /** The global leg index of the destination leg, or undefined */
  destLegIndex: number | undefined;

  /** The global leg index of the FAF leg, or undefined */
  fafLegIndex: number | undefined;

  /** The global leg index of the first descent constraint, or undefined */
  firstDescentConstraintLegIndex: number | undefined;

  /** The global leg index of the last descent constraint, or undefined */
  lastDescentConstraintLegIndex: number | undefined;

  /** The global leg index of the first missed approach leg, or undefined */
  missedApproachStartIndex: number | undefined;

  /** The global leg index of the currently active vertical direct leg, or undefined */
  verticalDirectIndex: number | undefined;

  /**
   * The flight path angle, in degrees, of this plan's vertical direct constraint, or `undefined` if there is no
   * vertical direct constraint. Positive angles represent descending paths.
   */
  verticalDirectFpa: number | undefined;

  /** The current along leg distance for the active lateral leg in this flight plan */
  currentAlongLegDistance: number | undefined;

  /** Whether the corresponding lateral flight plan has changed since the last time this plan was calculated. */
  planChanged: boolean;
}

/**
 * Details about the next TOD and BOD.
 */
export interface TodBodDetails {
  /**
   * The global index of the leg that contains the next BOD, or -1 if there is no BOD. The next BOD is defined as the
   * next point in the flight path including or after the active leg where the VNAV profile transitions from a descent
   * to a level-off, discontinuity, or the end of the flight path. The BOD is always located at the end of its
   * containing leg.
   */
  bodLegIndex: number;

  /**
   * The global index of the leg that contains the TOD associated with the next BOD, or -1 if there is no such TOD. The
   * TOD is defined as the point along the flight path at which the aircraft will intercept the VNAV profile continuing
   * to the next BOD if it continues to fly level at its current altitude.
   */
  todLegIndex: number;

  /** The distance from the TOD to the end of its containing leg, in meters. */
  todLegDistance: number;

  /** The distance along the flight path from the airplane's present position to the TOD, in meters. */
  distanceFromTod: number;

  /** The distance along the flight path from the airplane's present position to the BOD, in meters. */
  distanceFromBod: number;

  /** The global index of the leg that contains the current VNAV constraint. */
  currentConstraintLegIndex: number;
}

/**
 * Details about the next TOC and BOC.
 */
export interface TocBocDetails {
  /**
   * The global index of the leg that contains the next BOC, or -1 if there is no BOC. The BOC is always located at the
   * beginning of its containing leg.
   */
  bocLegIndex: number;

  /** The global index of the leg that contains the next TOC, or -1 if there is no such TOC. */
  tocLegIndex: number;

  /** The distance from the TOC to the end of its containing leg, in meters. */
  tocLegDistance: number;

  /** The distance along the flight path from the airplane's present position to the TOC, in meters. */
  distanceFromToc: number;

  /** The distance along the flight path from the airplane's present position to the BOC, in meters. */
  distanceFromBoc: number;

  /** The index of the vertical constraint defining the TOC altitude, or -1 if there is no TOC. */
  tocConstraintIndex: number;

  /** The TOC altitude in meters. A negative value indicates there is no TOC. */
  tocAltitude: number;
}

/**
 * A leg in the calculated Vertical Flight Plan.
 */
export interface VNavLeg {
  /** The index of the flight plan segment. */
  segmentIndex: number,

  /** The index of the leg within the plan segment. */
  legIndex: number,

  /** The name of the leg. */
  name: string,

  /** The fpa of the leg in degrees. Always a positive number. */
  fpa: number,

  /** The distance of the leg in meters. */
  distance: number,

  /** Whether the leg is eligible for VNAV. */
  isEligible: boolean;

  /** If the leg is a bottom of descent. */
  isBod: boolean,

  /** Whether or not the altitude provided is advisory. */
  isAdvisory: boolean,

  /** The altitude that the leg ends at in meters. */
  altitude: number,

  /** Whether or not the constraint at this leg is user defined. */
  isUserDefined: boolean,

  /** Whether or not the leg is a direct to target. */
  isDirectToTarget: boolean,

  /** The constrant altitude assigned to this leg that is invalid, in meters, if one exists. */
  invalidConstraintAltitude?: number
}

/**
 * A Vertical Flight Plan Constraint.
 */
export interface VNavConstraint {
  /** The global leg index for the constraint. */
  index: number,

  /** The minimum altitude of the constraint in meters, or negative infinity if the constraint has no minimum altitude. */
  minAltitude: number,

  /** The max altitude of the constraint in meters, or positive infinity if the constraint has no maximum altitude. */
  maxAltitude: number,

  /** The target altitude of the constraint in meters. */
  targetAltitude: number,

  /**
   * Whether or not this constraint is a target that will be held at
   * during a level-off or whether it will instead be passed through
   * with no level off.
   */
  isTarget: boolean,

  /** Whether or not this constraint is the last constraint prior to a MANSEQ or other VNAV ineligible leg type. */
  isPathEnd: boolean,

  /** If this constraint isPathEnd, what is the leg index of the next vnav eligible leg. */
  nextVnavEligibleLegIndex?: number,

  /** The name of the leg at this constraint. */
  name: string,

  /** The total distance of the legs that make up this constriant segment in meters. */
  distance: number,

  /** The flight path angle to take through the legs in this constraint in degrees. Always a positive number. */
  fpa: number,

  /** The legs contained in this constraint segment. */
  legs: VNavLeg[],

  /** The type of constraint segment. */
  // type: 'normal' | 'dest' | 'cruise' | 'dep' | 'direct' | 'missed' | 'manual' | 'climb' | 'descent',
  type: 'climb' | 'descent' | 'direct' | 'manual' | 'missed' | 'dest',

  /** Whether or not this constraint is beyond the FAF. */
  isBeyondFaf: boolean
}

/**
 * A segment in the Vertical Flight Plan.
 */
export interface VNavPlanSegment {
  /** The index offset that the segment begins at. */
  offset: number,

  /** The VNAV legs contained in the segment. */
  legs: VNavLeg[]
}

/**
 * The current state of VNAV availability from the director.
 */
export enum VNavAvailability {
  Available = 'Available',
  InvalidLegs = 'InvalidLegs'
}

/**
 * The current altitude constraint details including target altitude and type.
 */
export type AltitudeConstraintDetails = {
  /** The type of this constraint. */
  type: Exclude<AltitudeRestrictionType, AltitudeRestrictionType.Between>;

  /** The altitude for this constraint, in feet. */
  altitude: number;
};

/**
 * The current speed constraint details including the currently applicable speed constraint (if any),
 * the next speed constraint (if any) and the distance to the next speed constraint (if any).
 */
export type SpeedConstraintDetails = {

  /** The currently applicable speed constraint. */
  readonly currentSpeedConstraint: SpeedConstraint;

  /** The next applicable speed constraint. */
  readonly nextSpeedConstraint: SpeedConstraint;

  /** The distance to the next speed constraint, in NM. */
  readonly distanceToNextSpeedConstraint?: number;
};