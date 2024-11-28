import {
  APBackCourseDirectorActivateNavData, APBackCourseDirectorNavData, APGpsSteerDirectorState,
  APGSDirectorActivateNavData, APGSDirectorNavData, APLateralModes, APNavDirectorActivateNavData, APNavDirectorNavData,
  APValues, APVerticalModes, MathUtils, NavMath, NavSourceType, RadioUtils, SimVarValueType, UnitType
} from '@microsoft/msfs-sdk';

/**
 * A utility class for working with Garmin autopilots.
 */
export class GarminAPUtils {
  /**
   * Checks whether a GPSS director can be activated from an armed state.
   * @param apValues Autopilot values from the director's parent autopilot.
   * @param state State provided by the director for use in determing whether the director can be activated.
   * @returns Whether the director can be activated from an armed state.
   */
  public static gpssCanActivate(apValues: APValues, state: Readonly<APGpsSteerDirectorState>): boolean {
    return state.rollSteerCommand !== null
      && state.rollSteerCommand.isValid
      && Math.abs(state.rollSteerCommand.tae) < 110
      && (state.rollSteerCommand.isHeading || Math.abs(state.rollSteerCommand.xtk) < 0.6);
  }

  /**
   * Checks whether a nav director can be armed.
   * @param mode The director's lateral mode.
   * @param apValues Autopilot values from the director's parent autopilot.
   * @param navData The current radio navigation data received by the director.
   * @returns Whether the director can be armed.
   */
  public static navCanArm(mode: APLateralModes, apValues: APValues, navData: Readonly<APNavDirectorNavData>): boolean {
    if (apValues.cdiSource.get().type === NavSourceType.Gps) {
      return !!apValues.navToNavArmableLateralMode && apValues.navToNavArmableLateralMode() === mode;
    } else {
      return navData.navSource.index !== 0 && RadioUtils.isLocalizerFrequency(navData.frequency) === (mode === APLateralModes.LOC);
    }
  }

  /**
   * Checks whether a nav director can be activated from an armed state.
   * @param mode The director's lateral mode.
   * @param apValues Autopilot values from the director's parent autopilot.
   * @param navData The current radio navigation data received by the director.
   * @returns Whether the director can be activated from an armed state.
   */
  public static navCanActivate(mode: APLateralModes, apValues: APValues, navData: Readonly<APNavDirectorNavData>): boolean {
    if (
      apValues.cdiSource.get().type === NavSourceType.Nav
      && navData.deviation !== null
      && Math.abs(navData.deviation) < 1
      && (navData.hasLoc || navData.obsCourse !== null)
    ) {
      const dtk = navData.hasLoc
        ? navData.locCourse
        : navData.obsCourse;
      if (dtk === null) {
        return false;
      }
      const headingDiff = NavMath.diffAngle(SimVar.GetSimVarValue('PLANE HEADING DEGREES MAGNETIC', SimVarValueType.Degree), dtk);
      const sensitivity = navData.hasLoc ? 1 : .6;
      if (Math.abs(navData.deviation * sensitivity) < 1 && Math.abs(headingDiff) < 110) {
        return true;
      }
    }

    return false;
  }

  /**
   * Checks whether a nav director can remain in the active state.
   * @param mode The director's lateral mode.
   * @param apValues Autopilot values from the director's parent autopilot.
   * @param navData The current radio navigation data received by the director.
   * @param isInZoneOfConfusion Whether the source of the radio navigation data is a VOR and the airplane's position
   * is close enough to the VOR to render lateral deviation values unreliable.
   * @param activateNavData The radio navigation data received by the director at the moment of activation.
   * @returns Whether the director can remain in the active state.
   */
  public static navCanRemainActive(
    mode: APLateralModes,
    apValues: APValues,
    navData: Readonly<APNavDirectorNavData>,
    isInZoneOfConfusion: boolean,
    activateNavData: Readonly<APNavDirectorActivateNavData>
  ): boolean {
    if (
      apValues.cdiSource.get().type !== NavSourceType.Nav
      || navData.navSource.index !== activateNavData.navSource.index
      || navData.frequency !== activateNavData.frequency
    ) {
      return false;
    }

    if (mode === APLateralModes.LOC) {
      return navData.hasLoc
        && navData.locCourse !== null
        && navData.deviation !== null
        && Math.abs(navData.deviation) < 1;
    } else {
      return !navData.hasLoc
        && navData.obsCourse !== null
        && (isInZoneOfConfusion || (navData.deviation !== null && Math.abs(navData.deviation) < 1));
    }
  }

