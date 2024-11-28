import { FacilitySearchType, FacilityType } from '@microsoft/msfs-sdk';

import { Fms } from '@microsoft/msfs-garminsdk';

/**
 *
 */
export class GNSTempDevFlightPlan {

  /**
   * Method to temporarily insert a flight plan on init
   * @param fms The FMS.
   */
  public static async insertDevPlan(fms: Fms): Promise<void> {
    setTimeout(async () => {
      await fms.emptyPrimaryFlightPlan();

      const originResults = await fms.facLoader.searchByIdent(FacilitySearchType.Airport, 'KENW', 1);
      if (originResults && originResults.length === 1) {
        const origin = await fms.facLoader.getFacility(FacilityType.Airport, originResults[0]);
        if (origin) {
          fms.setOrigin(origin);
        } else {
          //TODO need to be able to send FMS MESSAGE
        }
      }

      const destinationResults = await fms.facLoader.searchByIdent(FacilitySearchType.Airport, 'KDPA', 1);
      if (destinationResults && destinationResults.length === 1) {
        const destination = await fms.facLoader.getFacility(FacilityType.Airport, destinationResults[0]);
        if (destination) {
          fms.setDestination(destination);
          await fms.insertApproach(destination, 5, 1, undefined, undefined, true);
        } else {
          //TODO need to be able to send FMS MESSAGE
        }
      }

      fms.activateLeg(0, 1);

    }, 3000);
  }
}