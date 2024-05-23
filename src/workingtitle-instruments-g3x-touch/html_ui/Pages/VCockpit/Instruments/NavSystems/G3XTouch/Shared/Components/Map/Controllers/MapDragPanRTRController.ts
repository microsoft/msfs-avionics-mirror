import { MapSystemController, Subscription } from '@microsoft/msfs-sdk';

import { GarminMapKeys, MapOrientationModule, MapPanningModule } from '@microsoft/msfs-garminsdk';

import { G3XMapKeys } from '../G3XMapKeys';
import { MapDragPanModule } from '../Modules/MapDragPanModule';
import { MapOrientationOverrideModule } from '../Modules/MapOrientationOverrideModule';

/**
 * Modules required for MapDragPanRTRController.
 */
export interface MapDragPanRTRControllerModules {
  /** Drag-to-pan module. */
  [G3XMapKeys.DragPan]: MapDragPanModule;

  /** Panning module. */
  [GarminMapKeys.Panning]: MapPanningModule;

  /** Orientation module. */
  [GarminMapKeys.Orientation]?: MapOrientationModule;

  /** Orientation override module. */
  [G3XMapKeys.OrientationOverride]?: MapOrientationOverrideModule;
}

/**
 * Controls the target, orientation, and range of a map while drag-to-pan is active.
 */
export class MapDragPanRTRController extends MapSystemController<MapDragPanRTRControllerModules> {
  private readonly dragPanModule = this.context.model.getModule(G3XMapKeys.DragPan);
  private readonly panningModule = this.context.model.getModule(GarminMapKeys.Panning);
  private readonly orientationModule = this.context.model.getModule(GarminMapKeys.Orientation);
  private readonly orientationOverrideModule = this.context.model.getModule(G3XMapKeys.OrientationOverride);

  private targetPipe?: Subscription;

  private dragPanActiveSub?: Subscription;
  private commandedOrientationSub?: Subscription;
  private orientationOverrideSub?: Subscription;

  /** @inheritdoc */
  public onAfterMapRender(): void {
    this.targetPipe = this.dragPanModule.target.pipe(this.panningModule.target, true);
    this.dragPanActiveSub = this.dragPanModule.isActive.sub(this.onDragPanActiveChanged.bind(this), true);

    const deactivateDragPan = this.dragPanModule.isActive.set.bind(this.dragPanModule.isActive, false);
    this.commandedOrientationSub = this.orientationModule?.commandedOrientation.sub(deactivateDragPan, false, true);
    this.orientationOverrideSub = this.orientationOverrideModule?.orientationOverride.sub(deactivateDragPan, false, true);
  }

  /**
   * Responds to map pointer activation changes.
   * @param isActive Whether the map pointer is active.
   */
  protected onDragPanActiveChanged(isActive: boolean): void {
    if (isActive) {
      this.onDragPanActivated();
    } else {
      this.onPointerDeactivated();
    }
  }

  /**
   * Responds to map pointer activation.
   */
  protected onDragPanActivated(): void {
    this.targetPipe?.resume(true);

    this.panningModule.isActive.set(true);

    this.commandedOrientationSub?.resume();
    this.orientationOverrideSub?.resume();
  }

  /**
   * Responds to map pointer deactivation.
   */
  protected onPointerDeactivated(): void {
    this.targetPipe?.pause();

    this.panningModule.isActive.set(false);

    this.commandedOrientationSub?.pause();
    this.orientationOverrideSub?.pause();
  }

  /** @inheritdoc */
  public onMapDestroyed(): void {
    this.destroy();
  }

  /** @inheritdoc */
  public destroy(): void {
    if (this.dragPanModule.isActive.get()) {
      this.panningModule.isActive.set(false);
    }

    this.targetPipe?.destroy();
    this.dragPanActiveSub?.destroy();
    this.commandedOrientationSub?.destroy();
    this.orientationOverrideSub?.destroy();

    super.destroy();
  }
}