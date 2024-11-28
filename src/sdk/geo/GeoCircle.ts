import { MathUtils } from '../math';
import { ReadonlyFloat64Array, Vec3Math } from '../math/VecMath';
import { ArrayUtils } from '../utils/datastructures/ArrayUtils';
import { LatLonInterface } from './GeoInterfaces';
import { GeoMath } from './GeoMath';
import { GeoPoint } from './GeoPoint';

/**
 * A circle on Earth's surface, defined as the set of points on the Earth's surface equidistant (as measured
 * geodetically) from a central point.
 */
export class GeoCircle {
  /** The default angular tolerance used by `GeoCircle`, in radians. */
  public static readonly ANGULAR_TOLERANCE = GeoMath.ANGULAR_TOLERANCE;

  private static readonly NORTH_POLE = Vec3Math.create(0, 0, 1);

  private static readonly geoPointCache = [new GeoPoint(0, 0)];
  private static readonly vec3Cache = ArrayUtils.create(6, () => Vec3Math.create());
  private static readonly intersectionCache = [Vec3Math.create(), Vec3Math.create()];

  private _center = Vec3Math.create();
  private _radius = 0;
  private _sinRadius = 0;

  /**
   * Creates a new instance of GeoCircle.
   * @param center The center of the new circle, represented as a position vector in the standard geographic
   * cartesian reference system.
   * @param radius The radius of the new circle in great-arc radians.
   */
  public constructor(center: ReadonlyFloat64Array, radius: number) {
    this.set(center, radius);
  }

  // eslint-disable-next-line jsdoc/require-returns
  /**
   * The center of this circle.
   */
  public get center(): ReadonlyFloat64Array {
    return this._center;
  }

  // eslint-disable-next-line jsdoc/require-returns
  /**
   * The radius of this circle, in great-arc radians.
   */
  public get radius(): number {
    return this._radius;
  }

  /**
   * Checks whether this circle is a valid. A circle is valid if and only if it has a finite radius and its center is a
   * position vector pointing to a point on the earth's surface.
   * @returns Whether this circle is valid.
   */
  public isValid(): boolean {
    return Vec3Math.isFinite(this._center) && isFinite(this._radius);
  }

  /**
   * Checks whether this circle is a great circle, or equivalently, whether its radius is equal to pi / 2 great-arc
   * radians.
   * @returns Whether this circle is a great circle.
   */
  public isGreatCircle(): boolean {
    return this._radius === Math.PI / 2;
  }

  /**
   * Calculates the length of an arc along this circle subtended by a central angle.
   * @param angle A central angle, in radians.
   * @returns The length of the arc subtended by the angle, in great-arc radians.
   */
  public arcLength(angle: number): number {
    return this._sinRadius * angle;
  }

  /**
   * Calculates the central angle which subtends an arc along this circle of given length.
   * @param length An arc length, in great-arc radians.
   * @returns The central angle which subtends an arc along this circle of the given length, in radians.
   */
  public angularWidth(length: number): number {
    return length / this._sinRadius;
  }

  /**
   * Sets the center and radius of this circle.
   * @param center The new center.
   * @param radius The new radius in great-arc radians.
   * @returns This circle, after it has been changed.
   */
  public set(center: ReadonlyFloat64Array | LatLonInterface, radius: number): this {
    if (center instanceof Float64Array) {
      if (Vec3Math.abs(center) === 0) {
        // If center has no direction, then set the vector to NaN.
        Vec3Math.set(NaN, NaN, NaN, this._center);
      } else {
        Vec3Math.normalize(center, this._center);
      }
    } else {
      GeoPoint.sphericalToCartesian(center as LatLonInterface, this._center);
    }

    return this._setRadius(radius);
  }

  /**
   * Sets the center and radius of this circle. This method does not validate or normalize the provided center vector.
   * @param center The new center.
   * @param radius The new radius in great-arc radians.
   * @returns This circle, after it has been changed.
   */
  private _set(center: ReadonlyFloat64Array, radius: number): this {
    Vec3Math.copy(center, this._center);
    this._radius = Math.abs(radius) % Math.PI;
    this._sinRadius = Math.sin(this._radius);
    return this;
  }

  /**
   * Sets the radius of this circle.
   * @param radius The new radius in great-arc radians.
   * @returns This circle, after it has been changed.
   */
  private _setRadius(radius: number): this {
    this._radius = Math.abs(radius) % Math.PI;
    this._sinRadius = Math.sin(this._radius);
    return this;
  }

  /**
   * Sets this circle to be a great circle that includes two given points and is parallel to the path from the first
   * point to the second point. If the two points are coincident or antipodal, then this circle will be set to an
   * invalid circle with center coordinates equal to `[NaN, NaN, NaN]`.
   * @param point1 The first point that lies on the great circle.
   * @param point2 The second point that lies on the great circle.
   * @returns This circle, after it has been changed.
   */
  public setAsGreatCircle(point1: ReadonlyFloat64Array | LatLonInterface, point2: ReadonlyFloat64Array | LatLonInterface): this;
  /**
   * Sets this circle to be a great circle that includes a given point and is parallel to an initial bearing from the
   * same point.
   * @param point A point that lies on the great circle.
   * @param bearing The initial bearing from the point, in degrees.
   * @returns This circle, after it has been changed.
   */
  public setAsGreatCircle(point: ReadonlyFloat64Array | LatLonInterface, bearing: number): this;
  /**
   * Sets this circle to be a great circle that is tangent and parallel to another GeoCircle at a given point. If the
   * specified point does not lie exactly on the other GeoCircle, then the projection of the point onto the other
   * GeoCircle will be used instead. If the point cannot be projected onto the GeoCircle, then this circle will be set
   * to an invalid circle with center coordinates equal to `[NaN, NaN, NaN]`.
   * @param point The point at which this circle will be tangent and parallel to the other circle.
   * @param circle The other GeoCircle.
   * @returns This circle, after it has been changed.
   */
  public setAsGreatCircle(point: ReadonlyFloat64Array | LatLonInterface, circle: GeoCircle): this;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public setAsGreatCircle(
    arg1: ReadonlyFloat64Array | LatLonInterface,
    arg2: ReadonlyFloat64Array | LatLonInterface | number | GeoCircle
  ): this {
    GeoCircle._getGreatCircleNormal(arg1, arg2, this._center);
    return this._setRadius(Math.PI / 2);
  }

