import {
  ArrayUtils, FSComponent, MappedSubject, MathUtils, MutableSubscribable, NodeReference, Subject, Subscribable,
  SubscribableMapFunctions, Unit, UnitFamily, UnitType, VNode
} from '@microsoft/msfs-sdk';

import { UnitFormatter } from '@microsoft/msfs-garminsdk';

import { DigitInputSlot } from '../Components/NumberInput/DigitInputSlot';
import { NumberInput } from '../Components/NumberInput/NumberInput';
import { SignInputSlot } from '../Components/NumberInput/SignInputSlot';
import { GtcViewProps } from '../GtcService/GtcView';
import { AbstractGtcNumberDialog, GtcNumberDialogInput, GtcNumberDialogInputDefinition } from './AbstractGtcNumberDialog';

import '../Components/TouchButton/NumPadTouchButton.css';
import './GtcMomentArmDialog.css';

/**
 * A request input for {@link GtcMomentArmDialog}.
 */
export interface GtcMomentArmDialogInput extends GtcNumberDialogInput {
  /**
   * The unit type in which the initial value is expressed. If not defined, then the initial unit will default to the
   * dialog's unit type.
   */
  initialUnit?: Unit<UnitFamily.Distance>;

  /** The unit type in which the dialog should operate. */
  unitType: Unit<UnitFamily.Distance>;

  /**
   * The number of digits to the left of the decimal point supported by the dialog's input. If not defined, the number
   * of digits will default to the minimum number of digits required to accommodate both the minimum and maximum valid
   * values.
   */
  digitCount?: 3 | 4;

  /** The minimum valid numeric value allowed by the dialog's input. */
  minimumValue: number;

  /** The maximum valid numeric value allowed by the dialog's input. */
  maximumValue: number;

  /** The GTC view title to display with the dialog. */
  title?: string;
}

/**
 * A request result returned by {@link GtcMomentArmDialog}.
 */
export interface GtcMomentArmDialogOutput {
  /** The selected moment arm. */
  value: number;

  /** The unit type of the selected moment arm. */
  unit: Unit<UnitFamily.Distance>;
}

/**
 * A definition for a {@link NumberInput} used in a {@link GtcMomentArmDialog}.
 */
interface GtcMomentArmDialogInputDefinition extends GtcNumberDialogInputDefinition {
  /** A reference to this definition's input's sign input slot. */
  readonly signRef: NodeReference<SignInputSlot>;

  /** The number of digits to the left of the decimal point supported by this definition's input. */
  readonly digitCount: number;
}

/**
 * A pop-up dialog that allows the user to select a moment arm. The dialog can operate with any arbitrary distance unit
 * type and supports inputs with one digit to the right of the decimal point plus three or four digits to the left.
 */
export class GtcMomentArmDialog extends AbstractGtcNumberDialog<
  GtcMomentArmDialogInput,
  GtcMomentArmDialogOutput,
  GtcMomentArmDialogInputDefinition
> {

  private static readonly UNIT_FORMATTER = UnitFormatter.create();

  private readonly unitType = Subject.create<Unit<UnitFamily.Distance>>(UnitType.INCH);
  private readonly unitText = this.unitType.map(GtcMomentArmDialog.UNIT_FORMATTER);

  private minValue = 0;
  private maxValue = 0;

  /** @inheritDoc */
  public constructor(props: GtcViewProps) {
    super(props);

    for (let digitCount = 3; digitCount < 5; digitCount++) {
      const signRef = FSComponent.createRef<SignInputSlot>();
      const isVisible = Subject.create(false);
      this.registerInputDefinition(digitCount.toString(), {
        ref: FSComponent.createRef<NumberInput>(),
        value: Subject.create(0),
        render: (ref, value) => this.renderInput(ref, signRef, value, isVisible, digitCount as 3 | 4),
        isVisible: isVisible,
        signRef: signRef,
        digitCount
      });
    }

    this.showSignButton.set(true);
    this.showDecimalButton.set(true);
  }

  /** @inheritDoc */
  public onAfterRender(): void {
    super.onAfterRender();

    this._title.set('Arm');
  }

  /** @inheritDoc */
  protected onRequest(input: GtcMomentArmDialogInput): void {
    this._title.set(input.title);

    const maxAbsValue = Math.max(Math.abs(input.minimumValue), Math.abs(input.maximumValue));

    const digitCount = MathUtils.clamp(Math.trunc(input.digitCount ?? (Math.floor(Math.log10(maxAbsValue)) + 1)), 3, 4) as 3 | 4;

    const initialUnit = input.initialUnit ?? input.unitType;
    const initialValue = MathUtils.clamp(initialUnit.convertTo(input.initialValue, input.unitType), input.minimumValue, input.maximumValue);

    this.unitType.set(input.unitType);

    this.minValue = input.minimumValue;
    this.maxValue = input.maximumValue;

    this.resetActiveInput(digitCount.toString(), Math.round(initialValue * 10), true);
  }

  /** @inheritDoc */
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

  /** @inheritDoc */
  protected onDecimalPressed(): void {
    if (this.activeInputDef === undefined) {
      return;
    }

    this.activeInputDef.ref.instance.placeCursor(this.activeInputDef.digitCount + 1, false);
  }

  /** @inheritDoc */
  protected isValueValid(value: number): boolean {
    return value >= this.minValue * 10 && value <= this.maxValue * 10;
  }

  /** @inheritDoc */
  protected getInvalidValueMessage(): string | VNode {
    return `Invalid Entry\nValue must be between\n${(Math.ceil(this.minValue * 10) / 10).toFixed(1)} and ${(Math.floor(this.maxValue * 10) / 10).toFixed(1)}`;
  }

  /** @inheritDoc */
  protected getRootCssClassName(): string | undefined {
    return 'moment-arm-dialog';
  }

  /** @inheritDoc */
  protected getPayload(value: number): GtcMomentArmDialogOutput {
    return {
      value: value / 10,
      unit: this.unitType.get()
    };
  }

  /** @inheritDoc */
  protected renderInput(
    ref: NodeReference<NumberInput>,
    signRef: NodeReference<SignInputSlot>,
    value: MutableSubscribable<number>,
    isVisible: Subscribable<boolean>,
    digitCount: 3 | 4
  ): VNode {
    const maxValue = Math.pow(10, digitCount + 1) - 1;

    const visibleSign = value.map(currentValue => currentValue < 0 ? '−' : '+');
    const absText = value.map(currentValue => (MathUtils.clamp(Math.abs(currentValue), 0, maxValue) / 10).toFixed(1));
    const leadingZeroes = absText.map(text => ('').padStart(digitCount + 2 - text.length, '0'));
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
          <div class={`moment-arm-dialog-input-inactive-value moment-arm-dialog-input-${digitCount}-inactive-value`}>
            <span class='visibility-hidden'>{leadingZeroes}</span>
            <span class='moment-arm-dialog-input-inactive-value-text'>
              {valueText}
              <span class='numberunit-unit-small'>{this.unitText}</span>
            </span>
          </div>
        }
        allowBackFill={true}
        initialEditIndex={digitCount}
        class={{
          'number-dialog-input': true,
          'moment-arm-dialog-input': true,
          [`moment-arm-dialog-input-${digitCount}`]: true,
          'hidden': isVisible.map(SubscribableMapFunctions.not())
        }}
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
