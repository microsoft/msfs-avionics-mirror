import { GeoCircle } from '../../../geo/GeoCircle';
import { LatLonInterface } from '../../../geo/GeoInterfaces';
import { GeoMath } from '../../../geo/GeoMath';
import { GeoPoint } from '../../../geo/GeoPoint';
import { MathUtils } from '../../../math/MathUtils';
import { UnitType } from '../../../math/NumberUnit';
import { ReadonlyFloat64Array, Vec3Math } from '../../../math/VecMath';
import { ArrayUtils } from '../../../utils/datastructures/ArrayUtils';
import { FlightPathVector, FlightPathVectorFlags, VectorTurnDirection } from '../FlightPathVector';
import { CircleVectorBuilder } from './CircleVectorBuilder';
import { DirectToPointVectorBuilder } from './DirectToPointVectorBuilder';
import { InterceptGreatCircleToPointVectorBuilder } from './InterceptGreatCircleToPointVectorBuilder';
import { TurnToJoinGreatCircleVectorBuilder } from './TurnToJoinGreatCircleVectorBuilder';

/**
 * Builds vectors representing paths connecting initial great-circle paths to final great-circle paths terminating at
 * defined end points.
 */
export class JoinGreatCircleToPointVectorBuilder {
  private static readonly INTERCEPT_ANGLE = 45; // degrees

  private static readonly vec3Cache = ArrayUtils.create(6, () => Vec3Math.create());
  private static readonly intersectionCache = [Vec3Math.create(), Vec3Math.create()];

  private readonly circleVectorBuilder = new CircleVectorBuilder();
  private readonly turnToJoinGreatCircleVectorBuilder = new TurnToJoinGreatCircleVectorBuilder();
  private readonly interceptGreatCircleToPointVectorBuilder = new InterceptGreatCircleToPointVectorBuilder();
  private readonly directToPointVectorBuilder = new DirectToPointVectorBuilder();

