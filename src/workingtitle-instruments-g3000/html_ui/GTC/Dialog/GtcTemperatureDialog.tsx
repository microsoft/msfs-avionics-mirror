import {
  ArrayUtils, FSComponent, MappedSubject, MathUtils, MutableSubscribable, NodeReference,
  SetSubject, Subject, Subscribable, Unit, UnitFamily, UnitType, VNode,
} from '@microsoft/msfs-sdk';
import { UnitFormatter } from '@microsoft/msfs-garminsdk';
import { DigitInputSlot } from '../Components/NumberInput/DigitInputSlot';
import { NumberInput } from '../Components/NumberInput/NumberInput';
import { SignInputSlot } from '../Components/NumberInput/SignInputSlot';
import { GtcViewProps } from '../GtcService/GtcView';
import { AbstractGtcNumberDialog, GtcNumberDialogInput, GtcNumberDialogInputDefinition } from './AbstractGtcNumberDialog';

import './GtcTemperatureDialog.css';

/**
 * A request input for {@link GtcTemperatureDialog}.
 */
export interface GtcTemperatureDialogInput extends GtcNumberDialogInput {
  /**
   * The initial temperature unit. If not defined, the initial unit will default to the dialog's unit type.
   */
  initialUnit?: Unit<UnitFamily.Temperature>;

  /** The unit type in which the dialog should operate. */
  unitType: Unit<UnitFamily.Temperature>;

  /**
   * The number of digits supported by the dialog's input. If not defined, the number of digits will default to the
   * minimum number of digits required to accommodate both the minimum and maximum valid values.
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
 * A request result returned by {@link GtcTemperatureDialog}.
 */
export interface GtcTemperatureDialogOutput {
  /** The selected temperature. */
  value: number;

  /** The unit type of the selected temperature. */
  unit: Unit<UnitFamily.Temperature>;
}

/**
 * A definition for a {@link NumberInput} used in a {@link GtcTemperatureDialog}.
 */
interface GtcTemperatureDialogInputDefinition extends GtcNumberDialogInputDefinition {
  /** A reference to this definition's input's sign input slot. */
  readonly signRef: NodeReference<SignInputSlot>;

  /** The number of digits to the left of the decimal point supported by this definition's input. */
  readonly digitCount: number;
}

/**
 * A dialog which allows the user to enter a temperature. The dialog can operate with any arbitrary temperature unit
 * type and supports inputs with two, three, or four digits.
 */
export class GtcTemperatureDialog extends AbstractGtcNumberDialog<GtcTemperatureDialogInput, GtcTemperatureDialogOutput, GtcTemperatureDialogInputDefinition> {
  private static readonly UNIT_FORMATTER = UnitFormatter.create();

  private readonly unitType = Subject.create<Unit<UnitFamily.Temperature>>(UnitType.CELSIUS);
  private readonly unitText = this.unitType.map(GtcTemperatureDialog.UNIT_FORMATTER);
  private readonly unitDegreeSymbol = this.unitText.map(text => text.startsWith('°') ? '°' : '');
  private readonly unitSmallText = this.unitText.map(text => text.startsWith('°') ? text.substring(1) : text);

  private minValue = 0;
  private maxValue = 0;

  /** @inheritdoc */
  public constructor(props: GtcViewProps) {
    super(props);

    const signRef2Digit = FSComponent.createRef<SignInputSlot>();
    const is2DigitInputVisible = Subject.create(false);
    this.registerInputDefinition('2', {
      ref: FSComponent.createRef<NumberInput>(),
      value: Subject.create(0),
      render: (ref, value) => this.renderInput(ref, signRef2Digit, value, is2DigitInputVisible, 2),
      isVisible: is2DigitInputVisible,
      signRef: signRef2Digit,
      digitCount: 2
    });

    const signRef3Digit = FSComponent.createRef<SignInputSlot>();
    const is3DigitInputVisible = Subject.create(false);
    this.registerInputDefinition('3', {
      ref: FSComponent.createRef<NumberInput>(),
      value: Subject.create(0),
      render: (ref, value) => this.renderInput(ref, signRef3Digit, value, is3DigitInputVisible, 3),
      isVisible: is3DigitInputVisible,
      signRef: signRef3Digit,
      digitCount: 3
    });

    const signRef4Digit = FSComponent.createRef<SignInputSlot>();
    const is4DigitInputVisible = Subject.create(false);
    this.registerInputDefinition('4', {
      ref: FSComponent.createRef<NumberInput>(),
      value: Subject.create(0),
      render: (ref, value) => this.renderInput(ref, signRef4Digit, value, is4DigitInputVisible, 4),
      isVisible: is4DigitInputVisible,
      signRef: signRef4Digit,
      digitCount: 4
    });

    this.showSignButton.set(true);
  }

