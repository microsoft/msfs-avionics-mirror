import { DisplayComponent, FSComponent, RadioType, VNode } from '@microsoft/msfs-sdk';

import { PropsWithBus } from '../UITypes';
import { RadioFrequency } from './RadioFrequency';

import './RadioPane.css';

/**
 * Props on the RadioPane component.
 */
interface RadioPaneProps extends PropsWithBus {
  /** The radio index to display. */
  index: number;

  /** The type of radio to display. */
  type: RadioType;
}

/**
 * A component that displays radio frequencies.
 */
export class RadioPane extends DisplayComponent<RadioPaneProps> {

  private readonly standbyFreq = FSComponent.createRef<RadioFrequency>();

  /**
   * Sets whether or not the radio field is the active field.
   * @param isActive Whether or not it is active.
   */
  public setActive(isActive: boolean): void {
    this.standbyFreq.instance.setActive(isActive);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='com-pane'>
        <h1>{this.props.type === RadioType.Com ? 'COM' : 'VLOC'}</h1>
        <RadioFrequency bus={this.props.bus} index={this.props.index} type={this.props.type} digits={this.props.type === RadioType.Com ? 3 : 2} />
        <RadioFrequency bus={this.props.bus} index={this.props.index} type={this.props.type} digits={this.props.type === RadioType.Com ? 3 : 2} ref={this.standbyFreq} standby />
      </div>
    );
  }
}