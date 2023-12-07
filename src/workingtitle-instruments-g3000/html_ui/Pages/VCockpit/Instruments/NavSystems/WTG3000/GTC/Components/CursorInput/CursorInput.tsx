/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ComponentProps, DebounceTimer, DisplayComponent, FSComponent, MappedSubject, MappedSubscribable, MathUtils, MutableSubscribable, ObjectSubject,
  SetSubject, Subject, Subscribable, SubscribableSet, SubscribableType, SubscribableUtils, Subscription, ToggleableClassNameRecord, VNode
} from '@microsoft/msfs-sdk';
import { CursorInputSlot } from './CursorInputSlot';

import './CursorInput.css';

/**
 * Component props for CursorInput.
 */
export interface CursorInputProps<M extends MutableSubscribable<any>> extends ComponentProps {
  /**
   * A mutable subscribable to bind to the input's composite value. The binding is one-way: changes in the input value
   * will be piped to the subscribable, but changes in the subscribable's value will not trigger any changes to the
   * input.
   */
  value: M;

  /**
   * A function which parses the input's individual slot values to generate a composite value.
   * @param slotValues An array of the bound values of the input's individual slots. The order of the values is the
   * same as the order of the slots in the input (from left to right).
   * @returns The composite value parsed from the specified slot values.
   */
  parseValue: (slotValues: readonly any[]) => SubscribableType<M>;

  /**
   * A function which assigns values to the input's individual slots based on a composite value.
   * @param value A composite value.
   * @param setSlotValues An array of functions which set the values of the input's individual slots. The order of the
   * functions is the same as the order of the their associated slots in the input (from left to right).
   * @param slotValues An array containing the current values of the input's individual slots. The order of the values
   * is the same as the order of the slots in the input (from left to right).
   */
  digitizeValue: (value: SubscribableType<M>, setSlotValues: readonly ((slotValue: any) => void)[], slotValues: readonly any[]) => void;

  /**
   * A function which checks if two composite values are equal.
   */
  valueEquals?: (a: SubscribableType<M>, b: SubscribableType<M>) => boolean;

  /**
   * Whether to allow backfill of character positions. If `true`, when directly inserting values into the last
   * character position, any existing values will be shifted to the left as long as there are empty positions to
   * accommodate them.
   */
  allowBackFill: boolean;

  /**
   * Checks whether the designated character slot into which characters will shift during a backfill operation can
   * accept shifted characters. Ignored if `allowBackFill` is `false`. If not defined, the designated character slot
   * will accept shifted characters if and only if its current character value is `null`.
   * @param char The current character in the designated character slot.
   * @param slot The designated character slot's parent input slot.
   * @returns Whether the designated character slot into which characters will shift during a backfill operation can
   * accept shifted characters.
   */
  canShiftForBackfill?: (char: string | null, slot: CursorInputSlot<any>) => boolean;

  /**
   * The character index to initially select with the cursor when editing is activated. If not defined, the initial
   * index will default to the last index if backfill is allowed and cursor selection is in per-character mode, or
   * the first index (`0`) otherwise.
   */
  initialEditIndex?: number | Subscribable<number>;

  /**
   * A function or {@link VNode} which renders the input's value when editing is not active. If defined, the rendered
   * inactive value replaces all rendered child components when editing is not active.
   */
  renderInactiveValue?: VNode | ((value: SubscribableType<M>) => string | VNode);

  /** CSS class(es) to apply to the component's root element. */
  class?: string | SubscribableSet<string> | ToggleableClassNameRecord;
}

/**
 * An entry for a character position in a CursorInput.
 */
type CursorInputCharPosition<T> = {
  /** The slot to which the character belongs. */
  readonly slot: CursorInputSlot<T>;

  /** The index of the character in its parent slot. */
  readonly charIndex: number;
}

/**
 * An input display with a scrolling cursor.
 *
 * Each input has zero or more child slots of type {@link CursorInputSlot} (though to be practically useful, at least
 * one slot is required). When editing is active, the input's cursor selects either one slot or one character (a slot
 * may have more than one character) at a time. The input supports incrementing or decrementing the value of a
 * selected slot, or directly setting/deleting the value of a selected character.
 *
 * Each input is bound to a composite value. This value is computed from the values of the input's individual slots,
 * and vice versa, so that changes in either will be reflected in the other.
 */
