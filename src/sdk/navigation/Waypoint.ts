import { EventBus } from '../data/EventBus';
import { FlightPathUtils, LegDefinition } from '../flightplan';
import { GeoCircle, GeoPoint, GeoPointInterface, GeoPointSubject } from '../geo';
import { UnitType } from '../math';
import { Subject } from '../sub/Subject';
import { Subscribable } from '../sub/Subscribable';
import { Subscription } from '../sub/Subscription';
import { Facility, FacilityType, FacilityTypeMap } from './Facilities';
import { FacilityRepositoryEvents } from './FacilityRepository';
import { FacilityUtils } from './FacilityUtils';
import { ICAO } from './IcaoUtils';

/**
 * A collection of unique string waypoint type keys.
 */
export enum WaypointTypes {
  Custom = 'Custom',
  Airport = 'Airport',
  NDB = 'NDB',
  VOR = 'VOR',
  Intersection = 'Intersection',
  Runway = 'Runway',
  User = 'User',
  Visual = 'Visual',
  FlightPlan = 'FlightPlan',
  VNAV = 'VNAV'
}

/**
 * A navigational waypoint.
 */
export interface Waypoint {
  /** The geographic location of the waypoint. */
  readonly location: Subscribable<GeoPointInterface>;

  /** A unique string ID assigned to this waypoint. */
  readonly uid: string;

  /**
   * Checks whether this waypoint and another are equal.
   * @param other The other waypoint.
   * @returns whether this waypoint and the other are equal.
   */
  equals(other: Waypoint): boolean;

  /** The unique string type of this waypoint. */
  readonly type: string;
}

/**
 * An abstract implementation of Waypoint.
 */
export abstract class AbstractWaypoint implements Waypoint {
  public abstract get location(): Subscribable<GeoPointInterface>;
  public abstract get uid(): string;
  public abstract get type(): string;

  // eslint-disable-next-line jsdoc/require-jsdoc
  public equals(other: Waypoint): boolean {
    return this.uid === other.uid;
  }
}

/**
 * A waypoint with custom defined lat/lon coordinates.
 */
export class CustomWaypoint extends AbstractWaypoint {
  private readonly _location: Subscribable<GeoPointInterface>;
  private readonly _uid: string;

  /**
   * Constructor.
   * @param lat The latitude of this waypoint.
   * @param lon The longitude of this waypoint.
   * @param uidPrefix The prefix of this waypoint's UID.
   */
  constructor(lat: number, lon: number, uidPrefix: string);
  /**
   * Constructor.
   * @param location A subscribable which provides the location of this waypoint.
   * @param uid This waypoint's UID.
   */
  constructor(location: Subscribable<GeoPointInterface>, uid: string);
  // eslint-disable-next-line jsdoc/require-jsdoc
  constructor(arg1: number | Subscribable<GeoPointInterface>, arg2: number | string, arg3?: string) {
    super();

    let location: Subscribable<GeoPointInterface>;
    let uid: string;

    if (typeof arg1 === 'number') {
      location = GeoPointSubject.create(new GeoPoint(arg1, arg2 as number));
      uid = `${arg3 as string}[${location.get().lat},${location.get().lon}]`;
    } else {
      location = arg1;
      uid = arg2 as string;
    }

    this._location = location;
    this._uid = uid;
  }

  /** @inheritdoc */
  public get location(): Subscribable<GeoPointInterface> {
    return this._location;
  }

  /** @inheritdoc */
  public get uid(): string {
    return this._uid;
  }

  /** @inheritdoc */
  public get type(): string {
    return WaypointTypes.Custom;
  }
}

/**
 * A waypoint associated with a facility.
 */
export interface FacilityWaypoint<T extends Facility = Facility> extends Waypoint {
  /** A flag which marks this waypoint as a FacilityWaypoint. */
  readonly isFacilityWaypoint: true;

  /** The facility associated with this waypoint. */
  readonly facility: Subscribable<T>;
}

/**
 * A basic implementation of {@link FacilityWaypoint}.
 */
export class BasicFacilityWaypoint<T extends Facility = Facility> extends AbstractWaypoint implements FacilityWaypoint<T> {
  /** @inheritdoc */
  public readonly isFacilityWaypoint = true;

  private readonly _facility: Subject<T>;
  private readonly _location: GeoPointSubject;
  private readonly _type: WaypointTypes;

  private facChangeSub?: Subscription;

