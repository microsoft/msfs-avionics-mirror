import {
  ComponentProps, DisplayComponent, FSComponent, MappedSubject, ObjectSubject, ReadonlyFloat64Array, Subject,
  Subscribable, Vec2Math, Vec2Subject, VNode
} from '@microsoft/msfs-sdk';

import { GtcOrientation } from '@microsoft/msfs-wtg3000-common';

import './FlightPlanFromToArrow.css';

/**
 * Component props for {@link FlightPlanFromToArrow}.
 */
export interface FlightPlanFromToArrowProps extends ComponentProps {
  /** The visible index of the FROM leg in the list. */
  fromIndex: Subscribable<number | undefined>;

  /** The visible index of the TO leg in the list. */
  toIndex: Subscribable<number | undefined>;

  /** Whether the FROM leg is in an airway segment. */
  isFromLegInAirway: Subscribable<boolean>;

  /** Whether the TO leg is in an airway segment. */
  isToLegInAirway: Subscribable<boolean>;

  /** The height of each list item in pixels. */
  listItemHeightPx: number;

  /** The amount of space between each list item in pixels. Defaults to zero pixels. */
  listItemSpacingPx: number;

  /**
   * The window of rendered list items, as `[startIndex, endIndex]`, where `startIndex` is the index of the first
   * rendered item, inclusive, and `endIndex` is the index of the last rendered item, exclusive. If not defined, then
   * it is assumed that the window includes all list items.
   */
  listRenderWindow?: Subscribable<ReadonlyFloat64Array>;

  /** The GTC orientation. */
  gtcOrientation: GtcOrientation;
}

/** The FlightPlanFromToArrow component. */
export class FlightPlanFromToArrow extends DisplayComponent<FlightPlanFromToArrowProps> {
  private readonly rootStyle = ObjectSubject.create({
    'display': 'none',
    'height': '',
    'margin-top': '',
    'margin-left': ''
  });

  private readonly path = Subject.create('');

  private readonly state = MappedSubject.create(
    this.props.fromIndex,
    this.props.toIndex,
    this.props.listRenderWindow ?? Vec2Subject.create(Vec2Math.create(0, Infinity)),
    this.props.isFromLegInAirway,
    this.props.isToLegInAirway
  );

  /** @inheritDoc */
  public onAfterRender(): void {
    this.state.sub(this.onArrowStateChanged.bind(this), true);
  }

  /**
   * Responds to when the state of this arrow changes.
   * @param state The new state.
   */
  private onArrowStateChanged(
    state: readonly [
      fromIndex: number | undefined,
      toIndex: number | undefined,
      listRenderWindow: ReadonlyFloat64Array,
      isFromLegInAirway: boolean,
      isToLegInAirway: boolean
    ]
  ): void {
    const [fromIndex, toIndex, listRenderWindow, isFromLegInAirway, isToLegInAirway] = state;

    if (toIndex === undefined || toIndex < 0) {
      this.rootStyle.set('display', 'none');
      return;
    }

    if (fromIndex === undefined) {
      this.drawDirectToArrow(toIndex, listRenderWindow);
    } else {
      this.drawLegToLegArrow(fromIndex, toIndex, listRenderWindow, isFromLegInAirway, isToLegInAirway);
    }
  }

  /**
   * Draws this arrow as a direct-to style arrow.
   * @param toIndex The index of the TO leg.
   * @param listRenderWindow The window of rendered list items, as `[startIndex, endIndex]`, where `startIndex` is the
   * index of the first rendered item, inclusive, and `endIndex` is the index of the last rendered item, exclusive.
   */
  private drawDirectToArrow(toIndex: number, listRenderWindow: ReadonlyFloat64Array,): void {
    // If the arrow is completely outside the render window, then hide it.
    if (toIndex < listRenderWindow[0] || toIndex >= listRenderWindow[1]) {
      this.rootStyle.set('display', 'none');
      return;
    }

    const toIndexY = (toIndex - listRenderWindow[0]) * (this.props.listItemHeightPx + this.props.listItemSpacingPx);
    const marginTopPx = toIndexY - 6;

    this.rootStyle.set('display', '');
    this.rootStyle.set('height', '50px');
    this.rootStyle.set('margin-top', `${marginTopPx}px`);
    this.rootStyle.set('margin-left', '-3px');

    this.path.set(
      this.props.gtcOrientation === 'horizontal'
        ? 'M 25 23 l 0 9 l 17 -14 l -17 -13 l 0 9 l -20 0 l 0 9 Z'
        : 'M 17 14 L 17 19 L 26 11 L 17 4 L 17 9 L 7 9 L 7 14 Z'
    );
  }

