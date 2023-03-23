import { FSComponent, MathUtils, NodeReference, Subject, VNode } from '@microsoft/msfs-sdk';

import { DigitInputSlot } from '../../Components/NumberInput/DigitInputSlot';
import { NumberInput } from '../../Components/NumberInput/NumberInput';
import { GtcNumberDialogInput } from '../../Dialog/AbstractGtcNumberDialog';
import { AbstractSimpleGtcNumberDialog } from '../../Dialog/AbstractSimpleGtcNumberDialog';

import './GtcFlapSpeedDialog.css';

/**
 * A request input for {@link GtcFlapSpeedDialog}.
 */
export interface GtcFlapSpeedDialogInput extends GtcNumberDialogInput {
  /** The name of the flap speed for which the request is made. */
  flapSpeedName: string;

  /** A function which gets the minimum valid value for the request. */
  minimumValue: () => number;

  /** A function which gets the maximum valid value for the request. */
  maximumValue: () => number;
}

/**
 * A pop-up dialog which allows the user to select an aircraft configuration speed limit ("flap speed").
 */
export class GtcFlapSpeedDialog extends AbstractSimpleGtcNumberDialog<GtcFlapSpeedDialogInput> {
  private minimumValue = (): number => 0;
  private maximumValue = (): number => 0;

  /** @inheritdoc */
  protected onRequest(input: GtcFlapSpeedDialogInput): number {
    this._title.set(input.flapSpeedName);

    this.minimumValue = input.minimumValue;
    this.maximumValue = input.maximumValue;

    return input.initialValue;
  }

  /** @inheritdoc */
  protected isValueValid(value: number): boolean {
    return value >= this.minimumValue() && value <= this.maximumValue();
  }

  /** @inheritdoc */
  protected getInvalidValueMessage(): string | VNode {
    return `Invalid Entry\nValue must be between\n${this.minimumValue()} and ${this.maximumValue()}`;
  }

  /** @inheritdoc */
  protected getPayload(value: number): number {
    return value;
  }

  /** @inheritdoc */
  protected getRootCssClassName(): string {
    return 'flap-speed-dialog';
  }

  /** @inheritdoc */
  protected renderInput(ref: NodeReference<NumberInput>, valueToBind: Subject<number>, rootCssClassName: string | undefined): VNode {
    return (
      <NumberInput
        ref={ref}
        value={valueToBind}
        digitizeValue={(value, setSignValues, setDigitValues): void => {
          const rounded = Math.max(0, Math.round(value));

          setDigitValues[0](Math.floor(rounded / 100), true);
          setDigitValues[1](Math.floor((rounded % 100) / 10), true);
          setDigitValues[2](rounded % 10, true);
        }}
        renderInactiveValue={value => {
          const valueText = MathUtils.clamp(value, 0, 999).toFixed(0);
          const leadingZeroCount = 3 - valueText.length;

          return (
            <div class='flap-speed-dialog-input-inactive-value'>
              <span class='visibility-hidden'>{('').padStart(leadingZeroCount, '0')}</span>
              <span class='flap-speed-dialog-input-inactive-value-text'>
                {valueText}
                <span class='numberunit-unit-small'>KT</span>
              </span>
            </div>
          );
        }}
        allowBackFill={true}
        class={`number-dialog-input ${rootCssClassName === undefined ? '' : `${rootCssClassName}-input`}`}
      >
        <DigitInputSlot
          characterCount={1}
          minValue={0}
          maxValue={10}
          increment={1}
          wrap={true}
          scale={100}
          defaultCharValues={[0]}
        />
        <DigitInputSlot
          characterCount={1}
          minValue={0}
          maxValue={10}
          increment={1}
          wrap={true}
          scale={10}
          defaultCharValues={[0]}
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
        <div class='numberunit-unit-small'>KT</div>
      </NumberInput>
    );
  }
}