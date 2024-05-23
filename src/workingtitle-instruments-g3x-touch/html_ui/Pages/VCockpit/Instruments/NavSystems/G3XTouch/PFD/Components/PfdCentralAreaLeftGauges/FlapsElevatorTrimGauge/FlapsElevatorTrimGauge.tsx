import { ComponentProps, DisplayComponent, EventBus, FSComponent, VNode } from '@microsoft/msfs-sdk';
import { FlapsGaugeConfig } from '../FlapsElevatorTrimGauge/FlapsGauge/FlapsGaugeConfig';
import { FlapsGauge } from '../FlapsElevatorTrimGauge/FlapsGauge/FlapsGauge';
import { ElevatorTrimGauge } from '../FlapsElevatorTrimGauge/ElevatorTrimGauge/ElevatorTrimGauge';

import './FlapsElevatorTrimGauge.css';

/** The properties for the {@link FlapsElevatorTrimGauge} component. */
export interface FlapsElevatorTrimGaugeProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
  /** The configuration for the flaps gauge. */
  flapsGaugeConfig: FlapsGaugeConfig | undefined;
  /** Whether the elevator trim gauge should be displayed. */
  useElevatorTrim: boolean;
}

/** The FlapsElevatorTrimGauge. */
export class FlapsElevatorTrimGauge extends DisplayComponent<FlapsElevatorTrimGaugeProps> {
  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='flaps-elevator-trim-gauge'>
        {this.props.flapsGaugeConfig &&
            <FlapsGauge bus={this.props.bus} config={this.props.flapsGaugeConfig} />
        }
        {this.props.useElevatorTrim &&
            <ElevatorTrimGauge bus={this.props.bus} />
        }
      </div>
    );
  }
}