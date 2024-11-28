/// <reference types="@microsoft/msfs-types/js/simvar" />

import { SimVarValueType } from '../../data/SimVars';
import { ExpSmoother } from '../../math/ExpSmoother';
import { MathUtils } from '../../math/MathUtils';
import { UnitType } from '../../math/NumberUnit';
import { Subject } from '../../sub/Subject';
import { Subscribable } from '../../sub/Subscribable';
import { PidController } from '../../utils/controllers/PidController';

/**
 * PID Settings for the FLC Computer.
 */
export interface FlcComputerOptions {
  /** kP The proportional gain of the controller. */
  kP: number;
  /** kI The integral gain of the controller. */
  kI: number;
  /** kD The differential gain of the controller. */
  kD: number;
  /** maxOut The maximum output of the controller. */
  maxOut: number;
  /** minOut The minumum output of the controller. */
  minOut: number;
  /** maxI The maximum integral gain (optional). */
  maxI?: number;
  /** minI The minimum integral gain (optional). */
  minI?: number;
}

/**
 * A Generic FLC computer to be used in directors that require FLC logic.
 */
export class GenericFlcComputer {

  private _isActive = false;
  protected _targetIas = 0;
  protected _climbMode = false;

  private readonly _pitchTarget = Subject.create<number | null>(null);
  /** The current pitch target calculated by this computer, in degrees. Positive values indicate downward pitch. */
  public readonly pitchTarget: Subscribable<number | null> = this._pitchTarget;

  protected _lastTime = 0;
  private readonly pitchController: PidController;
  protected filter = new ExpSmoother(2.5);

  /**
   * Gets if this computer is active
   * @returns if this computer is active.
   */
  public get isActive(): boolean {
    return this._isActive;
  }

  // eslint-disable-next-line jsdoc/require-returns
  /** This computer's target speed, in knots indicated airspeed. */
  public get targetIas(): number {
    return this._targetIas;
  }

  // eslint-disable-next-line jsdoc/require-returns
  /**
   * Whether this computer is in climb mode. In climb mode, the computer will not target a pitch that would cause the
   * airplane to descend. When not in climb mode, the computer will not target a pitch that would cause the airplane to
   * climb.
   */
  public get isClimbMode(): boolean {
    return this._climbMode;
  }

  /**
   * Creates an instance of GenericFlcComputer.
   * @param pidControllerOptions The PID controller settings for this computer.
   */
  constructor(pidControllerOptions: FlcComputerOptions) {

    // this.pitchController = new PidController(2, 0, 0, 15, -15);
    this.pitchController = new PidController(
      pidControllerOptions.kP,
      pidControllerOptions.kI,
      pidControllerOptions.kD,
      pidControllerOptions.maxOut,
      pidControllerOptions.minOut,
      pidControllerOptions.maxI,
      pidControllerOptions.minI
    );
  }

  /**
   * Activates this computer.
   * @param climbMode Whether to force climb mode on (`true`) or off (`false`) on activation. If undefined, the climb
   * mode state will remain unchanged.
   */
  public activate(climbMode?: boolean): void {
    this._isActive = true;
    if (climbMode !== undefined) {
      this._climbMode = climbMode;
    }
    this.initialize();
  }

  /**
   * Turns climb mode on or off.
   * @param setToClimbMode Whether climb mode should be turned on.
   */
  public setClimbMode(setToClimbMode: boolean): void {
    this._climbMode = setToClimbMode;
  }

  /**
   * Sets the target speed for this computer, in knots indicated airspeed.
   * @param ias The target speed to set, in knots indicated airspeed.
   */
  public setTargetSpeed(ias: number): void {
    this._targetIas = ias;
  }

  /**
   * Deactivates this computer.
   */
  public deactivate(): void {
    this._isActive = false;
    this._pitchTarget.set(null);
  }

  /**
   * Initializes this director on activation.
   */
  private initialize(): void {
    this._lastTime = 0;
    this.pitchController.reset();
    this.filter.reset();
  }

  /**
   * Updates this director.
   */
  public update(): void {
    if (this._isActive) {
      // negate the output value to conform with sim standard.
      this._pitchTarget.set(-this.getDesiredPitch());
    } else {
      this._pitchTarget.set(null);
    }
  }

  /**
   * Gets a desired pitch when airborne to maintain a given speed.
   * @returns The desired pitch angle.
   */
  protected getDesiredPitch(): number {
    const time = performance.now() / 1000;
    let dt = time - this._lastTime;
    if (this._lastTime === 0) {
      dt = 0;
    }

    const currentIas = SimVar.GetSimVarValue('AIRSPEED INDICATED:1', SimVarValueType.Knots);
    // remember PLANE PITCH DEGREES returns a negative value for up
    const currentPitch = -SimVar.GetSimVarValue('PLANE PITCH DEGREES', SimVarValueType.Degree);

    //step 1 - we want to find the IAS error from target and set a target acceleration
    const iasError = currentIas - this._targetIas;
    const targetAcceleration = MathUtils.clamp(iasError / 5, -2, 2) * -1;

    //step 2 - we want to find the current acceleration, feed that to the pid to manage to the target acceleration
    const acceleration = UnitType.FOOT.convertTo(SimVar.GetSimVarValue('ACCELERATION BODY Z', 'feet per second squared'), UnitType.NMILE) * 3600;
    const accelerationError = acceleration - targetAcceleration;
    const pitchCorrection = this.pitchController.getOutput(dt, accelerationError);

    const aoa = SimVar.GetSimVarValue('INCIDENCE ALPHA', SimVarValueType.Degree);
    this._lastTime = time;
    let targetPitch = isNaN(pitchCorrection) ? currentPitch - aoa : (currentPitch - aoa) + pitchCorrection;
    targetPitch = this.filter.next(targetPitch, dt);

    if (this._climbMode) {
      return Math.max(targetPitch + aoa, aoa);
    } else {
      return Math.min(targetPitch + aoa, aoa);
    }
  }
}