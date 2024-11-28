import {
  CssScaleYTransform, CssTransformBuilder, CssTransformChain, CssTransformSubject, CssTranslate3dTransform,
  DebounceTimer, DisplayComponent, FSComponent, MappedSubject, ReadonlyFloat64Array, SetSubject, Subject, Subscribable,
  SubscribableMap, SubscribableUtils, Subscription, VNode
} from '@microsoft/msfs-sdk';

import { GduFormat } from '../../CommonTypes';
import { FlightPlanDataArray } from '../../FlightPlan/FlightPlanDataArray';
import { FlightPlanDataItem } from '../../FlightPlan/FlightPlanDataItem';
import { UiFocusDirection } from '../../UiSystem/UiFocusTypes';
import { UiInteractionEvent, UiInteractionHandler } from '../../UiSystem/UiInteraction';
import { UiKnobId, UiKnobRequestedLabelState } from '../../UiSystem/UiKnobTypes';
import { UiList, UiListProps } from '../List/UiList';

import './UiFlightPlanList.css';

/**
 * Component props for {@link UiFlightPlanList}.
 */
export interface UiFlightPlanListProps extends Omit<UiListProps<FlightPlanDataItem>, 'itemsPerPage' | 'sortItems' | 'data' | 'staticChildren'> {
  /** The flight plan data to display in the list. */
  data: FlightPlanDataArray;

  /** The number of visible items per page. */
  itemsPerPage: number | Subscribable<number>;

  /** The format of the list's parent GDU. */
  gduFormat: GduFormat;
}

/**
 * A scrollable UI list of flight plan waypoints.
 */
export class UiFlightPlanList extends DisplayComponent<UiFlightPlanListProps> implements UiInteractionHandler {

  private static readonly RESERVED_CSS_CLASSES = ['ui-fpl-list'];

  private readonly listRef = FSComponent.createRef<UiList<FlightPlanDataItem>>();

  private readonly listItemLengthPx = SubscribableUtils.toSubscribable(this.props.listItemLengthPx, true);
  private readonly listItemSpacingPx = SubscribableUtils.toSubscribable(this.props.listItemSpacingPx ?? 0, true);

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

  private readonly toLegVisibleIndex = Subject.create(-1);
  private readonly fromLegVisibleIndex = Subject.create(-1);
  private readonly visibleIndexesDebounceTimer = new DebounceTimer();
  private readonly updateLegVisibleIndexesFunc = this.updateLegVisibleIndexes.bind(this);

  // TODO: support GDU470 (portrait)
  private readonly arrowPartYOffset = -7;
  private readonly arrowPartHeight = 13;

  private readonly arrowFromToHidden = Subject.create(false);
  private readonly arrowDtoHidden = Subject.create(false);

  private readonly arrowFromTransform = CssTransformSubject.create(CssTransformBuilder.translate3d('px'));
  private readonly arrowStemTransform = CssTransformSubject.create(CssTransformBuilder.concat(
    CssTransformBuilder.translate3d('px'),
    CssTransformBuilder.scaleY()
  ));
  private readonly arrowToTransform = CssTransformSubject.create(CssTransformBuilder.translate3d('px'));

  private readonly subscriptions: Subscription[] = [];

  /** @inheritDoc */
  public onAfterRender(): void {
    const visibleIndexesState = MappedSubject.create(
      this.props.data.toLegIndex,
      this.props.data.fromLegIndex,
      this.listRef.instance.visibleItemCount
    );

    const activeArrowState = MappedSubject.create(
      this.toLegVisibleIndex,
      this.fromLegVisibleIndex,
      this.listItemLengthPx,
      this.listItemSpacingPx,
      this.renderWindow
    );

    this.subscriptions.push(visibleIndexesState, activeArrowState);

    visibleIndexesState.sub(() => {
      // We need to debounce the update to avoid polling intermediate states.
      if (!this.visibleIndexesDebounceTimer.isPending()) {
        this.visibleIndexesDebounceTimer.schedule(this.updateLegVisibleIndexesFunc, 0);
      }
    }, true);
    activeArrowState.sub(this.onActiveArrowStateChanged.bind(this), true);
  }

  /**
   * Gets the transformed index of a data item index after hidden items have been excluded. If this list has not been
   * rendered, then this method will return `-1`.
   * @param index A data item index.
   * @returns The index to which the specified data item index is transformed after hidden items have been excluded, or
   * `-1`  if the data index is out of bounds, the data item whose index was given is itself hidden, or this list has
   * not been rendered.
   */
  public visibleIndexOfIndex(index: number): number {
    return this.listRef.getOrDefault()?.sortedVisibleIndexOfIndex(index) ?? -1;
  }

  /**
   * Gets the index of a data item after hidden items have been excluded. If this list has not been rendered, then this
   * method will return `-1`.
   * @param data A data item.
   * @returns The index at which the specified data item is placed after hidden items have been excluded, or `-1` if
   * the item is not in this list, the item is itself hidden, or this list has not been rendered.
   */
  public visibleIndexOfData(data: FlightPlanDataItem): number {
    return this.listRef.getOrDefault()?.sortedVisibleIndexOfData(data) ?? -1;
  }

