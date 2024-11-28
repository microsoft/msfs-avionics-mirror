import { Subject } from '@microsoft/msfs-sdk';

/**
 * A map module that exposes the current GPS desired track.
 */
export class WaypointBearingModule {
  /** The current GPS DTK. */
  public readonly waypointBearing = Subject.create<number | undefined>(undefined);
}