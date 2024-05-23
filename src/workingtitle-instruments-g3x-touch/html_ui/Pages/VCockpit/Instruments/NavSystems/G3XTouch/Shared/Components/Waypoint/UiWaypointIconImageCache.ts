import { DefaultWaypointIconImageCache, DefaultWaypointIconImageKey } from '@microsoft/msfs-garminsdk';

import { G3XTouchFilePaths } from '../../G3XTouchFilePaths';

/**
 * A cache of UI waypoint icon images.
 */
export class UiWaypointIconImageCache {
  private static INSTANCE?: DefaultWaypointIconImageCache;

  /**
   * Gets a UI waypoint icon image cache.
   * @returns A UI waypoint icon image cache.
   */
  public static getCache(): DefaultWaypointIconImageCache {
    return UiWaypointIconImageCache.INSTANCE ??= this.createCache();
  }

  /**
   * Creates a waypoint icon image cache.
   * @returns A new waypoint icon image cache.
   */
  private static createCache(): DefaultWaypointIconImageCache {
    const cache = new DefaultWaypointIconImageCache();

    cache.register(DefaultWaypointIconImageKey.AirportPrivate, `${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_airport_private_small.png`);
    cache.register(DefaultWaypointIconImageKey.AirportUnknown, `${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_airport_unknown_small.png`);
    cache.register(DefaultWaypointIconImageKey.AirportToweredUnserviced, `${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_airport_unserviced_blue_small.png`);
    cache.register(DefaultWaypointIconImageKey.AirportToweredServiced, `${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_airport_serviced_blue_small.png`);
    cache.register(DefaultWaypointIconImageKey.AirportUntoweredUnserviced, `${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_airport_unserviced_magenta_small.png`);
    cache.register(DefaultWaypointIconImageKey.AirportUntoweredServiced, `${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_airport_serviced_magenta_small.png`);
    cache.register(DefaultWaypointIconImageKey.AirportSmallUnserviced, `${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_airport_unserviced_soft_small.png`);
    cache.register(DefaultWaypointIconImageKey.AirportSmallServiced, `${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_airport_serviced_soft_small.png`);
    cache.register(DefaultWaypointIconImageKey.Intersection, `${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_int_small.png`);
    // TODO: VOR/NDB icons are copied from the G3000
    cache.register(DefaultWaypointIconImageKey.Vor, `${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_vor_sm.png`);
    cache.register(DefaultWaypointIconImageKey.VorDme, `${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_vordme_sm.png`);
    cache.register(DefaultWaypointIconImageKey.DmeOnly, `${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_vorils_sm.png`);
    cache.register(DefaultWaypointIconImageKey.Vortac, `${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_vortac_sm.png`);
    cache.register(DefaultWaypointIconImageKey.Tacan, `${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_tacan_sm.png`);
    cache.register(DefaultWaypointIconImageKey.Ndb, `${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_ndb_sm.png`);
    cache.register(DefaultWaypointIconImageKey.User, `${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_user_wpt_small.png`);

    return cache;
  }
}