import { NavSourceId } from '../instruments/NavProcessor';

/**
 * CDI-related events keyed by base topic names.
 */
export interface BaseCdiEvents {
  /** The currently selected CDI source. */
  cdi_select: Readonly<NavSourceId>;
}

/**
 * The event topic suffix used by a CDI with a specific ID.
 */
type CdiEventSuffix<ID extends string> = ID extends '' ? '' : `_${ID}`;

/**
 * CDI-related events for a CDI with a specific ID.
 */
export type CdiEventsForId<ID extends string = string> = {
  [P in keyof BaseCdiEvents as `${P}${CdiEventSuffix<ID>}`]: BaseCdiEvents[P];
};

/**
 * All CDI-related events.
 */
export interface CdiEvents extends BaseCdiEvents, CdiEventsForId<string> {
}
