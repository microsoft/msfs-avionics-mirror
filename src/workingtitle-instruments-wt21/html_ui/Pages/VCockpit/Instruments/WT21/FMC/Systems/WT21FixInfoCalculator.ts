import {
  ClockEvents, ConsumerValue, EventBus, FlightPathUtils, FlightPlan, FlightPlanPredictionsProvider, GeoCircle, GeoPoint, GNSSEvents, LegDefinition, LNavEvents,
  MagVar, MathUtils, Subject, UnitType, Vec3Math,
} from '@microsoft/msfs-sdk';
import { BearingDistPredictions, WT21FixInfoCalculatedData, WT21FixInfoData, FlightPlanIntersection, LatLonPredictions } from './WT21FixInfoData';
import { FmsPosEvents } from '../FmsPos';

/** A calculator for fix info intersections and predictions data */
export class WT21FixInfoCalculator {
  private static readonly vec3Cache = [Vec3Math.create(), Vec3Math.create(), Vec3Math.create(), Vec3Math.create(), Vec3Math.create()];

  private static geoCircleCache = [new GeoCircle(this.vec3Cache[0], 0), new GeoCircle(this.vec3Cache[0], 0)];

  private static geoPointCache = [new GeoPoint(0, 0), new GeoPoint(0, 0), new GeoPoint(0, 0)];

  /** sim time as a unix timestamp in milliseconds */
  private readonly simTime = ConsumerValue.create(null, 0);

  private readonly ppos = new GeoPoint(0, 0);

  /** global leg index of the current lnav leg */
  private readonly activeLegIndex = ConsumerValue.create(null, 0);

  /** distance to go on the active leg in nautical miles */
  private readonly activeLegDtg = ConsumerValue.create(null, 0);

  /** FIXME hook up when true ref exists */
  public readonly trueRef = Subject.create(false);

  /** Whether FMS position is currently available */
  private readonly fmsPositionAvailable = ConsumerValue.create(null, false);

  /**
   * Instantiates a Fix Info Calculator
   * @param bus The event bus
   * @param maxDistance Maximum distance in metres
   * @param activeRoutePredictor The active route predictor
   */
  constructor(
    private readonly bus: EventBus,
    private readonly maxDistance: number,
    private readonly activeRoutePredictor?: FlightPlanPredictionsProvider,
  ) {
    this.simTime.setConsumer(this.bus.getSubscriber<ClockEvents>().on('simTime'));
    this.fmsPositionAvailable.setConsumer(this.bus.getSubscriber<FmsPosEvents>().on('fms_pos_valid'));
    this.bus.getSubscriber<GNSSEvents>().on('gps-position').atFrequency(1).handle(pos => this.ppos.set(pos.lat, pos.long));
    this.activeLegIndex.setConsumer(this.bus.getSubscriber<LNavEvents>().on('lnav_tracked_leg_index'));
    this.activeLegDtg.setConsumer(this.bus.getSubscriber<LNavEvents>().on('lnav_leg_distance_remaining'));
  }

  /**
   * Calculates the time or altitude distance prediction
   * @param plan Active flight plan
   * @param fixInfo The pilot-entered input data
   * @param calcData Output data for the CDU page
   */
  public calculateEtaAltitudePrediction(plan: FlightPlan, fixInfo: WT21FixInfoData, calcData: WT21FixInfoCalculatedData): void {
    // calculate predicted distance to altitude or time
    if (this.activeRoutePredictor && fixInfo.predictedTime !== null && fixInfo.predictedTime > this.simTime.get()) {
      const prediction = this.activeRoutePredictor.getPredictionsForTime(fixInfo.predictedTime / 1000, true);
      calcData.etaAltitudePrediction = prediction && isFinite(prediction.distance) ? prediction.distance : null;
      if (calcData.etaAltitudePrediction !== null) {
        this.calculatePointFromDistanceAlongPlan(plan, calcData.etaAltitudePrediction, fixInfo.etaAltitudePoint);
      } else {
        fixInfo.etaAltitudePoint.set(NaN, NaN);
      }
    } else if (this.activeRoutePredictor && fixInfo.predictedAltitude !== null) {
      const prediction = this.activeRoutePredictor.getPredictionsForAltitude(fixInfo.predictedAltitude, true);
      calcData.etaAltitudePrediction = prediction && isFinite(prediction.distance) ? prediction.distance : null;
      if (calcData.etaAltitudePrediction !== null) {
        this.calculatePointFromDistanceAlongPlan(plan, calcData.etaAltitudePrediction, fixInfo.etaAltitudePoint);
      } else {
        fixInfo.etaAltitudePoint.set(NaN, NaN);
      }
    } else {
      calcData.etaAltitudePrediction = null;
      fixInfo.etaAltitudePoint.set(NaN, NaN);
    }
  }

