import { MappedSubscribable, Subscribable } from 'msfssdk';

/**
 * A context for a {@link AirspeedDefinitionFactory}.
 */
export type AirspeedDefinitionContext = {
  /** The current pressure altitude, in feet. */
  pressureAlt: Subscribable<number>;

  /** The current conversion factor from mach number to knots indicated airspeed. */
  machToKias: Subscribable<number>;
}

/**
 * A function which creates a number or a subscribable which provides a number representing an indicated airspeed
 * value in knots.
 */
export type AirspeedDefinitionFactory = (context: AirspeedDefinitionContext) => number | MappedSubscribable<number>;