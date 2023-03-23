import { AirportFacility, AirportRunway } from '@microsoft/msfs-sdk';
import { MapRunwayOutlineWaypoint } from './MapRunwayOutlineWaypoint';

/**
 * A cache for map runway outline waypoints.
 */
export class MapRunwayOutlineWaypointCache {
  private static INSTANCE: MapRunwayOutlineWaypointCache | undefined;

  private readonly cache = new Map<string, MapRunwayOutlineWaypoint>();

  /**
   * Constructor.
   * @param size The maximum size of this cache.
   */
  private constructor(public readonly size: number) {
  }

  /**
   * Gets a waypoint from this cache for a specific runway. If one does not exist, a new waypoint will be created.
   * @param airport The parent airport of the runway for which to get a waypoint.
   * @param runway The runway for which to get a waypoint.
   * @returns A waypoint.
   */
  public get(airport: AirportFacility, runway: AirportRunway): MapRunwayOutlineWaypoint {
    const uid = MapRunwayOutlineWaypoint.getUid(airport, runway);
    let existing = this.cache.get(uid);
    if (!existing) {
      this.addToCache(existing = new MapRunwayOutlineWaypoint(airport, runway));
    }
    return existing;
  }

  /**
   * Adds a waypoint to this cache. If the size of the cache is greater than the maximum after the new waypoint is
   * added, a waypoint will be removed from the cache in FIFO order.
   * @param waypoint The waypoint to add.
   */
  private addToCache(waypoint: MapRunwayOutlineWaypoint): void {
    this.cache.set(waypoint.uid, waypoint);
    if (this.cache.size > this.size) {
      this.cache.delete(this.cache.keys().next().value);
    }
  }

  /**
   * Gets a MapRunwayOutlineWaypointCache instance.
   * @returns A MapRunwayOutlineWaypointCache instance.
   */
  public static getCache(): MapRunwayOutlineWaypointCache {
    return MapRunwayOutlineWaypointCache.INSTANCE ??= new MapRunwayOutlineWaypointCache(1000);
  }
}