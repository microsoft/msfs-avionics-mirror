import {
  FSComponent, Subject, SubscribableUtils, Subscription, VNode, GeoPointSubject,
  GeoPoint, Waypoint, FacilityWaypoint
} from '@microsoft/msfs-sdk';

import { AirportWaypoint, DynamicListData } from '@microsoft/msfs-garminsdk';

import { G3XNearestContext } from '../../../../Shared/Nearest/G3XNearestContext';
import { UiInteractionEvent } from '../../../../Shared/UiSystem/UiInteraction';
import { NearestWaypointEntry } from '../../../../Shared/Nearest/NearestWaypointEntry';
import { G3XUnitsUserSettings } from '../../../../Shared/Settings/G3XUnitsUserSettings';
import { UiService } from '../../../../Shared/UiSystem/UiService';
import { UiKnobUtils } from '../../../../Shared/UiSystem/UiKnobUtils';
import { TabbedContentProps } from '../../../../Shared/Components/TabbedContainer/TabbedContent';
import { PositionHeadingDataProvider } from '../../../../Shared/Navigation/PositionHeadingDataProvider';
import { NearestFacilityWaypointArray } from '../../../../Shared/Nearest/NearestWaypointArray';
import { BasicNearestWaypointEntry } from '../../../../Shared/Nearest/BasicNearestWaypointEntry';
import { AbstractTabbedContent } from '../../../../Shared/Components/TabbedContainer/AbstractTabbedContent';
import { DirectToNearestTabItem } from './DirectToNearestTabItem';
import { UiNearestWaypointList } from '../../../../Shared/Components/Nearest/UiNearestWaypointList';

import './DirectToNearestTab.css';

/**
 * Component props for {@link DirectToNearestTab}.
 */
export interface DirectToNearestTabProps extends TabbedContentProps {
  /** The UI service. */
  uiService: UiService;

  /** A provider of airplane position and heading data. */
  posHeadingDataProvider: PositionHeadingDataProvider;

  /** A callback function to execute when a waypoint is selected. */
  onWaypointSelected: (waypoint: FacilityWaypoint) => void;
}

/**
 * A tab for the Direct-To Nearest page.
 */
export class DirectToNearestTab extends AbstractTabbedContent<DirectToNearestTabProps> {

  private static readonly UPDATE_INTERVAL = 1000; // milliseconds
  private static readonly GPS_FAIL_CLEAR_LIST_DELAY = 10000; // milliseconds

  private readonly listRef = FSComponent.createRef<UiNearestWaypointList<NearestWaypointEntry<AirportWaypoint> & DynamicListData>>();

  private readonly unitsSettingManager = G3XUnitsUserSettings.getManager(this.props.uiService.bus);

  private readonly planePosition = GeoPointSubject.create(new GeoPoint(NaN, NaN));
  private readonly planeHeadingTrue = Subject.create(NaN, SubscribableUtils.NUMERIC_NAN_EQUALITY);

  private readonly waypointArray = new NearestFacilityWaypointArray(
    this.props.uiService.bus,
    this.createWaypointEntry.bind(this),
    this.props.posHeadingDataProvider.isGpsDataFailed,
    DirectToNearestTab.GPS_FAIL_CLEAR_LIST_DELAY
  );

  private needTryFocusFirstListItem = false;

  private nearestFacilitiesUpdateSub?: Subscription;
  private isGpsDataFailedSub?: Subscription;

  private isOpen = false;
  private isResumed = false;

  private lastUpdateTime?: number;

  /**
   * Creates a new instance of DirectToNearestTab.
   * @param props This component's props.
   */
  public constructor(props: DirectToNearestTabProps) {
    super(props);

    this.initNearestSearch();
  }

  /**
   * Initializes this tab's nearest waypoints search.
   */
  private async initNearestSearch(): Promise<void> {
    const nearestContext = await G3XNearestContext.getInstance();

    this.waypointArray.init(nearestContext.airports, !this.isOpen);

    this.nearestFacilitiesUpdateSub = nearestContext.updateEvent.on(() => {
      const list = this.listRef.getOrDefault();
      if (list) {
        this.updateOrderAndReconcileListItemFocus();
      }
    }, !this.isOpen);
  }

  /** @inheritDoc */
  public onAfterRender(): void {
    this.isGpsDataFailedSub = this.props.posHeadingDataProvider.isGpsDataFailed.sub(isFailed => {
      if (isFailed) {
        this.nearestFacilitiesUpdateSub?.pause();
      } else {
        this.updateAirplaneData();
        this.updateOrderAndReconcileListItemFocus();
        this.nearestFacilitiesUpdateSub?.resume();
      }
    }, false, true);

    const listKnobLabelPipe = this.listRef.instance.knobLabelState.pipe(this._knobLabelState, true);
    this.listRef.instance.visibleItemCount.sub(count => {
      if (count > 0) {
        listKnobLabelPipe.resume(true);
      } else {
        listKnobLabelPipe.pause();
        this._knobLabelState.clear();
      }
    }, true);
  }

