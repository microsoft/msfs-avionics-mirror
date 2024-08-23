import {
  ArraySubject, ClockEvents, EventBus, Facility, FacilityLoader, FacilityUtils, FlightPlanner, FlightPlannerEvents, FlightPlanPredictionsProvider, FlightPlanUserDataEvent,
  GeoPoint, ICAO, MagVar, Subject, UnitType, Vec3Math,
} from '@microsoft/msfs-sdk';

import { WT21FmsUtils } from '../FMS/WT21FmsUtils';
import { WT21FixInfoCalculator } from './WT21FixInfoCalculator';
import { WT21FixInfoCalculatedData, WT21FixInfoData, WT21FixInfoFlightPlanData, WT21FixInfoMarker, WT21FixInfoWaypoint } from './WT21FixInfoData';

/** Events for fix info data */
export interface WT21FixInfoEvents {
  /** The index of a fix info that was updated */
  fix_info_calculated: number,
}

/** Available options for configuring fix info. */
export interface WT21FixInfoOptions {
  /** The number of fixes/pages available. Defaults to 1. */
  numberOfFixes?: number,
  /** The number of bearing/distance pairs available. Defaults to 1. */
  numberOfBearingDistances?: number,
  /** The number of latitude/longitude pairs available. Defaults to 1. */
  numberOfLatLonCrossings?: number,
  /** The maximum allowed distance in metres. Defaults to 99999 m. */
  maxDistance?: number,
}

/** WT21 Fix Info Implementation */
export class WT21FixInfoManager {
  private needPredictionsUpdate = false;
  private needIntersectionsUpdate = false;
  private ignoreSync = false;

  private readonly syncDataCache: WT21FixInfoFlightPlanData[];

  private readonly fixInfos: WT21FixInfoData[];

  /** FIX INFO page data, {@link WT21FixInfoOptions.numberOfFixes} elements */
  private readonly calculatedData;

  public readonly ndMarkers = ArraySubject.create<WT21FixInfoMarker>();
  private readonly ndMarkersCache: WT21FixInfoMarker[];
  public readonly ndWaypoints = ArraySubject.create<WT21FixInfoWaypoint>();
  private readonly ndWaypointsCache: WT21FixInfoWaypoint[] = [];

  private readonly calculator: WT21FixInfoCalculator;

  /** FIXME hook up when true ref exists */
  public readonly trueRef = Subject.create(false);

  private readonly pendingIntersectionCalculateHandlers: (() => unknown)[] = [];

  private readonly options: Required<WT21FixInfoOptions>;

