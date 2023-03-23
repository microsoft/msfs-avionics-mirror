import {
  MapIndexedRangeModule, MapSystemContext, MapSystemController, MapSystemKeys, ResourceConsumer, ResourceModerator,
  Subscribable, Subscription, UnitType
} from '@microsoft/msfs-sdk';

import { GarminMapKeys } from '../GarminMapKeys';
import { MapResourcePriority } from '../MapResourcePriority';
import { MapWaypointHighlightModule } from '../modules/MapWaypointHighlightModule';
import { MapRangeController } from './MapRangeController';

/**
 * Modules required for NearestMapRTRController.
 */
export interface NearestMapRTRControllerModules {
  /** Range module. */
  [GarminMapKeys.Range]: MapIndexedRangeModule;

  /** Waypoint highlight module. */
  [GarminMapKeys.WaypointHighlight]: MapWaypointHighlightModule;
}

/**
 * Required controllers for NearestMapRTRController.
 */
export interface NearestMapRTRControllerControllers {
  /** Range controller. */
  [GarminMapKeys.Range]: MapRangeController;
}

/**
 * Context properties required for NearestMapRTRController.
 */
export interface NearestMapRTRControllerContext {
  /** Resource moderator for control of the map's range. */
  [MapSystemKeys.RangeControl]?: ResourceModerator;
}

/**
 * Controls the range of a nearest waypoint map to keep a highlighted waypoint in view.
 */
export class NearestMapRTRController extends MapSystemController<
  NearestMapRTRControllerModules,
  any,
  NearestMapRTRControllerControllers,
  NearestMapRTRControllerContext
> {

  private readonly rangeModule = this.context.model.getModule(GarminMapKeys.Range);
  private readonly waypointHighlightModule = this.context.model.getModule(GarminMapKeys.WaypointHighlight);

  private readonly rangeControl = this.context[MapSystemKeys.RangeControl];

  private hasRangeControl = this.rangeControl !== undefined;

  private readonly rangeControlConsumer: ResourceConsumer = {
    priority: MapResourcePriority.WAYPOINT_HIGHLIGHT,

    onAcquired: () => {
      this.hasRangeControl = true;
    },

    onCeded: () => { this.hasRangeControl = false; }
  };

  private waypointSub?: Subscription;

  /**
   * Constructor.
   * @param context This controller's map context.
   * @param defaultNoTargetRangeIndex A subscribable which provides the default map range index to apply when
   * not targeting a waypoint, or `null` if no range index should be applied.
   */
  constructor(
    context: MapSystemContext<NearestMapRTRControllerModules, any, any, NearestMapRTRControllerContext>,
    private readonly defaultNoTargetRangeIndex: Subscribable<number> | null
  ) {
    super(context);
  }

  /** @inheritdoc */
  public onAfterMapRender(): void {
    this.rangeControl?.claim(this.rangeControlConsumer);

    this.waypointSub = this.waypointHighlightModule.waypoint.sub(this.trySetRangeForWaypoint.bind(this), true);
  }

  /**
   * Attempts to set the range of this controller's map so that the highlighted waypoint is in view. If there is no
   * highlighted waypoint or this controller does not have map range control privileges, this method does nothing.
   */
  public trySetRangeForWaypoint(): void {
    if (!this.hasRangeControl) {
      return;
    }

    const waypoint = this.waypointHighlightModule.waypoint.get();

    if (waypoint === null) {
      if (this.defaultNoTargetRangeIndex !== null) {
        this.setRangeIndex(this.defaultNoTargetRangeIndex.get());
      }
    } else {
      const distanceFromTarget = this.context.projection.getTarget().distance(waypoint.location.get());
      const ranges = this.rangeModule.nominalRanges.get();

      let index = ranges.findIndex(range => range.compare(distanceFromTarget, UnitType.GA_RADIAN) >= 0);
      if (index === -1) {
        index = ranges.length - 1;
      }

      this.setRangeIndex(index);
    }
  }

  /**
   * Sets the range index of this controller's map.
   * @param index The index to set.
   */
  private setRangeIndex(index: number): void {
    this.context.getController(GarminMapKeys.Range).setRangeIndex(index, true);
  }

  /** @inheritdoc */
  public onMapDestroyed(): void {
    this.destroy();
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.rangeControl?.forfeit(this.rangeControlConsumer);

    this.waypointSub?.destroy();
  }
}