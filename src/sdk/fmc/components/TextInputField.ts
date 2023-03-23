import { AbstractFmcPage } from '../AbstractFmcPage';
import { Formatter, RawFormatter, RawValidator, Validator } from '../FmcFormat';
import { LineSelectKeyEvent } from '../FmcInteractionEvents';
import { EditableField, EditableFieldOptions } from './EditableField';

/**
 * Input field options
 */
export interface TextInputFieldOptions<T, V> extends EditableFieldOptions<T> {
  /**
   * Validator object
   */
  formatter: Formatter<T> & Validator<V>,

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
          return Promise.reject('INVALID DELETE');
        }
      };
    }
  }

  /**
   * Creates an {@link TextInputField} that uses a {@link RawValidator} and {@link RawFormatter}
   * @param page the parent {@link FmcPage}
   * @returns the {@link TextInputField}
   */
  public static createRawTextInput(page: AbstractFmcPage): TextInputField<string | null> {
    return new TextInputField<string | null, string | null>(page, {
      formatter: { ...RawFormatter, ...RawValidator },
    });
  }

  /** @inheritDoc */
  protected async onHandleSelectKey(event: LineSelectKeyEvent): Promise<boolean | string> {
    if (event.isDelete === true) {
      if (this.options.deleteAllowed ?? true) {
        this.valueChanged.notify(this, null as unknown as V); // We cannot check at runtime if the field can take null, so we kinda have to do that

        // Always clear s-pad since it has DELETE in it
        this.page.screen.clearScratchpad();

        return true;
      } else {
        return Promise.reject('INVALID DELETE');
      }
    }

    const parsedValue = await this.options.formatter.parse(event.scratchpadContents);

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
      return Promise.reject('INVALID ENTRY');
    }
  }

}
