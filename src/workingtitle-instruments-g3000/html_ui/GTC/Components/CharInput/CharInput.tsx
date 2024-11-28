import {
  ComponentProps, DisplayComponent, FSComponent, MappedSubject, MutableSubscribable, Subject,
  Subscribable, SubscribableSet, Subscription, ToggleableClassNameRecord, VNode
} from '@microsoft/msfs-sdk';

import { CursorInput } from '../CursorInput/CursorInput';
import { CharInputSlot } from '../CharInput/CharInputSlot';

/**
 * Component props for CharInput.
 */
export interface CharInputProps extends ComponentProps {
  /**
   * A mutable subscribable to bind to the input's composite value. The binding is one-way: changes in the input value
   * will be piped to the subscribable, but changes in the subscribable's value will not trigger any changes to the
   * input.
   */
  value: MutableSubscribable<string>;

  /** The character index to initially select with the cursor when editing is activated. Defaults to `0`. */
  initialEditIndex?: number;

  /**
   * A function or {@link VNode} which renders the input's value when editing is not active. If defined, the rendered
   * inactive value replaces all rendered child components when editing is not active.
   */
  renderInactiveValue?: VNode | ((value: string) => string | VNode);

  /**
   * Whether to force the input's character slots to accept otherwise invalid characters when setting the input's
   * composite value. Defaults to `false`.
   */
  forceSetValue?: boolean;

  /** CSS class(es) to apply to the root of the component. */
  class?: string | SubscribableSet<string> | ToggleableClassNameRecord;
}

/**
 * An input with a scrolling cursor that allows users to select an arbitrary string. The composite value bound to the
 * input is derived from the in-order concatenation of the values of all child `CharInputSlot` components.
 */
export class CharInput extends DisplayComponent<CharInputProps> {
  private static readonly LAST_NON_EMPTY_SLOT_INDEX = (lastIndex: number, value: string, index: number): number => value !== '' ? index : lastIndex;

  private readonly inputRef = FSComponent.createRef<CursorInput<Subject<string>>>();

  private readonly value = Subject.create<string>('');

  private readonly slots: CharInputSlot[] = [];

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
      if (node.instance instanceof CharInputSlot) {
        this.slots.push(node.instance);
        return true;
      }

      return false;
    });

    this.valuePipeOut = this.value.pipe(this.props.value);

    MappedSubject.create(
      values => values.reduce(CharInput.LAST_NON_EMPTY_SLOT_INDEX, -1),
      ...this.slots.map(slot => slot.value)
    ).sub(this.updateAllowEmptySlotValues.bind(this), true);

    this.isInit = true;
  }

  /**
   * Updates whether each of this input's slots should allow empty values.
   * @param lastNonEmptySlotIndex The index of the last slot with a non-empty value.
   */
  private updateAllowEmptySlotValues(lastNonEmptySlotIndex: number): void {
    for (let i = 0; i < this.slots.length; i++) {
      this.slots[i].setAllowEmptyValue(i >= lastNonEmptySlotIndex);
    }
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
  public setValue(value: string): string {
    if (!this.isInitialized()) {
      throw new Error('CharInput: attempted to manipulate input before it was initialized');
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
      throw new Error('CharInput: attempted to manipulate input before it was initialized');
    }

    this.inputRef.instance.activateEditing(isSelectionPerSlot);
  }

  /**
   * Deactivates editing for this input.
   * @throws Error if this input is not initialized.
   */
  public deactivateEditing(): void {
    if (!this.isInitialized()) {
      throw new Error('CharInput: attempted to manipulate input before it was initialized');
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
      throw new Error('CharInput: attempted to manipulate input before it was initialized');
    }

    // Do not allow the cursor to move to the right of any slots that have null or empty string values.
    if (direction === 1) {
      // All slots are guaranteed to only have one character, so character position is the same as slot index.
      const cursorPosition = this.inputRef.instance.cursorPosition.get();
      for (let i = cursorPosition; i >= 0; i--) {
        if (!this.slots[i].value.get()) {
          return;
        }
      }
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
      throw new Error('CharInput: attempted to manipulate input before it was initialized');
    }

    this.inputRef.instance.placeCursor(index, forceSelectionPerSlot);
  }

  /**
   * Increments or decrements the value of the slot currently selected by the cursor. If editing is not active, then it
   * will be activated instead of changing any slot value. If cursor selection is in per-character mode, it will be
   * forced to per-slot mode. If the cursor is past the last slot, then this method does nothing.
   * @param direction The direction in which to change the slot value (`1` = increment, `-1` = decrement).
   * @param eraseCharsToRightOnEdit Whether to erase (set to `null`) all characters to the right of the edited
   * character. Defaults to `false`.
   * @throws Error if this input is not initialized.
   */
  public changeSlotValue(direction: 1 | -1, eraseCharsToRightOnEdit = false): void {
    if (!this.isInitialized()) {
      throw new Error('CharInput: attempted to manipulate input before it was initialized');
    }

    const wasChanged = this.inputRef.instance.changeSlotValue(direction);

    if (wasChanged && eraseCharsToRightOnEdit) {
      const cursorPosition = this.inputRef.instance.cursorPosition.get();

      for (let i = this.slots.length - 1; i > cursorPosition; i--) {
        this.slots[i].setChar(null);
      }
    }
  }

  /**
   * Sets the value of the slot character currently selected by the cursor. If editing is not active, then it will be
   * activated before setting the value. If the cursor is past the last slot, then this method does nothing.
   * @param value The value to set.
   * @param eraseCharsToRightOnEdit Whether to erase (set to `null`) all characters to the right of the edited
   * character. Defaults to `false`.
   * @throws Error if this input is not initialized.
   */
  public setSlotCharacterValue(value: string, eraseCharsToRightOnEdit = false): void {
    if (!this.isInitialized()) {
      throw new Error('CharInput: attempted to manipulate input before it was initialized');
    }

    const wasChanged = this.inputRef.instance.setSlotCharacterValue(value);

    if (wasChanged && eraseCharsToRightOnEdit) {
      // All slots are guaranteed to only have one character, so character position is the same as slot index.
      const cursorPosition = this.inputRef.instance.cursorPosition.get();
      // Setting the slot character value will move the cursor one position to the right, so we need to empty all slots
      // from the end to the current cursor position, inclusive.
      for (let i = this.slots.length - 1; i >= cursorPosition; i--) {
        this.slots[i].setChar(null);
      }
    }
  }

  /**
   * Removes the character at the cursor's current position and shifts the cursor one position to the left after the
   * character is removed.
   * @throws Error if this input is not initialized.
   */
  public backspace(): void {
    if (!this.isInitialized()) {
      throw new Error('CharInput: attempted to manipulate input before it was initialized');
    }

    this.inputRef.instance.backspace();
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
   * Parses a composite value from this input's individual slots.
   * @returns The composite value represented by this input's individual slots.
   */
  private parseValue(): string {
    return this.slots.reduce((prev, curr) => prev + curr.value.get(), '');
  }

  /**
   * Digitizes a composite value into individual slot values to assign to this input's slots.
   * @param value The value to digitize.
   */
  private digitizeValue(value: string): void {
    for (let i = 0; i < this.slots.length; i++) {
      const char = value[i];
      if (char) {
        this.slots[i].setChar(char, this.props.forceSetValue);
      } else {
        this.slots[i].setChar(null);
      }
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <CursorInput
        ref={this.inputRef}
        value={this.value}
        parseValue={this.parseValue.bind(this)}
        digitizeValue={this.digitizeValue.bind(this)}
        renderInactiveValue={this.props.renderInactiveValue}
        allowBackFill={false}
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