  /**
   * Creates a new instance of BasicFacilityWaypoint.
   * @param facility The facility associated with this waypoint.
   * @param bus The event bus.
   */
  public constructor(facility: T, private readonly bus: EventBus) {
    super();

    this._facility = Subject.create(facility);

    this._location = GeoPointSubject.create(new GeoPoint(facility.lat, facility.lon));
    this._type = BasicFacilityWaypoint.getType(facility);

    const facType = ICAO.getFacilityTypeFromValue(facility.icaoStruct);
    if (facType === FacilityType.VIS || facType === FacilityType.USR) {
      // These types of facilities can be mutated. So we need to listen to the event bus for change events and respond
      // accordingly.

      this.facChangeSub = this.bus.getSubscriber<FacilityRepositoryEvents>()
        .on(`facility_changed_${ICAO.getUid(facility.icaoStruct)}`)
        .handle(newFacility => {
          this._facility.set(newFacility as T);
          this._location.set(newFacility.lat, newFacility.lon);
        });
    }
  }

  /** @inheritdoc */
  public get location(): Subscribable<GeoPointInterface> {
    return this._location;
  }

  /** @inheritdoc */
  public get uid(): string {
    return ICAO.getUid(this.facility.get().icaoStruct);
  }

  /** @inheritdoc */
  public get type(): string {
    return this._type;
  }

  // eslint-disable-next-line jsdoc/require-returns
  /**
   * The facility associated with this waypoint.
   */
  public get facility(): Subscribable<T> {
    return this._facility;
  }

  /**
   * Gets a waypoint type from a facility.
   * @param facility A facility.
   * @returns The waypoint type corresponding to the facility.
   */
  private static getType(facility: Facility): WaypointTypes {
    switch (ICAO.getFacilityTypeFromValue(facility.icaoStruct)) {
      case FacilityType.Airport:
        return WaypointTypes.Airport;
      case FacilityType.Intersection:
        return WaypointTypes.Intersection;
      case FacilityType.NDB:
        return WaypointTypes.NDB;
      case FacilityType.RWY:
        return WaypointTypes.Runway;
      case FacilityType.USR:
        return WaypointTypes.User;
      case FacilityType.VIS:
        return WaypointTypes.Visual;
      case FacilityType.VOR:
        return WaypointTypes.VOR;
      default:
        return WaypointTypes.User;
    }
  }
}

/**
 * A utility class for working with FacilityWaypoint.
 */
export class FacilityWaypointUtils {
  /**
   * Checks whether a waypoint is a {@link FacilityWaypoint}.
   * @param waypoint The waypoint to check.
   * @returns Whether the specified waypoint is a {@link FacilityWaypoint}.
   */
  public static isFacilityWaypoint(waypoint: Waypoint): waypoint is FacilityWaypoint<Facility>;
  /**
   * Checks whether a waypoint is a {@link FacilityWaypoint} of a given facility type.
   * @param waypoint The waypoint to check.
   * @param facilityType The facility type to check against.
   * @returns Whether the specified waypoint is a {@link FacilityWaypoint} of the specified facility type.
   */
  public static isFacilityWaypoint<T extends FacilityType>(waypoint: Waypoint, facilityType: T): waypoint is FacilityWaypoint<FacilityTypeMap[T]>;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public static isFacilityWaypoint(waypoint: Waypoint, facilityType?: FacilityType): boolean {
    if ((waypoint as any).isFacilityWaypoint !== true) {
      return false;
    }

    return facilityType === undefined || FacilityUtils.isFacilityType((waypoint as FacilityWaypoint).facility.get(), facilityType);
  }
}

/**
 * A flight path waypoint.
 */
export class FlightPathWaypoint extends AbstractWaypoint {
  public static readonly UID_PREFIX = 'FLPTH';

  /** The ident string of this waypoint. */
  public readonly ident: string;

  /** The flight plan leg associated with this waypoint. */
  public readonly leg: LegDefinition;

  private readonly _location: Subscribable<GeoPointInterface>;
  private readonly _uid: string;

  /** @inheritdoc */
  public get location(): Subscribable<GeoPointInterface> {
    return this._location;
  }

  /** @inheritdoc */
  public get uid(): string {
    return this._uid;
  }

  /** @inheritdoc */
  public get type(): string { return WaypointTypes.FlightPlan; }

