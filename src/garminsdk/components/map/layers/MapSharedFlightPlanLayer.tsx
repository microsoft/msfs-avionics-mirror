import {
  BitFlags, ClippedPathStream, EventBus, FlightPlan, FlightPlanSegmentType, FSComponent, GeoCircleResampler,
  GeoProjectionPathStreamStack, MapCachedCanvasLayer, MapLayer, MapLayerProps, MapProjection, MapProjectionChangeType,
  MapSharedCachedCanvasLayer, MapSharedCachedCanvasSubLayer, MapSharedCachedCanvasSubLayerProps, NullPathStream,
  Subscribable, Subscription, UnitType, VecNSubject, VNavState, VNavWaypoint, VNode
} from '@microsoft/msfs-sdk';

import { FmsUtils } from '../../../flightplan/FmsUtils';
import { MapFlightPathPlanRenderer } from '../flightplan/MapFlightPathPlanRenderer';
import { MapFlightPlanDataProvider } from '../flightplan/MapFlightPlanDataProvider';
import { MapFlightPlanWaypointRecordManager } from '../flightplan/MapFlightPlanWaypointRecordManager';
import { GarminMapKeys } from '../GarminMapKeys';
import { MapWaypointRenderer, MapWaypointRenderRole } from '../MapWaypointRenderer';
import { MapGarminFlightPlanModule } from '../modules/MapGarminFlightPlanModule';

/**
 * Modules required for {@link MapSharedFlightPlanLayer}.
 */
export interface MapSharedFlightPlanLayerModules {
  /** Garmin flight plan module. */
  [GarminMapKeys.FlightPlan]: MapGarminFlightPlanModule;
}

/**
 * Component props for {@link MapSharedFlightPlanLayer}.
 */
export interface MapSharedFlightPlanLayerProps extends MapLayerProps<MapSharedFlightPlanLayerModules> {
  /** The event bus. */
  bus: EventBus;
}

/**
 * A map layer that draws zero or more flight plans to a shared canvas.
 */
export class MapSharedFlightPlanLayer extends MapLayer<MapSharedFlightPlanLayerProps> {
  private readonly canvasLayerRef = FSComponent.createRef<MapCachedCanvasLayer<any>>();

  private readonly subs: Subscription[] = [];

  /** @inheritDoc */
  public onAttached(): void {
    super.onAttached();

    this.canvasLayerRef.instance.onAttached();
  }

  /** @inheritDoc */
  public onMapProjectionChanged(mapProjection: MapProjection, changeFlags: number): void {
    this.canvasLayerRef.instance.onMapProjectionChanged(mapProjection, changeFlags);
  }

  /** @inheritDoc */
  public onUpdated(time: number, elapsed: number): void {
    this.canvasLayerRef.instance.onUpdated(time, elapsed);
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div style='position: absolute; left: 0; top: 0; width: 100%; height: 100%;'>
        <MapSharedCachedCanvasLayer
          ref={this.canvasLayerRef}
          model={this.props.model}
          mapProjection={this.props.mapProjection}
          overdrawFactor={Math.SQRT2}
        >
          {this.props.model.getModule(GarminMapKeys.FlightPlan).entries.map(entry => {
            return (
              <MapSharedFlightPlanSubLayer
                model={this.props.model}
                dataProvider={entry.dataProvider}
                drawEntirePlan={entry.drawEntirePlan}
                waypointRenderer={entry.waypointRenderer}
                waypointRecordManager={entry.waypointRecordManager}
                pathRenderer={entry.pathRenderer}
              />
            );
          })}
        </MapSharedCachedCanvasLayer>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.canvasLayerRef.getOrDefault()?.destroy();

    this.subs.forEach(sub => { sub.destroy(); });

    super.destroy();
  }
}

/**
 * Component props for {@link MapSharedFlightPlanSubLayer}.
 */
interface MapSharedFlightPlanSubLayerProps extends MapSharedCachedCanvasSubLayerProps<MapSharedFlightPlanLayerModules> {
  /** The data provider for the sublayer's flight plan. */
  dataProvider: MapFlightPlanDataProvider;

  /**
   * A subscribable which provides whether the sublayer should draw the entire plan instead of only from the active
   * lateral leg.
   */
  drawEntirePlan: Subscribable<boolean>;

  /** The waypoint renderer to use. */
  waypointRenderer: MapWaypointRenderer;

  /** The waypoint record manager to use. */
  waypointRecordManager: MapFlightPlanWaypointRecordManager;

  /** The flight path renderer to use. */
  pathRenderer: MapFlightPathPlanRenderer;
}

/**
 * A sublayer of {@link MapSharedFlightPlanLayer} that draws a single flight plan.
 */
