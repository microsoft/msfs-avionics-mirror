import {
  FSComponent, GeoPoint, GeoPointSubject, ReadonlyFloat64Array, SetSubject, Subject, Subscribable, SubscribableArray,
  SubscribableUtils, VNode, Waypoint
} from '@microsoft/msfs-sdk';

import { DynamicListData } from '@microsoft/msfs-garminsdk';

import { UiNearestWaypointList } from '../../Shared/Components/Nearest/UiNearestWaypointList';
import { PositionHeadingDataProvider } from '../../Shared/Navigation/PositionHeadingDataProvider';
import { BasicNearestWaypointEntry } from '../../Shared/Nearest/BasicNearestWaypointEntry';
import { NearestWaypointEntry } from '../../Shared/Nearest/NearestWaypointEntry';
import { G3XUnitsUserSettings } from '../../Shared/Settings/G3XUnitsUserSettings';
import { UiInteractionEvent } from '../../Shared/UiSystem/UiInteraction';
import { UiKnobUtils } from '../../Shared/UiSystem/UiKnobUtils';
import { AbstractMfdPage } from '../PageNavigation/AbstractMfdPage';
import { MfdPageProps } from '../PageNavigation/MfdPage';
import { MfdPageSizeMode } from '../PageNavigation/MfdPageTypes';
import { MfdNrstPage } from './MfdNrstPage';

import './AbstractMfdNrstPage.css';

/**
 * Component props for {@link AbstractMfdNrstPage}.
 */
export interface AbstractMfdNrstPageProps extends MfdPageProps {
  /** A provider of airplane position and heading data. */
  posHeadingDataProvider: PositionHeadingDataProvider;
}

/**
 * An abstract implementation of `MfdNrstPage` that displays a list of nearest waypoints.
 */
export abstract class AbstractMfdNrstPage<
  W extends Waypoint = Waypoint,
  EntryType extends NearestWaypointEntry<W> = NearestWaypointEntry<W>,
  P extends AbstractMfdNrstPageProps = AbstractMfdNrstPageProps