export class CursorInput<M extends MutableSubscribable<any>> extends DisplayComponent<CursorInputProps<M>> {
  private static readonly RESERVED_CLASSES = ['cursor-input', 'cursor-input-edit-active', 'cursor-input-edit-inactive'];

  private readonly slotsContainerRef = FSComponent.createRef<HTMLDivElement>();
  private readonly cursorRef = FSComponent.createRef<HTMLDivElement>();

  private readonly inactiveRef = FSComponent.createRef<HTMLDivElement>();

  private readonly activeStyle = ObjectSubject.create({
    // We use visibility: hidden to hide the active slots instead of display: none so that the cursor can still be
    // positioned correctly if the active slots are hidden in favor of the inactive component while editing is
    // inactive. This is important to make the cursor transition from inactive to active look at least somewhat like
    // the real thing.
    visibility: 'hidden',
    position: 'absolute',
    left: '0px',
    width: '100%'
  });

  private readonly inactiveStyle = ObjectSubject.create({
    display: 'none'
  });

  private readonly cursorStyle = ObjectSubject.create({
    position: 'absolute',
    left: '0px',
    top: '0px',
    width: '0px',
    height: '0px',
    transform: 'translate3d(0px, 0px, 0px)'
  });

  private readonly rootCssClass = SetSubject.create(['cursor-input']);

  private readonly initialEditIndex = this.props.initialEditIndex === undefined ? undefined : SubscribableUtils.toSubscribable(this.props.initialEditIndex, true);

  private slotsRootNode?: VNode;
  private readonly charPositions: CursorInputCharPosition<any>[] = [];
  private readonly slots: CursorInputSlot<any>[] = [];

  private readonly slotValueArray: Subscribable<any>[] = [];
  private slotValueSetFuncs?: ((slotValue: any) => void)[];

  private readonly valueEqualsFunc = this.props.valueEquals ?? ((a: SubscribableType<M>, b: SubscribableType<M>): boolean => a === b);

  private slotsState?: MappedSubscribable<readonly any[]>;
  private value?: MappedSubscribable<SubscribableType<M>>;

  private readonly canShiftForBackfillFunc = this.props.canShiftForBackfill ?? (char => char === null);

  private readonly renderInactiveValueFunc = typeof this.props.renderInactiveValue === 'function' ? this.props.renderInactiveValue : undefined;
  private renderedInactiveValue: string | VNode | null = null;

  /** -1 When it should highlight the whole input. */
  private readonly _cursorPosition = Subject.create(-1);
  /** The index of the character position currently selected by this input's cursor. */
  public readonly cursorPosition = this._cursorPosition as Subscribable<number>;

  private readonly _isEditingActive = this._cursorPosition.map(position => position >= 0);
  /** Whether editing is active for this input. */
  public readonly isEditingActive = this._isEditingActive as Subscribable<boolean>;

  private readonly _isSelectionPerSlot = Subject.create(true);
  /** Whether this input's cursor selection mode is per-slot. */
  public readonly isSelectionPerSlot = this._isSelectionPerSlot as Subscribable<boolean>;

  private readonly selectedCharIndexes = new Set<number>();

  private readonly cursorUpdateTimer = new DebounceTimer();

  private isInit = false;

  private cssClassSub?: Subscription | Subscription[];
  private valuePipeOut?: Subscription;
  private inactiveValueSub?: Subscription;

