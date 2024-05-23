import {
  AirportFacility, FacilityType, FlightPlan, FlightPlanOriginDestEvent, FlightPlanUserDataEvent, FlightPlanner, OriginDestChangeType,
  Subject, Subscribable, Subscription
} from '@microsoft/msfs-sdk';

import { FmsFplUserDataKey, FmsFplVfrApproachData, FmsUtils } from '@microsoft/msfs-garminsdk';

import { G3XFms } from './G3XFms';
import { G3XFmsFplLoadedApproachData, G3XFmsFplUserDataKey } from './G3XFmsFplUserDataTypes';
import { FlightPlanStore } from './FlightPlanStore';
import { G3XFplSource } from './G3XFplSourceTypes';

/**
 * A flight plan store containing information about the G3X's active primary flight plan. The active primary flight
 * plan is the primary flight plan of the selected flight plan source (either internal or external).
 */
export class ActiveFlightPlanStore implements FlightPlanStore {

  private activePlanner: FlightPlanner = this.fms.internalFms.flightPlanner;

  private readonly _name = Subject.create<string | null>(null);
  /** @inheritDoc */
  public readonly name = this._name as Subscribable<string | null>;

  private readonly _originAirport = Subject.create<AirportFacility | null>(null);
  /** @inheritDoc */
  public readonly originAirport = this._originAirport as Subscribable<AirportFacility | null>;

  private readonly _destinationAirport = Subject.create<AirportFacility | null>(null);
  /** @inheritDoc */
  public readonly destinationAirport = this._destinationAirport as Subscribable<AirportFacility | null>;

  private readonly _loadedVfrApproachData = Subject.create<Readonly<G3XFmsFplLoadedApproachData> | null>(null);
  /** @inheritDoc */
  public readonly loadedVfrApproachData = this._loadedVfrApproachData as Subscribable<Readonly<G3XFmsFplLoadedApproachData> | null>;

  private readonly _vfrApproachActiveStatus = Subject.create<'none' | 'active' | 'vtf'>('none');
  /** @inheritDoc */
  public readonly vfrApproachActiveStatus = this._vfrApproachActiveStatus as Subscribable<'none' | 'active' | 'vtf'>;

  private isAlive = true;
  private isInit = false;
  private isResumed = false;

  private readonly fplSubs: Subscription[] = [];

  private readonly subscriptions: Subscription[] = [];

  /**
   * Creates a new instance of ActiveFlightPlanStore.
   * @param fms The FMS.
   * @param fplSource The selected flight plan source.
   */
  public constructor(
    private readonly fms: G3XFms,
    private readonly fplSource: Subscribable<G3XFplSource>
  ) {
  }

