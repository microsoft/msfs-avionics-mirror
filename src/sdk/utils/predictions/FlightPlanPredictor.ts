import { EventBus } from '../../data';
import { FlightPlan, FlightPlanner, LegDefinition, LegDefinitionFlags } from '../../flightplan';
import { GeoPoint } from '../../geo';
import { BitFlags, UnitType } from '../../math';
import { AirportFacility, Facility, FacilityType, ICAO, LegType } from '../../navigation';
import { Subscribable } from '../../sub';
import { FlightPlanPredictorConfiguration } from './FlightPlanPredictorConfiguration';
import { FlightPlanPredictorStore } from './FlightPlanPredictorStore';
import { FlightPlanPredictorUtils } from './FlightPlanPredictorUtils';
import { ActiveOrUpcomingLegPredictions, LegPredictions, PassedLegPredictions } from './LegPredictions';

/**
 * Creates leg-by-leg predictions for a flight plan, both in the future by estimating performance and in the past by
 * recording predicted data and actual achieved performance.
 */
export class FlightPlanPredictor {

  private readonly predictions: LegPredictions[] = [];

  private readonly facilityPredictions = new Map<string, ActiveOrUpcomingLegPredictions>();

  private readonly store: FlightPlanPredictorStore;

  /**
   * Ctor
   *
   * @param bus               the event bus
   * @param flightPlanner     a flight planner
   * @param planIndexSub      a subscribable regarding the index of the flight plan we want to predict for
   * @param activeLegIndexSub a subscribable regarding the index of the displayed active leg, specific to the avionics suite
   * @param config            configuration object
   */
  constructor(
    private readonly bus: EventBus,
    private readonly flightPlanner: FlightPlanner,
    private readonly planIndexSub: Subscribable<number>,
    private readonly activeLegIndexSub: Subscribable<number>,
    private readonly config: FlightPlanPredictorConfiguration,
  ) {
    this.store = new FlightPlanPredictorStore(this.bus, this.flightPlanner, this.planIndexSub);
  }

  /**
   * Whether the flight plan exists and has an active lateral leg index >= 1
   *
   * @returns boolean
   */
  public get planAndPredictionsValid(): boolean {
    if (this.flightPlanner.hasFlightPlan(this.planIndexSub.get()) && this.isAllLegsCalculated()) {
      return this.activeLegIndex >= 1;
    }

    return false;
  }

  /**
   * Obtains the flight plan to predict
   *
   * @returns a flight plan
   */
  private get plan(): FlightPlan {
    return this.flightPlanner.getFlightPlan(this.planIndexSub.get());
  }

  /**
   * Returns the active leg index to be used
   *
   * @returns the index
   */
  private get activeLegIndex(): number {
    return this.activeLegIndexSub.get();
  }

  /**
   * Checks if all legs in the plan are calculated
   * @returns true if all legs are calculated, false otherwise
   */
  private isAllLegsCalculated(): boolean {
    // check all legs are calculated from generator
    for (const leg of this.plan.legs(false, this.activeLegIndex)) {
      if (!leg.calculated) {
        return false;
      }
    }
    return true;
  }

