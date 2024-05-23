import { TerrainSystemData } from './TerrainSystemTypes';

/**
 * A provider of Garmin terrain alerting system data.
 */
export interface TerrainSystemDataProvider {
  /** The current terrain system data. */
  readonly data: Readonly<TerrainSystemData>;
}
