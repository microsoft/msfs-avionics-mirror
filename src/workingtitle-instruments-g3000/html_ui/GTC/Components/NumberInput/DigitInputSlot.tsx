import {
  ComponentProps, DisplayComponent, FSComponent, MathUtils, MutableSubscribable, SetSubject, Subscribable, SubscribableSet, SubscribableUtils, Subscription, VNode,
} from '@microsoft/msfs-sdk';
import { GenericCursorInputSlot } from '../CursorInput/CursorInputSlot';

/**
 * Component props for DigitInputSlot.
 */
export interface DigitInputSlotProps extends ComponentProps {
  /** Whether the slot supports backfill operations. Defaults to `true`. */
  allowBackfill?: boolean | Subscribable<boolean>;

  /** The number of characters in the slot. */
  characterCount: number;

  /** The minimum un-scaled value of the input, or a subscribable which provides it. */
  minValue: Subscribable<number> | number;

  /** The maximum un-scaled value of the input (exclusive if `wrap` is true), or a subscribable which provides it. */
  maxValue: Subscribable<number> | number;

  /**
   * The amount to increment/decrement the input's un-scaled value when the inner FMS knob is scrolled, or a
   * subscribable which provides it.
   */
  increment: Subscribable<number> | number;

  /** Whether the input should wrap from the max value to the min value, or a subscribable which provides it. */
  wrap: Subscribable<boolean> | boolean;

  /**
   * The scaling factor applied to this input's value, or a subscribable which provides it. The scaling factor
   * determines the relationship between this input's bound data value and the displayed value as follows:
   * `data_value = display_value * scale`. When the scaling factor changes, this input's displayed value is
   * preserved, and the bound data value is changed to reflect the new scaling factor.
   */
  scale: Subscribable<number> | number;

  /** The default numeric values for each of the slot's character positions when the character value is `null`. */
  defaultCharValues: readonly number[] | Subscribable<readonly number[]>;

  /**
   * A function which parses a slot value from individual character values. If not defined, characters will be parsed
   * as standard base-10 integers.
   * @param characters An array of character values. The order of the values is the same as the order of the characters
   * in the slot (from left to right).
   * @returns The slot value parsed from the specified character values.
   */
  parseValue?: (characters: readonly (string | null)[]) => number;

  /**
   * A function which assigns values to individual characters from a slot value. If not defined, values will be
   * digitized according to their standard base-10 string representations, with each character assigned to exactly one
   * base-10 digit ("0" through "9") in right-to-left order (the last character is assigned to the right-most digit,
   * the second-to-last character to the second right-most digit, etc, until there are no more characters or digits).
   * @param value A slot value.
   * @param setCharacters An array of functions which set the values of the slot's character values. The order of
   * the functions is the same as order of their associated characters in the slot (from left to right).
   * @param characters An array containing the slot's current character values. The order of the values is the same as
   * the order of the characters in the slot (from left to right).
   */
  digitizeValue?: (value: number, setCharacters: readonly ((char: string | null) => void)[], characters: readonly (string | null)[]) => void;

  /**
   * A function which renders slot characters into string. If not defined, non-null characters will be rendered as-is,
   * and null characters will be rendered according to the default value assigned to that character.
   */
  renderChar?: (character: string | null, index: number) => string;

  /** CSS class(es) to apply to the slot's root element. */
  class?: string | SubscribableSet<string>;
}

/**
 * A cursor input slot which allows the user to select a numeric digit. Digits are integers, but are not necessarily
 * constrained to be in the range [0, 9].
 */
export class DigitInputSlot extends DisplayComponent<DigitInputSlotProps> {
  private static readonly RESERVED_CSS_CLASSES = ['digit-input-slot'];

  private readonly slotRef = FSComponent.createRef<GenericCursorInputSlot<number>>();

  private readonly defaultCharValues = SubscribableUtils.toSubscribable(this.props.defaultCharValues, true);

  private readonly parseValue = this.props.parseValue ?? (
    (characters: readonly (string | null)[]): number => {
      let value = 0;

      for (let i = characters.length - 1; i >= 0; i--) {
        const place = characters.length - i - 1;
        const char = characters[i];
        const factor = Math.pow(10, place);

        const parsed = char === null ? this.defaultCharValues.get()[i] : parseInt(char, 10);

        value += parsed * factor;
      }

      return value * this.scale.get();
    }
  );