  /**
   * Reverses the direction of this circle. This sets the center of the circle to its antipode and the radius to its
   * complement with `Math.PI`.
   * @returns This circle, after it has been reversed.
   */
  public reverse(): this {
    Vec3Math.multScalar(this._center, -1, this._center);
    this._radius = Math.PI - this._radius;
    return this;
  }

  /**
   * Gets the distance from a point to the center of this circle, in great-arc radians.
   * @param point The point to which to measure the distance.
   * @returns the distance from the point to the center of this circle.
   */
  private distanceToCenter(point: ReadonlyFloat64Array | LatLonInterface): number {
    if (point instanceof Float64Array) {
      point = Vec3Math.normalize(point, GeoCircle.vec3Cache[0]);
    } else {
      point = GeoPoint.sphericalToCartesian(point as LatLonInterface, GeoCircle.vec3Cache[0]);
    }

    return Vec3Math.unitAngle(point, this._center);
  }

  /**
   * Finds the closest point on this circle to a specified point. In other words, projects the specified point onto
   * this circle. If the specified point is equidistant from all points on this circle (i.e. it is coincident with or
   * antipodal to this circle's center), then `NaN` will be written to all components of the result.
   * @param point A point, represented as either a position vector or lat/long coordinates.
   * @param out A Float64Array object to which to write the result.
   * @returns The closest point on this circle to the specified point.
   */
  public closest(point: ReadonlyFloat64Array | LatLonInterface, out: Float64Array): Float64Array;
  /**
   * Finds the closest point on this circle to a specified point. In other words, projects the specified point onto
   * this circle. If the specified point is equidistant from all points on this circle (i.e. it is coincident with or
   * antipodal to this circle's center), NaN will be written to all components of the result.
   * @param point A point, represented as either a position vector or lat/long coordinates.
   * @param out A GeoPoint object to which to write the result.
   * @returns The closest point on this circle to the specified point.
   */
  public closest(point: ReadonlyFloat64Array | LatLonInterface, out: GeoPoint): GeoPoint;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public closest(point: ReadonlyFloat64Array | LatLonInterface, out: Float64Array | GeoPoint): Float64Array | GeoPoint {
    if (!(point instanceof Float64Array)) {
      point = GeoPoint.sphericalToCartesian(point as LatLonInterface, GeoCircle.vec3Cache[0]);
    }

    const offset = Vec3Math.multScalar(this._center, Math.cos(this._radius), GeoCircle.vec3Cache[1]);
    const dot = Vec3Math.dot(Vec3Math.sub(point, offset, GeoCircle.vec3Cache[2]), this._center);
    const planeProjected = Vec3Math.sub(point, Vec3Math.multScalar(this._center, dot, GeoCircle.vec3Cache[2]), GeoCircle.vec3Cache[2]);
    if (Vec3Math.dot(planeProjected, planeProjected) === 0 || Math.abs(Vec3Math.dot(planeProjected, this._center)) === 1) {
      // the point is equidistant from all points on this circle
      return out instanceof GeoPoint ? out.set(NaN, NaN) : Vec3Math.set(NaN, NaN, NaN, out);
    }

    const displacement = Vec3Math.multScalar(
      Vec3Math.normalize(
        Vec3Math.sub(planeProjected, offset, GeoCircle.vec3Cache[2]),
        GeoCircle.vec3Cache[2]
      ),
      this._sinRadius,
      GeoCircle.vec3Cache[2]
    );
    const closest = Vec3Math.add(offset, displacement, GeoCircle.vec3Cache[2]);

    return out instanceof Float64Array ? Vec3Math.normalize(closest, out) : out.setFromCartesian(closest);
  }

  /**
   * Calculates and returns the great-circle distance from a specified point to the closest point that lies on this
   * circle. In other words, calculates the shortest distance from a point to this circle. The distance is signed, with
   * positive distances representing deviation away from the center of the circle, and negative distances representing
   * deviation toward the center of the circle.
   * @param point A point, represented as either a position vector or lat/long coordinates.
   * @returns the great circle distance, in great-arc radians, from the point to the closest point on this circle.
   */
  public distance(point: ReadonlyFloat64Array | LatLonInterface): number {
    const distanceToCenter = this.distanceToCenter(point);
    return distanceToCenter - this._radius;
  }

  /**
   * Checks whether a point lies on this circle.
   * @param point A point, represented as either a position vector or lat/long coordinates.
   * @param tolerance The error tolerance, in great-arc radians, of this operation. Defaults to
   * `GeoCircle.ANGULAR_TOLERANCE` if not specified.
   * @returns whether the point lies on this circle.
   */
  public includes(point: ReadonlyFloat64Array | LatLonInterface, tolerance = GeoCircle.ANGULAR_TOLERANCE): boolean {
    const distance = this.distance(point);
    return Math.abs(distance) < tolerance;
  }

