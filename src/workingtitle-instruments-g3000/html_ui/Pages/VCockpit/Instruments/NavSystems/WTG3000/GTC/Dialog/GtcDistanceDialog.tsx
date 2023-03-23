import {
  ArrayUtils, FSComponent, MathUtils, MutableSubscribable, NodeReference,
  SetSubject, Subject, Subscribable, Unit, UnitFamily, UnitType, VNode,
} from '@microsoft/msfs-sdk';
import { UnitFormatter } from '@microsoft/msfs-garminsdk';
import { DigitInputSlot } from '../Components/NumberInput/DigitInputSlot';
import { NumberInput } from '../Components/NumberInput/NumberInput';
import { GtcViewProps } from '../GtcService/GtcView';
import { AbstractGtcNumberDialog, GtcNumberDialogInput, GtcNumberDialogInputDefinition } from './AbstractGtcNumberDialog';

import './GtcDistanceDialog.css';

/**
 * A request input for {@link GtcDistanceDialog}.
 */
export interface GtcDistanceDialogInput extends GtcNumberDialogInput {
  /**
   * The initial distance unit. If not defined, the initial unit will default to the dialog's unit type.
   */
  initialUnit?: Unit<UnitFamily.Distance>;

  /** The unit type in which the dialog should operate. */
  unitType: Unit<UnitFamily.Distance>;

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
 * A request result returned by {@link GtcDistanceDialog}.
 */
export interface GtcDistanceDialogOutput {
  /** The selected distance. */
  value: number;

  /** The unit type of the selected distance. */
  unit: Unit<UnitFamily.Distance>;
}

/**
 * A definition for a {@link NumberInput} used in a {@link GtcDistanceDialog}.
 */
interface GtcDistanceDialogInputDefinition extends GtcNumberDialogInputDefinition {
  /** The number of digits to the left of the decimal point supported by this definition's input. */
  readonly digitCount: number;
}

/**
 * A dialog which allows the user to enter a distance. The dialog can operate with any arbitrary distance unit type and
 * supports inputs with one digit to the right of the decimal point plus two, three, or four digits to the left.
 */
export class GtcDistanceDialog extends AbstractGtcNumberDialog<GtcDistanceDialogInput, GtcDistanceDialogOutput, GtcDistanceDialogInputDefinition> {
  private static readonly UNIT_FORMATTER = UnitFormatter.create();

  private readonly unitType = Subject.create<Unit<UnitFamily.Distance>>(UnitType.NMILE);
  private readonly unitText = this.unitType.map(GtcDistanceDialog.UNIT_FORMATTER);

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

    this.showDecimalButton.set(true);
  }

  /** @inheritdoc */
  protected onRequest(input: GtcDistanceDialogInput): void {
    this._title.set(input.title);

    const digitCount = MathUtils.clamp(Math.trunc(input.digitCount ?? (Math.floor(Math.log10(input.maximumValue)) + 1)), 2, 4) as 2 | 3 | 4;

    const initialUnit = input.initialUnit ?? input.unitType;
    const initialValue = MathUtils.clamp(initialUnit.convertTo(input.initialValue, input.unitType), input.minimumValue, input.maximumValue);

    this.unitType.set(input.unitType);

    this.minValue = input.minimumValue;
    this.maxValue = input.maximumValue;

    this.resetActiveInput(digitCount.toString(), Math.round(initialValue * 10), true);
  }

  /** @inheritdoc */
  protected isValueValid(value: number): boolean {
    return value >= this.minValue * 10 && value <= this.maxValue * 10;
  }

  /** @inheritdoc */
  protected getInvalidValueMessage(): string | VNode {
    return `Invalid Entry\nValue must be between\n${(Math.ceil(this.minValue * 10) / 10).toFixed(1)} and ${(Math.floor(this.maxValue * 10) / 10).toFixed(1)}`;
  }

  /** @inheritdoc */
  protected getPayload(value: number): GtcDistanceDialogOutput {
    return {
      value: value / 10,
      unit: this.unitType.get()
    };
  }

  /** @inheritdoc */
  protected onDecimalPressed(): void {
    if (this.activeInputDef === undefined) {
      return;
    }

    this.activeInputDef.ref.instance.placeCursor(this.activeInputDef.digitCount, false);
  }

  /** @inheritdoc */
  protected getRootCssClassName(): string {
    return 'distance-dialog';
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
    const cssClass = SetSubject.create(['number-dialog-input', 'distance-dialog-input', `distance-dialog-input-${digitCount}`]);

    isVisible.sub(val => { cssClass.toggle('hidden', !val); }, true);

    const maxValue = Math.pow(10, digitCount) - 1;

    const valueText = value.map(currentValue => MathUtils.clamp(currentValue / 10, 0, maxValue / 10).toFixed(1));
    const leadingZeroes = valueText.map(text => ('').padStart(digitCount - text.length + 2, '0'));

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
          <div class={`distance-dialog-input-inactive-value distance-dialog-input-${digitCount}-inactive-value`}>
            <span class='visibility-hidden'>{leadingZeroes}</span>
            <span class='distance-dialog-input-inactive-value-text'>
              {valueText}
              <span class='numberunit-unit-small'>{this.unitText}</span>
            </span>
          </div>
        }
        allowBackFill={true}
        initialEditIndex={digitCount - 1}
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
              scale={Math.pow(10, digitCount - index)}
              defaultCharValues={[0]}
            />
          );
        })}
        <div>.</div>
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
        <div class='numberunit-unit-small'>{this.unitText}</div>
      </NumberInput>
    );
  }
}