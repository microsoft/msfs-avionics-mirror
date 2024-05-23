import { FmsFplUserDataTypeMap, GarminVfrApproachProcedure } from '@microsoft/msfs-garminsdk';

/**
 * G3X Touch flight plan user data keys.
 */
export enum G3XFmsFplUserDataKey {
  /** Data describing the flight plan's loaded approach. */
  LoadedApproach = 'g3x_loaded_approach'
}

/**
 * Data describing a VFR approach procedure that is loaded into a G3X Touch internal flight plan.
 */
export type G3XFmsFplLoadedApproachData = {
  /** The ICAO of the loaded approach airport. */
  airportIcao: string;

  /** The index of the published approach on which the loaded VFR approach is based. */
  approachIndex: number;

  /** The loaded VFR approach procedure. */
  approach: GarminVfrApproachProcedure;
};

/**
 * Mappings from G3X Touch flight plan user data keys to their data types.
 */
export type G3XFmsFplUserDataTypeMap = FmsFplUserDataTypeMap & {
  /** Data describing the flight plan's loaded approach. */
  [G3XFmsFplUserDataKey.LoadedApproach]: Readonly<G3XFmsFplLoadedApproachData>;
};
