import {
  ComponentProps, DebounceTimer, DisplayComponent, EventBus, FSComponent, FilteredMapSubject, MappedSubject,
  ReadonlyFloat64Array, SetSubject, Subject, Subscribable, SubscribableArray, SubscribableMap,
  SubscribableMapFunctions, SubscribableSet, SubscribableUtils, Subscription, ToggleableClassNameRecord, VNode,
  Vec2Math, Vec2Subject
} from '@microsoft/msfs-sdk';

import { DynamicList, DynamicListData, TouchListProps } from '@microsoft/msfs-garminsdk';

import { UiFocusController } from '../../UiSystem/UiFocusController';
import { UiFocusDirection, UiFocusableComponent } from '../../UiSystem/UiFocusTypes';
import { UiInteractionEvent, UiInteractionHandler } from '../../UiSystem/UiInteraction';
import { UiInteractionUtils } from '../../UiSystem/UiInteractionUtils';
import { UiKnobId, UiKnobRequestedLabelState } from '../../UiSystem/UiKnobTypes';
import { TouchList } from './TouchList';
import { UiListFocusable } from './UiListFocusable';

import './UiList.css';

/**
 * Formatting props for UiList.
 */
export type UiListFormattingProps = Omit<TouchListProps, 'scrollAxis' | 'itemCount' | 'maxRenderedItemCount'>;

/**
 * Component props for UiList.
 */
export interface UiListProps<DataType> extends ComponentProps, UiListFormattingProps {
  /** The event bus. */
  bus: EventBus;

  /**
   * The IDs of the valid bezel rotary knobs that can be used to change the list's focused item. If not defined, then
   * knobs cannot be used to change the list's focused item.
   */
  validKnobIds?: Iterable<UiKnobId>;

  /**
   * The data to display in the list. If both this property and `renderItem` are defined, the list will display
   * rendered data items instead of its children.
   */
  data?: SubscribableArray<DataType>;

  /**
   * A function that renders a single data item into the list. If both this property and `data` are defined, the
   * list will display rendered data items instead of its children.
   */
  renderItem?: (data: DataType, index: number) => VNode;

  /**
   * The maximum number of items that can be rendered simultaneously. Ignored if `data`, `renderItem`, or
   * `itemsPerPage` is not defined. The value will be clamped to be greater than or equal to `itemsPerPage * 3`.
   * Defaults to infinity.
   */
  maxRenderedItemCount?: number | Subscribable<number>;

  /**
   * Whether to automatically disable overscrolling when the total height of all the list's items does not exceed the
   * list's visible height. Defaults to `false`.
   */
  autoDisableOverscroll?: boolean | Subscribable<boolean>;

  /**
   * Whether to show the list's scroll bar. If `true`, then space is always reserved for the scroll bar, and its
   * visibility depends on the `fadeScrollBar` option. If `false`, then no space is reserved for the scroll bar and it
   * is always hidden. If `auto`, then space is reserved for the scroll bar if and only if the total height of all the
   * list's items exceeds the list's visible height. Defaults to `true`.
   */
  showScrollBar?: boolean | 'auto' | Subscribable<boolean | 'auto'>;

  /**
   * Whether to fade out the scroll bar when the total height of all the list's items is less than or equal to the
   * list's visible height. Space is reserved for the scroll bar even when it is faded out. Defaults to `true`.
   */
  fadeScrollBar?: boolean | Subscribable<boolean>;

  /**
   * Whether to animate scrolling when the list automatically scrolls to a newly focused item. Defaults to `true`.
   */
  animateScrollToFocus?: boolean | Subscribable<boolean>;

  /**
   * Whether the list should automatically try to focus another item if the focused item loses focus because it could
   * no longer be focused or if it was removed from the list. Defaults to `false`.
   */
  autoRefocus?: boolean;

  /**
   * A VNode which will be rendered into the list's translating container and positioned after the container that
   * holds the list's rendered items.
   */
  staticChildren?: VNode;

  /**
   * A function to sort data items before rendering them. The function should return a negative number if the first
   * item should be rendered before the second, a positive number if the first item should be rendered after the
   * second, or zero if the two items' relative order does not matter. If not defined, items will be rendered in the
   * order in which they appear in the data array.
   */
  sortItems?: (a: DataType, b: DataType) => number

  /** A callback that will be called with the topVisibleIndex when it changes. */
  onTopVisibleIndexChanged?: (topVisibleIndex: number) => void;

  /** A callback function to execute when the list is destroyed. */
  onDestroy?: () => void;

  /** CSS class(es) to add to the list's root element. */
  class?: string | SubscribableSet<string> | ToggleableClassNameRecord;
}

