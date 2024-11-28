import { GeoPoint, GeoPointReadOnly } from '../../geo/GeoPoint';
import { NumberUnitReadOnly, UnitFamily } from '../../math/NumberUnit';

/**
 * A description of the state of a lateral flight path during flight path calculations.
 */
export interface FlightPathState {
  /** The current position of the flight path. */
  readonly currentPosition: GeoPoint;

  /** The current true course bearing of the flight path. */
  currentCourse: number | undefined;

  /** Whether there is a discontinuity at the flight path's current position. */
  isDiscontinuity: boolean;

  /** Whether the flight path is in a fallback state. */
  isFallback: boolean;

  /** The position of the airplane. */
  readonly planePosition: GeoPointReadOnly;

  /** The true heading of the airplane. */
  readonly planeHeading: number;

  /** The altitude of the airplane. */
  readonly planeAltitude: NumberUnitReadOnly<UnitFamily.Distance>;

  /** The ground speed of the airplane. */
  readonly planeSpeed: NumberUnitReadOnly<UnitFamily.Speed>;

  /** The climb rate of the airplane. */
  readonly planeClimbRate: NumberUnitReadOnly<UnitFamily.Speed>;

  /** The true airspeed of the airplane. */
  readonly planeTrueAirspeed: NumberUnitReadOnly<UnitFamily.Speed>;

  /**
   * The true wind direction at the plane's position, in degrees. Wind direction is defined as the heading from which
   * the wind is blowing.
   */
  readonly planeWindDirection: number;

  /** The wind speed at the plane's position. */
  readonly planeWindSpeed: NumberUnitReadOnly<UnitFamily.Speed>;

  /** The desired radius for general turns. */
  readonly desiredTurnRadius: NumberUnitReadOnly<UnitFamily.Distance>;

  /** The desired radius for turns in holds. */
  readonly desiredHoldTurnRadius: NumberUnitReadOnly<UnitFamily.Distance>;

  /** The desired radius for turns in course reversals. */
  readonly desiredCourseReversalTurnRadius: NumberUnitReadOnly<UnitFamily.Distance>;

  /** The desired radius for anticipated leg-to-leg turns. */
  readonly desiredTurnAnticipationTurnRadius: NumberUnitReadOnly<UnitFamily.Distance>;
}

/**
 * A description of an airplane state used during lateral flight path calculations.
 */
export type FlightPathPlaneState = Pick<
  FlightPathState,
  'planePosition'
  | 'planeHeading'
  | 'planeAltitude'
  | 'planeSpeed'
  | 'planeClimbRate'
  | 'planeWindDirection'
  | 'planeWindSpeed'
  | 'desiredTurnRadius'
  | 'desiredHoldTurnRadius'
  | 'desiredCourseReversalTurnRadius'
  | 'desiredTurnAnticipationTurnRadius'
>;