  /**
   * Builds a sequence of vectors representing a path from a defined start point and initial course that turns and
   * joins a great-circle path that terminates at a defined end point.
   *
   * This method will first attempt to connect the starting point and final path with a single constant-radius turn
   * of at least the minimum turn radius and in the desired direction that joins the final path before the end point.
   * If this is not possible, then what happens next depends on the `preferSingleTurn` argument:
   * * If it is `true`, then another path connecting the starting point and final path with a single constant-radius
   * turn will be computed - this path will respect the minimum turn radius but not necessarily the desired turn
   * direction.
   * * If it is `false`, then a path to intercept the final path at a 45-degree angle will be computed. If such a path
   * is not possible or if the intercept point lies after the end point, and `allowDirectFallback` is `true`, then a
   * direct path to the end point will be computed. If `allowDirectFallback` is `false` and all attempts to compute a
   * path have failed, then no vectors will be built.
   * @param vectors The flight path vector array to which to add the vectors.
   * @param index The index in the array at which to add the vectors.
   * @param start The start point.
   * @param startPath A GeoCircle that defines the initial course. Must be a great circle and must include the start
   * point.
   * @param end The end point.
   * @param endPath A GeoCircle that defines the final course. Must be a great circle and must include the end point.
   * @param desiredTurnDirection The desired initial turn direction. If not defined, then the most efficient turn
   * direction that satisfies the constraints will be chosen.
   * @param minTurnRadius The minimum turn radius, in meters. Defaults to 0.
   * @param preferSingleTurn Whether to prefer flight path solutions that consist of a single constant-radius turn
   * from the initial to final course. Defaults to `false`.
   * @param allowDirectFallback Whether the computed path should fall back to a direct path to the end point if the
   * final path cannot be joined before the end point. Defaults to `true`.
   * @param intersection The point of intersection between the start and end paths that lies closest to the start
   * point. If not defined, then it will be calculated by this method.
   * @param flags The flags to set on all built vectors. Defaults to none (0).
   * @param includeTurnToCourseFlag Whether to include the `TurnToCourse` flag on the vectors that comprise turns.
   * Defaults to `true`.
   * @param includeDirectFlag Whether to include the `Direct` flag on all built vectors when falling back to a direct
   * path. Defaults to `true`.
   * @param includeInterceptFlag Whether to include the `InterceptCourse` flag on all built vectors when building an
   * intercept path. Defaults to `true`.
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
    end: ReadonlyFloat64Array | LatLonInterface,
    endPath: GeoCircle,
    desiredTurnDirection?: VectorTurnDirection,
    minTurnRadius?: number,
    preferSingleTurn = false,
    allowDirectFallback = true,
    intersection?: ReadonlyFloat64Array,
    flags = 0,
    includeTurnToCourseFlag = true,
    includeDirectFlag = true,
    includeInterceptFlag = true,
    heading: number | null = null,
    isHeadingTrue = false
  ): number {
    if (!startPath.isGreatCircle() || !endPath.isGreatCircle()) {
      throw new Error('JoinGreatCircleToPointVectorBuilder::build(): start or end path is not a great circle');
    }

    let vectorIndex = index;

    if (!(start instanceof Float64Array)) {
      start = GeoPoint.sphericalToCartesian(start as LatLonInterface, JoinGreatCircleToPointVectorBuilder.vec3Cache[0]);
    }
    if (!(end instanceof Float64Array)) {
      end = GeoPoint.sphericalToCartesian(end as LatLonInterface, JoinGreatCircleToPointVectorBuilder.vec3Cache[1]);
    }

    if (!intersection) {
      const intersections = JoinGreatCircleToPointVectorBuilder.intersectionCache;
      const solutionCount = startPath.intersection(endPath, intersections);

      if (solutionCount === 0) {
        return 0;
      }

      // choose the intersection closest to the start point.
      intersection = Vec3Math.copy(
        Vec3Math.dot(intersections[0], start) > 0
          ? intersections[0]
          : intersections[1],
        JoinGreatCircleToPointVectorBuilder.vec3Cache[2]
      );
    }

    const turnFlags = flags | (includeTurnToCourseFlag ? FlightPathVectorFlags.TurnToCourse : 0);

    // Calculate the relative directions of the start point, intersection point, and end point.

    const intersectionToStartDot = Vec3Math.dot(Vec3Math.cross(startPath.center, intersection, JoinGreatCircleToPointVectorBuilder.vec3Cache[3]), start);
    // positive -> start point lies after the intersection (with respect to the direction of start path)
    const intersectionToStartSign = intersectionToStartDot < -GeoMath.ANGULAR_TOLERANCE ? -1
      : intersectionToStartDot > GeoMath.ANGULAR_TOLERANCE ? 1 : 0;

    const intersectionToEndDot = Vec3Math.dot(Vec3Math.cross(endPath.center, intersection, JoinGreatCircleToPointVectorBuilder.vec3Cache[3]), end);
    // positive -> end point lies after the intersection (with respect to the direction of end path)
    const intersectionToEndSign = intersectionToEndDot < -GeoMath.ANGULAR_TOLERANCE ? -1
      : intersectionToEndDot > GeoMath.ANGULAR_TOLERANCE ? 1 : 0;

    const isEndForwardOfIntersection = intersectionToEndSign > 0;

    minTurnRadius ??= 0;

    const minTurnRadiusRad = UnitType.METER.convertTo(minTurnRadius, UnitType.GA_RADIAN);
    const pathDot = Vec3Math.dot(startPath.center, endPath.center);
    const theta = Math.acos(MathUtils.clamp(-pathDot, -1, 1));
    const tanHalfTheta = Math.tan(theta / 2);
    const sinMinD = Math.tan(minTurnRadiusRad) / tanHalfTheta;

    // The along-track distance from the intersection point to the start/end of the minimum-radius turn from the start
    // path to the end path.
    const minD = Math.abs(sinMinD) <= 1
      ? Math.asin(sinMinD)
      : Infinity; // The turn radius is too large for any turn to join the start and end paths.

    const intersectionStartDistance = intersectionToStartSign === 0 ? 0 : Vec3Math.unitAngle(intersection, start);
    const intersectionEndDistance = intersectionToEndSign === 0 ? 0 : Vec3Math.unitAngle(intersection, end);

    const intersectionStartOffset = intersectionToStartSign * intersectionStartDistance;
    const intersectionEndOffset = intersectionToEndSign * intersectionEndDistance;

    const towardEndPointTurnDirection = startPath.encircles(end, false) ? 'left' : 'right';

    let needCalculateTwoTurnPath = false;
    let needCalculateOneTurnPath = false;

    if (isEndForwardOfIntersection) {
      if (desiredTurnDirection === undefined || desiredTurnDirection === towardEndPointTurnDirection) {
        const isStartPastRequiredTurnStart = intersectionStartOffset > -minD;
        const isEndBeforeRequiredTurnEnd = intersectionEndOffset < minD;

        if (isStartPastRequiredTurnStart || isEndBeforeRequiredTurnEnd) {
          // The minimum turn radius is too large to intercept the final path before the end point.

          needCalculateTwoTurnPath = !preferSingleTurn;
          needCalculateOneTurnPath = preferSingleTurn;
        } else {
          // Make a single constant-radius turn connecting the start path with the end path. The turn will either start
          // at the start point or end at the end point, depending on which is closer to the intersection point.

          const turnRadius = UnitType.GA_RADIAN.convertTo(Math.atan(tanHalfTheta * Math.sin(Math.min(intersectionStartDistance, intersectionEndDistance))), UnitType.METER);

          if (intersectionStartDistance <= intersectionEndDistance) {
            // The turn starts at the start point.

            vectorIndex += this.turnToJoinGreatCircleVectorBuilder.build(
              vectors, vectorIndex,
              start, startPath,
              endPath,
              turnRadius,
              turnFlags,
              heading, isHeadingTrue
            );

            if (intersectionEndDistance - intersectionStartDistance > GeoMath.ANGULAR_TOLERANCE) {
              const turnEnd = endPath.offsetDistanceAlong(intersection, intersectionStartDistance, JoinGreatCircleToPointVectorBuilder.vec3Cache[3], Math.PI);
              vectorIndex += this.circleVectorBuilder.build(
                vectors, vectorIndex,
                endPath,
                turnEnd, end,
                flags,
                heading, isHeadingTrue
              );
            }
          } else {
            // The turn ends at the end point.

            let turnStart = start;
            if (intersectionStartDistance - intersectionEndDistance > GeoMath.ANGULAR_TOLERANCE) {
              turnStart = startPath.offsetDistanceAlong(intersection, -intersectionEndDistance, JoinGreatCircleToPointVectorBuilder.vec3Cache[3], Math.PI);
              vectorIndex += this.circleVectorBuilder.build(
                vectors, vectorIndex,
                startPath,
                start, turnStart,
                flags,
                heading, isHeadingTrue
              );
            }

            vectorIndex += this.turnToJoinGreatCircleVectorBuilder.build(
              vectors, vectorIndex,
              turnStart, startPath,
              endPath,
              turnRadius,
              turnFlags,
              heading, isHeadingTrue
            );
          }
        }
      } else {
        // The initial turn is away from the end point.

        if (pathDot >= 0) {
          // The start and end paths intersect at an angle <= 90 degrees. This means that for a turn away from the end
          // point, the total flight path distance is minimized when the turn joins the start and end paths directly.

          if (intersectionStartOffset <= minD) {
            // The start point lies at or before the start point of the single constant-radius turn that minimizes the
            // flight path distance. Therefore, we always want to use the single-turn solution.
            needCalculateOneTurnPath = true;
          } else {
            needCalculateTwoTurnPath = !preferSingleTurn;
            needCalculateOneTurnPath = preferSingleTurn;
          }
        } else {
          needCalculateTwoTurnPath = !preferSingleTurn;
          needCalculateOneTurnPath = preferSingleTurn;
        }
      }
    } else {
      needCalculateTwoTurnPath = !preferSingleTurn;
      needCalculateOneTurnPath = preferSingleTurn;
    }

    let needDirectFallback = false;

    if (needCalculateTwoTurnPath) {
      const interceptFlag = includeInterceptFlag ? FlightPathVectorFlags.InterceptCourse : 0;

      // Attempt to make a turn to intercept the end path at 45 degrees. At this point we are in fallback territory
      // so we won't honor the desired starting turn direction.

      const numInterceptVectors = this.interceptGreatCircleToPointVectorBuilder.build(
        vectors, vectorIndex,
        start, startPath, minTurnRadius, undefined,
        JoinGreatCircleToPointVectorBuilder.INTERCEPT_ANGLE,
        end, endPath, minTurnRadius,
        turnFlags | interceptFlag, flags | interceptFlag, turnFlags | interceptFlag,
        heading, isHeadingTrue
      );

      if (numInterceptVectors === 0) {
        needDirectFallback = allowDirectFallback;
      } else {
        // The intercept vector builder will only build vectors up to the point where the intercept path turns and
        // joins the end path. So we need to check if we need to add a vector to connect the intercept point to the end
        // point.

        vectorIndex += numInterceptVectors;

        const lastVector = vectors[vectorIndex - 1];
        const interceptEnd = GeoPoint.sphericalToCartesian(lastVector.endLat, lastVector.endLon, JoinGreatCircleToPointVectorBuilder.vec3Cache[5]);

        if (Vec3Math.unitAngle(interceptEnd, end) > GeoMath.ANGULAR_TOLERANCE) {
          vectorIndex += this.circleVectorBuilder.build(
            vectors, vectorIndex,
            endPath,
            interceptEnd, end,
            flags,
            heading, isHeadingTrue
          );
        }
      }
    } else if (needCalculateOneTurnPath) {
      // Make a single constant-radius turn from the start path to join the end path. We are guaranteed that the turn
      // starts after the intersection of the start and end paths (the only case where teht urn starts before the
      // intersection is handled above).

      if (minD > MathUtils.HALF_PI) {
        // No amount of anticipation can provide a turn of the desired radius that joins the start and end paths.
        needDirectFallback = allowDirectFallback;
      } else {
        const minTurnEndOffset = Math.min(intersectionEndOffset, -minD);
        const turnStartOffset = Math.max(-minTurnEndOffset, intersectionStartOffset);

        const turnRadius = UnitType.GA_RADIAN.convertTo(Math.atan(tanHalfTheta * Math.sin(turnStartOffset)), UnitType.METER);

        const turnStart = startPath.offsetDistanceAlong(intersection, turnStartOffset, JoinGreatCircleToPointVectorBuilder.vec3Cache[3]);
        if (turnStartOffset - intersectionStartOffset > GeoMath.ANGULAR_TOLERANCE) {
          vectorIndex += this.circleVectorBuilder.build(
            vectors, vectorIndex,
            startPath,
            start, turnStart,
            flags,
            heading, isHeadingTrue
          );
        }

        vectorIndex += this.turnToJoinGreatCircleVectorBuilder.build(
          vectors, vectorIndex,
          turnStart, startPath,
          endPath,
          turnRadius,
          turnFlags,
          heading, isHeadingTrue
        );

        if (intersectionEndOffset + turnStartOffset > GeoMath.ANGULAR_TOLERANCE) {
          const turnEnd = endPath.offsetDistanceAlong(intersection, -turnStartOffset, JoinGreatCircleToPointVectorBuilder.vec3Cache[4]);
          vectorIndex += this.circleVectorBuilder.build(
            vectors, vectorIndex,
            endPath,
            turnEnd, end,
            flags,
            heading, isHeadingTrue
          );
        }
      }
    }

    if (needDirectFallback) {
      vectorIndex += this.directToPointVectorBuilder.build(
        vectors, vectorIndex,
        start, startPath,
        end,
        minTurnRadius, desiredTurnDirection,
        flags, includeTurnToCourseFlag, includeDirectFlag,
        heading, isHeadingTrue
      );
    }

    return vectorIndex - index;
  }
}
