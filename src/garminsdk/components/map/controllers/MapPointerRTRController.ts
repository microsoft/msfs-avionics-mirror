import {
  BitFlags, GeoPoint, MapProjection, MapProjectionChangeType, MapSystemContext, MapSystemController,
  MathUtils, ReadonlyFloat64Array, Subscribable, SubscribableUtils, Subscription, Vec2Math,
  VecNMath, VecNSubject
} from '@microsoft/msfs-sdk';

import { GarminMapKeys } from '../GarminMapKeys';
import { MapOrientationModule } from '../modules/MapOrientationModule';
import { MapPanningModule } from '../modules/MapPanningModule';
import { MapPointerModule } from '../modules/MapPointerModule';

/**
 * Modules required for MapPointerRTRController.
 */
export interface MapPointerRTRControllerModules {
  /** Pointer module. */
  [GarminMapKeys.Pointer]: MapPointerModule;

  /** Panning module. */
  [GarminMapKeys.Panning]: MapPanningModule;

  /** Orientation module. */
  [GarminMapKeys.Orientation]?: MapOrientationModule;
}

/**
 * Context properties required for MapPointerRTRController.
 */
export type MapPointerRTRControllerContext = Record<string, never>;

/**
 * Controls the target, orientation, and range of a map while the map pointer is active.
 */
export class MapPointerRTRController extends MapSystemController<MapPointerRTRControllerModules> {
  private readonly pointerModule = this.context.model.getModule(GarminMapKeys.Pointer);
  private readonly panningModule = this.context.model.getModule(GarminMapKeys.Panning);
  private readonly orientationModule = this.context.model.getModule(GarminMapKeys.Orientation);

  protected readonly pointerBoundsOffset: Subscribable<ReadonlyFloat64Array>;

  private readonly pointerBounds = VecNSubject.create(VecNMath.create(4));

  private needUpdatePointerScroll = false;

  private targetPipe?: Subscription;

  private pointerBoundsOffsetSub?: Subscription;
  private pointerActiveSub?: Subscription;

  private pointerBoundsSub?: Subscription;
  private pointerPositionSub?: Subscription;

  private commandedOrientationSub?: Subscription;

  /**
   * Creates a new instance of MapPointerRTRController.
   * @param context This controller's map context.
   * @param pointerBoundsOffset The offset of the boundary surrounding the area in which the pointer can freely move,
   * from the edge of the projected map, excluding the dead zone. Expressed as `[left, top, right, bottom]`, relative
   * to the width and height, as appropriate, of the projected map. A positive offset is directed toward the center of
   * the map.
   */
  constructor(
    context: MapSystemContext<MapPointerRTRControllerModules>,
    pointerBoundsOffset: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>
  ) {
    super(context);

    this.pointerBoundsOffset = SubscribableUtils.toSubscribable(pointerBoundsOffset, true);
  }

  /** @inheritdoc */
  public onAfterMapRender(): void {
    this.targetPipe = this.pointerModule.target.pipe(this.panningModule.target, true);

    this.pointerBoundsSub = this.pointerBounds.sub(this.onPointerBoundsChanged.bind(this), false, true);
    this.pointerPositionSub = this.pointerModule.position.sub(this.onPointerPositionChanged.bind(this), false, true);

    this.pointerBoundsOffsetSub = this.pointerBoundsOffset.sub(this.updatePointerBounds.bind(this), true);
    this.pointerActiveSub = this.pointerModule.isActive.sub(this.onPointerActiveChanged.bind(this), true);

    this.commandedOrientationSub = this.orientationModule?.commandedOrientation.sub(() => { this.pointerModule.isActive.set(false); }, false, true);
  }

  /**
   * Updates this controller's pointer bounds.
   */
  private updatePointerBounds(): void {
    const deadZone = this.context.deadZone.get();
    const offset = this.pointerBoundsOffset.get();

    const size = this.context.projection.getProjectedSize();
    const minX = deadZone[0];
    const minY = deadZone[1];
    const maxX = size[0] - deadZone[2];
    const maxY = size[1] - deadZone[3];
    const width = maxX - minX;
    const height = maxY - minY;
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    this.pointerBounds.set(
      Math.min(centerX, minX + width * offset[0]),
      Math.min(centerY, minY + height * offset[1]),
      Math.max(centerX, maxX - width * offset[2]),
      Math.max(centerY, maxY - height * offset[3])
    );
  }

