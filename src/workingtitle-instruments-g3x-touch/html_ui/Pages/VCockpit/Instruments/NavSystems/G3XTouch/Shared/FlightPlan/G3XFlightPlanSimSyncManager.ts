import {
  BitFlags, DebounceTimer, EventBus, Facility, FacilityType, FacilityUtils, FlightPlanSegmentType, ICAO, LegDefinition,
  LegDefinitionFlags, LegType, MathUtils, SimVarValueType, Subscription, UserFacilityUtils, Wait
} from '@microsoft/msfs-sdk';

import { DirectToState, FmsUtils, LegIndexes } from '@microsoft/msfs-garminsdk';

import { G3XFms } from './G3XFms';

/**
 * A manager for syncing the G3X Touch's internal active flight plan to and from the sim.
 */
export class G3XFlightPlanSimSyncManager {
  private static readonly SIM_ATC_IDENT_REGEX = /(?:[D][\d])|(?:DLast)|(?:TIMEVERT)|(?:TIMECLIMB)|(?:TIMECRUIS)|(?:TIMEDSCNT)|(?:TIMEAPPROACH)/;

  private static readonly NON_SYNCABLE_LEG_TYPES = [
    LegType.Discontinuity,
    LegType.ThruDiscontinuity,
    LegType.Unknown,
    LegType.HM,
    LegType.HA,
    LegType.HF,
  ];

  private static INSTANCE?: G3XFlightPlanSimSyncManager;

  private static hasStartedInit = false;
  private static readonly queuedInitResolves: ((value: G3XFlightPlanSimSyncManager) => void)[] = [];

  private _isAutoSyncing = false;

  private readonly autoSyncSubs: Subscription[];
  private readonly syncDebounceTimer = new DebounceTimer();
  private isSyncQueued = false;
  private isSyncing = false;

  private isBushTrip?: boolean;

  /**
   * Creates a new instance of G3XFlightPlanSimSyncManager.
   * @param bus The event bus.
   * @param fms The FMS.
   */
  private constructor(private readonly bus: EventBus, private readonly fms: G3XFms) {
    const queueSync = (): void => {
      this.isSyncQueued = true;
      if (!this.isSyncing) {
        this.dequeueSync();
      }
    };
    const scheduleSync = (): void => {
      if (!this.syncDebounceTimer.isPending()) {
        this.syncDebounceTimer.schedule(queueSync, 0);
      }
    };

    this.autoSyncSubs = [
      this.fms.internalFms.flightPlanner.onEvent('fplLoaded').handle(e => { e.planIndex === this.fms.flightPlanner.activePlanIndex && scheduleSync(); }).pause(),
      this.fms.internalFms.flightPlanner.onEvent('fplCopied').handle(e => { e.targetPlanIndex === this.fms.flightPlanner.activePlanIndex && scheduleSync(); }).pause(),
      this.fms.internalFms.flightPlanner.onEvent('fplSegmentChange').handle(e => { e.planIndex === this.fms.flightPlanner.activePlanIndex && scheduleSync(); }).pause(),
      this.fms.internalFms.flightPlanner.onEvent('fplLegChange').handle(e => { e.planIndex === this.fms.flightPlanner.activePlanIndex && scheduleSync(); }).pause(),
      this.fms.internalFms.flightPlanner.onEvent('fplOriginDestChanged').handle(e => { e.planIndex === this.fms.flightPlanner.activePlanIndex && scheduleSync(); }).pause(),
      this.fms.internalFms.flightPlanner.onEvent('fplProcDetailsChanged').handle(e => { e.planIndex === this.fms.flightPlanner.activePlanIndex && scheduleSync(); }).pause(),
      this.fms.internalFms.flightPlanner.onEvent('fplIndexChanged').handle(() => { scheduleSync(); }).pause(),
    ];
  }

  /**
   * Gets an instance of the flight plan sync manager.
   * @param bus The event bus.
   * @param fms The FMS.
   * @returns A Promise which will be fulfilled with an instance of the flight plan sync manager when it is ready.
   */
  public static getManager(bus: EventBus, fms: G3XFms): Promise<G3XFlightPlanSimSyncManager> {
    if (G3XFlightPlanSimSyncManager.INSTANCE !== undefined) {
      return Promise.resolve(G3XFlightPlanSimSyncManager.INSTANCE);
    }

    return new Promise((resolve) => {
      G3XFlightPlanSimSyncManager.queuedInitResolves.push(resolve);

      if (!G3XFlightPlanSimSyncManager.hasStartedInit) {
        G3XFlightPlanSimSyncManager.hasStartedInit = true;

        RegisterViewListener('JS_LISTENER_FLIGHTPLAN', async () => {
          G3XFlightPlanSimSyncManager.INSTANCE = new G3XFlightPlanSimSyncManager(bus, fms);
          G3XFlightPlanSimSyncManager.queuedInitResolves.forEach(queuedResolve => queuedResolve(G3XFlightPlanSimSyncManager.INSTANCE as G3XFlightPlanSimSyncManager));
          G3XFlightPlanSimSyncManager.queuedInitResolves.length = 0;
        });
      }
    });
  }

