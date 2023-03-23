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

  get manualTow(): MutableSubscribable<number | null>;

  get manualLw(): MutableSubscribable<number | null>;

  // Takeoff Ref

  get takeoffAirportIcao(): MutableSubscribable<string | null>;

  get takeoffRunway(): MutableSubscribable<OneWayRunway | null>;

  get takeoffWind(): MutableSubscribable<WindEntry | null>;

  get takeoffRunwayCondition(): MutableSubscribable<number | null>;

  get takeoffRunwaySlope(): MutableSubscribable<number | null>;

  get takeoffFlaps(): MutableSubscribable<number | null>;

  get takeoffAntiIceOn(): MutableSubscribable<number | null>;

  get takeoffOat(): MutableSubscribable<number | null>;

  get takeoffAutoQnh(): MutableSubscribable<number | null>;

  get takeoffManualQnh(): MutableSubscribable<number | null>;

  // Approach Ref

  get approachAirportIcao(): MutableSubscribable<string | null>;

  get approachRunway(): MutableSubscribable<OneWayRunway | null>;

  get approachWind(): MutableSubscribable<WindEntry | null>;

  get approachRunwayCondition(): MutableSubscribable<number | null>;

  get approachRunwaySlope(): MutableSubscribable<number | null>;

  get approachAntiIceOn(): MutableSubscribable<number | null>;

  get approachOat(): MutableSubscribable<number | null>;

  get approachAutoQnh(): MutableSubscribable<number | null>;

  get approachManualQnh(): MutableSubscribable<number | null>;

  get approachLandingFactor(): MutableSubscribable<number | null>;

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