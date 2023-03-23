import { Subject } from '@microsoft/msfs-sdk';

/**
 * Orientation types for a map.
 */
export enum MapOrientation {
  NorthUp,
  TrackUp,
  HeadingUp
}

/**
 * A module describing the map orientation.
 */
export class MapOrientationModule {
  /** The orientation of the map. */
  public readonly orientation = Subject.create(MapOrientation.HeadingUp);
}