  /**
   * Instantiates the Fix Info subsystem
   * @param bus Event Bus
   * @param facLoader Facility Loader
   * @param activeRoutePlanIndex Index of the active route flight plan
   * @param flightPlanner The flight planner
   * @param options Options for fix info.
   * @param activeRoutePredictor The active route predictor
   */
  constructor(
    private readonly bus: EventBus,
    private readonly facLoader: FacilityLoader,
    private readonly activeRoutePlanIndex: number,
    private readonly flightPlanner: FlightPlanner,
    options?: Partial<WT21FixInfoOptions>,
    private readonly activeRoutePredictor?: FlightPlanPredictionsProvider,
  ) {
    this.options = {
      numberOfFixes: options?.numberOfFixes !== undefined ? options.numberOfFixes : 1,
      numberOfBearingDistances: options?.numberOfBearingDistances !== undefined ? options.numberOfBearingDistances : 1,
      numberOfLatLonCrossings: options?.numberOfLatLonCrossings !== undefined ? options.numberOfLatLonCrossings : 1,
      maxDistance: options?.maxDistance !== undefined ? options.maxDistance : 99999,
    };

    this.syncDataCache = Array.from({ length: this.options.numberOfFixes }, () => ({
      fixIcao: null,
      bearingDistances: [],
      latitudeLongitudes: [],
      predictedTime: null,
      predictedAltitude: null,
      calculateAbeamPoint: false,
    }));

    this.fixInfos = Array.from({ length: this.options.numberOfFixes }, () => ({
      fixIcao: null,
      fix: null,
      fixIdent: null,
      fixLocationSpherical: new GeoPoint(NaN, NaN),
      fixLocationCartesian: Vec3Math.create(),
      fixMagVar: 0,
      bearingDistances: Array.from({ length: this.options.numberOfBearingDistances }, () => [null, null]),
      latitudeLongitudes: Array.from({ length: this.options.numberOfLatLonCrossings }, () => [null, null]),
      calculateAbeamPoint: false,
      predictedTime: null,
      predictedAltitude: null,
      bearingDistanceIntersections: Array.from({ length: this.options.numberOfBearingDistances }, () => ({
        flightPlanLeg: null,
        distanceAlongLeg: null,
        point: new GeoPoint(NaN, NaN),
      })),
      latitudeLongitudeIntersections: Array.from({ length: this.options.numberOfLatLonCrossings }, () => ({
        flightPlanLeg: null,
        distanceAlongLeg: null,
        point: new GeoPoint(NaN, NaN),
      })),
      abeamIntersection: {
        flightPlanLeg: null,
        distanceAlongLeg: null,
        point: new GeoPoint(NaN, NaN),
      },
      etaAltitudePoint: new GeoPoint(NaN, NaN),
    }));

    this.calculatedData = Array.from({ length: this.options.numberOfFixes }, (): WT21FixInfoCalculatedData => ({
      fixIdent: null,
      fixBearing: null,
      fixDistance: null,
      bearingDistancePredictions: Array.from(
        { length: this.options.numberOfBearingDistances },
        () => ({ bearing: null, distance: null, eta: null, dtg: null, altitude: null, fuelOnBoard: null })
      ),
      latitudeLongitudePredictions: Array.from(
        { length: this.options.numberOfLatLonCrossings },
        () => ({ latitude: null, longitude: null, eta: null, dtg: null, altitude: null, fuelOnBoard: null })
      ),
      abeamCalculated: false,
      abeamPredictions: { bearing: null, distance: null, eta: null, dtg: null, altitude: null, fuelOnBoard: null },
      etaAltitudePrediction: null,
    }));

    this.ndMarkersCache = Array.from({ length: this.options.numberOfFixes }, () => ({
      location: new GeoPoint(NaN, NaN),
      altitude: null,
      estimatedTimeOfArrival: null,
    }));

    this.calculator = new WT21FixInfoCalculator(this.bus, this.options.maxDistance, this.activeRoutePredictor);

    const sub = this.bus.getSubscriber<ClockEvents & FlightPlannerEvents>();

    sub.on('simTime').atFrequency(1 / 3).handle(() => this.needPredictionsUpdate = true);
    sub.on('realTime').handle(this.onUpdate.bind(this));
    //sub.on('fms_operating_phase').handle((phase) => phase === FmsOperatingPhase.COMPLETE && this.clearAllFixes());

    sub.on('fplCalculated').handle((ev) => ev.planIndex === this.activeRoutePlanIndex && (this.needIntersectionsUpdate = true));

    this.trueRef.sub(() => this.needIntersectionsUpdate = true);

    const planEvents = this.bus.getSubscriber<FlightPlannerEvents>();
    planEvents.on('fplUserDataSet').handle(this.onPlanUserDataSet.bind(this));
    planEvents.on('fplLoaded').handle(x => x.planIndex === this.activeRoutePlanIndex && this.readFixInfoFromUserData());
  }

  /**
   * Handle the flightplan user data changed event
   * @param event User data event
   */
  private onPlanUserDataSet(event: FlightPlanUserDataEvent): void {
    if (event.planIndex === this.activeRoutePlanIndex && event.key === WT21FmsUtils.USER_DATA_KEY_FIX_INFO) {
      this.onFlightPlanFixInfoDataChanged();
    }
  }

  /**
   * Handle the flightplan user data changed event
   */
  private onFlightPlanFixInfoDataChanged(): void {
    if (this.ignoreSync) {
      return;
    }

    this.readFixInfoFromUserData();
  }

