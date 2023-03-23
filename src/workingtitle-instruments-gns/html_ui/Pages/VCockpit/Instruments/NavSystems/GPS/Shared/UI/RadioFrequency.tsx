/// <reference types="@microsoft/msfs-types/js/simvar" />
import { ComponentProps, DisplayComponent, EventBus, FrequencyChangeEvent, FSComponent, RadioEvents, RadioType, SimVarValueType, Subject, VNode } from '@microsoft/msfs-sdk';

import './RadioFrequency.css';

/**
 * Props on the RadioFrequency component.
 */
interface RadioFrequencyProps extends ComponentProps {
  /** An instance of the EventBus. */
  bus: EventBus;

  /** The type of radio that will be displayed. */
  type: RadioType;

  /** The index of the radio. */
  index: number;

  /** If this is displaying the standby frequency. */
  standby?: boolean;

  /** How many digits beyond the decimal point should be displayed. */
  digits: 2 | 3;
}

/**
 * A component that displays a radio frequency on the left side screen column.
 */
export class RadioFrequency extends DisplayComponent<RadioFrequencyProps> {
  private readonly whole = Subject.create<string>('0');
  private readonly fract = Subject.create<string>('0');

  private readonly el = FSComponent.createRef<HTMLElement>();

  /** @inheritdoc */
  public onAfterRender(): void {
    this.props.bus.getSubscriber<RadioEvents>().on('set_frequency').handle(this.onFrequencySet.bind(this));

    if (this.props.type === RadioType.Com) {
      let frequency = SimVar.GetSimVarValue(`COM ${this.props.standby ? 'STANDBY' : 'ACTIVE'} FREQUENCY:${this.props.index}`, SimVarValueType.MHz);
      frequency = Math.round(frequency * Math.pow(10, this.props.digits)) / Math.pow(10, this.props.digits);

      this.whole.set(Math.floor(frequency).toFixed(0));

      const fractDigits = Math.round(frequency * Math.pow(10, this.props.digits)) % Math.pow(10, this.props.digits);
      this.fract.set(fractDigits.toFixed(0).padStart(this.props.digits, '0'));
    }
  }

  /**
   * Handles when an observed frequency is changed.
   * @param change The frequency change event to observe.
   */
  private onFrequencySet(change: FrequencyChangeEvent): void {
    if (change.radio.radioType === this.props.type && change.radio.index === this.props.index) {
      let frequency = this.props.standby ? change.radio.standbyFrequency : change.radio.activeFrequency;
      frequency = Math.round(frequency * Math.pow(10, this.props.digits)) / Math.pow(10, this.props.digits);

      this.whole.set(Math.floor(frequency).toFixed(0));

      const fractDigits = Math.round(frequency * Math.pow(10, this.props.digits)) % Math.pow(10, this.props.digits);
      this.fract.set(fractDigits.toFixed(0).padStart(this.props.digits, '0'));
    }
  }

  /**
   * Sets the radio frequency component to an active display.
   * @param isActive Whether or not the display should appear active.
   */
  public setActive(isActive: boolean): void {
    if (isActive) {
      this.el.instance.classList.add('active');
    } else {
      this.el.instance.classList.remove('active');
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={`radio-frequency ${this.props.type === RadioType.Nav ? 'centered-value' : ''}`} ref={this.el}>{this.whole}.<span class='smaller'>{this.fract}</span></div>
    );
  }
}