  /** @inheritDoc */
  public onOpen(): void {
    this.isOpen = true;

    this.waypointArray.resume();

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.isGpsDataFailedSub!.resume(true);
  }

  /** @inheritDoc */
  public onClose(): void {
    this.isOpen = false;

    this.lastUpdateTime = undefined;

    this.waypointArray.pause();

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.isGpsDataFailedSub!.pause();
    this.nearestFacilitiesUpdateSub?.pause();
  }

  /** @inheritDoc */
  public onResume(): void {
    this.isResumed = true;

    if (!this.props.posHeadingDataProvider.isGpsDataFailed.get()) {
      this.nearestFacilitiesUpdateSub?.resume(true);
    }

    this.listRef.instance.focusRecent();
  }

  /** @inheritDoc */
  public onPause(): void {
    this.isResumed = false;

    this.listRef.instance.removeFocus();
  }

  /** @inheritDoc */
  public onUpdate(time: number): void {
    if (this.lastUpdateTime !== undefined && time < this.lastUpdateTime) {
      this.lastUpdateTime = time;
    }

    if (this.lastUpdateTime === undefined || time - this.lastUpdateTime >= DirectToNearestTab.UPDATE_INTERVAL) {
      this.doUpdate();
      this.lastUpdateTime = time;
    }
  }

  /**
   * Updates this tab.
   */
  private doUpdate(): void {
    this.updateAirplaneData();

    if (this.isResumed && this.needTryFocusFirstListItem) {
      const ppos = this.planePosition.get();
      if (this.props.posHeadingDataProvider.isGpsDataFailed.get() || (!isNaN(ppos.lat) && !isNaN(ppos.lon))) {
        this.tryFocusFirstListItem();
        this.needTryFocusFirstListItem = false;
      }
    }
  }

  /** @inheritDoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    return this.listRef.instance.onUiInteractionEvent(event) || super.onUiInteractionEvent(event);
  }

  /**
   * Updates this page's airplane data.
   */
  private updateAirplaneData(): void {
    this.planePosition.set(this.props.posHeadingDataProvider.pposWithFailure.get());
    this.planeHeadingTrue.set(this.props.posHeadingDataProvider.headingTrueWithFailure.get());
  }

  /**
   * Creates a waypoint entry for nearest facility search result.
   * @param waypoint A nearest facility search result, as a Waypoint.
   * @returns A waypoint entry for the specified nearest facility search result.
   */
  private createWaypointEntry(waypoint: Waypoint): NearestWaypointEntry<AirportWaypoint> {
    return new BasicNearestWaypointEntry(waypoint, this.planePosition, this.planeHeadingTrue) as unknown as NearestWaypointEntry<AirportWaypoint>;
  }

  /**
   * Attempts to focus the first item in this page's list if the list is not empty and no list item already has UI
   * focus.
   */
  private tryFocusFirstListItem(): void {
    if (this.listRef.instance.visibleItemCount.get() > 0 && this.listRef.instance.getFocusedIndex() < 0) {
      this.listRef.instance.scrollToIndex(0, 0, true, false);
    }
  }

  /**
   * Updates the ordering of this tab's list items and reconciles the UI focus state of the list.
   */
  private updateOrderAndReconcileListItemFocus(): void {
    if (this.listRef.instance.visibleItemCount.get() === 0) {
      this.needTryFocusFirstListItem = false;
      return;
    }

    this.listRef.instance.updateOrder();

    const { lat, lon } = this.planePosition.get();
    if (this.isResumed && (this.props.posHeadingDataProvider.isGpsDataFailed.get() || (!isNaN(lat) && !isNaN(lon)))) {
      this.tryFocusFirstListItem();
      this.needTryFocusFirstListItem = false;
    } else {
      this.needTryFocusFirstListItem = true;
    }
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='direct-to-nearest-tab'>
        <UiNearestWaypointList<NearestWaypointEntry<AirportWaypoint>>
          ref={this.listRef}
          bus={this.props.uiService.bus}
          data={this.waypointArray}
          validKnobIds={this.props.uiService.validKnobIds.filter(UiKnobUtils.isInnerKnobId)}
          renderItem={this.renderListItem.bind(this)}
          noResultsText='None Within 200nm'
          listItemLengthPx={75}
          listItemSpacingPx={8}
          itemsPerPage={6}
          class='direct-to-nearest-tab-list'
        />
      </div>
    );
  }

  /**
   * Renders a list item for nearest waypoint.
   * @param entry A nearest waypoint.
   * @returns A list item for the specified nearest waypoint.
   */
  private renderListItem(entry: NearestWaypointEntry<AirportWaypoint>): VNode {
    return (
      <DirectToNearestTabItem
        unitsSettingManager={this.unitsSettingManager}
        waypointInfoStore={entry.store}
        onSelected={this.props.onWaypointSelected}
      />
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.listRef.getOrDefault()?.destroy();

    this.waypointArray.destroy();
    this.isGpsDataFailedSub?.destroy();
    this.nearestFacilitiesUpdateSub?.destroy();

    super.destroy();
  }
}