  /**
   * Read the pilot-entered fix info data from the flightplan.
   * Used for syncing data from other FMS instances
   */
  private async readFixInfoFromUserData(): Promise<void> {
    const userData = this.getFlightPlanFixInfos(this.activeRoutePlanIndex);

    if (!userData) {
      return;
    }

    for (let i = 0; i < this.options.numberOfFixes; i++) {
      const planData = userData[i];
      const fixInfo = this.fixInfos[i];
      if (fixInfo.fixIcao !== planData?.fixIcao) {
        // fill in all the data that is cached locally
        if (planData?.fixIcao) {
          const fix = await this.facLoader.getFacility(ICAO.getFacilityType(planData.fixIcao), planData.fixIcao);
          fixInfo.fix = fix;
          fixInfo.fixIdent = ICAO.getIdent(fix.icao);
          fixInfo.fixLocationSpherical.set(fix.lat, fix.lon);
          fixInfo.fixLocationSpherical.toCartesian(fixInfo.fixLocationCartesian);
          fixInfo.fixMagVar = FacilityUtils.getMagVar(fix);
        } else {
          fixInfo.fix = null;
          fixInfo.fixIdent = null;
          fixInfo.fixMagVar = 0;
        }
      }
      Object.assign(fixInfo, userData[i]);
    }

    this.needIntersectionsUpdate = true;
    this.needPredictionsUpdate = true;
  }

  /**
   * Write the pilot-entered fix info data to the flightplan.
   * Used for syncing data to other FMS instances.
   */
  private writeFixInfoToUserData(): void {
    this.ignoreSync = true;

    for (const [i, fixInfo] of this.fixInfos.entries()) {
      this.syncDataCache[i].fixIcao = fixInfo.fixIcao;
      this.syncDataCache[i].bearingDistances = fixInfo.bearingDistances;
      this.syncDataCache[i].latitudeLongitudes = fixInfo.latitudeLongitudes;
      this.syncDataCache[i].predictedAltitude = fixInfo.predictedAltitude;
      this.syncDataCache[i].predictedTime = fixInfo.predictedTime;
      this.syncDataCache[i].calculateAbeamPoint = fixInfo.calculateAbeamPoint;
    }

    this.setFlightPlanFixInfos(this.activeRoutePlanIndex, this.syncDataCache);

    this.ignoreSync = false;
  }

  /**
   * Periodic update of fix info calculated data
   */
  private onUpdate(): void {
    if (!this.flightPlanner.hasFlightPlan(this.activeRoutePlanIndex)) {
      return;
    }

    const plan = this.flightPlanner.getFlightPlan(this.activeRoutePlanIndex);

    if (this.needIntersectionsUpdate) {
      this.needIntersectionsUpdate = false;
      this.calculator.calculateAllIntersections(plan, this.fixInfos);
      this.calculator.calculateIntersectionBearingDistances(this.fixInfos, this.calculatedData);
      this.refreshNdWaypoints();

      this.checkAbeamIntersectionsValid();

      this.pendingIntersectionCalculateHandlers.forEach((handler) => handler());
      this.pendingIntersectionCalculateHandlers.length = 0;

      this.needPredictionsUpdate = true;
      // punt the predictions onto another frame
      return;
    }

    if (!this.needPredictionsUpdate) {
      return;
    }
    this.needPredictionsUpdate = false;

    for (let i = 0; i < this.options.numberOfFixes; i++) {
      const fixInfo = this.fixInfos[i];
      const calculated = this.calculatedData[i];

      // update the time/altitude prediction
      this.calculator.calculateEtaAltitudePrediction(plan, fixInfo, calculated);
      // update CDU data
      this.calculator.calculateFixPredictions(plan, fixInfo, calculated);

      this.checkAbeamPredictionsValid();

      this.bus.getPublisher<WT21FixInfoEvents>().pub('fix_info_calculated', i, false, false);
    }

    this.refreshNdMarkers();
  }