  /**
   * Checks whether a point lies within the boundary defined by this circle. This is equivalent to checking whether
   * the distance of the point from the center of this circle is less than or equal to this circle's radius.
   * @param point A point, represented as either a position vector or lat/long coordinates.
   * @param inclusive Whether points that lie on this circle should pass the check. True by default.
   * @param tolerance The error tolerance, in great-arc radians, of this operation. Defaults to
   * `GeoCircle.ANGULAR_TOLERANCE` if not specified.
   * @returns whether the point lies within the boundary defined by this circle.
   */
  public encircles(point: ReadonlyFloat64Array | LatLonInterface, inclusive = true, tolerance = GeoCircle.ANGULAR_TOLERANCE): boolean {
    const distance = this.distance(point);
    return inclusive
      ? distance <= tolerance
      : distance < -tolerance;
  }

  /**
   * Gets the angular distance along an arc between two points that lie on this circle. The arc extends from the first
   * point to the second in a counterclockwise direction when viewed from above the center of the circle.
   * @param start A point on this circle which marks the beginning of an arc.
   * @param end A point on this circle which marks the end of an arc.
   * @param tolerance The error tolerance, in great-arc radians, when checking if `start` and `end` lie on this circle.
   * Defaults to `GeoCircle.ANGULAR_TOLERANCE` if not specified.
   * @param equalityTolerance The angular tolerance for considering the start and end points to be equal, in radians.
   * If the absolute (direction-agnostic) angular distance between the start and end points is less than or equal to
   * this value, then the zero will be returned. Defaults to `0`.
   * @returns the angular width of the arc between the two points, in radians.
   * @throws Error if either point does not lie on this circle.
   */
  public angleAlong(
    start: ReadonlyFloat64Array | LatLonInterface,
    end: ReadonlyFloat64Array | LatLonInterface,
    tolerance = GeoCircle.ANGULAR_TOLERANCE,
    equalityTolerance = 0
  ): number {
    if (!(start instanceof Float64Array)) {
      start = GeoPoint.sphericalToCartesian(start as LatLonInterface, GeoCircle.vec3Cache[1]);
    }
    if (!(end instanceof Float64Array)) {
      end = GeoPoint.sphericalToCartesian(end as LatLonInterface, GeoCircle.vec3Cache[2]);
    }

    if (tolerance < Math.PI && !this.includes(start, tolerance) || !this.includes(end, tolerance)) {
      throw new Error(`GeoCircle: at least one of the two specified arc end points does not lie on this circle (start point distance of ${this.distance(start)}, end point distance of ${this.distance(end)}, vs tolerance of ${tolerance}).`);
    }

    if (this._radius <= GeoCircle.ANGULAR_TOLERANCE) {
      return 0;
    }

    const startRadialNormal = Vec3Math.normalize(Vec3Math.cross(this._center, start, GeoCircle.vec3Cache[3]), GeoCircle.vec3Cache[3]);
    const endRadialNormal = Vec3Math.normalize(Vec3Math.cross(this._center, end, GeoCircle.vec3Cache[4]), GeoCircle.vec3Cache[4]);
    const angularDistance = Math.acos(Utils.Clamp(Vec3Math.dot(startRadialNormal, endRadialNormal), -1, 1));

    const isArcGreaterThanSemi = Vec3Math.dot(startRadialNormal, end) < 0;
    const angle = isArcGreaterThanSemi ? MathUtils.TWO_PI - angularDistance : angularDistance;

    return angle >= MathUtils.TWO_PI - equalityTolerance || angle <= equalityTolerance ? 0 : angle;
  }

  /**
   * Gets the distance along an arc between two points that lie on this circle. The arc extends from the first point
   * to the second in a counterclockwise direction when viewed from above the center of the circle.
   * @param start A point on this circle which marks the beginning of an arc.
   * @param end A point on this circle which marks the end of an arc.
   * @param tolerance The error tolerance, in great-arc radians, when checking if `start` and `end` lie on this circle.
   * Defaults to `GeoCircle.ANGULAR_TOLERANCE` if not specified.
   * @param equalityTolerance The tolerance for considering the start and end points to be equal, in great-arc radians.
   * If the absolute (direction-agnostic) along-arc distance between the start and end points is less than or equal to
   * this value, then the zero will be returned. Defaults to `0`.
   * @returns the length of the arc between the two points, in great-arc radians.
   * @throws Error if either point does not lie on this circle.
   */
  public distanceAlong(
    start: ReadonlyFloat64Array | LatLonInterface,
    end: ReadonlyFloat64Array | LatLonInterface,
    tolerance = GeoCircle.ANGULAR_TOLERANCE,
    equalityTolerance = 0
  ): number {
    return this.arcLength(this.angleAlong(start, end, tolerance, this.angularWidth(equalityTolerance)));
  }

