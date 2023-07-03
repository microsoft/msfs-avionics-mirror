/// <reference types="@microsoft/msfs-types/js/simvar" />

import { DirectorState, PlaneDirector } from './PlaneDirector';

/**
 * An autopilot TOGA Pitch Director to be used for either a vertical TO or GA mode.
 */
export class APTogaPitchDirector implements PlaneDirector {

  public state: DirectorState;

  /** @inheritdoc */
  public onActivate?: () => void;
  /** @inheritdoc */
  public onArm?: () => void;
  /** @inheritdoc */
  public drivePitch?: (pitch: number, adjustForAoa?: boolean, adjustForVerticalWind?: boolean) => void;
  /** @inheritdoc */
  public setPitch?: (pitch: number) => void;

  /**
   * Creates an instance of the LateralDirector.
   * @param targetPitchValue the pitch to set, in positive degrees, by this director.
   */
  constructor(private readonly targetPitchValue = 10) {
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
    this.setPitch && this.setPitch(-this.targetPitchValue);

    // TODO: The simvar is not currently writeable, so the line below has no effect.
    SimVar.SetSimVarValue('AUTOPILOT TAKEOFF POWER ACTIVE', 'Bool', true);
    SimVar.SetSimVarValue('L:WT_TOGA_ACTIVE', 'Bool', true);
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

    // TODO: The simvar is not currently writeable, so the line below has no effect.
    SimVar.SetSimVarValue('AUTOPILOT TAKEOFF POWER ACTIVE', 'Bool', false);
    SimVar.SetSimVarValue('L:WT_TOGA_ACTIVE', 'Bool', false);
  }

  /**
   * Updates this director.
   */
  public update(): void {
    //noop
  }
}