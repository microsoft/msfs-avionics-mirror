import { IndexedEventType } from '../data/EventBus';

/**
 * Virtual throttle lever events.
 */
export interface VirtualThrottleLeverEvents {
  /** The position of an indexed virtual throttle lever. Ranges from -1 to +1. */
  [v_throttle_lever_pos: IndexedEventType<'v_throttle_lever_pos'>]: number;
}
