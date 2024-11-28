import { DefaultWaypointIconImageCache, DefaultWaypointIconImageKey, WaypointIconImageCache } from '@microsoft/msfs-garminsdk';

import { G3XTouchFilePaths } from '../../G3XTouchFilePaths';

/**
 * A cache of map waypoint icon images.
 */
export class MapWaypointIconImageCache {
  private static INSTANCE?: WaypointIconImageCache;

  /**
   * Gets a map waypoint icon image cache.
   * @returns A map waypoint icon image cache.
   */
  public static getCache(): WaypointIconImageCache {
    return MapWaypointIconImageCache.INSTANCE ??= this.createCache();
  }

  /**
   * Creates a waypoint icon image cache.
   * @returns A new waypoint icon image cache.
   */
  private static createCache(): WaypointIconImageCache {
    const cache = new DefaultWaypointIconImageCache();

    cache.register(DefaultWaypointIconImageKey.AirportPrivate, `${G3XTouchFilePaths.ASSETS_PATH}/Images/Map/airport_r.png`);
    cache.register(DefaultWaypointIconImageKey.AirportUnknown, `${G3XTouchFilePaths.ASSETS_PATH}/Images/Map/airport_q.png`);
    cache.register(DefaultWaypointIconImageKey.AirportUntoweredServiced, `${G3XTouchFilePaths.ASSETS_PATH}/Images/Map/airport_large_magenta.png`);
    cache.register(DefaultWaypointIconImageKey.AirportToweredUnserviced, `${G3XTouchFilePaths.ASSETS_PATH}/Images/Map/airport_med_blue.png`);
    cache.register(DefaultWaypointIconImageKey.AirportToweredServiced, `${G3XTouchFilePaths.ASSETS_PATH}/Images/Map/airport_large_blue.png`);
    cache.register(DefaultWaypointIconImageKey.AirportUntoweredUnserviced, `${G3XTouchFilePaths.ASSETS_PATH}/Images/Map/airport_med_magenta.png`);
    cache.register(DefaultWaypointIconImageKey.AirportSmallUnserviced, `${G3XTouchFilePaths.ASSETS_PATH}/Images/Map/airport_small_a.png`);
    cache.register(DefaultWaypointIconImageKey.AirportSmallServiced, `${G3XTouchFilePaths.ASSETS_PATH}/Images/Map/airport_small_b.png`);
    cache.register(DefaultWaypointIconImageKey.Intersection, `${G3XTouchFilePaths.ASSETS_PATH}/Images/Map/intersection_cyan.png`);
    cache.register(DefaultWaypointIconImageKey.Vor, `${G3XTouchFilePaths.ASSETS_PATH}/Images/Map/vor.png`);
    cache.register(DefaultWaypointIconImageKey.VorDme, `${G3XTouchFilePaths.ASSETS_PATH}/Images/Map/vor_dme.png`);
    cache.register(DefaultWaypointIconImageKey.DmeOnly, `${G3XTouchFilePaths.ASSETS_PATH}/Images/Map/dme.png`);
    cache.register(DefaultWaypointIconImageKey.Vortac, `${G3XTouchFilePaths.ASSETS_PATH}/Images/Map/vor_vortac.png`);
    // TODO TACAN icon
    cache.register(DefaultWaypointIconImageKey.Ndb, `${G3XTouchFilePaths.ASSETS_PATH}/Images/Map/ndb.png`);
    cache.register(DefaultWaypointIconImageKey.User, `${G3XTouchFilePaths.ASSETS_PATH}/Images/Map/user.png`);
    cache.register(DefaultWaypointIconImageKey.FlightPath, `${G3XTouchFilePaths.ASSETS_PATH}/Images/Map/map_icon_flight_path_waypoint.png`);
    cache.register(DefaultWaypointIconImageKey.VNav, `${G3XTouchFilePaths.ASSETS_PATH}/Images/Map/vnav.png`);

    return cache;
  }
}