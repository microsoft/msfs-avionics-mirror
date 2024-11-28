import { FacilitySearchType, FacilityType, RunwayUtils } from '@microsoft/msfs-sdk';

import { UnsFms } from './UnsFms';

/**
 *
 */
export class UnsDevFlightPlan {

  /**
   * Method to temporarily insert a flight plan on init
   * @param fms The FMS.
   */
  public static async insertDevPlan(fms: UnsFms): Promise<void> {
    setTimeout(async () => {
      await fms.emptyFlightPlan();

      const originResults = await fms.facLoader.searchByIdent(FacilitySearchType.Airport, 'KDTW', 1);
      if (originResults && originResults.length === 1) {
        const origin = await fms.facLoader.getFacility(FacilityType.Airport, originResults[0]);
        if (origin) {
          fms.setOrigin(origin);
          const oneWayRunway = RunwayUtils.matchOneWayRunway(origin, 21, RunwayDesignator.RUNWAY_DESIGNATOR_RIGHT);
          await fms.insertDeparture(origin, 9, 5, -1, oneWayRunway);
        } else {
          //TODO need to be able to send FMS MESSAGE
        }
      }

      const destinationResults = await fms.facLoader.searchByIdent(FacilitySearchType.Airport, 'KCLE', 1);
      if (destinationResults && destinationResults.length === 1) {
        const destination = await fms.facLoader.getFacility(FacilityType.Airport, destinationResults[0]);
        if (destination) {
          fms.setDestination(destination);
          await fms.insertArrival(destination, 0, 1, 2, undefined);
          await fms.insertApproach({ facility: destination, approachIndex: 0, approachTransitionIndex: 1, visualRunwayOffset: 5 });
        } else {
          //TODO need to be able to send FMS MESSAGE
        }
      }

      fms.removeWaypoint(2, 0, false, true);

      fms.activateLeg(0, 1);
    }, 3000);
  }
}
