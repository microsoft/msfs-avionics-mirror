import { APAltitudeModes, APLateralModes, APVerticalModes } from '@microsoft/msfs-sdk';

/**
 * A G1000 NXi FMA data object.
 */
export type FmaData = {
  /** The Active Vertical Mode */
  verticalActive: APVerticalModes,
  /** The Armed Vertical Mode */
  verticalArmed: APVerticalModes,
  /** The Armed Vertical Approach Mode */
  verticalApproachArmed: APVerticalModes,
  /** The Armed Altitude Type */
  verticalAltitudeArmed: APAltitudeModes,
  /** The Altitude Capture Armed State */
  altitudeCaptureArmed: boolean,
  /** The Altitude Capture Value */
  altitudeCaptureValue: number,
  /** The Active Lateral Mode */
  lateralActive: APLateralModes,
  /** The Armed Lateral Mode */
  lateralArmed: APLateralModes,
  /** Lateral Mode Failed */
  lateralModeFailed: boolean;
}