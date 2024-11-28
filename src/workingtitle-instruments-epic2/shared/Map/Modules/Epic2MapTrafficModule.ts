import { MapTrafficModule, Subject } from '@microsoft/msfs-sdk';

/**
 * A module describing the display of traffic.
 */
export class Epic2MapTrafficModule extends MapTrafficModule {
  /** The motion vector visibility. */
  public readonly motionVectorVisible = Subject.create(true);
}
