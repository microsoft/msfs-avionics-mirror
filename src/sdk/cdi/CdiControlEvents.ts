import { NavSourceId } from '../instruments/NavProcessor';

/**
 * Events used to control a CDI keyed by base topic names.
 */
export interface BaseCdiControlEvents {
  /** Switches the source of a CDI. */
  cdi_src_switch: void;

  /** Sets the source of a CDI. */
  cdi_src_set: Readonly<NavSourceId>;

  /** Toggles the source of a CDI between GPS and NAV. */
  cdi_src_gps_toggle: void;
}

/**
 * The event topic suffix used to control a CDI with a specific ID.
 */
type CdiControlEventSuffix<ID extends string> = ID extends '' ? '' : `_${ID}`;

/**
 * Events used to control a CDI with a specific ID.
 */
export type CdiControlEventsForId<ID extends string = string> = {
  [P in keyof BaseCdiControlEvents as `${P}${CdiControlEventSuffix<ID>}`]: BaseCdiControlEvents[P];
};

/**
 * All events used to control CDIs.
 */
export interface CdiControlEvents extends BaseCdiControlEvents, CdiControlEventsForId<string> {
}
