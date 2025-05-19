import { EventBus } from '../../../data';
import { GeoPoint, GeoPointReadOnly, LatLonInterface } from '../../../geo';
import { BitFlags, UnitType, Vec2Math } from '../../../math';
import {
  Facility, FacilityLoader, FacilityRepository, FacilityRepositoryEvents, FacilitySearchType, FacilityType, ICAO,
  IcaoValue, NearestAirportSearchSession, NearestIcaoSearchSession, NearestIcaoSearchSessionDataType,
  NearestIntersectionSearchSession, NearestRepoFacilitySearchSession, NearestSearchResults, NearestVorSearchSession
} from '../../../navigation';
import { Subscription } from '../../../sub/Subscription';
import { FSComponent, VNode } from '../../FSComponent';
import { MapLayer, MapLayerProps } from '../MapLayer';
import { MapProjection, MapProjectionChangeType } from '../MapProjection';
import { MapWaypointRenderer, MapWaypointRendererType } from '../MapWaypointRenderer';
import { MapSyncedCanvasLayer } from './MapSyncedCanvasLayer';

/**
 * Facility search types supported by MapAbstractNearestWaypointsLayer.
 */
export type MapNearestWaypointsLayerSearchTypes
  = FacilitySearchType.Airport
  | FacilitySearchType.Vor
  | FacilitySearchType.Ndb
  | FacilitySearchType.Intersection
  | FacilitySearchType.User;

/**
 * Component props for MapAbstractNearestWaypointsLayer.
 */
export interface MapAbstractNearestWaypointsLayerProps<R extends MapWaypointRenderer<any> = MapWaypointRenderer> extends MapLayerProps<any> {

  /** The event bus. */
  bus: EventBus;

  /** The facility loader to use. If not defined, then a default instance will be created. */
  facilityLoader?: FacilityLoader;

  /** The waypoint renderer to use. */
  waypointRenderer: R;

  /** A function which retrieves a waypoint for a facility. */
  waypointForFacility: (facility: Facility) => MapWaypointRendererType<R>;

  /** A function which registers a waypoint with this layer's waypoint renderer. */
  registerWaypoint: (waypoint: MapWaypointRendererType<R>, renderer: R) => void;

  /** A function which deregisters a waypoint with this layer's waypoint renderer. */
  deregisterWaypoint: (waypoint: MapWaypointRendererType<R>, renderer: R) => void;

  /** A function which initializes this layer's waypoint renderer. */
  initRenderer?: (waypointRenderer: R, canvasLayer: MapSyncedCanvasLayer) => void;

  /** A function which gets the search center. If not defined, the search center defaults to the center of the map. */
  getSearchCenter?: (mapProjection: MapProjection) => LatLonInterface;

  /** A function which checks if a search should be refreshed. Defaults to `true` if not defined. */
  shouldRefreshSearch?: (searchType: MapNearestWaypointsLayerSearchTypes, center: LatLonInterface, radius: number) => boolean;

  /** A function which gets the item limit for facility searches. */
  searchItemLimit?: (searchType: MapNearestWaypointsLayerSearchTypes, center: LatLonInterface, radius: number) => number;

  /** A function which gets the radius limit for facility searches, in great-arc radians. */
  searchRadiusLimit?: (searchType: MapNearestWaypointsLayerSearchTypes, center: LatLonInterface, radius: number) => number;

  /** The debounce delay for facility searches, in milliseconds. Defaults to 500 milliseconds. */
  searchDebounceDelay?: number;

  /** A callback called when the search sessions are started. */
  onSessionsStarted?: (
    airportSession: NearestAirportSearchSession<NearestIcaoSearchSessionDataType.Struct>,
    vorSession: NearestVorSearchSession<NearestIcaoSearchSessionDataType.Struct>,
    ndbSession: NearestIcaoSearchSession<NearestIcaoSearchSessionDataType.Struct>,
    intSession: NearestIntersectionSearchSession<NearestIcaoSearchSessionDataType.Struct>,
    userSession: NearestRepoFacilitySearchSession<FacilityType.USR, NearestIcaoSearchSessionDataType.Struct>
  ) => void
}

/**
 * An abstract implementation of a map layer which displays waypoints (airports, navaids, and intersections) within a
 * search radius.
 */
