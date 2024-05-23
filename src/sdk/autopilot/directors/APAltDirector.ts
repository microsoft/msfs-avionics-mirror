/// <reference types="@microsoft/msfs-types/js/simvar" />

import { SimVarValueType } from '../../data';
import { NavMath } from '../../geo';
import { MathUtils } from '../../math';
import { Subscription } from '../../sub';
import { APValues } from '../APConfig';
import { VNavUtils } from '../vnav/VNavUtils';
import { DirectorState, PlaneDirector } from './PlaneDirector';

/**
 * An altitude hold autopilot director.
 */
export class APAltDirector implements PlaneDirector {

  public state: DirectorState;

  /** @inheritdoc */
  public drivePitch?: (pitch: number, adjustForAoa?: boolean, adjustForVerticalWind?: boolean) => void;

  /** @inheritdoc */
  public onActivate?: () => void;

  /** @inheritdoc */
  public onArm?: () => void;

  private capturedAltitude = 0;

  private setCapturedAltitude = (alt: number): void => {
    this.capturedAltitude = Math.round(alt);
  };

  private readonly capturedAltitudeSub: Subscription;

  /**
   * Creates an instance of the LateralDirector.
   * @param apValues are the ap selected values for the autopilot.
   */
  constructor(apValues: APValues) {
    this.state = DirectorState.Inactive;

    this.capturedAltitudeSub = apValues.capturedAltitude.sub(this.setCapturedAltitude, true);
    this.pauseSubs();
  }

  /** Resumes Subscriptions. */
  private resumeSubs(): void {
    this.capturedAltitudeSub.resume(true);
  }

  /** Pauses Subscriptions. */
  private pauseSubs(): void {
    this.capturedAltitudeSub.pause();
  }

  /**
   * Activates this director.
   */
  public activate(): void {
    this.resumeSubs();
    this.state = DirectorState.Active;
    if (this.onActivate !== undefined) {
      this.onActivate();
    }
    SimVar.SetSimVarValue('AUTOPILOT ALTITUDE LOCK', 'Bool', true);
  }

  /**
   * Arms this director.
   * This director has no armed mode, so it activates immediately.
   */
  public arm(): void {
    this.resumeSubs();
    this.state = DirectorState.Armed;
    if (this.onArm !== undefined) {
      this.onArm();
    }
  }

  /**
   * Deactivates this director.
   */
  public deactivate(): void {
    this.state = DirectorState.Inactive;
    SimVar.SetSimVarValue('AUTOPILOT ALTITUDE LOCK', 'Bool', false);
    this.pauseSubs();
  }

  /**
   * Updates this director.
   */
  public update(): void {
    if (this.state === DirectorState.Active) {
      this.holdAltitude(this.capturedAltitude);
    }
    if (this.state === DirectorState.Armed) {
      this.tryActivate();
    }
  }

  /**
   * Attempts to activate altitude capture.
   */
  private tryActivate(): void {
    const deviationFromTarget = Math.abs(this.capturedAltitude - SimVar.GetSimVarValue('INDICATED ALTITUDE', SimVarValueType.Feet));

    if (deviationFromTarget <= 20) {
      this.activate();
    }
  }

  /**
   * Holds a captured altitude.
   * @param targetAltitude is the captured targed altitude
   */
  private holdAltitude(targetAltitude: number): void {
    const deltaAlt = SimVar.GetSimVarValue('INDICATED ALTITUDE', SimVarValueType.Feet) - targetAltitude;
    let setVerticalSpeed = 0;
    const correction = MathUtils.clamp(10 * Math.abs(deltaAlt), 100, 500);
    if (deltaAlt > 10) {
      setVerticalSpeed = 0 - correction;
    } else if (deltaAlt < -10) {
      setVerticalSpeed = correction;
    }
    this.drivePitch && this.drivePitch(this.getDesiredPitch(setVerticalSpeed), true, true);
  }

  /**
   * Gets a desired pitch from the selected vs value.
   * @param vs target vertical speed.
   * @returns The desired pitch angle.
   */
  private getDesiredPitch(vs: number): number {
    const desiredPitch = VNavUtils.getFpa(SimVar.GetSimVarValue('AIRSPEED TRUE', SimVarValueType.FPM), vs);
    return -NavMath.clamp(desiredPitch, -10, 10);
  }
}