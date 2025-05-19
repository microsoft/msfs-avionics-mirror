import { LegDefinition } from '../FlightPlanning';

/**
 * Context for an anticipated speed calculator.
 */
export interface FlightPathAnticipatedDataContext {
  /** True air speed in knots, taken from plane state */
  planeSpeed: number;

  /** Windspeed in knots */
  planeWindSpeed: number;

  /** Wind direction in knots */
  planeWindDirection: number;
}

/** Data per leg, which is returned by the anticipated data calculator. */
export interface FlightPathAnticipatedData {
  /** True air speed in knots */
  tas: number | undefined;

  /** True wind direction in degrees */
  windDirection: number | undefined;

  /** wind speed in knots */
  windSpeed: number | undefined;
}

/**
 * Interface for the calculation of anticipated speeds.
 */
export interface FlightPathAnticipatedDataCalculator {
  /**
   * Returns and array with anticipated data for flight plan legs.
   * @param legs An array containing all flight plan legs, in order.
   * @param startIndex The index of the first leg for which to get anticipated speed, inclusive.
   * @param out The array to which to write the results. The index of the anticipated speeds should match
   * those of the flightplan legs.
   * @returns The anticipated true airspeed, in knots, with indexes matching those of the flightplan legs.
   */
  getAnticipatedData(
    legs: LegDefinition[],
    startIndex: number,
    endIndex: number,
    context: FlightPathAnticipatedDataContext,
    out: readonly FlightPathAnticipatedData[]
  ): readonly FlightPathAnticipatedData[];
}
