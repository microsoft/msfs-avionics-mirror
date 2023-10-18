import {
  ComponentProps, DebounceTimer, DisplayComponent, EventBus, FSComponent, MappedSubject, SetSubject, Subject, Subscribable,
  SubscribableArray, SubscribableSet, SubscribableUtils, Subscription, VNode,
} from '@microsoft/msfs-sdk';

import { DynamicList, DynamicListData } from '@microsoft/msfs-wtg3000-common';

import { GtcInteractionEvent, GtcInteractionHandler } from '../../GtcService/GtcInteractionEvent';
import { SidebarState } from '../../GtcService/Sidebar';
import { GarminTouchList } from './GarminTouchList';
import { TouchListProps } from './TouchList';

import './GtcList.css';

/**
 * Formatting props for GtcList.
 */
export type GtcListFormattingProps = Omit<TouchListProps, 'itemCount' | 'maxRenderedItemCount'>;

/**
 * Component props for GtcList.
 */
export interface GtcListProps<DataType> extends ComponentProps, GtcListFormattingProps {
  /** The event bus. */
  bus: EventBus,

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
   * A VNode which will be rendered into the list's translating container and positioned after the container that
   * holds the list's rendered items.
   */
  staticTouchListChildren?: VNode;

  /**
   * A function to sort data items before rendering them. The function should return a negative number if the first
   * item should be rendered before the second, a positive number if the first item should be rendered after the
   * second, or zero if the two items' relative order does not matter. If not defined, items will be rendered in the
   * order in which they appear in the data array.
   */
  sortItems?: (a: DataType, b: DataType) => number

  /** The SidebarState to use. */
  sidebarState?: SidebarState | Subscribable<SidebarState | null>;

  /** A callback that will be called with the topVisibleIndex when it changes. */
  onTopVisibleIndexChanged?: (topVisibleIndex: number) => void;

  /** A callback function to execute when the list is destroyed. */
  onDestroy?: () => void;

  /** CSS class(es) to add to the list's root element. */
  class?: string | SubscribableSet<string>;
}

/**
 * A touchscreen vertically scrollable list which includes an animated scroll bar and supports rendering either a static
 * or dynamic sequence of list items. The list also supports scrolling in response to GTC interaction events and
 * editing of GTC sidebar state to show/hide the arrow buttons as appropriate.
 */
export class GtcList<DataType extends DynamicListData> extends DisplayComponent<GtcListProps<DataType>> implements GtcInteractionHandler {
  private readonly gtcListRef = FSComponent.createRef<HTMLDivElement>();
  private readonly scrollBarRef = FSComponent.createRef<HTMLDivElement>();
  private readonly touchListRef = FSComponent.createRef<GarminTouchList>();

  private readonly visibleItemCount = Subject.create(0);

  private staticChildrenRootNode?: VNode;
  private dynamicList?: DynamicList<DataType>;

  private readonly updateRenderedWrappersTimer = new DebounceTimer();

  private readonly sidebarState = SubscribableUtils.toSubscribable(this.props.sidebarState ?? null, true) as Subscribable<SidebarState | null>;

  private cssClassSub?: Subscription;
  private sidebarStateSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    if (this.props.data === undefined || this.props.renderItem === undefined) {
      // Render children into the touch list.

      if (this.props.children !== undefined) {
        const container = this.touchListRef.instance.getContainerRef();

        const root: VNode = this.staticChildrenRootNode = (
          <>{this.props.children}</>
        );

        FSComponent.render(root, container);

        // Count each first-level descendent non-fragment VNode as one list item.
        let count = 0;
        FSComponent.visitNodes(root, node => {
          if (node !== root && node.instance !== null && node.instance !== undefined) {
            if (typeof node.instance !== 'boolean') {
              count++;
            }
            return true;
          }

          return false;
        });

        this.visibleItemCount.set(count);
      }
    } else {
      // Set up a dynamic list to render the provided data.

      const useRenderWindow = this.props.maxRenderedItemCount !== undefined;

      this.dynamicList = new DynamicList(
        this.props.data,
        this.touchListRef.instance.getContainerRef(),
        useRenderWindow ? this.renderItemWrapper.bind(this) : this.props.renderItem,
        this.props.sortItems
      );
      this.dynamicList.visibleItemCount.pipe(this.visibleItemCount);

      if (useRenderWindow) {
        const updateRenderedWrappers = this.updateRenderedWrappers.bind(this);

        const scheduleUpdate = (): void => {
          if (!this.updateRenderedWrappersTimer.isPending()) {
            this.updateRenderedWrappersTimer.schedule(updateRenderedWrappers, 0);
          }
        };

        // Visible item count increments and decrements with each visible item added/removed from the list (no bulk
        // changes), so we are guaranteed to be notified when any change is made to the set of visible items.
        this.visibleItemCount.sub(scheduleUpdate);
        this.touchListRef.instance.renderWindow.sub(updateRenderedWrappers);

        this.updateRenderedWrappers();
      }
    }

