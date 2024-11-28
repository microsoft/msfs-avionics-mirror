import { ToldDatabase } from './ToldDatabase';
import { ToldLandingParameters, ToldLandingPerformanceResult, ToldTakeoffParameters, ToldTakeoffPerformanceResult } from './ToldTypes';

/**
 * A TOLD (takeoff/landing) performance calculation module.
 */
export interface ToldModule {
  /**
   * Gets a TOLD database.
   * @returns A TOLD database.
   */
  getDatabase(): ToldDatabase;

  /**
   * Checks whether a previously calculated takeoff performance result can be updated with new parameters after the
   * user has accepted takeoff V-speeds. The parameters that can change to trigger an update are limited to the
   * following: aircraft weight, temperature (if derived from ram air temperature sensors), and barometric pressure
   * setting. If the result is updated, the accepted takeoff V-speeds will be adjusted if necessary without being
   * cleared unless one or more takeoff limits are exceeded with the new parameters.
   * @param result The previously calculated takeoff performance result.
   * @param params The new takeoff performance calculation parameters.
   * @returns Whether the previously calculated takeoff performance result can be updated with new parameters.
   */
  canUpdateTakeoffResult(result: Readonly<ToldTakeoffPerformanceResult>, params: Readonly<ToldTakeoffParameters>): boolean;

  /**
   * Checks whether a previously calculated landing performance result can be updated with new parameters after the
   * user has accepted landing V-speeds. The only parameter that can change to trigger an update is landing weight.
   * If the result is updated, the accepted landing V-speeds will be adjusted if necessary without being cleared unless
   * one or more landing limits are exceeded with the new parameters.
   * @param result The previously calculated landing performance result.
   * @param params The new landing performance calculation parameters.
   * @returns Whether the previously calculated landing performance result can be updated with new parameters.
   */
  canUpdateLandingResult(result: Readonly<ToldLandingPerformanceResult>, params: Readonly<ToldLandingParameters>): boolean;
}