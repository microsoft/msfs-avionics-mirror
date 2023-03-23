import { ComponentProps, DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';

import './LeftGaugePointer.css';

/**
 * The LeftGaugePointer component.
 */
export class LeftGaugePointer extends DisplayComponent<ComponentProps> {

  /** @inheritdoc */
  public render(): VNode {
    return (
      <>
        <svg height="271" width="13">
          <path d="M 0 0 l 13 0 l -8 8 l 0 263 l -5 0 z" fill="var(--wt21-colors-white)" />
        </svg>
      </>
    );
  }
}