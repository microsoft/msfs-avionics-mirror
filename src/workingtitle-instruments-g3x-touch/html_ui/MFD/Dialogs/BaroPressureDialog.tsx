import {
  AdcEvents, AeroMath, ConsumerSubject, ConsumerValue, FSComponent, MappedSubject, MathUtils, MutableSubscribable,
  NodeReference, ReadonlyFloat64Array, SetSubject, Subject, Subscribable, Subscription, Unit, UnitFamily, UnitType,
  UserSettingManager, VNode,
} from '@microsoft/msfs-sdk';

import { AdcSystemEvents, FmsPositionMode, FmsPositionSystemEvents } from '@microsoft/msfs-garminsdk';

import { DigitInputSlot } from '../../Shared/Components/NumberInput/DigitInputSlot';
import { NumberInput } from '../../Shared/Components/NumberInput/NumberInput';
import { UiTouchButton } from '../../Shared/Components/TouchButton/UiTouchButton';
import { G3XSpecialChar } from '../../Shared/Graphics/Text/G3XSpecialChar';
import { GduUserSettingTypes } from '../../Shared/Settings/GduUserSettings';
import { UiViewProps } from '../../Shared/UiSystem/UiView';
import { UiViewSizeMode } from '../../Shared/UiSystem/UiViewTypes';
import { AbstractUiNumberDialog, UiNumberDialogInput, UiNumberDialogInputDefinition } from './AbstractUiNumberDialog';

import './BaroPressureDialog.css';

/**
 * Component props for {@link BaroPressureDialog}.
 */
export interface BaroPressureDialogProps extends UiViewProps {
  /** A provider of airplane position and heading data. */
  gduSettingManager: UserSettingManager<GduUserSettingTypes>;
}

/**
 * A request input for {@link BaroPressureDialog}.
 */
export interface BaroPressureDialogInput extends UiNumberDialogInput {
  /**
   * The initial pressure unit. If not defined, the initial unit will default to a value based on the units mode.
   */
  initialUnit?: Unit<UnitFamily.Pressure>;

  /** Whether the dialog should operate in units of inches of mercury, hectopascals, or millibars. */
  unitsMode: 'inhg' | 'hpa' | 'mb';

  /** The minimum valid numeric value allowed by the dialog's input. */
  minimumValue: number;

  /** The maximum valid numeric value allowed by the dialog's input. */
  maximumValue: number;

  /** The title to display with the dialog. */
  title: string;

  /** Whether to show the Set To Standard/Set For Field button. */
  showSetToButton: boolean;
}

/**
 * A request result returned by {@link BaroPressureDialog}.
 */
export interface BaroPressureDialogOutput {
  /** The selected pressure. */
  value: number;

  /** The unit type of the selected pressure. */
  unit: Unit<UnitFamily.Pressure>;
}

/**
 * A definition for a `NumberInput` used in a {@link BaroPressureDialog}.
 */
interface BaroPressureDialogInputDefinition extends UiNumberDialogInputDefinition {
  /** The unit type associated with this definition's input. */
  readonly unit: Unit<UnitFamily.Pressure>;

  /** The scaling factor used by this definition's input to represent the dialog's numeric values. */
  readonly factor: number;

  /** A function which formats minimum/maximum values used by this definition's input. */
  readonly formatter: (value: number) => string;

  /** The value of standard pressure in this definition's unit type. */
  readonly std: number;
}

/**
 * A dialog which allows the user to enter a barometric pressure in inches of mercury, hectopascals, or millibars.
 */
export class BaroPressureDialog extends AbstractUiNumberDialog<
  BaroPressureDialogInput,
  BaroPressureDialogOutput,
  BaroPressureDialogInputDefinition,
  BaroPressureDialogProps
