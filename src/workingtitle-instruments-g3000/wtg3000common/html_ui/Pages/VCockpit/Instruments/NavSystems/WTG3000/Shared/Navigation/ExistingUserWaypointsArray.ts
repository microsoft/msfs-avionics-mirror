import {
  AbstractSubscribableArray, EventBus, FacilityRepository, FacilityRepositoryEvents, FacilityType, FacilityUtils,
  FacilityWaypoint, FacilityWaypointCache, SubscribableArrayEventType, Subscription, UserFacility
} from '@microsoft/msfs-sdk';

/**
 * An array of all existing user waypoints. Each instance of this class is automatically updated to contain all
 * existing user waypoints in the order in which they were added.
 */
export class ExistingUserWaypointsArray extends AbstractSubscribableArray<FacilityWaypoint<UserFacility>> {

  private readonly _array: FacilityWaypoint<UserFacility>[] = [];

  /** @inheritdoc */
  public get length(): number {
    return this._array.length;
  }

  private readonly facRepoSubs: Subscription[];

  /**
   * Constructor.
   * @param facRepo The facility repository.
   * @param bus The event bus.
   * @param facWaypointCache A cache from which to retrieve facility waypoints.
   */
  public constructor(facRepo: FacilityRepository, bus: EventBus, private readonly facWaypointCache: FacilityWaypointCache) {
    super();

    facRepo.forEach(facility => { this._array.push(facWaypointCache.get(facility)); }, [FacilityType.USR]);

    const sub = bus.getSubscriber<FacilityRepositoryEvents>();

    this.facRepoSubs = [
      sub.on('facility_added').handle(facility => { FacilityUtils.isFacilityType(facility, FacilityType.USR) && this.onFacilityAdded(facility); }),
      sub.on('facility_removed').handle(facility => { FacilityUtils.isFacilityType(facility, FacilityType.USR) && this.onFacilityRemoved(facility); })
    ];
  }

  /** @inheritdoc */
  public getArray(): readonly FacilityWaypoint<UserFacility>[] {
    return this._array;
  }

  /**
   * Responds to when a user facility is added.
   * @param facility The added facility.
   */
  private onFacilityAdded(facility: UserFacility): void {
    const waypoint = this.facWaypointCache.get<UserFacility>(facility);
    this._array.push(waypoint);
    this.notify(this._array.length - 1, SubscribableArrayEventType.Added, waypoint);
  }

  /**
   * Responds to when a user facility is removed.
   * @param facility The removed facility.
   */
  private onFacilityRemoved(facility: UserFacility): void {
    const index = this._array.findIndex(waypoint => waypoint.facility.get().icao === facility.icao);

    if (index >= 0) {
      this.notify(index, SubscribableArrayEventType.Removed, this._array.splice(index, 1)[0]);
    }
  }

  /**
   * Destroys this array. Once destroyed, the state of the array will no longer reflect all existing user waypoints.
   */
  public destroy(): void {
    this.facRepoSubs.forEach(sub => { sub.destroy(); });
  }
}