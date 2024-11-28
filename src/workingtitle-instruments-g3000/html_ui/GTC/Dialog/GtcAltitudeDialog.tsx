import {
  FSComponent, MathUtils, MutableSubscribable, NodeReference,
  SetSubject, Subject, Subscribable, Unit, UnitFamily, UnitType, VNode,
} from '@microsoft/msfs-sdk';
import { DigitInputSlot } from '../Components/NumberInput/DigitInputSlot';
import { NumberInput } from '../Components/NumberInput/NumberInput';
import { GtcViewProps } from '../GtcService/GtcView';
import { AbstractGtcNumberDialog, GtcNumberDialogInput, GtcNumberDialogInputDefinition } from './AbstractGtcNumberDialog';

import './GtcAltitudeDialog.css';

/**
 * A request input for {@link GtcAltitudeDialog}.
 */
export interface GtcAltitudeDialogInput extends GtcNumberDialogInput {
  /**
   * The initial altitude unit. If not defined, the initial unit will default to a value based on the units mode.
   */
  initialUnit?: Unit<UnitFamily.Distance>;

  /** Whether the dialog should operate in units of feet or meters. */
  unitsMode: 'feet' | 'meters';

  /** The minimum valid numeric value allowed by the dialog's input. */
  minimumValue: number;

  /** The maximum valid numeric value allowed by the dialog's input. */
  maximumValue: number;

  /** The GTC view title to display with the message. */
  title?: string;
}

/**
 * A request result returned by {@link GtcAltitudeDialog}.
 */
export interface GtcAltitudeDialogOutput {
  /** The selected altitude. */
  value: number;

  /** The unit type of the selected altitude. */
  unit: Unit<UnitFamily.Distance>;
}

/**
 * A definition for a {@link NumberInput} used in a {@link GtcAltitudeDialog}.
 */
interface GtcAltitudeDialogInputDefinition extends GtcNumberDialogInputDefinition {
  /** The unit type associated with this definition's input. */
  readonly unit: Unit<UnitFamily.Distance>;
}

/**
 * A dialog which allows the user to enter an altitude in feet or meters.
 */
export class GtcAltitudeDialog extends AbstractGtcNumberDialog<GtcAltitudeDialogInput, GtcAltitudeDialogOutput, GtcAltitudeDialogInputDefinition> {
  private minValue = 0;
  private maxValue = 0;

  /** @inheritdoc */
  public constructor(props: GtcViewProps) {
    super(props);

    const isFeetInputVisible = Subject.create(false);
    this.registerInputDefinition('feet', {
      ref: FSComponent.createRef<NumberInput>(),
      value: Subject.create(0),
      render: (ref, value) => this.renderFeetInput(ref, value, isFeetInputVisible),
      isVisible: isFeetInputVisible,
      unit: UnitType.FOOT
    });

    const isMetersInputVisible = Subject.create(false);
    this.registerInputDefinition('meters', {
      ref: FSComponent.createRef<NumberInput>(),
      value: Subject.create(0),
      render: (ref, value) => this.renderMetersInput(ref, value, isMetersInputVisible),
      isVisible: isMetersInputVisible,
      unit: UnitType.METER
    });
  }

  /** @inheritdoc */
  protected onRequest(input: GtcAltitudeDialogInput): void {
    this._title.set(input.title);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const initialInputDef = this.inputDefinitions.get(input.unitsMode)!;
    const initialUnit = input.initialUnit ?? initialInputDef.unit;

    const initialValue = MathUtils.clamp(initialUnit.convertTo(input.initialValue, initialInputDef.unit), input.minimumValue, input.maximumValue);

    this.minValue = input.minimumValue;
    this.maxValue = input.maximumValue;

    this.resetActiveInput(input.unitsMode, Math.round(initialValue), true);
  }

  /** @inheritdoc */
  protected isValueValid(value: number): boolean {
    return value >= this.minValue && value <= this.maxValue;
  }

  /** @inheritdoc */
  protected getInvalidValueMessage(): string | VNode {
    return `Invalid Entry\nValue must be between\n${this.minValue} and ${this.maxValue}`;
  }

  /** @inheritdoc */
  protected getPayload(value: number, activeInputDef: GtcAltitudeDialogInputDefinition): GtcAltitudeDialogOutput {
    return {
      value,
      unit: activeInputDef.unit
    };
  }

