import {
  BoundaryType, LodBoundary, MapAirspaceRenderer, MapMultiLineAirspaceRenderer, MapMultiLineAirspaceShape, MapSingleLineAirspaceRenderer, NullAirspaceRenderer,
  PathStream
} from 'msfssdk';

enum AirspaceRenderType {
  BlueSingle,
  MaroonSingle,
  BlueDashed,
  BlueCombed,
  MaroonCombed,
  Null
}

/**
 * Renders airspace boundaries with a comb-like pattern.
 */
class CombedAirspaceRenderer extends MapMultiLineAirspaceRenderer {
  private static readonly emptyDash = [];

  /**
   * Constructor.
   * @param color The color of the rendered airspace.
   * @param baseLineWidth The stroke width of the base line that is drawn on the airspace boundary.
   * @param isTeethOutside Whether the teeth should appear on the outside of the boundary.
   * @param teethWidth The width of the teeth.
   * @param teethDash The dash of the teeth.
   */
  constructor(
    public readonly color: string,
    public readonly baseLineWidth: number,
    public readonly isTeethOutside: boolean,
    public readonly teethWidth: number,
    public readonly teethDash: number[]
  ) {
    super();
  }

  /** @inheritdoc */
  protected renderLines(
    shape: MapMultiLineAirspaceShape,
    context: CanvasRenderingContext2D,
    stream?: PathStream
  ): void {
    // render base line
    shape.renderLine(context, 0, this.baseLineWidth, this.color, CombedAirspaceRenderer.emptyDash, stream);

    // render teeth
    shape.renderLine(context, this.teethWidth / 2 * (this.isTeethOutside ? 1 : -1), this.teethWidth, this.color, this.teethDash, stream);
  }
}

/**
 * Utility class containing functions defining the rendering behavior of airspaces for Garmin maps.
 */
export class MapAirspaceRendering {
  private static readonly RENDERERS = {
    [AirspaceRenderType.BlueSingle]: new MapSingleLineAirspaceRenderer(1.5, '#3080ff', []),
    [AirspaceRenderType.MaroonSingle]: new MapSingleLineAirspaceRenderer(1.5, '#4a0045', []),
    [AirspaceRenderType.BlueDashed]: new MapSingleLineAirspaceRenderer(1.5, '#3080ff', [5, 5]),
    [AirspaceRenderType.BlueCombed]: new CombedAirspaceRenderer('#3080ff', 1.5, false, 6, [1.5, 2.5]),
    [AirspaceRenderType.MaroonCombed]: new CombedAirspaceRenderer('#4a0045', 1.5, false, 6, [1.5, 2.5]),
    [AirspaceRenderType.Null]: new NullAirspaceRenderer(),
  };

  /**
   * Determines the rendering order of airspaces for Garmin maps.
   * @returns The relative rendering order of two airspaces for Garmin maps.
   */
  public static renderOrder(): number {
    return 0;
  }

  /**
   * Selects airspace renderers for Garmin maps.
   * @param airspace The airspace to render.
   * @returns The renderer to use to render the specified airspace.
   */
  public static selectRenderer(airspace: LodBoundary): MapAirspaceRenderer {
    switch (airspace.facility.type) {
      case BoundaryType.ClassB:
        return MapAirspaceRendering.RENDERERS[AirspaceRenderType.BlueSingle];
      case BoundaryType.ClassC:
      case BoundaryType.ClassE:
        return MapAirspaceRendering.RENDERERS[AirspaceRenderType.MaroonSingle];
      case BoundaryType.ClassD:
        return MapAirspaceRendering.RENDERERS[AirspaceRenderType.BlueDashed];
      case BoundaryType.Restricted:
      case BoundaryType.Prohibited:
      case BoundaryType.Warning:
      case BoundaryType.Danger:
      case BoundaryType.Training:
        return MapAirspaceRendering.RENDERERS[AirspaceRenderType.BlueCombed];
      case BoundaryType.MOA:
      case BoundaryType.Alert:
        return MapAirspaceRendering.RENDERERS[AirspaceRenderType.MaroonCombed];
      default:
        return MapAirspaceRendering.RENDERERS[AirspaceRenderType.Null];
    }
  }
}