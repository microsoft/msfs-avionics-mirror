/// <reference types="@microsoft/msfs-types/js/simvar" />

import { ConsumerValue } from '../../data/ConsumerValue';
import { EventBus } from '../../data/EventBus';
import { SimVarValueType } from '../../data/SimVars';
import { GeoPoint } from '../../geo/GeoPoint';
import { NavRadioEvents } from '../../instruments/APRadioNavInstrument';
import { GNSSEvents } from '../../instruments/GNSS';
import { Glideslope, NavSourceType } from '../../instruments/NavProcessor';
import { NavRadioIndex } from '../../instruments/RadioCommon';
import { MathUtils } from '../../math/MathUtils';
import { UnitType } from '../../math/NumberUnit';
import { Subscription } from '../../sub/Subscription';
import { APLateralModes, APValues } from '../APConfig';
import { VNavVars } from '../data/VNavEvents';
import { ApproachGuidanceMode } from '../VerticalNavigation';
import { DirectorState, PlaneDirector } from './PlaneDirector';

/**
 * A function which calculates a desired angle closure rate, in degrees per second, to track a glideslope. The angle
 * closure rate is the rate of reduction of glideslope angle error. Positive values reduce glideslope angle error while
 * negative values increase glideslope angle error.
 * @param gsAngleError The glideslope angle error, in degrees, defined as the difference between the angle from the
 * glideslope antenna to the airplane and the glideslope angle. Positive values indicate deviation of the airplane
 * above the glideslope.
 * @param gsAngle The glideslope angle, in degrees.
 * @param currentAngleRate The current rate of change of glideslope angle error, in degrees per second.
 * @param distance The lateral distance from the airplane to the glideslope antenna, in meters.
 * @param height The height of the airplane above the glideslope antenna, in meters.
 * @param groundSpeed The airplane's current ground speed, in meters per second.
 * @param vs The airplane's current vertical speed, in meters per second.
 * @returns The desired angle closure rate, in degrees per second, toward the glideslope.
 */
export type APGSDirectorAngleClosureRateFunc = (
  gsAngleError: number,
  gsAngle: number,
  currentAngleRate: number,
  distance: number,
  height: number,
  groundSpeed: number,
  vs: number
) => number;

/**
 * A function which calculates a desired vertical speed to target, in feet per minute, to track a glideslope.
 * @param gsAngleError The glideslope angle error, in degrees, defined as the difference between the angle from the
 * glideslope antenna to the airplane and the glideslope angle. Positive values indicate deviation of the airplane
 * above the glideslope.
 * @param gsAngle The glideslope angle, in degrees.
 * @param currentAngleRate The current rate of change of glideslope angle error, in degrees per second.
 * @param distance The lateral distance from the airplane to the glideslope antenna, in meters.
 * @param height The height of the airplane above the glideslope antenna, in meters.
 * @param groundSpeed The airplane's current ground speed, in meters per second.
 * @param vs The airplane's current vertical speed, in meters per second.
 * @returns The desired vertical speed to target, in feet per minute.
 */
export type APGSDirectorVsTargetFunc = (
  gsAngleError: number,
  gsAngle: number,
  currentAngleRate: number,
  distance: number,
  height: number,
  groundSpeed: number,
  vs: number
) => number;

/**
 * Options for {@link APGSDirector}.
 */
export type APGSDirectorOptions = {
  /**
   * The index of the nav radio to force the director to use. If not defined, the director will use the nav radio
   * specified by the active autopilot navigation source.
   */
  forceNavSource?: NavRadioIndex;

  /**
   * A function which returns the desired angle closure rate to track a glideslope. The angle closure rate is the rate
   * of reduction of glideslope angle error. If not defined, the director will use a default angle closure rate curve.
   * The output of this function will be overridden by the `vsTarget` function if the latter is defined.
   */
  angleClosureRate?: APGSDirectorAngleClosureRateFunc;

  /**
   * A function which returns the desired vertical speed target to track a glideslope. If defined, the output of this
   * function will override that of the `angleClosureRate` function.
   */
  vsTarget?: APGSDirectorVsTargetFunc;

  /** The minimum vertical speed the director can target, in feet per minute. Defaults to `-3000`. */
  minVs?: number;

  /** The maximum vertical speed the director can target, in feet per minute. Defaults to `0`. */
  maxVs?: number;
};

/**
 * A glideslope autopilot director.
 */
export class APGSDirector implements PlaneDirector {

  public state: DirectorState;

  /** @inheritdoc */
  public onActivate?: () => void;

  /** @inheritdoc */
  public onArm?: () => void;