  /**
   * Gets the original data item index of a transformed index after hidden items have been excluded. If this list has
   * not been rendered, then this method will return `-1`.
   * @param visibleIndex A transformed index after hidden items have been excluded.
   * @returns The original index of the data item that is placed at the specified index after hidden items have been
   * excluded, or `-1` if the transformed index is out of bounds, or this list has not been rendered.
   */
  public indexOfVisibleIndex(visibleIndex: number): number {
    return this.listRef.getOrDefault()?.indexOfSortedVisibleIndex(visibleIndex) ?? -1;
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
  public scrollToItem(item: FlightPlanDataItem, position: number, focus: boolean, animate: boolean, skipScrollIfItemInView = false): void {
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
  public scrollToItemWithMargin(item: FlightPlanDataItem, margin: number, focus: boolean, animate: boolean, skipScrollIfItemInView = false): void {
    this.listRef.getOrDefault()?.scrollToItemWithMargin(item, margin, focus, animate, skipScrollIfItemInView);
  }

  /**
   * Focuses an item in this list. If this is a static list, then this method does nothing.
   * @param item The item to focus.
   * @param focusDirection The direction from which to focus the item. Defaults to {@link UiFocusDirection.Unspecified}.
   */
  public focusItem(item: FlightPlanDataItem, focusDirection?: UiFocusDirection): void {
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

  /** @inheritDoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    return this.listRef.instance.onUiInteractionEvent(event);
  }

  /**
   * Updates the visible indexes of the FROM and TO legs.
   */
  private updateLegVisibleIndexes(): void {
    this.toLegVisibleIndex.set(this.listRef.instance.sortedVisibleIndexOfIndex(this.props.data.toLegIndex.get()));
    this.fromLegVisibleIndex.set(this.listRef.instance.sortedVisibleIndexOfIndex(this.props.data.fromLegIndex.get()));
  }

  /**
   * Responds to when the state of the active arrow changes.
   * @param state The new state of the active arrow, as
   * `[toLegIndex, fromLegIndex, itemLength, itemSpacing, renderWindow]`.
   */
  private onActiveArrowStateChanged(state: readonly [number, number, number, number, ReadonlyFloat64Array]): void {
    const [toLegIndex, fromLegIndex, itemLength, itemSpacing, renderWindow] = state;

    if (toLegIndex < 0) {
      this.arrowFromToHidden.set(true);
      this.arrowDtoHidden.set(true);
      return;
    }

    this.positionArrowEnd(this.arrowToTransform, toLegIndex, itemLength, itemSpacing, renderWindow[0]);

    if (fromLegIndex < 0 || fromLegIndex >= toLegIndex) {
      // There is no valid FROM leg.
      this.arrowFromToHidden.set(true);
      this.arrowDtoHidden.set(false);
    } else {
      // There is a valid FROM leg.
      this.arrowFromToHidden.set(false);
      this.arrowDtoHidden.set(true);

      this.positionArrowEnd(this.arrowFromTransform, fromLegIndex, itemLength, itemSpacing, renderWindow[0]);
      this.positionArrowStem(this.arrowStemTransform, fromLegIndex, toLegIndex, itemLength, itemSpacing, renderWindow[0]);
    }
  }

  /**
   * Positions an arrow-end element at a list item.
   * @param transform The CSS transform controlling the position of the element to position.
   * @param index The index of the list item at which to position the element, after sorting has been applied and
   * hidden items have been excluded.
   * @param itemLength The length, in pixels, of each list item.
   * @param itemSpacing The spacing, in pixels, between each list item.
   * @param renderWindowStart The index of the first rendered list item.
   */
  private positionArrowEnd(
    transform: CssTransformSubject<CssTranslate3dTransform>,
    index: number,
    itemLength: number,
    itemSpacing: number,
    renderWindowStart: number
  ): void {
    const itemLengthWithSpacing = itemLength + itemSpacing;
    transform.transform.set(0, (index - renderWindowStart) * itemLengthWithSpacing + 0.5 * itemLength, 0, 0, 0.1);
    transform.resolve();
  }

  /**
   * Positions and sizes an arrow stem element to span between two list items.
   * @param transform The CSS transform controlling the position and size of the element to change.
   * @param fromIndex The index of the list item at which to position the top end of the element, after sorting has
   * been applied and hidden items have been excluded.
   * @param toIndex The index of the list item at which to position the bottom end of the element, after sorting has
   * been applied and hidden items have been excluded.
   * @param itemLength The length, in pixels, of each list item.
   * @param itemSpacing The spacing, in pixels, between each list item.
   * @param renderWindowStart The index of the first rendered list item.
   */
  private positionArrowStem(
    transform: CssTransformSubject<CssTransformChain<[CssTranslate3dTransform, CssScaleYTransform]>>,
    fromIndex: number,
    toIndex: number,
    itemLength: number,
    itemSpacing: number,
    renderWindowStart: number
  ): void {
    const itemLengthWithSpacing = itemLength + itemSpacing;

    const top = (fromIndex - renderWindowStart) * itemLengthWithSpacing + 0.5 * itemLength + this.arrowPartYOffset + this.arrowPartHeight;
    const bottom = (toIndex - renderWindowStart) * itemLengthWithSpacing + 0.5 * itemLength + this.arrowPartYOffset;

    transform.transform.getChild(0).set(0, top, 0, 0, 0.1);
    transform.transform.getChild(1).set((bottom - top) / 100, 0.001);
    transform.resolve();
  }

  /** @inheritDoc */
  public render(): VNode {
    let cssClass: string | SetSubject<string>;

    if (typeof this.props.class === 'object') {
      cssClass = SetSubject.create();
      cssClass.add('ui-fpl-list');

      const cssClassSub = FSComponent.bindCssClassSet(cssClass, this.props.class, UiFlightPlanList.RESERVED_CSS_CLASSES);
      if (Array.isArray(cssClassSub)) {
        this.subscriptions.push(...cssClassSub);
      } else {
        this.subscriptions.push(cssClassSub);
      }
    } else {
      cssClass = 'ui-fpl-list';

      if (this.props.class) {
        cssClass += ' ' + FSComponent.parseCssClassesFromString(this.props.class, classToFilter => !UiFlightPlanList.RESERVED_CSS_CLASSES.includes(classToFilter)).join(' ');
      }
    }

    return (
      <UiList
        ref={this.listRef}
        bus={this.props.bus}
        validKnobIds={this.props.validKnobIds}
        data={this.props.data}
        renderItem={this.props.renderItem}
        lengthPx={this.props.lengthPx}
        itemsPerPage={this.props.itemsPerPage}
        listItemLengthPx={this.listItemLengthPx}
        listItemSpacingPx={this.listItemSpacingPx}
        maxRenderedItemCount={this.props.maxRenderedItemCount}
        maxOverscrollPx={this.props.maxOverscrollPx}
        autoDisableOverscroll={this.props.autoDisableOverscroll}
        showScrollBar={this.props.showScrollBar}
        fadeScrollBar={this.props.fadeScrollBar}
        animateScrollToFocus={this.props.animateScrollToFocus}
        staticChildren={this.renderArrowElements()}
        onTopVisibleIndexChanged={this.props.onTopVisibleIndexChanged}
        onDestroy={this.props.onDestroy}
        class={cssClass}
      />
    );
  }

  /**
   * Renders this list's active arrow elements.
   * @returns This list's active arrow elements, as a VNode.
   */
  private renderArrowElements(): VNode {
    // TODO: support GDU470 (portrait)
    return (
      <>
        <svg
          viewBox='0 0 16 13'
          class={{ 'ui-fpl-list-arrow-part': true, 'ui-fpl-list-arrow-from': true, 'ui-darken-filter': true, 'hidden': this.arrowFromToHidden }}
          style={{
            'position': 'absolute',
            'top': '-7px',
            'width': '16px',
            'height': '13px',
            'transform': this.arrowFromTransform
          }}
        >
          <path d='M 5 13 v -3 a 1 1 90 0 1 1 -1 h 10 v -5 h -14 a 2 2 90 0 0 -2 2 v 7 Z' />
        </svg>
        <svg
          viewBox='0 0 16 100'
          class={{ 'ui-fpl-list-arrow-part': true, 'ui-fpl-list-arrow-stem': true, 'ui-darken-filter': true, 'hidden': this.arrowFromToHidden }}
          style={{
            'position': 'absolute',
            'top': '0px',
            'height': '100px',
            'transform': this.arrowStemTransform,
            'transform-origin': '50% 0%'
          }}
        >
          <path d='M 0 0 h 5 v 100 h -5 Z' />
        </svg>
        <svg
          viewBox='0 0 16 13'
          class={{ 'ui-fpl-list-arrow-part': true, 'ui-fpl-list-arrow-to': true, 'ui-darken-filter': true, 'hidden': this.arrowFromToHidden }}
          style={{
            'position': 'absolute',
            'top': '-7px',
            'width': '16px',
            'height': '13px',
            'transform': this.arrowToTransform
          }}
        >
          <path d='M 5 0 v 3 a 1 1 0 0 0 1 1 h 3 v -4 l 7 6.5 l -7 6.5 v -4 h -7 a 2 2 0 0 1 -2 -2 v -7 Z' />
        </svg>
        <svg
          viewBox='0 0 16 13'
          class={{ 'ui-fpl-list-arrow-part': true, 'ui-fpl-list-arrow-dto': true, 'ui-darken-filter': true, 'hidden': this.arrowDtoHidden }}
          style={{
            'position': 'absolute',
            'top': '-7px',
            'width': '16px',
            'height': '13px',
            'transform': this.arrowToTransform
          }}
        >
          <path d='M 0 4 h 9 v -4 l 7 6.5 l -7 6.5 v -4 h -9 Z' />
        </svg>
      </>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.visibleIndexesDebounceTimer.clear();

    this.listRef.getOrDefault()?.destroy();

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}