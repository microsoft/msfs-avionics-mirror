import { GarminTawsAlert } from '../../GarminTawsTypes';

/**
 * Alerts issued by `GarminExcessiveDescentRateModule`.
 */
export type GarminExcessiveDescentRateAlert = GarminTawsAlert.EdrWarning | GarminTawsAlert.EdrCaution;