  /**
   * Calculate a point along the flight plan given a distance relative to the active leg (i.e. from WT21FlightPlanPredictionsProvider)
   * @param plan Active flight plan
   * @param distance Distance along the plan in metres
   * @param out GeoPoint to write the result to
   * @todo Easier to calculate this in the predictions provider interpolation functions.. move code there and refactor
   * @returns The GeoPoint given as {@link out}, set to NaN/NaN if no point could be calculated
   */
  private calculatePointFromDistanceAlongPlan(plan: FlightPlan, distance: number, out: GeoPoint): GeoPoint {
    const activeLeg = plan.tryGetLeg(this.activeLegIndex.get());
    if (!activeLeg || !activeLeg.calculated) {
      out.set(NaN, NaN);
      return out;
    }

    const pposCumulativeDistance = activeLeg.calculated.cumulativeDistanceWithTransitions - UnitType.METER.convertFrom(this.activeLegDtg.get(), UnitType.NMILE);

    for (const leg of plan.legs(false, this.activeLegIndex.get())) {
      if (!leg.calculated) {
        break;
      }

      if (distance <= (leg.calculated.cumulativeDistanceWithTransitions ?? 0)) {
        const legStartDistance = leg.calculated.cumulativeDistanceWithTransitions - leg.calculated.distanceWithTransitions - pposCumulativeDistance;
        if (legStartDistance >= distance) {
          break;
        }

        let accumulatedVectorDistance = 0;
        for (const vector of leg.calculated.flightPath) {
          const desiredDistanceAlongVector = distance - legStartDistance - accumulatedVectorDistance;
          if (desiredDistanceAlongVector <= vector.distance) {
            const vecCircle = FlightPathUtils.setGeoCircleFromVector(vector, WT21FixInfoCalculator.geoCircleCache[0]);
            const vecStart = WT21FixInfoCalculator.geoPointCache[0].set(vector.startLat, vector.startLon);
            const point = vecCircle.offsetDistanceAlong(
              vecStart,
              UnitType.GA_RADIAN.convertFrom(desiredDistanceAlongVector, UnitType.METER),
              WT21FixInfoCalculator.vec3Cache[0],
              MathUtils.HALF_PI,
            );
            out.setFromCartesian(point);
            return out;
          }
          accumulatedVectorDistance += vector.distance;
        }
      }
    }

    out.set(NaN, NaN);

    return out;
  }

  /**
   * Calculates fix info predictions and intersections
   * @param plan Active flight plan
   * @param fixInfo The pilot-entered input data
   * @param calcData Output data for the CDU page
   */
  public calculateFixPredictions(plan: FlightPlan, fixInfo: WT21FixInfoData, calcData: WT21FixInfoCalculatedData): void {
    if (!plan) {
      this.clearCalculatedFixData(calcData);
      return;
    }

    for (const [i, intersection] of fixInfo.latitudeLongitudeIntersections.entries()) {
      const predictions = calcData.latitudeLongitudePredictions[i];
      this.predictIntersection(plan, fixInfo, intersection, predictions);
    }

    if (fixInfo.fix === null) {
      this.clearCalculatedFixData(calcData, true);
      return;
    }

    calcData.fixIdent = fixInfo.fixIdent;

    // calculate the bearing/distance from the fix to ppos
    if (this.fmsPositionAvailable.get()) {
      calcData.fixDistance = MathUtils.clamp(
        UnitType.GA_RADIAN.convertTo(this.ppos.distance(fixInfo.fix.lat, fixInfo.fix.lon), UnitType.METER),
        0, this.maxDistance,
      );
      const trueBearing = this.ppos.bearingFrom(fixInfo.fix.lat, fixInfo.fix.lon);
      calcData.fixBearing = this.trueRef.get() ? trueBearing : MagVar.trueToMagnetic(trueBearing, fixInfo.fixMagVar);
    } else {
      calcData.fixDistance = null;
      calcData.fixBearing = null;
    }

    calcData.abeamCalculated = fixInfo.calculateAbeamPoint;
    this.predictIntersection(plan, fixInfo, fixInfo.abeamIntersection, calcData.abeamPredictions);

    for (const [i, intersection] of fixInfo.bearingDistanceIntersections.entries()) {
      const predictions = calcData.bearingDistancePredictions[i];
      this.predictIntersection(plan, fixInfo, intersection, predictions);
    }
  }

