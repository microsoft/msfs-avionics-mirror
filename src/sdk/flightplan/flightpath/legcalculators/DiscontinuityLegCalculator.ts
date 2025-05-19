import { LegDefinition } from '../../FlightPlanning';
import { FlightPathCalculatorFacilityCache } from '../FlightPathCalculatorFacilityCache';
import { FlightPathState } from '../FlightPathState';
import { AbstractFlightPathLegCalculator } from './AbstractFlightPathLegCalculator';

/**
 * Calculates flight path vectors for discontinuity legs.
 */
export class DiscontinuityLegCalculator extends AbstractFlightPathLegCalculator {
  /**
   * Creates a new instance of DiscontinuityLegCalculator.
   * @param facilityCache This calculator's cache of facilities.
   */
  public constructor(facilityCache: FlightPathCalculatorFacilityCache) {
    super(facilityCache, false);
  }

  /** @inheritDoc */
  protected calculateMagVar(
    legs: LegDefinition[],
    calculateIndex: number
  ): void {
    legs[calculateIndex].calculated!.courseMagVar = 0;
  }

  /** @inheritDoc */
  protected calculateVectors(
    legs: LegDefinition[],
    calculateIndex: number,
    activeLegIndex: number,
    state: FlightPathState
  ): void {
    legs[calculateIndex].calculated!.flightPath.length = 0;
    state.isDiscontinuity = true;
    state.isFallback = false;
  }
}
