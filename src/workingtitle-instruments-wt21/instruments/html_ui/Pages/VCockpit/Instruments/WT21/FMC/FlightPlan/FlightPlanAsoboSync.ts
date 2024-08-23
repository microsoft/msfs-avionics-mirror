/* eslint-disable max-len */
/* eslint-disable no-console */
import {
  AirportFacility, AirportRunway, FacilityType, FlightPlan, FlightPlanLeg, FlightPlanSegmentType, ICAO, LegDefinition, LegType, OneWayRunway, RunwayUtils,
  UserFacilityUtils, Wait
} from '@microsoft/msfs-sdk';
import { WT21Fms } from './WT21Fms';
import { WT21FmsUtils } from '@microsoft/msfs-wt21-shared';

/**
 * A class for syncing a flight plan with the game
 * HINT: This class always needs to run on an instrument that has bound bing maps
 * Otherwise the GET_IS_BUSHTRIP coherent call won't return
 */
export class FlightPlanAsoboSync {
  // public static fpChecksum = 0;
  private static fpListenerInitialized = false;

  private static nonSyncableLegTypes = [
    LegType.Discontinuity,
    LegType.ThruDiscontinuity,
    LegType.Unknown,
    LegType.HM,
    LegType.HA,
    LegType.HF,
  ];

