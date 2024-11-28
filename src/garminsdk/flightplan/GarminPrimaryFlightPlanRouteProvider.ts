import { FlightPlanRouteUtils, ReadonlyFlightPlanRoute } from '@microsoft/msfs-sdk';

import { Fms } from './Fms';
import { GarminFlightPlanRouteProvider } from './GarminFlightPlanRouteProvider';
import { GarminFlightPlanRouteUtils } from './GarminFlightPlanRouteUtils';

/**
 * A provider of flight plan routes representing the structure of the primary flight plan of an instance of
 * {@link Fms}.
 */
export class GarminPrimaryFlightPlanRouteProvider implements GarminFlightPlanRouteProvider {
  /**
   * Creates a new instance of GarminPrimaryFlightPlanRouteProvider.
   * @param fms The FMS containing the primary flight plan from which this provider sources flight plan routes.
   */
  public constructor(private readonly fms: Fms) {
  }

  /**
   * Gets a flight plan route representing the structure of the primary flight plan loaded in this provider's `Fms`
   * instance.
   * @returns A Promise which is fulfilled with the flight plan route representing the structure of the primary flight
   * plan loaded in this provider's `Fms` instance. The returned Promise is guaranteed to never be rejected.
   */
  public async getRoute(): Promise<ReadonlyFlightPlanRoute> {
    try {
      if (this.fms.hasPrimaryFlightPlan()) {
        return GarminFlightPlanRouteUtils.createRouteFromFlightPlan(
          this.fms.facLoader,
          this.fms.getPrimaryFlightPlan()
        );
      } else {
        return FlightPlanRouteUtils.emptyRoute();
      }
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        console.error(e.stack);
      }

      return FlightPlanRouteUtils.emptyRoute();
    }
  }
}