  /**
   * Calculates the true bearing along this circle at a point on the circle.
   * @param point A point on this circle.
   * @param tolerance The error tolerance, in great-arc radians, when checking if `point` lies on this circle. Defaults
   * to `GeoCircle.ANGULAR_TOLERANCE` if not specified.
   * @returns the bearing along this circle at the point.
   * @throws Error if the point does not lie on this circle.
   */
  public bearingAt(point: ReadonlyFloat64Array | LatLonInterface, tolerance = GeoCircle.ANGULAR_TOLERANCE): number {
    if (!(point instanceof Float64Array)) {
      point = GeoPoint.sphericalToCartesian(point as LatLonInterface, GeoCircle.vec3Cache[1]);
    }

    if (tolerance < Math.PI && !this.includes(point, tolerance)) {
      throw new Error(`GeoCircle: the specified point does not lie on this circle (distance of ${Math.abs(this.distance(point))} vs tolerance of ${tolerance}).`);
    }

    if (this._sinRadius <= GeoCircle.ANGULAR_TOLERANCE || 1 - Math.abs(Vec3Math.dot(point, GeoCircle.NORTH_POLE)) <= GeoCircle.ANGULAR_TOLERANCE) {
      // Meaningful bearings cannot be defined along a circle with 0 radius (effectively a point) and at the north and south poles.
      return NaN;
    }

    const radialNormal = Vec3Math.normalize(Vec3Math.cross(this._center, point, GeoCircle.vec3Cache[2]), GeoCircle.vec3Cache[2]);
    const northNormal = Vec3Math.normalize(Vec3Math.cross(point, GeoCircle.NORTH_POLE, GeoCircle.vec3Cache[3]), GeoCircle.vec3Cache[3]);

    return (Vec3Math.unitAngle(radialNormal, northNormal) * (radialNormal[2] >= 0 ? 1 : -1) * Avionics.Utils.RAD2DEG - 90 + 360) % 360;
  }

  /**
   * Offsets a point on this circle by a specified distance. The direction of the offset for positive distances is
   * counterclockwise when viewed from above the center of this circle.
   * @param point The point to offset.
   * @param distance The distance by which to offset, in great-arc radians.
   * @param out A Float64Array object to which to write the result.
   * @param tolerance The error tolerance, in great-arc radians, when checking if `point` lies on this circle. Defaults
   * to `GeoCircle.ANGULAR_TOLERANCE` if not specified.
   * @returns The offset point.
   * @throws Error if the point does not lie on this circle.
   */
  public offsetDistanceAlong(point: ReadonlyFloat64Array | LatLonInterface, distance: number, out: Float64Array, tolerance?: number): Float64Array;
  /**
   * Offsets a point on this circle by a specified distance. The direction of the offset for positive distances is
   * counterclockwise when viewed from above the center of this circle.
   * @param point The point to offset.
   * @param distance The distance by which to offset, in great-arc radians.
   * @param out A GeoPoint object to which to write the result.
   * @param tolerance The error tolerance, in great-arc radians, when checking if `point` lies on this circle. Defaults
   * to `GeoCircle.ANGULAR_TOLERANCE` if not specified.
   * @returns The offset point.
   * @throws Error if the point does not lie on this circle.
   */
  public offsetDistanceAlong(point: ReadonlyFloat64Array | LatLonInterface, distance: number, out: GeoPoint, tolerance?: number): GeoPoint;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public offsetDistanceAlong(
    point: ReadonlyFloat64Array | LatLonInterface,
    distance: number,
    out: Float64Array | GeoPoint,
    tolerance = GeoCircle.ANGULAR_TOLERANCE
  ): Float64Array | GeoPoint {
    const angle = distance / Math.sin(this.radius);
    return this._offsetAngleAlong(point, angle, out, tolerance);
  }

  /**
   * Offsets a point on this circle by a specified angular distance. The direction of the offset for positive distances
   * is counterclockwise when viewed from above the center of this circle.
   * @param point The point to offset.
   * @param angle The angular distance by which to offset, in radians.
   * @param out A Float64Array object to which to write the result.
   * @param tolerance The error tolerance, in great-arc radians, when checking if `point` lies on this circle. Defaults
   * to `GeoCircle.ANGULAR_TOLERANCE` if not specified.
   * @returns The offset point.
   * @throws Error if the point does not lie on this circle.
   */
  public offsetAngleAlong(point: ReadonlyFloat64Array | LatLonInterface, angle: number, out: Float64Array, tolerance?: number): Float64Array;
  /**
   * Offsets a point on this circle by a specified angular distance. The direction of the offset for positive distances
   * is counterclockwise when viewed from above the center of this circle.
   * @param point The point to offset.
   * @param angle The angular distance by which to offset, in radians.
   * @param out A GeoPoint object to which to write the result.
   * @param tolerance The error tolerance, in great-arc radians, when checking if `point` lies on this circle. Defaults
   * to `GeoCircle.ANGULAR_TOLERANCE` if not specified.
   * @returns The offset point.
   * @throws Error if the point does not lie on this circle.
   */
  public offsetAngleAlong(point: ReadonlyFloat64Array | LatLonInterface, angle: number, out: GeoPoint, tolerance?: number): GeoPoint;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public offsetAngleAlong(
    point: ReadonlyFloat64Array | LatLonInterface,
    angle: number,
    out: Float64Array | GeoPoint,
    tolerance = GeoCircle.ANGULAR_TOLERANCE
  ): Float64Array | GeoPoint {
    return this._offsetAngleAlong(point, angle, out, tolerance);
  }

