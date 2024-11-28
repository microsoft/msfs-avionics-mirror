import { GeoPoint, NavMath, UnitType } from '@microsoft/msfs-sdk';

/**
 * Creates a new identity Mat4Math
 */
export class Pathways3DMath {
  private static EPSILON = 0.000001;

  private static referencePos = new GeoPoint(0, 0);

  /**
   * Update the ref coordinate.
   * @param lat new current lat
   * @param long New current long
   */
  public static updateReferencePoint(lat: number, long: number): void {
    const newInputPos = new GeoPoint(lat, long);
    Pathways3DMath.referencePos = newInputPos;
  }

  /**
   * Returns a vector aligned with a north-zeroed radial.
   * @param radialDeg Radial angle.
   * @param length Length.
   * @param out Float array to store the result.
   * @returns the out array.
   */
  public static getRadialVector(radialDeg: number, length: number, out: Float64Array): Float64Array {
    const radialRad = UnitType.DEGREE.convertTo(radialDeg, UnitType.RADIAN);
    out[0] = Math.sin(radialRad) * length;
    out[1] = 0;
    out[2] = Math.cos(radialRad) * length;
    return out;
  }

  /**
   * Returns the course of a vector.
   * @param x coordinate.
   * @param z coordinate.
   * @returns the course.
   */
  public static getBearing(x: number, z: number): number {
    return NavMath.normalizeHeading(UnitType.RADIAN.convertTo(Math.atan2(-x, -z), UnitType.DEGREE) + 180.0);
  }

  /**
   * Get 2D vector from ref in meters (x -> east-west, y -> north - south).
   * @param latitude input latitude of position
   * @param longitude input longitude of position
   * @param altitude altitude in Meter
   * @param out vector which stores the output
   * @returns 3D vector
   */
  public static getMetersFromRef(latitude: number, longitude: number, altitude: number, out: Float64Array): Float64Array {
    const dLat = latitude - Pathways3DMath.referencePos.lat;
    const dLong = longitude - Pathways3DMath.referencePos.lon;
    out[0] = Pathways3DMath.getRelativeMetersX(dLong, latitude);
    out[1] = altitude;
    out[2] = Pathways3DMath.getRelativeMetersZ(dLat);
    return out;
  }

  /**
   * Get the meters along the x-axis for a longitude delta:
   * @param dLong longitude delta
   * @param latitude latitude of the location
   * @returns the meters that are represented by the dLongitude.
   */
  public static getRelativeMetersX(dLong: number, latitude: number): number {
    dLong *= Math.cos(UnitType.DEGREE.convertTo(latitude, UnitType.RADIAN));
    return dLong * 111194.9;
  }

  /**
   * Get the meters along the z-axis (N-S) for a latitude delta:
   * @param dLat Latitude delta
   * @returns the meters that are represented by the dLatitude.
   */
  public static getRelativeMetersZ(dLat: number): number {
    return dLat * 111194.9;
  }

  /**
   * Set a Mat4Math to the identity matrix
   *
   * @param out the receiving matrix
   * @returns out
   */
  public static identity(out: Float64Array): Float64Array {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
  }

  /**
   * Multiplies two mat4s
   *
   * @param out the receiving matrix
   * @param a the first operand
   * @param b the second operand
   * @returns out
   */
  public static multiply(out: Float64Array, a: Float64Array, b: Float64Array): Float64Array {
    const a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a03 = a[3];
    const a10 = a[4],
      a11 = a[5],
      a12 = a[6],
      a13 = a[7];
    const a20 = a[8],
      a21 = a[9],
      a22 = a[10],
      a23 = a[11];
    const a30 = a[12],
      a31 = a[13],
      a32 = a[14],
      a33 = a[15];
    // Cache only the current line of the second matrix
    let b0 = b[0],
      b1 = b[1],
      b2 = b[2],
      b3 = b[3];
    out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    b0 = b[4];
    b1 = b[5];
    b2 = b[6];
    b3 = b[7];
    out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    b0 = b[8];
    b1 = b[9];
    b2 = b[10];
    b3 = b[11];
    out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    b0 = b[12];
    b1 = b[13];
    b2 = b[14];
    b3 = b[15];
    out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    return out;
  }

  /**
   * Multiplies a mat4s with a vector
   *
   * @param a the first operand, matrix with 16 values
   * @param b the second operand
   * @param bPos starting from this position, 4 values are taken as input from b
   * @param out the receiving vector
   * @param outPos starting from this position, 4 values are written as output
   * @param vertOffset offset to subtract from the altitude of bPos
   * @returns out
   */
  public static render3DPosOnScreen(a: Float64Array, b: Float64Array, bPos: number, out: Float64Array, outPos: number, vertOffset = 0): Float64Array {
    const a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a03 = a[3];
    const a10 = a[4],
      a11 = a[5],
      a12 = a[6],
      a13 = a[7];
    const a20 = a[8],
      a21 = a[9],
      a22 = a[10],
      a23 = a[11];
    const a30 = a[12],
      a31 = a[13],
      a32 = a[14],
      a33 = a[15];
    // Cache only the current line of the second matrix
    const b0 = b[bPos + 0],
      b1 = b[bPos + 1] - vertOffset,
      b2 = b[bPos + 2],
      b3 = b[bPos + 3];
    const w = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    out[outPos + 0] = (b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30) / w;
    out[outPos + 1] = (b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31) / w;
    out[outPos + 2] = (b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32) / w;
    out[outPos + 3] = w;
    return out;
  }

