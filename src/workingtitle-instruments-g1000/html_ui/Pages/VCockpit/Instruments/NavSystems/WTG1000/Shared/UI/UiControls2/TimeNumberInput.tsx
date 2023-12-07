import { FocusPosition, UnitType } from '@microsoft/msfs-sdk';

import { GenericNumberInput } from './GenericNumberInput';

/**
 * A component for time number inputs.
 * A variation of {@link GenericNumberInput} that is used for time inputs.
 * Differs from {@link GenericNumberInput} in the keypad entry logic.
 **/
export class TimeNumberInput extends GenericNumberInput {
  private static readonly HR_TO_MS = UnitType.HOUR.convertTo(1, UnitType.MILLISECOND);
  private static readonly MIN_TO_MS = UnitType.MINUTE.convertTo(1, UnitType.MILLISECOND);

  /** @inheritDoc */
  protected handleDigitInput(digit: number): void {
    if (!this.isEditing) {
      this.activateEditing(undefined, FocusPosition.First);
      if (this.signValues.length > 0) {
        // if we have a sign value, we need to scroll to the first digit input (assuming that any sign values are first)
        this.inputGroupRef.instance.setFocusedIndex(this.signValues.length + (digit > 2 ? 1 : 0));
      }
      this.digitValues[0].set(digit * TimeNumberInput.HR_TO_MS);
      this.digitValues[1].set(0);
      this.digitValues[2].set(0);
    } else {
      const focusedIndex = this.inputGroupRef.instance.getFocusedIndex();
      if (focusedIndex <= 1) {
        // sign input or hours input
        // if the sign is focused, we treat the digit input as hours input and set focus there
        if (focusedIndex === 0) {
          this.inputGroupRef.instance.setFocusedIndex(this.signValues.length);
        }
        // the hour input is a double-digit input, max value 23
        // if the current value is 1 or 2, we insert the input as the second digit of this value
        const hoursValue = this.digitValues[0].get() / TimeNumberInput.HR_TO_MS;
        if (hoursValue < 2 || hoursValue < 3 && digit < 4) {
          this.digitValues[0].set((hoursValue * 10 + digit) * TimeNumberInput.HR_TO_MS);
          this.inputGroupRef.instance.scroll('forward');
        } else {
          this.digitValues[0].set(digit * TimeNumberInput.HR_TO_MS);
          if (digit > 2) {
            this.inputGroupRef.instance.scroll('forward');
          }
        }
      } else if (focusedIndex === 2) {
        // minutes tens input
        if (digit < 6) {
          this.digitValues[1].set(digit * 10 * TimeNumberInput.MIN_TO_MS);
          this.inputGroupRef.instance.scroll('forward');
        }
      } else {
        // minutes ones input
        this.digitValues[2].set(digit * TimeNumberInput.MIN_TO_MS);
        this.deactivateEditing(true);
      }
      this.inputValue = this.digitValues[0].get() + this.digitValues[1].get() + this.digitValues[2].get();
    }
  }
}
