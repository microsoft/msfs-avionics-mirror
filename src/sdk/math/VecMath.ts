import { MathUtils } from './MathUtils';

/**
 * A readonly version of a {@link Float64Array}.
 */
export type ReadonlyFloat64Array = Readonly<Omit<Float64Array, 'set' | 'copyWithin' | 'sort'>>;

/**
 * 2D vector mathematical operations.
 */
export class Vec2Math {
  /**
   * Creates a 2D vector initialized to `[0, 0]`.
   * @returns A new 2D vector initialized to `[0, 0]`.
   */
  public static create(): Float64Array
  /**
   * Creates a 2D vector with specified x- and y- components.
   * @param x The x-component of the new vector.
   * @param y The y-component of the new vector.
   * @returns A new 2D vector with the specified components.
   */
  public static create(x: number, y: number): Float64Array
  // eslint-disable-next-line jsdoc/require-jsdoc
  public static create(x?: number, y?: number): Float64Array {
    const vec = new Float64Array(2);
    if (x !== undefined && y !== undefined) {
      vec[0] = x;
      vec[1] = y;
    }
    return vec;
  }

  /**
   * Gets the polar angle theta of a vector in radians.
   * @param vec - a vector.
   * @returns the polar angle theta of the vector.
   */
  public static theta(vec: ReadonlyFloat64Array): number {
    return Math.atan2(vec[1], vec[0]);
  }

  /**
   * Sets the components of a vector.
   * @param x - the new x-component.
   * @param y - the new y-component.
   * @param vec - the vector to change.
   * @returns the vector after it has been changed.
   */
  public static set(x: number, y: number, vec: Float64Array): Float64Array {
    vec[0] = x;
    vec[1] = y;
    return vec;
  }

  /**
   * Sets the polar components of a vector.
   * @param r - the new length (magnitude).
   * @param theta - the new polar angle theta, in radians.
   * @param vec - the vector to change.
   * @returns the vector after it has been changed.
   */
  public static setFromPolar(r: number, theta: number, vec: Float64Array): Float64Array {
    vec[0] = r * Math.cos(theta);
    vec[1] = r * Math.sin(theta);
    return vec;
  }

  /**
   * Add one vector to another.
   * @param v1 The first vector.
   * @param v2 The second vector.
   * @param out The vector to write the results to.
   * @returns the vector sum.
   */
  public static add(v1: ReadonlyFloat64Array, v2: ReadonlyFloat64Array, out: Float64Array): Float64Array {
    out[0] = v1[0] + v2[0];
    out[1] = v1[1] + v2[1];

    return out;
  }

  /**
   * Subtracts one vector from another.
   * @param v1 The first vector.
   * @param v2 The second vector.
   * @param out The vector to write the results to.
   * @returns the vector difference.
   */
  public static sub(v1: ReadonlyFloat64Array, v2: ReadonlyFloat64Array, out: Float64Array): Float64Array {
    out[0] = v1[0] - v2[0];
    out[1] = v1[1] - v2[1];

    return out;
  }

  /**
   * Gets the dot product of two vectors.
   * @param v1 The first vector.
   * @param v2 The second vector.
   * @returns The dot product of the vectors.
   */
  public static dot(v1: ReadonlyFloat64Array, v2: ReadonlyFloat64Array): number {
    return v1[0] * v2[0] + v1[1] * v2[1];
  }

  /**
   * Gets the determinant of two vectors.
   * @param v1 The first vector.
   * @param v2 The second vector.
   * @returns The determinant of the vectors.
   */
  public static det(v1: ReadonlyFloat64Array, v2: ReadonlyFloat64Array): number {
    return v1[0] * v2[1] - v1[1] * v2[0];
  }