> extends AbstractMfdPage<P> implements MfdNrstPage<P> {

  protected static readonly UPDATE_INTERVAL = 1000; // milliseconds
  protected static readonly GPS_FAIL_CLEAR_LIST_DELAY = 10000; // milliseconds

  protected readonly rootCssClass = SetSubject.create(['mfd-nrst-page']);

  protected readonly listRef = FSComponent.createRef<UiNearestWaypointList<EntryType & DynamicListData>>();
  protected readonly listItemLengthPx = Subject.create(0);
  protected readonly listItemSpacingPx = Subject.create(0);
  protected readonly listItemsPerPage = Subject.create(1);

  protected readonly _selectedWaypoint = Subject.create<W | null>(null);
  /** @inheritDoc */
  public readonly selectedWaypoint = this._selectedWaypoint as Subscribable<Waypoint | null>;

  /** The position of the airplane. */
  protected readonly ppos = GeoPointSubject.create(new GeoPoint(NaN, NaN));

  /** The true heading of the airplane, in degrees, or `NaN` if heading data is invalid. */
  protected readonly planeHeadingTrue = Subject.create(NaN, SubscribableUtils.NUMERIC_NAN_EQUALITY);

  protected readonly unitsSettingManager = G3XUnitsUserSettings.getManager(this.props.uiService.bus);

  protected isOpen = false;
  protected isResumed = false;

  protected lastUpdateTime?: number;

  /** @inheritDoc */
  public onAfterRender(): void {
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
  public onOpen(sizeMode: MfdPageSizeMode, dimensions: ReadonlyFloat64Array): void {
    this.isOpen = true;
    this.handleResize(sizeMode, dimensions);
  }

  /** @inheritDoc */
  public onClose(): void {
    this.isOpen = false;
    this.lastUpdateTime = undefined;
  }

  /** @inheritDoc */
  public onResume(): void {
    this.isResumed = true;
  }

  /** @inheritDoc */
  public onPause(): void {
    this.isResumed = false;
  }

  /** @inheritDoc */
  public onResize(sizeMode: MfdPageSizeMode, dimensions: ReadonlyFloat64Array): void {
    this.handleResize(sizeMode, dimensions);
  }

  /**
   * Handles potential changes in the size mode or dimensions of this page's container.
   * @param sizeMode The new size mode of this page's container.
   * @param dimensions The new dimensions of this page's container, as `[width, height]` in pixels.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected handleResize(sizeMode: MfdPageSizeMode, dimensions: ReadonlyFloat64Array): void {
    // TODO: Add support for GDU470 (portrait) dimensions.

    if (sizeMode === MfdPageSizeMode.Full) {
      this.listItemLengthPx.set(87);
      this.listItemSpacingPx.set(8);
      this.listItemsPerPage.set(6);
    } else {
      this.listItemLengthPx.set(87);
      this.listItemSpacingPx.set(8);
      this.listItemsPerPage.set(3);
    }
  }

  /** @inheritDoc */
  public onUpdate(time: number): void {
    if (this.lastUpdateTime !== undefined && time < this.lastUpdateTime) {
      this.lastUpdateTime = time;
    }

    if (this.lastUpdateTime === undefined || time - this.lastUpdateTime >= AbstractMfdNrstPage.UPDATE_INTERVAL) {
      this.doUpdate(time);

      this.lastUpdateTime = time;
    }
  }

  /**
   * Updates this page.
   * @param time The current real (operating system) time, as a Javascript timestamp.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected doUpdate(time: number): void {
    this.updateAirplaneData();
  }

  /**
   * Updates this page's airplane data.
   */
  protected updateAirplaneData(): void {
    this.ppos.set(this.props.posHeadingDataProvider.pposWithFailure.get());
    this.planeHeadingTrue.set(this.props.posHeadingDataProvider.headingTrueWithFailure.get());
  }

  /** @inheritDoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    return this.listRef.instance.onUiInteractionEvent(event);
  }

  /**
   * Creates a waypoint entry for a nearest facility search result.
   * @param waypoint A nearest facility search result, as a Waypoint.
   * @returns A waypoint entry for the specified nearest facility search result.
   */
  protected createWaypointEntry(waypoint: W): EntryType {
    return new BasicNearestWaypointEntry(waypoint, this.ppos, this.planeHeadingTrue) as unknown as EntryType;
  }

  /**
   * Gets a subscribable array of nearest waypoints to display in this page's list.
   * @returns A subscribable array of nearest waypoints to display in this page's list.
   */
  protected abstract getWaypointArray(): SubscribableArray<EntryType>;

  /**
   * Gets the text to show when no nearest waypoints are available to display.
   * @returns The text to show when no nearest waypoints are available to display.
   */
  protected getNoResultsText(): string | Subscribable<string> {
    return 'None Within 200nm';
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class={this.rootCssClass}>
        <UiNearestWaypointList
          ref={this.listRef}
          validKnobIds={this.props.uiService.validKnobIds.filter(UiKnobUtils.isInnerKnobId)}
          bus={this.props.uiService.bus}
          data={this.getWaypointArray()}
          renderItem={this.renderListItem.bind(this)}
          listItemLengthPx={this.listItemLengthPx}
          listItemSpacingPx={this.listItemSpacingPx}
          itemsPerPage={this.listItemsPerPage}
          noResultsText={this.getNoResultsText()}
          class='mfd-nrst-page-list'
        />
      </div>
    );
  }

  /**
   * Renders an item for this page's nearest waypoint list.
   * @param data The nearest waypoint entry for which to render.
   * @param index The index of the item.
   * @returns A nearest waypoint list item, as a VNode.
   */
  protected abstract renderListItem(data: EntryType, index: number): VNode;

  /** @inheritDoc */
  public destroy(): void {
    this.listRef.getOrDefault()?.destroy();

    super.destroy();
  }
}