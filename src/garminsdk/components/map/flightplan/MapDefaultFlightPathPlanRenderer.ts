import {
  AbstractFlightPathPlanRenderer, BitFlags, CircleVector, FlightPathLegLineRenderer, FlightPathLegLineStyle, FlightPathLegRenderPart, FlightPathVectorFlags,
  FlightPlan, GeoProjection, GeoProjectionPathStreamStack, LegDefinition, LegDefinitionFlags, LegType, LNavTrackingState
} from '@microsoft/msfs-sdk';

import { FmsUtils } from '../../../flightplan/FmsUtils';
import {
  FlightPathDefaultLegRenderer, FlightPathDirectToCourseLegRenderer, FlightPathHoldLegRenderer, FlightPathObsLegRenderer, FlightPathProcTurnLegRenderer,
  FlightPathVtfLegRenderer
} from './MapFlightPathLegRenderers';
import { MapFlightPathPlanRenderer } from './MapFlightPathPlanRenderer';
import { MapFlightPathStyles } from './MapFlightPathStyles';

/**
 * The default base-route flight plan renderer for Garmin maps. Only renders non-transition flight path vectors within
 * flight plan legs.
 */
export class DefaultBaseFlightPathPlanRenderer extends AbstractFlightPathPlanRenderer {
  private readonly lineRenderer = new FlightPathLegLineRenderer(this.selectLineStyle.bind(this));
  private readonly dtoCourseRenderer = new FlightPathDirectToCourseLegRenderer();
  private readonly vtfRenderer = new FlightPathVtfLegRenderer();

  /** @inheritdoc */
  protected renderLeg(
    leg: LegDefinition,
    plan: FlightPlan,
    activeLeg: LegDefinition | undefined,
    legIndex: number,
    activeLegIndex: number,
    context: CanvasRenderingContext2D,
    streamStack: GeoProjectionPathStreamStack
  ): void {
    if (!BitFlags.isAll(leg.flags, LegDefinitionFlags.DirectTo) || legIndex === activeLegIndex) {
      switch (leg.leg.type) {
        case LegType.HF:
        case LegType.HM:
        case LegType.HA:
        case LegType.PI:
          break;
        case LegType.CF:
          if (BitFlags.isAll(leg.flags, LegDefinitionFlags.DirectTo)) {
            this.dtoCourseRenderer.render(
              leg, context, streamStack,
              MapFlightPathStyles.BASE_STROKE_WIDTH, MapFlightPathStyles.BASE_STROKE_COLOR
            );
            break;
          } else if (BitFlags.isAll(leg.flags, LegDefinitionFlags.VectorsToFinalFaf)) {
            this.vtfRenderer.render(
              leg, context, streamStack,
              MapFlightPathStyles.BASE_STROKE_WIDTH, MapFlightPathStyles.BASE_STROKE_COLOR
            );
            break;
          }
        // TODO: draw correct base for fallback CF legs.

        // eslint-disable-next-line no-fallthrough
        default:
          this.lineRenderer.render(leg, context, streamStack, FlightPathLegRenderPart.Base);
      }
    }
  }

  /**
   * Selects a line style to render for a vector.
   * @param vector The vector for which to select a style.
   * @param isIngress Whether the vector is part of the ingress transition.
   * @param isEgress Whether the vector is part of the egress transition.
   * @param leg The flight plan leg containing the vector to render.
   * @param projection The map projection to use when rendering.
   * @param out The line style object to which to write the selected style.
   * @returns The selected line style for the vector.
   */
  private selectLineStyle(
    vector: CircleVector,
    isIngress: boolean,
    isEgress: boolean,
    leg: LegDefinition,
    projection: GeoProjection,
    out: FlightPathLegLineStyle
  ): FlightPathLegLineStyle {
    if (this.isRollHeadingVector(vector, leg)) {
      out.strokeWidth = 0;
    } else {
      out.strokeWidth = MapFlightPathStyles.BASE_STROKE_WIDTH;
      out.strokeStyle = MapFlightPathStyles.BASE_STROKE_COLOR;
    }

    out.outlineWidth = 0;
    out.isContinuous = true;

    return out;
  }

