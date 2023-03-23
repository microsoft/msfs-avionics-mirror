import { APAltitudeModes, APLateralModes, APVerticalModes } from '@microsoft/msfs-sdk';

/**
 * Data describing autopilot status used by Garmin FMAs.
 */
export type FmaData = {
  /** The active vertical mode. */
  verticalActive: APVerticalModes;

  /** The armed vertical mode. */
  verticalArmed: APVerticalModes;

  /** The armed vertical approach mode. */
  verticalApproachArmed: APVerticalModes;

  /** The armed altitude capture mode. */
  verticalAltitudeArmed: APAltitudeModes;

  /** Whether an altitude capture mode is armed. */
  altitideCaptureArmed: boolean;

  /** The target altitude capture value, in feet. */
  altitideCaptureValue: number;

  /** The active lateral mode. */
  lateralActive: APLateralModes;

  /** The armed lateral mode. */
  lateralArmed: APLateralModes;

  /** Whether the lateral mode is in a failed state. */
  lateralModeFailed: boolean;

  /** The state of VNAV to be displayed on the FMA. */
  vnavState: FmaVNavState;
}

/**
 * Events related to the Garmin FMA.
 */
export interface FmaDataEvents {
  /** Data describing autopilot status used by the FMA. */
  fma_data: Readonly<FmaData>;
}

export enum FmaVNavState {
  OFF,
  ARMED,
  ACTIVE
}