import { BaseVNavEvents } from '@microsoft/msfs-sdk';

/**
 * Events published by Garmin VNAV keyed by base topic names.
 */
export interface BaseGarminVNavEvents extends BaseVNavEvents {
  /** Whether VNAV is enabled. */
  vnav_is_enabled: boolean;
}

/**
 * Events published by Garmin VNAV keyed by indexed topic names.
 */
export type IndexedGarminVNavEvents<Index extends number = number> = {
  [P in keyof BaseGarminVNavEvents as `${P}_${Index}`]: BaseGarminVNavEvents[P];
};

/**
 * Events published by Garmin VNAV.
 */
export interface GarminVNavEvents extends BaseGarminVNavEvents, IndexedGarminVNavEvents {
}