  /**
   * Clear all the calculated data from the object
   * @param calcData Calculated data object
   * @param skipLatLon Whether to skip clearing of lat/lon intersection data.
   */
  private clearCalculatedFixData(calcData: WT21FixInfoCalculatedData, skipLatLon = false): void {
    calcData.abeamPredictions.bearing = null;
    calcData.abeamPredictions.distance = null;
    calcData.abeamPredictions.eta = null;
    calcData.abeamPredictions.dtg = null;
    calcData.abeamPredictions.altitude = null;

    calcData.bearingDistancePredictions.forEach((p) => {
      p.bearing = null;
      p.distance = null;
      p.eta = null;
      p.dtg = null;
      p.altitude = null;
    });

    if (!skipLatLon) {
      calcData.latitudeLongitudePredictions.forEach((p) => {
        p.latitude = null;
        p.longitude = null;
        p.eta = null;
        p.dtg = null;
        p.altitude = null;
      });
    }

    calcData.fixBearing = null;
    calcData.fixDistance = null;
    calcData.fixIdent = null;
  }

  /**
   * Predict the bearing/distance/eta/dtg/altitude for a flight plan intersection
   * @param plan Flight plan
   * @param fixInfo Fix Info
   * @param intersection Intersection to predict
   * @param predictions Object to store the results
   */
  private predictIntersection(plan: FlightPlan, fixInfo: WT21FixInfoData, intersection: FlightPlanIntersection, predictions: BearingDistPredictions | LatLonPredictions): void {
    if (!this.fmsPositionAvailable.get() || !this.isIntersectionValid(intersection)) {
      this.resetIntersectionPrediction(predictions);
      return;
    }

    const distanceFromPpos = this.calculateDistanceFromPpos(plan, intersection);

    const prediction = distanceFromPpos !== null ? this.activeRoutePredictor?.getPredictionsForDistance(distanceFromPpos, true) : undefined;
    if (prediction?.valid && isFinite(prediction.estimatedTimeOfArrival) && isFinite(prediction.distance) && isFinite(prediction.altitude)) {
      predictions.eta = prediction.estimatedTimeOfArrival * 1000;
      predictions.dtg = prediction.distance;
      predictions.altitude = prediction.altitude;
    } else {
      this.resetIntersectionPrediction(predictions);
      // dtg is still filled if possible
      if (distanceFromPpos !== null) {
        predictions.dtg = distanceFromPpos;
      }
    }
  }

  /**
   * Reset on intersection prediction object to empty values
   * @param predictions Object to store the results
   */
  private resetIntersectionPrediction(predictions: BearingDistPredictions | LatLonPredictions): void {
    predictions.eta = null;
    predictions.dtg = null;
    predictions.altitude = null;
  }

  /**
   * Checks if an intersection is valid
   * @param intersection Flight plan intersection data
   * @returns true if the intersection is valid/calculated
   */
  public isIntersectionValid(intersection: FlightPlanIntersection): boolean {
    return intersection.distanceAlongLeg !== null && intersection.flightPlanLeg !== null;
  }

