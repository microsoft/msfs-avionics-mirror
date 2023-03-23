import { Subject } from '@microsoft/msfs-sdk';

import { AirportSize } from '../../../navigation/AirportWaypoint';

/**
 * A module describing the display of waypoints.
 */
export class MapWaypointsModule {
  /** Whether to show airports. */
  public readonly airportShow: Record<AirportSize, Subject<boolean>> = {
    [AirportSize.Large]: Subject.create<boolean>(true),
    [AirportSize.Medium]: Subject.create<boolean>(true),
    [AirportSize.Small]: Subject.create<boolean>(true)
  };

  /** Whether to show VORs. */
  public readonly vorShow = Subject.create(true);

  /** Whether to show NDBs. */
  public readonly ndbShow = Subject.create(true);

  /** Whether to show intersections. */
  public readonly intShow = Subject.create(true);

  /** Whether to show user waypoints. */
  public readonly userShow = Subject.create(true);

  /** Whether to show runway outlines and labels. */
  public readonly runwayShow = Subject.create(true);

  /** The minimum projected length of a runway, in pixels, required to show its label. */
  public readonly runwayLabelMinLength = Subject.create(50);
}