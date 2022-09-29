import { MapLayerProps, MapSyncedCanvasLayer, Waypoint } from 'msfssdk';

import { GarminMapKeys } from '../GarminMapKeys';
import { MapWaypointRenderer, MapWaypointRenderRole } from '../MapWaypointRenderer';
import { MapWaypointHighlightModule } from '../modules/MapWaypointHighlightModule';

/**
 * Modules required by MapWaypointHighlightLayer.
 */
export interface MapWaypointHighlightLayerModules {
  /** Waypoint highlight module. */
  [GarminMapKeys.WaypointHighlight]: MapWaypointHighlightModule;
}

/**
 * Component props for MapWaypointHighlightLayer
 */
export interface MapWaypointHighlightLayerProps extends MapLayerProps<MapWaypointHighlightLayerModules> {
  /** The waypoint renderer to use. */
  waypointRenderer: MapWaypointRenderer;
}

/**
 * The map layer showing highlighted waypoints.
 */
export class MapWaypointHighlightLayer extends MapSyncedCanvasLayer<MapWaypointHighlightLayerProps> {
  private registeredWaypoint: Waypoint | null = null;

  /** @inheritdoc */
  public onAttached(): void {
    super.onAttached();
    this.isInit = false;

    this.initWaypointRenderer();
    this.initModuleListener();
    this.isInit = true;
  }

  /**
   * Initializes the waypoint renderer.
   */
  private initWaypointRenderer(): void {
    this.props.waypointRenderer.setCanvasContext(MapWaypointRenderRole.Highlight, this.display.context);
  }

  /**
   * Initializes the waypoint highlight listener.
   */
  private initModuleListener(): void {
    this.props.model.getModule(GarminMapKeys.WaypointHighlight).waypoint.sub(this.onWaypointChanged.bind(this), true);
  }

  /**
   * A callback which is called when the highlighted waypoint changes.
   * @param waypoint The new highlighted waypoint.
   */
  private onWaypointChanged(waypoint: Waypoint | null): void {
    this.registeredWaypoint && this.props.waypointRenderer.deregister(this.registeredWaypoint, MapWaypointRenderRole.Highlight, 'waypoint-highlight-layer');
    waypoint && this.props.waypointRenderer.register(waypoint, MapWaypointRenderRole.Highlight, 'waypoint-highlight-layer');
    this.registeredWaypoint = waypoint;
  }
}