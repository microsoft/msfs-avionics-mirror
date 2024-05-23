import {
  AbstractSubscribableArray, ActiveLegType, ArrayUtils, BitFlags, DebounceTimer, FlightPlan, FlightPlanLeg,
  FlightPlanLegEvent, FlightPlanSegmentEvent, FlightPlanSegmentType, FlightPlanUserDataEvent, FlightPlanUtils,
  FlightPlanner, LegDefinition, LegDefinitionFlags, LegEventType, LegType, MappedSubject, SegmentEventType, Subject,
  Subscribable, SubscribableArrayEventType, Subscription
} from '@microsoft/msfs-sdk';

import { FmsFplUserDataKey, FmsFplVfrApproachData, FmsUtils } from '@microsoft/msfs-garminsdk';

import { FlightPlanDataArray } from './FlightPlanDataArray';
import { FlightPlanDataField, FlightPlanDataFieldType } from './FlightPlanDataField';
import { FlightPlanDataFieldCalculatorRepo } from './FlightPlanDataFieldCalculatorRepo';
import { FlightPlanDataFieldFactory } from './FlightPlanDataFieldFactory';
import {
  FlightPlanAddWaypointDataItem, FlightPlanApproachLegPreviewDataItem, FlightPlanDataItem, FlightPlanDataItemType,
  FlightPlanLegDataItem, FlightPlanLegDataItemActiveStatus
} from './FlightPlanDataItem';
import { G3XFmsFplLoadedApproachData, G3XFmsFplUserDataKey } from './G3XFmsFplUserDataTypes';

/**
 * Configuration options for {@link FlightPlannerFlightPlanDataArray}.
 */
export type FlightPlannerFlightPlanDataArrayOptions = {
  /** The number of data fields supported by the array. Defaults to `0`. */
  dataFieldCount?: number;

  /**
   * The amount of time, in milliseconds, by which to debounce data field calculations following flight plan changes.
   * Defaults to `250`.
   */
  calculateDebounce?: number;
};

/**
 * Mutable versions of flight plan data items that can be manipulated by `FlightPlannerFlightPlanDataArray`.
 */
type MutableFlightPlanDataItem
  = FlightPlanLegDataItemClass
  | FlightPlanApproachLegPreviewDataItemClass
  | FlightPlanAddWaypointDataItemClass;

/**
 * An implementation of `FlightPlanDataArray` that sources flight plan data from a flight planner. The flight planner
 * and flight plan from which data is sourced can be changed freely.
 */
export class FlightPlannerFlightPlanDataArray extends AbstractSubscribableArray<Readonly<FlightPlanDataItem>> implements FlightPlanDataArray {

  private readonly _array: MutableFlightPlanDataItem[] = [];

  private readonly isExternalFlightPlan = Subject.create(false);
  private flightPlanner: FlightPlanner | null = null;
  private flightPlanIndex: number = -1;

  private approachLegPreviewItemCount = 0;

  private readonly isApproachLegPreviewItemVisible = Subject.create(false);

  private readonly isAddWaypointItemVisibleCommand = Subject.create(true);
  private readonly isApproachLoaded = Subject.create(false);
  private readonly isAddWaypointItemVisible = MappedSubject.create(
    ([isAddWaypointItemVisibleCommand, isExternalFlightPlan, isApproachLoaded]) => {
      return isAddWaypointItemVisibleCommand && !isExternalFlightPlan && !isApproachLoaded;
    },
    this.isAddWaypointItemVisibleCommand,
    this.isExternalFlightPlan,
    this.isApproachLoaded
  );

  private readonly fplSubs: Subscription[] = [];

  private readonly dataFieldTypes: (FlightPlanDataFieldType | null)[];
  private readonly dataFieldFactoryFunc = (type: FlightPlanDataFieldType | null): FlightPlanDataField<FlightPlanDataFieldType> | null => {
    return type === null ? null : this.dataFieldFactory.create(type);
  };
  private readonly nullFactoryFunc = (): null => null;

  private readonly calculateDebounce: number;
  private readonly calculateDebounceTimer = new DebounceTimer();
  private readonly calculateFunc = this.doCalculateDataFields.bind(this);

  /** @inheritDoc */
  public get length(): number {
    return this._array.length;
  }

  private readonly _fromLegIndex = Subject.create(-1);
  /** @inheritDoc */
  public readonly fromLegIndex = this._fromLegIndex as Subscribable<number>;

  private readonly _toLegIndex = Subject.create(-1);
  /** @inheritDoc */
  public readonly toLegIndex = this._toLegIndex as Subscribable<number>;

  private readonly _cumulativeDataFields: Subject<FlightPlanDataField<FlightPlanDataFieldType> | null>[];
  /** @inheritDoc */
  public readonly cumulativeDataFields: readonly Subscribable<FlightPlanDataField<FlightPlanDataFieldType> | null>[];

