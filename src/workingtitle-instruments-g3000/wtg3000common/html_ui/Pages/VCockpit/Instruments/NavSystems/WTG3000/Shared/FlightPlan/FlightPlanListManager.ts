/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ArraySubject, DebounceTimer, EventBus, FlightPlanSegment, FlightPlanSegmentType, LegDefinition, SetSubject, Subject, Subscribable, SubscribableArray,
  Subscription
} from '@microsoft/msfs-sdk';

import { Fms, UnitsUserSettings } from '@microsoft/msfs-garminsdk';

import { G3000FlightPlannerId } from '../CommonTypes';
import { AddEnrouteWaypointButtonListData, FlightPlanListData } from './FlightPlanDataTypes';
import { FlightPlanLegData, FlightPlanLegListData } from './FlightPlanLegListData';
import { FlightPlanSegmentData, FlightPlanSegmentListData } from './FlightPlanSegmentListData';
import { FlightPlanStore } from './FlightPlanStore';

/** Tracks flight plan segments and legs and manages them together in a single list. */
export class FlightPlanListManager {
  private readonly _dataList = ArraySubject.create<FlightPlanListData>();
  public readonly dataList = this._dataList as SubscribableArray<FlightPlanListData>;

  public readonly fromLegListIndex = Subject.create<number | undefined>(undefined);
  public readonly toLegListIndex = Subject.create<number | undefined>(undefined);
  public readonly fromLegVisibleListIndex = Subject.create<number | undefined>(undefined);
  public readonly toLegVisibleListIndex = Subject.create<number | undefined>(undefined);

  private readonly legVisibilitySubsMap = new Map<LegDefinition, Subscription>();
  private readonly legVisibilityChangedDebounceTimer = new DebounceTimer();

  private readonly _segmentDataMap = new Map<FlightPlanSegmentData, FlightPlanSegmentListData>();
  public readonly segmentDataMap = this._segmentDataMap as ReadonlyMap<FlightPlanSegmentData, FlightPlanSegmentListData>;

  private readonly _legDataMap = new Map<FlightPlanLegData, FlightPlanLegListData>();
  public readonly legDataMap = this._legDataMap as ReadonlyMap<FlightPlanLegData, FlightPlanLegListData>;

  private readonly unitsSettingManager = UnitsUserSettings.getManager(this.bus);

  // Airways
  public readonly collapsedAirwaySegments = SetSubject.create<FlightPlanSegment>([]);

  private segments = [] as FlightPlanSegmentListData[];

  private addEnrouteWaypointData?: AddEnrouteWaypointButtonListData;

  private readonly subs = [] as Subscription[];

  /**
   * Creates a new FlightPlanListManager.
   * @param bus The event bus.
   * @param store The flight plan store to use.
   * @param fms The FMS.
   * @param planIndex The flight plan index to use.
   * @param loadNewAirwaysCollapsed A subscribable indicating whether new airways should be collapsed.
   */
  public constructor(
    private readonly bus: EventBus,
    private readonly store: FlightPlanStore,
    private readonly fms: Fms<G3000FlightPlannerId>,
    private readonly planIndex: number,
    private readonly loadNewAirwaysCollapsed: Subscribable<boolean>,
  ) {
    // Removes "Add Enroute Waypoint" item when Done is clicked.
    this.subs.push(this.store.addEnrouteWaypointButtonIsVisible.sub(isVisible => {
      if (!isVisible && this.addEnrouteWaypointData) {
        // TODO Don't remove it, jsut make it not visible
        this._dataList.removeItem(this.addEnrouteWaypointData);
        delete this.addEnrouteWaypointData;
      }
    }));

    this.subs.push(this.store.beforeFlightPlanLoaded.on(() => this.clearData()));
    this.subs.push(this.store.flightPlanLegsChanged.on(() => this.updateFromToLegListIndexes()));
    this.subs.push(this.store.flightPlanLegsChanged.on(() => this.onLegVisibilityChanged()));
    this.subs.push(this.store.segmentAdded.on((_, segData) => this.handleSegmentAdded(segData)));
    this.subs.push(this.store.segmentInserted.on((_, segData) => this.handleSegmentInserted(segData)));
    this.subs.push(this.store.segmentRemoved.on((_, [segData, segIndex]) => this.handleSegmentRemoved(segData, segIndex)));
    this.subs.push(this.store.segmentChanged.on(() => this.handleSegmentChanged()));
    this.subs.push(this.store.legAdded.on((_, [legData, segIndex, segLegIndex]) => this.handleLegAdded(legData, segIndex, segLegIndex)));
    this.subs.push(this.store.legRemoved.on((_, legData) => this.handleLegRemoved(legData)));

    this.subs.push(this.store.fromLeg.sub(() => this.updateFromToLegListIndexes()));
    this.subs.push(this.store.toLeg.sub(() => this.updateFromToLegListIndexes()));
    this.subs.push(this.dataList.sub(() => this.updateFromToLegListIndexes()));

    this.updateFromToLegListIndexes();
  }

