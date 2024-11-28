import {
  Accessible, APAltCapDirector, APAltDirector, APBackCourseDirector, APConfig, APConfigDirectorEntry, APFLCDirector, APGPDirector, APGpsSteerDirector,
  APGpsSteerDirectorSteerCommand, APGSDirector, APHdgDirector, APLateralModes, APLvlDirector, APNavDirector, APPitchDirector, APRollDirector, APValues,
  APVerticalModes, APVSDirector, EventBus, NavMath, SimVarValueType, UnitType, VNavManager
} from '@microsoft/msfs-sdk';

import { GarminAPUtils, GarminNavToNavManager2, GarminNavToNavManager2Guidance, GarminVNavGlidepathGuidance, GarminVNavManager2 } from '@microsoft/msfs-garminsdk';

import { GNSAPCdiId } from './GNSAPTypes';

/**
 * A GNS Autopilot Configuration.
 */
export class GNSAPConfig implements APConfig {
  public defaultLateralMode = APLateralModes.ROLL;
  public defaultVerticalMode = APVerticalModes.PITCH;
  public defaultMaxBankAngle = 27.5;
  public readonly cdiId: GNSAPCdiId = 'gnsAP';
  private disableNavModeArming = false;
  private disableBackcourse = false;
  public supportFlightDirector = false;
  private maxBankAngle = this.defaultMaxBankAngle;

  /**
   * Instantiates the AP Config for the Autopilot.
   * @param bus is an instance of the Event Bus.
   * @param gpsSteerCommand The steering command to send to the autopilot's GPS roll-steering director.
   * @param glidepathGuidance Guidance for the autopilot's glidepath director to use.
   * @param navToNavGuidance Guidance for the autopilot's nav-to-nav manager to use.
   * @param disableNavModeArming Whether to disable nav mode arming on this autopilot.
   * @param disableBackcourse Whether to disable backcourse support for this autopilot.
   * @param supportFlightDirector Whether to support a flight director independent from the autopilot state.
   * @param maxBankAngle The max bank angle
   */
  constructor(
    private readonly bus: EventBus,
    private readonly gpsSteerCommand: Accessible<Readonly<APGpsSteerDirectorSteerCommand>>,
    private readonly glidepathGuidance: Accessible<Readonly<GarminVNavGlidepathGuidance>>,
    private readonly navToNavGuidance: GarminNavToNavManager2Guidance,
    disableNavModeArming?: boolean,
    disableBackcourse?: boolean,
    supportFlightDirector?: boolean,
    maxBankAngle?: number
  ) {
    const defaultRollMode = SimVar.GetSimVarValue('AUTOPILOT DEFAULT ROLL MODE', SimVarValueType.Number) as number;
    const defaultPitchMode = SimVar.GetSimVarValue('AUTOPILOT DEFAULT PITCH MODE', SimVarValueType.Number) as number;
    this.disableNavModeArming = disableNavModeArming ?? false;
    this.disableBackcourse = disableBackcourse ?? false;
    this.supportFlightDirector = supportFlightDirector ?? false;
    this.maxBankAngle = maxBankAngle ?? this.maxBankAngle;

    switch (defaultRollMode) {
      case 1:
        this.defaultLateralMode = APLateralModes.LEVEL;
        break;
      case 2:
        this.defaultLateralMode = APLateralModes.HEADING;
        break;
      case 3:
        this.defaultLateralMode = APLateralModes.ROLL;
        break;
      default:
        this.defaultLateralMode = APLateralModes.NONE;
    }

    switch (defaultPitchMode) {
      case 1:
        this.defaultVerticalMode = APVerticalModes.PITCH;
        break;
      case 2:
        this.defaultVerticalMode = APVerticalModes.ALT;
        break;
      case 3:
        this.defaultVerticalMode = APVerticalModes.VS;
        break;
      default:
        this.defaultVerticalMode = APVerticalModes.NONE;
    }
  }

  /** @inheritDoc */
  public createLateralDirectors(apValues: APValues): Iterable<Readonly<APConfigDirectorEntry>> {
    return [
      { mode: APLateralModes.HEADING, director: this.createHeadingDirector(apValues) },
      { mode: APLateralModes.ROLL, director: this.createRollDirector(apValues) },
      { mode: APLateralModes.LEVEL, director: this.createWingLevelerDirector(apValues) },
      { mode: APLateralModes.GPSS, director: this.createGpssDirector(apValues) },
      { mode: APLateralModes.VOR, director: this.createVorDirector(apValues) },
      { mode: APLateralModes.LOC, director: this.createLocDirector(apValues) },
      { mode: APLateralModes.BC, director: this.createBcDirector(apValues) },
    ].filter(entry => entry.director !== undefined) as Iterable<Readonly<APConfigDirectorEntry>>;
  }

