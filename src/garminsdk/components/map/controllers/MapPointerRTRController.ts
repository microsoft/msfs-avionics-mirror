/// <reference types="msfstypes/JS/Avionics" />

import {
  BitFlags, GeoPoint, GeoPointInterface, MapProjection, MapProjectionChangeType, MapSystemContext, MapSystemController, MapSystemKeys, MathUtils,
  ReadonlyFloat64Array, ResourceConsumer, ResourceModerator, Subject, Subscribable, Subscription, Vec2Math, VecNMath, VecNSubject
} from 'msfssdk';

import { GarminMapKeys } from '../GarminMapKeys';
import { MapResourcePriority } from '../MapResourcePriority';
import { MapOrientationModule } from '../modules/MapOrientationModule';
import { MapPointerModule } from '../modules/MapPointerModule';

/**
 * Modules required for MapPointerRTRController.
 */
export interface MapPointerRTRControllerModules {
  /** Pointer module. */
  [GarminMapKeys.Pointer]: MapPointerModule;

  /** Orientation module. */
  [GarminMapKeys.Orientation]?: MapOrientationModule;
}

/**
 * Context properties required for MapPointerRTRController.
 */
export interface MapPointerRTRControllerContext {
  /** Resource moderator for control of the map's projection target. */
  [MapSystemKeys.TargetControl]?: ResourceModerator;

  /** Resource moderator for control of the map's rotation. */
  [MapSystemKeys.RotationControl]?: ResourceModerator;

  /** Resource moderator for control of the map's range. */
  [MapSystemKeys.RangeControl]?: ResourceModerator;

  /** Resource moderator for the use range setting subject. */
  [GarminMapKeys.UseRangeSetting]?: ResourceModerator<Subject<boolean>>;
}

/**
 * Controls the pointer of a map.
 */
export class MapPointerRTRController extends MapSystemController<MapPointerRTRControllerModules, any, any, MapPointerRTRControllerContext> {
  private readonly pointerModule = this.context.model.getModule(GarminMapKeys.Pointer);
  private readonly orientationModule = this.context.model.getModule(GarminMapKeys.Orientation);

  private readonly mapProjectionParams = {
    target: new GeoPoint(0, 0)
  };

  private readonly targetControl = this.context[MapSystemKeys.TargetControl];

  private hasTargetControl = this.context.targetControlModerator === undefined;

  private readonly targetControlConsumer: ResourceConsumer = {
    priority: MapResourcePriority.POINTER,

    onAcquired: () => {
      this.hasTargetControl = true;
    },

    onCeded: () => {
      this.hasTargetControl = false;
    }
  };

  private readonly rotationControl = this.context[MapSystemKeys.RotationControl];

  private readonly rotationControlConsumer: ResourceConsumer = {
    priority: MapResourcePriority.POINTER,

    onAcquired: () => { }, // While pointer is active, the map keeps its initial rotation state when the pointer was activated, so we do nothing while we have control.

    onCeded: () => { }
  };

  private readonly rangeControl = this.context[MapSystemKeys.RangeControl];

  private readonly rangeControlConsumer: ResourceConsumer = {
    priority: MapResourcePriority.POINTER,

    onAcquired: () => { }, // We are just holding this to keep other things of lower priority from changing the range.

    onCeded: () => { }
  };

  private readonly useRangeSetting = this.context[GarminMapKeys.UseRangeSetting];

  private readonly useRangeSettingConsumer: ResourceConsumer<Subject<boolean>> = {
    priority: MapResourcePriority.POINTER,

    onAcquired: () => { }, // Pointer mode uses the use range setting state that was active when the pointer was activated, so we do nothing while we have control.

    onCeded: () => { }
  };

  private readonly pointerBounds = VecNSubject.createFromVector(VecNMath.create(4));

  private needUpdatePointerScroll = false;

  private pointerBoundsOffsetSub?: Subscription;
  private pointerActiveSub?: Subscription;

  private pointerBoundsSub?: Subscription;
  private pointerPositionSub?: Subscription;
  private pointerTargetSub?: Subscription;

  private orientationSub?: Subscription;