  /**
   * Refresh the set of ND ETA/altitude prediction markers
   */
  private refreshNdMarkers(): void {
    const newMarkers = this.gatherNdMarkers();

    // remove markers that don't exist any more
    for (let i = this.ndMarkers.length - 1; i >= 0; i--) {
      const oldMarker = this.ndMarkers.get(i);
      if (newMarkers.find((m) => this.ndMarkerEquality(oldMarker, m)) === undefined) {
        this.ndMarkers.removeAt(i);
      }
    }

    // insert new/updated markers
    for (const newMarker of newMarkers) {
      // we use latitude being finite as a proxy for "this marker is valid"
      if (isFinite(newMarker.location.lat) && this.ndMarkers.getArray().find((m) => this.ndMarkerEquality(newMarker, m)) === undefined) {
        this.ndMarkers.insert(newMarker);
      }
    }
  }

  /**
   * Gather current ND ETA/altitude prediction markers
   * @returns the current markers that should be displayed
   */
  private gatherNdMarkers(): WT21FixInfoMarker[] {
    for (const [i, fixInfo] of this.fixInfos.entries()) {
      const ndMarker = this.ndMarkersCache[i];

      if (!isFinite(fixInfo.etaAltitudePoint.lat) || !isFinite(fixInfo.etaAltitudePoint.lon)) {
        ndMarker.location.set(NaN, NaN);
        ndMarker.altitude = null;
        ndMarker.estimatedTimeOfArrival = null;
      } else if (fixInfo.predictedAltitude !== null) {
        ndMarker.location.set(fixInfo.etaAltitudePoint);
        ndMarker.altitude = UnitType.FOOT.convertFrom(fixInfo.predictedAltitude, UnitType.METER);
        ndMarker.estimatedTimeOfArrival = null;
      } else if (fixInfo.predictedTime !== null) {
        ndMarker.location.set(fixInfo.etaAltitudePoint);
        ndMarker.altitude = null;
        ndMarker.estimatedTimeOfArrival = fixInfo.predictedTime;
      }
    }

    return this.ndMarkersCache;
  }

  /**
   * Check if two {@link WT21FixInfoMarker} instances are equal
   * @param a first instance
   * @param b second instance
   * @returns true if the two instances are equal
   */
  private ndMarkerEquality(a: WT21FixInfoMarker, b: WT21FixInfoMarker): boolean {
    return a.altitude === b.altitude
      && b.estimatedTimeOfArrival === b.estimatedTimeOfArrival
      && a.location.equals(b.location);
  }

  /**
   * Refresh the set of ND waypoints
   */
  private refreshNdWaypoints(): void {
    const newData = this.gatherNdWaypoints();

    // remove any fixes no longer existing
    for (let i = this.ndWaypoints.length - 1; i >= 0; i--) {
      const ndData = this.ndWaypoints.get(i);
      if (newData.find((f) => f.fixIcao === ndData.fixIcao) === undefined) {
        this.ndWaypoints.removeAt(i);
      }
    }

    for (let i = 0; i < newData.length; i++) {
      const newFix = newData[i];
      const oldFixIndex = this.ndWaypoints.getArray().findIndex((f) => f.fixIcao === newFix.fixIcao);
      const oldFix = this.ndWaypoints.tryGet(oldFixIndex);

      // old data is equal to new, so no need to send anything to the ND/mangle the DOM
      if (oldFix && this.ndWaypointEquality(newFix, oldFix)) {
        continue;
      }

      // remove the stale data if it exists, and insert new data
      if (oldFixIndex >= 0) {
        this.ndWaypoints.removeAt(oldFixIndex);
      }

      const insertFix = oldFix ? oldFix : Object.assign({}, newFix);
      insertFix.abeamIntersections = [...newFix.abeamIntersections];
      insertFix.intersections = [...newFix.intersections];
      insertFix.bearings = [...newFix.bearings];
      insertFix.circleRadii = [...newFix.circleRadii];
      this.ndWaypoints.insert(insertFix);
    }
  }

