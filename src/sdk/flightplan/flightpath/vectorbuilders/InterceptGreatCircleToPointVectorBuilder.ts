import { GeoCircle } from '../../../geo/GeoCircle';
import { LatLonInterface } from '../../../geo/GeoInterfaces';
import { GeoMath } from '../../../geo/GeoMath';
import { GeoPoint } from '../../../geo/GeoPoint';
import { MathUtils } from '../../../math/MathUtils';
import { UnitType } from '../../../math/NumberUnit';
import { ReadonlyFloat64Array, Vec3Math } from '../../../math/VecMath';
import { ArrayUtils } from '../../../utils/datastructures/ArrayUtils';
import { FlightPathUtils } from '../FlightPathUtils';
import { FlightPathVector, VectorTurnDirection } from '../FlightPathVector';
import { CircleVectorBuilder } from './CircleVectorBuilder';
import { TurnToJoinGreatCircleVectorBuilder } from './TurnToJoinGreatCircleVectorBuilder';

/**
 * Builds vectors representing paths connecting initial great-circle paths to final great-circle paths via a turn
 * starting at the start point followed by an angled intercept path which intercepts the final path before the end
 * point.
 */
export class InterceptGreatCircleToPointVectorBuilder {
  private static readonly vec3Cache = ArrayUtils.create(5, () => Vec3Math.create());
  private static readonly geoCircleCache = ArrayUtils.create(3, () => new GeoCircle(Vec3Math.create(), 0));
  private static readonly intersectionCache = [Vec3Math.create(), Vec3Math.create()];

  private readonly circleVectorBuilder = new CircleVectorBuilder();
  private readonly turnToJoinGreatCircleVectorBuilder = new TurnToJoinGreatCircleVectorBuilder();

