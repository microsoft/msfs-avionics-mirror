import { AltitudeRestrictionType, FlightPlanLeg, IcaoValue, OneWayRunway, SpeedRestrictionType } from '../navigation';
import { FlightPathVector } from './flightpath/FlightPathVector';

/**
 * A record of indexes describing the location of a flight plan leg within a flight plan.
 */
export interface FlightPlanLegIndexes {
  /** The index of the leg's containing segment. */
  segmentIndex: number;

  /** The index of the leg in its containing segment. */
  segmentLegIndex: number;
}

/**
 * The details of procedures selected in the flight plan.
 */
export interface ProcedureDetails {
  // **********************************************************************************************************
  // ******** When adding new fields, they MUST be initialized in FlightPlan.createProcedureDetails(), ********
  // ******** even if it just gets set to undefined. This is so that it can be used with Object.keys() ********
  // **********************************************************************************************************

  /** The selected origin runway. */
  originRunway: OneWayRunway | undefined;

  /**
   * The ICAO value of the airport facility associated with the flight plan's selected published departure procedure,
   * or `undefined` if the flight plan does not have a selected published departure procedure.
   */
  departureFacilityIcaoStruct: IcaoValue | undefined;

  /**
   * The ICAO string (V1) of the airport facility associated with the flight plan's selected published departure
   * procedure, or `undefined` if the flight plan does not have a selected published departure procedure.
   * @deprecated Please use `departureFacilityIcaoStruct` instead.
   */
  departureFacilityIcao: string | undefined;

  /**
   * The index of the flight plan's selected published departure procedure in the departure airport's departures
   * array, or `-1` if the flight plan does not have a selected published departure procedure.
   */
  departureIndex: number;

  /**
   * The index of the flight plan's selected published departure enroute transition in the departure procedure's
   * enroute transitions array, or `-1` if the flight plan does not have a selected published departure enroute
   * transition.
   */
  departureTransitionIndex: number;

  /**
   * The index of the flight plan's selected published departure runway transition in the departure procedure's runway
   * transitions array, or `-1` if the flight plan does not have a selected published departure runway transition.
   */
  departureRunwayIndex: number;

  /**
   * The ICAO value of the airport facility associated with the flight plan's selected published arrival procedure,
   * or `undefined` if the flight plan does not have a selected published arrival procedure.
   */
  arrivalFacilityIcaoStruct: IcaoValue | undefined;

  /**
   * The ICAO string (V1) of the airport facility associated with the flight plan's selected published arrival
   * procedure, or `undefined` if the flight plan does not have a selected published arrival procedure.
   * @deprecated Please use `arrivalFacilityIcaoStruct` instead.
   */
  arrivalFacilityIcao: string | undefined;

  /**
   * The index of the flight plan's selected published arrival procedure in the arrival airport's arrivals array, or
   * `-1` if the flight plan does not have a selected published arrival procedure.
   */
  arrivalIndex: number;

  /**
   * The index of the flight plan's selected published arrival enroute transition in the arrival procedure's enroute
   * transitions array, or `-1` if the flight plan does not have a selected published arrival enroute transition.
   */
  arrivalTransitionIndex: number;

  /**
   * The index of the flight plan's selected published arrival runway transition in the arrival procedure's runway
   * transitions array, or `-1` if the flight plan does not have a selected published arrival runway transition.
   */
  arrivalRunwayTransitionIndex: number;

  /** The selected arrival procedure runway. */
  arrivalRunway: OneWayRunway | undefined;

  /**
   * The ICAO value of the airport facility associated with the flight plan's selected published approach procedure,
   * or `undefined` if the flight plan does not have a selected published approach procedure.
   */
  approachFacilityIcaoStruct: IcaoValue | undefined;

  /**
   * The ICAO string (V1) of the airport facility associated with the flight plan's selected published approach
   * procedure, or `undefined` if the flight plan does not have a selected published approach procedure.
   * @deprecated Please use `approachFacilityIcaoStruct` instead.
   */
  approachFacilityIcao: string | undefined;

  /**
   * The index of the flight plan's selected published approach procedure in the approach airport's approaches array,
   * or `-1` if the flight plan does not have a selected published approach procedure.
   */
  approachIndex: number;

  /**
   * The index of the flight plan's selected published approach transition in the approach procedure's transitions
   * array, or `-1` if the flight plan does not have a selected published approach transition.
   */
  approachTransitionIndex: number;

  /** The selected destination runway. */
  destinationRunway: OneWayRunway | undefined;
}

/**
 * A prototype for signalling application-specific type metadata for plan segments.
 */
export enum FlightPlanSegmentType {
  Origin = 'Origin',
  Departure = 'Departure',
  Enroute = 'Enroute',
  Arrival = 'Arrival',
  Approach = 'Approach',
  Destination = 'Destination',
  MissedApproach = 'MissedApproach',
  RandomDirectTo = 'RandomDirectTo'
}


/**
 * A segment of a flight plan.
 */
export class FlightPlanSegment {

  /**
   * Creates a new FlightPlanSegment.
   * @param segmentIndex The index of the segment within the flight plan.
   * @param offset The leg offset within the original flight plan that
   * the segment starts at.
   * @param legs The legs in the flight plan segment.
   * @param segmentType The type of segment this is.
   * @param airway The airway associated with this segment, if any.
   */
  constructor(public segmentIndex: number, public offset: number, public legs: LegDefinition[],
    public segmentType: FlightPlanSegmentType = FlightPlanSegmentType.Enroute, public airway?: string) {
  }

