import {
  ComponentProps, DisplayComponent, FSComponent, MutableSubscribable, SetSubject, Subscribable,
  SubscribableSet, SubscribableUtils, Subscription, ToggleableClassNameRecord, VNode,
} from '@microsoft/msfs-sdk';

import { GenericCursorInputSlot } from '../CursorInput/CursorInputSlot';

/**
 * Component props for CharInputSlot.
 */
export interface CharInputSlotProps extends ComponentProps {
  /**
   * An array of valid character values for the slot. The order of characters in the array determines the order in
   * which the slot will cycle through characters when incrementing/decrementing its value.
   */
  charArray: readonly string[];

  /**
   * Whether the slot should wrap from the last valid character to the first valid character and vice-versa when
   * incrementing/decrementing its value.
   */
  wrap: boolean | Subscribable<boolean>;

  /** The default character value for the slot when the character value is `null`. */
  defaultCharValue: string | Subscribable<string>;

  /**
   * A function which renders slot characters into string. If not defined, non-null characters will be rendered as-is,
   * and null characters will be rendered according to the default value assigned to that character.
   */
  renderChar?: (character: string | null, index: number) => string;

  /** CSS class(es) to apply to the slot's root element. */
  class?: string | SubscribableSet<string> | ToggleableClassNameRecord;
}

/**
 * A cursor input slot which allows the user to select a single arbitrary character.
 */
export class CharInputSlot extends DisplayComponent<CharInputSlotProps> {
  private static readonly RESERVED_CSS_CLASSES = ['char-input-slot'];

  private readonly slotRef = FSComponent.createRef<GenericCursorInputSlot<string>>();

  private readonly defaultCharValue = SubscribableUtils.toSubscribable(this.props.defaultCharValue, true);

  private readonly parseValue = (characters: readonly (string | null)[]): string => {
    return characters[0] ?? '';
  };

  private readonly digitizeValue = (value: string, setCharacters: readonly ((char: string | null) => void)[]): void => {
    if (value === '' || !this.props.charArray.includes(value)) {
      setCharacters[0](null);
    } else {
      setCharacters[0](value);
    }
  };

  private readonly renderChar = this.props.renderChar ?? (
    (character: string | null): string => {
      const characterToRender = character === null ? this.defaultCharValue.get() : character;
      return characterToRender === ''
        ? '_'
        : characterToRender === '0'
          ? '0̸'
          : characterToRender;
    }
  );

  private readonly wrap = SubscribableUtils.toSubscribable(this.props.wrap, true);

  // eslint-disable-next-line jsdoc/require-returns
  /** The value bound to this slot. */
  public get value(): Subscribable<string> {
    return this.slotRef.instance.value;
  }

  private allowEmptyValue = true;

  private readonly subscriptions: Subscription[] = [];

  /** @inheritdoc */
  public onAfterRender(): void {
    this.subscriptions.push(
      this.defaultCharValue.sub(() => {
        this.slotRef.instance.refreshFromChars();
      }, true)
    );
  }

  /**
   * Sets whether this slot should allow its value to be set to the empty string. Disallowing empty string values will
   * not cause this slot's current value to change, even if the current value is the empty string.
   * @param allow Whether this slot should allow its value to be set to the empty string.
   */
  public setAllowEmptyValue(allow: boolean): void {
    this.allowEmptyValue = allow;
  }

  /**
   * Sets the value of this slot. As part of the operation, this slot's character will be set to a non-null
   * representation of the new value, if possible. The value of this slot after the operation is complete may differ
   * from the requested value depending on whether the requested value can be accurately represented by this slot.
   * @param value The new value.
   * @returns The value of this slot after the operation is complete.
   */
  public setValue(value: string): string {
    return this.slotRef.instance.setValue(value);
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
   * Sets the value of this slot's character.
   * @param char The value to set.
   * @param force Whether to force the character to accept a value that would normally be invalid. Defaults to `false`.
   * @returns Whether the operation was accepted.
   */
  public setChar(char: string | null, force?: boolean): boolean {
    return this.slotRef.instance.setChar(0, char, force);
  }

  /**
   * Changes this slot's value in a specified direction.
   * @param direction The direction in which to change the value.
   * @param value This slot's current value.
   * @param setValue A function which sets this slot's value.
   * @returns Whether the value was successfully changed.
   */
  private changeValue(direction: 1 | -1, value: string, setValue: (value: string) => void): boolean {
    if (this.props.charArray.length === 0) {
      return false;
    }

    let currentIndex = this.props.charArray.indexOf(value);

    if (currentIndex < 0) {
      currentIndex = direction === 1 ? -1 : this.props.charArray.length;
    }

    let newIndex: number | undefined = undefined;

    for (let i = 0; i < this.props.charArray.length; i++) {
      currentIndex += direction;

      if (currentIndex < 0 || currentIndex >= this.props.charArray.length) {
        if (this.wrap.get()) {
          if (currentIndex < 0) {
            currentIndex = this.props.charArray.length - 1;
          } else {
            currentIndex = 0;
          }
        } else {
          break;
        }
      }

      if (this.allowEmptyValue || this.props.charArray[currentIndex] !== '') {
        newIndex = currentIndex;
        break;
      }
    }

    if (newIndex !== undefined) {
      setValue(this.props.charArray[newIndex]);
      return true;
    } else {
      return false;
    }
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
    if (this.canSetChar(index, charToSet, force)) {
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
  private canSetChar(index: number, character: string | null, force?: boolean): boolean {
    if (character === null || force) {
      return true;
    }

    return this.props.charArray.includes(character) && (this.allowEmptyValue || character !== '');
  }

  /** @inheritdoc */
  public render(): VNode {
    let cssClass: string | SetSubject<string>;

    if (typeof this.props.class === 'object') {
      cssClass = SetSubject.create();
      cssClass.add('char-input-slot');

      const sub = FSComponent.bindCssClassSet(cssClass, this.props.class, CharInputSlot.RESERVED_CSS_CLASSES);
      if (Array.isArray(sub)) {
        this.subscriptions.push(...sub);
      } else {
        this.subscriptions.push(sub);
      }
    } else {
      cssClass = 'char-input-slot';

      if (this.props.class !== undefined && this.props.class.length > 0) {
        cssClass += ' ' + FSComponent.parseCssClassesFromString(this.props.class, classToAdd => !CharInputSlot.RESERVED_CSS_CLASSES.includes(classToAdd)).join(' ');
      }
    }

    return (
      <GenericCursorInputSlot<string>
        ref={this.slotRef}
        allowBackfill={false}
        characterCount={1}
        parseValue={this.parseValue}
        digitizeValue={this.digitizeValue}
        renderChar={this.renderChar}
        incrementValue={this.changeValue.bind(this, 1)}
        decrementValue={this.changeValue.bind(this, -1)}
        setChar={this._setChar.bind(this)}
        canSetChar={(characters, index, charToSet, force): boolean => this.canSetChar(index, charToSet, force)}
        class={cssClass}
      />
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.slotRef.getOrDefault()?.destroy();

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}