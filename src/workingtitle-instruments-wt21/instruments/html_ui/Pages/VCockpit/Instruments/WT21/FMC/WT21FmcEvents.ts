import { FmcEvent } from './FmcEvent';

/**
 * {@link FmcEvent} mapped to an interface for CDU framework compatibility
 */
export type BaseWT21FmcEvents = { [k in FmcEvent]: undefined }

/**
 * WT21 FMC events
 */
export interface WT21FmcEvents extends BaseWT21FmcEvents {
  /** Scratchpad typing */
  scratchpad_type: string,

  /** +/- key */
  scratchpad_plus_minus: void,

  /** CLR/DEL */
  clear_del: void,

  /** CLR/DEL long press */
  clear_del_long: void,
}
