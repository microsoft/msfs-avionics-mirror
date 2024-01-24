import { FSComponent, HardwareUiControl, MathUtils, NodeReference, Subject, VNode } from '@microsoft/msfs-sdk';
import { DigitInput, FmsHEvent, FmsUiControlEvents, G1000UiControl, G1000UiControlProps } from '@microsoft/msfs-wtg1000';

/** The props for the barometric input field. */
export interface Sr22tTPBarometricInputFieldProps extends G1000UiControlProps {
  /** The reference to the barometric input field. */
  inputRef: NodeReference<DigitInput>;
  /** The store value for the barometric input field. */
  barometricStoreValue: Subject<number>;
  /** The style for the barometric input field unit. */
  unitStyle: Subject<string>;
}

/** The barometric input field for the trip planning page. */
export class Sr22tTPBarometricInputField extends G1000UiControl<Sr22tTPBarometricInputFieldProps> {
  private readonly baroSelectionFormatter = ((value: number): VNode => {
    // For the barometric pressure, we need the 4 digit number to include the unit:
    return (
      <div>{value.toFixed(2).padStart(5, '0')}<span class={this.props.unitStyle}>IN</span></div>
    );
  });

  private isKeyboardEditing = false;
  private cursorPosition = 0;

  private readonly editingValue = Subject.create(this.props.barometricStoreValue.get());

  private readonly minValue = Subject.create(22);
  private readonly maxValue = Subject.create(32.5);

  /** @inheritDoc */
  public onEnter(source: G1000UiControl): boolean {
    if (this.isKeyboardEditing) {
      this.saveBaroValue();
      return true;
    }
    return super.onEnter(source);
  }

  /** @inheritDoc */
  public onClr(source: G1000UiControl): boolean {
    if (this.isKeyboardEditing) {
      this.resetBaroValue();
      return true;
    }
    return super.onClr(source);
  }

  /** @inheritDoc */
  public consolidateKeyboardHEvent(source: G1000UiControl, evt: FmsHEvent): boolean {
    const digit = parseInt(evt);
    if (isNaN(digit)) {
      return false;
    }

    if (!this.isKeyboardEditing) {
      this.minValue.set(0);
      this.maxValue.set(99.99);
      this.isKeyboardEditing = true;
      this.editingValue.set(digit);
      this.cursorPosition = 1;
      return true;
    }

    let newValue = this.editingValue.get();
    switch (this.cursorPosition) {
      case 1:
        // The second character is pushing the first one to the left
        newValue = newValue * 10 + digit;
        break;
      case 2:
        newValue = newValue + digit / 10;
        break;
      case 3:
        newValue = newValue + digit / 100;
        this.editingValue.set(newValue);
        this.saveBaroValue();
        return true;
    }

    this.editingValue.set(newValue);
    this.cursorPosition++;
    return true;
  }

  /** @inheritDoc */
  protected onBlurred(source: HardwareUiControl<FmsUiControlEvents>): void {
    this.resetBaroValue();
    super.onBlurred(source);
  }

  /** Saves the barometric value to the store. */
  private saveBaroValue(): void {
    this.isKeyboardEditing = false;
    this.cursorPosition = 0;
    const limitedValue = MathUtils.clamp(this.editingValue.get(), 22, 32.50);
    this.editingValue.set(limitedValue);
    this.props.barometricStoreValue.set(limitedValue);
    this.minValue.set(22);
    this.maxValue.set(32.5);
  }

  /** Resets the barometric value to the store value. */
  private resetBaroValue(): void {
    this.isKeyboardEditing = false;
    this.cursorPosition = 0;
    this.editingValue.set(this.props.barometricStoreValue.get());
    this.minValue.set(22);
    this.maxValue.set(32.5);
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <DigitInput
        ref={this.props.inputRef}
        value={this.editingValue}
        formatter={this.baroSelectionFormatter}
        minValue={this.minValue}
        maxValue={this.maxValue}
        increment={0.01}
        wrap={false}
        scale={1}
        class='tp-labeled-editable-number-value' />
    );
  }
}
