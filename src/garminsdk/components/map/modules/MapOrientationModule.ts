import { Subject } from '@microsoft/msfs-sdk';

/**
 * Orientation types for a map.
 */
export enum MapOrientation {
  NorthUp,
  TrackUp,
  HeadingUp,
  DtkUp
}

/**
 * A module describing the map orientation.
 */
export class MapOrientationModule {
  /** The actual orientation of the map. */
  public readonly orientation = Subject.create(MapOrientation.HeadingUp);

  /** The desired orientation of the map. */
  public readonly desiredOrientation = Subject.create(MapOrientation.HeadingUp);

  /** The map orientation commanded by the user. */
  public readonly commandedOrientation = Subject.create(MapOrientation.HeadingUp);

  /** Whether north up-above is active. */
  public readonly northUpAboveActive = Subject.create(false);

  /** The range index above which north up-above applies. */
  public readonly northUpAboveRangeIndex = Subject.create(Infinity);

  /** Whether north up on ground is active. */
  public readonly northUpOnGroundActive = Subject.create(false);
}