  /**
   * Offsets a point on this circle by a specified angular distance. The direction of the offset for positive distances
   * is counterclockwise when viewed from above the center of this circle.
   * @param point The point to offset.
   * @param angle The angular distance by which to offset, in radians.
   * @param out A Float64Array or GeoPoint object to which to write the result.
   * @param tolerance The error tolerance, in great-arc radians, when checking if `point` lies on this circle. Defaults
   * to `GeoCircle.ANGULAR_TOLERANCE` if not specified.
   * @returns The offset point.
   * @throws Error if the point does not lie on this circle.
   */
  private _offsetAngleAlong(
    point: ReadonlyFloat64Array | LatLonInterface,
    angle: number,
    out: Float64Array | GeoPoint,
    tolerance = GeoCircle.ANGULAR_TOLERANCE
  ): Float64Array | GeoPoint {
    if (!(point instanceof Float64Array)) {
      point = GeoPoint.sphericalToCartesian(point as LatLonInterface, GeoCircle.vec3Cache[3]);
    }

    if (tolerance < Math.PI && !this.includes(point, tolerance)) {
      throw new Error(`GeoCircle: the specified point does not lie on this circle (distance of ${Math.abs(this.distance(point))} vs tolerance of ${tolerance}).`);
    }

    if (this._sinRadius <= GeoCircle.ANGULAR_TOLERANCE) {
      // Offsetting any point on a circle of effectively zero radius (i.e. a point) will just yield the same point.
      return out instanceof GeoPoint ? out.setFromCartesian(this._center) : Vec3Math.copy(this._center, out);
    }

    // Since point may not lie exactly on this circle due to error tolerance, project point onto this circle to ensure
    // the offset point lies exactly on this circle.
    point = this.closest(point, GeoCircle.vec3Cache[3]);

    const sin = Math.sin(angle / 2);
    const q0 = Math.cos(angle / 2);
    const q1 = sin * this._center[0];
    const q2 = sin * this._center[1];
    const q3 = sin * this._center[2];
    const q0Sq = q0 * q0;
    const q1Sq = q1 * q1;
    const q2Sq = q2 * q2;
    const q3Sq = q3 * q3;
    const q01 = q0 * q1;
    const q02 = q0 * q2;
    const q03 = q0 * q3;
    const q12 = q1 * q2;
    const q13 = q1 * q3;
    const q23 = q2 * q3;

    const rot_11 = q0Sq + q1Sq - q2Sq - q3Sq;
    const rot_12 = 2 * (q12 - q03);
    const rot_13 = 2 * (q13 + q02);
    const rot_21 = 2 * (q12 + q03);
    const rot_22 = q0Sq - q1Sq + q2Sq - q3Sq;
    const rot_23 = 2 * (q23 - q01);
    const rot_31 = 2 * (q13 - q02);
    const rot_32 = 2 * (q23 + q01);
    const rot_33 = (q0Sq - q1Sq - q2Sq + q3Sq);

    const x = point[0];
    const y = point[1];
    const z = point[2];

    const rotX = rot_11 * x + rot_12 * y + rot_13 * z;
    const rotY = rot_21 * x + rot_22 * y + rot_23 * z;
    const rotZ = rot_31 * x + rot_32 * y + rot_33 * z;

    return out instanceof Float64Array
      ? Vec3Math.set(rotX, rotY, rotZ, out)
      : out.setFromCartesian(Vec3Math.set(rotX, rotY, rotZ, GeoCircle.vec3Cache[2]));
  }

  /**
   * Rotates this circle around a pivot.
   * @param pivot The pivot point of the rotation. If the pivot point does not lie exactly on this circle, then it will
   * be projected onto this circle.
   * @param angle The angle by which to rotate, in radians. Positive angles rotate the circle clockwise. In other
   * words, if vector A is parallel to this circle at the pivot point and vector B is parallel to this circle after a
   * rotation by angle `delta` at the pivot point, then vector B is equal to vector A after a clockwise rotation by
   * angle `delta`, as viewed from directly above the earth's surface at the pivot point.
   * @param tolerance The error tolerance, in great-arc radians, when checking if `pivot` lies on this circle. Defaults
   * to `GeoCircle.ANGULAR_TOLERANCE` if not specified.
   * @returns This circle, after it has been rotated around the specified pivot point by the specified angle.
   * @throws Error if the pivot point does not lie on this circle, or if the pivot point cannot be projected onto this
   * circle because it is equidistant to all points on this circle.
   */
  public rotate(
    pivot: ReadonlyFloat64Array | LatLonInterface,
    angle: number,
    tolerance = GeoCircle.ANGULAR_TOLERANCE
  ): GeoCircle {
    if (!(pivot instanceof Float64Array)) {
      pivot = GeoPoint.sphericalToCartesian(pivot as LatLonInterface, GeoCircle.vec3Cache[0]);
    }

    const pivotDistance = Math.abs(this.distance(pivot));

    if (tolerance < Math.PI && pivotDistance > tolerance) {
      throw new Error(`GeoCircle::rotate(): the specified pivot does not lie on this circle (distance of ${pivotDistance} vs tolerance of ${tolerance}).`);
    }

    const pivotToUse = pivotDistance <= Math.min(tolerance, GeoCircle.ANGULAR_TOLERANCE) ? pivot : this.closest(pivot, GeoCircle.vec3Cache[0]);

    if (!Vec3Math.isFinite(pivotToUse)) {
      throw new Error('GeoCircle::rotate(): the specified pivot cannot be projected onto this circle because it is equidistant to all points on the circle.');
    }

    if (Math.abs(angle) <= GeoCircle.ANGULAR_TOLERANCE || this._sinRadius <= GeoCircle.ANGULAR_TOLERANCE) {
      return this;
    }

    const center = Vec3Math.copy(this._center, GeoCircle.vec3Cache[5]);
    Vec3Math.copy(pivotToUse, this._center);
    this.offsetAngleAlong(center, -angle, this._center, Math.PI);
    return this;
  }

