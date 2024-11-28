import { DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';

import { IconProps } from './IconType';

/**
 * @inheritDoc
 */
export class IconPlaneLanding extends DisplayComponent<IconProps> {
  /**
   * @inheritDoc
   */
  public render(): VNode {
    return (
      <div {...(this.props?.class ? { class: this.props.class } : '')}>
        <svg
          viewBox="0 0 84.88 56.98"
          xml:space="preserve"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="transparent"
            stroke="#fff"
            stroke-width="3"
            stroke-miterlimit="10"
            d="m7.67 7.76s3.98-1.12 7.33 2.78 5.69 9.11 7.16 9.92 42.21 16.02 42.21 16.02l3.2 3.88s1.84 1.59 4.12 2.96 5.52 2.86 4.85 4.64-3.38 3.55-7.02 2.42-42.41-14.82-42.41-14.82-11.5-3.85-14.54-8.57-4.9-19.23-4.9-19.23z"
          />
        </svg>
      </div>
    );
  }
}