/**
 * A touchscreen vertically scrollable list which includes an animated scroll bar and supports rendering either a
 * static or dynamic sequence of list items.
 */
export class UiList<DataType extends DynamicListData> extends DisplayComponent<UiListProps<DataType>> implements UiInteractionHandler {
  private static readonly RESERVED_CSS_CLASSES = ['ui-list', 'ui-list-show-scroll-bar'];

  private readonly rootRef = FSComponent.createRef<HTMLDivElement>();
  private readonly scrollBarRef = FSComponent.createRef<HTMLDivElement>();
  private readonly touchListRef = FSComponent.createRef<TouchList>();

  private readonly rootCssClass = SetSubject.create(['ui-list']);

  private readonly validKnobIds = new Set<UiKnobId>(this.props.validKnobIds);

  private readonly listItemLengthPx = SubscribableUtils.toSubscribable(this.props.listItemLengthPx, true);
  private readonly maxOverscrollPx = SubscribableUtils.toSubscribable(this.props.maxOverscrollPx ?? this.listItemLengthPx, true);
  private readonly showScrollBar = SubscribableUtils.toSubscribable(this.props.showScrollBar ?? true, true) as Subscribable<boolean | 'auto'>;
  private readonly fadeScrollBar = SubscribableUtils.toSubscribable(this.props.fadeScrollBar ?? true, true);
  private readonly animateScrollToFocus = SubscribableUtils.toSubscribable(this.props.animateScrollToFocus ?? true, true);

  private readonly _itemCount = Subject.create(0);
  /** The total number of items in this list, including hidden items. */
  public readonly itemCount = this._itemCount as Subscribable<number>;

  private readonly _visibleItemCount = Subject.create(0);
  /** The total number of visible items in this list. */
  public readonly visibleItemCount = this._visibleItemCount as Subscribable<number>;

  private readonly _renderWindow = Vec2Subject.create(Vec2Math.create(0, Infinity));
  /**
   * The window of rendered list items, as `[startIndex, endIndex]`, where `startIndex` is the index of the first
   * rendered item, inclusive, and `endIndex` is the index of the last rendered item, exclusive.
   */
  public readonly renderWindow = this._renderWindow as Subscribable<ReadonlyFloat64Array>;

  private readonly _knobLabelState = FilteredMapSubject.create<UiKnobId, string>(this.validKnobIds);
  /** The bezel rotary knob label state requested by this list. */
  public readonly knobLabelState = this._knobLabelState as SubscribableMap<UiKnobId, string> & Subscribable<UiKnobRequestedLabelState>;

  private staticChildrenRootNode?: VNode;
  private readonly staticChildrenFocusableComponents: (UiListFocusable | undefined)[] = [];

  private dynamicList?: DynamicList<DataType>;

  private readonly updateRenderedWrappersTimer = new DebounceTimer();

  private readonly focusController = new UiFocusController();
  private lastFocusedComponent: UiFocusableComponent | null = null;
  private lastFocusedVisibleSortedIndex = -1;

  private readonly autoMaxOverscrollPx = this.props.autoDisableOverscroll
    ? Subject.create(0)
    : this.maxOverscrollPx;

  private readonly subscriptions: Subscription[] = [];

