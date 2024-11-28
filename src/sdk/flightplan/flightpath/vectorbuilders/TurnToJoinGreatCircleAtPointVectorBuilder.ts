import { GeoCircle } from '../../../geo/GeoCircle';
import { LatLonInterface } from '../../../geo/GeoInterfaces';
import { GeoPoint } from '../../../geo/GeoPoint';
import { UnitType } from '../../../math/NumberUnit';
import { ReadonlyFloat64Array, Vec3Math } from '../../../math/VecMath';
import { ArrayUtils } from '../../../utils/datastructures/ArrayUtils';
import { FlightPathVector, VectorTurnDirection } from '../FlightPathVector';
import { ConnectCirclesVectorBuilder } from './ConnectCirclesVectorBuilder';

/**
 * Builds vectors representing paths connecting initial great circle paths to final great circle paths via a turn
 * starting at the start point and a turn ending at the end point, connected by a great-circle path.
 */
export class TurnToJoinGreatCircleAtPointVectorBuilder {
  private static readonly vec3Cache = ArrayUtils.create(5, () => Vec3Math.create());
  private static readonly geoCircleCache = ArrayUtils.create(3, () => new GeoCircle(Vec3Math.create(), 0));

  private readonly connectCirclesVectorBuilder = new ConnectCirclesVectorBuilder();

  /**
   * Builds a sequence of vectors representing a path from a defined start point and initial course which turns and
   * connects with another turn via a great-circle path to terminate at a defined end point and final course.
   * @param vectors The flight path vector array to which to add the vectors.
   * @param index The index in the array at which to add the vectors.
   * @param start The start point.
   * @param startPath A GeoCircle that defines the initial course. Must be a great circle.
   * @param startTurnRadius The radius of the initial turn, in meters.
   * @param startTurnDirection The direction of the initial turn.
   * @param end The end point.
   * @param endPath A GeoCircle that defines the final course. Must be a great circle.
   * @param endTurnRadius The radius of the final turn, in meters.
   * @param endTurnDirection The direction of the final turn.
   * @param startTurnVectorFlags The flags to set on the initial turn vector. Defaults to none (0).
   * @param endTurnVectorFlags The flags to set on the final turn vector. Defaults to none (0).
   * @param connectVectorFlags The flags to set on the vector along the great-circle path connecting the turns.
   * Defaults to none (0).
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
    startPath: GeoCircle,
    startTurnRadius: number,
    startTurnDirection: VectorTurnDirection,
    end: ReadonlyFloat64Array | LatLonInterface,
    endPath: GeoCircle,
    endTurnRadius: number,
    endTurnDirection: VectorTurnDirection,
    startTurnVectorFlags = 0,
    endTurnVectorFlags = 0,
    connectVectorFlags = 0,
    heading: number | null = null,
    isHeadingTrue = false
  ): number {
    if (!startPath.isGreatCircle() || !endPath.isGreatCircle()) {
      throw new Error('TurnToJoinGreatCircleAtPointVectorBuilder::build(): start or end path is not a great circle');
    }

    if (!(start instanceof Float64Array)) {
      start = GeoPoint.sphericalToCartesian(start as LatLonInterface, TurnToJoinGreatCircleAtPointVectorBuilder.vec3Cache[0]);
    }
    if (!(end instanceof Float64Array)) {
      end = GeoPoint.sphericalToCartesian(end as LatLonInterface, TurnToJoinGreatCircleAtPointVectorBuilder.vec3Cache[1]);
    }

    const startTurnRadiusRad = UnitType.METER.convertTo(startTurnRadius, UnitType.GA_RADIAN);
    const startTurnOffsetPath = TurnToJoinGreatCircleAtPointVectorBuilder.geoCircleCache[0].setAsGreatCircle(start, startPath.center);
    const startTurnCircleRadiusRad = startTurnDirection === 'left' ? startTurnRadiusRad : Math.PI - startTurnRadiusRad;
    const startTurnCircleCenter = startTurnOffsetPath.offsetDistanceAlong(start, startTurnCircleRadiusRad, TurnToJoinGreatCircleAtPointVectorBuilder.vec3Cache[3], Math.PI);
    const startTurnCircle = TurnToJoinGreatCircleAtPointVectorBuilder.geoCircleCache[0].set(startTurnCircleCenter, startTurnCircleRadiusRad);

    const endTurnRadiusRad = UnitType.METER.convertTo(endTurnRadius, UnitType.GA_RADIAN);
    const endTurnOffsetPath = TurnToJoinGreatCircleAtPointVectorBuilder.geoCircleCache[1].setAsGreatCircle(end, endPath.center);
    const endTurnCircleRadiusRad = endTurnDirection === 'left' ? endTurnRadiusRad : Math.PI - endTurnRadiusRad;
    const endTurnCircleCenter = endTurnOffsetPath.offsetDistanceAlong(end, endTurnCircleRadiusRad, TurnToJoinGreatCircleAtPointVectorBuilder.vec3Cache[3], Math.PI);
    const endTurnCircle = TurnToJoinGreatCircleAtPointVectorBuilder.geoCircleCache[1].set(endTurnCircleCenter, endTurnCircleRadiusRad);

    return this.connectCirclesVectorBuilder.build(
      vectors, index,
      startTurnCircle, endTurnCircle,
      undefined,
      start, end,
      startTurnVectorFlags, endTurnVectorFlags, connectVectorFlags,
      heading, isHeadingTrue
    );
  }
}
