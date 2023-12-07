import {
  BitFlags, MapProjection, MapProjectionChangeType, MapRotation, MapRotationModule, MapSystemContext, MapSystemController,
  MapSystemKeys, MapSystemUtils, ReadonlyFloat64Array, ResourceConsumer, ResourceModerator, Subscribable, SubscribableUtils,
  Subscription, Vec2Math, VecNMath, VecNSubject
} from '@microsoft/msfs-sdk';

import { GarminMapKeys } from '../GarminMapKeys';
import { MapResourcePriority } from '../MapResourcePriority';
import { MapOrientation, MapOrientationModule } from '../modules/MapOrientationModule';

/**
 * Modules required for MapOrientationRTRController.
 */
export interface MapOrientationRTRControllerModules {
  /** Rotation module. */
  [MapSystemKeys.Rotation]: MapRotationModule;

  /** Orientation module. */
  [GarminMapKeys.Orientation]: MapOrientationModule;
}

/**
 * Context properties required by MapOrientationRTRController.
 */
export interface MapOrientationRTRControllerContext {
  /** Resource moderator for control of the map's rotation mode. */
  [GarminMapKeys.RotationModeControl]: ResourceModerator;
}

/**
 * Controls the rotation, range, and projected target offset of a map based on the orientation module's orientation
 * value.
 */
export class MapOrientationRTRController extends MapSystemController<MapOrientationRTRControllerModules, any, any, MapOrientationRTRControllerContext> {
  private static readonly DEFAULT_TARGET_OFFSET = Vec2Math.create();
  private static readonly DEFAULT_RANGE_ENDPOINTS = VecNMath.create(4, 0.5, 0.5, 0.5, 0);

  private readonly orientationModule = this.context.model.getModule(GarminMapKeys.Orientation);
  private readonly rotationModule = this.context.model.getModule(MapSystemKeys.Rotation);

  private readonly rotationModeControl = this.context[GarminMapKeys.RotationModeControl];

  private hasRotationModeControl = false;

  private readonly rotationModeControlConsumer: ResourceConsumer = {
    priority: MapResourcePriority.ORIENTATION_ROTATION,

    onAcquired: () => {
      this.hasRotationModeControl = true;
      this.updateRotation();
    },

    onCeded: () => {
      this.hasRotationModeControl = false;
    }
  };

  private readonly targetOffsetParam = {
    targetProjectedOffset: Vec2Math.create()
  };
  private readonly rangeEndpointsParam = {
    rangeEndpoints: VecNMath.create(4)
  };

  private readonly nominalTargetOffsetSubject = VecNSubject.createFromVector(Vec2Math.create());
  private readonly nominalRangeEndpointsSubject = VecNSubject.createFromVector(VecNMath.create(4));

  private needUpdateTargetOffset = false;
  private needUpdateRangeEndpoints = false;

  private orientationSub?: Subscription;
  private targetOffsetPipe?: Subscription;
  private rangeEndpointsPipe?: Subscription;

  /**
   * Constructor.
   * @param context This controller's map context.
   * @param nominalTargetOffsets The nominal projected target offsets this controller applies for each orientation, as
   * `[x, y]` relative to the width and height of the map's projected window excluding the dead zone. If an orientation
   * does not have a defined offset, it will default to `[0, 0]`.
   * @param nominalRangeEndpoints The nominal range endpoints this controller applies for each orientation, as
   * `[x1, y1, x2, y2]` relative to the width and height of the map's projected window excluding the dead zone. If an
   * orientation does not have defined range endpoints, it will default to `[0.5, 0.5, 0.5, 0]`.
   */
  constructor(
    context: MapSystemContext<MapOrientationRTRControllerModules, any, any, MapOrientationRTRControllerContext>,
    private readonly nominalTargetOffsets?: Partial<Record<MapOrientation, ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>>>,
    private readonly nominalRangeEndpoints?: Partial<Record<MapOrientation, ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>>>
  ) {
    super(context);
  }