  /** @inheritdoc */
  public drivePitch?: (pitch: number, adjustForAoa?: boolean, adjustForVerticalWind?: boolean) => void;

  private readonly sub = this.bus.getSubscriber<GNSSEvents & NavRadioEvents>();

  private readonly glideslope = ConsumerValue.create<Glideslope>(null, { isValid: false, deviation: 0, gsAngle: 0, source: { index: 0, type: NavSourceType.Nav } });

  private navLocation = new GeoPoint(NaN, NaN);
  private readonly navLocationSub: Subscription;

  private readonly angleClosureRateFunc: APGSDirectorAngleClosureRateFunc;
  private readonly vsTargetFunc?: APGSDirectorVsTargetFunc;

  private readonly minVs: number;
  private readonly maxVs: number;

  /**
   * Creates an instance of the LateralDirector.
   * @param bus The event bus to use with this instance.
   * @param apValues is the APValues object from the Autopilot.
   * @param options APGSDirector options.
   */
  constructor(private readonly bus: EventBus, private readonly apValues: APValues, options?: Readonly<APGSDirectorOptions>) {
    this.state = DirectorState.Inactive;

    if (options?.forceNavSource) {
      this.navLocationSub = this.sub.on(`nav_radio_gs_location_${options.forceNavSource}`).handle(lla => this.navLocation.set(lla.lat, lla.long));
      this.glideslope.setConsumer(this.sub.on(`nav_radio_glideslope_${options.forceNavSource}`));
    } else {
      this.navLocationSub = this.sub.on('nav_radio_active_gs_location').handle(lla => this.navLocation.set(lla.lat, lla.long));
      this.glideslope.setConsumer(this.sub.on('nav_radio_active_glideslope'));
    }

    this.angleClosureRateFunc = options?.angleClosureRate ?? APGSDirector.defaultAngleClosureRate;
    this.vsTargetFunc = options?.vsTarget;

    const vsUnit = this.vsTargetFunc ? UnitType.FPM : UnitType.MPS;
    this.minVs = UnitType.FPM.convertTo(options?.minVs ?? -3000, vsUnit);
    this.maxVs = UnitType.FPM.convertTo(options?.maxVs ?? 0, vsUnit);

    this.pauseSubs();
  }

  /** Resumes Subscriptions. */
  private resumeSubs(): void {
    this.navLocationSub.resume(true);
    this.glideslope.resume();
  }

  /** Pauses Subscriptions. */
  private pauseSubs(): void {
    this.navLocationSub.pause();
    this.glideslope.pause();
  }

  /**
   * Activates this director.
   */
  public activate(): void {
    this.resumeSubs();
    this.state = DirectorState.Active;
    SimVar.SetSimVarValue(VNavVars.GPApproachMode, SimVarValueType.Number, ApproachGuidanceMode.GSActive);
    if (this.onActivate !== undefined) {
      this.onActivate();
    }
    SimVar.SetSimVarValue('AUTOPILOT GLIDESLOPE ACTIVE', 'Bool', true);
    SimVar.SetSimVarValue('AUTOPILOT APPROACH ACTIVE', 'Bool', true);
    SimVar.SetSimVarValue('AUTOPILOT GLIDESLOPE ARM', 'Bool', false);
  }

  /**
   * Arms this director.
   */
  public arm(): void {
    this.resumeSubs();
    if (this.canArm() && this.state === DirectorState.Inactive) {
      this.state = DirectorState.Armed;
      SimVar.SetSimVarValue(VNavVars.GPApproachMode, SimVarValueType.Number, ApproachGuidanceMode.GSArmed);
      if (this.onArm !== undefined) {
        this.onArm();
      }
      SimVar.SetSimVarValue('AUTOPILOT GLIDESLOPE ARM', 'Bool', true);
      SimVar.SetSimVarValue('AUTOPILOT GLIDESLOPE ACTIVE', 'Bool', false);
      SimVar.SetSimVarValue('AUTOPILOT APPROACH ACTIVE', 'Bool', true);
    }
  }

  /**
   * Deactivates this director.
   */
  public deactivate(): void {
    this.state = DirectorState.Inactive;
    SimVar.SetSimVarValue(VNavVars.GPApproachMode, SimVarValueType.Number, ApproachGuidanceMode.None);
    SimVar.SetSimVarValue('AUTOPILOT GLIDESLOPE ARM', 'Bool', false);
    SimVar.SetSimVarValue('AUTOPILOT GLIDESLOPE ACTIVE', 'Bool', false);
    SimVar.SetSimVarValue('AUTOPILOT APPROACH ACTIVE', 'Bool', false);
    this.pauseSubs();
  }

