/**
 * A flight path vector turn direction.
 */
export type VectorTurnDirection = 'left' | 'right';

/**
 * The transition type to which a flight path vector belongs.
 */
export enum FlightPathVectorFlags {
  None,

  /** A turn to a specific course. */
  TurnToCourse = 1 << 0,

  /** An arcing turn to a specific point. */
  Arc = 1 << 1,

  /** A direct course to a specific point. */
  Direct = 1 << 2,

  /** A path to intercept a specific course. */
  InterceptCourse = 1 << 3,

  /** Inbound leg of a hold. */
  HoldInboundLeg = 1 << 4,

  /** Outbound leg of a hold. */
  HoldOutboundLeg = 1 << 5,

  /** A direct hold entry. */
  HoldDirectEntry = 1 << 6,

  /** A teardrop hold entry. */
  HoldTeardropEntry = 1 << 7,

  /** A parallel hold entry. */
  HoldParallelEntry = 1 << 8,

  /** A course reversal. */
  CourseReversal = 1 << 9,

  /** A turn from one leg to another. */
  LegToLegTurn = 1 << 10,

  /** An anticipated turn from one leg to another. */
  AnticipatedTurn = 1 << 11,

  /** A fallback path. */
  Fallback = 1 << 12,

  /** A path through a discontinuity. */
  Discontinuity = 1 << 13,

  /** The constant-heading vector in a fly-heading leg. */
  ConstantHeading = 1 << 14,
}

/**
 * A flight path vector within a leg flight path calculation.
 */
export interface FlightPathVector {
  /** Bit flags describing the vector. */
  flags: number;

  /** The latitude of the start of the vector. */
  startLat: number;

  /** The longitude of the start of the vector. */
  startLon: number;

  /** The latitude of the end of the vector. */
  endLat: number;

  /** The longitude of the end of the vector. */
  endLon: number;

  /** The total distance of the vector, in meters. */
  distance: number;

  /** The radius of the circle, in great-arc radians. */
  radius: number;

  /** The x-coordinate of the center of the circle. */
  centerX: number;

  /** The y-coordinate of the center of the circle. */
  centerY: number;

  /** The z-coordinate of the center of the circle. */
  centerZ: number;

  /** The heading-to-fly assigned to this vector, in degrees, or `null` if no heading is assigned. */
  heading: number | null;

  /** Whether the heading-to-fly assigned to this vector is relative to true north instead of magnetic north. */
  isHeadingTrue: boolean;
}
