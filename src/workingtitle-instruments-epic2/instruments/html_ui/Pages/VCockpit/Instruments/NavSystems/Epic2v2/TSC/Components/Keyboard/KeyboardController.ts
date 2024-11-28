import { EventBus } from '@microsoft/msfs-sdk';

import { Epic2KeyboardCharHEvents, Epic2KeyboardControlHEvents, Epic2TscKeyboardEvents } from '@microsoft/msfs-epic2-shared';

import { Keyboard } from './Keyboard';
import { KeyboardHEventPublisher } from './KeyboardHEventPublisher';

/** The possible TSC keyboard key display values.*/
export type KeyValues = 'ENTER/NEXT' | 'SPACE' | 'DELETE' | 'CLEAR' | '.' | '/' | '+/-' | 'LEFT_ARROW' | 'RIGHT_ARROW' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z' | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

/** Object index signature for keyPressToKeyEventMap */
export type KeyValueMapType = { [k in KeyValues]: Epic2KeyboardControlHEvents | Epic2KeyboardCharHEvents };

const keyPressToKeyEventMap: KeyValueMapType = {
  'ENTER/NEXT': Epic2KeyboardControlHEvents.Enter,
  'SPACE': Epic2KeyboardCharHEvents.KEY_SPACE,
  'DELETE': Epic2KeyboardControlHEvents.Delete,
  'CLEAR': Epic2KeyboardControlHEvents.Clear,
  '.': Epic2KeyboardCharHEvents.KEY_PERIOD,
  '/': Epic2KeyboardCharHEvents.KEY_SLASH,
  '+/-': Epic2KeyboardControlHEvents.PlusMinus,
  'LEFT_ARROW': Epic2KeyboardControlHEvents.CursorLeft,
  'RIGHT_ARROW': Epic2KeyboardControlHEvents.CursorRight,
  'A': Epic2KeyboardCharHEvents.KEY_A,
  'B': Epic2KeyboardCharHEvents.KEY_B,
  'C': Epic2KeyboardCharHEvents.KEY_C,
  'D': Epic2KeyboardCharHEvents.KEY_D,
  'E': Epic2KeyboardCharHEvents.KEY_E,
  'F': Epic2KeyboardCharHEvents.KEY_F,
  'G': Epic2KeyboardCharHEvents.KEY_G,
  'H': Epic2KeyboardCharHEvents.KEY_H,
  'I': Epic2KeyboardCharHEvents.KEY_I,
  'J': Epic2KeyboardCharHEvents.KEY_J,
  'K': Epic2KeyboardCharHEvents.KEY_K,
  'L': Epic2KeyboardCharHEvents.KEY_L,
  'M': Epic2KeyboardCharHEvents.KEY_M,
  'N': Epic2KeyboardCharHEvents.KEY_N,
  'O': Epic2KeyboardCharHEvents.KEY_O,
  'P': Epic2KeyboardCharHEvents.KEY_P,
  'Q': Epic2KeyboardCharHEvents.KEY_Q,
  'R': Epic2KeyboardCharHEvents.KEY_R,
  'S': Epic2KeyboardCharHEvents.KEY_S,
  'T': Epic2KeyboardCharHEvents.KEY_T,
  'U': Epic2KeyboardCharHEvents.KEY_U,
  'V': Epic2KeyboardCharHEvents.KEY_V,
  'W': Epic2KeyboardCharHEvents.KEY_W,
  'X': Epic2KeyboardCharHEvents.KEY_X,
  'Y': Epic2KeyboardCharHEvents.KEY_Y,
  'Z': Epic2KeyboardCharHEvents.KEY_Z,
  '0': Epic2KeyboardCharHEvents.KEY_0,
  '1': Epic2KeyboardCharHEvents.KEY_1,
  '2': Epic2KeyboardCharHEvents.KEY_2,
  '3': Epic2KeyboardCharHEvents.KEY_3,
  '4': Epic2KeyboardCharHEvents.KEY_4,
  '5': Epic2KeyboardCharHEvents.KEY_5,
  '6': Epic2KeyboardCharHEvents.KEY_6,
  '7': Epic2KeyboardCharHEvents.KEY_7,
  '8': Epic2KeyboardCharHEvents.KEY_8,
  '9': Epic2KeyboardCharHEvents.KEY_9,
};

/** Controls:
 * - How the TSC keyboard sends input to `InputField`s by emitting HEvents on each key press.
 * - How the TSC keyboard scrathpad receives its value from `InputField`s values by listening to a topic.
 */
export class KeyboardController {
  private readonly publisher = this.bus.getPublisher<Epic2TscKeyboardEvents>();
  private readonly subscriber = this.bus.getSubscriber<Epic2TscKeyboardEvents>();
  private readonly keyPressToKeyEventMap = keyPressToKeyEventMap;

  /**
   * The constructor of `KeyboardController`.
   * @param bus An instance of the EventBus.
   * @param keyboard An instance of the TSC Keyboard.
   */
  constructor(private readonly bus: EventBus, private readonly keyboard: Keyboard) {
    this.subscriber.on('input_field_input').handle((input: string) => {
      if (input.length > this.keyboard.inputSlotEntries.length - 1) {
        return;
      }

      this.populateSlotEntries(input);
    });

    this.subscriber.on('input_field_cursor_pos').handle((cursor: number | null) => {
      if (cursor !== null && cursor > this.keyboard.inputSlotEntries.length - 1) {
        return;
      }

      this.mirrorInputBoxCursor(cursor);
    });
  }

  /**
   * Populates the slot entries with a string.
   * @param input The input string.
   */
  private populateSlotEntries(input: string): void {
    // clears previous values of all slots.
    this.keyboard.inputSlotEntries.map((entry) => {
      entry.ref.instance.setValue('');
    });

    [...input].map((char: string, index: number) => {
      this.keyboard.inputSlotEntries[index].ref.instance.setValue(char);
    });
  }

  /**
   * Sets the TSC keyboard cursor position to `InputBox` cursor.
   * @param pos The cursor position in the `InputBox`.
   */
  private mirrorInputBoxCursor(pos: number | null): void {
    this.keyboard.inputRef.instance.placeCursor(pos ?? this.keyboard.inputSlotEntries.length, false);
  }

  /**
   * Callback on key press that publishes an HEvent.
   * @param key The value of the key pressed.
   */
  public onKeyPress(key: KeyValues): void {
    KeyboardHEventPublisher.sendKey(this.keyPressToKeyEventMap[key]);
  }

  /** Callback on closing the keyboard. */
  public onClose(): void {
    this.publisher.pub('tsc_keyboard_force_blur', undefined, true);
    this.publisher.pub('tsc_keyboard_active_input_id', undefined, true);
  }
}
