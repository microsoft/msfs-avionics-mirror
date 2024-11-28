import { AirportFacility, BasicFacilityWaypoint, EventBus, Facility, FacilityType, FacilityUtils, FacilityWaypoint, FacilityWaypointCache, ICAO } from '@microsoft/msfs-sdk';

import { AirportWaypoint } from './AirportWaypoint';

/**
 * A Garmin-specific implementation of {@link FacilityWaypointCache}.
 */
export class GarminFacilityWaypointCache implements FacilityWaypointCache {
  private static INSTANCE: GarminFacilityWaypointCache | undefined;

  private readonly cache = new Map<string, FacilityWaypoint>();

  /**
   * Creates a new instance of GarminFacilityWaypointCache.
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
    const key = GarminFacilityWaypointCache.getFacilityKey(facility);
    let existing = this.cache.get(key);
    if (!existing) {
      if (ICAO.getFacilityTypeFromValue(facility.icaoStruct) === FacilityType.Airport) {
        existing = new AirportWaypoint(facility as unknown as AirportFacility, this.bus);
      } else {
        existing = new BasicFacilityWaypoint(facility, this.bus);
      }
      this.addToCache(key, existing);
    }
    return existing as FacilityWaypoint<T>;
  }

  /**
   * Adds a waypoint to this cache. If the size of the cache is greater than the maximum after the new waypoint is
   * added, a waypoint will be removed from the cache in FIFO order.
   * @param key The key of the waypoint to add.
   * @param waypoint The waypoint to add.
   */
  private addToCache(key: string, waypoint: FacilityWaypoint): void {
    this.cache.set(key, waypoint);
    if (this.cache.size > this.size) {
      this.cache.delete(this.cache.keys().next().value!);
    }
  }

  /**
   * Gets a GarminFacilityWaypointCache instance.
   * @param bus The event bus.
   * @returns A GarminFacilityWaypointCache instance.
   */
  public static getCache(bus: EventBus): GarminFacilityWaypointCache {
    return GarminFacilityWaypointCache.INSTANCE ??= new GarminFacilityWaypointCache(bus, 1000);
  }

  /**
   * Gets the cache key for a facility.
   * @param facility A facility.
   * @returns The cache key for the specified facility.
   */
  private static getFacilityKey(facility: Facility): string {
    if (FacilityUtils.isFacilityType(facility, FacilityType.Intersection) && ICAO.getFacilityTypeFromValue(facility.icaoStruct) !== FacilityType.Intersection) {
      return `mismatch.${ICAO.getUid(facility.icaoStruct)}`;
    }

    if (FacilityUtils.isFacilityType(facility, FacilityType.Airport)) {
      return `${ICAO.getUid(facility.icaoStruct)}\n${facility.loadedDataFlags}`;
    }

    return ICAO.getUid(facility.icaoStruct);
  }
}