import { GeoCircle, GeoMath, GeoPoint, LatLonInterface } from '../../geo';
import { MathUtils, ReadonlyFloat64Array, UnitType, Vec3Math } from '../../math';
import { FlightPlanLeg, LegTurnDirection } from '../../navigation/Facilities';
import { ArrayUtils } from '../../utils/datastructures/ArrayUtils';
import { LegCalculations } from '../FlightPlanning';
import { FlightPathVector, FlightPathVectorFlags, VectorTurnDirection } from './FlightPathVector';

/**
 * Utility class for working with flight path calculations.
 */
export class FlightPathUtils {
  private static readonly vec3Cache = ArrayUtils.create(4, () => Vec3Math.create());
  private static readonly geoPointCache = ArrayUtils.create(3, () => new GeoPoint(0, 0));
  private static readonly geoCircleCache = ArrayUtils.create(1, () => new GeoCircle(Vec3Math.create(), 0));

  /**
   * Creates an empty flight path vector.
   * @returns An empty flight path vector.
   */
  public static createEmptyVector(): FlightPathVector {
    return {
      flags: FlightPathVectorFlags.None,
      radius: 0,
      centerX: 1,
      centerY: 0,
      centerZ: 0,
      startLat: 0,
      startLon: 0,
      endLat: 0,
      endLon: 0,
      distance: 0,
      heading: null,
      isHeadingTrue: false
    };
  }

  /**
   * Sets the parameters of a flight path vector using a GeoCircle.
   * @param vector The fligh path vector to set.
   * @param circle The GeoCircle defining the vector's path.
   * @param start The start of the vector.
   * @param end The end of the vector.
   * @param flags The flags to set on the vector.
   * @param heading The heading-to-fly to assign to the vector, in degrees, or `null` if no heading is to be assigned.
   * Defaults to `null`.
   * @param isHeadingTrue Whether the heading-to-fly assigned to the vector is relative to true north instead of
   * magnetic north. Defaults to `false`.
   * @returns The circle vector, after its parameters have been set.
   */
  public static setVectorFromCircle(
    vector: FlightPathVector,
    circle: GeoCircle,
    start: ReadonlyFloat64Array | LatLonInterface,
    end: ReadonlyFloat64Array | LatLonInterface,
    flags: number,
    heading: number | null = null,
    isHeadingTrue = false
  ): FlightPathVector {
    vector.flags = flags;

    vector.radius = circle.radius;
    vector.centerX = circle.center[0];
    vector.centerY = circle.center[1];
    vector.centerZ = circle.center[2];
    vector.distance = UnitType.GA_RADIAN.convertTo(circle.distanceAlong(start, end, Math.PI), UnitType.METER);

    start instanceof Float64Array && (start = FlightPathUtils.geoPointCache[0].setFromCartesian(start));
    end instanceof Float64Array && (end = FlightPathUtils.geoPointCache[1].setFromCartesian(end));

    vector.startLat = (start as LatLonInterface).lat;
    vector.startLon = (start as LatLonInterface).lon;
    vector.endLat = (end as LatLonInterface).lat;
    vector.endLon = (end as LatLonInterface).lon;

    vector.heading = heading;
    vector.isHeadingTrue = isHeadingTrue;

    return vector;
  }

  /**
   * Checks whether a circle vector describes a great-circle path.
   * @param vector A flight path circle vector.
   * @returns Whether the vector describes a great-circle path.
   */
  public static isVectorGreatCircle(vector: Readonly<FlightPathVector>): boolean {
    return vector.radius === Math.PI / 2;
  }

  /**
   * Sets the parameters of a GeoCircle from a flight path circle vector.
   * @param vector A flight path circle vector.
   * @param out The GeoCircle to set.
   * @returns The GeoCircle, after its parameters have been set.
   */
  public static setGeoCircleFromVector(vector: Readonly<FlightPathVector>, out: GeoCircle): GeoCircle {
    return out.set(Vec3Math.set(vector.centerX, vector.centerY, vector.centerZ, FlightPathUtils.vec3Cache[0]), vector.radius);
  }

  /**
   * Gets the direction of a turn described by a flight path circle vector.
   * @param vector The flight path circle vector describing the turn.
   * @returns The direction of the turn described by the flight path circle vector.
   */
  public static getVectorTurnDirection(vector: Readonly<FlightPathVector>): VectorTurnDirection {
    return vector.radius > MathUtils.HALF_PI ? 'right' : 'left';
  }