  /**
   * Calculate the cumulative distance for a distance along a flight plan leg
   * @param plan Flight plan
   * @param intersection Intersection to predict
   * @returns distance in metres or null
   */
  private calculateDistanceFromPpos(plan: FlightPlan, intersection: FlightPlanIntersection): number | null {
    if (intersection.flightPlanLeg === null || intersection.distanceAlongLeg === null) {
      return null;
    }

    const leg = plan.tryGetLeg(intersection.flightPlanLeg);
    if (!leg || !leg.calculated) {
      return null;
    }

    const activeLeg = plan.tryGetLeg(this.activeLegIndex.get());
    if (!activeLeg || !activeLeg.calculated) {
      return null;
    }

    const pposCumulativeDistance = activeLeg.calculated.cumulativeDistanceWithTransitions - UnitType.METER.convertFrom(this.activeLegDtg.get(), UnitType.NMILE);

    return leg.calculated.cumulativeDistanceWithTransitions - leg.calculated.distanceWithTransitions + intersection.distanceAlongLeg - pposCumulativeDistance;
  }

  /**
   * Reset a flight plan intersection bearing and distance to null values
   * @param predictions The predictions object to reset bearing/distance on
   */
  private resetIntersectionBearingDistance(predictions: BearingDistPredictions): void {
    predictions.bearing = null;
    predictions.distance = null;
  }

  /**
   * Calculate the bearing and distance from the fix info fix to a flight plan intersection point
   * @param fixInfo The fix info this relates to
   * @param intersection The flight plan ntersection
   * @param predictions The predictions object for output
   * @param pilotBearing Pilot entered bearing in true degrees or null if none
   * @param pilotDistance Pilot entered distance in metres or null if none
   */
  private calculateIntersectionBearingDistance(
    fixInfo: WT21FixInfoData,
    intersection: FlightPlanIntersection,
    predictions: BearingDistPredictions,
    pilotBearing: number | null = null,
    pilotDistance: number | null = null,
  ): void {
    let trueBearing = pilotBearing;
    let distance = pilotDistance;
    if (this.isIntersectionValid(intersection)) {
      if (trueBearing === null) {
        trueBearing = fixInfo.fixLocationSpherical.bearingTo(intersection.point);
      }
      if (distance === null) {
        distance = UnitType.METER.convertFrom(fixInfo.fixLocationSpherical.distance(intersection.point), UnitType.GA_RADIAN);
      }
    }
    predictions.bearing = this.trueRef.get() || trueBearing === null ? trueBearing : MagVar.trueToMagnetic(trueBearing, fixInfo.fixMagVar);
    predictions.distance = distance;
  }

  /**
   * Calculate the latitude/longitude of a flight plan intersection point
   * @param intersection The flight plan ntersection
   * @param predictions The predictions object for output
   * @param pilotLatitude Pilot entered latitude in degrees or null if none
   * @param pilotLongitude Pilot entered longitude in degrees or null if none
   */
  private calculateIntersectionLatLon(
    intersection: FlightPlanIntersection,
    predictions: LatLonPredictions,
    pilotLatitude: number | null = null,
    pilotLongitude: number | null = null,
  ): void {
    predictions.latitude = pilotLatitude;
    predictions.longitude = pilotLongitude;

    if (this.isIntersectionValid(intersection)) {
      // we prefer to keep the pilot entries to avoid unexpected rounding
      if (predictions.latitude === null) {
        predictions.latitude = intersection.point.lat;
      }
      if (predictions.longitude === null) {
        predictions.longitude = intersection.point.lon;
      }
    }
  }

