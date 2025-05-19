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

  /**
   * The position of the airplane. If position data are not available, then both latitude and longitude will be equal
   * to `NaN`.
   */
  readonly planePosition: GeoPointReadOnly;

  /** The true heading of the airplane, in degrees, or `NaN` if heading data are not available. */
  readonly planeHeading: number;

  /** The altitude of the airplane. */
  readonly planeAltitude: NumberUnitReadOnly<UnitFamily.Distance>;

  /** The ground speed of the airplane. */
  readonly planeSpeed: NumberUnitReadOnly<UnitFamily.Speed>;

  /** The climb rate of the airplane. */
  readonly planeClimbRate: NumberUnitReadOnly<UnitFamily.Speed>;

  /** The current true airspeed of the airplane. */
  readonly planeTrueAirspeed: NumberUnitReadOnly<UnitFamily.Speed>;

  /**
   * The current true wind direction at the plane's position, in degrees relative to true north. Wind direction is
   * defined as the bearing from which the wind is blowing.
   */
  readonly planeWindDirection: number;

  /** The current wind speed at the plane's position. */
  readonly planeWindSpeed: NumberUnitReadOnly<UnitFamily.Speed>;

  /** The desired radius for general turns. @deprecated Please use `getDesiredTurnRadius(..)` instead */
  readonly desiredTurnRadius: NumberUnitReadOnly<UnitFamily.Distance>;

  /** The desired radius for turns in holds. @deprecated Please use `getDesiredHoldTurnRadius(..)` instead */
  readonly desiredHoldTurnRadius: NumberUnitReadOnly<UnitFamily.Distance>;

  /** The desired radius for turns in course reversals. @deprecated Please use `getDesiredCourseReversalTurnRadius(..)` instead */
  readonly desiredCourseReversalTurnRadius: NumberUnitReadOnly<UnitFamily.Distance>;

  /** The desired radius for anticipated leg-to-leg turns. @deprecated Please use `getDesiredTurnAnticipationTurnRadius(..)` instead */
  readonly desiredTurnAnticipationTurnRadius: NumberUnitReadOnly<UnitFamily.Distance>;

  /**
   * Gets the plane's true airspeed, in knots, at a given flight plan leg.
   * @param legIndex The global index of the flight plan leg for which to get the plane's true airspeed.
   * @returns The plane's true airspeed, in knots, at the specified flight plan leg.
   */
  getPlaneTrueAirspeed(legIndex: number): number;

  /**
   * Gets the wind speed, in knots, at a given flight plan leg.
   * @param legIndex The global index of the flight plan leg for which to get the wind speed.
   * @returns The wind speed, in knots, at the specified flight plan leg.
   */
  getWindSpeed(legIndex: number): number;

  /**
   * Gets the wind direction, in degrees relative to true north, at a given flight plan leg. Wind direction is defined
   * as the bearing from which the wind is blowing.
   * @param legIndex The global index of the flight plan leg for which to get the wind direction.
   * @returns The wind direction, in degrees relative to true north, at the specified flight plan leg.
   */
  getWindDirection(legIndex: number): number;

  /**
   * Returns the desired turn radius based on the current speed or the anticipated speed (if enabled and index is provided):
   * @param legIndex waypoint index.
   * @returns the desired turn radius in Meters.
   */
  getDesiredTurnRadius(legIndex: number): number;

  /**
   * Returns the desired hold radius based on the current speed or the anticipated speed (if enabled and index is provided):
   * @param legIndex waypoint index.
   * @returns the desired turn radius in Meters.
   */
  getDesiredHoldTurnRadius(legIndex: number): number;

  /**
   * Returns the desired course reversal radius based on the current speed or the anticipated speed (if enabled and index is provided):
   * @param legIndex waypoint index.
   * @returns the desired turn radius in Meters.
   */
  getDesiredCourseReversalTurnRadius(legIndex: number): number;

  /**
   * Returns the desired turn anticipation radius based on the current speed or the anticipated speed (if enabled and index is provided):
   * @param legIndex waypoint index.
   * @returns the desired turn radius in Meters.
   */
  getDesiredTurnAnticipationTurnRadius(legIndex: number): number;
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
  | 'getPlaneTrueAirspeed'
  | 'getWindSpeed'
  | 'getWindDirection'
  | 'getDesiredTurnRadius'
  | 'getDesiredHoldTurnRadius'
  | 'getDesiredCourseReversalTurnRadius'
  | 'getDesiredTurnAnticipationTurnRadius'
>;