class MapSharedFlightPlanSubLayer extends MapSharedCachedCanvasSubLayer<MapSharedFlightPlanSubLayerProps> {
  private static readonly CLIP_BOUNDS_BUFFER = 10; // number of pixels from edge of canvas to extend the clipping bounds, in pixels

  private static vnavWaypointUidSource = 0;

  private readonly resampler = new GeoCircleResampler(Math.PI / 12, 0.25, 8);

  private readonly clipBoundsSub = VecNSubject.create(new Float64Array(4));
  private readonly clippedPathStream = new ClippedPathStream(NullPathStream.INSTANCE, this.clipBoundsSub);

  private pathStreamStack!: GeoProjectionPathStreamStack;

  private readonly vnavWaypointUid = MapSharedFlightPlanSubLayer.vnavWaypointUidSource++;
  private todWaypoint?: VNavWaypoint;
  private bodWaypoint?: VNavWaypoint;
  private tocWaypoint?: VNavWaypoint;
  private bocWaypoint?: VNavWaypoint;
  private renderedVNavWaypoint?: VNavWaypoint;

  private isObsActive = false;
  private obsCourse = 0;

  private needDrawRoute = false;
  private needRefreshWaypoints = false;
  private needRepickWaypoints = false;
  private needUpdateVNavWaypoint = false;

  private readonly subs: Subscription[] = [];

  /** @inheritDoc */
  public onAttached(): void {
    this.pathStreamStack = new GeoProjectionPathStreamStack(NullPathStream.INSTANCE, this.projection.getGeoProjection(), this.resampler);

    this.pathStreamStack.pushPostProjected(this.clippedPathStream);
    this.pathStreamStack.setConsumer(this.display.context);

    this.updateClipBounds();
    this.initFlightPlanHandlers();
    this.updateVNavWaypoint();
  }

  /**
   * Initializes handlers to respond to flight plan events.
   */
  private initFlightPlanHandlers(): void {
    this.subs.push(
      this.props.drawEntirePlan.sub(() => { this.scheduleUpdates(true, true, true); }),

      this.props.dataProvider.plan.sub(() => { this.scheduleUpdates(true, true, true); }, true),
      this.props.dataProvider.planModified.on(() => { this.scheduleUpdates(false, true, true); }),
      this.props.dataProvider.planCalculated.on(() => {
        this.scheduleUpdates(true, true, false);
        this.needUpdateVNavWaypoint = true;
      }),
      this.props.dataProvider.activeLateralLegIndex.sub(() => { this.scheduleUpdates(true, true, true); }),

      this.props.dataProvider.lnavData.sub(() => { this.scheduleUpdates(true, false, false); }),

      this.props.dataProvider.vnavState.sub(() => { this.needUpdateVNavWaypoint = true; }, true),
      this.props.dataProvider.vnavTodLegIndex.sub(() => { this.needUpdateVNavWaypoint = true; }),
      this.props.dataProvider.vnavBodLegIndex.sub(() => { this.needUpdateVNavWaypoint = true; }),
      this.props.dataProvider.vnavTodLegDistance.sub(() => { this.needUpdateVNavWaypoint ||= this.renderedVNavWaypoint?.ident === 'TOD'; }),
      this.props.dataProvider.vnavDistanceToTod.sub(() => { this.needUpdateVNavWaypoint = true; }),
      this.props.dataProvider.vnavTocLegIndex.sub(() => { this.needUpdateVNavWaypoint = true; }),
      this.props.dataProvider.vnavBocLegIndex.sub(() => { this.needUpdateVNavWaypoint = true; }),
      this.props.dataProvider.vnavTocLegDistance.sub(() => { this.needUpdateVNavWaypoint ||= this.renderedVNavWaypoint?.ident === 'TOC'; }),
      this.props.dataProvider.vnavDistanceToToc.sub(() => { this.needUpdateVNavWaypoint = true; }),

      this.props.dataProvider.obsCourse.sub((course: number | undefined) => {
        const isActive = course !== undefined;
        const needFullUpdate = isActive !== this.isObsActive;
        this.isObsActive = isActive;
        this.obsCourse = course ?? this.obsCourse;

        this.scheduleUpdates(needFullUpdate || this.isObsActive, needFullUpdate, needFullUpdate);
      })
    );
  }

  /** @inheritDoc */
  public onMapProjectionChanged(mapProjection: MapProjection, changeFlags: number): void {
    if (BitFlags.isAll(changeFlags, MapProjectionChangeType.ProjectedSize)) {
      this.updateClipBounds();
    }
  }

  /**
   * Updates this sublayer's canvas clipping bounds.
   */
  private updateClipBounds(): void {
    const size = this.display.size;
    this.clipBoundsSub.set(
      -MapSharedFlightPlanSubLayer.CLIP_BOUNDS_BUFFER,
      -MapSharedFlightPlanSubLayer.CLIP_BOUNDS_BUFFER,
      size + MapSharedFlightPlanSubLayer.CLIP_BOUNDS_BUFFER,
      size + MapSharedFlightPlanSubLayer.CLIP_BOUNDS_BUFFER
    );
  }