  /**
   * Builds a sequence of flight path vectors representing a path from a defined start point and initial course which
   * turns and intercepts a final course at a specified angle using a great-circle path at or before a specified end
   * point. Optionally includes a final turn from the intercept path to the final course.
   *
   * If an intercept angle greater than the specified angle is required to intercept the final course before the end
   * point, then no vectors will be built.
   *
   * If the initial and final courses are parallel, then no vectors will be built.
   * @param vectors The flight path vector array to which to add the vectors.
   * @param index The index in the array at which to add the vectors.
   * @param start The start point.
   * @param startPath A GeoCircle that defines the initial course. Must be a great circle.
   * @param startTurnRadius The radius of the initial turn, in meters.
   * @param startTurnDirection The direction of the initial turn. If not defined, then the direction will be chosen to
   * minimize the angular distance swept by the initial turn.
   * @param interceptAngle The angle at which to intercept the final path, in degrees. Will be clamped to the range
   * `[0, 90]`.
   * @param end The end point. If not defined, then any intercept point on the target path will be considered valid.
   * @param endPath A GeoCircle that defines the final course. Must be a great circle.
   * @param endTurnRadius The radius of the final turn, in meters. If not defined, then vectors will not be built for
   * the final turn.
   * @param startTurnVectorFlags The flags to set on the initial turn vector. Defaults to none (0).
   * @param interceptVectorFlags The flags to set on the intercept path vector. Defaults to none (0).
   * @param endTurnVectorFlags The flags to set on the final turn vector. Defaults to none (0). Ignored if a turn to
   * join the final path is not calculated.
   * @param heading The heading-to-fly to assign to all built vectors, in degrees, or `null` if no heading is to be
   * assigned. Defaults to `null`.
   * @param isHeadingTrue Whether the heading-to-fly assigned to built vectors is relative to true north instead of
   * magnetic north. Defaults to `false`.
   * @returns The number of vectors that were built and added to the array.
   * @throws Error if `startPath` or `endPath` is not a great circle.
   */
  public build(
    vectors: FlightPathVector[],
    index: number,
    start: ReadonlyFloat64Array | LatLonInterface,
    startPath: GeoCircle,
    startTurnRadius: number,
    startTurnDirection: VectorTurnDirection | undefined,
    interceptAngle: number,
    end: ReadonlyFloat64Array | LatLonInterface | undefined,
    endPath: GeoCircle,
    endTurnRadius?: number,
    startTurnVectorFlags = 0,
    interceptVectorFlags = 0,
    endTurnVectorFlags = 0,
    heading: number | null = null,
    isHeadingTrue = false
  ): number {
    if (!startPath.isGreatCircle() || !endPath.isGreatCircle()) {
      throw new Error('InterceptGreatCircleToPointVectorBuilder::build(): start or end path is not a great circle');
    }

    if (!(start instanceof Float64Array)) {
      start = GeoPoint.sphericalToCartesian(start as LatLonInterface, InterceptGreatCircleToPointVectorBuilder.vec3Cache[0]);
    }
    if (end && !(end instanceof Float64Array)) {
      end = GeoPoint.sphericalToCartesian(end as LatLonInterface, InterceptGreatCircleToPointVectorBuilder.vec3Cache[1]);
    }

    const startToEndPathAngleRad = Vec3Math.unitAngle(startPath.center, endPath.center);

    if (startToEndPathAngleRad <= GeoMath.ANGULAR_TOLERANCE) {
      // The start and end paths are parallel.
      return 0;
    }

    const intersections = InterceptGreatCircleToPointVectorBuilder.intersectionCache;

    const interceptAngleRad = MathUtils.clamp(interceptAngle * Avionics.Utils.DEG2RAD, 0, MathUtils.HALF_PI);
    // The set of centers of great circles that intersect the end path at the desired intercept angle.
    const interceptPathCenters = InterceptGreatCircleToPointVectorBuilder.geoCircleCache[1].set(endPath.center, interceptAngleRad);

    const startTurnRadiusRad = UnitType.METER.convertTo(startTurnRadius, UnitType.GA_RADIAN);
    if (startTurnDirection === undefined) {
      // The direction of the initial turn is not defined, so we have to choosen one ourselves.

      // Calculate the intercept point if the intercept path were to pass through the start point.
      const interceptCount = interceptPathCenters.intersection(
        InterceptGreatCircleToPointVectorBuilder.geoCircleCache[0].set(start, MathUtils.HALF_PI),
        intersections
      );

      if (interceptCount === 0) {
        // No great-circle path passing through the start point can intercept the final path at the desired intercept
        // angle. So we will just turn toward the end point if it is defined. If the end point is not defined, then we
        // will just pick an arbitrary turn direction.
        startTurnDirection = end && startPath.encircles(end) ? 'left' : 'right';
      } else {
        let intersectionIndex = 0;

        if (interceptCount > 1) {
          // There are two great-circle paths passing through the start point that intercept the final path at the
          // desired angle. One of them will be directed toward the end path and the other will be directed away from
          // it. We want to choose the one directed toward it.
          intersectionIndex = endPath.encircles(start) ? 0 : 1;
        }

        let cross = Vec3Math.cross(
          startPath.center, intersections[intersectionIndex],
          InterceptGreatCircleToPointVectorBuilder.vec3Cache[2]
        );

        // sin(x) ~= 0 for x near 0, so to check if the angle between the start path and intercept path is parallel or
        // antiparallel we can check the magnitude of their cross product without having to call asin().
        if (Vec3Math.dot(cross, cross) <= GeoMath.ANGULAR_TOLERANCE * GeoMath.ANGULAR_TOLERANCE) {
          // If the start and intercept paths are parallel or antiparallel, it doesn't matter which direction we turn,
          // so we will just turn in the direction that aligns us with the end path.

          cross = Vec3Math.cross(
            startPath.center, endPath.center,
            InterceptGreatCircleToPointVectorBuilder.vec3Cache[2]
          );

          if (Vec3Math.dot(cross, cross) <= GeoCircle.ANGULAR_TOLERANCE * GeoMath.ANGULAR_TOLERANCE) {
            // If the start and end paths are antiparallel (they can't be parallel since we would have returned from
            // the method by now), then we arbitrarily choose to turn right.
            startTurnDirection = 'right';
          } else {
            startTurnDirection = Vec3Math.dot(cross, start) >= 0 ? 'left' : 'right';
          }
        } else {
          startTurnDirection = Vec3Math.dot(cross, start) >= 0 ? 'left' : 'right';
        }
      }
    }

    const startTurnCircle = FlightPathUtils.getTurnCircleStartingFromPath(
      start, startPath,
      startTurnRadiusRad, startTurnDirection,
      InterceptGreatCircleToPointVectorBuilder.geoCircleCache[0]
    );

    if (interceptAngleRad <= GeoMath.ANGULAR_TOLERANCE) {
      // If the desired intercept angle is 0 degrees, then the only valid path is when the starting turn ends exactly
      // on the path to intercept and the end of the turn lies before the end point

      if (Math.abs(Vec3Math.unitAngle(startTurnCircle.center, endPath.center) - Math.abs(MathUtils.HALF_PI - startTurnCircle.radius)) > GeoMath.ANGULAR_TOLERANCE) {
        // The starting turn is not tangent to path to intercept.
        return 0;
      }

      const startTurnEnd = endPath.closest(
        startTurnCircle.closest(endPath.center, InterceptGreatCircleToPointVectorBuilder.vec3Cache[2]),
        InterceptGreatCircleToPointVectorBuilder.vec3Cache[2]
      );

      const startTurnEndToEndDistance = end ? endPath.angleAlong(startTurnEnd, end, Math.PI) : 0;

      if (startTurnEndToEndDistance < MathUtils.TWO_PI - GeoMath.ANGULAR_TOLERANCE && startTurnEndToEndDistance > Math.PI + GeoMath.ANGULAR_TOLERANCE) {
        // The end of the starting turn lies after the end point.
        return 0;
      }

      return this.circleVectorBuilder.build(
        vectors, index,
        startTurnCircle,
        start, startTurnEnd,
        startTurnVectorFlags,
        heading, isHeadingTrue
      );
    }

    // Find the great-circle path that intersects the path to intercept at the desired intercept angle and is tangent
    // to the starting turn.

    // The set of centers of great circles that are tangent to the starting turn.
    const startTurnInterceptTangentCenters = InterceptGreatCircleToPointVectorBuilder.geoCircleCache[2].set(
      startTurnCircle.center,
      Math.abs(MathUtils.HALF_PI - startTurnRadiusRad)
    );

    const interceptPathCount = interceptPathCenters.intersection(startTurnInterceptTangentCenters, intersections);

    if (interceptPathCount === 0) {
      return 0;
    }

    const interceptPath = InterceptGreatCircleToPointVectorBuilder.geoCircleCache[1];
    let interceptCrossSign: number;

    if (startToEndPathAngleRad >= interceptAngleRad) {
      // The starting turn is considered to overshoot if it crosses to the contralateral side of the final path before
      // joining the intercept path that requires the shortest turn to join. The contralateral side is defined as the
      // right side for left turns and the left side for right turns. If this occurs, then we need to choose the second
      // intercept path (if it exists). This is because choosing the first intercept path would trigger a case below
      // that attempts to end the start turn early, which could produce a path that requires the plane to track toward
      // the final path at an angle greater than the intercept angle.

      const overshootThreshold = Math.asin(MathUtils.clamp(Math.cos(interceptAngleRad) * Math.sin(startTurnRadiusRad), 0, 1));
      const doesStartTurnOvershoot = endPath.distance(startTurnCircle.center) > -overshootThreshold + GeoMath.ANGULAR_TOLERANCE;
      interceptPath.set(
        intersections[interceptPathCount === 1 || !doesStartTurnOvershoot ? 0 : 1],
        MathUtils.HALF_PI
      );
      interceptCrossSign = doesStartTurnOvershoot === (startTurnDirection === 'right') ? 1 : -1;
    } else {
      // If the start path intersects the final path at a shallower angle than the intercept path, then we always want
      // to choose the intercept path that requires the shortest turn to join. Even if the turn has overshot the final
      // path by the time it can join the chosen intercept path, we handle that case below by attempting to end the
      // start turn early. We are guaranteed that ending the starting turn early will not result in a path that
      // requires the plane to track toward the final path at an angle greater than the intercept angle because if it
      // did, then that would mean the starting turn does not overshoot the final path, which contradicts the initial
      // assumption of ending the start turn early.

      interceptPath.set(intersections[Math.max(1, intersections.length - 1)], MathUtils.HALF_PI);
      interceptCrossSign = startTurnDirection === 'right' ? 1 : -1;
    }

    const startTurnEnd = interceptPath.closest(
      startTurnCircle.closest(interceptPath.center, InterceptGreatCircleToPointVectorBuilder.vec3Cache[2]),
      InterceptGreatCircleToPointVectorBuilder.vec3Cache[2]
    );

    const intercept = Vec3Math.multScalar(
      Vec3Math.normalize(
        Vec3Math.cross(interceptPath.center, endPath.center, InterceptGreatCircleToPointVectorBuilder.vec3Cache[3]),
        InterceptGreatCircleToPointVectorBuilder.vec3Cache[3]
      ),
      interceptCrossSign,
      InterceptGreatCircleToPointVectorBuilder.vec3Cache[3]
    );

    const interceptDistance = interceptPath.distanceAlong(startTurnEnd, intercept, Math.PI, GeoMath.ANGULAR_TOLERANCE);

    const endTurnRadiusRad = endTurnRadius === undefined ? undefined : UnitType.METER.convertTo(endTurnRadius, UnitType.GA_RADIAN);

    // Required turn anticipation for the end turn to join the intercept and final paths.
    let minDInterceptEnd = 0;
    if (endTurnRadiusRad !== undefined) {
      const endTheta = Math.PI - interceptAngleRad;
      const sinMinDInterceptEnd = Math.tan(endTurnRadiusRad) / Math.tan(endTheta / 2);

      if (Math.abs(sinMinDInterceptEnd) <= 1) {
        minDInterceptEnd = Math.asin(sinMinDInterceptEnd);
      }
    }

    if (end) {
      const interceptToEndDistance = endPath.distanceAlong(intercept, end, Math.PI, GeoMath.ANGULAR_TOLERANCE);
      const interceptToEndOffset = MathUtils.normalizeAngle(interceptToEndDistance, - Math.PI);

      if (interceptToEndOffset < minDInterceptEnd) {
        // The intercept path does not intercept the final path early enough to make the end turn before the end point.
        return 0;
      }
    }

    let vectorIndex = index;

    if (interceptDistance < minDInterceptEnd || interceptDistance > Math.PI + GeoMath.ANGULAR_TOLERANCE) {
      // The starting turn ends too late to make a turn to join the final path or the starting turn overshoots the end
      // path before reaching the intercept course -> attempt to end the starting turn early.

      if (endTurnRadiusRad === undefined) {
        // We don't need to calculate a final turn, so attempt to end the starting turn where it intersects the end path.

        const startTurnEndPathIntersectionCount = startTurnCircle.intersection(endPath, intersections);

        if (startTurnEndPathIntersectionCount === 0) {
          return 0;
        }

        const startTurnEndPathIntersection = intersections[startTurnEndPathIntersectionCount === 1 || startTurnDirection === 'right' ? 0 : 1];

        if (end && endPath.distanceAlong(startTurnEndPathIntersection, end, Math.PI, GeoMath.ANGULAR_TOLERANCE) > Math.PI + GeoMath.ANGULAR_TOLERANCE) {
          // The starting turn intercepts the final path after the end point
          return 0;
        }

        vectorIndex += this.circleVectorBuilder.build(
          vectors, vectorIndex,
          startTurnCircle,
          start, startTurnEndPathIntersection,
          startTurnVectorFlags,
          heading, isHeadingTrue
        );
      } else {
        // We need to calculate a final turn to join the end path. This final turn must be tangent to the starting turn
        // and the end path.

        const startTurnCenter = FlightPathUtils.getTurnCenterFromCircle(startTurnCircle, InterceptGreatCircleToPointVectorBuilder.vec3Cache[4]);
        // The set of centers of all geo circles of the desired end turn radius that are tangent to the starting turn.
        const startTurnEndTurnTangentCenters = InterceptGreatCircleToPointVectorBuilder.geoCircleCache[1].set(
          startTurnCenter,
          startTurnRadiusRad + endTurnRadiusRad
        );
        // The set of centers of all geo circles of the desired end turn radius that are tangent to the end path.
        const endPathEndTurnTangentCenters = InterceptGreatCircleToPointVectorBuilder.geoCircleCache[2].set(
          endPath.center,
          endPath.radius + endTurnRadiusRad * (startTurnDirection === 'left' ? 1 : -1)
        );

        const endTurnCircleCount = endPathEndTurnTangentCenters.intersection(startTurnEndTurnTangentCenters, intersections);

        if (endTurnCircleCount === 0) {
          return 0;
        }

        const endTurnCenter = intersections[0];

        const endTurnCircle = FlightPathUtils.getTurnCircle(
          endTurnCenter,
          endTurnRadiusRad,
          startTurnDirection === 'left' ? 'right' : 'left',
          InterceptGreatCircleToPointVectorBuilder.geoCircleCache[1]
        );

        endTurnCircle.closest(startTurnCenter, startTurnEnd);

        const endTurnEnd = endPath.closest(endTurnCenter, InterceptGreatCircleToPointVectorBuilder.vec3Cache[4]);

        if (end && endPath.distanceAlong(endTurnEnd, end, Math.PI, GeoMath.ANGULAR_TOLERANCE) > Math.PI + GeoMath.ANGULAR_TOLERANCE) {
          // The ending turn joins the final path after the end point.
          return 0;
        }

        // Starting turn.
        vectorIndex += this.circleVectorBuilder.build(
          vectors, vectorIndex,
          startTurnCircle,
          start, startTurnEnd,
          startTurnVectorFlags,
          heading, isHeadingTrue
        );

        // Ending turn.
        vectorIndex += this.circleVectorBuilder.build(
          vectors, vectorIndex,
          endTurnCircle,
          startTurnEnd, endTurnEnd,
          endTurnVectorFlags,
          heading, isHeadingTrue
        );
      }
    } else {
      // The starting turn neither overshoots the end path before joining the intercept path nor ends too late to make
      // a turn to join the end path before the end point.

      // Starting turn.
      if (Vec3Math.unitAngle(start, startTurnEnd) > GeoMath.ANGULAR_TOLERANCE) {
        vectorIndex += this.circleVectorBuilder.build(
          vectors, vectorIndex,
          startTurnCircle,
          start, startTurnEnd,
          startTurnVectorFlags,
          heading, isHeadingTrue
        );
      }

      const interceptPathEnd = endTurnRadiusRad === undefined
        ? intercept
        : interceptPath.offsetDistanceAlong(
          intercept,
          -minDInterceptEnd,
          InterceptGreatCircleToPointVectorBuilder.vec3Cache[4],
          Math.PI
        );

      // Intercept path.
      if (interceptDistance - minDInterceptEnd > GeoMath.ANGULAR_TOLERANCE) {
        vectorIndex += this.circleVectorBuilder.build(
          vectors, vectorIndex,
          interceptPath,
          startTurnEnd, interceptPathEnd,
          interceptVectorFlags,
          heading, isHeadingTrue
        );
      }

      // Ending turn.
      if (endTurnRadius !== undefined) {
        vectorIndex += this.turnToJoinGreatCircleVectorBuilder.build(
          vectors, vectorIndex,
          interceptPathEnd,
          interceptPath,
          endPath,
          endTurnRadius,
          endTurnVectorFlags,
          heading, isHeadingTrue
        );
      }
    }

    return vectorIndex - index;
  }
}
