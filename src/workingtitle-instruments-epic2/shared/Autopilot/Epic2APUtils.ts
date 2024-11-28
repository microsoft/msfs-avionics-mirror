import { MathUtils, NavMath, UnitType } from '@microsoft/msfs-sdk';

/**
 * A utility class for working with Epic2 autopilots.
 */
export class Epic2APUtils {
  /**
   * Calculates intercept angles for radio nav.
   * @param distanceToSource The distance from the plane to the source of the navigation signal, in nautical miles.
   * @param deflection The lateral deflection of the desired track relative to the plane, normalized from `-1` to `1`.
   * Positive values indicate that the desired track is to the right of the plane.
   * @param xtk The cross-track error of the plane from the desired track, in nautical miles. Positive values indicate
   * indicate that the plane is to the right of the track.
   * @param tas The true airspeed of the plane, in knots.
   * @param isLoc Whether the source of the navigation signal is a localizer. Defaults to `false`.
   * @returns The intercept angle, in degrees, to capture the desired track from the navigation signal.
   */
  public static navInterceptCurve(distanceToSource: number, deflection: number, xtk: number, tas: number, isLoc?: boolean): number {
    if (isLoc) {
      return Epic2APUtils.localizerInterceptCurve(deflection, xtk, tas);
    } else {
      return Epic2APUtils.defaultInterceptCurve(xtk, tas);
    }
  }

  /**
   * Calculates intercept angles for LNAV.
   * @param dtk The desired track, in degrees true.
   * @param xtk The cross-track error, in nautical miles. Negative values indicate that the plane is to the left of the
   * desired track.
   * @param tas The true airspeed of the plane, in knots.
   * @returns The intercept angle, in degrees, to capture the desired track from the navigation signal.
   */
  public static lnavInterceptCurve(dtk: number, xtk: number, tas: number): number {
    return Epic2APUtils.defaultInterceptCurve(xtk, tas);
  }

  /**
   * Calculates intercept angles for localizers.
   * @param deflection The lateral deflection of the desired track relative to the plane, normalized from `-1` to `1`.
   * Negative values indicate that the desired track is to the left of the plane.
   * @param xtk The cross-track error of the plane from the desired track, in nautical miles. Positive values indicate
   * indicate that the plane is to the right of the track.
   * @param tas The true airspeed of the plane, in knots.
   * @returns The intercept angle, in degrees, to capture the localizer course.
   */
  public static localizerInterceptCurve(deflection: number, xtk: number, tas: number): number {
    const xtkMeters = UnitType.NMILE.convertTo(xtk, UnitType.METER);
    const xtkMetersAbs = Math.abs(xtkMeters);

    if (Math.abs(deflection) < .02 || xtkMetersAbs < 4) {
      return 0;
    } else if (xtkMetersAbs < 200) {
      return NavMath.clamp(Math.abs(xtk * 75), 1, 5);
    }

    const turnRadiusMeters = NavMath.turnRadius(tas, 22.5);
    const interceptAngle = Epic2APUtils.calculateTurnBasedInterceptAngle(turnRadiusMeters, xtkMeters);

    return NavMath.clamp(interceptAngle, 0, 20);
  }

  /**
   * Calculates non-localizer intercept angles.
   * @param xtk The cross-track error, in nautical miles. Negative values indicate that the plane is to the left of the
   * desired track.
   * @param tas The true airspeed of the plane, in knots.
   * @returns The intercept angle, in degrees, to capture the desired track.
   */
  private static defaultInterceptCurve(xtk: number, tas: number): number {
    const xtkMeters = UnitType.NMILE.convertTo(xtk, UnitType.METER);
    const xtkMetersAbs = Math.abs(xtkMeters);

    if (xtkMetersAbs < 250) {
      return MathUtils.clamp(Math.abs(xtk * 75), 0, 5);
    }

    const turnRadiusMeters = NavMath.turnRadius(tas, 22.5);
    const interceptAngle = Epic2APUtils.calculateTurnBasedInterceptAngle(turnRadiusMeters, xtkMeters);

    return MathUtils.clamp(interceptAngle, 0, 45);
  }

  /**
   * Calculates an intercept angle to a track such that the intercept course, projected forward from the plane's
   * position, intercepts the desired track at the same point as a constant-radius turn overlapping the plane's
   * position configured to be tangent to the desired track. This has the effect of producing an intercept angle which
   * guarantees a no-overshoot intercept for all initial ground tracks for which a no-overshoot intercept is possible
   * given the specified turn radius and cross-track error.
   *
   * If the magnitude of the cross-track error is greater than twice the turn radius, no constant-radius turn
   * overlapping the plane's position will be tangent to the desired track; in this case the maximum possible intercept
   * angle of 90 degrees is returned.
   * @param turnRadius The turn radius, in the same units as `xtk`.
   * @param xtk The cross-track error, in the same units as `turnRadius`.
   * @returns The calculated intercept angle, in degrees.
   */
  private static calculateTurnBasedInterceptAngle(turnRadius: number, xtk: number): number {
    // The following formula is derived by solving for the intercept angle in Euclidean rather than spherical space.
    // The error from this simplification is negligible when turn radius and cross-track are small (less than 1% of
    // earth radius, or ~63km).
    // The Euclidean solution is chosen over the spherical one: asin(sin(xtk) / sqrt(1 - (1 - sin(xtk) * tan(radius))^2))
    // for performance reasons.
    return Math.asin(Math.min(Math.sqrt(Math.abs(xtk) / (2 * turnRadius)), 1)) * Avionics.Utils.RAD2DEG;
  }
}
