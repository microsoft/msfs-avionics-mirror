import { EventBus } from '../../../data/EventBus';
import { LatLonInterface } from '../../../geo/GeoInterfaces';
import { UnitType } from '../../../math';
import { DefaultFacilityWaypointCache } from '../../../navigation/DefaultFacilityWaypointCache';
import {
  AirportFacility, FacilitySearchType, FacilityType, IntersectionFacility, NdbFacility, VorFacility
} from '../../../navigation/Facilities';
import { NearestIcaoSearchSession, NearestIcaoSearchSessionDataType } from '../../../navigation/FacilityClient';
import {
  FacilityLoader, NearestAirportSearchSession, NearestIntersectionSearchSession, NearestRepoFacilitySearchSession,
  NearestVorSearchSession
} from '../../../navigation/FacilityLoader';
import { FacilityWaypointCache } from '../../../navigation/FacilityWaypointCache';
import { FacilityWaypoint, FacilityWaypointUtils, Waypoint, WaypointTypes } from '../../../navigation/Waypoint';
import { FSComponent, VNode } from '../../FSComponent';
import { MapLayer, MapLayerProps, MapNearestWaypointsLayer, MapProjection, MapSyncedCanvasLayer } from '../../map';
import { MapSystemKeys } from '../MapSystemKeys';
import { MapSystemWaypointRoles } from '../MapSystemWaypointRoles';
import { MapSystemIconFactory, MapSystemLabelFactory, MapSystemWaypointsRenderer } from '../MapSystemWaypointsRenderer';
import { MapWaypointDisplayModule } from '../modules/MapWaypointDisplayModule';

/**
 * Modules required by MapSystemWaypointsLayer.
 */
export interface MapSystemWaypointsLayerModules {
  /** Waypoints display module. */
  [MapSystemKeys.NearestWaypoints]: MapWaypointDisplayModule;
}

/**
 * Props on the MapSystemWaypointsLayer component.
 */
export interface MapSystemWaypointsLayerProps extends MapLayerProps<MapSystemWaypointsLayerModules> {
  /** The event bus. */
  bus: EventBus;

  /** The facility loader to use. If not defined, then a default instance will be created. */
  facilityLoader?: FacilityLoader;

  /** The waypoint renderer to use. */
  waypointRenderer: MapSystemWaypointsRenderer;

  /** The icon factory to use with this component. */
  iconFactory: MapSystemIconFactory;

  /** The label factory to use with this component. */
  labelFactory: MapSystemLabelFactory;

  /**
   * Whether to use the map's projection target as the center for facility searches instead of the map's center.
   * Defaults to `false`.
   */
  useMapTargetAsSearchCenter?: boolean;

  /** An optional waypoint cache to use with this layer. Will default to DefaultFacilityWaypointCache if not supplied. */
  waypointCache?: FacilityWaypointCache;
}

/**
 * A class that renders waypoints into a layer.
 */
export class MapSystemWaypointsLayer extends MapLayer<MapSystemWaypointsLayerProps> {

  private readonly waypointsLayer = FSComponent.createRef<MapNearestWaypointsLayer>();

  private readonly displayModule = this.props.model.getModule(MapSystemKeys.NearestWaypoints);

  private readonly waypointCache = this.props.waypointCache ?? DefaultFacilityWaypointCache.getCache(this.props.bus);

  private readonly searchItemLimits = {
    [FacilitySearchType.Airport]: 500,
    [FacilitySearchType.Vor]: 250,
    [FacilitySearchType.Ndb]: 250,
    [FacilitySearchType.Intersection]: 500,
    [FacilitySearchType.User]: 100
  };

  private readonly searchRadiusLimits = {
    [FacilitySearchType.Airport]: Number.POSITIVE_INFINITY,
    [FacilitySearchType.Vor]: Number.POSITIVE_INFINITY,
    [FacilitySearchType.Ndb]: Number.POSITIVE_INFINITY,
    [FacilitySearchType.Intersection]: Number.POSITIVE_INFINITY,
    [FacilitySearchType.User]: Number.POSITIVE_INFINITY
  };

  /** @inheritdoc */
  public onAttached(): void {
    super.onAttached();

    this.waypointsLayer.instance.onAttached();
    this.initEventHandlers();
  }

