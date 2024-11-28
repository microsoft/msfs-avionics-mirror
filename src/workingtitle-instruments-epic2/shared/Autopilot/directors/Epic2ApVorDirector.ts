import { APNavDirector, DirectorState } from '@microsoft/msfs-sdk';

/** @inheritdoc */
export class Epic2ApVorDirector extends APNavDirector {
  private trackedObs: number | null = null;

  /** @inheritdoc */
  public override activate(): void {
    this.trackedObs = this.navObs.get();
    super.activate();
  }

  /** @inheritdoc */
  public override update(): void {
    const obs = this.navObs.get();
    if (this.state === DirectorState.Active && this.trackedObs !== null && obs !== null && Math.abs(obs - this.trackedObs) > 3) {
      this.deactivate();
    }
    super.update();
  }
}
