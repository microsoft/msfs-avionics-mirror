import { ReadonlyFlightPlanRoute } from '@microsoft/msfs-sdk';

/**
 * A loader of flight plan routes into Garmin avionics.
 */
export interface GarminFlightPlanRouteLoader {
  /**
   * Checks whether this loader is currently loading a flight plan route.
   */
  isLoadInProgress(): boolean;

  /**
   * Waits until this loader is finished with any in-progress operation to load a flight plan route. If there is no
   * such operation, then the returned Promise is fulfilled immediately. The returned Promise is guaranteed to never be
   * rejected.
   */
  awaitLoad(): Promise<void>;

  /**
   * Loads a flight plan route. This will preempt any existing in-progress route-loading operation.
   * @param route The flight plan route to load.
   * @returns A Promise which is fulfilled when the loading operation ends. The fulfillment value reports whether the
   * operation completed successfully without being cancelled. The returned Promise is guaranteed to never be rejected.
   */
  loadRoute(route: ReadonlyFlightPlanRoute): Promise<boolean>;

  /**
   * Stops any in-progress operation by this loader to load a flight plan route.
   * @returns A Promise which is fulfilled after the in-progress operation to load a flight plan route at the time this
   * method is called has been stopped. If there is no in-progress operation, then the Promise is fulfilled
   * immediately. The returned Promise is guaranteed to never be rejected.
   */
  cancelLoad(): Promise<void>;
}
