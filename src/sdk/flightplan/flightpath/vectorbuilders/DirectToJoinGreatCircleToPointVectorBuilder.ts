import { GeoCircle } from '../../../geo/GeoCircle';
import { LatLonInterface } from '../../../geo/GeoInterfaces';
import { GeoMath } from '../../../geo/GeoMath';
import { GeoPoint } from '../../../geo/GeoPoint';
import { MathUtils } from '../../../math/MathUtils';
import { UnitType } from '../../../math/NumberUnit';
import { ReadonlyFloat64Array, Vec3Math } from '../../../math/VecMath';
import { ArrayUtils } from '../../../utils/datastructures/ArrayUtils';
import { FlightPathUtils } from '../FlightPathUtils';
import { FlightPathVector, FlightPathVectorFlags, VectorTurnDirection } from '../FlightPathVector';
import { CircleVectorBuilder } from './CircleVectorBuilder';
import { ConnectCirclesVectorBuilder } from './ConnectCirclesVectorBuilder';
import { ProcedureTurnVectorBuilder } from './ProcedureTurnVectorBuilder';

/**
 * Builds vectors representing paths connecting a start point and optional initial course to an end point and final
 * course.
 */
export class DirectToJoinGreatCircleAtPointVectorBuilder {
  private static readonly vec3Cache = ArrayUtils.create(5, () => Vec3Math.create());
  private static readonly geoCircleCache = ArrayUtils.create(4, () => new GeoCircle(Vec3Math.create(), 0));

  private readonly circleVectorBuilder = new CircleVectorBuilder();
  private readonly procTurnVectorBuilder = new ProcedureTurnVectorBuilder();
  private readonly connectCirclesVectorBuilder = new ConnectCirclesVectorBuilder();

