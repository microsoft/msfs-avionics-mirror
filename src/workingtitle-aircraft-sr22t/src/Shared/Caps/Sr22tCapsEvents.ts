import { Sr22tCapsState } from './Sr22tCapsTypes';

/**
 * Events related to Cirrus SR22T CAPS.
 */
export interface Sr22tCapsEvents {
  /** The current state of CAPS. */
  sr22t_caps_state: Sr22tCapsState;
}