  private isAlive = true;
  private isResumed = false;

  /**
   * Creates a new instance of FlightPlannerFlightPlanDataArray. Upon creation, the array is paused and has a null
   * flight plan source, the 'Add Waypoint' data item is flagged as hidden, and all data fields are cleared.
   * @param dataFieldFactory The factory used to create flight plan data fields for this array.
   * @param dataFieldCalculatorRepo The repository used by this array to retrieve calculators for flight plan data
   * fields.
   * @param options Options with which to configure this array.
   */
  public constructor(
    private readonly dataFieldFactory: FlightPlanDataFieldFactory,
    private readonly dataFieldCalculatorRepo: FlightPlanDataFieldCalculatorRepo,
    options?: Readonly<FlightPlannerFlightPlanDataArrayOptions>
  ) {
    super();

    this.dataFieldTypes = ArrayUtils.create(Math.max(options?.dataFieldCount ?? 0, 0), () => null);
    this._cumulativeDataFields = this.dataFieldTypes.map(() => Subject.create<FlightPlanDataField<FlightPlanDataFieldType> | null>(null));
    this.cumulativeDataFields = this._cumulativeDataFields;
    this.calculateDebounce = options?.calculateDebounce ?? 250;

    // INVARIANT: The last item in the array is the add waypoint item.
    this._array.push(new FlightPlanAddWaypointDataItemClass(this.isAddWaypointItemVisible));
  }

  /** @inheritDoc */
  public getArray(): readonly Readonly<FlightPlanDataItem>[] {
    return this._array;
  }

  /**
   * Resumes this array. When this array is resumed, it will automatically re-calculate its data fields when its source
   * flight plan is changed or calculated.
   * @throws Error if this array has been destroyed.
   */
  public resume(): void {
    if (!this.isAlive) {
      throw new Error('FlightPlannerFlightPlanDataArray: cannot manipulate array after it has been destroyed');
    }

    if (this.isResumed) {
      return;
    }

    this.isResumed = true;
  }

  /**
   * Pauses this array. When this array is paused, it will not re-calculate its data fields when its source flight plan
   * is changed or calculated. In addition, calling `calculateDataFields()` has no effect when the array is paused.
   * @throws Error if this array has been destroyed.
   */
  public pause(): void {
    if (!this.isAlive) {
      throw new Error('FlightPlannerFlightPlanDataArray: cannot manipulate array after it has been destroyed');
    }

    if (!this.isResumed) {
      return;
    }

    this.isResumed = false;

    this.calculateDebounceTimer.clear();
  }

  /**
   * Sets the flight plan from which this array sources data.
   * @param isExternal Whether the new source flight plan is an external flight plan.
   * @param flightPlanner The flight planner containing the source flight plan. If `null` is specified instead, then
   * the array will behave as if it were sourcing data from an empty flight plan.
   * @param index The index of the source flight plan in its flight planner. Ignored if `flightPlanner` is `null`.
   * @throws Error if this array has been destroyed.
   */
  public setFlightPlan(isExternal: boolean, flightPlanner: FlightPlanner | null, index = 0): void {
    if (!this.isAlive) {
      throw new Error('FlightPlannerFlightPlanDataArray: cannot manipulate array after it has been destroyed');
    }

    if (this.isExternalFlightPlan.get() === isExternal && flightPlanner === this.flightPlanner && index === this.flightPlanIndex) {
      return;
    }

    this.isExternalFlightPlan.set(isExternal);

    this.flightPlanner = flightPlanner;
    this.flightPlanIndex = index;

    for (const sub of this.fplSubs) {
      sub.destroy();
    }
    this.fplSubs.length = 0;

    this.clearArray();

    if (index >= 0 && flightPlanner && flightPlanner.hasFlightPlan(index)) {
      this.initializeFromFlightPlan(isExternal, flightPlanner.getFlightPlan(index));
      this.initFplSubscriptions(isExternal, flightPlanner, index);
    }
  }

  /**
   * Sets whether the 'Add Waypoint' data item at the end of this array should be flagged as visible.
   * @param visible Whether the 'Add Waypoint' data item should be flagged as visible.
   * @throws Error if this array has been destroyed.
   */
  public setAddWaypointItemVisible(visible: boolean): void {
    if (!this.isAlive) {
      throw new Error('FlightPlannerFlightPlanDataArray: cannot manipulate array after it has been destroyed');
    }

    this.isAddWaypointItemVisibleCommand.set(visible);
  }

