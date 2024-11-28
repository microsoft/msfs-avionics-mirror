import { DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';

import { IconProps } from './IconType';

/**
 * @inheritDoc
 */
export class IconPlaneTakeoff extends DisplayComponent<IconProps> {
  /**
   * @inheritDoc
   */
  public render(): VNode {
    return (
      <div {...(this.props?.class ? { class: this.props.class } : '')}>
        <svg
          viewBox="0 0 90.78 49.92"
          xml:space="preserve"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="transparent"
            stroke="#fff"
            stroke-width="3"
            stroke-miterlimit="10"
            d="m4.14 28.93s2.23-3.48 7.32-2.81 10.31 3 11.95 2.62c1.64-0.37 42.15-16.18 42.15-16.18l4.97 0.76s2.43-0.04 5.04-0.54 6.02-1.55 6.7 0.23-0.16 4.9-3.62 6.48-41.5 17.2-41.5 17.2-11.14 4.8-16.54 3.31-16.47-11.07-16.47-11.07z"
          />
        </svg>
      </div>
    );
  }
}
