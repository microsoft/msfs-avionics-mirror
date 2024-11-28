import { AirportFacilityDataFlags } from '@microsoft/msfs-sdk';

/**
 * Provides utility functions for working with next-generation (NXi, G3000, etc) Garmin maps.
 */
export class NextGenGarminMapUtils {
  /** Bitflags describing the data required to be loaded in airport facilities used in maps. */
  public static readonly AIRPORT_DATA_FLAGS
    = AirportFacilityDataFlags.Frequencies
    | AirportFacilityDataFlags.Runways;
}
