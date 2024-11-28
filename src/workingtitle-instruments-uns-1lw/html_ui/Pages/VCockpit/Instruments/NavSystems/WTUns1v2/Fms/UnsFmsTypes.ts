import {
  AirportFacility, ExtendedApproachType, Facility, FlightPlanLeg, LegTurnDirection, OneWayRunway, RnavTypeFlags, VorFacility
} from '@microsoft/msfs-sdk';

export enum UnsFlightPlans {
  Active = 0, // primary active plan TODO: is this right?
  Pending = 1, // primary plan in mod TODO: is this right?
  Alternate = 2,
  Secondary = 3,
}

export enum UnsUserDataKeys {
  USER_DATA_KEY_ALTN = 'uns1.altn',
  USER_DATA_KEY_STORED_HOLD = 'uns1.stored-hold',
  USER_DATA_KEY_FIX_INFO = 'uns1.fix-info',
  USER_DATA_KEY_VISUAL_APPROACH = 'uns1.visual-approach',
  USER_DATA_KEY_VISUAL_APPROACH_VFR_VPA = 'uns1.visual-approach-vfr-vpa',
  USER_DATA_KEY_APPROACH_STATE = 'uns1.approach-state',
}

export enum DirectToState {
  NONE,
  TOEXISTING,
}

/**
 * Additional Bitflags describing a leg definition specific to the Epic2 FMS
 */
export enum UnsExtraLegDefinitionFlags {
  /** Origin leg of a PVOR */
  PVorOriginLeg = (1 << 28),

  /**
   * A leg that was part of the active leg pair in a procedure when the procedure was removed, and was subsequently
   * moved to another segment in the plan.
   */
  DisplacedActiveLeg = (1 << 29),

  ProcedureLeg = (1 << 30),

  /**
   * Applied to the target leg of a direct to
   */
  DirectToTarget = (1 << 31),
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
}

/** The current internal approach state */
export enum UnsApproachState {
  None,
  Armed,
  AwaitingTune,
  Active,
  Missed,
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
  EXIT_ENTRY,
}

/**
 * UNS FMS direct to options
 */
export interface UnsFmsDirectToOptions {
  /** the index of the segment containing the leg to activate as direct to. */
  segmentIndex?: number,

  /** is the index of the leg in the specified segment to activate as direct to. */
  segmentLegIndex?: number,

  /** whether to treat this as a new direct to or not. Defaults to `true`. */
  isNewDto: boolean,

  /** is the course for this direct to in degrees magnetic, if specified. */
  course?: number,

  /** is the new facility to add to the plan and then create a direct to for, for the case of a direct to random. */
  facility?: Facility,

  /** is the specified turn direction, if desired */
  turnDirection?: LegTurnDirection,
}

/**
 * A fix output to an existing flight plan waypoint
 */
interface FixExistingOutput {
  /** The type of hold fix */
  type: 'existing',

  /** The segment index of the leg to hold at */
  segmentIndex: number,

  /** The local leg index of the leg to hold at */
  localLegIndex: number,

  /** The ICAO of the facility to hold at */
  facilityIcao: string,
}

/**
 * A fix output to a random facility
 */
interface FixRandomOutput {
  /** The type of hold fix */
  type: 'random',

  /** The ICAO of the facility to hold at */
  facilityIcao: string,
}

/**
 * A hold fix output by a waypoint selection field
 */
export type FixEntry = FixExistingOutput | FixRandomOutput

/**
 * Contains data regarding a pending hold that was edited on the HOLDING page
 */
export interface StoredHold {
  /** The holding fix specification */
  entry: FixEntry,

  /** The leg data for the hold */
  leg: FlightPlanLeg,
}

/**
 * Object describing a PVOR maneuver
 */
export interface PVorDescription {
  /** The type of PVOR */
  type: 'track' | 'inboundRadial' | 'outboundRadial',

  /** The fix entry */
  fixEntry: FixEntry,

  /** The bearing, in true degrees */
  bearing: number,
}
