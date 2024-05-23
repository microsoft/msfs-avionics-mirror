import { GarminTawsAlert } from '../../GarminTawsTypes';

/**
 * Alerts issued by `GarminExcessiveClosureRateModule`.
 */
export type GarminExcessiveClosureRateAlert = GarminTawsAlert.EcrWarning | GarminTawsAlert.EcrCaution;
