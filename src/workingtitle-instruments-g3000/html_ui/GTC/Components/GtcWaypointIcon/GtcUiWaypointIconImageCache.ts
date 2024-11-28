import { DefaultWaypointIconImageCache, DefaultWaypointIconImageKey } from '@microsoft/msfs-garminsdk';

import { G3000FilePaths } from '@microsoft/msfs-wtg3000-common';

/**
 * A cache of UI waypoint icon images for the GTC.
 */
export class GtcUiMapWaypointIconImageCache {
  private static INSTANCE?: DefaultWaypointIconImageCache;

  /**
   * Gets a UI waypoint icon image cache.
   * @returns A map waypoint icon image cache.
   */
  public static getCache(): DefaultWaypointIconImageCache {
    return GtcUiMapWaypointIconImageCache.INSTANCE ??= this.createCache();
  }

  /**
   * Creates a waypoint icon image cache.
   * @returns A new waypoint icon image cache.
   */
  private static createCache(): DefaultWaypointIconImageCache {
    const cache = new DefaultWaypointIconImageCache();

    cache.register(DefaultWaypointIconImageKey.AirportPrivate, `${G3000FilePaths.ASSETS_PATH}/Images/GTC/2aptprv.png`);
    cache.register(DefaultWaypointIconImageKey.AirportUnknown, `${G3000FilePaths.ASSETS_PATH}/Images/GTC/2apt.png`);
    cache.register(DefaultWaypointIconImageKey.AirportUntoweredServiced, `${G3000FilePaths.ASSETS_PATH}/Images/GTC/airport_large_magenta.png`);
    cache.register(DefaultWaypointIconImageKey.AirportToweredUnserviced, `${G3000FilePaths.ASSETS_PATH}/Images/GTC/airport_med_blue.png`);
    cache.register(DefaultWaypointIconImageKey.AirportToweredServiced, `${G3000FilePaths.ASSETS_PATH}/Images/GTC/airport_large_blue.png`);
    cache.register(DefaultWaypointIconImageKey.AirportUntoweredUnserviced, `${G3000FilePaths.ASSETS_PATH}/Images/GTC/airport_med_magenta.png`);
    cache.register(DefaultWaypointIconImageKey.AirportSmallUnserviced, `${G3000FilePaths.ASSETS_PATH}/Images/GTC/2aptsoft.png`);
    cache.register(DefaultWaypointIconImageKey.AirportSmallServiced, `${G3000FilePaths.ASSETS_PATH}/Images/GTC/2aptsoft_fuel.png`);
    cache.register(DefaultWaypointIconImageKey.Intersection, `${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_int_sm.png`);
    cache.register(DefaultWaypointIconImageKey.Vor, `${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_vor_sm.png`);
    cache.register(DefaultWaypointIconImageKey.VorDme, `${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_vordme_sm.png`);
    cache.register(DefaultWaypointIconImageKey.DmeOnly, `${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_vorils_sm.png`);
    cache.register(DefaultWaypointIconImageKey.Vortac, `${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_vortac_sm.png`);
    cache.register(DefaultWaypointIconImageKey.Tacan, `${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_tacan_sm.png`);
    cache.register(DefaultWaypointIconImageKey.Ndb, `${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_ndb_sm.png`);
    cache.register(DefaultWaypointIconImageKey.User, `${G3000FilePaths.ASSETS_PATH}/Images/GTC/4usr_wpt.png`);

    return cache;
  }
}
