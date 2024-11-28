import { EventBus, Subscribable } from '@microsoft/msfs-sdk';

import { AirspeedDefinition } from './AirspeedDefinition';

/**
 * A context for a {@link AirspeedDefinitionFactory}.
 */
export type AirspeedDefinitionContext = {
  /** The event bus. */
  readonly bus: EventBus;

  /** The current pressure altitude, in feet. */
  readonly pressureAlt: Subscribable<number>;

  /** The current conversion factor from mach number to knots indicated airspeed. */
  readonly machToKias: Subscribable<number>;

  /** The current conversion factor from true airspeed to indicated airspeed. */
  readonly tasToIas: Subscribable<number>;

  /**
   * The correlation coefficient between a given normalized angle of attack and the estimated indicated airspeed in
   * knots required to maintain level flight at that angle of attack for the current aircraft configuration and
   * environment, or `null` if such a value cannot be calculated.
   */
  readonly normAoaIasCoef: Subscribable<number | null>;

  /**
   * Estimates the indicated airspeed, in knots, required to maintain level flight at a given normalized angle of
   * attack value for the current aircraft configuration and environment. Normalized angle of attack is defined such
   * that `0` equals zero-lift AoA, and `1` equals stall AoA.
   * @param normAoa A normalized angle of attack value.
   * @returns The estimated indicated airspeed, in knots, required to maintain level flight at the specified angle of
   * attack, or `NaN` if an estimate cannot be made.
   */
  estimateIasFromNormAoa(normAoa: number): number;
};

/**
 * A function that creates a definition of an indicated airspeed value.
 */
export type AirspeedDefinitionFactory = (context: AirspeedDefinitionContext) => AirspeedDefinition;
