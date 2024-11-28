import {
  ArrayUtils, FSComponent, MappedSubscribable, MathUtils, MutableSubscribable, NodeReference, SetSubject, Subject, Subscribable, Unit, UnitType, VNode,
} from '@microsoft/msfs-sdk';

import { DigitInputSlot } from '../../Shared/Components/NumberInput/DigitInputSlot';
import { NumberInput } from '../../Shared/Components/NumberInput/NumberInput';
import { G3XUnitFormatter } from '../../Shared/Graphics/Text/G3XUnitFormatter';
import { UiKnobUtils } from '../../Shared/UiSystem/UiKnobUtils';
import { UiViewProps } from '../../Shared/UiSystem/UiView';
import { AbstractUiNumberDialog, UiNumberDialogInput, UiNumberDialogInputDefinition } from './AbstractUiNumberDialog';
import { UiDialogResult } from '../../Shared';

import './UiGenericNumberUnitDialog.css';

/**
 * A request input for {@link UiGenericNumberUnitDialog}.
 */
interface UiGenericNumberUnitDialogInput<T extends string> extends UiNumberDialogInput {
  /**
   * The initial unit. If not defined, the initial unit will default to the dialog's unit type.
   */
  initialUnit?: Unit<T>;

  /** The unit type in which the dialog should operate. */
  unitType: Unit<T>;

  /**
   * The number of digits to the left of the decimal point supported by the dialog's input. If not defined, then the
   * number of digits will default to the minimum number of digits required to accommodate the maximum valid value.
   */
  digitCount?: 2 | 3 | 4 | 5;

  /**
   * The number of digits to the right of the decimal point supported by the dialog's input. Defaults to 1.
   */
  decimalCount?: 0 | 1 | 2;

  /** The minimum valid numeric value allowed by the dialog's input. */
  minimumValue: number;

  /** The maximum valid numeric value allowed by the dialog's input. */
  maximumValue: number;

  /** The title to display with the dialog. Defaults to `'Select Value'`. */
  title?: string;

  /** The label to display for the inner bezel rotary knobs. Defaults to `'Select Value'`. */
  innerKnobLabel?: string;

  /** The label to display for the outer bezel rotary knobs. Defaults to `'Select Value'`. */
  outerKnobLabel?: string;
}

/**
 * A request result returned by {@link UiGenericNumberUnitDialog}.
 */
export interface UiGenericNumberUnitDialogOutput<T extends string> {
  /** The selected value. */
  value: number;

  /** The unit type. */
  unit: Unit<T>;
}

/**
 * A definition for a {@link NumberInput} used in a {@link UiGenericNumberUnitDialog}.
 */
interface UiGenericUnitDialogInputDefinition extends UiNumberDialogInputDefinition {
  /** The number of digits to the left of the decimal point supported by this definition's input. */
  readonly digitCount: number;

  /** The number of digits to the right of the decimal point supported by this definition's input. */
  readonly decimalCount: number;

  /**
   * The scaling factor used by this definition's input such that the input's value equals the payload value multiplied
   * by the factor.
   */
  readonly factor: number;
}

/**
 * A dialog which allows the user to enter a value with any unit type and
 * supports inputs with two, three, or four digits to the left of the decimal point and zero, one, or two digits to the
 * right.
 */
export class UiGenericNumberUnitDialog extends AbstractUiNumberDialog<
  UiGenericNumberUnitDialogInput<string>,
  UiGenericNumberUnitDialogOutput<string>,
  UiGenericUnitDialogInputDefinition
