import { FlightPlan, GeoProjectionPathStreamStack } from '@microsoft/msfs-sdk';

/**
 * Renders the path for procedure previews to canvas.
 */
export interface MapFlightPathProcRenderer {
  /**
   * Renders a procedure preview flight plan to a canvas.
   * @param plan The flight plan to render.
   * @param context The canvas 2D rendering context to which to render.
   * @param streamStack The path stream stack to which to render.
   * @param isTransition Whether the rendered plan is a transition preview. Defaults to `false`.
   */
  render(
    plan: FlightPlan,
    context: CanvasRenderingContext2D,
    streamStack: GeoProjectionPathStreamStack,
    isTransition?: boolean
  ): void;
}