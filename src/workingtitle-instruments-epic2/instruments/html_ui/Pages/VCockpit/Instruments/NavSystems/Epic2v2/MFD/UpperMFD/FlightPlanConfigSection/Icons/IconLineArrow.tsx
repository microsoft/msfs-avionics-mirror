import { DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';

import { IconProps } from './IconType';

/**
 * @inheritDoc
 */
export class IconLineArrow extends DisplayComponent<IconProps> {
  /**
   * @inheritDoc
   */
  public render(): VNode {
    return (
      <div {...(this.props?.class ? { class: this.props.class } : '')}>
        <svg
          viewBox="0 0 238.1 26.31"
          xml:space="preserve"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect fill="#fff" x="6.16" y="12.3" width="204.36" height="3.26" />
          <path
            fill="#fff"
            d="m211.15 7.1v13.71c0 0.48 0.48 0.82 0.93 0.66l19.38-6.87c0.62-0.22 0.62-1.1 0-1.32l-19.38-6.83c-0.46-0.17-0.93 0.17-0.93 0.65z"
          />
        </svg>
      </div>
    );
  }
}
