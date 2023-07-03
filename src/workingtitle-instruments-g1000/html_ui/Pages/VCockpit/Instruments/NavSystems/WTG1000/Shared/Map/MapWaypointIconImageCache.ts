import { DefaultWaypointIconImageCache, DefaultWaypointIconImageKey, WaypointIconImageCache } from '@microsoft/msfs-garminsdk';

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

    cache.register(DefaultWaypointIconImageKey.AirportPrivate, 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Assets/icons-map/airport_r.png');
    cache.register(DefaultWaypointIconImageKey.AirportUnknown, 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Assets/icons-map/airport_q.png');
    cache.register(DefaultWaypointIconImageKey.AirportUntoweredServiced, 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Assets/icons-map/airport_large_magenta.png');
    cache.register(DefaultWaypointIconImageKey.AirportToweredUnserviced, 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Assets/icons-map/airport_med_blue.png');
    cache.register(DefaultWaypointIconImageKey.AirportToweredServiced, 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Assets/icons-map/airport_large_blue.png');
    cache.register(DefaultWaypointIconImageKey.AirportUntoweredUnserviced, 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Assets/icons-map/airport_med_magenta.png');
    cache.register(DefaultWaypointIconImageKey.AirportSmallUnserviced, 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Assets/icons-map/airport_small_a.png');
    cache.register(DefaultWaypointIconImageKey.AirportSmallServiced, 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Assets/icons-map/airport_small_b.png');
    cache.register(DefaultWaypointIconImageKey.Intersection, 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Assets/icons-map/intersection_cyan.png');
    cache.register(DefaultWaypointIconImageKey.Vor, 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Assets/icons-map/vor.png');
    cache.register(DefaultWaypointIconImageKey.VorDme, 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Assets/icons-map/vor_dme.png');
    cache.register(DefaultWaypointIconImageKey.DmeOnly, 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Assets/icons-map/dme.png');
    cache.register(DefaultWaypointIconImageKey.Vortac, 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Assets/icons-map/vor_vortac.png');
    // TODO TACAN icon
    cache.register(DefaultWaypointIconImageKey.Ndb, 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Assets/icons-map/ndb.png');
    cache.register(DefaultWaypointIconImageKey.User, 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Assets/icons-map/user.png');
    cache.register(DefaultWaypointIconImageKey.FlightPath, 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Assets/icons-map/map_icon_flight_path_waypoint.png');
    cache.register(DefaultWaypointIconImageKey.VNav, 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Assets/icons-map/vnav.png');

    return cache;
  }
}