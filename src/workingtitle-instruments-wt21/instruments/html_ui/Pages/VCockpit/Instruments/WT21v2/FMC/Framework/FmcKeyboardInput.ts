import { DebounceTimer, EventBus, Publisher, Subject } from '@microsoft/msfs-sdk';

import { FMS_MESSAGE_ID, Message, MESSAGE_LEVEL, MESSAGE_TARGET } from '@microsoft/msfs-wt21-shared';

import { FmcMessageEvents } from '../Data/FmcMessageReceiver';
import { FmcPrevNextEvent, FmcScratchpadInputEvent } from '../FmcEvent';
import { WT21FmcEvents } from '../WT21FmcEvents';
import { FmcBtnEvents } from './FmcEventPublisher';

/**
 * A class handling the (physical) keyboard input.
 */
export class FmcKeyboardInput {
  private readonly isActive = Subject.create<boolean>(false);
  private readonly fmcPublisher: Publisher<WT21FmcEvents>;
  private readonly btnPublisher: Publisher<FmcBtnEvents>;
  private readonly msgPublisher: Publisher<FmcMessageEvents>;
  private readonly timeoutTimer = new DebounceTimer();
  private readonly keydownHandler;
  private readonly inputId = this.genGuid();


  /**
   * Ctor
   * @param bus The event bus.
   */
  constructor(bus: EventBus) {
    this.fmcPublisher = bus.getPublisher<WT21FmcEvents>();
    this.btnPublisher = bus.getPublisher<FmcBtnEvents>();
    this.msgPublisher = bus.getPublisher<FmcMessageEvents>();
    this.keydownHandler = this.handleKeyInput.bind(this);

    this.isActive.sub((v: boolean) => {
      this.btnPublisher.pub('fmcActivateKeyboardInputEvent', v);
      if (v === true) {
        this.setTimeoutTimer();
        this.msgPublisher.pub('fmc_new_message',
          new Message('KB INPUT ACTIVE', MESSAGE_LEVEL.White, 999, MESSAGE_TARGET.FMC, FMS_MESSAGE_ID.KBINPUTACTIVE), false, false);
        Coherent.trigger('FOCUS_INPUT_FIELD', this.inputId, '', '', '', false);
        document.addEventListener('keydown', this.keydownHandler, true);
        Coherent.on('SetInputTextFromOS', this.setValueFromOS);
        Coherent.on('mousePressOutsideView', this.blur);
      } else {
        this.timeoutTimer.clear();
        this.msgPublisher.pub('fmc_clear_message', FMS_MESSAGE_ID.KBINPUTACTIVE, false, false);
        Coherent.trigger('UNFOCUS_INPUT_FIELD', this.inputId);
        document.removeEventListener('keydown', this.keydownHandler, true);
        Coherent.off('SetInputTextFromOS', this.setValueFromOS);
        Coherent.off('mousePressOutsideView', this.blur);
      }
    }, true);

    // handle click onto the screen
    document.addEventListener('click', () => {
      this.isActive.set(!this.isActive.get());
    });
  }

  /**
   * Schedules the timeout.
   */
  private setTimeoutTimer(): void {
    this.timeoutTimer.schedule(() => {
      this.blur();
    }, 30000);
  }

  /**
   * Publishes events for input's from the system's OSK.
   * @param text The text to be published.
   */
  private setValueFromOS = (text: string): void => {
    if (text.length > 0) {
      for (let i = 0; i < text.length; i++) {
        const c = text[i];
        this.fmcPublisher.pub('scratchpad_type', `BTN_${c}` as FmcScratchpadInputEvent, false, false);

      }
    }
    this.blur();
  };

  /**
   * Activates keyboard input mode.
   */
  private focus = (): void => {
    this.isActive.set(true);
  };

  /**
   * Deactivates keyboard input mode.
   */
  private blur = (): void => {
    this.isActive.set(false);
  };

  /**
   * Handler for keydown events.
   * @param ev The keyboard event.
   */
  private handleKeyInput(ev: KeyboardEvent): void {
    ev.stopImmediatePropagation();
    ev.preventDefault();

    if (ev.keyCode === KeyCode.KEY_BACK_SPACE) {
      this.fmcPublisher.pub(ev.ctrlKey ? 'clear_del_long' : 'clear_del', undefined, false);
    } else if (ev.keyCode === KeyCode.KEY_SPACE) {
      this.fmcPublisher.pub('scratchpad_type', ' ', false, false);
    } else if (ev.keyCode === KeyCode.KEY_SLASH || ev.keyCode === KeyCode.KEY_DIVIDE || ev.keyCode === KeyCode.KEY_BACK_SLASH) {
      this.fmcPublisher.pub('scratchpad_type', '/', false, false);
    } else if (ev.keyCode === KeyCode.KEY_ADD || ev.keyCode === KeyCode.KEY_SUBTRACT) {
      this.fmcPublisher.pub('scratchpad_plus_minus', undefined, false, false);
    } else if (ev.keyCode === KeyCode.KEY_DECIMAL || ev.keyCode === KeyCode.KEY_PERIOD) {
      this.fmcPublisher.pub('scratchpad_type', '.', false, false);
    } else if (ev.keyCode === KeyCode.KEY_LEFT) {
      this.fmcPublisher.pub(FmcPrevNextEvent.BTN_PREV, undefined, false, false);
    } else if (ev.keyCode === KeyCode.KEY_RIGHT) {
      this.fmcPublisher.pub(FmcPrevNextEvent.BTN_NEXT, undefined, false, false);
    } else if ((ev.keyCode >= 48 && ev.keyCode <= 57)
      || (ev.keyCode >= 65 && ev.keyCode <= 90)
      || (ev.keyCode >= 96 && ev.keyCode <= 105)) {
      let key = ev.keyCode;
      if (key >= 96 && key <= 105) {
        key -= 48;
      }
      this.fmcPublisher.pub('scratchpad_type', String.fromCharCode(key), false, false);
    }

    this.setTimeoutTimer();
  }

  /**
   * Generates a unique id.
   * @returns A unique ID string.
   */
  private genGuid(): string {
    return 'INPT-xxxyxxyy'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0,
        v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
