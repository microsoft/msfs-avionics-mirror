import {
  BitFlags, CircleVector, FlightPathLegLineRenderer, FlightPathLegLineStyle, FlightPathLegPatternRenderer, FlightPathLegPatternStyle,
  FlightPathLegRenderPart, FlightPathUtils, FlightPathVectorFlags, FlightPlan, GeoCircle, GeoCircleLineRenderer, GeoPoint, GeoProjection,
  GeoProjectionPathStreamStack, LegDefinition, LegDefinitionFlags, LegType, LNavTrackingState, LNavTransitionMode, MagVar, UnitType
} from '@microsoft/msfs-sdk';

import { FlightPathArrowPattern } from './MapFlightPathPatterns';
import { MapFlightPathStyleFlags, MapFlightPathStyles } from './MapFlightPathStyles';

/**
 * Renders flight plan legs as a continuous line.
 */
export class FlightPathLegContinuousLineRenderer extends FlightPathLegLineRenderer<[width: number, style: string, dash?: readonly number[]]> {
  /**
   * Constructor.
   */
  constructor() {
    super((
      vector: CircleVector,
      isIngress: boolean,
      isEgress: boolean,
      leg: LegDefinition,
      projection: GeoProjection,
      out: FlightPathLegLineStyle,
      width: number,
      style: string,
      dash?: readonly number[]
    ): FlightPathLegLineStyle => {
      out.strokeWidth = width;
      out.strokeStyle = style;
      out.strokeDash = dash ?? null;
      out.outlineWidth = 0;
      out.isContinuous = true;

      return out;
    });
  }
}

/**
 * Renders flight plan legs using default styles. Normally, all vectors in the leg are rendered as solid lines of
 * varying width and color based on the leg's parent flight plan segment and relation to the active leg. When the leg's
 * ingress or egress transition is joined to a vector styled as a roll-heading vector, the transition will also be
 * styled as a roll-heading vector.
 */
export class FlightPathDefaultLegRenderer {
  protected readonly arrowPattern = new FlightPathArrowPattern();

  protected readonly legLineRenderer = new FlightPathLegLineRenderer(this.selectLineStyle.bind(this));
  protected readonly legPatternRenderer = new FlightPathLegPatternRenderer(this.selectPatternStyle.bind(this));

  /**
   * Renders a default leg to a canvas.
   * @param leg The leg to render.
   * @param context The canvas 2D rendering context to which to render.
   * @param streamStack The path stream stack to which to render.
   * @param legIndex The global index of the leg to render.
   * @param activeLegIndex The global index of the active flight plan leg.
   * @param prevLeg The leg prior to the leg to render.
   * @param nextLeg The leg after to the leg to render.
   * @param isMissedApproachActive Whether the missed approach is active.
   */
  public render(
    leg: LegDefinition,
    context: CanvasRenderingContext2D,
    streamStack: GeoProjectionPathStreamStack,
    legIndex: number,
    activeLegIndex: number,
    prevLeg: LegDefinition | undefined,
    nextLeg: LegDefinition | undefined,
    isMissedApproachActive: boolean
  ): void {
    const isMissedApproachLeg = BitFlags.isAny(leg.flags, LegDefinitionFlags.MissedApproach);
    const useMissedApproachStyle = !isMissedApproachActive && isMissedApproachLeg;
    const isFirstMissedApproachLeg = isMissedApproachLeg
      && !BitFlags.isAny(prevLeg?.flags ?? 0, LegDefinitionFlags.MissedApproach);

    let styleFlags = 0;

    if (legIndex < activeLegIndex) {
      styleFlags |= MapFlightPathStyleFlags.Prior;
    } else if (useMissedApproachStyle) {
      styleFlags |= MapFlightPathStyleFlags.MissedApproach;
    } else if (legIndex > activeLegIndex) {
      styleFlags |= MapFlightPathStyleFlags.Upcoming;
      if (legIndex === activeLegIndex + 1) {
        styleFlags |= MapFlightPathStyleFlags.Next;
      }
    } else { // legIndex === activeLegIndex
      styleFlags |= MapFlightPathStyleFlags.Active;
    }

    const isIngressRollHeading = (!useMissedApproachStyle || isFirstMissedApproachLeg) && this.isIngressRollHeading(leg, prevLeg);
    const isEgressRollHeading = !useMissedApproachStyle && this.isEgressRollHeading(leg, nextLeg);

    this.arrowPattern.context = context;

    this.legLineRenderer.render(
      leg, context, streamStack, FlightPathLegRenderPart.All, styleFlags, isIngressRollHeading, isEgressRollHeading, useMissedApproachStyle
    );
    this.legPatternRenderer.render(
      leg, context, streamStack, FlightPathLegRenderPart.All, styleFlags, isIngressRollHeading, isEgressRollHeading, useMissedApproachStyle
    );
  }

