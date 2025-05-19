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
 * Calculates flight path vectors for fix to DME legs.
 */
export class FixToDmeLegCalculator extends AbstractFlightPathLegCalculator {
  private readonly vec3Cache = ArrayUtils.create(2, () => Vec3Math.create());
  private readonly geoPointCache = ArrayUtils.create(1, () => new GeoPoint(0, 0));
  private readonly geoCircleCache = ArrayUtils.create(2, () => new GeoCircle(Vec3Math.create(), 0));
  private readonly intersectionCache = [Vec3Math.create(), Vec3Math.create()];

  private readonly circleVectorBuilder = new CircleVectorBuilder();
  private readonly directToPointVectorBuilder = new DirectToPointVectorBuilder();
  private readonly directToJoinGreatCircleToPointVectorBuilder = new DirectToJoinGreatCircleAtPointVectorBuilder();

  /**
   * Creates a new instance of FixToDmeLegCalculator.
   * @param facilityCache This calculator's cache of facilities.
   */
  public constructor(facilityCache: FlightPathCalculatorFacilityCache) {
    super(facilityCache, true);
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
    const dmeFacility = this.facilityCache.getFacility(leg.leg.originIcaoStruct);

    if (!originPos || !dmeFacility) {
      vectors.length = 0;
      state.isFallback = false;
      return;
    }

    let vectorIndex = 0;

    const course = leg.leg.trueDegrees ? leg.leg.course : MagVar.magneticToTrue(leg.leg.course, leg.calculated!.courseMagVar);
    const path = this.geoCircleCache[0].setAsGreatCircle(originPos, course);
    const dmeCircle = this.geoCircleCache[1].set(dmeFacility, UnitType.METER.convertTo(leg.leg.distance, UnitType.GA_RADIAN));

    const originVec = originPos.toCartesian(this.vec3Cache[0]);
    const interceptVec = this.vec3Cache[1];

    const intersections = this.intersectionCache;
    const numIntersections = path.intersection(dmeCircle, intersections);
    if (numIntersections === 0) {
      // The path along the leg's defined course does not intercept the DME circle -> define the intercept to be the
      // closest point on the DME circle to the initial fix.

      dmeCircle.closest(originVec, interceptVec);
    } else {
      // The path along the leg's defined course intercepts the DME circle -> choose the first intercept when
      // proceeding along the path from the initial fix.

      const intersectionIndex = (numIntersections === 1 || dmeCircle.encircles(originVec)) ? 0 : 1;
      Vec3Math.copy(intersections[intersectionIndex], interceptVec);
    }

    if (
      (!state.isDiscontinuity || options.calculateDiscontinuityVectors)
      && state.isFallback && state.currentPosition.isValid() && state.currentCourse !== undefined
    ) {
      // We are starting in a fallback state and the current position is defined, so we will path a direct course to
      // the leg end point.

      const flags = FlightPathVectorFlags.Fallback
        | (state.isDiscontinuity ? FlightPathVectorFlags.Discontinuity : FlightPathVectorFlags.None);

      vectorIndex += this.directToPointVectorBuilder.build(
        vectors, vectorIndex,
        state.currentPosition, state.currentCourse,
        interceptVec,
        state.getDesiredTurnRadius(calculateIndex), undefined,
        flags
      );
    } else {
      let startVec: Float64Array;

      // If we are starting in a discontinuity and we are configured to calculate discontinuity vectors, then we will
      // build a path to the start point.

      if (!state.currentPosition.isValid()) {
        // If the current flight path position is not valid, then we will start at the leg origin.
        startVec = originVec;
      } else if (state.isDiscontinuity) {
        // If we are starting in a discontinuity, then we will start at the leg origin. If we are configured to
        // calculate discontinuity vectors, then we will also build a path to the origin point.

        if (options.calculateDiscontinuityVectors && state.currentPosition.isValid()) {
          const startPath = state.currentCourse !== undefined
            ? this.geoCircleCache[1].setAsGreatCircle(state.currentPosition, state.currentCourse)
            : undefined;

          vectorIndex += this.directToJoinGreatCircleToPointVectorBuilder.build(
            vectors, vectorIndex,
            state.currentPosition, startPath,
            originPos, path,
            state.getDesiredTurnRadius(calculateIndex),
            undefined,
            FlightPathVectorFlags.Discontinuity, true
          );
        }

        startVec = originVec;
      } else {
        startVec = state.currentPosition.toCartesian(this.vec3Cache[0]);
      }

      // Create a great-circle path from the start point to the end point.
      if (Vec3Math.unitAngle(startVec, interceptVec) > GeoMath.ANGULAR_TOLERANCE) {
        vectorIndex += this.circleVectorBuilder.buildGreatCircle(vectors, vectorIndex, startVec, interceptVec, course);
      }
    }

    vectors.length = vectorIndex;

    const hasInvalidStart = state.isDiscontinuity || !state.currentPosition.isValid();

    state.currentPosition.setFromCartesian(interceptVec);
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
