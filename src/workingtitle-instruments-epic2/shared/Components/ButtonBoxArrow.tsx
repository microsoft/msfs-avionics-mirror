import { DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';

import { TouchButton, TouchButtonProps } from './TouchButton';

import './ButtonBoxArrow.css';

/**
 * @inheritDoc
 */
interface ButtonBoxArrowProps extends Omit<TouchButtonProps, 'variant'> {
  /**
   * Title displayed above the button
   */
  title?: string;
  /**
   * Fixed width to apply
   */
  width?: number;
}

/**
 * A Button that looks like an input box with a triangle
 */
export class ButtonBoxArrow extends DisplayComponent<ButtonBoxArrowProps> {
  /** @inheritdoc */
  public render(): VNode {
    const { title, ...rest } = this.props;
    return (
      <div
        class={'button-box-arrow'}
        style={this.props.width ? { width: `${this.props.width}px` } : ''}
      >
        <div class={'button-box-arrow-label'}>{title}</div>
        <TouchButton {...rest} variant={'small'} class={'box-arrow'}>
          <svg height="12" width="16">
            <polygon points="0,0 0,12 12,6" class="triangle" />
          </svg>
        </TouchButton>
      </div>
    );
  }
}
