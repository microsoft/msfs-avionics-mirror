import {
  FSComponent, MathUtils, MutableSubscribable, NodeReference,
  SetSubject, SpeedUnit, Subject, Subscribable, VNode,
} from '@microsoft/msfs-sdk';
import { FmsSpeedsGeneralLimits } from '@microsoft/msfs-wtg3000-common';
import { DigitInputSlot } from '../Components/NumberInput/DigitInputSlot';
import { NumberInput } from '../Components/NumberInput/NumberInput';
import { GtcSetValueTouchButton } from '../Components/TouchButton/GtcSetValueTouchButton';
import { GtcViewProps } from '../GtcService/GtcView';
import { AbstractGtcNumberDialog, GtcNumberDialogInput, GtcNumberDialogInputDefinition } from './AbstractGtcNumberDialog';

import './GtcFmsSpeedDialog.css';

/**
 * Component props for GtcFmsSpeedDialog.
 */
export interface GtcFmsSpeedDialogProps extends GtcViewProps {
  /** General speed limits for the airplane. */
  generalSpeedLimits: FmsSpeedsGeneralLimits;
}

/**
 * A request input for {@link GtcFmsSpeedDialog}.
 */
export interface GtcFmsSpeedDialogInput extends GtcNumberDialogInput {
  /**
   * The initial speed unit. If not defined, the initial unit will default to a value based on the allowed unit type
   * (if both unit types are allowed, then it will default to IAS).
   */
  initialUnit?: SpeedUnit;

  /**
   * The types of speed units allowed by the input. If `both` is selected, then the dialog will display a pair of
   * buttons allowing the user to switch between IAS (KT) and mach.
   */
  unitsAllowed: 'ias' | 'mach' | 'both';

  /** The GTC view title to display with the message. */
  title?: string;
}

/**
 * A request result returned by {@link GtcFmsSpeedDialog}.
 */
export interface GtcFmsSpeedDialogOutput {
  /** The selected speed. */
  value: number;

  /** The unit type of the selected speed. */
  unit: SpeedUnit;
}

/**
 * A definition for a {@link NumberInput} used in a {@link GtcFmsSpeedDialog}.
 */
interface GtcFmsSpeedDialogInputDefinition extends GtcNumberDialogInputDefinition {
  /** The minimum value allowed to be returned from this definition's input. */
  readonly min: number;

  /** The maximum value allowed to be returned from this definition's input. */
  readonly max: number;

  /** The unit type associated with this definition's input. */
  readonly unit: SpeedUnit;
}

/**
 * A dialog which allows the user to enter an FMS speed. The dialog supports both indicated airspeed (knots) and mach
 * number entry.
 */
export class GtcFmsSpeedDialog extends AbstractGtcNumberDialog<GtcFmsSpeedDialogInput, GtcFmsSpeedDialogOutput, GtcFmsSpeedDialogInputDefinition, GtcFmsSpeedDialogProps> {
  private readonly unitMode = Subject.create(SpeedUnit.IAS);

  /** @inheritdoc */
  public constructor(props: GtcFmsSpeedDialogProps) {
    super(props);

    const isIasInputVisible = Subject.create(false);
    this.registerInputDefinition('ias', {
      ref: FSComponent.createRef<NumberInput>(),
      value: Subject.create(0),
      render: (ref, value) => this.renderIasInput(ref, value, isIasInputVisible),
      isVisible: isIasInputVisible,
      min: props.generalSpeedLimits.minimumIas,
      max: props.generalSpeedLimits.maximumIas,
      unit: SpeedUnit.IAS
    });

    const isMachInputVisible = Subject.create(false);
    this.registerInputDefinition('mach', {
      ref: FSComponent.createRef<NumberInput>(),
      value: Subject.create(0),
      render: (ref, value) => this.renderMachInput(ref, value, isMachInputVisible),
      isVisible: isMachInputVisible,
      min: props.generalSpeedLimits.minimumMach,
      max: props.generalSpeedLimits.maximumMach,
      unit: SpeedUnit.MACH
    });
  }

  /** @inheritdoc */
  protected onRequest(input: GtcFmsSpeedDialogInput): void {
    this._title.set(input.title);

    let initialUnit: 'ias' | 'mach';
    if (input.initialUnit === undefined) {
      initialUnit = input.unitsAllowed === 'both' ? 'ias' : input.unitsAllowed;
    } else {
      initialUnit = input.initialUnit === SpeedUnit.IAS ? 'ias' : 'mach';
    }

    let initialValue: number;
    if (initialUnit === 'mach') {
      initialValue = Math.round(input.initialValue * 1000);
      this.unitMode.set(SpeedUnit.MACH);
    } else {
      initialValue = input.initialValue;
      this.unitMode.set(SpeedUnit.IAS);
    }

    this.rootCssClass.toggle('fms-speed-dialog-both', input.unitsAllowed === 'both');

    this.resetActiveInput(initialUnit, initialValue, true);
  }

  /** @inheritdoc */
  protected isValueValid(value: number, activeInputDef: GtcFmsSpeedDialogInputDefinition): boolean {
    if (activeInputDef.unit === SpeedUnit.MACH) {
      value /= 1000;
    }

    return value >= activeInputDef.min && value <= activeInputDef.max;
  }

