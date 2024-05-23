/**
 * Garmin TAWS status flags.
 */
export enum GarminTawsStatus {
  TawsFailed = 'TawsFailed',
  TawsNotAvailable = 'TawsNotAvailable',
  GpwsFailed = 'TawsGpwsFailed',
}

/**
 * Garmin TAWS inhibit flags.
 */
export enum GarminTawsInhibit {
  /** FLTA and PDA alerts inhibited. */
  FltaPda = 'TawsFltaPda',

  /** GPWS alerts (EDR, ECR, FIT, NCR) inhibited. */
  Gpws = 'TawsGpws',

  /** FIT alerts based on flap position inhibited. */
  FitFlaps = 'TawsFitFlaps',

  /** GSD glideslope alerts inhibited. */
  GsdGlideslope = 'TawsGsdGlideslope',

  /** GSD glidepath alerts inhibited. */
  GsdGlidepath = 'TawsGsdGlidepath',
}

/**
 * Voice callout altitudes, in feet AGL, supported by Garmin TAWS.
 */
export type GarminTawsVoiceCalloutAltitude = 500 | 450 | 400 | 350 | 300 | 250 | 200 | 150 | 100 | 50 | 40 | 30 | 20 | 10;

/**
 * Garmin TAWS alerts.
 */
export enum GarminTawsAlert {
  RtcWarning = 'TawsRtcWarning',
  RtcCaution = 'TawsRtcCaution',

  ItiWarning = 'TawsItiWarning',
  ItiCaution = 'TawsItiCaution',

  RocWarning = 'TawsRocWarning',
  RocCaution = 'TawsRocCaution',

  IoiWarning = 'TawsIoiWarning',
  IoiCaution = 'TawsIoiCaution',

  PdaCaution = 'TawsPdaCaution',

  EdrWarning = 'TawsEdrWarning',
  EdrCaution = 'TawsEdrCaution',

  EcrWarning = 'TawsEcrWarning',
  EcrCaution = 'TawsEcrCaution',

  FitTerrainCaution = 'TawsFitTerrainCaution',
  FitGearCaution = 'TawsFitGearCaution',
  FitFlapsCaution = 'TawsFitFlapsCaution',
  FitTakeoffCaution = 'TawsFitTakeoffCaution',

  NcrCaution = 'TawsNcrCaution',

  GsdGlideslopeCaution = 'TawsGsdGlideslopeCaution',
  GsdGlidepathCaution = 'TawsGsdGlidepathCaution',

  Vco500 = 'TawsVco500',
  Vco450 = 'TawsVco450',
  Vco400 = 'TawsVco400',
  Vco350 = 'TawsVco350',
  Vco300 = 'TawsVco300',
  Vco250 = 'TawsVco250',
  Vco200 = 'TawsVco200',
  Vco150 = 'TawsVco150',
  Vco100 = 'TawsVco100',
  Vco50 = 'TawsVco50',
  Vco40 = 'TawsVco40',
  Vco30 = 'TawsVco30',
  Vco20 = 'TawsVco20',
  Vco10 = 'TawsVco10'
}