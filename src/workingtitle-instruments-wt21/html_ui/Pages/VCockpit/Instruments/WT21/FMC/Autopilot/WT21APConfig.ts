import {
  APAltCapDirector, APAltDirector, APConfig, APFLCDirector, APGPDirector, APGSDirector, APHdgDirector, APLateralModes, APLvlDirector, APNavDirector,
  APPitchDirector, APRollDirector, APValues, APVerticalModes, APVNavPathDirector, APVSDirector, EventBus, FlightPlanner, LNavDirector, MathUtils, NavMath,
  SimVarValueType, SmoothingPathCalculator, UnitType, APTogaPitchDirector, PlaneDirector, APBackCourseDirector
} from '@microsoft/msfs-sdk';

import { MessageService } from '../../Shared/MessageSystem/MessageService';
import { WT21VNavManager } from '../../Shared/Navigation/WT21VNavManager';
import { WT21NavToNavManager } from './WT21NavToNavManager';
import { WT21VariableBankManager } from './WT21VariableBankManager';
import { PerformancePlan } from '../../Shared/Performance/PerformancePlan';
import { WT21Fms } from '../../Shared/FlightPlan/WT21Fms';

/**
 * A WT21 autopilot configuration.
 */
export class WT21APConfig implements APConfig {
  public defaultLateralMode = APLateralModes.ROLL;
  public defaultVerticalMode = APVerticalModes.PITCH;
  public defaultMaxBankAngle = 30;

