import { ComponentProps, DisplayComponent, FSComponent, MappedSubject, ObjectSubject, Subscribable, VNode } from '@microsoft/msfs-sdk';

import { GtcOrientation } from '@microsoft/msfs-wtg3000-common';

import './FlightPlanFromToArrow.css';

/** The properties for the {@link FlightPlanFromToArrow} component. */
interface FlightPlanFromToArrowProps extends ComponentProps {
  /** The visible index of the from leg in the list. */
  readonly fromIndex: Subscribable<number | undefined>;
  /** The visible index of the to leg in the list. */
  readonly toIndex: Subscribable<number | undefined>;
  /** The height of each list item in pixels. */
  readonly listItemHeightPx: number;
  /** The amount of space between each list item in pixels. Defaults to zero pixels. */
  readonly listItemSpacingPx: number;
  /** Whether the from leg is in an airway segment. */
  readonly isFromLegInAirway: Subscribable<boolean>;
  /** Whether the to leg is in an airway segment. */
  readonly isToLegInAirway: Subscribable<boolean>;
  /** The GTC orientation. */
  readonly gtcOrientation: GtcOrientation;
}

/** The FlightPlanFromToArrow component. */
export class FlightPlanFromToArrow extends DisplayComponent<FlightPlanFromToArrowProps> {
  private readonly rootStyle = ObjectSubject.create({ height: '', 'margin-top': '', 'margin-left': '' });

  private readonly path = MappedSubject.create(([fromIndex, toIndex, isFromLegInAirway, isToLegInAirway]) => {
    const { gtcOrientation } = this.props;

    if (toIndex === undefined || toIndex < 0) {
      return '';
    }

    if (fromIndex === undefined) {
      const marginTopPx = (toIndex * this.props.listItemHeightPx) + (toIndex * this.props.listItemSpacingPx) - 6;
      this.rootStyle.set('height', '50px');
      this.rootStyle.set('margin-top', marginTopPx.toFixed(0));
      this.rootStyle.set('margin-left', '-3px');
      return gtcOrientation === 'horizontal'
        ? 'M 25 23 l 0 9 l 17 -14 l -17 -13 l 0 9 l -20 0 l 0 9 Z'
        : 'M 17 14 L 17 19 L 26 11 L 17 4 L 17 9 L 7 9 L 7 14 Z';
    }

    const distance = toIndex - fromIndex;

    const longPart = (distance * this.props.listItemHeightPx) + (distance * this.props.listItemSpacingPx) - 2;
    const marginTopPx = (fromIndex * this.props.listItemHeightPx) + (fromIndex * this.props.listItemSpacingPx);

    this.rootStyle.set('height', (longPart + 100).toFixed(0));
    this.rootStyle.set('margin-top', marginTopPx.toFixed(0));
    this.rootStyle.set('margin-left', '0px');

    let backEndLength = gtcOrientation === 'horizontal' ? '10' : '21';
    if (isFromLegInAirway && !isToLegInAirway) {
      backEndLength = gtcOrientation === 'horizontal' ? '20' : '27';
    }

    // The first part of the path is the FROM part of the arrow
    // The second part is the TO part with the arrow head
    // The second part is realtively positioned, so we only have to changing 1 Y value to stretch the whole arrow
    return gtcOrientation === 'horizontal'
      ? `M 13 30 c 0 -8 4 -12 12 -12 l ${backEndLength} 0 l 0 -9 L 25 9 c -14 0 -21 7 -21 21 L 4 ${longPart} c 0 14 7 21 21 21 l 0 9 l 17 -14 l -17 -13 l 0 9 c -8 0 -12 -4 -12 -12 Z`
      : `M 10 16 C 10 12 12 10 16 10 L ${backEndLength} 10 l 0 -5 L 16 5 C 9 5 5 9 5 16 L 5 ${longPart} c 0 7 4 11 11 11 l 0 5 l 9 -8 l -9 -7 l 0 5 c -4 0 -6 -2 -6 -6 Z`;
  }, this.props.fromIndex, this.props.toIndex, this.props.isFromLegInAirway, this.props.isToLegInAirway);

  /** @inheritdoc */
  public render(): VNode {
    return (
      <svg
        class="flight-plan-from-to-arrow"
        style={this.rootStyle}
      >
        <path
          d={this.path}
          fill="magenta"
          stroke="black"
          stroke-width={this.props.gtcOrientation === 'horizontal' ? '3px' : '1.5px'}
        />
      </svg>
    );
  }
}
