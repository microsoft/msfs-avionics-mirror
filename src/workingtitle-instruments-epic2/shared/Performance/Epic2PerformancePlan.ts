import { MutableSubscribable, OneWayRunway, PerformancePlan, PerformancePlanDefinitionObject } from '@microsoft/msfs-sdk';

import { AvionicsConfig } from '../AvionicsConfig';

/** Epic 2 performance plan */
export interface Epic2PerformancePlan extends PerformancePlan {
  /** Passenger numbers */
  paxNumber: MutableSubscribable<number | null>;

  /** The average passenger weight */
  averagePassengerWeight: MutableSubscribable<number>;

  /** The aircraft basic operating weight */
  basicOperatingWeight: MutableSubscribable<number>;

  /** The aircraft cargo weight*/
  cargoWeight: MutableSubscribable<number | null>;

  /** The aircraft zero fuel weight */
  manualZfw: MutableSubscribable<number | null>;

  /** The aircraft gross weight */
  manualGw: MutableSubscribable<number | null>;

  /** The aircraft take off weight*/
  manualTow: MutableSubscribable<number | null>;

  /** The ICAO of the takeoff airport */
  takeoffAirportIcao: MutableSubscribable<string | null>;

  /** The takeoff runway */
  takeoffRunway: MutableSubscribable<OneWayRunway | null>;

  /** The ICAO of the approach airport */
  approachAirportIcao: MutableSubscribable<string | null>;

  /** The approach runway */
  approachRunway: MutableSubscribable<OneWayRunway | null>;

  /** The selected cruise speed in knots */
  cruiseTargetSpeedIas: MutableSubscribable<number | null>;

  /** The selected cruise speed in mach */
  cruiseTargetSpeedMach: MutableSubscribable<number | null>;

  /** The selected cruise altitude */
  cruiseAltitude: MutableSubscribable<number | null>;

  /** The selected transition altitude, in feet. */
  transitionAltitude: MutableSubscribable<number>;

  /** The selected transition level, in feet. */
  transitionLevel: MutableSubscribable<number>;

  /** Pilot-selected fuel flow, only used if the performance mode is selected to pilot mode */
  pilotCruiseFuelflow: MutableSubscribable<number | null>;
}

/**
 * Gets the epic 2 performance definition object
 * @param config The aircraft config
 * @returns The performance plan definition object for the Epic 2
 */
export function getEpic2PerformanceDefinitions(config: AvionicsConfig): PerformancePlanDefinitionObject<Epic2PerformancePlan> {
  return {
    paxNumber: {
      defaultValue: null,
      differentiateBetweenFlightPlans: false
    },
    averagePassengerWeight: {
      defaultValue: config.airframe.avgPaxWeight ?? 150,
      differentiateBetweenFlightPlans: false,
    },
    basicOperatingWeight: {
      defaultValue: config.airframe.basicOperatingWeight ?? 0,
      differentiateBetweenFlightPlans: false,
    },
    cargoWeight: {
      defaultValue: null,
      differentiateBetweenFlightPlans: false
    },
    manualZfw: {
      defaultValue: null,
      differentiateBetweenFlightPlans: false
    },
    manualGw: {
      defaultValue: null,
      differentiateBetweenFlightPlans: false
    },
    manualTow: {
      defaultValue: null,
      differentiateBetweenFlightPlans: false
    },
    takeoffAirportIcao: {
      defaultValue: null,
      differentiateBetweenFlightPlans: false,
    },
    takeoffRunway: {
      defaultValue: null,
      differentiateBetweenFlightPlans: false,
    },
    approachAirportIcao: {
      defaultValue: null,
      differentiateBetweenFlightPlans: false,
    },
    approachRunway: {
      defaultValue: null,
      differentiateBetweenFlightPlans: false,
    },
    cruiseTargetSpeedIas: {
      defaultValue: config.speedSchedules.cruiseSchedule.ias,
      differentiateBetweenFlightPlans: false,
    },
    cruiseTargetSpeedMach: {
      defaultValue: config.speedSchedules.cruiseSchedule.mach ?? 0.4,
      differentiateBetweenFlightPlans: false,
    },
    cruiseAltitude: {
      defaultValue: 20000,
      differentiateBetweenFlightPlans: false,
    },
    transitionAltitude: {
      defaultValue: 18000,
      differentiateBetweenFlightPlans: false,
    },
    transitionLevel: {
      defaultValue: 18000,
      differentiateBetweenFlightPlans: false,
    },
    pilotCruiseFuelflow: {
      defaultValue: null,
      differentiateBetweenFlightPlans: false,
    }
  };
}