  /**
   * Sets the type of one of this array's flight plan data fields.
   * @param index The index of the data field to change.
   * @param type The data field type to set, or `null` to clear the data field.
   * @throws Error if this array has been destroyed.
   */
  public setDataFieldType(index: number, type: FlightPlanDataFieldType | null): void {
    if (!this.isAlive) {
      throw new Error('FlightPlannerFlightPlanDataArray: cannot manipulate array after it has been destroyed');
    }

    if (index < 0 || index >= this.dataFieldTypes.length) {
      throw new RangeError('FlightPlannerFlightPlanDataArray: data field index out of bounds');
    }

    if (this.dataFieldTypes[index] === type) {
      return;
    }

    this.dataFieldTypes[index] = type;

    if (type === null) {
      for (let i = 0; i < this._array.length; i++) {
        const item = this._array[i];
        if (item.type === FlightPlanDataItemType.Leg) {
          item.dataFields[index].set(null);
        }
      }
      this._cumulativeDataFields[index].set(null);
    } else {
      for (let i = 0; i < this._array.length; i++) {
        const item = this._array[i];
        if (item.type === FlightPlanDataItemType.Leg && FlightPlannerFlightPlanDataArray.doesLegSupportDataFields(item.leg)) {
          item.dataFields[index].set(this.dataFieldFactory.create(type));
        }
      }
      this._cumulativeDataFields[index].set(this.dataFieldFactory.create(type));

      this.dataFieldCalculatorRepo.get(type).calculate(index, this._array, this._cumulativeDataFields[index].get());
    }
  }

  /**
   * Calculates this array's flight plan data fields. This method does nothing if this array is paused.
   * @throws Error if this array has been destroyed.
   */
  public calculateDataFields(): void {
    if (!this.isAlive) {
      throw new Error('FlightPlannerFlightPlanDataArray: cannot manipulate array after it has been destroyed');
    }

    if (this.isResumed) {
      this.calculateDebounceTimer.clear();
      this.doCalculateDataFields();
    }
  }

  /**
   * Gets the flight plan from which this array is sourcing data.
   * @returns The flight plan from which this array is sourcing data, or `null` if there is no such flight plan.
   */
  private getFlightPlan(): FlightPlan | null {
    return this.flightPlanner && this.flightPlanner.hasFlightPlan(this.flightPlanIndex)
      ? this.flightPlanner.getFlightPlan(this.flightPlanIndex)
      : null;
  }

  /**
   * Clears this array of all items except the 'Add Waypoint' item.
   */
  private clearArray(): void {
    if (this._array.length === 1) {
      return;
    }

    this.calculateDebounceTimer.clear();

    this._fromLegIndex.set(-1);
    this._toLegIndex.set(-1);

    const removed = this._array.splice(0, this._array.length - 1);
    this.approachLegPreviewItemCount = 0;
    this.notify(0, SubscribableArrayEventType.Removed, removed);
  }

  /**
   * Fully initializes this array from a flight plan. If the array is not empty, then it will first be emptied. Then, a
   * full set of data items will be inserted into the array from the specified flight plan and all data fields will be
   * calculated.
   * @param isExternal Whether the flight plan is from an external source.
   * @param flightPlan The flight plan from which to initialize this array.
   */
  private initializeFromFlightPlan(isExternal: boolean, flightPlan: FlightPlan): void {
    if (this._array.length > 1) {
      this.clearArray();
    }

    const approachData = isExternal
      ? undefined
      : flightPlan.getUserData<Readonly<G3XFmsFplLoadedApproachData>>(G3XFmsFplUserDataKey.LoadedApproach);

    const items = [];
    for (const segment of flightPlan.segments()) {
      const isApproachSegment = segment.segmentType === FlightPlanSegmentType.Approach;
      for (let i = 0; i < segment.legs.length; i++) {
        items.push(this.createLegDataItem(flightPlan, isApproachSegment ? approachData : undefined, segment.legs[i]));
      }
    }

    if (items.length > 0) {
      this._array.unshift(...items);
      this.notify(0, SubscribableArrayEventType.Added, items);
      this.refreshLegActiveStatus();
      this.scheduleCalculate();
    }

    if (isExternal) {
      this.isApproachLoaded.set(false);
      this.isApproachLegPreviewItemVisible.set(false);
    } else {
      if (approachData) {
        this.insertApproachLegPreviewDataItems(flightPlan, approachData);
      }

      this.refreshApproachLegPreviewDataItemVisibility(flightPlan.getUserData<Readonly<FmsFplVfrApproachData>>(FmsFplUserDataKey.VfrApproach));
    }
  }

