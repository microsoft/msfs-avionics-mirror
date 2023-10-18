import {
  ComponentProps, DisplayComponent, EventBus, FSComponent, ReadonlyFloat64Array, Subject, Subscribable, SubscribableUtils,
  Vec2Math, Vec2Subject, VNode,
} from '@microsoft/msfs-sdk';

import { GarminTouchList } from './GarminTouchList';

/**
 * Component props for TouchList.
 */
export interface TouchListProps extends ComponentProps {
  /** The event bus. */
  bus: EventBus,

  /**
   * The height of each list item in pixels.
   */
  listItemHeightPx: number | Subscribable<number>;

  /** The amount of space between each list item in pixels. Defaults to zero pixels. */
  listItemSpacingPx?: number | Subscribable<number>;

  /**
   * The height of the list in pixels. If not defined, the default value depends on whether the number of items per
   * page is defined. If the number of items per page is defined, the height defaults to the sum of the list item
   * height and spacing multiplied by the number of items per page. If the number of items per page is not defined,
   * the height defaults to 100 pixels.
   */
  heightPx?: number | Subscribable<number>;

  /** The number of visible items per page. If not defined, the list will not snap to list items when scrolling. */
  itemsPerPage?: number | Subscribable<number>;

  /**
   * The maximum number of items that can be rendered simultaneously. Ignored if `itemsPerPage` is not defined. The
   * value will be clamped to be greater than or equal to `itemsPerPage * 3`. Defaults to infinity.
   */
  maxRenderedItemCount?: number | Subscribable<number>;

  /** The total number of items in the list. */
  itemCount: Subscribable<number>;
}

/**
 * A touchscreen list which can be vertically scrolled by clicking and dragging the mouse.
 */
export class TouchList extends DisplayComponent<TouchListProps> {
  private readonly listRef = FSComponent.createRef<GarminTouchList>();

  /**
   * The number of visible list items per page displayed by this list, or `undefined` if the number of items per page
   * is not prescribed.
   */
  public readonly itemsPerPage = this.props.itemsPerPage === undefined ? undefined : SubscribableUtils.toSubscribable(this.props.itemsPerPage, true);

  private readonly _listItemHeightWithMarginPx = Subject.create(0);
  /** The height, in pixels, of one item in this list plus its bottom margin. */
  public readonly listItemHeightWithMarginPx = this._listItemHeightWithMarginPx as Subscribable<number>;

  private readonly _totalHeightPx = Subject.create(0);
  /** The total height, in pixels, of all items in this list plus their margins. */
  public readonly totalHeightPx = this._totalHeightPx as Subscribable<number>;

  private readonly _heightPx = Subject.create(0);
  /** The visible height of this list, in pixels. */
  public readonly heightPx = this._heightPx as Subscribable<number>;

  private readonly _scrollY = Subject.create(0);
  /**
   * This list's current scroll position, in pixels. The scroll position is zero when the list is scrolled to the top
   * (without overscroll) and increases as the list is scrolled down.
   */
  public readonly scrollY = this._scrollY as Subscribable<number>;

  private readonly _scrollPercentage = Subject.create(0);
  /**
   * This list's current scroll position, normalized such that 0 represents when the list is scrolled to the top
   * (without overscroll) and 1 represents when the list is scrolled to the bottom (without overscroll).
   */
  public readonly scrollPercentage = this._scrollPercentage as Subscribable<number>;

  private readonly _scrollBarHeightPercentage = Subject.create(0);
  /** The fraction of this list's visible height compared to the total height of all items in the list plus their margins. */
  public readonly scrollBarHeightPercentage = this._scrollBarHeightPercentage as Subscribable<number>;

  private readonly _topVisibleIndex = Subject.create(0);
  public readonly topVisibleIndex = this._topVisibleIndex as Subscribable<number>;

  private readonly _renderWindow = Vec2Subject.create(Vec2Math.create(0, Infinity));
  /**
   * The window of rendered list items, as `[startIndex, endIndex]`, where `startIndex` is the index of the first
   * rendered item, inclusive, and `endIndex` is the index of the last rendered item, exclusive.
   */
  public readonly renderWindow = this._renderWindow as Subscribable<ReadonlyFloat64Array>;

  /** @inheritdoc */
  public onAfterRender(): void {
    const list = this.listRef.instance;

    list.listItemLengthWithMarginPx.pipe(this._listItemHeightWithMarginPx);
    list.totalLengthPx.pipe(this._totalHeightPx);
    list.lengthPx.pipe(this._heightPx);
    list.scrollPos.pipe(this._scrollY);
    list.scrollPosFraction.pipe(this._scrollPercentage);
    list.scrollBarLengthFraction.pipe(this._scrollBarHeightPercentage);
    list.firstVisibleIndex.pipe(this._topVisibleIndex);
    list.renderWindow.pipe(this._renderWindow);
  }

  /**
   * Returns a reference to the element where the list items should be added.
   * @returns A reference to the element where the list items should be added.
   */
  public getContainerRef(): HTMLDivElement {
    return this.listRef.instance.getContainerRef();
  }

  /**
   * Scrolls up by one full page height.
   */
  public pageUp(): void {
    this.listRef.getOrDefault()?.pageBack();
  }

  /**
   * Scrolls down by one full page height.
   */
  public pageDown(): void {
    this.listRef.getOrDefault()?.pageForward();
  }

  /**
   * Scrolls until the item at a specified index is in view.
   * @param index The index of the item to which to scroll.
   * @param position The position to place the target item at the end of the scroll. Position `0` is the top-most
   * visible slot, position `1` is the next slot, and so on. Values greater than or equal to the number of visible
   * items per page will be clamped. If this value is negative, the target item will be placed at the visible position
   * that results in the shortest scroll distance. Ignored if this list does not support snapping to list items.
   * @param animate Whether to animate the scroll.
   */
  public scrollToIndex(index: number, position: number, animate: boolean): void {
    const list = this.listRef.getOrDefault();

    if (!list) {
      return;
    }

    if (position < 0) {
      list.scrollToIndexWithMargin(index, 0, animate);
    } else {
      list.scrollToIndex(index, position, animate);
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <GarminTouchList
        ref={this.listRef}
        bus={this.props.bus}
        listItemLengthPx={this.props.listItemHeightPx}
        listItemSpacingPx={this.props.listItemSpacingPx}
        lengthPx={this.props.heightPx}
        itemsPerPage={this.itemsPerPage}
        maxRenderedItemCount={this.props.maxRenderedItemCount}
        itemCount={this.props.itemCount}
      >
        {this.props.children}
      </GarminTouchList>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.listRef.getOrDefault()?.destroy();

    super.destroy();
  }
}