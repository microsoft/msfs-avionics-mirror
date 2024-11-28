import { GeoPoint, MapSystemController, Vec2Math } from '@microsoft/msfs-sdk';

import { G3XMapKeys } from '../G3XMapKeys';
import { MapDragPanModule } from '../Modules/MapDragPanModule';

/**
 * Modules required for MapDragPanController.
 */
export interface MapDragPanControllerModules {
  /** Pointer module. */
  [G3XMapKeys.DragPan]: MapDragPanModule;
}

/**
 * Controls the pointer of a map.
 */
export class MapDragPanController extends MapSystemController<MapDragPanControllerModules> {
  private readonly dragPanModule = this.context.model.getModule(G3XMapKeys.DragPan);

  /**
   * Activates or deactivates the map pointer.
   * @param isActive Whether to activate the map pointer.
   */
  public setDragPanActive(isActive: boolean): void {
    if (isActive === this.dragPanModule.isActive.get()) {
      return;
    }

    if (isActive) {
      this.dragPanModule.target.set(this.context.projection.getTarget());
    }

    this.dragPanModule.isActive.set(isActive);
  }

  /**
   * Toggles activation of the map pointer.
   * @returns Whether the map pointer is active after the toggle operation.
   */
  public toggleDragPanActive(): boolean {
    this.setDragPanActive(!this.dragPanModule.isActive.get());
    return this.dragPanModule.isActive.get();
  }

  private readonly dragVec2Cache = Vec2Math.create();
  private readonly dragGeoPointCache = new GeoPoint(0, 0);

  /**
   * Executes a drag action.
   * @param dx The horizontal displacement of the drag motion, in pixels.
   * @param dy The vertical dispacement of the drag motion, in pixels.
   */
  public drag(dx: number, dy: number): void {
    const targetPos = this.context.projection.project(this.dragPanModule.target.get(), this.dragVec2Cache);
    Vec2Math.set(targetPos[0] - dx, targetPos[1] - dy, targetPos);

    if (!Vec2Math.isFinite(targetPos)) {
      return;
    }

    const newTarget = this.context.projection.invert(targetPos, this.dragGeoPointCache);

    if (!isFinite(newTarget.lat) || !isFinite(newTarget.lon)) {
      return;
    }

    this.dragPanModule.target.set(newTarget);
  }
}