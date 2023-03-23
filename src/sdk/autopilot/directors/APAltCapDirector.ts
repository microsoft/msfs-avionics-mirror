/// <reference types="@microsoft/msfs-types/js/simvar" />

import { EventBus, SimVarValueType } from '../../data';
import { MathUtils, SimpleMovingAverage, UnitType } from '../../math';
import { APValues } from '../APConfig';
import { VNavUtils } from '../VNavUtils';
import { DirectorState, PlaneDirector } from './PlaneDirector';

/**
 * A function which calculates a desired pitch angle, in degrees, to capture a target altitude.
 * @param targetAltitude The altitude to capture, in feet.
 * @param indicatedAltitude The current indicated altitude, in feet.
 * @param initialFpa The flight path angle of the airplane, in degrees, when altitude capture was first activated.
 * Positive values indicate a descending path.
 * @param aoa The current angle of attack, in degrees. Positive values indicate nose-up attitude.
 * @param verticalSpeed The current vertical speed of the airplane, in feet per minute.
 * @param tas The current true airspeed of the airplane, in knots.
 * @returns The desired pitch angle, in degrees, to capture the specified altitude. Positive values indicate nose-up
 * pitch.
 */
export type APAltCapDirectorCaptureFunc = (
  targetAltitude: number,
  indicatedAltitude: number,
  initialFpa: number,
  aoa: number,
  verticalSpeed: number,
  tas: number
) => number;

/**
 * An altitude capture autopilot director.
 */
export class APAltCapDirector implements PlaneDirector {

  public state: DirectorState;

  /** A callback called when the director activates. */
  public onActivate?: () => void;

  /** A callback called when the director arms. */
  public onArm?: () => void;

  private capturedAltitude = 0;
  private initialFpa = 0;
  private selectedAltitude = 0;
  private verticalWindAverage = new SimpleMovingAverage(10);


  /**
   * Creates an instance of the APAltCapDirector.
   * @param bus The event bus to use with this director.
   * @param apValues Autopilot data for this director.
   * @param captureAltitude A function which calculates desired pitch angles to capture a target altitude. If not
   * defined, a default function is used.
   */
  constructor(
    private readonly bus: EventBus,
    private readonly apValues: APValues,
    private readonly captureAltitude: APAltCapDirectorCaptureFunc = APAltCapDirector.captureAltitude
  ) {
    this.state = DirectorState.Inactive;

    this.apValues.capturedAltitude.sub((cap) => {
      this.capturedAltitude = Math.round(cap);
    });
    this.apValues.selectedAltitude.sub((alt) => {
      this.selectedAltitude = alt;
    });
  }

  /**
   * Activates this director.
   */
  public activate(): void {
    this.state = DirectorState.Active;
    if (this.onActivate !== undefined) {
      this.onActivate();
    }
    this.setCaptureFpa(SimVar.GetSimVarValue('VERTICAL SPEED', SimVarValueType.FPM));
    SimVar.SetSimVarValue('AUTOPILOT ALTITUDE LOCK', 'Bool', true);
  }

  /**
   * Arms this director.
   * This director has no armed mode, so it activates immediately.
   */
  public arm(): void {
    this.state = DirectorState.Armed;
    if (this.onArm !== undefined) {
      this.onArm();
    }
  }

  /**
   * Deactivates this director.
   * @param captured is whether the altitude was captured.
   */
  public deactivate(captured = false): void {
    this.state = DirectorState.Inactive;
    if (!captured) {
      SimVar.SetSimVarValue('AUTOPILOT ALTITUDE LOCK', 'Bool', false);
    }
    //this.capturedAltitude = 0;
  }

  /**
   * Updates this director.
   */
  public update(): void {
    if (this.state === DirectorState.Active) {
      const tas = SimVar.GetSimVarValue('AIRSPEED TRUE', SimVarValueType.Knots);
      this.setPitch(this.captureAltitude(
        this.capturedAltitude,
        SimVar.GetSimVarValue('INDICATED ALTITUDE', SimVarValueType.Feet),
        this.initialFpa,
        SimVar.GetSimVarValue('INCIDENCE ALPHA', SimVarValueType.Degree),
        SimVar.GetSimVarValue('VERTICAL SPEED', SimVarValueType.FPM),
        tas
      ), tas);
    }
    if (this.state === DirectorState.Armed) {
      this.tryActivate();
    }
  }