    const canScroll = MappedSubject.create(
      ([totalHeightPx, heightPx]) => totalHeightPx > heightPx,
      this.touchListRef.instance.totalLengthPx,
      this.touchListRef.instance.lengthPx
    );

    canScroll.sub(val => {
      this.scrollBarRef.instance.style.opacity = val ? '0.8' : '0';
    }, true);

    const arrowButtonsState = MappedSubject.create(
      canScroll,
      this.touchListRef.instance.scrollPosFraction
    );

    const arrowButtonsStateSub = arrowButtonsState.sub(this.updateArrowButtons.bind(this), false, true);

    this.touchListRef.instance.scrollBarLengthFraction.sub(scrollBarLengthFraction => {
      this.scrollBarRef.instance.style.height = (scrollBarLengthFraction * 100) + '%';
    }, true);

    const updateScrollBarTranslation = this.updateScrollBarTranslation.bind(this);
    this.touchListRef.instance.lengthPx.sub(updateScrollBarTranslation, true);
    this.touchListRef.instance.scrollPosFraction.sub(updateScrollBarTranslation, true);
    this.touchListRef.instance.scrollBarLengthFraction.sub(updateScrollBarTranslation, true);

    this.sidebarStateSub = this.sidebarState.sub(sidebarState => {
      if (sidebarState === null) {
        arrowButtonsStateSub.pause();
      } else {
        arrowButtonsStateSub.resume(true);
      }
    }, true);

