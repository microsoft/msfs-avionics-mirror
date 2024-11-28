import {
  ArraySubject, DebounceTimer, EventBus, FacilityTypeMap, NearestSubscription, Subscribable, SubscribableArray,
  SubscribableArrayEventType, SubscribableArrayHandler, Subscription
} from '@microsoft/msfs-sdk';

import { GarminFacilityWaypointCache } from '@microsoft/msfs-garminsdk';

import { NearestFacilityWaypointTypeMap, NearestWaypointFacilityType } from './NearestWaypoint';
import { NearestWaypointEntry } from './NearestWaypointEntry';

/**
 * An array of nearest waypoints backed by a nearest facilities subscription. Supports GPS data integrity state so that
 * the array will be empty when no GPS position is available. Also supports pausing and resuming automatic updates
 * from the backing nearest facilities subscription.
 */
export class NearestFacilityWaypointArray<
  T extends NearestWaypointFacilityType,
  EntryType extends NearestWaypointEntry<NearestFacilityWaypointTypeMap[T]> = NearestWaypointEntry<NearestFacilityWaypointTypeMap[T]>
> implements SubscribableArray<EntryType> {

  private readonly facWaypointCache = GarminFacilityWaypointCache.getCache(this.bus);

  private readonly array = ArraySubject.create<EntryType>();

  /** @inheritDoc */
  public get length(): number {
    return this.array.length;
  }

  private readonly gpsFailDebounceTimer = new DebounceTimer();

  private nearestSubscription?: NearestSubscription<FacilityTypeMap[T]>;
  private nearestFacilitiesSub?: Subscription;
  private isGpsDataFailedSub?: Subscription;

  private isAlive = true;
  private isInit = false;
  private isPaused = true;

  /**
   * Constructor.
   * @param bus The event bus.
   * @param waypointEntryFactory A function which creates nearest waypoint entries for this array.
   * @param isGpsDataFailed Whether GPS data is in a failed state.
   * @param gpsFailClearDelay The delay, in milliseconds, after GPS data enters a failed state before this array is
   * cleared of all waypoints.
   */
  public constructor(
    private readonly bus: EventBus,
    private readonly waypointEntryFactory: (waypoint: NearestFacilityWaypointTypeMap[T]) => EntryType,
    private readonly isGpsDataFailed: Subscribable<boolean>,
    private readonly gpsFailClearDelay: number
  ) {
  }

  /**
   * Initializes this array.
   * @param nearestSubscription The nearest facility subscription that will provide this array's nearest waypoint data.
   * @param paused Whether the array should be paused when initialized.
   * @throws Error if this array has been destroyed.
   */
  public init(nearestSubscription: NearestSubscription<FacilityTypeMap[T]>, paused = false): void {
    if (!this.isAlive) {
      throw new Error('NearestWaypointArray: cannot initialize a dead array');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;
    this.isPaused = paused;

    this.nearestSubscription = nearestSubscription;

    // Because the order of the facilities provided by the nearest subscription is not really meaningful, we will
    // not worry about preserving order. This will allow us to optimize array reconciliation during resume operations.
    const nearestFacilitiesSub = this.nearestFacilitiesSub = nearestSubscription.sub((index, type, item) => {
      switch (type) {
        case SubscribableArrayEventType.Added:
          if (item !== undefined) {
            if (Array.isArray(item)) {
              for (let i = 0; i < item.length; i++) {
                this.insertEntryForFacility((item as FacilityTypeMap[T][])[i]);
              }
            } else {
              this.insertEntryForFacility(item as FacilityTypeMap[T]);
            }
          }
          break;
        case SubscribableArrayEventType.Removed:
          if (item !== undefined) {
            if (Array.isArray(item)) {
              for (let i = 0; i < item.length; i++) {
                this.removeEntryForFacility((item as FacilityTypeMap[T][])[i])?.destroy();
              }
            } else {
              this.removeEntryForFacility(item as FacilityTypeMap[T])?.destroy();
            }
          }
          break;
        case SubscribableArrayEventType.Cleared:
          this.clearArray();
          break;
      }
    }, false, true);

    this.isGpsDataFailedSub = this.isGpsDataFailed.sub(isFailed => {
      if (isFailed) {
        nearestFacilitiesSub.pause();

        if (this.array.length > 0) {
          this.gpsFailDebounceTimer.schedule(() => {
            this.clearArray();
          }, this.gpsFailClearDelay);
        }
      } else {
        this.gpsFailDebounceTimer.clear();

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.reconcileArray(this.nearestSubscription!.getArray());
        nearestFacilitiesSub.resume();
      }
    }, !this.isPaused, this.isPaused);
  }

  /**
   * Resumes this array. Once resumed, this array will automatically update its contents until it is paused or
   * destroyed.
   * @throws Error if this array has been destroyed.
   */
  public resume(): void {
    if (!this.isAlive) {
      throw new Error('NearestWaypointArray: cannot resume a dead array');
    }

    if (!this.isInit || !this.isPaused) {
      return;
    }

    this.isPaused = false;

    this.isGpsDataFailedSub?.resume(true);
  }

  /**
   * Pauses this array. Once paused, this array's contents will no longer automatically update until it is resumed.
   * @throws Error if this array has been destroyed.
   */
  public pause(): void {
    if (!this.isAlive) {
      throw new Error('NearestWaypointArray: cannot pause a dead array');
    }

    if (!this.isInit || this.isPaused) {
      return;
    }

    this.isPaused = true;

    this.isGpsDataFailedSub?.pause();
    this.nearestFacilitiesSub?.pause();
  }

  /** @inheritDoc */
  public get(index: number): EntryType {
    return this.array.get(index);
  }

  /** @inheritDoc */
  public tryGet(index: number): EntryType | undefined {
    return this.array.tryGet(index);
  }
  /** @inheritDoc */
  public getArray(): readonly EntryType[] {
    return this.array.getArray();
  }
  /** @inheritDoc */
  public sub(handler: SubscribableArrayHandler<EntryType>, initialNotify?: boolean | undefined, paused?: boolean | undefined): Subscription {
    return this.array.sub(handler, initialNotify, paused);
  }

  /**
   * Inserts an entry for a facility into this array. The entry will not be inserted if the facility is already
   * represented in this array.
   * @param facility The facility for which to insert an entry.
   */
  private insertEntryForFacility(facility: FacilityTypeMap[T]): void {
    const index = this.array.getArray().findIndex(entry => entry.waypoint.facility.get().icao === facility.icao);
    if (index < 0) {
      this.array.insert(this.waypointEntryFactory(this.facWaypointCache.get(facility) as NearestFacilityWaypointTypeMap[T]));
    }
  }

  /**
   * Removes an entry for a facility from this array.
   * @param facility The facility for which to remove an entry.
   * @returns The entry that was removed, or `undefined` if the specified facility is not represented in this array.
   */
  private removeEntryForFacility(facility: FacilityTypeMap[T]): EntryType | undefined {
    const index = this.array.getArray().findIndex(entry => entry.waypoint.facility.get().icao === facility.icao);
    if (index < 0) {
      return undefined;
    }

    const removed = this.array.get(index);
    this.array.removeAt(index);

    return removed;
  }

  /**
   * Reconciles this array with the array provided by its nearest facilities subscription.
   * @param facilityArray The array provided by this arrya's nearest facilities subscription.
   */
  private reconcileArray(facilityArray: readonly FacilityTypeMap[T][]): void {
    const toInclude = new Map<string, FacilityTypeMap[T]>();
    for (let i = 0; i < facilityArray.length; i++) {
      toInclude.set(facilityArray[i].icao, facilityArray[i]);
    }

    for (let i = 0; i < this.array.length; i++) {
      const entry = this.array.get(i);
      const icao = entry.waypoint.facility.get().icao;

      if (toInclude.has(entry.waypoint.facility.get().icao)) {
        toInclude.delete(icao);
      } else {
        this.array.removeAt(i);
      }
    }

    for (const facility of toInclude.values()) {
      this.array.insert(this.waypointEntryFactory(this.facWaypointCache.get(facility) as NearestFacilityWaypointTypeMap[T]));
    }
  }

  /**
   * Clears this page's nearest waypoint data item array.
   */
  private clearArray(): void {
    const array = this.array.getArray();
    for (let i = 0; i < array.length; i++) {
      array[i].destroy();
    }
    this.array.clear();
  }

  /**
   * Destroys this array. Once this array is destroyed, it will be emptied and will no longer automatically update
   * its contents and cannot be paused or resumed.
   */
  public destroy(): void {
    this.isAlive = false;

    this.nearestFacilitiesSub?.destroy();
    this.isGpsDataFailedSub?.destroy();

    this.clearArray();
  }
}
