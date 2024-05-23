import {
  AdaptiveNearestContext, AirportFacility, BitFlags, ConsumerSubject, EventBus, FacilityLoader, FacilityType,
  FacilityTypeMap, IntersectionFacility, IntersectionType, MappedSubject, NdbFacility, NearestSubscription,
  ReadonlySubEvent, RunwayUtils, SubEvent, Subscribable, SubscribableUtils, UnitType, UserFacility, VorClass,
  VorFacility, VorType
} from '@microsoft/msfs-sdk';

import { FmsPositionMode, FmsPositionSystemEvents } from '@microsoft/msfs-garminsdk';

import { G3XNearestAirportUserSettings } from '../Settings/G3XNearestAirportUserSettings';

/**
 * A G3X Touch nearest facilities context. Maintains search subscriptions for the nearest airports, VORs, NDBs,
 * intersections, and user waypoints to the airplane's position.
 */
export class G3XNearestContext {
  private static INSTANCE?: G3XNearestContext;

  private static instancePromiseResolve: (value: G3XNearestContext) => void;
  private static readonly instancePromise = new Promise<G3XNearestContext>(resolve => {
    G3XNearestContext.instancePromiseResolve = resolve;
  });

  /** The nearest airports. */
  public readonly airports = this.context.airports as NearestSubscription<AirportFacility>;

  /** The nearest VOR stations. */
  public readonly vors = this.context.vors as NearestSubscription<VorFacility>;

  /** The nearest intersections. */
  public readonly intersections = this.context.intersections as NearestSubscription<IntersectionFacility>;

  /** The nearest NDB stations. */
  public readonly ndbs = this.context.ndbs as NearestSubscription<NdbFacility>;

  /** The nearest USR facilities. */
  public readonly usrs = this.context.usrs as NearestSubscription<UserFacility>;

  private readonly _updateEvent = new SubEvent<G3XNearestContext, void>();
  /** A subscribable event which fires when this context is updated. */
  public readonly updateEvent = this._updateEvent as ReadonlySubEvent<G3XNearestContext, void>;

  private readonly fmsPosIndex: Subscribable<number>;

  private readonly nearestAirportSettingManager = G3XNearestAirportUserSettings.getManager(this.bus);

  private readonly nearestAirportFilterState = MappedSubject.create(
    this.nearestAirportSettingManager.getSetting('nearestAptRunwayLength'),
    this.nearestAirportSettingManager.getSetting('nearestAptRunwaySurfaceTypes')
  );

  private readonly fmsPosMode = ConsumerSubject.create(null, FmsPositionMode.None);

  /**
   * Creates a new instance of G3XNearestContext.
   * @param bus The event bus.
   * @param context This context's child {@link AdaptiveNearestContext}.
   * @param fmsPosIndex The index of the FMS geo-positioning system used by this context to get the airplane's
   * position.
   */
  private constructor(
    private readonly bus: EventBus,
    private readonly context: AdaptiveNearestContext,
    fmsPosIndex: number | Subscribable<number>
  ) {
    this.fmsPosIndex = SubscribableUtils.toSubscribable(fmsPosIndex, true);

    const sub = this.bus.getSubscriber<FmsPositionSystemEvents>();

    this.fmsPosIndex.sub(index => {
      this.fmsPosMode.setConsumer(sub.on(`fms_pos_mode_${index}`));
    }, true);

    context.maxAirports = 25;
    context.maxVors = 25;
    context.maxIntersections = 25;
    context.maxNdbs = 25;
    context.maxUsrs = 25;

    context.maxAirportsAbsolute = 200;
    context.maxVorsAbsolute = 25;
    context.maxIntersectionsAbsolute = 200;
    context.maxNdbsAbsolute = 25;
    context.maxUsrsAbsolute = 25;

    context.airportRadius = 200;
    context.vorRadius = 200;
    context.intersectionRadius = 200;
    context.ndbRadius = 200;
    context.usrRadius = 200;

    this.initFilters();
  }

