import { BoundaryType, LodBoundary, MapAirspaceRenderer, MapSingleLineAirspaceRenderer, NullAirspaceRenderer } from '@microsoft/msfs-sdk';

enum AirspaceRenderType {
  GreenSingle,
  GreenDashed,
  Null
}

/**
 * Utility class containing functions defining the rendering behavior of airspaces for GNS maps.
 */
export class MapAirspaceRendering {
  private static readonly RENDERERS = {
    [AirspaceRenderType.GreenSingle]: new MapSingleLineAirspaceRenderer(0.8, '#00ff00', []),
    [AirspaceRenderType.GreenDashed]: new MapSingleLineAirspaceRenderer(0.8, '#00ff00', [5, 5]),
    [AirspaceRenderType.Null]: new NullAirspaceRenderer(),
  };

  /**
   * Determines the rendering order of airspaces for GNS maps.
   * @returns The relative rendering order of two airspaces for GNS maps.
   */
  public static renderOrder(): number {
    return 0;
  }

  /**
   * Selects airspace renderers for GNS maps.
   * @param airspace The airspace to render.
   * @returns The renderer to use to render the specified airspace.
   */
  public static selectRenderer(airspace: LodBoundary): MapAirspaceRenderer {
    switch (airspace.facility.type) {
      case BoundaryType.ClassB:
      case BoundaryType.ClassC:
      case BoundaryType.ClassE:
        return MapAirspaceRendering.RENDERERS[AirspaceRenderType.GreenSingle];
      case BoundaryType.ClassD:
        return MapAirspaceRendering.RENDERERS[AirspaceRenderType.GreenDashed];
      case BoundaryType.Restricted:
      case BoundaryType.Prohibited:
      case BoundaryType.Warning:
      case BoundaryType.Danger:
      case BoundaryType.Training:
      case BoundaryType.MOA:
      case BoundaryType.Alert:
        return MapAirspaceRendering.RENDERERS[AirspaceRenderType.GreenSingle];
      default:
        return MapAirspaceRendering.RENDERERS[AirspaceRenderType.Null];
    }
  }
}