  /** Handles the flight plan loaded event. */
  private clearData(): void {
    this._dataList.clear();

    this.segments = [];
    for (const [, segmentListData] of this.segmentDataMap) {
      this.removeSegmentListData(segmentListData);
    }
    this._segmentDataMap.clear();

    for (const [, legListData] of this.legDataMap) {
      this.removeLegListData(legListData);
    }
    this._legDataMap.clear();

    this.legVisibilitySubsMap.clear();
    delete this.addEnrouteWaypointData;
  }

  /**
   * Handles the segment added event.
   * @param newSegData The new segment data.
   * @throws Error when the segment being added already exists.
   */
  private handleSegmentAdded(newSegData: FlightPlanSegmentData): void {
    // In theory, added means append to end of flight plan
    // Is only used when intializing the flight plan, or recreating it after deleting it

    const segment = newSegData.segment;

    if (segment.airway !== undefined && this.loadNewAirwaysCollapsed.get() === true) {
      this.collapsedAirwaySegments.add(segment);
    }

    const newSegmentListData = new FlightPlanSegmentListData(newSegData, this.store, this);

    this.segments[segment.segmentIndex] = newSegmentListData;
    this._segmentDataMap.set(newSegData, newSegmentListData);

    this._dataList.insert(newSegmentListData);

    // Add the "Add Enroute Waypoint" list item
    if (segment.segmentType === FlightPlanSegmentType.Enroute) {
      if (this.addEnrouteWaypointData) {
        // Move it to the end
        this._dataList.removeItem(this.addEnrouteWaypointData);
        this._dataList.insert(this.addEnrouteWaypointData);
      } else {
        this.addEnrouteWaypointData = {
          type: 'addEnrouteWaypointButton',
          isVisible: Subject.create<boolean>(true),
        };
        this._dataList.insert(this.addEnrouteWaypointData);
      }
      this.store.addEnrouteWaypointButtonIsVisible.set(true);
    }

    this.updateSegmentVisibility();

    // this.ensureMatchesFlightPlan();
  }