  /** @inheritdoc */
  public onMapProjectionChanged(mapProjection: MapProjection, changeFlags: number): void {
    super.onMapProjectionChanged(mapProjection, changeFlags);

    this.waypointsLayer.instance.onMapProjectionChanged(mapProjection, changeFlags);
  }

  /** @inheritdoc */
  public onUpdated(time: number, elapsed: number): void {
    if (this.isVisible()) {
      this.waypointsLayer.instance.onUpdated(time, elapsed);
    }
  }

  /** @inheritdoc */
  private initEventHandlers(): void {
    this.displayModule.numAirports.sub(num => this.searchItemLimits[FacilitySearchType.Airport] = num, true);
    this.displayModule.numIntersections.sub(num => this.searchItemLimits[FacilitySearchType.Intersection] = num, true);
    this.displayModule.numVors.sub(num => this.searchItemLimits[FacilitySearchType.Vor] = num, true);
    this.displayModule.numNdbs.sub(num => this.searchItemLimits[FacilitySearchType.Ndb] = num, true);

    this.displayModule.airportsRange.sub(num => this.searchRadiusLimits[FacilitySearchType.Airport] = num.asUnit(UnitType.GA_RADIAN), true);
    this.displayModule.intersectionsRange.sub(num => this.searchRadiusLimits[FacilitySearchType.Intersection] = num.asUnit(UnitType.GA_RADIAN), true);
    this.displayModule.vorsRange.sub(num => this.searchRadiusLimits[FacilitySearchType.Vor] = num.asUnit(UnitType.GA_RADIAN), true);
    this.displayModule.ndbsRange.sub(num => this.searchRadiusLimits[FacilitySearchType.Ndb] = num.asUnit(UnitType.GA_RADIAN), true);

    this.displayModule.refreshWaypoints.on(() => this.waypointsLayer.instance.refreshWaypoints());
  }

  /**
   * A callback called when the nearest facility search sessions have been started.
   * @param airportSession The airport search session.
   * @param vorSession The VOR search session.
   * @param ndbSession The NDB search session.
   * @param intSession The intersection search session.
   * @param usrSession The user facility search session.
   */
  private onSessionsStarted(
    airportSession: NearestAirportSearchSession<NearestIcaoSearchSessionDataType.Struct>,
    vorSession: NearestVorSearchSession<NearestIcaoSearchSessionDataType.Struct>,
    ndbSession: NearestIcaoSearchSession<NearestIcaoSearchSessionDataType.Struct>,
    intSession: NearestIntersectionSearchSession<NearestIcaoSearchSessionDataType.Struct>,
    usrSession: NearestRepoFacilitySearchSession<FacilityType.USR, NearestIcaoSearchSessionDataType.Struct>
  ): void {
    this.displayModule.intersectionsFilter.sub(filters => intSession.setIntersectionFilter(filters.typeMask, filters.showTerminalWaypoints), true);
    this.displayModule.vorsFilter.sub(filters => vorSession.setVorFilter(filters.classMask, filters.typeMask), true);
    this.displayModule.airportsFilter.sub(filters => {
      airportSession.setAirportFilter(filters.showClosed, filters.classMask);
    }, true);
    this.displayModule.extendedAirportsFilter.sub(filters => {
      airportSession.setExtendedAirportFilters(filters.runwaySurfaceTypeMask, filters.approachTypeMask, filters.toweredMask, filters.minimumRunwayLength);
    }, true);
    this.displayModule.usersFilter.sub(filter => {
      usrSession.setFacilityFilter(filter);
    });
  }

  /**
   * Initializes this layer's waypoint renderer.
   * @param renderer This layer's waypoint renderer.
   * @param canvasLayer The canvas layer to which to draw the waypoints.
   */
  private initWaypointRenderer(renderer: MapSystemWaypointsRenderer, canvasLayer: MapSyncedCanvasLayer): void {
    this.defineRenderRole(renderer, canvasLayer);

    renderer.onRolesAdded.on(this.defineRenderRole.bind(this, renderer, canvasLayer));
  }

