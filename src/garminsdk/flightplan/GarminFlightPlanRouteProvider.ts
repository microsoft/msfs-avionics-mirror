import { ReadonlyFlightPlanRoute } from '@microsoft/msfs-sdk';

/**
 * A provider of Garmin flight plan routes.
 */
export interface GarminFlightPlanRouteProvider {
  /**
   * Gets a flight plan route.
   * @returns A Promise which is fulfilled with a flight plan route. The returned Promise is guaranteed to never be
   * rejected.
   */
  getRoute(): Promise<ReadonlyFlightPlanRoute>;
}
