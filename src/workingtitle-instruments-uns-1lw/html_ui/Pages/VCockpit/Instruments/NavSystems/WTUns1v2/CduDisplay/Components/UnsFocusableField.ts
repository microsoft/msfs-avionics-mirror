import { MutableAccessible, Subscribable } from '@microsoft/msfs-sdk';

import { UnsTextInputField } from './UnsTextInputField';

/**
 * Options for a {@link UnsFocusableField}
 */
export interface UnsFocusableFieldOptions {
  /**
   * Handler for an ENTER key pressed when the cursor is on the component.
   * This is the second priority in terms of handling, after the UnsFmcPage and before the component class onHandleEnter function.
   *
   * **Note:** For this callback to be fired, the cursor must both:
   *
   * 1) already be on the component;
   * 2) have its next destination be this component as well.
   *
   * This should be used if the component has special behavior when ENTER is pressed on itself.
   *
   * If the return value is:
   * - `instanceof UnsTextInputField` -> the handler is considered to have handled the call, and no further handlers will be called.
   * The cursor will be moved to the provided component.
   * - `true`                         -> the handler is considered to have handled the call, and no further handlers will be called.
   * The cursor path will be interrupted and the cursor will disappear.
   * - `false`                        -> the handler is not considered to have handled the call, and the next handlers will be called
   */
  onEnterPressed?: () => (boolean | UnsTextInputField<any, any>) | Promise<boolean | UnsTextInputField<any, any>>;

  /**
   * Handler for an +/- key pressed when the cursor is on the component.
   * This is the second priority in terms of handling, after the UnsFmcPage and before the component class onHandlePlusMinus function.
   *
   * **Note:** For this callback to be fired, the cursor must already be on the component.
   *
   * If the return value is:
   * - `true`  -> the handler is considered to have handled the call, and no further handlers will be called.
   * - `false` -> the handler is not considered to have handled the call, and the next handlers will be called.
   * - `string` -> the handler is not considered to have handled the call, and the typed text will be overwritten by this value.
   */
  onPlusMinusPressed?: (typedText: string) => boolean | Promise<boolean> | string | Promise<string>;

  /**
   * Handler for the BACK key pressed when the cursor is on the component.
   *
   * **Note:** For this callback to be fired, the cursor must already be on the component.
   *
   * If the return value is:
   * - `true`  -> the handler is considered to have handled the call, and no further handlers will be called.
   * - `false` -> the handler is not considered to have handled the call, and the next handlers will be called
   */
  onBackPressed?: () => boolean | Promise<boolean>;

  /**
   * Handler for a LIST key pressed when the cursor is on the component.
   * This is the second priority in terms of handling, after the UnsFmcPage and before the component class onHandleList function.
   *
   * **Note:** For this callback to be fired, the cursor must already be on the component.
   *
   * If the return value is:
   * - `true`  -> the handler is considered to have handled the call, and no further handlers will be called.
   * - `false` -> the handler is not considered to have handled the call, and the next handlers will be called
   */
  onListPressed?: () => boolean | Promise<boolean>;

  /**
   * Handler for when the field loses focus.
   *
   * If the return value is:
   * - `true`  -> the callback has intercepted the focus loss and the field will remain focused
   * - `false` -> the callback has not intercepted the focus loss and the field will lose focus
   */
  onLoseFocus?: (typedText: string) => boolean | Promise<boolean>;

  /**
   * Option which when set will cause the cursor path logic to not fire,
   * allowing for the page or component to control the logic for the next field to focus.
   *
   * When this is used, the component must call either tryFocusField, or interruptCursorPath during it's parse/onModified function
   * to ensure that the cursor is properly deselected or moved.
   */
  takeCursorControl?: boolean
}

/**
 * A field which can be focused on the UNS
 */
export interface UnsFocusableField<U> {
  /**
   * Whether the field is a {@link UnsFocusableField}
   */
  readonly isUnsFocusableField: true;

  /**
   * Whether the field is currently highlighted
   */
  readonly isHighlighted: MutableAccessible<boolean>;

  /**
   * The options for the field
   */
  readonly options: UnsFocusableFieldOptions;

  /**
   * Handles an ENTER key received by the component
   *
   * Do NOT override this method - override {@link onHandleEnter} instead
   *
   * @returns whether the key was handled or not
   */
  handleEnter(): Promise<boolean>;

  /**
   * Handles a +/- key received by the component
   *
   * Do NOT override this method - override {@link onHandlePlusMinus} instead
   *
   * @returns whether the key was handled or not
   */
  handlePlusMinus(): Promise<boolean>;

  /**
   * Handles a LIST key received by the component
   *
   * Do NOT override this method - override {@link onHandleList} instead
   *
   * @returns whether the key was handled or not
   */
  handleList(): Promise<boolean>;

  /**
   * Handles a BACK key received by the component
   *
   * Do NOT override this method - override {@link onHandlePlusMinus} instead
   *
   * @returns whether the key was handled or not
   */
  handleBack(): Promise<boolean>;

  /**
   * Handles the field losing focus.
   *
   * Do NOT override this method - override {@link onHandleLoseFocus} instead
   *
   * @returns whether the key was handled or not
   */
  handleLoseFocus(): Promise<boolean>;

  /**
   * Binds the input field to a subscribable (one-way) while wrapping it into a `Subscribable<UnsFieldState>`
   *
   * @param sub the `Subscribable<T>`
   *
   * @returns the instance of this {@link UnsTextInputField}
   */
  bindWrappedData(sub: Subscribable<U>): this;
}

/**
 * Utils for {@link UnsFocusableField}
 */
export class UnsFocusableFieldUtils {
  /**
   * Returns whether an input is a {@link UnsFocusableField}
   *
   * @param input the value to check
   *
   * @returns whether the input is a `UnsFocusableField`
   */
  public static isUnsFocusableField(input: any): input is UnsFocusableField<any> {
    return typeof input === 'object' && 'isUnsFocusableField' in input && input.isUnsFocusableField === true;
  }
}
