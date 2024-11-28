import { ComputedSubject, FocusPosition, FSComponent, MathUtils, Subject, Subscribable, VNode } from '@microsoft/msfs-sdk';

import { G1000UiControl, G1000UiControlProps } from '../../../../Shared/UI/G1000UiControl';
import { UiControl } from '../../../../Shared/UI/UiControl';
import { FmsHEvent } from '../../../../Shared//UI/FmsHEvent';

/** Props on the ConstraintSelector component. */
interface ConstraintSelectorProps extends G1000UiControlProps {

  /** The data for this component to display. */
  data: Subscribable<number>;

  /** Whether or not the constraint is invalid. */
  isInvalid: Subscribable<boolean>;

  /** Whether or not the constraint has been edited. */
  isEdited: Subscribable<boolean>;

  /** Whether or not the constraint should be hidden. */
  isHidden: Subscribable<boolean>;

  /** A callback called when a new value is selected on the control. */
  onSelected: (altitude: number) => void;

  /** A callback called when an altitude constraint in removed. */
  onRemoved: () => void;
}

/**
 * A component that allows one to select a constraint in the flight plan.
 */
export class ConstraintSelector extends G1000UiControl<ConstraintSelectorProps> {

  private readonly value = Subject.create<number>(0);
  private readonly isEdited = ComputedSubject.create<boolean, boolean>(false, (v: boolean): boolean => {
    const value = this.value.get();
    if (isNaN(value) || value <= 0) {
      return false;
    } else {
      return v;
    }
  });

  private readonly el = FSComponent.createRef<HTMLDivElement>();
  private readonly failedBoxRef = FSComponent.createRef<HTMLDivElement>();

  private readonly digitValues = [
    this.value.map(v => this.extractDigit(v, 0)),
    this.value.map(v => this.extractDigit(v, 1)),
    this.value.map(v => this.extractDigit(v, 2)),
    this.value.map(v => this.extractDigit(v, 3)),
    this.value.map(v => this.extractDigit(v, 4))
  ];

  private readonly digitRefs = [
    FSComponent.createRef<HTMLSpanElement>(),
    FSComponent.createRef<HTMLSpanElement>(),
    FSComponent.createRef<HTMLSpanElement>(),
    FSComponent.createRef<HTMLSpanElement>(),
    FSComponent.createRef<HTMLSpanElement>()
  ];

