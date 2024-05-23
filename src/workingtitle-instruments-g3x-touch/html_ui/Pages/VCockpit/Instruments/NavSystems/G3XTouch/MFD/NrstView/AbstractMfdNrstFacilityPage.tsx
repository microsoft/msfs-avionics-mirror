import { FacilityTypeMap, FacilityWaypoint, NearestSubscription, ReadonlyFloat64Array, SubscribableArray, Subscription } from '@microsoft/msfs-sdk';

import { G3XNearestContext } from '../../Shared/Nearest/G3XNearestContext';
import { NearestFacilityWaypointTypeMap, NearestWaypointFacilityType } from '../../Shared/Nearest/NearestWaypoint';
import { NearestFacilityWaypointArray } from '../../Shared/Nearest/NearestWaypointArray';
import { NearestWaypointEntry } from '../../Shared/Nearest/NearestWaypointEntry';
import { UiViewKeys } from '../../Shared/UiSystem/UiViewKeys';
import { UiViewStackLayer } from '../../Shared/UiSystem/UiViewTypes';
import { MfdPageSizeMode } from '../PageNavigation/MfdPageTypes';
import { WaypointInfoPopup } from '../Views/WaypointInfoPopup/WaypointInfoPopup';
import { AbstractMfdNrstPage, AbstractMfdNrstPageProps } from './AbstractMfdNrstPage';

/**
 * An abstract implementation of `MfdNrstPage` that displays a list of nearest facility waypoints sourced from a
 * `G3XNearestContext`.
 */
export abstract class AbstractMfdNrstFacilityPage<
  T extends NearestWaypointFacilityType,
  EntryType extends NearestWaypointEntry<NearestFacilityWaypointTypeMap[T]> = NearestWaypointEntry<NearestFacilityWaypointTypeMap[T]>,
  P extends AbstractMfdNrstPageProps = AbstractMfdNrstPageProps
