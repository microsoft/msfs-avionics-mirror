import {
  APAltCapDirector, APAltDirector, APBackCourseDirector, APConfig, APFLCDirector, APGPDirector, APGSDirector, APHdgDirector, APLateralModes, APLvlDirector, APNavDirector,
  APPitchDirector, APRollDirector, APValues, APVerticalModes, APVSDirector, ConsumerSubject, EventBus,
  FlightPlanner, GPSSatComputerEvents, GPSSystemState, LNavDirector, NavMath, PlaneDirector, SimVarValueType, UnitType, VNavManager
} from '@microsoft/msfs-sdk';

import { GarminNavToNavManager, GarminObsDirector } from '@microsoft/msfs-garminsdk';

import { GNSVNavManager } from './GNSVNavManager';

/**
 * A GNS Autopilot Configuration.
 */
export class GNSAPConfig implements APConfig {
  public defaultLateralMode = APLateralModes.ROLL;
  public defaultVerticalMode = APVerticalModes.PITCH;
  public defaultMaxBankAngle = 27.5;
  private disableNavModeArming = false;
  private disableBackcourse = false;
  public supportFlightDirector = false;

  /**
   * Instantiates the AP Config for the Autopilot.
   * @param bus is an instance of the Event Bus.
   * @param flightPlanner is an instance of the flight planner.
   * @param disableNavModeArming Whether to disable nav mode arming on this autopilot.
   * @param disableBackcourse Whether to disable backcourse support for this autopilot.
   * @param supportFlightDirector Whether to support a flight director independent from the autopilot state.
   */
  constructor(
    private readonly bus: EventBus,
    private readonly flightPlanner: FlightPlanner,
    disableNavModeArming?: boolean,
    disableBackcourse?: boolean,
    supportFlightDirector?: boolean) {
    const defaultRollMode = SimVar.GetSimVarValue('AUTOPILOT DEFAULT ROLL MODE', SimVarValueType.Number) as number;
    const defaultPitchMode = SimVar.GetSimVarValue('AUTOPILOT DEFAULT PITCH MODE', SimVarValueType.Number) as number;
    this.disableNavModeArming = disableNavModeArming ?? false;
    this.disableBackcourse = disableBackcourse ?? false;
    this.supportFlightDirector = supportFlightDirector ?? false;

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
  createVariableBankManager(): Record<any, any> | undefined {
    return undefined;
  }


  /** @inheritdoc */
  public createHeadingDirector(apValues: APValues): APHdgDirector {
    return new APHdgDirector(this.bus, apValues);
  }

  /** @inheritdoc */
  public createHeadingHoldDirector(): undefined {
    return undefined;
  }

  /** @inheritdoc */
  createTrackDirector(): undefined {
    return undefined;
  }

  /** @inheritdoc */
  createTrackHoldDirector(): undefined {
    return undefined;
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
  public createGpssDirector(apValues: APValues): LNavDirector {
    return new LNavDirector(
      this.bus,
      apValues,
      this.flightPlanner,
      new GarminObsDirector(this.bus, apValues),
      {
        lateralInterceptCurve: this.lnavInterceptCurve.bind(this),
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
      return new APBackCourseDirector(this.bus, apValues, { lateralInterceptCurve: this.navInterceptCurve.bind(this) });
    }
  }

  /** @inheritDoc */
  public createRolloutDirector(): undefined {
    return undefined;
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
  public createFpaDirector(): undefined {
    return undefined;
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

  private vnavManager?: VNavManager;

  /** @inheritdoc */
  public createVNavManager(apValues: APValues): VNavManager | undefined {
    return new GNSVNavManager(this.bus, this.flightPlanner, apValues, 0, {
      allowApproachBaroVNav: false,
      allowPlusVWithoutSbas: false,
      enableAdvancedVNav: false,
      gpsSystemState: ConsumerSubject.create(this.bus.getSubscriber<GPSSatComputerEvents>().on('gps_system_state_changed_1'), GPSSystemState.Searching)
    });
  }

  /** @inheritdoc */
  public createVNavPathDirector(): PlaneDirector | undefined {
    return undefined;
  }

  /** @inheritdoc */
  public createGpDirector(apValues: APValues): APGPDirector {
    return new APGPDirector(this.bus, apValues);
  }

  /** @inheritdoc */
  public createGsDirector(apValues: APValues): APGSDirector {
    return new APGSDirector(this.bus, apValues);
  }

  /** @inheritdoc */
  public createFlareDirector(): undefined {
    return undefined;
  }

  /** @inheritdoc */
  public createToVerticalDirector(): PlaneDirector | undefined {
    return undefined;
  }

  /** @inheritdoc */
  public createGaVerticalDirector(): PlaneDirector | undefined {
    return undefined;
  }

  /** @inheritdoc */
  public createToLateralDirector(): PlaneDirector | undefined {
    return undefined;
  }

  /** @inheritdoc */
  public createGaLateralDirector(): PlaneDirector | undefined {
    return undefined;
  }

  /** @inheritdoc */
  public createFmsLocLateralDirector(): undefined {
    return undefined;
  }

  /** @inheritdoc */
  public createNavToNavManager(apValues: APValues): GarminNavToNavManager {
    return new GarminNavToNavManager(this.bus, this.flightPlanner, apValues);
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
    return UnitType.RADIAN.convertTo(Math.acos(NavMath.clamp((turnRadius - Math.abs(xtk)) / turnRadius, -1, 1)), UnitType.DEGREE) / 2;
  }
}
