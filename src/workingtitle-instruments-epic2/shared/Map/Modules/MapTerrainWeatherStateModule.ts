import { Subject } from '@microsoft/msfs-sdk';

import { TerrWxState } from '../EpicMapCommon';

export enum TERRAIN_MODE {
  OFF,
  GEO,
  SA
}

/**
 * A module describing the terrain/weather display state of the map.
 */
export class MapTerrainWeatherStateModule {
  /** The terrain/weather display state. */
  public readonly state = Subject.create<TerrWxState>('OFF');
  public readonly terrainMode = Subject.create<TERRAIN_MODE>(TERRAIN_MODE.GEO);
}
