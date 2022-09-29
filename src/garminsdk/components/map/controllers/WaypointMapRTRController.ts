import {
  BitFlags, GeoPoint, MapIndexedRangeModule, MappedSubject, MapProjection, MapProjectionChangeType, MapSystemContext, MapSystemController, MapSystemKeys,
  ReadonlyFloat64Array, ResourceConsumer, ResourceModerator, Subject, Subscribable, Subscription, UnitType, Vec2Math, VecNMath, Waypoint
} from 'msfssdk';

import { AirportWaypoint } from '../../../navigation';
import { GarminMapKeys } from '../GarminMapKeys';
import { MapResourcePriority } from '../MapResourcePriority';
import { MapWaypointHighlightModule } from '../modules/MapWaypointHighlightModule';
import { MapRangeController } from './MapRangeController';

/**
 * Modules required for WaypointMapRTRController.
 */
export interface WaypointMapRTRControllerModules {
  /** Range module. */
  [GarminMapKeys.Range]: MapIndexedRangeModule;

  /** Waypoint highlight module. */
  [GarminMapKeys.WaypointHighlight]: MapWaypointHighlightModule;
}

/**
 * Required controllers for WaypointMapRTRController.
 */
export interface WaypointMapRTRControllerControllers {
  /** Range controller. */
  [GarminMapKeys.Range]: MapRangeController;
}

/**
 * Context properties required for WaypointMapRTRController.
 */
export interface WaypointMapRTRControllerContext {
  /** Resource moderator for control of the map's projection target. */
  [MapSystemKeys.TargetControl]?: ResourceModerator;

  /** Resource moderator for control of the map's range. */
  [MapSystemKeys.RangeControl]?: ResourceModerator;
}

/**
 * Controls the target and range of a waypoint map based on a highlighted waypoint.
 */
export class WaypointMapRTRController extends MapSystemController<
  WaypointMapRTRControllerModules,
  any,
  WaypointMapRTRControllerControllers,
  WaypointMapRTRControllerContext
