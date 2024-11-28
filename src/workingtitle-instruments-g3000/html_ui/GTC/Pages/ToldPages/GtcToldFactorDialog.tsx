import { FSComponent, MathUtils, MutableSubscribable, NodeReference, VNode } from '@microsoft/msfs-sdk';
import { DigitInputSlot } from '../../Components/NumberInput/DigitInputSlot';
import { NumberInput } from '../../Components/NumberInput/NumberInput';
import { GtcViewProps } from '../../GtcService/GtcView';
import { GtcNumberDialogInput } from '../../Dialog/AbstractGtcNumberDialog';
import { AbstractSimpleGtcNumberDialog } from '../../Dialog/AbstractSimpleGtcNumberDialog';

import './GtcToldFactorDialog.css';

/**
 * A request input for {@link GtcToldFactorDialog}.
 */
export interface GtcToldFactorDialogInput extends GtcNumberDialogInput {
  /** The GTC view title to display with the message. */
  title?: string;
}

/**
 * A dialog which allows the user to enter a takeoff/landing factor between 0.01 and 9.99 to a precision of 0.01. The
 * dialog operates in percent (so a dialog value of 100 corresponds to a factor of 1.00).
 */
export class GtcToldFactorDialog extends AbstractSimpleGtcNumberDialog<GtcToldFactorDialogInput> {
  private static readonly MAX_VALUE = 999;

  /** @inheritdoc */
  public constructor(props: GtcViewProps) {
    super(props);

    this.showDecimalButton.set(true);
  }

  /** @inheritdoc */
  protected onRequest(input: GtcToldFactorDialogInput): number {
    this._title.set(input.title);

    return input.initialValue;
  }

  /** @inheritdoc */
  protected isValueValid(value: number): boolean {
    return value > 0 && value <= GtcToldFactorDialog.MAX_VALUE;
  }

  /** @inheritdoc */
  protected getInvalidValueMessage(): string | VNode {
    return 'Invalid Entry\nValue must be between\n0.01 and 9.99.';
  }

  /** @inheritdoc */
  protected getPayload(value: number): number {
    return value;
  }

  /** @inheritdoc */
  protected onDecimalPressed(): void {
    this.inputRef.instance.placeCursor(1, false);
  }

  /** @inheritdoc */
  protected getRootCssClassName(): string {
    return 'told-factor-dialog';
  }

  /** @inheritdoc */
  protected renderInput(
    ref: NodeReference<NumberInput>,
    value: MutableSubscribable<number>,
    rootCssClassName: string | undefined
  ): VNode {
    return (
      <NumberInput
        ref={ref}
        value={value}
        digitizeValue={(currentValue, setSignValues, setDigitValues): void => {
          const clamped = MathUtils.clamp(Math.round(currentValue), 0, 999);

          for (let i = 0; i < setDigitValues.length; i++) {
            const power = Math.pow(10, setDigitValues.length - i - 1);
            setDigitValues[i](Math.trunc((clamped % (power * 10)) / power), true);
          }
        }}
        allowBackFill={true}
        initialEditIndex={0}
        class={`number-dialog-input ${rootCssClassName}-input`}
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
        <div>.</div>
        <DigitInputSlot
          allowBackfill={false}
          characterCount={1}
          minValue={0}
          maxValue={10}
          increment={1}
          wrap={true}
          scale={1e1}
          defaultCharValues={[0]}
        />
        <DigitInputSlot
          allowBackfill={false}
          characterCount={1}
          minValue={0}
          maxValue={10}
          increment={1}
          wrap={true}
          scale={1}
          defaultCharValues={[0]}
        />
      </NumberInput>
    );
  }
}