  /**
   * Gets the radius of a turn described by a flight path circle vector.
   * @param vector The flight path circle vector describing the turn.
   * @returns The radius of the turn described by the flight path circle vector, in great-arc radians.
   */
  public static getVectorTurnRadius(vector: Readonly<FlightPathVector>): number {
    return Math.min(vector.radius, Math.PI - vector.radius);
  }

  /**
   * Gets the initial true course bearing of a flight path vector.
   * @param vector A flight path vector.
   * @returns The initial true course bearing of the vector, or undefined if one could not be calculated.
   */
  public static getVectorInitialCourse(vector: Readonly<FlightPathVector>): number {
    return FlightPathUtils.setGeoCircleFromVector(
      vector,
      FlightPathUtils.geoCircleCache[0]
    ).bearingAt(FlightPathUtils.geoPointCache[0].set(vector.startLat, vector.startLon), Math.PI);
  }

  /**
   * Gets the final true course bearing of a flight path vector.
   * @param vector A flight path vector.
   * @returns The final true course bearing of the vector, or `undefined` if one could not be calculated.
   */
  public static getVectorFinalCourse(vector: Readonly<FlightPathVector>): number {
    return FlightPathUtils.setGeoCircleFromVector(
      vector,
      FlightPathUtils.geoCircleCache[0]
    ).bearingAt(FlightPathUtils.geoPointCache[0].set(vector.endLat, vector.endLon), Math.PI);
  }

  /**
   * Gets the desired turn direction defined by a flight plan leg.
   * @param leg A flight plan leg.
   * @returns The desired turn direction defined by the specified flight plan leg, or `undefined` if the leg does not
   * define a desired turn direction.
   */
  public static getLegDesiredTurnDirection(leg: FlightPlanLeg): VectorTurnDirection | undefined {
    return leg.turnDirection === LegTurnDirection.Left ? 'left' : leg.turnDirection === LegTurnDirection.Right ? 'right' : undefined;
  }

  /**
   * Gets the final position of a calculated leg.
   * @param legCalc A set of leg calculations.
   * @param out The GeoPoint object to which to write the result.
   * @returns The final position of the leg, or `undefined` if one could not be obtained.
   */
  public static getLegFinalPosition(legCalc: LegCalculations, out: GeoPoint): GeoPoint | undefined {
    if (legCalc.endLat !== undefined && legCalc.endLon !== undefined) {
      return out.set(legCalc.endLat, legCalc.endLon);
    }

    return undefined;
  }

  /**
   * Gets the final true course of a calculated leg.
   * @param legCalc A set of leg calculations.
   * @returns The final true course of the leg, or `undefined` if one could not be obtained.
   */
  public static getLegFinalCourse(legCalc: LegCalculations): number | undefined {
    if (legCalc.flightPath.length > 0) {
      const vector = legCalc.flightPath[legCalc.flightPath.length - 1];
      return this.getVectorFinalCourse(vector);
    }

    return undefined;
  }

  /**
   * Gets the circle describing the path of a turn.
   * @param center The center of the turn.
   * @param radius The radius of the turn, in great-arc radians.
   * @param turnDirection The direction of the turn.
   * @param out A GeoCircle object to which to write the result.
   * @returns The circle describing the path of the turn.
   */
  public static getTurnCircle(center: ReadonlyFloat64Array | LatLonInterface, radius: number, turnDirection: VectorTurnDirection, out: GeoCircle): GeoCircle {
    out.set(center, radius);
    if (turnDirection === 'right') {
      out.reverse();
    }
    return out;
  }

  /**
   * Reverses the direction of a turn circle while keeping the turn center and turn radius constant.
   * @param circle The turn circle to reverse.
   * @param out A GeoCircle object to which to write the result.
   * @returns A turn circle which has the same turn center and turn radius, but the opposite direction as `circle`.
   */
  public static reverseTurnCircle(circle: GeoCircle, out: GeoCircle): GeoCircle {
    return out.set(Vec3Math.multScalar(circle.center, -1, FlightPathUtils.vec3Cache[0]), Math.PI - circle.radius);
  }