  /**
   * Get ND data for all of the fix infos
   * @returns ND waypoint data
   */
  private gatherNdWaypoints(): WT21FixInfoWaypoint[] {
    // remove any fixes no longer existing, and reset calculated data
    for (let i = this.ndWaypointsCache.length - 1; i >= 0; i--) {
      const ndData = this.ndWaypointsCache[i];
      if (this.fixInfos.find((f) => f.fixIcao === ndData.fixIcao) === undefined) {
        this.ndWaypointsCache.splice(i, 1);
      } else {
        ndData.abeamIntersections.length = 0;
        ndData.intersections.length = 0;
        ndData.bearings.length = 0;
        ndData.circleRadii.length = 0;
      }
    }

    for (const fixInfo of this.fixInfos) {
      if (fixInfo.fixIdent === null || fixInfo.fixIcao === null) {
        continue;
      }
      let ndFix = this.ndWaypointsCache.find((f) => f.fixIcao === fixInfo.fixIcao);
      if (!ndFix) {
        ndFix = {
          fixIdent: fixInfo.fixIdent,
          fixIcao: fixInfo.fixIcao,
          location: fixInfo.fixLocationSpherical,
          circleRadii: [],
          bearings: [],
          abeamIntersections: [],
          intersections: [],
          magVar: fixInfo.fixMagVar,
        };
        this.ndWaypointsCache.push(ndFix);
      }

      for (const [bearing, distance] of fixInfo.bearingDistances) {
        if (bearing !== null && !ndFix.bearings.includes(Math.round(bearing))) {
          ndFix.bearings.push(Math.round(bearing));
        }
        if (distance !== null && !ndFix.circleRadii.includes(Math.round(distance))) {
          ndFix.circleRadii.push(Math.round(distance));
        }
      }

      if (this.calculator.isIntersectionValid(fixInfo.abeamIntersection)) {
        ndFix.abeamIntersections.push(fixInfo.abeamIntersection.point);
        ndFix.intersections.push(fixInfo.abeamIntersection.point);
      }

      for (const intersection of fixInfo.bearingDistanceIntersections) {
        if (this.calculator.isIntersectionValid(intersection)) {
          ndFix.intersections.push(intersection.point);
        }
      }
    }

    return this.ndWaypointsCache;
  }

  /**
   * Check if two {@link WT21FixInfoWaypoint} instances are equal
   * @param a first instance
   * @param b second instance
   * @returns true if the two instances are equal
   */
  private ndWaypointEquality(a: WT21FixInfoWaypoint, b: WT21FixInfoWaypoint): boolean {
    return a.fixIcao === b.fixIcao
      && a.circleRadii.length === b.circleRadii.length
      && a.circleRadii.every((r, i) => r === b.circleRadii[i])
      && a.bearings.length === b.bearings.length
      && a.bearings.every((r, i) => r === b.bearings[i])
      && a.abeamIntersections.length === b.abeamIntersections.length
      && a.abeamIntersections.every((p, i) => p.equals(b.abeamIntersections[i]))
      && a.intersections.length === b.intersections.length
      && a.intersections.every((p, i) => p.equals(b.intersections[i]));
  }

  /** Clear all fixes on flight completion */
  private clearAllFixes(): void {
    for (let i = 0; i < this.options.numberOfFixes; i++) {
      this.clearFix(i, true);
    }
    // no sync to user data as we assume other FMS instances also got complete phase
  }

  /**
   * Checks all fix infos for abeam points that could not be calculated and clears the calculate flag.
   */
  private checkAbeamIntersectionsValid(): void {
    let needSync = false;
    // clear the calculate flag if an intersection was not found
    for (const fixInfo of this.fixInfos) {
      if (fixInfo.calculateAbeamPoint && (!this.calculator.isIntersectionValid(fixInfo.abeamIntersection))) {
        fixInfo.calculateAbeamPoint = false;
        needSync = true;
      }
    }

    if (needSync) {
      this.writeFixInfoToUserData();
    }
  }