  /**
   * Instantiates the AP Config for the Autopilot.
   * @param bus is an instance of the Event Bus.
   * @param flightPlanner is an instance of the flight planner.
   * @param messageService The instance of MessageService to use.
   * @param verticalPathCalculator The instance of the vertical path calculator to use for the vnav director.
   * @param activePerformancePlan TThe instance of the active performance plan to use for the vnav director.
   */
  constructor(
    private readonly bus: EventBus,
    private readonly flightPlanner: FlightPlanner,
    private readonly messageService: MessageService,
    private readonly verticalPathCalculator: SmoothingPathCalculator,
    private readonly activePerformancePlan: PerformancePlan,
  ) { }


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
    return new APRollDirector(this.bus, apValues);
  }

  /** @inheritdoc */
  public createWingLevelerDirector(): APLvlDirector {
    return new APLvlDirector(this.bus);
  }

  /** @inheritdoc */
  public createGpssDirector(apValues: APValues): LNavDirector {
    return new LNavDirector(this.bus, apValues, this.flightPlanner, undefined, {
      lateralInterceptCurve: this.lnavInterceptCurve.bind(this),
      hasVectorAnticipation: true,
      minimumActivationAltitude: 401
    });
  }

  /** @inheritdoc */
  public createVorDirector(apValues: APValues): APNavDirector {
    return new APNavDirector(this.bus, apValues, APLateralModes.VOR, { lateralInterceptCurve: this.navInterceptCurve.bind(this) });
  }

  /** @inheritdoc */
  public createLocDirector(apValues: APValues): APNavDirector {
    return new APNavDirector(this.bus, apValues, APLateralModes.LOC, { lateralInterceptCurve: this.navInterceptCurve.bind(this) });
  }

  /** @inheritdoc */
  public createBcDirector(apValues: APValues): APBackCourseDirector {
    return new APBackCourseDirector(this.bus, apValues, APLateralModes.BC, { lateralInterceptCurve: this.navInterceptCurve.bind(this) });
  }

  /** @inheritDoc */
  public createRolloutDirector(): undefined {
    return undefined;
  }

  /** @inheritdoc */
  public createPitchDirector(apValues: APValues): APPitchDirector {
    return new APPitchDirector(this.bus, apValues, 0.5, -20, 25);
  }

  /** @inheritdoc */
  public createVsDirector(apValues: APValues): APVSDirector {
    return new APVSDirector(this.bus, apValues);
  }

  /** @inheritdoc */
  public createFpaDirector(): undefined {
    return undefined;
  }

  /** @inheritdoc */
  public createFlcDirector(apValues: APValues): APFLCDirector {
    return new APFLCDirector(this.bus, apValues, 25);
  }

  /** @inheritdoc */
  public createAltHoldDirector(apValues: APValues): APAltDirector {
    return new APAltDirector(this.bus, apValues);
  }

  /** @inheritdoc */
  public createAltCapDirector(apValues: APValues): APAltCapDirector {
    return new APAltCapDirector(this.bus, apValues, this.captureAltitude.bind(this));
  }

  private vnavManager?: WT21VNavManager;

  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public createVNavManager(apValues: APValues): WT21VNavManager {
    return this.vnavManager ??= new WT21VNavManager(
      this.bus,
      this.flightPlanner,
      this.verticalPathCalculator,
      this.activePerformancePlan,
      this.messageService,
      apValues,
      WT21Fms.PRIMARY_ACT_PLAN_INDEX,
    );
  }

  /** @inheritdoc */
  public createVNavPathDirector(apValues: APValues): APVNavPathDirector | undefined {
    return new APVNavPathDirector(this.bus, apValues);
  }

  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public createNavToNavManager(apValues: APValues): WT21NavToNavManager {
    return new WT21NavToNavManager(this.bus, apValues, this.messageService);
  }

  /** @inheritdoc */
  public createVariableBankManager(apValues: APValues): WT21VariableBankManager {
    return new WT21VariableBankManager(this.bus, apValues);
  }

  /** @inheritdoc */
  public createToVerticalDirector(): APTogaPitchDirector {
    //TODO: This value should be read in from the systems.cfg 'pitch_takeoff_ga' value
    return new APTogaPitchDirector(10);
  }


  /** @inheritdoc */
  public createGaVerticalDirector(): APTogaPitchDirector {
    return new APTogaPitchDirector(8);
  }

  /** @inheritdoc */
  public createToLateralDirector(apValues: APValues): PlaneDirector | undefined {
    return new APHdgDirector(this.bus, apValues, { isToGaMode: true });
  }

  /** @inheritdoc */
  public createGaLateralDirector(apValues: APValues): PlaneDirector | undefined {
    return new APHdgDirector(this.bus, apValues, { isToGaMode: true });
  }


  /**
   * Calculates intercept angles for radio nav.
   * @param distanceToSource The distance from the plane to the source of the navigation signal, in nautical miles.
   * @param deflection The lateral deflection of the desired track relative to the plane, normalized from `-1` to `1`.
   * Negative values indicate that the desired track is to the left of the plane.
   * @param tas The true airspeed of the plane, in knots.
   * @param isLoc Whether the source of the navigation signal is a localizer. Defaults to `false`.
   * @returns The intercept angle, in degrees, to capture the desired track from the navigation signal.
   */
  private navInterceptCurve(distanceToSource: number, deflection: number, tas: number, isLoc?: boolean): number {
    if (isLoc) {
      return this.localizerInterceptCurve(distanceToSource, deflection, tas);
    } else {
      // max deflection is 2.5 degrees or 0.0436332 radians
      const fullScaleDeflectionInRadians = 0.0436332;
      return this.defaultInterceptCurve(Math.sin(fullScaleDeflectionInRadians * -deflection) * distanceToSource, tas);
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
   * @param distanceToSource The distance from the plane to the localizer, in nautical miles.
   * @param deflection The lateral deflection of the desired track relative to the plane, normalized from `-1` to `1`.
   * Negative values indicate that the desired track is to the left of the plane.
   * @param tas The true airspeed of the plane, in knots.
   * @returns The intercept angle, in degrees, to capture the localizer course.
   */
  private localizerInterceptCurve(distanceToSource: number, deflection: number, tas: number): number {
    // max deflection is 2.5 degrees or 0.0436332 radians
    const fullScaleDeflectionInRadians = 0.0436332;

    const xtkNM = Math.sin(fullScaleDeflectionInRadians * -deflection) * distanceToSource;
    const xtkMeters = UnitType.NMILE.convertTo(xtkNM, UnitType.METER);
    const xtkMetersAbs = Math.abs(xtkMeters);

    if (Math.abs(deflection) < .02 || xtkMetersAbs < 4) {
      return 0;
    } else if (xtkMetersAbs < 200) {
      return NavMath.clamp(Math.abs(xtkNM * 75), 1, 5);
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

  /**
   * Method to use for capturing a target altitude.
   * @param targetAltitude is the captured targed altitude
   * @param indicatedAltitude is the current indicated altitude
   * @param initialFpa is the FPA when capture was initiatiated
   * @returns The target pitch value to set.
   */
  private captureAltitude(targetAltitude: number, indicatedAltitude: number, initialFpa: number): number {
    const altCapDeviation = indicatedAltitude - targetAltitude;
    const altCapPitchPercentage = Math.min(Math.abs(altCapDeviation) / 300, 1);
    const desiredPitch = (initialFpa * altCapPitchPercentage);
    const aoa = SimVar.GetSimVarValue('INCIDENCE ALPHA', SimVarValueType.Degree);
    return aoa + MathUtils.clamp(desiredPitch, -6, 6);
  }
}
