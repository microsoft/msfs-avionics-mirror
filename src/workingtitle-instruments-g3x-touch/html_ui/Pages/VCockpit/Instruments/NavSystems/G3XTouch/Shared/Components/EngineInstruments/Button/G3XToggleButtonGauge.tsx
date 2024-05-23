import { ConsumerSubject, FSComponent, VNode, XMLHostedLogicGauge } from '@microsoft/msfs-sdk';

import { ToggleTouchButton } from '@microsoft/msfs-garminsdk';

import { G3XBaseGauge } from '../G3XBaseGauge';
import { G3XToggleButtonGaugeProps } from '../../G3XGaugesConfigFactory/Gauges/G3XToggleButtonGaugeProps';

import './G3XToggleButtonGauge.css';

/** A button that can be used to toggle an event on or off. */
export class G3XToggleButtonGauge extends G3XBaseGauge<Partial<G3XToggleButtonGaugeProps> & XMLHostedLogicGauge> {
  private readonly state = ConsumerSubject.create<boolean>(
    this.props.bus && this.props.event ? this.props.bus.getSubscriber<any>().on(this.props.event) : null,
    false
  );

  /** @inheritDoc */
  protected initGauge(): void {
    // noop
  }

  /** @inheritDoc */
  protected renderGauge(): VNode {
    return (
      <ToggleTouchButton
        state={this.state}
        label={this.props.label}
        onPressed={(button, state) => {
          if (this.props.event && this.props.bus) {
            this.props.bus.pub(this.props.event, !state.get(), this.props.sync ?? true, this.props.cached ?? true);
          }
        }}
        class='g3x-toggle-button-gauge'
      />
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.state.destroy();

    super.destroy();
  }
}