  /**
   * Calculates and returns the set of intersection points between this circle and another one, and writes the results
   * to an array of position vectors.
   * @param other The other circle to test for intersections.
   * @param out An array in which to store the results. The results will be stored at indexes 0 and 1. If these indexes
   * are empty, then new Float64Array objects will be created and inserted into the array.
   * @returns The number of solutions written to the out array. Either 0, 1, or 2.
   */
  public intersection(other: GeoCircle, out: Float64Array[]): number {
    const center1 = this._center;
    const center2 = other._center;
    const radius1 = this._radius;
    const radius2 = other._radius;

    /**
     * Theory: We can model geo circles as the intersection between a sphere and the unit sphere (Earth's surface).
     * Therefore, the intersection of two geo circles is the intersection between two spheres AND the unit sphere.
     * First, we find the intersection of the two non-Earth spheres (which can either be a sphere, a circle, or a
     * point), then we find the intersection of that geometry with the unit sphere.
     */

    const dot = Vec3Math.dot(center1, center2);
    const dotSquared = dot * dot;
    if (dotSquared === 1) {
      // the two circles are concentric; either there are zero solutions or infinite solutions; either way we don't
      // write any solutions to the array.
      return 0;
    }

    // find the position vector to the center of the circle which defines the intersection of the two geo circle
    // spheres.
    const a = (Math.cos(radius1) - dot * Math.cos(radius2)) / (1 - dotSquared);
    const b = (Math.cos(radius2) - dot * Math.cos(radius1)) / (1 - dotSquared);
    const intersection = Vec3Math.add(
      Vec3Math.multScalar(center1, a, GeoCircle.vec3Cache[0]),
      Vec3Math.multScalar(center2, b, GeoCircle.vec3Cache[1]),
      GeoCircle.vec3Cache[0]
    );

    const intersectionLengthSquared = Vec3Math.dot(intersection, intersection);
    if (intersectionLengthSquared > 1) {
      // the two geo circle spheres do not intersect.
      return 0;
    }

    const cross = Vec3Math.cross(center1, center2, GeoCircle.vec3Cache[1]);
    const crossLengthSquared = Vec3Math.dot(cross, cross);
    if (crossLengthSquared === 0) {
      // this technically can't happen (since we already check if center1 dot center2 === +/-1 above, but just in
      // case...)
      return 0;
    }

    const offset = Math.sqrt((1 - intersectionLengthSquared) / crossLengthSquared);
    let solutionCount = 1;
    if (!out[0]) {
      out[0] = new Float64Array(3);
    }
    out[0].set(cross);
    Vec3Math.multScalar(out[0], offset, out[0]);
    Vec3Math.add(out[0], intersection, out[0]);
    if (offset > 0) {
      if (!out[1]) {
        out[1] = new Float64Array(3);
      }
      out[1].set(cross);
      Vec3Math.multScalar(out[1], -offset, out[1]);
      Vec3Math.add(out[1], intersection, out[1]);
      solutionCount++;
    }
    return solutionCount;
  }

  /**
   * Calculates and returns the set of intersection points between this circle and another one, and writes the results
   * to an array of GeoPoint objects.
   * @param other The other circle to test for intersections.
   * @param out An array in which to store the results. The results will be stored at indexes 0 and 1. If these indexes
   * are empty, then new GeoPoint objects will be created and inserted into the array.
   * @returns The number of solutions written to the out array. Either 0, 1, or 2.
   */
  public intersectionGeoPoint(other: GeoCircle, out: GeoPoint[]): number {
    const solutionCount = this.intersection(other, GeoCircle.intersectionCache);
    for (let i = 0; i < solutionCount; i++) {
      if (!out[i]) {
        out[i] = new GeoPoint(0, 0);
      }
      out[i].setFromCartesian(GeoCircle.intersectionCache[i]);
    }
    return solutionCount;
  }

  /**
   * Calculates and returns the number of intersection points between this circle and another one. Returns NaN if there
   * are an infinite number of intersection points.
   * @param other The other circle to test for intersections.
   * @param tolerance The error tolerance, in great-arc radians, of this operation. Defaults to
   * `GeoCircle.ANGULAR_TOLERANCE` if not specified.
   * @returns the number of intersection points between this circle and the other one.
   */
  public numIntersectionPoints(other: GeoCircle, tolerance = GeoCircle.ANGULAR_TOLERANCE): number {
    const center1 = this.center;
    const center2 = other.center;
    const radius1 = this.radius;
    const radius2 = other.radius;

    const dot = Vec3Math.dot(center1, center2);
    const dotSquared = dot * dot;
    if (dotSquared === 1) {
      // the two circles are concentric; if they are the same circle there are an infinite number of intersections,
      // otherwise there are none.
      if (dot === 1) {
        // centers are the same
        return (Math.abs(this.radius - other.radius) <= tolerance) ? NaN : 0;
      } else {
        // centers are antipodal
        return (Math.abs(Math.PI - this.radius - other.radius) <= tolerance) ? NaN : 0;
      }
    }

    const a = (Math.cos(radius1) - dot * Math.cos(radius2)) / (1 - dotSquared);
    const b = (Math.cos(radius2) - dot * Math.cos(radius1)) / (1 - dotSquared);
    const intersection = Vec3Math.add(
      Vec3Math.multScalar(center1, a, GeoCircle.vec3Cache[0]),
      Vec3Math.multScalar(center2, b, GeoCircle.vec3Cache[1]),
      GeoCircle.vec3Cache[1]
    );

    const intersectionLengthSquared = Vec3Math.dot(intersection, intersection);
    if (intersectionLengthSquared > 1) {
      return 0;
    }

    const cross = Vec3Math.cross(center1, center2, GeoCircle.vec3Cache[1]);
    const crossLengthSquared = Vec3Math.dot(cross, cross);
    if (crossLengthSquared === 0) {
      return 0;
    }

    const sinTol = Math.sin(tolerance);
    return ((1 - intersectionLengthSquared) / crossLengthSquared > sinTol * sinTol) ? 2 : 1;
  }

