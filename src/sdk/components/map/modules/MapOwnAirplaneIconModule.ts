import { Subject } from '../../../sub/Subject';

/**
 * Map own airplane icon orientations.
 */
export enum MapOwnAirplaneIconOrientation {
  HeadingUp = 'HeadingUp',
  TrackUp = 'TrackUp',
  MapUp = 'MapUp'
}

/**
 * A module describing properties of the own airplane icon.
 */
export class MapOwnAirplaneIconModule {
  /** Whether to show the airplane icon. */
  public readonly show = Subject.create(true);

  /** The orientation of the airplane icon. */
  public readonly orientation = Subject.create(MapOwnAirplaneIconOrientation.HeadingUp);
}