  /**
   * Checks if a flight path vector should be styled as a roll-heading vector.
   * @param vector A flight path vector.
   * @param leg The flight plan leg to which the vector belongs.
   * @returns Whether the flight path vector should be styled as a roll-heading vector.
   */
  private isRollHeadingVector(vector: CircleVector, leg: LegDefinition): boolean {
    if (BitFlags.isAny(vector.flags, FlightPathVectorFlags.Fallback)) {
      return true;
    }

    switch (leg.leg.type) {
      case LegType.CF:
        return BitFlags.isAny(vector.flags, FlightPathVectorFlags.InterceptCourse | FlightPathVectorFlags.Direct);
      default:
        return false;
    }
  }
}

/**
 * The default full-route flight plan renderer for Garmin maps. Renders all flight path vectors within flight plan legs,
 * including transition vectors.
 */
export class DefaultFullFlightPathPlanRenderer
  extends AbstractFlightPathPlanRenderer<[lnavData: LNavTrackingState | undefined, isMissedApproachActive: boolean]> {

  private readonly defaultRenderer = new FlightPathDefaultLegRenderer();
  private readonly holdRenderer = new FlightPathHoldLegRenderer();
  private readonly procTurnRenderer = new FlightPathProcTurnLegRenderer();
  private readonly dtoCourseRenderer = new FlightPathDirectToCourseLegRenderer();
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
    lnavData: LNavTrackingState | undefined,
    isMissedApproachActive: boolean
  ): void {
    let width: number, style: string;

    if (legIndex === activeLegIndex) {
      width = MapFlightPathStyles.ACTIVE_STROKE_WIDTH;
      style = MapFlightPathStyles.ACTIVE_STROKE_COLOR;
    } else if (legIndex < activeLegIndex) {
      width = MapFlightPathStyles.PRIOR_STROKE_WIDTH;
      style = MapFlightPathStyles.PRIOR_STROKE_COLOR;
    } else if (!isMissedApproachActive && BitFlags.isAny(leg.flags, LegDefinitionFlags.MissedApproach)) {
      width = MapFlightPathStyles.MISSED_APPROACH_STROKE_WIDTH;
      style = MapFlightPathStyles.MISSED_APPROACH_STROKE_COLOR;
    } else {
      width = MapFlightPathStyles.STROKE_WIDTH;
      style = MapFlightPathStyles.STROKE_COLOR;
    }

    switch (leg.leg.type) {
      case LegType.HF:
      case LegType.HM:
      case LegType.HA:
        this.holdRenderer.render(leg, context, streamStack, plan, activeLeg, legIndex, activeLegIndex, lnavData);
        break;
      case LegType.PI:
        this.procTurnRenderer.render(leg, context, streamStack, plan, activeLeg, legIndex, activeLegIndex);
        break;
      case LegType.CF: {
        if (BitFlags.isAll(leg.flags, LegDefinitionFlags.DirectTo)) {
          this.dtoCourseRenderer.render(leg, context, streamStack, width, style);
          break;
        } else if (BitFlags.isAll(leg.flags, LegDefinitionFlags.VectorsToFinalFaf)) {
          this.vtfRenderer.render(leg, context, streamStack, width, style);
          break;
        }
      }
      // eslint-disable-next-line no-fallthrough
      default:
        this.defaultRenderer.render(
          leg,
          context, streamStack,
          legIndex, activeLegIndex,
          plan.tryGetLeg(legIndex - 1) ?? undefined,
          plan.tryGetLeg(legIndex + 1) ?? undefined,
          isMissedApproachActive
        );
    }
  }
}

/**
 * The default flight plan renderer for Garmin maps.
 */
