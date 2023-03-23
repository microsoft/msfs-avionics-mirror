import {
  AirportFacility, AirportRunway, DebounceTimer, EventBus, FacilityType, FlightPlan, FlightPlanLeg, FlightPlannerEvents, FlightPlanSegmentType,
  ICAO, LegType, OneWayRunway, RunwayUtils, Subscription, UserFacilityUtils, Wait
} from '@microsoft/msfs-sdk';
import { DirectToState, Fms } from './Fms';

/**
 * A manager for syncing the active flight plan to and from the sim.
 */
export class FlightPlanSimSyncManager {
  private static readonly NON_SYNCABLE_LEG_TYPES = [
    LegType.Discontinuity,
    LegType.ThruDiscontinuity,
    LegType.Unknown,
    LegType.HM,
    LegType.HA,
    LegType.HF,
  ];

  private static INSTANCE?: FlightPlanSimSyncManager;

  private static hasStartedInit = false;
  private static readonly queuedInitResolves: ((value: FlightPlanSimSyncManager) => void)[] = [];

  private _isAutoSyncing = false;

  private readonly autoSyncSubs: Subscription[];
  private readonly syncDebounceTimer = new DebounceTimer();
  private isSyncQueued = false;
  private isSyncing = false;

  private isBushTrip?: boolean;

  /**
   * Constructor.
   * @param bus The event bus.
   * @param fms The FMS.
   */
  private constructor(private readonly bus: EventBus, private readonly fms: Fms) {
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

    const sub = this.bus.getSubscriber<FlightPlannerEvents>();

    this.autoSyncSubs = [
      sub.on('fplLoaded').handle(e => { e.planIndex === this.fms.flightPlanner.activePlanIndex && scheduleSync(); }).pause(),
      sub.on('fplCopied').handle(e => { e.targetPlanIndex === this.fms.flightPlanner.activePlanIndex && scheduleSync(); }).pause(),
      sub.on('fplSegmentChange').handle(e => { e.planIndex === this.fms.flightPlanner.activePlanIndex && scheduleSync(); }).pause(),
      sub.on('fplLegChange').handle(e => { e.planIndex === this.fms.flightPlanner.activePlanIndex && scheduleSync(); }).pause(),
      sub.on('fplOriginDestChanged').handle(e => { e.planIndex === this.fms.flightPlanner.activePlanIndex && scheduleSync(); }).pause(),
      sub.on('fplProcDetailsChanged').handle(e => { e.planIndex === this.fms.flightPlanner.activePlanIndex && scheduleSync(); }).pause(),
      sub.on('fplIndexChanged').handle(() => { scheduleSync(); }).pause(),
    ];
  }

  /**
   * Gets an instance of the flight plan sync manager.
   * @param bus The event bus.
   * @param fms The FMS.
   * @returns A Promise which will be fulfilled with an instance of the flight plan sync manager when it is ready.
   */
  public static getManager(bus: EventBus, fms: Fms): Promise<FlightPlanSimSyncManager> {
    if (FlightPlanSimSyncManager.INSTANCE !== undefined) {
      return Promise.resolve(FlightPlanSimSyncManager.INSTANCE);
    }

    return new Promise((resolve) => {
      FlightPlanSimSyncManager.queuedInitResolves.push(resolve);

      if (!FlightPlanSimSyncManager.hasStartedInit) {
        FlightPlanSimSyncManager.hasStartedInit = true;

        RegisterViewListener('JS_LISTENER_FLIGHTPLAN', async () => {
          FlightPlanSimSyncManager.INSTANCE = new FlightPlanSimSyncManager(bus, fms);
          FlightPlanSimSyncManager.queuedInitResolves.forEach(queuedResolve => queuedResolve(FlightPlanSimSyncManager.INSTANCE as FlightPlanSimSyncManager));
          FlightPlanSimSyncManager.queuedInitResolves.length = 0;
        });
      }
    });
  }