  /**
   * Checks all fix infos for abeam points that are behind the plane and clears them
   */
  private checkAbeamPredictionsValid(): void {
    // clear the calculate flag if an intersection is behind the plane
    for (const [i, calcData] of this.calculatedData.entries()) {
      if (calcData.abeamPredictions.dtg !== null && calcData.abeamPredictions.dtg < 0) {
        this.deleteAbeamPoint(i);
      }
    }
  }

  /**
   * Set a pilot-entered bearing and/or distance.
   * @param fixIndex Index of the fix info/page (0-based).
   * @param brgDistIndex Index/row of the bearing/dist pair (0-based).
   * @param bearing Bearing in degrees, true or magnetic depending on reference mode,
   * or null to allow FMS intersection computation.
   * @param distance Distance/radius in metres, or null to allow FMS intersection
   * computation.
   * @returns true if the operation succeeded.
   */
  public setBearingDistance(fixIndex: number, brgDistIndex: number, bearing: number | null, distance: number | null): Promise<boolean> {
    if (fixIndex >= this.options.numberOfFixes || brgDistIndex >= this.options.numberOfBearingDistances || this.fixInfos[fixIndex].fix === null) {
      return Promise.resolve(false);
    }

    const fixInfo = this.fixInfos[fixIndex];
    const trueBearing = (this.trueRef.get() || bearing === null) ? bearing : MagVar.magneticToTrue(bearing, fixInfo.fixMagVar);

    fixInfo.bearingDistances[brgDistIndex][0] = trueBearing;
    fixInfo.bearingDistances[brgDistIndex][1] = distance;

    this.needIntersectionsUpdate = true;
    this.needPredictionsUpdate = true;

    this.writeFixInfoToUserData();

    // await calculation so we can check for an intersection
    return new Promise((resolve) => {
      this.pendingIntersectionCalculateHandlers.push(() => {
        // this flag is reset by checkAbeamPoints if there is no intersection
        resolve(this.calculator.isIntersectionValid(fixInfo.bearingDistanceIntersections[brgDistIndex]));
      });
    });
  }

  /**
   * Clear a pilot-entered bearing/distance pair
   * @param fixIndex Index of the fix info/page (0-based).
   * @param brgDistIndex Index/row of the bearing/dist pair (0-based).
   * @returns true if the operation succeeded.
   */
  public clearBearingDistance(fixIndex: number, brgDistIndex: number): boolean {
    if (fixIndex >= this.options.numberOfFixes || brgDistIndex >= this.options.numberOfBearingDistances || this.fixInfos[fixIndex].fix === null) {
      return false;
    }

    const fixInfo = this.fixInfos[fixIndex];

    fixInfo.bearingDistances[brgDistIndex][0] = null;
    fixInfo.bearingDistances[brgDistIndex][1] = null;

    this.needIntersectionsUpdate = true;
    this.needPredictionsUpdate = true;

    this.writeFixInfoToUserData();

    return true;
  }

  /**
   * Set a pilot-entered latitude and/or longitude.
   * @param fixIndex Index of the fix info/page (0-based).
   * @param latLonIndex Index/row of the bearing/dist pair (0-based).
   * @param latitude Latitude in degrees, or null to allow FMS intersection computation.
   * @param longitude Longitude in degrees, or null to allow FMS intersection computation.
   * @returns true if the operation succeeded.
   */
  public setLatitudeLongitude(fixIndex: number, latLonIndex: number, latitude: number | null, longitude: number | null): Promise<boolean> {
    if (fixIndex >= this.options.numberOfFixes || latLonIndex >= this.options.numberOfLatLonCrossings) {
      return Promise.resolve(false);
    }

    const fixInfo = this.fixInfos[fixIndex];

    fixInfo.latitudeLongitudes[latLonIndex][0] = latitude;
    fixInfo.latitudeLongitudes[latLonIndex][1] = longitude;

    this.needIntersectionsUpdate = true;
    this.needPredictionsUpdate = true;

    this.writeFixInfoToUserData();

    // await calculation so we can check for an intersection
    return new Promise((resolve) => {
      this.pendingIntersectionCalculateHandlers.push(() => {
        // this flag is reset by checkAbeamPoints if there is no intersection
        resolve(this.calculator.isIntersectionValid(fixInfo.latitudeLongitudeIntersections[latLonIndex]));
      });
    });
  }

