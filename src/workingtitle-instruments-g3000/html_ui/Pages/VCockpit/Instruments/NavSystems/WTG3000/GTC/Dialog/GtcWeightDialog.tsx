import {
  ArrayUtils, FSComponent, MathUtils, MutableSubscribable, NodeReference, SetSubject, Subject, Subscribable, Unit, UnitFamily, UnitType,
  VNode,
} from '@microsoft/msfs-sdk';
import { UnitFormatter } from '@microsoft/msfs-garminsdk';
import { DigitInputSlot } from '../Components/NumberInput/DigitInputSlot';
import { NumberInput } from '../Components/NumberInput/NumberInput';
import { GtcViewProps } from '../GtcService/GtcView';
import { AbstractGtcNumberDialog, GtcNumberDialogInput, GtcNumberDialogInputDefinition } from './AbstractGtcNumberDialog';

import './GtcWeightDialog.css';

/**
 * A request input for {@link GtcWeightDialog}.
 */
export interface GtcWeightDialogInput extends GtcNumberDialogInput {
  /**
   * The initial weight unit. If not defined, the initial unit will default to the dialog's unit type.
   */
  initialUnit?: Unit<UnitFamily.Weight>;

  /** The unit type in which the dialog should operate. */
  unitType: Unit<UnitFamily.Weight>;

  /**
   * The number of digits supported by the dialog's input. If not defined, the number of digits will default to the
   * minimum number of digits required to accommodate the maximum valid value.
   */
  digitCount?: 3 | 4 | 5;

  /** The minimum valid numeric value allowed by the dialog's input, defaults to 0. */
  minimumValue?: number;

  /** The maximum valid numeric value allowed by the dialog's input. */
  maximumValue: number;

  /** The GTC view title to display with the message. */
  title?: string;
}

/**
 * A request result returned by {@link GtcWeightDialog}.
 */
export interface GtcWeightDialogOutput {
  /** The selected weight. */
  value: number;

  /** The unit type of the selected weight. */
  unit: Unit<UnitFamily.Weight>;
}

/**
 * A definition for a {@link NumberInput} used in a {@link GtcWeightDialog}.
 */
interface GtcWeightDialogInputDefinition extends GtcNumberDialogInputDefinition {
  /** The number of digits supported by this definition's input. */
  readonly digitCount: number;
}

/**
 * A dialog which allows the user to enter a weight. The dialog can operate with any arbitrary weight unit type and
 * supports three-, four-, and five-digit inputs.
 */
export class GtcWeightDialog extends AbstractGtcNumberDialog<GtcWeightDialogInput, GtcWeightDialogOutput, GtcWeightDialogInputDefinition> {
  private static readonly UNIT_FORMATTER = UnitFormatter.create();

  private readonly unitType = Subject.create<Unit<UnitFamily.Weight>>(UnitType.POUND);
  private readonly unitText = this.unitType.map(GtcWeightDialog.UNIT_FORMATTER);

  private minValue = 0;
  private maxValue = 0;

  /** @inheritdoc */
  public constructor(props: GtcViewProps) {
    super(props);

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

    const is5DigitInputVisible = Subject.create(false);
    this.registerInputDefinition('5', {
      ref: FSComponent.createRef<NumberInput>(),
      value: Subject.create(0),
      render: (ref, value) => this.renderInput(ref, value, is5DigitInputVisible, 5),
      isVisible: is5DigitInputVisible,
      digitCount: 5
    });
  }

  /** @inheritdoc */
  protected onRequest(input: GtcWeightDialogInput): void {
    const minimumValue: number = input.minimumValue ?? 0;

    this._title.set(input.title);

    const digitCount = MathUtils.clamp(Math.trunc(input.digitCount ?? (Math.floor(Math.log10(input.maximumValue)) + 1)), 3, 5) as 3 | 4 | 5;

    const initialUnit = input.initialUnit ?? input.unitType;
    const initialValue = MathUtils.clamp(initialUnit.convertTo(input.initialValue, input.unitType), minimumValue, input.maximumValue);

    this.unitType.set(input.unitType);

    this.minValue = minimumValue;
    this.maxValue = input.maximumValue;

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
  protected getPayload(value: number): GtcWeightDialogOutput {
    return {
      value: value,
      unit: this.unitType.get()
    };
  }

  /** @inheritdoc */
  protected getRootCssClassName(): string {
    return 'weight-dialog';
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
    digitCount: 3 | 4 | 5
  ): VNode {
    const cssClass = SetSubject.create(['number-dialog-input', 'weight-dialog-input', `weight-dialog-input-${digitCount}`]);

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
          <div class={`weight-dialog-input-inactive-value weight-dialog-input-${digitCount}-inactive-value`}>
            <span class='visibility-hidden'>{leadingZeroes}</span>
            <span class='weight-dialog-input-inactive-value-text'>
              {valueText}
              <span class='numberunit-unit-small'>{this.unitText}</span>
            </span>
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
        <div class='numberunit-unit-small'>{this.unitText}</div>
      </NumberInput>
    );
  }
}