  /**
   * Checks whether this manager is automatically syncing the active flight plan to the sim.
   * @returns Whether this manager is automatically syncing the active flight plan to the sim.
   */
  public isAutoSyncing(): boolean {
    return this._isAutoSyncing;
  }

  /**
   * Loads the flight plan from the sim.
   * @returns A Promise which is fulfilled when the flight plan has been loaded.
   */
  public async loadFromSim(): Promise<void> {
    Coherent.call('LOAD_CURRENT_ATC_FLIGHTPLAN');
    // Coherent.call('LOAD_CURRENT_GAME_FLIGHT');
    await Wait.awaitDelay(3000);

    const data = await Coherent.call('GET_FLIGHTPLAN');

    const isDirectTo = data.isDirectTo;
    let lastEnrouteSegment = 1;

    // TODO: dirto
    if (!isDirectTo) {
      if (data.waypoints.length === 0) {
        return;
      }

      // Make sure the primary flight plan is empty.
      await this.fms.emptyPrimaryFlightPlan();
      const plan = this.fms.getPrimaryFlightPlan();

      // Check if the first waypoint is an airport. If it is, set it as the origin airport and insert any departure
      // that is defined. If not, insert it as an enroute waypoint.
      let originFacilityType: FacilityType | undefined = undefined;
      if (ICAO.isFacility(data.waypoints[0].icao)) {
        originFacilityType = ICAO.getFacilityType(data.waypoints[0].icao);
      }
      if (originFacilityType === FacilityType.Airport) {
        const originFac = await this.fms.facLoader.getFacility(ICAO.getFacilityType(data.waypoints[0].icao), data.waypoints[0].icao);
        if (originFac !== undefined) {
          this.setDeparture(originFac as AirportFacility, data);
        }
      } else if (originFacilityType !== undefined) {
        this.buildNonAirportOriginLeg(data, plan);
      }

      // Check if the last waypoint is an airport, and if it is, set it as the destination airport and insert any
      // arrival and approach that is defined.
      const destIndex = data.waypoints.length - 1;
      let destFacilityType: FacilityType | undefined = undefined;
      if (ICAO.isFacility(data.waypoints[destIndex].icao)) {
        destFacilityType = ICAO.getFacilityType(data.waypoints[destIndex].icao);
      }
      if (destFacilityType === FacilityType.Airport) {
        const destFac = await this.fms.facLoader.getFacility(ICAO.getFacilityType(data.waypoints[destIndex].icao), data.waypoints[destIndex].icao);
        if (destFac !== undefined) {
          await this.setDestination(destFac as AirportFacility, data);
        }
      }

      // Add enroute waypoints and airways.
      lastEnrouteSegment = this.setEnroute(data, plan);

      // If the last waypoint is not an airport, insert it as an enroute waypoint.
      if (destFacilityType !== FacilityType.Airport && destFacilityType !== undefined) {
        this.buildNonAirportDestLeg(data, plan, lastEnrouteSegment);
      }

      plan.calculate(0).then(() => {
        if (Simplane.getIsGrounded()) {
          plan.setLateralLeg(0);
        } else {
          this.fms.activateNearestLeg();
        }
      });
    }
  }

  /**
   * Starts automatically syncing the active flight plan to the sim.
   */
  public startAutoSync(): void {
    if (this._isAutoSyncing) {
      return;
    }

    this._isAutoSyncing = true;

    this.autoSyncSubs.forEach(sub => { sub.resume(); });
  }

  /**
   * Stops automatically syncing the active flight plan to the sim.
   */
  public stopAutoSync(): void {
    if (!this._isAutoSyncing) {
      return;
    }

    this._isAutoSyncing = false;

    this.autoSyncSubs.forEach(sub => { sub.pause(); });
  }