  /**
   * Handles the segment inserted event.
   * @param newSegData The new segment data.
   */
  private handleSegmentInserted(newSegData: FlightPlanSegmentData): void {
    const segment = newSegData.segment;
    const { segmentIndex } = segment;

    if (segment.airway !== undefined && this.loadNewAirwaysCollapsed.get() === true) {
      this.collapsedAirwaySegments.add(segment);
    }

    let listIndex: number;

    if (this._dataList.length === 0) {
      listIndex = 0;
    } else if (segmentIndex === 0) {
      listIndex = 0;
    } else if (!this.segments[segmentIndex]) {
      // TODO Needs to account for length of segment (this block might not actually ever get used)
      console.error('TODO Need to account for length of segment');
      listIndex = this._dataList.getArray().indexOf(this.segments[segmentIndex - 1]) + 1;
    } else {
      listIndex = this._dataList.getArray().indexOf(this.segments[segmentIndex]);
      const newSegmentIsEnroute = segment.segmentType === FlightPlanSegmentType.Enroute;

      // Make sure to take the "Add Enroute Waypoint" list item into account
      // It sits at the end of the last enroute segment
      if (newSegmentIsEnroute && this._dataList.get(listIndex - 1).type === 'addEnrouteWaypointButton') {
        listIndex--;
      }
    }

    const newSegmentListData = new FlightPlanSegmentListData(newSegData, this.store, this);

    this.segments.splice(segmentIndex, 0, newSegmentListData);
    this._segmentDataMap.set(newSegData, newSegmentListData);
    this._dataList.insert(newSegmentListData, listIndex);

    this.updateSegmentVisibility();

    // this.ensureMatchesFlightPlan();
  }

  /**
   * Handles the segment removed event.
   * @param segData The segment data to remove.
   * @param segmentIndex The index of the segment being removed.
   * @throws Error when the segment being removed does not exist.
   */
  private handleSegmentRemoved(segData: FlightPlanSegmentData, segmentIndex: number): void {
    this.segments.splice(segmentIndex, 1);

    const segListData = this._segmentDataMap.get(segData);
    if (segListData) {
      this.removeSegmentListData(segListData);
    }

    this._dataList.getArray().slice().forEach(item => {
      if (item.type === 'leg' && item.legData.segment === segData.segment) {
        this.removeLegListData(item);
      }
    });

    this.updateSegmentVisibility();

    // this.ensureMatchesFlightPlan();
  }

  /**
   * Removes a segment list data and destroys it.
   * @param segmentListData The segment list data.
   */
  private removeSegmentListData(segmentListData: FlightPlanSegmentListData): void {
    this._dataList.removeItem(segmentListData);
    this._segmentDataMap.delete(segmentListData.segmentData);
    this.collapsedAirwaySegments.delete(segmentListData.segmentData.segment);

    segmentListData.destroy();
  }

  /**
   * Handles the segment changed event.
   * @throws Error when the segment being removed does not exist.
   */
  private handleSegmentChanged(): void {
    this.updateSegmentVisibility();

    // this.ensureMatchesFlightPlan();
  }

  /**
   * Handles a new leg.
   * @param newLegData The new leg data.
   * @param segmentIndex The segment index.
   * @param segmentLegIndex The segment leg index.
   */
  private handleLegAdded(newLegData: FlightPlanLegData, segmentIndex: number, segmentLegIndex: number): void {
    const segmentListData = this.segments[segmentIndex];
    const segListIndex = this._dataList.getArray().indexOf(segmentListData);
    const newLegListIndex = segListIndex + segmentLegIndex + 1;

    const newLegListData = new FlightPlanLegListData(newLegData, segmentListData, this.store, this.unitsSettingManager);
    this.legVisibilitySubsMap.set(newLegData.leg, newLegListData.isVisible.sub(this.onLegVisibilityChanged));

    this._legDataMap.set(newLegData, newLegListData);
    this._dataList.insert(newLegListData, newLegListIndex);

    this.updateSegmentVisibility();

    // this.ensureMatchesFlightPlan();
  }

  /**
   * Handles a leg being removed.
   * @param legData The leg data to remove.
   */
  private handleLegRemoved(legData: FlightPlanLegData): void {
    const legListData = this._legDataMap.get(legData);
    if (legListData) {
      this.removeLegListData(legListData);
    }

    this.updateSegmentVisibility();

    // this.ensureMatchesFlightPlan();
  }

  /**
   * Removes a leg list data object and destroys it.
   * @param legListData The leg list data.
   */
  private removeLegListData(legListData: FlightPlanLegListData): void {
    this._legDataMap.delete(legListData.legData);
    this._dataList.removeItem(legListData);
    this.legVisibilitySubsMap.get(legListData.legData.leg)?.destroy();
    this.legVisibilitySubsMap.delete(legListData.legData.leg);

    legListData.destroy();
  }