export class MapNearestWaypointsLayer
  <
    R extends MapWaypointRenderer<any> = MapWaypointRenderer,
    P extends MapAbstractNearestWaypointsLayerProps<R> = MapAbstractNearestWaypointsLayerProps<R>
  >
  extends MapLayer<P> {

  private static readonly SEARCH_RADIUS_OVERDRAW_FACTOR = Math.SQRT2;

  private readonly canvasLayerRef = FSComponent.createRef<MapSyncedCanvasLayer>();

  private readonly searchDebounceDelay = this.props.searchDebounceDelay ?? 500;

  private readonly facLoader = this.props.facilityLoader ?? new FacilityLoader(FacilityRepository.getRepository(this.props.bus));

  private facilitySearches?: {
    /** A nearest airport search session. */
    [FacilitySearchType.Airport]: MapNearestWaypointsLayerSearch,
    /** A nearest VOR search session. */
    [FacilitySearchType.Vor]: MapNearestWaypointsLayerSearch,
    /** A nearest NDB search session. */
    [FacilitySearchType.Ndb]: MapNearestWaypointsLayerSearch,
    /** A nearest intersection search session. */
    [FacilitySearchType.Intersection]: MapNearestWaypointsLayerSearch
    /** A nearest user waypoint search session. */
    [FacilitySearchType.User]: MapNearestWaypointsLayerSearch
  };

  private searchRadius = 0;
  private searchMargin = 0;

  private userFacilityHasChanged = false;

  /** A set of the ICAOs of all waypoints that should be rendered. */
  private readonly icaosToRender = new Set<string>();
  /** A map of rendered waypoints from their ICAOs. */
  private readonly cachedRenderedWaypoints = new Map<string, MapWaypointRendererType<R>>();

  private isInit = false;

  private readonly facilityRepoSubs: Subscription[] = [];

  /**
   * Creates a new instance of MapNearestWaypointsLayer.
   * @param props The properties of the component.
   */
  public constructor(props: P) {
    super(props);

    this.initNearestSearchSessions();
  }

  /**
   * Initializes this layer's nearest facility search sessions.
   */
  private async initNearestSearchSessions(): Promise<void> {
    await this.facLoader.awaitInitialization();

    const [
      airportSession,
      vorSession,
      ndbSession,
      intSession,
      userSession
    ] = await Promise.all([
      this.facLoader.startNearestSearchSessionWithIcaoStructs(FacilitySearchType.Airport),
      this.facLoader.startNearestSearchSessionWithIcaoStructs(FacilitySearchType.Vor),
      this.facLoader.startNearestSearchSessionWithIcaoStructs(FacilitySearchType.Ndb),
      this.facLoader.startNearestSearchSessionWithIcaoStructs(FacilitySearchType.Intersection),
      this.facLoader.startNearestSearchSessionWithIcaoStructs(FacilitySearchType.User)
    ]);

    this.onSessionsStarted(airportSession, vorSession, ndbSession, intSession, userSession);
  }

  /**
   * A callback called when the nearest facility search sessions have been started.
   * @param airportSession The airport search session.
   * @param vorSession The VOR search session.
   * @param ndbSession The NDB search session.
   * @param intSession The intersection search session.
   * @param userSession The user facility search session.
   */
  protected onSessionsStarted(
    airportSession: NearestAirportSearchSession<NearestIcaoSearchSessionDataType.Struct>,
    vorSession: NearestVorSearchSession<NearestIcaoSearchSessionDataType.Struct>,
    ndbSession: NearestIcaoSearchSession<NearestIcaoSearchSessionDataType.Struct>,
    intSession: NearestIntersectionSearchSession<NearestIcaoSearchSessionDataType.Struct>,
    userSession: NearestRepoFacilitySearchSession<FacilityType.USR, NearestIcaoSearchSessionDataType.Struct>
  ): void {
    const callback = this.processSearchResults.bind(this);
    this.facilitySearches = {
      [FacilitySearchType.Airport]: new MapNearestWaypointsLayerSearch(airportSession, callback),
      [FacilitySearchType.Vor]: new MapNearestWaypointsLayerSearch(vorSession, callback),
      [FacilitySearchType.Ndb]: new MapNearestWaypointsLayerSearch(ndbSession, callback),
      [FacilitySearchType.Intersection]: new MapNearestWaypointsLayerSearch(intSession, callback),
      [FacilitySearchType.User]: new MapNearestWaypointsLayerSearch(userSession, callback)
    };

    const sub = this.props.bus.getSubscriber<FacilityRepositoryEvents>();

    // Watch for changes to user facilities so that we can trigger search refreshes to ensure that the layer does not
    // display outdated user waypoints.
    this.facilityRepoSubs.push(
      sub.on('facility_added').handle(fac => {
        if (ICAO.isValueFacility(fac.icaoStruct, FacilityType.USR)) {
          this.userFacilityHasChanged = true;
        }
      }),
      sub.on('facility_changed').handle(fac => {
        if (ICAO.isValueFacility(fac.icaoStruct, FacilityType.USR)) {
          this.userFacilityHasChanged = true;
        }
      }),
      sub.on('facility_removed').handle(fac => {
        if (ICAO.isValueFacility(fac.icaoStruct, FacilityType.USR)) {
          this.userFacilityHasChanged = true;
        }
      })
    );

    this.props.onSessionsStarted && this.props.onSessionsStarted(airportSession, vorSession, ndbSession, intSession, userSession);

    if (this.isInit) {
      this._tryRefreshAllSearches(this.getSearchCenter(), this.searchRadius);
    }
  }

  /** @inheritdoc */
  public onAttached(): void {
    super.onAttached();

    this.canvasLayerRef.instance.onAttached();

    this.doInit();
    this.isInit = true;
    this._tryRefreshAllSearches(this.getSearchCenter(), this.searchRadius);
  }

  /**
   * Initializes this layer.
   */
  private doInit(): void {
    this.initWaypointRenderer();
    this.updateSearchRadius();
  }

  /**
   * Gets the search center for the waypoint searches on this layer.
   * @returns The waypoint search center geo point.
   */
  private getSearchCenter(): LatLonInterface {
    return this.props.getSearchCenter ? this.props.getSearchCenter(this.props.mapProjection) : this.props.mapProjection.getCenter();
  }

  /**
   * Initializes this layer's waypoint renderer.
   */
  private initWaypointRenderer(): void {
    this.props.initRenderer && this.props.initRenderer(this.props.waypointRenderer, this.canvasLayerRef.instance);
  }

  /** Forces a refresh of all the waypoints. */
  public refreshWaypoints(): void {
    this.tryRefreshAllSearches(undefined, undefined, true);
    this.cachedRenderedWaypoints.forEach(w => {
      this.props.deregisterWaypoint(w, this.props.waypointRenderer);
    });
    this.cachedRenderedWaypoints.forEach(w => {
      this.props.registerWaypoint(w, this.props.waypointRenderer);
    });
  }

  /** @inheritdoc */
  public onMapProjectionChanged(mapProjection: MapProjection, changeFlags: number): void {
    this.canvasLayerRef.instance.onMapProjectionChanged(mapProjection, changeFlags);

    if (BitFlags.isAny(changeFlags, MapProjectionChangeType.Range | MapProjectionChangeType.RangeEndpoints | MapProjectionChangeType.ProjectedSize)) {
      this.updateSearchRadius();
      this._tryRefreshAllSearches(this.getSearchCenter(), this.searchRadius);
    } else if (BitFlags.isAll(changeFlags, MapProjectionChangeType.Center)) {
      this._tryRefreshAllSearches(this.getSearchCenter(), this.searchRadius);
    }
  }

  /**
   * Updates the desired nearest facility search radius based on the current map projection.
   */
  private updateSearchRadius(): void {
    let mapHalfDiagRange = Vec2Math.abs(this.props.mapProjection.getProjectedSize()) * this.props.mapProjection.getProjectedResolution() / 2;
    //Limit lower end of radius so that even at high zooms the surrounding area waypoints are captured.
    mapHalfDiagRange = Math.max(mapHalfDiagRange, UnitType.NMILE.convertTo(5, UnitType.GA_RADIAN));

    this.searchRadius = mapHalfDiagRange * MapNearestWaypointsLayer.SEARCH_RADIUS_OVERDRAW_FACTOR;
    this.searchMargin = mapHalfDiagRange * (MapNearestWaypointsLayer.SEARCH_RADIUS_OVERDRAW_FACTOR - 1);
  }

  /** @inheritdoc */
  public onUpdated(time: number, elapsed: number): void {
    // If a user facility was added, changed, or removed, schedule a user waypoint search refresh so that we always
    // have the latest user facility data.
    if (this.userFacilityHasChanged) {
      const search = this.facilitySearches?.[FacilitySearchType.User];
      if (search !== undefined) {
        this.userFacilityHasChanged = false;
        this.scheduleSearchRefresh(FacilitySearchType.User, search, this.getSearchCenter(), this.searchRadius);
      }
    }

    this.updateSearches(elapsed);
  }

  /**
   * Updates this layer's facility searches.
   * @param elapsed The elapsed time, in milliseconds, since the last update.
   */
  private updateSearches(elapsed: number): void {
    if (!this.facilitySearches) {
      return;
    }

    this.facilitySearches[FacilitySearchType.Airport].update(elapsed);
    this.facilitySearches[FacilitySearchType.Vor].update(elapsed);
    this.facilitySearches[FacilitySearchType.Ndb].update(elapsed);
    this.facilitySearches[FacilitySearchType.Intersection].update(elapsed);
    this.facilitySearches[FacilitySearchType.User].update(elapsed);
  }

  /**
   * Attempts to refresh all of the nearest facility searches. Searches will only be refreshed if the desired search
   * radius is different from the last refreshed search radius or the desired search center is outside of the margin
   * of the last refreshed search center.
   * @param center The center of the search area. Defaults to this layer's automatically calculated search center.
   * @param radius The radius of the search area, in great-arc radians. Defaults to this layer's automatically
   * calculated search radius.
   * @param force Whether to force a refresh of all waypoints. Defaults to false.
   */
  public tryRefreshAllSearches(center?: LatLonInterface, radius?: number, force?: boolean): void {
    center ??= this.getSearchCenter();
    radius ??= this.searchRadius;

    this._tryRefreshAllSearches(center, radius, force);
  }

  /**
   * Attempts to refresh a nearest search. The search will only be refreshed if the desired search radius is different
   * from the last refreshed search radius or the desired search center is outside of the margin of the last refreshed
   * search center.
   * @param type The type of nearest search to refresh.
   * @param center The center of the search area. Defaults to this layer's automatically calculated search center.
   * @param radius The radius of the search area, in great-arc radians. Defaults to this layer's automatically
   * calculated search radius.
   * @param force Whether to force a refresh of all waypoints. Defaults to false.
   */
  public tryRefreshSearch(type: MapNearestWaypointsLayerSearchTypes, center?: LatLonInterface, radius?: number, force?: boolean): void {
    center ??= this.getSearchCenter();
    radius ??= this.searchRadius;

    this._tryRefreshSearch(type, center, radius, force);
  }

  /**
   * Attempts to refresh all of the nearest facility searches.
   * @param center The center of the search area.
   * @param radius The radius of the search area, in great-arc radians.
   * @param force Whether to force a refresh of all waypoints. Defaults to false.
   */
  private _tryRefreshAllSearches(center: LatLonInterface, radius: number, force?: boolean): void {
    this._tryRefreshSearch(FacilitySearchType.Airport, center, radius, force);
    this._tryRefreshSearch(FacilitySearchType.Vor, center, radius, force);
    this._tryRefreshSearch(FacilitySearchType.Ndb, center, radius, force);
    this._tryRefreshSearch(FacilitySearchType.Intersection, center, radius, force);
    this._tryRefreshSearch(FacilitySearchType.User, center, radius, force);
  }

  /**
   * Attempts to refresh a nearest search. The search will only be refreshed if `this.shouldRefreshSearch()` returns
   * true and and the desired search radius is different from the last refreshed search radius or the desired search
   * center is outside of the margin of the last refreshed search center.
   * @param type The type of nearest search to refresh.
   * @param center The center of the search area.
   * @param radius The radius of the search area, in great-arc radians.
   * @param force Whether to force a refresh of all waypoints. Defaults to false.
   */
  private _tryRefreshSearch(type: MapNearestWaypointsLayerSearchTypes, center: LatLonInterface, radius: number, force?: boolean): void {
    const search = this.facilitySearches && this.facilitySearches[type];

    if (!search || (!force && !this.shouldRefreshSearch(type, center, radius))) {
      return;
    }

    const radiusLimit = this.props.searchRadiusLimit ? this.props.searchRadiusLimit(type, center, radius) : undefined;

    if (radiusLimit !== undefined && isFinite(radiusLimit)) {
      radius = Math.min(radius, Math.max(0, radiusLimit));
    }

    if (force || search.lastRadius !== radius || search.lastCenter.distance(center) >= this.searchMargin) {
      this.scheduleSearchRefresh(type, search, center, radius);
    }
  }

  /**
   * Checks whether one of this layer's searches should be refreshed.
   * @param type The type of nearest search to refresh.
   * @param center The center of the search area.
   * @param radius The radius of the search area, in great-arc radians.
   * @returns Whether the search should be refreshed.
   */
  private shouldRefreshSearch(type: MapNearestWaypointsLayerSearchTypes, center: LatLonInterface, radius: number): boolean {
    return this.props.shouldRefreshSearch ? this.props.shouldRefreshSearch(type, center, radius) : true;
  }

  /**
   * Schedules a refresh of this one of this layer's searches.
   * @param type The type of nearest search to refresh.
   * @param search The search to refresh.
   * @param center The center of the search area.
   * @param radius The radius of the search area, in great-arc radians.
   */
  private scheduleSearchRefresh(
    type: MapNearestWaypointsLayerSearchTypes,
    search: MapNearestWaypointsLayerSearch,
    center: LatLonInterface,
    radius: number
  ): void {
    const itemLimit = this.props.searchItemLimit ? this.props.searchItemLimit(type, center, radius) : 100;
    search.scheduleRefresh(center, radius, itemLimit, this.searchDebounceDelay);
  }

  /**
   * Processes nearest facility search results. New facilities are registered, while removed facilities are
   * deregistered.
   * @param results Nearest facility search results.
   */
  private processSearchResults(results: NearestSearchResults<IcaoValue, IcaoValue> | undefined): void {
    if (!results) {
      return;
    }

    const numAdded = results.added.length;
    for (let i = 0; i < numAdded; i++) {
      const icao = results.added[i];
      if (ICAO.isValueEmpty(icao)) {
        continue;
      }

      this.registerIcao(icao);
    }

    const numRemoved = results.removed.length;
    for (let i = 0; i < numRemoved; i++) {
      const icao = results.removed[i];
      if (ICAO.isValueEmpty(icao)) {
        continue;
      }

      this.deregisterIcao(icao);
    }
  }

  /**
   * Registers an ICAO string with this layer. Once an ICAO is registered, its corresponding facility is drawn to this
   * layer using a waypoint renderer.
   * @param icao The ICAO string to register.
   */
  private async registerIcao(icao: IcaoValue): Promise<void> {
    const uid = ICAO.getUid(icao);
    this.icaosToRender.add(uid);

    try {
      const facility = await this.facLoader.tryGetFacility(ICAO.getFacilityTypeFromValue(icao), icao);

      if (facility) {
        if (!this.icaosToRender.has(uid)) {
          return;
        }

        this.registerWaypointWithRenderer(this.props.waypointRenderer, facility);
      }
    } catch {
      // noop
    }
  }

  /**
   * Registers a facility with this layer's waypoint renderer.
   * @param renderer This layer's waypoint renderer.
   * @param facility The facility to register.
   */
  private registerWaypointWithRenderer(renderer: R, facility: Facility): void {
    const waypoint = this.props.waypointForFacility(facility);
    this.cachedRenderedWaypoints.set(ICAO.getUid(facility.icaoStruct), waypoint);
    this.props.registerWaypoint(waypoint, renderer);
  }

  /**
   * Deregisters an ICAO string from this layer.
   * @param icao The ICAO string to deregister.
   */
  private async deregisterIcao(icao: IcaoValue): Promise<void> {
    const uid = ICAO.getUid(icao);

    this.icaosToRender.delete(uid);

    let facility: Facility | null = null;

    try {
      facility = await this.facLoader.tryGetFacility(ICAO.getFacilityTypeFromValue(icao), icao);
    } catch {
      // noop
    }

    if (this.icaosToRender.has(uid)) {
      return;
    }

    if (facility) {
      this.deregisterWaypointWithRenderer(this.props.waypointRenderer, facility);
    } else {
      // If we can't find the facility from the ICAO, it could be that the facility has been removed, in which case
      // we grab the cached waypoint (the waypoint that was most recently registered with the renderer under the
      // removed ICAO) and deregister it.

      const cachedWaypoint = this.cachedRenderedWaypoints.get(uid);
      if (cachedWaypoint !== undefined) {
        this.cachedRenderedWaypoints.delete(uid);
        this.props.deregisterWaypoint(cachedWaypoint, this.props.waypointRenderer);
      }
    }
  }

  /**
   * Deregisters a facility from this layer's waypoint renderer.
   * @param renderer This layer's waypoint renderer.
   * @param facility The facility to deregister.
   */
  private deregisterWaypointWithRenderer(renderer: R, facility: Facility): void {
    const waypoint = this.props.waypointForFacility(facility);
    this.cachedRenderedWaypoints.delete(ICAO.getUid(facility.icaoStruct));
    this.props.deregisterWaypoint(waypoint, renderer);
  }

  /** @inheritdoc */
  public setVisible(val: boolean): void {
    super.setVisible(val);
    this.canvasLayerRef.instance.setVisible(val);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <MapSyncedCanvasLayer ref={this.canvasLayerRef} model={this.props.model} mapProjection={this.props.mapProjection} class={this.props.class ?? ''} />
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.canvasLayerRef.getOrDefault()?.destroy();

    this.facilityRepoSubs.forEach(sub => { sub.destroy(); });

    super.destroy();
  }
}

