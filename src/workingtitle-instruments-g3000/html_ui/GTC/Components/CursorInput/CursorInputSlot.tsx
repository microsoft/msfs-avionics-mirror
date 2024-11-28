import {
  ComponentProps, DisplayComponent, FSComponent, MappedSubject, MutableSubscribable, SetSubject, Subject,
  Subscribable, SubscribableSet, SubscribableUtils, Subscription, ToggleableClassNameRecord, VNode
} from '@microsoft/msfs-sdk';

import './CursorInputSlot.css';

/**
 * A type of character selection mode for a {@link CursorInputSlot}.
 */
export type CursorInputCharSelectionMode = 'none' | 'blink' | 'highlight';

/**
 * A slot for a scrolling cursor input.
 */
export interface CursorInputSlot<T> {
  /** Flags this object as a CursorInputSlot. */
  readonly isCursorInputSlot: true;

  /** Whether this slot supports backfill operations. */
  readonly allowBackfill: boolean;

  /** The number of characters contained in this slot. */
  readonly characterCount: number;

  /** The value of this slot's characters, in order. */
  readonly characters: Subscribable<readonly (string | null)[]>;

  /** The current value of this slot. */
  readonly value: Subscribable<T>;

  /**
   * Sets the value of this slot. The value of this slot after the operation is complete may be different from the
   * requested value, depending on whether this slot can accurately represent the requested value.
   * @param value The new value.
   * @returns The value of this slot after the operation is complete.
   */
  setValue(value: T): T;

  /**
   * Increments this slot's value.
   * @returns Whether the operation was accepted.
   */
  incrementValue(): boolean;

  /**
   * Decrements this slot's value.
   * @returns Whether the operation was accepted.
   */
  decrementValue(): boolean;

  /**
   * Sets the value of one of this slot's characters.
   * @param index The index of the character to set.
   * @param char The value to set.
   * @param force Whether to force the character to accept a value that would normally be invalid. Defaults to `false`.
   * @returns Whether the operation was accepted.
   * @throws RangeError if `index` is out of bounds.
   */
  setChar(index: number, char: string | null, force?: boolean): boolean;

  /**
   * Checks if one of this slot's characters can accept a value.
   * @param index The index of the character to query.
   * @param char The value to query.
   * @param force Whether the character should be forced to accept a value that would normally be invalid. Defaults to
   * `false`.
   * @returns Whether the character can accept the specified value.
   * @throws RangeError if `index` is out of bounds.
   */
  canSetChar(index: number, char: string | null, force?: boolean): boolean;

  /**
   * Sets the selection mode for one of this slot's characters.
   * @param index The index of the character for which to set a selection mode.
   * @param mode A character selection mode.
   * @throws RangeError if `index` is out of bounds.
   */
  setCharSelected(index: number, mode: CursorInputCharSelectionMode): void;

  /**
   * Populates all of this slot's characters with non-empty values, if possible, using this slot's current value as a
   * template.
   */
  populateCharsFromValue(): void;

  /**
   * Gets the x coordinate, in pixels, of the left edge of this slot's border box, relative to its nearest positioned
   * ancestor.
   * @returns The x coordinate, in pixels, of the left edge of this slot's border box, relative to its nearest
   * positioned ancestor.
   */
  getLeft(): number;

  /**
   * Gets the x coordinate, in pixels, of the right edge of this slot's border box, relative to its nearest positioned
   * ancestor.
   * @returns The x coordinate, in pixels, of the right edge of this slot's border box, relative to its nearest
   * positioned ancestor.
   */
  getRight(): number;

  /**
   * Gets the width, in pixels, of this slot's border box.
   * @returns The width, in pixels, of this slot's border box.
   */
  getWidth(): number;

  /**
   * Gets the y coordinate, in pixels, of the top edge of this slot's border box, relative to its nearest positioned
   * ancestor.
   * @returns The y coordinate, in pixels, of the top edge of this slot's border box, relative to its nearest
   * positioned ancestor.
   */
  getTop(): number;

  /**
   * Gets the y coordinate, in pixels, of the bottom edge of this slot's border box, relative to its nearest positioned
   * ancestor.
   * @returns The y coordinate, in pixels, of the bottom edge of this slot's border box, relative to its nearest
   * positioned ancestor.
   */
  getBottom(): number;

