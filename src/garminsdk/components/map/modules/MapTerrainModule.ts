import { Subject } from '@microsoft/msfs-sdk';

/**
 * Map terrain display mode.
 */
export enum MapTerrainMode {
  None,
  Absolute,
  Relative,
  Ground
}

/**
 * A module describing the display of terrain.
 */
export class MapTerrainModule {
  /** The terrain display mode. */
  public readonly terrainMode = Subject.create(MapTerrainMode.Absolute);

  /** Whether to show the terrain scale. */
  public readonly showScale = Subject.create<boolean>(false);

  /** Whether the relative terrain mode is in a failed state. */
  public readonly isRelativeModeFailed = Subject.create<boolean>(false);
}