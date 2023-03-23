import { FlightPathVector, LegCalculations } from '../flightplan/FlightPlanning';
import { LNavTrackingState, LNavTransitionMode } from './data/LNavEvents';

/**
 * Utility class for working with LNAV.
 */
export class LNavUtils {
  /**
   * Gets the flight path vectors to navigate for a leg and a given transition mode.
   * @param calc The calculations for a flight plan leg.
   * @param mode A transition mode.
   * @param isSuspended Whether sequencing is suspended.
   * @returns The flight path vectors to navigate for the given leg and transition mode.
   */
  public static getVectorsForTransitionMode(calc: LegCalculations, mode: LNavTransitionMode, isSuspended: boolean): FlightPathVector[] {
    switch (mode) {
      case LNavTransitionMode.None:
        return isSuspended ? calc.flightPath : calc.ingressToEgress;
      case LNavTransitionMode.Ingress:
        return calc.ingress;
      case LNavTransitionMode.Egress:
        return calc.egress;
      case LNavTransitionMode.Unsuspend:
        return calc.flightPath;
    }
  }

  /**
   * Checks whether two LNAV tracking states are equal.
   * @param a The first state.
   * @param b The second state.
   * @returns Whether the two LNAV tracking states are equal.
   */
  public static lnavTrackingStateEquals(a: LNavTrackingState, b: LNavTrackingState): boolean {
    return a.isTracking === b.isTracking
      && a.globalLegIndex === b.globalLegIndex
      && a.transitionMode === b.transitionMode
      && a.vectorIndex === b.vectorIndex
      && a.isSuspended === b.isSuspended;
  }
}