  /**
   * Attempts to activate altitude capture.
   */
  private tryActivate(): void {
    const indicatedAlt = SimVar.GetSimVarValue('INDICATED ALTITUDE', SimVarValueType.Feet);
    const vs = SimVar.GetSimVarValue('VERTICAL SPEED', SimVarValueType.FPM);
    const deviationFromTarget = Math.abs(this.selectedAltitude - indicatedAlt);

    if (deviationFromTarget <= Math.abs(vs / 6)) {
      this.apValues.capturedAltitude.set(Math.round(this.selectedAltitude));
      this.activate();
    }
  }

  /**
   * Sets the initial capture FPA from the current vs value when capture is initiated.
   * @param vs target vertical speed.
   */
  private setCaptureFpa(vs: number): void {
    const indicatedAlt = SimVar.GetSimVarValue('INDICATED ALTITUDE', SimVarValueType.Feet);
    const altCapDeviation = indicatedAlt - this.selectedAltitude;

    if (altCapDeviation < 0) {
      vs = Math.max(400, vs);
    } else {
      vs = Math.min(-400, vs);
    }

    const tas = SimVar.GetSimVarValue('AIRSPEED TRUE', SimVarValueType.FPM);
    this.initialFpa = VNavUtils.getFpa(tas, vs);
  }

  /**
   * Sets the desired AP pitch angle.
   * @param targetPitch The desired AP pitch angle.
   * @param tas The airplane's current true airspeed, in knots.
   */
  private setPitch(targetPitch: number, tas: number): void {
    if (isFinite(targetPitch)) {
      const verticalWindComponent = this.verticalWindAverage.getAverage(SimVar.GetSimVarValue('AMBIENT WIND Y', SimVarValueType.FPM));
      const verticalWindPitchAdjustment = VNavUtils.getFpa(UnitType.KNOT.convertTo(tas, UnitType.FPM), -verticalWindComponent);

      SimVar.SetSimVarValue('AUTOPILOT PITCH HOLD REF', SimVarValueType.Degree, -(targetPitch + verticalWindPitchAdjustment));
    }
  }

  /**
   * Calculates a desired pitch angle, in degrees, to capture a target altitude.
   * @param targetAltitude The altitude to capture, in feet.
   * @param indicatedAltitude The current indicated altitude, in feet.
   * @param initialFpa The flight path angle of the airplane, in degrees, when altitude capture was first activated.
   * Positive values indicate a descending path.
   * @param aoa The current angle of attack, in degrees. Positive values indicate nose-up attitude.
   * @param verticalSpeed The current vertical speed of the airplane, in feet per minute.
   * @param tas The current true airspeed of the airplane, in knots.
   * @returns The desired pitch angle, in degrees, to capture the specified altitude. Positive values indicate nose-up
   * pitch.
   */
  private static captureAltitude(
    targetAltitude: number,
    indicatedAltitude: number,
    initialFpa: number,
    aoa: number,
    verticalSpeed: number,
    tas: number
  ): number {
    const initialFpaAbs = Math.abs(initialFpa);
    let deltaAltitude = targetAltitude - indicatedAltitude;

    if (deltaAltitude >= 0 && deltaAltitude < 10) {
      deltaAltitude = 10;
    } else if (deltaAltitude < 0 && deltaAltitude > -10) {
      deltaAltitude = -10;
    }

    const desiredClosureTime = MathUtils.lerp(Math.abs(deltaAltitude), 100, 1000, 5, 10, true, true);
    const desiredVs = deltaAltitude / (desiredClosureTime / 60);

    const desiredFpa = MathUtils.clamp(Math.asin(desiredVs / UnitType.KNOT.convertTo(tas, UnitType.FPM)) * Avionics.Utils.RAD2DEG, -initialFpaAbs, initialFpaAbs);
    return MathUtils.clamp(aoa + desiredFpa, -15, 15);
  }
}