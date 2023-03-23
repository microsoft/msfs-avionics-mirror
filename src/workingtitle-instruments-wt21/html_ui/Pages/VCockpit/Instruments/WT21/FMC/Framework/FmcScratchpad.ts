import { DebounceTimer, EventBus } from '@microsoft/msfs-sdk';

import { FmcAlphaEvent, FmcMiscEvents, FmcScratchpadInputEvent } from '../FmcEvent';
import { FmcBtnEvents } from './FmcEventPublisher';
import { FmcRenderer } from './FmcRenderer';

/**
 * Time until a scratchpad error disappears automatically
 */
const SCRATCHPAD_ERROR_TIMEOUT = 2_000;

enum BracketColor {
    NORMAL = 'blue',
    INVERT = 'bluebg'
}

/**
 * FMC Scratchpad
 */
export class FmcScratchpad {

    private _contents = '';

    private _error = '';
    private memorizedErrorTimeout: number | undefined = undefined;

    public isDelete = false;

    private bracketColor: BracketColor = BracketColor.NORMAL;
    private readonly blinkTimer: DebounceTimer = new DebounceTimer();

    /**
     * Get scratchpad contents
     *
     * @returns string
     */
    public get contents(): string {
        return this._contents;
    }

    /**
     * Construct an `FmcScratchpad` with an `EventBus`
     *
     * @param eventBus an `EventBus`
     * @param fmcRenderer the `FmcRenderer`
     */
    constructor(
        private readonly eventBus: EventBus,
        private readonly fmcRenderer: FmcRenderer,
    ) {
        this.hookup();
    }

    /**
     * Hooks up routing subscription
     */
    private hookup(): void {
        this.eventBus.getSubscriber<FmcBtnEvents>().on('fmcScratchpadInput').handle((data: FmcScratchpadInputEvent) => {
            this.handleScratchpadInput(data);
        });

        this.eventBus.getSubscriber<FmcBtnEvents>().on('fmcActivateKeyboardInputEvent').handle((isActive: boolean) => {
            this.blinkTimer.clear();
            this.bracketColor = BracketColor.NORMAL;
            if (isActive === true) {
                this.bracketColor = BracketColor.INVERT;
                this.scheduleBlink();
            }
            this.render();
        });
    }

    /**
     * Schedules a timer for changing the brackets color.
     * Used for indicating active keyboard input.
     */
    private scheduleBlink(): void {
        this.blinkTimer.schedule(() => {
            this.bracketColor = (this.bracketColor === BracketColor.NORMAL ? BracketColor.INVERT : BracketColor.NORMAL);
            this.render();
            this.scheduleBlink();
        }, 500);
    }

    /**
     * Handle a scratchpad input event
     *
     * @param event an `FmcEvent`
     * @private
     */
    private handleScratchpadInput(event: FmcScratchpadInputEvent): void {
        if (event === FmcAlphaEvent.BTN_SP) {
            this.isDelete = false;
            this._contents += ' ';
        } else if (event === FmcAlphaEvent.BTN_DIV) {
            this._contents += '/';
        } else if (event === FmcAlphaEvent.BTN_DOT) {
            this._contents += '.';
        } else if (event === FmcAlphaEvent.BTN_PLUSMINUS) {
            this.handlePlusMinus();
        } else if (event === FmcMiscEvents.BTN_CLR_DEL) {
            this.handleClrDel();
        } else if (event === FmcMiscEvents.BTN_CLR_DEL_LONG) {
            this.handleClrDel(true);
        } else {
            this.isDelete = false;
            this.showError('');
            this._contents += event.replace('BTN_', '');
        }

        this.render();
    }

    /** Handles +/- events */
    private handlePlusMinus(): void {
        if (this.contents.endsWith('-')) {
            this._contents = this._contents.replace(/-$/, '+');
        } else if (this.contents.endsWith('+')) {
            this._contents = this._contents.replace(/\+$/, '-');
        } else {
            this._contents += '-';
        }
    }

    /**
     * Handles CLR/DEL events
     * @param shouldClear if true, the whole scratchpad is cleared
     */
    private handleClrDel(shouldClear = false): void {
        if (this._error) {
            this.showError('');
        } else if (this.contents.length > 0) {
            this._contents = (shouldClear) ? '' : this._contents.substring(0, this._contents.length - 1);
        } else {
            this.isDelete = !this.isDelete;
        }
    }

    /**
     * Clears the scratchpad contents
     */
    public clear(): void {
        this._contents = '';
        this.isDelete = false;
    }

    /**
     * Shows an error on the scratchpad
     *
     * @param error the error to show
     */
    public showError(error: string): void {
        this._error = error;
        this.clearErrorTimeout();

        this.render();
    }

    /**
     * Clears the error timeout
     */
    private clearErrorTimeout(): void {
        if (this.memorizedErrorTimeout) {
            clearTimeout(this.memorizedErrorTimeout);
        }

        this.memorizedErrorTimeout = window.setTimeout(() => {
            this._error = '';
            this.render();
        }, SCRATCHPAD_ERROR_TIMEOUT);
    }

    /**
     * Puts a value on the scratchpad
     *
     * @param value the value to set to scratchpad to
     */
    public showValue(value: string): void {
        this._error = '';
        this.isDelete = false;
        this.clearErrorTimeout();

        this._contents = value;
    }

    /**
     * Forces a re-render of the scratchpad
     */
    public render(): void {
        let text = '';
        let error = '';
        if (this._error.length > 0) {
            error = this._error;
        } else if (this.isDelete) {
            text = 'DELETE';
        } else {
            text = this._contents;
        }

        if (text) {
            text += '[white d-text]';
        }
        if (error) {
            error += '[white d-text]';
        }

        // Text is normally left aligned, but errors should be centered
        this.fmcRenderer.editOutputTemplate([
            [`__LSB[${this.bracketColor} d-text]${text}`, `__RSB[${this.bracketColor} d-text]`, error],
        ], 13);
    }

}
