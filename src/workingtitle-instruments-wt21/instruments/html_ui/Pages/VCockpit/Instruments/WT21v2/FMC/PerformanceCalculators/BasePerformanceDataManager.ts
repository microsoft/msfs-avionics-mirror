import { ConsumerSubject, EngineEvents, EventBus, MappedSubject, Subject } from '@microsoft/msfs-sdk';

import { PerformancePlanProxy } from '@microsoft/msfs-wt21-shared';

import { PerformanceVariable } from './PerformanceVariable';

/**
 * Manages basic performance data
 */
export class BasePerformanceDataManager {

  /** The weight of a gallon of fuel in lbs. */
  private fuelWeightPerGallon: ConsumerSubject<number>;

  /**
   * Initializes the base performance data manager
   * @param performancePlanProxy the performance plan proxy
   * @param eventBus the event bus
   */
  constructor(private readonly performancePlanProxy: PerformancePlanProxy, eventBus: EventBus) {
    const engine = eventBus.getSubscriber<EngineEvents>();

    this.fuelWeightPerGallon =
      ConsumerSubject.create(engine.on('fuel_weight_per_gallon').whenChanged(), 0);

    engine.on('fuel_total').withPrecision(0).handle((value) => {
      this.sensedFuelWeight.set(Math.trunc(value * this.fuelWeightPerGallon.get()));
    });
  }

  /**
   * Basic operating weight
   */
  manualBasicOperatingWeight = PerformanceVariable.withDefaultValue<number>(10_000);

  /**
   * Cruise altitude
   */
  crzAlt = PerformanceVariable.withDefaultNullValue<number>();

  /**
   * Number of passengers
   */
  paxNumber = PerformanceVariable.withDefaultValue(0);

  /**
   * Average passenger weight
   */
  paxAverageWeight = PerformanceVariable.withDefaultValue(170);

  /**
   * Sensed fuel in lbs
   *
   * @private
   */
  sensedFuelWeight = Subject.create<number>(0);

  /**
   * Calculated ZFW
   */
  autoZfw = MappedSubject.create(
    ([bow, paxCount, paxAverageWeight, cargoWeight]) => {
      if (bow === null || paxAverageWeight === null) {
        return null;
      }

      return bow + ((paxCount ?? 0) * paxAverageWeight) + (cargoWeight ?? 0);
    },
    this.performancePlanProxy.basicOperatingWeight,
    this.performancePlanProxy.paxNumber,
    this.performancePlanProxy.averagePassengerWeight,
    this.performancePlanProxy.cargoWeight,
  );

  /**
   * Calculated GW
   */
  autoGW = MappedSubject.create(
    ([zfw, fuelWeight]) => {
      if (zfw === null) {
        return null;
      }

      return zfw + fuelWeight;
    },
    this.autoZfw,
    this.sensedFuelWeight,
  );

  /**
   * Final ZFW value
   */
  zfw = MappedSubject.create(
    ([autoZfw, manualGW, manualZfw, fuel]) => {
      if (!manualZfw && manualGW) {
        return manualGW - fuel;
      } else if (manualZfw) {
        return manualZfw;
      } else {
        return autoZfw;
      }
    },
    this.autoZfw,
    this.performancePlanProxy.manualGw,
    this.performancePlanProxy.manualZfw,
    this.sensedFuelWeight,
  );

  /**
   * Final GW value
   */
  gw = MappedSubject.create(
    ([autoGW, manualGW, manualZfw, fuel]) => {
      if (!manualGW && manualZfw) {
        return manualZfw + fuel;
      } else if (manualGW) {
        return manualGW;
      } else {
        return autoGW;
      }
    },
    this.autoGW,
    this.performancePlanProxy.manualGw,
    this.performancePlanProxy.manualZfw,
    this.sensedFuelWeight,
  );

  basicOperatingWeight = MappedSubject.create(
    ([bow, manualZfw, manualGw]) => (manualZfw || manualGw) ? null : bow,
    this.performancePlanProxy.basicOperatingWeight,
    this.performancePlanProxy.manualZfw,
    this.performancePlanProxy.manualGw,
  );

  cargoWeight = MappedSubject.create(
    ([cargoWeight, manualZfw, manualGw]) => (manualZfw || manualGw) ? null : cargoWeight,
    this.performancePlanProxy.cargoWeight,
    this.performancePlanProxy.manualZfw,
    this.performancePlanProxy.manualGw,
  );

}
