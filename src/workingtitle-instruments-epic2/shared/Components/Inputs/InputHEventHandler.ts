import { EventBus, HEvent, MathUtils, NodeReference, Subscribable, Subscription } from '@microsoft/msfs-sdk';

import { Epic2KeyboardEvents, Epic2TscKeyboardEvents } from '../../Misc';

/** Handles HEvents from the TSC keyboard. */
export class InputHEventHandler {
  public static readonly TSC_KEYBOARD_H_EVENT_REGEX = /^EPIC2_KEYBOARD_KEY_([A-Z0-9_]{1,})$/;

  private readonly subscriber = this.bus.getSubscriber<HEvent & Epic2KeyboardEvents>();
  private readonly publisher = this.bus.getPublisher<Epic2TscKeyboardEvents>();
  private readonly activeSub: Subscription;

  private readonly keyboardEventSubs: Subscription[] = [];

  /**
   * The constructor of `InputHEventHandler`.
   * @param bus An instance of the EventBus.
   * @param isActive Whether the `InputBox` owning this `InputHEventHandler` is being active.
   * @param inputRef The `ref` to the input element.
   */
  constructor(
    private readonly bus: EventBus,
    private readonly isActive: Subscribable<boolean>,
    private readonly inputRef: NodeReference<HTMLInputElement>,
  ) {
    this.keyboardEventSubs.push(this.subscriber.on('epic2_keyboard_char').handle(this.insertCharAtCursor.bind(this), true));
    this.keyboardEventSubs.push(this.subscriber.on('epic2_keyboard_clear').handle(this.clearInput.bind(this), true));
    // FIXME use the enter event directly...
    this.keyboardEventSubs.push(this.subscriber.on('epic2_keyboard_enter').handle(() => this.publisher.pub('tsc_keyboard_next', undefined), true));
    this.keyboardEventSubs.push(this.subscriber.on('epic2_keyboard_delete').handle(this.backSpaceAtCursor.bind(this), true));
    this.keyboardEventSubs.push(this.subscriber.on('epic2_keyboard_cursor_left').handle(this.moveCursor.bind(this, -1), true));
    this.keyboardEventSubs.push(this.subscriber.on('epic2_keyboard_cursor_right').handle(this.moveCursor.bind(this, +1), true));
    this.keyboardEventSubs.push(this.subscriber.on('epic2_keyboard_plusminus').handle(this.swapSign.bind(this), true));

    this.activeSub = this.isActive.sub((active: boolean) => {
      if (active) {
        this.resumeKeyboardEvents(120);
      } else {
        this.pauseKeyboardEvents();
      }
    }, true);
  }

  /**
   * Pause monitoring keyboard events.
   */
  private pauseKeyboardEvents(): void {
    for (const sub of this.keyboardEventSubs) {
      if (sub.isAlive) {
        sub.pause();
      }
    }
  }

  /**
   * Resume monitoring keyboard inputs.
   * @param delay An optional delay in ms.
   */
  private resumeKeyboardEvents(delay?: number): void {
    setTimeout(() => {
      for (const sub of this.keyboardEventSubs) {
        if (sub.isAlive) {
          sub.resume();
        }
      }
    }, delay);
  }

  /** Swap the sign of the input. */
  private swapSign(): void {
    if (this.inputRef.instance.value.length < 1) {
      this.inputRef.instance.value = '-';
    } else if (this.inputRef.instance.value.charAt(0) === '-') {
      this.inputRef.instance.value = `+${this.inputRef.instance.value.substring(1)}`;
    } else {
      this.inputRef.instance.value = `-${this.inputRef.instance.value.substring(this.inputRef.instance.value.charAt(0) === '+' ? 1 : 0)}`;
    }
  }

  /** Clear the the input. */
  private clearInput(): void {
    this.inputRef.instance.value = '';
    this.inputRef.instance.setSelectionRange(0, 0);
    this.sendToTscKeyboard();
  }

  /**
   * Moves the cursor by a given offset in characters.
   * @param offset The offset in characters, negative to move left, positive to move right.
   * @returns true if a movement was able to be performed.
   */
  private moveCursor(offset: number): boolean {
    if (this.inputRef.instance.selectionStart === null) {
      return false;
    }

    const clampedOffset = MathUtils.clamp(offset, -this.inputRef.instance.selectionStart, this.inputRef.instance.value.length - -this.inputRef.instance.selectionStart);
    if (clampedOffset === 0) {
      return false;
    }

    this.inputRef.instance.setSelectionRange(
      this.inputRef.instance.selectionStart + clampedOffset,
      this.inputRef.instance.selectionStart + clampedOffset
    );

    return true;
  }

  /**
   * Inserts a character at cursor position.
   * @param char The character to insert.
   */
  private insertCharAtCursor(char: string): void {
    if (this.inputRef.instance.selectionStart === null) {
      this.inputRef.instance.selectionStart = 0;
    }

    if (this.inputRef.instance.selectionEnd === null) {
      this.inputRef.instance.selectionEnd = 0;
    }

    this.inputRef.instance.setRangeText(char, this.inputRef.instance.selectionStart, this.inputRef.instance.selectionEnd, 'end');
    const cursorPos = this.inputRef.instance.selectionStart;
    this.checkMaxLength(cursorPos);
    this.sendToTscKeyboard();
  }

  /** Delete a character backward at cursor position. */
  private backSpaceAtCursor(): void {
    if (
      this.inputRef.instance.selectionStart === null || this.inputRef.instance.selectionStart === 0 ||
      this.inputRef.instance.selectionEnd === null || this.inputRef.instance.selectionEnd === 0
    ) {
      return;
    }

    this.inputRef.instance.setRangeText('', this.inputRef.instance.selectionStart - 1, this.inputRef.instance.selectionEnd, 'end');
    this.sendToTscKeyboard();
  }

  /**
   * Checks if the input value exceeds the maximum length and truncates it if necessary.
   * @param cursorPos The current cursor position to enforce after input truncation if it happens.
   */
  private checkMaxLength(cursorPos: number): void {
    if (this.inputRef.instance.value.length > this.inputRef.instance.maxLength) {
      this.inputRef.instance.value = this.inputRef.instance.value.slice(0, this.inputRef.instance.maxLength);
      this.inputRef.instance.setSelectionRange(cursorPos, cursorPos);
    }
  }

  /** Sends the current input value and current cursor position to the TSC keyboard. */
  public sendToTscKeyboard(): void {
    this.publisher.pub('input_field_input', this.inputRef.instance.value.toUpperCase(), true);
    this.publisher.pub('input_field_cursor_pos', this.inputRef.instance.selectionStart, true);
  }

  /** Destroys this `InputHEventHandler` and its subscriptions. */
  public destroy(): void {
    this.activeSub.destroy();
    for (const sub of this.keyboardEventSubs) {
      sub.destroy();
    }
  }
}