  /**
   * Checks if an ingress transition following a specified leg should be rendered as roll-heading vectors.
   * @param leg The leg to which the ingress transition belongs.
   * @param prevLeg The leg prior to the leg to which the ingress transition belongs, or `undefined` if there is no
   * such leg.
   * @returns If the ingress transition following the specified leg should be rendered as roll-heading vectors.
   */
  protected isIngressRollHeading(leg: LegDefinition, prevLeg: LegDefinition | undefined): boolean {
    const firstIngressVector = leg.calculated?.ingress[0];

    if (firstIngressVector === undefined) {
      return false;
    }

    if (this.isRollHeadingVector(firstIngressVector, leg)) {
      return true;
    }

    if (BitFlags.isAny(firstIngressVector.flags, FlightPathVectorFlags.LegToLegTurn)) {
      const ingressJoinVector = leg.calculated?.flightPath[leg.calculated.ingressJoinIndex];

      if (ingressJoinVector !== undefined && this.isRollHeadingVector(ingressJoinVector, leg)) {
        return true;
      }

      return prevLeg !== undefined && this.isEgressRollHeading(prevLeg, undefined);
    }

    return false;
  }

  /**
   * Checks if an egress transition prior to a specified leg should be rendered as roll-heading vectors.
   * @param leg The leg to which the egress transition belongs.
   * @param nextLeg The leg after the leg to which the egress transition belongs, or `undefined` if there is no such
   * leg.
   * @returns If the egress transition prior to the specified leg should be rendered as roll-heading vectors.
   */
  protected isEgressRollHeading(leg: LegDefinition, nextLeg: LegDefinition | undefined): boolean {
    const firstEgressVector = leg.calculated?.egress[0];

    if (firstEgressVector === undefined) {
      return false;
    }

    if (this.isRollHeadingVector(firstEgressVector, leg)) {
      return true;
    }

    if (BitFlags.isAny(firstEgressVector.flags, FlightPathVectorFlags.LegToLegTurn)) {
      const egressJoinVector = leg.calculated?.flightPath[leg.calculated.egressJoinIndex];

      if (egressJoinVector !== undefined && this.isRollHeadingVector(egressJoinVector, leg)) {
        return true;
      }

      return nextLeg !== undefined && this.isIngressRollHeading(nextLeg, undefined);
    }

    return false;
  }

  /**
   * Selects a line style to render for a vector.
   * @param vector The vector for which to select a style.
   * @param isIngress Whether the vector is part of the ingress transition.
   * @param isEgress Whether the vector is part of the egress transition.
   * @param leg The flight plan leg containing the vector to render.
   * @param projection The map projection to use when rendering.
   * @param out The line style object to which to write the selected style.
   * @param styleFlags Bit flags describing the style with which to render the line.
   * @param isIngressRollHeading Whether the ingress transition should be rendered as roll-heading vectors.
   * @param isEgressRollHeading Whether the egress transition should be rendered as roll-heading vectors.
   * @param useMissedApproachStyle Whether the missed approach style should be applied to the vector.
   * @returns The selected line style for the vector.
   */
  protected selectLineStyle(
    vector: CircleVector,
    isIngress: boolean,
    isEgress: boolean,
    leg: LegDefinition,
    projection: GeoProjection,
    out: FlightPathLegLineStyle,
    styleFlags: number,
    isIngressRollHeading: boolean,
    isEgressRollHeading: boolean,
    useMissedApproachStyle: boolean
  ): FlightPathLegLineStyle {
    if (
      (isIngress && isIngressRollHeading)
      || (isEgress && isEgressRollHeading)
      || (!isIngress && !isEgress && !useMissedApproachStyle && this.isRollHeadingVector(vector, leg))
    ) {
      return this.selectRollHeadingLineStyle(styleFlags, out);
    } else {
      return this.selectNormalLineStyle(styleFlags, out);
    }
  }

