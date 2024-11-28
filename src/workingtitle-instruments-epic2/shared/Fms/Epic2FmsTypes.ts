import {
  AirportFacility, ExtendedApproachType, Facility, FlightPlanLeg, OneWayRunway, RnavTypeFlags, SpeedConstraint, VerticalFlightPhase, VorFacility
} from '@microsoft/msfs-sdk';

export enum Epic2FlightPlans {
  Active = 0, // primary active plan TODO: is this right?
  Pending = 1, // primary plan in mod TODO: is this right?
  Alternate = 2,
  Secondary = 3,
}

export enum Epic2UserDataKeys {
  USER_DATA_KEY_ALTN = 'epic2.altn',
  USER_DATA_KEY_FIX_INFO = 'epic2.fix-info',
  USER_DATA_KEY_VISUAL_APPROACH = 'epic2.visual-approach',
  USER_DATA_KEY_VISUAL_APPROACH_VFR_VPA = 'epic2.visual-approach-vfr-vpa',
  USER_DATA_KEY_DIRECT_TO_ORIGIN = 'epic2.direct-to-origin'
}

export enum DirectToState {
  NONE,
  TOEXISTING
}

/**
 * Additional Bitflags describing a leg definition specific to the Epic2 FMS
 */
export enum Epic2ExtraLegDefinitionFlags {
  /** A leg which should be labelled Fly HDG Sel to intercept */
  HeadingInterceptLeg = (1 << 27),
  /**
   * A leg that was part of the active leg pair in a procedure when the procedure was removed, and was subsequently
   * moved to another segment in the plan.
   */
  DisplacedActiveLeg = (1 << 28),

  ProcedureLeg = (1 << 29),

  /**
   * Applied to the target leg of a direct to
   */
  DirectToTarget = (1 << 30),
  /**
   * Applied to the origin leg of a direct to
   */
  DirectToOrigin = (1 << 31),
}

/**
 * Details of an approach insertion into the flight plan
 */
export interface ApproachProcedureDescription {
  /** The airport facility the approach is at */
  facility: AirportFacility,
  /** The index of the desired approach procedure */
  approachIndex: number,
  /** The index of the desired approach transition */
  approachTransitionIndex: number,
  /** The runway number of the visual approach, if applicable */
  visualRunwayNumber?: number,
  /** The runway designator of the visual approach, if applicable */
  visualRunwayDesignator?: RunwayDesignator,
  /** The runway extension distance of the visual approach, if applicable */
  visualRunwayOffset?: number,
  /** The vertical path angle of the VFR approach, if applicable */
  vfrVerticalPathAngle?: number,
  /** TODO */
  transStartIndex?: number,
}

/** FMS Approach Details */
export type ApproachDetails = {
  /** Whether an approach is loaded */
  approachLoaded: boolean,
  /** The Approach Type */
  approachType: ExtendedApproachType,
  /** The Approach RNAV Type */
  approachRnavType: RnavTypeFlags,
  /** Whether the approach is active */
  approachIsActive: boolean,
  /** Whether the approach is circling */
  approachIsCircling: boolean,
  /** The approach's name */
  approachName: string,
  /** The runway associated with the approach */
  approachRunway: string,
  /** The missed approach point facility, with only the basic {@link Facility} properties, or null if none. */
  missedApproachFacility: Facility | null,
  /** The reference navaid for the approach */
  referenceFacility: VorFacility | null,
  /** Final approach course (last leg), -1 when invalid */
  finalApproachCourse: number,
  /** The selected approach RNAV minima */
  selectedRnavMinima: RnavMinima
}

/** Landing field information for an active flight plan */
export interface LandingFieldInfo {
  /** The Landing field ident */
  ident: string,
  /** The Landing field elevation, in feet */
  elevation: number
}

/**
 * A leg in an insert procedure object.
 */
export type InsertProcedureObjectLeg = FlightPlanLeg & {
  /** Leg definition flags to apply when adding the leg to the flight plan. */
  flags?: number;
};

/**
 * A type definition for inserting procedure legs and runway, if it exists.
 */
export type InsertProcedureObject = {
  /** The Procedure Legs */
  procedureLegs: InsertProcedureObjectLeg[],
  /** The OneWayRunway Object if it exists */
  runway?: OneWayRunway
}

/** Facility and runway information for the flight. */
export type FacilityInfo = {
  /** Facility info for the origin airport. */
  originFacility: AirportFacility | undefined;
  /** Facility info for the destination airport. */
  destinationFacility: AirportFacility | undefined;
}

/** Interface for inverting the plan */
export interface LegList {
  /** the leg icao */
  icao: string;
  /** the airway to this leg, if any */
  airway?: string;
}

export enum AirwayLegType {
  NONE,
  ENTRY,
  EXIT,
  ONROUTE,
  EXIT_ENTRY
}

export enum RnavMinima {
  None = 'None',
  LNAV = 'LNAV/(VNAV)',
  LP = 'LP',
  LPV = 'LPV',
}

/**
 * Sources of FMS-computed speed targets.
 */
export enum FmsSpeedTargetSource {
  /** No source. Used when FMS has no computed speed target. */
  None = 'None',

  /** Speed target is derived from aircraft configuration limits (flaps, gear, etc). */
  Configuration = 'Configuration',

  /** Speed target is derived from departure terminal speed limits. */
  Departure = 'Departure',

  /** Speed target is derived from arrival terminal speed limits. */
  Arrival = 'Arrival',

  /** Speed target is derived from user-defined altitude speed limits (e.g. 250 knots below 10000 feet). */
  Altitude = 'Altitude',

  /** Speed target is derived from speed constraints in the flight plan. */
  Constraint = 'Constraint',

  /** Speed target is derived from user-defined performance schedules. */
  ClimbSchedule = 'ClimbSchedule',

  /** Speed target is derived from user-defined performance schedules. */
  CruiseSchedule = 'CruiseSchedule',

  /** Speed target is derived from user-defined performance schedules. */
  DescentSchedule = 'DescentSchedule'
}

export enum Epic2VerticalFlightPhase {
  None = 'None',
  Climb = 'Climb',
  Cruise = 'Cruise',
  Descent = 'Descent'
}

/**
 * A item containing a speed constraint from a flight plan and associated metadata.
 */
export type SpeedConstraintListItem = {
  /** This item's speed constraint. */
  speedConstraint: Readonly<SpeedConstraint>;

  /** The global index of the flight plan leg associated with this item's speed constraint. */
  globalLegIndex: number;

  /** The vertical flight phase of this item's speed constraint. */
  flightPhase: VerticalFlightPhase;

  /** Whether this item's speed constraint is part of a missed approach procedure. */
  isMissedApproach: boolean;
}
