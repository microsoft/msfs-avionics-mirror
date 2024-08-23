import {
  AdcEvents, AvionicsSystemState, AvionicsSystemStateEvent, ComponentProps, DisplayComponent, EventBus, FSComponent, Subject, VNode
} from '@microsoft/msfs-sdk';

import { RASystemEvents } from '@microsoft/msfs-wt21-shared';

import './RadioAltimeter.css';

/**
 * The properties for the Altimeter component.
 */
interface RadioAltimeterProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
}

/**
 * The Altimeter component.
 */
export class RadioAltimeter extends DisplayComponent<RadioAltimeterProps> {
  private radioRef = FSComponent.createRef<HTMLDivElement>();
  private radioVisible = Subject.create(false);

  /**
   * A callback called after the component renders.
   */
  public onAfterRender(): void {
    const adc = this.props.bus.getSubscriber<AdcEvents>();
    adc.on('radio_alt')
      .withPrecision(1)
      .handle(this.updateRadioAltitude.bind(this));

    this.radioVisible.sub(x => {
      this.radioRef.instance?.classList.toggle('hidden', !x);
    });

    this.props.bus.getSubscriber<RASystemEvents>()
      .on('ra_state').whenChanged()
      .handle(this.onRaStateChanged.bind(this));
  }

  /**
   * A callback called when the RA system state changes.
   * @param state The state change event to handle.
   */
  private onRaStateChanged(state: AvionicsSystemStateEvent): void {
    this.radioRef.instance.classList.toggle('fail', (state.current == AvionicsSystemState.Failed || state.current == AvionicsSystemState.Initializing));
  }

  /**
   * Updates the radio altitude readout when the radio altitude changes.
   * @param radioAlt The new altitude value.
   */
  private updateRadioAltitude(radioAlt: number): void {
    if (radioAlt <= 2500) {
      this.radioRef.instance.textContent = (Math.floor(Math.max(radioAlt, 0) / 10) * 10).toString();
      this.radioVisible.set(true);
    } else {
      this.radioVisible.set(false);
    }
  }

  /**
   * Renders the component.
   * @returns The component VNode.
   */
  public render(): VNode {
    return (
      <div ref={this.radioRef} />
    );
  }
}