/**
 * A nearest facility search for MapAbstractNearestWaypointsLayer.
 */
export class MapNearestWaypointsLayerSearch<
  S extends NearestIcaoSearchSession<NearestIcaoSearchSessionDataType.Struct> = NearestIcaoSearchSession<NearestIcaoSearchSessionDataType.Struct>
> {
  private readonly _lastCenter = new GeoPoint(0, 0);
  private _lastRadius = 0;

  private maxItemCount = 0;

  private refreshDebounceTimer = 0;
  private isRefreshScheduled = false;

  // eslint-disable-next-line jsdoc/require-returns
  /**
   * The center of this search's last refresh.
   */
  public get lastCenter(): GeoPointReadOnly {
    return this._lastCenter.readonly;
  }

  // eslint-disable-next-line jsdoc/require-returns
  /**
   * The radius of this search's last refresh, in great-arc radians.
   */
  public get lastRadius(): number {
    return this._lastRadius;
  }

  /**
   * Constructor.
   * @param session The session used by this search.
   * @param refreshCallback A callback which is called every time the search refreshes.
   */
  constructor(
    private readonly session: S,
    private readonly refreshCallback: (results: NearestSearchResults<IcaoValue, IcaoValue>) => void
  ) {
  }

  /**
   * Schedules a refresh of this search.  If a refresh was previously scheduled but not yet executed, this new
   * scheduled refresh will replace the old one.
   * @param center The center of the search area.
   * @param radius The radius of the search area, in great-arc radians.
   * @param maxItemCount The maximum number of results returned by the refresh.
   * @param delay The delay, in milliseconds, before the refresh is executed.
   */
  public scheduleRefresh(center: LatLonInterface, radius: number, maxItemCount: number, delay: number): void {
    this._lastCenter.set(center);
    this._lastRadius = radius;
    this.maxItemCount = maxItemCount;

    if (!this.isRefreshScheduled) {
      this.refreshDebounceTimer = delay;
      this.isRefreshScheduled = true;
    }
  }

  /**
   * Updates this search. Executes any pending refreshes if their delay timers have expired.
   * @param elapsed The elapsed time, in milliseconds, since the last update.
   */
  public update(elapsed: number): void {
    if (!this.isRefreshScheduled) {
      return;
    }

    this.refreshDebounceTimer = Math.max(0, this.refreshDebounceTimer - elapsed);
    if (this.refreshDebounceTimer === 0) {
      this.refresh();
      this.isRefreshScheduled = false;
    }
  }

  /**
   * Refreshes this search.
   * @returns a Promise which is fulfilled when the refresh completes.
   */
  private async refresh(): Promise<void> {
    const results = await this.session.searchNearest(
      this._lastCenter.lat,
      this._lastCenter.lon,
      UnitType.GA_RADIAN.convertTo(this._lastRadius, UnitType.METER),
      this.maxItemCount
    );

    this.refreshCallback(results);
  }
}