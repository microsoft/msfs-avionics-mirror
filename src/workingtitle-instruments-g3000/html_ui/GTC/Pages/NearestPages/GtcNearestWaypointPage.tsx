import {
  DisplayComponent, FacilityTypeMap, FacilityWaypoint, FSComponent, GeoPoint, GeoPointSubject, ICAO,
  MutableSubscribable, NearestSubscription, SetSubject, Subject, Subscribable, SubscribableUtils, Subscription,
  UserSettingManager, VNode
} from '@microsoft/msfs-sdk';

import { GarminFacilityWaypointCache, UnitsUserSettings } from '@microsoft/msfs-garminsdk';

import {
  BasicNearestWaypointEntry, ControllableDisplayPaneIndex, DisplayPaneControlEvents, DisplayPaneSettings,
  DisplayPanesUserSettings, DisplayPaneViewKeys, DynamicListData, G3000NearestContext, NearestPaneSelectionData,
  NearestPaneSelectionType, NearestPaneViewEventTypes, NearestWaypointArray, NearestWaypointEntry,
  NearestWaypointFacilityType, NearestWaypointTypeMap
} from '@microsoft/msfs-wtg3000-common';

import { GtcList } from '../../Components/List';
import { GtcNearestWaypointList } from '../../Components/Nearest/GtcNearestWaypointList';
import { GtcNearestWaypointListItem, GtcNearestWaypointListItemProps } from '../../Components/Nearest/GtcNearestWaypointListItem';
import { GtcView, GtcViewProps } from '../../GtcService/GtcView';
import { GtcPositionHeadingDataProvider } from '../../Navigation/GtcPositionHeadingDataProvider';

import './GtcNearestPage.css';
import './GtcNearestWaypointPage.css';

/**
 * Component props for GtcNearestWaypointPage.
 */
export interface GtcNearestWaypointPageProps extends GtcViewProps {
  /** A provider of airplane position and heading data. */
  posHeadingDataProvider: GtcPositionHeadingDataProvider;
}

/**
 * A GTC nearest waypoint page.
 */
export abstract class GtcNearestWaypointPage<
  T extends NearestWaypointFacilityType,
  EntryType extends NearestWaypointEntry<NearestWaypointTypeMap[T]> = NearestWaypointEntry<NearestWaypointTypeMap[T]>,
  P extends GtcNearestWaypointPageProps = GtcNearestWaypointPageProps
