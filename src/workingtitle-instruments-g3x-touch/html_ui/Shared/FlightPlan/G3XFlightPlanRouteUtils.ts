import {
  BitFlags, FacilityLoader, FacilityType, FlightPlan, FlightPlanRoute, FlightPlanRouteUtils, FlightPlanSegmentType,
  ICAO, LegDefinitionFlags, RunwayUtils
} from '@microsoft/msfs-sdk';

import { GarminFlightPlanRouteUtils } from '@microsoft/msfs-garminsdk';

import { G3XFmsFplUserDataKey, G3XFmsFplUserDataTypeMap } from './G3XFmsFplUserDataTypes';

/**
 * Methods for working with G3X flight plan routes.
 */
export class G3XFlightPlanRouteUtils {
  /**
   * Creates a flight plan route representing the structure of a G3X internal flight plan.
   * @param facLoader The facility loader to use to retrieve facilities referenced in the flight plan.
   * @param flightPlan The flight plan from which to create the route.
   * @returns A flight plan route representing the structure of the specified flight plan.
   */
  public static async createRouteFromFlightPlan(
    facLoader: FacilityLoader,
    flightPlan: FlightPlan
  ): Promise<FlightPlanRoute> {
    const route = FlightPlanRouteUtils.emptyRoute();

    if (flightPlan.originAirport !== undefined && ICAO.isStringV1Facility(flightPlan.originAirport, FacilityType.Airport)) {
      route.departureAirport = ICAO.stringV1ToValue(flightPlan.originAirport);
    }

    if (flightPlan.destinationAirport !== undefined && ICAO.isStringV1Facility(flightPlan.destinationAirport, FacilityType.Airport)) {
      route.destinationAirport = ICAO.stringV1ToValue(flightPlan.destinationAirport);

      const loadedApproach = flightPlan.getUserData<G3XFmsFplUserDataTypeMap[G3XFmsFplUserDataKey.LoadedApproach]>(G3XFmsFplUserDataKey.LoadedApproach);
      if (loadedApproach && loadedApproach.airportIcao === flightPlan.destinationAirport) {
        // Even though VFR approaches can be loaded into G3X internal flight plans, they are not true published IFR
        // approaches, so we will not add the approach to the flight plan route. Instead, we will use the loaded
        // approach to infer a destination runway.

        route.destinationRunway.number = RunwayUtils.getNumberString(loadedApproach.approach.runwayNumber);
        route.destinationRunway.designator = RunwayUtils.getDesignatorLetter(loadedApproach.approach.runwayDesignator);
      }
    }

    for (const segment of flightPlan.segmentsOfType(FlightPlanSegmentType.Enroute)) {
      const enrouteLegs = await Promise.all(
        segment.legs
          // Ignore any legs in direct-to sequences.
          .filter(leg => !BitFlags.isAny(leg.flags, LegDefinitionFlags.DirectTo))
          .map(leg => GarminFlightPlanRouteUtils.legToFlightPlanRouteEnrouteLeg(facLoader, leg.leg))
      );

      for (const leg of enrouteLegs) {
        if (!FlightPlanRouteUtils.isEnrouteLegEmpty(leg)) {
          route.enroute.push(leg);
        }
      }
    }

    return route;
  }
}
