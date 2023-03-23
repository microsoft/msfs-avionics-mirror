import {
  FSComponent, MathUtils, MutableSubscribable, NodeReference, SetSubject, Subject, Subscribable, Subscription, Unit,
  UnitFamily, UnitType, VNode
} from '@microsoft/msfs-sdk';

import { DigitInputSlot } from '../Components/NumberInput/DigitInputSlot';
import { NumberInput } from '../Components/NumberInput/NumberInput';
import { GtcViewProps } from '../GtcService/GtcView';
import { AbstractGtcNumberDialog, GtcNumberDialogInput, GtcNumberDialogInputDefinition } from './AbstractGtcNumberDialog';

import './GtcRunwayLengthDialog.css';

/**
 * A request input for {@link GtcRunwayLengthDialog}.
 */
export interface GtcRunwayLengthDialogInput extends GtcNumberDialogInput {
  /**
   * The initial length unit. If not defined, the initial unit will default to the one associated with the dialog's
   * unit mode.
   */
  initialUnit?: Unit<UnitFamily.Distance>;

  /**
   * The unit mode in which the dialog should operate.
   */
  unitsMode: 'feet' | 'meters';

  /** The GTC view title to display with the message. */
  title?: string;
}

/**
 * A request result returned by {@link GtcRunwayLengthDialog}.
 */
export interface GtcRunwayLengthDialogOutput {
  /** The selected length. */
  value: number;

  /** The unit type of the selected length. */
  unit: Unit<UnitFamily.Distance>;
}

/**
 * A definition for a {@link NumberInput} used in a {@link GtcRunwayLengthDialog}.
 */
interface GtcRunwayLengthDialogInputDefinition extends GtcNumberDialogInputDefinition {
  /** The maximum value allowed to be returned from this definition's input. */
  readonly max: number;

  /** The unit type associated with this definition's input. */
  readonly unit: Unit<UnitFamily.Distance>;
}

/**
 * A pop-up dialog which allows the user to select a runway length.
 */
export class GtcRunwayLengthDialog extends AbstractGtcNumberDialog<GtcRunwayLengthDialogInput, GtcRunwayLengthDialogOutput, GtcRunwayLengthDialogInputDefinition> {
  private static readonly FEET_MAX = 25000;
  private static readonly METERS_MAX = 7620;

  private unitsSub?: Subscription;

  /** @inheritdoc */
  public constructor(props: GtcViewProps) {
    super(props);

    const isFeetInputVisible = Subject.create(false);
    this.registerInputDefinition('feet', {
      ref: FSComponent.createRef<NumberInput>(),
      value: Subject.create(0),
      render: (ref, value) => this.renderFeetInput(ref, value, isFeetInputVisible),
      isVisible: isFeetInputVisible,
      max: GtcRunwayLengthDialog.FEET_MAX,
      unit: UnitType.FOOT
    });

    const isMetersInputVisible = Subject.create(false);
    this.registerInputDefinition('meters', {
      ref: FSComponent.createRef<NumberInput>(),
      value: Subject.create(0),
      render: (ref, value) => this.renderMetersInput(ref, value, isMetersInputVisible),
      isVisible: isMetersInputVisible,
      max: GtcRunwayLengthDialog.METERS_MAX,
      unit: UnitType.METER
    });
  }

  /** @inheritdoc */
  protected onRequest(input: GtcRunwayLengthDialogInput): void {
    const activeDef = this.inputDefinitions.get(input.unitsMode);
    if (activeDef === undefined) {
      throw new Error(`GtcRunwayLengthDialog: unrecognized unit mode ${input.unitsMode} (must be 'feet' or 'meters')`);
    }

    this._title.set(input.title);

    const initialUnit = input.initialUnit ?? activeDef.unit;
    const initialValue = MathUtils.clamp(initialUnit.convertTo(input.initialValue, activeDef.unit), 0, activeDef.max);

    this.resetActiveInput(input.unitsMode, Math.round(initialValue), true);
  }

  /** @inheritdoc */
  protected isValueValid(value: number, activeInputDef: GtcRunwayLengthDialogInputDefinition): boolean {
    return value >= 0 && value <= activeInputDef.max;
  }

  /** @inheritdoc */
  protected getInvalidValueMessage(value: number, activeInputDef: GtcRunwayLengthDialogInputDefinition): string | VNode {
    return `Invalid Entry\nValue must be between\n0 and ${activeInputDef.max}`;
  }

  /** @inheritdoc */
  protected getPayload(value: number, activeInputDef: GtcRunwayLengthDialogInputDefinition): GtcRunwayLengthDialogOutput {
    return {
      value,
      unit: activeInputDef.unit
    };
  }

  /** @inheritdoc */
  protected getRootCssClassName(): string {
    return 'runway-length-dialog';
  }

  /**
   * Renders this dialog's feet value input.
   * @param ref The reference to which to assign the rendered input.
   * @param value The value to bind to the rendered input.
   * @param isVisible A subscribable to which to bind the visibility of the rendered input.
   * @returns This dialog's feet value input, as a VNode.
   */
  private renderFeetInput(ref: NodeReference<NumberInput>, value: MutableSubscribable<number>, isVisible: Subscribable<boolean>): VNode {
    const cssClass = SetSubject.create(['number-dialog-input', 'runway-length-dialog-input', 'runway-length-dialog-input-feet']);

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
            <div class='runway-length-dialog-input-inactive-value speed-dialog-input-feet-inactive-value'>
              <span class='visibility-hidden'>{('').padStart(leadingZeroCount, '0')}</span>
              <span class='runway-length-dialog-input-inactive-value-text'>
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
    const cssClass = SetSubject.create(['number-dialog-input', 'runway-length-dialog-input', 'runway-length-dialog-input-feet']);

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
            <div class='runway-length-dialog-input-inactive-value speed-dialog-input-meters-inactive-value'>
              <span class='visibility-hidden'>{('').padStart(leadingZeroCount, '0')}</span>
              <span class='runway-length-dialog-input-inactive-value-text'>
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

  /** @inheritdoc */
  public destroy(): void {
    this.unitsSub?.destroy();

    super.destroy();
  }
}