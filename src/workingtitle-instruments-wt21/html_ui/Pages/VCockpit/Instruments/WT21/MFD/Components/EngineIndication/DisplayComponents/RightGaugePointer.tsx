import { ComponentProps, DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';

import './RightGaugePointer.css';

/**
 * The RightGaugePointer component.
 */
export class RightGaugePointer extends DisplayComponent<ComponentProps> {

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="right-pointer">
        <svg height="271" width="13">
          <path d="M 0 0 l 13 0 l 0 271 l -5 0 l 0 -263 z" fill="var(--wt21-colors-white)" />
        </svg>
      </div>
    );
  }
}