  /** @inheritDoc */
  public onAfterRender(): void {
    const updateCursor = this.updateCursorPosition.bind(this);

    const scheduleCursorUpdate = (): void => {
      this.cursorRef.instance.classList.remove('cursor-blink');
      for (const index of this.selectedCharIndexes) {
        const charPos = this.charPositions[index];
        charPos.slot.setCharSelected(charPos.charIndex, 'highlight');
      }

      this.cursorUpdateTimer.schedule(updateCursor, 0);
    };

    // Collect all input slots
    if (this.slotsRootNode !== undefined) {
      FSComponent.visitNodes(this.slotsRootNode, node => {
        if (node.instance instanceof DisplayComponent && (node.instance as any)['isCursorInputSlot'] === true) {
          const slot = node.instance as unknown as CursorInputSlot<any>;

          for (let i = 0; i < slot.characterCount; i++) {
            this.charPositions.push({ slot, charIndex: i });
          }
          this.slots.push(slot);

          slot.characters.sub(scheduleCursorUpdate);

          this.slotValueArray.push(slot.value);

          return true;
        }

        return false;
      });
    }

    this.slotValueSetFuncs = this.slots.map(slot => slot.setValue.bind(slot));

    this.slotsState = MappedSubject.create(...this.slotValueArray);
    this.value = this.slotsState.map(this.props.parseValue, this.valueEqualsFunc);

    this.valuePipeOut = this.value.pipe(this.props.value);

    if (this.props.renderInactiveValue === undefined) {
      this.activeStyle.set('visibility', '');

      this._isEditingActive.sub(isActive => {
        if (isActive) {
          this.rootCssClass.delete('cursor-input-edit-inactive');
          this.rootCssClass.add('cursor-input-edit-active');
        } else {
          this.rootCssClass.delete('cursor-input-edit-active');
          this.rootCssClass.add('cursor-input-edit-inactive');
        }
      }, true);
    } else {
      if (typeof this.props.renderInactiveValue === 'object') {
        FSComponent.render(this.props.renderInactiveValue, this.inactiveRef.instance);
        this.renderedInactiveValue = this.props.renderInactiveValue;
      } else {
        this.inactiveValueSub = this.value.sub(() => {
          this.updateInactiveDisplay();
        }, false, true);
      }

      this._isEditingActive.sub(isActive => {
        if (isActive) {
          this.rootCssClass.delete('cursor-input-edit-inactive');
          this.rootCssClass.add('cursor-input-edit-active');

          this.inactiveStyle.set('display', 'none');
          this.activeStyle.set('visibility', '');

          this.inactiveValueSub?.pause();
        } else {
          this.rootCssClass.delete('cursor-input-edit-active');
          this.rootCssClass.add('cursor-input-edit-inactive');

          this.activeStyle.set('visibility', 'hidden');
          this.inactiveStyle.set('display', '');

          this.inactiveValueSub?.resume(true);
        }
      }, true);
    }

    this._cursorPosition.sub(scheduleCursorUpdate);
    this._isSelectionPerSlot.sub(scheduleCursorUpdate);

    scheduleCursorUpdate();

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
  public setValue(value: SubscribableType<M>): SubscribableType<M> {
    if (!this.isInitialized()) {
      throw new Error('CursorInput: attempted to manipulate input before it was initialized');
    }

    this.props.digitizeValue(value, this.slotValueSetFuncs!, this.slotsState!.get());
    return this.value!.get();
  }

  /**
   * Updates this input's rendered editing-inactive value. If editing is currently active, the rendered editing-
   * inactive value will be hidden. If editing is not active, it will be displayed and updated to reflect this input's
   * current value.
   */
  private updateInactiveDisplay(): void {
    if (!this._isEditingActive.get() && this.renderInactiveValueFunc !== undefined) {
      const renderedValue = this.renderInactiveValueFunc(this.props.value.get());

      if (renderedValue !== this.renderedInactiveValue) {
        this.cleanUpRenderedInactiveValue();

        if (typeof renderedValue === 'string') {
          this.inactiveRef.instance.textContent = renderedValue;
        } else {
          FSComponent.render(renderedValue, this.inactiveRef.instance);
        }

        this.renderedInactiveValue = renderedValue;
      }
    }
  }

  /**
   * Cleans up this input's rendered editing-inactive value, destroying any top-level DisplayComponents that are part
   * of the rendered value's VNode tree.
   */
  private cleanUpRenderedInactiveValue(): void {
    if (this.renderedInactiveValue === null) {
      return;
    }

    if (typeof this.renderedInactiveValue === 'string') {
      this.inactiveRef.instance.textContent = '';
    } else {
      this.inactiveRef.instance.innerHTML = '';

      FSComponent.visitNodes(this.renderedInactiveValue, node => {
        if (node.instance instanceof DisplayComponent) {
          node.instance.destroy();
          return true;
        }

        return false;
      });
    }

    this.renderedInactiveValue = null;
  }

  /**
   * Activates editing for this input.
   * @param isSelectionPerSlot Whether cursor selection should be initialized to per-slot mode. If `false`, cursor
   * selection will be initialized to per-character mode instead.
   * @param charToSet The value to set at the cursor's selected character position as the initial edit. If defined
   * and the character position cannot accept the value, editing will not be activated. Ignored if `isSelectionPerSlot`
   * is `true`.
   * @returns Whether editing is active.
   * @throws Error if this input is not initialized.
   */
  public activateEditing(isSelectionPerSlot: boolean, charToSet?: string | null): boolean {
    if (!this.isInitialized()) {
      throw new Error('CursorInput: attempted to manipulate input before it was initialized');
    }

    if (this._isEditingActive.get()) {
      return true;
    }

    this._isSelectionPerSlot.set(isSelectionPerSlot);

    if (isSelectionPerSlot) {
      this._cursorPosition.set(MathUtils.clamp(this.initialEditIndex?.get() ?? 0, 0, this.charPositions.length));
    } else {
      const initialCursorPosition = MathUtils.clamp(
        this.initialEditIndex?.get() ?? (this.props.allowBackFill ? this.charPositions.length - 1 : 0),
        0,
        this.charPositions.length
      );

      // Check to see if the selected character can accept the initial edit -> if yes, continue; if no, abort
      if (charToSet !== undefined) {
        const initialCharPos = this.charPositions[initialCursorPosition];
        if (initialCharPos !== undefined && !initialCharPos.slot.canSetChar(initialCharPos.charIndex, charToSet)) {
          return false;
        }
      }

      if (this.props.allowBackFill) {
        // Delete all characters.
        for (let i = this.charPositions.length - 1; i >= 0; i--) {
          const charPos = this.charPositions[i];
          charPos.slot.setChar(charPos.charIndex, null);
        }
      } else {
        // Delete all characters to the right of, and including, the initial cursor position.
        for (let i = initialCursorPosition; i < this.charPositions.length; i++) {
          const charPos = this.charPositions[i];
          charPos.slot.setChar(charPos.charIndex, null);
        }
      }

      this._cursorPosition.set(initialCursorPosition);
    }

    return true;
  }

  /**
   * Deactivates editing for this input.
   * @throws Error if this input is not initialized.
   */
  public deactivateEditing(): void {
    if (!this.isInitialized()) {
      throw new Error('CursorInput: attempted to manipulate input before it was initialized');
    }

    if (!this._isEditingActive.get()) {
      return;
    }

    this._cursorPosition.set(-1);
  }

  /**
   * Moves the cursor.
   * @param direction The direction in which to move (`1` = to the right, `-1` = to the left).
   * @param forceSelectionPerSlot Whether to force cursor selection to per slot mode.
   * @throws Error if this input is not initialized.
   */
  public moveCursor(direction: 1 | -1, forceSelectionPerSlot: boolean): void {
    if (!this.isInitialized()) {
      throw new Error('CursorInput: attempted to manipulate input before it was initialized');
    }

    if (!this._isEditingActive.get()) {
      this.activateEditing(forceSelectionPerSlot);
      return;
    }

    if (direction === 1) {
      this.moveCursorRight(forceSelectionPerSlot);
    } else {
      this.moveCursorLeft(forceSelectionPerSlot);
    }
  }

  /**
   * Moves the cursor right, if possible.
   * @param forceSelectionPerSlot Whether to force cursor selection to per slot mode.
   */
  private moveCursorRight(forceSelectionPerSlot: boolean): void {
    const currentPosIndex = this._cursorPosition.get();
    const currentPos = this.charPositions[currentPosIndex];

    let nextPosition: number;

    if (currentPosIndex < this.charPositions.length) {
      // Selection is not past the last slot

      if (this._isSelectionPerSlot.get()) {
        // Selection is per-slot
        nextPosition = currentPosIndex + currentPos.slot.characterCount - currentPos.charIndex;
      } else if (forceSelectionPerSlot) {
        // Selection is currently per-character but we want to change it to per-slot mode

        // Only change the selected slot if the last character in the slot is currently selected
        if (currentPos.charIndex === currentPos.slot.characterCount - 1) {
          nextPosition = currentPosIndex + 1;
        } else {
          nextPosition = currentPosIndex;
        }
      } else {
        // Selection is per-character and will stay that way
        nextPosition = currentPosIndex + 1;
      }
    } else {
      // Selection is past the last slot
      nextPosition = this.charPositions.length + 1;
    }

    if (forceSelectionPerSlot) {
      this._isSelectionPerSlot.set(true);
    }

    if (this._isSelectionPerSlot.get()) {
      this.populateCharsFromValue();
    }

    const maxPosition = this.props.allowBackFill ? this.charPositions.length - 1 : this.charPositions.length;

    // Don't move the cursor if it is currently selecting an empty character or it is already past the last slot.
    if (
      nextPosition > maxPosition ||
      currentPos.slot.characters.get()[this._isSelectionPerSlot.get() ? currentPos.slot.characterCount - 1 : currentPos.charIndex] === null
    ) {
      // This causes the blink animation to restart.
      this._cursorPosition.notify();
    } else {
      this._cursorPosition.set(nextPosition);
    }
  }

  /**
   * Moves the cursor left, if possible.
   * @param forceSelectionPerSlot Whether to force cursor selection to per slot mode.
   */
  private moveCursorLeft(forceSelectionPerSlot: boolean): void {
    const currentPosIndex = this._cursorPosition.get();
    const currentPos = this.charPositions[currentPosIndex];

    let nextPosition: number;

    if (currentPosIndex < this.charPositions.length) {
      // Selection is not past the last slot

      if (this._isSelectionPerSlot.get()) {
        // Selection is per-slot
        nextPosition = currentPosIndex - currentPos.charIndex - 1;
      } else if (forceSelectionPerSlot) {
        // Selection is currently per-character but we want to change it to per-slot mode

        // Only change the selected slot if the first character in the slot is currently selected
        if (currentPos.charIndex === 0) {
          nextPosition = currentPosIndex - 1;
        } else {
          nextPosition = currentPosIndex;
        }

        this._isSelectionPerSlot.set(true);
      } else {
        // Selection is per-character and will stay that way
        nextPosition = currentPosIndex - 1;
      }
    } else {
      // Selection is past the last slot
      nextPosition = Math.max(0, this.charPositions.length - 1);
    }

    if (forceSelectionPerSlot) {
      this._isSelectionPerSlot.set(true);
    }

    if (this._isSelectionPerSlot.get()) {
      this.populateCharsFromValue();
    }

    // Don't move the cursor before the first slot.
    if (nextPosition < 0) {
      // This causes the blink animation to restart.
      this._cursorPosition.notify();
    } else {
      this._cursorPosition.set(nextPosition);
    }
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
      throw new Error('CursorInput: attempted to manipulate input before it was initialized');
    }

    if (index < 0 || index >= this.charPositions.length) {
      throw new RangeError();
    }

    if (!this._isEditingActive.get()) {
      this.activateEditing(forceSelectionPerSlot);
    }

    if (forceSelectionPerSlot) {
      this._isSelectionPerSlot.set(true);
    }

    if (this._isSelectionPerSlot.get()) {
      this.populateCharsFromValue();
    }

    this._cursorPosition.set(index);
  }

