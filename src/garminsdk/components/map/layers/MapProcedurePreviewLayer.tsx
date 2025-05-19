import {
  ClippedPathStream, EventBus, FacilityLoader, FacilityRepository, FSComponent, GeoCircleResampler, GeoProjectionPathStreamStack, MapCachedCanvasLayer,
  MapLayer, MapLayerProps, MapProjection, MapSyncedCanvasLayer, NullPathStream, VecNSubject, VNode
} from '@microsoft/msfs-sdk';

import { ProcedureType } from '../../../flightplan/FmsTypes';
import { GarminFacilityWaypointCache } from '../../../navigation/GarminFacilityWaypointCache';
import { MapDefaultFlightPlanWaypointRecordManager } from '../flightplan/MapDefaultFlightPlanWaypointRecordManager';
import { MapFlightPathProcRenderer } from '../flightplan/MapFlightPathProcRenderer';
import { ProcMapTransitionWaypointRecordManager } from '../flightplan/ProcMapTransitionWaypointRecordManager';
import { GarminMapKeys } from '../GarminMapKeys';
import { MapWaypointRenderer, MapWaypointRenderRole } from '../MapWaypointRenderer';
import { MapProcedurePreviewModule } from '../modules/MapProcedurePreviewModule';

/**
 * Modules required by MapProcedurePreviewLayer.
 */
export interface MapProcedurePreviewLayerModules {
  /** Procedure preview module. */
  [GarminMapKeys.ProcedurePreview]: MapProcedurePreviewModule;
}

/**
 * Component props for MapProcedurePreviewLayer.
 */
export interface MapProcedurePreviewLayerProps extends MapLayerProps<MapProcedurePreviewLayerModules> {
  /** The event bus. */
  bus: EventBus;

  /** The facility loader to use. If not defined, then a default instance will be created. */
  facilityLoader?: FacilityLoader;

  /** The waypoint renderer to use. */
  waypointRenderer: MapWaypointRenderer;

  /** The flight path renderer to use. */
  pathRenderer: MapFlightPathProcRenderer;
}

/**
 * A map layer which displays a procedure preview.
 */
export class MapProcedurePreviewLayer extends MapLayer<MapProcedurePreviewLayerProps> {
  private static readonly CLIP_BOUNDS_BUFFER = 10; // number of pixels from edge of canvas to extend the clipping bounds, in pixels

  private readonly flightPathLayerRef = FSComponent.createRef<MapCachedCanvasLayer>();
  private readonly waypointLayerRef = FSComponent.createRef<MapSyncedCanvasLayer>();

  private readonly procPreviewModule = this.props.model.getModule(GarminMapKeys.ProcedurePreview);

  private readonly resampler = new GeoCircleResampler(Math.PI / 12, 0.25, 8);
  private readonly facLoader = this.props.facilityLoader ?? new FacilityLoader(FacilityRepository.getRepository(this.props.bus));
  private readonly waypointCache = GarminFacilityWaypointCache.getCache(this.props.bus);

  private readonly clipBoundsSub = VecNSubject.createFromVector(new Float64Array(4));
  private readonly clippedPathStream = new ClippedPathStream(NullPathStream.INSTANCE, this.clipBoundsSub);

  private readonly pathStreamStack = new GeoProjectionPathStreamStack(NullPathStream.INSTANCE, this.props.mapProjection.getGeoProjection(), this.resampler);

  private readonly procedureWaypointRecordManager = new MapDefaultFlightPlanWaypointRecordManager(
    this.facLoader, this.waypointCache, this.props.waypointRenderer,
    MapWaypointRenderRole.ProcedurePreview, MapWaypointRenderRole.ProcedurePreview
  );
  private readonly transitionWaypointRecordManager = new ProcMapTransitionWaypointRecordManager(
    this.facLoader, this.waypointCache, this.props.waypointRenderer,
    MapWaypointRenderRole.ProcedureTransitionPreview
  );

  private needDrawRoute = false;
  private needRefreshProcedureWaypoints = false;
  private needRepickProcedureWaypoints = false;
  private needRefreshTransitionWaypoints = false;
  private needRepickTransitionWaypoints = false;

  /** @inheritdoc */
  public onAttached(): void {
    super.onAttached();

    this.flightPathLayerRef.instance.onAttached();
    this.waypointLayerRef.instance.onAttached();

    this.pathStreamStack.pushPostProjected(this.clippedPathStream);
    this.pathStreamStack.setConsumer(this.flightPathLayerRef.instance.display.context);

    this.initWaypointRenderer();
    this.initFlightPlanHandlers();
  }

  /**
   * Initializes the waypoint renderer.
   */
  private initWaypointRenderer(): void {
    this.props.waypointRenderer.setCanvasContext(MapWaypointRenderRole.ProcedureTransitionPreview, this.waypointLayerRef.instance.display.context);
    this.props.waypointRenderer.setCanvasContext(MapWaypointRenderRole.ProcedurePreview, this.waypointLayerRef.instance.display.context);
  }

  /**
   * Initializes handlers to respond to flight plan events.
   */
  private initFlightPlanHandlers(): void {
    this.procPreviewModule.procedurePlan.sub(() => { this.scheduleUpdates(true, true, true, false, false); }, true);
    this.procPreviewModule.transitionPlan.sub(() => { this.scheduleUpdates(true, false, false, true, true); }, true);
  }