  /**
   * Gets the direction of a turn described by a circle.
   * @param circle The geo circle describing the turn.
   * @returns The direction of the turn described by the circle.
   */
  public static getTurnDirectionFromCircle(circle: GeoCircle): VectorTurnDirection {
    return circle.radius > MathUtils.HALF_PI ? 'right' : 'left';
  }

  /**
   * Gets the radius of a turn described by a circle.
   * @param circle The geo circle describing the turn.
   * @returns The radius of the turn described by the circle, in great-arc radians.
   */
  public static getTurnRadiusFromCircle(circle: GeoCircle): number {
    return Math.min(circle.radius, Math.PI - circle.radius);
  }

  /**
   * Gets the center of a turn described by a circle.
   * @param circle The geo circle describing the turn.
   * @param out A GeoPoint or 3D vector object to which to write the result.
   * @returns The center of a turn described by the circle.
   */
  public static getTurnCenterFromCircle<T extends GeoPoint | Float64Array>(circle: GeoCircle, out: T): T {
    return (
      circle.radius > MathUtils.HALF_PI
        ? out instanceof Float64Array
          ? Vec3Math.multScalar(circle.center, -1, out)
          : out.setFromCartesian(-circle.center[0], -circle.center[1], -circle.center[2])
        : out instanceof Float64Array
          ? Vec3Math.copy(circle.center, out)
          : out.setFromCartesian(circle.center)
    ) as T;
  }

  /**
   * Gets the direction of a turn from an initial course to a final course that sweeps through the least angular
   * distance.
   * @param initialCourse The initial course, in degrees.
   * @param finalCourse The final course, in degrees.
   * @returns The direction of the turn from the specified initial course to final course that sweeps through the
   * least angular distance, or `undefined` if the two courses are exactly equal or exactly 180 degrees apart.
   */
  public static getShortestTurnDirection(initialCourse: number, finalCourse: number): VectorTurnDirection | undefined {
    const diff = MathUtils.angularDistanceDeg(initialCourse, finalCourse, 1);
    if (diff === 0 || diff === 180) {
      return undefined;
    } else {
      return diff > 180 ? 'left' : 'right';
    }
  }

  /**
   * Gets the angular distance, in radians, swept when turning from an initial path to a final path at a given point.
   * @param initialPath The initial path.
   * @param finalPath The final path.
   * @param point The point at which to turn from the initial path to the final path. Must lie on both paths.
   * @param turnDirection The direction in which to turn from the initial path to the final path, or `null` to choose
   * the turn direction that results in the smallest angular distance.
   * @param tolerance The error tolerance, in great-arc radians, to use when checking whether `point` lies on both
   * `initialPath` and `finalPath`. Defaults to {@link GeoMath.ANGULAR_TOLERANCE}.
   * @returns The angular distance, in radians, swept when turning from the specified initial path to the final path at
   * the specified point, or `NaN` if an angular distance could not be calculated.
   * @throws Error if `point` does not lie on both `initialPath` and `finalPath`.
   */
  public static pathAngleDistance(
    initialPath: GeoCircle,
    finalPath: GeoCircle,
    point: ReadonlyFloat64Array | LatLonInterface,
    turnDirection: VectorTurnDirection | null,
    tolerance = GeoMath.ANGULAR_TOLERANCE
  ): number {
    if (!(point instanceof Float64Array)) {
      point = GeoPoint.sphericalToCartesian(point as LatLonInterface, FlightPathUtils.vec3Cache[0]);
    }

    if (!initialPath.includes(point, tolerance) || !finalPath.includes(point, tolerance)) {
      throw Error('FlightPathUtils::pathAngleDistance(): the specified point does not lie on both the initial and final paths');
    }

    const initialPathNormal = initialPath.isGreatCircle()
      ? initialPath.center
      : GeoCircle.getGreatCircleNormal(point, initialPath, FlightPathUtils.vec3Cache[1]);
    if (!Vec3Math.isFinite(initialPathNormal)) {
      return NaN;
    }

    const finalPathNormal = finalPath.isGreatCircle()
      ? finalPath.center
      : GeoCircle.getGreatCircleNormal(point, finalPath, FlightPathUtils.vec3Cache[2]);
    if (!Vec3Math.isFinite(finalPathNormal)) {
      return NaN;
    }

    const angleDiff = Vec3Math.unitAngle(initialPathNormal, finalPathNormal);

    const initialPathRadialNormal = Vec3Math.normalize(
      Vec3Math.cross(initialPathNormal, point, FlightPathUtils.vec3Cache[3]),
      FlightPathUtils.vec3Cache[1]
    );

    if (!Vec3Math.isFinite(initialPathRadialNormal)) {
      return NaN;
    }

    if (turnDirection === null) {
      return angleDiff;
    }

    const angleSign = Math.sign(Vec3Math.dot(initialPathRadialNormal, finalPathNormal));

    if (turnDirection === 'right') {
      return MathUtils.normalizeAngle(angleDiff * angleSign);
    } else {
      return MathUtils.normalizeAngle(angleDiff * angleSign * -1);
    }
  }

