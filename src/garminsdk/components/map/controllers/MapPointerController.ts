import { GeoPoint, MapSystemController } from 'msfssdk';

import { GarminMapKeys } from '../GarminMapKeys';
import { MapPointerModule } from '../modules/MapPointerModule';

/**
 * Modules required for MapPointerController.
 */
export interface MapPointerControllerModules {
  /** Pointer module. */
  [GarminMapKeys.Pointer]: MapPointerModule;
}

/**
 * Controls the pointer of a map.
 */
export class MapPointerController extends MapSystemController<MapPointerControllerModules> {
  private static readonly geoPointCache = [new GeoPoint(0, 0)];

  protected readonly pointerModule = this.context.model.getModule(GarminMapKeys.Pointer);

  /**
   * Activates or deactivates the map pointer.
   * @param isActive Whether to activate the map pointer.
   */
  public setPointerActive(isActive: boolean): void {
    if (isActive === this.pointerModule.isActive.get()) {
      return;
    }

    if (isActive) {
      this.pointerModule.target.set(this.context.projection.getTarget());
      this.pointerModule.position.set(this.context.projection.getTargetProjected());
    }

    this.pointerModule.isActive.set(isActive);
  }

  /**
   * Toggles activation of the map pointer.
   * @returns Whether the map pointer is active after the toggle operation.
   */
  public togglePointerActive(): boolean {
    this.setPointerActive(!this.pointerModule.isActive.get());
    return this.pointerModule.isActive.get();
  }

  /**
   * Moves the map pointer.
   * @param dx The horizontal displacement, in pixels.
   * @param dy The vertical dispacement, in pixels.
   */
  public movePointer(dx: number, dy: number): void {
    const currentPos = this.pointerModule.position.get();
    this.pointerModule.position.set(currentPos[0] + dx, currentPos[1] + dy);
  }

  /**
   * Sets the map target to the current position of the pointer. The pointer will also be moved to the new projected
   * target position.
   */
  public targetPointer(): void {
    const target = this.context.projection.invert(this.pointerModule.position.get(), MapPointerController.geoPointCache[0]);
    this.pointerModule.target.set(target);
    this.pointerModule.position.set(this.context.projection.getTargetProjected());
  }
}