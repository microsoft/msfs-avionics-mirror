import { Subscribable } from '@microsoft/msfs-sdk';

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

/**
 * A context for FMS airframe speed limits.
 */
export type FmsAirframeSpeedLimitContext = {
  /** The airplane's current pressure altitude, in feet. */
  pressureAlt: Subscribable<number>;
};