  /**
   * Checks whether a localizer back-course director can be armed.
   * @param apValues Autopilot values from the director's parent autopilot.
   * @param navData The current radio navigation data received by the director.
   * @returns Whether the director can be armed.
   */
  public static backCourseCanArm(apValues: APValues, navData: Readonly<APBackCourseDirectorNavData>): boolean {
    return apValues.cdiSource.get().type === NavSourceType.Nav
      && navData.navSource.index !== 0
      && RadioUtils.isLocalizerFrequency(navData.frequency);
  }

  /**
   * Checks whether a localizer back-course director can be activated from an armed state.
   * @param apValues Autopilot values from the director's parent autopilot.
   * @param navData The current radio navigation data received by the director.
   * @returns Whether the director can be activated from an armed state.
   */
  public static backCourseCanActivate(apValues: APValues, navData: Readonly<APBackCourseDirectorNavData>): boolean {
    if (
      apValues.cdiSource.get().type === NavSourceType.Nav
      && navData.hasLoc
      && navData.locCourse !== null
      && navData.deviation !== null
      && Math.abs(navData.deviation) < 1
    ) {
      const dtk = NavMath.normalizeHeading(navData.locCourse + 180);
      const headingDiff = NavMath.diffAngle(SimVar.GetSimVarValue('PLANE HEADING DEGREES MAGNETIC', SimVarValueType.Degree), dtk);
      if (Math.abs(headingDiff) < 110) {
        return true;
      }
    }

    return false;
  }

  /**
   * Checks whether a localizer back-course director can remain in the active state.
   * @param apValues Autopilot values from the director's parent autopilot.
   * @param navData The current radio navigation data received by the director.
   * @param activateNavData The radio navigation data received by the director at the moment of activation.
   * @returns Whether the director can remain in the active state.
   */
  public static backCourseCanRemainActive(
    apValues: APValues,
    navData: Readonly<APBackCourseDirectorNavData>,
    activateNavData: Readonly<APBackCourseDirectorActivateNavData>
  ): boolean {
    return apValues.cdiSource.get().type === NavSourceType.Nav
      && navData.navSource.index === activateNavData.navSource.index
      && navData.frequency === activateNavData.frequency
      && navData.hasLoc
      && navData.locCourse !== null
      && navData.deviation !== null
      && Math.abs(navData.deviation) < 1;
  }

  /**
   * Checks whether a glideslope director can be armed.
   * @param apValues Autopilot values from the director's parent autopilot.
   * @param navData The current radio navigation data received by the director.
   * @returns Whether the director can be armed.
   */
  public static glideslopeCanArm(apValues: APValues, navData: Readonly<APGSDirectorNavData>): boolean {
    if (apValues.lateralActive.get() !== APLateralModes.LOC && apValues.lateralArmed.get() !== APLateralModes.LOC) {
      return false;
    }

    if (apValues.cdiSource.get().type === NavSourceType.Gps) {
      return !!apValues.navToNavArmableVerticalMode && apValues.navToNavArmableVerticalMode() === APVerticalModes.GS;
    } else {
      return navData.navSource.index !== 0 && RadioUtils.isLocalizerFrequency(navData.frequency);
    }
  }

