import { ClockEvents, ConsumerSubject, EventBus, Facility, MagVar, MathUtils, NavMath, Subject, Subscription, UnitType } from '@microsoft/msfs-sdk';
import { FixInfoRef, WT21FixInfoPageStore } from './FixInfoPageStore';
import { WT21Fms } from '../../../Shared/FlightPlan/WT21Fms';
import { WT21FixInfoEvents } from '../../Systems/WT21FixInfoManager';
import { FmcPage } from '../../Framework/FmcPage';
import { FmcPageManager } from '../../Framework/FmcPageManager';

/** Fix Info page controller */
export class WT21FixInfoPageController {
  /** current page number, 1-based */
  public readonly currentPage = Subject.create(1);
  /** current page index, 0-based */
  public readonly currentPageIndex = this.currentPage.map((p) => p - 1);
  /** total number of pages */
  public readonly pageCount = Subject.create(0);

  /** sim time as a unix timestamp in milliseconds */
  public readonly simTime = ConsumerSubject.create(null, 0);

  public readonly transitionAltitudeOrLevel = this.fms.activePerformancePlan.transitionAltitude;

  private readonly subs: Subscription[] = [];

  /**
   * Instantiates a new instance of the controller
   * @param bus Event Bus
   * @param fms WT21 FMS
   * @param store Fix Info page store
   * @param page Fix Info page
   * @param pageManager FMC page manager.
   */
  constructor(
    private readonly bus: EventBus,
    private readonly fms: WT21Fms,
    private readonly store: WT21FixInfoPageStore,
    private readonly page: FmcPage,
    private readonly pageManager: FmcPageManager) {}

  /** Initialise this instance of the controller */
  init(): void {
    this.simTime.setConsumer(this.bus.getSubscriber<ClockEvents>().on('simTime'));

    this.subs.push(this.bus.getSubscriber<WT21FixInfoEvents>().on('fix_info_calculated').handle(this.onFixInfoCalculated.bind(this)));
    this.store.activeRouteExists.set(true);
    this.subs.push(this.transitionAltitudeOrLevel.sub(() => this.page.invalidate()));

    this.pageCount.set(this.fms.fixInfo.getNumberOfFixes());
  }

  /**
   * Handle FMS fix info calculate events
   * @param fixIndex Index of the fix info updated (0-based)
   */
  private onFixInfoCalculated(fixIndex: number): void {
    if (fixIndex === this.currentPageIndex.get()) {
      this.readDataFromFms();
    }
  }

  /** Read data for the page from the FMS*/
  private readDataFromFms(): void {
    const calculated = this.fms.fixInfo.getCalculatedData(this.currentPageIndex.get());
    const entered = this.fms.fixInfo.getEnteredData(this.currentPageIndex.get());
    if (!calculated || !entered) {
      this.store.erasePageData();
      return;
    }
    this.store.currentFixIdent.set(calculated.fixIdent);

    this.store.currentAbeamPointCalculated = calculated.abeamCalculated;

    const [pilotRad, pilotDis] = entered.bearingDistances[0];
    const [pilotLat, pilotLon] = entered.latitudeLongitudes[0];
    if (calculated.abeamCalculated && calculated.abeamPredictions.bearing !== null && calculated.abeamPredictions.distance !== null) {
      // abeam intersection
      this.store.currentRef.set(FixInfoRef.Abeam);
      this.store.currentRadCross.set([calculated.abeamPredictions.bearing, false]);
      const distanceNM = calculated.abeamPredictions.distance !== null ? UnitType.NMILE.convertFrom(calculated.abeamPredictions.distance, UnitType.METER) : null;
      this.store.currentDisCross.set([distanceNM, false]);
      const dtgNM = calculated.abeamPredictions.dtg !== null ? UnitType.NMILE.convertFrom(calculated.abeamPredictions.dtg, UnitType.METER) : null;
      this.store.currentRefCrsDist.set([null, dtgNM]);
      this.store.currentLatCross.set([null, false]);
      this.store.currentLonCross.set([null, false]);
    } else if (calculated.bearingDistancePredictions[0].bearing !== null && calculated.bearingDistancePredictions[0].distance !== null) {
      // rad or dis cross along track intersection
      this.store.currentRef.set(FixInfoRef.AlongTrack);
      this.store.currentRadCross.set([calculated.bearingDistancePredictions[0].bearing, pilotRad !== null]);
      const distanceNM = calculated.bearingDistancePredictions[0].distance !== null
        ? UnitType.NMILE.convertFrom(calculated.bearingDistancePredictions[0].distance, UnitType.METER)
        : null;
      this.store.currentDisCross.set([distanceNM, pilotDis !== null]);
      const dtgNM = calculated.bearingDistancePredictions[0].dtg !== null ? UnitType.NMILE.convertFrom(calculated.bearingDistancePredictions[0].dtg, UnitType.METER) : null;
      this.store.currentRefCrsDist.set([null, dtgNM]);
      this.store.currentLatCross.set([null, false]);
      this.store.currentLonCross.set([null, false]);
    } else if (calculated.latitudeLongitudePredictions[0].latitude !== null && calculated.latitudeLongitudePredictions[0].longitude !== null) {
      // lat/lon cross along track intersection
      this.store.currentRef.set(FixInfoRef.AlongTrack);
      this.store.currentRadCross.set([null, false]);
      this.store.currentDisCross.set([null, false]);
      const dtgNM = calculated.latitudeLongitudePredictions[0].dtg !== null ? UnitType.NMILE.convertFrom(calculated.latitudeLongitudePredictions[0].dtg, UnitType.METER) : null;
      this.store.currentRefCrsDist.set([null, dtgNM]);
      this.store.currentLatCross.set([calculated.latitudeLongitudePredictions[0].latitude, pilotLat !== null]);
      this.store.currentLonCross.set([calculated.latitudeLongitudePredictions[0].longitude, pilotLon !== null]);
    } else {
      // no other intersection... direct to fix data
      this.store.currentRef.set(FixInfoRef.Direct);
      this.store.currentRadCross.set([pilotRad !== null ? MagVar.trueToMagnetic(pilotRad, entered.fixMagVar) : null, pilotRad !== null]);
      const distanceNM = pilotDis !== null ? UnitType.NMILE.convertFrom(pilotDis, UnitType.METER) : null;
      this.store.currentDisCross.set([distanceNM, pilotDis !== null]);
      this.store.currentRefCrsDist.set([
        calculated.fixBearing !== null ? NavMath.normalizeHeading(calculated.fixBearing + 180) : null,
        calculated.fixDistance !== null ? UnitType.NMILE.convertFrom(calculated.fixDistance, UnitType.METER) : null
      ]);
      this.store.currentLatCross.set([pilotLat, pilotLat !== null]);
      this.store.currentLonCross.set([pilotLon, pilotLon !== null]);
    }

    this.page.invalidate();
  }