  /** @inheritDoc */
  public onAfterRender(): void {
    this.touchListRef.instance.renderWindow.pipe(this._renderWindow);

    if (this.props.data === undefined || this.props.renderItem === undefined) {
      // Render children into the touch list.

      if (this.props.children !== undefined) {
        const container = this.touchListRef.instance.getContainerRef();

        const root: VNode = this.staticChildrenRootNode = (
          <>{this.props.children}</>
        );

        FSComponent.render(root, container);

        // Count each first-level descendent DisplayComponent or HTMLElement as one list item.
        let count = 0;
        FSComponent.visitNodes(root, node => {
          if (node !== root && node.instance !== null && node.instance !== undefined) {
            if (node.instance instanceof DisplayComponent || node.instance instanceof HTMLElement) {
              this.staticChildrenFocusableComponents[count] = undefined;

              FSComponent.visitNodes(node, itemNode => {
                if (itemNode.instance instanceof UiListFocusable) {
                  this.staticChildrenFocusableComponents[count] = itemNode.instance;
                  return true;
                }
                return false;
              });

              count++;
            }
            return true;
          }

          return false;
        });

        this._itemCount.set(count);
        this._visibleItemCount.set(count);

        for (let i = 0; i < this.staticChildrenFocusableComponents.length; i++) {
          const component = this.staticChildrenFocusableComponents[i];
          if (component) {
            this.focusController.register(component);
          }
        }
      }
    } else {
      // Set up a dynamic list to render the provided data.

      const useRenderWindow = this.props.maxRenderedItemCount !== undefined;

      this.dynamicList = new DynamicList(
        this.props.data,
        this.touchListRef.instance.getContainerRef(),
        this.renderItemWrapper.bind(this),
        this.props.sortItems
      );
      this.subscriptions.push(
        this.props.data.sub((index, type, item, array) => { this._itemCount.set(array.length); }, true)
      );
      this.dynamicList.visibleItemCount.pipe(this._visibleItemCount);

      if (useRenderWindow) {
        const updateRenderedWrappers = this.updateRenderedWrappers.bind(this);

        const scheduleUpdate = (): void => {
          if (!this.updateRenderedWrappersTimer.isPending()) {
            this.updateRenderedWrappersTimer.schedule(updateRenderedWrappers, 0);
          }
        };

        // Visible item count increments and decrements with each visible item added/removed from the list (no bulk
        // changes), so we are guaranteed to be notified when any change is made to the set of visible items.
        this._visibleItemCount.sub(scheduleUpdate);
        this.touchListRef.instance.renderWindow.sub(updateRenderedWrappers);

        this.updateRenderedWrappers();
      }

      this._visibleItemCount.sub(this.updateLastFocusedVisibleSortedIndex.bind(this));
    }

    this._knobLabelState.set([
      [UiKnobId.SingleOuter, 'Scroll List'],
      [UiKnobId.SingleInner, 'Scroll List'],
      [UiKnobId.LeftOuter, 'Scroll List'],
      [UiKnobId.LeftInner, 'Scroll List'],
      [UiKnobId.RightOuter, 'Scroll List'],
      [UiKnobId.RightInner, 'Scroll List']
    ]);

    this.focusController.setActive(true);
    this.focusController.focusedComponent.sub(this.onFocusedComponentChanged.bind(this));

    const canScroll = MappedSubject.create(
      ([totalLengthPx, lengthPx]) => totalLengthPx > lengthPx,
      this.touchListRef.instance.totalLengthPx,
      this.touchListRef.instance.lengthPx
    );

    if (this.props.autoDisableOverscroll) {
      this.subscriptions.push(
        MappedSubject.create(
          ([autoDisableOverscroll, canScrollVal, maxOverScrollPx]) => !autoDisableOverscroll || canScrollVal ? maxOverScrollPx : 0,
          SubscribableUtils.toSubscribable(this.props.autoDisableOverscroll, true),
          canScroll,
          this.maxOverscrollPx
        ).pipe(this.autoMaxOverscrollPx as Subject<number>)
      );
    }

    const hideScrollBarSub = canScroll.sub(this.rootCssClass.toggle.bind(this.rootCssClass, 'ui-list-show-scroll-bar'), false, true);

    this.subscriptions.push(
      this.showScrollBar.sub(show => {
        switch (show) {
          case true:
            hideScrollBarSub.pause();
            this.rootCssClass.add('ui-list-show-scroll-bar');
            break;
          case false:
            hideScrollBarSub.pause();
            this.rootCssClass.delete('ui-list-show-scroll-bar');
            break;
          case 'auto':
            hideScrollBarSub.resume(true);
            break;
        }
      }, true)
    );

    const fadeScrollBarSub = canScroll.sub(val => {
      this.scrollBarRef.instance.style.opacity = val ? '0.8' : '0';
    }, false, true);

    this.subscriptions.push(
      this.fadeScrollBar.sub(fade => {
        if (fade) {
          fadeScrollBarSub.resume(true);
        } else {
          fadeScrollBarSub.pause();
          this.scrollBarRef.instance.style.opacity = '0.8';
        }
      }, true)
    );

    this.touchListRef.instance.scrollBarLengthFraction.sub(scrollBarLengthFraction => {
      this.scrollBarRef.instance.style.height = (scrollBarLengthFraction * 100) + '%';
    }, true);

    const updateScrollBarTranslation = this.updateScrollBarTranslation.bind(this);

    this.touchListRef.instance.lengthPx.sub(updateScrollBarTranslation, true);
    this.touchListRef.instance.scrollPosFraction.sub(updateScrollBarTranslation, true);
    this.touchListRef.instance.scrollBarLengthFraction.sub(updateScrollBarTranslation, true);

    const { onTopVisibleIndexChanged } = this.props;
    if (onTopVisibleIndexChanged) {
      this.touchListRef.instance.firstVisibleIndex.sub(x => onTopVisibleIndexChanged(x), true);
    }
  }