  /**
   * Gets the height, in pixels, of this slot's border box.
   * @returns The height, in pixels, of this slot's border box.
   */
  getHeight(): number;

  /**
   * Gets the x coordinate, in pixels, of the left edge of the border box of one of this slot's characters, relative
   * to this slot's nearest positioned ancestor.
   * @param index The index of the character to query.
   * @returns The x coordinate, in pixels, of the left edge of the border box of one of the specified character,
   * relative to this slot's nearest positioned ancestor.
   * @throws RangeError if `index` is out of bounds.
   */
  getCharLeft(index: number): number;

  /**
   * Gets the x coordinate, in pixels, of the right edge of the border box of one of this slot's characters, relative
   * to this slot's nearest positioned ancestor.
   * @param index The index of the character to query.
   * @returns The x coordinate, in pixels, of the right edge of the border box of one of the specified character,
   * relative to this slot's nearest positioned ancestor.
   * @throws RangeError if `index` is out of bounds.
   */
  getCharRight(index: number): number;

  /**
   * Gets the width, in pixels, of one of this slot's characters.
   * @param index The index of the character to query.
   * @returns The width, in pixels, of one of the specified character.
   * @throws RangeError if `index` is out of bounds.
   */
  getCharWidth(index: number): number;
}

/**
 * Component props for GenericCursorInputSlot.
 */
export interface GenericCursorInputSlotProps<T> extends ComponentProps {
  /** Whether the slot supports backfill operations. */
  allowBackfill: boolean | Subscribable<boolean>;

  /** The number of characters contained in the slot. */
  characterCount: number;

  /**
   * A function which parses a slot value from individual character values.
   * @param characters An array of character values. The order of the values is the same as the order of the characters
   * in the slot (from left to right).
   * @returns The slot value parsed from the specified character values.
   */
  parseValue: (characters: readonly (string | null)[]) => T;

  /**
   * A function which assigns values to individual characters from a slot value.
   * @param value A slot value.
   * @param setCharacters An array of functions which set the values of the slot's character values. The order of
   * the functions is the same as order of their associated characters in the slot (from left to right).
   * @param characters An array containing the slot's current character values. The order of the values is the same as
   * the order of the characters in the slot (from left to right).
   */
  digitizeValue: (value: T, setCharacters: readonly ((char: string | null) => void)[], characters: readonly (string | null)[]) => void;

  /**
   * A function which checks if two slot values are equal. If not defined, equality is checked using the strict
   * equality operator (`===`).
   */
  valueEquals?: (a: T, b: T) => boolean;

  /**
   * A function which renders a character value into a string.
   * @param charToRender The character to render.
   * @param index The index of the character to render.
   * @param characters An array of the slot's character values.
   */
  renderChar: (charToRender: string | null, index: number, characters: readonly (string | null)[]) => string;

  /**
   * A function which increments the slot value.
   * @param value The slot's current value.
   * @param setValue A function which sets the slot's value.
   * @param characters An array containing the slot's current character values. The order of the values is the same as
   * the order of the characters in the slot (from left to right).
   * @param setCharacters An array of functions which set the values of the slot's character values. The order of
   * the functions is the same as order of their associated characters in the slot (from left to right).
   * @returns Whether the operation was accepted.
   */
  incrementValue: (
    value: T,
    setValue: (value: T) => void,
    characters: readonly (string | null)[],
    setCharacters: readonly ((char: string | null) => void)[]
  ) => boolean;

  /**
   * A function which decrements the slot value.
   * @param value The slot's current value.
   * @param setValue A function which sets the slot's value.
   * @param characters An array containing the slot's current character values. The order of the values is the same as
   * the order of the characters in the slot (from left to right).
   * @param setCharacters An array of functions which set the values of the slot's character values. The order of
   * the functions is the same as order of their associated characters in the slot (from left to right).
   * @returns Whether the operation was accepted.
   */
  decrementValue: (
    value: T,
    setValue: (value: T) => void,
    characters: readonly (string | null)[],
    setCharacters: readonly ((char: string | null) => void)[],
  ) => boolean;

  /**
   * A function which sets the value of a slot character, and returns whether the operation was accepted.
   */
  setChar: (characters: readonly MutableSubscribable<string | null>[], index: number, charToSet: string | null, force: boolean) => boolean;

