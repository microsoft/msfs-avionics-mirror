import {
  ArrayUtils, FSComponent, MathUtils, MutableSubscribable, NodeReference,
  SetSubject, Subject, Subscribable, Unit, UnitFamily, UnitType, VNode,
} from '@microsoft/msfs-sdk';
import { UnitFormatter } from '@microsoft/msfs-garminsdk';
import { DigitInputSlot } from '../Components/NumberInput/DigitInputSlot';
import { NumberInput } from '../Components/NumberInput/NumberInput';
import { GtcViewProps } from '../GtcService/GtcView';
import { AbstractGtcNumberDialog, GtcNumberDialogInput, GtcNumberDialogInputDefinition } from './AbstractGtcNumberDialog';

import './GtcSpeedDialog.css';

/**
 * A request input for {@link GtcSpeedDialog}.
 */
export interface GtcSpeedDialogInput extends GtcNumberDialogInput {
  /**
   * The initial speed unit. If not defined, the initial unit will default to the dialog's unit type.
   */
  initialUnit?: Unit<UnitFamily.Speed>;

  /** The unit type in which the dialog should operate. */
  unitType: Unit<UnitFamily.Speed>;

  /**
   * The number of digits to the left of the decimal point supported by the dialog's input. If not defined, the number
   * of digits will default to the minimum number of digits required to accommodate the maximum valid value.
   */
  digitCount?: 2 | 3 | 4;

  /** The minimum valid numeric value allowed by the dialog's input. */
  minimumValue: number;

  /** The maximum valid numeric value allowed by the dialog's input. */
  maximumValue: number;

  /** The GTC view title to display with the message. */
  title?: string;
}

/**
 * A request result returned by {@link GtcSpeedDialog}.
 */
export interface GtcSpeedDialogOutput {
  /** The selected speed. */
  value: number;

  /** The unit type of the selected speed. */
  unit: Unit<UnitFamily.Speed>;
}

/**
 * A definition for a {@link NumberInput} used in a {@link GtcSpeedDialog}.
 */
interface GtcSpeedDialogInputDefinition extends GtcNumberDialogInputDefinition {
  /** The number of digits to the left of the decimal point supported by this definition's input. */
  readonly digitCount: number;
}

/**
 * A dialog which allows the user to enter a speed. The dialog can operate with any arbitrary speed unit type and
 * supports inputs with two, three, or four digits.
 */
export class GtcSpeedDialog extends AbstractGtcNumberDialog<GtcSpeedDialogInput, GtcSpeedDialogOutput, GtcSpeedDialogInputDefinition> {
  private static readonly UNIT_FORMATTER = UnitFormatter.create();

  private readonly unitType = Subject.create<Unit<UnitFamily.Speed>>(UnitType.KNOT);
  private readonly unitText = this.unitType.map(GtcSpeedDialog.UNIT_FORMATTER);

  private minValue = 0;
  private maxValue = 0;

  /** @inheritdoc */
  public constructor(props: GtcViewProps) {
    super(props);

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
  protected onRequest(input: GtcSpeedDialogInput): void {
    this._title.set(input.title);

    const digitCount = MathUtils.clamp(Math.trunc(input.digitCount ?? (Math.floor(Math.log10(input.maximumValue)) + 1)), 2, 4) as 2 | 3 | 4;

    const initialUnit = input.initialUnit ?? input.unitType;
    const initialValue = MathUtils.clamp(initialUnit.convertTo(input.initialValue, input.unitType), input.minimumValue, input.maximumValue);

    this.unitType.set(input.unitType);

    this.minValue = input.minimumValue;
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
  protected getPayload(value: number): GtcSpeedDialogOutput {
    return {
      value: value,
      unit: this.unitType.get()
    };
  }

  /** @inheritdoc */
  protected getRootCssClassName(): string {
    return 'speed-dialog';
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
    digitCount: 2 | 3 | 4
  ): VNode {
    const cssClass = SetSubject.create(['number-dialog-input', 'speed-dialog-input', `speed-dialog-input-${digitCount}`]);

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
          <div class={`speed-dialog-input-inactive-value speed-dialog-input-${digitCount}-inactive-value`}>
            <span class='visibility-hidden'>{leadingZeroes}</span>
            <span class='speed-dialog-input-inactive-value-text'>
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