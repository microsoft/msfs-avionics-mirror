import { FlightPlanIndicationEvent, FlightPlanner, Subscribable, SubscribableArrayHandler, Subscription } from '@microsoft/msfs-sdk';

import { FlightPlanDataArray } from './FlightPlanDataArray';
import { FlightPlanDataField, FlightPlanDataFieldType } from './FlightPlanDataField';
import { FlightPlanDataFieldCalculatorRepo } from './FlightPlanDataFieldCalculatorRepo';
import { FlightPlanDataFieldFactory } from './FlightPlanDataFieldFactory';
import { FlightPlanDataItem } from './FlightPlanDataItem';
import { FlightPlannerFlightPlanDataArray, FlightPlannerFlightPlanDataArrayOptions } from './FlightPlannerFlightPlanDataArray';

/**
 * An implementation of `FlightPlanDataArray` that sources flight plan data from a flight planner's active flight plan.
 * The flight planner from which data is sourced can be changed freely.
 */
export class ActiveFlightPlanDataArray implements FlightPlanDataArray {
  private readonly backingArray: FlightPlannerFlightPlanDataArray;

  private isExternalFlightPlan = false;
  private flightPlanner: FlightPlanner | null = null;
  private activeFlightPlanIndexSub?: Subscription;

  /** @inheritDoc */
  public readonly fromLegIndex: Subscribable<number>;

  /** @inheritDoc */
  public readonly toLegIndex: Subscribable<number>;

  /** @inheritDoc */
  public readonly cumulativeDataFields: readonly Subscribable<FlightPlanDataField<FlightPlanDataFieldType> | null>[];

  /** @inheritDoc */
  public get length(): number {
    return this.backingArray.length;
  }

  private isAlive = true;
  private isResumed = false;

  /**
   * Creates a new instance of ActiveFlightPlanDataArray. Upon creation, the array is paused and has a null flight
   * planner source, the 'Add Waypoint' data item is flagged as hidden, and all data fields are cleared.
   * @param dataFieldFactory The factory used to create flight plan data fields for this array.
   * @param dataFieldCalculatorRepo The repository used by this array to retrieve calculators for flight plan data
   * fields.
   * @param options Options with which to configure this array.
   */
  public constructor(
    dataFieldFactory: FlightPlanDataFieldFactory,
    dataFieldCalculatorRepo: FlightPlanDataFieldCalculatorRepo,
    options?: Readonly<FlightPlannerFlightPlanDataArrayOptions>
  ) {
    this.backingArray = new FlightPlannerFlightPlanDataArray(dataFieldFactory, dataFieldCalculatorRepo, options);

    this.fromLegIndex = this.backingArray.fromLegIndex;
    this.toLegIndex = this.backingArray.toLegIndex;
    this.cumulativeDataFields = this.backingArray.cumulativeDataFields;
  }

  /** @inheritDoc */
  public get(index: number): FlightPlanDataItem {
    return this.backingArray.get(index);
  }

  /** @inheritDoc */
  public tryGet(index: number): FlightPlanDataItem | undefined {
    return this.backingArray.tryGet(index);
  }

  /** @inheritDoc */
  public getArray(): readonly FlightPlanDataItem[] {
    return this.backingArray.getArray();
  }

  /** @inheritDoc */
  public sub(handler: SubscribableArrayHandler<FlightPlanDataItem>, initialNotify?: boolean, paused?: boolean): Subscription {
    return this.backingArray.sub(handler, initialNotify, paused);
  }

  /**
   * Resumes this array. When this array is resumed, it will automatically re-calculate its data fields when its source
   * flight plan is changed or calculated.
   * @throws Error if this array has been destroyed.
   */
  public resume(): void {
    if (!this.isAlive) {
      throw new Error('ActiveFlightPlanDataArray: cannot manipulate array after it has been destroyed');
    }

    if (this.isResumed) {
      return;
    }

    this.isResumed = true;

    this.backingArray.resume();
  }

