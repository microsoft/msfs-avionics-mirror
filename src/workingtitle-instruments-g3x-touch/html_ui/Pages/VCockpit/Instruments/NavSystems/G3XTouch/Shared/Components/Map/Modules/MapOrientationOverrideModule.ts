import { Subject } from '@microsoft/msfs-sdk';

import { MapOrientation } from '@microsoft/msfs-garminsdk';

/**
 * A module describing the map orientation.
 */
export class MapOrientationOverrideModule {
  /** The actual orientation of the map. */
  public readonly orientationOverride = Subject.create<MapOrientation | null>(null);
}