  /**
   * Builds a sequence of vectors representing a path from a defined start point and optional initial course which
   * connects with a defined end point and final course.
   *
   * This method attempts to build a path that consists of an initial turn from the start point toward the end point,
   * followed by a great-circle path toward the end point, and ending with a final turn that joins the end point and
   * final course. One or more of these path components may be omitted if they are deemed unnecessary. A procedure turn
   * may be calculated in lieu of the path described above if the procedure turn is determined to be a more optimal
   * path.
   * @param vectors The flight path vector array to which to add the vectors.
   * @param index The index in the array at which to add the vectors.
   * @param start The start point.
   * @param startPath A GeoCircle that defines the initial course. Must be a great circle. If not defined, then an
   * initial course will be chosen to optimize the path that is built.
   * @param end The end point.
   * @param endPath A GeoCircle that defines the final course. Must be a great circle.
   * @param turnRadius The desired turn radius, in meters.
   * @param startTurnDirection The direction of the initial turn. If not defined, then a direction will be chosen to
   * optimize the path that is built.
   * @param flags The flags to set on all built vectors. Defaults to none (0).
   * @param includeTurnToCourseFlag Whether to include the `TurnToCourse` flag on the vectors that comprise the initial
   * and final turns. Defaults to `true`.
   * @param heading The heading-to-fly to assign to all built vectors, in degrees, or `null` if no heading is to be
   * assigned. Defaults to `null`.
   * @param isHeadingTrue Whether the heading-to-fly assigned to built vectors is relative to true north instead of
   * magnetic north. Defaults to `false`.
   * @returns The number of vectors that were built and added to the array.
   * @throws Error if either the start or end path is not a great circle.
   */
  public build(
    vectors: FlightPathVector[],
    index: number,
    start: ReadonlyFloat64Array | LatLonInterface,
    startPath: GeoCircle | undefined,
    end: ReadonlyFloat64Array | LatLonInterface,
    endPath: GeoCircle,
    turnRadius: number,
    startTurnDirection: VectorTurnDirection | undefined,
    flags = 0,
    includeTurnToCourseFlag = true,
    heading: number | null = null,
    isHeadingTrue = false
  ): number {
    if ((startPath && !startPath.isGreatCircle()) || !endPath.isGreatCircle()) {
      throw new Error('DirectToJoinGreatCircleAtPointVectorBuilder::build(): start or end path is not a great circle');
    }

    if (!(start instanceof Float64Array)) {
      start = GeoPoint.sphericalToCartesian(start as LatLonInterface, DirectToJoinGreatCircleAtPointVectorBuilder.vec3Cache[0]);
    }
    if (!(end instanceof Float64Array)) {
      end = GeoPoint.sphericalToCartesian(end as LatLonInterface, DirectToJoinGreatCircleAtPointVectorBuilder.vec3Cache[1]);
    }

    const startDistanceFromEndPath = endPath.distance(start);

    const turnRadiusRad = UnitType.METER.convertTo(turnRadius, UnitType.GA_RADIAN);

    let endTurnDirection: VectorTurnDirection = startDistanceFromEndPath > 0 ? 'right' : 'left';
    const endTurnCircle = FlightPathUtils.getTurnCircleStartingFromPath(
      end, endPath,
      turnRadiusRad, endTurnDirection,
      DirectToJoinGreatCircleAtPointVectorBuilder.geoCircleCache[1]
    );

    let startPathEndPathAngleDiff: number;
    let startToEndOffset: number | undefined;

    if (!startPath && Math.abs(startDistanceFromEndPath) <= GeoMath.ANGULAR_TOLERANCE) {
      // We can choose the start path and the start point lies on the end path. We will choose a direction for the
      // start path that is the shortest path from the start point to the end point.

      startPath = DirectToJoinGreatCircleAtPointVectorBuilder.geoCircleCache[0];

      const startToEndDistance = endPath.angleAlong(start, end, Math.PI, GeoMath.ANGULAR_TOLERANCE);
      if (startToEndDistance === 0) {
        // The start and end points are coincident. There is no path to build in this case, so we will return
        // immediately.
        return 0;
      } else if (startToEndDistance <= Math.PI) {
        startPath.set(endPath.center, endPath.radius);
        startPathEndPathAngleDiff = 0;
        startToEndOffset = startToEndDistance;
      } else {
        startPath.set(endPath.center, endPath.radius).reverse();
        startPathEndPathAngleDiff = Math.PI;
        startToEndOffset = startToEndDistance;
      }
    }

    if (startPath) {
      startPathEndPathAngleDiff ??= Vec3Math.unitAngle(startPath.center, endPath.center);

      if (startPathEndPathAngleDiff <= GeoMath.ANGULAR_TOLERANCE) {
        // The start and end paths are parallel. Check if continuing along the start path is the shortest path from the
        // start to the end point. If so, then we will simply create a great-circle vector from the start to the end.
        startToEndOffset ??= endPath.angleAlong(start, end, Math.PI, GeoMath.ANGULAR_TOLERANCE);
        if (startToEndOffset <= Math.PI) {
          return this.circleVectorBuilder.build(vectors, index, endPath, start, end, flags, heading, isHeadingTrue);
        } else {
          startTurnDirection ??= endTurnDirection;

          if (startTurnDirection !== endTurnDirection) {
            endTurnDirection = endTurnDirection === 'left' ? 'right' : 'left';
            endTurnCircle.reverse();
          }

          const startTurnCircle = FlightPathUtils.getTurnCircleStartingFromPath(
            start, startPath,
            turnRadiusRad, startTurnDirection,
            DirectToJoinGreatCircleAtPointVectorBuilder.geoCircleCache[2]
          );

          const turnFlags = flags | (includeTurnToCourseFlag ? FlightPathVectorFlags.TurnToCourse : FlightPathVectorFlags.None);

          return this.connectCirclesVectorBuilder.build(
            vectors, index,
            startTurnCircle, endTurnCircle,
            undefined,
            start, end,
            turnFlags, turnFlags, flags,
            heading, isHeadingTrue
          );
        }
      } else if (startPathEndPathAngleDiff >= Math.PI - GeoMath.ANGULAR_TOLERANCE) {
        // The start and end paths are antiparallel. We will execute a procedure turn that ends at the end point.

        const startTurnSign = startTurnDirection === 'left' ? -1 : 1;

        return this.procTurnVectorBuilder.build(
          vectors, index,
          start, startPath,
          end, endPath,
          startPath.bearingAt(start, Math.PI) + 45 * startTurnSign,
          turnRadius, startTurnDirection === 'left' ? 'right' : 'left',
          undefined, undefined,
          flags, includeTurnToCourseFlag,
          heading, isHeadingTrue
        );
      }
    }

    // For the rest of the method below, the start point is guaranteed to not lie on the end path.

    const startTurnCircle = DirectToJoinGreatCircleAtPointVectorBuilder.geoCircleCache[2];

    let isDone = false;
    do {
      let endTurnCircleIncludesStart: boolean | undefined;
      let isStartPathTangentToEndCircle: boolean | undefined;

      if (!startPath) {
        // We can choose the start path and the start point does not lie on the end path. We will attempt to choose a
        // direction for the start path such that the start path is tangent with the end turn.

        startPath = DirectToJoinGreatCircleAtPointVectorBuilder.geoCircleCache[0];

        const endTurnCenter = FlightPathUtils.getTurnCenterFromCircle(endTurnCircle, DirectToJoinGreatCircleAtPointVectorBuilder.vec3Cache[2]);
        const startToEndTurnCenterDistance = Vec3Math.unitAngle(endTurnCenter, start);
        if (Math.abs(startToEndTurnCenterDistance - turnRadiusRad) <= GeoMath.ANGULAR_TOLERANCE) {
          // The start point lies on the end turn circle.
          startPath.setAsGreatCircle(start, endTurnCircle);

          endTurnCircleIncludesStart = true;
          isStartPathTangentToEndCircle = true;
        } else if (Math.min(startToEndTurnCenterDistance, Math.PI - startToEndTurnCenterDistance) > turnRadiusRad) {
          // The angle between the great-circle path from the start point to the center of the end turn and the two
          // great-circle paths that are tangent to the end turn circle and include the start point.
          const alpha = Math.asin(MathUtils.clamp(Math.sin(turnRadiusRad) / Math.sin(startToEndTurnCenterDistance), -1, 1));

          startPath.setAsGreatCircle(start, endTurnCenter);
          // Choose the great-circle tangent that proceeds in the direction from the start point to the tangent point
          // with the end turn circle.
          startPath.rotate(start, alpha * (endTurnDirection === 'left' ? 1 : -1), Math.PI);

          endTurnCircleIncludesStart = false;
          isStartPathTangentToEndCircle = true;
        } else {
          // The start point lies in one of the areas that make it impossible to define a great-circle path that
          // both includes the start point and is tangent to the end turn circle. Therefore, we will make the start
          // path lie along the radial from the end turn center and the start point. The direction of the start path
          // (toward or away from the end turn center) is chosen such that if the start point is close to the turn
          // center, then the start path is directed away from the turn center, and if the start point is close to the
          // antipode of the turn center, then the start path is directed toward the turn center.

          if (startToEndTurnCenterDistance < turnRadiusRad) {
            startPath.setAsGreatCircle(endTurnCenter, start);
          } else {
            startPath.setAsGreatCircle(start, endTurnCenter);
          }

          endTurnCircleIncludesStart = false;
          isStartPathTangentToEndCircle = false;
        }
      }

      endTurnCircleIncludesStart ??= endTurnCircle.includes(start);
      isStartPathTangentToEndCircle ??= DirectToJoinGreatCircleAtPointVectorBuilder.geoCircleCache[3]
        // The circle that represents the centers of all geo circles of radius equal to the end turn circle radius
        // that are tangent to the start path.
        .set(startPath.center, Math.abs(endTurnCircle.radius - MathUtils.HALF_PI))
        .includes(endTurnCircle.center);

      if (endTurnCircleIncludesStart && isStartPathTangentToEndCircle) {
        // The start point lies on the end turn circle and the start path is tangent to the end turn circle. We will
        // build a vector along the end turn circle from the start to the end point if the two points are not
        // coincident.

        if (Vec3Math.unitAngle(start, end) > GeoMath.ANGULAR_TOLERANCE) {
          return this.circleVectorBuilder.build(
            vectors, index,
            endTurnCircle, start, end,
            flags | (includeTurnToCourseFlag ? FlightPathVectorFlags.TurnToCourse : FlightPathVectorFlags.None),
            heading, isHeadingTrue
          );
        } else {
          return 0;
        }
      }

      if (startTurnDirection === undefined) {
        // If the start turn direction is not defined, then we will choose the turn direction such that the turn is
        // toward the end point. If the end point is on the start path, then we will choose the start turn direction to
        // be the same as the end turn direction.

        const endDistanceFromStartPath = startPath.distance(end);
        if (endDistanceFromStartPath < -GeoMath.ANGULAR_TOLERANCE) {
          startTurnDirection = 'left';
        } else if (endDistanceFromStartPath > GeoMath.ANGULAR_TOLERANCE) {
          startTurnDirection = 'right';
        } else {
          startTurnDirection = endTurnDirection;
        }
      }

      FlightPathUtils.getTurnCircleStartingFromPath(
        start, startPath,
        turnRadiusRad, startTurnDirection,
        startTurnCircle
      );

      if (startTurnDirection !== endTurnDirection && !isStartPathTangentToEndCircle) {
        // If the start and end turn directions are not the same, then we need to check if the two turn circles are
        // secant. If so, then no great-circle path can join the two turns (i.e. no great-circle path is tangent to both
        // turn circles). If this is the case, then we will reverse the end turn direction - turn circles with the same
        // direction are guaranteed to have at least one great-circle tangent to both of them (as long as they are not
        // concentric).

        const startTurnCenter = FlightPathUtils.getTurnCenterFromCircle(startTurnCircle, DirectToJoinGreatCircleAtPointVectorBuilder.vec3Cache[2]);
        const endTurnCenter = FlightPathUtils.getTurnCenterFromCircle(endTurnCircle, DirectToJoinGreatCircleAtPointVectorBuilder.vec3Cache[3]);
        if (Vec3Math.unitAngle(startTurnCenter, endTurnCenter) < 2 * turnRadiusRad - GeoMath.ANGULAR_TOLERANCE) {
          endTurnDirection = startTurnDirection;
          endTurnCircle.reverse();

          // If we reversed the end turn direction, then we will continue the loop. The loop is guaranteed to iterate a
          // maximum of two times since the directions of the start and end turns is guaranteed to be the same in the
          // second iteration.
        } else {
          isDone = true;
        }
      } else {
        isDone = true;
      }
    } while (!isDone);

    const turnFlags = flags | (includeTurnToCourseFlag ? FlightPathVectorFlags.TurnToCourse : FlightPathVectorFlags.None);

    return this.connectCirclesVectorBuilder.build(
      vectors, index,
      startTurnCircle, endTurnCircle,
      undefined,
      start, end,
      turnFlags, turnFlags, flags,
      heading, isHeadingTrue
    );
  }
}
