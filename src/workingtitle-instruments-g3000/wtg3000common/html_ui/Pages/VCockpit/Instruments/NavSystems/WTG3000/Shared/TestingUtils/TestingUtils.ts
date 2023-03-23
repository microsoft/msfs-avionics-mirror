import {
  AirportFacility, AirwayObject, ApproachTransition,
  EnrouteTransition, Facility, FacilitySearchType, FacilityType,
  GeoPoint, ICAO, IntersectionFacility, OneWayRunway,
  RunwayTransition, RunwayUtils,
} from '@microsoft/msfs-sdk';
import { Fms } from '@microsoft/msfs-garminsdk';

/** A set of functions for modifying a flight plan in the simplest way possible. */
export class TestingUtils {

  /**
   * Sets the origin for the flight plan.
   * @param fms The FMS.
   * @param ident The ICAO to set, like 'KDEN'.
   * @returns The origin facility.
   */
  public static async setOrigin(fms: Fms, ident: string): Promise<AirportFacility> {
    const originResults = await fms.facLoader.searchByIdent(FacilitySearchType.Airport, ident, 1);

    if (originResults && originResults.length === 1) {
      const origin = await fms.facLoader.getFacility(FacilityType.Airport, originResults[0]);

      if (origin) {
        fms.setOrigin(origin);
        return origin;
      }
    }

    throw new Error('error setting origin');
  }

  /**
   * Sets the origin for the flight plan.
   * @param fms The FMS.
   * @param origin The origin facility. Get this by calling setOrigin first.
   * @param runwayName The runway to set, like '34L'.
   * @returns The runway.
   * @throws Error if runway couldn't be found with given inputs.
   */
  public static setOriginRunway(fms: Fms, origin: AirportFacility, runwayName: string): OneWayRunway {

    const runwayNumber = parseInt(runwayName.replace(/[A-Za-z]*/g, ''));

    const runwayDesignationLetter = runwayName.replace(/\d*/g, '');

    const runwayDesignationNumber = runwayDesignationLetter === 'L' ? 1 : runwayDesignationLetter === 'R' ? 2 : 0;

    const runwayNameString = RunwayUtils.getRunwayNameString(runwayNumber, runwayDesignationNumber);

    const runway = RunwayUtils.matchOneWayRunwayFromDesignation(origin, runwayNameString);

    if (runway) {
      fms.setOrigin(origin, runway);
      return runway;
    } else {
      throw new Error('error setting runway');
    }
  }

  /**
   * Sets the destination for the flight plan.
   * @param fms The FMS.
   * @param ident The ICAO to set, like 'KCOS'.
   * @returns The destination facility.
   */
  public static async setDestination(fms: Fms, ident: string): Promise<AirportFacility> {
    const results = await fms.facLoader.searchByIdent(FacilitySearchType.Airport, ident, 1);
    if (results && results.length === 1) {
      const destination = await fms.facLoader.getFacility(FacilityType.Airport, results[0]);
      if (destination) {
        fms.setDestination(destination);
        return destination;
      }
    }

    throw new Error('error setting destination');
  }

  /**
   * Removes the origin.
   * @param fms The FMS.
   */
  public static removeOrigin(fms: Fms): void {
    fms.setOrigin(undefined);
  }

  /**
   * Removes the destination.
   * @param fms The FMS.
   */
  public static removeDestination(fms: Fms): void {
    fms.setDestination(undefined);
  }

  /**
   * Sets the destination for the flight plan.
   * @param fms The FMS.
   * @param ident The ident to search for.
   * @param segmentIndex The index of the segment to add the waypoint to.
   * @param segmentLegIndex The index inside the segment to insert the waypoint at (if none, append).
   * @returns The destination facility.
   */
  public static async insertWaypoint(fms: Fms, ident: string, segmentIndex: number, segmentLegIndex?: number): Promise<Facility> {
    const facility = await this.findNearestFacilityFromIdent(fms, ident);

    fms.insertWaypoint(segmentIndex, facility, segmentLegIndex);

    return facility;
  }

  /**
   * Sets the destination for the flight plan.
   * @param fms The FMS.
   * @param airwayName The name of the airway.
   * @param entryIdent The ident for the airway entry.
   * @param exitIdent The ident for the airway exit.
   * @param segmentIndex The index of the segment to add the waypoint to.
   * @param segmentLegIndex The index inside the segment to insert the waypoint at (if none, append).
   * @returns The destination facility.
   */
  public static async insertAirway(
    fms: Fms,
    airwayName: string,
    entryIdent: string,
    exitIdent: string,
    segmentIndex: number,
    segmentLegIndex: number,
  ): Promise<[AirwayObject, IntersectionFacility, IntersectionFacility]> {
    const entryFacility = await this.findNearestIntersectionFromIdent(fms, entryIdent);
    const exitFacility = await this.findNearestIntersectionFromIdent(fms, exitIdent);
    const airway = await this.getAirwayFromLeg(fms, entryFacility.icao, airwayName);

    fms.insertAirwaySegment(airway, entryFacility, exitFacility, segmentIndex, segmentLegIndex);

    return [airway, entryFacility, exitFacility];
  }

