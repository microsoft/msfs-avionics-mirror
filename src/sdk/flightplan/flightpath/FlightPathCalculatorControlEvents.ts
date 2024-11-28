import { FlightPathCalculatorOptions } from './FlightPathCalculator';

/**
 * Events used to control flight path calculators, keyed by base topic names.
 */
export interface BaseFlightPathCalculatorControlEvents {
  /** Event to set some or all FlightPathCalculatorOptions. */
  flightpath_set_options: Partial<FlightPathCalculatorOptions>;
}

/**
 * The event topic suffix used to control a flight path calculator with a specific ID.
 */
type FlightPathCalculatorControlEventSuffix<ID extends string> = ID extends '' ? '' : `_${ID}`;

/**
 * Events used to control a flight path calculator with a specific ID.
 */
export type FlightPathCalculatorControlEventsForId<ID extends string> = {
  [P in keyof BaseFlightPathCalculatorControlEvents as `${P}${FlightPathCalculatorControlEventSuffix<ID>}`]: BaseFlightPathCalculatorControlEvents[P];
};

/**
 * All events used to control flight path calculators.
 */
export interface FlightPathCalculatorControlEvents
  extends BaseFlightPathCalculatorControlEvents, FlightPathCalculatorControlEventsForId<string> { }