  /**
   * Syncs the origin airport and departure of a sim flight plan to a JS flight plan.
   * @param facility The facility record for the origin airport.
   * @param data The sim flight plan data object to sync from.
   */
  private setDeparture(facility: AirportFacility, data: any): void {
    let originOneWayRunway = undefined;
    if (data.originRunwayIndex > -1) {
      const oneWayRunways: OneWayRunway[] = [];
      let index = 0;
      facility.runways.forEach((runway: AirportRunway) => {
        for (const rw of RunwayUtils.getOneWayRunways(runway, index)) {
          oneWayRunways.push(rw);
        }
        index++;
      });
      oneWayRunways.sort(RunwayUtils.sortRunways);
      originOneWayRunway = oneWayRunways[data.originRunwayIndex];
    }
    if (data.departureProcIndex >= 0 && data.departureProcIndex < facility.departures.length) {
      // Runway and enroute transition indexes default to 0 even when the departure has no runway or enroute
      // transitions, so we have to do the OOB checks ourselves.

      const departure = facility.departures[data.departureProcIndex];
      if (data.departureRunwayIndex >= 0 && data.departureRunwayIndex < departure.runwayTransitions.length) {
        const runwayTransition = departure.runwayTransitions[data.departureRunwayIndex];
        const runwayString = RunwayUtils.getRunwayNameString(runwayTransition.runwayNumber, runwayTransition.runwayDesignation);
        originOneWayRunway = RunwayUtils.matchOneWayRunwayFromDesignation(facility, runwayString);
      }

      const enrouteTransitionIndex = data.departureEnRouteTransitionIndex < 0 || data.departureEnRouteTransitionIndex >= departure.enRouteTransitions.length
        ? -1
        : data.departureEnRouteTransitionIndex;

      this.fms.insertDeparture(facility, data.departureProcIndex, data.departureRunwayIndex, enrouteTransitionIndex, originOneWayRunway);
    } else {
      this.fms.setOrigin(facility, originOneWayRunway);
    }
  }

  /**
   * Syncs the arrival, approach, and destination airport of a sim flight plan to a JS flight plan.
   * @param facility The facility record for the destination airport.
   * @param data The sim flight plan data object to sync from.
   */
  private async setDestination(facility: AirportFacility, data: any): Promise<void> {
    let destOneWayRunway = undefined;

    if (data.arrivalProcIndex >= 0 && data.arrivalProcIndex < facility.arrivals.length) {
      // Runway and enroute transition indexes default to 0 even when the departure has no runway or enroute
      // transitions, so we have to do the OOB checks ourselves.

      const arrival = facility.arrivals[data.arrivalProcIndex];

      if (data.arrivalRunwayIndex >= 0 && data.arrivalRunwayIndex < arrival.runwayTransitions.length) {
        const runwayTransition = arrival.runwayTransitions[data.arrivalRunwayIndex];
        if (runwayTransition !== undefined) {
          const runwayString = RunwayUtils.getRunwayNameString(runwayTransition.runwayNumber, runwayTransition.runwayDesignation);
          destOneWayRunway = RunwayUtils.matchOneWayRunwayFromDesignation(facility, runwayString);
        }
      }

      const enrouteTransitionIndex = data.arrivalEnRouteTransitionIndex < 0 || data.arrivalEnRouteTransitionIndex >= arrival.enRouteTransitions.length
        ? -1
        : data.arrivalEnRouteTransitionIndex;

      this.fms.insertArrival(facility, data.arrivalProcIndex, data.arrivalRunwayIndex, enrouteTransitionIndex, destOneWayRunway);
    }

    if (data.approachIndex !== -1) {
      const approachTransitionIndex = data.approachTransitionIndex === 0 &&
        facility.approaches[data.approachIndex].transitions.length < 1 ? -1 : data.approachTransitionIndex;
      await this.fms.insertApproach(facility, data.approachIndex, approachTransitionIndex);

      // Loading an approach might result in automatic activation of the approach, creating an on-route direct-to to
      // the IAF. We don't want this to happen because it will mess with importing enroute waypoints, so we will cancel
      // any active direct-to after the approach has been loaded.
      this.fms.cancelDirectTo();
    }

    if (data.arrivalProcIndex === -1 && data.approachIndex === -1) {
      this.fms.setDestination(facility);
    }
  }