  /**
   * Updates the predictor
   */
  public update(): void {
    if (!this.planAndPredictionsValid) {
      this.clearOutValues();
      return;
    }

    const activeLegIndex = this.activeLegIndex;
    const prevLegIndex = activeLegIndex - 1;

    // Return if no active leg
    if (!this.plan.tryGetLeg(prevLegIndex)) {
      return;
    }

    // Update all legs

    let accumulatedDistance = this.store.lnavDtg.get();
    let maxIndex = -1;

    let lastNonDiscontinuityLeg = undefined;
    for (const [i, leg, previousLeg] of this.predictableLegs()) {
      maxIndex = i;

      if (previousLeg?.leg.type === LegType.Discontinuity || previousLeg?.leg.type === LegType.ThruDiscontinuity) {
        if (lastNonDiscontinuityLeg !== undefined && lastNonDiscontinuityLeg.calculated && leg.calculated) {
          const termLat = lastNonDiscontinuityLeg.calculated.endLat;
          const termLon = lastNonDiscontinuityLeg.calculated.endLon;

          const startLat = leg.calculated.endLat;
          const startLon = leg.calculated.endLon;

          if (termLat && termLon && startLat && startLon) {
            const gaRadDistance = new GeoPoint(termLat, termLon).distance(new GeoPoint(startLat, startLon));

            accumulatedDistance += UnitType.NMILE.convertFrom(gaRadDistance, UnitType.GA_RADIAN);
          }
        }
      }

      lastNonDiscontinuityLeg = leg;

      const isPassedLeg = i < activeLegIndex;
      const isActiveLeg = i === activeLegIndex;
      const isUpcomingLeg = i > activeLegIndex;

      const oldPredictions = this.predictionsForLegIndex(i);

      if (oldPredictions) {
        if (isPassedLeg) {
          if (oldPredictions.kind === 'activeOrUpcoming') {
            this.stampPassedLegValues(oldPredictions as unknown as PassedLegPredictions);
          }

          this.updatePassedLeg(oldPredictions as PassedLegPredictions, leg);
        } else if (isActiveLeg) {
          this.updateActiveLeg(oldPredictions as ActiveOrUpcomingLegPredictions);
        } else {
          this.updateUpcomingLeg(oldPredictions as ActiveOrUpcomingLegPredictions, leg, accumulatedDistance);
        }

        if (isActiveLeg || isUpcomingLeg) {
          accumulatedDistance += oldPredictions.distance - accumulatedDistance;
        }
      } else {
        const newPredictions = {} as any;

        if (isPassedLeg) {
          this.updatePassedLeg(newPredictions as PassedLegPredictions, leg);
        } else if (isActiveLeg) {
          this.updateActiveLeg(newPredictions as ActiveOrUpcomingLegPredictions);
        } else {
          this.updateUpcomingLeg(newPredictions as ActiveOrUpcomingLegPredictions, leg, accumulatedDistance);
        }

        if (isActiveLeg || isUpcomingLeg) {
          accumulatedDistance += newPredictions.distance - accumulatedDistance;
        }

        this.predictions[i] = newPredictions;
      }
    }

    if (maxIndex > 0) {
      for (let i = maxIndex; i < this.predictions.length - 1; i++) {
        this.predictions.pop();
      }
    }

    this.clearOutDirtyValues();
  }

  /**
   * Clears out values from predictions
   *
   * @private
   */
  private clearOutValues(): void {
    this.predictions.length = 0;
  }

  /**
   * Clears out entries that have become discontinuities
   */
  private clearOutDirtyValues(): void {
    for (let i = 0; i < this.plan.length; i++) {
      const leg = this.plan.getLeg(i);

      if (leg.leg.type === LegType.Discontinuity || leg.leg.type === LegType.ThruDiscontinuity) {
        this.predictions.splice(i, 1, undefined as any);
      }
    }
  }

  /**
   * Finds the index of the destination leg, in other words, the last non-missed-approach leg.
   *
   * @returns the index, or -1 if not applicable
   */
  private findDestinationLegIndex(): number {
    let lastLegIndex = this.plan.length - 1;
    for (const leg of this.plan.legs(true)) {
      if (!BitFlags.isAll(leg.flags, LegDefinitionFlags.MissedApproach)) {
        break;
      }
      lastLegIndex--;
    }

    return lastLegIndex < 1 ? -1 : lastLegIndex;
  }

  /**
   * Iterator for existing predictions
   *
   * @param startAtIndex the index to start at
   *
   * @returns a generator
   *
   * @yields predictions
   */
  public *iteratePredictions(startAtIndex = 0): Generator<LegPredictions> {
    for (let i = startAtIndex; i < this.predictions.length; i++) {
      yield this.predictions[i];
    }
  }

  /**
   * Iterator for existing predictions in reverse
   *
   * @param startAtIndex the index to start at
   *
   * @returns a generator
   *
   * @yields predictions
   */
  public *iteratePredictionsReverse(startAtIndex = 0): Generator<LegPredictions> {
    for (let i = startAtIndex; i >= 0; i--) {
      yield this.predictions[i];
    }
  }

