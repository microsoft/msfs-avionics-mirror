import { DefaultWaypointIconImageCache, DefaultWaypointIconImageKey, WaypointIconImageCache } from '@microsoft/msfs-garminsdk';

import { G1000FilePaths } from '../../G1000FilePaths';

/**
 * A cache of UI waypoint icon images.
 */
export class G1000UiMapWaypointIconImageCache {
  private static INSTANCE?: WaypointIconImageCache;

  /**
   * Gets a UI waypoint icon image cache.
   * @returns A map waypoint icon image cache.
   */
  public static getCache(): WaypointIconImageCache {
    return G1000UiMapWaypointIconImageCache.INSTANCE ??= this.createCache();
  }

  /**
   * Creates a waypoint icon image cache.
   * @returns A new waypoint icon image cache.
   */
  private static createCache(): WaypointIconImageCache {
    const cache = new DefaultWaypointIconImageCache();

    cache.register(DefaultWaypointIconImageKey.AirportPrivate, `${G1000FilePaths.ASSETS_PATH}/icons-map/airport_r.png`);
    cache.register(DefaultWaypointIconImageKey.AirportUnknown, `${G1000FilePaths.ASSETS_PATH}/icons-map/airport_q.png`);
    cache.register(DefaultWaypointIconImageKey.AirportUntoweredServiced, `${G1000FilePaths.ASSETS_PATH}/icons-map/airport_large_magenta.png`);
    cache.register(DefaultWaypointIconImageKey.AirportToweredUnserviced, `${G1000FilePaths.ASSETS_PATH}/icons-map/airport_med_blue.png`);
    cache.register(DefaultWaypointIconImageKey.AirportToweredServiced, `${G1000FilePaths.ASSETS_PATH}/icons-map/airport_large_blue.png`);
    cache.register(DefaultWaypointIconImageKey.AirportUntoweredUnserviced, `${G1000FilePaths.ASSETS_PATH}/icons-map/airport_med_magenta.png`);
    cache.register(DefaultWaypointIconImageKey.AirportSmallUnserviced, `${G1000FilePaths.ASSETS_PATH}/icons-map/airport_small_a.png`);
    cache.register(DefaultWaypointIconImageKey.AirportSmallServiced, `${G1000FilePaths.ASSETS_PATH}/icons-map/airport_small_b.png`);
    cache.register(DefaultWaypointIconImageKey.Intersection, `${G1000FilePaths.ASSETS_PATH}/icons-map/intersection_cyan.png`);
    cache.register(DefaultWaypointIconImageKey.Vor, `${G1000FilePaths.ASSETS_PATH}/icons-map/vor.png`);
    cache.register(DefaultWaypointIconImageKey.VorDme, `${G1000FilePaths.ASSETS_PATH}/icons-map/vor_dme.png`);
    cache.register(DefaultWaypointIconImageKey.DmeOnly, `${G1000FilePaths.ASSETS_PATH}/icons-map/dme.png`);
    cache.register(DefaultWaypointIconImageKey.Vortac, `${G1000FilePaths.ASSETS_PATH}/icons-map/vor_vortac.png`);
    // TODO TACAN icon
    cache.register(DefaultWaypointIconImageKey.Ndb, `${G1000FilePaths.ASSETS_PATH}/icons-map/ndb.png`);
    cache.register(DefaultWaypointIconImageKey.User, `${G1000FilePaths.ASSETS_PATH}/icons-map/user.png`);
    cache.register(DefaultWaypointIconImageKey.FlightPath, `${G1000FilePaths.ASSETS_PATH}/icons-map/map_icon_flight_path_waypoint.png`);
    cache.register(DefaultWaypointIconImageKey.VNav, `${G1000FilePaths.ASSETS_PATH}/icons-map/vnav.png`);

    return cache;
  }
}