> {

  private readonly setToButtonRef = FSComponent.createRef<UiTouchButton>();

  private readonly isOnGround = ConsumerSubject.create(null, false).pause();

  private readonly isAltitudeDataValid = ConsumerSubject.create(null, false).pause();
  private readonly pressureAltitude = ConsumerValue.create(null, 0).pause();

  private readonly fmsPosMode = ConsumerSubject.create(null, FmsPositionMode.None);
  private readonly ppos = ConsumerValue.create(null, new LatLongAlt(0, 0, 0));

  private readonly isSetToButtonVisible = Subject.create(false);
  private readonly isSetToButtonEnabled = MappedSubject.create(
    ([isOnGround, isPressureDataValid, fmsPosMode]) => !isOnGround || (isPressureDataValid && fmsPosMode !== FmsPositionMode.None),
    this.isOnGround,
    this.isAltitudeDataValid,
    this.fmsPosMode
  );
  private readonly setToButtonLabel = this.isOnGround.map(isOnGround => isOnGround ? 'Set For\nField' : 'Set To\nStandard');

  private minValue = 0;
  private maxValue = 0;

  private readonly subscriptions: Subscription[] = [
    this.isOnGround,
    this.isAltitudeDataValid,
    this.pressureAltitude,
    this.fmsPosMode,
    this.ppos
  ];

  /** @inheritdoc */
  public constructor(props: BaroPressureDialogProps) {
    super(props);

    const isInhgInputVisible = Subject.create(false);
    this.registerInputDefinition('inhg', {
      ref: FSComponent.createRef<NumberInput>(),
      value: Subject.create(0),
      render: (ref, value) => this.renderInhgInput(ref, value, isInhgInputVisible),
      isVisible: isInhgInputVisible,
      unit: UnitType.IN_HG,
      factor: 100,
      formatter: value => value.toFixed(2),
      std: 29.92
    });

    const isHpaInputVisible = Subject.create(false);
    this.registerInputDefinition('hpa', {
      ref: FSComponent.createRef<NumberInput>(),
      value: Subject.create(0),
      render: (ref, value) => this.renderMetricInput(ref, value, isHpaInputVisible, 'hpa'),
      isVisible: isHpaInputVisible,
      unit: UnitType.HPA,
      factor: 1,
      formatter: value => value.toFixed(0),
      std: 1013
    });

    const isMbInputVisible = Subject.create(false);
    this.registerInputDefinition('mb', {
      ref: FSComponent.createRef<NumberInput>(),
      value: Subject.create(0),
      render: (ref, value) => this.renderMetricInput(ref, value, isMbInputVisible, 'mb'),
      isVisible: isMbInputVisible,
      unit: UnitType.MB,
      factor: 1,
      formatter: value => value.toFixed(0),
      std: 1013
    });
  }

  /** @inheritDoc */
  public onAfterRender(): void {
    super.onAfterRender();

    const sub = this.props.uiService.bus.getSubscriber<AdcEvents & AdcSystemEvents & FmsPositionSystemEvents>();

    this.isOnGround.setConsumer(sub.on('on_ground'));

    this.fmsPosMode.setConsumer(sub.on(`fms_pos_mode_${this.props.uiService.instrumentIndex}`));
    this.ppos.setConsumer(sub.on(`fms_pos_gps-position_${this.props.uiService.instrumentIndex}`));

    this.subscriptions.push(
      this.props.gduSettingManager.getSetting('gduAdcIndex').sub(index => {
        this.isAltitudeDataValid.setConsumer(sub.on(`adc_altitude_data_valid_${index}`));
        this.pressureAltitude.setConsumer(sub.on(`adc_pressure_alt_${index}`));
      }, false, true)
    );
  }

  /** @inheritDoc */
  public onOpen(sizeMode: UiViewSizeMode, dimensions: ReadonlyFloat64Array): void {
    super.onOpen(sizeMode, dimensions);

    for (const sub of this.subscriptions) {
      sub.resume(true);
    }
  }

  /** @inheritDoc */
  public onClose(): void {
    super.onClose();

    for (const sub of this.subscriptions) {
      sub.pause();
    }
  }

  /** @inheritDoc */
  protected onRequest(input: BaroPressureDialogInput): void {
    this.title.set(input.title);
    this.isSetToButtonVisible.set(input.showSetToButton);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const initialInputDef = this.inputDefinitions.get(input.unitsMode)!;
    const initialUnit = input.initialUnit ?? initialInputDef.unit;

    const initialValue = MathUtils.clamp(initialUnit.convertTo(input.initialValue, initialInputDef.unit), input.minimumValue, input.maximumValue);

    this.minValue = input.minimumValue;
    this.maxValue = input.maximumValue;

    const factor = this.inputDefinitions.get(input.unitsMode)?.factor ?? 1;

    this.resetActiveInput(input.unitsMode, Math.round(initialValue * factor), true);
  }

  /** @inheritDoc */
  protected isValueValid(value: number, activeInputDef: BaroPressureDialogInputDefinition): boolean {
    return value >= this.minValue * activeInputDef.factor && value <= this.maxValue * activeInputDef.factor;
  }

  /** @inheritDoc */
  protected getInvalidValueMessage(value: number, activeInputDef: BaroPressureDialogInputDefinition): string | VNode {
    return `Invalid Entry\nValue must be between\n${activeInputDef.formatter(this.minValue)} and ${activeInputDef.formatter(this.maxValue)}`;
  }

  /** @inheritDoc */
  protected getPayload(value: number, activeInputDef: BaroPressureDialogInputDefinition): BaroPressureDialogOutput {
    return {
      value: value / activeInputDef.factor,
      unit: activeInputDef.unit
    };
  }

  /** @inheritDoc */
  protected getRootCssClassName(): string {
    return 'baro-pressure-dialog';
  }

  /**
   * Responds to when this dialog's Set To Standard/Set For Field button is pressed.
   */
  private onSetToButtonPressed(): void {
    if (!this.activeInputDef) {
      return;
    }

    let pressureToSet: number;

    if (this.isOnGround.get()) {
      if (!this.isAltitudeDataValid.get() || this.fmsPosMode.get() === FmsPositionMode.None) {
        return;
      }

      const gpsAlt = this.ppos.get().alt;
      const pressureAlt = UnitType.FOOT.convertTo(this.pressureAltitude.get(), UnitType.METER);

      pressureToSet = this.activeInputDef.unit.convertFrom(AeroMath.altitudeOffsetBaroPressure(gpsAlt - pressureAlt), UnitType.HPA);
    } else {
      pressureToSet = this.activeInputDef.std;
    }

    const valueToSet = Math.round(MathUtils.clamp(pressureToSet, this.minValue, this.maxValue) * this.activeInputDef.factor);
    this.activeInputDef.ref.instance.setValue(valueToSet);
    this.setBackButtonStyle('cancel');
    this.validateValueAndClose();
  }

  /** @inheritDoc */
  protected renderOtherContents(): VNode | null {
    return (
      <UiTouchButton
        ref={this.setToButtonRef}
        label={this.setToButtonLabel}
        isVisible={this.isSetToButtonVisible}
        isEnabled={this.isSetToButtonEnabled}
        onPressed={this.onSetToButtonPressed.bind(this)}
        focusController={this.focusController}
        class={'baro-pressure-dialog-set-to'}
      />
    );
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
                <span class='numberunit-unit-big'>{G3XSpecialChar.InHg}</span>
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
        <div class='numberunit-unit-big'>{G3XSpecialChar.InHg}</div>
      </NumberInput>
    );
  }

  /**
   * Renders one of this dialog's metric value inputs.
   * @param ref The reference to which to assign the rendered input.
   * @param value The value to bind to the rendered input.
   * @param isVisible A subscribable to which to bind the visibility of the rendered input.
   * @param unit The unit type to use for the input.
   * @returns A metric value input, as a VNode.
   */
  private renderMetricInput(
    ref: NodeReference<NumberInput>,
    value: MutableSubscribable<number>,
    isVisible: Subscribable<boolean>,
    unit: 'hpa' | 'mb'
  ): VNode {
    const cssClass = SetSubject.create(['number-dialog-input', 'baro-pressure-dialog-input', `baro-pressure-dialog-input-${unit}`]);

    isVisible.sub(val => { cssClass.toggle('hidden', !val); }, true);

    const unitChar = unit === 'hpa' ? G3XSpecialChar.Hectopascal : G3XSpecialChar.Millibar;

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
                <span class='numberunit-unit-big'>{unitChar}</span>
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
        <div class='numberunit-unit-big'>{unitChar}</div>
      </NumberInput>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.setToButtonRef.getOrDefault()?.destroy();

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}