  /**
   * Returns predictions for the destination airport.
   *
   * If the dest leg (defined as the last leg that is not part of the missed approach) is not a runway,
   * then the direct distance between the termination of that leg and the provided airport facility is added to
   * the result. Otherwise, the prediction to that leg is used.
   *
   * @param destinationFacility the airport facility to use in case a direct distance needs to be calculated
   *
   * @returns predictions for the destination airport, or null if they cannot be computed
   */
  public getDestinationPrediction(destinationFacility: AirportFacility): ActiveOrUpcomingLegPredictions | null {
    const destLegIndex = this.findDestinationLegIndex();

    const leg = this.plan.tryGetLeg(destLegIndex);

    if (!leg) {
      return this.getPposToFacilityPredictions(destinationFacility);
    }

    const destLegHasValidFixIcao = leg.leg.fixIcao && leg.leg.fixIcao !== ICAO.emptyIcao;
    const isDestLegRunway = destLegHasValidFixIcao ? ICAO.getFacilityType(leg.leg.fixIcao) === FacilityType.RWY : false;

    if (!isDestLegRunway && leg.calculated?.endLat && leg.calculated.endLon) {
      const legTerm = new GeoPoint(leg.calculated?.endLat, leg.calculated?.endLon);
      const airport = new GeoPoint(destinationFacility.lat, destinationFacility.lon);

      const additionalDirectDistance = UnitType.GA_RADIAN.convertTo(legTerm.distance(airport), UnitType.NMILE);

      const predictionsToDestLeg = this.predictionsForLegIndex(destLegIndex);

      if (predictionsToDestLeg) {
        const directPredictions: ActiveOrUpcomingLegPredictions = {
          kind: 'activeOrUpcoming',
          ident: '',
          distance: additionalDirectDistance,
          estimatedTimeOfArrival: 0,
          estimatedTimeEnroute: 0,
          fob: 0,
        };

        this.predictForDistance(directPredictions, additionalDirectDistance);

        directPredictions.estimatedTimeEnroute = FlightPlanPredictorUtils.predictTime(this.currentGs(), additionalDirectDistance);

        const fuelConsumedOnDirect = Math.max(0, this.currentFuelWeight() - (directPredictions.fob ?? 0));

        return {
          kind: 'activeOrUpcoming',
          ident: ICAO.getIdent(destinationFacility.icao),
          estimatedTimeOfArrival: predictionsToDestLeg.estimatedTimeOfArrival + directPredictions.estimatedTimeEnroute,
          estimatedTimeEnroute: predictionsToDestLeg.estimatedTimeEnroute + directPredictions.estimatedTimeEnroute,
          distance: predictionsToDestLeg.distance + additionalDirectDistance,
          fob: Math.max(0, (predictionsToDestLeg.fob ?? this.currentFuelWeight()) - fuelConsumedOnDirect),
        };
      } else {
        return null;
      }
    } else {
      const predictionsForLegIndex = this.predictionsForLegIndex(destLegIndex) as ActiveOrUpcomingLegPredictions;

      if (predictionsForLegIndex) {
        return {
          ...predictionsForLegIndex,
          ident: ICAO.getIdent(destinationFacility.icao),
        };
      } else {
        return null;
      }
    }
  }

  /**
   * Returns predictions for an arbitrary facility.
   *
   * The distance used for predictions is the great circle distance between PPOS and the given facility.
   *
   * @param facility the facility to use
   *
   * @returns predictions for the facility
   */
  public getPposToFacilityPredictions(facility: Facility): ActiveOrUpcomingLegPredictions {
    const ppos = this.store.ppos.get();
    const distance = new GeoPoint(ppos.lat, ppos.long).distance({ lat: facility.lat, lon: facility.lon });
    const distanceNM = UnitType.NMILE.convertFrom(distance, UnitType.GA_RADIAN);

    const existingPredictions = this.facilityPredictions.get(facility.icao);

    let predictions;
    if (existingPredictions) {
      predictions = existingPredictions;
    } else {
      predictions = {
        kind: 'activeOrUpcoming',
        ident: ICAO.getIdent(facility.icao),
        distance: distanceNM,
        estimatedTimeOfArrival: 0,
        estimatedTimeEnroute: 0,
        fob: 0,
      } as any;
    }

    this.predictForDistance(predictions, distanceNM);

    return predictions;
  }

  /**
   * Returns active or upcoming predictions for a given leg index
   *
   * @param index the leg index
   *
   * @returns the predictions object, or null if they cannot be computed
   */
  public predictionsForLegIndex(index: number): LegPredictions | null {
    return this.predictions[index];
  }

  /**
   * Returns active or upcoming predictions for a given leg definition
   *
   * @param leg the leg
   *
   * @returns the predictions object, or null if they cannot be computed
   */
  public predictionsForLeg(leg: LegDefinition): LegPredictions | null {
    const index = this.plan.getLegIndexFromLeg(leg);

    if (index === -1) {
      return null;
    }

    return this.predictionsForLegIndex(index);
  }

