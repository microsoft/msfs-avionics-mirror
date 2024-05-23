import {
  BoundaryType, LodBoundary, MapAirspaceRenderer, MapMultiLineAirspaceRenderer, MapMultiLineAirspaceShape, NullAirspaceRenderer,
  PathStream
} from '@microsoft/msfs-sdk';

import { GduFormat } from '../../CommonTypes';

enum AirspaceRenderType {
  BlueSingle,
  MagentaSingle,
  BlueSegmented,
  BlueDashed,
  BlueCombed,
  MagentaCombed,
  Null
}

const EMPTY_DASH: number[] = [];

/**
 * Renders airspace boundaries as a single line with an associated outline.
 */
class OutlinedAirspaceRenderer extends MapMultiLineAirspaceRenderer {
  /**
   * Constructor.
   * @param width The stroke width of the rendered airspace line, in pixels.
   * @param color The color of the rendered airspace line.
   * @param dash The dash array of the rendered airspace line.
   * @param outlineWidth The width of the rendered airspace outline, in pixels.
   * @param outlineColor The color of the rendered airspace outline.
   * @param outlineDash The dash array of the rendered airspace outline.
   */
  constructor(
    private readonly width: number,
    private readonly color: string,
    private readonly dash: number[],
    private readonly outlineWidth: number,
    private readonly outlineColor: string,
    private readonly outlineDash: number[]
  ) {
    super();
  }

  /** @inheritdoc */
  protected renderLines(
    shape: MapMultiLineAirspaceShape,
    context: CanvasRenderingContext2D,
    stream?: PathStream
  ): void {
    // render outline line
    shape.renderLine(context, 0, this.width + this.outlineWidth * 2, this.outlineColor, this.outlineDash, stream);

    // render stroke line
    shape.renderLine(context, 0, this.width, this.color, this.dash, stream);
  }
}

/**
 * Renders airspace boundaries with a comb-like pattern.
 */
class CombedAirspaceRenderer extends MapMultiLineAirspaceRenderer {
  private readonly teethDash: number[];
  private readonly outlineTeethDash: number[];

  private readonly teethOffset: number;

  /**
   * Constructor.
   * @param color The color of the rendered airspace.
   * @param baseLineWidth The stroke width of the base line that is drawn on the airspace boundary, in pixels.
   * @param isTeethOutside Whether the teeth should appear on the outside of the boundary.
   * @param teethWidth The width of the teeth, in pixels.
   * @param teethDash The dash of the teeth.
   * @param outlineWidth The width of the outline, in pixels.
   * @param outlineColor The color of the outline.
   */
  constructor(
    private readonly color: string,
    private readonly baseLineWidth: number,
    isTeethOutside: boolean,
    private readonly teethWidth: number,
    teethDash: [number, number],
    private readonly outlineWidth: number,
    private readonly outlineColor: string,
  ) {
    super();

    this.teethDash = [0, outlineWidth, teethDash[0], teethDash[1] - outlineWidth];
    this.outlineTeethDash = [teethDash[0] + 2 * outlineWidth, teethDash[1] - outlineWidth * 2];

    this.teethOffset = this.teethWidth / 2 * (isTeethOutside ? 1 : -1);
  }

  /** @inheritdoc */
  protected renderLines(
    shape: MapMultiLineAirspaceShape,
    context: CanvasRenderingContext2D,
    stream?: PathStream
  ): void {
    // render base outline
    shape.renderLine(context, 0, this.baseLineWidth + this.outlineWidth * 2, this.outlineColor, EMPTY_DASH, stream);

    // render teeth outline
    shape.renderLine(context, this.teethOffset, this.teethWidth + this.outlineWidth * 2, this.outlineColor, this.outlineTeethDash, stream);

    // render base stroke
    shape.renderLine(context, 0, this.baseLineWidth, this.color, EMPTY_DASH, stream);

    // render teeth stroke
    shape.renderLine(context, this.teethOffset, this.teethWidth, this.color, this.teethDash, stream);
  }
}

/**
 * Utility class containing functions defining the rendering behavior of airspaces for G3X Touch maps.
 */