  /**
   * Multiplies a vector by a scalar.
   * @param v1 The vector to multiply.
   * @param scalar The scalar to apply.
   * @param out The vector to write the results to.
   * @returns The scaled vector.
   */
  public static multScalar(v1: ReadonlyFloat64Array, scalar: number, out: Float64Array): Float64Array {
    out[0] = v1[0] * scalar;
    out[1] = v1[1] * scalar;

    return out;
  }

  /**
   * Gets the magnitude of a vector.
   * @param v1 The vector to get the magnitude for.
   * @returns the vector's magnitude.
   */
  public static abs(v1: ReadonlyFloat64Array): number {
    return Math.hypot(v1[0], v1[1]);
  }

  /**
   * Normalizes the vector to a unit vector.
   * @param v1 The vector to normalize.
   * @param out The vector to write the results to.
   * @returns the normalized vector.
   */
  public static normalize(v1: ReadonlyFloat64Array, out: Float64Array): Float64Array {
    const mag = Vec2Math.abs(v1);
    out[0] = v1[0] / mag;
    out[1] = v1[1] / mag;

    return out;
  }

  /**
   * Gets the normal of the supplied vector.
   * @param v1 The vector to get the normal for.
   * @param out The vector to write the results to.
   * @param counterClockwise Whether or not to get the counterclockwise normal.
   * @returns the normal vector.
   */
  public static normal(v1: ReadonlyFloat64Array, out: Float64Array, counterClockwise = false): Float64Array {
    const x = v1[0];
    const y = v1[1];

    if (!counterClockwise) {
      out[0] = y;
      out[1] = -x;
    } else {
      out[0] = -y;
      out[1] = x;
    }

    return out;
  }

  /**
   * Gets the Euclidean distance between two vectors.
   * @param vec1 The first vector.
   * @param vec2 The second vector.
   * @returns the Euclidean distance between the two vectors.
   */
  public static distance(vec1: ReadonlyFloat64Array, vec2: ReadonlyFloat64Array): number {
    return Math.hypot(vec2[0] - vec1[0], vec2[1] - vec1[1]);
  }

  /**
   * Gets the angle between two vectors, in radians.
   * @param vec1 The first vector.
   * @param vec2 The second vector.
   * @returns The angle between the two specified unit vectors, in radians, or `NaN` if either of the vectors has a
   * magnitude equal to zero.
   */
  public static angle(vec1: ReadonlyFloat64Array, vec2: ReadonlyFloat64Array): number {
    const absProduct = Vec2Math.abs(vec1) * Vec2Math.abs(vec2);

    if (absProduct === 0) {
      return NaN;
    } else {
      return Vec2Math.unitAngle(vec1, vec2) / absProduct;
    }
  }

  /**
   * Gets the angle between two unit vectors, in radians.
   * @param vec1 The first unit vector.
   * @param vec2 The second unit vector.
   * @returns The angle between the two specified unit vectors, in radians.
   */
  public static unitAngle(vec1: ReadonlyFloat64Array, vec2: ReadonlyFloat64Array): number {
    return Math.acos(MathUtils.clamp(Vec2Math.dot(vec1, vec2), -1, 1));
  }

  /**
   * Checks if two vectors are equal.
   * @param vec1 The first vector.
   * @param vec2 The second vector.
   * @returns Whether the two vectors are equal.
   */
  public static equals(vec1: ReadonlyFloat64Array, vec2: ReadonlyFloat64Array): boolean {
    return vec1[0] === vec2[0] && vec1[1] === vec2[1];
  }

  /**
   * Checks if a vector is finite. A vector is considered finite if all of its components are finite.
   * @param vec The vector to check.
   * @returns Whether the specified vector is finite.
   */
  public static isFinite(vec: ReadonlyFloat64Array): boolean {
    return isFinite(vec[0]) && isFinite(vec[1]);
  }

  /**
   * Copies one vector to another.
   * @param from The vector from which to copy.
   * @param to The vector to which to copy.
   * @returns The changed vector.
   */
  public static copy(from: ReadonlyFloat64Array, to: Float64Array): Float64Array {
    return Vec2Math.set(from[0], from[1], to);
  }

