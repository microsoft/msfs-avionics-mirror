import { BasePublisher } from '@microsoft/msfs-sdk';

import { FmcAlphaEvent, FmcEvent, FmcMiscEvents } from '../FmcEvent';
import { WT21FmcEvents } from '../WT21FmcEvents';

/**
 * The type for `FmcEventPublisher`
 */
export interface FmcBtnEvents {
  /**
   * An event indicating the state of keyboard input.
   */
  fmcActivateKeyboardInputEvent: boolean,
}

/**
 * FmcEventPublisher
 */
export class FmcEventPublisher extends BasePublisher<WT21FmcEvents> {
  /**
   * Dispatches an `FmcEvent` to the event bus.
   *
   * @param event The `FmcEvent` to dispatch.
   * @param sync Whether this event should be synced (optional, default false)
   */
  public dispatchHEvent(event: FmcEvent, sync = false): void {
    if (isAlphaEvent(event)) {
      if (event === FmcAlphaEvent.BTN_PLUSMINUS) {
        this.publish('scratchpad_plus_minus', undefined);
      } else {
        let char = event.substring(4);
        if (char === 'DIV') {
          char = '/';
        } else if (char === 'DOT') {
          char = '.';
        } else if (char === 'SP') {
          char = ' ';
        }

        this.publish('scratchpad_type', char);
      }
    } else if (event === FmcMiscEvents.BTN_CLR_DEL) {
      this.publish('clear_del', undefined, sync);
    } else if (event === FmcMiscEvents.BTN_CLR_DEL_LONG) {
      this.publish('clear_del_long', undefined, sync);
    } else {
      this.publish(event, undefined, sync);
    }
  }
}

/**
 * Returns `true` if the event is an `FmcAlphaEvent`
 *
 * @param event an `FmcEvent`
 * @returns boolean
 */
function isAlphaEvent(event: FmcEvent): event is FmcAlphaEvent {
  return event in FmcAlphaEvent;
}