> {

  private static readonly NMILE_TO_RADIAN = UnitType.NMILE.convertTo(1, UnitType.GA_RADIAN);

  private static readonly vec2Cache = [Vec2Math.create()];
  private static readonly geoPointCache = [new GeoPoint(0, 0), new GeoPoint(0, 0), new GeoPoint(0, 0)];

  private readonly rangeModule = this.context.model.getModule(GarminMapKeys.Range);
  private readonly waypointHighlightModule = this.context.model.getModule(GarminMapKeys.WaypointHighlight);

  private readonly targetParams = {
    target: new GeoPoint(0, 0)
  };

  private readonly targetControl = this.context[MapSystemKeys.TargetControl];

  private readonly hasTargetControl = Subject.create(this.targetControl === undefined);

  private readonly targetControlConsumer: ResourceConsumer = {
    priority: MapResourcePriority.WAYPOINT_HIGHLIGHT,

    onAcquired: () => { this.hasTargetControl.set(true); },

    onCeded: () => { this.hasTargetControl.set(false); }
  };

  private readonly rangeControl = this.context[MapSystemKeys.RangeControl];

  private readonly hasRangeControl = Subject.create(this.rangeControl === undefined);

  private readonly rangeControlConsumer: ResourceConsumer = {
    priority: MapResourcePriority.WAYPOINT_HIGHLIGHT,

    onAcquired: () => { this.hasRangeControl.set(true); },

    onCeded: () => { this.hasRangeControl.set(false); }
  };

  private readonly canTargetWaypoint = MappedSubject.create(
    ([hasTargetControl, hasRangeControl]): boolean => {
      return hasTargetControl && hasRangeControl;
    },
    this.hasTargetControl,
    this.hasRangeControl
  );

  private readonly virtualProjection = new MapProjection(100, 100);
  private readonly boundsOffset: Subscribable<ReadonlyFloat64Array> | undefined;
  private readonly bounds = VecNMath.create(4);

  private waypointSub?: Subscription;
  private waypointLocationSub?: Subscription;
  private boundsOffsetSub?: Subscription;

  /**
   * Constructor.
   * @param context This controller's map context.
   * @param defaultNoTargetRangeIndex A subscribable which provides the default map range index to apply when
   * not targeting a waypoint, or `null` if no range index should be applied.
   * @param defaultTargetRangeIndex A subscribable which provides the default map range index to apply when
   * targeting a waypoint, or `null` if no range index should be applied.
   * @param supportAirportAutoRange Whether this controller automatically adjusts the map range when an airport is
   * the highlighted waypoint to give an appropriate view of all runways.
   * @param boundsOffset The offset of the boundaries of this controller's enforced display area relative to the
   * boundaries of the map's projected window, *excluding* the dead zone, as `[left, top, right, bottom]` in pixels.
   * Positive offsets are directed toward the center of the map. When this controller selects a map range when
   * targeting an airport, it will attempt to keep all runways within the display area. Defaults to `[0, 0, 0, 0]`.
   * Ignored if `supportAirportAutoRange` is `false`.
   */
  constructor(
    context: MapSystemContext<WaypointMapRTRControllerModules, any, any, WaypointMapRTRControllerContext>,
    private readonly defaultNoTargetRangeIndex: Subscribable<number> | null,
    private readonly defaultTargetRangeIndex: Subscribable<number> | null,
    private readonly supportAirportAutoRange: boolean,
    boundsOffset?: Subscribable<ReadonlyFloat64Array>,
  ) {
    super(context);

    this.boundsOffset = supportAirportAutoRange ? boundsOffset ?? Subject.create(VecNMath.create(4)) : undefined;
  }

  /** @inheritdoc */
  public onAfterMapRender(): void {
    this.boundsOffsetSub = this.boundsOffset?.sub(this.updateBounds.bind(this), true);

    this.canTargetWaypoint.sub((canTarget) => {
      if (canTarget) {
        this.tryTargetWaypoint(this.waypointHighlightModule.waypoint.get());
      }
    });

    this.waypointSub = this.waypointHighlightModule.waypoint.sub(waypoint => {
      this.waypointLocationSub?.destroy();
      this.waypointLocationSub = undefined;

      if (waypoint === null) {
        this.targetControl?.forfeit(this.targetControlConsumer);
        this.rangeControl?.forfeit(this.rangeControlConsumer);
      } else {
        this.targetControl?.claim(this.targetControlConsumer);
        this.rangeControl?.claim(this.rangeControlConsumer);

        this.waypointLocationSub = waypoint.location.sub(() => { this.tryTargetWaypoint(waypoint); });
      }

      this.tryTargetWaypoint(waypoint);
    }, true);
  }

  /** @inheritdoc */
  public onMapProjectionChanged(mapProjection: MapProjection, changeFlags: number): void {
    if (BitFlags.isAll(changeFlags, MapProjectionChangeType.ProjectedSize) && this.supportAirportAutoRange) {
      this.updateBounds();
    }
  }

  /**
   * Updates the boundaries of this controller's enforced display area.
   */
  private updateBounds(): void {
    const projectedSize = this.context.projection.getProjectedSize();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const offset = this.boundsOffset!.get();

    this.bounds[0] = offset[0];
    this.bounds[1] = offset[1];
    this.bounds[2] = projectedSize[0] - offset[2];
    this.bounds[3] = projectedSize[1] - offset[3];
  }

  /**
   * Targets the map to a waypoint.
   * @param waypoint The waypoint to target.
   */
  private tryTargetWaypoint(waypoint: Waypoint | null): void {
    if (!this.canTargetWaypoint.get()) {
      return;
    }

    if (waypoint !== null) {
      this.targetParams.target.set(waypoint.location.get());
      this.context.projection.setQueued(this.targetParams);
    }

    this.trySetRangeForWaypoint(waypoint);
  }

  /**
   * Attempts to set the map's range for a specified waypoint.
   * @param waypoint The waypoint for which to set the range.
   */
  private trySetRangeForWaypoint(waypoint: Waypoint | null): void {
    if (waypoint === null) {
      if (this.defaultNoTargetRangeIndex !== null) {
        this.context.getController(GarminMapKeys.Range).setRangeIndex(this.defaultNoTargetRangeIndex.get());
      }
    } else {
      let rangeIndex = NaN;
      if (this.supportAirportAutoRange && waypoint instanceof AirportWaypoint) {
        rangeIndex = this.calculateRangeIndexForAirport(waypoint);
      }

      if (!isNaN(rangeIndex)) {
        this.context.getController(GarminMapKeys.Range).setRangeIndex(rangeIndex);
      } else if (this.defaultTargetRangeIndex !== null) {
        this.context.getController(GarminMapKeys.Range).setRangeIndex(this.defaultTargetRangeIndex.get());
      }
    }
  }

  /**
   * Calculates the smallest map range index which will keep all runways of an airport in view when the map is
   * targeted to the airport. If the airport has no runways, `NaN` will be returned.
   * @param airport The airport for which to calculate the range index.
   * @returns The smallest map range index which will keep all runways of an airport in view when the map is targeted
   * to the airport, or `NaN` if the airport has no runways.
   */
  private calculateRangeIndexForAirport(airport: AirportWaypoint): number {
    const runways = airport.facility.get().runways;

    if (runways.length === 0) {
      return NaN;
    }

    this.virtualProjection.set({
      projectedSize: this.context.projection.getProjectedSize(),
      rotation: this.context.projection.getRotation(),
      target: airport.location.get(),
      range: WaypointMapRTRController.NMILE_TO_RADIAN,
      rangeEndpoints: this.context.projection.getRangeEndpoints()
    });

    // Our strategy here is to find the most displaced runway end from the lat/lon of the airport in either the x or
    // y direction, weighted by the distance from the airport lat/lon to the map boundary in that direction. If this
    // point is in bounds, then all other runway ends must be in bounds. Therefore, once we have found this point it
    // will suffice to find the smallest map range at which the point is in bounds.

    const projectedSize = this.virtualProjection.getProjectedSize();
    const targetProjected = this.virtualProjection.getTargetProjected();
    const bounds = this.bounds;

    const negXRef = Math.max(targetProjected[0] - bounds[0], 0);
    const posXRef = Math.max(bounds[2] - targetProjected[0], 0);
    const negYRef = Math.max(targetProjected[1] - bounds[1], 0);
    const posYRef = Math.max(bounds[3] - targetProjected[1], 0);

    const negXBias = negXRef / targetProjected[0];
    const posXBias = posXRef / (projectedSize[0] - targetProjected[0]);
    const negYBias = negYRef / targetProjected[1];
    const posYBias = negXRef / (projectedSize[1] - targetProjected[1]);

    const maxXFactorPoint = WaypointMapRTRController.geoPointCache[0];
    const maxYFactorPoint = WaypointMapRTRController.geoPointCache[1];

    const currentPoint = WaypointMapRTRController.geoPointCache[2];

    let maxXFactor = 0;
    let maxYFactor = 0;
    let maxXBias = 0;
    let maxYBias = 0;
    for (let i = 0; i < runways.length; i++) {
      const runway = runways[i];
      currentPoint.set(runway.latitude, runway.longitude);

      const runwayLengthRad = UnitType.METER.convertTo(runway.length, UnitType.GA_RADIAN);

      currentPoint.offset(runway.direction, -runwayLengthRad / 2);
      const primaryProjected = this.virtualProjection.project(currentPoint, WaypointMapRTRController.vec2Cache[0]);
      const primaryDeltaX = primaryProjected[0] - targetProjected[0];
      const primaryDeltaY = primaryProjected[1] - targetProjected[1];

      const primaryXFactor = primaryDeltaX < 0 ? -primaryDeltaX / negXRef : primaryDeltaX / posXRef;
      const primaryYFactor = primaryDeltaY < 0 ? -primaryDeltaY / negYRef : primaryDeltaY / posYRef;

      if (primaryXFactor > maxXFactor) {
        maxXFactorPoint.set(currentPoint);
        maxXFactor = primaryXFactor;
        maxXBias = primaryDeltaX < 0 ? negXBias : posXBias;
      }
      if (primaryYFactor > maxYFactor) {
        maxYFactorPoint.set(currentPoint);
        maxYFactor = primaryYFactor;
        maxYBias = primaryDeltaY < 0 ? negYBias : posYBias;
      }

      currentPoint.offset(runway.direction, runwayLengthRad / 2);
      const secondaryProjected = this.virtualProjection.project(currentPoint, WaypointMapRTRController.vec2Cache[0]);
      const secondaryDeltaX = secondaryProjected[0] - targetProjected[0];
      const secondaryDeltaY = secondaryProjected[1] - targetProjected[1];

      const secondaryXFactor = secondaryDeltaX < 0 ? -secondaryDeltaX / negXRef : secondaryDeltaX / posXRef;
      const secondaryYFactor = secondaryDeltaY < 0 ? -secondaryDeltaY / negYRef : secondaryDeltaY / posYRef;

      if (secondaryXFactor > maxXFactor) {
        maxXFactorPoint.set(currentPoint);
        maxXFactor = secondaryXFactor;
        maxXBias = secondaryDeltaX < 0 ? negXBias : posXBias;
      }
      if (secondaryYFactor > maxYFactor) {
        maxYFactorPoint.set(currentPoint);
        maxYFactor = secondaryYFactor;
        maxYBias = secondaryDeltaY < 0 ? negYBias : posYBias;
      }
    }

    if (!isFinite(maxXFactor) || !isFinite(maxYFactor) || (maxXFactor === 0 && maxYFactor === 0)) {
      return NaN;
    }

    // We take advantage of the fact that at the scale of airport runways, the Mercator projection has effectively no
    // local distortion, so we can assume a linear relationship between projected distance and spherical distance

    let forecastRangeNM: number;
    let maxFactorPoint: GeoPoint;

    if (maxXFactor > maxYFactor) {
      forecastRangeNM = maxXFactor * maxXBias + (1 - maxXBias);
      maxFactorPoint = maxXFactorPoint;
    } else {
      forecastRangeNM = maxYFactor * maxYBias + (1 - maxYBias);
      maxFactorPoint = maxYFactorPoint;
    }

    const ranges = this.rangeModule.nominalRanges.get();
    const forecastRangeIndex = ranges.findIndex(range => range.compare(forecastRangeNM, UnitType.NMILE) >= 0);

    if (forecastRangeIndex < 0) {
      return ranges.length - 1;
    }

    this.virtualProjection.set({ range: ranges[forecastRangeIndex].asUnit(UnitType.GA_RADIAN) });

    // Just in case, we will do one check if the most displaced point is in bounds at our predicted range, and if it
    // isn't, we increment the range index by one.
    if (this.virtualProjection.isInProjectedBounds(maxFactorPoint, bounds)) {
      return forecastRangeIndex;
    } else {
      return Math.min(forecastRangeIndex + 1, ranges.length - 1);
    }
  }

  /** @inheritdoc */
  public onMapDestroyed(): void {
    this.destroy();
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.targetControl?.forfeit(this.targetControlConsumer);
    this.rangeControl?.forfeit(this.rangeControlConsumer);

    this.waypointSub?.destroy();
    this.waypointLocationSub?.destroy();
    this.boundsOffsetSub?.destroy();
  }
}