export class DefaultFlightPathPlanRenderer implements MapFlightPathPlanRenderer {
  private readonly baseRouteRenderer = new DefaultBaseFlightPathPlanRenderer();
  private readonly fullRouteRenderer = new DefaultFullFlightPathPlanRenderer();
  private readonly obsRenderer = new FlightPathObsLegRenderer();

  /** @inheritdoc */
  public render(
    plan: FlightPlan,
    context: CanvasRenderingContext2D,
    streamStack: GeoProjectionPathStreamStack,
    renderEntirePlan: boolean,
    activeLegIndex: number,
    lnavData?: LNavTrackingState,
    obsCourse?: number
  ): void {
    const isObsActive = obsCourse !== undefined;

    const baseRouteStartIndex = this.getBaseRouteStartIndex(plan, renderEntirePlan, activeLegIndex, isObsActive);
    this.baseRouteRenderer.render(plan, baseRouteStartIndex, undefined, context, streamStack);

    if (isObsActive) {
      this.obsRenderer.render(plan.getLeg(activeLegIndex), context, streamStack, obsCourse);
    } else {
      const fullRouteStartIndex = this.getFullRouteStartIndex(plan, renderEntirePlan, activeLegIndex);
      const isMissedApproachActive = activeLegIndex >= 0
        && activeLegIndex < plan.length
        && BitFlags.isAny(plan.getLeg(activeLegIndex).flags, LegDefinitionFlags.MissedApproach);
      this.fullRouteRenderer.render(plan, fullRouteStartIndex, undefined, context, streamStack, lnavData, isMissedApproachActive);
    }
  }

  /**
   * Gets the global index of the first leg for which to render the base route.
   * @param plan The flight plan to render.
   * @param renderEntirePlan Whether to render the entire plan.
   * @param activeLegIndex The global index of the active flight plan leg, or -1 if there is no active leg.
   * @param isObsActive Whether OBS is active.
   * @returns The global index of the first leg for which to render the base route.
   */
  private getBaseRouteStartIndex(plan: FlightPlan, renderEntirePlan: boolean, activeLegIndex: number, isObsActive: boolean): number {
    if (renderEntirePlan) {
      return 0;
    }

    if (activeLegIndex < 0) {
      return plan.length;
    }

    if (isObsActive) {
      return activeLegIndex;
    }

    return Math.max(0, this.getActiveFromLegIndex(plan, activeLegIndex));
  }

  /**
   * Gets the global index of the first leg for which to render the full route.
   * @param plan The flight plan to render.
   * @param renderEntirePlan Whether to render the entire plan.
   * @param activeLegIndex The global index of the active flight plan leg, or -1 if there is no active leg.
   * @returns The global index of the first leg for which to render the full route.
   */
  private getFullRouteStartIndex(plan: FlightPlan, renderEntirePlan: boolean, activeLegIndex: number): number {
    if (renderEntirePlan) {
      return 0;
    }

    if (activeLegIndex < 0) {
      return plan.length;
    }

    return Math.max(0, this.getActiveFromLegIndex(plan, activeLegIndex));
  }

  /**
   * Gets the global index of the leg from which the active leg of a flight plan originates.
   * @param plan A flight plan.
   * @param activeLegIndex The global index of the active flight plan leg.
   * @returns The global index of the leg from which the active leg originates, or -1 if one could not be found.
   */
  private getActiveFromLegIndex(plan: FlightPlan, activeLegIndex: number): number {
    const activeLeg = plan.tryGetLeg(activeLegIndex);

    if (!activeLeg) {
      return -1;
    }

    const segmentIndex = plan.getSegmentIndex(activeLegIndex);
    const segmentLegIndex = activeLegIndex - plan.getSegment(segmentIndex).offset;

    return FmsUtils.getNominalFromLegIndex(plan, segmentIndex, segmentLegIndex);
  }
}