  /**
   * Selects a line style to render for a normal vector.
   * @param styleFlags Bit flags describing the style with which to render the line.
   * @param out The line style object to which to write the selected style.
   * @returns The selected line style for the vector.
   */
  protected selectNormalLineStyle(styleFlags: number, out: FlightPathLegLineStyle): FlightPathLegLineStyle {
    let width, style;

    if (BitFlags.isAny(styleFlags, MapFlightPathStyleFlags.Active)) {
      width = MapFlightPathStyles.ACTIVE_STROKE_WIDTH;
      style = MapFlightPathStyles.ACTIVE_STROKE_COLOR;
    } else if (BitFlags.isAny(styleFlags, MapFlightPathStyleFlags.Prior)) {
      width = MapFlightPathStyles.PRIOR_STROKE_WIDTH;
      style = MapFlightPathStyles.PRIOR_STROKE_COLOR;
    } else if (BitFlags.isAny(styleFlags, MapFlightPathStyleFlags.MissedApproach)) {
      width = MapFlightPathStyles.MISSED_APPROACH_STROKE_WIDTH;
      style = MapFlightPathStyles.MISSED_APPROACH_STROKE_COLOR;
    } else {
      width = MapFlightPathStyles.STROKE_WIDTH;
      style = MapFlightPathStyles.STROKE_COLOR;
    }

    out.strokeWidth = width;
    out.strokeStyle = style;
    out.strokeDash = null;

    out.outlineWidth = 0;
    out.isContinuous = true;

    return out;
  }

  /**
   * Selects a line style to render for a roll-heading vector.
   * @param styleFlags Bit flags describing the style with which to render the line.
   * @param out The line style object to which to write the selected style.
   * @returns The selected line style for the vector.
   */
  protected selectRollHeadingLineStyle(styleFlags: number, out: FlightPathLegLineStyle): FlightPathLegLineStyle {
    let width, style, dash;

    if (BitFlags.isAny(styleFlags, MapFlightPathStyleFlags.Active)) {
      width = MapFlightPathStyles.MAGENTA_ARROW_BG_WIDTH;
      style = MapFlightPathStyles.MAGENTA_ARROW_BG_COLOR;
      dash = null;
    } else if (BitFlags.isAny(styleFlags, MapFlightPathStyleFlags.Next)) {
      width = 0;
      style = '';
      dash = null;
    } else {
      width = MapFlightPathStyles.ROLL_HEADING_DASH_STROKE_WIDTH;
      style = MapFlightPathStyles.STROKE_COLOR;
      dash = MapFlightPathStyles.ROLL_HEADING_DASH_ARRAY;
    }

    out.strokeWidth = width;
    out.strokeStyle = style;
    out.strokeDash = dash;

    out.outlineWidth = 0;
    out.isContinuous = true;

    return out;
  }

