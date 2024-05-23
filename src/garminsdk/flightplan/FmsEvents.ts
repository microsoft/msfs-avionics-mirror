import { ApproachDetails, FmsFlightPhase } from './FmsTypes';

/**
 * Events published by `Fms` keyed by base topic names.
 */
export interface BaseFmsEvents {
  /** Details related to the primary flight plan approach. */
  fms_approach_details: Readonly<ApproachDetails>;

  /** Details related to the current FMS phase of flight. */
  fms_flight_phase: Readonly<FmsFlightPhase>;

  /** An approach was manually activated. */
  fms_approach_activate: void;

  /** Whether the primary flight plan's currently loaded approach is active and supports glidepath guidance. */
  approach_supports_gp: boolean;
}

/**
 * The event topic suffix for an `Fms` with a specific ID.
 */
type FmsEventSuffix<ID extends string> = ID extends '' ? '' : `_${ID}`;

/**
 * Events published by an `Fms` with a specific ID.
 */
export type FmsEventsForId<ID extends string> = {
  [P in keyof BaseFmsEvents as `${P}${FmsEventSuffix<ID>}`]: BaseFmsEvents[P];
};

/**
 * All possible events published by `Fms`.
 */
export interface FmsEvents extends BaseFmsEvents, FmsEventsForId<string> {
}