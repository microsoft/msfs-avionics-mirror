import { DisplayComponent, FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';

import { CheckBox } from './Checkbox';
import { TouchButton, TouchButtonProps } from './TouchButton';

/** Props for TouchButtonCheckbox. */
interface TouchButtonCheckboxProps extends Omit<TouchButtonProps, 'onPressed'> {
  // interface TouchButtonCheckboxProps extends Omit<TouchButtonProps, 'variant'> {
  /** The button label. */
  readonly label: string;
  /** Checked state. */
  readonly isChecked: Subject<boolean>;
  /** Css class string to apply to root element. */
  readonly class?: string;
}

/** A touch button with a checkbox */
export class TouchButtonCheckbox extends DisplayComponent<TouchButtonCheckboxProps> {
  /** @inheritdoc */
  public render(): VNode {
    return (
      <TouchButton
        {...this.props}
        class={(this.props.class ?? '') + ' with-checkbox'}
        onPressed={() => this.props.isChecked.set(!this.props.isChecked.get())}
        label={
          <div style="display: flex; justify-content: center; align-items: center;">
            <span class="touch-button-checkbox-label" style="height: 0.65em;">{this.props.label}</span>
            <CheckBox isChecked={this.props.isChecked} isEnabled={this.props.isEnabled} />
          </div>
        }
      />
    );
  }
}