  /**
   * Gets the great circle tangent to a given path at a given tangent point. The tangent circle will contain the
   * tangent point and have the same direction as the path at the tangent point.
   * @param point The tangent point. If the point does not lie on the path, it will be projected onto the path.
   * @param path The geo circle describing the path.
   * @param out A GeoCircle object to which to write the result.
   * @returns The great circle tangent to the specified path at the specified point.
   */
  public static getGreatCircleTangentToPath(
    point: ReadonlyFloat64Array | LatLonInterface,
    path: GeoCircle,
    out: GeoCircle
  ): GeoCircle {
    return out.setAsGreatCircle(point, path);
  }

  /**
   * Gets the great circle tangent to a given flight path vector at a given tangent point. The tangent circle will
   * contain the tangent point and have the same direction as the vector at the tangent point.
   * @param point The tangent point. If the point does not lie on the vector, it will be projected onto the vector.
   * @param vector The flight path vector.
   * @param out A GeoCircle object to which to write the result.
   * @returns The great circle tangent to the specified flight path vector at the specified point.
   */
  public static getGreatCircleTangentToVector(
    point: ReadonlyFloat64Array | LatLonInterface,
    vector: FlightPathVector,
    out: GeoCircle
  ): GeoCircle {
    const vectorCircle = FlightPathUtils.setGeoCircleFromVector(vector, FlightPathUtils.geoCircleCache[0]);
    return out.setAsGreatCircle(point, vectorCircle);
  }

  /**
   * Calculates and returns a circle describing a turn starting from a path at a specified point.
   * @param start The starting point of the turn.
   * @param path The circle describing the path from which the turn starts.
   * @param turnRadius The radius of the turn, in great-arc radians.
   * @param turnDirection The direction of the turn.
   * @param out A GeoCircle object to which to write the result.
   * @returns The circle describing the path of the specified turn.
   */
  public static getTurnCircleStartingFromPath(
    start: ReadonlyFloat64Array | LatLonInterface,
    path: GeoCircle,
    turnRadius: number,
    turnDirection: VectorTurnDirection,
    out: GeoCircle
  ): GeoCircle {
    if (!(start instanceof Float64Array)) {
      start = GeoPoint.sphericalToCartesian(start as LatLonInterface, FlightPathUtils.vec3Cache[0]);
    }

    const radius = turnDirection === 'left'
      ? turnRadius
      : Math.PI - turnRadius;

    const turnStartToCenterNormal = Vec3Math.cross(start, path.center, FlightPathUtils.vec3Cache[1]);
    const turnStartToCenterPath = FlightPathUtils.geoCircleCache[0].set(turnStartToCenterNormal, MathUtils.HALF_PI);
    const turnCenter = turnStartToCenterPath.offsetDistanceAlong(start, radius, FlightPathUtils.vec3Cache[1], Math.PI);

    return out.set(turnCenter, radius);
  }

