import {
  AirportFacility, BitFlags, EventBus, FacilitySearchType, FacilityType, FacilityWaypointUtils, FSComponent, ICAO,
  IntersectionType, MapLayer, MapLayerProps, MapNearestWaypointsLayer, MapNearestWaypointsLayerSearchTypes,
  MapProjection, MapSyncedCanvasLayer, MapSystemKeys, NearestAirportSearchSession, NearestIntersectionSearchSession,
  NearestSearchSession, NearestVorSearchSession, RunwayUtils, UnitType, VNode, Waypoint
} from '@microsoft/msfs-sdk';

import { AirportSize, AirportWaypoint } from '../../../navigation/AirportWaypoint';
import { GarminFacilityWaypointCache } from '../../../navigation/GarminFacilityWaypointCache';
import { MapRunwayLabelWaypoint } from '../MapRunwayLabelWaypoint';
import { MapRunwayLabelWaypointCache } from '../MapRunwayLabelWaypointCache';
import { MapRunwayOutlineWaypoint } from '../MapRunwayOutlineWaypoint';
import { MapRunwayOutlineWaypointCache } from '../MapRunwayOutlineWaypointCache';
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

  /** Whether to support the rendering of runway outlines. */
  supportRunwayOutlines: boolean;
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
  private readonly runwayOutlineWaypointCache = MapRunwayOutlineWaypointCache.getCache();
  private readonly runwayLabelWaypointCache = MapRunwayLabelWaypointCache.getCache();

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
    const updateLargeAirportVisibility = this.updateAirportVisibility.bind(this, AirportSize.Large);
    const updateMediumAirportVisibility = this.updateAirportVisibility.bind(this, AirportSize.Medium);
    const updateSmallAirportVisibility = this.updateAirportVisibility.bind(this, AirportSize.Small);

    this.waypointsModule.airportShow[AirportSize.Large].sub(updateLargeAirportVisibility, true);
    this.waypointsModule.airportShow[AirportSize.Medium].sub(updateMediumAirportVisibility, true);
    this.waypointsModule.airportShow[AirportSize.Small].sub(updateSmallAirportVisibility, true);
    this.waypointsModule.runwayShow.sub(() => {
      updateLargeAirportVisibility();
      updateMediumAirportVisibility();
      updateSmallAirportVisibility();
    });

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

    this.isAirportVisible[size] = this.waypointsModule.airportShow[size].get() || (this.props.supportRunwayOutlines && this.waypointsModule.runwayShow.get());

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
  private initWaypointRenderer(renderer: MapWaypointRenderer, canvasLayer: MapSyncedCanvasLayer): void {
    renderer.setCanvasContext(MapWaypointRenderRole.Normal, canvasLayer.display.context);
    renderer.setVisibilityHandler(MapWaypointRenderRole.Normal, this.isWaypointVisible.bind(this));
  }

  /**
   * Responds to when this layer's facility search sessions have been started.
   * @param airportSession The airport search session.
   * @param vorSession The VOR search session.
   * @param ndbSession The NDB search session.
   * @param intSession The intersection search session.
   */
  private onSessionsStarted(
    airportSession: NearestAirportSearchSession,
    vorSession: NearestVorSearchSession,
    ndbSession: NearestSearchSession<string, string>,
    intSession: NearestIntersectionSearchSession
  ): void {
    intSession.setIntersectionFilter(BitFlags.union(
      BitFlags.createFlag(IntersectionType.None),
      BitFlags.createFlag(IntersectionType.Named),
      BitFlags.createFlag(IntersectionType.Unnamed),
      BitFlags.createFlag(IntersectionType.Offroute),
      BitFlags.createFlag(IntersectionType.IAF),
      BitFlags.createFlag(IntersectionType.FAF),
      BitFlags.createFlag(IntersectionType.RNAV)
    ), true);
  }

  /**
   * Checks whether a waypoint is visible.
   * @param waypoint A waypoint.
   * @returns whether the waypoint is visible.
   */
  private isWaypointVisible(waypoint: Waypoint): boolean {
    if (FacilityWaypointUtils.isFacilityWaypoint(waypoint)) {
      switch (ICAO.getFacilityType(waypoint.facility.get().icao)) {
        case FacilityType.Airport:
          return this.waypointsModule.airportShow[(waypoint as AirportWaypoint).size].get();
        case FacilityType.VOR:
          return this.isVorVisible;
        case FacilityType.NDB:
          return this.isNdbVisible;
        case FacilityType.Intersection:
          return this.isIntersectionVisible;
        case FacilityType.USR:
          return this.isUserVisible;
      }
    } else if (waypoint instanceof MapRunwayLabelWaypoint) {
      return this.waypointsModule.runwayShow.get()
        && UnitType.METER.convertTo(waypoint.runway.length, UnitType.GA_RADIAN) / this.props.mapProjection.getProjectedResolution()
        >= this.waypointsModule.runwayLabelMinLength.get();
    } else if (waypoint instanceof MapRunwayOutlineWaypoint) {
      return this.waypointsModule.runwayShow.get();
    }

    return false;
  }

  /** @inheritdoc */
  private shouldRefreshSearch(type: MapNearestWaypointsLayerSearchTypes): boolean {
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

  /**
   * Registers a waypoint with a renderer.
   * @param waypoint The waypoint to register.
   * @param renderer A waypoint renderer.
   */
  private registerWaypoint(waypoint: Waypoint, renderer: MapWaypointRenderer): void {
    renderer.register(waypoint, MapWaypointRenderRole.Normal, 'waypoints-layer');

    if (this.props.supportRunwayOutlines && waypoint instanceof AirportWaypoint) {
      const runwayOutlineWaypoints = this.getRunwayWaypoints(waypoint.facility.get());
      for (let i = 0; i < runwayOutlineWaypoints.length; i++) {
        renderer.register(runwayOutlineWaypoints[i], MapWaypointRenderRole.Normal, 'waypoints-layer');
      }
    }
  }

  /**
   * Deregisters a waypoint with a renderer.
   * @param waypoint The waypoint to deregister.
   * @param renderer A waypoint renderer.
   */
  private deregisterWaypoint(waypoint: Waypoint, renderer: MapWaypointRenderer): void {
    renderer.deregister(waypoint, MapWaypointRenderRole.Normal, 'waypoints-layer');

    if (this.props.supportRunwayOutlines && waypoint instanceof AirportWaypoint) {
      const runwayOutlineWaypoints = this.getRunwayWaypoints(waypoint.facility.get());
      for (let i = 0; i < runwayOutlineWaypoints.length; i++) {
        renderer.deregister(runwayOutlineWaypoints[i], MapWaypointRenderRole.Normal, 'waypoints-layer');
      }
    }
  }

  /**
   * Gets an array of runway outline and label waypoints from an airport.
   * @param airport An airport.
   * @returns An array of runway outline and label waypoints for the specified airport.
   */
  private getRunwayWaypoints(airport: AirportFacility): (MapRunwayOutlineWaypoint | MapRunwayLabelWaypoint)[] {
    const waypoints: (MapRunwayOutlineWaypoint | MapRunwayLabelWaypoint)[] = [];

    const runways = airport.runways;
    for (let i = 0; i < runways.length; i++) {
      const runway = runways[i];

      waypoints.push(this.runwayOutlineWaypointCache.get(airport, runway));

      const oneWayRunways = RunwayUtils.getOneWayRunways(runway, i);

      const primary = oneWayRunways[0];
      const secondary = oneWayRunways[1];

      if (primary) {
        waypoints.push(this.runwayLabelWaypointCache.get(airport, primary));
      }

      if (secondary) {
        waypoints.push(this.runwayLabelWaypointCache.get(airport, secondary));
      }
    }

    return waypoints;
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
        onSessionsStarted={this.onSessionsStarted.bind(this)}
        registerWaypoint={this.registerWaypoint.bind(this)}
        deregisterWaypoint={this.deregisterWaypoint.bind(this)}
        searchItemLimit={(type): number => MapWaypointsLayer.SEARCH_ITEM_LIMITS[type]}
        shouldRefreshSearch={this.shouldRefreshSearch.bind(this)}
      />
    );
  }
}