import { GeoCircle } from '../../../geo/GeoCircle';
import { GeoMath } from '../../../geo/GeoMath';
import { GeoPoint } from '../../../geo/GeoPoint';
import { MagVar } from '../../../geo/MagVar';
import { MathUtils } from '../../../math/MathUtils';
import { UnitType } from '../../../math/NumberUnit';
import { Vec3Math } from '../../../math/VecMath';
import { Facility } from '../../../navigation/Facilities';
import { ArrayUtils } from '../../../utils/datastructures/ArrayUtils';
import { LegDefinition } from '../../FlightPlanning';
import { FlightPathLegCalculationOptions } from '../FlightPathLegCalculator';
import { FlightPathState } from '../FlightPathState';
import { FlightPathUtils } from '../FlightPathUtils';
import { FlightPathVectorFlags } from '../FlightPathVector';
import { InterceptGreatCircleToPointVectorBuilder } from '../vectorbuilders';
import { CircleVectorBuilder } from '../vectorbuilders/CircleVectorBuilder';
import { ProcedureTurnVectorBuilder } from '../vectorbuilders/ProcedureTurnVectorBuilder';
import { AbstractFlightPathLegCalculator } from './AbstractFlightPathLegCalculator';

/**
 * Calculates flight path vectors for fix to manual termination legs.
 */
export class FixToManualLegCalculator extends AbstractFlightPathLegCalculator {
  private readonly vec3Cache = ArrayUtils.create(3, () => Vec3Math.create());
  private readonly geoPointCache = ArrayUtils.create(2, () => new GeoPoint(0, 0));
  private readonly geoCircleCache = ArrayUtils.create(2, () => new GeoCircle(Vec3Math.create(), 0));

  private readonly circleVectorBuilder = new CircleVectorBuilder();
  private readonly procTurnVectorBuilder = new ProcedureTurnVectorBuilder();
  private readonly interceptGreatCircleToPointVectorBuilder = new InterceptGreatCircleToPointVectorBuilder();

