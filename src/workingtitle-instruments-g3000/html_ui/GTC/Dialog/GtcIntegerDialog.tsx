import {
  ArrayUtils, FSComponent, MathUtils, MutableSubscribable, NodeReference, SetSubject, Subject, Subscribable, VNode,
} from '@microsoft/msfs-sdk';
import { DigitInputSlot } from '../Components/NumberInput/DigitInputSlot';
import { NumberInput } from '../Components/NumberInput/NumberInput';
import { GtcViewProps } from '../GtcService/GtcView';
import { AbstractGtcNumberDialog, GtcNumberDialogInput, GtcNumberDialogInputDefinition } from './AbstractGtcNumberDialog';

import './GtcIntegerDialog.css';

/**
 * A request input for {@link GtcIntegerDialog}.
 */
export interface GtcIntegerDialogInput extends GtcNumberDialogInput {
  /**
   * The number of digits supported by the dialog's input. If not defined, the number of digits will default to the
   * minimum number of digits required to accommodate the maximum valid value.
   */
  digitCount?: 1 | 2 | 3 | 4;

  /** The minimum valid numeric value allowed by the dialog's input, defaults to 0. */
  minimumValue?: number;

  /** The maximum valid numeric value allowed by the dialog's input. */
  maximumValue: number;

  /** The GTC view title to display with the message. */
  title?: string;
}

/**
 * A definition for a {@link NumberInput} used in a {@link GtcIntegerDialog}.
 */
interface GtcIntegerDialogInputDefinition extends GtcNumberDialogInputDefinition {
  /** The number of digits supported by this definition's input. */
  readonly digitCount: number;
}

/**
 * A dialog which allows the user to enter a 1- to 4-digit unitless non-negative integer.
 */
export class GtcIntegerDialog extends AbstractGtcNumberDialog<GtcIntegerDialogInput, number, GtcIntegerDialogInputDefinition> {

  private minValue = 0;
  private maxValue = 0;

  /** @inheritdoc */
  public constructor(props: GtcViewProps) {
    super(props);

    const is1DigitInputVisible = Subject.create(false);
    this.registerInputDefinition('1', {
      ref: FSComponent.createRef<NumberInput>(),
      value: Subject.create(0),
      render: (ref, value) => this.renderInput(ref, value, is1DigitInputVisible, 1),
      isVisible: is1DigitInputVisible,
      digitCount: 1
    });

    const is2DigitInputVisible = Subject.create(false);
    this.registerInputDefinition('2', {
      ref: FSComponent.createRef<NumberInput>(),
      value: Subject.create(0),
      render: (ref, value) => this.renderInput(ref, value, is2DigitInputVisible, 2),
      isVisible: is2DigitInputVisible,
      digitCount: 2
    });

    const is3DigitInputVisible = Subject.create(false);
    this.registerInputDefinition('3', {
      ref: FSComponent.createRef<NumberInput>(),
      value: Subject.create(0),
      render: (ref, value) => this.renderInput(ref, value, is3DigitInputVisible, 3),
      isVisible: is3DigitInputVisible,
      digitCount: 3
    });

    const is4DigitInputVisible = Subject.create(false);
    this.registerInputDefinition('4', {
      ref: FSComponent.createRef<NumberInput>(),
      value: Subject.create(0),
      render: (ref, value) => this.renderInput(ref, value, is4DigitInputVisible, 4),
      isVisible: is4DigitInputVisible,
      digitCount: 4
    });
  }

  /** @inheritdoc */
  protected onRequest(input: GtcIntegerDialogInput): void {
    const minimumValue = input.minimumValue ?? 0;
    const maximumValue = input.maximumValue;

    const clampedMinimumValue = Math.max(minimumValue, 0);
    const clampedMaximumValue = Math.max(input.maximumValue, 0);

    this._title.set(input.title);

    const digitCount = MathUtils.clamp(Math.trunc(input.digitCount ?? (Math.floor(Math.log10(clampedMaximumValue)) + 1)), 1, 4) as 1 | 2 | 3 | 4;

    const initialValue = MathUtils.clamp(input.initialValue, clampedMinimumValue, clampedMaximumValue);

    this.minValue = minimumValue;
    this.maxValue = maximumValue;

    this.resetActiveInput(digitCount.toString(), Math.round(initialValue), true);
  }

  /** @inheritdoc */
  protected isValueValid(value: number): boolean {
    return value >= this.minValue && value <= this.maxValue;
  }

  /** @inheritdoc */
  protected getInvalidValueMessage(): string | VNode {
    return `Invalid Entry\nValue must be between\n${Math.ceil(this.minValue)} and ${Math.floor(this.maxValue)}`;
  }

  /** @inheritdoc */
  protected getPayload(value: number): number {
    return value;
  }

  /** @inheritdoc */
  protected getRootCssClassName(): string {
    return 'integer-dialog';
  }

  /**
   * Renders one of this dialog's value inputs.
   * @param ref The reference to which to assign the rendered input.
   * @param value The value to bind to the rendered input.
   * @param isVisible A subscribable to which to bind the visibility of the rendered input.
   * @param digitCount The number of digits in the input.
   * @returns A value input with the specified number of digits, as a VNode.
   */
  private renderInput(
    ref: NodeReference<NumberInput>,
    value: MutableSubscribable<number>,
    isVisible: Subscribable<boolean>,
    digitCount: 1 | 2 | 3 | 4
  ): VNode {
    const cssClass = SetSubject.create(['number-dialog-input', 'integer-dialog-input', `integer-dialog-input-${digitCount}`]);

    isVisible.sub(val => { cssClass.toggle('hidden', !val); }, true);

    const maxValue = Math.pow(10, digitCount) - 1;

    const valueText = value.map(currentValue => MathUtils.clamp(currentValue, 0, maxValue).toFixed(0));
    const leadingZeroes = valueText.map(text => ('').padStart(digitCount - text.length, '0'));

    return (
      <NumberInput
        ref={ref}
        value={value}
        digitizeValue={(currentValue, setSignValues, setDigitValues): void => {
          const clamped = MathUtils.clamp(Math.round(currentValue), 0, maxValue);

          for (let i = 0; i < setDigitValues.length; i++) {
            const power = Math.pow(10, setDigitValues.length - i - 1);
            setDigitValues[i](Math.trunc((clamped % (power * 10)) / power), true);
          }
        }}
        renderInactiveValue={
          <div class={`integer-dialog-input-inactive-value integer-dialog-input-${digitCount}-inactive-value`}>
            <span class='visibility-hidden'>{leadingZeroes}</span>
            <span class='integer-dialog-input-inactive-value-text'>{valueText}</span>
          </div>
        }
        allowBackFill={true}
        class={cssClass}
      >
        {...ArrayUtils.create(digitCount, index => {
          return (
            <DigitInputSlot
              characterCount={1}
              minValue={0}
              maxValue={10}
              increment={1}
              wrap={true}
              scale={Math.pow(10, digitCount - index - 1)}
              defaultCharValues={[0]}
            />
          );
        })}
      </NumberInput>
    );
  }
}