import { GeoCircle } from '../../../geo/GeoCircle';
import { LatLonInterface } from '../../../geo/GeoInterfaces';
import { GeoMath } from '../../../geo/GeoMath';
import { GeoPoint } from '../../../geo/GeoPoint';
import { UnitType } from '../../../math/NumberUnit';
import { ReadonlyFloat64Array, Vec3Math } from '../../../math/VecMath';
import { ArrayUtils } from '../../../utils/datastructures/ArrayUtils';
import { FlightPathUtils } from '../FlightPathUtils';
import { FlightPathVector } from '../FlightPathVector';
import { CircleVectorBuilder } from './CircleVectorBuilder';

/**
 * Builds vectors representing paths that connect two geo circles.
 */
export class ConnectCirclesVectorBuilder {
  private static readonly vec3Cache = ArrayUtils.create(8, () => Vec3Math.create());
  private static readonly geoCircleCache = ArrayUtils.create(5, () => new GeoCircle(Vec3Math.create(), 0));
  private static readonly intersectionCache = [new Float64Array(3), new Float64Array(3)];

  private readonly circleVectorBuilder = new CircleVectorBuilder();

  /**
   * Builds a sequence of vectors representing a path which consists of a single geo circle which connects two other
   * circles and optionally paths to link the connecting circle with a start point on the from circle and an end point
   * on the to circle.
   * @param vectors The flight path vector array to which to add the vectors.
   * @param index The index in the array at which to add the vectors.
   * @param fromCircle The circle from which to add the connecting circle.
   * @param toCircle The circle to which to add the connecting circle.
   * @param radius The radius, in meters, of the circle to join the two circles. If not defined, defaults to `pi / 2`
   * times the radius of the Earth (and therefore the connecting circle will be a great circle).
   * @param from The starting point along `fromCircle`. If not defined, this will be assumed to be equal to the
   * point where the connecting circle meets `fromCircle`.
   * @param to The ending point along `toCircle`. If not defined, this will be assumed to be equal to the point where
   * the connecting circle meets `toCircle`.
   * @param fromCircleVectorFlags The flags to set on the vector along `fromCircle`. Defaults to none (0).
   * @param toCircleVectorFlags The flags to set on the vector along the `toCircle`. Defaults to none (0).
   * @param connectVectorFlags The flags to set on the vector connecting `fromCircle` to `toCircle`. Defaults to none
   * (0).
   * @param heading The heading-to-fly to assign to all built vectors, in degrees, or `null` if no heading is to be
   * assigned. Defaults to `null`.
   * @param isHeadingTrue Whether the heading-to-fly assigned to built vectors is relative to true north instead of
   * magnetic north. Defaults to `false`.
   * @returns The number of vectors that were built and added to the array.
   */
  public build(
    vectors: FlightPathVector[],
    index: number,
    fromCircle: GeoCircle,
    toCircle: GeoCircle,
    radius?: number,
    from?: ReadonlyFloat64Array | LatLonInterface,
    to?: ReadonlyFloat64Array | LatLonInterface,
    fromCircleVectorFlags = 0,
    toCircleVectorFlags = 0,
    connectVectorFlags = 0,
    heading: number | null = null,
    isHeadingTrue = false
  ): number {
    if (radius !== undefined && radius <= GeoMath.ANGULAR_TOLERANCE) {
      return 0;
    }

    const angle = Vec3Math.unitAngle(fromCircle.center, toCircle.center);
    if (
      (angle <= GeoMath.ANGULAR_TOLERANCE && fromCircle.radius === toCircle.radius)
      || (Math.PI - angle <= GeoMath.ANGULAR_TOLERANCE && Math.PI - fromCircle.radius - toCircle.radius <= GeoMath.ANGULAR_TOLERANCE)
    ) {
      return 0;
    }

    if (from && !(from instanceof Float64Array)) {
      from = GeoPoint.sphericalToCartesian(from as LatLonInterface, ConnectCirclesVectorBuilder.vec3Cache[0]);
    }
    if (to && !(to instanceof Float64Array)) {
      to = GeoPoint.sphericalToCartesian(to as LatLonInterface, ConnectCirclesVectorBuilder.vec3Cache[1]);
    }

    const radiusRad = Math.min(Math.PI / 2, radius ? UnitType.METER.convertTo(radius, UnitType.GA_RADIAN) : Infinity);
    const joinCircle = this.findCircleToJoinCircles(
      fromCircle, toCircle,
      radiusRad, ConnectCirclesVectorBuilder.geoCircleCache[0],
      from, to
    );

    if (!joinCircle) {
      return 0;
    }

    let vectorIndex = index;

    const joinStart = joinCircle.closest(
      FlightPathUtils.getTurnCenterFromCircle(fromCircle, ConnectCirclesVectorBuilder.vec3Cache[2]),
      ConnectCirclesVectorBuilder.vec3Cache[2]
    );
    const joinEnd = joinCircle.closest(
      FlightPathUtils.getTurnCenterFromCircle(toCircle, ConnectCirclesVectorBuilder.vec3Cache[3]),
      ConnectCirclesVectorBuilder.vec3Cache[3]
    );

    if (from && Vec3Math.unitAngle(from, joinStart) > GeoPoint.EQUALITY_TOLERANCE) {
      vectorIndex += this.circleVectorBuilder.build(
        vectors, vectorIndex,
        fromCircle,
        from, joinStart,
        fromCircleVectorFlags,
        heading, isHeadingTrue
      );
    }

    vectorIndex += this.circleVectorBuilder.build(
      vectors, vectorIndex,
      joinCircle,
      joinStart, joinEnd,
      connectVectorFlags,
      heading, isHeadingTrue
    );

    if (to && Vec3Math.unitAngle(to, joinEnd) > GeoPoint.EQUALITY_TOLERANCE) {
      vectorIndex += this.circleVectorBuilder.build(
        vectors, vectorIndex,
        toCircle,
        joinEnd, to,
        toCircleVectorFlags,
        heading, isHeadingTrue
      );
    }

    return vectorIndex - index;
  }

