import { FlightPlan } from '@microsoft/msfs-sdk';

/**
 * Manages flight plan waypoint records.
 */
export interface MapFlightPlanWaypointRecordManager {

  /**
   * Checks whether this manager is busy with a waypoint refresh.
   * @returns Whether this manager is busy with a waypoint refresh.
   */
  isBusy(): boolean;

  /**
   * Refreshes this manager's waypoint records, keeping them up to date with a specified flight plan.
   * @param flightPlan A flight plan.
   * @param activeLegIndex The global index of the active flight plan leg, or -1 if there is no active leg.
   * @param repick Whether to repick waypoints.
   * @param startIndex The global index of the first flight plan leg from which to pick waypoints, inclusive. Defaults
   * to 0. Ignored if `repick` is false.
   * @param endIndex The global index of the last flight plan leg from which to pick waypoints, inclusive. Defaults to
   * `flightPlan.length - 1`. Ignored if `repick` is false.
   */
  refreshWaypoints(
    flightPlan: FlightPlan | null,
    activeLegIndex: number,
    repick: boolean,
    startIndex?: number,
    endIndex?: number
  ): Promise<void>;
}
