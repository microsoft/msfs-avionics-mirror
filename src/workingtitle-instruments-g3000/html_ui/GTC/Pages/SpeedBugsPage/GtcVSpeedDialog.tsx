import { FSComponent, MathUtils, NodeReference, Subject, VNode } from '@microsoft/msfs-sdk';
import { DigitInputSlot } from '../../Components/NumberInput/DigitInputSlot';
import { NumberInput } from '../../Components/NumberInput/NumberInput';
import { GtcNumberDialogInput } from '../../Dialog/AbstractGtcNumberDialog';
import { AbstractSimpleGtcNumberDialog } from '../../Dialog/AbstractSimpleGtcNumberDialog';

import './GtcVSpeedDialog.css';

/**
 * A request input for {@link GtcVSpeedDialog}.
 */
export interface GtcVSpeedDialogInput extends GtcNumberDialogInput {
  /** The name of the reference V-speed for which the request is made. */
  vSpeedName: string;
}

/**
 * A pop-up dialog which allows the user to select a reference V-speed value.
 */
export class GtcVSpeedDialog extends AbstractSimpleGtcNumberDialog<GtcVSpeedDialogInput> {
  /** @inheritdoc */
  protected onRequest(input: GtcVSpeedDialogInput): number {
    this._title.set(`V${input.vSpeedName}`);

    return input.initialValue;
  }

  /** @inheritdoc */
  protected isValueValid(): boolean {
    return true;
  }

  /** @inheritdoc */
  protected getInvalidValueMessage(): string | VNode {
    return '';
  }

  /** @inheritdoc */
  protected getPayload(value: number): number {
    return value;
  }

  /** @inheritdoc */
  protected getRootCssClassName(): string {
    return 'vspeed-dialog';
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
            <div class='vspeed-dialog-input-inactive-value'>
              <span class='visibility-hidden'>{('').padStart(leadingZeroCount, '0')}</span>
              <span class='vspeed-dialog-input-inactive-value-text'>
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