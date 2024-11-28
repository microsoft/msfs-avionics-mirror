import {
  ComponentProps, DisplayComponent, FSComponent, MappedSubject, MappedSubscribable, MutableSubscribable, Subject,
  Subscribable, SubscribableSet, Subscription, ToggleableClassNameRecord, VNode
} from '@microsoft/msfs-sdk';
import { CursorInput } from '../CursorInput/CursorInput';
import { CursorInputSlot } from '../CursorInput/CursorInputSlot';
import { DigitInputSlot } from './DigitInputSlot';
import { SignInputSlot } from './SignInputSlot';

/**
 * Component props for NumberInput.
 */
export interface NumberInputProps extends ComponentProps {
  /**
   * A mutable subscribable to bind to the input's composite value. The binding is one-way: changes in the input value
   * will be piped to the subscribable, but changes in the subscribable's value will not trigger any changes to the
   * input.
   */
  value: MutableSubscribable<number>;

  /**
   * A function which assigns values to individual sign and digit slots based on a composite value.
   * @param value A composite value.
   * @param setSignValues An array of functions which set the values of the input's individual sign slots. The order of
   * the functions is the same as order of their associated sign slots in the input (from left to right).
   * @param setDigitValues An array of functions which set the values of the input's individual digit slots. The order
   * of the functions is the same as order of their associated digit slots in the input (from left to right).
   * @param signValues An array containing the current values of the input's individual sign slots. The order of the
   * values is the same as the order of the sign slots in the input (from left to right).
   * @param digitValues An array containing the current values of the input's individual digit slots. The order of the
   * values is the same as the order of the digit slots in the input (from left to right).
   */
  digitizeValue: (
    value: number,
    setSignValues: readonly ((value: 1 | -1) => void)[],
    setDigitValues: readonly ((value: number, unscaled?: boolean) => void)[],
    signValues: readonly (1 | -1)[],
    digitValues: readonly number[]
  ) => void;

  /**
   * Whether to allow backfill of character positions. If `true`, when directly inserting values into the last
   * character position, any existing values will be shifted to the left as long as there are empty positions to
   * accommodate them.
   */
  allowBackFill: boolean;

  /**
   * Checks whether the designated character slot into which characters will shift during a backfill operation can
   * accept shifted characters. Ignored if `allowBackFill` is `false`. If not defined, the designated character slot
   * will accept shifted characters if and only if its current character value is `null` or `'0'`.
   * @param char The current character in the designated character slot.
   * @param slot The designated character slot's parent input slot.
   * @returns Whether the designated character slot into which characters will shift during a backfill operation can
   * accept shifted characters.
   */
  canShiftForBackfill?: (char: string | null, slot: CursorInputSlot<number>) => boolean;

  /**
   * The character index to initially select with the cursor when editing is activated. If not defined, the initial
   * index will default to the last index if backfill is allowed and cursor selection is in per-character mode, or
   * the first index (`0`) otherwise.
   */
  initialEditIndex?: number;

  /**
   * A function or {@link VNode} which renders the input's value when editing is not active. If defined, the rendered
   * inactive value replaces all rendered child components when editing is not active.
   */
  renderInactiveValue?: VNode | ((value: number) => string | VNode);

  /** CSS class(es) to apply to the root of the component. */
  class?: string | SubscribableSet<string> | ToggleableClassNameRecord;
}

/**
 * An input with a scrolling cursor which allows users to select a numeric value. The composite numeric value bound to
 * the input is derived from the sum of the values of all child DigitInputSlots, multiplied by the product of the
 * values of all child SignInputSlots.
 */
export class NumberInput extends DisplayComponent<NumberInputProps> {
  private static readonly VALUE_EQUALS = (a: number, b: number): boolean => {
    if (isNaN(a) && isNaN(b)) { return true; }
    // Need to differentiate between +0 and -0
    return a === 0 ? 1 / a === 1 / b : a === b;
  };

  private readonly inputRef = FSComponent.createRef<CursorInput<Subject<number>>>();

  private readonly canShiftForBackfillFunc = this.props.canShiftForBackfill ?? (char => char === null || char === '0');

  private readonly value = Subject.create<number>(0, NumberInput.VALUE_EQUALS);

  private readonly signSlots: SignInputSlot[] = [];
  private readonly digitSlots: DigitInputSlot[] = [];

