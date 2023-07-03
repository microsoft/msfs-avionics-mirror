import {
  APAltCapDirector, APAltDirector, APBackCourseDirector, APConfig, APFLCDirector, APGPDirector, APGSDirector, APHdgDirector, APLateralModes, APLvlDirector,
  APNavDirector, APPitchDirector, APRollDirector, APTogaPitchDirector, APValues, APVerticalModes, APVNavPathDirector, APVSDirector, EventBus,
  FlightPlanner, LNavDirector, LNavDirectorOptions, NavMath, PlaneDirector, UnitType, VNavManager, VNavPathCalculator
} from '@microsoft/msfs-sdk';

import { GarminObsDirector } from './directors';
import { GarminNavToNavManager } from './GarminNavToNavManager';
import { GarminVNavGuidanceOptions, GarminVNavManager2 } from './GarminVNavManager2';
import { AutopilotDriverOptions } from '@microsoft/msfs-sdk/autopilot/AutopilotDriver';

/**
 * Options for configuring a Garmin LNAV director.
 */
export type GarminLNavDirectorOptions = Pick<LNavDirectorOptions, 'disableArming'>;

/**
 * Options for configuring Garmin autopilot directors.
 */
export type GarminAPConfigDirectorOptions = {
  /** The default rate at which commanded pitch changes, in degrees per second. Defaults to `5`. */
  defaultPitchRate?: number;

  /** The default rate at which commanded bank changes, in degrees per second. Defaults to `10`. */
  defaultBankRate?: number;

  /** Options for the LNAV director. */
  lnavOptions?: Partial<Readonly<GarminLNavDirectorOptions>>;

  /** Options for the VNAV director. */
  vnavOptions?: Partial<Readonly<GarminVNavGuidanceOptions>>;

  /** The minimum bank angle, in degrees, supported by the ROL director. Defaults to `6`. */
  rollMinBankAngle?: number;

  /** The maximum bank angle, in degrees, supported by the ROL director. Defaults to `25`. */
  rollMaxBankAngle?: number;

  /** The maximum bank angle, in degrees, supported by the HDG director. Defaults to `25`. */
  hdgMaxBankAngle?: number;

  /** The maximum bank angle, in degrees, supported by the VOR director. Defaults to `25`. */
  vorMaxBankAngle?: number;

  /** The maximum bank angle, in degrees, supported by the LOC director. Defaults to `25`. */
  locMaxBankAngle?: number;

  /** The maximum bank angle, in degrees, supported by the LNAV director. Defaults to `25`. */
  lnavMaxBankAngle?: number;

  /**
   * The maximum bank angle, in degrees, to apply to the HDG, VOR, LOC, and LNAV directors while in Low Bank Mode.
   * Defaults to `15`.
   */
  lowBankAngle?: number;

  /**
   * The threshold difference between selected heading and current heading, in degrees, at which the heading director
   * unlocks its commanded turn direction and chooses a new optimal turn direction to establish on the selected
   * heading, potentially resulting in a turn reversal. Any value less than or equal to 180 degrees effectively
   * prevents the director from locking a commanded turn direction. Any value greater than or equal to 360 degrees will
   * require the selected heading to traverse past the current heading in the desired turn direction in order for the
   * director to issue a turn reversal. Defaults to `331`.
   */
  hdgTurnReversalThreshold?: number;
};

/**
 * A Garmin Autopilot Configuration.
 */
export class GarminAPConfig implements APConfig {
  /** The default commanded pitch angle rate, in degrees per second. */
  public static readonly DEFAULT_PITCH_RATE = 5;

  /** The default commanded bank angle rate, in degrees per second. */
  public static readonly DEFAULT_BANK_RATE = 10;

  /** The default minimum bank angle, in degrees, for ROL director. */
  public static readonly DEFAULT_ROLL_MIN_BANK_ANGLE = 6;

  /** The default maximum bank angle, in degrees, for ROL, HDG, NAV, and LNAV directors. */
  public static readonly DEFAULT_MAX_BANK_ANGLE = 25;

  /** The default maximum bank angle, in degrees, in Low Bank Mode. */
  public static readonly DEFAULT_LOW_BANK_ANGLE = 15;

  /** The default HDG director turn direction unlock threshold, in degrees. */
  public static readonly DEFAULT_HDG_DIRECTION_UNLOCK_THRESHOLD = 331;

  public defaultLateralMode = APLateralModes.ROLL;
  public defaultVerticalMode = APVerticalModes.PITCH;
  public defaultMaxBankAngle = GarminAPConfig.DEFAULT_MAX_BANK_ANGLE;

