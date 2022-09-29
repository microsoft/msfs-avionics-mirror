import { FlightPlan, GeoProjectionPathStreamStack, LNavTransitionMode } from 'msfssdk';

/**
 * LNav data used by MapFlightPlanPathRenderer.
 */
export type FlightPathPlanRendererLNavData = {
  /** The global leg index of the currently tracked flight plan leg. */
  currentLegIndex: number;

  /** The index of the currently tracked flight path vector. */
  vectorIndex: number;

  /** The currently active LNAV transition mode. */
  transitionMode: LNavTransitionMode;

  /** Whether LNAV sequencing is suspended. */
  isSuspended: boolean;
};

/**
 * Renders the path for flight plans to canvas.
 */
export interface MapFlightPathPlanRenderer {
  /**
   * Renders a flight plan to a canvas.
   * @param plan The flight plan to render.
   * @param context The canvas 2D rendering context to which to render.
   * @param streamStack The path stream stack to which to render.
   * @param renderEntirePlan Whether to render the entire plan. If false, only the active leg and legs after the active
   * leg will be rendered.
   * @param activeLegIndex The global index of the active flight plan leg, or -1 if there is no active leg.
   * @param lnavData LNAV tracking data for the flight plan to render, or undefined if LNAV is not tracking the flight
   * plan.
   * @param obsCourse The active OBS course, or undefined if OBS is not active.
   */
  render(
    plan: FlightPlan,
    context: CanvasRenderingContext2D,
    streamStack: GeoProjectionPathStreamStack,
    renderEntirePlan: boolean,
    activeLegIndex: number,
    lnavData?: FlightPathPlanRendererLNavData,
    obsCourse?: number
  ): void;
}