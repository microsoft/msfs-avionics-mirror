import {
  ApproachUtils, ArrayUtils, BitFlags, FacilityLoader, FacilityType, FlightPlan, FlightPlanLeg, FlightPlanRoute,
  FlightPlanRouteEnrouteLeg, FlightPlanRouteUtils, FlightPlanSegmentType, FlightPlanUtils, ICAO, LegDefinitionFlags,
  LegType, RunwayUtils
} from '@microsoft/msfs-sdk';

import { UnsExtraLegDefinitionFlags } from '../UnsFmsTypes';

/**
 * Methods for working with WT21 flight plan routes.
 */
export class UnsFlightPlanRouteUtils {
  /** The default name for flight plan modification batches opened when loading a flight plan route into a flight plan. */
  public static readonly DEFAULT_LOAD_ROUTE_BATCH_NAME = 'flight-plan-route-load';

  /**
   * Creates a flight plan route representing the structure of a flight plan.
   * @param facLoader The facility loader to use to retrieve facilities referenced in the flight plan.
   * @param flightPlan The flight plan from which to create the route.
   * @returns A flight plan route representing the structure of the specified flight plan.
   */
  public static async createRouteFromFlightPlan(
    facLoader: FacilityLoader,
    flightPlan: FlightPlan
  ): Promise<FlightPlanRoute> {
    const route = FlightPlanRouteUtils.emptyRoute();

    const procedureDetails = flightPlan.procedureDetails;

    const originAirport = flightPlan.originAirport !== undefined && ICAO.isStringV1Facility(flightPlan.originAirport, FacilityType.Airport)
      ? await facLoader.getFacility(FacilityType.Airport, flightPlan.originAirport).catch(() => undefined)
      : undefined;

    if (originAirport) {
      route.departureAirport = ICAO.stringV1ToValue(originAirport.icao);

      if (procedureDetails.originRunway) {
        RunwayUtils.getIdentifierFromOneWayRunway(procedureDetails.originRunway, route.departureRunway);
      }

      // The flight plan route only supports departures on the origin airport.
      if (procedureDetails.departureFacilityIcao === flightPlan.originAirport && procedureDetails.departureIndex >= 0) {
        const departure = originAirport.departures[procedureDetails.departureIndex];
        if (departure) {
          route.departure = departure.name;

          if (procedureDetails.departureTransitionIndex >= 0 && procedureDetails.departureTransitionIndex < departure.enRouteTransitions.length) {
            route.departureTransition = departure.enRouteTransitions[procedureDetails.departureTransitionIndex].name;
          }
        }
      }
    }

    const destinationAirport = flightPlan.destinationAirport !== undefined && ICAO.isStringV1Facility(flightPlan.destinationAirport, FacilityType.Airport)
      ? await facLoader.getFacility(FacilityType.Airport, flightPlan.destinationAirport).catch(() => undefined)
      : undefined;

    if (destinationAirport) {
      route.destinationAirport = ICAO.stringV1ToValue(destinationAirport.icao);

      if (procedureDetails.destinationRunway) {
        RunwayUtils.getIdentifierFromOneWayRunway(procedureDetails.destinationRunway, route.destinationRunway);
      }

      // The flight plan route only supports arrivals on the destination airport.
      if (procedureDetails.arrivalFacilityIcao === flightPlan.destinationAirport && procedureDetails.arrivalIndex >= 0) {
        const arrival = destinationAirport.arrivals[procedureDetails.arrivalIndex];
        if (arrival) {
          route.arrival = arrival.name;

          if (procedureDetails.arrivalTransitionIndex >= 0 && procedureDetails.arrivalTransitionIndex < arrival.enRouteTransitions.length) {
            route.arrivalTransition = arrival.enRouteTransitions[procedureDetails.arrivalTransitionIndex].name;
          }
        }
      }

      // The flight plan route only supports approaches on the destination airport.
      if (procedureDetails.approachFacilityIcao === flightPlan.destinationAirport && procedureDetails.approachIndex >= 0) {
        const approach = destinationAirport.approaches[procedureDetails.approachIndex];
        if (approach) {
          route.approach.type = ApproachUtils.typeToName(approach.approachType);

          route.approach.runway.number = RunwayUtils.getNumberString(approach.runwayNumber);
          route.approach.runway.designator = RunwayUtils.getDesignatorLetter(approach.runwayDesignator);

          route.approach.suffix = approach.approachSuffix;

          if (procedureDetails.approachTransitionIndex >= 0 && procedureDetails.approachTransitionIndex < approach.transitions.length) {
            route.approachTransition = approach.transitions[procedureDetails.approachTransitionIndex].name;
          }
        }
      }
    }

    for (const segment of flightPlan.segmentsOfType(FlightPlanSegmentType.Enroute)) {
      if (segment.airway) {
        const exit = ArrayUtils.peekLast(segment.legs);
        if (exit) {
          const enrouteLeg = FlightPlanRouteUtils.emptyEnrouteLeg();
          enrouteLeg.fixIcao = exit.leg.fixIcaoStruct;
          enrouteLeg.via = segment.airway;
          route.enroute.push(enrouteLeg);
        }
      } else {
        const enrouteLegs = await Promise.all(
          segment.legs
            .filter(leg => {
              // Ignore discontinuity legs and any legs in direct-to sequences and displaced legs (all displaced legs
              // come from procedure segments, and they may contain non-TF leg types).
              return FlightPlanUtils.isDiscontinuityLeg(leg.leg.type)
                || !BitFlags.isAny(leg.flags, LegDefinitionFlags.DirectTo | UnsExtraLegDefinitionFlags.DisplacedActiveLeg);
            })
            .map(leg => UnsFlightPlanRouteUtils.legToFlightPlanRouteEnrouteLeg(facLoader, leg.leg))
        );

        for (const leg of enrouteLegs) {
          if (!FlightPlanRouteUtils.isEnrouteLegEmpty(leg)) {
            route.enroute.push(leg);
          }
        }
      }
    }

    return route;
  }

