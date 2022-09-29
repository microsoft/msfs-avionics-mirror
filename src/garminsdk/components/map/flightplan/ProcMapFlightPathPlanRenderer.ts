import {
  AbstractFlightPathPlanRenderer, BitFlags, CircleVector, FlightPathLegLineRenderer, FlightPathLegLineStyle, FlightPathLegRenderPart, FlightPathVectorFlags,
  FlightPlan, GeoProjection, GeoProjectionPathStreamStack, LegDefinition, LegDefinitionFlags, LegType
} from 'msfssdk';

import { DefaultBaseFlightPathPlanRenderer } from './MapDefaultFlightPathPlanRenderer';
import {
  FlightPathDefaultLegRenderer, FlightPathHoldLegRenderer, FlightPathLegContinuousLineRenderer, FlightPathProcTurnLegRenderer, FlightPathVtfLegRenderer
} from './MapFlightPathLegRenderers';
import { MapFlightPathProcRenderer } from './MapFlightPathProcRenderer';
import { MapFlightPathStyles } from './MapFlightPathStyles';

/**
 * The full-route renderer for procedure preview flight plan paths. Renders all flight path vectors within flight plan
 * legs, including transition vectors, with support for different styles for procedure and transition previews.
 */
export class ProcMapFullFlightPathPlanRenderer extends AbstractFlightPathPlanRenderer<[isTransition: boolean]> {
  private readonly lineRenderer = new FlightPathLegContinuousLineRenderer();
  private readonly defaultRenderer = new FlightPathDefaultLegRenderer();
  private readonly defaultTransitionRenderer = new FlightPathLegLineRenderer(this.selectTransitionLineStyle.bind(this));
  private readonly holdRenderer = new FlightPathHoldLegRenderer();
  private readonly procTurnRenderer = new FlightPathProcTurnLegRenderer();
  private readonly vtfRenderer = new FlightPathVtfLegRenderer();

  /** @inheritdoc */
  protected renderLeg(
    leg: LegDefinition,
    plan: FlightPlan,
    activeLeg: LegDefinition | undefined,
    legIndex: number,
    activeLegIndex: number,
    context: CanvasRenderingContext2D,
    streamStack: GeoProjectionPathStreamStack,
    isTransition: boolean
  ): void {
    let width, style;

    if (BitFlags.isAny(leg.flags, LegDefinitionFlags.MissedApproach)) {
      width = MapFlightPathStyles.MISSED_APPROACH_STROKE_WIDTH;
      style = MapFlightPathStyles.MISSED_APPROACH_STROKE_COLOR;
    } else if (isTransition) {
      width = MapFlightPathStyles.TRANSITION_STROKE_WIDTH;
      style = MapFlightPathStyles.TRANSITION_STROKE_COLOR;
    } else {
      width = MapFlightPathStyles.STROKE_WIDTH;
      style = MapFlightPathStyles.STROKE_COLOR;
    }

    switch (leg.leg.type) {
      case LegType.HF:
      case LegType.HM:
      case LegType.HA:
        if (isTransition) {
          this.lineRenderer.render(leg, context, streamStack, FlightPathLegRenderPart.Base, width, style);
        } else {
          this.holdRenderer.render(leg, context, streamStack, plan, activeLeg, legIndex, -1, undefined);
        }
        break;
      case LegType.PI:
        this.procTurnRenderer.render(leg, context, streamStack, plan, activeLeg, legIndex, -1);
        break;
      case LegType.CF:
        if (BitFlags.isAll(leg.flags, LegDefinitionFlags.VectorsToFinal)) {
          this.vtfRenderer.render(leg, context, streamStack, width, style);
          break;
        }
      // eslint-disable-next-line no-fallthrough
      default:
        if (isTransition) {
          this.defaultTransitionRenderer.render(leg, context, streamStack, FlightPathLegRenderPart.All);
        } else {
          this.defaultRenderer.render(
            leg,
            context, streamStack,
            legIndex, activeLegIndex,
            plan.tryGetLeg(legIndex - 1) ?? undefined,
            plan.tryGetLeg(legIndex + 1) ?? undefined,
            false
          );
        }
    }
  }

  /**
   * Selects a line style for a vector in a transition preview leg.
   * @param vector The vector for which to select a style.
   * @param isIngress Whether the vector is part of the ingress transition.
   * @param isEgress Whether the vector is part of the egress transition.
   * @param leg The flight plan leg containing the vector to render.
   * @param projection The map projection to use when rendering.
   * @param out The line style object to which to write the selected style.
   * @returns The selected line style for the vector.
   */
  private selectTransitionLineStyle(
    vector: CircleVector,
    isIngress: boolean,
    isEgress: boolean,
    leg: LegDefinition,
    projection: GeoProjection,
    out: FlightPathLegLineStyle
  ): FlightPathLegLineStyle {
    if (BitFlags.isAny(vector.flags, FlightPathVectorFlags.Fallback)) {
      out.strokeWidth = 0;
    } else {
      out.strokeWidth = MapFlightPathStyles.TRANSITION_STROKE_WIDTH;
      out.strokeStyle = MapFlightPathStyles.TRANSITION_STROKE_COLOR;

      if (this.isRollHeadingVector(vector, leg)) {
        out.strokeDash = MapFlightPathStyles.ROLL_HEADING_DASH_ARRAY;
      } else {
        out.strokeDash = null;
      }
    }

    out.outlineWidth = 0;
    out.isContinuous = true;

    return out;
  }

  /**
   * Checks if a flight path vector in a transition preview leg should be styled as a roll-heading vector.
   * @param vector A flight path vector in a transition preview leg.
   * @param leg The flight plan leg to which the vector belongs.
   * @returns Whether the flight path vector should be styled as a roll-heading vector.
   */
  private isRollHeadingVector(vector: CircleVector, leg: LegDefinition): boolean {
    switch (leg.leg.type) {
      case LegType.CF:
        return BitFlags.isAny(vector.flags, FlightPathVectorFlags.InterceptCourse | FlightPathVectorFlags.Direct);
      default:
        return false;
    }
  }
}

/**
 * The default procedure preview renderer for Garmin maps.
 */
export class ProcMapFlightPathPlanRenderer implements MapFlightPathProcRenderer {
  private readonly baseRouteRenderer = new DefaultBaseFlightPathPlanRenderer();
  private readonly fullRouteRenderer = new ProcMapFullFlightPathPlanRenderer();

  /** @inheritdoc */
  public render(
    plan: FlightPlan,
    context: CanvasRenderingContext2D,
    streamStack: GeoProjectionPathStreamStack,
    isTransition = false
  ): void {
    this.baseRouteRenderer.render(plan, undefined, undefined, context, streamStack);
    this.fullRouteRenderer.render(plan, undefined, undefined, context, streamStack, isTransition);
  }
}