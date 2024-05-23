import {
  DisplayComponent, FSComponent, ReadonlyFloat64Array, SetSubject, Subject, Subscribable, SubscribableArray,
  SubscribableMap, Subscription, VNode, Waypoint
} from '@microsoft/msfs-sdk';

import { DynamicListData } from '@microsoft/msfs-garminsdk';

import { NearestWaypointEntry } from '../../Nearest/NearestWaypointEntry';
import { UiFocusDirection } from '../../UiSystem/UiFocusTypes';
import { UiInteractionEvent, UiInteractionHandler } from '../../UiSystem/UiInteraction';
import { UiKnobId, UiKnobRequestedLabelState } from '../../UiSystem/UiKnobTypes';
import { UiList, UiListProps } from '../List/UiList';

import './UiNearestWaypointList.css';

/**
 * Component props for {@link UiNearestWaypointList}.
 */
export interface UiNearestWaypointListProps<
  DataType extends NearestWaypointEntry<Waypoint> & DynamicListData = NearestWaypointEntry<Waypoint> & DynamicListData
> extends Omit<UiListProps<DataType>, 'sortItems' | 'data' | 'staticChildren'> {

  /** The data to display in the list. */
  data: SubscribableArray<DataType>;

  /** The text to display when the list is empty. */
  noResultsText: string | Subscribable<string>;
}

/**
 * A scrollable UI list of nearest waypoints.
 */
export class UiNearestWaypointList<
  DataType extends NearestWaypointEntry<Waypoint> & DynamicListData = NearestWaypointEntry<Waypoint> & DynamicListData