  /**
   * Clear a pilot-entered latitude/longitude pair
   * @param fixIndex Index of the fix info/page (0-based).
   * @param latLonIndex Index/row of the lat/lon pair (0-based).
   * @returns true if the operation succeeded.
   */
  public clearLatitudeLongitude(fixIndex: number, latLonIndex: number): boolean {
    if (fixIndex >= this.options.numberOfFixes || latLonIndex >= this.options.numberOfLatLonCrossings) {
      return false;
    }

    const fixInfo = this.fixInfos[fixIndex];

    fixInfo.latitudeLongitudes[latLonIndex][0] = null;
    fixInfo.latitudeLongitudes[latLonIndex][1] = null;

    this.needIntersectionsUpdate = true;
    this.needPredictionsUpdate = true;

    this.writeFixInfoToUserData();

    return true;
  }

  /**
   * Set the fix for a fix info page, clearing all other data on the page
   * @param fixIndex Index of the fix info/page (0-based).
   * @param fix The fix facility
   * @returns true if the operation succeeded.
   */
  public setFix(fixIndex: number, fix: Facility): boolean {
    if (fixIndex >= this.options.numberOfFixes || !fix) {
      return false;
    }

    // don't clear data if it's the same fix... nothing to do
    if (this.fixInfos[fixIndex].fix?.icao === fix?.icao) {
      return true;
    }

    if (this.fixInfos[fixIndex].fix !== null) {
      this.clearFix(fixIndex, true);
    }

    const fixInfo = this.fixInfos[fixIndex];

    fixInfo.fix = fix;
    fixInfo.fixIcao = fix.icao;
    fixInfo.fixIdent = ICAO.getIdent(fix.icao);
    fixInfo.fixLocationSpherical = new GeoPoint(fix.lat, fix.lon);
    fixInfo.fixLocationSpherical.toCartesian(fixInfo.fixLocationCartesian);
    fixInfo.fixMagVar = FacilityUtils.getMagVar(fix);

    this.writeFixInfoToUserData();
    this.needPredictionsUpdate = true;

    return true;
  }

  /**
   * Clear a fix info page
   * @param fixIndex Index of the fix info/page (0-based).
   * @param omitSync true if the flight plan user data sync will be done later
   * @returns true if the operation succeeded.
   */
  public clearFix(fixIndex: number, omitSync = false): boolean {
    if (fixIndex >= this.options.numberOfFixes) {
      return false;
    }

    const fixInfo = this.fixInfos[fixIndex];
    fixInfo.fix = null;
    fixInfo.fixIcao = null;
    fixInfo.fixIdent = null;
    fixInfo.fixMagVar = 0;
    fixInfo.bearingDistances.forEach((v) => { v[0] = null; v[1] = null; });
    fixInfo.calculateAbeamPoint = false;
    this.calculator.clearFixIntersections(fixInfo);

    if (!omitSync) {
      this.writeFixInfoToUserData();
    }

    this.needPredictionsUpdate = true;

    return true;
  }

  /**
   * Set a time to predict the distance/along-track location for.
   * This will clear the altitude to predict if set.
   * @param fixIndex Index of the fix info/page (0-based).
   * @param time Unix timestamp in milliseconds
   * @returns true if the operation succeeded.
   */
  public setTimePrediction(fixIndex: number, time: number): boolean {
    if (fixIndex >= this.options.numberOfFixes) {
      return false;
    }

    const data = this.fixInfos[fixIndex];
    data.predictedAltitude = null;
    data.predictedTime = time;

    this.writeFixInfoToUserData();
    this.needPredictionsUpdate = true;

    return true;
  }

