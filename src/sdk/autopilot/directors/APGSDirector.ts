/// <reference types="@microsoft/msfs-types/js/simvar" />

import { EventBus, SimVarValueType } from '../../data';
import { GeoPoint } from '../../geo';
import { Glideslope, NavRadioEvents, NavRadioIndex } from '../../instruments';
import { MathUtils, SimpleMovingAverage, UnitType } from '../../math';
import { APLateralModes, APValues } from '../APConfig';
import { VNavVars } from '../data/VNavEvents';
import { ApproachGuidanceMode } from '../VerticalNavigation';
import { DirectorState, PlaneDirector } from './PlaneDirector';

/**
 * Options for {@link APGSDirector}.
 */
export type APGSDirectorOptions = {
  /**
   * Force the director to always use a certain NAV/GS source
   */
  forceNavSource: NavRadioIndex;
};

/**
 * A glideslope autopilot director.
 */
export class APGSDirector implements PlaneDirector {

  public state: DirectorState;

  /** A callback called when the director activates. */
  public onActivate?: () => void;

  /** A callback called when the director arms. */
  public onArm?: () => void;

  private gsLocation = new GeoPoint(NaN, NaN);
  private glideslope?: Glideslope;
  private verticalWindAverage = new SimpleMovingAverage(10);

  /**
   * Creates an instance of the LateralDirector.
   * @param bus The event bus to use with this instance.
   * @param apValues is the APValues object from the Autopilot.
   * @param options APGSDirector options.
   */
  constructor(private readonly bus: EventBus, private readonly apValues: APValues, options?: Partial<Readonly<APGSDirectorOptions>>) {
    this.state = DirectorState.Inactive;
    const nav = this.bus.getSubscriber<NavRadioEvents>();
    if (options?.forceNavSource) {
      nav.on(`nav_radio_glideslope_${options.forceNavSource}`).handle(gs => this.glideslope = gs);
      nav.on(`nav_radio_gs_location_${options.forceNavSource}`).handle((loc) => {
        this.gsLocation.set(loc.lat, loc.long);
      });
    } else {
      nav.on('nav_radio_active_glideslope').handle(gs => this.glideslope = gs);
      nav.on('nav_radio_active_gs_location').handle((loc) => {
        this.gsLocation.set(loc.lat, loc.long);
      });
    }
  }

  /**
   * Activates this director.
   */
  public activate(): void {
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
  }

  /**
   * Updates this director.
   */
  public update(): void {
    if (this.state === DirectorState.Armed) {
      if (this.apValues.lateralActive.get() === APLateralModes.LOC && this.glideslope !== undefined &&
        this.glideslope.isValid && this.glideslope.deviation <= 0.1 && this.glideslope.deviation >= -0.1) {
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
    if ((this.apValues.navToNavLocArm && this.apValues.navToNavLocArm()) || (this.glideslope !== undefined && this.glideslope.isValid)) {
      return true;
    }
    return false;
  }

  /**
   * Tracks the Glideslope.
   */
  private trackGlideslope(): void {
    if (this.glideslope !== undefined && this.glideslope.isValid && !isNaN(this.gsLocation.lat + this.gsLocation.lon)) {
      const distanceM = UnitType.GA_RADIAN.convertTo(
        this.gsLocation.distance(
          SimVar.GetSimVarValue('PLANE LATITUDE', SimVarValueType.Degree),
          SimVar.GetSimVarValue('PLANE LONGITUDE', SimVarValueType.Degree)
        ),
        UnitType.METER
      );

      // We want the altitude of the plane above the glideslope antenna, which we can calculate from distance,
      // glideslope angle, and glideslope error.
      const altitudeM = distanceM * Math.tan((this.glideslope.gsAngle + this.glideslope.deviation) * Avionics.Utils.DEG2RAD);

      const groundSpeedMps = SimVar.GetSimVarValue('GROUND VELOCITY', SimVarValueType.MetersPerSecond);

      // Set our desired closure rate in degrees per second - this is the rate at which we want to reduce our
      // glideslope error. We will target 0.1 degrees per second at full-scale deviation, decreasing linearly
      // down to 0 at no deviation. This is equivalent to a constant time-to-intercept of 7 seconds at full-scale
      // deviation or less.
      const desiredClosureRate = MathUtils.lerp(Math.abs(this.glideslope.deviation), 0, 0.7, 0, 0.1, true, true);
      const desiredAngleRate = Math.sign(this.glideslope.deviation) * -1 * desiredClosureRate;

      const vsRequiredForClosure = MathUtils.clamp(
        (Avionics.Utils.DEG2RAD * desiredAngleRate * (distanceM * distanceM + altitudeM * altitudeM) - altitudeM * groundSpeedMps) / distanceM,
        -3000,
        0
      );

      //We need the instant vertical wind component here so we're avoiding the bus
      const verticalWindComponent = this.verticalWindAverage.getAverage(SimVar.GetSimVarValue('AMBIENT WIND Y', SimVarValueType.MetersPerSecond));

      const vsRequiredWithVerticalWind = vsRequiredForClosure - verticalWindComponent;

      const pitchForVerticalSpeed = Math.asin(MathUtils.clamp(vsRequiredWithVerticalWind / SimVar.GetSimVarValue('AIRSPEED TRUE', SimVarValueType.MetersPerSecond), -1, 1)) * Avionics.Utils.RAD2DEG;

      //We need the instant AOA here so we're avoiding the bus
      const aoa = SimVar.GetSimVarValue('INCIDENCE ALPHA', SimVarValueType.Degree);

      const targetPitch = aoa + MathUtils.clamp(pitchForVerticalSpeed, -8, 3);

      SimVar.SetSimVarValue('AUTOPILOT PITCH HOLD REF', SimVarValueType.Degree, -targetPitch);
    } else {
      this.deactivate();
    }
  }
}