import { DisplayComponent, FacilityWaypoint, FSComponent, SetSubject, Subscribable, SubscribableArray, Subscription, VNode } from '@microsoft/msfs-sdk';
import { DynamicListData, NearestWaypointEntry } from '@microsoft/msfs-wtg3000-common';
import { GtcInteractionEvent, GtcInteractionHandler } from '../../GtcService/GtcInteractionEvent';
import { GtcList, GtcListProps } from '../List/GtcList';

import './GtcNearestWaypointList.css';

/**
 * Component props for GtcNearestWaypointList.
 */
export interface GtcNearestWaypointListProps<
  DataType extends NearestWaypointEntry<FacilityWaypoint> & DynamicListData = NearestWaypointEntry<FacilityWaypoint & DynamicListData>
> extends Omit<GtcListProps<DataType>, 'sortItems' | 'data'> {

  /** The data to display in the list. */
  data: SubscribableArray<DataType>;

  /** The text to display when the list is empty. */
  noResultsText: string | Subscribable<string>;
}

/**
 * A scrollable GTC list of nearest waypoints.
 */
export class GtcNearestWaypointList<
  DataType extends NearestWaypointEntry<FacilityWaypoint> & DynamicListData = NearestWaypointEntry<FacilityWaypoint & DynamicListData>
> extends DisplayComponent<GtcNearestWaypointListProps<DataType>> implements GtcInteractionHandler {

  private static readonly RESERVED_CSS_CLASSES = ['nearest-wpt-list'];

  private readonly listRef = FSComponent.createRef<GtcList<DataType>>();

  private readonly noResultsCssClass = SetSubject.create(['nearest-wpt-list-no-results']);

  private cssClassSub?: Subscription;
  private noResultsSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.noResultsSub = this.props.data.sub(() => {
      this.noResultsCssClass.toggle('hidden', this.props.data.length > 0);
    }, true);
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
    this.listRef.getOrDefault()?.scrollToIndex(index, position, animate);
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
    this.listRef.getOrDefault()?.scrollToItem(item, position, animate, ignoreIfItemInView);
  }

  /**
   * Updates the order of rendered items in this list.
   */
  public updateOrder(): void {
    this.listRef.getOrDefault()?.updateOrder();
  }

  /** @inheritdoc */
  public onGtcInteractionEvent(event: GtcInteractionEvent): boolean {
    return this.listRef.getOrDefault()?.onGtcInteractionEvent(event) ?? false;
  }

  /** @inheritdoc */
  public render(): VNode {
    let cssClass: string | SetSubject<string>;

    if (typeof this.props.class === 'object') {
      cssClass = SetSubject.create(['nearest-wpt-list']);
      this.cssClassSub = FSComponent.bindCssClassSet(cssClass, this.props.class, GtcNearestWaypointList.RESERVED_CSS_CLASSES);
    } else {
      cssClass = 'nearest-wpt-list';

      if (this.props.class !== undefined && this.props.class.length > 0) {
        cssClass += ' ' + FSComponent.parseCssClassesFromString(this.props.class, classToAdd => !GtcNearestWaypointList.RESERVED_CSS_CLASSES.includes(classToAdd)).join(' ');
      }
    }

    return (
      <div class={cssClass}>
        <GtcList
          ref={this.listRef}
          bus={this.props.bus}
          data={this.props.data}
          renderItem={this.props.renderItem}
          sortItems={this.sortListItems.bind(this)}
          listItemHeightPx={this.props.listItemHeightPx}
          listItemSpacingPx={this.props.listItemSpacingPx}
          itemsPerPage={this.props.itemsPerPage}
          heightPx={this.props.heightPx}
          sidebarState={this.props.sidebarState}
          onDestroy={this.props.onDestroy}
          class='nearest-wpt-list-list'
        />
        <div class={this.noResultsCssClass}>{this.props.noResultsText}</div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.listRef.getOrDefault()?.destroy();

    this.cssClassSub?.destroy();
    this.noResultsSub?.destroy();

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