  /**
   * Checks if a point is within a polygon.
   * @param polygon The polygon to check against.
   * @param point The point to test.
   * @returns True if the point is within or on the polygon, false otherwise.
   * @throws An error if first and last points in a polygon are not the same.
   */
  public static pointWithinPolygon(polygon: ReadonlyFloat64Array[], point: Float64Array): boolean | undefined {
    //Adapted from https://github.com/rowanwins/point-in-polygon-hao
    let k = 0;
    let f = 0;
    let u1 = 0;
    let v1 = 0;
    let u2 = 0;
    let v2 = 0;
    let currentP: ReadonlyFloat64Array | null = null;
    let nextP = null;

    const x = point[0];
    const y = point[1];

    const contourLen = polygon.length - 1;

    currentP = polygon[0];
    if (currentP[0] !== polygon[contourLen][0] &&
      currentP[1] !== polygon[contourLen][1]) {
      throw new Error('First and last coordinates in a ring must be the same');
    }

    u1 = currentP[0] - x;
    v1 = currentP[1] - y;

    for (let i = 0; i < polygon.length - 1; i++) {
      nextP = polygon[i + 1];

      v2 = nextP[1] - y;

      if ((v1 < 0 && v2 < 0) || (v1 > 0 && v2 > 0)) {
        currentP = nextP;
        v1 = v2;
        u1 = currentP[0] - x;
        continue;
      }

      u2 = nextP[0] - point[0];

      if (v2 > 0 && v1 <= 0) {
        f = (u1 * v2) - (u2 * v1);
        if (f > 0) {
          k = k + 1;
        } else if (f === 0) {
          return undefined;
        }
      } else if (v1 > 0 && v2 <= 0) {
        f = (u1 * v2) - (u2 * v1);
        if (f < 0) {
          k = k + 1;
        } else if (f === 0) {
          return undefined;
        }
      } else if (v2 === 0 && v1 < 0) {
        f = (u1 * v2) - (u2 * v1);
        if (f === 0) {
          return undefined;
        }
      } else if (v1 === 0 && v2 < 0) {
        f = u1 * v2 - u2 * v1;
        if (f === 0) {
          return undefined;
        }
      } else if (v1 === 0 && v2 === 0) {
        if (u2 <= 0 && u1 >= 0) {
          return undefined;
        } else if (u1 <= 0 && u2 >= 0) {
          return undefined;
        }
      }
      currentP = nextP;
      v1 = v2;
      u1 = u2;
    }

    if (k % 2 === 0) { return false; }
    return true;
  }
}

/**
 * 3D vector mathematical operations.
 */
export class Vec3Math {
  /**
   * Creates a 3D vector initialized to `[0, 0, 0]`.
   * @returns A new 3D vector initialized to `[0, 0, 0]`.
   */
  public static create(): Float64Array
  /**
   * Creates a 3D vector with specified x-, y-, and z- components.
   * @param x The x-component of the new vector.
   * @param y The y-component of the new vector.
   * @param z The z-component of the new vector.
   * @returns A new 3D vector with the specified components.
   */
  public static create(x: number, y: number, z: number): Float64Array
  // eslint-disable-next-line jsdoc/require-jsdoc
  public static create(x?: number, y?: number, z?: number): Float64Array {
    const vec = new Float64Array(3);
    if (x !== undefined && y !== undefined && z !== undefined) {
      vec[0] = x;
      vec[1] = y;
      vec[2] = z;
    }
    return vec;
  }

  /**
   * Gets the spherical angle theta (polar angle) of a vector in radians.
   * @param vec A vector.
   * @returns The spherical angle theta of the vector.
   */
  public static theta(vec: ReadonlyFloat64Array): number {
    return Math.atan2(Math.hypot(vec[0], vec[1]), vec[2]);
  }