  private readonly digitizeValue = this.props.digitizeValue ?? (
    (value: number, setCharacters: readonly ((char: string | null) => void)[]): void => {
      if (isNaN(value)) {
        for (let i = 0; i < setCharacters.length; i++) {
          setCharacters[i](null);
        }
      } else {
        const valueStr = (value / this.scale.get()).toFixed(0).padStart(setCharacters.length, '0');

        for (let i = 0; i < setCharacters.length; i++) {
          setCharacters[setCharacters.length - i - 1](valueStr.charAt(valueStr.length - i - 1));
        }
      }
    }
  );

  private readonly renderChar = this.props.renderChar ?? (
    (character: string | null, index: number): string => {
      if (character !== null) { return character; }
      const characterToRender = this.defaultCharValues.get()[index];
      return isNaN(characterToRender) ? '_' : characterToRender.toString();
    }
  );

  private readonly characterCount = Math.max(0, this.props.characterCount);

  private readonly minValue = SubscribableUtils.toSubscribable(this.props.minValue, true);
  private readonly maxValue = SubscribableUtils.toSubscribable(this.props.maxValue, true);
  private readonly increment = SubscribableUtils.toSubscribable(this.props.increment, true);
  private readonly wrap = SubscribableUtils.toSubscribable(this.props.wrap, true);
  private readonly scale = SubscribableUtils.toSubscribable(this.props.scale, true);

  // eslint-disable-next-line jsdoc/require-returns
  /** The value bound to this slot. */
  public get value(): Subscribable<number> {
    return this.slotRef.instance.value;
  }

  private cssClassSub?: Subscription;
  private valueSub?: Subscription;
  private scaleSub?: Subscription;
  private defaultCharsSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.scaleSub = this.scale.sub(() => {
      this.slotRef.instance.setValue(this.parseValue(this.slotRef.instance.characters.get()));
    });