  /**
   * Loads the sim flight plan into the internal primary flight plan.
   * @returns A Promise which will be fulfilled when the flight plan has been loaded.
   */
  public async loadFromSim(): Promise<void> {
    Coherent.call('LOAD_CURRENT_ATC_FLIGHTPLAN');
    // Coherent.call('LOAD_CURRENT_GAME_FLIGHT');
    await Wait.awaitDelay(3000);

    const data = await Coherent.call('GET_FLIGHTPLAN');

    const isDirectTo = data.isDirectTo;

    // TODO: dirto
    if (!isDirectTo) {
      if (data.waypoints.length === 0) {
        return;
      }

      // Make sure the primary flight plan is empty.
      await this.fms.internalFms.emptyPrimaryFlightPlan();
      const plan = this.fms.internalFms.getPrimaryFlightPlan();

      await this.loadOriginLeg(data);
      await this.loadEnroute(data);
      await this.loadDestination(data);

      await plan.calculate(0);

      if (SimVar.GetSimVarValue('SIM ON GROUND', SimVarValueType.Bool) === 0) {
        // If we are in the air, then we will activate the nearest leg in the flight plan.
        this.fms.activateNearestLeg();
      } else {
        // Activate the first leg that is eligible for activation.

        const legToActivate = plan.findLeg((leg, segment, segmentIndex, segmentLegIndex) => {
          return !BitFlags.isAny(leg.flags, LegDefinitionFlags.DirectTo | LegDefinitionFlags.VectorsToFinal)
            && this.fms.canActivateLeg(segmentIndex, segmentLegIndex);
        });

        if (legToActivate) {
          const { segmentIndex, segmentLegIndex } = FmsUtils.getLegIndexes(plan, legToActivate) as LegIndexes;
          this.fms.activateLeg(segmentIndex, segmentLegIndex);
        }
      }

      // If an on-route DTO is not active, then remove any direct to legs in the flight plan so that we dont have any
      // remnants of on-route DTOs automatically created by FMS.
      if (
        this.fms.internalFms.getDirectToState() !== DirectToState.TOEXISTING
        && plan.directToData.segmentIndex >= 0 && plan.directToData.segmentLegIndex >= 0
      ) {
        const segment = plan.tryGetSegment(plan.directToData.segmentIndex);
        if (segment) {
          plan.removeLeg(segment.segmentIndex, plan.directToData.segmentLegIndex + 1, true);
          plan.removeLeg(segment.segmentIndex, plan.directToData.segmentLegIndex + 1, true);
          plan.removeLeg(segment.segmentIndex, plan.directToData.segmentLegIndex + 1, true);

          const activateIndex = plan.activeLateralLeg;
          const adjustedActivateIndex = activateIndex - MathUtils.clamp(activateIndex - (segment.offset + plan.directToData.segmentLegIndex), 0, FmsUtils.DTO_LEG_OFFSET);

          plan.setDirectToData(-1, true);
          plan.setCalculatingLeg(adjustedActivateIndex);
          plan.setLateralLeg(adjustedActivateIndex);
          await plan.calculate(0);
        }
      }
    }
  }

  /**
   * Checks whether this manager is automatically syncing the internal active flight plan to the sim.
   * @returns Whether this manager is automatically syncing the internal active flight plan to the sim.
   */
  public isAutoSyncing(): boolean {
    return this._isAutoSyncing;
  }

  /**
   * Starts automatically syncing the internal active flight plan to the sim.
   */
  public startAutoSync(): void {
    if (this._isAutoSyncing) {
      return;
    }

    this._isAutoSyncing = true;

    this.autoSyncSubs.forEach(sub => { sub.resume(); });
  }

  /**
   * Stops automatically syncing the internal active flight plan to the sim.
   */
  public stopAutoSync(): void {
    if (!this._isAutoSyncing) {
      return;
    }

    this._isAutoSyncing = false;

    this.autoSyncSubs.forEach(sub => { sub.pause(); });
  }