  /**
   * Gets the spherical angle phi (azimuthal angle) of a vector in radians.
   * @param vec A vector.
   * @returns The spherical angle phi of the vector.
   */
  public static phi(vec: ReadonlyFloat64Array): number {
    return Math.atan2(vec[1], vec[0]);
  }

  /**
   * Sets the components of a vector.
   * @param x The new x-component.
   * @param y The new y-component.
   * @param z The new z-component.
   * @param vec The vector to change.
   * @returns The vector after it has been changed.
   */
  public static set(x: number, y: number, z: number, vec: Float64Array): Float64Array {
    vec[0] = x;
    vec[1] = y;
    vec[2] = z;
    return vec;
  }

  /**
   * Sets the spherical components of a vector.
   * @param r The new length (magnitude).
   * @param theta The new spherical angle theta (polar angle), in radians.
   * @param phi The new spherical angle phi (azimuthal angle), in radians.
   * @param vec The vector to change.
   * @returns The vector after it has been changed.
   */
  public static setFromSpherical(r: number, theta: number, phi: number, vec: Float64Array): Float64Array {
    const sinTheta = Math.sin(theta);
    vec[0] = r * sinTheta * Math.cos(phi);
    vec[1] = r * sinTheta * Math.sin(phi);
    vec[2] = r * Math.cos(theta);
    return vec;
  }

  /**
   * Add one vector to another.
   * @param v1 The first vector.
   * @param v2 The second vector.
   * @param out The vector to write the results to.
   * @returns the vector sum.
   */
  public static add(v1: ReadonlyFloat64Array, v2: ReadonlyFloat64Array, out: Float64Array): Float64Array {
    out[0] = v1[0] + v2[0];
    out[1] = v1[1] + v2[1];
    out[2] = v1[2] + v2[2];

    return out;
  }

  /**
   * Subtracts one vector from another.
   * @param v1 The first vector.
   * @param v2 The second vector.
   * @param out The vector to write the results to.
   * @returns the vector difference.
   */
  public static sub(v1: ReadonlyFloat64Array, v2: ReadonlyFloat64Array, out: Float64Array): Float64Array {
    out[0] = v1[0] - v2[0];
    out[1] = v1[1] - v2[1];
    out[2] = v1[2] - v2[2];

    return out;
  }

  /**
   * Gets the dot product of two vectors.
   * @param v1 The first vector.
   * @param v2 The second vector.
   * @returns The dot product of the vectors.
   */
  public static dot(v1: ReadonlyFloat64Array, v2: ReadonlyFloat64Array): number {
    return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
  }

  /**
   * Gets the cross product of two vectors.
   * @param v1 - the first vector.
   * @param v2 - the second vector.
   * @param out - the vector to which to write the result.
   * @returns the cross product.
   */
  public static cross(v1: ReadonlyFloat64Array, v2: ReadonlyFloat64Array, out: Float64Array): Float64Array {
    const x1 = v1[0];
    const y1 = v1[1];
    const z1 = v1[2];
    const x2 = v2[0];
    const y2 = v2[1];
    const z2 = v2[2];

    out[0] = y1 * z2 - z1 * y2;
    out[1] = z1 * x2 - x1 * z2;
    out[2] = x1 * y2 - y1 * x2;
    return out;
  }

  /**
   * Multiplies a vector by a scalar.
   * @param v1 The vector to multiply.
   * @param scalar The scalar to apply.
   * @param out The vector to write the results to.
   * @returns The scaled vector.
   */
  public static multScalar(v1: ReadonlyFloat64Array, scalar: number, out: Float64Array): Float64Array {
    out[0] = v1[0] * scalar;
    out[1] = v1[1] * scalar;
    out[2] = v1[2] * scalar;

    return out;
  }

