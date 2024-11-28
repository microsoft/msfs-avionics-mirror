import { ComponentProps, DisplayComponent, EventBus, FSComponent, LegType, LNavControlEvents, MappedSubject, VNode } from '@microsoft/msfs-sdk';

import { Epic2Fms, FlightPlanStore, TouchButton } from '@microsoft/msfs-epic2-shared';

import './HoldButton.css';

/** The properties for the {@link HoldButton} component. */
interface HoldButtonProps extends ComponentProps {
  /** The FMS. */
  readonly fms: Epic2Fms;
  /** The event bus */
  readonly bus: EventBus;
  /** The active plan store */
  readonly store: FlightPlanStore
}

/** The HoldButton component. */
export class HoldButton extends DisplayComponent<HoldButtonProps> {
  private readonly inHold = MappedSubject.create(([inHold, activeLeg]) => inHold && activeLeg?.leg.type === LegType.HM, this.props.store.isInHold, this.props.store.activeLeg);
  private readonly exitingHold = this.props.store.isExitingHold;

  /** Handles button press */
  private onPress(): void {
    if (this.exitingHold.get() === false) {
      this.props.bus.getPublisher<LNavControlEvents>().pub('suspend_sequencing', false);
      this.exitingHold.set(true);
    } else {
      this.props.bus.getPublisher<LNavControlEvents>().pub('suspend_sequencing', true);
      this.exitingHold.set(false);
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div
        class={{
          'hold-button': true,
          'hidden': this.inHold.map((x) => !x),
        }}
      >
        <div class="button-wrapper touch-button-bar-image-border">
          <TouchButton variant="bar" label={this.exitingHold.map((exiting) => exiting ? 'Resume Hold' : 'Exit Hold')} isHighlighted={true} onPressed={() => this.onPress()} />
        </div>
      </div>
    );
  }
}