  /**
   * Initializes subscriptions to a flight plan.
   * @param isExternal Whether the flight plan is from an external source.
   * @param flightPlanner The flight planner containing the flight plan to which to subscribe.
   * @param index The index of the flight plan to which to subscribe.
   */
  private initFplSubscriptions(isExternal: boolean, flightPlanner: FlightPlanner, index: number): void {
    this.fplSubs.push(
      flightPlanner.onEvent('fplCreated').handle(e => {
        if (e.planIndex === index) {
          this.initializeFromFlightPlan(this.isExternalFlightPlan.get(), flightPlanner.getFlightPlan(index));
        }
      }),

      flightPlanner.onEvent('fplLoaded').handle(e => {
        if (e.planIndex === index) {
          this.initializeFromFlightPlan(this.isExternalFlightPlan.get(), flightPlanner.getFlightPlan(index));
        }
      }),

      flightPlanner.onEvent('fplCopied').handle(e => {
        if (e.targetPlanIndex === index) {
          this.initializeFromFlightPlan(this.isExternalFlightPlan.get(), flightPlanner.getFlightPlan(index));
        }
      }),

      flightPlanner.onEvent('fplDeleted').handle(e => {
        if (e.planIndex === index) {
          this.clearArray();
        }
      }),

      flightPlanner.onEvent('fplSegmentChange').handle(e => {
        if (e.planIndex === index) {
          this.handlePlanSegmentChange(flightPlanner, e);
        }
      }),

      flightPlanner.onEvent('fplLegChange').handle(e => {
        if (e.planIndex === index) {
          this.handlePlanLegChange(flightPlanner, e);
        }
      }),

      flightPlanner.onEvent('fplIndexChanged').handle(() => {
        this.refreshLegActiveStatus();
      }),

      flightPlanner.onEvent('fplActiveLegChange').handle(e => {
        if (e.planIndex === index && e.type === ActiveLegType.Lateral) {
          this.refreshLegActiveStatus();
        }
      }),

      flightPlanner.onEvent('fplCalculated').handle(e => {
        if (e.planIndex === index) {
          this.scheduleCalculate();
        }
      }),
    );

    if (!isExternal) {
      const userDataHandler = (e: FlightPlanUserDataEvent): void => {
        if (e.planIndex !== index) {
          return;
        }

        const plan = flightPlanner.getFlightPlan(e.planIndex);

        if (e.key === G3XFmsFplUserDataKey.LoadedApproach) {
          if (e.data) {
            this.handleApproachLoaded(plan, e.data as Readonly<G3XFmsFplLoadedApproachData>);
          } else {
            this.handleApproachRemoved();
          }
        }

        if (e.key === FmsFplUserDataKey.VfrApproach) {
          this.refreshApproachLegPreviewDataItemVisibility(e.data);
        }
      };

      this.fplSubs.push(
        flightPlanner.onEvent('fplUserDataSet').handle(userDataHandler),
        flightPlanner.onEvent('fplUserDataDelete').handle(userDataHandler),
      );
    }
  }

  /**
   * Handles when a flight plan segment change event is received for this array's source flight plan.
   * @param flightPlanner The flight planner containing the source flight plan.
   * @param event The received flight plan segment event.
   */
  private handlePlanSegmentChange(flightPlanner: FlightPlanner, event: FlightPlanSegmentEvent): void {
    if (!event.segment) {
      return;
    }

    const arrayLegItemCount = this._array.length - 1 - this.approachLegPreviewItemCount;
    const isExternalFlightPlan = this.isExternalFlightPlan.get();
    const startIndex = event.segment.offset;

    if (startIndex > arrayLegItemCount) {
      // The array has become desynchronized with the flight plan, so we will re-initialize the array.
      console.warn('FlightPlannerFlightPlanDataArray: data array was desynchronized from flight plan');
      this.initializeFromFlightPlan(isExternalFlightPlan, flightPlanner.getFlightPlan(event.planIndex));
      return;
    }

    const plan = flightPlanner.getFlightPlan(event.planIndex);

    let wereLegsChanged = false;

    switch (event.type) {
      case SegmentEventType.Added: {
        // Adding a segment potentially replaces an existing segment in the plan, so we need to find which legs were
        // replaced and delete their associated data items.

        const endIndex = this._array.findIndex((item, index) => {
          if (index < startIndex) {
            return false;
          }

          return index >= arrayLegItemCount
            || (item.type === FlightPlanDataItemType.Leg && plan.getSegmentFromLeg(item.leg) !== null);
        });

        if (endIndex > startIndex) {
          const removed = this._array.splice(startIndex, endIndex - startIndex);
          this.notify(startIndex, SubscribableArrayEventType.Removed, removed);

          wereLegsChanged = true;
        }

        // After we remove the replaced legs, we will fallthrough to the next case to add the legs in the new segment.
      }
      // fallthrough
      case SegmentEventType.Inserted:
        if (event.segment.legs.length > 0) {
          const approachData = isExternalFlightPlan || event.segment.segmentType !== FlightPlanSegmentType.Approach
            ? undefined
            : plan.getUserData<Readonly<G3XFmsFplLoadedApproachData>>(G3XFmsFplUserDataKey.LoadedApproach);

          const added = event.segment.legs.map(this.createLegDataItem.bind(this, plan, approachData));
          this._array.splice(startIndex, 0, ...added);
          this.notify(startIndex, SubscribableArrayEventType.Added, added);

          wereLegsChanged = true;
        }
        break;
      case SegmentEventType.Removed: {
        if (event.segment.legs.length > 0) {
          const endIndex = startIndex + event.segment.legs.length;
          if (endIndex > arrayLegItemCount) {
            // The array has become desynchronized with the flight plan, so we will re-initialize the array.
            console.warn('FlightPlannerFlightPlanDataArray: data array was desynchronized from flight plan');
            this.initializeFromFlightPlan(isExternalFlightPlan, flightPlanner.getFlightPlan(event.planIndex));
            return;
          }

          const removed = this._array.splice(startIndex, event.segment.legs.length);
          if (removed.length > 0) {
            this.notify(startIndex, SubscribableArrayEventType.Removed, removed);
            wereLegsChanged = true;
          }
        }
        break;
      }

      // We don't care about segment changed events because those are exclusively related to airways
    }

    if (wereLegsChanged) {
      this.refreshLegActiveStatus();
      this.scheduleCalculate();
    }
  }

