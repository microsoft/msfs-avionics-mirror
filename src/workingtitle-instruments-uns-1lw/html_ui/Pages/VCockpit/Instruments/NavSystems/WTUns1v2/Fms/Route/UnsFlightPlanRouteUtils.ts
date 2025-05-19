import {
  AirportFacilityDataFlags, ApproachUtils, ArrayUtils, BitFlags, FacilityLoader, FacilityType, FlightPlan,
  FlightPlanLeg, FlightPlanRoute, FlightPlanRouteEnrouteLeg, FlightPlanRouteUtils, FlightPlanSegmentType,
  FlightPlanUtils, ICAO, LegDefinitionFlags, LegType, RunwayUtils
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

    const originAirport = flightPlan.originAirportIcao && ICAO.isValueFacility(flightPlan.originAirportIcao, FacilityType.Airport)
      ? await facLoader.getFacility(
        FacilityType.Airport,
        flightPlan.originAirportIcao,
        AirportFacilityDataFlags.Departures
      ).catch(() => undefined)
      : undefined;

    if (originAirport) {
      route.departureAirport = originAirport.icaoStruct;

      if (procedureDetails.originRunway) {
        RunwayUtils.getIdentifierFromOneWayRunway(procedureDetails.originRunway, route.departureRunway);
      }

      // The flight plan route only supports departures on the origin airport.
      if (
        procedureDetails.departureFacilityIcaoStruct
        && ICAO.valueEquals(procedureDetails.departureFacilityIcaoStruct, originAirport.icaoStruct)
        && procedureDetails.departureIndex >= 0
      ) {
        const departure = originAirport.departures[procedureDetails.departureIndex];
        if (departure) {
          route.departure = departure.name;

          if (procedureDetails.departureTransitionIndex >= 0 && procedureDetails.departureTransitionIndex < departure.enRouteTransitions.length) {
            route.departureTransition = departure.enRouteTransitions[procedureDetails.departureTransitionIndex].name;
          }
        }
      }
    }

    const destinationAirport = flightPlan.destinationAirportIcao && ICAO.isValueFacility(flightPlan.destinationAirportIcao, FacilityType.Airport)
      ? await facLoader.getFacility(
        FacilityType.Airport,
        flightPlan.destinationAirportIcao,
        AirportFacilityDataFlags.Arrivals | AirportFacilityDataFlags.Approaches
      ).catch(() => undefined)
      : undefined;

    if (destinationAirport) {
      route.destinationAirport = destinationAirport.icaoStruct;

      if (procedureDetails.destinationRunway) {
        RunwayUtils.getIdentifierFromOneWayRunway(procedureDetails.destinationRunway, route.destinationRunway);
      }

      // The flight plan route only supports arrivals on the destination airport.
      if (
        procedureDetails.arrivalFacilityIcaoStruct
        && ICAO.valueEquals(procedureDetails.arrivalFacilityIcaoStruct, destinationAirport.icaoStruct)
        && procedureDetails.arrivalIndex >= 0
      ) {
        const arrival = destinationAirport.arrivals[procedureDetails.arrivalIndex];
        if (arrival) {
          route.arrival = arrival.name;

          if (procedureDetails.arrivalTransitionIndex >= 0 && procedureDetails.arrivalTransitionIndex < arrival.enRouteTransitions.length) {
            route.arrivalTransition = arrival.enRouteTransitions[procedureDetails.arrivalTransitionIndex].name;
          }
        }
      }

      // The flight plan route only supports approaches on the destination airport.
      if (
        procedureDetails.approachFacilityIcaoStruct
        && ICAO.valueEquals(procedureDetails.approachFacilityIcaoStruct, destinationAirport.icaoStruct)
        && procedureDetails.approachIndex >= 0
      ) {
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
        if (exit && segment.airway.length < 8) {
          const enrouteLeg = FlightPlanRouteUtils.emptyEnrouteLeg();
          enrouteLeg.fixIcao = exit.leg.fixIcaoStruct;
          enrouteLeg.via = segment.airway;
          route.enroute.push(enrouteLeg);
          continue;
        }
        // If we weren't able to get a valid airway name or exit, then we will let the code fall through to below,
        // which will effectively flatten the airway into a sequence of direct legs.
      }

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
          const facility = await facLoader.getFacility(FacilityType.USR, leg.fixIcaoStruct).catch(() => undefined);
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
