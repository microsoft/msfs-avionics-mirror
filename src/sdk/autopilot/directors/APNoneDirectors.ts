import { MSFSAPStates } from '../../navigation';
import { DirectorState, PlaneDirector } from './PlaneDirector';

/**
 * A director that removes all vertical guidance from the autopilot system.
 */
export class APNoneVerticalDirector implements PlaneDirector {

  /** @inheritdoc */
  public state = DirectorState.Inactive;

  /** @inheritdoc */
  public drivePitch?: (pitch: number, adjustForAoa?: boolean, adjustForVerticalWind?: boolean) => void;

  /** @inheritdoc */
  public activate(): void {
    this.state = DirectorState.Active;

    Coherent.call('apSetAutopilotMode', MSFSAPStates.Alt, 0);
    Coherent.call('apSetAutopilotMode', MSFSAPStates.AltArm, 0);
    Coherent.call('apSetAutopilotMode', MSFSAPStates.FLC, 0);
    Coherent.call('apSetAutopilotMode', MSFSAPStates.VS, 0);
    Coherent.call('apSetAutopilotMode', MSFSAPStates.Pitch, 0);
    Coherent.call('apSetAutopilotMode', MSFSAPStates.GS, 0);
    Coherent.call('apSetAutopilotMode', MSFSAPStates.GSArm, 0);
    Coherent.call('apSetAutopilotMode', MSFSAPStates.TOGAPitch, 0);

    if (this.onActivate !== undefined) {
      this.onActivate();
    }
  }

  /** @inheritdoc */
  public arm(): void {
    if (this.state === DirectorState.Inactive) {
      this.activate();
    }
  }

  /** @inheritdoc */
  public deactivate(): void {
    this.state = DirectorState.Inactive;
  }

  /** @inheritdoc */
  public update(): void {
    /** No-op */
  }

  /** @inheritdoc */
  public onActivate?: (() => void) | undefined;

  /** @inheritdoc */
  public onArm?: (() => void) | undefined;

  /** @inheritdoc */
  public onDeactivate?: (() => void) | undefined;
}

/**
 * A director that removes all lateral guidance from the autopilot system.
 */
export class APNoneLateralDirector implements PlaneDirector {

  /** @inheritdoc */
  public state = DirectorState.Inactive;

  /** @inheritdoc */
  public setBank?: (bank: number) => void;

  /** @inheritdoc */
  public activate(): void {
    this.state = DirectorState.Active;

    Coherent.call('apSetAutopilotMode', MSFSAPStates.Bank, 0);
    Coherent.call('apSetAutopilotMode', MSFSAPStates.Heading, 0);
    Coherent.call('apSetAutopilotMode', MSFSAPStates.Nav, 0);
    Coherent.call('apSetAutopilotMode', MSFSAPStates.NavArm, 0);
    Coherent.call('apSetAutopilotMode', MSFSAPStates.WingLevel, 0);

    if (this.onActivate !== undefined) {
      this.onActivate();
    }
  }

  /** @inheritdoc */
  public arm(): void {
    if (this.state === DirectorState.Inactive) {
      this.activate();
    }
  }

  /** @inheritdoc */
  public deactivate(): void {
    this.state = DirectorState.Inactive;
  }

  /** @inheritdoc */
  public update(): void {
    /** No-op */
  }

  /** @inheritdoc */
  public onActivate?: (() => void) | undefined;

  /** @inheritdoc */
  public onArm?: (() => void) | undefined;

  /** @inheritdoc */
  public onDeactivate?: (() => void) | undefined;
}