  private signValues?: MappedSubscribable<readonly (1 | -1)[]>;
  private digitValues?: MappedSubscribable<readonly number[]>;

  private signSetValueFuncs?: ((value: 1 | -1) => void)[];
  private digitSetValueFuncs?: ((value: number) => void)[];

  // eslint-disable-next-line jsdoc/require-returns
  /** The index of the character position currently selected by this input's cursor. */
  public get cursorPosition(): Subscribable<number> {
    return this.inputRef.instance.cursorPosition;
  }

  // eslint-disable-next-line jsdoc/require-returns
  /** Whether editing is active for this input. */
  public get isEditingActive(): Subscribable<boolean> {
    return this.inputRef.instance.isEditingActive;
  }

  // eslint-disable-next-line jsdoc/require-returns
  /** Whether this input's cursor selection mode is per-slot. */
  public get isSelectionPerSlot(): Subscribable<boolean> {
    return this.inputRef.instance.isSelectionPerSlot;
  }

  private isInit = false;

  private valuePipeOut?: Subscription;

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    FSComponent.visitNodes(thisNode, node => {
      if (node.instance instanceof SignInputSlot) {
        this.signSlots.push(node.instance);
        return true;
      } else if (node.instance instanceof DigitInputSlot) {
        this.digitSlots.push(node.instance);
        return true;
      }

      return false;
    });

    this.signValues = MappedSubject.create(...this.signSlots.map(slot => slot.value));
    this.digitValues = MappedSubject.create(...this.digitSlots.map(slot => slot.value));

    this.signSetValueFuncs = this.signSlots.map(slot => slot.setValue.bind(slot));
    this.digitSetValueFuncs = this.digitSlots.map(slot => {
      return (value: number, unscaled = false): void => {
        unscaled ? slot.setUnscaledValue(value) : slot.setValue(value);
      };
    });

    this.valuePipeOut = this.value.pipe(this.props.value);

