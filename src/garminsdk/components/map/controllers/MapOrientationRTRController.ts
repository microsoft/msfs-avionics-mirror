/// <reference types="msfstypes/JS/Avionics" />

import {
  BitFlags, MapOwnAirplanePropsModule, MapProjection, MapProjectionChangeType, MapRotation, MapRotationModule, MapSystemContext, MapSystemController,
  MapSystemKeys, MapSystemUtils, ReadonlyFloat64Array, Subscribable, SubscribableUtils, Subscription, Vec2Math, VecNMath, VecNSubject
} from 'msfssdk';

import { GarminMapKeys } from '../GarminMapKeys';
import { MapOrientation, MapOrientationModule } from '../modules/MapOrientationModule';

/**
 * Modules required for MapOrientationRTRController.
 */
export interface MapOrientationRTRControllerModules {
  /** Rotation module. */
  [MapSystemKeys.Rotation]: MapRotationModule;

  /** Orientation module. */
  [GarminMapKeys.Orientation]: MapOrientationModule;

  /** Own airplane properties module. */
  [MapSystemKeys.OwnAirplaneProps]?: MapOwnAirplanePropsModule;
}

/**
 * Controls the rotation, range, and projected target offset of a map based on the orientation module's orientation
 * value.
 */
export class MapOrientationRTRController extends MapSystemController<MapOrientationRTRControllerModules> {
  private static readonly DEFAULT_TARGET_OFFSET = Vec2Math.create();
  private static readonly DEFAULT_RANGE_ENDPOINTS = VecNMath.create(4, 0.5, 0.5, 0.5, 0);

  private readonly orientationModule = this.context.model.getModule(GarminMapKeys.Orientation);
  private readonly rotationModule = this.context.model.getModule(MapSystemKeys.Rotation);
  private readonly ownAirplanePropsModule = this.context.model.getModule(MapSystemKeys.OwnAirplaneProps);

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
  private onGroundSub?: Subscription;
  private targetOffsetPipe?: Subscription;
  private rangeEndpointsPipe?: Subscription;

  /**
   * Constructor.
   * @param context This controller's map context.
   * @param nominalTargetOffsets The nominal projected target offsets this controller applies for each orientation.
   * If an orientation does not have a defined offset, it will default to `[0, 0]`.
   * @param nominalRangeEndpoints The nominal range endpoints this controller applies for each orientation. If an
   * orientation does not have defined range endpoints, it will default to `[0.5, 0.5, 0.5, 0]`.
   */
  constructor(
    context: MapSystemContext<MapOrientationRTRControllerModules>,
    private readonly nominalTargetOffsets?: Partial<Record<MapOrientation, ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>>>,
    private readonly nominalRangeEndpoints?: Partial<Record<MapOrientation, ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>>>
  ) {
    super(context);
  }

  /** @inheritdoc */
  public onAfterMapRender(): void {
    this.onGroundSub = this.ownAirplanePropsModule?.isOnGround.sub(isOnGround => {
      if (this.orientationModule.orientation.get() === MapOrientation.TrackUp) {
        this.rotationModule.rotationType.set(isOnGround ? MapRotation.HeadingUp : MapRotation.TrackUp);
      }
    });

    this.orientationSub = this.orientationModule.orientation.sub(orientation => {
      let rotationType: MapRotation;

      switch (orientation) {
        case MapOrientation.HeadingUp:
          rotationType = MapRotation.HeadingUp;
          break;
        case MapOrientation.TrackUp:
          if (this.ownAirplanePropsModule?.isOnGround.get() ?? false) {
            rotationType = MapRotation.HeadingUp;
          } else {
            rotationType = MapRotation.TrackUp;
          }
          break;
        default:
          rotationType = MapRotation.NorthUp;
      }

      this.rotationModule.rotationType.set(rotationType);

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
    super.destroy();

    this.orientationSub?.destroy();
    this.onGroundSub?.destroy();
    this.targetOffsetPipe?.destroy();
    this.rangeEndpointsPipe?.destroy();
  }
}