  /**
   * Checks for an airway at a leg and returns the airway.
   * @param fms The Fms.
   * @param entryIdent The icao of the entry to check.
   * @param airwayName The airway to search for.
   * @returns The airway object.
   */
  public static async getAirwayFromLeg(fms: Fms, entryIdent: string, airwayName: string): Promise<AirwayObject> {
    const facility = await fms.facLoader.getFacility(FacilityType.Intersection, entryIdent);
    if (facility) {
      const matchedRoute = facility.routes.find((r) => r.name === airwayName);
      if (matchedRoute) {
        const airway = await fms.facLoader.getAirway(matchedRoute.name, matchedRoute.type, entryIdent);
        return airway;
      }
    }
    throw new Error('airway not found: ' + JSON.stringify({ icao: entryIdent, airwayName }));
  }

  /**
   * Searches for facilities matching ident, returns the nearest one.
   * @param fms The FMS.
   * @param ident The intersection ident to search for.
   * @returns The selected facility.
   */
  public static async findNearestIntersectionFromIdent(fms: Fms, ident: string): Promise<IntersectionFacility> {
    return this.findNearestFacilityFromIdent(fms, ident, FacilitySearchType.Intersection) as Promise<IntersectionFacility>;
  }

  /**
   * Searches for facilities matching ident, returns the nearest one.
   * @param fms The FMS.
   * @param ident The ident to search for.
   * @param facilityType The facility type to search for.
   * @returns The selected facility.
   */
  public static async findNearestFacilityFromIdent(fms: Fms, ident: string, facilityType = FacilitySearchType.All): Promise<Facility> {
    const ppos = fms.ppos;
    const referencePos = new GeoPoint(0, 0).set(ppos.lat, ppos.lon);

    let selectedFacility: Facility | null = null;

    const results = await fms.facLoader.searchByIdent(facilityType, ident);

    if (results) {
      const foundFacilities: Facility[] = [];
      // get facilities for results
      for (let i = 0; i < results.length; i++) {
        const icao = results[i];
        const facIdent = ICAO.getIdent(icao);
        if (facIdent === ident) {
          const fac = await fms.facLoader.getFacility(ICAO.getFacilityType(icao), icao);
          foundFacilities.push(fac);
        }
      }

      if (foundFacilities.length > 1) {
        foundFacilities.sort((a, b) => referencePos.distance(a) - referencePos.distance(b));
        selectedFacility = foundFacilities[0];
      } else if (foundFacilities.length === 1) {
        selectedFacility = foundFacilities[0];
      }
    }

    if (selectedFacility) {
      return selectedFacility;
    } else {
      throw new Error('facility not found with given ident: ' + ident);
    }
  }

  /**
   * Loads a departure.
   * @param fms The FMS.
   * @param origin The origin facility. Get this by calling setOrigin first.
   * @param departureName The departure name, like 'BAYLR6'.
   * @param runwayName The name of the runway, like '34L'.
   * @param transitionName The name of the enroute transition, like 'HBU'.
   * @throws Error if something couldn't be found with given inputs.
   */
  public static loadDeparture(fms: Fms, origin: AirportFacility, departureName: string, runwayName: string, transitionName?: string): void {
    // TODO enroute transition

    const departure = origin.departures.find(x => x.name.toUpperCase() === departureName.toUpperCase());

    if (!departure) {
      throw new Error('could not find departure procedure matching string: ' + departureName
        + '. Possible departures: ' + JSON.stringify(origin.departures.map(x => x.name)));
    }

    const departureIndex = origin.departures.indexOf(departure);

    let transition: EnrouteTransition | undefined;
    let transitionIndex = -1;

    if (transitionName) {
      transition = departure.enRouteTransitions.find(x => x.name.toUpperCase() === transitionName.toUpperCase());

      if (!transition) {
        throw new Error('could not find enroute transition matching string: ' + transitionName
          + '. Possible enroute transitions: ' + JSON.stringify(departure.enRouteTransitions.map(x => x.name)));
      }

      transitionIndex = departure.enRouteTransitions.indexOf(transition);
    }

    const runwayNumber = parseInt(runwayName.replace(/[A-Za-z]*/g, ''));

    const runwayDesignationLetter = runwayName.replace(/\d*/g, '');

    const runwayDesignationNumber = runwayDesignationLetter === 'L' ? 1 : runwayDesignationLetter === 'R' ? 2 : 0;

    const departureRunwayIndex = departure.runwayTransitions.findIndex(x => x.runwayNumber === runwayNumber && x.runwayDesignation === runwayDesignationNumber);

    if (departureRunwayIndex === -1) {
      throw new Error('could not find departureRunwayIndex matching inputs: ' + JSON.stringify({ runwayName, departureName })
        + '. Possible runways: ' + JSON.stringify(departure.runwayTransitions.map(x => ({ runwayNumber: x.runwayNumber, runwayDesignation: x.runwayDesignation }))));
    }

    const runwayNameString = RunwayUtils.getRunwayNameString(runwayNumber, runwayDesignationNumber);

    const runway = RunwayUtils.matchOneWayRunwayFromDesignation(origin, runwayNameString);

    fms.insertDeparture(origin, departureIndex, departureRunwayIndex, transitionIndex, runway);
  }