  /**
   * Constructor.
   * @param lat The latitude of this waypoint.
   * @param lon The longitude of this waypoint.
   * @param leg The flight plan leg associated with this waypoint.
   * @param uid This waypoint's UID, which will be prefixed with {@link FlightPathWaypoint.UID_PREFIX}.
   * @param ident The ident string of this waypoint.
   */
  constructor(lat: number, lon: number, leg: LegDefinition, uid: string, ident: string);
  /**
   * Constructor.
   * @param location A subscribable which provides the location of this waypoint.
   * @param leg The flight plan leg associated with this waypoint.
   * @param uid This waypoint's UID, which will be prefixed with {@link FlightPathWaypoint.UID_PREFIX}.
   * @param ident The ident string of this waypoint.
   */
  constructor(location: Subscribable<GeoPointInterface>, leg: LegDefinition, uid: string, ident: string);
  // eslint-disable-next-line jsdoc/require-jsdoc
  constructor(arg1: number | Subscribable<GeoPointInterface>, arg2: number | LegDefinition, arg3: LegDefinition | string, arg4: string, arg5?: string) {
    super();

    if (typeof arg1 === 'number') {
      this._location = GeoPointSubject.create(new GeoPoint(arg1, arg2 as number));
      this._uid = `${FlightPathWaypoint.UID_PREFIX}_${arg4}`;
      this.leg = arg3 as LegDefinition;
      this.ident = arg5 as string;
    } else {
      this._location = arg1;
      this._uid = `${FlightPathWaypoint.UID_PREFIX}_${arg3 as string}`;
      this.leg = arg2 as LegDefinition;
      this.ident = arg4;
    }
  }
}

/**
 * A VNAV waypoint.
 */
export class VNavWaypoint extends AbstractWaypoint {
  private static readonly vec3Cache = [new Float64Array(3)];
  private static readonly geoPointCache = [new GeoPoint(0, 0)];
  private static readonly geoCircleCache = [new GeoCircle(new Float64Array(3), 0)];

  private readonly _location: GeoPointSubject;
  private readonly _uid: string;

  /** @inheritdoc */
  public get type(): string { return WaypointTypes.VNAV; }

  /** @inheritdoc */
  public get location(): Subscribable<GeoPointInterface> {
    return this._location;
  }

  /** @inheritdoc */
  public get uid(): string {
    return this._uid;
  }

  /**
   * Constructor.
   * @param leg The leg that the VNAV waypoint is contained in.
   * @param distanceFromEnd The distance along the flight path from the end of the leg to the location of the waypoint,
   * in meters.
   * @param uid A unique ID to assign to the VNAV waypoint.
   * @param ident This waypoint's ident string.
   */
  constructor(leg: LegDefinition, distanceFromEnd: number, uid: string, public readonly ident: string) {
    super();

    this._uid = uid;
    this._location = GeoPointSubject.create(this.getWaypointLocation(leg, distanceFromEnd, new GeoPoint(0, 0)));
  }

  /**
   * Sets this waypoint's location.
   * @param leg The leg that the waypoint resides in.
   * @param distanceFromEnd The distance along the flight path from the end of the leg to the location of the waypoint,
   * in meters.
   */
  public setLocation(leg: LegDefinition, distanceFromEnd: number): void {
    this._location.set(this.getWaypointLocation(leg, distanceFromEnd, VNavWaypoint.geoPointCache[0]));
  }

  /**
   * Gets the waypoint's location in space.
   * @param leg The leg that the waypoint resides in.
   * @param distanceFromEnd The distance along the flight path from the end of the leg to the location of the waypoint,
   * in meters.
   * @param out The GeoPoint object to which to write the location.
   * @returns The waypoint's location.
   */
  private getWaypointLocation(leg: LegDefinition, distanceFromEnd: number, out: GeoPoint): GeoPoint {
    if (leg.calculated !== undefined) {
      const vectors = [...leg.calculated.ingress, ...leg.calculated.ingressToEgress, ...leg.calculated.egress];
      let vectorIndex = vectors.length - 1;

      while (vectorIndex >= 0) {
        const vector = vectors[vectorIndex];
        const vectorDistance = vector.distance;

        if (vectorDistance >= distanceFromEnd) {
          const end = GeoPoint.sphericalToCartesian(vector.endLat, vector.endLon, VNavWaypoint.vec3Cache[0]);

          return FlightPathUtils.setGeoCircleFromVector(vector, VNavWaypoint.geoCircleCache[0])
            .offsetDistanceAlong(end, UnitType.METER.convertTo(-distanceFromEnd, UnitType.GA_RADIAN), out, Math.PI);
        } else {
          distanceFromEnd -= vectorDistance;
        }

        vectorIndex--;
      }

      if (vectors.length > 0) {
        out.set(vectors[0].startLat, vectors[0].startLon);
      } else {
        out.set(leg.calculated.endLat ?? 0, leg.calculated.endLon ?? 0);
      }
    }

    return out;
  }
}
