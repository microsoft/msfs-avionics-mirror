import { ComponentProps, DisplayComponent, EventBus, FSComponent, SetSubject, VNode } from '@microsoft/msfs-sdk';

import { Epic2Fms, FlightPlanStore, TouchButton, VectorToFinalStates } from '@microsoft/msfs-epic2-shared';

import './VectorsButton.css';

/** The properties for the {@link VectorsButton} component. */
interface VectorsButtonProps extends ComponentProps {
  /** The FMS. */
  readonly fms: Epic2Fms;
  /** The event bus */
  readonly bus: EventBus;
  /** The active plan store */
  readonly store: FlightPlanStore
}

/** The VectorsButton component. */
export class VectorsButton extends DisplayComponent<VectorsButtonProps> {
  // private readonly inVectors = this.props.store.isInVectors;
  // private readonly exitingVectors = this.props.store.isExitingVectors;
  private readonly classes = SetSubject.create(['vectors-button']);
  private readonly vectorState = this.props.store.vtfApproachState;

  /** Handles button press */
  private onPress(): void {
    // if (this.exitingVectors.get() === false) {
    //   this.props.bus.getPublisher<LNavControlEvents>().pub('suspend_sequencing', false);
    //   this.exitingVectors.set(true);
    // } else {
    //   this.props.bus.getPublisher<LNavControlEvents>().pub('suspend_sequencing', true);
    //   this.exitingVectors.set(false);
    // }

    this.props.fms.activateVtf();
    this.vectorState.set(VectorToFinalStates.Activated);
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    this.vectorState.sub((state) => this.classes.toggle('hidden', state !== VectorToFinalStates.AwaitingActivation), true);

  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.classes}>
        <div class="button-wrapper touch-button-bar-image-border">
          <TouchButton variant="bar" label={'Activate<br>VECTORS'} isHighlighted={true} onPressed={() => this.onPress()} />
        </div>
      </div>
    );
  }
}
