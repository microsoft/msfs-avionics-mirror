import { ComponentProps, EventBus, DisplayComponent, VNode, FSComponent, ConsumerSubject, SubscribableMapFunctions } from '@microsoft/msfs-sdk';

import './Sr22tPercentPowerDisplay.css';
import { Sr22tEngineComputerEvents } from '../../MFD/Sr22tEcu/Sr22tEngineComputer';

/** The properties for the {@link Sr22tPercentPowerDisplay} component. */
interface Sr22tPercentPowerDisplayProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
}

/**
 * The Sr22tPercentPowerComponent.
 * Displays engine percent power readout on the top-left side of the PFD.
 */
export class Sr22tPercentPowerDisplay extends DisplayComponent<Sr22tPercentPowerDisplayProps> {
  private readonly pctPower = ConsumerSubject.create(this.props.bus.getSubscriber<Sr22tEngineComputerEvents>().on('ecu-percent-power'), 0)
    .map(SubscribableMapFunctions.withPrecision(1));

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="sr22t-percent-power-display">
        <div style={{ display: 'flex', 'align-items': 'flex-end' }}>
          <span class="size24 percent-power-value">
            {this.pctPower}%
          </span>
          <span class="size16 percent-power-label">&nbsp;Power</span>
        </div>
      </div>
    );
  }
}