  /**
   * Calculates the bearings and distances from the fix to flight plan intersections
   * @param fixInfos All of the fix infos
   * @param calcDatas Corresponding calculated data objects
   */
  public calculateIntersectionBearingDistances(fixInfos: WT21FixInfoData[], calcDatas: WT21FixInfoCalculatedData[]): void {
    for (const [i, fixInfo] of fixInfos.entries()) {
      const calcData = calcDatas[i];
      if (fixInfo.calculateAbeamPoint) {
        this.calculateIntersectionBearingDistance(fixInfo, fixInfo.abeamIntersection, calcData.abeamPredictions);
      } else {
        this.resetIntersectionBearingDistance(calcData.abeamPredictions);
      }

      for (const [j, intersection] of fixInfo.bearingDistanceIntersections.entries()) {
        const [pilotBearing, pilotDistance] = fixInfo.bearingDistances[j];
        this.calculateIntersectionBearingDistance(fixInfo, intersection, calcData.bearingDistancePredictions[j], pilotBearing, pilotDistance);
      }

      for (const [j, intersection] of fixInfo.latitudeLongitudeIntersections.entries()) {
        const [pilotLatitude, pilotLongitude] = fixInfo.latitudeLongitudes[j];
        this.calculateIntersectionLatLon(intersection, calcData.latitudeLongitudePredictions[j], pilotLatitude, pilotLongitude);
      }
    }
  }

  /**
   * Clear data from a calculated flight plan intersection
   * @param intersection Flight plan intersection object to clear
   */
  public clearIntersection(intersection: FlightPlanIntersection): void {
    intersection.distanceAlongLeg = null;
    intersection.flightPlanLeg = null;
  }

  /**
   * Clear data from a calculated flight plan intersection
   * @param fixInfo The fix info to clear
   */
  public clearFixIntersections(fixInfo: WT21FixInfoData): void {
    this.clearIntersection(fixInfo.abeamIntersection);
    for (const intersection of fixInfo.bearingDistanceIntersections) {
      this.clearIntersection(intersection);
    }
    for (const intersection of fixInfo.latitudeLongitudeIntersections) {
      this.clearIntersection(intersection);
    }
  }

  /**
   * Reset flight plan intersections to null values for all fix infos
   * @param fixInfos All of the fix infos
   */
  private clearAllFixIntersections(fixInfos: WT21FixInfoData[]): void {
    for (const fixInfo of fixInfos) {
      this.clearFixIntersections(fixInfo);
    }
  }

  /**
   * Calculates intersections with the active flight plan for fix infos
   * @param plan The active flight plan
   * @param fixInfos All of the fix infos
   */
  public calculateAllIntersections(plan: FlightPlan, fixInfos: WT21FixInfoData[]): void {
    this.clearAllFixIntersections(fixInfos);

    if (plan.length < 2) {
      return;
    }

    for (let globalLegIndex = this.activeLegIndex.get(); ; globalLegIndex++) {
      const leg = plan.tryGetLeg(globalLegIndex);
      if (!leg) {
        break;
      }
      const allIntersectionsFound = this.calculateIntersectionsForLeg(leg, globalLegIndex, globalLegIndex === this.activeLegIndex.get(), fixInfos);
      if (allIntersectionsFound) {
        return;
      }
    }
  }

