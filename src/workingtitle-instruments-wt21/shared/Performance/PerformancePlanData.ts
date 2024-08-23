import { MutableSubscribable, OneWayRunway } from '@microsoft/msfs-sdk';

import { WindEntry } from '../Types';

/**
 * Defines the data available through a performance plan or a performance plan proxy
 */
export interface PerformancePlanData {
  // Perf init

  get paxNumber(): MutableSubscribable<number | null>;

  get averagePassengerWeight(): MutableSubscribable<number | null>;

  get basicOperatingWeight(): MutableSubscribable<number | null>;

  get cargoWeight(): MutableSubscribable<number | null>;

  get manualZfw(): MutableSubscribable<number | null>;

  get manualGw(): MutableSubscribable<number | null>;

  get manualLw(): MutableSubscribable<number | null>;

  // VNAV

  get climbTargetSpeedIas(): MutableSubscribable<number | null>;

  get climbTargetSpeedMach(): MutableSubscribable<number | null>;

  get climbSpeedLimitIas(): MutableSubscribable<number | null>;

  get climbSpeedLimitAltitude(): MutableSubscribable<number | null>;

  get cruiseTargetSpeedIas(): MutableSubscribable<number | null>;

  get cruiseTargetSpeedMach(): MutableSubscribable<number | null>;

  get cruiseAltitude(): MutableSubscribable<number | null>;

  get descentTargetSpeedIas(): MutableSubscribable<number | null>;

  get descentTargetSpeedMach(): MutableSubscribable<number | null>;

  get descentSpeedLimitIas(): MutableSubscribable<number | null>;

  get descentSpeedLimitAltitude(): MutableSubscribable<number | null>;

  get descentVPA(): MutableSubscribable<number | null>;

  get transitionAltitude(): MutableSubscribable<number | null>;

  // FUEL MGMT
  get reserveFuel(): MutableSubscribable<number | null>;

}