  /**
   * Applies active or upcoming predictions for a given distance, outputting the result in the {@link out} argument
   *
   * @param distance the distance
   * @param out      the object in which to output the predictions
   */
  public applyPredictionsForDistance(distance: number, out: ActiveOrUpcomingLegPredictions): void {
    this.predictForDistance(out, distance);
  }

  /**
   * Whether the leg at an index is predicted
   *
   * @param legIndex the target leg index
   *
   * @returns boolean
   */
  public isLegIndexPredicted(legIndex: number): boolean {
    return !!this.predictions[legIndex];
  }

  /**
   * Whether the leg is predicted
   *
   * @param leg the target leg
   *
   * @returns boolean
   */
  public isLegPredicted(leg: LegDefinition): boolean {
    const index = this.plan.getLegIndexFromLeg(leg);

    return !!this.predictions[index];
  }

  /**
   * Returns the previous index for which a prediction exists. **Note: this will force an update to happen.**
   *
   * @param legIndex the leg index to start at
   *
   * @returns the index, or -1 if none is found
   */
  public findPreviousPredictedLegIndex(legIndex: number): number {
    this.update();

    for (let i = legIndex - 1; i >= 0; i--) {
      const isPredicted = this.isLegIndexPredicted(i);

      if (isPredicted) {
        return i;
      }
    }

    return -1;
  }

  /**
   * Returns the previous index for which a prediction exists. **Note: this will force an update to happen.**
   *
   * @param legIndex the leg index to start at
   *
   * @returns the index, or -1 if none is found
   */
  public findNextPredictedLegIndex(legIndex: number): number {
    this.update();

    for (let i = legIndex + 1; i < this.predictions.length; i++) {
      const isPredicted = this.isLegIndexPredicted(i);

      if (isPredicted) {
        return i;
      }
    }

    return -1;
  }

  /**
   * Applies a reducer function to the predictions of active and upcoming legs
   *
   * @param initialValue initial accumulator value
   * @param reducer      reducer function
   * @param upTo         index to reduce to
   *
   * @returns reduced value
   */
  public reducePredictions(initialValue: number, reducer: (accumulator: number, predictions: ActiveOrUpcomingLegPredictions) => number, upTo = -1): number {
    const limit = upTo === -1 ? this.predictions.length : upTo;

    let accumulator = initialValue;
    for (const [i] of this.predictableLegs(true)) {
      if (i > limit) {
        break;
      }

      const predictions = this.predictionsForLegIndex(i) as ActiveOrUpcomingLegPredictions;

      accumulator = reducer(accumulator, predictions);
    }

    return accumulator;
  }

  /**
   * Generator of all predictable legs in the plan
   *
   * The yielded tuple contains the following:
   * - 0: leg index in flight plan
   * - 1: leg definition object
   * - 2: previous leg definition object, including a previous discontinuity
   *
   * @param onlyAfterActive whether to start at the active leg
   *
   * @returns generator that skips appropriate legs
   *
   * @yields legs including and after the active leg that are not discontinuities (and not in missed approach, if config asks so)
   */
  private *predictableLegs(onlyAfterActive = false): Generator<[index: number, leg: LegDefinition, prevLeg?: LegDefinition]> {
    let prevLeg = undefined;
    for (let i = onlyAfterActive ? this.activeLegIndex + 1 : 0; i < this.plan.length; i++) {
      const leg = this.plan.getLeg(i);

      // Skip discontinuities
      if (leg.leg.type === LegType.Discontinuity || leg.leg.type === LegType.ThruDiscontinuity) {
        prevLeg = leg;
        continue;
      }

      // Skip Direct To IF legs
      if (leg.leg.type === LegType.IF && BitFlags.isAll(leg.flags, LegDefinitionFlags.DirectTo)) {
        prevLeg = leg;
        continue;
      }

      // Stop at missed approach if configured to do so
      if (!this.config.predictMissedApproachLegs && BitFlags.isAll(leg.flags, LegDefinitionFlags.MissedApproach)) {
        break;
      }

      yield [i, leg, prevLeg];

      prevLeg = leg;
    }
  }

