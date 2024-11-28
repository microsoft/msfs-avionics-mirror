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

/**
 * Builds vectors representing paths directly connecting a defined initial point and course and a defined end point.
 */
export class DirectToPointVectorBuilder {
  private static readonly vec3Cache = ArrayUtils.create(4, () => Vec3Math.create());
  private static readonly geoPointCache = ArrayUtils.create(1, () => new GeoPoint(0, 0));
  private static readonly geoCircleCache = ArrayUtils.create(2, () => new GeoCircle(Vec3Math.create(), 0));

  private readonly circleVectorBuilder = new CircleVectorBuilder();

  /**
   * Builds a sequence of vectors representing a path that consists of an optional turn from a start point and initial
   * course toward an end point followed by an optional great-circle path terminating at the end point.
   * @param vectors The flight path vector array to which to add the vectors.
   * @param index The index in the array at which to add the vectors.
   * @param start The start point.
   * @param startCourse The initial true course at the start point, in degrees.
   * @param end The end point.
   * @param desiredTurnRadius The desired turn radius, in meters.
   * @param desiredTurnDirection The desired turn direction. If not defined, then a turn direction will be chosen such
   * that the initial turn is always toward the end point.
   * @param flags The flags to set on all built vectors. Defaults to none (0).
   * @param includeTurnToCourseFlag Whether to include the `TurnToCourse` flag on the vectors that comprise the initial
   * turn. Defaults to `true`.
   * @param includeDirectFlag Whether to include the `Direct` flag on all built vectors. Defaults to `true`.
   * @param heading The heading-to-fly to assign to all built vectors, in degrees, or `null` if no heading is to be
   * assigned. Defaults to `null`.
   * @param isHeadingTrue Whether the heading-to-fly assigned to built vectors is relative to true north instead of
   * magnetic north. Defaults to `false`.
   * @returns The number of vectors that were built and added to the array.
   */
  public build(
    vectors: FlightPathVector[],
    index: number,
    start: ReadonlyFloat64Array | LatLonInterface,
    startCourse: number,
    end: ReadonlyFloat64Array | LatLonInterface,
    desiredTurnRadius: number,
    desiredTurnDirection?: VectorTurnDirection,
    flags?: number,
    includeTurnToCourseFlag?: boolean,
    includeDirectFlag?: boolean,
    heading?: number | null,
    isHeadingTrue?: boolean
  ): number;
  /**
   * Builds a sequence of vectors representing a path that consists of an optional turn from a start point and initial
   * course toward an end point followed by an optional great-circle path terminating at the end point.
   * @param vectors The flight path vector array to which to add the vectors.
   * @param index The index in the array at which to add the vectors.
   * @param start The start point.
   * @param startPath The great-circle path defining the initial course.
   * @param end The end point.
   * @param desiredTurnRadius The desired turn radius, in meters.
   * @param desiredTurnDirection The desired turn direction. If not defined, then a turn direction will be chosen such
   * that the initial turn is always toward the end point.
   * @param flags The flags to set on all built vectors. Defaults to none (0).
   * @param includeTurnToCourseFlag Whether to include the `TurnToCourse` flag on the vectors that comprise the initial
   * turn. Defaults to `true`.
   * @param includeDirectFlag Whether to include the `Direct` flag on all built vectors. Defaults to `true`.
   * @param heading The heading-to-fly to assign to the vector, in degrees, or `null` if no heading is to be assigned.
   * Defaults to `null`.
   * @param isHeadingTrue Whether the heading-to-fly assigned to the vector is relative to true north instead of
   * magnetic north. Defaults to `false`.
   * @returns The number of vectors added to the array.
   */
  public build(
    vectors: FlightPathVector[],
    index: number,
    start: ReadonlyFloat64Array | LatLonInterface,
    startPath: GeoCircle,
    end: ReadonlyFloat64Array | LatLonInterface,
    desiredTurnRadius: number,
    desiredTurnDirection?: VectorTurnDirection,
    flags?: number,
    includeTurnToCourseFlag?: boolean,
    includeDirectFlag?: boolean,
    heading?: number | null,
    isHeadingTrue?: boolean
  ): number;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public build(
    vectors: FlightPathVector[],
    index: number,
    start: ReadonlyFloat64Array | LatLonInterface,
    startPath: GeoCircle | number,
    end: ReadonlyFloat64Array | LatLonInterface,
    desiredTurnRadius: number,
    desiredTurnDirection?: VectorTurnDirection,
    flags = 0,
    includeTurnToCourseFlag = true,
    includeDirectFlag = true,
    heading: number | null = null,
    isHeadingTrue = false
  ): number {
    let vectorIndex = index;

    if (typeof startPath === 'number') {
      startPath = DirectToPointVectorBuilder.geoCircleCache[0].setAsGreatCircle(start, startPath);
    }

    const endPos = DirectToPointVectorBuilder.geoPointCache[0];
    if (!(start instanceof Float64Array)) {
      start = GeoPoint.sphericalToCartesian(start as LatLonInterface, DirectToPointVectorBuilder.vec3Cache[0]);
    }
    if (!(end instanceof Float64Array)) {
      endPos.set(end as LatLonInterface);
      end = GeoPoint.sphericalToCartesian(end as LatLonInterface, DirectToPointVectorBuilder.vec3Cache[1]);
    } else {
      endPos.setFromCartesian(end);
    }

    const distanceToEnd = Vec3Math.unitAngle(start, end);

    if (distanceToEnd <= GeoMath.ANGULAR_TOLERANCE) {
      // The end point is coincident with the starting point. In this case we don't build any vectors.
      return vectorIndex - index;
    } else if (Math.abs(distanceToEnd - Math.PI) <= GeoMath.ANGULAR_TOLERANCE) {
      // The end point is antipodal to the starting point. In this case we will build a single great-circle vector
      // along the starting path from the starting point to the end point. All great-circle paths connecting antipodal
      // points are the same length, so staying on the starting path still gets us to the end point in the shortest
      // distance.
      vectorIndex += this.circleVectorBuilder.build(vectors, vectorIndex, startPath, start, end, flags, heading, isHeadingTrue);
      return vectorIndex - index;
    }

    const startPathEncirclesEnd = startPath.encircles(end);
    const startPathIncludesEnd = startPath.includes(end);

    const turnDirection = desiredTurnDirection ?? (startPathEncirclesEnd && !startPathIncludesEnd ? 'left' : 'right');

    const startToTurnCenterPath = DirectToPointVectorBuilder.geoCircleCache[1].set(
      turnDirection === 'left'
        ? Vec3Math.cross(start, startPath.center, DirectToPointVectorBuilder.vec3Cache[2])
        : Vec3Math.cross(startPath.center, start, DirectToPointVectorBuilder.vec3Cache[2]),
      MathUtils.HALF_PI
    );

    let maxTurnRadiusRad;
    if (!startPathIncludesEnd && startPathEncirclesEnd === (turnDirection === 'left')) {
      // The end point lies on the same side of the start path as the turn, which means there is the possibility that
      // the turn circle can encircle the end point. This would make it impossible to define a great circle that
      // intersects the end point and is also tangent to the turn circle. Therefore, we compute a maximum allowed turn
      // radius, defined as the radius such that the end point lies exactly on the turn circle.

      const startToTerminatorPathNormal = GeoCircle.getGreatCircleNormal(start, end, DirectToPointVectorBuilder.vec3Cache[2]);
      // The angle between the great-circle path from the start point to the turn center and the great-circle path from
      // the start point to the end point.
      const theta = Vec3Math.unitAngle(startToTurnCenterPath.center, startToTerminatorPathNormal);
      maxTurnRadiusRad = Math.atan(Math.sin(distanceToEnd) / (Math.cos(theta) * (1 + Math.cos(distanceToEnd))));
    } else {
      // The end point lies on the starting path or on the opposite side of the starting path as the turn. Either way,
      // no turn can encircle the end point. Therefore there is no maximum turn radius.

      maxTurnRadiusRad = Math.PI / 2;
    }

    const turnRadiusRad = Math.min(maxTurnRadiusRad, UnitType.METER.convertTo(desiredTurnRadius, UnitType.GA_RADIAN));

    const turnCenterVec = startToTurnCenterPath.offsetDistanceAlong(start, turnRadiusRad, DirectToPointVectorBuilder.vec3Cache[2]);

    // Find the great-circle path from the terminator fix that is tangent to the turn circle. There are guaranteed to
    // be two such paths. We choose between the two based on the initial turn direction.

    const turnCenterToTerminatorDistance = Vec3Math.unitAngle(turnCenterVec, end);
    // The angle between the great-circle path from the end point to the turn center and each of the great-circle paths
    // tthat include the end point and are tangent to the turn circle.
    const alpha = Math.asin(Math.min(1, Math.sin(turnRadiusRad) / Math.sin(turnCenterToTerminatorDistance)));

    const finalPath = DirectToPointVectorBuilder.geoCircleCache[1].setAsGreatCircle(turnCenterVec, end).rotate(end, alpha * (turnDirection === 'left' ? -1 : 1), Math.PI);
    const turnEndVec = finalPath.closest(turnCenterVec, DirectToPointVectorBuilder.vec3Cache[3]);

    flags |= includeDirectFlag ? FlightPathVectorFlags.Direct : 0;

    if (Vec3Math.unitAngle(turnEndVec, start) > GeoMath.ANGULAR_TOLERANCE) {
      vectorIndex += this.circleVectorBuilder.buildTurn(
        vectors, vectorIndex,
        UnitType.GA_RADIAN.convertTo(turnRadiusRad, UnitType.METER), turnDirection,
        turnCenterVec, start, turnEndVec,
        flags | (includeTurnToCourseFlag ? FlightPathVectorFlags.TurnToCourse : 0),
        heading, isHeadingTrue
      );
    }

    if (Vec3Math.unitAngle(turnEndVec, end) > GeoMath.ANGULAR_TOLERANCE) {
      vectorIndex += this.circleVectorBuilder.buildGreatCircle(vectors, vectorIndex, turnEndVec, end, undefined, flags, heading, isHeadingTrue);
    }

    return vectorIndex - index;
  }
}