  /**
   * Add two 3 component vectors taken from a specified index from an array and store the result at another indexed array position
   * @param v1 The first vector.
   * @param v1Pos Start reading from v1 at this position.
   * @param v2 The second vector.
   * @param v2Pos Start reading from v2 at this position.
   * @param out The vector to write the results to.
   * @param outPos Start writing to out at this position.
   */
  public static add(v1: Float64Array, v1Pos: number, v2: Float64Array, v2Pos: number, out: Float64Array, outPos: number): void {
    out[outPos + 0] = v1[v1Pos + 0] + v2[v2Pos + 0];
    out[outPos + 1] = v1[v1Pos + 1] + v2[v2Pos + 1];
    out[outPos + 2] = v1[v1Pos + 2] + v2[v2Pos + 2];
  }

  /**
   * Copies one vector to the index of another.
   * @param from The vector from which to copy.
   * @param fromPos Start reading from from at this position.
   * @param to The vector to which to copy.
   * @param toPos Start writing the output at this index.
   * @returns the changed vector.
   */
  public static copy(from: Float64Array, fromPos: number, to: Float64Array, toPos: number): Float64Array {
    to[toPos + 0] = from[fromPos + 0];
    to[toPos + 1] = from[fromPos + 1];
    to[toPos + 2] = from[fromPos + 2];
    return to;
  }

  /**
   * Generates a perspective projection matrix with the given field of view.
   * This is primarily useful for generating projection matrices to be used
   * with the still experiemental WebVR API.
   *
   * @param out Mat4Math frustum matrix will be written into
   * @param fovUpDegrees upDegrees
   * @param fovDownDegrees downDegrees
   * @param fovLeftDegrees leftDegrees
   * @param fovRightDegrees rightDegrees
   * @param near Near bound of the frustum
   * @param far Far bound of the frustum
   * @returns out
   */
  public static perspectiveFromFieldOfView(out: Float64Array,
    fovUpDegrees: number, fovDownDegrees: number, fovLeftDegrees: number, fovRightDegrees: number,
    near: number, far: number): Float64Array {
    const upTan = Math.tan((fovUpDegrees * Math.PI) / 180.0);
    const downTan = Math.tan((fovDownDegrees * Math.PI) / 180.0);
    const leftTan = Math.tan((fovLeftDegrees * Math.PI) / 180.0);
    const rightTan = Math.tan((fovRightDegrees * Math.PI) / 180.0);
    const xScale = 2.0 / (leftTan + rightTan);
    const yScale = 2.0 / (upTan + downTan);
    out[0] = xScale;
    out[1] = 0.0;
    out[2] = 0.0;
    out[3] = 0.0;
    out[4] = 0.0;
    out[5] = yScale;
    out[6] = 0.0;
    out[7] = 0.0;
    out[8] = -((leftTan - rightTan) * xScale * 0.5);
    out[9] = (upTan - downTan) * yScale * 0.5;
    out[10] = far / (near - far);
    out[11] = -1.0;
    out[12] = 0.0;
    out[13] = 0.0;
    out[14] = (far * near) / (near - far);
    out[15] = 0.0;
    return out;
  }

  /**
   * Generates a look-at matrix with the given eye position, focal point, and up axis.
   * If you want a matrix that actually makes an object look at another object, you should use targetTo instead.
   *
   * @param out Mat4Math frustum matrix will be written into
   * @param eye Position of the viewer
   * @param center Point the viewer is looking at
   * @param up vec3 pointing up
   * @param bankAngle bank angle in rad
   * @returns out
   */
  public static lookAtScherfgen(out: Float64Array, eye: Float64Array, center: Float64Array, up: Float64Array, bankAngle: number): Float64Array {
    let x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
    const eyex = eye[0];
    const eyey = eye[1];
    const eyez = eye[2];
    const upx = up[0];
    const upy = up[1];
    const upz = up[2];
    const centerx = center[0];
    const centery = center[1];
    const centerz = center[2];
    if (
      Math.abs(eyex - centerx) < Pathways3DMath.EPSILON &&
      Math.abs(eyey - centery) < Pathways3DMath.EPSILON &&
      Math.abs(eyez - centerz) < Pathways3DMath.EPSILON
    ) {
      return Pathways3DMath.identity(out);
    }
    // z0 = eyex - centerx;
    // z1 = eyey - centery;
    // z2 = eyez - centerz;
    z0 = centerx - eyex;
    z1 = centery - eyey;
    z2 = centerz - eyez;
    len = 1 / Math.hypot(z0, z1, z2);
    z0 *= len;
    z1 *= len;
    z2 *= len;
    x0 = -1.0 * (upy * z2 - upz * z1);
    //x1 = -1.0 * (upz * z0 - upx * z2);
    x1 = -1.0 * Math.tan(bankAngle);
    x2 = -1.0 * (upx * z1 - upy * z0);

    len = Math.hypot(x0, x1, x2);
    if (!len) {
      x0 = 0;
      x1 = 0;
      x2 = 0;
    } else {
      len = 1 / len;
      x0 *= len;
      x1 *= len;
      x2 *= len;
    }

    y0 = z1 * x2 - z2 * x1;
    y1 = z2 * x0 - z0 * x2;
    y2 = z0 * x1 - z1 * x0;
    len = Math.hypot(y0, y1, y2);
    if (!len) {
      y0 = 0;
      y1 = 0;
      y2 = 0;
    } else {
      len = 1 / len;
      y0 *= len;
      y1 *= len;
      y2 *= len;
    }
    out[0] = x0;
    out[1] = y0;
    out[2] = z0;
    out[3] = 0;
    out[4] = x1;
    out[5] = y1;
    out[6] = z1;
    out[7] = 0;
    out[8] = x2;
    out[9] = y2;
    out[10] = z2;
    out[11] = 0;
    out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
    out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
    out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
    out[15] = 1;
    return out;
  }
}