  /**
   * Responds to map pointer activation changes.
   * @param isActive Whether the map pointer is active.
   */
  protected onPointerActiveChanged(isActive: boolean): void {
    if (isActive) {
      this.onPointerActivated();
    } else {
      this.onPointerDeactivated();
    }
  }

  /**
   * Responds to map pointer activation.
   */
  protected onPointerActivated(): void {
    this.targetPipe?.resume(true);

    this.panningModule.isActive.set(true);

    this.pointerBoundsSub?.resume();
    this.pointerPositionSub?.resume();

    this.commandedOrientationSub?.resume();
  }

  /**
   * Responds to map pointer deactivation.
   */
  protected onPointerDeactivated(): void {
    this.commandedOrientationSub?.pause();

    this.pointerBoundsSub?.pause();
    this.pointerPositionSub?.pause();

    this.targetPipe?.pause();

    this.panningModule.isActive.set(false);
  }

  /**
   * Responds to map pointer position changes.
   */
  private onPointerPositionChanged(): void {
    this.schedulePointerScrollUpdate();
  }

  /**
   * Responds to map pointer bounds changes.
   */
  private onPointerBoundsChanged(): void {
    const position = this.pointerModule.position.get();
    const bounds = this.pointerBounds.get();

    const clampedPositionX = MathUtils.clamp(position[0], bounds[0], bounds[2]);
    const clampedPositionY = MathUtils.clamp(position[1], bounds[1], bounds[3]);

    this.pointerModule.position.set(clampedPositionX, clampedPositionY);
  }

  /**
   * Schedules an update to scrolling due to the pointer.
   */
  protected schedulePointerScrollUpdate(): void {
    this.needUpdatePointerScroll = true;
  }

  private readonly pointerVec2Cache = [new Float64Array(2)];
  private readonly targetCache = new GeoPoint(0, 0);

  /**
   * Updates scrolling due to the pointer.
   */
  protected updatePointerScroll(): void {
    if (!this.needUpdatePointerScroll) {
      return;
    }

    const position = this.pointerModule.position.get();
    const bounds = this.pointerBounds.get();

    const clampedPositionX = MathUtils.clamp(position[0], bounds[0], bounds[2]);
    const clampedPositionY = MathUtils.clamp(position[1], bounds[1], bounds[3]);

    const scrollDeltaX = position[0] - clampedPositionX;
    const scrollDeltaY = position[1] - clampedPositionY;

    if (scrollDeltaX === 0 && scrollDeltaY === 0) {
      return;
    }

    this.pointerModule.position.set(clampedPositionX, clampedPositionY);

    const newTargetProjected = Vec2Math.add(
      this.context.projection.getTargetProjected(),
      Vec2Math.set(scrollDeltaX, scrollDeltaY, this.pointerVec2Cache[0]),
      this.pointerVec2Cache[0]
    );

    this.context.projection.invert(newTargetProjected, this.targetCache);
    this.pointerModule.target.set(this.targetCache);

    this.needUpdatePointerScroll = false;
  }

  /** @inheritdoc */
  public onDeadZoneChanged(): void {
    this.updatePointerBounds();
  }

  /** @inheritdoc */
  public onMapProjectionChanged(mapProjection: MapProjection, changeFlags: number): void {
    if (BitFlags.isAny(changeFlags, MapProjectionChangeType.ProjectedSize)) {
      this.updatePointerBounds();
    }
  }

  /** @inheritdoc */
  public onBeforeUpdated(): void {
    this.updatePointerScroll();
  }

  /** @inheritdoc */
  public onMapDestroyed(): void {
    this.destroy();
  }

  /** @inheritdoc */
  public destroy(): void {
    if (this.pointerModule.isActive.get()) {
      this.panningModule.isActive.set(false);
    }

    this.targetPipe?.destroy();

    this.pointerBoundsOffsetSub?.destroy();
    this.pointerActiveSub?.destroy();

    this.pointerBoundsSub?.destroy();
    this.pointerPositionSub?.destroy();

    this.commandedOrientationSub?.destroy();

    super.destroy();
  }
}