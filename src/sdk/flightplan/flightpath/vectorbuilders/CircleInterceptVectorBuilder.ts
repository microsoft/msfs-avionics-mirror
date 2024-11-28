import { GeoCircle } from '../../../geo/GeoCircle';
import { LatLonInterface } from '../../../geo/GeoInterfaces';
import { ReadonlyFloat64Array, Vec3Math } from '../../../math/VecMath';
import { ArrayUtils } from '../../../utils/datastructures/ArrayUtils';
import { FlightPathVector } from '../FlightPathVector';
import { CircleVectorBuilder } from './CircleVectorBuilder';

/**
 * Builds vectors representing great-circle paths that intercept other geo circles.
 */
export class CircleInterceptVectorBuilder {
  private static readonly geoCircleCache = ArrayUtils.create(1, () => new GeoCircle(Vec3Math.create(), 0));
  private static readonly intersectionCache = [new Float64Array(3), new Float64Array(3)];

  private readonly circleVectorBuilder = new CircleVectorBuilder();

  /**
   * Builds a flight path vector along a path from a defined start point to the closest intersection point with a
   * GeoCircle. If the vector path does not intersect the circle to intercept, then no vectors will be built.
   * @param vectors The flight path vector array to which to add the vector.
   * @param index The index in the array at which to add the vector.
   * @param start The start point.
   * @param course The initial true course, in degrees, of the path of the built vector.
   * @param circleToIntercept The circle to intercept.
   * @param flags The flags to set on the built vector. Defaults to none (0).
   * @returns The number of vectors that were built and added to the array.
   */
  public build(
    vectors: FlightPathVector[],
    index: number,
    start: ReadonlyFloat64Array | LatLonInterface,
    course: number,
    circleToIntercept: GeoCircle,
    flags?: number,
    heading?: number | null,
    isHeadingTrue?: boolean
  ): number;
  /**
   * Builds a flight path vector along a path from a defined start point to the closest intersection point with a
   * GeoCircle. If the vector path does not intersect the circle to intercept, then no vectors will be built.
   * @param vectors The flight path vector array to which to add the vector.
   * @param index The index in the array at which to add the vector.
   * @param start The start point.
   * @param path A GeoCircle that defines the path of the built vector.
   * @param circleToIntercept The circle to intercept.
   * @param flags The flags to set on the built vector. Defaults to none (0).
   * @returns The number of vectors that were built and added to the array.
   * @throws Error if `start` does not lie on `path`.
   */
  public build(
    vectors: FlightPathVector[],
    index: number,
    start: ReadonlyFloat64Array | LatLonInterface,
    path: GeoCircle,
    circleToIntercept: GeoCircle,
    flags?: number,
    heading?: number | null,
    isHeadingTrue?: boolean
  ): number;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public build(
    vectors: FlightPathVector[],
    index: number,
    start: ReadonlyFloat64Array | LatLonInterface,
    pathArg: number | GeoCircle,
    circleToIntercept: GeoCircle,
    flags = 0,
    heading: number | null = null,
    isHeadingTrue = false
  ): number {
    if (circleToIntercept.includes(start)) {
      return 0;
    }

    let path;
    if (pathArg instanceof GeoCircle) {
      if (!pathArg.includes(start)) {
        throw new Error('CircleInterceptVectorBuilder::build(): the starting point does not lie on the starting path.');
      }

      path = pathArg;
    } else {
      path = CircleInterceptVectorBuilder.geoCircleCache[0].setAsGreatCircle(start, pathArg);
    }

    const intersections = CircleInterceptVectorBuilder.intersectionCache;
    const numIntersections = path.intersection(circleToIntercept, intersections);
    if (numIntersections === 0) {
      return 0;
    }

    const intersectionIndex = (numIntersections === 1 || circleToIntercept.encircles(start)) ? 0 : 1;
    const endVec = intersections[intersectionIndex];

    return this.circleVectorBuilder.build(
      vectors, index,
      path,
      start, endVec,
      flags,
      heading, isHeadingTrue
    );
  }
}
