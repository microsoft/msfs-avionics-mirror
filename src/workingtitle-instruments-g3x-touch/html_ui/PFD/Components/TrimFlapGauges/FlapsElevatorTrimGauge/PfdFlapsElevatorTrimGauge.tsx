import { ComponentProps, DisplayComponent, EventBus, FSComponent, VNode } from '@microsoft/msfs-sdk';

import { PfdElevatorTrimGauge } from './ElevatorTrimGauge/PfdElevatorTrimGauge';
import { PfdElevatorTrimGaugeConfig } from './ElevatorTrimGauge/PfdElevatorTrimGaugeConfig';
import { PfdFlapsGauge } from './FlapsGauge/PfdFlapsGauge';
import { PfdFlapsGaugeConfig } from './FlapsGauge/PfdFlapsGaugeConfig';

import './PfdFlapsElevatorTrimGauge.css';

/**
 * Component props for {@link PfdFlapsElevatorTrimGauge}.
 */
export interface PfdFlapsElevatorTrimGaugeProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /**
   * A configuration object that defines options for the flaps gauge. If not defined, then the flaps gauge will not be
   * rendered.
   */
  flapsGaugeConfig?: PfdFlapsGaugeConfig;

  /**
   * A configuration object that defines options for the elevator trim gauge. If not defined, then the elevator trim
   * gauge will not be rendered.
   */
  elevatorTrimGaugeConfig?: PfdElevatorTrimGaugeConfig;
}

/**
 * A PFD flaps and elevator trim gauge.
 */
export class PfdFlapsElevatorTrimGauge extends DisplayComponent<PfdFlapsElevatorTrimGaugeProps> {
  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='flaps-elevator-trim-gauge'>
        {this.props.flapsGaugeConfig !== undefined && (
          <PfdFlapsGauge bus={this.props.bus} config={this.props.flapsGaugeConfig} />
        )}
        {this.props.elevatorTrimGaugeConfig !== undefined && (
          <PfdElevatorTrimGauge bus={this.props.bus} />
        )}
      </div>
    );
  }
}