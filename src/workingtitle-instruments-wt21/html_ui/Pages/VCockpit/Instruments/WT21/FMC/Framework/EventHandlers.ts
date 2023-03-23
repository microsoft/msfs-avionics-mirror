import { FmcPrevNextEvent, FmcSelectKeysEvent } from '../FmcEvent';

/**
 * Interface for handling LSK events
 */
export interface SelectKeyHandler {
    /**
     * Handle an `FmcSelectKeysEvent` with scratchpad contents
     * @param event                 an `FmcSelectKeysEvent`
     * @param scratchpadContents    the scratchpad contents when the LSK/RSK was pressed
     * @param isDelete              whether the scratchpad was in DELETE mode
     * @returns a `Promise<boolean>` that must be resolved (optionally with a value to insert into the scratchpad)
     * when the entry is valid, or rejected with an error message to display otherwise
     */
    handleSelectKey(event: FmcSelectKeysEvent, scratchpadContents: string, isDelete: boolean): Promise<boolean | string>
}


/**
 * Interface for handling scroll events
 */
export interface ScrollKeyHandler {

    /**
     * Handle an `FmcPrevNextEvent`
     *
     * @param event an `FmcPrevNextEvent`
     */
    handleScrollKey(event: FmcPrevNextEvent): boolean

}