  /** @inheritdoc */
  public onMapProjectionChanged(mapProjection: MapProjection, changeFlags: number): void {
    this.flightPathLayerRef.instance.onMapProjectionChanged(mapProjection, changeFlags);
    this.waypointLayerRef.instance.onMapProjectionChanged(mapProjection, changeFlags);

    this.updateClipBounds();
  }

  /**
   * Updates this layer's canvas clipping bounds.
   */
  private updateClipBounds(): void {
    const size = this.flightPathLayerRef.instance.getSize();
    this.clipBoundsSub.set(
      -MapProcedurePreviewLayer.CLIP_BOUNDS_BUFFER,
      -MapProcedurePreviewLayer.CLIP_BOUNDS_BUFFER,
      size + MapProcedurePreviewLayer.CLIP_BOUNDS_BUFFER,
      size + MapProcedurePreviewLayer.CLIP_BOUNDS_BUFFER
    );
  }

  /** @inheritdoc */
  public onUpdated(time: number, elapsed: number): void {
    this.flightPathLayerRef.instance.onUpdated(time, elapsed);

    this.updateFromFlightPathLayerInvalidation();
    this.updateRedrawRoute();
    this.updateRefreshWaypoints();
  }

  /**
   * Checks if the flight path layer's display canvas has been invalidated, and if so, clears it and schedules a redraw.
   */
  private updateFromFlightPathLayerInvalidation(): void {
    const display = this.flightPathLayerRef.instance.display;

    this.needDrawRoute ||= display.isInvalid;

    if (display.isInvalid) {
      display.clear();
      display.syncWithMapProjection(this.props.mapProjection);
    }
  }

  /**
   * Redraws the flight path if a redraw is scheduled.
   */
  private updateRedrawRoute(): void {
    if (this.needDrawRoute) {
      this.drawRoute();
      this.needDrawRoute = false;
    }
  }

  /**
   * Draws the flight path route.
   */
  private drawRoute(): void {
    const display = this.flightPathLayerRef.instance.display;
    const context = display.context;
    display.clear();

    const procedurePlan = this.procPreviewModule.procedurePlan.get();
    const transitionPlan = this.procPreviewModule.transitionPlan.get();

    this.pathStreamStack.setProjection(display.geoProjection);
    if (transitionPlan) {
      this.props.pathRenderer.render(transitionPlan, context, this.pathStreamStack, true);
    }
    if (procedurePlan) {
      this.props.pathRenderer.render(procedurePlan, context, this.pathStreamStack, false);
    }
  }

  /**
   * Refreshes this layer's flight plan leg waypoint records if a refresh is scheduled.
   */
  private updateRefreshWaypoints(): void {
    if (this.needRefreshProcedureWaypoints && !this.procedureWaypointRecordManager.isBusy()) {
      const plan = this.procPreviewModule.procedurePlan.get();
      this.procedureWaypointRecordManager.refreshWaypoints(plan, -1, this.needRepickProcedureWaypoints);
      this.needRefreshProcedureWaypoints = false;
      this.needRepickProcedureWaypoints = false;
    }

    if (this.needRefreshTransitionWaypoints && !this.transitionWaypointRecordManager.isBusy()) {
      const plan = this.procPreviewModule.transitionPlan.get();
      const pickPosition = this.procPreviewModule.procedureType.get() === ProcedureType.DEPARTURE ? 'last' : 'first';
      this.transitionWaypointRecordManager.refreshWaypoints(plan, this.needRepickTransitionWaypoints, pickPosition);
      this.needRefreshTransitionWaypoints = false;
      this.needRepickTransitionWaypoints = false;
    }
  }

  /**
   * Schedules flight plan drawing updates.
   * @param scheduleRedrawRoute Whether to schedule a redraw of the flight path.
   * @param scheduleRefreshProcedureWaypoints Whether to schedule a refresh of procedure waypoint records.
   * @param scheduleRepickProcedureWaypoints Whether to schedule a repick of procedure waypoint records.
   * @param scheduleRefreshTransitionWaypoints Whether to schedule a refresh of transition waypoint records.
   * @param scheduleRepickTransitionWaypoints Whether to schedule a repick of transition waypoint records.
   */
  private scheduleUpdates(
    scheduleRedrawRoute: boolean,
    scheduleRefreshProcedureWaypoints: boolean,
    scheduleRepickProcedureWaypoints: boolean,
    scheduleRefreshTransitionWaypoints: boolean,
    scheduleRepickTransitionWaypoints: boolean
  ): void {
    this.needDrawRoute ||= scheduleRedrawRoute;
    this.needRefreshProcedureWaypoints ||= scheduleRefreshProcedureWaypoints;
    this.needRepickProcedureWaypoints ||= scheduleRepickProcedureWaypoints;
    this.needRefreshTransitionWaypoints ||= scheduleRefreshTransitionWaypoints;
    this.needRepickTransitionWaypoints ||= scheduleRepickTransitionWaypoints;
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <>
        <MapCachedCanvasLayer
          ref={this.flightPathLayerRef}
          model={this.props.model}
          mapProjection={this.props.mapProjection}
          overdrawFactor={Math.SQRT2}
        />
        <MapSyncedCanvasLayer ref={this.waypointLayerRef} model={this.props.model} mapProjection={this.props.mapProjection} />
      </>
    );
  }
}