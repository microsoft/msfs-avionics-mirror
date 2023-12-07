import {
  MapSystemController, ResourceConsumer, ResourceModerator, Subscription
} from '@microsoft/msfs-sdk';

import { GarminMapKeys } from '../GarminMapKeys';
import { MapOrientationModule } from '../modules/MapOrientationModule';
import { MapResourcePriority } from '../MapResourcePriority';

/**
 * Modules required for MapOrientationModeController.
 */
export interface MapOrientationModeControllerModules {
  /** Orientation module. */
  [GarminMapKeys.Orientation]: MapOrientationModule;
}

/**
 * Context properties required by MapOrientationModeController.
 */
export interface MapOrientationModeControllerContext {
  /** Resource moderator for control of the map's orientation mode. */
  [GarminMapKeys.OrientationControl]: ResourceModerator;
}

/**
 * Controls the orientation of a map based on the desired orientation mode.
 */
export class MapOrientationModeController extends MapSystemController<MapOrientationModeControllerModules, any, any, MapOrientationModeControllerContext> {
  private readonly orientationModule = this.context.model.getModule(GarminMapKeys.Orientation);

  private readonly orientationControl = this.context[GarminMapKeys.OrientationControl];

  private readonly orientationControlConsumer: ResourceConsumer = {
    priority: MapResourcePriority.ORIENTATION,

    onAcquired: () => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.orientationPipe!.resume(true);
    },

    onCeded: () => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.orientationPipe!.pause();
    }
  };

  private orientationPipe?: Subscription;

  /** @inheritdoc */
  public onAfterMapRender(): void {
    this.orientationPipe = this.orientationModule.desiredOrientation.pipe(this.orientationModule.orientation, true);

    this.orientationControl.claim(this.orientationControlConsumer);
  }

  /** @inheritdoc */
  public onMapDestroyed(): void {
    this.destroy();
  }

  /** @inheritdoc */
  public destroy(): void {
    this.orientationControl.forfeit(this.orientationControlConsumer);

    this.orientationPipe?.destroy();

    super.destroy();
  }
}