  /** An empty flight plan segment. */
  public static Empty: FlightPlanSegment = new FlightPlanSegment(-1, -1, []);
}

/**
 * Metadata about a particular flight plan leg.
 */
export interface LegCalculations {

  /** The magnetic variation, in degrees, used when calculating this leg's course. */
  courseMagVar: number;

  /** The initial DTK of the leg in degrees magnetic. */
  initialDtk: number | undefined;

  /** The total distance of the leg's base flight path vectors, in meters. */
  distance: number;

  /**
   * The total distance of the leg's base flight path vectors summed with those of all prior legs in the same flight
   * plan, in meters.
   */
  cumulativeDistance: number;

  /** The total distance, of the leg's ingress, ingress-to-egress, and egress flight path vectors, in meters. */
  distanceWithTransitions: number;

  /**
   * The total distance of the leg's ingress, ingress-to-egress, and egress flight path vectors summed with those of
   * all prior legs in the same flight plan, in meters.
   */
  cumulativeDistanceWithTransitions: number;

  /** The latitude of the start of the leg. */
  startLat: number | undefined;

  /** The longitude of the start of the leg. */
  startLon: number | undefined;

  /** The latitude of the end of the leg. */
  endLat: number | undefined;

  /** The longitude of the end of the leg. */
  endLon: number | undefined;

  /** The calculated base flight path for the leg. */
  flightPath: FlightPathVector[];

  /** The leg's flight path ingress transition. */
  ingress: FlightPathVector[];

  /** The index of the flight path vector in `flightPath` to which the ingress transition is joined. */
  ingressJoinIndex: number;

  /** The leg's flight path between the ingress and egress transitions. */
  ingressToEgress: FlightPathVector[];

  /** The index of the flight path vector in `flightPath` to which the egress transition is joined. */
  egressJoinIndex: number;

  /** The leg's flight path egress transition. */
  egress: FlightPathVector[];

  /** Whether the leg's flight path ends in a discontinuity. */
  endsInDiscontinuity: boolean;

  /** Whether the leg's flight path ends in a fallback state. */
  endsInFallback: boolean;
}

/**
 * Bitflags describing a leg definition.
 */
export enum LegDefinitionFlags {
  None = 0,
  DirectTo = 1 << 0,
  MissedApproach = 1 << 1,
  Obs = 1 << 2,
  VectorsToFinal = 1 << 3,
  VectorsToFinalFaf = 1 << 4
}

/**
 * Vertical flight phase.
 */
export enum VerticalFlightPhase {
  Climb = 'Climb',
  Descent = 'Descent'
}

/**
 * Vertical metadata about a flight plan leg.
 */
export interface VerticalData {
  /** The vertical flight phase for the leg. */
  phase: VerticalFlightPhase;

  /** The type of altitude restriction for the leg. */
  altDesc: AltitudeRestrictionType;

  /** The first altitude field for restrictions, in meters. */
  altitude1: number;

  /** The second altitude field for restrictions, in meters. Only used for the lower value of a between constraint. */
  altitude2: number;

  /** Whether altitude 1 should be displayed as a flight level. */
  displayAltitude1AsFlightLevel: boolean;

  /** Whether altitude 2 should be displayed as a flight level. */
  displayAltitude2AsFlightLevel: boolean;

  /** Whether altitude 1 is temperature compensated  */
  isAltitude1TempCompensated: boolean;

  /** Whether altitude 2 is temperature compensated  */
  isAltitude2TempCompensated: boolean;

  /** The optional speed restriction for this leg, in knots IAS or Mach, depends on speedUnit. */
  speed: number;

  /** The type of speed restriction for the leg. */
  speedDesc: SpeedRestrictionType;

  /** The speed unit. */
  speedUnit: SpeedUnit;

  /** The FPA for this constraint, in degrees, optional. */
  fpa?: number;
}

/** Just the simple altitude constraint fields from the {@link VerticalData} interface. */
export type AltitudeConstraintSimple = Pick<VerticalData, 'altDesc' | 'altitude1' | 'displayAltitude1AsFlightLevel'>;

/** Just the advanced altitude constraint fields from the {@link VerticalData} interface. */
export type AltitudeConstraintAdvanced = AltitudeConstraintSimple & Pick<VerticalData, 'altitude2' | 'displayAltitude2AsFlightLevel'>;

/** Just the speed constraint fields from the {@link VerticalData} interface. */
export type SpeedConstraint = Pick<VerticalData, 'speedDesc' | 'speed' | 'speedUnit'>;

export enum SpeedUnit {
  IAS,
  MACH,
}

/**
 * A definition of a leg in a flight plan.
 */
export interface LegDefinition {

  /** The display name of the leg. */
  readonly name?: string;

  /** The calculated leg data. */
  calculated?: LegCalculations;

  /** The leg of the flight plan. */
  leg: Readonly<FlightPlanLeg>;

  /** Leg definition flags. See {@link LegDefinitionFlags}. Use BitFlags to check. */
  readonly flags: number;

  /** Vertical Leg Data. All the fields should be readonly except for calculated fields like `fpa`. */
  readonly verticalData: Readonly<VerticalData> & Pick<VerticalData, 'fpa'>;

  /** This leg's user data. */
  readonly userData: Record<string, any>;
}
