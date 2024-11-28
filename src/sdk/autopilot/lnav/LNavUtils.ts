import { FlightPathVector } from '../../flightplan/flightpath/FlightPathVector';
import { LegCalculations } from '../../flightplan/FlightPlanning';
import { LNavTrackingState } from './LNavEvents';
import { LNavTransitionMode } from './LNavTypes';

/**
 * A utility class for working with LNAV.
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

  /**
   * Checks whether an index is a valid LNAV computer index.
   * @param index The index to check.
   * @returns Whether the specified index is a valid LNAV computer index.
   */
  public static isValidLNavIndex(index: number): boolean {
    return Number.isInteger(index) && index >= 0;
  }

  /**
   * Gets the suffix for event bus topics published by a LNAV computer with a given index.
   * @param index The index of the LNAV computer for which to get the suffix.
   * @returns The suffix for event bus topics published by a LNAV computer with the specified index.
   */
  public static getEventBusTopicSuffix<Index extends number>(index: Index): Index extends 0 ? '' : `_${Index}` {
    return (index === 0 ? '' : `_${index}`) as Index extends 0 ? '' : `_${Index}`;
  }
}