  /**
   * Increments or decrements the value of the slot currently selected by the cursor. If editing is not active, it
   * will be activated instead of changing any slot value. If cursor selection is in per-character mode, it will be
   * forced to per-slot mode. If the cursor is past the last slot, this method does nothing.
   * @param direction The direction in which to change the slot value (`1` = increment, `-1` = decrement).
   * @returns Whether the value of the slot was changed.
   * @throws Error if this input is not initialized.
   */
  public changeSlotValue(direction: 1 | -1): boolean {
    if (!this.isInitialized()) {
      throw new Error('CursorInput: attempted to manipulate input before it was initialized');
    }

    if (!this._isEditingActive.get()) {
      this.activateEditing(true);
      return false;
    }

    this._isSelectionPerSlot.set(true);

    this.populateCharsFromValue();

    const cursorPosition = this._cursorPosition.get();

    if (cursorPosition >= this.charPositions.length) {
      return false;
    }

    const slot = this.charPositions[cursorPosition].slot;
    if (direction === 1) {
      return slot.incrementValue();
    } else {
      return slot.decrementValue();
    }
  }

  /**
   * Sets the value of the slot character currently selected by the cursor. If editing is not active, it will be
   * activated before setting the value (unless the selected character cannot accept the value, in which case the
   * operation will be aborted). If cursor selection is in per-slot mode, it will be forced to per-character mode,
   * and the first character of the slot will be selected before setting the value. If the cursor is past the last
   * slot, this method does nothing.
   * @param value The value to set.
   * @returns Whether the operation was accepted.
   * @throws Error if this input is not initialized.
   */
  public setSlotCharacterValue(value: string): boolean {
    if (!this.isInitialized()) {
      throw new Error('CursorInput: attempted to manipulate input before it was initialized');
    }

    // If editing is not active, attempt to activate it.
    if (!this._isEditingActive.get()) {
      const isActive = this.activateEditing(false, value);
      if (!isActive) {
        return false;
      }
    }

    let currentPosIndex = this._cursorPosition.get();

    if (currentPosIndex >= this.charPositions.length) {
      return false;
    }

    // If we are in per-slot selection mode, switch to per-character selection mode while selecting the first
    // (left-most) character in the selected slot.
    if (this._isSelectionPerSlot.get()) {
      const currentPos = this.charPositions[currentPosIndex];
      this._isSelectionPerSlot.set(false);
      this._cursorPosition.set(currentPosIndex - currentPos.charIndex);
    }

    currentPosIndex = this._cursorPosition.get();
    const currentCharPos = this.charPositions[currentPosIndex];

    if (!currentCharPos.slot.canSetChar(currentCharPos.charIndex, value)) {
      return false;
    }

    // If backfill is allowed and the next character position to the right does not support backfill or does not exist,
    // attempt to backfill. Otherwise, set the character position value and move the cursor one position to the right.
    const nextCharPos = this.charPositions[currentPosIndex + 1];
    if (this.props.allowBackFill && currentCharPos.slot.allowBackfill && (nextCharPos === undefined || !nextCharPos.slot.allowBackfill)) {
      const canBackfill = this.backfillValues(currentPosIndex, value);

      // If the character position to the right exists and we either failed to backfill or the operation resulted in a
      // state that prevents further backfill at the current position, we move the the cursor to the right to ensure
      // that the next entered character does not overwrite the one we just set.
      if (nextCharPos !== undefined && !canBackfill) {
        this.moveCursorRight(false);
      }
    } else {
      currentCharPos.slot.setChar(currentCharPos.charIndex, value);
      this.moveCursorRight(false);
    }

    return true;
  }