  /**
   * Loads an arrival.
   * @param fms The FMS.
   * @param destination The destination facility. Get this by calling setDestination first.
   * @param arrivalName The name of the arrival, like 'DBRY4'.
   * @param transitionName The name of the arrival transition, like 'ALS'.
   * @param runwayTransitionName The name of the arrival runway transition, like '17R'.
   * @throws Error if something couldn't be found with given inputs.
   */
  public static loadArrival(fms: Fms, destination: AirportFacility, arrivalName: string, transitionName?: string, runwayTransitionName?: string): void {
    const arrival = destination.arrivals.find(x => x.name.toUpperCase() === arrivalName.toUpperCase());

    if (!arrival) {
      throw new Error('could not find arrival procedure matching string: ' + arrivalName
        + '. Possible arrivals: ' + JSON.stringify(destination.arrivals.map(x => x.name)));
    }

    const arrivalIndex = destination.arrivals.indexOf(arrival);

    let transition: EnrouteTransition | undefined;
    let transitionIndex = -1;

    if (transitionName) {
      transition = arrival.enRouteTransitions.find(x => x.name.toUpperCase() === transitionName.toUpperCase());

      if (!transition) {
        throw new Error('could not find arrival transition matching string: ' + transitionName
          + '. Possible arrival transitions: ' + JSON.stringify(arrival.enRouteTransitions.map(x => x.name)));
      }

      transitionIndex = arrival.enRouteTransitions.indexOf(transition);
    }

    let runwayTransition: RunwayTransition | undefined;
    let runwayTransitionIndex = -1;

    if (runwayTransitionName) {
      runwayTransition = arrival.runwayTransitions.find(x => {
        return RunwayUtils.getRunwayNameString(x.runwayNumber, x.runwayDesignation).toUpperCase() === runwayTransitionName.toUpperCase();
      });

      if (!runwayTransition) {
        throw new Error('could not find arrival runway transition matching string: ' + runwayTransitionName
          + '. Possible arrival runway transitions: '
          + JSON.stringify(arrival.runwayTransitions.map(x => RunwayUtils.getRunwayNameString(x.runwayNumber, x.runwayDesignation))));
      }

      runwayTransitionIndex = arrival.runwayTransitions.indexOf(runwayTransition);
    }

    fms.insertArrival(destination, arrivalIndex, runwayTransitionIndex, transitionIndex);
  }

  /**
   * Loads an approach.
   * @param fms The FMS.
   * @param destination The destination facility. Get this by calling setDestination first.
   * @param approachName The name of the approach, like 'ILS 17L'.
   * @param transitionName The name of the approach transition, like 'BRK' or 'ADANE'.
   * @throws Error if something couldn't be found with given inputs.
   */
  public static async loadApproach(fms: Fms, destination: AirportFacility, approachName: string, transitionName?: string): Promise<void> {

    const approach = destination.approaches.find(x => x.name.toUpperCase().replace(/\s/g, '') === approachName.toUpperCase().replace(/\s/g, ''));

    if (!approach) {
      throw new Error('could not find approach procedure matching string: ' + approachName
        + '. Possible approachs: ' + JSON.stringify(destination.approaches.map(x => x.name)));
    }

    const approachIndex = destination.approaches.indexOf(approach);

    let transition: ApproachTransition | undefined;
    let transitionIndex = -1;

    if (transitionName) {
      transition = approach.transitions.find(x => x.name.toUpperCase() === transitionName.toUpperCase());

      if (!transition) {
        throw new Error('could not find approach transition matching string: ' + transitionName
          + '. Possible approach transitions: ' + JSON.stringify(approach.transitions.map(x => x.name)));
      }

      transitionIndex = approach.transitions.indexOf(transition);
    }

    await fms.insertApproach(destination, approachIndex, transitionIndex);
  }

  /**
   * Creates a direct to random to the given ident.
   * @param fms The Fms.
   * @param ident The ident.
   * @param course The magnetic course for the Direct To. If undefined, the Direct To will be initiated from the
   * airplane's present position.
   * @returns The facility matching the ident.
   */
  public static async directToRandom(fms: Fms, ident: string, course?: number): Promise<Facility> {
    const fac = await this.findNearestFacilityFromIdent(fms, ident);
    fms.createDirectToRandom(fac.icao, course);
    return fac;
  }
}