import { ToldLandingParameters, ToldLandingPerformanceResult, ToldTakeoffParameters, ToldTakeoffPerformanceResult } from './ToldTypes';

/**
 * A TOLD (takeoff/landing) performance database.
 */
export interface ToldDatabase {
  /**
   * Gets a string describing this database's version.
   * @returns A string describing this database's version.
   */
  getVersionString(): string;

  /**
   * Calculates takeoff performance values.
   * @param params The takeoff parameters to use for the calculation.
   * @param out The object to which to write the results.
   * @returns The calculated takeoff performance values for the specified parameters.
   */
  calculateTakeoffPerformance(params: Readonly<ToldTakeoffParameters>, out: ToldTakeoffPerformanceResult): ToldTakeoffPerformanceResult;

  /**
   * Calculates landing performance values.
   * @param params The landing parameters to use for the calculation.
   * @param out The object to which to write the results.
   * @returns The calculated landing performance values for the specified parameters.
   */
  calculateLandingPerformance(params: Readonly<ToldLandingParameters>, out: ToldLandingPerformanceResult): ToldLandingPerformanceResult;
}