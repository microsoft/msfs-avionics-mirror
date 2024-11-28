import { AirportWaypoint } from '@microsoft/msfs-garminsdk';
import { Subject } from '@microsoft/msfs-sdk';

/**
 * A module that controls display of airport runways.
 */
export class AirportRunwayDisplayModule {

  /** Whether or not runway labels should be displayed */
  public readonly displayLabels = Subject.create(true);

  /** Whether or not the runways themselves should be displayed. */
  public readonly displayRunways = Subject.create(true);

  /**
   * Highlights an airport which may not already be contained in the set of
   * nearest airports to already be displayed.
   */
  public readonly focusAirport = Subject.create<AirportWaypoint | undefined>(undefined);
}