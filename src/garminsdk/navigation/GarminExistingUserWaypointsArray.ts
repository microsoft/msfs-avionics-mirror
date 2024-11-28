import {
  AbstractSubscribableArray, EventBus, Facility, FacilityRepository, FacilityRepositoryEvents, FacilityType,
  FacilityUtils, FacilityWaypoint, FacilityWaypointCache, ICAO, SubscribableArrayEventType, Subscription, UserFacility
} from '@microsoft/msfs-sdk';

/**
 * Configuration options for {@link GarminExistingUserWaypointsArray}.
 */
export type GarminExistingUserWaypointsArrayOptions = {
  /**
   * The scope of the user waypoints to include in the array. The scope is read from the airport ident field of the
   * waypoints' ICAO values.
   */
  scope?: string;
};

/**
 * An array of all existing user waypoints. Each instance of this class is automatically updated to contain all
 * existing user waypoints in the order in which they were added.
 */
export class GarminExistingUserWaypointsArray extends AbstractSubscribableArray<FacilityWaypoint<UserFacility>> {

  private readonly scope: string;

  private readonly _array: FacilityWaypoint<UserFacility>[] = [];

  /** @inheritDoc */
  public get length(): number {
    return this._array.length;
  }

  private readonly facRepoSubs: Subscription[];

  /**
   * Creates a new instance of GarminExistingUserWaypointsArray.
   * @param facRepo The facility repository.
   * @param bus The event bus.
   * @param facWaypointCache A cache from which to retrieve facility waypoints.
   * @param options Options with which to configure the array.
   */
  public constructor(
    facRepo: FacilityRepository,
    bus: EventBus,
    private readonly facWaypointCache: FacilityWaypointCache,
    options?: Readonly<GarminExistingUserWaypointsArrayOptions>
  ) {
    super();

    this.scope = options?.scope ?? '';

    facRepo.forEach(facility => {
      if (facility.icaoStruct.airport === this.scope) {
        this._array.push(facWaypointCache.get(facility));
      }
    }, [FacilityType.USR]);

    const sub = bus.getSubscriber<FacilityRepositoryEvents>();

    this.facRepoSubs = [
      sub.on('facility_added').handle(this.onFacilityAdded.bind(this)),
      sub.on('facility_removed').handle(this.onFacilityRemoved.bind(this))
    ];
  }

  /** @inheritDoc */
  public getArray(): readonly FacilityWaypoint<UserFacility>[] {
    return this._array;
  }

  /**
   * Responds to when a user facility is added.
   * @param facility The added facility.
   */
  private onFacilityAdded(facility: Facility): void {
    if (
      FacilityUtils.isFacilityType(facility, FacilityType.USR)
      && facility.icaoStruct.airport === this.scope
    ) {
      const waypoint = this.facWaypointCache.get<UserFacility>(facility);
      this._array.push(waypoint);
      this.notify(this._array.length - 1, SubscribableArrayEventType.Added, waypoint);
    }
  }

  /**
   * Responds to when a user facility is removed.
   * @param facility The removed facility.
   */
  private onFacilityRemoved(facility: Facility): void {
    if (
      FacilityUtils.isFacilityType(facility, FacilityType.USR)
      && facility.icaoStruct.airport === this.scope
    ) {
      const index = this._array.findIndex(waypoint => ICAO.valueEquals(waypoint.facility.get().icaoStruct, facility.icaoStruct));
      if (index >= 0) {
        this.notify(index, SubscribableArrayEventType.Removed, this._array.splice(index, 1)[0]);
      }
    }
  }

  /**
   * Destroys this array. Once destroyed, the state of the array will no longer reflect all existing user waypoints.
   */
  public destroy(): void {
    this.facRepoSubs.forEach(sub => { sub.destroy(); });
  }
}