    const { onTopVisibleIndexChanged } = this.props;
    if (onTopVisibleIndexChanged) {
      this.touchListRef.getOrDefault()?.firstVisibleIndex.sub(x => onTopVisibleIndexChanged(x), true);
    }
  }

  /**
   * Scrolls until the item at a specified index is in view.
   * @param index The index of the item to which to scroll, after sorting has been applied and hidden items have been
   * excluded.
   * @param position The position to place the target item at the end of the scroll. Position `0` is the top-most
   * visible slot, position `1` is the next slot, and so on. Values greater than or equal to the number of visible
   * items per page will be clamped. If this value is negative, the target item will be placed at the visible position
   * that results in the shortest scroll distance. Ignored if this list does not support snapping to list items.
   * @param animate Whether to animate the scroll.
   */
  public scrollToIndex(index: number, position: number, animate: boolean): void {
    const list = this.touchListRef.getOrDefault();

    if (!list) {
      return;
    }

    if (position < 0) {
      list.scrollToIndexWithMargin(index, 0, animate);
    } else {
      list.scrollToIndex(index, position, animate);
    }
  }

  /**
   * Scrolls until the specified item is in view. If this is a static list, this method does nothing.
   * @param item The item to which to scroll.
   * @param position The position to place the target item at the end of the scroll. Position `0` is the top-most
   * visible slot, position `1` is the next slot, and so on. Values greater than or equal to the number of visible
   * items per page will be clamped. If this value is negative, the target item will be placed at the visible position
   * that results in the shortest scroll distance. Ignored if this list does not support snapping to list items.
   * @param animate Whether to animate the scroll.
   * @param ignoreIfItemInView When true, if item is already in view, it will not scroll to it. Defaults to false.
   */
  public scrollToItem(item: DataType, position: number, animate: boolean, ignoreIfItemInView = false): void {
    if (this.props.data === undefined || this.dynamicList === undefined || item.isVisible?.get() === false) {
      return;
    }

    const visibleIndex = this.dynamicList.sortedVisibleIndexOfData(item);
    if (visibleIndex === -1) {
      return;
    }

    const touchList = this.touchListRef.instance;
    const itemsPerPage = touchList.itemsPerPage?.get();

    if (ignoreIfItemInView && itemsPerPage !== undefined) {
      const scrollY = touchList.scrollPos.get();
      const listItemHeightWithMarginPx = touchList.listItemLengthWithMarginPx.get();
      const topVisibleIndex = scrollY / listItemHeightWithMarginPx;
      const bottomVisibleIndex = topVisibleIndex + itemsPerPage - 1;
      if (visibleIndex >= topVisibleIndex && visibleIndex <= bottomVisibleIndex) {
        return;
      }
    }

    this.scrollToIndex(visibleIndex, position, animate);
  }

  /**
   * Updates the order of rendered items in this list.
   */
  public updateOrder(): void {
    if (this.dynamicList) {
      this.dynamicList.updateOrder();
      this.updateRenderedWrappers();
    }
  }

  /** @inheritdoc */
  public onGtcInteractionEvent(event: GtcInteractionEvent): boolean {
    // TODO Handle holding down an arrow button
    // TODO Event should fire on mouse down, not on mouse up
    switch (event) {
      case GtcInteractionEvent.ButtonBarUpPressed: this.touchListRef.instance.pageBack(); return true;
      case GtcInteractionEvent.ButtonBarDownPressed: this.touchListRef.instance.pageForward(); return true;
      default: return false;
    }
  }

  /**
   * Updates the translation of this list's scroll bar.
   */
  private updateScrollBarTranslation(): void {
    const heightPx = this.touchListRef.instance.lengthPx.get();
    const scrollBarHeightPx = this.touchListRef.instance.scrollBarLengthFraction.get() * heightPx;
    const maxScrollBarY = heightPx - scrollBarHeightPx;
    const scrollBarY = maxScrollBarY * this.touchListRef.instance.scrollPosFraction.get();
    this.scrollBarRef.instance.style.transform = `translate3d(0px, ${scrollBarY}px, 0)`;
  }

  /**
   * Update the arrow buttons in the sidebar state.
   * @param state The arrow button state.
   * @param state."0" Whether this list can scroll.
   * @param state."1" This list's current scroll percentage.
   */
  private updateArrowButtons([canScroll, scrollPercentage]: readonly [boolean, number]): void {
    const sidebarState = this.sidebarState.get();

    if (sidebarState === null) {
      return;
    }

    if (!canScroll) {
      sidebarState.slot5.set('arrowsDisabled');
    } else if (scrollPercentage <= 0) {
      sidebarState.slot5.set('arrowsDown');
    } else if (scrollPercentage >= 1) {
      sidebarState.slot5.set('arrowsUp');
    } else {
      sidebarState.slot5.set('arrowsBoth');
    }
  }

  /**
   * Updates the visibility of rendered list item wrappers. Has no effect if a dynamic list has not been created
   * for this list or if a maximum rendered item count is not defined.
   */
  private updateRenderedWrappers(): void {
    if (!this.dynamicList || this.props.maxRenderedItemCount === undefined) {
      return;
    }

    this.updateRenderedWrappersTimer.clear();

    const window = this.touchListRef.instance.renderWindow.get();

    // We only need to iterate through the visible items; the non-visible items are not indexed by TouchList and
    // should always be hidden anyway.
    this.dynamicList.forEachComponent<GtcListItemWrapper>((wrapper, index) => {
      wrapper?.setVisible(index >= window[0] && index < window[1]);
    }, true, true);
  }

  /**
   * Renders a list item and wrapper for a data item.
   * @param data The data item for which to render the list item.
   * @param index The index of the data item in its containing array.
   * @returns A wrapper containing the rendered list item for the specified data item.
   */
  private renderItemWrapper(data: DataType, index: number): VNode {
    const itemNode = this.props.renderItem && this.props.renderItem(data, index);

    return (
      <GtcListItemWrapper>
        {itemNode}
      </GtcListItemWrapper>
    );
  }

  /** @inheritdoc */
  public render(): VNode {
    let cssClass: string | SetSubject<string>;

    if (typeof this.props.class === 'object') {
      cssClass = SetSubject.create(['gtc-list']);
      this.cssClassSub = FSComponent.bindCssClassSet(cssClass, this.props.class, ['gtc-list']);
    } else if (this.props.class !== undefined) {
      cssClass = [
        'gtc-list',
        ...(FSComponent.parseCssClassesFromString(this.props.class)
          .filter(classToAdd => classToAdd !== 'gtc-list'))
      ].join(' ');
    } else {
      cssClass = 'gtc-list';
    }

    return (
      <div ref={this.gtcListRef} class={cssClass}>
        <GarminTouchList
          ref={this.touchListRef}
          lengthPx={this.props.heightPx}
          itemsPerPage={this.props.itemsPerPage}
          maxRenderedItemCount={this.props.data === undefined || this.props.renderItem === undefined ? undefined : this.props.maxRenderedItemCount}
          listItemLengthPx={this.props.listItemHeightPx}
          listItemSpacingPx={this.props.listItemSpacingPx}
          itemCount={this.visibleItemCount}
          bus={this.props.bus}
        >
          {this.props.staticTouchListChildren}
        </GarminTouchList>
        <div class="gtc-list-scroll-bar-container">
          <div ref={this.scrollBarRef} class="gtc-list-scroll-bar" />
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.props.onDestroy && this.props.onDestroy();

    this.touchListRef.getOrDefault()?.destroy();

    const staticChildrenRootNode = this.staticChildrenRootNode;
    if (staticChildrenRootNode !== undefined) {
      FSComponent.shallowDestroy(staticChildrenRootNode);
    }

    this.dynamicList?.destroy();
    this.updateRenderedWrappersTimer.clear();

    this.cssClassSub?.destroy();
    this.sidebarStateSub?.destroy();

    super.destroy();
  }
}

/**
 * A wrapper for a rendered item in a GTC list.
 */
class GtcListItemWrapper extends DisplayComponent<ComponentProps> {
  private thisNode?: VNode;

  private readonly cssClass = SetSubject.create('gtc-list-item-wrapper');

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;
  }

  /**
   * Sets the visibility of this wrapper and its child item.
   * @param visible Whether the wrapper and its child item should be visible.
   */
  public setVisible(visible: boolean): void {
    this.cssClass.toggle('hidden', !visible);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.cssClass}>
        {this.props.children}
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    super.destroy();
  }
}