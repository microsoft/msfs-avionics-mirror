import { GeoPointInterface, Subscribable } from '@microsoft/msfs-sdk';

import { ObsSuspModes } from '@microsoft/msfs-garminsdk';

import { G3000NavIndicator } from '@microsoft/msfs-wtg3000-common';

/**
 * A data provider for an HSI.
 */
export interface HsiDataProvider {
  /** The current magnetic heading, in degrees. */
  readonly headingMag: Subscribable<number>;

  /** The current turn rate, in degrees per second. */
  readonly turnRate: Subscribable<number>;

  /** The current magnetic ground track, in degrees. */
  readonly trackMag: Subscribable<number>;

  /** The current position of the plane. */
  readonly position: Subscribable<GeoPointInterface>;

  /** The magnetic variation at the plane's current position, in degrees. */
  readonly magVar: Subscribable<number>;

  /** The nav indicator for the active nav source. */
  readonly activeNavIndicator: G3000NavIndicator;

  /** The nav indicator for the approach course preview. */
  readonly approachPreviewIndicator: G3000NavIndicator;

  /** The nav indicator for bearing pointer 1. */
  readonly bearing1Indicator: G3000NavIndicator;

  /** The nav indicator for bearing pointer 2. */
  readonly bearing2Indicator: G3000NavIndicator;

  /** The current selected magnetic heading, in degrees. */
  readonly selectedHeadingMag: Subscribable<number>;

  /** Whether HDG sync mode is active. */
  readonly isHdgSyncModeActive: Subscribable<boolean>;

  /** The current LNAV cross-track error, in nautical miles, or `null` if LNAV is not tracking a path. */
  readonly lnavXtk: Subscribable<number | null>;

  /** The current LNAV OBS/suspend mode. */
  readonly obsSuspMode: Subscribable<ObsSuspModes>;

  /** The current magnetic OBS course, in degrees. */
  readonly obsCourse: Subscribable<number>;

  /** Whether heading data is in a failure state. */
  readonly isHeadingDataFailed: Subscribable<boolean>;

  /** Whether GPS data is in a failure state. */
  readonly isGpsDataFailed: Subscribable<boolean>;
}
