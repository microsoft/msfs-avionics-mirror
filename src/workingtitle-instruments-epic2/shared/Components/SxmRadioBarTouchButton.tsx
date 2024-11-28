import { DisplayComponent, FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';

import { BarTouchButtonArrow } from './BarTouchButtonArrow';
import { RadioButton } from './RadioButton';
import { TouchButton, TouchButtonProps } from './TouchButton';

import './SxmRadioBarTouchButton.css';

/** Props for SxmRadioBarTouchButton. */
interface SxmRadioBarTouchButtonProps extends Omit<TouchButtonProps, 'variant'> {
  /** Css class to apply to root element. */
  class?: string;
}

/** An sxm radio touch button with a special subscript label, an arrow icon on the left side and radio selection circle on the right. */
export class SxmRadioBarTouchButton extends DisplayComponent<SxmRadioBarTouchButtonProps> {

  /** @inheritdoc */
  public render(): VNode {
    return (
      <TouchButton {...this.props} variant={'bar'} class={(this.props.class ?? '') + ' sxm-radio-bar-touch-button'} label={(
        <>
          <BarTouchButtonArrow isLeftArrow={true} isDisabled />
          <div>SXM<span class="superscript">TM</span> WX</div>
          <div class="selector-position">
            <RadioButton value={true} selectedValue={Subject.create<boolean>(false)} isDisabled />
          </div>
        </>
      )}>
      </TouchButton>
    );
  }
}