  /**
   * Creates a new instance of FixToManualLegCalculator.
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
    const originPos = this.getPositionFromIcao(leg.leg.fixIcao, this.geoPointCache[0]);
    leg.calculated!.courseMagVar = originPos === undefined ? 0 : this.getLegMagVar(leg.leg, originPos);
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
    const vectors = legs[calculateIndex].calculated!.flightPath;

    const originPos = this.getPositionFromIcao(leg.leg.fixIcao, this.geoPointCache[0]);

    if (!originPos) {
      vectors.length = 0;

      // There is a discontinuity at the end of FM legs.
      state.isDiscontinuity = true;
      state.isFallback = false;
      return;
    }

    let vectorIndex = 0;

    const course = leg.leg.trueDegrees ? leg.leg.course : MagVar.magneticToTrue(leg.leg.course, leg.calculated!.courseMagVar);
    const distance = UnitType.NMILE.convertTo(1, UnitType.GA_RADIAN);

    if (
      state.currentPosition.isValid()
      && (!state.isDiscontinuity || options.calculateDiscontinuityVectors)
      && (state.isDiscontinuity || (state.isFallback && state.currentCourse !== undefined))
    ) {
      // We are in a discontinuity state and are configured to calculate discontinuity vectors or we are in a fallback
      // state. We need to compute a path to connect the current position and course to the desired course from the
      // origin fix.

      const flags = (state.isDiscontinuity ? FlightPathVectorFlags.Discontinuity : FlightPathVectorFlags.None)
        | (state.isFallback && state.currentCourse !== undefined ? FlightPathVectorFlags.Fallback : FlightPathVectorFlags.None);

      const originVec = originPos.toCartesian(this.vec3Cache[0]);

      // If the current course is not defined, then set it to the course from the current position to the leg origin.
      if (state.currentCourse === undefined) {
        state.currentCourse = state.currentPosition.bearingTo(originPos);

        // If the current position is coincident with or antipodal to the leg origin, then set the current course to
        // the leg course.
        if (isNaN(state.currentCourse)) {
          state.currentCourse = course;
        }
      }

      const initialPath = this.geoCircleCache[0].setAsGreatCircle(state.currentPosition, state.currentCourse);
      const finalPath = this.geoCircleCache[1].setAsGreatCircle(originPos, course);

      const initialFinalPathAngle = Vec3Math.unitAngle(initialPath.center, finalPath.center);
      if (initialFinalPathAngle >= Math.PI - GeoMath.ANGULAR_TOLERANCE) {
        // If the initial path and the final path are antiparallel, then we will path a procedure turn to do a 180.

        vectorIndex += this.procTurnVectorBuilder.build(
          vectors, vectorIndex,
          state.currentPosition, initialPath,
          originVec, finalPath,
          state.currentCourse + 45,
          state.desiredCourseReversalTurnRadius.asUnit(UnitType.METER), undefined,
          state.currentCourse, course,
          flags | FlightPathVectorFlags.CourseReversal, true
        );
      } else if (initialFinalPathAngle > GeoMath.ANGULAR_TOLERANCE) {
        const interceptFlags = flags | FlightPathVectorFlags.InterceptCourse;
        const turnFlags = interceptFlags | FlightPathVectorFlags.TurnToCourse;

        vectorIndex += this.interceptGreatCircleToPointVectorBuilder.build(
          vectors, vectorIndex,
          state.currentPosition, initialPath,
          state.desiredTurnRadius.asUnit(UnitType.METER), undefined,
          45,
          finalPath.offsetAngleAlong(originVec, MathUtils.HALF_PI, this.vec3Cache[1], Math.PI), finalPath,
          state.desiredTurnRadius.asUnit(UnitType.METER),
          turnFlags, interceptFlags, turnFlags
        );
      }

      let isOnFinalPath = false;
      if (initialFinalPathAngle <= GeoMath.ANGULAR_TOLERANCE) {
        // We were already on the final path at the start of the leg.
        isOnFinalPath = true;
      } else if (vectorIndex > 0) {
        const lastVector = vectors[vectorIndex - 1];
        state.currentPosition.set(lastVector.endLat, lastVector.endLon);
        state.currentCourse = FlightPathUtils.getVectorFinalCourse(lastVector);

        // To check if we are on the final path, first confirm that the last vector ends on the final path. Then,
        // confirm that the great circle tangent to the last vector where the vector ends is parallel to the final
        // path.
        const lastVectorEndVec = state.currentPosition.toCartesian(this.vec3Cache[1]);
        if (finalPath.includes(lastVectorEndVec)) {
          const tangentCircleNormal = Vec3Math.normalize(
            Vec3Math.cross(
              Vec3Math.cross(
                lastVectorEndVec,
                Vec3Math.set(lastVector.centerX, lastVector.centerY, lastVector.centerZ, this.vec3Cache[2]),
                this.vec3Cache[2]
              ),
              lastVectorEndVec,
              this.vec3Cache[2]
            ),
            this.vec3Cache[2]
          );

          // Angular difference <= 1e-6 radians
          isOnFinalPath = Vec3Math.dot(tangentCircleNormal, finalPath.center) >= 0.9999999999995;
        }
      }

      if (isOnFinalPath) {
        // If we are on the final path, then check if we are behind the origin position. If we are, then we need to
        // ensure we travel along the final path to the origin before continuing along the final path for the desired
        // distance.

        const startVec = state.currentPosition.toCartesian(this.vec3Cache[1]);
        let distanceToOrigin = finalPath.distanceAlong(startVec, originVec, Math.PI, GeoMath.ANGULAR_TOLERANCE);

        if (distanceToOrigin >= Math.PI) {
          distanceToOrigin = 0;
        }

        vectorIndex += this.circleVectorBuilder.build(
          vectors, vectorIndex,
          finalPath,
          startVec, finalPath.offsetDistanceAlong(startVec, distance + distanceToOrigin, this.vec3Cache[2], Math.PI)
        );
      } else {
        // If we are not on the final path, then we will just turn toward the prescribed course and fly for the desired
        // distance along that course.

        if (MathUtils.angularDistanceDeg(state.currentCourse, course, 0) > 1) {
          vectorIndex += this.circleVectorBuilder.buildTurnToCourse(
            vectors, vectorIndex,
            state.currentPosition,
            state.desiredTurnRadius.asUnit(UnitType.METER),
            FlightPathUtils.getShortestTurnDirection(state.currentCourse, course) ?? 'right',
            state.currentCourse, course,
            FlightPathVectorFlags.Fallback | FlightPathVectorFlags.TurnToCourse
          );

          if (vectorIndex > 0) {
            const lastVector = vectors[vectorIndex - 1];
            state.currentPosition.set(lastVector.endLat, lastVector.endLon);
          }

          state.currentCourse = course;
        }

        vectorIndex += this.circleVectorBuilder.buildGreatCircle(
          vectors, vectorIndex,
          state.currentPosition, course,
          distance,
          FlightPathVectorFlags.Fallback
        );
      }
    } else {
      vectorIndex += this.circleVectorBuilder.buildGreatCircle(vectors, vectorIndex, originPos, course, distance);
    }

    vectors.length = vectorIndex;

    if (vectorIndex > 0) {
      const lastVector = vectors[vectorIndex - 1];
      state.currentPosition.set(lastVector.endLat, lastVector.endLon);
      state.currentCourse = FlightPathUtils.getVectorFinalCourse(lastVector);
    }

    // There is a discontinuity at the end of FM legs.
    state.isDiscontinuity = true;
    state.isFallback = false;
  }
}
