import { ComponentProps, DisplayComponent, FSComponent, Subscribable, SubscribableUtils, VNode } from '@microsoft/msfs-sdk';

import './BarTouchButtonArrow.css';

/** Props for BarTouchButtonArrow. */
export interface BarTouchButtonArrowProps extends ComponentProps {
  /** Whether the bar touch button has a left arrow or not. Defaults to `false`. */
  isLeftArrow?: boolean | Subscribable<boolean>;

  /** Whether the bar touch button has a right arrow or not. Defaults to `false`. */
  isRightArrow?: boolean | Subscribable<boolean>;

  /** Whether the arrow icon is disabled. Defaults to `false`. */
  isDisabled?: boolean | Subscribable<boolean>;
}

/** A bar touch button arrow icon. */
export class BarTouchButtonArrow extends DisplayComponent<BarTouchButtonArrowProps> {
  private readonly isLeftArrow = SubscribableUtils.toSubscribable(this.props.isLeftArrow ?? false, true);
  private readonly isRightArrow = SubscribableUtils.toSubscribable(this.props.isRightArrow ?? false, true);
  private readonly isDisabled = SubscribableUtils.toSubscribable(this.props.isDisabled ?? false, true);

  /** @inheritdoc */
  public render(): VNode {
    return (
      <svg height="16" width="22">
        <polygon
          class={{
            'bar-touch-button-arrow': true,
            'hidden': this.isRightArrow,
            'arrow-disabled': this.isDisabled
          }}
          points="14,0 14,14 0,7"
          fill="none"
        />
        <polygon
          class={{
            'bar-touch-button-arrow': true,
            'hidden': this.isLeftArrow,
            'arrow-disabled': this.isDisabled
          }}
          points="1,0 1,14 14,7"
          fill="none"
        />
      </svg>
    );
  }
}