  /** @inheritdoc */
  protected onRequest(input: GtcTemperatureDialogInput): void {
    this._title.set(input.title);

    const digitCount = MathUtils.clamp(
      Math.max(
        Math.trunc(input.digitCount ?? (Math.floor(Math.log10(Math.abs(input.minimumValue))) + 1)),
        Math.trunc(input.digitCount ?? (Math.floor(Math.log10(Math.abs(input.maximumValue))) + 1))
      ),
      2,
      4
    ) as 2 | 3 | 4;

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
  protected getPayload(value: number): GtcTemperatureDialogOutput {
    return {
      value: value,
      unit: this.unitType.get()
    };
  }

  /** @inheritdoc */
  protected onSignPressed(): void {
    if (this.activeInputDef === undefined) {
      return;
    }

    if (!this.activeInputDef.ref.instance.isEditingActive.get()) {
      this.activeInputDef.ref.instance.activateEditing(false);
    }

    this.activeInputDef.signRef.instance.incrementValue();

    if (this.activeInputDef.ref.instance.cursorPosition.get() === 0) {
      this.activeInputDef.ref.instance.moveCursor(1, false);
    }
  }

  /** @inheritdoc */
  protected getRootCssClassName(): string {
    return 'temperature-dialog';
  }

  /**
   * Renders one of this dialog's value inputs.
   * @param ref The reference to which to assign the rendered input.
   * @param signRef The reference to which to assign the sign input slot of the rendered input.
   * @param value The value to bind to the rendered input.
   * @param isVisible A subscribable to which to bind the visibility of the rendered input.
   * @param digitCount The number of digits in the input.
   * @returns A value input with the specified number of digits, as a VNode.
   */
  private renderInput(
    ref: NodeReference<NumberInput>,
    signRef: NodeReference<SignInputSlot>,
    value: MutableSubscribable<number>,
    isVisible: Subscribable<boolean>,
    digitCount: 2 | 3 | 4
  ): VNode {
    const cssClass = SetSubject.create(['number-dialog-input', 'temperature-dialog-input', `temperature-dialog-input-${digitCount}`]);

    isVisible.sub(val => { cssClass.toggle('hidden', !val); }, true);

    const maxValue = Math.pow(10, digitCount) - 1;

    const hiddenSign = value.map(currentValue => currentValue < 0 ? '' : '+');
    const visibleSign = value.map(currentValue => currentValue < 0 ? '−' : '');
    const absText = value.map(currentValue => MathUtils.clamp(Math.abs(currentValue), 0, maxValue).toFixed(0));
    const leadingZeroes = absText.map(text => ('').padStart(digitCount - text.length, '0'));
    const hiddenText = MappedSubject.create(
      ([sign, zeroes]) => sign + zeroes,
      hiddenSign,
      leadingZeroes
    );
    const valueText = MappedSubject.create(
      ([sign, abs]) => sign + abs,
      visibleSign,
      absText
    );

    return (
      <NumberInput
        ref={ref}
        value={value}
        digitizeValue={(currentValue, setSignValues, setDigitValues): void => {
          setSignValues[0](currentValue < 0 ? -1 : 1);

          const clamped = MathUtils.clamp(Math.round(Math.abs(currentValue)), 0, maxValue);

          for (let i = 0; i < setDigitValues.length; i++) {
            const power = Math.pow(10, setDigitValues.length - i - 1);
            setDigitValues[i](Math.trunc((clamped % (power * 10)) / power), true);
          }
        }}
        renderInactiveValue={
          <div class={`temperature-dialog-input-inactive-value temperature-dialog-input-${digitCount}-inactive-value`}>
            <span class='visibility-hidden'>{hiddenText}</span>
            <span class='temperature-dialog-input-inactive-value-text'>
              {valueText}
              <span>{this.unitDegreeSymbol}</span>
              <span class='numberunit-unit-small'>{this.unitSmallText}</span>
            </span>
          </div>
        }
        allowBackFill={true}
        class={cssClass}
      >
        <SignInputSlot ref={signRef} />
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
        <div>{this.unitDegreeSymbol}</div>
        <div class='numberunit-unit-small'>{this.unitSmallText}</div>
      </NumberInput>
    );
  }
}