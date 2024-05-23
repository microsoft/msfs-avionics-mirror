import { EventBus } from '../data';
import { GeoPoint, GeoPointInterface } from '../geo';
import { GNSSEvents } from '../instruments';
import { UnitType } from '../math';
import { SubEvent, Subject, Subscribable, Subscription } from '../sub';
import { AirportUtils } from './AirportUtils';
import { FacilityType, FacilityTypeMap, Facility } from './Facilities';
import { FacilityLoader } from './FacilityLoader';
import {
  AdaptiveNearestSubscription, NearestAirportSubscription, NearestIntersectionSubscription, NearestNdbSubscription,
  NearestUsrSubscription, NearestVorSubscription
} from './NearestSubscription';

/**
 * A singleton context of all nearest facility information.
 */
export class NearestContext {

  /** The nearest airports. */
  public readonly airports: NearestAirportSubscription;

  /** The nearest VOR stations. */
  public readonly vors: NearestVorSubscription;

  /** The nearest intersections. */
  public readonly intersections: NearestIntersectionSubscription;

  /** The nearest NDB stations. */
  public readonly ndbs: NearestNdbSubscription;

  /** The nearest USR facilities. */
  public readonly usrs: NearestUsrSubscription;

  /** The max number of airports in the context.*/
  public maxAirports = 25;

  /** The max number of VORs in the context. */
  public maxVors = 25;

  /** The max number of intersections in the context. */
  public maxIntersections = 25;

  /** The max number of NDBs in the context. */
  public maxNdbs = 25;

  /** The max number of user facilities in the context. */
  public maxUsrs = 25;

  /** The search radius for airports, in nautical miles. */
  public airportRadius = 50;

  /** The search radius for VORs, in nautical miles. */
  public vorRadius = 150;

  /** The search radius for intersections, in nautical miles. */
  public intersectionRadius = 10;

  /** The search radius for NDBs, in nautical miles. */
  public ndbRadius = 150;

  /** The search radius for user facilities, in nautical miles */
  public usrRadius = 150;

  private static instance?: NearestContext;
  private readonly position = new GeoPoint(0, 0);

  private static readonly initializedSubEvent = new SubEvent<null, NearestContext>();

  /**
   * Gets an instance of the NearestContext.
   * @returns An instance of the NearestContext.
   * @throws An error if the NearestContext has not yet been initailized.
   */
  public static getInstance(): NearestContext {
    if (this.instance !== undefined) {
      return this.instance;
    }

    throw new Error('NearestContext was not initialized.');
  }

  /**
   * Initialized the NearestContext instance.
   * @param facilityLoader The facility loader to use for the instance.
   * @param bus The EventBus to use with this instance.
   * @param planePos A subscribable which provides the current position of the airplane. If not defined, the context
   * will automatically retrieve the position from the event bus.
   * @throws An error if the NearestContext is already initialized.
   */
  public static initialize(facilityLoader: FacilityLoader, bus: EventBus, planePos?: Subscribable<GeoPointInterface>): void {
    if (this.instance === undefined) {
      this.instance = new NearestContext(facilityLoader, bus, planePos);
      this.initializedSubEvent.notify(null, this.instance);
    } else {
      throw new Error('NearestContext was already initialized.');
    }
  }

  /**
   * Subscribes to this NearestContext being initialized, or invokes the handler immediately if it is already initialized
   *
   * @param handler the handler
   *
   * @returns the subscription, if the action was not immediately performed
   */
  public static onInitialized(handler: (instance: NearestContext) => void): Subscription | null {
    if (this.instance) {
      handler(this.instance);
      return null;
    } else {
      return this.initializedSubEvent.on((_, instance) => handler(instance));
    }
  }

  /**
   * Whether the NearestContext is initialized.
   * @returns true if initialized.
   */
  public static get isInitialized(): boolean {
    return NearestContext.instance !== undefined;
  }

  /**
   * Creates an instance of a NearestContext.
   * @param facilityLoader The facility loader to use for this instance.
   * @param bus An instance of the EventBus.
   * @param planePos A subscribable which provides the current position of the airplane. If not defined, the context
   * will automatically retrieve the position from the event bus.
   */
  private constructor(
    private readonly facilityLoader: FacilityLoader,
    private readonly bus: EventBus,
    planePos?: Subscribable<GeoPointInterface>
  ) {
    this.airports = new NearestAirportSubscription(facilityLoader);
    this.vors = new NearestVorSubscription(facilityLoader);
    this.intersections = new NearestIntersectionSubscription(facilityLoader);
    this.ndbs = new NearestNdbSubscription(facilityLoader);
    this.usrs = new NearestUsrSubscription(facilityLoader);

    if (planePos) {
      planePos.sub(pos => this.position.set(pos), true);
    } else {
      this.bus.getSubscriber<GNSSEvents>().on('gps-position')
        .handle(pos => this.position.set(pos.lat, pos.long));
    }

    this.airports.start();
    this.vors.start();
    this.intersections.start();
    this.ndbs.start();
    this.usrs.start();
  }

