import { LegCalculations, LegDefinition } from '../FlightPlanning';
import { FlightPathState } from './FlightPathState';

/**
 * Options with which to configure flight path calculations for flight plan legs.
 */
export type FlightPathLegCalculationOptions = {
  /**
   * Whether to calculate flight path vectors to span discontinuities in the flight path. If `true`, then the
   * calculated discontinuity vectors will have the `Discontinuity` flag applied to them.
   */
  calculateDiscontinuityVectors: boolean;
};

/**
 * A flight path calculator for individual flight plan legs.
 */
export interface FlightPathLegCalculator {
  /**
   * Calculates flight path vectors for a flight plan leg and adds the calculations to the leg.
   * @param legs A sequence of flight plan legs.
   * @param calculateIndex The index of the leg to calculate.
   * @param activeLegIndex The index of the active leg.
   * @param state The current flight path state.
   * @param options Options to use for the calculation.
   * @returns The flight plan leg calculations.
   */
  calculate(
    legs: LegDefinition[],
    calculateIndex: number,
    activeLegIndex: number,
    state: FlightPathState,
    options: Readonly<FlightPathLegCalculationOptions>
  ): LegCalculations;
}