  /**
   * Gets the signed distance along an arc from a defined start point to a query point. The start, query, and end
   * points will be projected onto the arc's parent circle if they do not already lie on it. A negative distance
   * indicates that the query point lies somewhere before the start of the arc but after the point on the arc's parent
   * circle that is diametrically opposed to the midpoint of the arc.
   * @param circle The arc's parent circle.
   * @param start The start point of the arc.
   * @param end The end point of the arc.
   * @param pos The query point.
   * @param tolerance The error tolerance, in great-arc radians, when checking if `start` and `query` are equal.
   * Defaults to `GeoCircle.ANGULAR_TOLERANCE` if not specified.
   * @returns The signed distance along the arc from the start point to the query point, in great-arc radians.
   */
  public static getAlongArcSignedDistance(
    circle: GeoCircle,
    start: ReadonlyFloat64Array | LatLonInterface,
    end: ReadonlyFloat64Array | LatLonInterface,
    pos: ReadonlyFloat64Array | LatLonInterface,
    tolerance = GeoCircle.ANGULAR_TOLERANCE
  ): number {
    const posAngularDistance = circle.angleAlong(start, pos, Math.PI);

    if (Math.min(posAngularDistance, MathUtils.TWO_PI - posAngularDistance) <= tolerance) {
      return 0;
    }

    const endAngularDistance = circle.angleAlong(start, end, Math.PI);

    return circle.arcLength((posAngularDistance - (endAngularDistance / 2) + Math.PI) % MathUtils.TWO_PI - Math.PI + endAngularDistance / 2);
  }

  /**
   * Gets the normalized distance along an arc from a defined start point to a query point. The start, query, and end
   * points will be projected onto the arc's parent circle if they do not already lie on it. The distance is normalized
   * such that 1 equals the arc length from the start point to the end point. A negative distance indicates that the
   * query point lies somewhere before the start of the arc but after the point on the arc's parent circle that is
   * diametrically opposed to the midpoint of the arc.
   * @param circle The arc's parent circle.
   * @param start The start point of the arc.
   * @param end The end point of the arc.
   * @param pos The query point.
   * @param tolerance The error tolerance, in great-arc radians, when checking if `start` and `query` are equal.
   * Defaults to `GeoCircle.ANGULAR_TOLERANCE` if not specified.
   * @returns The normalized distance along the arc from the start point to the query point.
   */
  public static getAlongArcNormalizedDistance(
    circle: GeoCircle,
    start: ReadonlyFloat64Array | LatLonInterface,
    end: ReadonlyFloat64Array | LatLonInterface,
    pos: ReadonlyFloat64Array | LatLonInterface,
    tolerance = GeoCircle.ANGULAR_TOLERANCE
  ): number {
    const posAngularDistance = circle.angleAlong(start, pos, Math.PI);

    if (Math.min(posAngularDistance, MathUtils.TWO_PI - posAngularDistance) <= tolerance) {
      return 0;
    }

    const endAngularDistance = circle.angleAlong(start, end, Math.PI);

    if (Math.min(endAngularDistance, MathUtils.TWO_PI - endAngularDistance) <= tolerance) {
      return posAngularDistance >= Math.PI ? -Infinity : Infinity;
    }

    return ((posAngularDistance - (endAngularDistance / 2) + Math.PI) % MathUtils.TWO_PI - Math.PI) / endAngularDistance + 0.5;
  }

  /**
   * Checks if a point lies between the start and end points of an arc along a geo circle. The start, end, and query
   * points will be projected onto the arc's parent circle if they do not already lie on it.
   * @param circle The arc's parent circle.
   * @param start The start point of the arc.
   * @param end The end point of the arc.
   * @param pos The query point.
   * @param inclusive Whether the arc includes the start and end points. Defaults to `true`.
   * @param tolerance The error tolerance, in great-arc radians. Defaults to {@link GeoCircle.ANGULAR_TOLERANCE}.
   * @returns Whether the query point lies between the start and end points of the specified arc.
   */
  public static isPointAlongArc(
    circle: GeoCircle,
    start: ReadonlyFloat64Array | LatLonInterface,
    end: ReadonlyFloat64Array | LatLonInterface,
    pos: ReadonlyFloat64Array | LatLonInterface,
    inclusive?: boolean,
    tolerance?: number,
  ): boolean;
  /**
   * Checks if a point lies between the start and end points (inclusive) of an arc along a geo circle. The start and
   * query points will be projected onto the arc's parent circle if they do not already lie on it.
   * @param circle The arc's parent circle.
   * @param start The start point of the arc.
   * @param angularWidth The angular width of the arc, in radians.
   * @param pos The query point.
   * @param inclusive Whether the arc includes the start and end points. Defaults to `true`.
   * @param tolerance The error tolerance, in great-arc radians. Defaults to {@link GeoMath.ANGULAR_TOLERANCE}.
   * @returns Whether the query point lies between the start and end points (inclusive) of the specified arc.
   */
  public static isPointAlongArc(
    circle: GeoCircle,
    start: ReadonlyFloat64Array | LatLonInterface,
    angularWidth: number,
    pos: ReadonlyFloat64Array | LatLonInterface,
    inclusive?: boolean,
    tolerance?: number,
  ): boolean;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public static isPointAlongArc(
    circle: GeoCircle,
    start: ReadonlyFloat64Array | LatLonInterface,
    end: ReadonlyFloat64Array | LatLonInterface | number,
    pos: ReadonlyFloat64Array | LatLonInterface,
    inclusive = true,
    tolerance = GeoMath.ANGULAR_TOLERANCE,
  ): boolean {
    const angularTolerance = circle.angularWidth(tolerance);

    if (typeof end !== 'number') {
      end = circle.angleAlong(start, end, Math.PI, angularTolerance);
    }

    if (inclusive && Math.abs(end) >= MathUtils.TWO_PI - angularTolerance) {
      return true;
    }

    const angle = circle.angleAlong(start, pos, Math.PI);
    if (inclusive && angle >= MathUtils.TWO_PI - angularTolerance) {
      return true;
    }

    const signedDiff = (angle - end) * (end >= 0 ? 1 : -1);

    return inclusive ? signedDiff <= angularTolerance : signedDiff < -angularTolerance;
  }

