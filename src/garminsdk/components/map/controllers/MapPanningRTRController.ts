/* eslint-disable @typescript-eslint/no-non-null-assertion */

import {
  GeoPoint, GeoPointInterface, MapRotation, MapRotationModule, MapSystemController, MapSystemKeys, ResourceConsumer, ResourceModerator,
  Subject, Subscription
} from '@microsoft/msfs-sdk';

import { GarminMapKeys } from '../GarminMapKeys';
import { MapResourcePriority } from '../MapResourcePriority';
import { MapPanningModule } from '../modules/MapPanningModule';

/**
 * Modules required for MapPanningRTRController.
 */
export interface MapPanningRTRControllerModules {
  /** Panning module. */
  [GarminMapKeys.Panning]: MapPanningModule;

  /** Rotation module. */
  [MapSystemKeys.Rotation]?: MapRotationModule;
}

/**
 * Context properties required for MapPanningRTRController.
 */
export interface MapPanningRTRControllerContext {
  /** Resource moderator for control of the map's projection target. */
  [MapSystemKeys.TargetControl]?: ResourceModerator;

  /** Resource moderator for control of the map's rotation mode. */
  [GarminMapKeys.RotationModeControl]?: ResourceModerator;

  /** Resource moderator for control of the map's orientation mode. */
  [GarminMapKeys.OrientationControl]?: ResourceModerator;

  /** Resource moderator for control of the map's range. */
  [MapSystemKeys.RangeControl]?: ResourceModerator;

  /** Resource moderator for the use range setting subject. */
  [GarminMapKeys.UseRangeSetting]?: ResourceModerator<Subject<boolean>>;
}

/**
 * Controls the target, orientation, and range of a map while manual map panning is active.
 */
export class MapPanningRTRController extends MapSystemController<MapPanningRTRControllerModules, any, any, MapPanningRTRControllerContext> {
  private readonly panningModule = this.context.model.getModule(GarminMapKeys.Panning);
  private readonly rotationModule = this.context.model.getModule(MapSystemKeys.Rotation);

  private readonly mapProjectionParams = {
    target: new GeoPoint(0, 0)
  };

  private readonly targetControl = this.context[MapSystemKeys.TargetControl];

  private hasTargetControl = this.context.targetControlModerator === undefined;

  private readonly targetControlConsumer: ResourceConsumer = {
    priority: MapResourcePriority.PANNING,

    onAcquired: () => {
      this.hasTargetControl = true;

      if (this.panningModule.isActive.get()) {
        this.setMapTarget(this.panningModule.target.get());
      }
    },

    onCeded: () => {
      this.hasTargetControl = false;
    }
  };

  private readonly rotationModeControl = this.context[GarminMapKeys.RotationModeControl];

  private readonly rotationModeControlConsumer: ResourceConsumer = {
    priority: MapResourcePriority.PANNING,

    onAcquired: () => {
      // While panning is active, the map keeps its rotation from when panning was activated.
      this.rotationModule?.rotationType.set(MapRotation.Undefined);
    },

    onCeded: () => { }
  };

  private readonly orientationControl = this.context[GarminMapKeys.OrientationControl];

  private readonly orientationControlConsumer: ResourceConsumer = {
    priority: MapResourcePriority.PANNING,

    onAcquired: () => { }, // While panning is active, the map keeps its desired orientation mode from when panning was activated, so we do nothing.

    onCeded: () => { }
  };

  private readonly rangeControl = this.context[MapSystemKeys.RangeControl];

  private readonly rangeControlConsumer: ResourceConsumer = {
    priority: MapResourcePriority.PANNING,

    onAcquired: () => { }, // We are just holding this to keep other things of lower priority from changing the range.

    onCeded: () => { }
  };

  private readonly useRangeSetting = this.context[GarminMapKeys.UseRangeSetting];

  private readonly useRangeSettingConsumer: ResourceConsumer<Subject<boolean>> = {
    priority: MapResourcePriority.PANNING,

    onAcquired: () => { }, // Panning mode uses the use range setting state that was active when panning was activated, so we do nothing while we have control.

    onCeded: () => { }
  };

  private panningActiveSub?: Subscription;
  private panningTargetSub?: Subscription;

  /** @inheritdoc */
  public onAfterMapRender(): void {
    this.panningTargetSub = this.panningModule.target.sub(this.onTargetChanged.bind(this), false, true);
    this.panningActiveSub = this.panningModule.isActive.sub(this.onPanningActiveChanged.bind(this), true);
  }

  /**
   * Responds to map panning activation changes.
   * @param isActive Whether map panning is active.
   */
  private onPanningActiveChanged(isActive: boolean): void {
    if (isActive) {
      this.onPanningActivated();
    } else {
      this.onPanningDeactivated();
    }
  }

  /**
   * Responds to map panning activation.
   */
  private onPanningActivated(): void {
    this.targetControl?.claim(this.targetControlConsumer);
    if (this.rotationModeControl) {
      this.rotationModeControl.claim(this.rotationModeControlConsumer);
    } else if (this.rotationModule) {
      // While panning is active, the map keeps its rotation from when panning was activated.
      this.rotationModule.rotationType.set(MapRotation.Undefined);
    }
    this.orientationControl?.claim(this.orientationControlConsumer);
    this.rangeControl?.claim(this.rangeControlConsumer);
    this.useRangeSetting?.claim(this.useRangeSettingConsumer);

    this.panningTargetSub!.resume();
  }

  /**
   * Responds to map panning deactivation.
   */
  private onPanningDeactivated(): void {
    this.panningTargetSub!.pause();

    this.targetControl?.forfeit(this.targetControlConsumer);
    this.rotationModeControl?.forfeit(this.rotationModeControlConsumer);
    this.orientationControl?.forfeit(this.orientationControlConsumer);
    this.rangeControl?.forfeit(this.rangeControlConsumer);
    this.useRangeSetting?.forfeit(this.useRangeSettingConsumer);
  }

  /**
   * Responds to when the map panning target changes.
   * @param target The new map panning target.
   */
  private onTargetChanged(target: GeoPointInterface): void {
    if (this.hasTargetControl) {
      this.setMapTarget(target);
    }
  }

  /**
   * Sets the map projection's target.
   * @param target The target to set.
   */
  private setMapTarget(target: GeoPointInterface): void {
    this.mapProjectionParams.target.set(target);
    this.context.projection.setQueued(this.mapProjectionParams);
  }

  /** @inheritdoc */
  public onMapDestroyed(): void {
    this.destroy();
  }

  /** @inheritdoc */
  public destroy(): void {
    this.targetControl?.forfeit(this.targetControlConsumer);
    this.rotationModeControl?.forfeit(this.rotationModeControlConsumer);
    this.orientationControl?.forfeit(this.orientationControlConsumer);
    this.rangeControl?.forfeit(this.rangeControlConsumer);
    this.useRangeSetting?.forfeit(this.useRangeSettingConsumer);

    this.panningActiveSub?.destroy();
    this.panningTargetSub?.destroy();

    super.destroy();
  }
}