  private isEditing = false;
  private focusedDigit = 0;

  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);
    this.setChildrenDisabled(true);

    this.props.data.sub(altitude => {
      if (!this.isEditing) {
        this.value.set(altitude);
      }
    });

    this.props.isEdited.sub(isEdited => {
      if (!this.isEditing) {
        this.isEdited.set(isEdited);
      }
    });

    this.props.isInvalid.sub(isInvalid => {
      if (!this.isEditing) {
        this.failedBoxRef.instance.style.display = isInvalid ? 'block' : 'none';
      }
    }, true);

    this.props.isHidden.sub(isHidden => {
      this.setDisabled(isHidden);
      if (isHidden) {
        this.el.instance.classList.add(UiControl.HIDE_CLASS);
      } else {
        this.el.instance.classList.remove(UiControl.HIDE_CLASS);
      }
    });
  }

  /**
   * Extracts a specific digit from a number.
   * @param value The number to extract from.
   * @param digit The digit to extract, zero indexed.
   * @returns The extracted digit.
   */
  private extractDigit(value: number, digit: number): string {
    if ((value < 1 || isNaN(value)) && !this.isEditing) {
      return '_ ';
    }

    if (value < Math.pow(10, digit) && !this.isEditing) {
      return '';
    }

    return (Math.floor(this.value.get() / Math.pow(10, digit)) % 10).toFixed(0);
  }

  /** @inheritdoc */
  public onUpperKnobInc(): boolean {
    this.setEditing(true);
    return true;
  }

  /** @inheritdoc */
  public onUpperKnobDec(): boolean {
    this.setEditing(true);
    return true;
  }

  /**
   * Sets whether or not the control is presently in an edit state.
   * @param isEditing Whether or not the control is editing.
   * @param notify Whether or not to notify of the new value when changing state.
   * @param focusFirst Whether or not to focus the first digit when entering edit mode. Focuses last digit when false
   */
  private setEditing(isEditing: boolean, notify = true, focusFirst = true): void {
    if (this.isEditing !== isEditing) {
      if (isEditing) {
        this.setIsolated(true);
        this.setChildrenDisabled(false);
        this.failedBoxRef.instance.style.display = 'none';

        this.isEditing = isEditing;
        this.getChild(focusFirst ? 0 : 4)?.focus(FocusPosition.First);
      } else {
        this.setIsolated(false);
        this.setChildrenDisabled(true);

        this.isEditing = isEditing;
        this.isEdited.set(this.props.isEdited.get());

        this.failedBoxRef.instance.style.display = (this.props.isInvalid.get()) ? 'block' : 'none';
        this.onFocused();
      }

      if (notify) {
        this.value.notify();
      }
    }
  }

  /**
   * Sets all the individual digit controls disabled or enabled.
   * @param areDisabled Whether or not the controls are disabled.
   */
  private setChildrenDisabled(areDisabled: boolean): void {
    for (let i = 0; i < this.length; i++) {
      const control = this.getChild(i);
      control?.setDisabled(areDisabled);
    }
  }

  /** @inheritdoc */
  public onClr(): boolean {
    if (this.isEditing) {
      this.setEditing(false);
      this.value.set(this.props.data.get());
    } else {
      this.props.onRemoved();
    }

    return true;
  }

  /** @inheritdoc */
  public onEnter(): boolean {
    if (this.isEditing) {
      if (this.value.get() !== this.props.data.get()) {
        this.props.onSelected(this.value.get());
        this.isEdited.set(true);
      }

      this.setEditing(false);
    } else {
      this.scroll('forward');
    }

    return true;
  }

  /** @inheritdoc */
  public onUpperKnobPush(): boolean {
    if (this.isEditing) {
      this.setEditing(false);
      this.value.set(this.props.data.get());
      return true;
    }

    return false;
  }

  /**
   * A callback called when a specific digit is focused.
   * @param digit The digit that was focused, zero indexed.
   */
  private onDigitFocused(digit: number): void {
    this.el.instance.classList.remove(UiControl.FOCUS_CLASS);
    this.digitRefs[digit].instance.classList.add(UiControl.FOCUS_CLASS);
    this.focusedDigit = digit;
  }

  /**
   * A callback called when a specific digit is blurred.
   * @param digit The digit that was blurred, zero indexed.
   */
  private onDigitBlurred(digit: number): void {
    this.digitRefs[digit].instance.classList.remove(UiControl.FOCUS_CLASS);
  }

  /**
   * A callback called when a specific digit is increased.
   * @param digit The digit that was focused, zero indexed.
   * @returns True as the event is always handled.
   */
  private onDigitIncreased(digit: number): boolean {
    const currentValue = this.value.get();
    if (this.extractDigit(currentValue, digit) === '9') {
      this.value.set(currentValue - (9 * Math.pow(10, digit)));
    } else {
      this.value.set(currentValue + Math.pow(10, digit));
    }

    return true;
  }

  /**
   * A callback called when a specific digit is decreased.
   * @param digit The digit that was blurred, zero indexed.
   * @returns True as the event is always handled.
   */
  private onDigitDecreased(digit: number): boolean {
    const currentValue = this.value.get();
    if (this.extractDigit(currentValue, digit) === '0') {
      this.value.set(currentValue + (9 * Math.pow(10, digit)));
    } else {
      this.value.set(currentValue - Math.pow(10, digit));
    }

    return true;
  }

  /** @inheritdoc */
  protected onFocused(): void {
    for (let i = 0; i < this.length; i++) {
      this.onDigitBlurred(i);
    }

    this.el.instance.classList.add(UiControl.FOCUS_CLASS);
  }

  /** @inheritdoc */
  protected onBlurred(): void {
    if (this.isEditing) {
      this.setEditing(false, false);
      this.value.set(this.props.data.get());
    }

    this.el.instance.classList.remove(UiControl.FOCUS_CLASS);
  }

  /** @inheritDoc */
  public consolidateKeyboardHEvent(source: G1000UiControl, evt: FmsHEvent): boolean {
    switch (evt) {
      case FmsHEvent.D0:
        return this.handleDigitInput(0);
      case FmsHEvent.D1:
        return this.handleDigitInput(1);
      case FmsHEvent.D2:
        return this.handleDigitInput(2);
      case FmsHEvent.D3:
        return this.handleDigitInput(3);
      case FmsHEvent.D4:
        return this.handleDigitInput(4);
      case FmsHEvent.D5:
        return this.handleDigitInput(5);
      case FmsHEvent.D6:
        return this.handleDigitInput(6);
      case FmsHEvent.D7:
        return this.handleDigitInput(7);
      case FmsHEvent.D8:
        return this.handleDigitInput(8);
      case FmsHEvent.D9:
        return this.handleDigitInput(9);
    }
    return super.consolidateKeyboardHEvent(source, evt);
  }

  /**
   * Handles a digit input from consolidated FMSHEvents.
   * @param digit The digit that was input.
   * @returns True as the event is always handled.
   */
  private handleDigitInput(digit: number): boolean {
    if (!this.isEditing) {
      this.setEditing(true, false, false);
      this.value.set(digit);
    } else {
      if (this.focusedDigit === 0) {
        // the last digit is focused
        if (this.value.get() < 10000) {
          // if not all digits are used, add the new digit to the end
          this.value.set(this.value.get() * 10 + digit);
        } else {
          // if all digits are used, replace the last digit with the new one
          this.value.set(MathUtils.floor(this.value.get(), 10) + digit);
        }
      } else {
        // if any other digit is focused, replace the focused digit with the new one
        const digitsBeforeFocused = MathUtils.floor(this.value.get(), Math.pow(10, this.focusedDigit + 1));
        const digitsAfterFocused = this.value.get() % Math.pow(10, this.focusedDigit);
        this.value.set(digitsBeforeFocused + digit * Math.pow(10, this.focusedDigit) + digitsAfterFocused);
        // focus the next digit
        this.scroll('forward');
      }
    }
    return true;
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div style='position: relative; height: 18px'>
        <div class="constraint-failed-box" ref={this.failedBoxRef} />
        <span ref={this.el}>
          <G1000UiControl onFocused={(): void => this.onDigitFocused(4)} onBlurred={(): void => this.onDigitBlurred(4)}
            onUpperKnobInc={(): boolean => this.onDigitIncreased(4)} onUpperKnobDec={(): boolean => this.onDigitDecreased(4)}
            onUpperKnobPush={(): boolean => this.onUpperKnobPush()}>
            <span ref={this.digitRefs[4]}>{this.digitValues[4]}</span>
          </G1000UiControl>
          <G1000UiControl onFocused={(): void => this.onDigitFocused(3)} onBlurred={(): void => this.onDigitBlurred(3)}
            onUpperKnobInc={(): boolean => this.onDigitIncreased(3)} onUpperKnobDec={(): boolean => this.onDigitDecreased(3)}
            onUpperKnobPush={(): boolean => this.onUpperKnobPush()}>
            <span ref={this.digitRefs[3]}>{this.digitValues[3]}</span>
          </G1000UiControl>
          <G1000UiControl onFocused={(): void => this.onDigitFocused(2)} onBlurred={(): void => this.onDigitBlurred(2)}
            onUpperKnobInc={(): boolean => this.onDigitIncreased(2)} onUpperKnobDec={(): boolean => this.onDigitDecreased(2)}
            onUpperKnobPush={(): boolean => this.onUpperKnobPush()}>
            <span ref={this.digitRefs[2]}>{this.digitValues[2]}</span>
          </G1000UiControl>
          <G1000UiControl onFocused={(): void => this.onDigitFocused(1)} onBlurred={(): void => this.onDigitBlurred(1)}
            onUpperKnobInc={(): boolean => this.onDigitIncreased(1)} onUpperKnobDec={(): boolean => this.onDigitDecreased(1)}
            onUpperKnobPush={(): boolean => this.onUpperKnobPush()}>
            <span ref={this.digitRefs[1]}>{this.digitValues[1]}</span>
          </G1000UiControl>
          <G1000UiControl onFocused={(): void => this.onDigitFocused(0)} onBlurred={(): void => this.onDigitBlurred(0)}
            onUpperKnobInc={(): boolean => this.onDigitIncreased(0)} onUpperKnobDec={(): boolean => this.onDigitDecreased(0)}
            onUpperKnobPush={(): boolean => this.onUpperKnobPush()}>
            <span ref={this.digitRefs[0]}>{this.digitValues[0]}</span>
          </G1000UiControl>
          <span class='smaller'>FT</span>
        </span>
        <svg viewBox='0 0 24 24' width='24' height='24' class={this.isEdited.map(x => x ? '' : UiControl.HIDE_CLASS)}>
          <path d='M 0 16 L 3 16 L 0 13 L 0 16 M 0 13 L 11 2 L 14 5 L 3 16 L 0 13 M 11 2 L 13 0 L 16 3 L 14 5 L 11 2' stroke='#333' stroke-width='1.2px' fill='cyan' />
        </svg>
      </div>
    );
  }
}