> extends GtcView<P> {

  protected static readonly GPS_FAIL_CLEAR_LIST_DELAY = 10000; // milliseconds

  protected readonly listRef = FSComponent.createRef<GtcList<EntryType & DynamicListData>>();

  protected readonly rootCssClass = SetSubject.create(['nearest-page', 'nearest-wpt-page', this.getCssClass()]);

  /** The view key for this page's options popup. */
  protected abstract readonly optionsPopupKey: string;

  protected readonly publisher = this.bus.getPublisher<DisplayPaneControlEvents<NearestPaneViewEventTypes>>();

  protected readonly displayPaneIndex: ControllableDisplayPaneIndex;
  protected readonly displayPaneSettings: UserSettingManager<DisplayPaneSettings>;

  protected readonly facWaypointCache = GarminFacilityWaypointCache.getCache(this.bus);

  protected nearestContext?: G3000NearestContext;
  protected nearestSubscription?: NearestSubscription<FacilityTypeMap[T]>;

  protected readonly waypointArray = new NearestWaypointArray(
    this.bus,
    this.createWaypointEntry.bind(this),
    this.props.posHeadingDataProvider.isGpsDataFailed,
    GtcNearestWaypointPage.GPS_FAIL_CLEAR_LIST_DELAY
  );

  /** The selected waypoint, or `null` if there is no selected waypoint. */
  protected readonly selectedWaypoint = Subject.create<NearestWaypointTypeMap[T] | null>(null);
  /** Whether a waypoint is selected. */
  protected readonly hasSelectedWaypoint = this.selectedWaypoint.map(waypoint => waypoint !== null);

  /** The facility associated with the selected waypoint. */
  protected readonly selectedFacility = Subject.create<FacilityTypeMap[T] | null>(null);

  /** The position of the airplane. */
  protected readonly ppos = GeoPointSubject.create(new GeoPoint(NaN, NaN));

  /** The true heading of the airplane, in degrees, or `NaN` if heading data is invalid. */
  protected readonly planeHeadingTrue = Subject.create(NaN, SubscribableUtils.NUMERIC_NAN_EQUALITY);

  protected readonly listItemHeight = this.props.gtcService.isHorizontal ? 130 : 70;
  protected readonly listItemSpacing = this.props.gtcService.isHorizontal ? 2 : 1;

  /** The view key for this page's options popup. */
  protected abstract readonly showOnMapType: NearestPaneSelectionType;
  protected readonly showOnMap = Subject.create(false);
  protected readonly showOnMapIcao = this.selectedFacility.map(facility => facility?.icaoStruct ?? ICAO.emptyValue(), ICAO.valueEquals);
  protected resetMapRange = false;

  protected readonly unitsSettingManager = UnitsUserSettings.getManager(this.bus);

  protected isPaused = true;

  protected nearestFacilitiesUpdateSub?: Subscription;
  protected selectedFacilityPipe?: Subscription;
  protected pposPipe?: Subscription;
  protected headingPipe?: Subscription;
  protected isGpsDataFailedSub?: Subscription;
  protected isGpsDrSub?: Subscription;
  protected showOnMapSub?: Subscription;

  /**
   * Constructor.
   * @param props This component's props.
   * @throws Error if a display pane index is not defined for this view.
   */
  public constructor(props: P) {
    super(props);

    if (this.props.displayPaneIndex === undefined) {
      throw new Error('GtcNearestPage: display pane index was not defined');
    }

    this.displayPaneIndex = this.props.displayPaneIndex;
    this.displayPaneSettings = DisplayPanesUserSettings.getDisplayPaneManager(this.bus, this.displayPaneIndex);

    this.selectedWaypoint.sub(waypoint => {
      this.selectedFacilityPipe?.destroy();

      if (waypoint === null) {
        this.selectedFacility.set(null);
      } else {
        this.selectedFacilityPipe = (waypoint.facility as Subscribable<FacilityTypeMap[T]>).pipe(this.selectedFacility);
      }
    }, true);

    this.initNearestSearch();
  }

  /**
   * Initializes this page's nearest waypoints search.
   */
  protected async initNearestSearch(): Promise<void> {
    this.nearestContext = await G3000NearestContext.getInstance();
    this.nearestSubscription = this.getNearestSubscription(this.nearestContext);

    this.waypointArray.init(this.nearestSubscription, this.isPaused);

    this.nearestFacilitiesUpdateSub = this.nearestContext.updateEvent.on(() => {
      this.listRef.getOrDefault()?.updateOrder();
    }, this.isPaused);
  }

  /**
   * Gets this page's nearest facilities subscription from a nearest context.
   * @param context A nearest context.
   * @returns This page's nearest facilities subscription from the specified nearest context.
   */
  protected abstract getNearestSubscription(context: G3000NearestContext): NearestSubscription<FacilityTypeMap[T]>;

  /** @inheritdoc */
  public onAfterRender(): void {
    this._activeComponent.set(this.listRef.instance);

    this.isGpsDataFailedSub = this.props.posHeadingDataProvider.isGpsDataFailed.sub(isFailed => {
      if (isFailed) {
        this.nearestFacilitiesUpdateSub?.pause();
      } else {
        this.listRef.instance.updateOrder();
        this.nearestFacilitiesUpdateSub?.resume();
      }
    }, false, true);

    this.pposPipe = this.props.posHeadingDataProvider.pposWithFailure.pipe(this.ppos, true);
    this.headingPipe = this.props.posHeadingDataProvider.headingTrueWithFailure.pipe(this.planeHeadingTrue, true);

    this.isGpsDrSub = this.props.posHeadingDataProvider.isGpsDeadReckoning.sub(isDr => {
      this.rootCssClass.toggle('dead-reckoning', isDr);
    }, true);

    const showOnMapIcaoSub = this.showOnMapIcao.sub(icao => {
      this.sendSelectionData({ type: this.showOnMapType, icao, resetRange: this.resetMapRange });
      this.resetMapRange = false;
    }, false, true);

    this.showOnMapSub = this.showOnMap.sub(show => {
      const viewSetting = this.displayPaneSettings.getSetting('displayPaneView');

      if (show) {
        this.resetMapRange = true;
        viewSetting.value = DisplayPaneViewKeys.Nearest;
        showOnMapIcaoSub.resume(true);
      } else {
        showOnMapIcaoSub.pause();
        viewSetting.value = this.displayPaneSettings.getSetting('displayPaneDesignatedView').value;
      }
    }, false, true);
  }

  /** @inheritdoc */
  public onOpen(): void {
    this.showOnMapSub?.resume(true);
  }

  /** @inheritdoc */
  public onClose(): void {
    this.showOnMap.set(false);
    this.showOnMapSub?.pause();
  }

  /** @inheritdoc */
  public onResume(): void {
    this.isPaused = false;

    this.waypointArray.resume();

    this.pposPipe?.resume(true);
    this.headingPipe?.resume(true);
    this.isGpsDataFailedSub?.resume(true);
  }

  /** @inheritdoc */
  public onPause(): void {
    this.isPaused = true;

    this.waypointArray.pause();

    this.nearestFacilitiesUpdateSub?.pause();

    this.pposPipe?.pause();
    this.headingPipe?.pause();
    this.isGpsDataFailedSub?.pause();
  }

  /**
   * Creates a waypoint entry for a nearest facility search result.
   * @param waypoint A nearest facility search result, as a Waypoint.
   * @returns A waypoint entry for the specified nearest facility search result.
   */
  protected createWaypointEntry(waypoint: NearestWaypointTypeMap[T]): EntryType {
    return new BasicNearestWaypointEntry(waypoint, this.ppos, this.planeHeadingTrue) as unknown as EntryType;
  }

  /**
   * Sends waypoint selection data to the display pane controlled by this page.
   * @param data The data to send.
   */
  protected sendSelectionData(data: NearestPaneSelectionData): void {
    this.publisher.pub('display_pane_view_event', {
      displayPaneIndex: this.displayPaneIndex,
      eventType: 'display_pane_nearest_set',
      eventData: data
    }, true, false);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.rootCssClass}>
        <div class='nearest-page-container'>
          <div class='nearest-page-header'>
            <div class='nearest-page-header-type'>{this.getHeaderTypeLabel()}</div>
            <div class='nearest-page-header-brg'>BRG</div>
            <div class='nearest-page-header-dis'>DIS</div>
            {this.renderAdditionalHeaderColumns()}
          </div>
          <GtcNearestWaypointList
            ref={this.listRef}
            bus={this.bus}
            data={this.waypointArray}
            renderItem={this.renderListItem.bind(this)}
            listItemHeightPx={this.listItemHeight}
            listItemSpacingPx={this.listItemSpacing}
            itemsPerPage={5}
            sidebarState={this._sidebarState}
            noResultsText='No Results Found'
            class='nearest-page-list'
          />
        </div>
      </div>
    );
  }

  /**
   * Gets the CSS class for this page's root element.
   * @returns The CSS class for this page's root element.
   */
  protected abstract getCssClass(): string;

  /**
   * Gets the label for the type column of this page's header .
   * @returns The label for the type column of this page's header.
   */
  protected abstract getHeaderTypeLabel(): string;

  /**
   * Renders additional header columns.
   * @returns Additional header columns, as a VNode, or `null` if there are no additional columns.
   */
  protected abstract renderAdditionalHeaderColumns(): VNode | null;

  /**
   * Renders an item for this page's nearest waypoint list.
   * @param data The nearest waypoint entry for which to render.
   * @param index The index of the item.
   * @returns A nearest waypoint list item, as a VNode.
   */
  protected abstract renderListItem(data: EntryType, index: number): VNode;

  /** @inheritdoc */
  public destroy(): void {
    this.listRef.getOrDefault()?.destroy();

    this.nearestFacilitiesUpdateSub?.destroy();

    this.pposPipe?.destroy();
    this.headingPipe?.destroy();
    this.isGpsDataFailedSub?.destroy();
    this.isGpsDrSub?.destroy();

    this.selectedFacilityPipe?.destroy();
    this.showOnMapSub?.destroy();

    super.destroy();
  }
}