  /** @inheritDoc */
  public createVerticalDirectors(apValues: APValues): Iterable<Readonly<APConfigDirectorEntry>> {
    return [
      { mode: APVerticalModes.PITCH, director: this.createPitchDirector(apValues) },
      { mode: APVerticalModes.VS, director: this.createVsDirector(apValues) },
      { mode: APVerticalModes.FLC, director: this.createFlcDirector(apValues) },
      { mode: APVerticalModes.ALT, director: this.createAltHoldDirector(apValues) },
      { mode: APVerticalModes.CAP, director: this.createAltCapDirector(apValues) },
      { mode: APVerticalModes.GP, director: this.createGpDirector(apValues) },
      { mode: APVerticalModes.GS, director: this.createGsDirector(apValues) },
    ].filter(entry => entry.director !== undefined) as Iterable<Readonly<APConfigDirectorEntry>>;
  }

  /**
   * Creates the autopilot's heading mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's heading mode director, or `undefined` to omit the director.
   */
  protected createHeadingDirector(apValues: APValues): APHdgDirector {
    return new APHdgDirector(this.bus, apValues);
  }

  /**
   * Creates the autopilot's roll mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's roll mode director, or `undefined` to omit the director.
   */
  protected createRollDirector(apValues: APValues): APRollDirector {
    return new APRollDirector(apValues, { minBankAngle: 6, maxBankAngle: 22 });
  }

  /**
   * Creates the autopilot's wing level mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's wing level mode director, or `undefined` to omit the director.
   */
  protected createWingLevelerDirector(apValues: APValues): APLvlDirector {
    return new APLvlDirector(apValues);
  }

  /**
   * Creates the autopilot's GPSS mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's GPSS mode director, or `undefined` to omit the director.
   */
  protected createGpssDirector(apValues: APValues): APGpsSteerDirector {
    return new APGpsSteerDirector(
      apValues,
      this.gpsSteerCommand,
      {
        maxBankAngle: this.maxBankAngle,
        canActivate: this.disableNavModeArming
          ? () => true
          : GarminAPUtils.gpssCanActivate
      }
    );
  }

  /**
   * Creates the autopilot's VOR mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's VOR mode director, or `undefined` to omit the director.
   */
  protected createVorDirector(apValues: APValues): APNavDirector {
    return new APNavDirector(this.bus, apValues, APLateralModes.VOR, { lateralInterceptCurve: this.navInterceptCurve.bind(this), disableArming: true });
  }

  /**
   * Creates the autopilot's localizer mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's localizer mode director, or `undefined` to omit the director.
   */
  protected createLocDirector(apValues: APValues): APNavDirector {
    return new APNavDirector(this.bus, apValues, APLateralModes.LOC, { lateralInterceptCurve: this.navInterceptCurve.bind(this) });
  }

  /**
   * Creates the autopilot's localizer backcourse mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's localizer backcourse mode director, or `undefined` to omit the director.
   */
  protected createBcDirector(apValues: APValues): APBackCourseDirector | undefined {
    if (this.disableBackcourse) {
      return undefined;
    } else {
      return new APBackCourseDirector(this.bus, apValues, {
        lateralInterceptCurve: (distanceToSource: number, deflection: number, xtk: number, tas: number) => this.localizerInterceptCurve(xtk, tas)
      });
    }
  }

  /**
   * Creates the autopilot's pitch level mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's pitch level mode director, or `undefined` to omit the director.
   */
  protected createPitchDirector(apValues: APValues): APPitchDirector {
    return new APPitchDirector(this.bus, apValues);
  }

  /**
   * Creates the autopilot's vertical speed mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's vertical speed mode director, or `undefined` to omit the director.
   */
  protected createVsDirector(apValues: APValues): APVSDirector {
    return new APVSDirector(apValues);
  }

  /**
   * Creates the autopilot's flight level change mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's flight level change mode director, or `undefined` to omit the director.
   */
  protected createFlcDirector(apValues: APValues): APFLCDirector {
    return new APFLCDirector(apValues);
  }

  /**
   * Creates the autopilot's altitude hold mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's altitude hold mode director, or `undefined` to omit the director.
   */
  protected createAltHoldDirector(apValues: APValues): APAltDirector {
    return new APAltDirector(apValues);
  }

