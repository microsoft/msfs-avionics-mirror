import { GeoCircle } from '../../../geo/GeoCircle';
import { LatLonInterface } from '../../../geo/GeoInterfaces';
import { GeoPoint } from '../../../geo/GeoPoint';
import { MathUtils } from '../../../math/MathUtils';
import { UnitType } from '../../../math/NumberUnit';
import { ReadonlyFloat64Array, Vec3Math } from '../../../math/VecMath';
import { ArrayUtils } from '../../../utils/datastructures/ArrayUtils';
import { FlightPathUtils } from '../FlightPathUtils';
import { FlightPathVector, VectorTurnDirection } from '../FlightPathVector';

/**
 * Builds flight path vectors from simple GeoCircle paths.
 */
export class CircleVectorBuilder {
  private static readonly vec3Cache = ArrayUtils.create(1, () => Vec3Math.create());
  private static readonly geoPointCache = ArrayUtils.create(3, () => new GeoPoint(0, 0));
  private static readonly geoCircleCache = ArrayUtils.create(1, () => new GeoCircle(Vec3Math.create(), 0));

  /**
   * Builds a flight path vector from a GeoCircle.
   * @param vectors The flight path vector array to which to add the vector.
   * @param index The index in the array at which to add the vector.
   * @param circle The circle which defines the vector path.
   * @param start The start point.
   * @param end The end point.
   * @param flags The flags to set on the vector. Defaults to none (0).
   * @param heading The heading-to-fly to assign to the vector, in degrees, or `null` if no heading is to be assigned.
   * Defaults to `null`.
   * @param isHeadingTrue Whether the heading-to-fly assigned to the vector is relative to true north instead of
   * magnetic north. Defaults to `false`.
   * @returns The number of vectors that were built and added to the array, which is always equal to 1.
   */
  public build(
    vectors: FlightPathVector[],
    index: number,
    circle: GeoCircle,
    start: ReadonlyFloat64Array | LatLonInterface,
    end: ReadonlyFloat64Array | LatLonInterface,
    flags = 0,
    heading: number | null = null,
    isHeadingTrue = false
  ): 1 {
    FlightPathUtils.setVectorFromCircle(vectors[index] ??= FlightPathUtils.createEmptyVector(), circle, start, end, flags, heading, isHeadingTrue);
    return 1;
  }

  /**
   * Builds a flight path vector from a great-circle path between two points.
   * @param vectors The flight path vector array to which to add the vector.
   * @param index The index in the array at which to add the vector.
   * @param start The start point.
   * @param end The end point.
   * @param defaultCourse A default course to use to define a path when the start and end points are coincident or
   * antipodal. If the default course is positive, then it will define the path's initial bearing at the start point.
   * If the default course is negative, then its negative will define the path's final bearing at the end point. If not
   * defined, then no vector will be built for coincident or antipodal start and end points.
   * @param flags The flags to set on the vector. Defaults to none (0).
   * @param heading The heading-to-fly to assign to the vector, in degrees, or `null` if no heading is to be assigned.
   * Defaults to `null`.
   * @param isHeadingTrue Whether the heading-to-fly assigned to the vector is relative to true north instead of
   * magnetic north. Defaults to `false`.
   * @returns The number of vectors that were built and added to the array.
   */
  public buildGreatCircle(
    vectors: FlightPathVector[],
    index: number,
    start: ReadonlyFloat64Array | LatLonInterface,
    end: ReadonlyFloat64Array | LatLonInterface,
    defaultCourse?: number,
    flags?: number,
    heading?: number | null,
    isHeadingTrue?: boolean
  ): number;
  /**
   * Builds a flight path vector from a great-circle path originating at a point and initial course and ending after a
   * given distance.
   * @param vectors The flight path vector array to which to add the vector.
   * @param index The index in the array at which to add the vector.
   * @param start The start point.
   * @param initialCourse The initial true course (bearing) of the path as measured at the start point, in degrees.
   * @param distance The distance of the path, in great-arc radians.
   * @param flags The flags to set on the vector. Defaults to none (0).
   * @param heading The heading-to-fly to assign to the vector, in degrees, or `null` if no heading is to be assigned.
   * Defaults to `null`.
   * @param isHeadingTrue Whether the heading-to-fly assigned to the vector is relative to true north instead of
   * magnetic north. Defaults to `false`.
   * @returns The number of vectors that were built and added to the array.
   */
  public buildGreatCircle(
    vectors: FlightPathVector[],
    index: number,
    start: ReadonlyFloat64Array | LatLonInterface,
    initialCourse: number,
    distance: number,
    flags?: number,
    heading?: number | null,
    isHeadingTrue?: boolean
  ): number;
  /**
   * Builds a flight path vector from a great-circle path originating at a point and initial course and ending at
   * another point.
   * @param vectors The flight path vector array to which to add the vector.
   * @param index The index in the array at which to add the vector.
   * @param start The start point.
   * @param initialCourse The initial true course (bearing) of the path as measured at the start point, in degrees.
   * @param end The end point.
   * @param flags The flags to set on the vector. Defaults to none (0).
   * @param heading The heading-to-fly to assign to the vector, in degrees, or `null` if no heading is to be assigned.
   * Defaults to `null`.
   * @param isHeadingTrue Whether the heading-to-fly assigned to the vector is relative to true north instead of
   * magnetic north. Defaults to `false`.
   * @returns The number of vectors that were built and added to the array.
   */
  public buildGreatCircle(
    vectors: FlightPathVector[],
    index: number,
    start: ReadonlyFloat64Array | LatLonInterface,
    initialCourse: number,
    end: ReadonlyFloat64Array | LatLonInterface,
    flags?: number,
    heading?: number | null,
    isHeadingTrue?: boolean
  ): number;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public buildGreatCircle(
    vectors: FlightPathVector[],
    index: number,
    start: ReadonlyFloat64Array | LatLonInterface,
    arg4: ReadonlyFloat64Array | LatLonInterface | number,
    arg5?: ReadonlyFloat64Array | LatLonInterface | number,
    flags = 0,
    heading: number | null = null,
    isHeadingTrue = false
  ): number {
    if (typeof arg4 === 'number'
    ) {
      return this.buildGreatCircleFromPointBearing(vectors, index, start, arg4, arg5!, flags, heading, isHeadingTrue);
    } else {
      return this.buildGreatCircleFromEndpoints(vectors, index, start, arg4, arg5 as number | undefined, flags, heading, isHeadingTrue);
    }
  }

