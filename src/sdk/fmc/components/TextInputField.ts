import { AbstractFmcPage } from '../AbstractFmcPage';
import { FmcFormatter, Validator } from '../FmcFormat';
import { LineSelectKeyEvent } from '../FmcInteractionEvents';
import { EditableField, EditableFieldOptions } from './EditableField';

/**
 * Input field options
 */
export interface TextInputFieldOptions<T, V> extends EditableFieldOptions<T> {
  /**
   * Validator object
   */
  formatter: FmcFormatter<T> & Validator<V>,

  /**
   * Whether CLR DEL lsk events push a null value
   */
  deleteAllowed?: boolean,

  /**
   * Whether the scratchpad is cleared when a new value is accepted. `true` by default.
   */
  clearScratchpadOnValueAccepted?: boolean,

  /**
   * Optional callback fired when the value is about to be modified. This is only called when a value is successfully validated.
   *
   * This should be used when there is no appropriate way of using a modifiable data source to accept modifications from this input field.
   *
   * An example of this is a complex process like inserting a flight plan leg, or something calling a distant modification
   * process with a very indirect relationship to the input data.
   *
   * If the return value is:
   * - `true`   -> the handler **is** considered to have handled the call, and any bound data is **not** modified.
   * - `false`  -> the handler is **not** considered to have handled the call itself, and any bound data **is** modified.
   * - `string` -> the value is shown in the scratchpad, and the handler is considered to have handled the call.
   * - error    -> the error is thrown and handled by `FmcScreen::handleLineSelectKey`
   */
  onModified?: (newValue: V) => Promise<boolean | string>,

}

/**
 * An {@link FmcComponent} for displaying and accepting new values according to a validator and formatter.
 *
 * ## deleteAllowed
 *
 * This class deals with LSK presses that have the DELETE flag active using a default implementation
 * of {@link FmcComponentOptions.onDelete}, which checks `options.deleteAllowed` - if `true` or not set,the `onValidLskInput` subject
 * is set to `null` - if `false`, the "INVALID DELETE" scratchpad message is returned and handled by {@link FmcComponent.handleSelectKey}.
 *
 * ## onModified
 *
 * This class also introduces another LSK handler, {@link InputFieldOptions.onModified}, which is run after a value has been
 * validated (it is not called for invalid values) and applies return value logic. This runs after the flow
 * described for {@link FmcComponent}.
 */
export class TextInputField<T = string, V = T> extends EditableField<T, V> {

  /** @inheritDoc */
  public constructor(
    page: AbstractFmcPage,
    readonly options: TextInputFieldOptions<T, V>,
  ) {
    super(page, options);

    // Default `onDelete` behaviour for input fields
    if (this.options.onDelete === undefined) {
      this.options.onDelete = async (): Promise<string | boolean> => {
        if (this.options.deleteAllowed ?? true) {
          // We cannot check at runtime if the field can take null, so we kinda have to do that
          this.valueChanged.notify(this, null as unknown as V);

          // Always clear s-pad since it has DELETE in it
          this.page.screen.clearScratchpad();

          return true;
        } else {
          return Promise.reject(this.page.screen.options.textInputFieldDisallowedDeleteThrowValue);
        }
      };
    }
  }

  /**
   * Allows text input to be programmatically sent to the field.
   *
   * @param input the text input
   */
  public async takeTextInput(input: string): Promise<boolean | string> {
    return this.handleTextInputInternal(input);
  }

  /** @inheritDoc */
  protected async onHandleSelectKey(event: LineSelectKeyEvent): Promise<boolean | string> {
    if (event.isDelete) {
      if (this.options.deleteAllowed ?? true) {
        this.valueChanged.notify(this, null as unknown as V); // We cannot check at runtime if the field can take null, so we kinda have to do that

        // Always clear s-pad since it has DELETE in it
        this.page.screen.clearScratchpad();

        return true;
      } else {
        return Promise.reject(this.page.screen.options.textInputFieldDisallowedDeleteThrowValue);
      }
    }

    return this.handleTextInputInternal(event.scratchpadContents);
  }

  /**
   * Internal handling of text input
   *
   * @param text the input text
   */
  private async handleTextInputInternal(text: string): Promise<boolean | string> {
    const parsedValue = await this.options.formatter.parse(text);

    if (parsedValue !== null) {
      // Process an `onModified` hook if we have one
      if (this.options.onModified) {
        const onModifiedResult = await this.options.onModified(parsedValue);

        // If the hook returns `true`, we return its value but also run the side effect.
        // An error returned would throw an exception, so this would not run.
        if (onModifiedResult === true || typeof onModifiedResult === 'string') {
          if (this.options.clearScratchpadOnValueAccepted ?? true) {
            this.page.screen.clearScratchpad();
          }
        } else {
          this.valueChanged.notify(this, parsedValue);
        }

        if (onModifiedResult === false) {
          // Here, `false` means that the `onModified` hook did not handle the value - not that the LSK is inactive
          // so we return `true` and clear the scratchpad instead, as we presume the hook did what it wanted

          if (this.options.clearScratchpadOnValueAccepted ?? true) {
            this.page.screen.clearScratchpad();
          }

          return true;
        }

        return onModifiedResult;
      } else {
        this.valueChanged.notify(this, parsedValue);

        if (this.options.clearScratchpadOnValueAccepted ?? true) {
          this.page.screen.clearScratchpad();
        }

        return true;
      }
    } else {
      return Promise.reject(this.page.screen.options.textInputFieldParseFailThrowValue);
    }
  }
}