  /**
   * Creates the autopilot's altitude capture mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's altitude capture mode director, or `undefined` to omit the director.
   */
  protected createAltCapDirector(apValues: APValues): APAltCapDirector {
    return new APAltCapDirector(apValues);
  }

  /**
   * Creates the autopilot's glidepath mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's glidepath mode director, or `undefined` to omit the director.
   */
  protected createGpDirector(apValues: APValues): APGPDirector {
    return new APGPDirector(this.bus, apValues, {
      guidance: this.glidepathGuidance,
      canCapture: () => {
        return apValues.lateralActive.get() === APLateralModes.GPSS && this.glidepathGuidance!.get().canCapture;
      }
    });
  }

  /**
   * Creates the autopilot's glideslope mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's glideslope mode director, or `undefined` to omit the director.
   */
  protected createGsDirector(apValues: APValues): APGSDirector {
    return new APGSDirector(this.bus, apValues);
  }

  /** @inheritdoc */
  public createVNavManager(apValues: APValues): VNavManager | undefined {
    return new GarminVNavManager2(this.bus, apValues, { glidepathGuidance: this.glidepathGuidance });
  }

  /** @inheritdoc */
  public createNavToNavManager(apValues: APValues): GarminNavToNavManager2 {
    return new GarminNavToNavManager2(this.bus, apValues, this.navToNavGuidance);
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
  private navInterceptCurve(distanceToSource: number, deflection: number, xtk: number, tas: number, isLoc?: boolean): number {
    if (isLoc) {
      return this.localizerInterceptCurve(xtk, tas);
    } else {
      return this.defaultInterceptCurve(xtk, tas);
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
  private lnavInterceptCurve(dtk: number, xtk: number, tas: number): number {
    return this.defaultInterceptCurve(xtk, tas);
  }

  /**
   * Calculates intercept angles for localizers.
   * @param xtk The cross-track error of the plane from the desired track, in nautical miles. Positive values indicate
   * indicate that the plane is to the right of the track.
   * @param tas The true airspeed of the plane, in knots.
   * @returns The intercept angle, in degrees, to capture the localizer course.
   */
  private localizerInterceptCurve(xtk: number, tas: number): number {
    const xtkMeters = UnitType.NMILE.convertTo(xtk, UnitType.METER);
    const xtkMetersAbs = Math.abs(xtkMeters);

    if (xtkMetersAbs < 4) {
      return 0;
    } else if (xtkMetersAbs < 250) {
      return NavMath.clamp(Math.abs(xtk * 75), 1, 5);
    }

    const turnRadiusMeters = NavMath.turnRadius(tas, 22.5);
    const interceptAngle = this.calculateTurnBasedInterceptAngle(turnRadiusMeters, xtkMeters);

    return NavMath.clamp(interceptAngle, 0, 20);
  }

  /**
   * Calculates non-localizer intercept angles.
   * @param xtk The cross-track error, in nautical miles. Negative values indicate that the plane is to the left of the
   * desired track.
   * @param tas The true airspeed of the plane, in knots.
   * @returns The intercept angle, in degrees, to capture the desired track.
   */
  private defaultInterceptCurve(xtk: number, tas: number): number {
    const xtkMeters = UnitType.NMILE.convertTo(xtk, UnitType.METER);
    const xtkMetersAbs = Math.abs(xtkMeters);

    if (xtkMetersAbs < 250) {
      return NavMath.clamp(Math.abs(xtk * 75), 0, 5);
    }

    const turnRadiusMeters = NavMath.turnRadius(tas, 22.5);
    const interceptAngle = this.calculateTurnBasedInterceptAngle(turnRadiusMeters, xtkMeters);

    return NavMath.clamp(interceptAngle, 0, 45);
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
  private calculateTurnBasedInterceptAngle(turnRadius: number, xtk: number): number {
    // The following formula is derived by solving for the intercept angle in Euclidean rather than spherical space.
    // The error from this simplification is negligible when turn radius and cross-track are small (less than 1% of
    // earth radius, or ~63km).
    // The Euclidean solution is chosen over the spherical one: asin(sin(xtk) / sqrt(1 - (1 - sin(xtk) * tan(radius))^2))
    // for performance reasons.
    return Math.asin(Math.min(Math.sqrt(Math.abs(xtk) / (2 * turnRadius)), 1)) * Avionics.Utils.RAD2DEG;
  }
}