  /**
   * Inserts a value into a character position and starts a backfill operation. Any existing character values are
   * shifted one position to the left as long as there is room.
   * @param charPosIndex The character position at which to insert the value.
   * @param valueToInsert The value to insert.
   * @returns Whether after the current operation is complete, a backfill operation will still be possible when
   * inserting a value into the same character position.
   */
  private backfillValues(charPosIndex: number, valueToInsert: string): boolean {
    // Find the left-most character position we are going to backfill.
    const leftMostCharPosIndex = this.findLeftMostBackfillCharPosIndex(charPosIndex);
    const shiftPos = this.charPositions[leftMostCharPosIndex];

    if (leftMostCharPosIndex < charPosIndex) {
      const canShift = this.canShiftForBackfillFunc(shiftPos.slot.characters.get()[shiftPos.charIndex], shiftPos.slot);

      if (canShift) {
        for (let i = leftMostCharPosIndex; i < charPosIndex; i++) {
          const pos = this.charPositions[i];
          const nextPos = this.charPositions[i + 1];
          pos.slot.setChar(pos.charIndex, nextPos.slot.characters.get()[nextPos.charIndex], true);
        }
      }
    }

    const lastPos = this.charPositions[charPosIndex];
    lastPos.slot.setChar(lastPos.charIndex, valueToInsert);

    return this.canShiftForBackfillFunc(shiftPos.slot.characters.get()[shiftPos.charIndex], shiftPos.slot);
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
      throw new Error('CursorInput: attempted to manipulate input before it was initialized');
    }

