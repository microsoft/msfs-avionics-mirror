import {
  FSComponent, MathUtils, MutableSubscribable, NodeReference,
  SetSubject, Subject, Subscribable, Unit, UnitFamily, UnitType, VNode,
} from '@microsoft/msfs-sdk';
import { DigitInputSlot } from '../Components/NumberInput/DigitInputSlot';
import { NumberInput } from '../Components/NumberInput/NumberInput';
import { GtcViewProps } from '../GtcService/GtcView';
import { AbstractGtcNumberDialog, GtcNumberDialogInput, GtcNumberDialogInputDefinition } from './AbstractGtcNumberDialog';

import './GtcBaroPressureDialog.css';

/**
 * A request input for {@link GtcBaroPressureDialog}.
 */
export interface GtcBaroPressureDialogInput extends GtcNumberDialogInput {
  /**
   * The initial pressure unit. If not defined, the initial unit will default to a value based on the units mode.
   */
  initialUnit?: Unit<UnitFamily.Pressure>;

  /** Whether the dialog should operate in units of inches of mercury or hectopascals. */
  unitsMode: 'inhg' | 'hpa';

  /** The minimum valid numeric value allowed by the dialog's input. */
  minimumValue: number;

  /** The maximum valid numeric value allowed by the dialog's input. */
  maximumValue: number;

  /** The GTC view title to display with the message. */
  title?: string;
}

/**
 * A request result returned by {@link GtcBaroPressureDialog}.
 */
export interface GtcBaroPressureDialogOutput {
  /** The selected pressure. */
  value: number;

  /** The unit type of the selected pressure. */
  unit: Unit<UnitFamily.Pressure>;
}

/**
 * A definition for a {@link NumberInput} used in a {@link GtcBaroPressureDialog}.
 */
interface GtcBaroPressureDialogInputDefinition extends GtcNumberDialogInputDefinition {
  /** The unit type associated with this definition's input. */
  readonly unit: Unit<UnitFamily.Pressure>;

  /** The scaling factor used by this definition's input to represent the dialog's numeric values. */
  readonly factor: number;

  /** A function which formats minimum/maximum values used by this definition's input. */
  readonly formatter: (value: number) => string;
}

/**
 * A dialog which allows the user to enter a barometric pressure in inches of mercury or hectopascals.
 */
export class GtcBaroPressureDialog extends AbstractGtcNumberDialog<GtcBaroPressureDialogInput, GtcBaroPressureDialogOutput, GtcBaroPressureDialogInputDefinition> {
  private minValue = 0;
  private maxValue = 0;

  /** @inheritdoc */
  public constructor(props: GtcViewProps) {
    super(props);

    const isInhgInputVisible = Subject.create(false);
    this.registerInputDefinition('inhg', {
      ref: FSComponent.createRef<NumberInput>(),
      value: Subject.create(0),
      render: (ref, value) => this.renderInhgInput(ref, value, isInhgInputVisible),
      isVisible: isInhgInputVisible,
      unit: UnitType.IN_HG,
      factor: 100,
      formatter: value => value.toFixed(2)
    });

    const isHpaInputVisible = Subject.create(false);
    this.registerInputDefinition('hpa', {
      ref: FSComponent.createRef<NumberInput>(),
      value: Subject.create(0),
      render: (ref, value) => this.renderHpaInput(ref, value, isHpaInputVisible),
      isVisible: isHpaInputVisible,
      unit: UnitType.HPA,
      factor: 1,
      formatter: value => value.toFixed(0)
    });
  }

  /** @inheritdoc */
  protected onRequest(input: GtcBaroPressureDialogInput): void {
    this._title.set(input.title);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const initialInputDef = this.inputDefinitions.get(input.unitsMode)!;
    const initialUnit = input.initialUnit ?? initialInputDef.unit;

    const initialValue = MathUtils.clamp(initialUnit.convertTo(input.initialValue, initialInputDef.unit), input.minimumValue, input.maximumValue);

    this.minValue = input.minimumValue;
    this.maxValue = input.maximumValue;

    const factor = this.inputDefinitions.get(input.unitsMode)?.factor ?? 1;

    this.resetActiveInput(input.unitsMode, Math.round(initialValue * factor), true);
  }

  /** @inheritdoc */
  protected isValueValid(value: number, activeInputDef: GtcBaroPressureDialogInputDefinition): boolean {
    return value >= this.minValue * activeInputDef.factor && value <= this.maxValue * activeInputDef.factor;
  }

  /** @inheritdoc */
  protected getInvalidValueMessage(value: number, activeInputDef: GtcBaroPressureDialogInputDefinition): string | VNode {
    return `Invalid Entry\nValue must be between\n${activeInputDef.formatter(this.minValue)} and ${activeInputDef.formatter(this.maxValue)}`;
  }

  /** @inheritdoc */
  protected getPayload(value: number, activeInputDef: GtcBaroPressureDialogInputDefinition): GtcBaroPressureDialogOutput {
    return {
      value: value / activeInputDef.factor,
      unit: activeInputDef.unit
    };
  }

  /** @inheritdoc */
  protected getRootCssClassName(): string {
    return 'baro-pressure-dialog';
  }

