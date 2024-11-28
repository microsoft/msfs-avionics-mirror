import {
  ComponentProps, DisplayComponent, EventBus, Formatter, FSComponent, InstrumentEvents, MutableSubscribable, SetSubject, Subject, Subscribable,
  SubscribableUtils, Subscription, Validator, VNode
} from '@microsoft/msfs-sdk';

import { FmsMessageKey, FmsMessageTransmitter } from '../../FmsMessageSystem';
import { Epic2CockpitEvents } from '../../Misc';
import { CockpitUserSettings } from '../../Settings';

import './InputBox.css';

/** The properties for the {@link InputBox} component. */
export interface InputBoxProps<T> extends ComponentProps {
  /**
   * The event bus. Required for the input to respond appropriately to the mouse leaving the virtual cockpit instrument
   * screen while the user is dragging the control.
   */
  readonly bus: EventBus;
  /**
   * The value to bind to the field. If the `bind` value is not mutable and no {@link onModified} handler
   * is provided the input will be read-only.
   */
  readonly bind: Subscribable<T | null> | MutableSubscribable<T | null>;
  /**
   * Optional callback fired when the bound value is about to be modified. This is only called when a value is successfully validated.
   *
   * This should be used when there is no appropriate way of using a modifiable data source to accept modifications from this input field.
   *
   * An example of this is a complex process like inserting a flight plan leg, or something calling a distant modification
   * process with a very indirect relationship to the input data.
   *
   * If the {@link bind} value is not mutable and a `onMondified` handler is provided, it must always return true (handling
   * the modification itself).
   *
   * If the return value is:
   * - `true`   -> the handler **is** considered to have handled the call, and any bound data is **not** modified.
   * - `false`  -> the handler is **not** considered to have handled the call itself, and any bound data **is** modified.
   * - error    -> the error is thrown and needs to be handled upstream (e.g. FMC message).
   */
  readonly onModified?: (newValue: T) => Promise<boolean>,

  /**
   * Callback when the `InputBox` is blurred. This property should only be used when
   * an `InputBox` is connected to the TSC keyboard, but is not managed by a `InputFocusManager`
   * (and therefore its blurring on `Enter` or on `ENTER/NEXT` is not automatic).
   */
  // FIXME: Make it so that only `InputBoxTsc` can have this prop.
  readonly onBlur?: () => void;

  /**
   * Whether this `InputBox` should be blurred when `Enter` key is pressed on the physical keyboard,
   * or when `ENTER/NEXT` button is pressed on the TSC keyboard. This property should only be used when
   * an `InputBox` is connected to the TSC keyboard, but is not managed by a `InputFocusManager`
   * (and therefore its blurring on `Enter` or on `ENTER/NEXT` is not automatic).
   */
  // FIXME: Make it so that only `InputBoxTsc` can have this prop.
  readonly blurOnEnter?: boolean;

  /**
   * Formats the {@link bind} for display.
   * If no validator is provided the input will be read-only.
   */
  readonly formatter: Formatter<T> & Validator<T>;

  /** Whether the input is enabled, or a subscribable which provides it. Defaults to `true`. */
  readonly isEnabled?: boolean | Subscribable<boolean>;

  /** The maximum number of chacters the input box will accept. Defaults to 5. */
  readonly maxLength?: number;

  // FIXME... DragValidator? The bus thing is awkward though.. Can't really work at all for non-numeric inputs.
  /** Displays draggable icon to change the value of the input. */
  readonly dragConfig?: {
    /** Unit of change per tick. */
    readonly increment: number;
    /** Minimum value. */
    readonly min: number;
    /** Max value. */
    readonly max: number;
    /**
     * The event bus. Required for the input to respond appropriately to the mouse leaving the virtual cockpit instrument
     * screen while the user is dragging the control.
     */
    readonly bus: EventBus;
  };
}