  /**
   * Syncs the enroute portion of a sim flight plan to a JS flight plan.
   * @param data The sim flight plan data object to sync from.
   * @param plan The flight plan to sync to.
   * @returns The index of the last enroute segment that was added to the plan.
   */
  private setEnroute(data: any, plan: FlightPlan): number {
    // If there is no departure, start at index 1 (index 0 is always the "origin")
    // If there is a departure, start at the last departure wpt (a departure guarantees an origin, so the
    // departure itself starts at index 1 -> the last departure wpt is at [1 + departureWaypointsSize - 1]). The
    // reason we start here is to catch any airways that begin with the last departure wpt.
    const enrouteStart = data.departureWaypointsSize <= 0
      ? 1
      : data.departureWaypointsSize;

    // If there is no arrival, end with the second-to-last waypoint (we skip the last waypoint even if it is not the
    // destination airport because it will get handled elsewhere). If there is an arrival, then the last enroute
    // waypoint will be at index [length - 2 - arrivalWaypointsSize] (i.e. counting backwards from the end, we skip the
    // destination airport, then every waypoint in the arrival).
    const enrouteEnd = data.arrivalWaypointsSize <= 0
      ? -1
      : -(data.arrivalWaypointsSize + 1);

    const enroute = data.waypoints.slice(enrouteStart, enrouteEnd);

    const initialPlanLength = plan.length;

    let custIdx = 1;
    let currentSegment = 1;
    let lastDepartureLegIcao = undefined;
    let lastLegWasAirway = false;

    if (data.departureProcIndex > -1) {
      const depSegment = plan.getSegment(0);
      if (depSegment.legs.length > 1) {
        lastDepartureLegIcao = depSegment.legs[depSegment.legs.length - 1].leg.fixIcao;
      }
    }

    for (let i = 0; i < enroute.length; i++) {
      const wpt = enroute[i];
      const segment = plan.getSegment(currentSegment);
      if (wpt.airwayIdent) {
        if (currentSegment == 1 && lastDepartureLegIcao == wpt.icao && plan.length === initialPlanLength) {
          // We are entering an airway at the last departure wpt -> in this case we don't want to duplicate the
          // wpt and the airway segment immediately follows the departure segment.
        } else {
          const leg = FlightPlan.createLeg({
            type: LegType.TF,
            fixIcao: wpt.icao
          });
          plan.addLeg(currentSegment, leg);
          if (!lastLegWasAirway) {
            plan.insertSegment(currentSegment + 1, FlightPlanSegmentType.Enroute, wpt.airwayIdent);
            currentSegment += 1;
          }
        }

        // Once we have entered an airway, continue adding legs to the airway segment until we encounter a wpt whose
        // airway ident does not match the current airway -> this wpt will be the exit waypoint.
        for (let j = i + 1; j < enroute.length; j++) {
          i++;
          const airwayLeg = FlightPlan.createLeg({
            type: LegType.TF,
            fixIcao: enroute[j].icao
          });
          plan.addLeg(currentSegment, airwayLeg);

          if (enroute[j].airwayIdent !== wpt.airwayIdent) {
            lastLegWasAirway = enroute[j].airwayIdent ? true : false;
            break;
          }
        }

        // Update the airway name with the correct exit waypoint.
        plan.setAirway(currentSegment, wpt.airwayIdent + '.' + enroute[i].ident);

        currentSegment += 1;
        plan.insertSegment(currentSegment, FlightPlanSegmentType.Enroute, lastLegWasAirway ? enroute[i].airwayIdent : undefined);

      } else {
        let leg: FlightPlanLeg | undefined = undefined;
        let skip = false;

        if (currentSegment == 1 && lastDepartureLegIcao == wpt.icao && plan.length === initialPlanLength) {
          // We are currently at the last departure wpt. We don't want to duplicate this waypoint, so skip it.
          skip = true;
        }

        if (!skip && wpt.icao.trim() == '') {
          // Skip ATC waypoints.
          const re = /(?:[D][\d])|(?:DLast)|(?:TIMEVERT)|(?:TIMECLIMB)|(?:TIMECRUIS)|(?:TIMEDSCNT)|(?:TIMEAPPROACH)/;
          skip = wpt.ident.match(re) !== null;
        }

        if (!skip && (wpt.ident === 'Custom' || wpt.icao.trim() == '')) {
          // Convert Custom waypoints to USER facilities.
          const userFacility = UserFacilityUtils.createFromLatLon(`U      USR${custIdx.toString().padStart(2, '0')}`,
            wpt.lla.lat, wpt.lla.long, true, wpt.icao.trim() === '' ? wpt.ident : `Custom ${custIdx.toString().padStart(2, '0')}`);
          this.fms.addUserFacility(userFacility);
          leg = FlightPlan.createLeg({
            type: LegType.TF,
            fixIcao: userFacility.icao,
            lat: wpt.lla.lat,
            lon: wpt.lla.long
          });
          custIdx++;
        } else if (!skip && wpt.icao.trim() !== '') {
          leg = FlightPlan.createLeg({
            type: LegType.TF,
            fixIcao: wpt.icao
          });
        }

        if (leg) {
          plan.addLeg(currentSegment, leg);
          if (lastLegWasAirway) {
            plan.setAirway(currentSegment, segment.airway + '.' + wpt.ident);
            currentSegment += 1;
            plan.insertSegment(currentSegment, FlightPlanSegmentType.Enroute);
          }
          lastLegWasAirway = false;
        }
      }
    }

    // The last enroute segment cannot be an airway.
    if (plan.getSegment(currentSegment).airway) {
      currentSegment += 1;
      plan.insertSegment(currentSegment, FlightPlanSegmentType.Enroute);
    }

    return currentSegment;
  }