  /**
   * Gets the magnitude of a vector.
   * @param v1 The vector to get the magnitude for.
   * @returns the vector's magnitude.
   */
  public static abs(v1: ReadonlyFloat64Array): number {
    return Math.hypot(v1[0], v1[1], v1[2]);
  }

  /**
   * Sets the magnitude of a vector.
   * @param v1 The vector to receive a new length.
   * @param magnitude The length to apply.
   * @param out The vector to write the results to.
   * @returns The scaled vector.
   */
  public static setMagnitude(v1: ReadonlyFloat64Array, magnitude: number, out: Float64Array): Float64Array {
    const magnitudeV1 = Vec3Math.abs(v1);
    const factor = (magnitudeV1 === 0) ? NaN : magnitude / magnitudeV1;
    out[0] = factor * v1[0];
    out[1] = factor * v1[1];
    out[2] = factor * v1[2];
    return out;
  }

  /**
   * Normalizes the vector to a unit vector.
   * @param v1 The vector to normalize.
   * @param out The vector to write the results to.
   * @returns the normalized vector.
   */
  public static normalize(v1: ReadonlyFloat64Array, out: Float64Array): Float64Array {
    const mag = Vec3Math.abs(v1);
    out[0] = v1[0] / mag;
    out[1] = v1[1] / mag;
    out[2] = v1[2] / mag;

    return out;
  }

  /**
   * Gets the Euclidean distance between two vectors.
   * @param vec1 The first vector.
   * @param vec2 The second vector.
   * @returns the Euclidean distance between the two vectors.
   */
  public static distance(vec1: ReadonlyFloat64Array, vec2: ReadonlyFloat64Array): number {
    return Math.hypot(vec2[0] - vec1[0], vec2[1] - vec1[0], vec2[2] - vec1[2]);
  }

  /**
   * Gets the angle between two vectors, in radians.
   * @param vec1 The first vector.
   * @param vec2 The second vector.
   * @returns The angle between the two specified unit vectors, in radians, or `NaN` if either of the vectors has a
   * magnitude equal to zero.
   */
  public static angle(vec1: ReadonlyFloat64Array, vec2: ReadonlyFloat64Array): number {
    const absProduct = Vec3Math.abs(vec1) * Vec3Math.abs(vec2);

    if (absProduct === 0) {
      return NaN;
    } else {
      return Vec3Math.unitAngle(vec1, vec2) / absProduct;
    }
  }

  /**
   * Gets the angle between two unit vectors, in radians.
   * @param vec1 The first unit vector.
   * @param vec2 The second unit vector.
   * @returns The angle between the two specified unit vectors, in radians.
   */
  public static unitAngle(vec1: ReadonlyFloat64Array, vec2: ReadonlyFloat64Array): number {
    return Math.acos(MathUtils.clamp(Vec3Math.dot(vec1, vec2), -1, 1));
  }

  /**
   * Checks if two vectors are equal.
   * @param vec1 The first vector.
   * @param vec2 The second vector.
   * @returns Whether the two vectors are equal.
   */
  public static equals(vec1: ReadonlyFloat64Array, vec2: ReadonlyFloat64Array): boolean {
    return vec1[0] === vec2[0] && vec1[1] === vec2[1] && vec1[2] === vec2[2];
  }

  /**
   * Checks if a vector is finite. A vector is considered finite if all of its components are finite.
   * @param vec The vector to check.
   * @returns Whether the specified vector is finite.
   */
  public static isFinite(vec: ReadonlyFloat64Array): boolean {
    return isFinite(vec[0]) && isFinite(vec[1]) && isFinite(vec[2]);
  }

  /**
   * Copies one vector to another.
   * @param from The vector from which to copy.
   * @param to The vector to which to copy.
   * @returns the changed vector.
   */
  public static copy(from: ReadonlyFloat64Array, to: Float64Array): Float64Array {
    return Vec3Math.set(from[0], from[1], from[2], to);
  }
}

/**
 * N-dimensional vector mathematical operations.
 */
