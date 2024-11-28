import { DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';

import { TouchButton, TouchButtonProps } from './TouchButton';

/** @inheritDoc */
export type BarTouchButtonProps = Omit<TouchButtonProps, 'variant'>

/** A bar touch button. */
export class BarTouchButton extends DisplayComponent<BarTouchButtonProps> {

  /** @inheritdoc */
  public render(): VNode {
    return (
      <TouchButton {...this.props} variant={'bar'}>
        {this.props.children}
      </TouchButton>
    );
  }
}