  /**
   * Creates a new small circle from a lat/long coordinate pair and radius.
   * @param point The center of the new small circle.
   * @param radius The radius of the new small circle, in great-arc radians.
   * @returns a small circle.
   */
  public static createFromPoint(point: LatLonInterface, radius: number): GeoCircle {
    return new GeoCircle(GeoPoint.sphericalToCartesian(point, GeoCircle.vec3Cache[0]), radius);
  }

  /**
   * Creates a new great circle that includes two points and is parallel to the path from the first point to the
   * second point. If the two points are coincident or antipodal, then the new circle will be set to an invalid circle
   * with center coordinates equal to `[NaN, NaN, NaN]`.
   * @param point1 The first point that lies on the new great circle.
   * @param point2 The second point that lies on the new great circle.
   * @returns A great circle that includes both specified points and is parallel to the path from the first point to
   * the second point.
   */
  public static createGreatCircle(point1: ReadonlyFloat64Array | LatLonInterface, point2: ReadonlyFloat64Array | LatLonInterface): GeoCircle;
  /**
   * Creates a new great circle that includes a given point and is parallel to an initial bearing from the same point.
   * @param point A point that lies on the new great circle.
   * @param bearing The initial bearing from the point, in degrees.
   * @returns A great circle that includes the specified point and is parallel to the specified initial bearing from
   * the same point.
   */
  public static createGreatCircle(point: ReadonlyFloat64Array | LatLonInterface, bearing: number): GeoCircle;
  /**
   * Creates a new great circle that is tangent and parallel to another GeoCircle at a given point. If the specified
   * point does not lie exactly on the other GeoCircle, then the projection of the point onto the other GeoCircle will
   * be used instead. If the point cannot be projected onto the GeoCircle, then the new circle will be set to an
   * invalid circle with center coordinates equal to `[NaN, NaN, NaN]`.
   * @param point The point at which the new great circle is tangent and parallel to the other circle.
   * @param circle The other GeoCircle.
   * @returns A great circle that is tangent and parallel to the specified other GeoCircle at the specified point.
   */
  public static createGreatCircle(point: ReadonlyFloat64Array | LatLonInterface, circle: GeoCircle): GeoCircle;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public static createGreatCircle(
    arg1: ReadonlyFloat64Array | LatLonInterface,
    arg2: ReadonlyFloat64Array | LatLonInterface | number | GeoCircle
  ): GeoCircle {
    return new GeoCircle(GeoCircle._getGreatCircleNormal(arg1, arg2, GeoCircle.vec3Cache[0]), Math.PI / 2);
  }

  /**
   * Creates a new great circle defined by one point and a bearing offset. The new great circle will be equivalent to
   * the path projected from the point with the specified initial bearing (forward azimuth).
   * @param point A point that lies on the new great circle.
   * @param bearing The initial bearing from the point.
   * @returns a great circle.
   */
  public static createGreatCircleFromPointBearing(point: ReadonlyFloat64Array | LatLonInterface, bearing: number): GeoCircle {
    return new GeoCircle(GeoCircle.getGreatCircleNormalFromPointBearing(point, bearing, GeoCircle.vec3Cache[0]), Math.PI / 2);
  }

  /**
   * Calculates a normal vector for a great circle that includes two given points and is parallel to the path from the
   * first point to the second point. If the two points are coincident or antipodal, then `NaN` will be written to all
   * components of the result.
   * @param point1 The first point that lies on the great circle.
   * @param point2 The second point that lies on the great circle.
   * @param out The vector to which to write the result.
   * @returns The normal vector for the great circle that is tangent and parallel to the specified GeoCircle at the
   * specified point.
   */
  public static getGreatCircleNormal(point1: ReadonlyFloat64Array | LatLonInterface, point2: ReadonlyFloat64Array | LatLonInterface, out: Float64Array): Float64Array;
  /**
   * Calculates a normal vector for a great circle that includes a given a point and is parallel to an initial bearing
   * at the same point.
   * @param point A point that lies on the great circle.
   * @param bearing The initial bearing from the point.
   * @param out The vector to which to write the result.
   * @returns The normal vector for the great circle that includes the specified point and is parallel to the specified
   * bearing at that point.
   */
  public static getGreatCircleNormal(point: ReadonlyFloat64Array | LatLonInterface, bearing: number, out: Float64Array): Float64Array;
  /**
   * Calculates a normal vector for a great circle that is tangent and parallel to a GeoCircle at a given point. If the
   * specified point does not lie exactly on the GeoCircle, then the projection of the point onto the GeoCircle will be
   * used instead. If the point cannot be projected onto the GeoCircle, then `NaN` will be written to all components of
   * the result.
   * @param point The point at which the great circle whose normal vector to calculate is tangent and parallel to the
   * GeoCircle.
   * @param circle A GeoCircle.
   * @param out The vector to which to write the result.
   * @returns The normal vector for the great circle that is tangent and parallel to the specified GeoCircle at the
   * specified point.
   */
  public static getGreatCircleNormal(point: ReadonlyFloat64Array | LatLonInterface, circle: GeoCircle, out: Float64Array): Float64Array;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public static getGreatCircleNormal(
    arg1: ReadonlyFloat64Array | LatLonInterface,
    arg2: ReadonlyFloat64Array | LatLonInterface | number | GeoCircle,
    out: Float64Array
  ): Float64Array {
    return GeoCircle._getGreatCircleNormal(arg1, arg2, out);
  }