  /**
   * Pauses this array. When this array is paused, it will not re-calculate its data fields when its source flight plan
   * is changed or calculated. In addition, calling `calculateDataFields()` has no effect when the array is paused.
   * @throws Error if this array has been destroyed.
   */
  public pause(): void {
    if (!this.isAlive) {
      throw new Error('ActiveFlightPlanDataArray: cannot manipulate array after it has been destroyed');
    }

    if (!this.isResumed) {
      return;
    }

    this.isResumed = false;

    this.backingArray.pause();
  }

  /**
   * Sets the flight plan from which this array sources data.
   * @param isExternal Whether the new source flight plan is an external flight plan.
   * @param flightPlanner The flight planner containing the source flight plan. If `null` is specified instead, then
   * the array will behave as if it were sourcing data from an empty flight plan.
   * @throws Error if this array has been destroyed.
   */
  public setFlightPlanner(isExternal: boolean, flightPlanner: FlightPlanner | null): void {
    if (!this.isAlive) {
      throw new Error('ActiveFlightPlanDataArray: cannot manipulate array after it has been destroyed');
    }

    if (isExternal === this.isExternalFlightPlan && flightPlanner === this.flightPlanner) {
      return;
    }

    this.activeFlightPlanIndexSub?.destroy();
    this.activeFlightPlanIndexSub = undefined;

    this.isExternalFlightPlan = isExternal;
    this.flightPlanner = flightPlanner;

    if (this.flightPlanner === null) {
      this.backingArray.setFlightPlan(this.isExternalFlightPlan, this.flightPlanner);
    } else {
      this.activeFlightPlanIndexSub = this.flightPlanner.onEvent('fplIndexChanged').handle(this.onFlightPlanIndexChanged.bind(this), true);
      this.backingArray.setFlightPlan(this.isExternalFlightPlan, this.flightPlanner, this.flightPlanner.activePlanIndex);
      this.activeFlightPlanIndexSub.resume();
    }
  }

  /**
   * Sets whether the 'Add Waypoint' data item at the end of this array should be flagged as visible.
   * @param visible Whether the 'Add Waypoint' data item should be flagged as visible.
   * @throws Error if this array has been destroyed.
   */
  public setAddWaypointItemVisible(visible: boolean): void {
    if (!this.isAlive) {
      throw new Error('ActiveFlightPlanDataArray: cannot manipulate array after it has been destroyed');
    }

    this.backingArray.setAddWaypointItemVisible(visible);
  }

  /**
   * Sets the type of one of this array's flight plan data fields.
   * @param index The index of the data field to change.
   * @param type The data field type to set, or `null` to clear the data field.
   * @throws Error if this array has been destroyed.
   */
  public setDataFieldType(index: number, type: FlightPlanDataFieldType | null): void {
    if (!this.isAlive) {
      throw new Error('ActiveFlightPlanDataArray: cannot manipulate array after it has been destroyed');
    }

    this.backingArray.setDataFieldType(index, type);
  }

  /**
   * Calculates this array's flight plan data fields. This method does nothing if this array is paused.
   * @throws Error if this array has been destroyed.
   */
  public calculateDataFields(): void {
    if (!this.isAlive) {
      throw new Error('ActiveFlightPlanDataArray: cannot manipulate array after it has been destroyed');
    }

    this.backingArray.calculateDataFields();
  }

  /**
   * Responds to when the index of the active flight plan for this array's current flight planner changes.
   * @param event The event describing
   */
  private onFlightPlanIndexChanged(event: Readonly<FlightPlanIndicationEvent>): void {
    if (!this.flightPlanner) {
      return;
    }

    this.backingArray.setFlightPlan(this.isExternalFlightPlan, this.flightPlanner, event.planIndex);
  }

  /**
   * Destroys this array. Once destroyed, this array can no longer be manipulated and any further changes in the source
   * flight plan will not be reflected in the array.
   */
  public destroy(): void {
    this.isAlive = false;

    this.backingArray.destroy();
  }
}