    if (!this._isEditingActive.get()) {
      this.activateEditing(false);
      return;
    } else {
      if (selectionPerSlot !== undefined) {
        this._isSelectionPerSlot.set(selectionPerSlot);
      }
    }

    let deleteFromCharPosIndex: number;

    const isSelectionPerSlot = this._isSelectionPerSlot.get();
    const cursorPosIndex = this._cursorPosition.get();

    if (this.props.allowBackFill) {
      if (cursorPosIndex < this.charPositions.length && isSelectionPerSlot) {
        // delete from the last position in the slot
        const currentPos = this.charPositions[cursorPosIndex];
        deleteFromCharPosIndex = cursorPosIndex + currentPos.slot.characterCount - currentPos.charIndex - 1;
      } else {
        deleteFromCharPosIndex = cursorPosIndex;
      }

      // If the character position we are deleting from supports backfill, then shift characters to the left one
      // position to the right. Otherwise default to the non-backfill behavior.
      if (this.charPositions[cursorPosIndex].slot.allowBackfill) {
        if (deleteFromCharPosIndex >= this.charPositions.length) {
          return;
        }

        // Find the left-most character position we are going to shift.
        const leftMostShiftCharPosIndex = this.findLeftMostBackfillCharPosIndex(deleteFromCharPosIndex);

        // Delete the character and shift all characters to the left one position to the right
        const deleteFromPos = this.charPositions[deleteFromCharPosIndex];
        if (deleteFromPos.slot.setChar(deleteFromPos.charIndex, null)) {
          for (let i = deleteFromCharPosIndex; i > leftMostShiftCharPosIndex; i--) {
            const pos = this.charPositions[i];
            const prevPos = this.charPositions[i - 1];
            const prevPosChar = prevPos.slot.characters.get()[prevPos.charIndex];

            if (prevPosChar === null) {
              break;
            } else {
              const accepted = pos.slot.setChar(pos.charIndex, prevPosChar, true);
              if (accepted) {
                prevPos.slot.setChar(prevPos.charIndex, null);
              } else {
                break;
              }
            }
          }
        }

        return;
      }
    } else {
      if (cursorPosIndex < this.charPositions.length && isSelectionPerSlot) {
        // delete from the last position in the previous slot
        const currentEntry = this.charPositions[cursorPosIndex];
        deleteFromCharPosIndex = cursorPosIndex - currentEntry.charIndex - 1;
      } else {
        deleteFromCharPosIndex = cursorPosIndex - 1;
      }
    }

