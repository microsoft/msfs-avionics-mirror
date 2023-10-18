import { Subject } from '@microsoft/msfs-sdk';

/**
 * A module describing the terrain display state of the map.
 */
export class MapTerrainStateModule {
  /** The terrain/weather display state. */
  public readonly displayTerrain = Subject.create<boolean>(false);
}