  /**
   * Gets the sorted index of a data item index. If this list does not support dynamic data or has not been rendered,
   * then this method will return `-1`.
   * @param index A data item index.
   * @returns The index to which the specified data item index is sorted, or `-1` if the data index is out of bounds,
   * this list does not support dynamic data, or this list has not been rendered.
   */
  public sortedIndexOfIndex(index: number): number {
    return this.dynamicList?.sortedIndexOfIndex(index) ?? -1;
  }

  /**
   * Gets the sorted index of a data item. If this list does not support dynamic data or has not been rendered, then
   * this method will return `-1`.
   * @param data A data item.
   * @returns The index to which the specified data item is sorted, or `-1` if the item is not in this list, this list
   * does not support dynamic data, or this list has not been rendered.
   */
  public sortedIndexOfData(data: DataType): number {
    return this.dynamicList?.sortedIndexOfData(data) ?? -1;
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
    return this.dynamicList?.sortedVisibleIndexOfIndex(index) ?? -1;
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
    return this.dynamicList?.sortedVisibleIndexOfData(data) ?? -1;
  }

  /**
   * Gets the data item index of a sorted index. If this list does not support dynamic data or has not been rendered,
   * then this method will return `-1`.
   * @param sortedIndex A sorted index.
   * @returns The index of the data item that is sorted to the specified index, or `-1` if the sorted index is out of
   * bounds, this list does not support dynamic data, or this list has not been rendered.
   */
  public indexOfSortedIndex(sortedIndex: number): number {
    return this.dynamicList?.indexOfSortedIndex(sortedIndex) ?? -1;
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
    return this.dynamicList?.indexOfSortedVisibleIndex(sortedVisibleIndex) ?? -1;
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
    const touchList = this.touchListRef.getOrDefault();

    if (!touchList) {
      return;
    }

    let doScroll = true;

    const itemsPerPage = touchList.itemsPerPage?.get();

    if (skipScrollIfItemInView && itemsPerPage !== undefined) {
      const scrollY = touchList.targetScrollPos.get();
      const listItemHeightWithMarginPx = touchList.listItemLengthWithMarginPx.get();
      const topVisibleIndex = scrollY / listItemHeightWithMarginPx;
      const bottomVisibleIndex = topVisibleIndex + itemsPerPage - 1;
      if (index >= topVisibleIndex && index <= bottomVisibleIndex) {
        doScroll = false;
      }
    }

    doScroll && touchList.scrollToIndex(index, position, animate);

    if (focus) {
      this.focusIndex(index, focusDirection);
    }
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
    const touchList = this.touchListRef.getOrDefault();

    if (!touchList) {
      return;
    }

    let doScroll = true;

    const itemsPerPage = touchList.itemsPerPage?.get();

    if (skipScrollIfItemInView && itemsPerPage !== undefined) {
      const scrollY = touchList.targetScrollPos.get();
      const listItemHeightWithMarginPx = touchList.listItemLengthWithMarginPx.get();
      const topVisibleIndex = scrollY / listItemHeightWithMarginPx;
      const bottomVisibleIndex = topVisibleIndex + itemsPerPage - 1;
      if (index >= topVisibleIndex && index <= bottomVisibleIndex) {
        doScroll = false;
      }
    }

    doScroll && touchList.scrollToIndexWithMargin(index, margin, animate);

    if (focus) {
      this.focusIndex(index, focusDirection);
    }
  }

  /**
   * Gets the index of this list's focused item after sorting has been applied and hidden items have been excluded.
   * @returns The index of this list's focused item after sorting has been applied and hidden items have been
   * excluded, or `-1` if no item is focused.
   */
  public getFocusedIndex(): number {
    const focusedComponent = this.focusController.focusedComponent.get();
    if (focusedComponent) {
      if (this.dynamicList && this.props.data) {
        return this.dynamicList.sortedIndexOfData((focusedComponent as UiListItemWrapper<DataType>).props.dataItem);
      } else {
        return this.staticChildrenFocusableComponents.indexOf(focusedComponent as UiListFocusable);
      }
    } else {
      return -1;
    }
  }

