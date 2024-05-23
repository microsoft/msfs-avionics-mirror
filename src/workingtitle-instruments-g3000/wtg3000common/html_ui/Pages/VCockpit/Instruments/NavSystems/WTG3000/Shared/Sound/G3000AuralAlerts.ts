/**
 * G3000 aural alert IDs.
 */
export enum G3000AuralAlertIds {
  TawsRtc = 'g3000-taws-rtc',
  TawsIti = 'g3000-taws-iti',
  TawsRoc = 'g3000-taws-roc',
  TawsIoi = 'g3000-taws-ioi',
  TawsEdr = 'g3000-taws-edr',
  TawsEcr = 'g3000-taws-ecr',
  AutopilotDisconnect = 'g3000-autopilot-disconnect',
  AutopilotDisengage = 'g3000-autopilot-disengage',
  LandingGear = 'g3000-landing-gear',
  Minimums = 'g3000-minimums',
  CabinAltitude = 'g3000-cabin-altitude',
  CabinDeltaPressure = 'g3000-cabin-delta-pressure',
  MasterWarning = 'g3000-master-warning',
  TcasRA = 'g3000-tcas-ra',
  AutothrottleDisconnect = 'g3000-autothrottle-disconnect',
  AutothrottleDisengage = 'g3000-autothrottle-disengage',
  PfdAlert = 'g3000-pfd-alert',
  MasterCaution = 'g3000-master-caution',
  TawsPdaCaution = 'g3000-taws-pda-caution',
  TawsEdrCaution = 'g3000-taws-edr-caution',
  TawsEcrCaution = 'g3000-taws-ecr-caution',
  TawsNcrCaution = 'g3000-taws-ncr-caution',
  TouchdownCallout = 'g3000-touchdown-callout',
  TcasTA = 'g3000-tcas-ta',
  AltitudeAlert = 'g3000-altitude-alert',
  VerticalTrack = 'g3000-vertical-track',
  TawsAvailable = 'g3000-taws-available',
  GpwsAvailable = 'g3000-gpws-available',
  TawsNotAvailable = 'g3000-taws-not-available',
  GpwsNotAvailable = 'g3000-gpws-not-available',
  TawsFailed = 'g3000-taws-failed',
  GpwsFailed = 'g3000-gpws-failed',
  TawsTestPass = 'g3000-taws-test-pass',
  TawsTestFail = 'g3000-taws-test-fail'
}

/**
 * A utility class for working with G3000 aural alerts.
 */
export class G3000AuralAlertUtils {
  /** The name of the primary G3000 aural alert queue. */
  public static readonly PRIMARY_QUEUE = 'g3000-aural-primary';

  /** A map from G3000 aural alert IDs to their default priorities. */
  public static readonly PRIORITIES: Readonly<Record<G3000AuralAlertIds, number>> = {
    [G3000AuralAlertIds.TawsRtc]: -10,
    [G3000AuralAlertIds.TawsIti]: -10,
    [G3000AuralAlertIds.TawsRoc]: -10,
    [G3000AuralAlertIds.TawsIoi]: -10,
    [G3000AuralAlertIds.TawsEdr]: -10,
    [G3000AuralAlertIds.TawsEcr]: -10,
    [G3000AuralAlertIds.AutopilotDisconnect]: -20,
    [G3000AuralAlertIds.AutopilotDisengage]: -20,
    [G3000AuralAlertIds.LandingGear]: -30,
    [G3000AuralAlertIds.Minimums]: -40,
    [G3000AuralAlertIds.CabinAltitude]: -50,
    [G3000AuralAlertIds.CabinDeltaPressure]: -60,
    [G3000AuralAlertIds.MasterWarning]: -70,
    [G3000AuralAlertIds.TcasRA]: -80,
    [G3000AuralAlertIds.AutothrottleDisconnect]: -90,
    [G3000AuralAlertIds.AutothrottleDisengage]: -90,
    [G3000AuralAlertIds.PfdAlert]: -100,
    [G3000AuralAlertIds.MasterCaution]: -110,
    [G3000AuralAlertIds.TawsPdaCaution]: -120,
    [G3000AuralAlertIds.TawsEdrCaution]: -120,
    [G3000AuralAlertIds.TawsEcrCaution]: -120,
    [G3000AuralAlertIds.TawsNcrCaution]: -120,
    [G3000AuralAlertIds.TouchdownCallout]: -120,
    [G3000AuralAlertIds.TcasTA]: -130,
    [G3000AuralAlertIds.AltitudeAlert]: -140,
    [G3000AuralAlertIds.VerticalTrack]: -150,
    [G3000AuralAlertIds.TawsAvailable]: -160,
    [G3000AuralAlertIds.GpwsAvailable]: -160,
    [G3000AuralAlertIds.TawsNotAvailable]: -170,
    [G3000AuralAlertIds.GpwsNotAvailable]: -170,
    [G3000AuralAlertIds.TawsFailed]: -180,
    [G3000AuralAlertIds.GpwsFailed]: -180,
    [G3000AuralAlertIds.TawsTestPass]: -190,
    [G3000AuralAlertIds.TawsTestFail]: -200
  };
}