  /**
   * Converts a flight plan leg into a flight plan route enroute leg.
   * @param facLoader The facility loader to use to retrieve facilities referenced in the flight plan leg.
   * @param leg The flight plan leg.
   * @param out The flight plan route enroute leg object to which to write the results. If not defined, then a new
   * object will be created.
   * @returns The converted flight plan route enroute leg. If the specified flight plan leg could not be converted,
   * then the converted enroute leg will be empty.
   */
  public static async legToFlightPlanRouteEnrouteLeg(
    facLoader: FacilityLoader,
    leg: FlightPlanLeg,
    out?: FlightPlanRouteEnrouteLeg
  ): Promise<FlightPlanRouteEnrouteLeg> {
    if (out) {
      FlightPlanRouteUtils.toEmptyEnrouteLeg(out);
    } else {
      out = FlightPlanRouteUtils.emptyEnrouteLeg();
    }

    // Only IF and TF legs are eligible to be enroute legs.
    switch (leg.type) {
      case LegType.IF:
      case LegType.TF:
        break;
      default:
        return out;
    }

    if (leg.lat !== undefined && leg.lon !== undefined) {
      out.hasLatLon = true;
      out.lat = leg.lat;
      out.lon = leg.lon;
    } else if (ICAO.isValueFacility(leg.fixIcaoStruct)) {
      switch (ICAO.getFacilityTypeFromValue(leg.fixIcaoStruct)) {
        case FacilityType.Airport:
        case FacilityType.VOR:
        case FacilityType.NDB:
        case FacilityType.Intersection:
          out.fixIcao = leg.fixIcaoStruct;
          break;
        case FacilityType.USR: {
          const facility = await facLoader.getFacility(FacilityType.USR, leg.fixIcao).catch(() => undefined);
          if (facility) {
            out.hasLatLon = true;
            out.lat = facility.lat;
            out.lon = facility.lon;
          }
          break;
        }
      }
    }

    return out;
  }
}
