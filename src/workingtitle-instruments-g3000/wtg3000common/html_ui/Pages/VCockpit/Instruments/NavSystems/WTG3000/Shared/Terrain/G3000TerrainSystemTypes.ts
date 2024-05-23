import { GarminTawsVoiceCalloutAltitude, TerrainSystemType } from '@microsoft/msfs-garminsdk';

/**
 * Terrain system types supported by the G3000/G5000.
 */
export type G3000TerrainSystemType = TerrainSystemType.TawsA | TerrainSystemType.TawsB;

// Re-export for backwards compatibility.
/**
 * Supported touchdown callout altitudes (in feet AGL).
 */
export type TouchdownCalloutAltitude = GarminTawsVoiceCalloutAltitude;
