import {
  MapIndexedRangeModule, MapOwnAirplanePropsModule, MappedSubject, MappedSubscribable, MapSystemController, MapSystemKeys,
  ResourceConsumer, ResourceModerator, Subscription
} from '@microsoft/msfs-sdk';

import { GarminMapKeys } from '../GarminMapKeys';
import { MapResourcePriority } from '../MapResourcePriority';
import { MapOrientation, MapOrientationModule } from '../modules/MapOrientationModule';

/**
 * Modules required for MapDesiredOrientationController.
 */
export interface MapDesiredOrientationControllerModules {
  /** Range module. */
  [GarminMapKeys.Range]: MapIndexedRangeModule;

  /** Orientation module. */
  [GarminMapKeys.Orientation]: MapOrientationModule;

  /** Own airplane props module. */
  [MapSystemKeys.OwnAirplaneProps]: MapOwnAirplanePropsModule;
}

/**
 * Context properties required by MapDesiredOrientationController.
 */
export interface MapDesiredOrientationControllerContext {
  /** Resource moderator for control of the map's desired orientation mode. */
  [GarminMapKeys.DesiredOrientationControl]: ResourceModerator;
}

/**
 * Controls the desired orientation of a map based on commanded orientation and auto-north up behavior.
 */
export class MapDesiredOrientationController extends MapSystemController<MapDesiredOrientationControllerModules, any, any, MapDesiredOrientationControllerContext> {
  private readonly rangeModule = this.context.model.getModule(GarminMapKeys.Range);
  private readonly orientationModule = this.context.model.getModule(GarminMapKeys.Orientation);
  private readonly ownAirplanePropsModule = this.context.model.getModule(MapSystemKeys.OwnAirplaneProps);

  private readonly desiredOrientationControl = this.context[GarminMapKeys.DesiredOrientationControl];

  private readonly desiredOrientationControlConsumer: ResourceConsumer = {
    priority: MapResourcePriority.DESIRED_ORIENTATION,

    onAcquired: () => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.orientationPipe!.resume(true);
    },

    onCeded: () => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.orientationPipe!.pause();
    }
  };

  private orientation?: MappedSubscribable<MapOrientation>;

  private orientationPipe?: Subscription;
  private isPointerActiveSub?: Subscription;

  /** @inheritdoc */
  public onAfterMapRender(): void {
    this.orientation = MappedSubject.create(
      ([commandedOrientation, isNorthUpAboveActive, northUpAboveRangeIndex, rangeIndex, isNorthUpOnGroundActive, isOnGround]): MapOrientation => {
        return (isNorthUpAboveActive && rangeIndex > northUpAboveRangeIndex) || (isNorthUpOnGroundActive && isOnGround)
          ? MapOrientation.NorthUp
          : commandedOrientation;
      },
      this.orientationModule.commandedOrientation,
      this.orientationModule.northUpAboveActive,
      this.orientationModule.northUpAboveRangeIndex,
      this.rangeModule.nominalRangeIndex,
      this.orientationModule.northUpOnGroundActive,
      this.ownAirplanePropsModule.isOnGround
    );

    this.orientationPipe = this.orientation.pipe(this.orientationModule.desiredOrientation, true);

    this.desiredOrientationControl.claim(this.desiredOrientationControlConsumer);
  }

  /** @inheritdoc */
  public onMapDestroyed(): void {
    this.destroy();
  }

  /** @inheritdoc */
  public destroy(): void {
    this.desiredOrientationControl.forfeit(this.desiredOrientationControlConsumer);

    this.orientation?.destroy();
    this.orientationPipe?.destroy();
    this.isPointerActiveSub?.destroy();

    super.destroy();
  }
}