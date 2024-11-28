import { FlightPathVector, FlightPlan, LegDefinition } from '../../flightplan';
import { Subscribable } from '../../sub';
import { Subject } from '../../sub/Subject';
import {
  AbstractFlightPathLegRenderer, AbstractFlightPathPlanRenderer, FlightPathLegRenderPart, FlightPathPlanRenderOrder, FlightPathVectorLineRenderer,
  GeoProjectionPathStreamStack
} from '../map';

/**
 * A handler that takes some vector data and returns the appropriate flight path rendering style.
 */
export type VectorStyleHandler = (vector: Readonly<FlightPathVector>, isIngress: boolean, isEgress: boolean) => FlightPathRenderStyle;

/**
 * A handler that takes some leg data and returns the appropriate flight path rendering style.
 */
export type LegStyleHandler = (plan: FlightPlan, leg: LegDefinition, activeLeg: LegDefinition | undefined, legIndex: number,
  activeLegIndex: number,) => FlightPathRenderStyle | FlightPathVectorStyle;

/**
 * A handler that takes some leg data and returns the waypoint rendering role that the
 * waypoint should be rendered under.
 */
export type LegWaypointHandler = (plan: FlightPlan, leg: LegDefinition, activeLeg: LegDefinition | null, legIndex: number, activeLegIndex: number) => number;

/**
 * A map flight plan renderer that can be supplied styling from the outside.
 */
export class MapSystemPlanRenderer extends AbstractFlightPathPlanRenderer {

  /**
   * Creates an instance of the MapSystemPlanRenderer.
   * @param defaultRoleId The default role ID to render the plan waypoints under.
   * @param renderOrder The order which this renderer renders the flight plan legs. Forward order renders the legs in a first-to-last
   * fashion. Reverse order renders the legs in a last-to-first fashion. Defaults to forward.
   * @param renderActiveLegLast Whether to render the active leg last. Defaults to true.
   */
  constructor(public defaultRoleId: number, renderOrder?: FlightPathPlanRenderOrder, renderActiveLegLast?: boolean) {
    super(renderOrder, renderActiveLegLast);
  }

  protected readonly legRenderer = new MapSystemLegRenderer();

  /**
   * A handler that returns a leg rendering style for a given set of leg data.
   * @returns A leg rendering style.
   */
  public readonly legStyleHandlers = new Map<number, LegStyleHandler>();

  /**
   * A handler that returns whether or not a leg waypoint should be displayed.
   * @returns Whether or not the leg should be displayed.
   */
  public readonly legWaypointHandlers = new Map<number, LegWaypointHandler>();

  /** Whether or not to render flight path ingress turns. */
  public renderIngress: Subscribable<boolean> = Subject.create(false);

  /** Whether or not to render flight path egress turns. */
  public renderEgress: Subscribable<boolean> = Subject.create(false);

  /** @inheritdoc */
  protected renderLeg(leg: LegDefinition, plan: FlightPlan, activeLeg: LegDefinition | undefined, legIndex: number, activeLegIndex: number,
    context: CanvasRenderingContext2D, streamStack: GeoProjectionPathStreamStack): void {

    this.legRenderer.currentRenderStyle = FlightPathRenderStyle.Default;
    const handler = this.legStyleHandlers.get(plan.planIndex);
    if (handler !== undefined) {
      this.legRenderer.currentRenderStyle = handler(plan, leg, activeLeg, legIndex, activeLegIndex);
    }

    let partsToRender = FlightPathLegRenderPart.Base
      | (this.renderIngress.get() ? FlightPathLegRenderPart.Ingress : 0)
      | (this.renderEgress.get() ? FlightPathLegRenderPart.Egress : 0);

    if (this.legRenderer.currentRenderStyle.partsToRender !== undefined) {
      partsToRender = this.legRenderer.currentRenderStyle.partsToRender;
    }

    this.legRenderer.render(leg, context, streamStack, partsToRender);
  }
}

/**
 * A map system flight plan leg renderer that uses a swappable style.
 */
export class MapSystemLegRenderer extends AbstractFlightPathLegRenderer {
  protected readonly vectorRenderer = new FlightPathVectorLineRenderer();
  public currentRenderStyle: FlightPathRenderStyle | FlightPathVectorStyle = new FlightPathRenderStyle();

  /** @inheritdoc */
  protected renderVector(vector: Readonly<FlightPathVector>, isIngress: boolean, isEgress: boolean, leg: LegDefinition, context: CanvasRenderingContext2D,
    streamStack: GeoProjectionPathStreamStack): void {

    if ('styleBuilder' in this.currentRenderStyle) {
      const currentRenderStyle = this.currentRenderStyle.styleBuilder(vector, isIngress, isEgress);
      this.vectorRenderer.render(
        vector, context, streamStack,
        currentRenderStyle.width, currentRenderStyle.style, currentRenderStyle.dash,
        currentRenderStyle.outlineWidth, currentRenderStyle.outlineStyle, currentRenderStyle.lineCap);
    } else {
      if (this.currentRenderStyle.isDisplayed) {
        this.vectorRenderer.render(
          vector, context, streamStack,
          this.currentRenderStyle.width, this.currentRenderStyle.style, this.currentRenderStyle.dash,
          this.currentRenderStyle.outlineWidth, this.currentRenderStyle.outlineStyle, this.currentRenderStyle.lineCap);
      }
    }
  }
}

/**
 * A vector line rendering style to apply to a flight path display on the map.
 */
export class FlightPathRenderStyle {

  /**
   * Creates an instance of a FlightPathRenderStyle.
   * @param isDisplayed Whether or not the path is displayed.
   */
  constructor(public isDisplayed = true) { }

  /** The pixel width of the path line. */
  public width = 2;

  /** The style string for the line. */
  public style = '';

  /** A dash-array configuration for the line, if any. */
  public dash?: number[];

  /** The width of the outline, in pixels. Defaults to 0 pixels. */
  public outlineWidth?: number;

  /** The style of the outline. Defaults to `'black'`. */
  public outlineStyle?: string;

  /** The line cap style to use. Defaults to `'butt'`. */
  public lineCap?: CanvasLineCap;

  /** An optional override of which parts to render for the leg. */
  public partsToRender?: FlightPathLegRenderPart;

  /** The default rendering style. */
  public static readonly Default = new FlightPathRenderStyle();

  /** A style that does not display the path. */
  public static readonly Hidden = new FlightPathRenderStyle(false);
}

/**
 * A configuration for generating flight path rendering styles for individual vectors.
 */
export interface FlightPathVectorStyle {
  /** An optional override of which parts to render for the leg. */
  partsToRender?: FlightPathLegRenderPart;

  /** A builder function that provides the style for an individual vector. */
  styleBuilder: VectorStyleHandler;
}