  /** @inheritDoc */
  public shouldInvalidateDisplay(): boolean {
    return this.needDrawRoute;
  }

  /** @inheritDoc */
  public onUpdated(): void {
    if (this.display.isInvalidated) {
      this.drawRoute();
      this.needDrawRoute = false;
    }

    this.updateRefreshWaypoints();
    this.updateVNavWaypoint();
  }

  /**
   * Draws the flight path route.
   */
  private drawRoute(): void {
    const display = this.display;
    const context = display.context;

    const plan = this.props.dataProvider.plan.get();
    if (plan) {
      this.pathStreamStack.setProjection(display.geoProjection);
      this.props.pathRenderer.render(
        plan,
        context, this.pathStreamStack,
        this.props.drawEntirePlan.get(),
        this.props.dataProvider.activeLateralLegIndex.get(),
        this.props.dataProvider.lnavData.get(),
        this.isObsActive ? this.obsCourse : undefined
      );
    }
  }

  /**
   * Refreshes this sublayer's flight plan leg waypoint records if a refresh is scheduled.
   */
  private updateRefreshWaypoints(): void {
    if (this.needRefreshWaypoints && !this.props.waypointRecordManager.isBusy()) {
      const plan = this.props.dataProvider.plan.get();
      const activeLegIndex = this.props.dataProvider.activeLateralLegIndex.get();
      const startIndex = plan ? this.getPickWaypointsStartIndex(plan, activeLegIndex, this.props.drawEntirePlan.get(), this.isObsActive) : undefined;

      this.props.waypointRecordManager.refreshWaypoints(plan, activeLegIndex, this.needRepickWaypoints, startIndex);
      this.needRefreshWaypoints = false;
      this.needRepickWaypoints = false;
    }
  }

  /**
   * Gets the global index of the first leg in a flight plan for which to display waypoints.
   * @param plan A flight plan.
   * @param activeLegIndex The global index of the active flight plan leg, or -1 if there is no active leg.
   * @param drawEntirePlan Whether to display the entire flight plan.
   * @param isObsActive Whether OBS is active.
   * @returns The global index of the first leg in a flight plan for which to display waypoints.
   */
  private getPickWaypointsStartIndex(plan: FlightPlan, activeLegIndex: number, drawEntirePlan: boolean, isObsActive: boolean): number {
    if (drawEntirePlan) {
      return 0;
    }

    if (activeLegIndex < 0) {
      return plan.length;
    }

    if (isObsActive) {
      return activeLegIndex;
    }

    return Math.max(0, this.getActiveFromLegIndex(plan, activeLegIndex) - 1);
  }

  /**
   * Gets the global leg index of the leg from which the active leg of a flight plan originates.
   * @param plan A flight plan.
   * @param activeLegIndex The global leg index of the active leg.
   * @returns The global leg index of the leg from which the active leg originates, or -1 if one could not be found.
   */
  private getActiveFromLegIndex(plan: FlightPlan, activeLegIndex: number): number {
    const activeLeg = plan.tryGetLeg(activeLegIndex);

    if (!activeLeg) {
      return -1;
    }

    const segmentIndex = plan.getSegmentIndex(activeLegIndex);
    const segmentLegIndex = activeLegIndex - plan.getSegment(segmentIndex).offset;

    return FmsUtils.getNominalFromLegIndex(plan, segmentIndex, segmentLegIndex);
  }

  /**
   * Schedules flight plan drawing updates.
   * @param scheduleRedrawRoute Whether to schedule a redraw of the flight path.
   * @param scheduleRefreshWaypoints Whether to schedule a refresh of waypoints records.
   * @param scheduleRepickWaypoints Whether to schedule a repick of waypoints records.
   */
  private scheduleUpdates(
    scheduleRedrawRoute: boolean,
    scheduleRefreshWaypoints: boolean,
    scheduleRepickWaypoints: boolean
  ): void {
    this.needDrawRoute ||= scheduleRedrawRoute;
    this.needRefreshWaypoints ||= scheduleRefreshWaypoints;
    this.needRepickWaypoints ||= scheduleRepickWaypoints;
  }