  /**
   * Updates the NearestContext.
   */
  public async update(): Promise<void> {
    await Promise.all([
      this.airports.update(this.position.lat, this.position.lon, UnitType.NMILE.convertTo(this.airportRadius, UnitType.METER), this.maxAirports),
      this.intersections.update(this.position.lat, this.position.lon, UnitType.NMILE.convertTo(this.intersectionRadius, UnitType.METER), this.maxIntersections),
      this.vors.update(this.position.lat, this.position.lon, UnitType.NMILE.convertTo(this.vorRadius, UnitType.METER), this.maxVors),
      this.ndbs.update(this.position.lat, this.position.lon, UnitType.NMILE.convertTo(this.ndbRadius, UnitType.METER), this.maxNdbs),
      this.usrs.update(this.position.lat, this.position.lon, UnitType.NMILE.convertTo(this.usrRadius, UnitType.METER), this.maxUsrs),
    ]);
  }

  /**
   * Get the local ICAO region code based on nearby facility data.
   * @returns The region code.
   */
  public getRegionCode(): string | undefined {
    const nearest = Array.from(this.airports.getArray()).sort(this.orderByPPosDistance.bind(this));

    for (let i = 0; i < nearest.length; i++) {
      const region = AirportUtils.tryGetRegionCode(nearest[i]);
      if (region !== undefined) {
        return region;
      }
    }

    return undefined;
  }

  /**
   * Get the variant of the region code used in airport idents.   Generally this will
   * be the region code except for the case of the US, where it will just be 'K'.
   * @returns The region code or just 'K' for the US.
   */
  public getRegionIdent(): string | undefined {
    const region = this.getRegionCode();
    if (region !== undefined) {
      return region[0] === 'K' ? 'K' : region;
    }
    return undefined;
  }

  /**
   * Gets the first letter of the local ICAO region code.
   * @returns The airport region letter.
   */
  public getRegionLetter(): string | undefined {
    const region = this.getRegionCode();
    return region !== undefined ? region[0] : undefined;
  }


  /**
   * Gets the nearest facility for a given type.
   * @param facilityType The type of facility.
   * @returns The nearest facility for a given type.
   */
  public getNearest<T extends FacilityType>(facilityType: T): FacilityTypeMap[T] | undefined {
    switch (facilityType) {
      case FacilityType.Airport:
        return this.findNearest(this.airports.getArray()) as FacilityTypeMap[T];
      case FacilityType.Intersection:
        return this.findNearest(this.intersections.getArray()) as FacilityTypeMap[T];
      case FacilityType.VOR:
        return this.findNearest(this.vors.getArray()) as FacilityTypeMap[T];
      case FacilityType.NDB:
        return this.findNearest(this.ndbs.getArray()) as FacilityTypeMap[T];
      case FacilityType.USR:
        return this.findNearest(this.usrs.getArray()) as FacilityTypeMap[T];
      default:
        return undefined;
    }
  }

  /**
   * Finds the nearest facility in an array.
   * @param array A non-empty array of facilities.
   * @returns The nearest facility in the specified array.
   */
  private findNearest(array: readonly Facility[]): Facility | undefined {
    let nearest: Facility | undefined = undefined;
    let nearestDistance = Infinity;

    for (let i = 0; i < array.length; i++) {
      const fac = array[i];
      const distance = this.position.distance(fac);

      if (distance < nearestDistance) {
        nearest = fac;
        nearestDistance = distance;
      }
    }

    return nearest;
  }

  /**
   * Orders facilities by their distance to the plane PPOS.
   * @param a The first facility.
   * @param b The second facility.
   * @returns The comparison order number.
   */
  private orderByPPosDistance(a: Facility, b: Facility): number {
    const aDist = this.position.distance(a.lat, a.lon);
    const bDist = this.position.distance(b.lat, b.lon);

    if (aDist < bDist) {
      return -1;
    }

    if (aDist > bDist) {
      return 1;
    }

    return 0;
  }
}

/**
 * A singleton context of all nearest facility information which uses adaptive searches.
 */
export class AdaptiveNearestContext {

  /** The nearest airports. */
  public readonly airports: AdaptiveNearestSubscription<NearestAirportSubscription>;

  /** The nearest VOR stations. */
  public readonly vors: AdaptiveNearestSubscription<NearestVorSubscription>;

  /** The nearest intersections. */
  public readonly intersections: AdaptiveNearestSubscription<NearestIntersectionSubscription>;

  /** The nearest NDB stations. */
  public readonly ndbs: AdaptiveNearestSubscription<NearestNdbSubscription>;