/** The InputBox component. */
export class InputBox<T extends number | string> extends DisplayComponent<InputBoxProps<T>> {
  private readonly cockpitUserSettings = CockpitUserSettings.getManager(this.props.bus);
  private readonly captureInputSetting = this.cockpitUserSettings.getSetting('captureKeyboardInput');

  public readonly isEnabled = SubscribableUtils.toSubscribable(this.props.isEnabled ?? true, true) as Subscribable<boolean>;
  private readonly _isError = Subject.create(false);
  protected readonly _isActive = Subject.create(false);
  private readonly _isCapturing = Subject.create(false);
  public readonly isError = this._isError as Subscribable<boolean>;
  public readonly isActive = this._isActive as Subscribable<boolean>;
  public readonly isCapturing = this._isCapturing as Subscribable<boolean>;

  protected readonly isReadOnly = !this.isValidator(this.props.formatter)
    || (!SubscribableUtils.isMutableSubscribable(this.props.bind) && this.props.onModified === undefined);

  private readonly instrumentMouseLeaveSub = this.props?.dragConfig?.bus
    .getSubscriber<InstrumentEvents>()
    .on('vc_mouse_leave')
    .handle(() => this.onMouseUp());

  public readonly inputRef = FSComponent.createRef<HTMLInputElement>();

  public readonly dragRef = FSComponent.createRef<HTMLElement>();
  public readonly inputId = this.genGuid();
  private readonly startPoint = Subject.create({ y: 0 });
  private readonly endPoint = Subject.create({ y: 0 });
  private readonly DEFAULT_INCREMENT = 1;
  private readonly MOUSE_BUFFER = 3;
  private readonly INITIAL_POINT = { y: 0 };
  private readonly dragClasses = SetSubject.create(['input-box-wheel']);
  private readonly fmsMessageTransmitter = new FmsMessageTransmitter(this.props.bus);

  protected subscriptions: Subscription[] = [];

  /** @inheritdoc */
  public onAfterRender(): void {
    this.subscriptions = [
      this.props.bind.sub(() => {
        this.inputRef.instance.value = this.getFormattedValue();
      }, true),
    ];

    if (this.isReadOnly) {
      this.inputRef.instance.disabled = true;
    } else {
      this.isEnabled.sub(isEnabled => {
        this.inputRef.instance.disabled = !isEnabled;
      }, true);

      if (this.props.dragConfig) {
        this.dragRef.instance.addEventListener('mousedown', this.onMouseDown.bind(this));
      }

      this.inputRef.instance.onfocus = this.onInputFocus.bind(this);
      this.inputRef.instance.onblur = this.onInputBlur.bind(this);
    }

    this.captureInputSetting.sub((captureInput) => {
      this.inputRef.instance.readOnly = !captureInput;

      if (this._isActive.get()) {
        if (captureInput) {
          this.captureInput();
        } else {
          this.onInputBlur();
        }
      }
    }, true);
  }

  /**
   * Handles mouse press for draggable inputs.
   * @param event The DOM event.
   */
  public onMouseDown(event: MouseEvent): void {
    this.startPoint.set({ y: event.clientY });
    this.dragClasses.add('input-box-wheel-active');
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  }

  /**
   * Update the endPoint on mousemove
   * @param event MouseCoordinates
   */
  public onMouseMove(event: MouseEvent): void {
    this.endPoint.set({ y: event.clientY });
    this.updateInput();
  }

  /**
   * Remove the listeners and reset
   */
  public onMouseUp(): void {
    // Remove the listeners
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);

    // Remove class
    this.dragClasses.delete('input-box-wheel-active');

