import { GeoCircle } from '../../../geo/GeoCircle';
import { GeoPoint } from '../../../geo/GeoPoint';
import { MagVar } from '../../../geo/MagVar';
import { UnitType } from '../../../math/NumberUnit';
import { Vec3Math } from '../../../math/VecMath';
import { Facility } from '../../../navigation/Facilities';
import { ArrayUtils } from '../../../utils/datastructures/ArrayUtils';
import { LegDefinition } from '../../FlightPlanning';
import { FlightPathLegCalculationOptions } from '../FlightPathLegCalculator';
import { FlightPathState } from '../FlightPathState';
import { FlightPathUtils } from '../FlightPathUtils';
import { FlightPathVectorFlags } from '../FlightPathVector';
import { DirectToPointVectorBuilder } from '../vectorbuilders/DirectToPointVectorBuilder';
import { AbstractFlightPathLegCalculator } from './AbstractFlightPathLegCalculator';

/**
 * Calculates flight path vectors for direct to fix legs.
 */
export class DirectToFixLegCalculator extends AbstractFlightPathLegCalculator {
  private readonly geoPointCache = ArrayUtils.create(4, () => new GeoPoint(0, 0));
  private readonly geoCircleCache = ArrayUtils.create(1, () => new GeoCircle(Vec3Math.create(), 0));

  private readonly directToPointVectorBuilder = new DirectToPointVectorBuilder();

  /**
   * Creates a new instance of DirectToFixLegCalculator.
   * @param facilityCache This calculator's cache of facilities.
   */
  public constructor(facilityCache: Map<string, Facility>) {
    super(facilityCache, true);
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

    const terminatorPos = this.getTerminatorPosition(leg.leg, this.geoPointCache[1], leg.leg.fixIcao);

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
      if (options.calculateDiscontinuityVectors || !state.isDiscontinuity) {
        const flags = (state.isDiscontinuity ? FlightPathVectorFlags.Discontinuity : FlightPathVectorFlags.None)
          | (state.isFallback && state.currentCourse !== undefined ? FlightPathVectorFlags.Fallback : FlightPathVectorFlags.None);

        const startPoint = this.geoPointCache[0].set(state.currentPosition);
        let initialCourse: number | undefined;

        if (leg.leg.course !== 0) {
          // If a course is defined on the leg, then honor it.
          initialCourse = leg.leg.trueDegrees ? leg.leg.course : MagVar.magneticToTrue(leg.leg.course, startPoint);
        } else {
          // If a course is not defined on the leg, then try to get the initial course from the end of the previous leg,
          // which should be stored as the state's current course.

          if (state.currentCourse === undefined) {
            // If the state's current course is not defined, then attempt to select an initial course from the definition
            // of the previous leg.

            const prevLeg = legs[calculateIndex - 1];
            if (prevLeg) {
              initialCourse = this.getLegTrueCourse(prevLeg.leg);
            }

            if (initialCourse === undefined) {
              // If we can't select an initial course from the previous leg, then default to the course that puts us on
              // a great-circle path from the start point to the terminator fix.

              initialCourse = startPoint.bearingTo(terminatorPos);

              // If the calculated course is NaN (only happens when the start and end points are coincident or antipodal),
              // then just arbitrarily use true north.
              if (isNaN(initialCourse)) {
                initialCourse = 0;
              }
            }
          } else {
            initialCourse = state.currentCourse;
          }
        }

        const startPath = this.geoCircleCache[0].setAsGreatCircle(startPoint, initialCourse);

        vectorIndex += this.directToPointVectorBuilder.build(
          vectors, vectorIndex,
          startPoint, startPath,
          terminatorPos,
          state.desiredTurnRadius.asUnit(UnitType.METER),
          FlightPathUtils.getLegDesiredTurnDirection(leg.leg),
          flags
        );
      }
    }

    vectors.length = vectorIndex;

    const hasInvalidStart = state.isDiscontinuity || !state.currentPosition.isValid();

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
