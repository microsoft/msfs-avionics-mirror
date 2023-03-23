import { GeoPointReadOnly } from '@microsoft/msfs-sdk';
import { TawsOperatingMode } from '@microsoft/msfs-wtg3000-common';

/**
 * Data provided by TAWS to modules.
 */
export type TawsData = {
  /** Whether the airplane is on the ground. */
  isOnGround: boolean;

  /** Whether TAWS has a valid position fix. */
  isGpsPosValid: boolean;

  /** The current GPS position of the airplane. */
  gpsPos: GeoPointReadOnly;

  /** The current GPS altitude of the airplane, in feet. */
  gpsAltitude: number;

  /** Whether TAWS has a valid radar altitude. */
  isRadarAltitudeValid: boolean;

  /** The current radar altitude of the airplane, in feet. */
  radarAltitude: number;

  /** Whether the autopilot GS or GP mode is active. */
  isGsGpActive: boolean;
};

/**
 * A module for a TAWS system. TAWS modules are attached to a parent system, which update the modules and provide them
 * with data.
 */
export interface TawsModule {
  /**
   * A method which is called when this module is attached to an initialized TAWS system, or when this parent's
   * TAWS system is initialized.
   */
  onInit(): void;

  /**
   * A method which is called every time this module's parent TAWS system is updated.
   * @param simTime The current sim time, as a UNIX timestamp in milliseconds.
   * @param operatingMode The current operating mode of TAWS.
   * @param data The data provided by TAWS.
   */
  onUpdate(simTime: number, operatingMode: TawsOperatingMode, data: Readonly<TawsData>): void;

  /**
   * A method which is called when this module's parent TAWS system is destroyed.
   */
  onDestroy(): void;
}