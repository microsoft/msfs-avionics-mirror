import { DefaultWaypointIconImageCache, DefaultWaypointIconImageKey } from '@microsoft/msfs-garminsdk';

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

    cache.register(DefaultWaypointIconImageKey.AirportPrivate, 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/2aptprv.png');
    cache.register(DefaultWaypointIconImageKey.AirportUnknown, 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/2apt.png');
    cache.register(DefaultWaypointIconImageKey.AirportUntoweredServiced, 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/airport_large_magenta.png');
    cache.register(DefaultWaypointIconImageKey.AirportToweredUnserviced, 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/airport_med_blue.png');
    cache.register(DefaultWaypointIconImageKey.AirportToweredServiced, 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/airport_large_blue.png');
    cache.register(DefaultWaypointIconImageKey.AirportUntoweredUnserviced, 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/airport_med_magenta.png');
    cache.register(DefaultWaypointIconImageKey.AirportSmallUnserviced, 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/2aptsoft.png');
    cache.register(DefaultWaypointIconImageKey.AirportSmallServiced, 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/2aptsoft_fuel.png');
    cache.register(DefaultWaypointIconImageKey.Intersection, 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_int_sm.png');
    cache.register(DefaultWaypointIconImageKey.Vor, 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_vor_sm.png');
    cache.register(DefaultWaypointIconImageKey.VorDme, 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_vordme_sm.png');
    cache.register(DefaultWaypointIconImageKey.DmeOnly, 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_vorils_sm.png');
    cache.register(DefaultWaypointIconImageKey.Vortac, 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_vortac_sm.png');
    cache.register(DefaultWaypointIconImageKey.Tacan, 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_tacan_sm.png');
    cache.register(DefaultWaypointIconImageKey.Ndb, 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_ndb_sm.png');
    cache.register(DefaultWaypointIconImageKey.User, 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/4usr_wpt.png');

    return cache;
  }
}