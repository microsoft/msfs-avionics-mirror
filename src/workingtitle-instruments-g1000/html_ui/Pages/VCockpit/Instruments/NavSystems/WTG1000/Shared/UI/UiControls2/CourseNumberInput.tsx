import { FocusPosition } from '@microsoft/msfs-sdk';

import { GenericNumberInput } from './GenericNumberInput';

/**
 * A component for course number inputs.
 * A variation of {@link GenericNumberInput} that is used for course inputs.
 * Differs from {@link GenericNumberInput} in the keypad entry logic.
 **/
export class CourseNumberInput extends GenericNumberInput {
  /** @inheritDoc */
  protected handleDigitInput(digit: number): void {
    if (!this.isEditing) {
      this.activateEditing(undefined, FocusPosition.First);
      this.inputValue = digit * 10;
      this.digitValues[0].set(digit * 10);
      this.digitValues[1].set(0);
      // if we entered a number that couldn't be a valid first digit of a course, we scroll to the second input
      if (digit > 3) {
        this.inputGroupRef.instance.scroll('forward');
      }
    } else {
      const focusedIndex = this.inputGroupRef.instance.getFocusedIndex();
      if (focusedIndex < 1) {
        // the first input is a double digit input,
        // so if its scaled value is 30 or less, if the value would be valid as the first digit of a course,
        // we can set the current value to the hundreds place and set the digit as the tens place
        // and scroll to the next input
        const currentDigitValue = this.digitValues[0].get();
        if ((currentDigitValue === 30 && digit <= 6) || currentDigitValue < 30) {
          this.digitValues[0].set((this.digitValues[0].get() + digit) * 10);
          this.inputGroupRef.instance.scroll('forward');
        } else { // we reset the value the digit value
          this.digitValues[0].set(digit * 10);
          this.inputValue = digit * 10 + this.digitValues[1].get();
          // if we entered a number that couldn't be a valid first digit of a course, we scroll to the second input
          if (digit > 3) {
            this.inputGroupRef.instance.scroll('forward');
          }
        }
      } else {
        // when editing the last digit:
        // if current value starts with 36, if we enter a number that's not zero, we need to set the first digit to 0
        // and the second digit to the number we entered
        // otherwise, we just set the second digit to the number we entered
        if (this.digitValues[0].get() === 360 && digit !== 0) {
          this.digitValues[0].set(0);
          this.digitValues[1].set(digit);
        } else {
          this.digitValues[1].set(digit);
        }
        this.inputValue = this.digitValues[0].get() + digit;
        this.deactivateEditing(true);
      }
    }
  }

}