  /**
   * Stamps the actual values from the last estimated values
   *
   * @param targetObject the object to stamp the actual values on
   *
   * @private
   */
  private stampPassedLegValues(targetObject: PassedLegPredictions): void {
    targetObject.actualFob = targetObject.fob;
    targetObject.actualTimeEnroute = targetObject.estimatedTimeEnroute;
    targetObject.actualTimeOfArrival = targetObject.estimatedTimeOfArrival;
    targetObject.actualAltitude = this.store.altitude.get();
  }

  /**
   * Creates predictions for a passed leg
   *
   * @param targetObject the object to apply the predictions to
   * @param leg          the leg
   *
   * @throws if calculated is undefined
   */
  private updatePassedLeg(targetObject: PassedLegPredictions, leg: LegDefinition): void {
    if (!leg.calculated || !leg.calculated.endLat || !leg.calculated.endLon) {
      return;
    }

    const term = new GeoPoint(leg.calculated.endLat, leg.calculated.endLon);

    const ppos = this.store.ppos.get();
    const distance = term.distance(new GeoPoint(ppos.lat, ppos.long));

    targetObject.kind = 'passed';
    targetObject.ident = leg.name ?? 'n/a';
    targetObject.distance = UnitType.GA_RADIAN.convertTo(distance, UnitType.NMILE);
  }

  /**
   * Computes predictions for the active leg
   *
   * @param targetObject the object to apply the predictions to
   *
   * @throws if no active leg in flight plan
   */
  private updateActiveLeg(targetObject: ActiveOrUpcomingLegPredictions): void {
    const distance = this.store.lnavDtg.get();

    const leg = this.plan.tryGetLeg(this.activeLegIndex);

    if (!leg) {
      return;
    }

    targetObject.kind = 'activeOrUpcoming';
    targetObject.ident = leg.name ?? 'n/a';
    targetObject.distance = distance;

    this.predictForDistance(targetObject, distance);
  }

  /**
   * Creates predictions for an upcoming leg
   *
   * @param targetObject        the object to apply the predictions to
   * @param leg                 the leg
   * @param accumulatedDistance accumulated distance in previous predictions before this leg
   */
  private updateUpcomingLeg(targetObject: ActiveOrUpcomingLegPredictions, leg: LegDefinition, accumulatedDistance: number): void {
    if (!leg.calculated) {
      return;
    }

    const ownDistance = UnitType.METER.convertTo(leg.calculated?.distanceWithTransitions, UnitType.NMILE);
    const distance = accumulatedDistance + ownDistance; // We do not use LegCalculations::cumulativeDistanceWithTransitions here, because
    // that does not account for PPOs

    targetObject.kind = 'activeOrUpcoming';
    targetObject.ident = leg.name ?? 'n/a';
    targetObject.distance = distance;

    this.predictForDistance(targetObject, distance);
  }

  /**
   * Predicts performance over a distance
   *
   * @param targetObject        the object to apply the predictions to
   * @param distance            the distance flown
   */
  private predictForDistance(targetObject: Omit<ActiveOrUpcomingLegPredictions, 'kind' | 'distance'>, distance: number): void {
    const estimatedTimeEnroute = FlightPlanPredictorUtils.predictTime(this.currentGs(), distance);
    const timeToDistance = FlightPlanPredictorUtils.predictTime(this.currentGs(), distance);
    const unixSeconds = UnitType.MILLISECOND.convertTo(this.store.unixSimTime.get(), UnitType.SECOND);
    const utcSeconds = unixSeconds % (3600 * 24);
    const estimatedTimeOfArrival = utcSeconds + timeToDistance;
    const fob = Math.max(0,
      this.currentFuelWeight() - FlightPlanPredictorUtils.predictFuelUsage(this.currentGs(), distance, this.store.fuelFlow.get(), this.store.fuelWeight.get()));

    targetObject.estimatedTimeEnroute = estimatedTimeEnroute;
    targetObject.estimatedTimeOfArrival = estimatedTimeOfArrival;
    targetObject.fob = fob;
  }

  /**
   * Obtains current GS with a minimum of 150
   *
   * @returns knots
   */
  private currentGs(): number {
    return Math.max(this.config.minimumPredictionsGroundSpeed, this.store.groundSpeed.get());
  }

  /**
   * Obtains current fuel weight
   *
   * @returns pounds
   */
  private currentFuelWeight(): number {
    return this.store.fuelTotalQuantity.get() * this.store.fuelWeight.get();
  }

}