  /**
   * Responds to when the VNAV TOD/BOD/TOC/BOC waypoints change.
   */
  private updateVNavWaypoint(): void {
    if (!this.needUpdateVNavWaypoint) {
      return;
    }

    this.needUpdateVNavWaypoint = false;

    const plan = this.props.dataProvider.plan.get();

    // TODO: Support Off-route DTOs
    if (!plan || plan.segmentCount < 1 || plan.getSegment(0).segmentType === FlightPlanSegmentType.RandomDirectTo) {
      this.renderedVNavWaypoint && this.props.waypointRenderer.deregister(this.renderedVNavWaypoint, MapWaypointRenderRole.VNav, 'flightplan-layer');
      this.renderedVNavWaypoint = undefined;
      return;
    }

    const vnavState = this.props.dataProvider.vnavState.get();

    if (vnavState === VNavState.Disabled) {
      this.renderedVNavWaypoint && this.props.waypointRenderer.deregister(this.renderedVNavWaypoint, MapWaypointRenderRole.VNav, 'flightplan-layer');
      this.renderedVNavWaypoint = undefined;
      return;
    }

    const todLegIndex = this.props.dataProvider.vnavTodLegIndex.get();
    const bodLegIndex = this.props.dataProvider.vnavBodLegIndex.get();
    const tocLegIndex = this.props.dataProvider.vnavTocLegIndex.get();
    const bocLegIndex = this.props.dataProvider.vnavBocLegIndex.get();

    const todDistance = this.props.dataProvider.vnavDistanceToTod.get();
    const tocDistance = this.props.dataProvider.vnavDistanceToToc.get();

    let waypointToRender: VNavWaypoint | undefined;

    if (todLegIndex >= 0 && todDistance.number > 0) {
      const todLegEndDistance = this.props.dataProvider.vnavTodLegDistance.get();

      if (isFinite(todLegEndDistance.number) && plan.length > 0) {
        const leg = plan.tryGetLeg(todLegIndex);

        if (leg) {
          if (this.todWaypoint === undefined) {
            this.todWaypoint = new VNavWaypoint(leg, todLegEndDistance.asUnit(UnitType.METER), `flightplan-layer-${this.vnavWaypointUid}-vnav-tod`, 'TOD');
          } else {
            this.todWaypoint.setLocation(leg, todLegEndDistance.asUnit(UnitType.METER));
          }

          waypointToRender = this.todWaypoint;
        }
      } else if (!isFinite(todLegEndDistance.number)) {
        console.warn(`Invalid TOD leg end distance: ${todLegEndDistance}`);
      }
    } else if (bodLegIndex >= 0) {
      const leg = plan.tryGetLeg(bodLegIndex);

      if (leg) {
        if (this.bodWaypoint === undefined) {
          this.bodWaypoint = new VNavWaypoint(leg, 0, `flightplan-layer-${this.vnavWaypointUid}-vnav-bod`, 'BOD');
        } else {
          this.bodWaypoint.setLocation(leg, 0);
        }

        waypointToRender = this.bodWaypoint;
      }
    } else if (tocLegIndex >= 0 && tocDistance.number > 0) {
      const tocLegEndDistance = this.props.dataProvider.vnavTocLegDistance.get();

      if (isFinite(tocLegEndDistance.number) && plan.length > 0) {
        const leg = plan.tryGetLeg(tocLegIndex);

        if (leg) {
          if (this.tocWaypoint === undefined) {
            this.tocWaypoint = new VNavWaypoint(leg, tocLegEndDistance.asUnit(UnitType.METER), `flightplan-layer-${this.vnavWaypointUid}-vnav-toc`, 'TOC');
          } else {
            this.tocWaypoint.setLocation(leg, tocLegEndDistance.asUnit(UnitType.METER));
          }

          waypointToRender = this.tocWaypoint;
        }
      } else if (!isFinite(tocLegEndDistance.number)) {
        console.warn(`Invalid TOC leg end distance: ${tocLegEndDistance}`);
      }
    } else if (bocLegIndex >= 0) {
      const leg = plan.tryGetLeg(bocLegIndex);

      if (leg) {
        if (this.bocWaypoint === undefined) {
          this.bocWaypoint = new VNavWaypoint(leg, leg.calculated?.distanceWithTransitions ?? 0, `flightplan-layer-${this.vnavWaypointUid}-vnav-boc`, 'BOC');
        } else {
          this.bocWaypoint.setLocation(leg, leg.calculated?.distanceWithTransitions ?? 0);
        }

        waypointToRender = this.bocWaypoint;
      }
    }

    if (this.renderedVNavWaypoint !== undefined && waypointToRender !== this.renderedVNavWaypoint) {
      this.props.waypointRenderer.deregister(this.renderedVNavWaypoint, MapWaypointRenderRole.VNav, 'flightplan-layer');
    }

    this.renderedVNavWaypoint = waypointToRender;

    if (waypointToRender !== undefined) {
      this.props.waypointRenderer.register(waypointToRender, MapWaypointRenderRole.VNav, 'flightplan-layer');
    }
  }

  /** @inheritDoc */
  public destroy(): void {
    this.subs.forEach(sub => { sub.destroy(); });

    super.destroy();
  }
}
