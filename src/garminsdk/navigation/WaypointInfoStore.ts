/**
 * A store for commonly used waypoint info.
 */
import {
  AirportUtils, BasicNavAngleSubject, BasicNavAngleUnit, Facility, FacilityType, FacilityUtils, FacilityWaypointUtils,
  GeoPoint, GeoPointInterface, GeoPointSubject, ICAO, NavAngleUnit, NavAngleUnitFamily, NavMath,
  NumberUnitInterface, NumberUnitSubject, Subject, Subscribable, SubscribableUtils, Subscription, UnitFamily, UnitType,
  Waypoint,
} from '@microsoft/msfs-sdk';

import { Regions } from './Regions';

/**
 * A store for commonly used waypoint info.
 */
export class WaypointInfoStore {
  private static readonly NULL_LOCATION = new GeoPoint(NaN, NaN);

  /** This store's current waypoint. */
  public readonly waypoint = Subject.create<Waypoint | null>(null);

  private readonly facility = Subject.create<Facility | null>(null);

  private readonly _location = GeoPointSubject.create(WaypointInfoStore.NULL_LOCATION.copy());
  // eslint-disable-next-line jsdoc/require-returns
  /** The location of this store's current waypoint. */
  public get location(): Subscribable<GeoPointInterface> {
    return this._location;
  }

  private readonly _name = this.facility.map(facility => {
    if (facility?.name) {
      return Utils.Translate(facility.name);
    }

    return undefined;
  });
  /** The name of this store's current waypoint, or `undefined` if there is no such value. */
  public readonly name = this._name as Subscribable<string | undefined>;

  private readonly _region = this.facility.map(facility => {
    if (facility === null) {
      return undefined;
    }

    if (FacilityUtils.isFacilityType(facility, FacilityType.Airport)) {
      let text = AirportUtils.tryGetRegionCode(facility);

      if (text !== undefined) {
        text = Regions.getName(text);
      } else if (facility.city !== '') {
        // If we've failed to get a region code for the airport, we will fall back to using the city name if available.
        text = facility.city.split(', ').map(name => Utils.Translate(name)).join(', ');
      }

      return text;
    } else {
      const region = Regions.getName(ICAO.getRegionCode(facility.icao));
      if (region !== '') {
        return region;
      }
    }
  });
  /** The region of this store's current waypoint, or `undefined` if there is no such value. */
  public readonly region = this._region as Subscribable<string | undefined>;

  private readonly _city = this.facility.map(facility => {
    if (facility?.city) {
      return facility.city.split(', ').map(name => Utils.Translate(name)).join(', ');
    }

    return undefined;
  });
  /** The city associated with this store's current waypoint, or `undefined` if there is no such value. */
  public readonly city = this._city as Subscribable<string | undefined>;

  private readonly _distance = NumberUnitSubject.create(UnitType.NMILE.createNumber(NaN));
  // eslint-disable-next-line jsdoc/require-returns
  /** The distance from the airplane to this store's current waypoint. */
  public get distance(): Subscribable<NumberUnitInterface<UnitFamily.Distance>> {
    return this._distance;
  }

  private readonly _bearing = BasicNavAngleSubject.create(BasicNavAngleUnit.create(false).createNumber(NaN));
  // eslint-disable-next-line jsdoc/require-returns
  /** The true bearing from the airplane to this store's current waypoint. */
  public get bearing(): Subscribable<NumberUnitInterface<NavAngleUnitFamily, NavAngleUnit>> {
    return this._bearing;
  }

  private waypointPipe?: Subscription;
  private waypointSub?: Subscription;
  private pposSub?: Subscription;
  private locationSub?: Subscription;
  private facilityPipe?: Subscription;

  /**
   * Constructor.
   * @param waypoint A subscribable which provides this store's waypoint, or an initial value to set this store's
   * waypoint. If not defined, this store's waypoint can still be set via its `.waypoint` property.
   * @param planePos A subscribable which provides the current airplane position for this store. If not defined, then
   * this store will not provide distance- or bearing-to-waypoint information.
   */
  constructor(
    waypoint?: Waypoint | null | Subscribable<Waypoint | null>,
    private readonly planePos?: Subscribable<GeoPointInterface>
  ) {
    if (SubscribableUtils.isSubscribable(waypoint)) {
      this.waypointPipe = waypoint.pipe(this.waypoint);
    } else {
      this.waypoint.set(waypoint ?? null);
    }

    this.waypointSub = this.waypoint.sub(this.onWaypointChanged.bind(this), true);
    this.pposSub = planePos?.sub(this.onPlanePosChanged.bind(this), true);
  }

  /**
   * A callback which is called when this store's waypoint changes.
   * @param waypoint The new waypoint.
   */
  private onWaypointChanged(waypoint: Waypoint | null): void {
    this.locationSub?.destroy();
    this.locationSub = undefined;

    this.facilityPipe?.destroy();
    this.facilityPipe = undefined;

    const planePos = this.planePos?.get() ?? WaypointInfoStore.NULL_LOCATION;
    this.updateLocation(waypoint);
    this.updateDistance(waypoint, planePos);
    this.updateBearing(waypoint, planePos);

    if (waypoint !== null) {
      this.locationSub = waypoint.location.sub(() => {
        const planePos2 = this.planePos?.get() ?? WaypointInfoStore.NULL_LOCATION;

        this.updateLocation(waypoint);
        this.updateDistance(waypoint, planePos2);
        this.updateBearing(waypoint, planePos2);
      });

      if (FacilityWaypointUtils.isFacilityWaypoint(waypoint)) {
        this.facilityPipe = waypoint.facility.pipe(this.facility);
      } else {
        this.facility.set(null);
      }
    } else {
      this.facility.set(null);
    }
  }

  /**
   * A callback which is called when this store's plane position changes.
   * @param planePos The new plane position.
   */
  private onPlanePosChanged(planePos: GeoPointInterface): void {
    const waypoint = this.waypoint.get();
    if (waypoint) {
      this.updateDistance(waypoint, planePos);
      this.updateBearing(waypoint, planePos);
    }
  }

  /**
   * Updates this store's location information.
   * @param waypoint The store's current waypoint.
   */
  private updateLocation(waypoint: Waypoint | null): void {
    this._location.set(waypoint?.location.get() ?? WaypointInfoStore.NULL_LOCATION);
  }

  /**
   * Updates this store's distance-to-waypoint information.
   * @param waypoint The store's current waypoint.
   * @param planePos The current position of the airplane.
   */
  private updateDistance(waypoint: Waypoint | null, planePos: GeoPointInterface): void {
    if (!waypoint || isNaN(planePos.lat) || isNaN(planePos.lon)) {
      this._distance.set(NaN);
      return;
    }

    this._distance.set(waypoint.location.get().distance(planePos), UnitType.GA_RADIAN);
  }

  /**
   * Updates this store's bearing-to-waypoint information.
   * @param waypoint The store's current waypoint.
   * @param planePos The current position of the airplane.
   */
  private updateBearing(waypoint: Waypoint | null, planePos: GeoPointInterface): void {
    if (!waypoint || isNaN(planePos.lat) || isNaN(planePos.lon)) {
      this._bearing.set(NaN);
      return;
    }

    const brg = NavMath.normalizeHeading(planePos.bearingTo(waypoint.location.get()));
    this._bearing.set(brg, planePos.lat, planePos.lon);
  }

  /**
   * Destroys this store.
   */
  public destroy(): void {
    this.waypointPipe?.destroy();
    this.waypointSub?.destroy();
    this.pposSub?.destroy();
  }
}