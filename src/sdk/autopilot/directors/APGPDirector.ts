/// <reference types="@microsoft/msfs-types/js/simvar" />

import { EventBus, SimVarValueType } from '../../data';
import { MathUtils, SimpleMovingAverage } from '../../math';
import { APLateralModes, APValues } from '../APConfig';
import { VNavEvents, VNavVars } from '../data/VNavEvents';
import { ApproachGuidanceMode } from '../VerticalNavigation';
import { DirectorState, PlaneDirector } from './PlaneDirector';

/**
 * An RNAV LPV glidepath autopilot director.
 */
export class APGPDirector implements PlaneDirector {

  public state: DirectorState;

  /** A callback called when the director activates. */
  public onActivate?: () => void;

  /** A callback called when the director arms. */
  public onArm?: () => void;

  private gpDeviation = 0;

  private fpa = 0;

  private verticalWindAverage = new SimpleMovingAverage(10);

  /**
   * Creates an instance of the LateralDirector.
   * @param bus The event bus to use with this instance.
   * @param apValues are the ap selected values for the autopilot.
   */
  constructor(private readonly bus: EventBus, private readonly apValues: APValues) {
    this.state = DirectorState.Inactive;

    this.bus.getSubscriber<VNavEvents>().on('gp_vertical_deviation').whenChanged().handle(dev => this.gpDeviation = dev);
    this.bus.getSubscriber<VNavEvents>().on('gp_fpa').whenChanged().handle(fpa => this.fpa = fpa);

    apValues.approachHasGP.sub(v => {
      if (this.state !== DirectorState.Inactive && !v) {
        this.deactivate();
      }
    });
  }

  /**
   * Activates this director.
   */
  public activate(): void {
    this.state = DirectorState.Active;
    SimVar.SetSimVarValue(VNavVars.GPApproachMode, SimVarValueType.Number, ApproachGuidanceMode.GPActive);
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
    if (this.state === DirectorState.Inactive) {
      this.state = DirectorState.Armed;
      SimVar.SetSimVarValue(VNavVars.GPApproachMode, SimVarValueType.Number, ApproachGuidanceMode.GPArmed);
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
      if (this.apValues.lateralActive.get() === APLateralModes.GPSS &&
        this.gpDeviation <= 100 && this.gpDeviation >= -15 && this.fpa !== 0) {
        this.activate();
      }
    }
    if (this.state === DirectorState.Active) {
      if (this.apValues.lateralActive.get() !== APLateralModes.GPSS) {
        this.deactivate();
      }
      this.setPitch(this.getDesiredPitch());
    }
  }

  /**
   * Gets a desired pitch from the selected vs value.
   * @returns The desired pitch angle.
   */
  private getDesiredPitch(): number {

    // The vertical speed required to stay on the glidepath with zero deviation.
    const vsRequiredForFpa = SimVar.GetSimVarValue('GROUND VELOCITY', SimVarValueType.FPM) * Math.tan(-this.fpa * Avionics.Utils.DEG2RAD);

    // Set our desired closure rate in feet per minute - this is the rate at which we want to reduce our
    // vertical deviation. We will target 850 feet per minute at 100 feet of deviation, decreasing linearly
    // down to 0 at no deviation. This is equivalent to a constant time-to-intercept of 7 seconds at 100 feet
    // deviation or less.
    const desiredClosureRate = MathUtils.lerp(Math.abs(this.gpDeviation), 0, 100, 0, 850, true, true);
    const desiredVs = MathUtils.clamp(Math.sign(this.gpDeviation) * desiredClosureRate + vsRequiredForFpa, -3000, 0);

    //We need the instant vertical wind component here so we're avoiding the bus
    const verticalWindComponent = this.verticalWindAverage.getAverage(SimVar.GetSimVarValue('AMBIENT WIND Y', SimVarValueType.FPM));

    const vsRequiredWithVerticalWind = desiredVs - verticalWindComponent;

    const pitchForVerticalSpeed = Math.asin(MathUtils.clamp(vsRequiredWithVerticalWind / SimVar.GetSimVarValue('AIRSPEED TRUE', SimVarValueType.FPM), -1, 1)) * Avionics.Utils.RAD2DEG;

    //We need the instant AOA here so we're avoiding the bus
    const aoa = SimVar.GetSimVarValue('INCIDENCE ALPHA', SimVarValueType.Degree);

    return aoa + MathUtils.clamp(pitchForVerticalSpeed, -8, 3);
  }

  /**
   * Sets the desired AP pitch angle.
   * @param targetPitch The desired AP pitch angle.
   */
  private setPitch(targetPitch: number): void {
    if (isFinite(targetPitch)) {
      SimVar.SetSimVarValue('AUTOPILOT PITCH HOLD REF', SimVarValueType.Degree, -targetPitch);
    }
  }
}