  /**
   * For debugging only.
   * @throws errors if our list doesn't match the flight plan.
   */
  // private ensureMatchesFlightPlan(): void {
  //   if (this.paneIndex === 1) {
  //     const plan = this.fms.getFlightPlan(this.planIndex);
  //     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //     // @ts-ignore
  //     const planSegments = plan.planSegments;
  //     // console.log(planSegments);

  //     for (const planSeg of planSegments) {
  //       if (planSeg) {
  //         const ourSeg = this.segments[planSeg.segmentIndex];
  //         if (planSeg !== ourSeg?.segment) {
  //           throw new Error('segment mismatch paneIndex ' + this.paneIndex);
  //         }
  //         planSeg.legs.forEach((planLeg, legIndex) => {
  //           const ourLegListItem = this.getLegListItemFromIndex(planSeg.segmentIndex, legIndex);
  //           if (ourLegListItem.leg !== planLeg) {
  //             throw new Error('leg mismatch');
  //           }
  //         });
  //       }
  //     }
  //   }
  // }

  /** Updates the from and to leg list indexes. */
  private readonly updateFromToLegListIndexes = (): void => {
    const fromLeg = this.store.fromLeg.get();
    this.fromLegListIndex.set(fromLeg === undefined ? undefined : this.getListIndexFromLeg(fromLeg));

    const toLeg = this.store.toLeg.get()?.leg;
    this.toLegListIndex.set(toLeg === undefined ? undefined : this.getListIndexFromLeg(toLeg));

    const fromLegListIndex = this.fromLegListIndex.get();
    this.fromLegVisibleListIndex.set(fromLegListIndex === undefined ? undefined : this.getVisibleListIndexFromListIndex(fromLegListIndex));

    const toLegListIndex = this.toLegListIndex.get();
    this.toLegVisibleListIndex.set(toLegListIndex === undefined ? undefined : this.getVisibleListIndexFromListIndex(toLegListIndex));
  };

  /**
   * Gets the leg list item with a given segment index and segment leg index.
   * @param segmentIndex The index of the segment that the leg is in.
   * @param segmentLegIndex The index of the leg in the segment.
   * @returns The leg list data.
   * @throws Error in case it breaks.
   */
  private getLegListItemFromIndex(segmentIndex: number, segmentLegIndex: number): FlightPlanLegListData {
    const legListIndex = this.getListIndexFromLegIndex(segmentIndex, segmentLegIndex);
    const item = this._dataList.get(legListIndex) as FlightPlanLegListData;
    if (item.type !== 'leg') {
      throw new Error('getLegListItemFromIndex got the wrong list item: ' + JSON.stringify({ segmentIndex, segmentLegIndex, item }));
    }
    return item;
  }

  /**
   * Gets the leg list index with a given segment index and segment leg index.
   * @param segmentIndex The index of the segment that the leg is in.
   * @param segmentLegIndex The index of the leg in the segment.
   * @returns The list index of the leg.
   */
  private getListIndexFromLegIndex(segmentIndex: number, segmentLegIndex: number): number {
    const segmentListItem = this.segments[segmentIndex];
    const segListIndex = this._dataList.getArray().indexOf(segmentListItem);

    return segListIndex + segmentLegIndex + 1;
  }

  /**
   * Gets the leg list index with a given leg.
   * @param leg The leg.
   * @returns The list index of the leg.
   */
  private getListIndexFromLeg(leg: LegDefinition): number {
    const item = this.dataList.getArray().find(x => x.type === 'leg' && x.legData.leg === leg);
    return this.dataList.getArray().indexOf(item!);
  }

