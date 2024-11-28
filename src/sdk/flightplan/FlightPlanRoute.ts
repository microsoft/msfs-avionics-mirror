import { ApproachIdentifier, RunwayIdentifier } from '../navigation/Facilities';
import { IcaoValue } from '../navigation/Icao';
import { DeepReadonly } from '../utils/types/UtilityTypes';

/**
 * A readonly {@link FlightPlanRoute}.
 */
export type ReadonlyFlightPlanRoute = DeepReadonly<FlightPlanRoute>;

/**
 * A generic description of a flight plan.
 */
export interface FlightPlanRoute {
  /** Coherent C++ object binding type. */
  __Type: 'JS_FlightPlanRoute';

  /** The ICAO of this route's departure airport. */
  departureAirport: IcaoValue;

  /** The ICAO of this route's destination airport. */
  destinationAirport: IcaoValue;

  /** This route's enroute legs. */
  enroute: FlightPlanRouteEnrouteLeg[];

  /** This route's departure runway. */
  departureRunway: RunwayIdentifier;

  /** The name of this route's departure procedure. */
  departure: string;

  /** The name of this route's departure procedure enroute transition. */
  departureTransition: string;

  /** This route's VFR traffic pattern departure procedure. */
  departureVfrPattern: FlightPlanRouteVfrPatternDeparture;

  /** This route's destination runway. */
  destinationRunway: RunwayIdentifier;

  /** The name of this route's arrival procedure. */
  arrival: string;

  /** The name of this route's arrival procedure enroute transition. */
  arrivalTransition: string;

  /** This route's approach procedure. */
  approach: ApproachIdentifier;

  /** The name of this route's approach procedure transition. */
  approachTransition: string;

  /** This route's VFR traffic pattern approach procedure. */
  approachVfrPattern: FlightPlanRouteVfrPatternApproach;

  /** This route's cruise altitude. */
  cruiseAltitude: FlightPlanRouteAltitude | null;

  /** Whether this route is classified as VFR. */
  isVfr: boolean;
}

/**
 * An enroute leg used by {@link FlightPlanRoute}.
 */
export interface FlightPlanRouteEnrouteLeg {
  /** Coherent C++ object binding type. */
  __Type: 'JS_EnrouteLeg';

  /** The ICAO of this leg's terminator fix. */
  fixIcao: IcaoValue;

  /** The airway to follow to this leg's terminator fix, or the empty string if this leg is a DIRECT leg. */
  via: string;

  /** Whether the leg should use the airplane's present position as its terminator fix. */
  isPpos: boolean;

  /** Whether this leg's terminator fix is defined by a set of latitude/longitude coordinates. */
  hasLatLon: boolean;

  /** The latitude of the leg's terminator fix, in degrees. */
  lat: number;

  /** The longitude of this leg's terminator fix, in degrees. */
  lon: number;

  /** Whether this leg's terminator fix is defined by a bearing and distance from a reference facility. */
  hasPointBearingDistance: boolean;

  /** The ICAO of the reference facility with which this leg's terminator fix is defined. */
  referenceIcao: IcaoValue;

  /** The true bearing of this leg's terminator fix from the reference facility, in degrees. */
  bearing: number;

  /** The distance from the reference facility to this leg's terminator fix, in nautical miles. */
  distance: number;

  /** This leg's altitude, or `null` if an altitude is not defined for this leg. */
  altitude: FlightPlanRouteAltitude | null;

  /** This leg's name. */
  name: string;
}

/**
 * An altitude used by {@link FlightPlanRoute}.
 */
export interface FlightPlanRouteAltitude {
  /** Coherent C++ object binding type. */
  __Type: 'JS_FlightAltitude';

  /** The altitude, in feet. */
  altitude: number;

  /** Whether the altitude is a flight level. */
  isFlightLevel: boolean;
}

/**
 * A description of a VFR traffic pattern procedure used by {@link FlightPlanRoute}.
 */
export interface FlightPlanRouteVfrPatternProcedure<Type extends string> {
  /** Coherent C++ object binding type. */
  __Type: 'JS_VfrPatternProcedure';

  /** The selected pattern type. */
  type: Type;

  /** Whether the pattern uses a left-hand traffic pattern (true) instead of a right-hand traffic pattern (false). */
  isLeftTraffic: boolean;

  /** The pattern leg distance, in nautical miles. */
  distance: number;

  /** The pattern altitude, in feet AGL. */
  altitude: number;
}

/**
 * A description of a VFR traffic pattern departure procedure used by {@link FlightPlanRoute}.
 */
export type FlightPlanRouteVfrPatternDeparture = FlightPlanRouteVfrPatternProcedure<FlightPlanRouteVfrPatternDepartureType>;

/**
 * A description of a VFR traffic pattern approach procedure used by {@link FlightPlanRoute}.
 */
export type FlightPlanRouteVfrPatternApproach = FlightPlanRouteVfrPatternProcedure<FlightPlanRouteVfrPatternApproachType>;

/**
 * VFR traffic pattern departure types used by {@link FlightPlanRoute}.
 */
export enum FlightPlanRouteVfrPatternDepartureType {
  None = '',
  InitialClimb = 'InitialClimb',
  StraightOut = 'Straight',
  Pattern = 'Pattern',
  PatternIntoDownwind = 'PatternDownwind',
  Downwind = 'Downwind',
  Base = 'Base',
  BaseIntoPattern = 'BasePattern',
  Overhead = 'Overhead',
}

/**
 * VFR traffic pattern approach types used by {@link FlightPlanRoute}.
 */
export enum FlightPlanRouteVfrPatternApproachType {
  None = '',
  Final = 'Final',
  LongFinal = 'LongFinal',
  Base = 'Base',
  Downwind = 'Downwind',
  DownwindFromInside = 'DownwindInside',
  Downwind45 = 'Downwind45',
  DownwindSecond45 = 'DownwindSec45',
  Teardrop = 'Teardrop',
  ReverseTeardrop = 'RevTeardrop',
}