> extends DisplayComponent<UiNearestWaypointListProps<DataType>> implements UiInteractionHandler {

  private static readonly RESERVED_CSS_CLASSES = ['ui-nearest-wpt-list'];

  private readonly listRef = FSComponent.createRef<UiList<DataType>>();

  private readonly noResultsHidden = Subject.create(false);

  // eslint-disable-next-line jsdoc/require-returns
  /** The total number of items in this list, including hidden items. */
  public get itemCount(): Subscribable<number> {
    return this.listRef.instance.itemCount;
  }

  // eslint-disable-next-line jsdoc/require-returns
  /** The total number of visible items in this list. */
  public get visibleItemCount(): Subscribable<number> {
    return this.listRef.instance.visibleItemCount;
  }

  // eslint-disable-next-line jsdoc/require-returns
  /**
   * The window of rendered list items, as `[startIndex, endIndex]`, where `startIndex` is the index of the first
   * rendered item, inclusive, and `endIndex` is the index of the last rendered item, exclusive.
   */
  public get renderWindow(): Subscribable<ReadonlyFloat64Array> {
    return this.listRef.instance.renderWindow;
  }

  // eslint-disable-next-line jsdoc/require-returns
  /** The bezel rotary knob label state requested by this list. */
  public get knobLabelState(): SubscribableMap<UiKnobId, string> & Subscribable<UiKnobRequestedLabelState> {
    return this.listRef.instance.knobLabelState;
  }

  private readonly subscriptions: Subscription[] = [];

  /** @inheritDoc */
  public onAfterRender(): void {
    this.subscriptions.push(
      this.props.data.sub(() => {
        this.noResultsHidden.set(this.props.data.length > 0);
      }, true)
    );
  }

  /**
   * Gets the sorted index of a data item index. If this list does not support dynamic data or has not been rendered,
   * then this method will return `-1`.
   * @param index A data item index.
   * @returns The index to which the specified data item index is sorted, or `-1` if the data index is out of bounds,
   * this list does not support dynamic data, or this list has not been rendered.
   */
  public sortedIndexOfIndex(index: number): number {
    return this.listRef.getOrDefault()?.sortedIndexOfIndex(index) ?? -1;
  }

  /**
   * Gets the sorted index of a data item. If this list does not support dynamic data or has not been rendered, then
   * this method will return `-1`.
   * @param data A data item.
   * @returns The index to which the specified data item is sorted, or `-1` if the item is not in this list, this list
   * does not support dynamic data, or this list has not been rendered.
   */
  public sortedIndexOfData(data: DataType): number {
    return this.listRef.getOrDefault()?.sortedIndexOfData(data) ?? -1;
  }

  /**
   * Gets the sorted index of a data item index after hidden items have been excluded. If this list does not support
   * dynamic data or has not been rendered, then this method will return `-1`.
   * @param index A data item index.
   * @returns The index to which the specified data item index is sorted after hidden items have been excluded, or `-1`
   * if the data index is out of bounds, the data item whose index was given is itself hidden, this list does not
   * support dynamic data, or this list has not been rendered.
   */
  public sortedVisibleIndexOfIndex(index: number): number {
    return this.listRef.getOrDefault()?.sortedVisibleIndexOfIndex(index) ?? -1;
  }

  /**
   * Gets the sorted index of a data item after hidden items have been excluded. If this list does not support dynamic
   * data or has not been rendered, then this method will return `-1`.
   * @param data A data item.
   * @returns The index to which the specified data item is sorted after hidden items have been excluded, or `-1` if
   * the item is not in this list, the item is itself hidden, this list does not support dynamic data, or this list has
   * not been rendered.
   */
  public sortedVisibleIndexOfData(data: DataType): number {
    return this.listRef.getOrDefault()?.sortedVisibleIndexOfData(data) ?? -1;
  }

  /**
   * Gets the data item index of a sorted index. If this list does not support dynamic data or has not been rendered,
   * then this method will return `-1`.
   * @param sortedIndex A sorted index.
   * @returns The index of the data item that is sorted to the specified index, or `-1` if the sorted index is out of
   * bounds, this list does not support dynamic data, or this list has not been rendered.
   */
  public indexOfSortedIndex(sortedIndex: number): number {
    return this.listRef.getOrDefault()?.indexOfSortedIndex(sortedIndex) ?? -1;
  }

  /**
   * Gets the data item index of a sorted index after hidden items have been excluded. If this list does not support
   * dynamic data or has not been rendered, then this method will return `-1`.
   * @param sortedVisibleIndex A sorted index after hidden items have been excluded.
   * @returns The index of the data item that is sorted to the specified index after hidden items have been excluded,
   * or `-1` if the sorted index is out of bounds, this list does not support dynamic data, or this list has not been
   * rendered.
   */
  public indexOfSortedVisibleIndex(sortedVisibleIndex: number): number {
    return this.listRef.getOrDefault()?.indexOfSortedVisibleIndex(sortedVisibleIndex) ?? -1;
  }

  /**
   * Scrolls until the item at a specified index is in view.
   * @param index The index of the item to which to scroll, after sorting has been applied and hidden items have been
   * excluded.
   * @param position The position to place the target item at the end of the scroll. Position `0` is the top/left-most
   * visible slot, position `1` is the next slot, and so on. Values greater than or equal to the number of visible
   * items per page will be clamped. Negative values will be interpreted as counting backwards from the
   * bottom/right-most visible slot starting with `-1`. Ignored if this list does not support snapping to list items.
   * @param focus Whether to focus the item to which to scroll.
   * @param animate Whether to animate the scroll.
   * @param skipScrollIfItemInView Whether to skip the scroll operation if the target item is already in view or will
   * be in view when the current scrolling animation finishes. The target item will still be focused if `focus` is
   * `true` even if the scroll operation is skipped. Defaults to `false`.
   * @param focusDirection The direction from which to focus the item to which to scroll. Ignored if `focus` is
   * `false`. Defaults to {@link UiFocusDirection.Unspecified}.
   */
  public scrollToIndex(
    index: number,
    position: number,
    focus: boolean,
    animate: boolean,
    skipScrollIfItemInView = false,
    focusDirection?: UiFocusDirection
  ): void {
    this.listRef.getOrDefault()?.scrollToIndex(index, position, focus, animate, skipScrollIfItemInView, focusDirection);
  }

  /**
   * Scrolls the minimum possible distance until the item at a specified index is in view with a given margin from the
   * edges of the visible list.
   * @param index The index of the item to which to scroll, after sorting has been applied and hidden items have been
   * excluded.
   * @param margin The margin from the edges of the visible list to respect when scrolling to the target item. In other
   * words, the scrolling operation will attempt to place the target item at least as far from the edges of the visible
   * list as the specified margin. If this list supports snapping to items, then the margin should be expressed as an
   * item count. If this list does not support snapping to items, then the margin should be expressed as pixels. The
   * margin will be clamped between zero and the largest possible value such that an item can be placed within the
   * visible list while respecting the margin value on both sides.
   * @param focus Whether to focus the item to which to scroll.
   * @param animate Whether to animate the scroll.
   * @param skipScrollIfItemInView Whether to skip the scroll operation if the target item is already in view or will
   * be in view when the current scrolling animation finishes. The target item will still be focused if `focus` is
   * `true` even if the scroll operation is skipped. Defaults to `false`.
   * @param focusDirection The direction from which to focus the item to which to scroll. Ignored if `focus` is
   * `false`. Defaults to {@link UiFocusDirection.Unspecified}.
   */
  public scrollToIndexWithMargin(
    index: number,
    margin: number,
    focus: boolean,
    animate: boolean,
    skipScrollIfItemInView = false,
    focusDirection?: UiFocusDirection
  ): void {
    this.listRef.getOrDefault()?.scrollToIndexWithMargin(index, margin, focus, animate, skipScrollIfItemInView, focusDirection);
  }

  /**
   * Gets the index of this list's focused item after sorting has been applied and hidden items have been excluded.
   * @returns The index of this list's focused item after sorting has been applied and hidden items have been
   * excluded, or `-1` if no item is focused.
   */
  public getFocusedIndex(): number {
    return this.listRef.getOrDefault()?.getFocusedIndex() ?? -1;
  }

  /**
   * Focuses an item at a specified index in this list.
   * @param index The index of the item to focus, after sorting has been applied and hidden items have been excluded.
   * If the index is out of bounds, then focus will not be set.
   * @param focusDirection The direction from which to focus the item. Defaults to {@link UiFocusDirection.Unspecified}.
   */
  public focusIndex(index: number, focusDirection?: UiFocusDirection): void {
    this.listRef.getOrDefault()?.focusIndex(index, focusDirection);
  }

  /**
   * Scrolls until the specified item is in view. If this is a static list, then this method does nothing.
   * @param item The item to which to scroll.
   * @param position The position to place the target item at the end of the scroll. Position `0` is the top/left-most
   * visible slot, position `1` is the next slot, and so on. Values greater than or equal to the number of visible
   * items per page will be clamped. Negative values will be interpreted as counting backwards from the
   * bottom/right-most visible slot starting with `-1`. Ignored if this list does not support snapping to list items.
   * @param focus Whether to focus the item to which to scroll.
   * @param animate Whether to animate the scroll.
   * @param skipScrollIfItemInView Whether to skip the scroll operation if the target item is already in view. The
   * target item will still be focused if {@linkcode focus} is `true` even if the scroll operation is skipped. Defaults
   * to `false`.
   */
  public scrollToItem(item: DataType, position: number, focus: boolean, animate: boolean, skipScrollIfItemInView = false): void {
    this.listRef.getOrDefault()?.scrollToItem(item, position, focus, animate, skipScrollIfItemInView);
  }

  /**
   * Scrolls the minimum possible distance until the specified item is in view with a given margin from the edges of
   * the visible list. If this is a static list, then this method does nothing.
   * @param item The item to which to scroll.
   * @param margin The margin from the edges of the visible list to respect when scrolling to the target item. In other
   * words, the scrolling operation will attempt to place the target item at least as far from the edges of the visible
   * list as the specified margin. If this list supports snapping to items, then the margin should be expressed as an
   * item count. If this list does not support snapping to items, then the margin should be expressed as pixels. The
   * margin will be clamped between zero and the largest possible value such that an item can be placed within the
   * visible list while respecting the margin value on both sides.
   * @param focus Whether to focus the item to which to scroll.
   * @param animate Whether to animate the scroll.
   * @param skipScrollIfItemInView Whether to skip the scroll operation if the target item is already in view. The
   * target item will still be focused if {@linkcode focus} is `true` even if the scroll operation is skipped. Defaults
   * to `false`.
   */
  public scrollToItemWithMargin(item: DataType, margin: number, focus: boolean, animate: boolean, skipScrollIfItemInView = false): void {
    this.listRef.getOrDefault()?.scrollToItemWithMargin(item, margin, focus, animate, skipScrollIfItemInView);
  }

  /**
   * Focuses an item in this list. If this is a static list, then this method does nothing.
   * @param item The item to focus.
   * @param focusDirection The direction from which to focus the item. Defaults to {@link UiFocusDirection.Unspecified}.
   */
  public focusItem(item: DataType, focusDirection?: UiFocusDirection): void {
    this.listRef.getOrDefault()?.focusItem(item, focusDirection);
  }

  /**
   * Focuses the first focusable item in this list.
   * @param focusDirection The direction from which to focus the item. Defaults to {@link UiFocusDirection.Unspecified}.
   */
  public focusFirst(focusDirection?: UiFocusDirection): void {
    this.listRef.getOrDefault()?.focusFirst(focusDirection);
  }

  /**
   * Focuses the last focusable item in this list.
   * @param focusDirection The direction from which to focus the item. Defaults to {@link UiFocusDirection.Unspecified}.
   */
  public focusLast(focusDirection?: UiFocusDirection): void {
    this.listRef.getOrDefault()?.focusLast(focusDirection);
  }

  /**
   * Focuses the most recently focused item in this list. Has no effect if an item is currently focused or if there is
   * no most recently focused item.
   */
  public focusRecent(): void {
    this.listRef.getOrDefault()?.focusRecent();
  }

  /**
   * Removes focus from the currently focused item in this list.
   */
  public removeFocus(): void {
    this.listRef.getOrDefault()?.removeFocus();
  }

  /**
   * Clears this list's memory of the most recently focused item. Has no effect if an item is currently focused.
   */
  public clearRecentFocus(): void {
    this.listRef.getOrDefault()?.clearRecentFocus();
  }

  /**
   * Updates the order of rendered items in this list.
   */
  public updateOrder(): void {
    this.listRef.getOrDefault()?.updateOrder();
  }

  /** @inheritDoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    return this.listRef.instance.onUiInteractionEvent(event);
  }

  /** @inheritDoc */
  public render(): VNode {
    let cssClass: string | SetSubject<string>;

    if (typeof this.props.class === 'object') {
      cssClass = SetSubject.create();
      cssClass.add('ui-nearest-wpt-list');

      const cssClassSub = FSComponent.bindCssClassSet(cssClass, this.props.class, UiNearestWaypointList.RESERVED_CSS_CLASSES);
      if (Array.isArray(cssClassSub)) {
        this.subscriptions.push(...cssClassSub);
      } else {
        this.subscriptions.push(cssClassSub);
      }
    } else {
      cssClass = 'ui-nearest-wpt-list';

      if (this.props.class) {
        cssClass += ' ' + FSComponent.parseCssClassesFromString(this.props.class, classToFilter => !UiNearestWaypointList.RESERVED_CSS_CLASSES.includes(classToFilter)).join(' ');
      }
    }

    return (
      <div class={cssClass}>
        <UiList
          ref={this.listRef}
          bus={this.props.bus}
          validKnobIds={this.props.validKnobIds}
          data={this.props.data}
          renderItem={this.props.renderItem}
          lengthPx={this.props.lengthPx}
          itemsPerPage={this.props.itemsPerPage}
          listItemLengthPx={this.props.listItemLengthPx}
          listItemSpacingPx={this.props.listItemSpacingPx}
          maxRenderedItemCount={this.props.maxRenderedItemCount}
          maxOverscrollPx={this.props.maxOverscrollPx}
          autoDisableOverscroll={this.props.autoDisableOverscroll}
          showScrollBar={this.props.showScrollBar}
          fadeScrollBar={this.props.fadeScrollBar}
          animateScrollToFocus={this.props.animateScrollToFocus}
          sortItems={this.sortListItems.bind(this)}
          onTopVisibleIndexChanged={this.props.onTopVisibleIndexChanged}
          onDestroy={this.props.onDestroy}
          class='ui-nearest-wpt-list-list'
        />
        <div class={{ 'ui-nearest-wpt-list-no-results': true, 'hidden': this.noResultsHidden }}>{this.props.noResultsText}</div>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.listRef.getOrDefault()?.destroy();

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }

  /**
   * Sorts this list's nearest waypoint entries in order of increasing distance from the airplane's current position.
   * @param a The first entry.
   * @param b The second entry.
   * @returns A negative number if the first entry's waypoint is closer to the airplane than the second's waypoint,
   * a positive number if the opposite is true, or zero if both are equidistant to the airplane or one or both
   * distances are unknown.
   */
  private sortListItems(a: DataType, b: DataType): number {
    const compare = a.store.distance.get().compare(b.store.distance.get());
    return isNaN(compare) ? 0 : compare;
  }
}