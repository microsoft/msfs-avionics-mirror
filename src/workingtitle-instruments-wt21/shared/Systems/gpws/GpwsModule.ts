import { GeoPointReadOnly } from '@microsoft/msfs-sdk';

import { GpwsOperatingMode } from './GpwsTypes';

/**
 * Data provided by GPWS to modules.
 */
export type GpwsData = {
  /** Whether the airplane is on the ground. */
  isOnGround: boolean;

  /** Whether GPWS has a valid position fix. */
  isPosValid: boolean;

  /** The current GPS position of the airplane. */
  gpsPos: GeoPointReadOnly;

  /** The current geometric altitude of the airplane, in feet. */
  geoAltitude: number;

  /** The current geometric vertical speed of the airplane, in feet per minute. */
  geoVerticalSpeed: number;

  /** Whether GPWS has a valid radar altitude. */
  isRadarAltitudeValid: boolean;

  /** The current radar altitude of the airplane, in feet. */
  radarAltitude: number;

  /** Whether the autopilot GS or GP mode is active. */
  isGsGpActive: boolean;

  /** The altitude of the nearest runway, in feet, or `null` if nearest runway data are not available. */
  nearestRunwayAltitude: number | null;
};

/**
 * A module for a GPWS system. GPWS modules are attached to a parent system, which update the modules and provide them
 * with data.
 */
export interface GpwsModule {
  /**
   * A method which is called when this module is attached to an initialized GPWS system, or when this parent's
   * GPWS system is initialized.
   */
  onInit(): void;

  /**
   * A method which is called every time this module's parent GPWS system is updated.
   * @param operatingMode The current operating mode of GPWS.
   * @param data The data provided by GPWS.
   * @param realTime The current real (operating system) time, as a UNIX timestamp in milliseconds.
   * @param simTime The current sim time, as a UNIX timestamp in milliseconds.
   * @param simRate The current simulation rate factor.
   */
  onUpdate(operatingMode: GpwsOperatingMode, data: Readonly<GpwsData>, realTime: number, simTime: number, simRate: number): void;

  /**
   * A method which is called when this module's parent GPWS system is destroyed.
   */
  onDestroy(): void;
}