  /**
   * Selects a pattern style to render a vector.
   * @param vector The vector for which to select a style.
   * @param isIngress Whether the vector is part of the ingress transition.
   * @param isEgress Whether the vector is part of the egress transition.
   * @param leg The flight plan leg containing the vector to render.
   * @param projection The map projection to use when rendering.
   * @param out The line style object to which to write the selected style.
   * @param styleFlags Bit flags describing the style with which to render the pattern.
   * @param isIngressRollHeading Whether the ingress transition should be rendered as roll-heading vectors.
   * @param isEgressRollHeading Whether the egress transition should be rendered as roll-heading vectors.
   * @param useMissedApproachStyle Whether the missed approach style should be applied to the vector.
   * @returns The selected pattern style for the vector.
   */
  protected selectPatternStyle(
    vector: CircleVector,
    isIngress: boolean,
    isEgress: boolean,
    leg: LegDefinition,
    projection: GeoProjection,
    out: FlightPathLegPatternStyle,
    styleFlags: number,
    isIngressRollHeading: boolean,
    isEgressRollHeading: boolean,
    useMissedApproachStyle: boolean
  ): FlightPathLegPatternStyle {
    if (
      (isIngress && isIngressRollHeading)
      || (isEgress && isEgressRollHeading)
      || (!isIngress && !isEgress && !useMissedApproachStyle && this.isRollHeadingVector(vector, leg))
    ) {
      if (BitFlags.isAny(styleFlags, MapFlightPathStyleFlags.Active)) {
        this.arrowPattern.color = MapFlightPathStyles.ACTIVE_STROKE_COLOR;
        out.pattern = this.arrowPattern;
      } else if (BitFlags.isAny(styleFlags, MapFlightPathStyleFlags.Next)) {
        this.arrowPattern.color = MapFlightPathStyles.STROKE_COLOR;
        out.pattern = this.arrowPattern;
      } else {
        out.pattern = null;
      }
    } else {
      out.pattern = null;
    }

    out.isContinuous = true;

    return out;
  }

