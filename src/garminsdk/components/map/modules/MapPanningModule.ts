import { GeoPoint, GeoPointSubject, Subject } from '@microsoft/msfs-sdk';

/**
 * A module describing manual panning of the map.
 */
export class MapPanningModule {
  /** Whether panning is active. */
  public readonly isActive = Subject.create(false);

  /** The desired map target. */
  public readonly target = GeoPointSubject.create(new GeoPoint(0, 0));
}