import { MapSystemController, MappedSubject, ResourceConsumer, ResourceModerator, Subject, Subscription } from '@microsoft/msfs-sdk';

import { GarminMapKeys, MapOrientationModule, MapResourcePriority } from '@microsoft/msfs-garminsdk';

import { G3XMapKeys } from '../G3XMapKeys';
import { MapOrientationOverrideModule } from '../Modules/MapOrientationOverrideModule';

/**
 * Modules required for G3XMapOrientationModeController.
 */
export interface G3XMapOrientationModeControllerModules {
  /** Orientation module. */
  [GarminMapKeys.Orientation]: MapOrientationModule;

  /** Orientation override module. */
  [G3XMapKeys.OrientationOverride]?: MapOrientationOverrideModule;
}

/**
 * Context properties required by G3XMapOrientationModeController.
 */
export interface G3XMapOrientationModeControllerContext {
  /** Resource moderator for control of the map's orientation mode. */
  [GarminMapKeys.OrientationControl]: ResourceModerator;
}

/**
 * Controls the orientation of a map based on the desired orientation mode.
 */
export class G3XMapOrientationModeController extends MapSystemController<G3XMapOrientationModeControllerModules, any, any, G3XMapOrientationModeControllerContext> {
  private readonly orientationModule = this.context.model.getModule(GarminMapKeys.Orientation);
  private readonly orientationOverrideModule = this.context.model.getModule(G3XMapKeys.OrientationOverride);

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

  private readonly orientationMode = MappedSubject.create(
    ([desired, override]) => override ?? desired,
    this.context.model.getModule(GarminMapKeys.Orientation).desiredOrientation,
    this.orientationOverrideModule?.orientationOverride ?? Subject.create(null)
  ).pause();
  private orientationPipe?: Subscription;

  private commandedOrientationSub?: Subscription;

  /** @inheritdoc */
  public onAfterMapRender(): void {
    this.orientationMode.resume();
    this.orientationPipe = this.orientationMode.pipe(this.orientationModule.orientation, true);

    this.orientationControl.claim(this.orientationControlConsumer);

    if (this.orientationOverrideModule) {
      // Reset orientation override when the commanded orientation changes.
      this.commandedOrientationSub = this.orientationModule.commandedOrientation.sub(
        this.orientationOverrideModule.orientationOverride.set.bind(this.orientationOverrideModule.orientationOverride, null)
      );
    }
  }

  /** @inheritdoc */
  public onMapDestroyed(): void {
    this.destroy();
  }

  /** @inheritdoc */
  public destroy(): void {
    this.orientationControl.forfeit(this.orientationControlConsumer);

    this.orientationMode.destroy();
    this.orientationPipe?.destroy();

    this.commandedOrientationSub?.destroy();

    super.destroy();
  }
}