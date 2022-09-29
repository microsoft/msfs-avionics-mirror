import { AirportFacility, EventBus, Facility, FacilityType, FacilityWaypoint, FacilityWaypointCache, ICAO } from 'msfssdk';

import { AirportWaypoint } from './AirportWaypoint';

/**
 * A Garmin-specific implementation of {@link FacilityWaypointCache}.
 */
export class GarminFacilityWaypointCache implements FacilityWaypointCache {
  private static INSTANCE: GarminFacilityWaypointCache | undefined;

  private readonly cache = new Map<string, FacilityWaypoint<any>>();

  /**
   * Constructor.
   * @param bus The event bus.
   * @param size The maximum size of this cache.
   */
  private constructor(private readonly bus: EventBus, public readonly size: number) {
  }

  /**
   * Gets a waypoint from the cache for a specific facility. If one does not exist, a new waypoint will be created.
   * @param facility The facility for which to get a waypoint.
   * @returns A waypoint.
   */
  public get<T extends Facility>(facility: Facility): FacilityWaypoint<T> {
    let existing = this.cache.get(facility.icao);
    if (!existing) {
      if (ICAO.getFacilityType(facility.icao) === FacilityType.Airport) {
        existing = new AirportWaypoint(facility as unknown as AirportFacility, this.bus);
      } else {
        existing = new FacilityWaypoint(facility, this.bus);
      }
      this.addToCache(facility, existing);
    }
    return existing;
  }

  /**
   * Adds a waypoint to this cache. If the size of the cache is greater than the maximum after the new waypoint is
   * added, a waypoint will be removed from the cache in FIFO order.
   * @param facility The facility associated with the waypoint to add.
   * @param waypoint The waypoint to add.
   */
  private addToCache(facility: Facility, waypoint: FacilityWaypoint<any>): void {
    this.cache.set(facility.icao, waypoint);
    if (this.cache.size > this.size) {
      this.cache.delete(this.cache.keys().next().value);
    }
  }

  /**
   * Gets a FacilityWaypointCache instance.
   * @param bus The event bus.
   * @returns A FacilityWaypointCache instance.
   */
  public static getCache(bus: EventBus): GarminFacilityWaypointCache {
    return GarminFacilityWaypointCache.INSTANCE ??= new GarminFacilityWaypointCache(bus, 1000);
  }
}