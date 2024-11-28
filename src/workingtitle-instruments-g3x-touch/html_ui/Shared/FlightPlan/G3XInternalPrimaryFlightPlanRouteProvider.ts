import { FlightPlanRouteUtils, ReadonlyFlightPlanRoute } from '@microsoft/msfs-sdk';

import { GarminFlightPlanRouteProvider } from '@microsoft/msfs-garminsdk';

import { G3XFlightPlanRouteUtils } from './G3XFlightPlanRouteUtils';
import { G3XFms } from './G3XFms';

/**
 * A provider of flight plan routes representing the structure of the internal primary flight plan of an instance of
 * {@link G3XFms}.
 */
export class G3XInternalPrimaryFlightPlanRouteProvider implements GarminFlightPlanRouteProvider {
  /**
   * Creates a new instance of G3XInternalPrimaryFlightPlanRouteProvider.
   * @param fms The FMS containing the primary flight plan from which this provider sources flight plan routes.
   */
  public constructor(private readonly fms: G3XFms) {
  }

  /**
   * Gets a flight plan route representing the structure of the internal primary flight plan loaded in this provider's
   * `G3XFms` instance.
   * @returns A Promise which is fulfilled with the flight plan route representing the structure of the internal
   * primary flight plan loaded in this provider's `G3XFms` instance. The returned Promise is guaranteed to never be
   * rejected.
   */
  public async getRoute(): Promise<ReadonlyFlightPlanRoute> {
    try {
      if (this.fms.hasInternalPrimaryFlightPlan()) {
        return G3XFlightPlanRouteUtils.createRouteFromFlightPlan(
          this.fms.facLoader,
          this.fms.getInternalPrimaryFlightPlan()
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
