import {
  FSComponent, MathUtils, MutableSubscribable, NodeReference, Subject, VNode
} from '@microsoft/msfs-sdk';

import { DigitInputSlot } from '../../Shared/Components/NumberInput/DigitInputSlot';
import { NumberInput } from '../../Shared/Components/NumberInput/NumberInput';
import { UiKnobId } from '../../Shared/UiSystem/UiKnobTypes';
import { AbstractSimpleUiNumberDialog } from './AbstractSimpleUiNumberDialog';
import { UiNumberDialogInput } from './AbstractUiNumberDialog';
import { G3XSpecialChar } from '../../Shared/Graphics/Text/G3XSpecialChar';

import './CourseDialog.css';

/**
 * A request input for {@link CourseDialog}.
 */
export interface CourseDialogInput extends UiNumberDialogInput {
  /** The dialog title. */
  title: string;
  /** The unit for dialog. */
  unit: 'magnetic' | 'true' | 'none';
}

/**
 * A dialog that allows the user to enter course value.
 */
export class CourseDialog extends AbstractSimpleUiNumberDialog<CourseDialogInput> {

  private readonly unitText = Subject.create<string>(G3XSpecialChar.DegreeTrue);

  /** @inheritDoc */
  public onAfterRender(): void {
    super.onAfterRender();

    this._knobLabelState.set([
      [UiKnobId.SingleOuter, 'Change Value'],
      [UiKnobId.SingleInner, 'Change Value'],
      [UiKnobId.LeftOuter, 'Change Value'],
      [UiKnobId.LeftInner, 'Change Value'],
      [UiKnobId.RightOuter, 'Change Value'],
      [UiKnobId.RightInner, 'Change Value'],
    ]);

    this.value.pipe(this.isEnterButtonEnabled, this.isValueValid.bind(this));
  }

  /** @inheritDoc */
  protected onRequest(input: CourseDialogInput): number {
    super.onRequest(input);

    this.title.set(input.title);

    switch (input.unit) {
      case 'magnetic':
        this.unitText.set(G3XSpecialChar.DegreeMagnetic);
        break;
      case 'true':
        this.unitText.set(G3XSpecialChar.DegreeTrue);
        break;
      default:
        this.unitText.set('°');
    }

    const initialValue = MathUtils.clamp(input.initialValue, 0, 360);

    // Focus the Enter button.
    this.focusController.setFocusIndex(1);

    return initialValue;
  }

  /** @inheritDoc */
  protected isValueValid(value: number): boolean {
    return value >= 0 && value <= 360;
  }

  /** @inheritDoc */
  protected getInvalidValueMessage(): string | VNode {
    return 'Invalid Entry\nValue must be between\n0 and 360';
  }

  /** @inheritDoc */
  protected getPayload(value: number): number {
    return value;
  }

  /** @inheritDoc */
  protected getRootCssClassName(): string {
    return 'course-dialog';
  }

  /** @inheritDoc */
  protected renderInput(ref: NodeReference<NumberInput>, value: MutableSubscribable<number>): VNode {
    return (
      <NumberInput
        ref={ref}
        value={value}
        digitizeValue={(currentValue, setSignValues, setDigitValues): void => {
          const clamped = MathUtils.clamp(Math.round(currentValue), 0, 999);

          setDigitValues[0](Math.trunc((clamped) / 1e1), true);
          setDigitValues[1](clamped % 1e1, true);
        }}
        renderInactiveValue={currentValue => `${MathUtils.clamp(Math.round(currentValue), 0, 999).toString().padStart(3, '0')}°`}
        allowBackFill={true}
        class='number-dialog-input course-dialog-input'
      >
        <DigitInputSlot
          characterCount={2}
          minValue={0}
          maxValue={37}
          increment={1}
          wrap={true}
          scale={1e1}
          defaultCharValues={[0, 0]}
        />
        <DigitInputSlot
          characterCount={1}
          minValue={0}
          maxValue={10}
          increment={1}
          wrap={true}
          scale={1}
          defaultCharValues={[0]}
        />
        <div>{this.unitText}</div>
      </NumberInput>
    );
  }
}
