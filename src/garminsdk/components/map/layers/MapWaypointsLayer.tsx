import {
  EventBus, Facility, FacilitySearchType, FacilityType, FacilityWaypoint, FSComponent, ICAO, MapLayer, MapLayerProps, MapNearestWaypointsLayer,
  MapNearestWaypointsLayerSearchTypes, MapProjection, MapSyncedCanvasLayer, MapSystemKeys, VNode, Waypoint
} from 'msfssdk';

import { AirportSize, AirportWaypoint } from '../../../navigation/AirportWaypoint';
import { GarminFacilityWaypointCache } from '../../../navigation/GarminFacilityWaypointCache';
import { MapWaypointRenderer, MapWaypointRenderRole } from '../MapWaypointRenderer';
import { MapWaypointsModule } from '../modules/MapWaypointsModule';

/**
 * Modules required by MapWaypointsLayer.
 */
export interface MapWaypointsLayerModules {
  /** Waypoints module. */
  [MapSystemKeys.NearestWaypoints]: MapWaypointsModule;
}

/**
 * Component props for MapWaypointsLayer.
 */
export interface MapWaypointsLayerProps extends MapLayerProps<MapWaypointsLayerModules> {
  /** The event bus. */
  bus: EventBus;

  /** The waypoint renderer to use. */
  waypointRenderer: MapWaypointRenderer;
}

/**
 * A map layer which displays waypoints.
 */
export class MapWaypointsLayer extends MapLayer<MapWaypointsLayerProps> {
  private static readonly SEARCH_ITEM_LIMITS = {
    [FacilitySearchType.Airport]: 500,
    [FacilitySearchType.Vor]: 250,
    [FacilitySearchType.Ndb]: 250,
    [FacilitySearchType.Intersection]: 500,
    [FacilitySearchType.User]: 100
  };

  private readonly waypointsLayerRef = FSComponent.createRef<MapNearestWaypointsLayer>();

  private readonly waypointsModule = this.props.model.getModule(MapSystemKeys.NearestWaypoints);

  private readonly waypointCache = GarminFacilityWaypointCache.getCache(this.props.bus);

  private isAirportVisible = {
    [AirportSize.Large]: false,
    [AirportSize.Medium]: false,
    [AirportSize.Small]: false
  };
  private isVorVisible = false;
  private isNdbVisible = false;
  private isIntersectionVisible = false;
  private isUserVisible = false;

  /** @inheritdoc */
  public onAttached(): void {
    super.onAttached();

    this.waypointsLayerRef.instance.onAttached();
    this.initVisibilityFlags();
  }

  /** @inheritdoc */
  public onMapProjectionChanged(mapProjection: MapProjection, changeFlags: number): void {
    this.waypointsLayerRef.instance.onMapProjectionChanged(mapProjection, changeFlags);
  }

  /** @inheritdoc */
  public onUpdated(time: number, elapsed: number): void {
    this.waypointsLayerRef.instance.onUpdated(time, elapsed);
  }

  /**
   * Initializes waypoint visibility flags and listeners.
   */
  private initVisibilityFlags(): void {
    this.waypointsModule.airportShow[AirportSize.Large].sub(this.updateAirportVisibility.bind(this, AirportSize.Large), true);
    this.waypointsModule.airportShow[AirportSize.Medium].sub(this.updateAirportVisibility.bind(this, AirportSize.Medium), true);
    this.waypointsModule.airportShow[AirportSize.Small].sub(this.updateAirportVisibility.bind(this, AirportSize.Small), true);

    this.waypointsModule.vorShow.sub(this.updateVorVisibility.bind(this), true);

    this.waypointsModule.ndbShow.sub(this.updateNdbVisibility.bind(this), true);

    this.waypointsModule.intShow.sub(this.updateIntersectionVisibility.bind(this), true);

    this.waypointsModule.userShow.sub(this.updateUserVisibility.bind(this), true);
  }

  /**
   * Updates airport waypoint visibility.
   * @param size The airport size class to update.
   */
  private updateAirportVisibility(size: AirportSize): void {
    const wasAnyAirportVisible = this.isAirportVisible[AirportSize.Large]
      || this.isAirportVisible[AirportSize.Medium]
      || this.isAirportVisible[AirportSize.Small];

    this.isAirportVisible[size] = this.waypointsModule.airportShow[size].get();

    if (!wasAnyAirportVisible && this.isAirportVisible[size]) {
      this.waypointsLayerRef.instance.tryRefreshSearch(FacilitySearchType.Airport, this.props.mapProjection.getCenter());
    }
  }

