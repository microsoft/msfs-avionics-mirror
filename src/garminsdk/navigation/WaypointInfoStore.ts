import {
  BasicNavAngleSubject, BasicNavAngleUnit, Facility, FacilityWaypointUtils, GeoPoint, GeoPointInterface,
  GeoPointSubject, NavAngleUnit, NavAngleUnitFamily, NumberUnitInterface, NumberUnitSubject, Subject, Subscribable,
  SubscribableUtils, Subscription, UnitFamily, UnitType, Waypoint
} from '@microsoft/msfs-sdk';

import { Regions } from './Regions';

/**
 * Configuration options for {@link WaypointInfoStore}.
 */
export type WaypointInfoStoreOptions = {
  /**
   * Whether to fall back to using an airport's city name for region text if the airport's region cannot be found.
   * Defaults to `true`.
   * @deprecated This option has no effect. Airport region is now always available.
   */
  useRegionFallbackForAirport?: boolean;
};

/**
 * A store for commonly used waypoint info.
 */
export class WaypointInfoStore {
  private static readonly NULL_LOCATION = new GeoPoint(NaN, NaN);

  /** This store's current waypoint. */
  public readonly waypoint = Subject.create<Waypoint | null>(null);

  private readonly _facility = Subject.create<Facility | null>(null);
  /** The facility associated with this store's current waypoint. */
  public readonly facility = this._facility as Subscribable<Facility | null>;

  private readonly _location = GeoPointSubject.create(WaypointInfoStore.NULL_LOCATION.copy());
  // eslint-disable-next-line jsdoc/require-returns
  /** The location of this store's current waypoint. */
  public get location(): Subscribable<GeoPointInterface> {
    return this._location;
  }

  /** The name of this store's current waypoint, or `undefined` if there is no such value. */
  public readonly name = this._facility.map(facility => {
    if (facility?.name) {
      return Utils.Translate(facility.name);
    }

    return undefined;
  }) as Subscribable<string | undefined>;

  /** The region of this store's current waypoint, or `undefined` if there is no such value. */
  public readonly region: Subscribable<string | undefined>;

  /** The city associated with this store's current waypoint, or `undefined` if there is no such value. */
  public readonly city = this._facility.map(facility => {
    if (facility?.city) {
      return facility.city.split(', ').map(name => Utils.Translate(name)).join(', ');
    }

    return undefined;
  }) as Subscribable<string | undefined>;

  private readonly _distance = NumberUnitSubject.create(UnitType.NMILE.createNumber(NaN));
  // eslint-disable-next-line jsdoc/require-returns
  /** The distance from the airplane to this store's current waypoint. */
  public get distance(): Subscribable<NumberUnitInterface<UnitFamily.Distance>> {
    return this._distance;
  }

  private readonly _bearing = BasicNavAngleSubject.create(BasicNavAngleUnit.create(false).createNumber(NaN));
  // eslint-disable-next-line jsdoc/require-returns
  /** The true bearing, in degrees, from the airplane to this store's current waypoint. */
  public get bearing(): Subscribable<NumberUnitInterface<NavAngleUnitFamily, NavAngleUnit>> {
    return this._bearing;
  }

  private readonly _radial = BasicNavAngleSubject.create(BasicNavAngleUnit.create(false).createNumber(NaN));
  // eslint-disable-next-line jsdoc/require-returns
  /** The radial relative to true north, in degrees, from this store's current waypoint along which the airplane lies. */
  public get radial(): Subscribable<NumberUnitInterface<NavAngleUnitFamily, NavAngleUnit>> {
    return this._radial;
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
   * @param options Options with which to configure the store.
   */
  constructor(
    waypoint?: Waypoint | null | Subscribable<Waypoint | null>,
    private readonly planePos?: Subscribable<GeoPointInterface>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options?: Readonly<WaypointInfoStoreOptions>
  ) {
    this.region = this._facility.map(this.getFacilityRegion.bind(this));

    if (SubscribableUtils.isSubscribable(waypoint)) {
      this.waypointPipe = waypoint.pipe(this.waypoint);
    } else {
      this.waypoint.set(waypoint ?? null);
    }

    this.waypointSub = this.waypoint.sub(this.onWaypointChanged.bind(this), true);
    this.pposSub = planePos?.sub(this.onPlanePosChanged.bind(this), true);
  }

  /**
   * Gets the region text for a facility.
   * @param facility The facility for which to get region text.
   * @returns The region text for the specified facility, or `undefined` if the region text could not be retrieved.
   */
  private getFacilityRegion(facility: Facility | null): string | undefined {
    if (facility === null) {
      return undefined;
    }

    const region = Regions.getName(facility.region);
    return region === '' ? undefined : region;
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
    this.updateBearingRadial(waypoint, planePos);

    if (waypoint !== null) {
      this.locationSub = waypoint.location.sub(() => {
        const planePos2 = this.planePos?.get() ?? WaypointInfoStore.NULL_LOCATION;

        this.updateLocation(waypoint);
        this.updateDistance(waypoint, planePos2);
        this.updateBearingRadial(waypoint, planePos2);
      });

      if (FacilityWaypointUtils.isFacilityWaypoint(waypoint)) {
        this.facilityPipe = waypoint.facility.pipe(this._facility);
      } else {
        this._facility.set(null);
      }
    } else {
      this._facility.set(null);
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
      this.updateBearingRadial(waypoint, planePos);
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
  private updateBearingRadial(waypoint: Waypoint | null, planePos: GeoPointInterface): void {
    if (!waypoint || isNaN(planePos.lat) || isNaN(planePos.lon)) {
      this._bearing.set(NaN);
      this._radial.set(NaN);
      return;
    }

    const waypointPos = waypoint.location.get();
    this._bearing.set(planePos.bearingTo(waypointPos), planePos.lat, planePos.lon);
    this._radial.set(waypointPos.bearingTo(planePos), waypointPos.lat, waypointPos.lon);
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