  /**
   * Checks whether a glideslope director can be activated from an armed state.
   * @param apValues Autopilot values from the director's parent autopilot.
   * @param navData The current radio navigation data received by the director.
   * @returns Whether the director can be activated from an armed state.
   */
  public static glideslopeCanActivate(apValues: APValues, navData: Readonly<APGSDirectorNavData>): boolean {
    return apValues.lateralActive.get() === APLateralModes.LOC
      && navData.gsAngleError !== null
      && Math.abs(navData.gsAngleError) <= 0.1;
  }

  /**
   * Checks whether a glideslope director can remain in the active state.
   * @param apValues Autopilot values from the director's parent autopilot.
   * @param navData The current radio navigation data received by the director.
   * @param activateNavData The radio navigation data received by the director at the moment of activation.
   * @returns Whether the director can remain in the active state.
   */
  public static glideslopeCanRemainActive(
    apValues: APValues,
    navData: Readonly<APGSDirectorNavData>,
    activateNavData: Readonly<APGSDirectorActivateNavData>
  ): boolean {
    return apValues.lateralActive.get() === APLateralModes.LOC
      && navData.navSource.index === activateNavData.navSource.index
      && navData.frequency === activateNavData.frequency
      && navData.gsAngleError !== null;
  }

  /**
   * Checks whether a glidepath director can be armed.
   * @param apValues Autopilot values from the director's parent autopilot.
   * @returns Whether the director can be armed.
   */
  public static glidepathCanArm(apValues: APValues): boolean {
    return apValues.cdiSource.get().type === NavSourceType.Gps
      && (
        apValues.lateralActive.get() === APLateralModes.GPSS
        || apValues.lateralArmed.get() === APLateralModes.GPSS
      );
  }

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
  public static navIntercept(distanceToSource: number, deflection: number, xtk: number, tas: number, isLoc: boolean): number {
    if (isLoc) {
      return GarminAPUtils.localizerIntercept(xtk, tas);
    } else {
      return GarminAPUtils.defaultIntercept(xtk, tas);
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
  public static lnavIntercept(dtk: number, xtk: number, tas: number): number {
    return GarminAPUtils.defaultIntercept(xtk, tas);
  }

  /**
   * Calculates intercept angles for localizers.
   * @param xtk The cross-track error of the plane from the desired track, in nautical miles. Positive values indicate
   * indicate that the plane is to the right of the track.
   * @param tas The true airspeed of the plane, in knots.
   * @returns The intercept angle, in degrees, to capture the localizer course.
   */
  public static localizerIntercept(xtk: number, tas: number): number {
    const xtkMeters = UnitType.NMILE.convertTo(xtk, UnitType.METER);
    const xtkMetersAbs = Math.abs(xtkMeters);

    if (xtkMetersAbs < 4) {
      return 0;
    } else if (xtkMetersAbs < 250) {
      return MathUtils.clamp(Math.abs(xtk * 75), 1, 5);
    }

    const turnRadiusMeters = NavMath.turnRadius(tas, 22.5);
    const interceptAngle = GarminAPUtils.calculateTurnBasedInterceptAngle(turnRadiusMeters, xtkMeters);

    return MathUtils.clamp(interceptAngle, 0, 20);
  }

  /**
   * Calculates non-localizer intercept angles.
   * @param xtk The cross-track error, in nautical miles. Negative values indicate that the plane is to the left of the
   * desired track.
   * @param tas The true airspeed of the plane, in knots.
   * @returns The intercept angle, in degrees, to capture the desired track.
   */
  private static defaultIntercept(xtk: number, tas: number): number {
    const xtkMeters = UnitType.NMILE.convertTo(xtk, UnitType.METER);
    const xtkMetersAbs = Math.abs(xtkMeters);

    if (xtkMetersAbs < 250) {
      return MathUtils.clamp(Math.abs(xtk * 75), 0, 5);
    }

    const turnRadiusMeters = NavMath.turnRadius(tas, 22.5);
    const interceptAngle = GarminAPUtils.calculateTurnBasedInterceptAngle(turnRadiusMeters, xtkMeters);

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