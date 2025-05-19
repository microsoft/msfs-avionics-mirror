import { GarminTawsAlert, GarminTawsInhibit, GarminTawsStatus } from '../../terrain/GarminTawsTypes';
import { TerrainSystemAnnunciationDef, TerrainSystemAnnunciationLevel, TerrainSystemAnnunciationPriorityDef } from './TerrainSystemAnnunciation';

/**
 * A utility class for generating definitions for next-generation (NXi, G3000, etc) Garmin TAWS annunciations.
 */
export class NextGenTawsAnnunciationDefs {
  /**
   * Creates a new definition for test mode.
   * @returns A new definition for test mode.
   */
  public static testMode(): TerrainSystemAnnunciationDef {
    return {
      level: TerrainSystemAnnunciationLevel.Advisory,
      text: 'TAWS TEST'
    };
  }

  /**
   * Creates a new record of definitions for status flags, keyed by flag.
   * @returns A new record of definitions for status flags, keyed by flag.
   */
  public static status(): Partial<Record<string, Readonly<TerrainSystemAnnunciationPriorityDef>>> {
    return {
      [GarminTawsStatus.TawsFailed]: {
        level: TerrainSystemAnnunciationLevel.Caution,
        priority: 0,
        text: 'TAWS FAIL'
      },

      [GarminTawsStatus.GpwsFailed]: {
        level: TerrainSystemAnnunciationLevel.Caution,
        priority: -10,
        text: 'GPWS FAIL'
      },

      [GarminTawsStatus.TawsNotAvailable]: {
        level: TerrainSystemAnnunciationLevel.Caution,
        priority: -20,
        text: 'TAWS N/A'
      }
    };
  }

  /**
   * Creates a new record of definitions for inhibit flags, keyed by flag.
   * @returns A new record of definitions for inhibit flags, keyed by flag.
   */
  public static inhibit(): Partial<Record<string, Readonly<TerrainSystemAnnunciationPriorityDef>>> {
    return {
      [GarminTawsInhibit.FltaPda]: {
        level: TerrainSystemAnnunciationLevel.Advisory,
        priority: 0,
        text: 'TAWS INH'
      },

      [GarminTawsInhibit.Gpws]: {
        level: TerrainSystemAnnunciationLevel.Advisory,
        priority: -10,
        text: 'GPWS INH'
      },

      [GarminTawsInhibit.FitFlaps]: {
        level: TerrainSystemAnnunciationLevel.Advisory,
        priority: -20,
        text: 'FLAP OVR'
      },

      [GarminTawsInhibit.GsdGlideslope]: {
        level: TerrainSystemAnnunciationLevel.Advisory,
        priority: -30,
        text: 'GS INH'
      },

      [GarminTawsInhibit.GsdGlidepath]: {
        level: TerrainSystemAnnunciationLevel.Advisory,
        priority: -30,
        text: 'GP INH'
      }
    };
  }

  /**
   * Creates a new record of definitions for alerts, keyed by alert.
   * @returns A new record of definitions for alerts, keyed by alert.
   */
  public static alert(): Partial<Record<string, Readonly<TerrainSystemAnnunciationDef>>> {
    return {
      [GarminTawsAlert.RtcWarning]: {
        level: TerrainSystemAnnunciationLevel.Warning,
        text: 'PULL UP'
      },

      [GarminTawsAlert.ItiWarning]: {
        level: TerrainSystemAnnunciationLevel.Warning,
        text: 'PULL UP'
      },

      [GarminTawsAlert.RocWarning]: {
        level: TerrainSystemAnnunciationLevel.Warning,
        text: 'PULL UP'
      },

      [GarminTawsAlert.IoiWarning]: {
        level: TerrainSystemAnnunciationLevel.Warning,
        text: 'PULL UP'
      },

      [GarminTawsAlert.EdrWarning]: {
        level: TerrainSystemAnnunciationLevel.Warning,
        text: 'PULL UP'
      },

      [GarminTawsAlert.EcrWarning]: {
        level: TerrainSystemAnnunciationLevel.Warning,
        text: 'PULL UP'
      },

      [GarminTawsAlert.RtcCaution]: {
        level: TerrainSystemAnnunciationLevel.Caution,
        text: 'TERRAIN'
      },

      [GarminTawsAlert.ItiCaution]: {
        level: TerrainSystemAnnunciationLevel.Caution,
        text: 'TERRAIN'
      },

      [GarminTawsAlert.RocCaution]: {
        level: TerrainSystemAnnunciationLevel.Caution,
        text: 'TERRAIN'
      },

      [GarminTawsAlert.IoiCaution]: {
        level: TerrainSystemAnnunciationLevel.Caution,
        text: 'TERRAIN'
      },

      [GarminTawsAlert.PdaCaution]: {
        level: TerrainSystemAnnunciationLevel.Caution,
        text: 'TERRAIN'
      },

      [GarminTawsAlert.EdrCaution]: {
        level: TerrainSystemAnnunciationLevel.Caution,
        text: 'TERRAIN'
      },

      [GarminTawsAlert.EcrCaution]: {
        level: TerrainSystemAnnunciationLevel.Caution,
        text: 'TERRAIN'
      },

      [GarminTawsAlert.FitTerrainCaution]: {
        level: TerrainSystemAnnunciationLevel.Caution,
        text: 'TERRAIN'
      },

      [GarminTawsAlert.FitTerrainGearCaution]: {
        level: TerrainSystemAnnunciationLevel.Caution,
        text: 'TERRAIN'
      },

      [GarminTawsAlert.FitTerrainFlapsCaution]: {
        level: TerrainSystemAnnunciationLevel.Caution,
        text: 'TERRAIN'
      },

      [GarminTawsAlert.FitGearCaution]: {
        level: TerrainSystemAnnunciationLevel.Caution,
        text: 'TERRAIN'
      },

      [GarminTawsAlert.FitFlapsCaution]: {
        level: TerrainSystemAnnunciationLevel.Caution,
        text: 'TERRAIN'
      },

      [GarminTawsAlert.FitTakeoffCaution]: {
        level: TerrainSystemAnnunciationLevel.Caution,
        text: 'TERRAIN'
      },

      [GarminTawsAlert.NcrCaution]: {
        level: TerrainSystemAnnunciationLevel.Caution,
        text: 'TERRAIN'
      },

      [GarminTawsAlert.GsdGlideslopeCaution]: {
        level: TerrainSystemAnnunciationLevel.Caution,
        text: 'GLIDESLOPE'
      },

      [GarminTawsAlert.GsdGlidepathCaution]: {
        level: TerrainSystemAnnunciationLevel.Caution,
        text: 'GLIDEPATH'
      },
    };
  }
}