export class VecNMath {
  /**
   * Creates an N-dimensional vector with all components initialized to `0`.
   * @param length The length of the new vector.
   * @returns A new N-dimensional vector with the specified length and all components initialized to `0`.
   */
  public static create(length: number): Float64Array
  /**
   * Creates an N-dimensional vector with specified components.
   * @param length The length of the new vector.
   * @param components The components of the new vector.
   * @returns A new N-dimensional vector with the specified length and components.
   */
  public static create(length: number, ...components: number[]): Float64Array
  // eslint-disable-next-line jsdoc/require-jsdoc
  public static create(length: number, ...components: number[]): Float64Array {
    const vec = new Float64Array(length);
    for (let i = 0; i < length && components.length; i++) {
      vec[i] = components[i];
    }
    return vec;
  }

  /**
   * Sets the components of a vector.
   * @param vec The vector to change.
   * @param components The new components.
   * @returns The vector after it has been changed.
   */
  public static set(vec: Float64Array, ...components: number[]): Float64Array {
    for (let i = 0; i < vec.length && components.length; i++) {
      vec[i] = components[i];
    }
    return vec;
  }

  /**
   * Gets the magnitude of a vector.
   * @param vec The vector to get the magnitude for.
   * @returns The vector's magnitude.
   */
  public static abs(vec: ReadonlyFloat64Array): number {
    return Math.hypot(...vec);
  }

  /**
   * Gets the dot product of two vectors.
   * @param v1 The first vector.
   * @param v2 The second vector.
   * @returns The dot product of the vectors.
   * @throws Error if the two vectors are of unequal lengths.
   */
  public static dot(v1: ReadonlyFloat64Array, v2: ReadonlyFloat64Array): number {
    if (v1.length !== v2.length) {
      throw new Error(`VecNMath: cannot compute dot product of two vectors of unequal length (${v1.length} and ${v2.length})`);
    }

    let dot = 0;
    const len = v1.length;
    for (let i = 0; i < len; i++) {
      dot += v1[i] * v2[i];
    }

    return dot;
  }

  /**
   * Normalizes a vector to a unit vector.
   * @param v1 The vector to normalize.
   * @param out The vector to write the results to.
   * @returns The normalized vector.
   */
  public static normalize(v1: ReadonlyFloat64Array, out: Float64Array): Float64Array {
    const mag = Vec3Math.abs(v1);

    const len = v1.length;
    for (let i = 0; i < len; i++) {
      out[i] = v1[i] / mag;
    }

    return out;
  }

  /**
   * Checks if two vectors are equal.
   * @param vec1 The first vector.
   * @param vec2 The second vector.
   * @returns Whether the two vectors are equal.
   */
  public static equals(vec1: ReadonlyFloat64Array, vec2: ReadonlyFloat64Array): boolean {
    if (vec1.length !== vec2.length) {
      return false;
    }

    for (let i = 0; i < vec1.length; i++) {
      if (vec1[i] !== vec2[i]) {
        return false;
      }
    }

    return true;
  }

  /**
   * Checks if a vector is finite. A vector is considered finite if all of its components are finite.
   * @param vec The vector to check.
   * @returns Whether the specified vector is finite.
   */
  public static isFinite(vec: ReadonlyFloat64Array): boolean {
    for (let i = 0; i < vec.length; i++) {
      if (!isFinite(vec[i])) {
        return false;
      }
    }

    return true;
  }

  /**
   * Copies one vector to another.
   * @param from The vector from which to copy.
   * @param to The vector to which to copy.
   * @returns The changed vector.
   * @throws Error if the vectors are of unequal lengths.
   */
  public static copy(from: ReadonlyFloat64Array, to: Float64Array): Float64Array {
    if (from.length !== to.length) {
      throw new Error(`VecNMath: cannot copy a vector of length ${from.length} to a vector of length ${to.length}`);
    }

    to.set(from);

    return to;
  }
}