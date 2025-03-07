import { SubscribableUtils } from '@microsoft/msfs-sdk';
import { InputBox } from './InputBox';
import { Epic2DuControlEvents, Epic2TscKeyboardEvents } from '../../Misc';
import { InputHEventHandler } from './InputHEventHandler';

/** An input box that can take inputs from the TSC or MF controller. */
export class InputBoxTsc<T extends string | number> extends InputBox<T> {
  private readonly publisher = this.props.bus.getPublisher<Epic2TscKeyboardEvents>();
  private readonly subscriber = this.props.bus.getSubscriber<Epic2DuControlEvents & Epic2TscKeyboardEvents>();
  private readonly keyboardHandler = new InputHEventHandler(this.props.bus, this._isActive, this.inputRef);

  /** @inheritdoc */
  public onAfterRender(): void {
    super.onAfterRender();

    this.publisher.pub('tsc_keyboard_max_chars', this.inputRef.instance.maxLength, true);

    const keyPressHandler = this.handleKeyPress.bind(this);
    this.subscriptions.push(
      this.isActive.sub((isActive: boolean) => {
        isActive && this.inputRef.instance.addEventListener('keypress', keyPressHandler);
        !isActive && this.inputRef.instance.removeEventListener('keypress', keyPressHandler);
      }),
      this.subscriber.on('epic2_host_display_unit_selected').handle((isSelectedDu) => !isSelectedDu && this.isActive.get() && this.inputRef.instance.blur()),
    );

    if (this.props.blurOnEnter) {
      this.subscriptions.push(
        this.subscriber.on('tsc_keyboard_next').handle(async () => {
          this.inputRef.instance.blur();

          // copy the bit from `InputBox`'s `onInputBlur` method that handles the formatter and checks if the bind is mutable,
          // so that this is a stripped down version of the original `onInputBlur`'s input checking, so that we could call
          // `this.props.onBlur?.()` inside this event handler without compromising the original `onInputBlur`'s functionality.
          if (!this.isValidator(this.props.formatter)) {
            return;
          }

          const newValue = await this.props.formatter.parse(this.inputRef.instance.value);

          if (newValue !== null && SubscribableUtils.isMutableSubscribable(this.props.bind)) {
            SubscribableUtils.isMutableSubscribable(this.props.bind) && this.props.onBlur?.();
          }
          // end of the copied part.
        })
      );
    }
  }

  /** @inheritdoc */
  protected override async onInputBlur(): Promise<void> {
    this.publisher.pub('tsc_keyboard_active_input_id', undefined, true);
    await super.onInputBlur();
  }

  /** @inheritdoc */
  protected override onInputFocus(e: FocusEvent): void {
    super.onInputFocus(e);
    this.publisher.pub('tsc_keyboard_active_input_id', this.inputId, true);
    this.keyboardHandler.sendToTscKeyboard();
  }

  protected override readonly handleInput = (): void => {
    if (this.inputRef.instance.value.length > this.inputRef.instance.maxLength) {
      this.inputRef.instance.value = this.inputRef.instance.value.slice(0, this.inputRef.instance.maxLength);
      return;
    }

    this.keyboardHandler.sendToTscKeyboard();
  };

  /**
   * Handles the `keypress` event from the input element.
   * @param event The `KeyboardEvent`;
   */
  private readonly handleKeyPress = (event: KeyboardEvent): void => {
    if (event.keyCode === 13) { // enter key
      this.publisher.pub('tsc_keyboard_next', undefined, true);
    }
  };

  /** @inheritdoc */
  public override destroy(): void {
    for (const sub of this.subscriptions) {
      sub.destroy();
    }
    this.keyboardHandler.destroy();
    super.destroy();
  }
}
