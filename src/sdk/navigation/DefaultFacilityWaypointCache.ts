import { EventBus } from '../data/EventBus';
import { Facility, FacilityType, FacilityUtils, ICAO } from './Facilities';
import { FacilityWaypointCache } from './FacilityWaypointCache';
import { BasicFacilityWaypoint, FacilityWaypoint } from './Waypoint';

/**
 * A default implementation of {@link FacilityWaypointCache}.
 */
export class DefaultFacilityWaypointCache implements FacilityWaypointCache {
  private static INSTANCE: DefaultFacilityWaypointCache | undefined;

  private readonly cache = new Map<string, FacilityWaypoint<any>>();

  /**
   * Constructor.
   * @param bus The event bus.
   * @param size The maximum size of this cache.
   */
  private constructor(private readonly bus: EventBus, public readonly size: number) {
  }

  /** @inheritdoc */
  public get<T extends Facility>(facility: Facility): FacilityWaypoint<T> {
    const key = DefaultFacilityWaypointCache.getFacilityKey(facility);
    let existing = this.cache.get(key);
    if (!existing) {
      existing = new BasicFacilityWaypoint(facility, this.bus);
      this.addToCache(key, existing);
    }
    return existing;
  }

  /**
   * Adds a waypoint to this cache. If the size of the cache is greater than the maximum after the new waypoint is
   * added, a waypoint will be removed from the cache in FIFO order.
   * @param key The key of the waypoint to add.
   * @param waypoint The waypoint to add.
   */
  private addToCache(key: string, waypoint: FacilityWaypoint<any>): void {
    this.cache.set(key, waypoint);
    if (this.cache.size > this.size) {
      this.cache.delete(this.cache.keys().next().value);
    }
  }

  /**
   * Gets a FacilityWaypointCache instance.
   * @param bus The event bus.
   * @returns A FacilityWaypointCache instance.
   */
  public static getCache(bus: EventBus): FacilityWaypointCache {
    return DefaultFacilityWaypointCache.INSTANCE ??= new DefaultFacilityWaypointCache(bus, 1000);
  }

  /**
   * Gets the cache key for a facility.
   * @param facility A facility.
   * @returns The cache key for the specified facility.
   */
  private static getFacilityKey(facility: Facility): string {
    if (FacilityUtils.isFacilityType(facility, FacilityType.Intersection) && ICAO.getFacilityType(facility.icao) !== FacilityType.Intersection) {
      return `mismatch.${facility.icao}`;
    }

    return facility.icao;
  }
}