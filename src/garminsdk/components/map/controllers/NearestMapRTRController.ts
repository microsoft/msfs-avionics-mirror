import {
  MapIndexedRangeModule, MapSystemContext, MapSystemController, MapSystemKeys, ResourceConsumer, ResourceModerator, Subscribable, Subscription, UnitType,
  Waypoint
} from 'msfssdk';

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
      this.trySetRangeForWaypoint(this.waypointHighlightModule.waypoint.get());
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
   * Attempts to set the range of the map so that the specified waypoint is in view. If this controller does not have
   * permission to change the map's range, the operation will be aborted.
   * @param waypoint The waypoint for which to set the map range.
   */
  private trySetRangeForWaypoint(waypoint: Waypoint | null): void {
    if (!this.hasRangeControl) {
      return;
    }

    if (waypoint === null) {
      if (this.defaultNoTargetRangeIndex !== null) {
        this.context.getController(GarminMapKeys.Range).setRangeIndex(this.defaultNoTargetRangeIndex.get());
      }
    } else {
      const distanceFromTarget = this.context.projection.getTarget().distance(waypoint.location.get());
      const ranges = this.rangeModule.nominalRanges.get();

      let index = ranges.findIndex(range => range.compare(distanceFromTarget, UnitType.GA_RADIAN) >= 0);
      if (index === -1) {
        index = ranges.length - 1;
      }

      this.context.getController(GarminMapKeys.Range).setRangeIndex(index);
    }
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