  /**
   * Finds a GeoCircle which connects (is tangent to) two other circles.
   * @param fromCircle The circle at the beginning of the connecting circle.
   * @param toCircle The circle at the end of the connecting circle.
   * @param radius The desired radius of the connecting circle, in great-arc radians.
   * @param out A GeoCircle object to which to write the result.
   * @param from The starting point along `fromCircle`. If not defined, this will be assumed to be equal to the
   * point where the connecting circle meets `fromCircle`.
   * @param to The ending point along `toCircle`. If not defined, this will be assumed to be equal to the point where
   * the connecting circle meets `toCircle`.
   * @returns a GeoCircle which connects the two circles, or null if one could not be found.
   */
  private findCircleToJoinCircles(
    fromCircle: GeoCircle,
    toCircle: GeoCircle,
    radius: number,
    out: GeoCircle,
    from?: ReadonlyFloat64Array,
    to?: ReadonlyFloat64Array
  ): GeoCircle | null {
    /*
     * Theory: the locus of all centers of circle of radius r tangent to circle with center C and radius R is
     * equivalent to the set of circles S(C) with center C and positive radius |r +/- R|. If we further restrict the
     * set of tangent circles to those where both the original and tangent circle run in the same direction at the
     * tangent point, the locus of centers can be further reduced to the single circle Sd(C) with center C and
     * positive radius |r - R|. Therefore, to find the centers of the circles of radius r connecting the circles C1 and
     * C2, we need only find the intersections of Sd(C1) and Sd(C2).
     */

    const solutions: GeoCircle[] = [];
    const intersections = ConnectCirclesVectorBuilder.intersectionCache;

    const leftTurnRadius = radius;
    let fromCircleOffsetRadius = Math.abs(leftTurnRadius - fromCircle.radius);
    let toCircleOffsetRadius = Math.abs(leftTurnRadius - toCircle.radius);
    let fromCircleOffset = ConnectCirclesVectorBuilder.geoCircleCache[1].set(fromCircle.center, fromCircleOffsetRadius);
    let toCircleOffset = ConnectCirclesVectorBuilder.geoCircleCache[2].set(toCircle.center, toCircleOffsetRadius);
    const numLeftTurnSolutions = fromCircleOffset.intersection(toCircleOffset, intersections);

    if (numLeftTurnSolutions === 1) {
      solutions.push(ConnectCirclesVectorBuilder.geoCircleCache[1].set(intersections[0], leftTurnRadius));
    } else if (numLeftTurnSolutions === 2) {
      solutions.push(ConnectCirclesVectorBuilder.geoCircleCache[1].set(intersections[0], leftTurnRadius));
      solutions.push(ConnectCirclesVectorBuilder.geoCircleCache[2].set(intersections[1], leftTurnRadius));
    }

    if (radius !== Math.PI / 2) {
      const rightTurnRadius = Math.PI - radius;
      fromCircleOffsetRadius = Math.abs(rightTurnRadius - fromCircle.radius);
      toCircleOffsetRadius = Math.abs(rightTurnRadius - toCircle.radius);
      fromCircleOffset = ConnectCirclesVectorBuilder.geoCircleCache[3].set(fromCircle.center, fromCircleOffsetRadius);
      toCircleOffset = ConnectCirclesVectorBuilder.geoCircleCache[4].set(toCircle.center, toCircleOffsetRadius);
      const numRightTurnSolutions = fromCircleOffset.intersection(toCircleOffset, intersections);

      if (numRightTurnSolutions === 1) {
        solutions.push(ConnectCirclesVectorBuilder.geoCircleCache[3].set(intersections[0], rightTurnRadius));
      } else if (numRightTurnSolutions === 2) {
        solutions.push(ConnectCirclesVectorBuilder.geoCircleCache[3].set(intersections[0], rightTurnRadius));
        solutions.push(ConnectCirclesVectorBuilder.geoCircleCache[4].set(intersections[1], rightTurnRadius));
      }
    }

    if (solutions.length === 0) {
      return null;
    } else if (solutions.length === 1) {
      return out.set(solutions[0].center, solutions[0].radius);
    } else {
      // choose the solution that results in the shortest path from fromVec to toVec
      let circle = solutions[0];
      let minDistance = this.calculateJoinCirclesPathDistance(fromCircle, toCircle, solutions[0], from, to);
      for (let i = 1; i < solutions.length; i++) {
        const distance = this.calculateJoinCirclesPathDistance(fromCircle, toCircle, solutions[i], from, to);
        if (distance < minDistance) {
          circle = solutions[i];
          minDistance = distance;
        }
      }

      return out.set(circle.center, circle.radius);
    }
  }

