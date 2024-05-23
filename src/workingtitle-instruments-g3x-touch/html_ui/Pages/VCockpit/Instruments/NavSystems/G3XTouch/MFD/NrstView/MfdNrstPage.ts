import { Subscribable, Waypoint } from '@microsoft/msfs-sdk';

import { MfdPage, MfdPageProps } from '../PageNavigation/MfdPage';

/**
 * An MFD NRST page.
 */
export interface MfdNrstPage<P extends MfdPageProps = MfdPageProps> extends MfdPage<P> {
  /** This page's selected waypoint. */
  readonly selectedWaypoint: Subscribable<Waypoint | null>;
}