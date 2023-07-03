import {
  ComponentProps, DisplayComponent, FSComponent, MappedSubject,
  ObjectSubject, Subscribable, VNode,
} from '@microsoft/msfs-sdk';

import './FlightPlanTextFromToArrow.css';

/**
 * The properties for the {@link FlightPlanTextFromToArrow} component.
 */
export interface FlightPlanTextFromToArrowProps extends ComponentProps {
  /** The visible index of the from leg in the list. */
  readonly fromIndex: Subscribable<number | undefined>;
  /** The visible index of the to leg in the list. */
  readonly toIndex: Subscribable<number | undefined>;
  /** The height of each list item in pixels. */
  readonly listItemHeightPx: number;
}

/**
 * An arrow displayed in the flight plan text inset which indicates the "from" and "to" flight plan legs.
 */
export class FlightPlanTextFromToArrow extends DisplayComponent<FlightPlanTextFromToArrowProps> {
  private readonly rootStyle = ObjectSubject.create({ height: '', 'margin-top': '', 'margin-left': '' });

  private readonly path = MappedSubject.create(([fromIndex, toIndex]) => {
    if (toIndex === undefined || toIndex < 0 || (fromIndex !== undefined && fromIndex < 0 && toIndex > 4)) {
      return '';
    }

    if (fromIndex === undefined) {
      const marginTopPx = (toIndex * this.props.listItemHeightPx) + 0;
      this.rootStyle.set('height', '50px');
      this.rootStyle.set('margin-top', marginTopPx.toFixed(0));
      this.rootStyle.set('margin-left', '0px');
      return 'M 5 9 L 5 14 l 10 0 l 0 5 l 8 -8 l -8 -7 l 0 5 Z';
    }

    const distance = toIndex - fromIndex;

    const longPart = (distance * this.props.listItemHeightPx) + 8;
    const marginTopPx = fromIndex * this.props.listItemHeightPx;

    this.rootStyle.set('height', (longPart + 100).toFixed(0));
    this.rootStyle.set('margin-top', marginTopPx.toFixed(0));
    this.rootStyle.set('margin-left', '0px');

    // The first part of the path is the FROM part of the arrow
    // The second part is the TO part with the arrow head
    // The second part is realtively positioned, so we only have to changing 1 Y value to stretch the whole arrow
    return `M 9 18 c 0 -4 0 -4 3 -4 l 11 0 l 0 -5 L 10 9 c -6 0 -6 0 -6 6 L 4 ${longPart} c 0 6 0 6 6 6 l 5 0 l 0 5 l 8 -8 l -8 -7 l 0 5 c -6 0 -6 0 -6 -4 Z`;
  }, this.props.fromIndex, this.props.toIndex);

  /** @inheritdoc */
  public render(): VNode {
    return (
      <svg
        class="flight-plan-text-from-to-arrow"
        style={this.rootStyle}
      >
        <path
          d={this.path}
          fill="magenta"
        />
      </svg>
    );
  }

  /** Destroys subs and comps. */
  public destroy(): void {
    this.path.destroy();
  }
}
