/// <reference types="@microsoft/msfs-types/js/avionics" />

import { UnitType } from '../../../math';
import { Subscription } from '../../../sub/Subscription';
import { ResourceConsumer, ResourceModerator } from '../../../utils/resource';
import { MapOwnAirplanePropsModule } from '../../map/modules/MapOwnAirplanePropsModule';
import { MapSystemController } from '../MapSystemController';
import { MapSystemKeys } from '../MapSystemKeys';
import { MapRotation, MapRotationModule } from '../modules/MapRotationModule';

/**
 * Modules required for MapRotationController.
 */
export interface MapRotationControllerModules {
  /** Rotation module. */
  [MapSystemKeys.Rotation]: MapRotationModule;

  /** Own airplane properties module. */
  [MapSystemKeys.OwnAirplaneProps]?: MapOwnAirplanePropsModule;
}

/**
 * Required context properties for MapRotationController.
 */
export interface MapRotationControllerContext {
  /** Resource moderator for control of the map's rotation. */
  [MapSystemKeys.RotationControl]: ResourceModerator;
}

/**
 * Controls the rotation of a map based on the behavior defined in {@link MapRotationModule}.
 */
export class MapRotationController extends MapSystemController<MapRotationControllerModules, any, any, MapRotationControllerContext> {
  private readonly rotationModule = this.context.model.getModule(MapSystemKeys.Rotation);
  private readonly ownAirplanePropsModule = this.context.model.getModule(MapSystemKeys.OwnAirplaneProps);

  private readonly rotationParam = {
    rotation: 0
  };

  private hasRotationControl = false;

  private readonly rotationControl = this.context[MapSystemKeys.RotationControl];

  private readonly rotationControlConsumer: ResourceConsumer = {
    priority: 0,

    onAcquired: () => {
      this.hasRotationControl = true;
    },

    onCeded: () => {
      this.hasRotationControl = false;
    }
  };

  private readonly rotationFuncs: Partial<Record<MapRotation, () => number>> = {
    [MapRotation.NorthUp]: (): number => 0,

    [MapRotation.HeadingUp]: this.ownAirplanePropsModule === undefined
      ? (): number => 0
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      : (): number => -this.ownAirplanePropsModule!.hdgTrue.get() * Avionics.Utils.DEG2RAD,

    [MapRotation.TrackUp]: this.ownAirplanePropsModule === undefined
      ? (): number => 0
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      : (): number => this.ownAirplanePropsModule!.groundSpeed.get().asUnit(UnitType.KNOT) < 5
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ? -this.ownAirplanePropsModule!.hdgTrue.get() * Avionics.Utils.DEG2RAD
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        : -this.ownAirplanePropsModule!.trackTrue.get() * Avionics.Utils.DEG2RAD,

    [MapRotation.DtkUp]: (): number => 0 // TODO
  };

  private rotationFunc?: () => number;

  private rotationSub?: Subscription;

  /** @inheritdoc */
  public onAfterMapRender(): void {
    this.rotationSub = this.rotationModule.rotationType.sub(type => {
      this.rotationFunc = this.rotationFuncs[type];
    }, true);

    this.rotationControl.claim(this.rotationControlConsumer);
  }

  /** @inheritdoc */
  public onBeforeUpdated(): void {
    if (this.hasRotationControl && this.rotationFunc !== undefined) {
      this.rotationParam.rotation = this.rotationFunc();
      this.context.projection.setQueued(this.rotationParam);
    }
  }


  /** @inheritdoc */
  public onMapDestroyed(): void {
    super.onMapDestroyed();

    this.destroy();
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.rotationSub?.destroy();
    this.rotationControl.forfeit(this.rotationControlConsumer);
  }
}