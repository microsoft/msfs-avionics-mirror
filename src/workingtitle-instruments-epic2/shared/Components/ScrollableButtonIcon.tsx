import { ComponentProps, DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';

import './ScrollableButtonIcon.css';

/** Props for ScrollableButtonIcon. */
export interface ScrollableButtonIconsProps extends ComponentProps {
  /** Css class string to apply to root element. */
  class?: string;
}

/** A button icon for scrollable touch buttons. */
export class ScrollableButtonIcon extends DisplayComponent<ScrollableButtonIconsProps> {
  /** @inheritdoc */
  public render(): VNode {
    return (
      <svg
        class="scrollable-button-icon"
        viewBox="0 0 16 18"
        style={{
          'width': '16px',
          'height': '18px',
          'transform': 'scale(0.8)'
        }}
      >
        <path fill="transparent" d="M11.6,3.33C10.56,2.49,9.25,2,7.89,2C4.64,2,2,4.64,2,7.89c0,2.85,2.03,5.23,4.71,5.77L6.07,12l3.16,0.58
            l3.21-6.62L9.61,5.09L11.6,3.33z"/>
        <path fill="#00FFF4" d="M6.07,12l0.65,1.66C4.03,13.12,2,10.74,2,7.89C2,4.64,4.64,2,7.89,2c1.36,0,2.67,0.49,3.71,1.33l-2,1.76
            l2.83,0.87l3.04,0.93l-1.03-6.05L13.12,2c-1.43-1.27-3.29-2-5.23-2C3.54,0,0,3.54,0,7.89c0,4.23,3.35,7.68,7.53,7.87L8.4,18
            l3.71-4.89l-2.88-0.53L6.07,12z"/>
      </svg>
    );
  }
}