  /**
   * Attempts to retrieve a facility using its ICAO.
   * @param icao The ICAO of the facility to retrieve.
   * @returns The facility with the specified ICAO, or `undefined` if one could not be retrieved.
   */
  private async tryGetFacilityFromIcao(icao: string): Promise<Facility | undefined> {
    try {
      return this.fms.facLoader.getFacility(ICAO.getFacilityType(icao), icao);
    } catch {
      return undefined;
    }
  }

  /**
   * Loads the origin (first) leg from the sim flight plan into the internal primary flight plan.
   * @param data The sim flight plan data object to sync from.
   */
  private async loadOriginLeg(data: any): Promise<void> {
    const wpt = data.waypoints[0];

    let facility: Facility | undefined = undefined;

    if (wpt.ident === 'CUSTD' || wpt.ident === 'CUSTA') {
      const userFacility = UserFacilityUtils.createFromLatLon(
        'U  G3X CUSTD',
        wpt.lla.lat,
        wpt.lla.long,
        true,
        'Custom Origin'
      );
      this.fms.addUserFacility(userFacility);
      facility = userFacility;
    } else if (ICAO.isFacility(wpt.icao)) {
      facility = await this.tryGetFacilityFromIcao(wpt.icao);
    }

    if (facility) {
      await this.fms.insertWaypoint(1, facility);
    }
  }

  /**
   * Loads the enroute legs from the sim flight plan into the internal primary flight plan.
   * @param data The sim flight plan data object to sync from.
   */
  private async loadEnroute(data: any): Promise<void> {
    // If there is no departure, start at index 1 (index 0 is always the "origin")
    // If there is a departure, start at the wpt after the last departure wpt (a departure guarantees an origin, so the
    // departure itself starts at index 1 -> the last departure wpt is at [1 + departureWaypointsSize - 1]).
    const enrouteStart = data.departureWaypointsSize <= 0
      ? 1
      : data.departureWaypointsSize + 1;

    // If there is no arrival, end with the second-to-last waypoint (we skip the last waypoint even if it is not the
    // destination airport because it will get handled elsewhere). If there is an arrival, then the last enroute
    // waypoint will be at index [length - 2 - arrivalWaypointsSize] (i.e. counting backwards from the end, we skip the
    // destination airport, then every waypoint in the arrival).
    const enrouteEnd = data.arrivalWaypointsSize <= 0
      ? -1
      : -(data.arrivalWaypointsSize + 1);

    const enroute = data.waypoints.slice(enrouteStart, enrouteEnd);

    let usrId = 0;

    const plan = this.fms.getInternalPrimaryFlightPlan();

    for (let i = 0; i < enroute.length; i++) {
      const wpt = enroute[i];

      // Skip ATC waypoints.
      if (wpt.icao.trim() === '') {
        if (G3XFlightPlanSimSyncManager.SIM_ATC_IDENT_REGEX.test(wpt.ident)) {
          continue;
        }
      }

      let facility: Facility | undefined = undefined;

      if (wpt.ident === 'Custom' || wpt.icao.trim() == '') {
        // Convert Custom waypoints to USER facilities.
        const userFacility = UserFacilityUtils.createFromLatLon(
          `U  G3X USR${usrId.toString().padStart(2, '0')}`,
          wpt.lla.lat,
          wpt.lla.long,
          true,
          wpt.icao.trim() === '' ? wpt.ident : `Custom ${usrId.toString().padStart(2, '0')}`
        );
        this.fms.addUserFacility(userFacility);
        usrId++;

        facility = userFacility;
      } else if (ICAO.isFacility(wpt.icao)) {
        facility = await this.tryGetFacilityFromIcao(wpt.icao);
      }

      if (facility) {
        const insertSegmentIndex = Math.max(1, plan.getSegmentIndex(plan.length - 1));
        await this.fms.insertWaypoint(insertSegmentIndex, facility);
      }
    }
  }

  /**
   * Loads the destination (last) leg and approach from the sim flight plan into the internal primary flight plan.
   * @param data The sim flight plan data object to sync from.
   */
  private async loadDestination(data: any): Promise<void> {
    const wpt = data.waypoints[data.waypoints.length - 1];

    let facility: Facility | undefined = undefined;

    if (wpt.ident === 'CUSTD' || wpt.ident === 'CUSTA') {
      const userFacility = UserFacilityUtils.createFromLatLon(
        'U  G3X CUSTA',
        wpt.lla.lat,
        wpt.lla.long,
        true,
        'Custom Destination'
      );
      this.fms.addUserFacility(userFacility);
      facility = userFacility;
    } else if (ICAO.isFacility(wpt.icao)) {
      facility = await this.tryGetFacilityFromIcao(wpt.icao);
    }

    if (facility) {
      const plan = this.fms.getInternalPrimaryFlightPlan();
      const insertSegmentIndex = Math.max(1, plan.getSegmentIndex(plan.length - 1));

      await this.fms.insertWaypoint(insertSegmentIndex, facility);
      if (FacilityUtils.isFacilityType(facility, FacilityType.Airport)) {
        if (data.approachIndex >= 0) {
          await this.fms.loadApproach(facility, data.approachIndex, false);
        }
      }
    }
  }