  public autopilotDriverOptions: AutopilotDriverOptions;

  /** Options for the LNAV director. */
  private readonly lnavOptions: Partial<Readonly<GarminLNavDirectorOptions>>;

  /** Options for the VNAV director. */
  private readonly vnavOptions: Partial<Readonly<GarminVNavGuidanceOptions>>;

  private readonly rollMinBankAngle: number;
  private readonly rollMaxBankAngle: number;
  private readonly hdgMaxBankAngle: number;
  private readonly vorMaxBankAngle: number;
  private readonly locMaxBankAngle: number;
  private readonly lnavMaxBankAngle: number;
  private readonly lowBankAngle: number;

  private readonly hdgTurnReversalThreshold: number;

  /**
   * Creates a new instance of GarminAPConfig.
   * @param bus The event bus.
   * @param flightPlanner The flight planner.
   * @param verticalPathCalculator The vertical path calculator to use for the VNAV director.
   * @param options Options to configure the directors.
   */
  constructor(
    private readonly bus: EventBus,
    private readonly flightPlanner: FlightPlanner,
    private readonly verticalPathCalculator: VNavPathCalculator,
    options?: Readonly<GarminAPConfigDirectorOptions>
  ) {
    this.autopilotDriverOptions = {
      pitchServoRate: options?.defaultPitchRate ?? GarminAPConfig.DEFAULT_PITCH_RATE,
      bankServoRate: options?.defaultBankRate ?? GarminAPConfig.DEFAULT_BANK_RATE
    };

    this.lnavOptions = { ...options?.lnavOptions };
    this.vnavOptions = { ...options?.vnavOptions };
    this.rollMinBankAngle = options?.rollMinBankAngle ?? GarminAPConfig.DEFAULT_ROLL_MIN_BANK_ANGLE;
    this.rollMaxBankAngle = options?.rollMaxBankAngle ?? GarminAPConfig.DEFAULT_MAX_BANK_ANGLE;
    this.hdgMaxBankAngle = options?.hdgMaxBankAngle ?? GarminAPConfig.DEFAULT_MAX_BANK_ANGLE;
    this.vorMaxBankAngle = options?.vorMaxBankAngle ?? GarminAPConfig.DEFAULT_MAX_BANK_ANGLE;
    this.locMaxBankAngle = options?.locMaxBankAngle ?? GarminAPConfig.DEFAULT_MAX_BANK_ANGLE;
    this.lnavMaxBankAngle = options?.lnavMaxBankAngle ?? GarminAPConfig.DEFAULT_MAX_BANK_ANGLE;
    this.lowBankAngle = options?.lowBankAngle ?? GarminAPConfig.DEFAULT_LOW_BANK_ANGLE;
    this.hdgTurnReversalThreshold = options?.hdgTurnReversalThreshold ?? GarminAPConfig.DEFAULT_HDG_DIRECTION_UNLOCK_THRESHOLD;
  }

  /** @inheritdoc */
  public createVariableBankManager(): undefined {
    return undefined;
  }

  /** @inheritdoc */
  public createHeadingDirector(apValues: APValues): APHdgDirector {
    return new APHdgDirector(this.bus, apValues, {
      maxBankAngle: () => apValues.maxBankId.get() === 1 ? Math.min(this.hdgMaxBankAngle, this.lowBankAngle) : this.hdgMaxBankAngle,
      turnReversalThreshold: this.hdgTurnReversalThreshold
    });
  }

  /** @inheritdoc */
  createHeadingHoldDirector(): undefined {
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
    return new APRollDirector(apValues, { minBankAngle: this.rollMinBankAngle, maxBankAngle: this.rollMaxBankAngle });
  }

  /** @inheritdoc */
  public createWingLevelerDirector(apValues: APValues): APLvlDirector {
    return new APLvlDirector(this.bus, apValues);
  }

  /** @inheritdoc */
  public createGpssDirector(apValues: APValues): LNavDirector {
    const maxBankAngle = (): number => apValues.maxBankId.get() === 1 ? Math.min(this.lnavMaxBankAngle, this.lowBankAngle) : this.lnavMaxBankAngle;

    return new LNavDirector(
      this.bus,
      apValues,
      this.flightPlanner,
      new GarminObsDirector(this.bus, apValues, {
        maxBankAngle,
        lateralInterceptCurve: GarminAPConfig.lnavInterceptCurve,
      }),
      {
        maxBankAngle,
        lateralInterceptCurve: GarminAPConfig.lnavInterceptCurve,
        hasVectorAnticipation: true,
        ...this.lnavOptions
      }
    );
  }

