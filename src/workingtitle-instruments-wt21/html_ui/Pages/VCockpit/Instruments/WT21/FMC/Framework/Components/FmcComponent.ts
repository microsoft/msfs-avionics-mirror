import { FmcPrevNextEvent, FmcSelectKeysEvent } from '../../FmcEvent';
import { ScrollKeyHandler, SelectKeyHandler } from '../EventHandlers';
import { FmcPage } from '../FmcPage';
import { FmcRenderTemplate } from '../FmcRenderer';

/**
 * Base options for initializing an {@link FmcComponent}
 */
export interface FmcComponentOptions {
  /** Disables this component, not handling any lsk events.  */
  disabled?: boolean,

  /**
   * Handler for an LSK pressed where the component is.
   * This is the second priority in terms of handling, after the FmcPage and before the component class onLsk function.
   *
   * This should be used in either of those two cases:
   *
   * - the component does not take user input but has LSK interactivity
   * - the component takes user input, but it is not validated (instead of using an InputField)
   *
   * If the return value is:
   * - `true`   -> the handler is considered to have handled the call, and no further handlers will be called
   * - `false`  -> the handler is not considered to have handled the call, and the next handlers will be called
   * - `string` -> the value is shown in the scratchpad, and the handler is considered to have handled the call
   */
  onSelected?: (scratchpadContents: string) => Promise<boolean | string>,

  /**
   * Whether to clear the s-pad when `onSelected` returns a string or `true`. Defaults to `true`.
   */
  clearScratchpadOnSelectedHandled?: boolean,

  /**
   * Handler for an LSK pressed in DELETE mode
   *
   * If the return value is:
   * - `true`   -> the handler is considered to have handled the call, and no further handlers will be called
   * - `false`  -> the handler is not considered to have handled the call, and the next handlers will be called
   * - `string` -> the value is shown in the scratchpad, and the handler is considered to have handled the call
   */
  onDelete?: () => Promise<boolean | string>,
}

/**
 * A class for defining FMC components
 *
 * ## LSK events
 *
 * This class hierarchy deals with LSK presses in the following order:
 *
 * 1. {@link handleSelectKey} - this is called by the page when it receives an LSk associated with the component
 * 2. IF the DELETE flag is set - call {@link FmcComponentOptions.onDelete} if it's present + apply return value logic - otherwise continue
 * 3. ELSE - call {@link FmcComponentOptions.onSelected} if it's present and apply return value logic - continue otherwise
 * 4. call {@link onHandleSelectKey} - overridden by a subclass
 */
export abstract class FmcComponent<O extends FmcComponentOptions = FmcComponentOptions> implements SelectKeyHandler, ScrollKeyHandler {

  /** @inheritDoc */
  protected constructor(
    protected readonly page: FmcPage,
    protected readonly options: O,
  ) {
  }

  /**
   * Invalidates the component and queues a re-render if one is not already queued
   */
  protected invalidate(): void {
    this.page.invalidate();
  }

  /**
   * Renders the FMC component into an FmcRenderTemplateRow
   */
  public abstract render(): FmcRenderTemplate | string

  protected abstract onHandleSelectKey(event: FmcSelectKeysEvent, scratchpadContents: string, isDelete: boolean): Promise<boolean | string>

  /** @inheritDoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async handleSelectKey(event: FmcSelectKeysEvent, scratchpadContents: string, isDelete: boolean): Promise<boolean | string> {
    if (this.options.disabled) {
      return false;
    }

    if (isDelete) {
      if (this.options.onDelete) {
        const result = await this.options.onDelete();

        if (result === true || typeof result === 'string') {
          if (this.options.clearScratchpadOnSelectedHandled ?? true) {
            this.page.clearScratchpad();
          }

          return result;
        }
      }
    }

    if (this.options.onSelected) {
      try {
        const result = await this.options.onSelected(scratchpadContents);

        if (result === true || typeof result === 'string') {
          if (this.options.clearScratchpadOnSelectedHandled ?? true) {
            this.page.clearScratchpad();
          }

          return result;
        }
      } catch (error) {
        return Promise.reject(error);
      }
    }

    return this.onHandleSelectKey(event, scratchpadContents, isDelete);
  }

  /**
   * Returns the component's options
   * @returns The options.
   */
  public getOptions(): O { return this.options; }

  /** @inheritDoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public handleScrollKey(event: FmcPrevNextEvent): boolean {
    return false;
  }

}