  /**
   * Handles when a flight plan leg change event is received for this array's source flight plan.
   * @param flightPlanner The flight planner containing the source flight plan.
   * @param event The received flight plan leg event.
   */
  private handlePlanLegChange(flightPlanner: FlightPlanner, event: FlightPlanLegEvent): void {
    const arrayLegItemCount = this._array.length - 1 - this.approachLegPreviewItemCount;
    const isExternalFlightPlan = this.isExternalFlightPlan.get();
    const plan = flightPlanner.getFlightPlan(event.planIndex);
    const globalLegIndex = plan.getSegment(event.segmentIndex).offset + event.legIndex;

    if (globalLegIndex > arrayLegItemCount) {
      // The array has become desynchronized with the flight plan, so we will re-initialize the array.
      console.warn('FlightPlannerFlightPlanDataArray: data array was desynchronized from flight plan');
      this.initializeFromFlightPlan(isExternalFlightPlan, flightPlanner.getFlightPlan(event.planIndex));
      return;
    }

    switch (event.type) {
      case LegEventType.Added: {
        const segment = plan.tryGetSegment(event.segmentIndex);
        const approachData = isExternalFlightPlan || !segment || segment.segmentType !== FlightPlanSegmentType.Approach
          ? undefined
          : plan.getUserData<Readonly<G3XFmsFplLoadedApproachData>>(G3XFmsFplUserDataKey.LoadedApproach);

        const added = this.createLegDataItem(plan, approachData, event.leg);
        this._array.splice(globalLegIndex, 0, added);
        this.notify(globalLegIndex, SubscribableArrayEventType.Added, added);

        this.refreshLegActiveStatus();
        this.scheduleCalculate();
        break;
      }
      case LegEventType.Removed: {
        if (globalLegIndex === arrayLegItemCount) {
          // The array has become desynchronized with the flight plan, so we will re-initialize the array.
          console.warn('FlightPlannerFlightPlanDataArray: data array was desynchronized from flight plan');
          this.initializeFromFlightPlan(isExternalFlightPlan, flightPlanner.getFlightPlan(event.planIndex));
          return;
        }

        const removed = this._array.splice(globalLegIndex, 1);
        this.notify(globalLegIndex, SubscribableArrayEventType.Removed, removed[0]);

        this.refreshLegActiveStatus();
        this.scheduleCalculate();
        break;
      }

      // We don't care about leg changed events because those are exclusively related to vertical/speed data.
    }
  }

