import { GeoCircle } from '../../../geo/GeoCircle';
import { LatLonInterface } from '../../../geo/GeoInterfaces';
import { GeoPoint } from '../../../geo/GeoPoint';
import { UnitType } from '../../../math/NumberUnit';
import { ReadonlyFloat64Array, Vec3Math } from '../../../math/VecMath';
import { ArrayUtils } from '../../../utils/datastructures/ArrayUtils';
import { FlightPathVector, FlightPathVectorFlags } from '../FlightPathVector';
import { CircleVectorBuilder } from './CircleVectorBuilder';

/**
 * Builds vectors representing constant-radius turns to join great-circle paths.
 */
export class TurnToJoinGreatCircleVectorBuilder {
  private static readonly vec3Cache = ArrayUtils.create(4, () => Vec3Math.create());
  private static readonly geoCircleCache = ArrayUtils.create(2, () => new GeoCircle(Vec3Math.create(), 0));

  private readonly circleVectorBuilder = new CircleVectorBuilder();

  /**
   * Builds a flight path vector representing a constant-radius turn starting from a defined start point and initial
   * course and ending at the point in the turn circle closest to a target great-circle path.
   * @param vectors The flight path vector array to which to add the vectors.
   * @param index The index in the array at which to add the vectors.
   * @param start The start point.
   * @param startCourse The initial true course, in degrees.
   * @param endPath A GeoCircle that defines the target path. Must be a great circle.
   * @param radius The radius of the turn, in meters.
   * @param flags The flags to set on the built vector. Defaults to the `TurnToCourse` flag.
   * @param heading The heading-to-fly to assign to the vector, in degrees, or `null` if no heading is to be assigned.
   * Defaults to `null`.
   * @param isHeadingTrue Whether the heading-to-fly assigned to the vector is relative to true north instead of
   * magnetic north. Defaults to `false`.
   * @returns The number of vectors that were built and added to the array, which is always equal to 1.
   * @throws Error if `endPath` is not a great circle.
   */
  public build(
    vectors: FlightPathVector[],
    index: number,
    start: ReadonlyFloat64Array | LatLonInterface,
    startCourse: number,
    endPath: GeoCircle,
    radius: number,
    flags?: number,
    heading?: number | null,
    isHeadingTrue?: boolean
  ): 1;
  /**
   * Builds a flight path vector representing a constant-radius turn starting from a defined start point and initial
   * course and ending at the point in the turn circle closest to a target great-circle path.
   * @param vectors The flight path vector array to which to add the vectors.
   * @param index The index in the array at which to add the vectors.
   * @param start The start point.
   * @param startPath A GeoCircle that defines the initial course. Must be a great circle.
   * @param endPath A GeoCircle that defines the target path. Must be a great circle.
   * @param radius The radius of the turn, in meters.
   * @param flags The flags to set on the built vector. Defaults to the `TurnToCourse` flag.
   * @param heading The heading-to-fly to assign to the vector, in degrees, or `null` if no heading is to be assigned.
   * Defaults to `null`.
   * @param isHeadingTrue Whether the heading-to-fly assigned to the vector is relative to true north instead of
   * magnetic north. Defaults to `false`.
   * @returns The number of vectors added to the sequence, which is always equal to 1.
   * @throws Error if `startPath` or `endPath` is not a great circle, or if `start` does not lie on `startPath`.
   */
  public build(
    vectors: FlightPathVector[],
    index: number,
    start: ReadonlyFloat64Array | LatLonInterface,
    startPath: GeoCircle,
    endPath: GeoCircle,
    radius: number,
    flags?: number,
    heading?: number | null,
    isHeadingTrue?: boolean
  ): 1;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public build(
    vectors: FlightPathVector[],
    index: number,
    start: ReadonlyFloat64Array | LatLonInterface,
    startPathArg: GeoCircle | number,
    endPath: GeoCircle,
    radius: number,
    flags = FlightPathVectorFlags.TurnToCourse,
    heading: number | null = null,
    isHeadingTrue = false
  ): 1 {
    if (!endPath.isGreatCircle()) {
      throw new Error('TurnToJoinGreatCircleVectorBuilder::build(): end path is not a great circle');
    }

    let startPath;
    if (startPathArg instanceof GeoCircle) {
      if (!startPathArg.isGreatCircle()) {
        throw new Error('TurnToJoinGreatCircleVectorBuilder::build(): start path is not a great circle');
      } else if (!startPathArg.includes(start)) {
        throw new Error('TurnToJoinGreatCircleVectorBuilder::build(): the starting point does not lie on the starting path.');
      }

      startPath = startPathArg;
    } else {
      startPath = TurnToJoinGreatCircleVectorBuilder.geoCircleCache[0].setAsGreatCircle(start, startPathArg);
    }

    if (!(start instanceof Float64Array)) {
      start = GeoPoint.sphericalToCartesian(start as LatLonInterface, TurnToJoinGreatCircleVectorBuilder.vec3Cache[0]);
    }

    const turnDirection = endPath.encircles(start) ? 'left' : 'right';
    const radiusRad = turnDirection === 'left'
      ? UnitType.METER.convertTo(radius, UnitType.GA_RADIAN)
      : Math.PI - UnitType.METER.convertTo(radius, UnitType.GA_RADIAN);

    const turnStartToCenterNormal = Vec3Math.cross(start, startPath.center, TurnToJoinGreatCircleVectorBuilder.vec3Cache[1]);
    const turnStartToCenterPath = TurnToJoinGreatCircleVectorBuilder.geoCircleCache[1].set(turnStartToCenterNormal, Math.PI / 2);
    const turnCenter = turnStartToCenterPath.offsetDistanceAlong(start, radiusRad, TurnToJoinGreatCircleVectorBuilder.vec3Cache[2]);

    const turnCircle = TurnToJoinGreatCircleVectorBuilder.geoCircleCache[1].set(turnCenter, radiusRad);
    const end = turnCircle.closest(
      Vec3Math.multScalar(endPath.center, turnDirection === 'left' ? -1 : 1, TurnToJoinGreatCircleVectorBuilder.vec3Cache[3]),
      TurnToJoinGreatCircleVectorBuilder.vec3Cache[1]
    );

    return this.circleVectorBuilder.build(
      vectors, index,
      turnCircle, start, end,
      flags,
      heading, isHeadingTrue
    );
  }
}