  /**
   * Checks whether a vector should be rendered as a roll-heading vector.
   * @param vector A flight path vector.
   * @param leg The flight plan leg containing the vector.
   * @returns Whether the vector should be rendered as a roll-heading vector.
   */
  protected isRollHeadingVector(vector: CircleVector, leg: LegDefinition): boolean {
    if (BitFlags.isAny(
      vector.flags,
      FlightPathVectorFlags.Fallback
      | FlightPathVectorFlags.HoldDirectEntry
      | FlightPathVectorFlags.HoldTeardropEntry
      | FlightPathVectorFlags.HoldParallelEntry
    )) {
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
 * Renders hold legs.
 */
export class FlightPathHoldLegRenderer {
  private readonly arrowPattern = new FlightPathArrowPattern();

  private readonly legContinuousLineRenderer = new FlightPathLegContinuousLineRenderer();
  private readonly legLineRenderer = new FlightPathLegLineRenderer<[number, number]>(this.selectLineStyle.bind(this));
  private readonly legPatternRenderer = new FlightPathLegPatternRenderer<[number, number]>(this.selectPatternStyle.bind(this));

  /**
   * Renders a hold leg to a canvas.
   * @param leg The leg to render.
   * @param context The canvas 2D rendering context to which to render.
   * @param streamStack The path stream stack to which to render.
   * @param plan The flight plan containing the leg to render.
   * @param activeLeg The active flight plan leg.
   * @param legIndex The global index of the leg to render.
   * @param activeLegIndex The global index of the active flight plan leg.
   * @param lnavData LNAV tracking data for the flight plan containing the leg to render, or undefined if LNAV is not
   * tracking the flight plan.
   */
  public render(
    leg: LegDefinition,
    context: CanvasRenderingContext2D,
    streamStack: GeoProjectionPathStreamStack,
    plan: FlightPlan,
    activeLeg: LegDefinition | undefined,
    legIndex: number,
    activeLegIndex: number,
    lnavData: LNavTrackingState | undefined
  ): void {
    const isMissedApproachActive = !!activeLeg && BitFlags.isAny(activeLeg.flags, LegDefinitionFlags.MissedApproach);

    if (BitFlags.isAll(leg.flags, LegDefinitionFlags.MissedApproach) && !isMissedApproachActive) {
      this.legContinuousLineRenderer.render(
        leg, context, streamStack, FlightPathLegRenderPart.Base,
        MapFlightPathStyles.MISSED_APPROACH_STROKE_WIDTH, MapFlightPathStyles.MISSED_APPROACH_STROKE_COLOR
      );
    } else if (legIndex < activeLegIndex || legIndex > activeLegIndex + 1) {
      const partsToRender = leg.leg.type === LegType.HF ? FlightPathLegRenderPart.All : FlightPathLegRenderPart.Base | FlightPathLegRenderPart.Egress;
      this.legLineRenderer.render(leg, context, streamStack, partsToRender, legIndex, activeLegIndex);
    } else if (legIndex === activeLegIndex + 1) {
      this.arrowPattern.color = MapFlightPathStyles.STROKE_COLOR;
      this.arrowPattern.context = context;
      if (leg.leg.type === LegType.HF) {
        // Draw the entire hold as arrows
        this.legPatternRenderer.render(leg, context, streamStack, FlightPathLegRenderPart.All, legIndex, activeLegIndex);
      } else {
        // Draw the entire hold circuit as lines + ingress as arrows on top.
        this.legLineRenderer.render(leg, context, streamStack, FlightPathLegRenderPart.Base, legIndex, activeLegIndex);
        this.legPatternRenderer.render(leg, context, streamStack, FlightPathLegRenderPart.Ingress, legIndex, activeLegIndex);
      }
    } else { // legIndex === activeLegIndex
      let partsToRender = 0;
      if (!lnavData || lnavData.globalLegIndex !== legIndex) {
        partsToRender = leg.leg.type === LegType.HF ? FlightPathLegRenderPart.All : FlightPathLegRenderPart.Ingress | FlightPathLegRenderPart.Base;
      } else {
        partsToRender = FlightPathLegRenderPart.Base;

        if (lnavData.transitionMode === LNavTransitionMode.Ingress) {
          partsToRender |= FlightPathLegRenderPart.Ingress;
        }

        if (!lnavData.isSuspended) {
          partsToRender |= FlightPathLegRenderPart.Egress;
        }
      }

      // Draw the entire hold as arrows, except the inbound leg and egress.

      this.legLineRenderer.render(leg, context, streamStack, partsToRender, legIndex, activeLegIndex);

      this.arrowPattern.color = MapFlightPathStyles.ACTIVE_STROKE_COLOR;
      this.arrowPattern.context = context;
      this.legPatternRenderer.render(
        leg, context, streamStack,
        (FlightPathLegRenderPart.Ingress | FlightPathLegRenderPart.Base) & partsToRender,
        legIndex, activeLegIndex
      );
    }
  }

  /**
   * Selects a line style to render for a hold vector.
   * @param vector The vector for which to select a style.
   * @param isIngress Whether the vector is part of the ingress transition.
   * @param isEgress Whether the vector is part of the egress transition.
   * @param leg The flight plan leg containing the vector to render.
   * @param projection The map projection to use when rendering.
   * @param out The line style object to which to write the selected style.
   * @param legIndex The global index of the flight plan leg to which the vector belongs.
   * @param activeLegIndex The global index of the active flight plan leg.
   * @returns The selected line style for the vector.
   */
  private selectLineStyle(
    vector: CircleVector,
    isIngress: boolean,
    isEgress: boolean,
    leg: LegDefinition,
    projection: GeoProjection,
    out: FlightPathLegLineStyle,
    legIndex: number,
    activeLegIndex: number
  ): FlightPathLegLineStyle {
    let color, width, dash;

    const isInboundOrEgress = isEgress || BitFlags.isAll(vector.flags, FlightPathVectorFlags.HoldInboundLeg);

    if (legIndex < activeLegIndex || legIndex > activeLegIndex + 1) {
      // Draw all vectors as a line with the inbound leg and egress solid and rest dashed.
      width = MapFlightPathStyles.ROLL_HEADING_DASH_STROKE_WIDTH;
      color = legIndex < activeLegIndex ? MapFlightPathStyles.PRIOR_STROKE_COLOR : MapFlightPathStyles.STROKE_COLOR;
      dash = isInboundOrEgress ? null : MapFlightPathStyles.ROLL_HEADING_DASH_ARRAY;
    } else if (legIndex === activeLegIndex + 1) {
      // Draw the ingress with arrows, and the hold circuit as a line with the inbound leg solid and rest dashed.
      width = MapFlightPathStyles.ROLL_HEADING_DASH_STROKE_WIDTH;
      color = MapFlightPathStyles.STROKE_COLOR;
      dash = isInboundOrEgress ? null : MapFlightPathStyles.ROLL_HEADING_DASH_ARRAY;
    } else { // legIndex === activeLegIndex
      // Draw the inbound leg and egress as solid lines, and the rest as magenta arrow background.
      if (isInboundOrEgress) {
        width = MapFlightPathStyles.ACTIVE_STROKE_WIDTH;
        color = MapFlightPathStyles.ACTIVE_STROKE_COLOR;
      } else {
        width = MapFlightPathStyles.MAGENTA_ARROW_BG_WIDTH;
        color = MapFlightPathStyles.MAGENTA_ARROW_BG_COLOR;
      }

      dash = null;
    }

    out.strokeWidth = width;
    out.strokeStyle = color;
    out.strokeDash = dash;
    out.outlineWidth = 0;
    out.isContinuous = true;

    return out;
  }

  /**
   * Selects a pattern style to render for a hold vector.
   * @param vector The vector for which to select a style.
   * @param isIngress Whether the vector is part of the ingress transition.
   * @param isEgress Whether the vector is part of the egress transition.
   * @param leg The flight plan leg containing the vector to render.
   * @param projection The map projection to use when rendering.
   * @param out The line style object to which to write the selected style.
   * @param legIndex The global index of the flight plan leg to which the vector belongs.
   * @param activeLegIndex The global index of the active flight plan leg.
   * @returns The selected pattern style for the vector.
   */
  private selectPatternStyle(
    vector: CircleVector,
    isIngress: boolean,
    isEgress: boolean,
    leg: LegDefinition,
    projection: GeoProjection,
    out: FlightPathLegPatternStyle,
    legIndex: number,
    activeLegIndex: number
  ): FlightPathLegPatternStyle {
    if (legIndex !== activeLegIndex || !(isEgress || BitFlags.isAll(vector.flags, FlightPathVectorFlags.HoldInboundLeg))) {
      out.pattern = this.arrowPattern;
    } else {
      out.pattern = null;
    }

    out.isContinuous = true;

    return out;
  }
}

/**
 * Renders procedure turn legs.
 */
export class FlightPathProcTurnLegRenderer {
  private readonly arrowPattern: FlightPathArrowPattern;

  private readonly legLineRenderer: FlightPathLegContinuousLineRenderer;
  private readonly legPatternRenderer: FlightPathLegPatternRenderer;

  /**
   * Constructor.
   */
  constructor() {
    this.arrowPattern = new FlightPathArrowPattern();
    this.arrowPattern.color = MapFlightPathStyles.ACTIVE_STROKE_COLOR;

    this.legLineRenderer = new FlightPathLegContinuousLineRenderer();
    this.legPatternRenderer = new FlightPathLegPatternRenderer(
      (
        vector: CircleVector,
        isIngress: boolean,
        isEgress: boolean,
        leg: LegDefinition,
        projection: GeoProjection,
        out: FlightPathLegPatternStyle
      ): FlightPathLegPatternStyle => {
        out.pattern = this.arrowPattern;
        out.isContinuous = true;
        return out;
      }
    );
  }

  /**
   * Renders a procedure turn leg to a canvas.
   * @param leg The leg to render.
   * @param context The canvas 2D rendering context to which to render.
   * @param streamStack The path stream stack to which to render.
   * @param plan The flight plan containing the leg to render.
   * @param activeLeg The active flight plan leg.
   * @param legIndex The global index of the leg to render.
   * @param activeLegIndex The global index of the active flight plan leg.
   */
  public render(
    leg: LegDefinition,
    context: CanvasRenderingContext2D,
    streamStack: GeoProjectionPathStreamStack,
    plan: FlightPlan,
    activeLeg: LegDefinition | undefined,
    legIndex: number,
    activeLegIndex: number
  ): void {
    const isMissedApproachActive = !!activeLeg && BitFlags.isAny(activeLeg.flags, LegDefinitionFlags.MissedApproach);

    if (legIndex === activeLegIndex) {
      this.legLineRenderer.render(
        leg, context, streamStack, FlightPathLegRenderPart.All, MapFlightPathStyles.MAGENTA_ARROW_BG_WIDTH, MapFlightPathStyles.MAGENTA_ARROW_BG_COLOR
      );
      this.arrowPattern.context = context;
      this.legPatternRenderer.render(leg, context, streamStack, FlightPathLegRenderPart.All);
    } else {
      let width, style;
      if (BitFlags.isAll(leg.flags, LegDefinitionFlags.MissedApproach) && !isMissedApproachActive) {
        width = MapFlightPathStyles.MISSED_APPROACH_STROKE_WIDTH;
        style = MapFlightPathStyles.MISSED_APPROACH_STROKE_COLOR;
      } else if (legIndex < activeLegIndex) {
        width = MapFlightPathStyles.ROLL_HEADING_DASH_STROKE_WIDTH;
        style = MapFlightPathStyles.PRIOR_STROKE_COLOR;
      } else {
        width = MapFlightPathStyles.ROLL_HEADING_DASH_STROKE_WIDTH;
        style = MapFlightPathStyles.STROKE_COLOR;
      }

      this.legLineRenderer.render(leg, context, streamStack, FlightPathLegRenderPart.All, width, style, MapFlightPathStyles.ROLL_HEADING_DASH_ARRAY);
    }
  }
}

/**
 * Renders Direct-To legs with user-defined courses. Each leg is rendered as a single line following a 500-nautical
 * mile great-circle path along the Direct-To course terminating at the end of the leg.
 */
export class FlightPathDirectToCourseLegRenderer {
  private static readonly geoPointCache = [new GeoPoint(0, 0), new GeoPoint(0, 0)];
  private static readonly geoCircleCache = [new GeoCircle(new Float64Array(3), 0)];

  private readonly lineRenderer = new GeoCircleLineRenderer();

  /**
   * Renders a Direct-To leg with user-defined course to a canvas.
   * @param leg The leg to render.
   * @param context The canvas 2D rendering context to which to render.
   * @param streamStack The path stream stack to which to render.
   * @param width The width of the rendered line.
   * @param style The style of the rendered line.
   * @param dash The dash array of the rendered line. Defaults to no dash.
   */
  public render(
    leg: LegDefinition,
    context: CanvasRenderingContext2D,
    streamStack: GeoProjectionPathStreamStack,
    width: number,
    style: string,
    dash?: readonly number[]
  ): void {
    // The leg should have a single base great-circle flight path vector ending at the direct-to fix
    const vector = leg.calculated?.flightPath[0];

    if (!vector) {
      return;
    }

    const dtoFix = FlightPathDirectToCourseLegRenderer.geoPointCache[0].set(vector.endLat, vector.endLon);
    const dtoPath = FlightPathUtils.setGeoCircleFromVector(vector, FlightPathDirectToCourseLegRenderer.geoCircleCache[0]);
    const start = dtoPath.offsetDistanceAlong(dtoFix, UnitType.NMILE.convertTo(-500, UnitType.GA_RADIAN), FlightPathDirectToCourseLegRenderer.geoPointCache[1], Math.PI);

    this.lineRenderer.render(dtoPath, start.lat, start.lon, dtoFix.lat, dtoFix.lon, context, streamStack, width, style, dash);
  }
}

/**
 * Renders OBS legs. Each leg is rendered as two lines: a magenta 500-nautical mile great-circle path along the OBS
 * course terminating at the end of the leg, and a white 500-nautical mile great-circle path along the OBS course
 * starting at the end of the leg.
 */
export class FlightPathObsLegRenderer {
  private static readonly geoPointCache = [new GeoPoint(0, 0), new GeoPoint(0, 0)];
  private static readonly geoCircleCache = [new GeoCircle(new Float64Array(3), 0)];

  private readonly lineRenderer = new GeoCircleLineRenderer();

  /**
   * Renders an OBS leg to a canvas.
   * @param leg The leg to render.
   * @param context The canvas 2D rendering context to which to render.
   * @param streamStack The path stream stack to which to render.
   * @param course The OBS course, in degrees magnetic.
   */
  public render(
    leg: LegDefinition,
    context: CanvasRenderingContext2D,
    streamStack: GeoProjectionPathStreamStack,
    course: number
  ): void {
    if (leg.calculated?.endLat === undefined || leg.calculated?.endLon === undefined) {
      return;
    }

    const obsFix = FlightPathObsLegRenderer.geoPointCache[0].set(leg.calculated.endLat, leg.calculated.endLon);
    const obsLat = obsFix.lat;
    const obsLon = obsFix.lon;

    const obsCourseTrue = MagVar.magneticToTrue(course, obsLat, obsLon);
    const obsPath = FlightPathObsLegRenderer.geoCircleCache[0].setAsGreatCircle(obsFix, obsCourseTrue);

    const start = obsPath.offsetDistanceAlong(obsFix, UnitType.NMILE.convertTo(-500, UnitType.GA_RADIAN), FlightPathObsLegRenderer.geoPointCache[1]);
    const startLat = start.lat;
    const startLon = start.lon;

    const end = obsPath.offsetDistanceAlong(obsFix, UnitType.NMILE.convertTo(500, UnitType.GA_RADIAN), FlightPathObsLegRenderer.geoPointCache[1]);
    const endLat = end.lat;
    const endLon = end.lon;

    this.lineRenderer.render(obsPath, startLat, startLon, obsLat, obsLon, context, streamStack, 4, 'magenta');
    this.lineRenderer.render(obsPath, obsLat, obsLon, endLat, endLon, context, streamStack, 4, 'white');
  }
}

/**
 * Renders vectors-to-final legs. Each leg is rendered as a line representing a 30-nautical mile great-circle path
 * along the VTF course terminating at the end of the leg.
 */
export class FlightPathVtfLegRenderer {
  private static readonly geoPointCache = [new GeoPoint(0, 0), new GeoPoint(0, 0)];
  private static readonly geoCircleCache = [new GeoCircle(new Float64Array(3), 0)];

  private readonly lineRenderer = new GeoCircleLineRenderer();

  /**
   * Renders a vectors-to-final leg to a canvas.
   * @param leg The leg to render.
   * @param context The canvas 2D rendering context to which to render.
   * @param streamStack The path stream stack to which to render.
   * @param width The width of the rendered line.
   * @param style The style of the rendered line.
   * @param dash The dash array of the rendered line. Defaults to no dash.
   */
  public render(
    leg: LegDefinition,
    context: CanvasRenderingContext2D,
    streamStack: GeoProjectionPathStreamStack,
    width: number,
    style: string,
    dash?: readonly number[]
  ): void {
    // VTF legs have their terminator coordinates and course written to the lat/lon and course properties, respectively.

    if (leg.calculated === undefined || leg.leg.lat === undefined || leg.leg.lon === undefined) {
      return;
    }

    const course = leg.leg.trueDegrees ? leg.leg.course : MagVar.magneticToTrue(leg.leg.course, leg.calculated.courseMagVar);

    const end = FlightPathVtfLegRenderer.geoPointCache[0].set(leg.leg.lat, leg.leg.lon);
    const path = FlightPathVtfLegRenderer.geoCircleCache[0].setAsGreatCircle(end, course);
    const start = path.offsetDistanceAlong(end, UnitType.NMILE.convertTo(-30, UnitType.GA_RADIAN), FlightPathVtfLegRenderer.geoPointCache[1]);

    this.lineRenderer.render(path, start.lat, start.lon, end.lat, end.lon, context, streamStack, width, style, dash);
  }
}