  /**
   * Creates a new data item for a flight plan leg.
   * @param flightPlan The flight plan containing the leg.
   * @param approachData Data describing the approach to which the flight plan leg belongs, or `undefined` if the leg
   * does not belong to an approach.
   * @param leg The leg for which to create the new data item.
   * @returns A new data item for the specified flight plan leg.
   */
  private createLegDataItem(
    flightPlan: FlightPlan,
    approachData: Readonly<G3XFmsFplLoadedApproachData> | undefined,
    leg: LegDefinition
  ): FlightPlanLegDataItemClass {
    let isVisible: boolean;

    if (flightPlan.planIndex === FmsUtils.DTO_RANDOM_PLAN_INDEX) {
      // Hide the IF Direct-To leg and discontinuity legs.
      isVisible = !(BitFlags.isAny(leg.flags, LegDefinitionFlags.DirectTo) && leg.leg.type === LegType.IF)
        && !FlightPlanUtils.isDiscontinuityLeg(leg.leg.type);
    } else {
      // Hide Direct-To legs, VTF discontinuity legs, and any other discontinuity legs.
      isVisible = !BitFlags.isAny(leg.flags, LegDefinitionFlags.DirectTo | LegDefinitionFlags.VectorsToFinal)
        && !FlightPlanUtils.isDiscontinuityLeg(leg.leg.type);
    }

    return new FlightPlanLegDataItemClass(
      flightPlan,
      leg,
      approachData,
      isVisible,
      FlightPlannerFlightPlanDataArray.doesLegSupportDataFields(leg)
        ? this.dataFieldTypes.map(this.dataFieldFactoryFunc)
        : ArrayUtils.create(this.dataFieldTypes.length, this.nullFactoryFunc)
    );
  }

  /**
   * Handles when an approach is loaded into an internal flight plan.
   * @param flightPlan The flight plan into which the approach was loaded.
   * @param data Data describing the loaded approach.
   */
  private handleApproachLoaded(flightPlan: FlightPlan, data: Readonly<G3XFmsFplLoadedApproachData>): void {
    this.removeApproachLegPreviewDataItems();
    this.insertApproachLegPreviewDataItems(flightPlan, data);
    this.isApproachLoaded.set(true);
  }

  /**
   * Handles when an approach is removed from an internal flight plan.
   */
  private handleApproachRemoved(): void {
    this.removeApproachLegPreviewDataItems();
    this.isApproachLoaded.set(false);
  }

  /**
   * Inserts data items for previewed approach flight plan legs into this array.
   * @param flightPlan The flight plan containing the previewed legs.
   * @param data Data describing the approach containing the previewed legs.
   */
  private insertApproachLegPreviewDataItems(flightPlan: FlightPlan, data: Readonly<G3XFmsFplLoadedApproachData>): void {
    const toAdd = data.approach.finalLegs.map(this.createApproachLegPreviewDataItem.bind(this, flightPlan, data));

    if (toAdd.length > 0) {
      const startIndex = this._array.length - 1;
      this._array.splice(startIndex, 0, ...toAdd);
      this.approachLegPreviewItemCount = toAdd.length;
      this.notify(startIndex, SubscribableArrayEventType.Added, toAdd);
    }
  }

  /**
   * Creates a new data item for a previewed approach flight plan leg.
   * @param flightPlan The flight plan containing the previewed leg.
   * @param approachData Data describing the approach containing the previewed leg.
   * @param leg The leg for which to create the new data item.
   * @param index The index of the previewed leg in the approach procedure.
   * @returns A new data item for the specified previewed approach flight plan leg.
   */
  private createApproachLegPreviewDataItem(
    flightPlan: FlightPlan,
    approachData: Readonly<G3XFmsFplLoadedApproachData>,
    leg: FlightPlanLeg,
    index: number
  ): FlightPlanApproachLegPreviewDataItemClass {
    return new FlightPlanApproachLegPreviewDataItemClass(
      flightPlan,
      index,
      leg,
      approachData,
      this.isApproachLegPreviewItemVisible
    );
  }

  /**
   * Removes all data items for previewed approach flight plan legs from this array.
   */
  private removeApproachLegPreviewDataItems(): void {
    const endIndex = this._array.length - 1;

    if (endIndex < 0) {
      return;
    }

    let startIndex = endIndex;
    for (let i = endIndex - 1; i >= 0; i--) {
      const item = this._array[i];
      if (item.type === FlightPlanDataItemType.ApproachLegPreview) {
        startIndex = i;
      } else {
        break;
      }
    }

    if (startIndex === endIndex) {
      return;
    }

    const removed = this._array.splice(startIndex, endIndex - startIndex);
    this.approachLegPreviewItemCount = 0;
    this.notify(startIndex, SubscribableArrayEventType.Removed, removed);
  }

  /**
   * Refreshes the visibility state of each of this array's previewed approach flight plan leg data items.
   * @param data Data describing the loaded approach, or `undefined` if no approach is loaded.
   */
  private refreshApproachLegPreviewDataItemVisibility(data?: Readonly<FmsFplVfrApproachData>): void {
    this.isApproachLegPreviewItemVisible.set(data === undefined);
  }