  /**
   * Focuses an item at a specified index in this list.
   * @param index The index of the item to focus, after sorting has been applied and hidden items have been excluded.
   * If the index is out of bounds, then focus will not be set.
   * @param focusDirection The direction from which to focus the item. Defaults to {@link UiFocusDirection.Unspecified}.
   */
  public focusIndex(index: number, focusDirection?: UiFocusDirection): void {
    let toFocus: UiFocusableComponent | undefined;

    if (this.dynamicList && this.props.data) {
      toFocus = this.dynamicList.getRenderedItem(this.dynamicList.indexOfSortedVisibleIndex(index)) as UiListItemWrapper<DataType> | undefined;
    } else {
      toFocus = this.staticChildrenFocusableComponents[index];
    }

    if (toFocus) {
      this.focusController.setFocus(toFocus, focusDirection);
    }
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
    if (this.props.data === undefined || this.dynamicList === undefined) {
      return;
    }

    const visibleIndex = this.dynamicList.sortedVisibleIndexOfData(item);

    if (visibleIndex < 0) {
      return;
    }

    this.scrollToIndex(visibleIndex, position, focus, animate, skipScrollIfItemInView);
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
    if (this.props.data === undefined || this.dynamicList === undefined) {
      return;
    }

    const visibleIndex = this.dynamicList.sortedVisibleIndexOfData(item);

    if (visibleIndex < 0) {
      return;
    }

    this.scrollToIndexWithMargin(visibleIndex, margin, focus, animate, skipScrollIfItemInView);
  }

  /**
   * Focuses an item in this list. If this is a static list, then this method does nothing.
   * @param item The item to focus.
   * @param focusDirection The direction from which to focus the item. Defaults to {@link UiFocusDirection.Unspecified}.
   */
  public focusItem(item: DataType, focusDirection?: UiFocusDirection): void {
    if (this.props.data === undefined || this.dynamicList === undefined) {
      return;
    }

    const visibleIndex = this.dynamicList.sortedVisibleIndexOfData(item);

    if (visibleIndex < 0) {
      return;
    }

    this.focusIndex(visibleIndex, focusDirection);
  }

  /**
   * Focuses the first focusable item in this list.
   * @param focusDirection The direction from which to focus the item. Defaults to {@link UiFocusDirection.Unspecified}.
   */
  public focusFirst(focusDirection?: UiFocusDirection): void {
    this.focusController.focusFirst(focusDirection);
  }

  /**
   * Focuses the last focusable item in this list.
   * @param focusDirection The direction from which to focus the item. Defaults to {@link UiFocusDirection.Unspecified}.
   */
  public focusLast(focusDirection?: UiFocusDirection): void {
    this.focusController.focusLast(focusDirection);
  }

  /**
   * Focuses the most recently focused item in this list. Has no effect if an item is currently focused or if there is
   * no most recently focused item.
   */
  public focusRecent(): void {
    this.focusController.focusRecent();
  }

  /**
   * Removes focus from the currently focused item in this list.
   */
  public removeFocus(): void {
    this.focusController.removeFocus();
  }

  /**
   * Clears this list's memory of the most recently focused item. Has no effect if an item is currently focused.
   */
  public clearRecentFocus(): void {
    this.focusController.clearRecentFocus();
  }

  /**
   * Updates the order of rendered items in this list.
   */
  public updateOrder(): void {
    if (this.dynamicList) {
      this.dynamicList.updateOrder();
      this.updateRenderedWrappers();
      this.updateLastFocusedVisibleSortedIndex();
    }
  }

  /** @inheritDoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    switch (event) {
      case UiInteractionEvent.SingleKnobOuterInc:
      case UiInteractionEvent.SingleKnobInnerInc:
      case UiInteractionEvent.LeftKnobOuterInc:
      case UiInteractionEvent.LeftKnobInnerInc:
      case UiInteractionEvent.RightKnobOuterInc:
      case UiInteractionEvent.RightKnobInnerInc:
        if (this.validKnobIds.has(UiInteractionUtils.KNOB_EVENT_TO_KNOB_ID[event])) {
          if (!this.focusController.onUiInteractionEvent(event)) {
            this.scroll(1);
          }

          return true;
        }
        break;
      case UiInteractionEvent.SingleKnobOuterDec:
      case UiInteractionEvent.SingleKnobInnerDec:
      case UiInteractionEvent.LeftKnobOuterDec:
      case UiInteractionEvent.LeftKnobInnerDec:
      case UiInteractionEvent.RightKnobOuterDec:
      case UiInteractionEvent.RightKnobInnerDec:
        if (this.validKnobIds.has(UiInteractionUtils.KNOB_EVENT_TO_KNOB_ID[event])) {
          if (!this.focusController.onUiInteractionEvent(event)) {
            this.scroll(-1);
          }

          return true;
        }
        break;
      default:
        if (this.focusController.onUiInteractionEvent(event)) {
          return true;
        }
    }

    return false;
  }

  /**
   * Scrolls this list. If this list has no focused item, then the list will scroll by one full page. If this list has
   * a focused item, then the list will focus and scroll to the next or previous focusable item.
   * @param direction The direction in which to scroll (`1` = forward/down, `-1` = back/up).
   */
  private scroll(direction: 1 | -1): void {
    const oldFocusedComponent = this.focusController.focusedComponent.get();

    if (oldFocusedComponent === null) {
      direction === 1 ? this.touchListRef.instance.pageForward() : this.touchListRef.instance.pageBack();
    } else {
      this.changeFocus(direction);
    }
  }

