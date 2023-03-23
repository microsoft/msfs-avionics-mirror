import { MapSystemController, Subscription } from '@microsoft/msfs-sdk';

import { GarminMapKeys } from '../GarminMapKeys';
import { MapWaypointHighlightModule } from '../modules/MapWaypointHighlightModule';
import { WaypointMapSelectionModule } from '../modules/WaypointMapSelectionModule';

/**
 * Modules required for WaypointMapHighlightController.
 */
export interface WaypointMapHighlightControllerModules {
  /** Waypoint info module. */
  [GarminMapKeys.WaypointSelection]: WaypointMapSelectionModule;

  /** Waypoint highlight module. */
  [GarminMapKeys.WaypointHighlight]: MapWaypointHighlightModule;
}

/**
 * Controls the highlighted waypoint of a waypoint map.
 */
export class WaypointMapHighlightController extends MapSystemController<WaypointMapHighlightControllerModules> {

  private readonly waypointSelectModule = this.context.model.getModule(GarminMapKeys.WaypointSelection);
  private readonly waypointHighlightModule = this.context.model.getModule(GarminMapKeys.WaypointHighlight);

  private waypointPipe?: Subscription;

  /** @inheritdoc */
  public onAfterMapRender(): void {
    this.waypointPipe = this.waypointSelectModule.waypoint.pipe(this.waypointHighlightModule.waypoint);
  }

  /** @inheritdoc */
  public onMapDestroyed(): void {
    this.destroy();
  }

  /** @inheritdoc */
  public destroy(): void {
    this.waypointPipe?.destroy();

    super.destroy();
  }
}