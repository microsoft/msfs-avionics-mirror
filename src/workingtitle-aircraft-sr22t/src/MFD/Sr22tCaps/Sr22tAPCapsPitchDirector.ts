import { APValues, DirectorState, PlaneDirector } from '@microsoft/msfs-sdk';

/**
 * A Cirrus SR22 CAPS pitch autopilot director.
 */
export class Sr22tAPCapsPitchDirector implements PlaneDirector {

  public state: DirectorState;

  /** @inheritdoc */
  public onActivate?: () => void;

  /** @inheritdoc */
  public onArm?: () => void;

  /** @inheritdoc */
  public drivePitch?: (pitch: number, adjustForAoa?: boolean, adjustForVerticalWind?: boolean) => void;

  /**
   * Creates an instance of the APCapsPitchDirector.
   * @param apValues are the ap selected values for the autopilot.
   */
  public constructor(private readonly apValues: APValues) {
    this.state = DirectorState.Inactive;
  }

  /** @inheritDoc */
  public activate(): void {
    this.state = DirectorState.Active;
    if (this.onActivate !== undefined) {
      this.onActivate();
    }
  }

  /** @inheritDoc */
  public arm(): void {
    if (this.state == DirectorState.Inactive) {
      this.activate();
    }
  }

  /** @inheritDoc */
  public deactivate(): void {
    this.state = DirectorState.Inactive;
  }

  /**
   * Updates this director.
   */
  public update(): void {
    if (this.state === DirectorState.Active) {
      this.drivePitch && this.drivePitch(-30, false, false);
    }
  }
}
