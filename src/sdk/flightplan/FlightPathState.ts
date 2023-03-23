import { GeoPoint, GeoPointReadOnly } from '../geo/GeoPoint';
import { NumberUnitReadOnly, UnitFamily } from '../math/NumberUnit';

/**
 * The state of a calculating flight path.
 */
export interface FlightPathState {
  /** The current position of the flight path. */
  currentPosition: GeoPoint | undefined;

  /** The current true course bearing of the flight path. */
  currentCourse: number | undefined;

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

  /** The desired radius for general turns. */
  readonly desiredTurnRadius: NumberUnitReadOnly<UnitFamily.Distance>;

  /** The desired radius for turns in holds. */
  readonly desiredHoldTurnRadius: NumberUnitReadOnly<UnitFamily.Distance>;

  /** The desired radius for turns in course reversals. */
  readonly desiredCourseReversalTurnRadius: NumberUnitReadOnly<UnitFamily.Distance>;

  /** The desired radius for anticipated leg-to-leg turns. */
  readonly desiredTurnAnticipationTurnRadius: NumberUnitReadOnly<UnitFamily.Distance>;
}