  /** Pause the controller and it's subscriptions */
  pause(): void {
    this.subs.forEach((sub) => sub.pause());
    this.simTime.pause();
  }

  /** Resume the controller and it's subscriptions */
  resume(): void {
    this.simTime.resume();
    this.subs.forEach((sub) => sub.resume(true));
    this.readDataFromFms();
  }

  /** Advance to the next page */
  next(): void {
    if (this.currentPage.get() < this.pageCount.get()) {
      this.setCurrentPage(this.currentPage.get() + 1);
    } else {
      this.setCurrentPage(1);
    }
  }

  /** Go back to the previous page */
  previous(): void {
    if (this.currentPage.get() > 1) {
      this.setCurrentPage(this.currentPage.get() - 1);
    } else {
      this.setCurrentPage(this.pageCount.get());
    }
  }

  /**
   * Set the current page
   * @param page page number, 1-based
   */
  setCurrentPage(page: number): void {
    this.currentPage.set(MathUtils.clamp(page, 1, this.pageCount.get()));
    this.readDataFromFms();
  }

  /**
   * Get a fix from a scratchpad entry
   * @param input any valid fix format
   */
  public async getFix(input: string): Promise<Facility | null> {
    const selectedFacility = await this.pageManager.selectWptFromIdent(input, this.fms.ppos);
    if (selectedFacility !== null) {
      return selectedFacility;
    }

    return Promise.reject('FACILITY NOT FOUND');
  }

  /**
   * Set the current page fix
   * @param fix Facility
   */
  public setCurrentFix(fix: Facility): void {
    this.deleteLatLonCross();
    this.fms.fixInfo.setFix(this.currentPageIndex.get(), fix);
  }

  /**
   * Delete the current page fix
   * @throws Help window message if needed
   * @returns true
   */
  public deleteCurrentFix(): boolean {
    this.fms.fixInfo.clearFix(this.currentPageIndex.get());
    return true;
  }

  /**
   * Set the bearing/distance for a row; either bearing or dist is mandatory.
   * Null entries will be computed.
   * @param bearing bearing in degrees magnetic or true depending on current ref
   * @param dist distance in nautical miles
   * @returns true if an intersection was found.
   */
  public setRadDisCross(bearing: number | null, dist: number | null): Promise<boolean> {
    this.deleteAbeamPoint();
    this.deleteLatLonCross();
    return this.fms.fixInfo.setBearingDistance(this.currentPageIndex.get(), 0, bearing, dist !== null ? UnitType.METER.convertFrom(dist, UnitType.NMILE) : null);
  }

  /**
   * Delete the bearing/distance for a row
   * Null entries will be computed.
   */
  public deleteRadDisCross(): void {
    this.fms.fixInfo.clearBearingDistance(this.currentPageIndex.get(), 0);
  }

  /**
   * Set the bearing/distance for a row; either bearing or dist is mandatory.
   * Null entries will be computed.
   * @param latitude Latitude in degrees or null to compute.
   * @param longitude Longitude in degrees or null to compute.
   * @returns true if an intersection was found.
   */
  public setLatLonCross(latitude: number | null, longitude: number | null): Promise<boolean> {
    this.deleteAbeamPoint();
    this.deleteRadDisCross();
    this.deleteCurrentFix();
    return this.fms.fixInfo.setLatitudeLongitude(this.currentPageIndex.get(), 0, latitude, longitude);
  }

  /**
   * Delete the bearing/distance for a row
   * Null entries will be computed.
   */
  public deleteLatLonCross(): void {
    this.fms.fixInfo.clearLatitudeLongitude(this.currentPageIndex.get(), 0);
  }

  /**
   * Creates the abeam point
   * @returns true on success
   */
  public createAbeamPoint(): Promise<boolean> {
    this.deleteRadDisCross();
    this.deleteLatLonCross();
    return this.fms.fixInfo.createAbeamPoint(this.currentPageIndex.get());
  }

  /**
   * Deletes the abeam point
   * @returns true on success
   */
  public deleteAbeamPoint(): boolean {
    return this.fms.fixInfo.deleteAbeamPoint(this.currentPageIndex.get());
  }
}