  /**
   * Changes the focused item in this list by focusing the next or previous item relative to the currently focused
   * item.
   * @param direction The direction in which to change focus (`1` = focus the next item, `-1` = focus the previous
   * item).
   */
  private changeFocus(direction: 1 | -1): void {
    if (this.dynamicList && this.props.data) {
      const data = this.props.data.getArray();

      let focusedSortedIndex = -1;

      const oldFocusedComponent = this.focusController.focusedComponent.get();
      if (oldFocusedComponent) {
        focusedSortedIndex = this.dynamicList.sortedIndexOfData((oldFocusedComponent as UiListItemWrapper<DataType>).props.dataItem);
      }

      const startIndex = focusedSortedIndex < 0
        ? direction === 1 ? -1 : data.length
        : focusedSortedIndex;

      const count = direction === 1 ? data.length - startIndex : startIndex + 1;

      for (let i = 1; i < count; i++) {
        const sortedIndex = startIndex + i * direction;
        const dataIndex = this.dynamicList.indexOfSortedIndex(sortedIndex);
        const component = this.dynamicList.getRenderedItem(dataIndex) as UiListItemWrapper<DataType> | undefined;

        if (component && component.canBeFocused.get()) {
          this.focusController.setFocus(component, direction === 1 ? UiFocusDirection.Forward : UiFocusDirection.Backward);
          break;
        }
      }
    } else {
      direction === 1 ? this.focusController.focusNext() : this.focusController.focusPrevious();
    }
  }

  /**
   * Responds to when this list's focused item changes.
   * @param component The new focused list item component, or `null` if none of this list's items are focused.
   */
  private onFocusedComponentChanged(component: UiFocusableComponent | null): void {
    if (component) {
      this.lastFocusedComponent = component;

      if (this.dynamicList) {
        this.lastFocusedVisibleSortedIndex = this.dynamicList.sortedVisibleIndexOfData((component as UiListItemWrapper<DataType>).props.dataItem);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.scrollToIndexWithMargin(this.lastFocusedVisibleSortedIndex, 0, false, this.animateScrollToFocus.get(), true);
      } else {
        this.lastFocusedVisibleSortedIndex = this.staticChildrenFocusableComponents.indexOf(component as UiListFocusable);
        this.scrollToIndexWithMargin(this.lastFocusedVisibleSortedIndex, 0, false, this.animateScrollToFocus.get(), true);
      }
    } else {
      const lastFocusedComponent = this.lastFocusedComponent;
      const lastFocusedVisibleSortedIndex = this.lastFocusedVisibleSortedIndex;

      this.lastFocusedComponent = null;
      this.lastFocusedVisibleSortedIndex = -1;

      if (this.props.autoRefocus) {
        this.tryRefocus(lastFocusedComponent, lastFocusedVisibleSortedIndex);
      }
    }
  }

  /**
   * Attempts to focus another item in this list after the most recently focused component has lost focus. Another item
   * will be focused only if the most recently focused component can no longer be focused or was removed from this list.
   * @param lastFocusedComponent The most recently focused component.
   * @param lastFocusedVisibleSortedIndex The index of the most recently focused component when it was focused, after
   * sorting is applied and hidden items are excluded.
   */
  private tryRefocus(lastFocusedComponent: UiFocusableComponent | null, lastFocusedVisibleSortedIndex: number): void {
    if (!lastFocusedComponent) {
      return;
    }

    // Try to refocus if... 
    const shouldTryRefocus
      // ...the last focused component can no longer be focused, or...
      = !lastFocusedComponent.canBeFocused.get()
      // ... the last focused component was removed from the list.
      || (this.dynamicList && !this.props.data!.getArray().includes((lastFocusedComponent as UiListItemWrapper<DataType>).props.dataItem));

    if (!shouldTryRefocus) {
      return;
    }

    // Attempt to focus items starting at the last focused component's displayed position in the list (we are
    // guaranteed to not refocus the same component because the last focused component is either not focusable or is
    // no longer in the list) and searching forwards. If no item to focus could be found, then move to the position
    // immediately before the last focused component's position and search backwards.
    if (this.dynamicList) {
      for (let i = Math.max(0, lastFocusedVisibleSortedIndex); i < this.dynamicList.visibleItemCount.get(); i++) {
        const item = this.dynamicList.getRenderedItem(this.dynamicList.indexOfSortedVisibleIndex(i)) as UiListItemWrapper<DataType> | undefined;
        if (item?.props.focusableComponent?.canBeFocused.get()) {
          this.focusController.setFocus(item);
          return;
        }
      }
      for (let i = lastFocusedVisibleSortedIndex - 1; i >= 0; i--) {
        const item = this.dynamicList.getRenderedItem(this.dynamicList.indexOfSortedVisibleIndex(i)) as UiListItemWrapper<DataType> | undefined;
        if (item?.props.focusableComponent?.canBeFocused.get()) {
          this.focusController.setFocus(item);
          return;
        }
      }
    } else {
      for (let i = Math.max(0, lastFocusedVisibleSortedIndex); i < this.staticChildrenFocusableComponents.length; i++) {
        const item = this.staticChildrenFocusableComponents[i];
        if (item?.canBeFocused.get()) {
          this.focusController.setFocus(item);
          return;
        }
      }
      for (let i = lastFocusedVisibleSortedIndex - 1; i >= 0; i--) {
        const item = this.staticChildrenFocusableComponents[i];
        if (item?.canBeFocused.get()) {
          this.focusController.setFocus(item);
          return;
        }
      }
    }
  }