> {
  private static readonly UNIT_FORMATTER = G3XUnitFormatter.create();

  private readonly validInnerKnobIds = this.props.uiService.validKnobIds.filter(id => UiKnobUtils.isInnerKnobId(id) && UiKnobUtils.isTurnKnobId(id));
  private readonly validOuterKnobIds = this.props.uiService.validKnobIds.filter(id => UiKnobUtils.isOuterKnobId(id));

  private readonly defaultTitleLabel: string = 'Select Value';
  private readonly defaultInnerKnobLabel: string = 'Select Value';
  private readonly defaultOuterKnobLabel: string = 'Select Value';

  private minValue = 0;
  private maxValue = 0;

  private readonly unitType = Subject.create<Unit<string>>(UnitType.NMILE);
  private readonly unitText: MappedSubscribable<string> = this.unitType.map(UiGenericNumberUnitDialog.UNIT_FORMATTER);

  /** @inheritDoc */
  public constructor(props: UiViewProps) {
    super(props);

    for (let digitCount = 2; digitCount <= 5; digitCount++) {
      for (let decimalCount = 0; decimalCount <= 2; decimalCount++) {
        this.registerInputDefinition(
          `${digitCount}.${decimalCount}`,
          this.createInputDefinition(digitCount as 2 | 3 | 4 | 5, decimalCount as 0 | 1 | 2)
        );
      }
    }
  }

  /** @inheritDoc */
  public request<U extends string>(input: UiGenericNumberUnitDialogInput<U>): Promise<UiDialogResult<UiGenericNumberUnitDialogOutput<U>>> {
    return super.request(input) as Promise<UiDialogResult<UiGenericNumberUnitDialogOutput<U>>>;
  }

  /**
   * Creates an input definition for this dialog.
   * @param digitCount The number of digits to the left of the decimal point supported by the input.
   * @param decimalCount The number of digits to the right of the decimal point supported by the input.
   * @returns An input definition for this dialog with the specified parameters.
   */
  private createInputDefinition(digitCount: 2 | 3 | 4 | 5, decimalCount: 0 | 1 | 2): UiGenericUnitDialogInputDefinition {
    const isVisible = Subject.create(false);
    return {
      ref: FSComponent.createRef<NumberInput>(),
      value: Subject.create(0),
      render: (ref, value) => this.renderInput(ref, value, isVisible, digitCount, decimalCount),
      isVisible,
      digitCount,
      decimalCount,
      factor: 10 ** decimalCount
    };
  }

  /** @inheritDoc */
  protected onRequest(input: UiGenericNumberUnitDialogInput<string>): void {
    this.title.set(input.title ?? this.defaultTitleLabel);

    const innerKnobLabel = input.innerKnobLabel ?? this.defaultInnerKnobLabel;
    for (const knobId of this.validInnerKnobIds) {
      this._knobLabelState.setValue(knobId, innerKnobLabel);
    }

    const outerKnobLabel = input.outerKnobLabel ?? this.defaultOuterKnobLabel;
    for (const knobId of this.validOuterKnobIds) {
      this._knobLabelState.setValue(knobId, outerKnobLabel);
    }

    const digitCount = MathUtils.clamp(Math.trunc(input.digitCount ?? (Math.floor(Math.log10(input.maximumValue)) + 1)), 2, 5) as 2 | 3 | 4 | 5;
    const decimalCount = MathUtils.clamp(Math.trunc(input.decimalCount ?? 1), 0, 2);

    const initialUnit = input.initialUnit ?? input.unitType;
    const initialValue = MathUtils.clamp(initialUnit.convertTo(input.initialValue, input.unitType), input.minimumValue, input.maximumValue);

    this.unitType.set(input.unitType);

    this.minValue = input.minimumValue;
    this.maxValue = input.maximumValue;

    this.showDecimalButton.set(decimalCount > 0);

    // Focus the Enter button.
    this.focusController.setFocusIndex(1);

    const key = `${digitCount}.${decimalCount}`;
    this.resetActiveInput(key, Math.round(initialValue * (10 ** decimalCount)), true);
  }

  /** @inheritDoc */
  protected isValueValid(value: number, activeInputDef: UiGenericUnitDialogInputDefinition): boolean {
    return value >= this.minValue * activeInputDef.factor && value <= this.maxValue * activeInputDef.factor;
  }

  /** @inheritDoc */
  protected getInvalidValueMessage(value: number, activeInputDef: UiGenericUnitDialogInputDefinition): string | VNode {
    const min = MathUtils.ceil(this.minValue, 1 / activeInputDef.factor);
    const max = MathUtils.floor(this.maxValue, 1 / activeInputDef.factor);
    return `Invalid Entry\nValue must be between\n${(min).toFixed(activeInputDef.decimalCount)} and ${max.toFixed(activeInputDef.decimalCount)}`;
  }

  /** @inheritDoc */
  protected getPayload(value: number, activeInputDef: UiGenericUnitDialogInputDefinition): UiGenericNumberUnitDialogOutput<string> {
    return {
      value: value / activeInputDef.factor,
      unit: this.unitType.get()
    };
  }

  /** @inheritDoc */
  protected onDecimalPressed(): void {
    if (this.activeInputDef === undefined) {
      return;
    }

    this.activeInputDef.ref.instance.placeCursor(this.activeInputDef.digitCount, false);
  }

  /** @inheritDoc */
  protected getRootCssClassName(): string {
    return 'generic-number-unit-dialog';
  }

  /**
   * Renders one of this dialog's value inputs.
   * @param ref The reference to which to assign the rendered input.
   * @param value The value to bind to the rendered input.
   * @param isVisible A subscribable to which to bind the visibility of the rendered input.
   * @param digitCount The number of digits in the input to the left of the decimal point.
   * @param decimalCount The number of digits in the input to the right of the decimal point.
   * @returns A value input with the specified number of digits, as a VNode.
   */
  private renderInput(
    ref: NodeReference<NumberInput>,
    value: MutableSubscribable<number>,
    isVisible: Subscribable<boolean>,
    digitCount: 2 | 3 | 4 | 5,
    decimalCount: 0 | 1 | 2
  ): VNode {
    const cssClass = SetSubject.create(['number-dialog-input', 'generic-number-unit-dialog-input', `generic-number-unit-dialog-input-${digitCount}`]);

    const factor = 10 ** decimalCount;
    const decimalCharCount = decimalCount === 0 ? 0 : decimalCount + 1;

    isVisible.sub(val => {
      cssClass.toggle('hidden', !val);
    }, true);

    const maxValue = 10 ** digitCount * factor - 1;

    const valueText = value.map(currentValue => MathUtils.clamp(currentValue / factor, 0, maxValue / factor).toFixed(decimalCount));
    const leadingZeroes = valueText.map(text => ('').padStart(digitCount - text.length + decimalCharCount, '0'));

    return (
      <NumberInput
        ref={ref}
        value={value}
        digitizeValue={(currentValue, setSignValues, setDigitValues): void => {
          const clamped = MathUtils.clamp(Math.round(currentValue), 0, maxValue);

          for (let i = 0; i < setDigitValues.length; i++) {
            const power = 10 ** (setDigitValues.length - i - 1);
            setDigitValues[i](Math.trunc((clamped % (power * 10)) / power), true);
          }
        }}
        renderInactiveValue={
          <div class={`generic-number-unit-dialog-input-inactive-value generic-number-unit-dialog-input-${digitCount}-inactive-value`}>
            <span class='visibility-hidden'>{leadingZeroes}</span>
            <span class='generic-number-unit-dialog-input-inactive-value-text'>
              {valueText}{this.unitText}
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
              scale={10 ** (digitCount + decimalCount - index - 1)}
              defaultCharValues={[0]}
            />
          );
        })}
        {
          decimalCount > 0
            ? (
              <>
                <div>.</div>
                {...ArrayUtils.create(decimalCount, index => {
                  return (
                    <DigitInputSlot
                      allowBackfill={false}
                      characterCount={1}
                      minValue={0}
                      maxValue={10}
                      increment={1}
                      wrap={true}
                      scale={10 ** (decimalCount - index - 1)}
                      defaultCharValues={[0]}
                    />
                  );
                })}
              </>
            )
            : null
        }
        <div>{this.unitText}</div>
      </NumberInput>
    );
  }
}