  /**
   * Executes the pending sync operation, if one exists, and continues to execute sync operations after the previous
   * one is completed as long as one is pending.
   */
  private async dequeueSync(): Promise<void> {
    while (this.isSyncQueued) {
      this.isSyncQueued = false;
      this.isSyncing = true;
      await this.doSync();
      this.isSyncing = false;
    }
  }

  /**
   * Syncs the internal active flight plan to the sim.
   */
  private async doSync(): Promise<void> {
    // We are doing this check here and not on initialization of the manager because GET_IS_BUSHTRIP will fail to
    // return anything unless a Bing map is bound (the call is tied to the JS map listener). This is also why we
    // abort the check after 1 second, so that we aren't stuck waiting on it forever.
    this.isBushTrip ??= await Promise.race([Coherent.call('GET_IS_BUSHTRIP') as Promise<boolean>, Wait.awaitDelay(1000) as Promise<undefined>]);

    // Do not try to sync back to the sim until we know for sure we are not in a bushtrip.
    if (this.isBushTrip !== false) {

      // If we find out we are in a bushtrip, destroy all the autosync triggers to make sure we don't try to sync again.
      if (this.isBushTrip === true) {
        this.autoSyncSubs.forEach(sub => { sub.destroy(); });
        this.autoSyncSubs.length = 0;
      }

      return;
    }

    // Don't sync off-route direct-tos because it just leads to weirdness on the sim side.
    if (this.fms.internalFms.getDirectToState() === DirectToState.TORANDOM) {
      return;
    }

    try {
      const plan = this.fms.internalFms.flightPlanner.getActiveFlightPlan();

      // await Coherent.call('CREATE_NEW_FLIGHTPLAN');
      await Coherent.call('SET_CURRENT_FLIGHTPLAN_INDEX', 0, true);
      await Coherent.call('CLEAR_CURRENT_FLIGHT_PLAN');

      if (plan.originAirport !== undefined && plan.originAirport.length > 0) {
        await Coherent.call('SET_ORIGIN', plan.originAirport, false);
      }

      if (plan.destinationAirport !== undefined && plan.destinationAirport.length > 0) {
        await Coherent.call('SET_DESTINATION', plan.destinationAirport, false);
      }

      let globalIndex = 1;

      // Sync enroute legs
      const enrouteSegments = plan.segmentsOfType(FlightPlanSegmentType.Enroute);
      for (const segment of enrouteSegments) {
        for (const leg of segment.legs) {
          if (G3XFlightPlanSimSyncManager.isSyncableLeg(leg)) {
            await Coherent.call('ADD_WAYPOINT', leg.leg.fixIcao, globalIndex, false);
            globalIndex++;
          }
        }
      }

      // Sync approach legs. We don't sync approach procedure information because the VFR approaches that are loaded
      // into the internal flight plan are not the same as the published instrument approaches for the airport.
      const approachSegment = FmsUtils.getApproachSegment(plan);
      if (approachSegment) {
        for (const leg of approachSegment.legs) {
          if (G3XFlightPlanSimSyncManager.isSyncableLeg(leg)) {
            await Coherent.call('ADD_WAYPOINT', leg.leg.fixIcao, globalIndex, false);
            globalIndex++;
          }
        }
      }

      await Coherent.call('RECOMPUTE_ACTIVE_WAYPOINT_INDEX', 0);
    } catch (e) {
      if (e instanceof Error) {
        console.warn(e);
        console.error(e.stack);
      } else {
        console.warn(`G3XFlightPlanSimSyncManager: error when syncing flight plan to sim: ${JSON.stringify(e)}`);
      }
    }
  }

  /**
   * Checks if a leg is syncable to the stock flight plan system.
   * @param leg the leg to check
   * @returns true if the leg is syncable, false otherwise
   */
  private static isSyncableLeg(leg: LegDefinition): boolean {
    return BitFlags.isAny(leg.flags, LegDefinitionFlags.DirectTo || LegDefinitionFlags.VectorsToFinal)
      && !G3XFlightPlanSimSyncManager.NON_SYNCABLE_LEG_TYPES.includes(leg.leg.type);
  }
}