  /** @inheritdoc */
  protected getInvalidValueMessage(value: number, activeInputDef: GtcFmsSpeedDialogInputDefinition): string | VNode {
    if (activeInputDef.unit === SpeedUnit.IAS) {
      return `Invalid Speed\nPlease enter a speed between\n${activeInputDef.min.toFixed(0)} KT and ${activeInputDef.max.toFixed(0)} KT`;
    } else {
      return `Invalid Speed\nPlease enter a mach number\nbetween\n${activeInputDef.min.toFixed(3)} and ${activeInputDef.max.toFixed(3)}`;
    }
  }

  /** @inheritdoc */
  protected getPayload(value: number, activeInputDef: GtcFmsSpeedDialogInputDefinition): GtcFmsSpeedDialogOutput {
    if (activeInputDef.unit === SpeedUnit.MACH) {
      value /= 1000;
    }

    return {
      value,
      unit: activeInputDef.unit
    };
  }

  /** @inheritdoc */
  protected getRootCssClassName(): string {
    return 'fms-speed-dialog';
  }

  /**
   * Renders this dialog's IAS value input.
   * @param ref The reference to which to assign the rendered input.
   * @param value The value to bind to the rendered input.
   * @param isVisible A subscribable to which to bind the visibility of the rendered input.
   * @returns This dialog's IAS value input, as a VNode.
   */
  private renderIasInput(ref: NodeReference<NumberInput>, value: MutableSubscribable<number>, isVisible: Subscribable<boolean>): VNode {
    const cssClass = SetSubject.create(['number-dialog-input', 'fms-speed-dialog-input', 'fms-speed-dialog-input-ias']);

    isVisible.sub(val => { cssClass.toggle('hidden', !val); }, true);

    return (
      <NumberInput
        ref={ref}
        value={value}
        digitizeValue={(currentValue, setSignValues, setDigitValues) => {
          const clamped = MathUtils.clamp(Math.round(currentValue), 0, 999);

          setDigitValues[0](Math.trunc(clamped / 1e2), true);
          setDigitValues[1](Math.trunc((clamped % 1e2) / 1e1), true);
          setDigitValues[2](clamped % 1e1, true);
        }}
        renderInactiveValue={currentValue => {
          const valueText = MathUtils.clamp(currentValue, 0, 999).toFixed(0);
          const leadingZeroCount = 3 - valueText.length;

          return (
            <div class='fms-speed-dialog-input-inactive-value fms-speed-dialog-input-ias-inactive-value'>
              <span class='visibility-hidden'>{('').padStart(leadingZeroCount, '0')}</span>
              <span class='fms-speed-dialog-input-inactive-value-text'>
                {valueText}
                <span class='numberunit-unit-small'>KT</span>
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
        <div class='numberunit-unit-small'>KT</div>
      </NumberInput>
    );
  }

  /**
   * Renders this dialog's mach value input.
   * @param ref The reference to which to assign the rendered input.
   * @param value The value to bind to the rendered input.
   * @param isVisible A subscribable to which to bind the visibility of the rendered input.
   * @returns This dialog's mach value input, as a VNode.
   */
  private renderMachInput(ref: NodeReference<NumberInput>, value: MutableSubscribable<number>, isVisible: Subscribable<boolean>): VNode {
    const cssClass = SetSubject.create(['number-dialog-input', 'fms-speed-dialog-input', 'fms-speed-dialog-input-mach']);

    isVisible.sub(val => { cssClass.toggle('hidden', !val); }, true);

    return (
      <NumberInput
        ref={ref}
        value={value}
        digitizeValue={(currentValue, setSignValues, setDigitValues) => {
          const clamped = MathUtils.clamp(Math.round(currentValue), 0, 999);

          setDigitValues[0](Math.trunc(clamped / 1e2), true);
          setDigitValues[1](Math.trunc((clamped % 1e2) / 1e1), true);
          setDigitValues[2](clamped % 1e1, true);
        }}
        renderInactiveValue={currentValue => {
          return (
            <div class='fms-speed-dialog-input-inactive-value fms-speed-dialog-input-mach-inactive-value fms-speed-dialog-input-inactive-value-text'>
              M {MathUtils.clamp(currentValue / 1000, 0, 0.999).toFixed(3)}
            </div>
          );
        }}
        allowBackFill={true}
        class={cssClass}
      >
        <span>M 0.</span>
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
      </NumberInput>
    );
  }

  /**
   * Renders other contents for the dialog.
   * @returns The other contents.
   */
  protected renderOtherContents(): VNode {
    return (
      <div class='gtc-panel fms-speed-dialog-mode-panel'>
        <div class='gtc-panel-title'>Mode</div>
        <GtcSetValueTouchButton
          state={this.unitMode}
          setValue={SpeedUnit.IAS}
          label='KT'
          onPressed={() => {
            this.unitMode.set(SpeedUnit.IAS);
            this.resetActiveInput('ias', 0, true);
          }}
        />
        <GtcSetValueTouchButton
          state={this.unitMode}
          setValue={SpeedUnit.MACH}
          label='Mach'
          onPressed={() => {
            this.unitMode.set(SpeedUnit.MACH);
            this.resetActiveInput('mach', 0, true);
          }}
        />
      </div>
    );
  }
}