    if (deleteFromCharPosIndex < 0) {
      return;
    }

    // Delete the character (all characters in the slot if cursor selection is in per-slot mode) and shift all
    // characters to the right one position to the left for every deleted character
    let deleteFromCharPos = this.charPositions[deleteFromCharPosIndex];
    while (
      deleteFromCharPos !== undefined
      && deleteFromCharPos.slot.setChar(deleteFromCharPos.charIndex, null)
    ) {
      for (let i = deleteFromCharPosIndex; i < this.charPositions.length - 1; i++) {
        const pos = this.charPositions[i];
        const nextPos = this.charPositions[i + 1];
        const nextPosChar = nextPos.slot.characters.get()[pos.charIndex];

        if (nextPosChar === null) {
          break;
        } else {
          const accepted = pos.slot.setChar(pos.charIndex, nextPosChar, true);
          if (accepted) {
            nextPos.slot.setChar(nextPos.charIndex, null);
          } else {
            break;
          }
        }
      }

      if (isSelectionPerSlot && deleteFromCharPos.charIndex > 0) {
        deleteFromCharPos = this.charPositions[--deleteFromCharPosIndex];
      } else {
        break;
      }
    }

    this.moveCursorLeft(false);
  }

  /**
   * Finds the index of the left-most character position that is connected to a given character position (including
   * itself) by an unbroken chain of positions supporting backfill.
   * @param fromCharPosIndex The index of the query character position.
   * @returns The index of the left-most character position that is connected to a given character position (including
   * itself) by an unbroken chain of positions supporting backfill.
   */
  private findLeftMostBackfillCharPosIndex(fromCharPosIndex: number): number {
    let leftMostCharPosIndex = fromCharPosIndex;
    for (let i = fromCharPosIndex - 1; i >= 0; i--) {
      if (!this.charPositions[i].slot.allowBackfill) {
        break;
      }
      leftMostCharPosIndex = i;
    }
    return leftMostCharPosIndex;
  }

  /**
   * Populates all of this input's character positions with non-empty values, if possible, using this input's value
   * digitizer function and the current composite value as a template.
   */
  public populateCharsFromValue(): void {
    if (this.isInitialized()) {
      this.setValue(this.value!.get());
    }
  }

  /**
   * Refreshes this input, updating the size and position of the cursor.
   */
  public refresh(): void {
    this._cursorPosition.notify();
  }

  /**
   * Moves the cursor to the correct position.
   */
  private updateCursorPosition(): void {
    for (const index of this.selectedCharIndexes) {
      const charPos = this.charPositions[index];
      charPos.slot.setCharSelected(charPos.charIndex, 'none');
    }
    this.selectedCharIndexes.clear();

    const charPosIndex = this._cursorPosition.get();

    if (charPosIndex < 0) {
      // Editing is inactive

      this.cursorRef.instance.classList.remove('cursor-blink');

      // Highlight all characters

      if (this.charPositions.length === 0) {
        return;
      }

      for (let i = 0; i < this.charPositions.length; i++) {
        const selectedCharPos = this.charPositions[i];
        selectedCharPos.slot.setCharSelected(selectedCharPos.charIndex, 'highlight');

        this.selectedCharIndexes.add(i);
      }

      const left = this.slots.reduce((min, slot) => Math.min(min, slot.getLeft()), Infinity);
      const right = this.slots.reduce((max, slot) => Math.max(max, slot.getRight()), -Infinity);
      const width = right - left;

      const top = this.slots.reduce((min, slot) => Math.min(min, slot.getTop()), Infinity);
      const bottom = this.slots.reduce((max, slot) => Math.max(max, slot.getBottom()), -Infinity);
      const height = bottom - top;

      this.cursorStyle.set('transform', `translate3d(${left}px, ${top}px, 0px)`);
      this.cursorStyle.set('width', `${width}px`);
      this.cursorStyle.set('height', `${height}px`);
    } else if (charPosIndex < this.charPositions.length) {
      // An input slot is selected

      const charPos = this.charPositions[charPosIndex];

      const top = charPos.slot.getTop();
      const height = charPos.slot.getHeight();

      let left: number, width: number;

      if (this._isSelectionPerSlot.get()) {
        // Highlight all characters in the currently selected slot

        left = charPos.slot.getLeft();
        width = charPos.slot.getWidth();

        const start = charPosIndex - charPos.charIndex;
        const end = charPosIndex - charPos.charIndex + charPos.slot.characterCount;
        for (let i = start; i < end; i++) {
          this.selectedCharIndexes.add(i);
        }
      } else {
        // Highlight only the currently selected character

        left = charPos.slot.getCharLeft(charPos.charIndex);
        width = charPos.slot.getCharWidth(charPos.charIndex);

        this.selectedCharIndexes.add(charPosIndex);
      }

      for (const index of this.selectedCharIndexes) {
        const selectedCharPos = this.charPositions[index];
        selectedCharPos.slot.setCharSelected(selectedCharPos.charIndex, 'blink');
      }

      this.cursorStyle.set('transform', `translate3d(${left}px, ${top}px, 0px)`);
      this.cursorStyle.set('width', `${width}px`);
      this.cursorStyle.set('height', `${height}px`);
      this.cursorRef.instance.classList.add('cursor-blink');
    } else {
      // The cursor is past the last input slot

      const lastCharPos = this.charPositions[this.charPositions.length - 1];

      if (lastCharPos === undefined) {
        this.cursorStyle.set('transform', 'translate3d(0px, 0px, 0px)');
      } else {
        const top = lastCharPos.slot.getTop();
        const height = lastCharPos.slot.getHeight();

        this.cursorStyle.set('transform', `translate3d(${lastCharPos.slot.getRight()}px, ${top}px, 0px) translateX(var(--cursor-input-cursor-end-offset))`);
        this.cursorStyle.set('height', `${height}px`);
      }

      this.cursorStyle.set('width', 'var(--cursor-input-cursor-end-width)');
      this.cursorRef.instance.classList.add('cursor-blink');
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    if (this.props.class !== undefined && typeof this.props.class === 'object') {
      this.cssClassSub = FSComponent.bindCssClassSet(this.rootCssClass, this.props.class, CursorInput.RESERVED_CLASSES);
    } else if (this.props.class !== undefined && this.props.class.length > 0) {
      const classesToAdd = FSComponent.parseCssClassesFromString(this.props.class, classToAdd => !CursorInput.RESERVED_CLASSES.includes(classToAdd));

      for (const classToAdd of classesToAdd) {
        this.rootCssClass.add(classToAdd);
      }
    }

    return (
      <div class={this.rootCssClass}>
        <div class='cursor-input-active' style={this.activeStyle}>
          <div ref={this.cursorRef} class='cursor-input-cursor' style={this.cursorStyle} />
          {this.slotsRootNode = (
            <div ref={this.slotsContainerRef} class='cursor-input-slots' style='position: relative; width: 100%;'>
              {this.props.children}
            </div>
          )}
        </div>
        <div ref={this.inactiveRef} class='cursor-input-inactive' style={this.inactiveStyle} />
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    if (this.slotsRootNode !== undefined) {
      FSComponent.visitNodes(this.slotsRootNode, node => {
        if (node.instance instanceof DisplayComponent) {
          node.instance.destroy();
          return true;
        }

        return false;
      });
    }

    this.cleanUpRenderedInactiveValue();

    if (this.cssClassSub) {
      if (Array.isArray(this.cssClassSub)) {
        for (const sub of this.cssClassSub) {
          sub.destroy();
        }
      } else {
        this.cssClassSub.destroy();
      }
    }

    this.valuePipeOut?.destroy();
    this.inactiveValueSub?.destroy();

    super.destroy();
  }
}