export class G3XMapAirspaceRendering {
  private static readonly RENDERERS: Record<GduFormat, Record<AirspaceRenderType, MapAirspaceRenderer>> = {
    ['460']: {
      [AirspaceRenderType.BlueSingle]: new OutlinedAirspaceRenderer(2, '#7778f0', [], 1, '#000972', EMPTY_DASH),
      [AirspaceRenderType.MagentaSingle]: new OutlinedAirspaceRenderer(2, '#fa30f2', [], 1, '#3a0138', EMPTY_DASH),
      [AirspaceRenderType.BlueSegmented]: new OutlinedAirspaceRenderer(3, '#79aff8', [7, 1], 1, '#000972', EMPTY_DASH),
      [AirspaceRenderType.BlueDashed]: new OutlinedAirspaceRenderer(3, '#79aff8', [0, 1, 2, 3], 1, '#000972', [4, 2]),
      [AirspaceRenderType.BlueCombed]: new CombedAirspaceRenderer('#7778f0', 2, false, 4, [2, 4], 1, '#000972'),
      [AirspaceRenderType.MagentaCombed]: new CombedAirspaceRenderer('#fa30f2', 2, false, 4, [2, 4], 1, '#3a0138'),
      [AirspaceRenderType.Null]: new NullAirspaceRenderer(),
    },

    // TODO: Implement actual GDU470 (portrait) styles.
    ['470']: {
      [AirspaceRenderType.BlueSingle]: new OutlinedAirspaceRenderer(2, '#7778f0', [], 1, '#000972', EMPTY_DASH),
      [AirspaceRenderType.MagentaSingle]: new OutlinedAirspaceRenderer(2, '#fa30f2', [], 1, '#3a0138', EMPTY_DASH),
      [AirspaceRenderType.BlueSegmented]: new OutlinedAirspaceRenderer(3, '#79aff8', [7, 1], 1, '#000972', EMPTY_DASH),
      [AirspaceRenderType.BlueDashed]: new OutlinedAirspaceRenderer(3, '#79aff8', [0, 1, 2, 3], 1, '#000972', [4, 2]),
      [AirspaceRenderType.BlueCombed]: new CombedAirspaceRenderer('#7778f0', 2, false, 4, [2, 4], 1, '#000972'),
      [AirspaceRenderType.MagentaCombed]: new CombedAirspaceRenderer('#fa30f2', 2, false, 4, [2, 4], 1, '#3a0138'),
      [AirspaceRenderType.Null]: new NullAirspaceRenderer(),
    }
  };

  /**
   * Determines the rendering order of airspaces for G3X Touch maps.
   * @returns The relative rendering order of two airspaces for G3X Touch maps.
   */
  public static renderOrder(): number {
    return 0;
  }

  /**
   * Selects airspace renderers for G3X Touch maps.
   * @param gduFormat The format of the map's parent GDU.
   * @param airspace The airspace to render.
   * @returns The renderer to use to render the specified airspace.
   */
  public static selectRenderer(gduFormat: GduFormat, airspace: LodBoundary): MapAirspaceRenderer {
    switch (airspace.facility.type) {
      case BoundaryType.ClassB:
      case BoundaryType.ClassE:
        return G3XMapAirspaceRendering.RENDERERS[gduFormat][AirspaceRenderType.BlueSingle];
      case BoundaryType.ClassC:
        return G3XMapAirspaceRendering.RENDERERS[gduFormat][AirspaceRenderType.MagentaSingle];
      case BoundaryType.ClassD:
        return G3XMapAirspaceRendering.RENDERERS[gduFormat][AirspaceRenderType.BlueSegmented];
      case BoundaryType.Danger:
      case BoundaryType.Alert:
      case BoundaryType.Training:
        return G3XMapAirspaceRendering.RENDERERS[gduFormat][AirspaceRenderType.BlueDashed];
      case BoundaryType.Restricted:
      case BoundaryType.Prohibited:
      case BoundaryType.Warning:
        return G3XMapAirspaceRendering.RENDERERS[gduFormat][AirspaceRenderType.BlueCombed];
      case BoundaryType.MOA:
        return G3XMapAirspaceRendering.RENDERERS[gduFormat][AirspaceRenderType.MagentaCombed];
      default:
        return G3XMapAirspaceRendering.RENDERERS[gduFormat][AirspaceRenderType.Null];
    }
  }
}