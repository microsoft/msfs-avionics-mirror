import {
  AirportFacility, AirportPrivateType, FacilityType, FacilityWaypoint, FlightPathWaypoint, ICAO, VNavWaypoint, VorFacility, VorType, Waypoint
} from 'msfssdk';

import { WaypointIconImageCache } from './WaypointIconImageCache';

/**
 * Keys for a DefaultWaypointIconImageCache.
 */
export enum DefaultWaypointIconImageKey {
  AirportToweredServiced = 'AIRPORT_TOWERED_SERVICED',
  AirportToweredUnserviced = 'AIRPORT_TOWERED_NONSERVICED',
  AirportUntoweredServiced = 'AIRPORT_NONTOWERED_SERVICED',
  AirportUntoweredUnserviced = 'AIRPORT_NONTOWERED_NONSERVICED',
  AirportSmallServiced = 'AIRPORT_SMALL_SERVICED',
  AirportSmallUnserviced = 'AIRPORT_SMALL_NONSERVICED',
  AirportPrivate = 'AIRPORT_PRIVATE',
  AirportUnknown = 'AIRPORT_UNKNOWN',
  Vor = 'VOR',
  VorDme = 'VORDME',
  Vortac = 'VORTAC',
  Tacan = 'TACAN',
  DmeOnly = 'DME',
  Ndb = 'NDB',
  Intersection = 'INTERSECTION',
  User = 'USER',
  FlightPath = 'FPLN',
  VNav = 'VNAV'
}

/**
 * A default implementation of {@link WaypointIconImageCache}.
 */
export class DefaultWaypointIconImageCache implements WaypointIconImageCache {
  protected readonly cache = new Map<string, HTMLImageElement>();

  /**
   * Registers an image with this cache.
   * @param key The key of the image to register.
   * @param src The source URI of the image to register.
   */
  public register(key: string, src: string): void {
    const img = new Image();
    img.src = src;
    this.cache.set(key, img);
  }

  /**
   * Retrieves an image from this cache.
   * @param key The key of the image to retrieve.
   * @returns The image registered under the specified key, or `undefined` if one could not be found.
   */
  public get(key: string): HTMLImageElement | undefined {
    return this.cache.get(key);
  }

  /** @inheritdoc */
  public getForWaypoint(waypoint: Waypoint): HTMLImageElement | undefined {
    if (waypoint instanceof FacilityWaypoint) {
      switch (ICAO.getFacilityType(waypoint.facility.get().icao)) {
        case FacilityType.Airport:
          return this.getForAirport(waypoint);
        case FacilityType.VOR:
          return this.getForVor(waypoint);
        case FacilityType.NDB:
          return this.get(DefaultWaypointIconImageKey.Ndb);
        case FacilityType.Intersection:
        case FacilityType.RWY:
        case FacilityType.VIS:
          return this.get(DefaultWaypointIconImageKey.Intersection);
        case FacilityType.USR:
          return this.get(DefaultWaypointIconImageKey.User);
      }
    } else if (waypoint instanceof FlightPathWaypoint) {
      return this.get(DefaultWaypointIconImageKey.FlightPath);
    } else if (waypoint instanceof VNavWaypoint) {
      return this.get(DefaultWaypointIconImageKey.VNav);
    }
  }

  /**
   * Retrieves an image for an airport.
   * @param airport The airport for which to retrieve the image.
   * @returns The image for the specified airport, or `undefined` if one could not be found.
   */
  protected getForAirport(airport: FacilityWaypoint<AirportFacility>): HTMLImageElement | undefined {
    const fac = airport.facility.get();

    // HINT class 1 airports are always assumed serviced
    const serviced = (fac.fuel1 !== '' || fac.fuel2 !== '') || fac.airportClass === 1;

    if (fac.airportPrivateType !== AirportPrivateType.Public) {
      return this.get(DefaultWaypointIconImageKey.AirportPrivate);
    } else if (serviced && fac.towered) {
      return this.get(DefaultWaypointIconImageKey.AirportToweredServiced);
    } else if (serviced && !fac.towered) {
      if (fac.airportClass === 1) {
        return this.get(DefaultWaypointIconImageKey.AirportUntoweredServiced);
      } else {
        return this.get(DefaultWaypointIconImageKey.AirportSmallServiced);
      }
    } else if (!serviced && fac.towered) {
      return this.get(DefaultWaypointIconImageKey.AirportToweredUnserviced);
    } else if (!serviced && !fac.towered) {
      if (fac.airportClass === 1) {
        return this.get(DefaultWaypointIconImageKey.AirportUntoweredUnserviced);
      } else {
        return this.get(DefaultWaypointIconImageKey.AirportSmallUnserviced);
      }
    } else {
      return this.get(DefaultWaypointIconImageKey.AirportUnknown);
    }
  }

  /**
   * Retrieves an image for a VOR.
   * @param vor The VOR for which to retrieve the image.
   * @returns The image for the specified VOR, or `undefined` if one could not be found.
   */
  protected getForVor(vor: FacilityWaypoint<VorFacility>): HTMLImageElement | undefined {
    switch (vor.facility.get().type) {
      case VorType.DME:
        return this.get(DefaultWaypointIconImageKey.DmeOnly);
      case VorType.ILS:
      case VorType.VORDME:
        return this.get(DefaultWaypointIconImageKey.VorDme);
      case VorType.VORTAC:
      case VorType.TACAN:
        return this.get(DefaultWaypointIconImageKey.Vortac);
      default:
        return this.get(DefaultWaypointIconImageKey.Vor);
    }
  }
}