  /**
   * Draws this arrow as a leg-to-leg style arrow.
   * @param fromIndex The index of the FROM leg.
   * @param toIndex The index of the TO leg.
   * @param listRenderWindow The window of rendered list items, as `[startIndex, endIndex]`, where `startIndex` is the
   * index of the first rendered item, inclusive, and `endIndex` is the index of the last rendered item, exclusive.
   * @param isFromLegInAirway Whether the FROM leg is in an airway.
   * @param isToLegInAirway Whether the TO leg is in an airway.
   */
  private drawLegToLegArrow(
    fromIndex: number,
    toIndex: number,
    listRenderWindow: ReadonlyFloat64Array,
    isFromLegInAirway: boolean,
    isToLegInAirway: boolean
  ): void {
    const [listRenderWindowStart, listRenderWindowEnd] = listRenderWindow;

    // If the arrow is completely outside the render window, then hide it.
    if (toIndex < listRenderWindowStart || fromIndex >= listRenderWindowEnd) {
      this.rootStyle.set('display', 'none');
      return;
    }

    // Clamp the arrow to extend at most from the leg immediately before the start of the render window to the leg
    // immediately after the end of the render window. This ensures that the arrow does not extend too far outside the
    // render window.
    const drawFromIndex = Math.max(fromIndex, listRenderWindowStart - 1);
    const drawToIndex = Math.min(toIndex, listRenderWindowEnd);

    const marginTopPx = (drawFromIndex - listRenderWindowStart) * (this.props.listItemHeightPx + this.props.listItemSpacingPx);

    const distance = drawToIndex - drawFromIndex;

    const longPartLength = distance * (this.props.listItemHeightPx + this.props.listItemSpacingPx) - 2;

    this.rootStyle.set('display', '');
    this.rootStyle.set('height', `${longPartLength + 100}px`);
    this.rootStyle.set('margin-top', `${marginTopPx}px`);
    this.rootStyle.set('margin-left', '0px');

    let backEndLength: number;
    if (isFromLegInAirway && !isToLegInAirway) {
      backEndLength = this.props.gtcOrientation === 'horizontal' ? 20 : 27;
    } else {
      backEndLength = this.props.gtcOrientation === 'horizontal' ? 10 : 21;
    }

    // The first part of the path is the FROM part of the arrow
    // The second part is the TO part with the arrow head
    // The second part is relatively positioned, so we only have to change 1 Y value to stretch the whole arrow
    this.path.set(
      this.props.gtcOrientation === 'horizontal'
        ? `M 13 30 c 0 -8 4 -12 12 -12 l ${backEndLength} 0 l 0 -9 L 25 9 c -14 0 -21 7 -21 21 L 4 ${longPartLength} c 0 14 7 21 21 21 l 0 9 l 17 -14 l -17 -13 l 0 9 c -8 0 -12 -4 -12 -12 Z`
        : `M 10 16 C 10 12 12 10 16 10 L ${backEndLength} 10 l 0 -5 L 16 5 C 9 5 5 9 5 16 L 5 ${longPartLength} c 0 7 4 11 11 11 l 0 5 l 9 -8 l -9 -7 l 0 5 c -4 0 -6 -2 -6 -6 Z`
    );
  }

  /** @inheritDoc */
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

  /** @inheritDoc */
  public destroy(): void {
    this.state.destroy();

    super.destroy();
  }
}
