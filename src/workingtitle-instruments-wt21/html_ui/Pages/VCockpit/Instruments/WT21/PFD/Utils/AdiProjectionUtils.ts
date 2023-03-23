import { Vec2Math } from '@microsoft/msfs-sdk';

/**
 * Projection utils for the SVT
 */
export class AdiProjectionUtils {
  private static readonly FOV = 58;
  private static readonly FOCAL_LENGTH = 228 / Math.tan(AdiProjectionUtils.FOV / 2 * Avionics.Utils.DEG2RAD);

  /**
   * Projects vector3 to screen FoV.
   * @param x the x value
   * @param y the y value
   * @param z the z value
   * @param out The vector to which to write the results.
   * @returns The projected vector.
   */
  public static project(x: number, y: number, z: number, out: Float64Array): Float64Array {
    return Vec2Math.set(
      x * AdiProjectionUtils.FOCAL_LENGTH / z,
      y * AdiProjectionUtils.FOCAL_LENGTH / z,
      out
    );
  }

  /**
   * Relative yaw/pitch to plane, both in radians
   * @param yaw Yaw in radians
   * @param pitch Pitch in radians
   * @param roll Roll in radians
   * @param out The vector to which to write the results.
   * @returns projected vector with yaw/pitch
   */
  public static projectYawPitch(yaw: number, pitch: number, roll: number, out: Float64Array): Float64Array {
    const cos = Math.cos, sin = Math.sin;
    let x = 0;
    let y = 0;
    let z = 1;

    // pitch
    y = -sin(pitch);
    z = cos(pitch);

    // yaw
    x = z * sin(yaw);
    z = z * cos(yaw);

    // roll
    if (roll !== 0) {
      const x0 = x;
      const y0 = y;
      const sinR = sin(roll);
      const cosR = cos(roll);
      x = x0 * cosR - y0 * sinR;
      y = x0 * sinR + y0 * cosR;
    }

    return this.project(x, y, z, out);
  }

  /**
   * Gets the y pixels per degree
   * @returns px per degree
   */
  public static getPxPerDegY(): number {
    return this.projectYawPitch(0, 0.1 * Avionics.Utils.DEG2RAD, 0, new Float64Array(3))[1] * 10;
  }
}