    this.isInit = true;
  }

  /**
   * Checks whether this input is initialized.
   * @returns Whether this input is initialized.
   */
  public isInitialized(): boolean {
    return this.isInit;
  }

  /**
   * Sets the composite value of this input. As part of the operation, all of this input's child slots will have their
   * values set according to this input's value digitizer, and all slot characters will be set to non-null
   * representations of their slot's value, if possible. The composite value of this input after the operation is
   * complete may differ from the requested value depending on whether the requested value can be accurately
   * represented by this input.
   * @param value The new composite value.
   * @returns The composite value of this input after the operation is complete.
   * @throws Error if this input is not initialized.
   */
  public setValue(value: number): number {
    if (!this.isInitialized()) {
      throw new Error('NumberInput: attempted to manipulate input before it was initialized');
    }

    return this.inputRef.instance.setValue(value);
  }

  /**
   * Activates editing for this input.
   * @param isSelectionPerSlot Whether cursor selection should be initialized to per-slot mode. If `false`, cursor
   * selection will be initialized to per-character mode instead.
   * @throws Error if this input is not initialized.
   */
  public activateEditing(isSelectionPerSlot: boolean): void {
    if (!this.isInitialized()) {
      throw new Error('NumberInput: attempted to manipulate input before it was initialized');
    }

    this.inputRef.instance.activateEditing(isSelectionPerSlot);
  }

  /**
   * Deactivates editing for this input.
   * @throws Error if this input is not initialized.
   */
  public deactivateEditing(): void {
    if (!this.isInitialized()) {
      throw new Error('NumberInput: attempted to manipulate input before it was initialized');
    }

    this.inputRef.instance.deactivateEditing();
  }

  /**
   * Moves the cursor.
   * @param direction The direction in which to move (`1` = to the right, `-1` = to the left).
   * @param forceSelectionPerSlot Whether to force cursor selection to per slot mode.
   * @throws Error if this input is not initialized.
   */
  public moveCursor(direction: 1 | -1, forceSelectionPerSlot: boolean): void {
    if (!this.isInitialized()) {
      throw new Error('NumberInput: attempted to manipulate input before it was initialized');
    }

    this.inputRef.instance.moveCursor(direction, forceSelectionPerSlot);
  }

  /**
   * Places the cursor at a specific character position.
   * @param index The index of the character position at which to place the cursor.
   * @param forceSelectionPerSlot Whether to force cursor selection to per slot mode.
   * @throws Error if this input is not initialized.
   * @throws RangeError if `index` does not point to a valid character position.
   */
  public placeCursor(index: number, forceSelectionPerSlot: boolean): void {
    if (!this.isInitialized()) {
      throw new Error('NumberInput: attempted to manipulate input before it was initialized');
    }

    this.inputRef.instance.placeCursor(index, forceSelectionPerSlot);
  }

  /**
   * Increments or decrements the value of the slot currently selected by the cursor. If editing is not active, it
   * will be activated instead of changing any slot value. If cursor selection is in per-character mode, it will be
   * forced to per-slot mode. If the cursor is past the last slot, this method does nothing.
   * @param direction The direction in which to change the slot value (`1` = increment, `-1` = decrement).
   * @throws Error if this input is not initialized.
   */
  public changeSlotValue(direction: 1 | -1): void {
    if (!this.isInitialized()) {
      throw new Error('NumberInput: attempted to manipulate input before it was initialized');
    }

    this.inputRef.instance.changeSlotValue(direction);
  }

  /**
   * Sets the value of the slot character currently selected by the cursor. If editing is not active, it will be
   * activated before setting the value. If cursor selection is in per-slot mode, it will be forced to per-character
   * mode, and the first character of the slot will be selected before setting the value. If the cursor is past the
   * last slot, this method does nothing.
   * @param value The value to set.
   * @throws Error if this input is not initialized.
   */
  public setSlotCharacterValue(value: string): void {
    if (!this.isInitialized()) {
      throw new Error('NumberInput: attempted to manipulate input before it was initialized');
    }

    this.inputRef.instance.setSlotCharacterValue(value);
  }

  /**
   * Removes the character at the cursor's current position. If backfill is allowed, this will also shift all non-empty
   * characters to the left of the cursor's current position one position to the right. If backfill is not allowed,
   * this will shift the cursor one position to the left after the character is removed.
   * @param selectionPerSlot The selection per slot state to apply before carrying out the backspace operation. If not
   * defined, the selection per slot state will remain unchanged from its current value.
   * @throws Error if this input is not initialized.
   */
  public backspace(selectionPerSlot?: boolean): void {
    if (!this.isInitialized()) {
      throw new Error('NumberInput: attempted to manipulate input before it was initialized');
    }

    this.inputRef.instance.backspace(selectionPerSlot);
  }

  /**
   * Populates all of this input's character positions with non-empty values, if possible, using this input's value
   * digitizer function and the current composite value as a template.
   */
  public populateCharsFromValue(): void {
    this.inputRef.getOrDefault()?.populateCharsFromValue();
  }

  /**
   * Refreshes this input, updating the size and position of the cursor.
   */
  public refresh(): void {
    this.inputRef.getOrDefault()?.refresh();
  }

  /**
   * Parses a value from this input's individual digit and sign slots.
   * @returns The value represented by this input's individual digit and sign slots.
   */
  private parseValue(): number {
    const sign = this.signSlots.reduce((prev, curr) => prev * curr.value.get(), 1);
    const abs = this.digitSlots.reduce((prev, curr) => prev + curr.value.get(), 0);

    return sign * abs;
  }

  /**
   * Digitizes a value into individual values to assign to this input's digit and sign slots.
   * @param value The value to digitize.
   */
  private digitizeValue(value: number): void {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.props.digitizeValue(value, this.signSetValueFuncs!, this.digitSetValueFuncs!, this.signValues!.get(), this.digitValues!.get());
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <CursorInput
        ref={this.inputRef}
        value={this.value}
        parseValue={this.parseValue.bind(this)}
        digitizeValue={this.digitizeValue.bind(this)}
        valueEquals={NumberInput.VALUE_EQUALS}
        renderInactiveValue={this.props.renderInactiveValue}
        allowBackFill={this.props.allowBackFill}
        canShiftForBackfill={this.canShiftForBackfillFunc}
        initialEditIndex={this.props.initialEditIndex}
        class={this.props.class}
      >
        {this.props.children}
      </CursorInput>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.inputRef.getOrDefault()?.destroy();

    this.valuePipeOut?.destroy();

    super.destroy();
  }
}