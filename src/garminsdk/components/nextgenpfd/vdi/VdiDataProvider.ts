import { Subscribable } from '@microsoft/msfs-sdk';

import { GlidepathServiceLevel } from '../../../autopilot/vnav/GarminVNavTypes';

/**
 * A data provider for a vertical deviation indicator.
 */
export interface VdiDataProvider {
  /** Whether a glideslope is available. */
  readonly hasGs: Subscribable<boolean>;

  /** The current glideslope deviation. */
  readonly gsDeviation: Subscribable<number | null>;

  /** Whether the current glideslope deviation is a preview. */
  readonly gsDeviationIsPreview: Subscribable<boolean>;

  /** Whether a glidepath is available. */
  readonly hasGp: Subscribable<boolean>;

  /** The current glidepath service level. */
  readonly gpServiceLevel: Subscribable<GlidepathServiceLevel>;

  /** The current glidepath deviation. */
  readonly gpDeviation: Subscribable<number | null>;

  /** Whether the current glidepath deviation is a preview. */
  readonly gpDeviationIsPreview: Subscribable<boolean>;

  /** The current glidepath deviation scale, in feet. */
  readonly gpDeviationScale: Subscribable<number | null>;

  /** Whether a VNAV path is available. */
  readonly hasVNav: Subscribable<boolean>;

  /** The current VNAV vertical deviation. */
  readonly vnavDeviation: Subscribable<number | null>;

  /** Whether the active leg is past the final approach fix. */
  readonly isPastFaf: Subscribable<boolean>;
}