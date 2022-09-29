import { MapSystemController, Subscription } from 'msfssdk';

import { GarminMapKeys } from '../GarminMapKeys';
import { MapOrientation, MapOrientationModule } from '../modules/MapOrientationModule';
import { MapRangeCompassModule } from '../modules/MapRangeCompassModule';
import { MapRangeRingModule } from '../modules/MapRangeRingModule';

/**
 * Modules required for MapRangeCompassController.
 */
export interface MapRangeCompassControllerModules {
  /** Orientation module. */
  [GarminMapKeys.Orientation]: MapOrientationModule;

  /** Range compass module. */
  [GarminMapKeys.RangeCompass]: MapRangeCompassModule;

  /** Range ring module. */
  [GarminMapKeys.RangeRing]?: MapRangeRingModule;
}

/**
 * Controls the display of the range compass, and optionally the range ring, based on map orientation.
 */
export class MapRangeCompassController extends MapSystemController<MapRangeCompassControllerModules> {
  private readonly orientation = this.context.model.getModule(GarminMapKeys.Orientation).orientation;
  private readonly rangeCompassShow = this.context.model.getModule(GarminMapKeys.RangeCompass).show;
  private readonly rangeRingShow = this.context.model.getModule(GarminMapKeys.RangeRing)?.show;

  private orientationSub?: Subscription;

  /** @inheritdoc */
  public onAfterMapRender(): void {
    this.orientationSub = this.orientation.sub(mode => {
      const show = mode === MapOrientation.HeadingUp || mode === MapOrientation.TrackUp;
      this.rangeCompassShow.set(show);
      this.rangeRingShow?.set(!show);
    }, true);
  }

  /** @inheritdoc */
  public onMapDestroyed(): void {
    this.destroy();
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.orientationSub?.destroy();
  }
}