    this.defaultCharsSub = this.defaultCharValues.sub(() => {
      this.slotRef.instance.refreshFromChars();
    }, true);
  }

  /**
   * Sets the value of this slot. As part of the operation, all of this slot's characters will be set to non-null
   * representations of the new value, if possible. The value of this slot after the operation is complete may differ
   * from the requested value depending on whether the requested value can be accurately represented by this slot.
   * @param value The new value.
   * @returns The value of this slot after the operation is complete.
   */
  public setValue(value: number): number {
    return this.slotRef.instance.setValue(value);
  }

  /**
   * Sets the unscaled value of this slot. The unscaled value of this slot after the operation is complete may be
   * different from the requested value, depending on whether this slot can accurately represent the requested value.
   * @param unscaled The new unscaled value.
   * @returns The new unscaled value of this slot after the operation is complete.
   */
  public setUnscaledValue(unscaled: number): number {
    return this.slotRef.instance.setValue(unscaled * this.scale.get()) / this.scale.get();
  }

  /**
   * Increments this slot's value.
   * @returns Whether the increment operation was accepted.
   */
  public incrementValue(): boolean {
    return this.slotRef.instance.incrementValue();
  }

  /**
   * Decrements this slot's value.
   * @returns Whether the decrement operation was accepted.
   */
  public decrementValue(): boolean {
    return this.slotRef.instance.decrementValue();
  }

  /**
   * Sets the value of one of this slot's characters.
   * @param index The index of the character to set.
   * @param char The value to set.
   * @param force Whether to force the character to accept a value that would normally be invalid. Defaults to `false`.
   * @returns Whether the operation was accepted.
   */
  public setChar(index: number, char: string | null, force?: boolean): boolean {
    return this.slotRef.instance.setChar(index, char, force);
  }

  /**
   * Changes this slot's value by a specified amount.
   * @param value This slot's value.
   * @param delta The amount by which to change the value.
   * @param setValue A function which sets this slot's value.
   * @returns Whether the value was successfully changed.
   */
  private changeValue(value: number, delta: number, setValue: (value: number) => void): boolean {
    const wrap = this.wrap.get();
    const scale = this.scale.get();

    const min = this.minValue.get();
    const max = this.maxValue.get();

    let newValueUnscaled = value / scale;
    let needChange = true;

    // If value is already out of bounds, clamp to min/max, then only increment if delta would take it out of bounds
    // again.
    if (isNaN(newValueUnscaled) || newValueUnscaled < min) {
      newValueUnscaled = min;
      needChange = delta < 0;
    } else if (wrap ? newValueUnscaled >= max : newValueUnscaled > max) {
      newValueUnscaled = wrap ? Math.ceil(max) - 1 : max;
      needChange = delta > 0;
    }

    if (needChange) {
      if (wrap) {
        const mod = max - min;
        newValueUnscaled = ((newValueUnscaled - min + delta / scale) % mod + mod) % mod + min;
      } else {
        newValueUnscaled = MathUtils.clamp(newValueUnscaled + delta / scale, min, max);
      }
    }

    // The unscaled value must be an integer, so we round it off and then make sure it respects min/max.
    newValueUnscaled = Math.round(newValueUnscaled);
    if (newValueUnscaled < min) {
      newValueUnscaled++;
    } else if (wrap ? newValueUnscaled >= max : newValueUnscaled > max) {
      newValueUnscaled--;
    }

    setValue(newValueUnscaled * scale);

    return true;
  }

  /**
   * Sets the value of one of this slot's characters.
   * @param characters An array of characters.
   * @param index The index of the character to set.
   * @param charToSet The value to set.
   * @param force Whether to force the character to accept a value that would normally be invalid. Defaults to `false`.
   * @returns Whether the operation was accepted.
   */
  private _setChar(characters: readonly MutableSubscribable<string | null>[], index: number, charToSet: string | null, force?: boolean): boolean {
    if (this.canSetChar(index, charToSet, force ?? false)) {
      characters[index].set(charToSet);
      return true;
    } else {
      return false;
    }
  }

  /**
   * Checks whether one of this slot's characters can be set to a given value.
   * @param index The index of the character to set.
   * @param character The value to set.
   * @param force Whether the character should accept a value that would normally be invalid.
   * @returns Whether the specified character can be set to the specified value.
   */
  private canSetChar(index: number, character: string | null, force: boolean): boolean {
    if (character === null) {
      return true;
    }

    const parsed = Number(character);

    if (isNaN(parsed)) {
      return false;
    }

    if (force) {
      return true;
    }

    const place = Math.max(0, this.characterCount - index - 1);

    const value = parsed * Math.pow(10, place);

    return value >= this.minValue.get() && (this.wrap.get() ? value < this.maxValue.get() : value <= this.maxValue.get());
  }

  /** @inheritdoc */
  public render(): VNode {
    let cssClass: string | SetSubject<string>;

    if (this.props.class !== undefined && typeof this.props.class === 'object') {
      cssClass = SetSubject.create(['digit-input-slot']);
      this.cssClassSub = FSComponent.bindCssClassSet(cssClass, this.props.class, DigitInputSlot.RESERVED_CSS_CLASSES);
    } else {
      cssClass = 'digit-input-slot';

      if (this.props.class !== undefined && this.props.class.length > 0) {
        cssClass += ' ' + FSComponent.parseCssClassesFromString(this.props.class, classToAdd => !DigitInputSlot.RESERVED_CSS_CLASSES.includes(classToAdd)).join(' ');
      }
    }

    return (
      <GenericCursorInputSlot<number>
        ref={this.slotRef}
        allowBackfill={this.props.allowBackfill ?? true}
        characterCount={this.characterCount}
        parseValue={this.parseValue}
        digitizeValue={this.digitizeValue}
        renderChar={this.renderChar}
        incrementValue={(value, setValue): boolean => this.changeValue(value, this.increment.get() * this.scale.get(), setValue)}
        decrementValue={(value, setValue): boolean => this.changeValue(value, -this.increment.get() * this.scale.get(), setValue)}
        setChar={this._setChar.bind(this)}
        canSetChar={(characters, index, charToSet, force): boolean => this.canSetChar(index, charToSet, force)}
        class={cssClass}
      />
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.slotRef.getOrDefault()?.destroy();

    this.cssClassSub?.destroy();
    this.valueSub?.destroy();
    this.scaleSub?.destroy();
    this.defaultCharsSub?.destroy();

    super.destroy();
  }
}