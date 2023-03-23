import { Subject } from '@microsoft/msfs-sdk';

/**
 * A module describing the map range compass.
 */
export class MapRangeCompassModule {
  /** Whether to show the range compass. */
  public readonly show = Subject.create(true);
}