  /**
   * Refreshes the status of each of this array's flight plan leg data items relative to the active leg of the source
   * flight plan.
   */
  private refreshLegActiveStatus(): void {
    const plan = this.getFlightPlan();
    if (!plan) {
      return;
    }

    const activeLegIndex = this.flightPlanner!.activePlanIndex === plan.planIndex ? plan.activeLateralLeg : -1;
    const activeLeg = plan.tryGetLeg(activeLegIndex);

    let toLegIndex = -1;
    let fromLegIndex = -1;

    if (activeLegIndex > 0 && activeLeg) {
      const isDto = BitFlags.isAny(activeLeg.flags, LegDefinitionFlags.DirectTo);

      if (isDto) {
        toLegIndex = plan.planIndex === FmsUtils.DTO_RANDOM_PLAN_INDEX
          // For the off-route DTO plan, the TO leg is considered the last DTO leg. The DTO legs are always the first
          // legs in the off-route DTO plan, so the global index of the last DTO leg is just the index of the leg
          // within the DTO leg sequence.
          ? FmsUtils.DTO_LEG_OFFSET - 1
          // For the primary plan, when a DTO is active the TO leg is considered the DTO target leg. The global index
          // of the DTO target leg can be retrieved from the plan's DTO data.
          : plan.getSegment(plan.directToData.segmentIndex).offset + plan.directToData.segmentLegIndex;
      } else {
        toLegIndex = activeLegIndex;
      }

      if (!isDto) {
        const fromLeg = FmsUtils.getFromLegForArrowDisplay(plan, toLegIndex);
        if (fromLeg) {
          fromLegIndex = plan.getLegIndexFromLeg(fromLeg);
        }
      }
    }

    for (let i = 0; i < this._array.length; i++) {
      const item = this._array[i];

      if (item.type !== FlightPlanDataItemType.Leg) {
        continue;
      }

      const shouldExclude = plan.planIndex === FmsUtils.DTO_RANDOM_PLAN_INDEX
        // If this is the off-route DTO plan, then exclude all DTO legs except the last DTO leg.
        ? BitFlags.isAny(item.leg.flags, LegDefinitionFlags.DirectTo) && i !== FmsUtils.DTO_LEG_OFFSET - 1
        // If this is the primary plan, then exclude all DTO legs and VTF discontinuity legs.
        : BitFlags.isAny(item.leg.flags, LegDefinitionFlags.DirectTo | LegDefinitionFlags.VectorsToFinal);

      if (shouldExclude) {
        item.activeStatus.set(FlightPlanLegDataItemActiveStatus.None);
      } else {
        if (i < toLegIndex) {
          if (i === fromLegIndex) {
            item.activeStatus.set(FlightPlanLegDataItemActiveStatus.From);
          } else {
            item.activeStatus.set(FlightPlanLegDataItemActiveStatus.Past);
          }
        } else if (i > toLegIndex) {
          item.activeStatus.set(FlightPlanLegDataItemActiveStatus.Future);
        } else {
          item.activeStatus.set(FlightPlanLegDataItemActiveStatus.To);
        }
      }
    }

    this._fromLegIndex.set(fromLegIndex);
    this._toLegIndex.set(toLegIndex);
  }

  /**
   * Schedules a flight plan data field calculate operation after a debounce delay. This method does nothing if this
   * array is paused.
   */
  private scheduleCalculate(): void {
    if (!this.isResumed) {
      return;
    }

    this.calculateDebounceTimer.schedule(this.calculateFunc, this.calculateDebounce);
  }

  /**
   * Calculates this array's flight plan data fields.
   */
  private doCalculateDataFields(): void {
    for (let i = 0; i < this.dataFieldTypes.length; i++) {
      const type = this.dataFieldTypes[i];
      if (type !== null) {
        this.dataFieldCalculatorRepo.get(type).calculate(i, this._array, this._cumulativeDataFields[i].get());
      }
    }
  }

  /**
   * Destroys this array. Once destroyed, this array can no longer be manipulated and any further changes in the source
   * flight plan will not be reflected in the array.
   */
  public destroy(): void {
    this.isAlive = false;

    this.calculateDebounceTimer.clear();

    for (const sub of this.fplSubs) {
      sub.destroy();
    }
  }

  /**
   * Checks if a flight plan leg supports data fields.
   * @param leg The flight plan leg to check.
   * @returns Whether the specified flight plan leg supports data fields.
   */
  private static doesLegSupportDataFields(leg: LegDefinition): boolean {
    switch (leg.leg.type) {
      case LegType.IF:
      case LegType.TF:
      case LegType.DF:
      case LegType.CF:
      case LegType.AF:
      case LegType.RF:
      case LegType.HF:
      case LegType.FC:
      case LegType.CD:
      case LegType.FD:
      case LegType.VD:
      case LegType.CR:
      case LegType.VR:
        return true;
      default:
        return false;
    }
  }
}

/**
 * An implementation of `FlightPlanLegDataItem` used by {@link FlightPlannerFlightPlanDataArray}.
 */
