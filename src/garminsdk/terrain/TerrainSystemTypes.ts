import { AirportFacility, GeoPointReadOnly, OneWayRunway } from '@microsoft/msfs-sdk';

import { GlidepathServiceLevel } from '../autopilot/vnav/GarminVNavTypes';
import { ApproachDetails, FmsFlightPhase } from '../flightplan/FmsTypes';

/**
 * Types of Garmin terrain alerting systems.
 */
export enum TerrainSystemType {
  Svt = 'Svt',
  TawsA = 'TawsA',
  TawsB = 'TawsB'
}

/**
 * Garmin terrain alerting system operating modes.
 */
export enum TerrainSystemOperatingMode {
  Off = 'Off',
  Operating = 'Operating',
  Test = 'Test'
}

/**
 * Data provided by Garmin terrain alerting systems to modules.
 */
export type TerrainSystemData = {
  /** The current real (operating system) time, as a Javascript timestamp. */
  realTime: number;

  /** The current sim time, as a Javascript timestamp. */
  simTime: number;

  /** The current simulation rate factor. */
  simRate: number;

  /** Whether the airplane is on the ground. */
  isOnGround: boolean;

  /**
   * The positions of the airplane's gear, as `[nose, leftMain, rightMain]`. A value of `0` indicates fully retracted,
   * and a value of `1` indicates fully extended.
   */
  gearPosition: readonly [number, number, number];

  /** The extension angles, in degrees, of the airplane's trailing edge flaps, as `[left, right]`. */
  flapsAngle: readonly [number, number];

  /** Whether the terrain system has a valid position fix. */
  isGpsPosValid: boolean;

  /** The current GPS position of the airplane. */
  gpsPos: GeoPointReadOnly;

  /** The current GPS altitude of the airplane, in feet. */
  gpsAltitude: number;

  /** The current GPS vertical speed of the airplane, in feet per minute. */
  gpsVerticalSpeed: number;

  /** The current GPS ground speed of the airplane, in knots. */
  gpsGroundSpeed: number;

  /** The elevation of the ground directly below the airplane, in feet. */
  groundElevation: number;

  /** The current GPS above ground height of the airplane, in feet. */
  gpsAgl: number;

  /** Whether the terrain system has valid radar altitude data. */
  isRadarAltitudeValid: boolean;

  /** The current radar altitude of the airplane, in feet. */
  radarAltitude: number;

  /** Whether the terrain system has valid barometric altitude data. */
  isBaroAltitudeValid: boolean;

  /** The current barometric altitude of the airplane, in feet. */
  baroAltitude: number;

  /** The current barometric vertical speed of the airplane, in feet per minute. */
  baroVerticalSpeed: number;

  /** The current barometric above ground height of the airplane, in feet. */
  baroAgl: number;

  /** Whether the terrain system has valid attitude data. */
  isAttitudeValid: boolean;

  /** Whether the terrain system has valid heading data. */
  isHeadingValid: boolean;

  /** The current true heading of the airplane, in degrees. */
  headingTrue: number;

  /** Whether the autopilot GS or GP mode is active. */
  isGsGpActive: boolean;

  /** The departure airport loaded into the FMS, or `null` if there is no such airport. */
  departureAirport: AirportFacility | null;

  /** The departure runway loaded into the FMS, or `null` if there is no such runway. */
  departureRunway: OneWayRunway | null;

  /** The destination airport loaded into the FMS, or `null` if there is no such airport. */
  destinationAirport: AirportFacility | null;

  /** The destination runway loaded into the FMS, or `null` if there is no such runway. */
  destinationRunway: OneWayRunway | null;

  /** Details of the approach loaded into the FMS. */
  approachDetails: Readonly<ApproachDetails>;

  /** The current FMS flight phase. */
  flightPhase: Readonly<FmsFlightPhase>;

  /** The current glidepath service level. */
  gpServiceLevel: GlidepathServiceLevel;

  /**
   * The current glideslope or glidepath vertical deviation for the active approach, scaled such that ±1 represents
   * full-scale deviation, or `NaN` if deviation is not available. Positive deviation indicates the airplane is below
   * the glideslope/glidepath.
   */
  gsGpDeviation: number;

  /** The nearest airport within five nautical miles of the airplane, or `null` if there is no such airport. */
  nearestAirport: AirportFacility | null;
};

/**
 * A controller for alerts tracked by a Garmin terrain alerting system.
 */
export interface TerrainSystemAlertController {
  /**
   * Triggers an alert.
   * @param alert The alert to trigger.
   */
  triggerAlert(alert: string): void;

  /**
   * Untriggers an alert.
   * @param alert The alert to untrigger.
   */
  untriggerAlert(alert: string): void;

  /**
   * Inhibits an alert.
   * @param alert The alert to inhibit.
   */
  inhibitAlert(alert: string): void;

  /**
   * Uninhibits an alert.
   * @param alert The alert to uninhibit.
   */
  uninhibitAlert(alert: string): void;
}