  /** @inheritdoc */
  protected getRootCssClassName(): string {
    return 'altitude-dialog';
  }

  /**
   * Renders this dialog's feet value input.
   * @param ref The reference to which to assign the rendered input.
   * @param value The value to bind to the rendered input.
   * @param isVisible A subscribable to which to bind the visibility of the rendered input.
   * @returns This dialog's feet value input, as a VNode.
   */
  private renderFeetInput(ref: NodeReference<NumberInput>, value: MutableSubscribable<number>, isVisible: Subscribable<boolean>): VNode {
    const cssClass = SetSubject.create(['number-dialog-input', 'altitude-dialog-input', 'altitude-dialog-input-feet']);

    isVisible.sub(val => { cssClass.toggle('hidden', !val); }, true);

    return (
      <NumberInput
        ref={ref}
        value={value}
        digitizeValue={(currentValue, setSignValues, setDigitValues): void => {
          const clamped = MathUtils.clamp(Math.round(currentValue), 0, 99999);

          setDigitValues[0](Math.trunc(clamped / 1e4), true);
          setDigitValues[1](Math.trunc((clamped % 1e4) / 1e3), true);
          setDigitValues[2](Math.trunc((clamped % 1e3) / 1e2), true);
          setDigitValues[3](Math.trunc((clamped % 1e2) / 1e1), true);
          setDigitValues[4](clamped % 1e1, true);
        }}
        renderInactiveValue={currentValue => {
          const valueText = MathUtils.clamp(currentValue, 0, 99999).toFixed(0);
          const leadingZeroCount = 5 - valueText.length;

          return (
            <div class='altitude-dialog-input-inactive-value altitude-dialog-input-feet-inactive-value'>
              <span class='visibility-hidden'>{('').padStart(leadingZeroCount, '0')}</span>
              <span class='altitude-dialog-input-inactive-value-text'>
                {valueText}
                <span class='numberunit-unit-small'>FT</span>
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
          scale={1e4}
          defaultCharValues={[0]}
        />
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
          scale={1}
          defaultCharValues={[0]}
        />
        <div class='numberunit-unit-small'>FT</div>
      </NumberInput>
    );
  }

  /**
   * Renders this dialog's meters value input.
   * @param ref The reference to which to assign the rendered input.
   * @param value The value to bind to the rendered input.
   * @param isVisible A subscribable to which to bind the visibility of the rendered input.
   * @returns This dialog's meters value input, as a VNode.
   */
  private renderMetersInput(ref: NodeReference<NumberInput>, value: MutableSubscribable<number>, isVisible: Subscribable<boolean>): VNode {
    const cssClass = SetSubject.create(['number-dialog-input', 'altitude-dialog-input', 'altitude-dialog-input-feet']);

    isVisible.sub(val => { cssClass.toggle('hidden', !val); }, true);

    return (
      <NumberInput
        ref={ref}
        value={value}
        digitizeValue={(currentValue, setSignValues, setDigitValues): void => {
          const clamped = MathUtils.clamp(Math.round(currentValue), 0, 99999);

          setDigitValues[0](Math.trunc(clamped / 1e4), true);
          setDigitValues[1](Math.trunc((clamped % 1e4) / 1e3), true);
          setDigitValues[2](Math.trunc((clamped % 1e3) / 1e2), true);
          setDigitValues[3](Math.trunc((clamped % 1e2) / 1e1), true);
          setDigitValues[4](clamped % 1e1, true);
        }}
        renderInactiveValue={currentValue => {
          const valueText = MathUtils.clamp(currentValue, 0, 99999).toFixed(0);
          const leadingZeroCount = 5 - valueText.length;

          return (
            <div class='altitude-dialog-input-inactive-value altitude-dialog-input-meters-inactive-value'>
              <span class='visibility-hidden'>{('').padStart(leadingZeroCount, '0')}</span>
              <span class='altitude-dialog-input-inactive-value-text'>
                {valueText}
                <span class='numberunit-unit-small'>M</span>
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
          scale={1e4}
          defaultCharValues={[0]}
        />
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
          scale={1}
          defaultCharValues={[0]}
        />
        <div class='numberunit-unit-small'>M</div>
      </NumberInput>
    );
  }
}