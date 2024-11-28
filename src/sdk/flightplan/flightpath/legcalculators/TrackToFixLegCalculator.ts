import { GeoPoint } from '../../../geo/GeoPoint';
import { UnitType } from '../../../math/NumberUnit';
import { Facility, FacilityType, LegType } from '../../../navigation/Facilities';
import { FacilityUtils } from '../../../navigation/FacilityUtils';
import { ICAO } from '../../../navigation/IcaoUtils';
import { ArrayUtils } from '../../../utils/datastructures/ArrayUtils';
import { LegDefinition } from '../../FlightPlanning';
import { FlightPathLegCalculationOptions } from '../FlightPathLegCalculator';
import { FlightPathState } from '../FlightPathState';
import { FlightPathUtils } from '../FlightPathUtils';
import { FlightPathVectorFlags } from '../FlightPathVector';
import { CircleVectorBuilder } from '../vectorbuilders/CircleVectorBuilder';
import { DirectToPointVectorBuilder } from '../vectorbuilders/DirectToPointVectorBuilder';
import { AbstractFlightPathLegCalculator } from './AbstractFlightPathLegCalculator';

/**
 * Calculates flight path vectors for track to fix legs.
 */
export class TrackToFixLegCalculator extends AbstractFlightPathLegCalculator {
  private readonly geoPointCache = ArrayUtils.create(1, () => new GeoPoint(0, 0));

  private readonly circleVectorBuilder = new CircleVectorBuilder();
  private readonly directToPointVectorBuilder = new DirectToPointVectorBuilder();

  /**
   * Creates a new instance of TrackToFixLegCalculator.
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
    const leg = legs[calculateIndex];
    leg.calculated!.courseMagVar = this.getTerminatorMagVar(leg.leg) ?? 0;
  }

  /** @inheritDoc */
  protected calculateVectors(
    legs: LegDefinition[],
    calculateIndex: number,
    activeLegIndex: number,
    state: FlightPathState,
    options: Readonly<FlightPathLegCalculationOptions>
  ): void {
    const leg = legs[calculateIndex];
    const vectors = leg.calculated!.flightPath;

    const terminatorPos = this.getTerminatorPosition(leg.leg, this.geoPointCache[0], leg.leg.fixIcao);

    if (!terminatorPos) {
      vectors.length = 0;
      state.isFallback = false;
      return;
    }

    let vectorIndex = 0;

    // Only build vectors if...
    if (
      // ... the current flight path position is defined...
      state.currentPosition.isValid()
      // ... and the leg is of non-zero length.
      && !state.currentPosition.equals(terminatorPos)
    ) {
      // If the leg starts in a discontinuity, then only build vectors if we are configured to calculate discontinuity
      // vectors.
      if (!state.isDiscontinuity || options.calculateDiscontinuityVectors) {
        const flags = (state.isDiscontinuity ? FlightPathVectorFlags.Discontinuity : FlightPathVectorFlags.None);

        if ((state.isDiscontinuity || state.isFallback) && state.currentCourse !== undefined) {
          vectorIndex += this.directToPointVectorBuilder.build(
            vectors, vectorIndex,
            state.currentPosition, state.currentCourse,
            terminatorPos,
            state.desiredTurnRadius.asUnit(UnitType.METER), undefined,
            flags | (state.isFallback ? FlightPathVectorFlags.Fallback : FlightPathVectorFlags.None)
          );
        } else {
          // Build vectors for a great-circle path from the start to the leg terminator.
          vectorIndex += this.circleVectorBuilder.buildGreatCircle(
            vectors, vectorIndex,
            state.currentPosition, terminatorPos,
            state.currentCourse,
            flags
          );
        }
      }
    }

    const hasInvalidStart = state.isDiscontinuity || !state.currentPosition.isValid();

    // If the starting position is undefined or the leg begins in a discontinuity, the leg is an IF leg, and the
    // terminator fix is a runway, then set the current course to the runway course.
    if (
      hasInvalidStart
      && leg.leg.type === LegType.IF
      && ICAO.isFacility(leg.leg.fixIcao, FacilityType.RWY)
    ) {
      const facility = this.facilityCache.get(leg.leg.fixIcao);
      if (facility && FacilityUtils.isFacilityType(facility, FacilityType.RWY)) {
        state.currentCourse = facility.runway.course;
      }
    }

    vectors.length = vectorIndex;

    state.currentPosition.set(terminatorPos);
    if (hasInvalidStart) {
      state.currentCourse = undefined;
    } else if (vectorIndex > 0) {
      state.currentCourse = FlightPathUtils.getVectorFinalCourse(vectors[vectorIndex - 1]);
    }

    state.isDiscontinuity = false;
    state.isFallback = false;
  }
}