  /**
   * Updates the element transforms.
   */
  private updateScrollBarTranslation(): void {
    const heightPx = this.touchListRef.instance.lengthPx.get();
    const scrollBarHeightPx = this.touchListRef.instance.scrollBarLengthFraction.get() * heightPx;
    const maxScrollBarY = heightPx - scrollBarHeightPx;
    const scrollBarY = maxScrollBarY * this.touchListRef.instance.scrollPosFraction.get();
    this.scrollBarRef.instance.style.transform = `translate3d(0px, ${scrollBarY}px, 0)`;
  }

  /**
   * Updates the visibility of rendered list item wrappers. Has no effect if a dynamic list has not been created
   * for this list or if a maximum rendered item count is not defined.
   */
  private updateRenderedWrappers(): void {
    if (!this.dynamicList || this.props.maxRenderedItemCount === undefined) {
      return;
    }

    const window = this.touchListRef.instance.renderWindow.get();

    // We only need to iterate through the visible items; the non-visible items are not indexed by TouchList and
    // should always be hidden anyway.
    this.dynamicList.forEachComponent<UiListItemWrapper<DataType>>((wrapper, index) => {
      wrapper?.setVisible(index >= window[0] && index < window[1]);
    }, true, true);
  }

  /**
   * Updates the index of the most recently focused item in this list, after sorting is applied and hidden items are
   * excluded.
   */
  private updateLastFocusedVisibleSortedIndex(): void {
    this.lastFocusedVisibleSortedIndex = this.getFocusedIndex();
  }

  /**
   * Renders a list item and wrapper for a data item.
   * @param data The data item for which to render the list item.
   * @param index The index of the data item in its containing array.
   * @returns A wrapper containing the rendered list item for the specified data item.
   */
  private renderItemWrapper(data: DataType, index: number): VNode {
    const itemNode: VNode | null = this.props.renderItem ? this.props.renderItem(data, index) : null;

    let focusableComponent: UiListFocusable | undefined;

    if (itemNode) {
      FSComponent.visitNodes(itemNode, node => {
        if (node.instance instanceof UiListFocusable) {
          focusableComponent = node.instance;
          return true;
        }

        return false;
      });
    }

    return (
      <UiListItemWrapper
        dataItem={data}
        listFocusController={this.focusController}
        focusableComponent={focusableComponent}
      >
        {itemNode}
      </UiListItemWrapper>
    );
  }

