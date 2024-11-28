import { MutableSubscribable, PerformancePlan, PerformancePlanDefinitionObject } from '@microsoft/msfs-sdk';

import { UnsFmsConfigInterface } from '../../Config/FmsConfigBuilder';

/** A UNS performance plan interface */
export interface UnsPerformancePlan extends PerformancePlan {
  /** The number of passengers onboard */
  paxQuantity: MutableSubscribable<number | null>;

  /** The average weight of passengers onboard, in pounds */
  paxAvgWeight: MutableSubscribable<number | null>;

  /** The basic operating weight of the aircraft, in pounds */
  basicOperatingWeight: MutableSubscribable<number | null>;

  /** The weight of the cargo onboard, in pounds */
  cargoWeight: MutableSubscribable<number | null>;

  /** The weight of the alternate fuel onboard, in pounds */
  alternateFuel: MutableSubscribable<number>;

  /** The weight of the hold fuel onboard, in pounds */
  holdFuel: MutableSubscribable<number>;

  /** The weight of the extra fuel onboard, in pounds */
  extraFuel: MutableSubscribable<number>;

  /** The weight of the total reserve fuel onboard, in pounds */
  manualTotalReservesFuel: MutableSubscribable<number | null>;

  /** The zero fuel weight of the aircraft, in pounds */
  zeroFuelWeight: MutableSubscribable<number | null>;
}

/**
 * Gets default perf plan values.
 * @param config The Fms config.
 * @returns A default config object.
 */
export function getUnsPerformancePlanDefinition(config: UnsFmsConfigInterface): PerformancePlanDefinitionObject<UnsPerformancePlan> {
  return {
    paxQuantity: {
      defaultValue: null,
    },
    paxAvgWeight: {
      defaultValue: 200,
    },
    basicOperatingWeight: {
      defaultValue: config.airframe.basicOperatingWeight,
    },
    cargoWeight: {
      defaultValue: null,
    },
    alternateFuel: {
      defaultValue: 0,
    },
    holdFuel: {
      defaultValue: 0,
    },
    extraFuel: {
      defaultValue: 0,
    },
    manualTotalReservesFuel: {
      defaultValue: null,
    },
    zeroFuelWeight: {
      defaultValue: null,
    }
  };
}
