import {
  MapIndexedRangeModule, MapSystemContext, MapSystemController, MapSystemKeys, ReadonlyFloat64Array, ResourceConsumer,
  ResourceModerator, Subscription, UnitType, Vec2Math
} from '@microsoft/msfs-sdk';

import { GarminMapKeys, MapRangeController, MapResourcePriority, MapWaypointHighlightModule } from '@microsoft/msfs-garminsdk';

/**
 * Modules required for {@link G3XNearestMapRTRController}.
 */
export interface G3XNearestMapRTRControllerModules {
  /** Range module. */
  [GarminMapKeys.Range]: MapIndexedRangeModule;

  /** Waypoint highlight module. */
  [GarminMapKeys.WaypointHighlight]: MapWaypointHighlightModule;
}

/**
 * Controllers required for {@link G3XNearestMapRTRController}.
 */
export interface G3XNearestMapRTRControllerControllers {
  /** Range controller. */
  [GarminMapKeys.Range]: MapRangeController;
}

/**
 * Context properties required for {@link G3XNearestMapRTRController}.
 */
export interface NearestMapRTRControllerContext {
  /** Resource moderator for control of the map's range. */
  [MapSystemKeys.RangeControl]?: ResourceModerator;
}

/**
 * Controls the range of a G3X Touch nearest waypoint map to keep a highlighted waypoint in view.
 */
export class G3XNearestMapRTRController extends MapSystemController<
  G3XNearestMapRTRControllerModules,
  any,
  G3XNearestMapRTRControllerControllers,
  NearestMapRTRControllerContext
> {

  private static readonly vec2Cache = [Vec2Math.create()];

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
   * Creates a new instance of G3XNearestMapRTRController.
   * @param context This controller's map context.
   * @param margins The margins around the projected map boundaries to respect when selecting a range to place a
   * highlighted waypoint in view, as `[left, top, right, bottom]` in pixels. Positive values move the margin inwards
   * toward the center of the projection.
   */
  public constructor(
    context: MapSystemContext<G3XNearestMapRTRControllerModules, any, any, NearestMapRTRControllerContext>,
    private readonly margins: ReadonlyFloat64Array
  ) {
    super(context);
  }

  /** @inheritDoc */
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

    if (waypoint !== null) {
      const projectedSize = this.context.projection.getProjectedSize();
      const targetProjected = this.context.projection.getTargetProjected();

      const waypointLocation = waypoint.location.get();
      const waypointProjected = this.context.projection.project(waypointLocation, G3XNearestMapRTRController.vec2Cache[0]);
      const waypointProjectedDx = waypointProjected[0] - targetProjected[0];
      const waypointProjectedDy = waypointProjected[1] - targetProjected[1];

      const xMinTargetDelta = this.margins[0] - targetProjected[0];
      const xMaxTargetDelta = projectedSize[0] - this.margins[2] - targetProjected[0];
      const yMinTargetDelta = this.margins[1] - targetProjected[1];
      const yMaxTargetDelta = projectedSize[1] - this.margins[3] - targetProjected[1];

      const xMinT = waypointProjectedDx === 0 ? 0 : Math.max(0, xMinTargetDelta / waypointProjectedDx);
      const xMaxT = waypointProjectedDx === 0 ? Infinity : Math.max(0, xMaxTargetDelta / waypointProjectedDx);
      const yMinT = waypointProjectedDy === 0 ? 0 : Math.max(0, yMinTargetDelta / waypointProjectedDy);
      const yMaxT = waypointProjectedDy === 0 ? Infinity : Math.max(0, yMaxTargetDelta / waypointProjectedDy);

      const maxT = Math.min(Math.max(xMinT, xMaxT), Math.max(yMinT, yMaxT));

      if (maxT === Infinity) {
        // The waypoint is coincident with the target of the projection, so we will set the smallest range possible.
        this.setRangeIndex(0);
        return;
      } else if (maxT === 0) {
        // The waypoint cannot be projected within bounds no matter how large the map range is, so we will set the
        // largest range possible.
        this.setRangeIndex(this.rangeModule.nominalRanges.get().length - 1);
        return;
      }

      const projectedDistanceToBounds = Math.hypot(waypointProjectedDx, waypointProjectedDy) * maxT;

      const rangeEndpoints = this.context.projection.getRangeEndpoints();
      const rangeProjected = Math.hypot(
        (rangeEndpoints[2] - rangeEndpoints[0]) * projectedSize[0],
        (rangeEndpoints[3] - rangeEndpoints[1]) * projectedSize[1]
      );

      const waypointDistance = this.context.projection.getTarget().distance(waypoint.location.get());

      const ranges = this.rangeModule.nominalRanges.get();

      let index = ranges.length - 1;
      for (let i = 0; i < ranges.length; i++) {
        const resolution = ranges[i].asUnit(UnitType.GA_RADIAN) / rangeProjected;
        if (waypointDistance / resolution <= projectedDistanceToBounds) {
          index = i;
          break;
        }
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

  /** @inheritDoc */
  public onMapDestroyed(): void {
    this.destroy();
  }

  /** @inheritDoc */
  public destroy(): void {
    this.rangeControl?.forfeit(this.rangeControlConsumer);

    this.waypointSub?.destroy();

    super.destroy();
  }
}