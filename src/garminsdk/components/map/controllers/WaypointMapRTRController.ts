import {
  AirportRunway, BitFlags, GeoPoint, MapFieldOfView, MapFieldOfViewCalculator, MapIndexedRangeModule, MappedSubject,
  MappedSubscribable, MapProjection, MapProjectionChangeType, MapSystemContext, MapSystemController, MapSystemKeys,
  ReadonlyFloat64Array, ResourceConsumer, ResourceHeap, ResourceModerator, Subject, Subscribable, Subscription, UnitType,
  VecNMath, VecNSubject
} from '@microsoft/msfs-sdk';

import { AirportWaypoint } from '../../../navigation';
import { GarminMapKeys } from '../GarminMapKeys';
import { MapResourcePriority } from '../MapResourcePriority';
import { WaypointMapSelectionModule } from '../modules/WaypointMapSelectionModule';
import { MapRangeController } from './MapRangeController';

/**
 * Modules required for WaypointMapRTRController.
 */
export interface WaypointMapRTRControllerModules {
  /** Range module. */
  [GarminMapKeys.Range]: MapIndexedRangeModule;

  /** Waypoint info module. */
  [GarminMapKeys.WaypointSelection]: WaypointMapSelectionModule;
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
 * Controls the target and range of a waypoint map based on the selected waypoint.
 */
export class WaypointMapRTRController extends MapSystemController<
  WaypointMapRTRControllerModules,
  any,
  WaypointMapRTRControllerControllers,
  WaypointMapRTRControllerContext
> {

  private readonly rangeModule = this.context.model.getModule(GarminMapKeys.Range);
  private readonly waypointSelectModule = this.context.model.getModule(GarminMapKeys.WaypointSelection);

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

  private readonly pointHeap = new ResourceHeap(() => new GeoPoint(0, 0), () => { });
  private readonly nominalMargins: Subscribable<ReadonlyFloat64Array>;
  private readonly marginState?: MappedSubscribable<readonly [ReadonlyFloat64Array, ReadonlyFloat64Array]>;
  private readonly margins = VecNSubject.create(VecNMath.create(4));
  private readonly fovCalculator = new MapFieldOfViewCalculator();
  private readonly fov = {
    target: new GeoPoint(NaN, NaN),
    range: NaN
  };

  private readonly waypointState = MappedSubject.create(
    this.waypointSelectModule.waypoint,
    this.waypointSelectModule.runway
  );

  private waypointLocationSub?: Subscription;

  /**
   * Constructor.
   * @param context This controller's map context.
   * @param supportAirportAutoRange Whether this controller automatically adjusts the map range when an airport is
   * the highlighted waypoint to give an appropriate view of the selected runway, or all runways if there is no
   * selected runway.
   * @param defaultAirportRangeIndex A subscribable which provides the default map range index to apply when a range
   * cannot be automatically selected for an airport. Ignored if `supportAirportAutoRange` is `false`. If not defined,
   * the map range will not be reset when targeting an airport and a range cannot be automatically selected.
   * @param airportAutoRangeMargins The nominal margins (relative to the map's dead zone boundaries), to respect when
   * calculating the map range for airports, as `[left, top, right, bottom]` in pixels. Ignored if
   * `supportAirportAutoRange` is `false`. Defaults to `[0, 0, 0, 0]`.
   */
  constructor(
    context: MapSystemContext<WaypointMapRTRControllerModules, any, any, WaypointMapRTRControllerContext>,
    private readonly supportAirportAutoRange: boolean,
    private readonly defaultAirportRangeIndex?: Subscribable<number>,
    airportAutoRangeMargins?: Subscribable<ReadonlyFloat64Array>,
  ) {
    super(context);

    this.nominalMargins = airportAutoRangeMargins ?? Subject.create(VecNMath.create(4));

    if (supportAirportAutoRange) {
      this.marginState = MappedSubject.create(
        this.nominalMargins,
        this.context.deadZone
      );
    }
  }

  /** @inheritdoc */
  public onAfterMapRender(): void {
    this.canTargetWaypoint.sub((canTarget) => {
      if (canTarget) {
        this.tryTargetWaypoint(false);
      }
    });

    this.marginState?.sub(([boundsOffset, deadZone]) => {
      this.margins.set(
        deadZone[0] + boundsOffset[0],
        deadZone[1] + boundsOffset[1],
        deadZone[2] + boundsOffset[2],
        deadZone[3] + boundsOffset[3]
      );
    }, true);

    this.waypointState.sub(([waypoint]) => {
      this.waypointLocationSub?.destroy();
      this.waypointLocationSub = undefined;

      if (waypoint === null) {
        this.targetControl?.forfeit(this.targetControlConsumer);
        this.rangeControl?.forfeit(this.rangeControlConsumer);
      } else {
        this.targetControl?.claim(this.targetControlConsumer);
        this.rangeControl?.claim(this.rangeControlConsumer);

        this.waypointLocationSub = waypoint.location.sub(() => { this.tryTargetWaypoint(true); });
      }

      this.tryTargetWaypoint(true);
    }, true);

    this.margins.sub(() => { this.tryTargetWaypoint(false); });
  }

  /** @inheritdoc */
  public onMapProjectionChanged(mapProjection: MapProjection, changeFlags: number): void {
    if (BitFlags.isAll(changeFlags, MapProjectionChangeType.ProjectedSize) && this.supportAirportAutoRange) {
      this.tryTargetWaypoint(false);
    }
  }

  /**
   * Attempts to target the map to the selected waypoint. If there is no selected waypoint or this controller does not
   * have map target or range control privileges, this method does nothing.
   * @param resetRange Whether to reset the map range if the selected waypoint is an airport and airport auto-range is
   * supported.
   * @returns Whether the map was successfully targeted.
   */
  public tryTargetWaypoint(resetRange: boolean): boolean {
    if (!this.canTargetWaypoint.get()) {
      return false;
    }

    const waypoint = this.waypointSelectModule.waypoint.get();
    const runway = this.waypointSelectModule.runway.get();

    if (waypoint === null) {
      return false;
    }

    let target = waypoint.location.get();
    let rangeIndex = -1;

    if (this.supportAirportAutoRange && waypoint instanceof AirportWaypoint) {
      const fov = this.calculateFovForAirport(waypoint, runway, this.fov);

      if (isNaN(fov.target.lat) || isNaN(fov.target.lon)) {
        // A field of view could not be calculated -> keep the default target of the airport waypoint and if
        // necessary, set the default range index if one exists.
        if (resetRange && this.defaultAirportRangeIndex !== undefined) {
          rangeIndex = this.defaultAirportRangeIndex.get();
        }
      } else {
        target = fov.target;
        if (resetRange) {
          const ranges = this.rangeModule.nominalRanges.get();

          rangeIndex = ranges.findIndex(range => range.compare(fov.range, UnitType.GA_RADIAN) >= 0);
          if (rangeIndex < 0) {
            // All map ranges were smaller than the desired range, so we set the largest range possible.
            rangeIndex = ranges.length - 1;
          }
        }
      }
    }

    this.targetParams.target.set(target);
    this.context.projection.setQueued(this.targetParams);

    if (rangeIndex >= 0) {
      this.context.getController(GarminMapKeys.Range).setRangeIndex(rangeIndex);
    }

    return true;
  }

  /**
   * Calculates the field of view for a selected airport and optional selected runway.
   * @param airport The selected airport.
   * @param runway The selected runway.
   * @param out The object to which to write the results.
   * @returns The field of view for the selected airport and optional selected runway.
   */
  private calculateFovForAirport(airport: AirportWaypoint, runway: AirportRunway | null, out: MapFieldOfView): MapFieldOfView {
    out.target.set(NaN, NaN);
    out.range = NaN;

    const runways = airport.facility.get().runways;

    if (runways.length === 0) {
      return out;
    }

    const focus = [];

    if (runway === null) {
      for (let i = 0; i < runways.length; i++) {
        const airportRunway = runways[i];

        const runwayHalfLength = UnitType.METER.convertTo(airportRunway.length / 2, UnitType.GA_RADIAN);
        const runwayStart = this.pointHeap.allocate().set(airportRunway.latitude, airportRunway.longitude).offset(airportRunway.direction + 180, runwayHalfLength);
        const runwayEnd = this.pointHeap.allocate().set(airportRunway.latitude, airportRunway.longitude).offset(airportRunway.direction, runwayHalfLength);

        focus.push(runwayStart, runwayEnd);
      }
    } else {
      const runwayHalfLength = UnitType.METER.convertTo(runway.length / 2, UnitType.GA_RADIAN);
      const runwayStart = this.pointHeap.allocate().set(runway.latitude, runway.longitude).offset(runway.direction + 180, runwayHalfLength);
      const runwayEnd = this.pointHeap.allocate().set(runway.latitude, runway.longitude).offset(runway.direction, runwayHalfLength);

      focus.push(runwayStart, runwayEnd);
    }

    this.fovCalculator.calculateFov(this.context.projection, focus, this.margins.get(), out);

    for (let i = 0; i < focus.length; i++) {
      this.pointHeap.free(focus[i]);
    }

    return out;
  }

  /** @inheritdoc */
  public onMapDestroyed(): void {
    this.destroy();
  }

  /** @inheritdoc */
  public destroy(): void {
    this.targetControl?.forfeit(this.targetControlConsumer);
    this.rangeControl?.forfeit(this.rangeControlConsumer);

    this.waypointState.destroy();
    this.marginState?.destroy();

    this.waypointLocationSub?.destroy();

    super.destroy();
  }
}