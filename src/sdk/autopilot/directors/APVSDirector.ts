/// <reference types="@microsoft/msfs-types/js/simvar" />

import { SimVarValueType } from '../../data/SimVars';
import { MathUtils } from '../../math/MathUtils';
import { UnitType } from '../../math/NumberUnit';
import { APValues } from '../APValues';
import { DirectorState, PlaneDirector } from './PlaneDirector';

/**
 * A vertical speed autopilot director.
 */
export class APVSDirector implements PlaneDirector {

  public state: DirectorState;

  /** @inheritdoc */
  public onActivate?: () => void;

  /** @inheritdoc */
  public onArm?: () => void;

  /** @inheritdoc */
  public drivePitch?: (pitch: number, adjustForAoa?: boolean, adjustForVerticalWind?: boolean) => void;


  /**
   * Creates an instance of the LateralDirector.
   * @param apValues are the ap selected values for the autopilot.
   * @param vsIncrement The number that vertical speed can be incremented by, in feet per minute.
   * Upon activation, the actual vs will be rounded using this increment.
   * If undefined, the value will not be rounded before passed to the sim. Defaults to undefined.
   */
  constructor(protected readonly apValues: APValues, protected readonly vsIncrement: number | undefined = undefined) {
    this.state = DirectorState.Inactive;
  }

  /**
   * Activates this director.
   */
  public activate(): void {
    this.state = DirectorState.Active;
    if (this.onActivate !== undefined) {
      this.onActivate();
    }
    const currentVs = this.vsIncrement === undefined
      ? Simplane.getVerticalSpeed()
      : MathUtils.round(Simplane.getVerticalSpeed(), this.vsIncrement);
    Coherent.call('AP_VS_VAR_SET_ENGLISH', 1, currentVs);
    SimVar.SetSimVarValue('AUTOPILOT VERTICAL HOLD', 'Bool', true);
  }

  /**
   * Arms this director.
   * This director has no armed mode, so it activates immediately.
   */
  public arm(): void {
    if (this.state == DirectorState.Inactive) {
      this.activate();
    }
  }

  /**
   * Deactivates this director.
   */
  public deactivate(): void {
    this.state = DirectorState.Inactive;
    SimVar.SetSimVarValue('AUTOPILOT VERTICAL HOLD', 'Bool', false);
  }

  /**
   * Updates this director.
   */
  public update(): void {
    if (this.state === DirectorState.Active) {
      this.drivePitch && this.drivePitch(this.getDesiredPitch(), true, true);
    }
  }

  /**
   * Gets a desired pitch from the selected vs value.
   * @returns The desired pitch angle.
   */
  protected getDesiredPitch(): number {
    const tas = SimVar.GetSimVarValue('AIRSPEED TRUE', SimVarValueType.Knots);
    const desiredPitch = this.getFpa(UnitType.NMILE.convertTo(tas / 60, UnitType.FOOT), this.apValues.selectedVerticalSpeed.get());
    return -MathUtils.clamp(isNaN(desiredPitch) ? 0 : desiredPitch, -15, 15);
  }

  /**
   * Gets a desired fpa.
   * @param distance is the distance traveled per minute.
   * @param altitude is the vertical speed per minute.
   * @returns The desired pitch angle.
   */
  private getFpa(distance: number, altitude: number): number {
    return UnitType.RADIAN.convertTo(Math.atan(altitude / distance), UnitType.DEGREE);
  }
}