/**
 * Component props for GtcNearestWaypointPageListItem.
 */
export interface GtcNearestWaypointPageListItemProps<
  W extends FacilityWaypoint,
  EntryType extends NearestWaypointEntry<W> = NearestWaypointEntry<W>
> extends Omit<GtcNearestWaypointListItemProps<EntryType>, 'onButtonPressed' | 'isSelected'> {

  /** The view key of the options popup opened by the list item's waypoint button. */
  optionsPopupKey: string;

  /** The selected waypoint for the list item's parent nearest waypoint page. */
  selectedWaypoint: MutableSubscribable<W | null>;
}

/**
 * A nearest waypoint list item for a GTC nearest waypoint page.
 */
export class GtcNearestWaypointPageListItem<W extends FacilityWaypoint, EntryType extends NearestWaypointEntry<W> = NearestWaypointEntry<W>>
  extends DisplayComponent<GtcNearestWaypointPageListItemProps<W, EntryType>> {

  private readonly itemRef = FSComponent.createRef<GtcNearestWaypointListItem<EntryType>>();

  private readonly isSelected = this.props.selectedWaypoint.map(selected => selected?.uid === this.props.entry.waypoint.uid);

  /** @inheritdoc */
  public render(): VNode {
    return (
      <GtcNearestWaypointListItem
        ref={this.itemRef}
        gtcService={this.props.gtcService}
        entry={this.props.entry}
        unitsSettingManager={this.props.unitsSettingManager}
        isSelected={this.isSelected}
        onButtonPressed={() => {
          const selected = this.props.selectedWaypoint.get();

          if (selected !== null && this.props.entry.waypoint.equals(selected)) {
            this.props.selectedWaypoint.set(null);
          } else {
            this.props.selectedWaypoint.set(this.props.entry.waypoint);
            if (this.props.gtcService.activeView.get().key !== this.props.optionsPopupKey) {
              this.props.gtcService.openPopup(this.props.optionsPopupKey, 'slideout-right', 'none');
            }
          }
        }}
        hideBorder={this.props.hideBorder}
        paddedListItem={this.props.paddedListItem}
        class='nearest-page-list-row'
      >
        {this.props.children}
      </GtcNearestWaypointListItem>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.props.onDestroy && this.props.onDestroy();

    this.itemRef.getOrDefault()?.destroy();

    this.isSelected.destroy();

    super.destroy();
  }
}
