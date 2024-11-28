import { Facility } from '../../../navigation/Facilities';
import { LegDefinition } from '../../FlightPlanning';
import { FlightPathState } from '../FlightPathState';
import { AbstractFlightPathLegCalculator } from './AbstractFlightPathLegCalculator';

/**
 * Calculates flight path vectors for legs with no path.
 */
export class NoPathLegCalculator extends AbstractFlightPathLegCalculator {
  /**
   * Creates a new instance of NoPathLegCalculator.
   * @param facilityCache This calculator's cache of facilities.
   */
  public constructor(facilityCache: Map<string, Facility>) {
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
    state.isFallback = false;
  }
}
