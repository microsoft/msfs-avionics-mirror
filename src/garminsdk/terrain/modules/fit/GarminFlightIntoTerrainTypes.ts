import { GarminTawsAlert } from '../../GarminTawsTypes';

/**
 * Alerts issued by `GarminFlightIntoTerrainModule`.
 */
export type GarminFlightIntoTerrainAlert
  = GarminTawsAlert.FitTerrainCaution
  | GarminTawsAlert.FitTerrainGearCaution
  | GarminTawsAlert.FitTerrainFlapsCaution
  | GarminTawsAlert.FitGearCaution
  | GarminTawsAlert.FitFlapsCaution
  | GarminTawsAlert.FitTakeoffCaution;
