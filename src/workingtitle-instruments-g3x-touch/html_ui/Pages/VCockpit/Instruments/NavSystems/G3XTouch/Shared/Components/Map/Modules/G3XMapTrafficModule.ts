import { Subject } from '@microsoft/msfs-sdk';

import { MapGarminTrafficModule, TrafficSystem } from '@microsoft/msfs-garminsdk';

/**
 * Traffic system data sources supported by the G3X Touch.
 */
export enum G3XTrafficSystemSource {
  /** No traffic source. */
  None = 'None',

  /** GTS-8xx traffic advisory system. Provides active surveillance and optionally ADS-B traffic. */
  Gts = 'GTS',

  /** GTX transponder. Provides TIS-A and optionally ADS-B traffic. */
  Gtx = 'GTX',

  /** GDL data link. Provides TIS-B and ADS-B traffic. */
  Gdl = 'GDL'
}

/**
 * A module describing the display of traffic for G3X Touch maps.
 */
export class G3XMapTrafficModule extends MapGarminTrafficModule {
  /** The current traffic data source. */
  public readonly source = Subject.create(G3XTrafficSystemSource.None);

  /**
   * Constructor.
   * @param trafficSystem This module's associated traffic system.
   */
  constructor(public readonly trafficSystem: TrafficSystem) {
    super(trafficSystem);
  }
}