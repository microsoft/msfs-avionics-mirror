import {
  Accessible, APAltCapDirector, APAltDirector, APBackCourseDirector, APConfig, APFLCDirector, APGPDirector, APGpsSteerDirector, APGpsSteerDirectorSteerCommand,
  APGSDirector, APHdgDirector, APLateralModes, APLvlDirector, APNavDirector, APPitchDirector, APRollDirector, APValues, APVerticalModes, APVSDirector,
  EventBus, NavMath, SimVarValueType, UnitType, VNavManager
} from '@microsoft/msfs-sdk';

import { GarminNavToNavManager2, GarminNavToNavManager2Guidance, GarminVNavGlidepathGuidance, GarminVNavManager2 } from '@microsoft/msfs-garminsdk';

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

  /** @inheritdoc */
  public createHeadingDirector(apValues: APValues): APHdgDirector {
    return new APHdgDirector(this.bus, apValues);
  }

  /** @inheritdoc */
  public createRollDirector(apValues: APValues): APRollDirector {
    return new APRollDirector(apValues, { minBankAngle: 6, maxBankAngle: 22 });
  }

  /** @inheritdoc */
  public createWingLevelerDirector(apValues: APValues): APLvlDirector {
    return new APLvlDirector(this.bus, apValues);
  }

  /** @inheritdoc */
  public createGpssDirector(apValues: APValues): APGpsSteerDirector {
    return new APGpsSteerDirector(
      this.bus,
      apValues,
      this.gpsSteerCommand,
      {
        maxBankAngle: this.maxBankAngle,
        canActivate: state => Math.abs(state.xtk) < 0.6 && Math.abs(state.tae) < 110,
        disableArming: this.disableNavModeArming
      }
    );
  }

  /** @inheritdoc */
  public createVorDirector(apValues: APValues): APNavDirector {
    return new APNavDirector(this.bus, apValues, APLateralModes.VOR, { lateralInterceptCurve: this.navInterceptCurve.bind(this), disableArming: true });
  }

  /** @inheritdoc */
  public createLocDirector(apValues: APValues): APNavDirector {
    return new APNavDirector(this.bus, apValues, APLateralModes.LOC, { lateralInterceptCurve: this.navInterceptCurve.bind(this) });
  }

  /** @inheritdoc */
  public createBcDirector(apValues: APValues): APBackCourseDirector | undefined {
    if (this.disableBackcourse) {
      return undefined;
    } else {
      return new APBackCourseDirector(this.bus, apValues, {
        lateralInterceptCurve: (distanceToSource: number, deflection: number, xtk: number, tas: number) => this.localizerInterceptCurve(xtk, tas)
      });
    }
  }

  /** @inheritdoc */
  public createPitchDirector(apValues: APValues): APPitchDirector {
    return new APPitchDirector(this.bus, apValues);
  }

  /** @inheritdoc */
  public createVsDirector(apValues: APValues): APVSDirector {
    return new APVSDirector(apValues);
  }

  /** @inheritdoc */
  public createFlcDirector(apValues: APValues): APFLCDirector {
    return new APFLCDirector(apValues);
  }

  /** @inheritdoc */
  public createAltHoldDirector(apValues: APValues): APAltDirector {
    return new APAltDirector(apValues);
  }

  /** @inheritdoc */
  public createAltCapDirector(apValues: APValues): APAltCapDirector {
    return new APAltCapDirector(apValues);
  }

  /** @inheritdoc */
  public createVNavManager(apValues: APValues): VNavManager | undefined {
    return new GarminVNavManager2(this.bus, apValues, undefined, this.glidepathGuidance);
  }

  /** @inheritdoc */
  public createGpDirector(apValues: APValues): APGPDirector {
    return new APGPDirector(this.bus, apValues, {
      guidance: this.glidepathGuidance,
      canCapture: () => {
        return apValues.lateralActive.get() === APLateralModes.GPSS && this.glidepathGuidance!.get().canCapture;
      }
    });
  }

  /** @inheritdoc */
  public createGsDirector(apValues: APValues): APGSDirector {
    return new APGSDirector(this.bus, apValues);
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
