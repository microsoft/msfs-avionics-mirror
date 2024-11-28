import { Epic2PfdControlEvents, PfdControlState } from '@microsoft/msfs-epic2-shared';
import { ConsumerSubject, DisplayComponent, FSComponent, EventBus, VNode } from '@microsoft/msfs-sdk';

import './PfdControllerState.css';

/** The controller state component props. */
export interface PfdControllerStateProps {
  /** The instrument event bus. */
  bus: EventBus;
}

/** An indicator that shows when the PFD controller is inactive or cross-side. */
export class PfdControllerState extends DisplayComponent<PfdControllerStateProps> {
  private readonly pfdControllerState = ConsumerSubject.create(null, PfdControlState.Onside);
  private readonly text = this.pfdControllerState.map((v) => {
    switch (v) {
      case PfdControlState.Inactive:
        return 'PFD CTRL\nINACTIVE';
      case PfdControlState.Offside:
        return 'X PFD CTRL\nACTIVE';
      default:
        return '';
    }
  });

  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onAfterRender(node: VNode): void {
    this.pfdControllerState.setConsumer(this.props.bus.getSubscriber<Epic2PfdControlEvents>().on('pfd_control_state'));
  }

  /** @inheritdoc */
  public render(): VNode | null {
    return <div
      class={{
        'border-box': true,
        'pfd-controller-state': true,
        'hidden': this.pfdControllerState.map((v) => v === PfdControlState.Onside),
      }}
      style={{
        // hack to force Coherent to re-render rather than glitch the top 5 pixels when the text changes
        'padding-left': this.pfdControllerState.map((v) => v === PfdControlState.Offside ? '0.001px' : '0'),
      }}
    >
      {this.text}
    </div>;
  }
}