  /**
   * Projects an instantaneous velocity at a point along a bearing onto a geo circle.
   *
   * The projected velocity is defined as the limit as dt goes to 0 of:
   *
   * `distance( project(p(0)), project(p(dt)) ) / dt`
   *
   * * `p(0)` is the position at which the velocity to project is measured.
   * * `p(x)` returns `p(0)` offset by the velocity to project after `x` time has elapsed.
   * * `project(x)` projects `x` onto the geo circle onto which the velocity is to be projected.
   * * `distance(x, y)` returns the distance from `x` to `y` along the geo circle onto which the velocity is to be
   * projected, in the range `(-c / 2, c / 2]`, where `c` is the circumference of the geo circle.
   * @param speed The magnitude of the velocity to project.
   * @param position The position at which the velocity is measured.
   * @param bearing The true bearing, in degrees, defining the direction of the velocity to project.
   * @param projectTo The geo circle to which to project the velocity.
   * @returns The signed magnitude of the velocity projected onto the specified geo circle. A positive sign indicates
   * the projected velocity follows the same direction as the circle, while a negative sign indicates the projected
   * velocity follows the opposite direction as the circle.
   */
  public static projectVelocityToCircle(
    speed: number,
    position: LatLonInterface | ReadonlyFloat64Array,
    bearing: number,
    projectTo: GeoCircle
  ): number;
  /**
   * Projects an instantaneous velocity at a point along a geo circle onto another geo circle.
   *
   * The projected velocity is defined as the limit as dt goes to 0 of:
   *
   * `distance( project(p(0)), project(p(dt)) ) / dt`
   *
   * * `p(0)` is the position at which the velocity to project is measured.
   * * `p(x)` returns `p(0)` offset by the velocity to project after `x` time has elapsed.
   * * `project(x)` projects `x` onto the geo circle onto which the velocity is to be projected.
   * * `distance(x, y)` returns the distance from `x` to `y` along the geo circle onto which the velocity is to be
   * projected, in the range `(-c / 2, c / 2]`, where `c` is the circumference of the geo circle.
   * @param speed The magnitude of the velocity to project.
   * @param position The position at which the velocity is measured.
   * @param path The geo circle defining the path parallel to the velocity to project.
   * @param projectTo The geo circle to which to project the velocity.
   * @returns The signed magnitude of the velocity projected onto the specified geo circle. A positive sign indicates
   * the projected velocity follows the same direction as the circle, while a negative sign indicates the projected
   * velocity follows the opposite direction as the circle.
   */
  public static projectVelocityToCircle(
    speed: number,
    position: LatLonInterface | ReadonlyFloat64Array,
    path: GeoCircle,
    projectTo: GeoCircle
  ): number;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public static projectVelocityToCircle(
    speed: number,
    position: LatLonInterface | ReadonlyFloat64Array,
    direction: number | GeoCircle,
    projectTo: GeoCircle
  ): number {
    if (projectTo.radius <= GeoCircle.ANGULAR_TOLERANCE) {
      return NaN;
    }

    if (speed === 0) {
      return 0;
    }

    if (!(position instanceof Float64Array)) {
      position = GeoPoint.sphericalToCartesian(position as LatLonInterface, FlightPathUtils.vec3Cache[0]);
    }

    const velocityPath = typeof direction === 'number'
      ? FlightPathUtils.geoCircleCache[0].setAsGreatCircle(position, direction)
      : direction.isGreatCircle()
        ? direction
        : FlightPathUtils.geoCircleCache[0].setAsGreatCircle(
          position,
          FlightPathUtils.geoCircleCache[0].setAsGreatCircle(direction.center, position).center
        );

    const sign = velocityPath.encircles(projectTo.center) ? 1 : -1;
    const velocityPathNormal = Vec3Math.copy(velocityPath.center, FlightPathUtils.vec3Cache[1]);

    const projectedRadialNormal = FlightPathUtils.geoCircleCache[0].setAsGreatCircle(projectTo.center, position).center;
    const dot = Vec3Math.dot(projectedRadialNormal, velocityPathNormal);

    const sinTheta = Math.sqrt(1 - MathUtils.clamp(dot * dot, 0, 1));

    return speed * sinTheta * sign;
  }