  /**
   * Defines the render role for this layer's waypoints.
   * @param renderer This layer's waypoint renderer.
   * @param canvasLayer The canvas layer to which to draw the waypoints.
   */
  private defineRenderRole(renderer: MapSystemWaypointsRenderer, canvasLayer: MapSyncedCanvasLayer): void {
    const groupRoles = renderer.getRoleNamesByGroup(MapSystemWaypointRoles.Normal);
    groupRoles.forEach(id => {
      const roleId = renderer.getRoleFromName(id);
      if (roleId !== undefined) {
        renderer.setCanvasContext(roleId, canvasLayer.display.context);
        renderer.setIconFactory(roleId, this.props.iconFactory);
        renderer.setLabelFactory(roleId, this.props.labelFactory);
        renderer.setVisibilityHandler(roleId, this.isWaypointVisible.bind(this));
      }
    });
  }

  /** @inheritdoc */
  public setVisible(val: boolean): void {
    super.setVisible(val);
    this.waypointsLayer.instance.setVisible(val);
  }

  /**
   * Checks to see if a waypoint should be visible.
   * @param waypoint The waypoint to check.
   * @returns True if visible, false otherwise.
   */
  private isWaypointVisible(waypoint: Waypoint): boolean {
    if (FacilityWaypointUtils.isFacilityWaypoint(waypoint)) {
      switch (waypoint.type) {
        case WaypointTypes.Airport:
          return this.displayModule.showAirports.get()(waypoint as FacilityWaypoint<AirportFacility>);
        case WaypointTypes.Intersection:
          return this.displayModule.showIntersections.get()(waypoint as FacilityWaypoint<IntersectionFacility>);
        case WaypointTypes.VOR:
          return this.displayModule.showVors.get()(waypoint as FacilityWaypoint<VorFacility>);
        case WaypointTypes.NDB:
          return this.displayModule.showNdbs.get()(waypoint as FacilityWaypoint<NdbFacility>);
      }
    }

    return false;
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <MapNearestWaypointsLayer<MapSystemWaypointsRenderer>
        ref={this.waypointsLayer}
        model={this.props.model}
        mapProjection={this.props.mapProjection}
        bus={this.props.bus}
        facilityLoader={this.props.facilityLoader}
        waypointRenderer={this.props.waypointRenderer}
        waypointForFacility={(facility): Waypoint => this.waypointCache.get(facility)}
        initRenderer={this.initWaypointRenderer.bind(this)}
        registerWaypoint={this.registerWaypoint.bind(this)}
        deregisterWaypoint={this.deregisterWaypoint.bind(this)}
        searchItemLimit={(type): number => this.searchItemLimits[type]}
        searchRadiusLimit={(type): number => this.searchRadiusLimits[type]}
        getSearchCenter={this.props.useMapTargetAsSearchCenter === true ? (mapProjection): LatLonInterface => mapProjection.getTarget() : undefined}
        onSessionsStarted={this.onSessionsStarted.bind(this)}
        class={this.props.class ?? ''}
      />
    );
  }

  /**
   * Registers a waypoint with this layer's waypoint renderer.
   * @param waypoint The waypoint to register.
   * @param renderer The renderer to register the waypoint to.
   */
  private registerWaypoint(waypoint: Waypoint, renderer: MapSystemWaypointsRenderer): void {
    const selector = this.displayModule.waypointRoleSelector.get();

    if (selector) {
      const id = selector(waypoint);
      const roleId = renderer.getRoleFromName(id);
      if (roleId !== undefined) {
        renderer.register(waypoint, roleId, 'waypoints-layer');
      }
    } else {
      const groupRoles = renderer.getRoleNamesByGroup(MapSystemWaypointRoles.Normal);

      groupRoles.forEach(id => {
        const roleId = renderer.getRoleFromName(id);
        if (roleId !== undefined) {
          renderer.register(waypoint, roleId, 'waypoints-layer');
        }
      });
    }
  }

  /**
   * Deregisters a waypoint with this layer's waypoint renderer.
   * @param waypoint The waypoint to deregister.
   * @param renderer The renderer to deregister the waypoint from.
   */
  private deregisterWaypoint(waypoint: Waypoint, renderer: MapSystemWaypointsRenderer): void {
    const groupRoles = renderer.getRoleNamesByGroup(MapSystemWaypointRoles.Normal);

    groupRoles.forEach(id => {
      const roleId = renderer.getRoleFromName(id);
      if (roleId !== undefined) {
        renderer.deregister(waypoint, roleId, 'waypoints-layer');
      }
    });
  }
}