  /**
   * Initializes this store. Once initialized, this store will continuously update its data until paused or destroyed.
   * @param paused Whether to initialize this store as paused. If `true`, then this store's data will not be
   * initialized until the first time it is resumed. Defaults to `false`.
   * @throws Error if this store has been destroyed.
   */
  public init(paused = false): void {
    if (!this.isAlive) {
      throw new Error('FlightPlanStore: cannot initialize a dead store');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    this.subscriptions.push(
      this.fplSource.sub(this.onFplSourceChanged.bind(this), true)
    );

    if (!paused) {
      this.resume();
    }
  }

  /**
   * Resumes this store. Once resumed, this store will continuously update its data until paused or destroyed.
   * @throws Error if this store has been destroyed.
   */
  public resume(): void {
    if (!this.isAlive) {
      throw new Error('FlightPlanStore: cannot resume a dead store');
    }

    if (!this.isInit || this.isResumed) {
      return;
    }

    this.isResumed = true;

    this.refreshData();

    for (const sub of this.fplSubs) {
      sub.resume();
    }
  }

  /**
   * Pauses this store. Once paused, this store will not update its data until it is resumed.
   * @throws Error if this store has been destroyed.
   */
  public pause(): void {
    if (!this.isAlive) {
      throw new Error('FlightPlanStore: cannot pause a dead store');
    }

    if (!this.isInit || !this.isResumed) {
      return;
    }

    this.isResumed = false;

    for (const sub of this.fplSubs) {
      sub.pause();
    }
  }

  /**
   * Responds to when the selected flight plan source changes.
   * @param source The new flight plan source.
   */
  private onFplSourceChanged(source: G3XFplSource): void {
    for (const sub of this.fplSubs) {
      sub.destroy();
    }
    this.fplSubs.length = 0;

    this.activePlanner = (
      source === G3XFplSource.Internal || source === G3XFplSource.InternalRev
        ? this.fms.internalFms
        : this.fms.getExternalFms(source === G3XFplSource.External1 ? 1 : 2)
    ).flightPlanner;

    if (this.isResumed) {
      this.refreshData();
    }

    this.fplSubs.push(
      this.activePlanner.onEvent('fplUserDataSet').handle(this.onUserDataChanged.bind(this), !this.isResumed),
      this.activePlanner.onEvent('fplUserDataDelete').handle(this.onUserDataChanged.bind(this), !this.isResumed),
      this.activePlanner.onEvent('fplOriginDestChanged').handle(this.onOriginDestChanged.bind(this), !this.isResumed),
    );
  }

  /**
   * Refreshes this store's data based on the current state of the active flight plan.
   */
  private refreshData(): void {
    if (!this.activePlanner.hasFlightPlan(FmsUtils.PRIMARY_PLAN_INDEX)) {
      return;
    }

    const plan = this.activePlanner.getFlightPlan(FmsUtils.PRIMARY_PLAN_INDEX);

    this._name.set(plan.getUserData<string>(FmsFplUserDataKey.Name) ?? null);

    if (plan.originAirport === undefined) {
      this._originAirport.set(null);
    } else {
      this.retrieveOriginFacility(plan.originAirport);
    }

    if (plan.destinationAirport === undefined) {
      this._destinationAirport.set(null);
    } else {
      this.retrieveDestinationFacility(plan.destinationAirport);
    }

    const fplSource = this.fplSource.get();
    if (fplSource === G3XFplSource.Internal || fplSource === G3XFplSource.InternalRev) {
      this.updateApproachData(plan);
    } else {
      this._loadedVfrApproachData.set(null);
      this._vfrApproachActiveStatus.set('none');
    }
  }

  private originFacilityOpId = 0;

  /**
   * Retrieves an origin facility.
   * @param icao The ICAO of the origin facility.
   */
  private async retrieveOriginFacility(icao: string): Promise<void> {
    const opId = ++this.originFacilityOpId;
    try {
      const facility = await this.fms.facLoader.getFacility(FacilityType.Airport, icao);

      if (opId !== this.originFacilityOpId) {
        return;
      }

      this._originAirport.set(facility);
    } catch {
      if (opId !== this.originFacilityOpId) {
        return;
      }

      this._originAirport.set(null);
    }
  }

  private destinationFacilityOpId = 0;

  /**
   * Retrieves a destination facility.
   * @param icao The ICAO of the destination facility.
   */
  private async retrieveDestinationFacility(icao: string): Promise<void> {
    const opId = ++this.destinationFacilityOpId;
    try {
      const facility = await this.fms.facLoader.getFacility(FacilityType.Airport, icao);

      if (opId !== this.destinationFacilityOpId) {
        return;
      }

      this._destinationAirport.set(facility);
    } catch {
      if (opId !== this.destinationFacilityOpId) {
        return;
      }

      this._destinationAirport.set(null);
    }
  }

  /**
   * Updates this store's approach data based on the current state of the active flight plan.
   * @param plan The active flight plan.
   */
  private updateApproachData(plan: FlightPlan): void {
    const loadedApproachData = plan.getUserData<Readonly<G3XFmsFplLoadedApproachData>>(G3XFmsFplUserDataKey.LoadedApproach) ?? null;

    this._loadedVfrApproachData.set(loadedApproachData);

    if (loadedApproachData) {
      const vfrApproachData = plan.getUserData<Readonly<FmsFplVfrApproachData>>(FmsFplUserDataKey.VfrApproach);
      this._vfrApproachActiveStatus.set(
        vfrApproachData
          ? vfrApproachData.isVtf ? 'vtf' : 'active'
          : 'none'
      );
    } else {
      this._vfrApproachActiveStatus.set('none');
    }
  }

  /**
   * Responds to when a flight plan user data event is received.
   * @param event The received event.
   */
  private onUserDataChanged(event: FlightPlanUserDataEvent): void {
    if (event.planIndex !== FmsUtils.PRIMARY_PLAN_INDEX) {
      return;
    }

    switch (event.key) {
      case FmsFplUserDataKey.Name:
        this._name.set(event.data);
        break;
      case G3XFmsFplUserDataKey.LoadedApproach:
      case FmsFplUserDataKey.VfrApproach: {
        const fplSource = this.fplSource.get();
        if (fplSource === G3XFplSource.Internal || fplSource === G3XFplSource.InternalRev) {
          this.updateApproachData(this.activePlanner.getFlightPlan(FmsUtils.PRIMARY_PLAN_INDEX));
        }
        break;
      }
    }
  }

  /**
   * Responds to when a flight plan origin/destination event is received.
   * @param event The received event.
   */
  private onOriginDestChanged(event: FlightPlanOriginDestEvent): void {
    if (event.planIndex !== FmsUtils.PRIMARY_PLAN_INDEX) {
      return;
    }

    switch (event.type) {
      case OriginDestChangeType.OriginAdded:
        if (event.airport !== undefined) {
          this.retrieveOriginFacility(event.airport);
          break;
        }
      // fallthrough
      case OriginDestChangeType.OriginRemoved:
        this._originAirport.set(null);
        break;
      case OriginDestChangeType.DestinationAdded:
        if (event.airport !== undefined) {
          this.retrieveDestinationFacility(event.airport);
          break;
        }
      // fallthrough
      case OriginDestChangeType.DestinationRemoved:
        this._destinationAirport.set(null);
        break;
    }
  }

  /**
   * Destroys this store. Once destroyed, this store will no longer update its provided data, and can no longer be
   * paused or resumed.
   */
  public destroy(): void {
    this.isAlive = false;

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    for (const sub of this.fplSubs) {
      sub.destroy();
    }
  }
}