class FlightPlanLegDataItemClass implements FlightPlanLegDataItem {
  /** @inheritDoc */
  public readonly type = FlightPlanDataItemType.Leg;

  /** @inheritDoc */
  public readonly isVisible: Subscribable<boolean>;

  /** @inheritDoc */
  public readonly fixIcao: string;

  /** @inheritDoc */
  public readonly activeStatus = Subject.create(FlightPlanLegDataItemActiveStatus.None);

  /** @inheritDoc */
  public readonly dataFields: readonly Subject<FlightPlanDataField<FlightPlanDataFieldType> | null>[];

  /**
   * Creates a new instance of FlightPlanLegDataItemClass.
   * @param flightPlan This item's parent flight plan.
   * @param leg This item's associated flight plan leg.
   * @param approachData Data describing the approach to which this item's flight plan leg belongs, or `undefined` if
   * the leg does not belong to an approach.
   * @param isVisible Whether the data item should be visible when displayed in a list format.
   * @param dataFields The initial flight plan data fields for the item.
   */
  public constructor(
    public readonly flightPlan: FlightPlan,
    public readonly leg: LegDefinition,
    public readonly approachData: Readonly<G3XFmsFplLoadedApproachData> | undefined,
    isVisible: boolean,
    dataFields: readonly (FlightPlanDataField<FlightPlanDataFieldType> | null)[]
  ) {
    this.isVisible = Subject.create(isVisible);
    this.fixIcao = FlightPlanLegDataItemClass.getFixIcao(leg);
    this.dataFields = dataFields.map(field => Subject.create(field));
  }

  /**
   * Gets the ICAO of the waypoint fix associated with a flight plan leg.
   * @param leg The flight plan leg for which to get the waypoint fix ICAO.
   * @returns The ICAO of the waypoint fix associated with the specified flight plan leg, or the empty string if no
   * such waypoint fix exists.
   */
  private static getFixIcao(leg: LegDefinition): string {
    switch (leg.leg.type) {
      case LegType.IF:
      case LegType.TF:
      case LegType.DF:
      case LegType.CF:
      case LegType.AF:
      case LegType.RF:
      case LegType.HF:
      case LegType.HA:
      case LegType.HM:
        return leg.leg.fixIcao;
      default:
        return '';
    }
  }
}

/**
 * An implementation of `FlightPlanApproachLegPreviewDataItem` used by {@link FlightPlannerFlightPlanDataArray}.
 */
class FlightPlanApproachLegPreviewDataItemClass implements FlightPlanApproachLegPreviewDataItem {
  /** @inheritDoc */
  public readonly type = FlightPlanDataItemType.ApproachLegPreview;

  /** @inheritDoc */
  public readonly fixIcao: string;

  /**
   * Creates a new instance of FlightPlanApproachLegPreviewDataItemClass.
   * @param flightPlan This item's parent flight plan.
   * @param index The index of this item's associated flight plan leg in its approach procedure.
   * @param leg This item's associated flight plan leg.
   * @param approachData The approach procedure to which this item's flight plan leg belongs.
   * @param isVisible Whether this item should be visible when displayed in a list format.
   */
  public constructor(
    public readonly flightPlan: FlightPlan,
    public readonly index: number,
    public readonly leg: FlightPlanLeg,
    public readonly approachData: Readonly<G3XFmsFplLoadedApproachData>,
    public readonly isVisible: Subscribable<boolean>
  ) {
    this.fixIcao = FlightPlanApproachLegPreviewDataItemClass.getFixIcao(leg);
  }

  /**
   * Gets the ICAO of the waypoint fix associated with a flight plan leg.
   * @param leg The flight plan leg for which to get the waypoint fix ICAO.
   * @returns The ICAO of the waypoint fix associated with the specified flight plan leg, or the empty string if no
   * such waypoint fix exists.
   */
  private static getFixIcao(leg: FlightPlanLeg): string {
    switch (leg.type) {
      case LegType.IF:
      case LegType.TF:
      case LegType.DF:
      case LegType.CF:
      case LegType.AF:
      case LegType.RF:
      case LegType.HF:
      case LegType.HA:
      case LegType.HM:
        return leg.fixIcao;
      default:
        return '';
    }
  }
}

/**
 * An implementation of `FlightPlanAddWaypointDataItem` used by {@link FlightPlannerFlightPlanDataArray}.
 */
class FlightPlanAddWaypointDataItemClass implements FlightPlanAddWaypointDataItem {
  /** @inheritDoc */
  public readonly type = FlightPlanDataItemType.AddWaypoint;

  /**
   * Creates a new instance of FlightPlanAddWaypointDataItemClass.
   * @param isVisible Whether this item should be visible when displayed in a list format.
   */
  public constructor(public readonly isVisible: Subscribable<boolean>) {
  }
}