  /** @inheritDoc */
  public render(): VNode {
    if (typeof this.props.class === 'object') {
      const sub = FSComponent.bindCssClassSet(this.rootCssClass, this.props.class, UiList.RESERVED_CSS_CLASSES);
      if (Array.isArray(sub)) {
        this.subscriptions.push(...sub);
      } else {
        this.subscriptions.push(sub);
      }
    } else if (this.props.class !== undefined) {
      for (const classToAdd of FSComponent.parseCssClassesFromString(this.props.class, classToFilter => !UiList.RESERVED_CSS_CLASSES.includes(classToFilter))) {
        this.rootCssClass.add(classToAdd);
      }
    }

    return (
      <div ref={this.rootRef} class={this.rootCssClass}>
        <TouchList
          ref={this.touchListRef}
          bus={this.props.bus}
          lengthPx={this.props.lengthPx}
          itemsPerPage={this.props.itemsPerPage}
          maxRenderedItemCount={this.props.data === undefined || this.props.renderItem === undefined ? undefined : this.props.maxRenderedItemCount}
          listItemLengthPx={this.listItemLengthPx}
          listItemSpacingPx={this.props.listItemSpacingPx}
          maxOverscrollPx={this.autoMaxOverscrollPx}
          itemCount={this._visibleItemCount}
        >
          {this.props.staticChildren}
        </TouchList>
        <div class='ui-list-scroll-bar-container'>
          <div ref={this.scrollBarRef} class='ui-list-scroll-bar' />
        </div>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.props.onDestroy && this.props.onDestroy();

    this.touchListRef.getOrDefault()?.destroy();

    const staticChildrenRootNode = this.staticChildrenRootNode;
    if (staticChildrenRootNode !== undefined) {
      FSComponent.shallowDestroy(staticChildrenRootNode);
    }

    this.dynamicList?.destroy();
    this.updateRenderedWrappersTimer.clear();

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}

/**
 * Component props for UiListItemWrapper.
 */
interface UiListItemWrapperProps<DataType extends DynamicListData> extends ComponentProps {
  /** The data item associated with the wrapper. */
  dataItem: DataType;

  /** The focus controller of the wrapper's parent list. */
  listFocusController: UiFocusController;

  /**
   * The focusable component of the wrapper's rendered item, or `undefined` if the rendered item has no focusable
   * component.
   */
  focusableComponent?: UiListFocusable;
}

/**
 * A wrapper for a rendered item in a dynamic {@link UiList}.
 */
class UiListItemWrapper<DataType extends DynamicListData> extends DisplayComponent<UiListItemWrapperProps<DataType>> implements UiFocusableComponent {
  /** @inheritdoc */
  public readonly isUiFocusableComponent = true;

  private thisNode?: VNode;

  /** @inheritdoc */
  public readonly canBeFocused = this.props.focusableComponent
    ? MappedSubject.create(
      SubscribableMapFunctions.and(),
      this.props.focusableComponent.canBeFocused,
      SubscribableUtils.toSubscribable(this.props.dataItem.isVisible ?? true, true)
    )
    : Subject.create(false);

  private readonly focusController = new UiFocusController();

  private readonly externallyHidden = Subject.create(false);

  private readonly hidden = this.props.dataItem.isVisible !== undefined
    ? MappedSubject.create(
      ([externallyHidden, isVisible]) => {
        return externallyHidden || !isVisible;
      },
      this.externallyHidden,
      this.props.dataItem.isVisible
    )
    : this.externallyHidden;

  private parentController?: UiFocusController;

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this.props.listFocusController.register(this);

    this.focusController.setActive(true);

    if (this.props.focusableComponent) {
      this.focusController.focusedComponent.sub(this.onFocusedComponentChanged.bind(this), true);
    }
  }

  /**
   * Sets the visibility of this wrapper and its child item.
   * @param visible Whether the wrapper and its child item should be visible.
   */
  public setVisible(visible: boolean): void {
    this.externallyHidden.set(!visible);
  }

  /** @inheritDoc */
  public onRegistered(controller: UiFocusController): void {
    this.parentController = controller;

    if (this.props.focusableComponent) {
      this.focusController.register(this.props.focusableComponent);
    }
  }

  /** @inheritDoc */
  public onDeregistered(): void {
    this.parentController = undefined;

    if (this.props.focusableComponent) {
      this.focusController.deregister(this.props.focusableComponent);
    }
  }

  /** @inheritDoc */
  public onFocusGained(direction: UiFocusDirection): void {
    if (this.props.focusableComponent) {
      this.focusController.setFocus(this.props.focusableComponent, direction);
    }
  }

  /** @inheritDoc */
  public onFocusLost(): void {
    this.focusController.removeFocus();
  }

  /** @inheritDoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    return this.focusController.onUiInteractionEvent(event);
  }

  /**
   * Responds to when this wrapper's focusable child gains or loses focus.
   * @param component This wrapper's focusable child if it gained focus, or `null` if the child lost focus.
   */
  private onFocusedComponentChanged(component: UiFocusableComponent | null): void {
    if (component === null) {
      this.parentController?.removeFocus(this);
    } else {
      this.parentController?.setFocus(this);
    }
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class={{ 'ui-list-item-wrapper': true, 'hidden': this.hidden }}>
        {this.props.children}
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.parentController?.deregister(this);

    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    if ('destroy' in this.canBeFocused) {
      this.canBeFocused.destroy();
    }

    if ('destroy' in this.hidden) {
      this.hidden.destroy();
    }

    super.destroy();
  }
}