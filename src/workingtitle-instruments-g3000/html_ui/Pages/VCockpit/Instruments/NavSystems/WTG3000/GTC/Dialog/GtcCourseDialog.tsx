import { FSComponent, MathUtils, NodeReference, Subject, VNode } from '@microsoft/msfs-sdk';
import { DigitInputSlot } from '../Components/NumberInput/DigitInputSlot';
import { NumberInput } from '../Components/NumberInput/NumberInput';
import { GtcNumberDialogInput } from './AbstractGtcNumberDialog';
import { AbstractSimpleGtcNumberDialog } from './AbstractSimpleGtcNumberDialog';

import '../Components/TouchButton/NumPadTouchButton.css';
import './GtcCourseDialog.css';

/**
 * A request input for {@link GtcCourseDialog}.
 */
export interface GtcCourseDialogInput extends GtcNumberDialogInput {
  /** The GTC view title to display with the message. */
  title?: string;
}

/** A pop-up dialog which allows the user to select a course. */
export class GtcCourseDialog extends AbstractSimpleGtcNumberDialog<GtcCourseDialogInput> {
  private readonly min = 1;
  private readonly max = 360;

  /** @inheritdoc */
  public onAfterRender(): void {
    super.onAfterRender();
    this._title.set('Course');
  }

  /** @inheritdoc */
  protected override onRequest(input: GtcCourseDialogInput): number {
    this._title.set(input.title);

    return input.initialValue;
  }

  /** @inheritdoc */
  protected override isValueValid(value: number): boolean {
    return value >= this.min && value <= this.max;
  }

  /** @inheritdoc */
  protected override getInvalidValueMessage(): string {
    return 'Invalid Entry\nValid range is 1° to 360°';
  }

  /** @inheritdoc */
  protected override getRootCssClassName(): string | undefined {
    return 'course-dialog';
  }

  /** @inheritDoc */
  protected getPayload(value: number): number {
    return value;
  }

  /** @inheritdoc */
  protected override renderInput(ref: NodeReference<NumberInput>, valueToBind: Subject<number>, rootCssClassName?: string): VNode {
    return (
      <NumberInput
        ref={ref}
        value={valueToBind}
        digitizeValue={(value, setSignValues, setDigitValues) => {
          const clamped = MathUtils.clamp(Math.round(value), 0, 999);

          setDigitValues[0](Math.trunc((clamped) / 1e1), true);
          setDigitValues[1](clamped % 1e1, true);
        }}
        renderInactiveValue={value => `${MathUtils.clamp(Math.round(value), 0, 999).toString().padStart(3, '0')}°`}
        allowBackFill={true}
        class={`number-dialog-input ${rootCssClassName !== undefined ? `${rootCssClassName}-input` : ''}`}
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
        <div>°</div>
      </NumberInput>
    );
  }
}