  /**
   * Set an altitude to predict the distance/along-track location for.
   * This will clear the time to predict if set.
   * @param fixIndex Index of the fix info/page (0-based).
   * @param altitude Altitude in metres.
   * @returns true if the operation succeeded.
   */
  public setAltitudePrediction(fixIndex: number, altitude: number): boolean {
    if (fixIndex >= this.options.numberOfFixes) {
      return false;
    }

    const data = this.fixInfos[fixIndex];
    data.predictedAltitude = altitude;
    data.predictedTime = null;

    this.writeFixInfoToUserData();
    this.needPredictionsUpdate = true;

    return true;
  }

  /**
   * Clear the time or altitude to predict along-track location for.
   * @param fixIndex Index of the fix info/page (0-based).
   * @returns true if the operation succeeded.
   */
  public clearPrediction(fixIndex: number): boolean {
    if (fixIndex >= this.options.numberOfFixes) {
      return false;
    }

    const data = this.fixInfos[fixIndex];
    data.predictedAltitude = null;
    data.predictedTime = null;

    this.writeFixInfoToUserData();
    this.needPredictionsUpdate = true;

    return true;
  }

  /**
   * Attempts to find the closest abeam intersection and saves it on this fix info
   * @param fixIndex of the fix info/page (0-based).
   * @returns true if an intersection was found, false otherwise
   */
  public createAbeamPoint(fixIndex: number): Promise<boolean> {
    const fixInfo = this.fixInfos[fixIndex];
    if (!fixInfo) {
      return Promise.resolve(false);
    }

    fixInfo.calculateAbeamPoint = true;
    this.needIntersectionsUpdate = true;
    this.needPredictionsUpdate = true;

    this.writeFixInfoToUserData();

    // await calculation so we can check for success
    return new Promise((resolve) => {
      this.pendingIntersectionCalculateHandlers.push(() => {
        // this flag is reset by checkAbeamPoints if there is no intersection
        resolve(fixInfo.calculateAbeamPoint);
      });
    });
  }

  /**
   * Removes the abeam fix calculation.
   * @param fixIndex of the fix info/page (0-based).
   * @returns true on success
   */
  public deleteAbeamPoint(fixIndex: number): boolean {
    const fixInfo = this.fixInfos[fixIndex];
    if (!fixInfo) {
      return false;
    }

    fixInfo.calculateAbeamPoint = false;
    this.needIntersectionsUpdate = true;
    this.needPredictionsUpdate = true;

    this.writeFixInfoToUserData();

    return true;
  }

  /**
   * Get the calculated data for CDU page rendering
   * @param fixIndex Index of the fix info/page (0-based).
   * @returns the calculated data
   */
  public getCalculatedData(fixIndex: number): WT21FixInfoCalculatedData | undefined {
    return this.calculatedData[fixIndex];
  }

  /**
   * Get the entered data for CDU page rendering
   * @param fixIndex Index of the fix info/page (0-based).
   * @returns the entered data
   */
  public getEnteredData(fixIndex: number): WT21FixInfoData | undefined {
    return this.fixInfos[fixIndex];
  }

  /**
   * Gets the fix infos of a flight plan
   * @param planIndex the flight plan index
   * @returns the fix infos, or undefined
   */
  private getFlightPlanFixInfos(planIndex: number): WT21FixInfoFlightPlanData[] | undefined {
    const plan = this.flightPlanner.getFlightPlan(planIndex);

    return plan.getUserData<WT21FixInfoFlightPlanData[]>(WT21FmsUtils.USER_DATA_KEY_FIX_INFO);
  }

  /**
   * Sets the fix infos of a flight plan
   * **Note:** This method is not meant to be used by front-end clients. Use `WT21FixInfo` instead
   * @param planIndex the plan index to use
   * @param fixInfos the fix info data
   */
  private setFlightPlanFixInfos(planIndex: number, fixInfos: readonly WT21FixInfoFlightPlanData[]): void {
    const plan = this.flightPlanner.getFlightPlan(planIndex);

    plan.setUserData(WT21FmsUtils.USER_DATA_KEY_FIX_INFO, fixInfos);
  }

  /**
   * Get the number of fixes supported by this manager.
   * @returns The number of fixes.
   */
  public getNumberOfFixes(): number {
    return this.options.numberOfFixes;
  }
}