  /**
   * A function which checks if a slot character can accept a value.
   */
  canSetChar: (characters: readonly (string | null)[], index: number, charToSet: string | null, force: boolean) => boolean;

  /** CSS class(es) to apply to the component's root element. */
  class?: string | SubscribableSet<string> | ToggleableClassNameRecord;
}

/**
 * A generic implementation of {@link CursorInputSlot} whose behavior is largely defined though props.
 */
export class GenericCursorInputSlot<T, P extends GenericCursorInputSlotProps<T> = GenericCursorInputSlotProps<T>>
  extends DisplayComponent<P> implements CursorInputSlot<T> {

  private static readonly RESERVED_CSS_CLASSES = ['cursor-input-slot'];

  /** @inheritdoc */
  public readonly isCursorInputSlot = true;

  /** @inheritdoc */
  public get allowBackfill(): boolean {
    return SubscribableUtils.isSubscribable(this.props.allowBackfill) ? this.props.allowBackfill.get() : this.props.allowBackfill;
  }

  /** @inheritdoc */
  public readonly characterCount = Math.max(0, this.props.characterCount);

  protected readonly rootRef = FSComponent.createRef<HTMLDivElement>();
  protected readonly characterRefs = Array.from({ length: this.characterCount }, () => FSComponent.createRef<HTMLDivElement>());

  protected readonly characterCssClasses = Array.from({ length: this.characterCount }, () => SetSubject.create(['cursor-input-slot-character']));

  protected readonly characterArray = Array.from({ length: this.characterCount }, () => Subject.create<string | null>(null));
  protected readonly characterSetFuncs = this.characterArray.map(subject => subject.set.bind(subject));

  protected readonly _characters = MappedSubject.create(...this.characterArray);
  /** @inheritdoc */
  public readonly characters = this._characters as Subscribable<readonly (string | null)[]>;

  protected readonly charactersText = this.characterArray.map((character, index) => character.map(char => this.props.renderChar(char, index, this._characters.get())));
  protected readonly isEmpty = this.characterArray.map(character => character.map(char => char === null));
  protected readonly selectionMode = Array.from({ length: this.characterCount }, () => Subject.create<CursorInputCharSelectionMode>('none'));

  protected readonly valueEqualsFunc = this.props.valueEquals ?? ((a: T, b: T): boolean => a === b);

  protected readonly _value = this._characters.map(this.props.parseValue, this.valueEqualsFunc);
  /** @inheritdoc */
  public readonly value = this._value as Subscribable<T>;

  protected readonly setValueFunc = this.setValue.bind(this);

  private cssClassSub?: Subscription | Subscription[];

  /** @inheritdoc */
  public onAfterRender(): void {
    for (let i = 0; i < this.characterCount; i++) {
      const characterCssClass = this.characterCssClasses[i];

      this.isEmpty[i].sub(isEmpty => {
        if (isEmpty) {
          characterCssClass.add('cursor-input-slot-character-empty');
        } else {
          characterCssClass.delete('cursor-input-slot-character-empty');
        }
      }, true);

      this.selectionMode[i].sub(mode => {
        switch (mode) {
          case 'blink':
            characterCssClass.delete('cursor-input-slot-character-highlight');
            characterCssClass.add('cursor-input-slot-character-blink');
            break;
          case 'highlight':
            characterCssClass.delete('cursor-input-slot-character-blink');
            characterCssClass.add('cursor-input-slot-character-highlight');
            break;
          default:
            characterCssClass.delete('cursor-input-slot-character-blink');
            characterCssClass.delete('cursor-input-slot-character-highlight');
        }
      }, true);
    }
  }

  /** @inheritdoc */
  public setValue(value: T): T {
    this.props.digitizeValue(value, this.characterSetFuncs, this._characters.get());
    return this._value.get();
  }

  /** @inheritdoc */
  public incrementValue(): boolean {
    return this.props.incrementValue(this._value.get(), this.setValueFunc, this._characters.get(), this.characterSetFuncs);
  }

  /** @inheritdoc */
  public decrementValue(): boolean {
    return this.props.decrementValue(this._value.get(), this.setValueFunc, this._characters.get(), this.characterSetFuncs);
  }

  /** @inheritdoc */
  public setChar(index: number, char: string | null, force = false): boolean {
    if (index < 0 || index >= this.characterCount) {
      throw new RangeError('CursorInputSlotComponent: index out of bounds');
    }

    return this.props.setChar(this.characterArray, index, char, force);
  }

  /** @inheritdoc */
  public canSetChar(index: number, char: string | null, force = false): boolean {
    if (index < 0 || index >= this.characterCount) {
      throw new RangeError('CursorInputSlotComponent: index out of bounds');
    }

    return this.props.canSetChar(this._characters.get(), index, char, force);
  }

  /** @inheritdoc */
  public setCharSelected(index: number, mode: CursorInputCharSelectionMode): void {
    if (index < 0 || index >= this.characterCount) {
      throw new RangeError('CursorInputSlotComponent: index out of bounds');
    }

    this.selectionMode[index].set(mode);
  }

  /** @inheritdoc */
  public populateCharsFromValue(): void {
    this.setValue(this.value.get());
  }

  /** @inheritdoc */
  public getLeft(): number {
    return this.getCharLeft(0);
  }

  /** @inheritdoc */
  public getRight(): number {
    return this.getCharRight(this.characterCount - 1);
  }

  /** @inheritdoc */
  public getWidth(): number {
    return this.characterRefs.reduce((sum, slot) => sum + (slot.getOrDefault()?.offsetWidth ?? 0), 0);
  }

  /** @inheritdoc */
  public getTop(): number {
    return this.rootRef.getOrDefault()?.offsetTop ?? 0;
  }

  /** @inheritdoc */
  public getBottom(): number {
    const root = this.rootRef.getOrDefault();

    if (root === null) {
      return 0;
    } else {
      return root.offsetTop + root.offsetHeight;
    }
  }

  /** @inheritdoc */
  public getHeight(): number {
    return this.rootRef.getOrDefault()?.offsetHeight ?? 0;
  }

  /** @inheritdoc */
  public getCharLeft(index: number): number {
    if (index < 0 || index >= this.characterCount) {
      throw new RangeError('CursorInputSlotComponent: index out of bounds');
    }

    return this.characterRefs[index].getOrDefault()?.offsetLeft ?? 0;
  }

  /** @inheritdoc */
  public getCharRight(index: number): number {
    if (index < 0 || index >= this.characterCount) {
      throw new RangeError('CursorInputSlotComponent: index out of bounds');
    }

    const char = this.characterRefs[index].getOrDefault();

    if (char === null) {
      return 0;
    } else {
      return char.offsetLeft + char.offsetWidth;
    }
  }

  /** @inheritdoc */
  public getCharWidth(index: number): number {
    if (index < 0 || index >= this.characterCount) {
      throw new RangeError('CursorInputSlotComponent: index out of bounds');
    }

    return this.characterRefs[index].getOrDefault()?.offsetWidth ?? 0;
  }

  /**
   * Recomputes this slot's value from its characters and re-renders all characters.
   */
  public refreshFromChars(): void {
    for (let i = 0; i < this.characterArray.length; i++) {
      this.characterArray[i].notify();
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    let cssClass: string | SetSubject<string>;

    if (this.props.class !== undefined && typeof this.props.class === 'object') {
      cssClass = SetSubject.create(['cursor-input-slot']);
      this.cssClassSub = FSComponent.bindCssClassSet(cssClass, this.props.class, GenericCursorInputSlot.RESERVED_CSS_CLASSES);
    } else {
      cssClass = 'cursor-input-slot';

      if (this.props.class !== undefined && this.props.class.length > 0) {
        cssClass += ' ' + FSComponent.parseCssClassesFromString(this.props.class, classToAdd => !GenericCursorInputSlot.RESERVED_CSS_CLASSES.includes(classToAdd)).join(' ');
      }
    }

    return (
      <div ref={this.rootRef} class={cssClass}>
        {this.charactersText.map((character, index) => {
          return (
            <div
              ref={this.characterRefs[index]}
              class={this.characterCssClasses[index]}
            >
              {character}
            </div>
          );
        })}
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    if (this.cssClassSub) {
      if (Array.isArray(this.cssClassSub)) {
        for (const sub of this.cssClassSub) {
          sub.destroy();
        }
      } else {
        this.cssClassSub.destroy();
      }
    }

    super.destroy();
  }
}