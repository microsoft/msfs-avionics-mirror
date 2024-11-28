import { FSComponent, MathUtils, MutableSubscribable, NodeReference, VNode } from '@microsoft/msfs-sdk';
import { DigitInputSlot } from '../../Components/NumberInput/DigitInputSlot';
import { NumberInput } from '../../Components/NumberInput/NumberInput';
import { SignInputSlot } from '../../Components/NumberInput/SignInputSlot';
import { GtcViewProps } from '../../GtcService/GtcView';
import { GtcNumberDialogInput } from '../../Dialog/AbstractGtcNumberDialog';
import { AbstractSimpleGtcNumberDialog } from '../../Dialog/AbstractSimpleGtcNumberDialog';

import './GtcRunwayGradientDialog.css';

/**
 * A request input for {@link GtcRunwayGradientDialog}.
 */
export interface GtcRunwayGradientDialogInput extends GtcNumberDialogInput {
  /** The GTC view title to display with the message. */
  title?: string;
}

/**
 * A dialog which allows the user to enter a runway gradient between -9.99% and +9.99% with precision to 0.01%. The
 * dialog operates in hundredths of percent (so a dialog value of 100 corresponds to a gradient of 1.00%).
 */
export class GtcRunwayGradientDialog extends AbstractSimpleGtcNumberDialog<GtcRunwayGradientDialogInput> {
  private static readonly MAX_ABS_VALUE = 999;

  private readonly signSlotRef = FSComponent.createRef<SignInputSlot>();

  /** @inheritdoc */
  public constructor(props: GtcViewProps) {
    super(props);

    this.showSignButton.set(true);
    this.showDecimalButton.set(true);
  }

  /** @inheritdoc */
  protected onRequest(input: GtcRunwayGradientDialogInput): number {
    this._title.set(input.title);

    return input.initialValue;
  }

  /** @inheritdoc */
  protected isValueValid(value: number): boolean {
    return Math.abs(value) <= GtcRunwayGradientDialog.MAX_ABS_VALUE;
  }

  /** @inheritdoc */
  protected getInvalidValueMessage(): string | VNode {
    return 'Invalid Entry\nValue must be between\n−9.99% and +9.99%.';
  }

  /** @inheritdoc */
  protected getPayload(value: number): number {
    return value;
  }

  /** @inheritdoc */
  protected onDecimalPressed(): void {
    this.inputRef.instance.placeCursor(2, false);
  }

  /** @inheritdoc */
  protected onSignPressed(): void {
    if (!this.inputRef.instance.isEditingActive.get()) {
      this.inputRef.instance.activateEditing(false);
    }

    this.signSlotRef.instance.incrementValue();

    if (this.inputRef.instance.cursorPosition.get() === 0) {
      this.inputRef.instance.moveCursor(1, false);
    }
  }

  /** @inheritdoc */
  protected getRootCssClassName(): string {
    return 'runway-gradient-dialog';
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
          setSignValues[0](currentValue < 0 ? -1 : 1);

          const clamped = MathUtils.clamp(Math.round(Math.abs(currentValue)), 0, 999);

          for (let i = 0; i < setDigitValues.length; i++) {
            const power = Math.pow(10, setDigitValues.length - i - 1);
            setDigitValues[i](Math.trunc((clamped % (power * 10)) / power), true);
          }
        }}
        renderInactiveValue={currentValue => {
          const hiddenSign = currentValue < 0 ? '' : '+';
          const visibleSign = currentValue < 0 ? '−' : '';
          const valueText = MathUtils.clamp(Math.abs(currentValue / 100), 0, 999).toFixed(2);

          return (
            <div class={'runway-gradient-dialog-input-inactive-value'}>
              <span class='visibility-hidden'>{hiddenSign}</span>
              <span class='runway-gradient-dialog-input-inactive-value-text'>
                {visibleSign + valueText}
                <span>%</span>
              </span>
            </div>
          );
        }}
        allowBackFill={true}
        initialEditIndex={1}
        class={`number-dialog-input ${rootCssClassName}-input`}
      >
        <SignInputSlot ref={this.signSlotRef} />
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
        <div class={`${rootCssClassName}-input-percent`}>%</div>
      </NumberInput>
    );
  }
}