  /**
   * Updates this director.
   */
  public update(): void {
    if (this.state === DirectorState.Armed) {
      const glideslope = this.glideslope.get();
      if (this.apValues.lateralActive.get() === APLateralModes.LOC && this.glideslope !== undefined &&
        glideslope.isValid && glideslope.deviation <= 0.1 && glideslope.deviation >= -0.1) {
        this.activate();
      }
      if (!this.canArm()) {
        this.deactivate();
      }
    }
    if (this.state === DirectorState.Active) {
      if (this.apValues.lateralActive.get() !== APLateralModes.LOC) {
        this.deactivate();
      }
      this.trackGlideslope();
    }
  }

  /**
   * Method to check whether the director can arm.
   * @returns Whether or not this director can arm.
   */
  private canArm(): boolean {
    const glideslope = this.glideslope.get();
    if ((this.apValues.navToNavLocArm && this.apValues.navToNavLocArm()) || (glideslope !== undefined && glideslope.isValid)) {
      return true;
    }
    return false;
  }

  /**
   * Tracks the Glideslope.
   */
  private trackGlideslope(): void {
    const glideslope = this.glideslope.get();
    const location = this.navLocation;
    if (glideslope !== undefined && glideslope.isValid && !isNaN(location.lat + location.lon)) {
      const distanceM = UnitType.GA_RADIAN.convertTo(
        location.distance(
          SimVar.GetSimVarValue('PLANE LATITUDE', SimVarValueType.Degree),
          SimVar.GetSimVarValue('PLANE LONGITUDE', SimVarValueType.Degree)
        ),
        UnitType.METER
      );

      // We want the height of the plane above the glideslope antenna, which we can calculate from distance,
      // glideslope angle, and glideslope error.
      const heightM = distanceM * Math.tan((glideslope.gsAngle + glideslope.deviation) * Avionics.Utils.DEG2RAD);
      const groundSpeedMps = SimVar.GetSimVarValue('GROUND VELOCITY', SimVarValueType.MetersPerSecond);
      const vsMps = SimVar.GetSimVarValue('VERTICAL SPEED', SimVarValueType.MetersPerSecond);

      const hypotSq = distanceM * distanceM + heightM * heightM;
      const heightTimesGs = heightM * groundSpeedMps;

      const currentAngleRate = (vsMps * distanceM + heightTimesGs) / hypotSq;

      let targetVs: number;
      let unit: string;

      if (this.vsTargetFunc) {
        targetVs = this.vsTargetFunc(glideslope.deviation, glideslope.gsAngle, currentAngleRate, distanceM, heightM, groundSpeedMps, vsMps);
        unit = SimVarValueType.FPM;
      } else {
        const desiredClosureRate = this.angleClosureRateFunc(glideslope.deviation, glideslope.gsAngle, currentAngleRate, distanceM, heightM, groundSpeedMps, vsMps);
        const desiredAngleRate = Math.sign(glideslope.deviation) * -1 * desiredClosureRate;

        targetVs = (Avionics.Utils.DEG2RAD * desiredAngleRate * hypotSq - heightTimesGs) / distanceM;
        unit = SimVarValueType.MetersPerSecond;
      }

      targetVs = MathUtils.clamp(targetVs, this.minVs, this.maxVs);

      const pitchForVerticalSpeed = Math.asin(MathUtils.clamp(targetVs / SimVar.GetSimVarValue('AIRSPEED TRUE', unit), -1, 1)) * Avionics.Utils.RAD2DEG;
      const targetPitch = MathUtils.clamp(pitchForVerticalSpeed, -8, 3);

      this.drivePitch && this.drivePitch(-targetPitch, true, true);
    } else {
      this.deactivate();
    }
  }

  /**
   * A default function which calculates a desired angle closure rate, in degrees per second, to track a glideslope. The angle
   * closure rate is the rate of reduction of glideslope angle error. Positive values reduce glideslope angle error while
   * negative values increase glideslope angle error.
   * @param gsAngleError The glideslope angle error, in degrees, defined as the difference between the angle from the
   * glideslope antenna to the airplane and the glideslope angle. Positive values indicate deviation of the airplane
   * above the glideslope.
   * @returns The desired angle closure rate, in degrees per second, toward the glideslope.
   */
  private static defaultAngleClosureRate(gsAngleError: number): number {
    // We will target 0.1 degrees per second by default at full-scale deviation, decreasing linearly down to 0 at no
    // deviation. This is equivalent to a constant time-to-intercept of 7 seconds at full-scale deviation or less.
    return MathUtils.lerp(Math.abs(gsAngleError), 0, 0.7, 0, 0.1, true, true);
  }
}