  /**
   * Calculates intersections with the flightplan for the given set of fix infos, where intersections don't already exist
   * @param leg Flight plan leg to intersect
   * @param globalLegIndex Index of this leg
   * @param isActiveLeg Is this the current active leg?
   * @param fixInfos The fix infos that should try to intersect the vector
   * @returns true if there are no remaining intersections to find
   */
  private calculateIntersectionsForLeg(leg: LegDefinition, globalLegIndex: number, isActiveLeg: boolean, fixInfos: WT21FixInfoData[]): boolean {
    if (!leg.calculated || leg.calculated.flightPath.length < 1) {
      return false;
    }

    const pposDistanceAlongLeg = isActiveLeg ? leg.calculated.distanceWithTransitions - UnitType.METER.convertFrom(this.activeLegDtg.get(), UnitType.NMILE) : undefined;
    let remainingIntersections = false;
    let accumulatedDistance = 0;

    for (const vector of leg.calculated.flightPath) {
      // make a great circle through the centre of the flight path arc, and the fix... find intercepts with the flight path circle
      const vectorCircle = FlightPathUtils.setGeoCircleFromVector(vector, WT21FixInfoCalculator.geoCircleCache[0]);
      const vectorStart = WT21FixInfoCalculator.geoPointCache[0].set(vector.startLat, vector.startLon);
      const vectorEnd = WT21FixInfoCalculator.geoPointCache[1].set(vector.endLat, vector.endLon);
      const vectorDistance = FlightPathUtils.getAlongArcSignedDistance(vectorCircle, vectorStart, vectorEnd, vectorEnd);

      for (const fixInfo of fixInfos) {
        for (const [i, [pilotLatitude, pilotLongitude]] of fixInfo.latitudeLongitudes.entries()) {
          if (this.isIntersectionValid(fixInfo.latitudeLongitudeIntersections[i])) {
            continue;
          }

          let latLonCircle: GeoCircle | undefined;

          // intersections are only calculated if pilot enteres either bearing *or* distance, not both
          if (pilotLatitude !== null && pilotLongitude === null) {
            latLonCircle = this.calculateLatitudeCrossingCircle(pilotLatitude);
          } else if (pilotLatitude === null && pilotLongitude !== null) {
            latLonCircle = this.calculateLongitudeCrossingCircle(pilotLongitude);
          } else {
            continue;
          }

          if (!this.calculateFlightPathIntersection(
            globalLegIndex,
            accumulatedDistance,
            pposDistanceAlongLeg,
            vectorDistance,
            latLonCircle,
            vectorCircle,
            vectorStart,
            vectorEnd,
            fixInfo.latitudeLongitudeIntersections[i],
          )) {
            remainingIntersections = true;
          }
        }

        // need a fix set for abeam and bearing/distance
        if (fixInfo.fix === null) {
          continue;
        }

        if (fixInfo.calculateAbeamPoint && !this.isIntersectionValid(fixInfo.abeamIntersection)) {
          const abeamCircle = this.calculateAbeamCircle(fixInfo, vectorCircle);
          if (!this.calculateFlightPathIntersection(
            globalLegIndex,
            accumulatedDistance,
            pposDistanceAlongLeg,
            vectorDistance,
            abeamCircle,
            vectorCircle,
            vectorStart,
            vectorEnd,
            fixInfo.abeamIntersection,
          )) {
            remainingIntersections = true;
          }
        }

        for (const [i, [pilotBearing, pilotDistance]] of fixInfo.bearingDistances.entries()) {
          if (this.isIntersectionValid(fixInfo.bearingDistanceIntersections[i])) {
            continue;
          }

          let bearingDistanceCircle: GeoCircle | undefined;

          // intersections are only calculated if pilot enteres either bearing *or* distance, not both
          if (pilotBearing !== null && pilotDistance === null) {
            bearingDistanceCircle = this.calculateFixBearingCircle(fixInfo, pilotBearing);
          } else if (pilotBearing === null && pilotDistance !== null) {
            bearingDistanceCircle = this.calculateFixDistanceCircle(fixInfo, pilotDistance);
          } else {
            continue;
          }

          if (!this.calculateFlightPathIntersection(
            globalLegIndex,
            accumulatedDistance,
            pposDistanceAlongLeg,
            vectorDistance,
            bearingDistanceCircle,
            vectorCircle,
            vectorStart,
            vectorEnd,
            fixInfo.bearingDistanceIntersections[i],
          )) {
            remainingIntersections = true;
          }
        }
      }

      if (!remainingIntersections) {
        break;
      }

      accumulatedDistance += vectorDistance;
    }

    return !remainingIntersections;
  }

  /**
   * Create a great circle from a fix info fix through the centre of a flight path vector circle
   * @param fixInfo A fix info
   * @param pathCircle A flight path vector circle
   * @returns A great circle
   */
  private calculateAbeamCircle(fixInfo: WT21FixInfoData, pathCircle: GeoCircle): GeoCircle {
    return WT21FixInfoCalculator.geoCircleCache[1].setAsGreatCircle(fixInfo.fixLocationCartesian, pathCircle.center);
  }

  /**
   * Create a great circle from a fix info fix at a true bearing
   * @param fixInfo A fix info
   * @param bearing Bearing from the fix info in true degrees
   * @returns A great circle
   */
  private calculateFixBearingCircle(fixInfo: WT21FixInfoData, bearing: number): GeoCircle {
    return WT21FixInfoCalculator.geoCircleCache[1].setAsGreatCircle(fixInfo.fixLocationCartesian, bearing);
  }