  /**
   * Initializes the filters on this context's searches.
   */
  private async initFilters(): Promise<void> {
    await Promise.all([
      this.context.airports.awaitStart(),
      this.context.vors.awaitStart(),
      this.context.intersections.awaitStart()
    ]);

    this.context.vors.innerSubscription.setVorFilter(
      BitFlags.union(
        BitFlags.createFlag(VorClass.LowAlt),
        BitFlags.createFlag(VorClass.HighAlt),
        BitFlags.createFlag(VorClass.Terminal)
      ),
      BitFlags.union(
        BitFlags.createFlag(VorType.VOR),
        BitFlags.createFlag(VorType.VORDME),
        BitFlags.createFlag(VorType.TACAN),
        BitFlags.createFlag(VorType.VORTAC)
      )
    );

    this.nearestAirportFilterState.sub(([runwayLength, runwaySurfaceCategories]) => {
      const minLengthMeters = UnitType.FOOT.convertTo(runwayLength - 0.1, UnitType.METER);

      this.context.airports.innerSubscription.setExtendedFilters(~0, ~0, ~0, minLengthMeters);
      this.context.airports.innerSubscription.setFilterCb(facility => {
        for (let i = 0; i < facility.runways.length; i++) {
          const runway = facility.runways[i];
          if (BitFlags.isAny(RunwayUtils.getSurfaceCategory(runway), runwaySurfaceCategories) && runway.length >= minLengthMeters) {
            return true;
          }
        }

        return false;
      });
    }, true);

    this.context.intersections.innerSubscription.setFilter(BitFlags.union(
      BitFlags.createFlag(IntersectionType.None),
      BitFlags.createFlag(IntersectionType.Named),
      BitFlags.createFlag(IntersectionType.Unnamed),
      BitFlags.createFlag(IntersectionType.Offroute),
      BitFlags.createFlag(IntersectionType.IAF),
      BitFlags.createFlag(IntersectionType.FAF),
      BitFlags.createFlag(IntersectionType.RNAV)
    ), true);
    this.context.intersections.innerSubscription.setFilterDupTerminal(true);
  }

  /**
   * Gets the airport region letter to use for the first character in waypoint inputs.
   * @returns The airport region letter.
   */
  public getRegionLetter(): string | undefined {
    return this.context.getRegionLetter();
  }

  /**
   * Gets the nearest facility for a given type.
   * @param facilityType The type of facility.
   * @returns The nearest facility for a given type.
   */
  public getNearest<T extends FacilityType>(facilityType: T): FacilityTypeMap[T] | undefined {
    return this.context.getNearest(facilityType);
  }

  /**
   * Updates this context.
   */
  public async update(): Promise<void> {
    if (this.fmsPosMode.get() === FmsPositionMode.None) {
      return;
    }

    await this.context.update();
    this._updateEvent.notify(this);
  }

  /**
   * Gets the `G3XNearestContext` instance on the local instrument.
   * @returns A Promise which will be fulfilled with the `G3XNearestContext` instance on the local instrument once it
   * is initialized.
   */
  public static getInstance(): Promise<G3XNearestContext> {
    return this.instancePromise;
  }

  /**
   * Initializes and returns the `G3XNearestContext` instance on the local instrument. If the instance is already
   * initialized, this method returns the instance without performing any other actions.
   * @param facilityLoader A facility loader.
   * @param bus The event bus.
   * @param fmsPosIndex The index of the FMS geo-positioning system used by the context to get the airplane's position.
   * @returns The initialized `G3XNearestContext` instance on the local instrument.
   */
  public static initializeInstance(facilityLoader: FacilityLoader, bus: EventBus, fmsPosIndex: number | Subscribable<number>): G3XNearestContext {
    if (G3XNearestContext.INSTANCE !== undefined) {
      return G3XNearestContext.INSTANCE;
    }

    AdaptiveNearestContext.initialize(facilityLoader, bus);

    const instance = G3XNearestContext.INSTANCE = new G3XNearestContext(bus, AdaptiveNearestContext.getInstance(), fmsPosIndex);

    this.instancePromiseResolve(instance);

    return instance;
  }
}