  /**
   * Renders this dialog's inches of mercury value input.
   * @param ref The reference to which to assign the rendered input.
   * @param value The value to bind to the rendered input.
   * @param isVisible A subscribable to which to bind the visibility of the rendered input.
   * @returns This dialog's inches of mercury value input, as a VNode.
   */
  private renderInhgInput(ref: NodeReference<NumberInput>, value: MutableSubscribable<number>, isVisible: Subscribable<boolean>): VNode {
    const cssClass = SetSubject.create(['number-dialog-input', 'baro-pressure-dialog-input', 'baro-pressure-dialog-input-inhg']);

    isVisible.sub(val => { cssClass.toggle('hidden', !val); }, true);

    return (
      <NumberInput
        ref={ref}
        value={value}
        digitizeValue={(currentValue, setSignValues, setDigitValues): void => {
          const clamped = MathUtils.clamp(Math.round(currentValue), 0, 9999);

          setDigitValues[0](Math.trunc((clamped % 1e4) / 1e3), true);
          setDigitValues[1](Math.trunc((clamped % 1e3) / 1e2), true);
          setDigitValues[2](Math.trunc((clamped % 1e2) / 1e1), true);
          setDigitValues[3](clamped % 1e1, true);
        }}
        renderInactiveValue={currentValue => {
          const valueText = MathUtils.clamp(currentValue / 100, 0, 99.99).toFixed(2);
          const leadingZeroCount = 5 - valueText.length;

          return (
            <div class='baro-pressure-dialog-input-inactive-value baro-pressure-dialog-input-feet-inactive-value'>
              <span class='visibility-hidden'>{('').padStart(leadingZeroCount, '0')}</span>
              <span class='baro-pressure-dialog-input-inactive-value-text'>
                {valueText}
                <span class='numberunit-unit-small'>IN</span>
              </span>
            </div>
          );
        }}
        allowBackFill={true}
        class={cssClass}
      >
        <DigitInputSlot
          characterCount={1}
          minValue={0}
          maxValue={10}
          increment={1}
          wrap={true}
          scale={1e3}
          defaultCharValues={[0]}
        />
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
          characterCount={1}
          minValue={0}
          maxValue={10}
          increment={1}
          wrap={true}
          scale={1e1}
          defaultCharValues={[0]}
        />
        <DigitInputSlot
          characterCount={1}
          minValue={0}
          maxValue={10}
          increment={1}
          wrap={true}
          scale={1e0}
          defaultCharValues={[0]}
        />
        <div class='numberunit-unit-small'>IN</div>
      </NumberInput>
    );
  }

  /**
   * Renders this dialog's hectopascals value input.
   * @param ref The reference to which to assign the rendered input.
   * @param value The value to bind to the rendered input.
   * @param isVisible A subscribable to which to bind the visibility of the rendered input.
   * @returns This dialog's hectopascals value input, as a VNode.
   */
  private renderHpaInput(ref: NodeReference<NumberInput>, value: MutableSubscribable<number>, isVisible: Subscribable<boolean>): VNode {
    const cssClass = SetSubject.create(['number-dialog-input', 'baro-pressure-dialog-input', 'baro-pressure-dialog-input-hpa']);

    isVisible.sub(val => { cssClass.toggle('hidden', !val); }, true);

    return (
      <NumberInput
        ref={ref}
        value={value}
        digitizeValue={(currentValue, setSignValues, setDigitValues): void => {
          const clamped = MathUtils.clamp(Math.round(currentValue), 0, 9999);

          setDigitValues[0](Math.trunc((clamped % 1e4) / 1e3), true);
          setDigitValues[1](Math.trunc((clamped % 1e3) / 1e2), true);
          setDigitValues[2](Math.trunc((clamped % 1e2) / 1e1), true);
          setDigitValues[3](clamped % 1e1, true);
        }}
        renderInactiveValue={currentValue => {
          const valueText = MathUtils.clamp(currentValue, 0, 9999).toFixed(0);
          const leadingZeroCount = 4 - valueText.length;

          return (
            <div class='baro-pressure-dialog-input-inactive-value baro-pressure-dialog-input-meters-inactive-value'>
              <span class='visibility-hidden'>{('').padStart(leadingZeroCount, '0')}</span>
              <span class='baro-pressure-dialog-input-inactive-value-text'>
                {valueText}
                <span class='numberunit-unit-small'>HPA</span>
              </span>
            </div>
          );
        }}
        allowBackFill={true}
        class={cssClass}
      >
        <DigitInputSlot
          characterCount={1}
          minValue={0}
          maxValue={10}
          increment={1}
          wrap={true}
          scale={1e3}
          defaultCharValues={[0]}
        />
        <DigitInputSlot
          characterCount={1}
          minValue={0}
          maxValue={10}
          increment={1}
          wrap={true}
          scale={1e2}
          defaultCharValues={[0]}
        />
        <DigitInputSlot
          characterCount={1}
          minValue={0}
          maxValue={10}
          increment={1}
          wrap={true}
          scale={1e1}
          defaultCharValues={[0]}
        />
        <DigitInputSlot
          characterCount={1}
          minValue={0}
          maxValue={10}
          increment={1}
          wrap={true}
          scale={1e0}
          defaultCharValues={[0]}
        />
        <div class='numberunit-unit-small'>HPA</div>
      </NumberInput>
    );
  }
}