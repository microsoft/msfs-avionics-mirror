import { AbstractSimpleGtcNumberDialog } from './AbstractSimpleGtcNumberDialog';
import { GtcNumberDialogInput } from './AbstractGtcNumberDialog';
import { FSComponent, MathUtils, NodeReference, Subject, VNode } from '@microsoft/msfs-sdk';
import { DigitInputSlot, NumberInput } from '../Components';

import './GtcMinuteDurationDialog.css';

/** A request input for {@link GtcMinuteDurationDialog}. */
export interface GtcMinuteDurationDialogInput extends GtcNumberDialogInput {
  /** The GTC view title to display with the message. */
  title?: string;

  /** The minimum valid value. Defaults to `0`. */
  min?: number;

  /** The maximum valid value. Defaults to `999`. */
  max?: number;
}

/** A triple-digit minute-united dialog. */
export class GtcMinuteDurationDialog extends AbstractSimpleGtcNumberDialog<GtcMinuteDurationDialogInput> {
  private min = 0;
  private max = 999;

  /** @inheritdoc */
  protected onRequest(input: GtcMinuteDurationDialogInput): number {
    this._title.set(input.title);

    this.min = input.min ?? 0;
    this.max = input.max ?? 999;

    return input.initialValue;
  }

  /** @inheritdoc */
  protected getInvalidValueMessage(): string | VNode {
    return `Invalid Entry\nValue must be between\n${this.min} and ${this.max}`;
  }

  /** @inheritdoc */
  protected getPayload(value: number): number {
    return value;
  }

  /** @inheritdoc */
  protected getRootCssClassName(): string | undefined {
    return undefined;
  }

  /** @inheritdoc */
  protected isValueValid(value: number): boolean {
    return this.min <= value && value <= this.max;
  }

  /** @inheritdoc */
  protected override renderInput(ref: NodeReference<NumberInput>, valueToBind: Subject<number>): VNode {
    return (
      <NumberInput
        ref={ref}
        value={valueToBind}
        digitizeValue={(value, setSignValues, setDigitValues) => {
          const clamped = MathUtils.clamp(Math.round(value), 0, 999);

          setDigitValues[0](Math.trunc((clamped) / 1e2), true);
          setDigitValues[1](Math.trunc((clamped % 1e2) / 1e1), true);
          setDigitValues[2](clamped % 1e1, true);
        }}
        renderInactiveValue={currentValue => {
          const valueText = MathUtils.clamp(currentValue, 0, 999).toFixed(0);
          const leadingZeroCount = 3 - valueText.length;

          return (
            <div class={'minute-duration-dialog-input-inactive-value'}>
              <span class='visibility-hidden'>{('').padStart(leadingZeroCount, '0')}</span>
              <span class='minute-duration-dialog-input-inactive-value-text'>
                {valueText}
                <span class='numberunit-unit-small'>MIN</span>
              </span>
            </div>
          );
        }}
        allowBackFill={true}
        class='number-dialog-input minute-duration-dialog'
      >
        <DigitInputSlot
          characterCount={1}
          minValue={0}
          maxValue={10}
          increment={1}
          wrap={true}
          scale={1e2}
          defaultCharValues={[0]}
        />
        <DigitInputSlot
          characterCount={1}
          minValue={0}
          maxValue={10}
          increment={1}
          wrap={true}
          scale={1e1}
          defaultCharValues={[0]}
        />
        <DigitInputSlot
          characterCount={1}
          minValue={0}
          maxValue={10}
          increment={1}
          wrap={true}
          scale={1e0}
          defaultCharValues={[0]}
        />
        <div class='numberunit-unit-small'>MIN</div>
      </NumberInput>
    );
  }
}