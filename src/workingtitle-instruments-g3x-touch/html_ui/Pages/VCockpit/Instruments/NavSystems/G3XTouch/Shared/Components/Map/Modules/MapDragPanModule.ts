import { GeoPoint, GeoPointSubject, Subject } from '@microsoft/msfs-sdk';

/**
 * A module describing the state of the map's drag-to-pan function.
 */
export class MapDragPanModule {
  /** Whether drag-to-pan is active. */
  public readonly isActive = Subject.create(false);

  /** The desired map target. */
  public readonly target = GeoPointSubject.create(new GeoPoint(0, 0));
}