import {
  AdaptiveNearestContext, AdaptiveNearestSubscription, AirportFacility, BitFlags, ConsumerSubject, EventBus,
  FacilityFrequencyType, FacilityLoader, FacilityType, FacilityTypeMap, GeoPoint, GeoPointSubject, IntersectionFacility,
  IntersectionType, MappedSubject, NdbFacility, NearestAirportSubscription, NearestSubscription, RadioUtils,
  ReadonlySubEvent, RunwayUtils, SubEvent, Subscribable, SubscribableUtils, Subscription, UnitType, UserFacility,
  VorClass, VorFacility, VorType
} from '@microsoft/msfs-sdk';

import { ComRadioSpacingSettingMode, ComRadioUserSettings, FmsPositionMode, FmsPositionSystemEvents, NearestAirportUserSettings } from '@microsoft/msfs-garminsdk';

/**
 * A G3000 nearest facilities context. Maintains search subscriptions for the nearest airports, VORs, NDBs,
 * intersections, and user waypoints to the airplane's position.
 */
export class G3000NearestContext {
  private static INSTANCE?: G3000NearestContext;

  private static readonly instancePromiseResolves: ((value: G3000NearestContext) => void)[] = [];

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

  /** The nearest airports with weather information. */
  public readonly weather: NearestSubscription<AirportFacility>;

  public readonly _updateEvent = new SubEvent<G3000NearestContext, void>();
  /** A subscribable event which fires when this context is updated. */
  public readonly updateEvent = this._updateEvent as ReadonlySubEvent<G3000NearestContext, void>;

  private readonly fmsPosIndex: Subscribable<number>;

  private readonly nearestAirportSettingManager = NearestAirportUserSettings.getManager(this.bus);
  private readonly comRadioSettingManager = ComRadioUserSettings.getManager(this.bus);

  private readonly nearestAirportFilterState = MappedSubject.create(
    this.nearestAirportSettingManager.getSetting('nearestAptRunwayLength'),
    this.nearestAirportSettingManager.getSetting('nearestAptRunwaySurfaceTypes')
  );

  private readonly fmsPosMode = ConsumerSubject.create(null, FmsPositionMode.None);

  private pposSub?: Subscription;

  /**
   * Constructor.
   * @param facilityLoader A facility loader.
   * @param bus The event bus.
   * @param context This context's child {@link AdaptiveNearestContext}.
   * @param fmsPosIndex The index of the FMS geo-positioning system used by this context to get the airplane's
   * position.
   * @param ppos A GeoPointSubject to update with the airplane's position.
   */
  private constructor(
    facilityLoader: FacilityLoader,
    private readonly bus: EventBus,
    private readonly context: AdaptiveNearestContext,
    fmsPosIndex: number | Subscribable<number>,
    private readonly ppos: GeoPointSubject
  ) {
    this.fmsPosIndex = SubscribableUtils.toSubscribable(fmsPosIndex, true);

    const sub = this.bus.getSubscriber<FmsPositionSystemEvents>();

    this.fmsPosIndex.sub(index => {
      this.pposSub?.destroy();
      this.fmsPosMode.setConsumer(sub.on(`fms_pos_mode_${index}`));
      this.pposSub = sub.on(`fms_pos_gps-position_${index}`).handle(lla => { this.ppos.set(lla.lat, lla.long); });
    }, true);

    this.weather = new AdaptiveNearestSubscription(new NearestAirportSubscription(facilityLoader), 200);
    this.weather.start();

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
      this.context.intersections.awaitStart(),
      this.weather.awaitStart()
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

    this.comRadioSettingManager.getSetting('comRadioSpacing').sub(mode => {
      const checkFunc = mode === ComRadioSpacingSettingMode.Spacing8_33Khz ? undefined : RadioUtils.isCom25Frequency;

      (this.weather as AdaptiveNearestSubscription<NearestAirportSubscription>).innerSubscription.setFilterCb(facility => {
        for (let i = 0; i < facility.frequencies.length; i++) {
          const frequency = facility.frequencies[i];
          const type = frequency.type;
          if (
            (type === FacilityFrequencyType.ATIS || type === FacilityFrequencyType.ASOS || type === FacilityFrequencyType.AWOS)
            && (checkFunc === undefined || checkFunc(frequency.freqMHz))
          ) {
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

    const ppos = this.ppos.get();

    await Promise.all([
      this.context.update(),
      this.weather.update(ppos.lat, ppos.lon, UnitType.NMILE.convertTo(200, UnitType.METER), 25)
    ]);
    this._updateEvent.notify(this);
  }

  /**
   * Gets the G3000NearestContext instance on the local instrument.
   * @returns A Promise which will be fulfilled with the G3000NearestContext instance on the local instrument once
   * it is initialized.
   */
  public static getInstance(): Promise<G3000NearestContext> {
    if (G3000NearestContext.INSTANCE !== undefined) {
      return Promise.resolve(G3000NearestContext.INSTANCE);
    }

    return new Promise(resolve => { this.instancePromiseResolves.push(resolve); });
  }

  /**
   * Initializes and returns the G3000NearestContext instance on the local instrument. If the instance is already
   * initialized, this method returns the instance without performing any other actions.
   * @param facilityLoader A facility loader.
   * @param bus The event bus.
   * @param fmsPosIndex The index of the FMS geo-positioning system used by the context to get the airplane's position.
   * @returns The initialized G3000NearestContext instance on the local instrument.
   */
  public static initializeInstance(facilityLoader: FacilityLoader, bus: EventBus, fmsPosIndex: number | Subscribable<number>): G3000NearestContext {
    if (G3000NearestContext.INSTANCE !== undefined) {
      return G3000NearestContext.INSTANCE;
    }

    const ppos = GeoPointSubject.create(new GeoPoint(0, 0));

    AdaptiveNearestContext.initialize(facilityLoader, bus, ppos);

    const instance = G3000NearestContext.INSTANCE = new G3000NearestContext(facilityLoader, bus, AdaptiveNearestContext.getInstance(), fmsPosIndex, ppos);

    this.instancePromiseResolves.forEach(resolve => { resolve(instance); });
    this.instancePromiseResolves.length = 0;

    return instance;
  }
}