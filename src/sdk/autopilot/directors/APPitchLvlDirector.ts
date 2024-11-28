/// <reference types="@microsoft/msfs-types/js/simvar" />

import { APValues } from '../APValues';
import { DirectorState, PlaneDirector } from './PlaneDirector';

/**
 * A pitch level autopilot director.
 */
export class APPitchLvlDirector implements PlaneDirector {

  public state: DirectorState;

  /** @inheritdoc */
  public onActivate?: () => void;

  /** @inheritdoc */
  public onArm?: () => void;

  /** @inheritdoc */
  public drivePitch?: (pitch: number, adjustForAoa?: boolean, adjustForVerticalWind?: boolean) => void;


  /**
   * Creates an instance of the APPitchLvlDirector.
   * @param apValues are the ap selected values for the autopilot.
   */
  constructor(protected readonly apValues: APValues) {
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
  }

  /**
   * Updates this director.
   */
  public update(): void {
    if (this.state === DirectorState.Active) {
      this.drivePitch && this.drivePitch(0, true, true);
    }
  }
}