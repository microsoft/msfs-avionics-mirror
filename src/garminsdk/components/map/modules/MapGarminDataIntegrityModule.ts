import { MapDataIntegrityModule, Subject } from '@microsoft/msfs-sdk';

/**
 * A map module describing the integrity states of various data sources for Garmin maps.
 */
export class MapGarminDataIntegrityModule extends MapDataIntegrityModule {
  /** Whether or not airplane position data is derived from dead reckoning. */
  public readonly isDeadReckoning = Subject.create<boolean>(false);
}