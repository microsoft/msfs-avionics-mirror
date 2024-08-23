import { MutableSubscribable, OneWayRunway, PerformancePlan, PerformancePlanDefinitionObject } from '@microsoft/msfs-sdk';

import { WindEntry } from '@microsoft/msfs-wt21-shared';

/**
 *
 */
export interface CJ4PerformancePlan extends PerformancePlan {
  /**
   *
   */
  manualTow: MutableSubscribable<number | null>,

  /**
   *
   */
  manualLw: MutableSubscribable<number | null>,

  // Takeoff Ref

  /**
   *
   */
  takeoffAirportIcao: MutableSubscribable<string | null>;

  /**
   *
   */
  takeoffRunway: MutableSubscribable<OneWayRunway | null>;

  /**
   *
   */
  takeoffWind: MutableSubscribable<WindEntry | null>;

  /**
   *
   */
  takeoffRunwayCondition: MutableSubscribable<number | null>;

  /**
   *
   */
  takeoffRunwaySlope: MutableSubscribable<number | null>;

  /**
   *
   */
  takeoffFlaps: MutableSubscribable<number | null>;

  /**
   *
   */
  takeoffAntiIceOn: MutableSubscribable<number | null>;

  /**
   *
   */
  takeoffOat: MutableSubscribable<number | null>;

  /**
   *
   */
  takeoffAutoQnh: MutableSubscribable<number | null>;

  /**
   *
   */
  takeoffManualQnh: MutableSubscribable<number | null>;

  // Approach Ref

  /**
   *
   */
  approachAirportIcao: MutableSubscribable<string | null>;

  /**
   *
   */
  approachRunway: MutableSubscribable<OneWayRunway | null>;

  /**
   *
   */
  approachWind: MutableSubscribable<WindEntry | null>;

  /**
   *
   */
  approachRunwayCondition: MutableSubscribable<number | null>;

  /**
   *
   */
  approachRunwaySlope: MutableSubscribable<number | null>;

  /**
   *
   */
  approachAntiIceOn: MutableSubscribable<number | null>;

  /**
   *
   */
  approachOat: MutableSubscribable<number | null>;

  /**
   *
   */
  approachAutoQnh: MutableSubscribable<number | null>;

  /**
   *
   */
  approachManualQnh: MutableSubscribable<number | null>;

  /**
   *
   */
  approachLandingFactor: MutableSubscribable<number | null>;

}

export const CJ4_PERFORMANCE_PLAN_DEFINITIONS: PerformancePlanDefinitionObject<CJ4PerformancePlan> = {
  manualTow: {
    defaultValue: null,
    differentiateBetweenFlightPlans: true,
  },
  manualLw: {
    defaultValue: null,
    differentiateBetweenFlightPlans: true,
  },
  takeoffAirportIcao: {
    defaultValue: null,
  },
  takeoffRunway: {
    defaultValue: null,
  },
  takeoffWind: {
    defaultValue: null,
  },
  takeoffRunwayCondition: {
    defaultValue: 0,
  },
  takeoffRunwaySlope: {
    defaultValue: null,
  },
  takeoffFlaps: {
    defaultValue: 0,
  },
  takeoffAntiIceOn: {
    defaultValue: 0,
  },
  takeoffOat: {
    defaultValue: null,
  },
  takeoffAutoQnh: {
    defaultValue: null,
  },
  takeoffManualQnh: {
    defaultValue: null,
  },
  approachAirportIcao: {
    defaultValue: null,
  },
  approachRunway: {
    defaultValue: null,
  },
  approachWind: {
    defaultValue: null,
  },
  approachRunwayCondition: {
    defaultValue: 0,
  },
  approachRunwaySlope: {
    defaultValue: null,
  },
  approachAntiIceOn: {
    defaultValue: 0,
  },
  approachOat: {
    defaultValue: null,
  },
  approachAutoQnh: {
    defaultValue: null,
  },
  approachManualQnh: {
    defaultValue: null,
  },
  approachLandingFactor: {
    defaultValue: 0,
  },
};
