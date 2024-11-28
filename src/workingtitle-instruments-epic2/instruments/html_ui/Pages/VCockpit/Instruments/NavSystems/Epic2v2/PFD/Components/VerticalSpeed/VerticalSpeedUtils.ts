import { MathUtils } from '@microsoft/msfs-sdk';

/** Utilities for the vertical speed scale. */
export class VerticalSpeedUtils {
  /** Radius of the arc swept by the needle in pixels. */
  public static readonly RADIUS = 102;
  /** Pixels per tick in the vertical axis. */
  public static readonly PX_PER_TICK = 17;

  /**
   * Gets the pointer rotation angle for a given VS.
   * @param vs Vertical speed in feet/min.
   * @param clamp Maximum vertical speed in feet/min, clamped in both directions, or undefined for no clamping.
   * @returns rotation angle in radians.
   */
  public static calculateAngle(vs: number, clamp?: number): number {
    const clampedVs = clamp !== undefined ? MathUtils.clamp(vs, -clamp, clamp) : vs;
    const ticks = Math.abs(clampedVs) > 2000 ? 4 + (Math.abs(clampedVs) - 2000) / 1000 : Math.abs(clampedVs) / 500;
    const y = Math.sign(clampedVs) * ticks * VerticalSpeedUtils.PX_PER_TICK;
    return Math.atan2(y, VerticalSpeedUtils.RADIUS);
  }

  /**
   * Get the y offset in pixels for a given x offset.
   * @param xOffset X offset in pixels from the arc centre point.
   * @param vs Vertical speed in feet/min.
   * @param clamp Maximum vertical speed in feet/min, clamped in both directions, or undefined for no clamping.
   * @returns The y offset in pixels.
   */
  public static calculateY(xOffset: number, vs: number, clamp?: number): number {
    const angle = VerticalSpeedUtils.calculateAngle(vs, clamp);
    return xOffset * Math.tan(angle);
  }
}
