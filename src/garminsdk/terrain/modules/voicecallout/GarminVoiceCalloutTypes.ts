import { GarminTawsAlert } from '../../GarminTawsTypes';

/**
 * Alerts issued by `GarminVoiceCalloutModule`.
 */
export type GarminVoiceCalloutAlert
  = GarminTawsAlert.Vco500
  | GarminTawsAlert.Vco450
  | GarminTawsAlert.Vco400
  | GarminTawsAlert.Vco350
  | GarminTawsAlert.Vco300
  | GarminTawsAlert.Vco250
  | GarminTawsAlert.Vco200
  | GarminTawsAlert.Vco150
  | GarminTawsAlert.Vco100
  | GarminTawsAlert.Vco50
  | GarminTawsAlert.Vco40
  | GarminTawsAlert.Vco30
  | GarminTawsAlert.Vco20
  | GarminTawsAlert.Vco10;