  /**
   * Sets the first leg of the enroute plan as the first leg in the world map plan, but as an IF leg
   * @param data is the flight plan sync data object from the world map
   * @param plan an instance of the flight plan
   */
  private buildNonAirportOriginLeg(data: any, plan: FlightPlan): void {
    const wpt = data.waypoints[0];
    if (wpt.ident === 'CUSTD' || wpt.ident === 'CUSTA') {
      const userFacility = UserFacilityUtils.createFromLatLon('U      CUSTD',
        wpt.lla.lat, wpt.lla.long, true, 'Custom Origin');
      this.fms.addUserFacility(userFacility);
      const leg = FlightPlan.createLeg({
        type: LegType.IF,
        fixIcao: 'U      CUSTD',
        lat: wpt.lla.lat,
        lon: wpt.lla.long
      });
      plan.addLeg(1, leg);
    } else if (wpt.icao.trim() !== '') {
      const leg = FlightPlan.createLeg({
        type: LegType.IF,
        fixIcao: wpt.icao
      });
      plan.addLeg(1, leg);
    }
  }

  /**
   * Sets the last leg of the enroute plan as the last leg in the world map plan, but as an TF leg
   * @param data is the flight plan sync data object from the world map
   * @param plan an instance of the flight plan
   * @param lastEnrouteSegment is the last enroute segment
   */
  private buildNonAirportDestLeg(data: any, plan: FlightPlan, lastEnrouteSegment: number): void {
    const wpt = data.waypoints[data.waypoints.length - 1];
    if (wpt.ident === 'CUSTD' || wpt.ident === 'CUSTA') {
      const userFacility = UserFacilityUtils.createFromLatLon('U      CUSTA',
        wpt.lla.lat, wpt.lla.long, true, 'Custom Destination');
      this.fms.addUserFacility(userFacility);
      const leg = FlightPlan.createLeg({
        type: LegType.TF,
        fixIcao: userFacility.icao,
        lat: wpt.lla.lat,
        lon: wpt.lla.long
      });
      plan.addLeg(lastEnrouteSegment, leg);
    } else if (wpt.icao.trim() !== '') {
      const leg = FlightPlan.createLeg({
        type: LegType.TF,
        fixIcao: wpt.icao
      });
      plan.addLeg(lastEnrouteSegment, leg);
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
   * Syncs the active flight plan to the sim.
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
    if (this.fms.getDirectToState() === DirectToState.TORANDOM) {
      return;
    }

    try {
      const plan = this.fms.flightPlanner.getActiveFlightPlan();

      // await Coherent.call('CREATE_NEW_FLIGHTPLAN');
      await Coherent.call('SET_CURRENT_FLIGHTPLAN_INDEX', 0, true);
      await Coherent.call('CLEAR_CURRENT_FLIGHT_PLAN');

      if (plan.originAirport !== undefined && plan.originAirport.length > 0) {
        await Coherent.call('SET_ORIGIN', plan.originAirport, false);
      }

      if (plan.destinationAirport !== undefined && plan.destinationAirport.length > 0) {
        await Coherent.call('SET_DESTINATION', plan.destinationAirport, false);
      }

      if (plan.procedureDetails.originRunway) {
        await Coherent.call('SET_ORIGIN_RUNWAY_INDEX', plan.procedureDetails.originRunway?.parentRunwayIndex);
      }
      await Coherent.call('SET_DEPARTURE_RUNWAY_INDEX', plan.procedureDetails.departureRunwayIndex);
      await Coherent.call('SET_DEPARTURE_PROC_INDEX', plan.procedureDetails.departureIndex);
      await Coherent.call('SET_DEPARTURE_ENROUTE_TRANSITION_INDEX', plan.procedureDetails.departureTransitionIndex === -1 ? 0 : plan.procedureDetails.departureTransitionIndex);

      // Put in the enroute waypoints
      const enrouteSegments = plan.segmentsOfType(FlightPlanSegmentType.Enroute);
      for (const segment of enrouteSegments) {
        // get legs in segment
        let globalIndex = 1;
        for (const leg of segment.legs) {
          if (FlightPlanSimSyncManager.isSyncableLeg(leg.leg)) {
            await Coherent.call('ADD_WAYPOINT', leg.leg.fixIcao, globalIndex, false);
            globalIndex++;
          }
        }
      }

      await Coherent.call('SET_ARRIVAL_RUNWAY_INDEX', plan.procedureDetails.arrivalRunwayTransitionIndex === -1 ? 0 : plan.procedureDetails.arrivalRunwayTransitionIndex);
      await Coherent.call('SET_ARRIVAL_PROC_INDEX', plan.procedureDetails.arrivalIndex);
      await Coherent.call('SET_ARRIVAL_ENROUTE_TRANSITION_INDEX', plan.procedureDetails.arrivalTransitionIndex);

      await Coherent.call('SET_APPROACH_INDEX', plan.procedureDetails.approachIndex).then(() => {
        Coherent.call('SET_APPROACH_TRANSITION_INDEX', plan.procedureDetails.approachTransitionIndex);
      });

      if (plan.activeLateralLeg < plan.length) {
        const activeSegment = plan.getSegment(plan.getSegmentIndex(Math.max(0, plan.activeLateralLeg)));
        if (activeSegment.segmentType === FlightPlanSegmentType.Approach) {
          await Coherent.call('TRY_AUTOACTIVATE_APPROACH');
        }
      }

      await Coherent.call('RECOMPUTE_ACTIVE_WAYPOINT_INDEX', 0);
    } catch (e) {
      if (e instanceof Error) {
        console.warn(e);
        console.error(e.stack);
      } else {
        console.warn(`FlightPlanSimSyncManager: error when syncing flight plan to sim: ${JSON.stringify(e)}`);
      }
    }
  }

  /**
   * Checks if a leg is syncable to the stock flight plan system.
   * @param leg the leg to check
   * @returns true if the leg is syncable, false otherwise
   */
  private static isSyncableLeg(leg: FlightPlanLeg): boolean {
    return FlightPlanSimSyncManager.NON_SYNCABLE_LEG_TYPES.indexOf(leg.type) === -1;
  }
}