    // Reset points
    this.startPoint.set({ ...this.INITIAL_POINT });
    this.endPoint.set({ ...this.INITIAL_POINT });
  }

  /**
   * Checks if the bound value is a mutable number.
   * @param bind The bound value.
   * @returns true if the bound value is a mutable number.
   */
  private isBindMutableNumeric(bind: unknown): bind is MutableSubscribable<number> {
    return SubscribableUtils.isMutableSubscribable(bind) && typeof bind.get() === 'number';
  }

  /**
   * Update the input value from dragging.
   */
  private updateInput(): void {
    if (this.startPoint.get() && this.endPoint.get()) {
      const currentValue = Number(this.props.bind.get());
      const dy = this.endPoint.get().y - this.startPoint.get().y;

      // If the drag distance doesn't exceed the buffer, exit early
      if (Math.abs(dy) < this.MOUSE_BUFFER) {
        return;
      }

      if (this.isReadOnly || !this.isBindMutableNumeric(this.props.bind)) {
        return;
      }

      // Direction multiplier
      const direction = dy < 0 ? 1 : -1;

      const increment = this.DEFAULT_INCREMENT;

      // Calculate the new input value and check within bounds
      let newValue: number;
      if (currentValue % 1 !== 0) {
        // Check if the value has a fractional part
        // Handle decimal values
        newValue =
          (Math.round(
            (currentValue * 100 + increment * direction) / increment,
          ) *
            increment) /
          100;
      } else {
        // Handle whole numbers
        newValue =
          Math.round((currentValue + increment * direction) / increment) *
          increment;
      }

      // FIXME should be handled by an external validator
      this.props.bind.set(this.applyDragBounds(newValue));

      // reset the startPoint
      this.startPoint.set(this.endPoint.get());
    }
  }

  /**
   * Restrict upper/lower bounds of input
   * @param value number to check
   * @returns number
   */
  public applyDragBounds(value: number): number {
    if (!this.props.dragConfig) {
      return value;
    }
    const minRange = this.props.dragConfig.min;
    const maxRange = this.props.dragConfig.max;
    if (value < minRange) {
      return minRange;
    } else if (value > maxRange) {
      return maxRange;
    }
    return value;
  }

  /**
   * Generates a unique id.
   * @returns A unique ID string.
   */
  private genGuid(): string {
    return 'INPT-xxxyxxyy'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0,
        v = c == 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Method to handle when input focus is set
   * @param e The focus event.
   */
  protected onInputFocus(e: FocusEvent): void {
    e.preventDefault();

    const currentText = '';

    if (this.captureInputSetting.get()) {
      this.captureInput();
    }

    Coherent.on('mousePressOutsideView', () => {
      this.inputRef.instance.blur();
    });

    this.inputRef.instance.focus({ preventScroll: true });
    this.inputRef.instance.value = currentText;
    this.inputRef.instance.selectionStart = this.inputRef.instance.selectionEnd = currentText.length;

    this._isActive.set(true);
  }

  /**
   * Captures keyboard inputs
   */
  private captureInput(): void {
    this._isCapturing.set(true);
    Coherent.on('SetInputTextFromOS', this.setValueFromOS);
    Coherent.trigger(
      'FOCUS_INPUT_FIELD',
      this.inputId,
      '',
      '',
      this.inputRef.instance.value,
      false,
    );
    this.inputRef.instance.addEventListener('input', this.handleInput);
    this.props.bus.getPublisher<Epic2CockpitEvents>().pub('input_field_capturing', true, true);
  }

  /**
   * Checks if a formatter is also a validator.
   * @param formatter The formatter to check.
   * @returns true if the formatter is also a validator.
   */
  protected isValidator(formatter: unknown): formatter is (Formatter<T> | Validator<T>) {
    return typeof formatter === 'object' && formatter !== null && (formatter as any).parse !== undefined;
  }

  /**
   * Gets the formatted value of the bound data.
   * @returns the formatted value.
   */
  private getFormattedValue(): string {
    const value = this.props.bind.get();
    if (value === null) {
      return this.props.formatter.nullValueString ?? '';
    }
    return this.props.formatter.format(value as NonNullable<T>);
  }

  /** Method to handle on input blur */
  protected async onInputBlur(): Promise<void> {
    Coherent.off('SetInputTextFromOS', this.setValueFromOS);
    Coherent.trigger('UNFOCUS_INPUT_FIELD', '');
    Coherent.off('mousePressOutsideView');

    this.inputRef.instance.removeEventListener('input', this.handleInput);

    this._isActive.set(false);
    this._isCapturing.set(false);
    this.props.bus.getPublisher<Epic2CockpitEvents>().pub('input_field_capturing', false, true);

    if (!this.isValidator(this.props.formatter)) {
      // should not happen as the field is read-only when there's no validator, but we need the if for type inference
      console.error('InputBox: No validator!');
      return;
    }

    const newValue = await this.props.formatter.parse(this.inputRef.instance.value);

    if (newValue !== null) {
      if (this.props.onModified !== undefined) {
        const modifyResult = await this.props.onModified(newValue);
        if (modifyResult) {
          // the modification was already handled
          return;
        }
      } else if (SubscribableUtils.isMutableSubscribable(this.props.bind)) {
        // we are handling the mutation
        this.props.bind.set(newValue);
      } else {
        // should not happen as the field is read-only
        console.error('InputBox: bind is not mutable!');
        return;
      }
    } else {
      this.inputRef.instance.value = this.getFormattedValue();
      this.handleError();
      return;
      // TODO we need some channel to pass errors back up for display
    }
  }

  private setValueFromOS = (text: string): void => {
    this.inputRef.instance.value = text;
    this.inputRef.instance.dispatchEvent(new Event('input'));
    !this._isActive.get() && this.inputRef.instance.blur();
    Coherent.off('SetInputTextFromOS', this.setValueFromOS);
  };

  /**
   * Handles the input event from the input element.
   */
  protected readonly handleInput = (): void => {
    // no-op
  };

  /** Handles any errors */
  public handleError(): void {
    this._isError.set(true);
    this.fmsMessageTransmitter.sendMessage(FmsMessageKey.GenericInvalidEntry);
    setTimeout(() => this.fmsMessageTransmitter.clearMessage(), 2000);
    setTimeout(() => this._isError.set(false), 500);
  }

  /** @inheritdoc */
  public onDestroy(): void {
    document.removeEventListener('mousemove', () => null);
    document.removeEventListener('mouseup', () => null);
    this.dragRef.instance.removeEventListener('mousedown', () => null);
    this.instrumentMouseLeaveSub?.destroy();
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div
        class={{
          'input-box-container': true,
          'input-box-disabled': this.isEnabled.map(x => !x),
          'input-box-error': this._isError.map(x => x),
          'input-box-capturing': this._isActive,
        }}
      >
        {this.props.dragConfig && (
          <div ref={this.dragRef} class={this.dragClasses}>
            <svg viewBox="0 0 15.48 18">
              <path
                fill="transparent"
                d="M11.6,3.33C10.56,2.49,9.25,2,7.89,2C4.64,2,2,4.64,2,7.89c0,2.85,2.03,5.23,4.71,5.77L6.07,12l3.16,0.58
            l3.21-6.62L9.61,5.09L11.6,3.33z"
              />
              <path
                fill="#00FFF4"
                d="M6.07,12l0.65,1.66C4.03,13.12,2,10.74,2,7.89C2,4.64,4.64,2,7.89,2c1.36,0,2.67,0.49,3.71,1.33l-2,1.76
            l2.83,0.87l3.04,0.93l-1.03-6.05L13.12,2c-1.43-1.27-3.29-2-5.23-2C3.54,0,0,3.54,0,7.89c0,4.23,3.35,7.68,7.53,7.87L8.4,18
            l3.71-4.89l-2.88-0.53L6.07,12z"
              />
            </svg>
          </div>
        )}
        <input
          ref={this.inputRef}
          class="input-box"
          id={this.inputId}
          tabindex="-1"
          type="text"
          size="1"
          maxLength={this.props.maxLength || 5}
          readonly="true"
        />
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.subscriptions.map((sub) => sub.destroy());
    super.destroy();
  }
}