  /**
   * Calculates a normal vector for a great circle given certain parameters.
   * @param arg1 A point that lies on the great circle.
   * @param arg2 A second point that lies on the great circle, or an initial bearing from the first point, or a
   * GeoCircle that is tangent and parallel to the great circle at the first point.
   * @param out The vector to which to write the result.
   * @returns The normal vector for the great circle with the specified parameters.
   */
  private static _getGreatCircleNormal(
    arg1: ReadonlyFloat64Array | LatLonInterface,
    arg2: ReadonlyFloat64Array | LatLonInterface | number | GeoCircle,
    out: Float64Array
  ): Float64Array {
    if (typeof arg2 === 'number') {
      return GeoCircle.getGreatCircleNormalFromPointBearing(arg1, arg2, out);
    } else if (arg2 instanceof GeoCircle) {
      return GeoCircle.getGreatCircleNormalFromCircle(arg1, arg2, out);
    } else {
      return GeoCircle.getGreatCircleNormalFromPoints(arg1, arg2, out);
    }
  }

  /**
   * Calculates a normal vector for a great circle that includes two given points and is parallel to the path from the
   * first point to the second point. If the two points are coincident or antipodal, then `NaN` will be written to all
   * components of the result.
   * @param point1 The first point that lies on the great circle.
   * @param point2 The second point that lies on the great circle.
   * @param out The vector to which to write the result.
   * @returns The normal vector for the great circle that includes the two specified points and is parallel to the path
   * from the first point to the second point.
   */
  private static getGreatCircleNormalFromPoints(point1: ReadonlyFloat64Array | LatLonInterface, point2: ReadonlyFloat64Array | LatLonInterface, out: Float64Array): Float64Array {
    if (!(point1 instanceof Float64Array)) {
      point1 = GeoPoint.sphericalToCartesian(point1 as LatLonInterface, GeoCircle.vec3Cache[0]);
    }
    if (!(point2 instanceof Float64Array)) {
      point2 = GeoPoint.sphericalToCartesian(point2 as LatLonInterface, GeoCircle.vec3Cache[1]);
    }
    return Vec3Math.normalize(Vec3Math.cross(point1, point2, out), out);
  }

  /**
   * Calculates a normal vector for a great circle that includes a given a point and is parallel to an initial bearing
   * at the same point.
   * @param point A point that lies on the great circle.
   * @param bearing The initial bearing from the point.
   * @param out The vector to which to write the result.
   * @returns The normal vector for the great circle that includes the specified point and is parallel to the specified
   * bearing at that point.
   */
  private static getGreatCircleNormalFromPointBearing(point: ReadonlyFloat64Array | LatLonInterface, bearing: number, out: Float64Array): Float64Array {
    if (point instanceof Float64Array) {
      point = GeoCircle.geoPointCache[0].setFromCartesian(point);
    }

    const lat = (point as LatLonInterface).lat * Avionics.Utils.DEG2RAD;
    const long = (point as LatLonInterface).lon * Avionics.Utils.DEG2RAD;
    bearing *= Avionics.Utils.DEG2RAD;
    const sinLat = Math.sin(lat);
    const sinLon = Math.sin(long);
    const cosLon = Math.cos(long);
    const sinBearing = Math.sin(bearing);
    const cosBearing = Math.cos(bearing);

    const x = sinLon * cosBearing - sinLat * cosLon * sinBearing;
    const y = -cosLon * cosBearing - sinLat * sinLon * sinBearing;
    const z = Math.cos(lat) * sinBearing;

    return Vec3Math.set(x, y, z, out);
  }

  /**
   * Calculates a normal vector for a great circle that is tangent and parallel to a GeoCircle at a given point. If the
   * specified point does not lie exactly on the GeoCircle, then the projection of the point onto the GeoCircle will be
   * used instead. If the point cannot be projected onto the GeoCircle, then `NaN` will be written to all components of
   * the result.
   * @param point The point at which the great circle whose normal vector to calculate is tangent and parallel to the
   * GeoCircle.
   * @param circle A GeoCircle.
   * @param out The vector to which to write the result.
   * @returns The normal vector for the great circle that is tangent and parallel to the specified GeoCircle at the
   * specified point.
   */
  private static getGreatCircleNormalFromCircle(point: ReadonlyFloat64Array | LatLonInterface, circle: GeoCircle, out: Float64Array): Float64Array {
    const projectedPoint = circle.closest(point, GeoCircle.vec3Cache[0]);

    if (!Vec3Math.isFinite(projectedPoint)) {
      return Vec3Math.set(NaN, NaN, NaN, out);
    }

    if (circle.isGreatCircle()) {
      return Vec3Math.copy(circle.center, out);
    }

    return Vec3Math.normalize(
      Vec3Math.cross(
        Vec3Math.cross(
          projectedPoint,
          circle._center,
          out
        ),
        projectedPoint,
        out
      ),
      out
    );
  }
}