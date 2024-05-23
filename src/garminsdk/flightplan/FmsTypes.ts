import { ApproachProcedure, ExtendedApproachType, OneWayRunway, RnavTypeFlags, VorFacility } from '@microsoft/msfs-sdk';

export enum DirectToState {
  NONE,
  TOEXISTING,
  TORANDOM
}

export enum ProcedureType {
  DEPARTURE,
  ARRIVAL,
  APPROACH,
  VISUALAPPROACH
}

export enum AirwayLegType {
  NONE,
  ENTRY,
  EXIT,
  ONROUTE,
  EXIT_ENTRY
}

/**
 * Additional Garmin approach types.
 */
export enum GarminAdditionalApproachType {
  APPROACH_TYPE_VFR = 200
}

/**
 * Types of approaches supported by Garmin.
 */
export type GarminApproachType = ExtendedApproachType | GarminAdditionalApproachType;

/**
 * A Garmin VFR approach procedure.
 */
export type GarminVfrApproachProcedure = Omit<ApproachProcedure, 'approachType'> & {
  /** The approach type. */
  readonly approachType: GarminAdditionalApproachType.APPROACH_TYPE_VFR;

  /** Information about the published approach on which this VFR approach is based. */
  readonly parentApproachInfo: Pick<ApproachProcedure, 'approachType' | 'rnavTypeFlags'>;
};

/**
 * A Garmin approach procedure.
 */
export type GarminApproachProcedure = ApproachProcedure | GarminVfrApproachProcedure;

/**
 * Details on the primary flight plan's loaded approach procedure.
 */
export type ApproachDetails = {
  /** Whether an approach is loaded. */
  isLoaded: boolean;

  /** The type of the loaded approach. */
  type: GarminApproachType;

  /** Whether the loaded approach is an RNAV RNP (AR) approach. */
  isRnpAr: boolean;

  /** The best RNAV minima type available on the loaded approach. */
  bestRnavType: RnavTypeFlags;

  /** The RNAV minima types available on the loaded approach. */
  rnavTypeFlags: RnavTypeFlags;

  /** Whether the loaded approach is circling */
  isCircling: boolean;

  /** Whether the loaded approach is a vectors-to-final approach. */
  isVtf: boolean;

  /** The reference navaid facility for the loaded approach. */
  referenceFacility: VorFacility | null;

  /** The runway associated with the loaded approach. */
  runway: OneWayRunway | null;
}

/**
 * Details on the current FMS phase of flight.
 */
export type FmsFlightPhase = {
  /** Whether the approach is active. */
  isApproachActive: boolean;

  /** Whether the active leg is the leg to the final approach fix. */
  isToFaf: boolean;

  /** Whether the active leg is past the final approach fix. */
  isPastFaf: boolean;

  /** Whether the missed approach is active. */
  isInMissedApproach: boolean;
};