  /**
   * Updates VOR waypoint visibility.
   */
  private updateVorVisibility(): void {
    this.isVorVisible = this.waypointsModule.vorShow.get();

    if (this.isVorVisible) {
      this.waypointsLayerRef.instance.tryRefreshSearch(FacilitySearchType.Vor, this.props.mapProjection.getCenter());
    }
  }

  /**
   * Updates NDB waypoint visibility.
   */
  private updateNdbVisibility(): void {
    this.isNdbVisible = this.waypointsModule.ndbShow.get();

    if (this.isNdbVisible) {
      this.waypointsLayerRef.instance.tryRefreshSearch(FacilitySearchType.Ndb, this.props.mapProjection.getCenter());
    }
  }

  /**
   * Updates intersection waypoint visibility.
   */
  private updateIntersectionVisibility(): void {
    this.isIntersectionVisible = this.waypointsModule.intShow.get();

    if (this.isIntersectionVisible) {
      this.waypointsLayerRef.instance.tryRefreshSearch(FacilitySearchType.Intersection, this.props.mapProjection.getCenter());
    }
  }

  /**
   * Updates user waypoint visibility.
   */
  private updateUserVisibility(): void {
    this.isUserVisible = this.waypointsModule.userShow.get();

    if (this.isUserVisible) {
      this.waypointsLayerRef.instance.tryRefreshSearch(FacilitySearchType.User, this.props.mapProjection.getCenter());
    }
  }

  /** @inheritdoc */
  protected initWaypointRenderer(renderer: MapWaypointRenderer, canvasLayer: MapSyncedCanvasLayer): void {
    renderer.setCanvasContext(MapWaypointRenderRole.Normal, canvasLayer.display.context);
    renderer.setVisibilityHandler(MapWaypointRenderRole.Normal, this.isWaypointVisible.bind(this));
  }

  /**
   * Checks whether a waypoint is visible.
   * @param waypoint A waypoint.
   * @returns whether the waypoint is visible.
   */
  private isWaypointVisible(waypoint: Waypoint): boolean {
    if (waypoint instanceof FacilityWaypoint) {
      switch (ICAO.getFacilityType(waypoint.facility.get().icao)) {
        case FacilityType.Airport:
          return this.isAirportVisible[(waypoint as AirportWaypoint<any>).size];
        case FacilityType.VOR:
          return this.isVorVisible;
        case FacilityType.NDB:
          return this.isNdbVisible;
        case FacilityType.Intersection:
          return this.isIntersectionVisible;
        case FacilityType.USR:
          return this.isUserVisible;
      }
    }
    return false;
  }

  /** @inheritdoc */
  protected shouldRefreshSearch(type: MapNearestWaypointsLayerSearchTypes): boolean {
    switch (type) {
      case FacilitySearchType.Airport:
        return this.isAirportVisible[AirportSize.Large] || this.isAirportVisible[AirportSize.Medium] || this.isAirportVisible[AirportSize.Small];
      case FacilitySearchType.Vor:
        return this.isVorVisible;
      case FacilitySearchType.Ndb:
        return this.isNdbVisible;
      case FacilitySearchType.Intersection:
        return this.isIntersectionVisible;
      case FacilitySearchType.User:
        return this.isUserVisible;
    }
  }

  /** @inheritdoc */
  protected registerWaypointWithRenderer(renderer: MapWaypointRenderer, facility: Facility): void {
    const waypoint = this.waypointCache.get(facility);
    renderer.register(waypoint, MapWaypointRenderRole.Normal, 'waypoints-layer');
  }

  /** @inheritdoc */
  protected deregisterWaypointWithRenderer(renderer: MapWaypointRenderer, facility: Facility): void {
    const waypoint = this.waypointCache.get(facility);
    renderer.deregister(waypoint, MapWaypointRenderRole.Normal, 'waypoints-layer');
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <MapNearestWaypointsLayer<MapWaypointRenderer>
        ref={this.waypointsLayerRef}
        model={this.props.model}
        mapProjection={this.props.mapProjection}
        bus={this.props.bus}
        waypointRenderer={this.props.waypointRenderer}
        waypointForFacility={(facility): Waypoint => this.waypointCache.get(facility)}
        initRenderer={this.initWaypointRenderer.bind(this)}
        registerWaypoint={(waypoint, renderer): void => { renderer.register(waypoint, MapWaypointRenderRole.Normal, 'waypoints-layer'); }}
        deregisterWaypoint={(waypoint, renderer): void => { renderer.deregister(waypoint, MapWaypointRenderRole.Normal, 'waypoints-layer'); }}
        searchItemLimit={(type): number => MapWaypointsLayer.SEARCH_ITEM_LIMITS[type]}
        shouldRefreshSearch={this.shouldRefreshSearch.bind(this)}
      />
    );
  }
}