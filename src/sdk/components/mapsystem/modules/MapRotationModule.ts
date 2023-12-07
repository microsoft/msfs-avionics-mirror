import { Subject } from '../../../sub/Subject';

/**
 * An enumeration of possible map rotation types.
 */
export enum MapRotation {
  /** Map up position does not follow a defined pattern. */
  Undefined = 'Undefined',

  /** Map up position points towards true north. */
  NorthUp = 'NorthUp',

  /** Map up position points towards the current airplane track. */
  TrackUp = 'TrackUp',

  /** Map up position points towards the current airplane heading. */
  HeadingUp = 'HeadingUp',

  /** Map up position points towards the current desired track. */
  DtkUp = 'DtkUp'
}

/**
 * A module describing the rotation behavior of the map.
 */
export class MapRotationModule {
  /** The type of map rotation to use. */
  public readonly rotationType = Subject.create(MapRotation.HeadingUp);

  /** The desired track, in degrees true. */
  public readonly dtk = Subject.create<number>(0);
}