  /**
   * Builds a flight path vector from a great-circle path between two points.
   * @param vectors The flight path vector array to which to add the vector.
   * @param index The index in the array at which to add the vector.
   * @param start The start point.
   * @param end The end point.
   * @param defaultCourse A default course to use to define a path when the start and end points are coincident or
   * antipodal. If the default course is positive, then it will define the path's initial bearing at the start point.
   * If the default course is negative, then its negative will define the path's final bearing at the end point. If not
   * defined, then no vector will be built for coincident or antipodal start and end points.
   * @param flags The flags to set on the vector. Defaults to none (0).
   * @param heading The heading-to-fly to assign to the vector, in degrees, or `null` if no heading is to be assigned.
   * Defaults to `null`.
   * @param isHeadingTrue Whether the heading-to-fly assigned to the vector is relative to true north instead of
   * magnetic north. Defaults to `false`.
   * @returns The number of vectors that were built and added to the array.
   */
  private buildGreatCircleFromEndpoints(
    vectors: FlightPathVector[],
    index: number,
    start: ReadonlyFloat64Array | LatLonInterface,
    end: ReadonlyFloat64Array | LatLonInterface,
    defaultCourse?: number,
    flags = 0,
    heading: number | null = null,
    isHeadingTrue = false
  ): number {
    const circle = CircleVectorBuilder.geoCircleCache[0].setAsGreatCircle(start, end);

    if (!circle.isValid()) {
      if (defaultCourse === undefined) {
        return 0;
      } else {
        if (defaultCourse < 0) {
          circle.setAsGreatCircle(end, -defaultCourse);
        } else {
          circle.setAsGreatCircle(start, defaultCourse);
        }
      }
    }

    return this.build(vectors, index, circle, start, end, flags, heading, isHeadingTrue);
  }

  /**
   * Builds a flight path vector from a great-circle path originating at a point and initial course and ending after a
   * given distance or at a defined end point.
   * @param vectors The flight path vector array to which to add the vector.
   * @param index The index in the array at which to add the vector.
   * @param start The start point.
   * @param initialCourse The initial true course (bearing) of the path as measured at the start point, in degrees.
   * @param end The parameter that defines the end of the path, as either a distance in great-arc radians or an end
   * point.
   * @param flags The flags to set on the vector. Defaults to none (0).
   * @param heading The heading-to-fly to assign to the vector, in degrees, or `null` if no heading is to be assigned.
   * Defaults to `null`.
   * @param isHeadingTrue Whether the heading-to-fly assigned to the vector is relative to true north instead of
   * magnetic north. Defaults to `false`.
   * @returns The number of vectors that were built and added to the array.
   */
  private buildGreatCircleFromPointBearing(
    vectors: FlightPathVector[],
    index: number,
    start: ReadonlyFloat64Array | LatLonInterface,
    initialCourse: number,
    end: number | ReadonlyFloat64Array | LatLonInterface,
    flags = 0,
    heading: number | null = null,
    isHeadingTrue = false
  ): number {
    const circle = CircleVectorBuilder.geoCircleCache[0].setAsGreatCircle(start, initialCourse);
    if (typeof end === 'number') {
      end = circle.offsetDistanceAlong(start, end, CircleVectorBuilder.vec3Cache[0], Math.PI);
    }
    return this.build(vectors, index, circle, start, end, flags, heading, isHeadingTrue);
  }