  /**
   * Create a small circle around a fix info fix at a given radius/distance
   * @param fixInfo A fix info
   * @param distance Distance from the fix info in metres
   * @returns A small circle
   */
  private calculateFixDistanceCircle(fixInfo: WT21FixInfoData, distance: number): GeoCircle {
    return WT21FixInfoCalculator.geoCircleCache[1].set(fixInfo.fixLocationCartesian, UnitType.GA_RADIAN.convertFrom(distance, UnitType.METER));
  }

  /**
   * Create a great circle for a latitude crossing
   * @param latitude Latitude in degrees
   * @returns A great circle
   */
  private calculateLatitudeCrossingCircle(latitude: number): GeoCircle {
    // create a small circle centred on the pole
    const latitudePoint = WT21FixInfoCalculator.geoPointCache[2];
    if (latitude < 0) {
      // south pole
      WT21FixInfoCalculator.geoPointCache[2].set(-90, 0);
    } else {
      // north pole
      WT21FixInfoCalculator.geoPointCache[2].set(90, 0);
    }
    return WT21FixInfoCalculator.geoCircleCache[1].set(latitudePoint, (1 - Math.abs(latitude / 90)) * Math.PI / 2);
  }

  /**
   * Create a great circle for a longitude crossing
   * @param longitude Latitude in degrees
   * @returns A great circle
   */
  private calculateLongitudeCrossingCircle(longitude: number): GeoCircle {

    const longitudePoint = WT21FixInfoCalculator.geoPointCache[2].set(0, longitude);
    return WT21FixInfoCalculator.geoCircleCache[1].setAsGreatCircle(longitudePoint, 0);
  }

  /**
   * Finds an intersection with a flight path vector
   * @param globalLegIndex index of the flight plan leg this vector belongs to
   * @param accumulatedDistance distance along the leg up to the start of this vector in great circle radians
   * @param minimumDistanceAlongLeg minimum distance along the leg in metres that an intersection can occur, defaults to none
   * @param vectorDistance distance along this vector in great circle radians
   * @param intersectionCircle the small or great circle defined by the fix info, must be centred at the fix info fix
   * @param vectorCircle the flight path circle
   * @param vectorStart starting point of the flight path vector
   * @param vectorEnd ending point of the flight path vector
   * @param intersectionData output data if an intersection is found
   * @returns true if intersection found
   */
  private calculateFlightPathIntersection(
    globalLegIndex: number,
    accumulatedDistance: number,
    minimumDistanceAlongLeg: number | undefined,
    vectorDistance: number,
    intersectionCircle: GeoCircle,
    vectorCircle: GeoCircle,
    vectorStart: GeoPoint,
    vectorEnd: GeoPoint,
    intersectionData: FlightPlanIntersection,
  ): boolean {
    let foundIntersection = false;
    const numIntersections = intersectionCircle.intersection(vectorCircle, WT21FixInfoCalculator.vec3Cache);
    if (numIntersections > 0) {
      for (let i = 0; i < numIntersections; i++) {
        const intersection = WT21FixInfoCalculator.vec3Cache[i];

        const alongPathDistance = FlightPathUtils.getAlongArcNormalizedDistance(vectorCircle, vectorStart, vectorEnd, intersection);

        if (alongPathDistance >= 0 && alongPathDistance <= 1) {
          const distanceAlongLeg = Math.abs(UnitType.METER.convertFrom(accumulatedDistance + alongPathDistance * vectorDistance, UnitType.GA_RADIAN));
          // only take a closer intersection
          if (
            (intersectionData.distanceAlongLeg !== null && distanceAlongLeg >= intersectionData.distanceAlongLeg)
            || (minimumDistanceAlongLeg !== undefined && distanceAlongLeg < minimumDistanceAlongLeg)
          ) {
            continue;
          }
          intersectionData.flightPlanLeg = globalLegIndex;
          intersectionData.distanceAlongLeg = Math.abs(UnitType.METER.convertFrom(accumulatedDistance + alongPathDistance * vectorDistance, UnitType.GA_RADIAN));
          intersectionData.point.setFromCartesian(intersection);
          foundIntersection = true;
        }
      }
    }
    return foundIntersection;
  }
}
