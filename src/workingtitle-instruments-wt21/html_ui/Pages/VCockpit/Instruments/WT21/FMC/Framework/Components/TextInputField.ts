import { FmcSelectKeysEvent } from '../../FmcEvent';
import { Formatter, RawFormatter, RawValidator, Validator } from '../FmcFormats';
import { FmcPage } from '../FmcPage';
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
   * Optional callback fired when the value is about to be modified. If `true` is returned, any data source is not notified.
   * This is only called when a value is successfully validated.
   *
   * This should be used when there is no appropriate way of using a modifiable data source to accept modifications from this input field.
   *
   * An example of this is a complex process like inserting a flight plan leg, or something calling a distant modification
   * process with a very indirect relationship to the input data.
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
    page: FmcPage,
    protected readonly options: TextInputFieldOptions<T, V>,
  ) {
    super(page, options);

    // Default `onDelete` behaviour for input fields
    if (this.options.onDelete === undefined) {
      this.options.onDelete = async (): Promise<string | boolean> => {
        if (this.options.deleteAllowed ?? true) {
          // We cannot check at runtime if the field can take null, so we kinda have to do that
          this.valueChanged.notify(this, null as unknown as V);

          // Always clear s-pad since it has DELETE in it
          this.page.clearScratchpad();

          return true;
        } else {
          return Promise.reject('INVALID DELETE');
        }
      };
    }
  }

  // /**
  //  * Creates an {@link TextInputField}
  //  * @param page    the parent {@link FmcPage}
  //  * @param options parameters for the input field
  //  * @returns the {@link TextInputField}
  //  */
  // public static create<T = string, V = T>(page: FmcPage, options: TextInputFieldOptions<T, V>): TextInputField<T, V> {
  //   return new TextInputField<T, V>(page, options);
  // }

  /**
   * Creates an {@link TextInputField} that uses a {@link RawValidator} and {@link RawFormatter}
   * @param page the parent {@link FmcPage}
   * @returns the {@link TextInputField}
   */
  public static createRawTextInput(page: FmcPage): TextInputField<string | null> {
    return new TextInputField<string | null, string | null>(page, {
      formatter: { ...RawFormatter, ...RawValidator },
    });
  }

  /** @inheritDoc */
  public async onHandleSelectKey(event: FmcSelectKeysEvent, scratchpadContents: string, isDelete: boolean): Promise<boolean | string> {
    if (isDelete) {
      if (this.options.deleteAllowed ?? true) {
        this.valueChanged.notify(this, null as unknown as V); // We cannot check at runtime if the field can take null, so we kinda have to do that

        // Always clear s-pad since it has DELETE in it
        this.page.clearScratchpad();

        return true;
      } else {
        return Promise.reject('INVALID DELETE');
      }
    }

    const parsedValue = await this.options.formatter.parse(scratchpadContents);

    if (parsedValue !== null) {
      // Process an `onModified` hook if we have one
      if (this.options.onModified) {
        const onModifiedResult = await this.options.onModified(parsedValue);

        // If the hook returns `true`, we still want to run the scratchpad logic. Otherwise, we modify the bound data like normal.
        if (onModifiedResult === true) {
          if (this.options.clearScratchpadOnValueAccepted ?? true) {
            this.page.clearScratchpad();
          }
        } else {
          this.valueChanged.notify(this, parsedValue);
        }

        // Anything else is still returned, like error messages or new scratchpad contents
        return onModifiedResult;
      } else {
        this.valueChanged.notify(this, parsedValue);

        if (this.options.clearScratchpadOnValueAccepted ?? true) {
          this.page.clearScratchpad();
        }

        return true;
      }
    } else {
      return Promise.reject('INVALID ENTRY');
    }
  }

}
