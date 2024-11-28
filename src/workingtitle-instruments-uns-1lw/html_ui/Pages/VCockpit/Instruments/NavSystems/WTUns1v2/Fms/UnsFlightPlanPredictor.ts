import {
  Accessible, AirportFacility, EventBus, FacilityPredictionsTrackingEntry, FlightPlanner, FlightPlanPredictionsProvider,
  FlightPlanPredictor, FlightPlanPredictorConfiguration, GeoPoint, LegPredictions, Predictions, SubEvent, Subscribable,
} from '@microsoft/msfs-sdk';

/**
 * A wrapper around {@link FlightPlanPredictor} which conforms to the {@link FlightPlanPredictionsProvider} interface
 */
export class UnsFlightPlanPredictor implements FlightPlanPredictionsProvider {
  private readonly innerPredictor: FlightPlanPredictor;

  readonly onPredictionsUpdated = new SubEvent<this, void>();

  /**
   * Ctor
   *
   * @param bus               the event bus
   * @param flightPlanner     a flight planner
   * @param planIndexSub      a subscribable regarding the index of the flight plan we want to predict for
   * @param activeLegIndexSub a subscribable regarding the index of the displayed active leg, specific to the avionics suite
   * @param config            configuration object
   * @param destinationFacilityAcc an accessor to the current destination facility
   */
  constructor(
    bus: EventBus,
    flightPlanner: FlightPlanner,
    planIndexSub: Subscribable<number>,
    activeLegIndexSub: Subscribable<number>,
    config: FlightPlanPredictorConfiguration,
    private readonly destinationFacilityAcc: Accessible<AirportFacility | null>,
  ) {
    this.innerPredictor = new FlightPlanPredictor(bus, flightPlanner, planIndexSub, activeLegIndexSub, config);
  }

  /**
   * Updates this predictor
   */
  public update(): void {
    this.innerPredictor.update();
    this.onPredictionsUpdated.notify(this);
  }

  /** @inheritDoc */
  getDestinationPredictions(): Readonly<Predictions> | undefined {
    const destinationFacility = this.destinationFacilityAcc.get();

    if (!destinationFacility) {
      return undefined;
    }

    const oldPred = this.innerPredictor.getDestinationPrediction(destinationFacility);

    if (!oldPred) {
      return undefined;
    }

    return this.mapOldPredictionToNewPrediction(oldPred);
  }

  /** @inheritDoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getPredictionsForAltitude(altitude: number, predictActiveLeg?: boolean): Readonly<Predictions> | undefined {
    throw new Error('Not yet implemented');
  }

  /** @inheritDoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getPredictionsForDistance(distance: number, predictActiveLeg?: boolean): Readonly<Predictions> | undefined {
    throw new Error('Not yet implemented');
  }

  /** @inheritDoc */
  getPredictionsForLeg(globalLegIndex: number): Readonly<Predictions> | undefined {
    const oldPred = this.innerPredictor.predictionsForLegIndex(globalLegIndex);

    if (!oldPred) {
      return undefined;
    }

    return this.mapOldPredictionToNewPrediction(oldPred);
  }

  /** @inheritDoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getPredictionsForTime(time: number, predictActiveLeg?: boolean): Readonly<Predictions> | undefined {
    throw new Error('Not yet implemented');
  }

  /** @inheritDoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getPredictionsForTrackedFacility(id: string): Readonly<Predictions> | undefined {
    throw new Error('Not yet implemented');
  }

  /** @inheritDoc */
  * iteratePredictions(startGlobalLegIndex?: number): Generator<Predictions | undefined, void, unknown> {
    for (const prediction of this.innerPredictor.iteratePredictions(startGlobalLegIndex)) {
      yield this.mapOldPredictionToNewPrediction(prediction);
    }
  }

  /** @inheritDoc */
  * iteratePredictionsReverse(startGlobalLegIndex?: number): Generator<Predictions | undefined, void, unknown> {
    for (const prediction of this.innerPredictor.iteratePredictionsReverse(startGlobalLegIndex)) {
      yield this.mapOldPredictionToNewPrediction(prediction);
    }
  }

  /** @inheritDoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  startTrackingFacility(id: string, entry: FacilityPredictionsTrackingEntry): void {
    throw new Error('Not yet implemented');
  }

  /** @inheritDoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  stopTrackingFacility(id: string): boolean {
    throw new Error('Not yet implemented');
  }

  /**
   * Maps the old prediction type to the new type
   *
   * @param oldPred the prediction in the old type
   *
   * @returns the same prediction but mapped to the new type
   */
  private mapOldPredictionToNewPrediction(oldPred: LegPredictions): Predictions {
    const currentUnix = Date.now();
    const midnightUnix = currentUnix - (currentUnix % (1_000 * 3_600 * 24));
    const midnightUnixSeconds = midnightUnix / 1_000;

    return {
      valid: true,
      ident: oldPred.ident,
      position: new GeoPoint(NaN, NaN),
      distance: oldPred.distance,
      fob: oldPred.fob ?? NaN,
      speed: NaN,
      isSpeedMach: false,
      estimatedTimeOfArrival: midnightUnixSeconds + oldPred.estimatedTimeOfArrival,
      duration: oldPred.estimatedTimeEnroute,
      altitude: NaN,
    };
  }
}