  /**
   * Converts a true list index to a visible one, which takes hidden items into acount.
   * @param listIndex The true list index.
   * @returns The visible list index of the leg.
   */
  private getVisibleListIndexFromListIndex(listIndex: number): number {
    const list = this._dataList.getArray();

    let hiddenItemsBeforeListIndex = 0;

    for (let i = 0; i < listIndex; i++) {
      const item = list[i];
      if (item.isVisible.get() === false) {
        hiddenItemsBeforeListIndex++;
      }
    }

    return listIndex - hiddenItemsBeforeListIndex;
  }

  /** Iterates through the segments and updates their visiblity. */
  private updateSegmentVisibility(): void {
    for (const [segmentData, segmentListData] of this._segmentDataMap) {
      segmentListData.isVisible.set(this.shouldSegmentBeVisible(segmentData.segment, segmentData.segment.segmentIndex));
    }
  }

  /**
   * Determines if a segment should be visible in the flight plan list.
   * @param segment The segment to check.
   * @param segmentIndex The segment index of the given segment.
   * @returns Whether a segment should be visible in the flight plan list.
   */
  private shouldSegmentBeVisible(segment: FlightPlanSegment, segmentIndex: number): boolean {
    /*
     * enroute segment list item is only visible if:
     * a. it is the first normal enroute segment with legs in it
     * b. it is an airway segment
    */
    if (segment.segmentType === FlightPlanSegmentType.Enroute) {
      if (segment.airway !== undefined) {
        return true;
      } else if (segmentIndex <= this.getIndexOfFirstNormalEnrouteSegment() && segment.legs.length > 0) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  }

  /**
   * Gets the index of the first normal (non-airway) enroute segment.
   * @returns The index of the first normal (non-airway) enroute segment.
   */
  private getIndexOfFirstNormalEnrouteSegment(): number {
    // TODO Should this also check if it has legs in it? Or is that handled somewhere else?
    for (const segment of this.fms.getFlightPlan(this.planIndex).segments()) {
      if (segment.segmentType === FlightPlanSegmentType.Enroute && segment.airway === undefined) {
        return segment.segmentIndex;
      }
    }
    return -1;
  }

  /** Called when any leg's visibility has changed. */
  private readonly onLegVisibilityChanged = (): void => {
    // We debounce it because many item visibilities can change at once
    if (this.legVisibilityChangedDebounceTimer.isPending()) {
      return;
    }

    this.legVisibilityChangedDebounceTimer.schedule(this.onLegVisibilityChangedDebounced, 0);
  };

  /** Called 1 frame after any leg visibility changes. */
  private readonly onLegVisibilityChangedDebounced = (): void => {
    for (const [segmentData] of this._segmentDataMap) {
      const segment = segmentData.segment;
      let foundVisibleLeg = false;
      let foundHiddenAirwayLeg = false;
      let foundActiveLeg = false;
      for (const leg of segment.legs) {
        const legListData = this._legDataMap.get(this.store.legMap.get(leg)!)!;
        if (legListData.isVisible.get() && !foundVisibleLeg) {
          foundVisibleLeg = true;
          legListData.isFirstVisibleLegInSegment.set(true);
        } else {
          legListData.isFirstVisibleLegInSegment.set(false);
        }
        if (legListData.legData.isActiveLeg.get()) {
          foundActiveLeg = true;
        }
        if (foundActiveLeg && legListData.isVisible.get() === false && legListData.legData.isVisibleLegType == true && legListData.legData.isInAirwaySegment.get()) {
          foundHiddenAirwayLeg = true;
        }
        if (legListData.legData.isLastLegInSegment.get() && foundHiddenAirwayLeg) {
          legListData.hasHiddenAirwayLegsBefore.set(true);
        } else {
          legListData.hasHiddenAirwayLegsBefore.set(false);
        }
      }
    }

    this.updateFromToLegListIndexes();
  };

  /** Celans up subscriptions. */
  public destroy(): void {
    this.subs.forEach(sub => sub.destroy());

    this.clearData();

    this.legVisibilityChangedDebounceTimer.clear();
  }
}