  /**
   * Builds a flight path vector from a path representing a constant-radius turn.
   * @param vectors The flight path vector array to which to add the vector.
   * @param index The index in the array at which to add the vector.
   * @param turnRadius The radius of the turn, in meters.
   * @param turnDirection The direction of the turn.
   * @param center The center of the turn.
   * @param start The start point.
   * @param end The end point.
   * @param flags The flags to set on the vector. Defaults to none (0).
   * @param heading The heading-to-fly to assign to the vector, in degrees, or `null` if no heading is to be assigned.
   * Defaults to `null`.
   * @param isHeadingTrue Whether the heading-to-fly assigned to the vector is relative to true north instead of
   * magnetic north. Defaults to `false`.
   * @returns The number of vectors that were built and added to the array, which is always equal to 1.
   */
  public buildTurn(
    vectors: FlightPathVector[],
    index: number,
    turnRadius: number,
    turnDirection: VectorTurnDirection,
    center: ReadonlyFloat64Array | LatLonInterface,
    start: ReadonlyFloat64Array | LatLonInterface,
    end: ReadonlyFloat64Array | LatLonInterface,
    flags = 0,
    heading: number | null = null,
    isHeadingTrue = false
  ): 1 {
    return this.build(
      vectors, index,
      FlightPathUtils.getTurnCircle(center, UnitType.METER.convertTo(turnRadius, UnitType.GA_RADIAN), turnDirection, CircleVectorBuilder.geoCircleCache[0]),
      start, end,
      flags,
      heading, isHeadingTrue
    );
  }

  /**
   * Builds a flight path vector representing a constant-radius turn from a defined start point and initial course
   * toward a defined final course.
   * @param vectors The flight path vector array to which to add the vector.
   * @param index The index in the array at which to add the vector.
   * @param start The start point.
   * @param turnRadius The radius of the turn, in meters.
   * @param turnDirection The direction of the turn.
   * @param fromCourse The initial true course at the start of the turn, in degrees.
   * @param toCourse The final true course at the end of the turn, in degrees.
   * @param flags The flags to set on the vector. Defaults to none (0).
   * @param heading The heading-to-fly to assign to the vector, in degrees, or `null` if no heading is to be assigned.
   * Defaults to `null`.
   * @param isHeadingTrue Whether the heading-to-fly assigned to the vector is relative to true north instead of
   * magnetic north. Defaults to `false`.
   * @returns The number of vectors that were built and added to the array.
   */
  public buildTurnToCourse(
    vectors: FlightPathVector[],
    index: number,
    start: ReadonlyFloat64Array | LatLonInterface,
    turnRadius: number,
    turnDirection: VectorTurnDirection,
    fromCourse: number,
    toCourse: number,
    flags = 0,
    heading: number | null = null,
    isHeadingTrue = false
  ): number {
    if (start instanceof Float64Array) {
      start = CircleVectorBuilder.geoPointCache[0].setFromCartesian(start);
    }

    const radiusRad = UnitType.METER.convertTo(turnRadius, UnitType.GA_RADIAN);
    const turnCenterPoint = CircleVectorBuilder.geoPointCache[1].set(start as LatLonInterface).offset(fromCourse + (turnDirection === 'left' ? -90 : 90), radiusRad);
    const turnStartBearing = turnCenterPoint.bearingTo(start as LatLonInterface);
    const turnEndBearing = MathUtils.normalizeAngleDeg(turnStartBearing + (toCourse - fromCourse));
    const turnEndPoint = turnCenterPoint.offset(turnEndBearing, radiusRad, CircleVectorBuilder.geoPointCache[2]);

    if (turnEndPoint.equals(start as LatLonInterface)) {
      return 0;
    }

    return this.buildTurn(
      vectors, index,
      turnRadius, turnDirection,
      turnCenterPoint, start, turnEndPoint,
      flags,
      heading, isHeadingTrue
    );
  }
}
