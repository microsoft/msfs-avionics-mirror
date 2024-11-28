import { FacilityType } from '@microsoft/msfs-sdk';

import { Fms, FmsUtils } from '@microsoft/msfs-garminsdk';
import { GnsFmsUtils } from '../../../Navigation/GnsFmsUtils';

/**
 * A response from a procedure name request.
 */
interface NameResponse {
  /** The short name of the procedure. */
  short: string;

  /** The full name of the procedure. */
  long: string;
}

/**
 * Utilities for the FPL page components.
 */
export class FPLPageUtils {

  /**
   * Gets the departure names for GNS display.
   * @param fms The FMS to get the departure names from.
   * @returns The departure names, or undefined if none.
   */
  public static async getDepartureNames(fms: Fms): Promise<NameResponse | undefined> {
    const plan = fms.getPrimaryFlightPlan();
    if (plan.originAirport !== undefined) {
      const originFacility = await fms.facLoader.getFacility(FacilityType.Airport, plan.originAirport);
      const departure = originFacility?.departures[plan.procedureDetails.departureIndex];
      const transition = plan.procedureDetails.departureTransitionIndex;
      const runway = plan.procedureDetails.originRunway;

      if (originFacility !== undefined && departure !== undefined) {
        return { short: departure.name, long: FmsUtils.getDepartureNameAsString(originFacility, departure, transition, runway) };
      }
    }

    return undefined;
  }

  /**
   * Gets the arrival names for GNS display.
   * @param fms The FMS to get the arrival names from.
   * @returns The arrival names, or undefined if none.
   */
  public static async getArrivalNames(fms: Fms): Promise<NameResponse | undefined> {
    const plan = fms.getPrimaryFlightPlan();

    if (plan.destinationAirport !== undefined) {
      const destinationFacility = await fms.facLoader.getFacility(FacilityType.Airport, plan.destinationAirport);
      const arrival = destinationFacility?.arrivals[plan.procedureDetails.arrivalIndex];
      const transition = plan.procedureDetails.arrivalTransitionIndex;
      const runway = plan.procedureDetails.destinationRunway;

      if (destinationFacility !== undefined && arrival !== undefined) {
        return { short: arrival.name, long: FmsUtils.getArrivalNameAsString(destinationFacility, arrival, transition, runway) };
      }
    }

    return undefined;
  }

  /**
   * Gets the approach names for GNS display.
   * @param fms The FMS to get the approach names from.
   * @returns The approach names, or undefined if none.
   */
  public static async getApproachNames(fms: Fms): Promise<NameResponse | undefined> {
    const plan = fms.getPrimaryFlightPlan();
    if (plan.destinationAirport !== undefined) {
      const destinationFacility = await fms.facLoader.getFacility(FacilityType.Airport, plan.destinationAirport);
      const approach = destinationFacility?.approaches[plan.procedureDetails.approachIndex];

      if (destinationFacility !== undefined && approach !== undefined) {
        return { short: GnsFmsUtils.getApproachNameAsString(approach), long: GnsFmsUtils.getApproachNameAsString(approach) };
      }
    }

    return undefined;
  }
}