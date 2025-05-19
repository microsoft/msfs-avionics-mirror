import { GeoCircle } from '../../../geo/GeoCircle';
import { GeoMath } from '../../../geo/GeoMath';
import { GeoPoint } from '../../../geo/GeoPoint';
import { MagVar } from '../../../geo/MagVar';
import { UnitType } from '../../../math/NumberUnit';
import { Vec3Math } from '../../../math/VecMath';
import { ArrayUtils } from '../../../utils/datastructures/ArrayUtils';
import { LegDefinition } from '../../FlightPlanning';
import { FlightPathCalculatorFacilityCache } from '../FlightPathCalculatorFacilityCache';
import { FlightPathLegCalculationOptions } from '../FlightPathLegCalculator';
import { FlightPathState } from '../FlightPathState';
import { FlightPathUtils } from '../FlightPathUtils';
import { FlightPathVectorFlags } from '../FlightPathVector';
import { CircleVectorBuilder } from '../vectorbuilders/CircleVectorBuilder';
import { DirectToJoinGreatCircleAtPointVectorBuilder } from '../vectorbuilders/DirectToJoinGreatCircleToPointVectorBuilder';
import { DirectToPointVectorBuilder } from '../vectorbuilders/DirectToPointVectorBuilder';
import { AbstractFlightPathLegCalculator } from './AbstractFlightPathLegCalculator';

/**
 * Calculates flight path vectors for track from fix legs.
 */
export class TrackFromFixLegCalculator extends AbstractFlightPathLegCalculator {
  private readonly geoPointCache = ArrayUtils.create(2, () => new GeoPoint(0, 0));
  private readonly geoCircleCache = ArrayUtils.create(2, () => new GeoCircle(Vec3Math.create(), 0));

  private readonly circleVectorBuilder = new CircleVectorBuilder();
  private readonly directToPointVectorBuilder = new DirectToPointVectorBuilder();
  private readonly directToJoinGreatCircleToPointVectorBuilder = new DirectToJoinGreatCircleAtPointVectorBuilder();

  /**
   * Creates a new instance of TrackFromFixLegCalculator.
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
    const leg = legs[calculateIndex];
    const startFacility = this.facilityCache.getFacility(leg.leg.fixIcaoStruct);
    leg.calculated!.courseMagVar = startFacility === undefined ? 0 : this.getLegMagVar(leg.leg, startFacility);
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

    const originPos = this.getPositionFromIcao(leg.leg.fixIcaoStruct, this.geoPointCache[0]);

    if (!originPos) {
      vectors.length = 0;
      state.isFallback = false;
      return;
    }

    let vectorIndex = 0;

    const course = leg.leg.trueDegrees ? leg.leg.course : MagVar.magneticToTrue(leg.leg.course, leg.calculated!.courseMagVar);
    const endPos = originPos.offset(course, UnitType.METER.convertTo(leg.leg.distance, UnitType.GA_RADIAN), this.geoPointCache[1]);

    if (
      (!state.isDiscontinuity || options.calculateDiscontinuityVectors)
      && state.isFallback && state.currentPosition.isValid() && state.currentCourse !== undefined
    ) {
      // If we are starting in a fallback state and the current position is defined, then path a direct course to the
      // leg end point.

      const flags = FlightPathVectorFlags.Fallback
        | (state.isDiscontinuity ? FlightPathVectorFlags.Discontinuity : FlightPathVectorFlags.None);

      vectorIndex += this.directToPointVectorBuilder.build(
        vectors, vectorIndex,
        state.currentPosition, state.currentCourse,
        endPos,
        state.getDesiredTurnRadius(calculateIndex), undefined,
        flags
      );
    } else {
      let startPos: GeoPoint;

      if (!state.currentPosition.isValid()) {
        // If the current flight path position is not valid, then we will start at the leg origin.
        startPos = originPos;
      } else if (state.isDiscontinuity) {
        // If we are starting in a discontinuity, then we will start at the leg origin. If we are configured to
        // calculate discontinuity vectors, then we will also build a path to the origin point.

        if (options.calculateDiscontinuityVectors) {
          const startPath = state.currentCourse
            ? this.geoCircleCache[0].setAsGreatCircle(state.currentPosition, state.currentCourse)
            : undefined;
          const endPath = this.geoCircleCache[1].setAsGreatCircle(originPos, course);

          vectorIndex += this.directToJoinGreatCircleToPointVectorBuilder.build(
            vectors, vectorIndex,
            state.currentPosition, startPath,
            originPos, endPath,
            state.getDesiredTurnRadius(calculateIndex),
            undefined,
            FlightPathVectorFlags.Discontinuity, true
          );
        }

        startPos = originPos;
      } else {
        startPos = state.currentPosition;
      }

      // Create a great-circle path from the start point to the end point.
      if (startPos.distance(endPos) > GeoMath.ANGULAR_TOLERANCE) {
        vectorIndex += this.circleVectorBuilder.buildGreatCircle(vectors, vectorIndex, startPos, endPos, course);
      }
    }

    vectors.length = vectorIndex;

    const hasInvalidStart = state.isDiscontinuity || !state.currentPosition.isValid();

    state.currentPosition.set(endPos);
    if (hasInvalidStart) {
      state.currentCourse = undefined;
    } else if (vectorIndex > 0) {
      const lastVector = vectors[vectorIndex - 1];
      state.currentCourse = FlightPathUtils.getVectorFinalCourse(lastVector);
    }

    state.isDiscontinuity = false;
    state.isFallback = false;
  }
}