  /**
   * Resolves the ingress to egress vectors for a set of flight plan leg calculations. This operation will populate the
   * `ingressToEgress` array with a sequence of vectors connecting the ingress transition to the egress transition
   * while following the flight path defined by the vectors in the `flightPath` array.
   * @param legCalc A set of flight plan leg calculations.
   * @returns The flight plan leg calculations, after the ingress to egress vectors have been resolved.
   */
  public static resolveIngressToEgress<T extends LegCalculations>(legCalc: T): T {
    const vectors = legCalc.ingressToEgress;
    let vectorIndex = 0;

    let flightPathVectorIndex = Math.max(0, legCalc.ingressJoinIndex);

    const lastIngressVector = legCalc.ingress[legCalc.ingress.length - 1];
    const ingressJoinVector = legCalc.flightPath[legCalc.ingressJoinIndex];
    const firstEgressVector = legCalc.egress[0];
    const egressJoinVector = legCalc.flightPath[legCalc.egressJoinIndex];

    if (lastIngressVector && ingressJoinVector) {
      // There is an ingress transition and a valid base flight path vector at which the ingress joins the base flight path.

      // Check if the last ingress vector joins the base flight path before the end of the joined base flight path vector.

      const ingressEnd = FlightPathUtils.geoPointCache[0].set(lastIngressVector.endLat, lastIngressVector.endLon);
      const ingressJoinVectorStart = FlightPathUtils.geoPointCache[1].set(ingressJoinVector.startLat, ingressJoinVector.startLon);
      const ingressJoinVectorEnd = legCalc.ingressJoinIndex === legCalc.egressJoinIndex && firstEgressVector
        ? FlightPathUtils.geoPointCache[2].set(firstEgressVector.startLat, firstEgressVector.startLon)
        : FlightPathUtils.geoPointCache[2].set(ingressJoinVector.endLat, ingressJoinVector.endLon);

      const ingressJoinVectorCircle = FlightPathUtils.setGeoCircleFromVector(ingressJoinVector, FlightPathUtils.geoCircleCache[0]);

      const ingressEndAlongVectorDistance = FlightPathUtils.getAlongArcNormalizedDistance(
        ingressJoinVectorCircle, ingressJoinVectorStart, ingressJoinVectorEnd, ingressEnd
      );
      const normalizedTolerance = GeoMath.ANGULAR_TOLERANCE / UnitType.METER.convertTo(ingressJoinVector.distance, UnitType.GA_RADIAN);

      if (ingressEndAlongVectorDistance < 1 - normalizedTolerance) {
        // Ingress joins the base flight path before the end of the joined vector. Therefore we must insert all or
        // part of the joined vector into the ingress-to-egress array.

        if (ingressEndAlongVectorDistance > normalizedTolerance) {
          // Ingress joins the base flight path after the start of the joined vector. Therefore we must create a new
          // vector that extends from where the ingress joins up to the end of the joined vector and insert the new
          // vector into the ingress-to-egress array.

          ingressJoinVectorCircle.closest(ingressEnd, ingressEnd);

          FlightPathUtils.setVectorFromCircle(
            vectors[vectorIndex++] ??= FlightPathUtils.createEmptyVector(),
            ingressJoinVectorCircle, ingressEnd, ingressJoinVectorEnd,
            ingressJoinVector.flags,
            ingressJoinVector.heading, ingressJoinVector.isHeadingTrue
          );
        } else {
          // Ingress joins the base flight path at or before the start of the joined vector. Therefore we can copy the
          // entire joined vector into the ingress-to-egress array.

          Object.assign(vectors[vectorIndex++] ??= FlightPathUtils.createEmptyVector(), ingressJoinVector);
        }
      }

      flightPathVectorIndex++;
    }

    // Now we must copy all base flight path vectors between the ingress-joined and egress-joined vectors (exclusive)
    // into the ingress-to-egress array.

    const end = Math.min(legCalc.flightPath.length, legCalc.egressJoinIndex < 0 ? Infinity : legCalc.egressJoinIndex);
    for (let i = flightPathVectorIndex; i < end; i++) {
      Object.assign(vectors[vectorIndex++] ??= FlightPathUtils.createEmptyVector(), legCalc.flightPath[i]);
      flightPathVectorIndex++;
    }

    if (flightPathVectorIndex === legCalc.egressJoinIndex && egressJoinVector) {
      if (firstEgressVector) {
        // There is an egress transition and a valid base flight path vector at which the egress joins the base flight path.

        // Check if the first egress vector joins the base flight path after the start of the joined base flight path vector.

        const egressStart = FlightPathUtils.geoPointCache[0].set(firstEgressVector.startLat, firstEgressVector.startLon);
        const egressJoinVectorStart = FlightPathUtils.geoPointCache[1].set(egressJoinVector.startLat, egressJoinVector.startLon);
        const egressJoinVectorEnd = FlightPathUtils.geoPointCache[2].set(egressJoinVector.endLat, egressJoinVector.endLon);

        const egressJoinVectorCircle = FlightPathUtils.setGeoCircleFromVector(egressJoinVector, FlightPathUtils.geoCircleCache[0]);

        const egressStartAlongVectorDistance = FlightPathUtils.getAlongArcNormalizedDistance(
          egressJoinVectorCircle, egressJoinVectorStart, egressJoinVectorEnd, egressStart
        );
        const normalizedTolerance = GeoMath.ANGULAR_TOLERANCE / UnitType.METER.convertTo(egressJoinVector.distance, UnitType.GA_RADIAN);

        if (egressStartAlongVectorDistance > normalizedTolerance) {
          // Egress joins the base flight path after the start of the joined vector. Therefore we must insert all or
          // part of the joined vector into the ingress-to-egress array.

          if (egressStartAlongVectorDistance < 1 - normalizedTolerance) {
            // Egress joins the base flight path before the end of the joined vector. Therefore we must create a new
            // vector that extends from the start of the joined vector up to where the egress joins and insert the new
            // vector into the ingress-to-egress array.

            egressJoinVectorCircle.closest(egressStart, egressStart);

            FlightPathUtils.setVectorFromCircle(
              vectors[vectorIndex++] ??= FlightPathUtils.createEmptyVector(),
              egressJoinVectorCircle, egressJoinVectorStart, egressStart,
              egressJoinVector.flags,
              egressJoinVector.heading, egressJoinVector.isHeadingTrue
            );
          } else {
            // Egress joins the base flight path at or after the end of the joined vector. Therefore we can copy the
            // entire joined vector into the ingress-to-egress array.

            Object.assign(vectors[vectorIndex++] ??= FlightPathUtils.createEmptyVector(), egressJoinVector);
          }
        }
      } else {
        // There is no egress, but there is a base flight path vector flagged as the vector with which the egress
        // joins. This is technically an invalid state, but we can easily just treat this as a regular "no-egress"
        // case and copy the entire egress join vector into the resolved vectors array.

        Object.assign(vectors[vectorIndex++] ??= FlightPathUtils.createEmptyVector(), egressJoinVector);
      }
    }

    vectors.length = vectorIndex;

    return legCalc;
  }
}