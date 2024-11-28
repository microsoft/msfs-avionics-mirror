import { DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';

import { BarTouchButtonProps } from './BarTouchButton';
import { ScrollableButtonIcon } from './ScrollableButtonIcon';
import { TouchButton } from './TouchButton';

import './ScrollableBarTouchButton.css';

/** A scrollable bar touch button. */
export class ScrollableBarTouchButton extends DisplayComponent<BarTouchButtonProps> {

  /** @inheritdoc */
  public render(): VNode {
    return (
      <TouchButton {...this.props} variant={'bar'} class={(this.props.class ?? '') + ' scrollable-bar-touch-button'} label={(
        <>
          <div class="scrollable-button-row-top">
            <div>{this.props.label}</div>
            {this.props.children}
          </div>
          <div class="scrollable-button-row-bottom">
            <div>BRT</div>
            <ScrollableButtonIcon />
          </div>
        </>
      )}>
      </TouchButton>
    );
  }
}
