import { DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';

import { BarTouchButtonArrow } from './BarTouchButtonArrow';
import { TouchButton, TouchButtonProps } from './TouchButton';

import './BarTouchButtonWithArrowAndSelector.css';

/** Props for BarTouchButtonWithArrowAndSelector. */
interface BarTouchButtonProps extends Omit<TouchButtonProps, 'variant'> {
  /** Css class to apply to root element. */
  class?: string;
}

/** A touch button with an arrow icon and radio or checkbox selector. */
export class BarTouchButtonWithArrowAndSelector extends DisplayComponent<BarTouchButtonProps> {

  /** @inheritdoc */
  public render(): VNode {
    return (
      <TouchButton {...this.props} variant={'bar'} class={(this.props.class ?? '') + ' bar-touch-button-with-arrow-and-selector'} label={(
        <>
          <BarTouchButtonArrow isLeftArrow isDisabled />
          <div>{this.props.label}</div>
          <div class="selector-position">
            {this.props.children}
          </div>
        </>
      )}>
      </TouchButton>
    );
  }
}