> extends AbstractMfdNrstPage<NearestFacilityWaypointTypeMap[T], EntryType, P> {

  protected nearestContext?: G3XNearestContext;
  protected nearestSubscription?: NearestSubscription<FacilityTypeMap[T]>;

  protected readonly waypointArray = new NearestFacilityWaypointArray(
    this.props.uiService.bus,
    this.createWaypointEntry.bind(this),
    this.props.posHeadingDataProvider.isGpsDataFailed,
    AbstractMfdNrstPage.GPS_FAIL_CLEAR_LIST_DELAY
  );

  protected needTryFocusFirstListItem = false;

  protected nearestFacilitiesUpdateSub?: Subscription;
  protected isGpsDataFailedSub?: Subscription;

  /**
   * Creates a new instance of AbstractMfdNrstFacilityPage.
   * @param props This component's props.
   */
  public constructor(props: P) {
    super(props);

    this.initNearestSearch();
  }

  /**
   * Initializes this page's nearest waypoints search.
   */
  protected async initNearestSearch(): Promise<void> {
    this.nearestContext = await G3XNearestContext.getInstance();
    this.nearestSubscription = this.getNearestSubscription(this.nearestContext);

    this.waypointArray.init(this.nearestSubscription, !this.isOpen);

    this.nearestFacilitiesUpdateSub = this.nearestContext.updateEvent.on(() => {
      const list = this.listRef.getOrDefault();
      if (list) {
        list.updateOrder();
        this.reconcileListItemFocus();
      }
    }, !this.isOpen);
  }

  /**
   * Gets this page's nearest facilities subscription from a nearest context.
   * @param context A nearest context.
   * @returns This page's nearest facilities subscription from the specified nearest context.
   */
  protected abstract getNearestSubscription(context: G3XNearestContext): NearestSubscription<FacilityTypeMap[T]>;

  /** @inheritDoc */
  public onAfterRender(): void {
    super.onAfterRender();

    this.isGpsDataFailedSub = this.props.posHeadingDataProvider.isGpsDataFailed.sub(isFailed => {
      if (isFailed) {
        this.nearestFacilitiesUpdateSub?.pause();
      } else {
        this.updateAirplaneData();

        this.listRef.instance.updateOrder();
        this.reconcileListItemFocus();
        this.nearestFacilitiesUpdateSub?.resume();
      }
    }, false, true);
  }

  /** @inheritDoc */
  public onOpen(sizeMode: MfdPageSizeMode, dimensions: ReadonlyFloat64Array): void {
    super.onOpen(sizeMode, dimensions);

    this.waypointArray.resume();

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.isGpsDataFailedSub!.resume(true);
  }

  /** @inheritDoc */
  public onClose(): void {
    super.onClose();

    this.waypointArray.pause();

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.isGpsDataFailedSub!.pause();
    this.nearestFacilitiesUpdateSub?.pause();

    this.listRef.instance.clearRecentFocus();
  }

  /** @inheritDoc */
  public onResume(): void {
    super.onResume();

    this.listRef.instance.focusRecent();
  }

  /** @inheritDoc */
  public onPause(): void {
    super.onPause();

    this.listRef.instance.removeFocus();
  }

  /** @inheritDoc */
  protected doUpdate(time: number): void {
    super.doUpdate(time);

    if (this.isResumed && this.needTryFocusFirstListItem) {
      const ppos = this.ppos.get();
      if (this.props.posHeadingDataProvider.isGpsDataFailed.get() || (!isNaN(ppos.lat) && !isNaN(ppos.lon))) {
        this.tryFocusFirstListItem();
        this.needTryFocusFirstListItem = false;
      }
    }
  }

  /**
   * Reconciles the UI focus state of this page's list. If the list is not empty, then the first item in the list will
   * be focused if no other list item has UI focus. This operation is carried out immediately if this page is resumed
   * and either positioning data is in a failed state or this page has been updated with a valid position for the
   * player airplane. Otherwise, the operation is pended until the next update in which these conditions are met. If
   * the list is empty, then no action is taken and any pending reconcilation operation is cancelled.
   */
  protected reconcileListItemFocus(): void {
    if (this.listRef.instance.visibleItemCount.get() === 0) {
      this.needTryFocusFirstListItem = false;
      return;
    }

    const ppos = this.ppos.get();
    if (this.isResumed && (this.props.posHeadingDataProvider.isGpsDataFailed.get() || (!isNaN(ppos.lat) && !isNaN(ppos.lon)))) {
      this.tryFocusFirstListItem();
      this.needTryFocusFirstListItem = false;
    } else {
      this.needTryFocusFirstListItem = true;
    }
  }

  /**
   * Attempts to focus the first item in this page's list if the list is not empty and no list item already has UI
   * focus.
   */
  protected tryFocusFirstListItem(): void {
    if (this.listRef.instance.visibleItemCount.get() > 0 && this.listRef.instance.getFocusedIndex() < 0) {
      this.listRef.instance.scrollToIndex(0, 0, true, false);
    }
  }

  /**
   * Opens a waypoint information popup and sets it to display a waypoint.
   * @param waypoint The waypoint for the popup to display.
   */
  protected openWaypointInfoPopup(waypoint: FacilityWaypoint): void {
    this.props.uiService
      .openMfdPopup<WaypointInfoPopup>(UiViewStackLayer.Overlay, UiViewKeys.WaypointInfoPopup, true, {
        popupType: 'slideout-right-full',
        backgroundOcclusion: 'hide'
      })
      .ref.setWaypoint(waypoint);
  }

  /** @inheritDoc */
  protected getWaypointArray(): SubscribableArray<EntryType> {
    return this.waypointArray;
  }

  /** @inheritDoc */
  public destroy(): void {
    this.waypointArray.destroy();

    this.isGpsDataFailedSub?.destroy();

    super.destroy();
  }
}