  /**
   * Calculates the total distance along the joining path between two circles.
   * @param fromCircle The circle at the beginning of the connecting circle.
   * @param toCircle The circle at the end of the connecting circle.
   * @param joinCircle The connecting circle.
   * @param from The starting point along `fromCircle`. If not defined, this will be assumed to be equal to the
   * point where the connecting circle meets `fromCircle`.
   * @param to The ending point along `toCircle`. If not defined, this will be assumed to be equal to the point where
   * the connecting circle meets `toCircle`.
   * @returns the total distance along the joining path, in great-arc radians.
   */
  private calculateJoinCirclesPathDistance(
    fromCircle: GeoCircle,
    toCircle: GeoCircle,
    joinCircle: GeoCircle,
    from?: ReadonlyFloat64Array,
    to?: ReadonlyFloat64Array
  ): number {
    let distance = 0;

    const joinStartVec = joinCircle.closest(
      FlightPathUtils.getTurnCenterFromCircle(fromCircle, ConnectCirclesVectorBuilder.vec3Cache[6]),
      ConnectCirclesVectorBuilder.vec3Cache[6]
    );
    const joinEndVec = joinCircle.closest(
      FlightPathUtils.getTurnCenterFromCircle(toCircle, ConnectCirclesVectorBuilder.vec3Cache[7]),
      ConnectCirclesVectorBuilder.vec3Cache[7]
    );

    if (from) {
      distance += fromCircle.distanceAlong(from, joinStartVec, Math.PI);
    }

    distance += joinCircle.distanceAlong(joinStartVec, joinEndVec, Math.PI);

    if (to) {
      distance += toCircle.distanceAlong(joinEndVec, to, Math.PI);
    }

    return distance;
  }
}