  /** The nearest USR facilities. */
  public readonly usrs: AdaptiveNearestSubscription<NearestUsrSubscription>;

  /** The maximum number of airports in the context. */
  public maxAirports = 25;

  /** The maximum number of VORs in the context. */
  public maxVors = 25;

  /** The maximum number of intersections in the context. */
  public maxIntersections = 25;

  /** The maximum number of NDBs in the context. */
  public maxNdbs = 25;

  /** The maximum number of user facilities in the context. */
  public maxUsrs = 25;

  // eslint-disable-next-line jsdoc/require-returns
  /** The maximum number of airports returned by this context's inner searches. */
  public get maxAirportsAbsolute(): number {
    return this._maxAirportsAbsolute.get();
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  public set maxAirportsAbsolute(val: number) {
    this._maxAirportsAbsolute.set(val);
  }

  // eslint-disable-next-line jsdoc/require-returns
  /** The maximum number of VORs returned by this context's inner searches. */
  public get maxVorsAbsolute(): number {
    return this._maxVorsAbsolute.get();
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  public set maxVorsAbsolute(val: number) {
    this._maxVorsAbsolute.set(val);
  }

  // eslint-disable-next-line jsdoc/require-returns
  /** The maximum number of intersections returned by this context's inner searches. */
  public get maxIntersectionsAbsolute(): number {
    return this._maxIntersectionsAbsolute.get();
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  public set maxIntersectionsAbsolute(val: number) {
    this._maxIntersectionsAbsolute.set(val);
  }

  // eslint-disable-next-line jsdoc/require-returns
  /** The maximum number of NDBs returned by this context's inner searches. */
  public get maxNdbsAbsolute(): number {
    return this._maxNdbsAbsolute.get();
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  public set maxNdbsAbsolute(val: number) {
    this._maxNdbsAbsolute.set(val);
  }

  // eslint-disable-next-line jsdoc/require-returns
  /** The maximum number of user facilities returned by this context's inner searches. */
  public get maxUsrsAbsolute(): number {
    return this._maxUsrsAbsolute.get();
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  public set maxUsrsAbsolute(val: number) {
    this._maxUsrsAbsolute.set(val);
  }

  /** The search radius for airports, in nautical miles. */
  public airportRadius = 50;

  /** The search radius for VORs, in nautical miles. */
  public vorRadius = 150;

  /** The search radius for intersections, in nautical miles. */
  public intersectionRadius = 10;

  /** The search radius for NDBs, in nautical miles. */
  public ndbRadius = 150;

  /** The search radius for user facilities, in nautical miles. */
  public usrRadius = 150;

  private static instance?: AdaptiveNearestContext;
  private readonly position = new GeoPoint(0, 0);

  private readonly _maxAirportsAbsolute = Subject.create(100);
  private readonly _maxVorsAbsolute = Subject.create(100);
  private readonly _maxIntersectionsAbsolute = Subject.create(100);
  private readonly _maxNdbsAbsolute = Subject.create(100);
  private readonly _maxUsrsAbsolute = Subject.create(100);

  private static readonly initializedSubEvent = new SubEvent<null, AdaptiveNearestContext>();

  /**
   * Gets an instance of the AdaptiveNearestContext.
   * @returns An instance of the AdaptiveNearestContext.
   * @throws An error if the AdaptiveNearestContext has not yet been initailized.
   */
  public static getInstance(): AdaptiveNearestContext {
    if (this.instance !== undefined) {
      return this.instance;
    }

    throw new Error('AdaptiveNearestContext was not initialized.');
  }

  /**
   * Initialized the AdaptiveNearestContext instance.
   * @param facilityLoader The facility loader to use for the instance.
   * @param bus The EventBus to use with this instance.
   * @param planePos A subscribable which provides the current position of the airplane. If not defined, the context
   * will automatically retrieve the position from the event bus.
   * @throws An error if the AdaptiveNearestContext is already initialized.
   */
  public static initialize(facilityLoader: FacilityLoader, bus: EventBus, planePos?: Subscribable<GeoPointInterface>): void {
    if (this.instance === undefined) {
      this.instance = new AdaptiveNearestContext(facilityLoader, bus, planePos);
      this.initializedSubEvent.notify(null, this.instance);
    } else {
      throw new Error('AdaptiveNearestContext was already initialized.');
    }
  }

  /**
   * Subscribes to this NearestContext being initialized, or invokes the handler immediately if it is already initialized
   *
   * @param handler the handler
   *
   * @returns the subscription, if the action was not immediately performed
   */
  public static onInitialized(handler: (instance: AdaptiveNearestContext) => void): Subscription | null {
    if (this.instance) {
      handler(this.instance);
      return null;
    } else {
      return this.initializedSubEvent.on((_, instance) => handler(instance));
    }
  }

  /**
   * Creates an instance of a AdaptiveNearestContext.
   * @param facilityLoader The facility loader to use for this instance.
   * @param bus An instance of the EventBus.
   * @param planePos A subscribable which provides the current position of the airplane. If not defined, the context
   * will automatically retrieve the position from the event bus.
   */
  private constructor(
    private readonly facilityLoader: FacilityLoader,
    private readonly bus: EventBus,
    planePos?: Subscribable<GeoPointInterface>
  ) {
    this.airports = new AdaptiveNearestSubscription(new NearestAirportSubscription(facilityLoader), this._maxAirportsAbsolute);
    this.vors = new AdaptiveNearestSubscription(new NearestVorSubscription(facilityLoader), this._maxVorsAbsolute);
    this.intersections = new AdaptiveNearestSubscription(new NearestIntersectionSubscription(facilityLoader), this._maxIntersectionsAbsolute);
    this.ndbs = new AdaptiveNearestSubscription(new NearestNdbSubscription(facilityLoader), this._maxNdbsAbsolute);
    this.usrs = new AdaptiveNearestSubscription(new NearestUsrSubscription(facilityLoader), this._maxUsrsAbsolute);

    if (planePos) {
      planePos.sub(pos => this.position.set(pos), true);
    } else {
      this.bus.getSubscriber<GNSSEvents>().on('gps-position')
        .handle(pos => this.position.set(pos.lat, pos.long));
    }

    this.airports.start();
    this.vors.start();
    this.intersections.start();
    this.ndbs.start();
    this.usrs.start();
  }

  /**
   * Updates this context.
   */
  public async update(): Promise<void> {
    await Promise.all([
      this.airports.update(this.position.lat, this.position.lon, UnitType.NMILE.convertTo(this.airportRadius, UnitType.METER), this.maxAirports),
      this.intersections.update(this.position.lat, this.position.lon, UnitType.NMILE.convertTo(this.intersectionRadius, UnitType.METER), this.maxIntersections),
      this.vors.update(this.position.lat, this.position.lon, UnitType.NMILE.convertTo(this.vorRadius, UnitType.METER), this.maxVors),
      this.ndbs.update(this.position.lat, this.position.lon, UnitType.NMILE.convertTo(this.ndbRadius, UnitType.METER), this.maxNdbs),
      this.usrs.update(this.position.lat, this.position.lon, UnitType.NMILE.convertTo(this.usrRadius, UnitType.METER), this.maxUsrs),
    ]);
  }

  /**
   * Gets the airport region letter to use for the first character in waypoint inputs.
   * @returns The airport region letter.
   */
  public getRegionLetter(): string | undefined {
    const nearest = Array.from(this.airports.getArray()).sort(this.orderByPPosDistance.bind(this));

    for (let i = 0; i < nearest.length; i++) {
      const region = AirportUtils.tryGetRegionCode(nearest[i]);
      if (region !== undefined) {
        return region[0];
      }
    }

    return undefined;
  }

  /**
   * Gets the nearest facility for a given type.
   * @param facilityType The type of facility.
   * @returns The nearest facility for a given type.
   */
  public getNearest<T extends FacilityType>(facilityType: T): FacilityTypeMap[T] | undefined {
    switch (facilityType) {
      case FacilityType.Airport:
        return this.findNearest(this.airports.getArray()) as FacilityTypeMap[T];
      case FacilityType.Intersection:
        return this.findNearest(this.intersections.getArray()) as FacilityTypeMap[T];
      case FacilityType.VOR:
        return this.findNearest(this.vors.getArray()) as FacilityTypeMap[T];
      case FacilityType.NDB:
        return this.findNearest(this.ndbs.getArray()) as FacilityTypeMap[T];
      case FacilityType.USR:
        return this.findNearest(this.usrs.getArray()) as FacilityTypeMap[T];
      default:
        return undefined;
    }
  }

  /**
   * Finds the nearest facility in an array.
   * @param array A non-empty array of facilities.
   * @returns The nearest facility in the specified array.
   */
  private findNearest(array: readonly Facility[]): Facility | undefined {
    let nearest: Facility | undefined = undefined;
    let nearestDistance = Infinity;

    for (let i = 0; i < array.length; i++) {
      const fac = array[i];
      const distance = this.position.distance(fac);

      if (distance < nearestDistance) {
        nearest = fac;
        nearestDistance = distance;
      }
    }

    return nearest;
  }

  /**
   * Orders facilities by their distance to the plane PPOS.
   * @param a The first facility.
   * @param b The second facility.
   * @returns The comparison order number.
   */
  private orderByPPosDistance(a: Facility, b: Facility): number {
    const aDist = this.position.distance(a.lat, a.lon);
    const bDist = this.position.distance(b.lat, b.lon);

    if (aDist < bDist) {
      return -1;
    }

    if (aDist > bDist) {
      return 1;
    }

    return 0;
  }
}