  /** @inheritdoc */
  public createVorDirector(apValues: APValues): APNavDirector {
    return new APNavDirector(this.bus, apValues, APLateralModes.VOR, {
      maxBankAngle: () => apValues.maxBankId.get() === 1 ? Math.min(this.vorMaxBankAngle, this.lowBankAngle) : this.vorMaxBankAngle,
      lateralInterceptCurve: GarminAPConfig.navInterceptCurve
    });
  }

  /** @inheritdoc */
  public createLocDirector(apValues: APValues): APNavDirector {
    return new APNavDirector(this.bus, apValues, APLateralModes.LOC, {
      maxBankAngle: () => apValues.maxBankId.get() === 1 ? Math.min(this.locMaxBankAngle, this.lowBankAngle) : this.locMaxBankAngle,
      lateralInterceptCurve: GarminAPConfig.navInterceptCurve
    });
  }

  /** @inheritdoc */
  public createBcDirector(apValues: APValues): APBackCourseDirector {
    return new APBackCourseDirector(this.bus, apValues, {
      maxBankAngle: () => apValues.maxBankId.get() === 1 ? Math.min(this.locMaxBankAngle, this.lowBankAngle) : this.locMaxBankAngle,
      lateralInterceptCurve: GarminAPConfig.navInterceptCurve
    });
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

  /** @inheritdoc */
  public createVNavManager(apValues: APValues): VNavManager {
    return new GarminVNavManager2(this.bus, this.flightPlanner, this.verticalPathCalculator, apValues, 0, this.vnavOptions);
  }

  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public createVNavPathDirector(apValues: APValues): PlaneDirector | undefined {
    return new APVNavPathDirector(this.bus);
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
    //TODO: This value should be read in from the systems.cfg 'pitch_takeoff_ga' value

    return new APTogaPitchDirector(10);
  }

  /** @inheritdoc */
  public createGaVerticalDirector(): PlaneDirector | undefined {
    return new APTogaPitchDirector(7.5);
  }

  /** @inheritdoc */
  public createToLateralDirector(apValues: APValues): PlaneDirector | undefined {
    return new APLvlDirector(this.bus, apValues, { isToGaMode: true });
  }

  /** @inheritdoc */
  public createGaLateralDirector(apValues: APValues): PlaneDirector | undefined {
    return new APLvlDirector(this.bus, apValues, { isToGaMode: true });
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
  private static navInterceptCurve(distanceToSource: number, deflection: number, xtk: number, tas: number, isLoc?: boolean): number {
    if (isLoc) {
      return GarminAPConfig.localizerInterceptCurve(xtk, tas);
    } else {
      return GarminAPConfig.defaultInterceptCurve(xtk, tas);
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
  private static lnavInterceptCurve(dtk: number, xtk: number, tas: number): number {
    return GarminAPConfig.defaultInterceptCurve(xtk, tas);
  }

  /**
   * Calculates intercept angles for localizers.
   * @param xtk The cross-track error of the plane from the desired track, in nautical miles. Positive values indicate
   * indicate that the plane is to the right of the track.
   * @param tas The true airspeed of the plane, in knots.
   * @returns The intercept angle, in degrees, to capture the localizer course.
   */
  private static localizerInterceptCurve(xtk: number, tas: number): number {
    const xtkMeters = UnitType.NMILE.convertTo(xtk, UnitType.METER);
    const xtkMetersAbs = Math.abs(xtkMeters);

    if (xtkMetersAbs < 4) {
      return 0;
    } else if (xtkMetersAbs < 250) {
      return NavMath.clamp(Math.abs(xtk * 75), 1, 5);
    }

    const turnRadiusMeters = NavMath.turnRadius(tas, 22.5);
    const interceptAngle = GarminAPConfig.calculateTurnBasedInterceptAngle(turnRadiusMeters, xtkMeters);

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
      return NavMath.clamp(Math.abs(xtk * 75), 0, 5);
    }

    const turnRadiusMeters = NavMath.turnRadius(tas, 22.5);
    const interceptAngle = GarminAPConfig.calculateTurnBasedInterceptAngle(turnRadiusMeters, xtkMeters);

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
  private static calculateTurnBasedInterceptAngle(turnRadius: number, xtk: number): number {
    return UnitType.RADIAN.convertTo(Math.acos(NavMath.clamp((turnRadius - Math.abs(xtk)) / turnRadius, -1, 1)), UnitType.DEGREE) / 2;
  }
}
