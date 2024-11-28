/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  AdcEvents, ArraySubject, BitFlags, ConsumerSubject, DebounceTimer, EventBus, FlightPlanSegment, FlightPlanSegmentType, LegDefinition, LegDefinitionFlags,
  SetSubject, Subject, Subscribable, SubscribableArray, Subscription
} from '@microsoft/msfs-sdk';

import { Epic2FlightPlans, Epic2Fms, Epic2FmsUtils } from '../Fms';
import { UnitsUserSettings } from '../Settings/UnitsUserSettings';
import { AmendRouteButtonListData, FlightPlanListData } from './FlightPlanDataTypes';
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

  private readonly isOnGround = ConsumerSubject.create(this.bus.getSubscriber<AdcEvents>().on('on_ground'), false);

  // Airways
  public readonly collapsedAirwaySegments = SetSubject.create<FlightPlanSegment>([]);

  private segments = [] as FlightPlanSegmentListData[];

  private amendRouteData?: AmendRouteButtonListData;

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
    private readonly fms: Epic2Fms,
    private readonly planIndex: number,
    private readonly loadNewAirwaysCollapsed: Subscribable<boolean>
  ) {
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
    this.subs.push(this.store.toLeg.sub(() => this.updateDirectToInformation(this.store.directToOriginalLeg.get())));
    this.subs.push(this.store.isInHold.sub((holding) => this.updateHoldMarker(holding)));
    this.subs.push(this.store.toLeg.sub(() => this.updateHoldMarker(this.store.isInHold.get())));
    this.subs.push(this.store.amendWaypointForDisplay.sub((listData) => this.updateAddWaypointListItem(listData)));
    this.subs.push(this.dataList.sub(() => this.updateFromToLegListIndexes()));
    this.subs.push(this.store.arrivalFacility.sub(() => this.checkLastLegUndefined()));
    this.subs.push(this.store.arrivalFacility.sub(() => this.updateMissedApproachDivider()));
    this.subs.push(this.fms.planInMod.sub(() => this.updateMissedApproachDivider()));
    this.subs.push(this.store.directToOriginalLeg.sub((leg) => this.updateDirectToInformation(leg)));
    this.subs.push(this.store.isDtoRandomEntryShown.sub((vis) => this.updateDirectToRandomListItem(vis)));
    this.subs.push(this.store.tocIndex.sub(() => this.updateVnavListItems()));
    this.subs.push(this.store.todIndex.sub(() => this.updateVnavListItems()));
    this.subs.push(this.store.tocBeforeTod.sub(() => this.updateVnavListItems()));
    this.subs.push(this.isOnGround.sub(() => this.updateVnavListItems()));


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
    delete this.amendRouteData;
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

    if (segment.airway !== undefined && this.loadNewAirwaysCollapsed.get()) {
      this.collapsedAirwaySegments.add(segment);
    }

    const newSegmentListData = new FlightPlanSegmentListData(newSegData, this.store, this);

    this.segments[segment.segmentIndex] = newSegmentListData;
    this._segmentDataMap.set(newSegData, newSegmentListData);

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

    if (segment.airway !== undefined && this.loadNewAirwaysCollapsed.get()) {
      this.collapsedAirwaySegments.add(segment);
    }

    const newSegmentListData = new FlightPlanSegmentListData(newSegData, this.store, this);

    this.segments.splice(segmentIndex, 0, newSegmentListData);
    this._segmentDataMap.set(newSegData, newSegmentListData);

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
   * Gets the list index for a new item
   * @param globalLegIndex The global leg index
   * @returns list index
   */
  private calculateNewListIndex(globalLegIndex: number): number {
    const dataArray = this._dataList.getArray();

    // When adding new items to the plan list we need to ensure that we compensate
    // for any items which are not leg items, otherwise the flight plan will go out of order

    let nonLegItems = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const isLeg = dataArray[i] instanceof FlightPlanLegListData;
      nonLegItems += (!isLeg || (isLeg && (dataArray[i] as FlightPlanLegListData).isBeingRemoved.get())) ? 1 : 0;

      if (i >= globalLegIndex + nonLegItems) {
        break;
      }
    }

    return globalLegIndex + nonLegItems;
  }

  /**
   * Handles a new leg.
   * @param newLegData The new leg data.
   * @param segmentIndex The segment index.
   * @param segmentLegIndex The segment leg index.
   */
  private handleLegAdded(newLegData: FlightPlanLegData, segmentIndex: number, segmentLegIndex: number): void {
    const existingLeg = this.getListIndexFromLeg(newLegData.leg);

    if (existingLeg !== -1) {
      const legData = this.getLegListItemFromIndex(segmentIndex, segmentLegIndex);
      this.removeLegListData(legData);
    }

    const segmentListData = this.segments[segmentIndex];
    const newLegListIndex = this.calculateNewListIndex(newLegData.globalLegIndex.get());

    const newLegListData = new FlightPlanLegListData(newLegData, segmentListData, this.store, this.unitsSettingManager);
    this.legVisibilitySubsMap.set(newLegData.leg, newLegListData.isVisible.sub(this.onLegVisibilityChanged));

    this._legDataMap.set(newLegData, newLegListData);
    this._dataList.insert(newLegListData, newLegListIndex);
    this.setLegNew(newLegListData);

    this.updateSegmentVisibility();
    // this.updateListDividers();
    this.updateDirectToInformation(this.store.directToOriginalLeg.get());
    this.checkLastLegUndefined();

    // this.ensureMatchesFlightPlan();
  }

  /**
   * Handles a leg being removed.
   * @param legData The leg data to remove.
   */
  private handleLegRemoved(legData: FlightPlanLegData): void {
    const legListData = this._legDataMap.get(legData);
    if (legListData) {
      if (this.planIndex == Epic2FlightPlans.Pending /*&& !this.checkLegIsDisplacedByDto(legListData)*/) {
          legListData.isBeingRemoved.set(true);
      } else {
        this.removeLegListData(legListData);
      }
    }

    this.updateSegmentVisibility();
    this.checkLastLegUndefined();
    this.updateDirectToInformation(this.store.directToOriginalLeg.get());

    // this.ensureMatchesFlightPlan();
  }

  /**
   * Function that searches the data list for any items of the specified type and removes them
   * @param type The type of items to remove
   * @param ignoreIndex index to ignore when searching
   */
  private removeListItemOfType(type: string, ignoreIndex?: number): void {
    // If we don't do this, then the item list doesnt re-render after having removed the items
    const itemsToRemove: number[] = [];
    this._dataList.getArray().forEach((data, index) => {
      if (data.type == type && index !== ignoreIndex) {
        (data.isVisible as Subject<boolean>).set(false);
        itemsToRemove.push(index);
      }
    });

    itemsToRemove.forEach((index) => {
      this._dataList.removeAt(index);
    });
  }

  /**
   * Checks if this leg is new (i.e. not in the active plan), and sets isNew
   * @param legData The data of the leg
   */
  private setLegNew(legData: FlightPlanLegListData): void {
    const activePlan = this.fms.getFlightPlan(Epic2FlightPlans.Active);

    if (this.planIndex == Epic2FlightPlans.Pending) {
      legData.isNew.set(true);
      for (const leg of activePlan.legs()) {
        if (leg.leg.fixIcao == legData.legData.leg.leg.fixIcao) {
          legData.isNew.set(false);
          break;
        }
      }
    }
  }

  /**
   * Updates the missed approach divider
   */
  private updateMissedApproachDivider(): void {
    const plan = this.fms.getFlightPlan(this.planIndex);
    const mapLegGlobalIndex = Epic2FmsUtils.getMissedApproachPointIndex(plan);

    this.removeListItemOfType('missedApproachDivider');

    if (mapLegGlobalIndex >= 0) {
      this._dataList.insert({
        type: 'missedApproachDivider',
        isVisible: Subject.create<boolean>(true),
      }, this.calculateNewListIndex(mapLegGlobalIndex) + 1);
    }
  }

  /**
   * Updates the MAP and ALTN flight plan dividers
   */
  private updateListDividers(): void {
    const alternatePlan = null;

    // TODO: Create the specific functionality for an alternate flight plan
    if (alternatePlan) {
      this._dataList.insert({
        type: 'alternatePlanDivider',
        isVisible: Subject.create<boolean>(true),
      });
      this.removeListItemOfType('alternatePlanDivider');
    }
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
    // Do not make changes to the data list in this function,
    // I spent 8 hours debugging a memory leak that crashed the sim on loading because I did that

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
   * Updates the TOC and TOD markers
   */
  private updateVnavListItems(): void {
    const tocIndex = this.store.tocIndex.get();
    const todIndex = this.store.todIndex.get();
    const isOnGround = this.isOnGround.get();
    const isTocBeforeTodInSameLeg = tocIndex === todIndex && this.store.tocBeforeTod.get();

    this.removeListItemOfType('toc');
    this.removeListItemOfType('tod');
    if (!isOnGround && (tocIndex > 0 || todIndex > 0) && this.planIndex === Epic2FlightPlans.Active) {
      const plan = this.fms.getFlightPlan(this.planIndex);

      // The TOC and TOD occur along the leg that the index corresponds to, so we show the TOC/TOD after the leg item
      // When the TOC is higher than the TOD, there isnt a valid TOC solution (we're descending)
      if (tocIndex > 0) {
        const leg = plan.getLeg(tocIndex);
        const listIndex = this.getListIndexFromLeg(leg);

        this._dataList.insert({
          type: 'toc',
          isVisible: Subject.create<boolean>(true)
        }, listIndex);
      }
      if (todIndex > 0) {
        const leg = plan.getLeg(todIndex);
        const listIndex = this.getListIndexFromLeg(leg);

        this._dataList.insert({
          type: 'tod',
          isVisible: Subject.create<boolean>(true)
        }, listIndex + ((isTocBeforeTodInSameLeg || tocIndex !== todIndex) ? 0 : -1));
      }
    }
  }

  /**
   * Updates the hold marker
   * @param holding If the aircraft is currently holding
   */
  private updateHoldMarker(holding: boolean): void {
    this.removeListItemOfType('hold');
    if (holding) {
      this._dataList.insert({
        type: 'hold',
        isVisible: Subject.create<boolean>(true),
        exiting: this.store.isExitingHold
      }, 0);
    }
  }

  /**
   * Updates the direct to information and inserts a label
   * @param leg the direct to leg, or undefined if no DTO is active
   */
  private updateDirectToInformation(leg?: number): void {
    this.removeListItemOfType('directTo');
    if (leg !== undefined && BitFlags.isAny(this.store.toLeg.get()?.leg.flags ?? 0, LegDefinitionFlags.DirectTo)) {
      const firstItem = this._dataList.get(0);
      this._dataList.insert({
        type: 'directTo',
        isVisible: Subject.create<boolean>(true)
      }, firstItem.type == 'directToRandomEntry' ? 1 : 0);
    }
  }

  /**
   * Will insert/remove the dto random entry list item
   * @param isVisible whether it's visibile
   */
  private updateDirectToRandomListItem(isVisible: boolean): void {
    this.removeListItemOfType('directToRandomEntry');
    if (isVisible) {
      this._dataList.insert({
        type: 'directToRandomEntry',
        isVisible: Subject.create<boolean>(true)
      }, 0);
    }
  }

  /**
   * Checks if the last leg of the flight plan would be considered as an undefined leg
   */
  private checkLastLegUndefined(): void {
    this.removeListItemOfType('nextLegUndefined');

    for (let i = this._dataList.getArray().length - 1; i >= 0; i--) {
      const item = this._dataList.get(i);

      if (item.type === 'leg') {
        const legItem = item as FlightPlanLegListData;
        const isLegAirport = legItem.legData.isAirport;
        const isLegRunway = legItem.legData.isRunway;

        if (!isLegAirport && !isLegRunway) {
          this._dataList.insert({
            type: 'nextLegUndefined',
            isVisible: Subject.create<boolean>(true),
          });
        }

        return;
      }
    }
  }

  private readonly updateAddWaypointListItem = async (listData: FlightPlanLegData | undefined): Promise<void> => {
    this.removeListItemOfType('amendRouteButton');

    if (listData) {
      const segmentIndex = listData.segmentData?.segmentIndex.get() ?? 0;
      const segmentLegIndex = listData.segmentLegIndex.get();
      const focusLegIndex = this.getListIndexFromLegIndex(segmentIndex, segmentLegIndex);

      this.amendRouteData = {
        type: 'amendRouteButton',
        isVisible: Subject.create<boolean>(true),
      };
      this._dataList.insert(this.amendRouteData, focusLegIndex + 1);
    } else {

      delete this.amendRouteData;
    }
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
   * @returns The list index of the leg, or -1 if none is found.
   */
  private getListIndexFromLegIndex(segmentIndex: number, segmentLegIndex: number): number {
    const plan = this.fms.getFlightPlan(this.planIndex);
    const leg = plan.tryGetLeg(segmentIndex, segmentLegIndex);

    // const segmentListItem = this.segments[segmentIndex];
    // const segListIndex = this._dataList.getArray().indexOf(segmentListItem);

    return leg ? this.getListIndexFromLeg(leg) : -1;
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
      if (!item.isVisible.get()) {
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private shouldSegmentBeVisible(segment: FlightPlanSegment, segmentIndex: number): boolean {
    // Epic2 does not show list items for segments.
    return false;

    // /*
    //  * enroute segment list item is only visible if:
    //  * a. it is the first normal enroute segment with legs in it
    //  * b. it is an airway segment
    // */
    // if (segment.segmentType === FlightPlanSegmentType.Enroute) {
    //   if (segment.airway !== undefined) {
    //     return true;
    //   } else if (segmentIndex <= this.getIndexOfFirstNormalEnrouteSegment() && segment.legs.length > 0) {
    //     return true;
    //   } else {
    //     return false;
    //   }
    // } else {
    //   return true;
    // }
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
        const legListData = this._legDataMap.get(this.store.legMap.get(leg)!);
        if (!legListData) { return; }
        if (legListData.isVisible.get() && !foundVisibleLeg) {
          foundVisibleLeg = true;
          legListData.isFirstVisibleLegInSegment.set(true);
        } else {
          legListData.isFirstVisibleLegInSegment.set(false);
        }
        if (legListData.legData.isActiveLeg.get()) {
          foundActiveLeg = true;
        }
        if (foundActiveLeg && !legListData.isVisible.get() && legListData.legData.isVisibleLegType && legListData.legData.isInAirwaySegment.get()) {
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