  /**
   * Inits flight plan asobo sync
   */
  public static async init(): Promise<void> {
    return new Promise((resolve) => {
      if (!FlightPlanAsoboSync.fpListenerInitialized) {
        RegisterViewListener('JS_LISTENER_FLIGHTPLAN', () => {
          FlightPlanAsoboSync.fpListenerInitialized = true;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Loads the flight plan from the sim.
   * @param fms an instance of the fms
   */
  public static async loadFromGame(fms: WT21Fms): Promise<void> {
    await FlightPlanAsoboSync.init();
    Coherent.call('LOAD_CURRENT_ATC_FLIGHTPLAN');
    // Coherent.call('LOAD_CURRENT_GAME_FLIGHT');
    await Wait.awaitDelay(3000);
    // HINT: the call never comes back without a bound map. so just ignore for now
    // const isBushtrip = await Coherent.call('GET_IS_BUSHTRIP');
    const isBushtrip = false;
    if (!isBushtrip) {
      const data = await Coherent.call('GET_FLIGHTPLAN');

      const isDirectTo = data.isDirectTo;
      let lastEnrouteSegment = 1;

      // TODO: dirto
      if (!isDirectTo) {
        if (data.waypoints.length === 0) {
          return;
        }

        // init a flightplan
        await fms.emptyPrimaryFlightPlan();
        const plan = fms.getModFlightPlan();

        // set origin
        let originFacilityType: FacilityType | undefined = undefined;
        if (ICAO.isFacility(data.waypoints[0].icao)) {
          originFacilityType = ICAO.getFacilityType(data.waypoints[0].icao);
        }
        if (originFacilityType === FacilityType.Airport) {
          const originFac = await fms.facLoader.getFacility(ICAO.getFacilityType(data.waypoints[0].icao), data.waypoints[0].icao);
          if (originFac !== undefined) {
            FlightPlanAsoboSync.setDeparture(originFac as AirportFacility, data, fms);
          }
        } else if (originFacilityType !== undefined) {
          FlightPlanAsoboSync.buildNonAirportOriginLeg(data, plan, fms);
        }

        // set dest
        const destIndex = data.waypoints.length - 1;
        let destFacilityType: FacilityType | undefined = undefined;
        if (ICAO.isFacility(data.waypoints[destIndex].icao)) {
          destFacilityType = ICAO.getFacilityType(data.waypoints[destIndex].icao);
        }
        if (destFacilityType === FacilityType.Airport) {
          const destFac = await fms.facLoader.getFacility(ICAO.getFacilityType(data.waypoints[destIndex].icao), data.waypoints[destIndex].icao);
          if (destFac !== undefined) {
            await FlightPlanAsoboSync.setDestination(destFac as AirportFacility, data, fms);
          }
        }

        // set enroute waypoints
        lastEnrouteSegment = FlightPlanAsoboSync.setEnroute(data, plan, fms);

        // set non-airport destination leg as the last enroute leg
        if (destFacilityType !== FacilityType.Airport && destFacilityType !== undefined) {
          FlightPlanAsoboSync.buildNonAirportDestLeg(data, plan, fms, lastEnrouteSegment);
        }

        plan.calculate(0).then(() => {
          plan.setLateralLeg(0);
        });
      }
    }
  }

  /**
   * Syncs the plan back to the sim as best as possible
   * @param fms an instance of FMS
   */
  public static async SaveToGame(fms: WT21Fms): Promise<void> {
    try {
      await FlightPlanAsoboSync.init();
      const plan = fms.getPrimaryFlightPlan();

      // TODO: Disable until GET_IS_BUSHTRIP is not dependent on having a bound bing map
      // const isBushtrip = await Coherent.call('GET_IS_BUSHTRIP');
      // if (isBushtrip) {
      //   return;
      // }

      await Coherent.call('SET_CURRENT_FLIGHTPLAN_INDEX', 0).catch((err: any) => console.log(JSON.stringify(err)));
      await Coherent.call('CLEAR_CURRENT_FLIGHT_PLAN').catch((err: any) => console.log(JSON.stringify(err)));

      if (fms.facilityInfo.originFacility) {
        await Coherent.call('SET_ORIGIN', fms.facilityInfo.originFacility.icao, false).catch((err: any) => console.log(JSON.stringify(err)));
      }

      if (fms.facilityInfo.destinationFacility) {
        await Coherent.call('SET_DESTINATION', fms.facilityInfo.destinationFacility.icao, false).catch((err: any) => console.log(JSON.stringify(err)));
      }

      if (plan.procedureDetails.originRunway) {
        await Coherent.call('SET_ORIGIN_RUNWAY_INDEX', plan.procedureDetails.originRunway?.parentRunwayIndex).catch((err: any) => console.log(JSON.stringify(err)));
      }
      await Coherent.call('SET_DEPARTURE_RUNWAY_INDEX', plan.procedureDetails.departureRunwayIndex).catch((err: any) => console.log(JSON.stringify(err)));
      await Coherent.call('SET_DEPARTURE_PROC_INDEX', plan.procedureDetails.departureIndex).catch((err: any) => console.log(JSON.stringify(err)));
      await Coherent.call('SET_DEPARTURE_ENROUTE_TRANSITION_INDEX', plan.procedureDetails.departureTransitionIndex === -1 ? 0 : plan.procedureDetails.departureTransitionIndex).catch((err: any) => console.log(JSON.stringify(err)));

      // Put in the enroute waypoints
      const enrouteSegments = plan.segmentsOfType(FlightPlanSegmentType.Enroute);
      const legsToAdd: LegDefinition[] = [];
      for (const segment of enrouteSegments) {
        // get legs in segment and put them into a temp array of legs to sync
        for (const leg of segment.legs) {
          if (FlightPlanAsoboSync.isSyncableLeg(leg.leg)) {
            legsToAdd.push(leg);
          }
        }
      }

      // check if the last leg to sync is the destination airport and, if so, remove that leg from the array of legs to sync.
      if (legsToAdd.length > 0 && legsToAdd[legsToAdd.length - 1].leg.fixIcao === plan.destinationAirport) {
        legsToAdd.pop();
      }

      let globalIndex = 1;
      // sync the array of legs to sync to the sim flight plan
      for (const leg of legsToAdd) {
        try {
          const facType = ICAO.getFacilityType(leg.leg.fixIcao);
          if (facType === FacilityType.USR) {
            const usrFac = await fms.facLoader.getFacility(facType, leg.leg.fixIcao);
            await Coherent.call('ADD_CUSTOM_WAYPOINT', leg.name ?? leg.leg.fixIcao, globalIndex, usrFac.lat, usrFac.lon, false);
          } else {
            await Coherent.call('ADD_WAYPOINT', leg.leg.fixIcao, globalIndex, false);
          }
          globalIndex++;
        } catch (error) {
          console.warn(`Error during fp sync: ${JSON.stringify(error)}`);
        }
      }

      await Coherent.call('SET_ARRIVAL_RUNWAY_INDEX', plan.procedureDetails.arrivalRunwayTransitionIndex === -1 ? 0 : plan.procedureDetails.arrivalRunwayTransitionIndex).catch((err: any) => console.log(JSON.stringify(err)));
      await Coherent.call('SET_ARRIVAL_PROC_INDEX', plan.procedureDetails.arrivalIndex).catch((err: any) => console.log(JSON.stringify(err)));
      await Coherent.call('SET_ARRIVAL_ENROUTE_TRANSITION_INDEX', plan.procedureDetails.arrivalTransitionIndex).catch((err: any) => console.log(JSON.stringify(err)));

      await Coherent.call('SET_APPROACH_INDEX', plan.procedureDetails.approachIndex).then(() => {
        Coherent.call('SET_APPROACH_TRANSITION_INDEX', plan.procedureDetails.approachTransitionIndex).catch((err: any) => console.log(JSON.stringify(err)));
      }).catch((err: any) => console.log(JSON.stringify(err)));

      const activeSegment = WT21FmsUtils.getActiveSegment(plan);
      if (activeSegment?.segmentType === FlightPlanSegmentType.Approach) {
        await Coherent.call('TRY_AUTOACTIVATE_APPROACH').catch((err: any) => console.log(JSON.stringify(err)));
      }

      try {
        const currCrzAlt: number = await Coherent.call('GET_CRUISE_ALTITUDE').catch((err: any) => console.log(JSON.stringify(err)));
        const desiredCrzAlt: number = fms.activePerformancePlan.cruiseAltitude.get() ?? -1;
        if (desiredCrzAlt > -1 && (currCrzAlt === -1 || currCrzAlt < desiredCrzAlt)) {
          await Coherent.call('SET_CRUISE_ALTITUDE', desiredCrzAlt).catch((err: any) => console.log(JSON.stringify(err)));
        }
      } catch (error) {
        console.warn('Error setting cruise altitude: ' + error);
      }

      Coherent.call('RECOMPUTE_ACTIVE_WAYPOINT_INDEX').catch((err: any) => console.log(JSON.stringify(err)));
    } catch (error) {
      console.error(`Error during fp sync: ${error}`);
    }
  }

  /**
   * Checks if a leg is syncable to the stock flight plan system.
   * @param leg the leg to check
   * @returns true if the leg is syncable, false otherwise
   */
  private static isSyncableLeg(leg: FlightPlanLeg): boolean {
    return FlightPlanAsoboSync.nonSyncableLegTypes.indexOf(leg.type) === -1;
  }

  /**
   * Sets the departure procedure or facility if specified
   * @param facility is the origin airport facility record
   * @param data is the flight plan sync data object from the world map
   * @param fms an instance of the fms
   * @returns whether a departure was set.
   */
  private static setDeparture(facility: AirportFacility, data: any, fms: WT21Fms): boolean {
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
      fms.insertDeparture(facility, data.departureProcIndex, data.departureRunwayIndex, enrouteTransitionIndex, originOneWayRunway);
      return true;
    } else if (facility !== undefined) {
      fms.setOrigin(facility, originOneWayRunway);
      return true;
    }
    return false;
  }

  /**
   * Sets the destination airport
   * @param facility is the destination airport facility record
   * @param data is the flight plan sync data object from the world map
   * @param fms an instance of the fms
   * @returns A Promise which is fulfilled with whether a destination was set.
   */
  private static async setDestination(facility: AirportFacility, data: any, fms: WT21Fms): Promise<boolean> {
    let destOneWayRunway = undefined;
    let setDestination = false;
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
      fms.insertArrival(facility, data.arrivalProcIndex, data.arrivalRunwayIndex, enrouteTransitionIndex, destOneWayRunway);
      setDestination = true;
    }

    if (data.approachIndex !== -1) {
      const approachTransitionIndex = data.approachTransitionIndex === 0 &&
        facility.approaches[data.approachIndex].transitions.length < 1 ? -1 : data.approachTransitionIndex;
      await fms.insertApproach(facility, data.approachIndex, approachTransitionIndex);
      setDestination = true;
    }

    if (data.arrivalProcIndex === -1 && data.approachIndex === -1) {
      fms.setDestination(facility);
      setDestination = true;
    }
    return setDestination;
  }

  /**
   * Sets the enroute portion of the flight plan
   * @param data is the flight plan sync data object from the world map
   * @param plan an instance of the flight plan
   * @param fms an instance of the fms
   * @returns the last enroute segment
   */
  private static setEnroute(data: any, plan: FlightPlan, fms: WT21Fms): number {
    const enrouteStart = (data.departureWaypointsSize == -1) ? 1 : data.departureWaypointsSize;
    const enroute = data.waypoints.slice(enrouteStart, -(Math.max(0, data.arrivalWaypointsSize) + 1));
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
        if (currentSegment == 1 && lastDepartureLegIcao == wpt.icao) {
          //do not add this leg and build the airway in this segment
        } else {
          const leg = FlightPlan.createLeg({
            type: LegType.TF,
            fixIcao: wpt.icao
          });
          plan.addLeg(currentSegment, leg);
          if (!lastLegWasAirway) {
            plan.insertSegment(currentSegment + 1, FlightPlanSegmentType.Enroute, wpt.airwayIdent);
            currentSegment += 1;
            // plan.setAirway(currentSegment, segment.airway + '.' + wpt.ident);
          }
        }
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

        plan.setAirway(currentSegment, wpt.airwayIdent + '.' + enroute[i].ident);

        currentSegment += 1;
        plan.insertSegment(currentSegment, FlightPlanSegmentType.Enroute, lastLegWasAirway ? enroute[i].airwayIdent : undefined);

      } else {
        let skip = false;
        if (currentSegment == 1 && lastDepartureLegIcao == wpt.icao) {
          skip = true;
        }
        let leg: FlightPlanLeg | undefined = undefined;
        if (!skip && wpt.icao.trim() == '') {
          const re = /(?:[D][\d])|(?:DLast)|(?:TIMEVERT)|(?:TIMECLIMB)|(?:TIMECRUIS)|(?:TIMEDSCNT)|(?:TIMEAPPROACH)/;
          skip = wpt.ident.match(re) !== null;
        }
        if (!skip && (wpt.ident === 'Custom' || wpt.icao.trim() == '')) {
          const userFacility = UserFacilityUtils.createFromLatLon(`U      USR${custIdx.toString().padStart(2, '0')}`,
            wpt.lla.lat, wpt.lla.long, true, wpt.icao.trim() === '' ? wpt.ident : `Custom ${custIdx.toString().padStart(2, '0')}`);
          fms.addUserFacility(userFacility);
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
   * @param fms an instance of FMS
   */
  private static buildNonAirportOriginLeg(data: any, plan: FlightPlan, fms: WT21Fms): void {
    const wpt = data.waypoints[0];
    if (wpt.ident === 'CUSTD' || wpt.ident === 'CUSTA') {
      const userFacility = UserFacilityUtils.createFromLatLon('U      CUSTD',
        wpt.lla.lat, wpt.lla.long, true, 'Custom Origin');
      fms.addUserFacility(userFacility);
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
   * @param fms an instance of FMS
   * @param lastEnrouteSegment is the last enroute segment
   */
  private static buildNonAirportDestLeg(data: any, plan: FlightPlan, fms: WT21Fms, lastEnrouteSegment: number): void {
    const wpt = data.waypoints[data.waypoints.length - 1];
    if (wpt.ident === 'CUSTD' || wpt.ident === 'CUSTA') {
      const userFacility = UserFacilityUtils.createFromLatLon('U      CUSTA',
        wpt.lla.lat, wpt.lla.long, true, 'Custom Destination');
      fms.addUserFacility(userFacility);
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
}