  /** @inheritdoc */
  public onAfterMapRender(): void {
    this.rotationModeControl.claim(this.rotationModeControlConsumer);

    this.orientationSub = this.orientationModule.orientation.sub(orientation => {
      if (this.hasRotationModeControl) {
        this.updateRotation();
      }

      this.targetOffsetPipe?.destroy();
      this.rangeEndpointsPipe?.destroy();

      this.targetOffsetPipe = undefined;
      this.rangeEndpointsPipe = undefined;

      const targetOffset = this.nominalTargetOffsets?.[orientation] ?? MapOrientationRTRController.DEFAULT_TARGET_OFFSET;
      const rangeEndpoints = this.nominalRangeEndpoints?.[orientation] ?? MapOrientationRTRController.DEFAULT_RANGE_ENDPOINTS;

      if (SubscribableUtils.isSubscribable(targetOffset)) {
        this.targetOffsetPipe = targetOffset.pipe(this.nominalTargetOffsetSubject);
      } else {
        this.nominalTargetOffsetSubject.set(targetOffset);
      }

      if (SubscribableUtils.isSubscribable(rangeEndpoints)) {
        this.rangeEndpointsPipe = rangeEndpoints.pipe(this.nominalRangeEndpointsSubject);
      } else {
        this.nominalRangeEndpointsSubject.set(rangeEndpoints);
      }
    }, true);

    this.nominalTargetOffsetSubject.sub(() => { this.needUpdateTargetOffset = true; }, true);
    this.nominalRangeEndpointsSubject.sub(() => { this.needUpdateRangeEndpoints = true; }, true);
  }

  /** @inheritdoc */
  public onDeadZoneChanged(): void {
    this.needUpdateTargetOffset = true;
    this.needUpdateRangeEndpoints = true;
  }

  /** @inheritdoc */
  public onMapProjectionChanged(mapProjection: MapProjection, changeFlags: number): void {
    const projectedSizeChanged = BitFlags.isAny(changeFlags, MapProjectionChangeType.ProjectedSize);
    this.needUpdateTargetOffset ||= projectedSizeChanged;
    this.needUpdateRangeEndpoints ||= projectedSizeChanged;
  }

  /** @inheritdoc */
  public onBeforeUpdated(): void {
    if (this.needUpdateTargetOffset) {
      this.updateTargetOffset();
      this.context.projection.setQueued(this.targetOffsetParam);
      this.needUpdateTargetOffset = false;
    }

    if (this.needUpdateRangeEndpoints) {
      this.updateRangeEndpoints();
      this.context.projection.setQueued(this.rangeEndpointsParam);
      this.needUpdateRangeEndpoints = false;
    }
  }

  /**
   * Updates the map rotation mode based on the current map orientation.
   */
  private updateRotation(): void {
    let rotationType: MapRotation;

    switch (this.orientationModule.orientation.get()) {
      case MapOrientation.HeadingUp:
        rotationType = MapRotation.HeadingUp;
        break;
      case MapOrientation.TrackUp:
        rotationType = MapRotation.TrackUp;
        break;
      case MapOrientation.DtkUp:
        rotationType = MapRotation.DtkUp;
        break;
      default:
        rotationType = MapRotation.NorthUp;
    }

    this.rotationModule.rotationType.set(rotationType);
  }

  /**
   * Updates this controller's projected target offset.
   */
  private updateTargetOffset(): void {
    const projectedSize = this.context.projection.getProjectedSize();
    const nominalTargetOffset = this.nominalTargetOffsetSubject.get();
    const targetOffset = Vec2Math.copy(nominalTargetOffset, this.targetOffsetParam.targetProjectedOffset);

    targetOffset[0] += 0.5;
    targetOffset[1] += 0.5;

    MapSystemUtils.nominalToTrueRelativeXY(targetOffset, projectedSize, this.context.deadZone.get(), targetOffset);

    targetOffset[0] -= 0.5;
    targetOffset[1] -= 0.5;

    targetOffset[0] *= projectedSize[0];
    targetOffset[1] *= projectedSize[1];
  }

  /**
   * Updates this controller's range endpoints.
   */
  private updateRangeEndpoints(): void {
    const projectedSize = this.context.projection.getProjectedSize();
    const deadZone = this.context.deadZone.get();
    const nominalEndpoints = this.nominalRangeEndpointsSubject.get();

    const rangeEndpoints = this.rangeEndpointsParam.rangeEndpoints;
    rangeEndpoints[0] = MapSystemUtils.nominalToTrueRelativeX(nominalEndpoints[0], projectedSize[0], deadZone);
    rangeEndpoints[1] = MapSystemUtils.nominalToTrueRelativeY(nominalEndpoints[1], projectedSize[1], deadZone);
    rangeEndpoints[2] = MapSystemUtils.nominalToTrueRelativeX(nominalEndpoints[2], projectedSize[0], deadZone);
    rangeEndpoints[3] = MapSystemUtils.nominalToTrueRelativeY(nominalEndpoints[3], projectedSize[1], deadZone);
  }

  /** @inheritdoc */
  public onMapDestroyed(): void {
    this.destroy();
  }

  /** @inheritdoc */
  public destroy(): void {
    this.rotationModeControl.forfeit(this.rotationModeControlConsumer);

    this.orientationSub?.destroy();
    this.targetOffsetPipe?.destroy();
    this.rangeEndpointsPipe?.destroy();

    super.destroy();
  }
}