import { BasePublisher } from '@microsoft/msfs-sdk';

import { FmcAlphaEvent, FmcEvent, FmcMiscEvents, FmcPageEvent, FmcPrevNextEvent, FmcScratchpadInputEvent, FmcSelectKeysEvent } from '../FmcEvent';

/**
 * The type for `FmcEventPublisher`
 */
export interface FmcBtnEvents {

    /**
     * A page key `FmcEvent`.
     */
    fmcPageKeyEvent: FmcPageEvent,

    /**
     * An LSK or RSK `FmcEvent`.
     */
    fmcSelectKeyEvent: FmcSelectKeysEvent,

    /**
     * A PREV or NEXT FmcEvent`.
     */
    fmcPrevNextKeyEvent: FmcPrevNextEvent,

    /**
     * A scratchpad input `FmcEvent`.
     */
    fmcScratchpadInput: FmcScratchpadInputEvent,

    /**
     * An FMC EXEC Event.
     */
    fmcExecEvent: FmcMiscEvents.BTN_EXEC,

    /**
     * An FMC Cancel Mod Event.
     */
    fmcCancelModEvent: boolean,

    /**
     * An event indicating the state of keyboard input.
     */
    fmcActivateKeyboardInputEvent: boolean
}

/**
 * FmcEventPublisher
 */
export class FmcEventPublisher extends BasePublisher<FmcBtnEvents> {

    /**
     * Dispatches an `FmcEvent` to the event bus.
     *
     * @param event The `FmcEvent` to dispatch.
     * @param sync Whether this event should be synced (optional, default false)
     */
    public dispatchHEvent(event: FmcEvent, sync = false): void {
        if (isPageEvent(event)) {
            this.publish('fmcPageKeyEvent', event, sync);
        } else if (isSelectKeyEvent(event)) {
            this.publish('fmcSelectKeyEvent', event, sync);
        } else if (isPrevNextEvent(event)) {
            this.publish('fmcPrevNextKeyEvent', event, sync);
        } else if (isAlphaEvent(event) || event == FmcMiscEvents.BTN_CLR_DEL || event == FmcMiscEvents.BTN_CLR_DEL_LONG) {
            this.publish('fmcScratchpadInput', event, sync);
        } else if (event == FmcMiscEvents.BTN_EXEC) {
            this.publish('fmcExecEvent', event, sync);
        }
    }

}

/**
 * Returns `true` if the event is an `FmcPageEvent`
 *
 * @param event an `FmcEvent`
 * @returns boolean
 */
function isPageEvent(event: FmcEvent): event is FmcPageEvent {
    return event in FmcPageEvent;
}

/**
 * Returns `true` if the event is an `FmcSelectKeysEvent`
 *
 * @param event an `FmcEvent`
 * @returns boolean
 */
function isSelectKeyEvent(event: FmcEvent): event is FmcSelectKeysEvent {
    return event in FmcSelectKeysEvent;
}

/**
 * Returns `true` if the event is an `FmcPrevNextEvent`
 *
 * @param event an `FmcEvent`
 * @returns boolean
 */
function isPrevNextEvent(event: FmcEvent): event is FmcPrevNextEvent {
    return event in FmcPrevNextEvent;
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