  /**
   * Constructor.
   * @param context This controller's map context.
   * @param pointerBoundsOffset A subscribable which provides the offset of the boundary surrounding the area in which
   * the pointer can freely move, from the edge of the projected map, excluding the dead zone. Expressed as
   * `[left, top, right, bottom]`, relative to the width and height, as appropriate, of the projected map. A positive
   * offset is directed toward the center of the map.
   */
  constructor(
    context: MapSystemContext<MapPointerRTRControllerModules, any, any, MapPointerRTRControllerContext>,
    protected readonly pointerBoundsOffset: Subscribable<ReadonlyFloat64Array>
  ) {
    super(context);
  }

  /** @inheritdoc */
  public onAfterMapRender(): void {
    this.pointerBoundsSub = this.pointerBounds.sub(this.onPointerBoundsChanged.bind(this), false, true);
    this.pointerPositionSub = this.pointerModule.position.sub(this.onPointerPositionChanged.bind(this), false, true);
    this.pointerTargetSub = this.pointerModule.target.sub(this.onPointerTargetChanged.bind(this), false, true);

    this.pointerBoundsOffsetSub = this.pointerBoundsOffset.sub(this.updatePointerBounds.bind(this), true);
    this.pointerActiveSub = this.pointerModule.isActive.sub(this.onPointerActiveChanged.bind(this), true);

    this.orientationSub = this.orientationModule?.orientation.sub(() => { this.pointerModule.isActive.set(false); }, false, true);
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
    this.updatePointerListeners();

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
    this.targetControl?.claim(this.targetControlConsumer);
    this.rotationControl?.claim(this.rotationControlConsumer);
    this.rangeControl?.claim(this.rangeControlConsumer);
    this.useRangeSetting?.claim(this.useRangeSettingConsumer);

    this.orientationSub?.resume();
  }

  /**
   * Responds to map pointer deactivation.
   */
  protected onPointerDeactivated(): void {
    this.targetControl?.forfeit(this.targetControlConsumer);
    this.rotationControl?.forfeit(this.rotationControlConsumer);
    this.rangeControl?.forfeit(this.rangeControlConsumer);
    this.useRangeSetting?.forfeit(this.useRangeSettingConsumer);

    this.orientationSub?.pause();
  }

  /**
   * Responds to map pointer position changes.
   */
  private onPointerPositionChanged(): void {
    this.schedulePointerScrollUpdate();
  }

  /**
   * Responds to map pointer desired target changes.
   * @param target The desired target.
   */
  private onPointerTargetChanged(target: GeoPointInterface): void {
    if (this.hasTargetControl) {
      this.mapProjectionParams.target.set(target);
      this.context.projection.setQueued(this.mapProjectionParams);
    }
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
   * Updates the pointer position listener.
   */
  private updatePointerListeners(): void {
    if (this.pointerModule.isActive.get()) {
      this.pointerBoundsSub?.resume();
      this.pointerPositionSub?.resume();
      this.pointerTargetSub?.resume(true);
    } else {
      this.pointerBoundsSub?.pause();
      this.pointerPositionSub?.pause();
      this.pointerTargetSub?.pause();
    }
  }

  /**
   * Schedules an update to scrolling due to the pointer.
   */
  protected schedulePointerScrollUpdate(): void {
    this.needUpdatePointerScroll = true;
  }

  private readonly pointerVec2Cache = [new Float64Array(2)];

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

    if (this.hasTargetControl) {
      const newTargetProjected = Vec2Math.add(
        this.context.projection.getTargetProjected(),
        Vec2Math.set(scrollDeltaX, scrollDeltaY, this.pointerVec2Cache[0]),
        this.pointerVec2Cache[0]
      );

      this.context.projection.invert(newTargetProjected, this.mapProjectionParams.target);
      this.context.projection.setQueued(this.mapProjectionParams);
    }

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
    super.destroy();

    this.targetControl?.forfeit(this.targetControlConsumer);
    this.rotationControl?.forfeit(this.rotationControlConsumer);
    this.rangeControl?.forfeit(this.rangeControlConsumer);
    this.useRangeSetting?.forfeit(this.useRangeSettingConsumer);

    this.pointerBoundsOffsetSub?.destroy();
    this.pointerActiveSub?.destroy();

    this.pointerBoundsSub?.destroy();
    this.pointerPositionSub?.destroy();
    this.pointerTargetSub?.destroy();

    this.orientationSub?.destroy();
  }
}