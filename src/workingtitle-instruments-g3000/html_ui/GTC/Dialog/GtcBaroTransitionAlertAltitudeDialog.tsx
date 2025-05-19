import {
  FSComponent, MathUtils, MutableSubscribable, NodeReference, SetSubject, Subject, Subscribable, Unit, UnitFamily,
  UnitType, VNode,
} from '@microsoft/msfs-sdk';

import { DigitInputSlot } from '../Components/NumberInput/DigitInputSlot';
import { NumberInput } from '../Components/NumberInput/NumberInput';
import { GtcTouchButton } from '../Components/TouchButton/GtcTouchButton';
import { GtcViewProps } from '../GtcService/GtcView';
import { AbstractGtcNumberDialog, GtcNumberDialogInput, GtcNumberDialogInputDefinition } from './AbstractGtcNumberDialog';
import { GtcDialogs } from './GtcDialogs';

import './GtcBaroTransitionAlertAltitudeDialog.css';

/**
 * A request input for {@link GtcBaroTransitionAlertAltitudeDialog}.
 */
export interface GtcBaroTransitionAlertAltitudeDialogInput extends GtcNumberDialogInput {
  /**
   * The initial altitude unit. If not defined, then the initial unit will default to a value based on the units mode.
   */
  initialUnit?: Unit<UnitFamily.Distance>;

  /** Whether the dialog should operate in units of feet, meters, or flight level. */
  unitsMode: 'feet' | 'meters' | 'flightlevel';

  /** Whether the dialog's Revert to Published button should be enabled. */
  enableRevert: boolean;

  /**
   * A function that returns the message to display in the dialog that opens when the Revert to Published button is
   * pressed. Not required if the `enableRevert` option is `false`.
   * @returns The message to display in the dialog that opens when the Revert to Published button is pressed.
   */
  revertDialogMessage?: () => string | VNode;

  /** The GTC view title to display with the dialog. */
  title?: string;
}

/**
 * A request result returned by {@link GtcBaroTransitionAlertAltitudeDialog} that defines a user-selected altitude
 * value.
 */
export interface GtcBaroTransitionAlertAltitudeDialogValueOutput {
  /** The type of this result. */
  type: 'value';

  /** The selected altitude. */
  value: number;

  /** The unit type of the selected altitude. */
  unit: Unit<UnitFamily.Distance>;
}

/**
 * A request result returned by {@link GtcBaroTransitionAlertAltitudeDialog} that indicates the user opted to revert
 * the altitude to the published altitude.
 */
export interface GtcBaroTransitionAlertAltitudeDialogRevertOutput {
  /** The type of this result. */
  type: 'revert';
}

/**
 * A request output returned by {@link GtcBaroTransitionAlertAltitudeDialog}.
 */
export type GtcBaroTransitionAlertAltitudeDialogOutput
  = GtcBaroTransitionAlertAltitudeDialogValueOutput
  | GtcBaroTransitionAlertAltitudeDialogRevertOutput;

/**
 * A definition for a {@link NumberInput} used in a {@link GtcBaroTransitionAlertAltitudeDialog}.
 */
interface GtcBaroTransitionAlertAltitudeDialogInputDefinition extends GtcNumberDialogInputDefinition {
  /** The unit type associated with this definition's input. */
  readonly unit: Unit<UnitFamily.Distance>;

  /**
   * The scaling factor used to convert this definition's input value to the unit type associated with this
   * definition's input.
   */
  readonly valueFactor: number;

  /** The maximum allowed input value for this definition's input. */
  readonly maxValue: number;
}

/**
 * A dialog which allows the user to select a barometric transition alert altitude in feet, meters, or flight level, or
 * to opt to revert to a published altitude.
 */
export class GtcBaroTransitionAlertAltitudeDialog extends AbstractGtcNumberDialog<
  GtcBaroTransitionAlertAltitudeDialogInput,
  GtcBaroTransitionAlertAltitudeDialogOutput,
  GtcBaroTransitionAlertAltitudeDialogInputDefinition
> {

  private readonly isRevertEnabled = Subject.create(false);
  private revertDialogMessage?: () => string | VNode;

  /**
   * Creates a new instance of GtcBaroTransitionAlertAltitudeDialog.
   * @param props The properties of the component.
   */
  public constructor(props: GtcViewProps) {
    super(props);

    const isFeetInputVisible = Subject.create(false);
    this.registerInputDefinition('feet', {
      ref: FSComponent.createRef<NumberInput>(),
      value: Subject.create(0),
      render: (ref, value) => this.renderFeetInput(ref, value, isFeetInputVisible),
      isVisible: isFeetInputVisible,
      unit: UnitType.FOOT,
      valueFactor: 1,
      maxValue: 99980,
    });

    const isMetersInputVisible = Subject.create(false);
    this.registerInputDefinition('meters', {
      ref: FSComponent.createRef<NumberInput>(),
      value: Subject.create(0),
      render: (ref, value) => this.renderMetersInput(ref, value, isMetersInputVisible),
      isVisible: isMetersInputVisible,
      unit: UnitType.METER,
      valueFactor: 1,
      maxValue: 30474,
    });

    const isFlightLevelInputVisible = Subject.create(false);
    this.registerInputDefinition('flightlevel', {
      ref: FSComponent.createRef<NumberInput>(),
      value: Subject.create(0),
      render: (ref, value) => this.renderFlightLevelInput(ref, value, isFlightLevelInputVisible),
      isVisible: isFlightLevelInputVisible,
      unit: UnitType.FOOT,
      valueFactor: 100,
      maxValue: 999,
    });
  }

  /** @inheritDoc */
  protected onRequest(input: GtcBaroTransitionAlertAltitudeDialogInput): void {
    this._title.set(input.title);

    this.isRevertEnabled.set(input.enableRevert);
    this.revertDialogMessage = input.revertDialogMessage;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const initialInputDef = this.inputDefinitions.get(input.unitsMode)!;
    const initialUnit = input.initialUnit ?? initialInputDef.unit;

    const initialValue = MathUtils.clamp(
      initialUnit.convertTo(input.initialValue, initialInputDef.unit) / initialInputDef.valueFactor,
      0,
      initialInputDef.maxValue
    );

    this.resetActiveInput(input.unitsMode, Math.round(initialValue), true);
  }

  /**
   * Responds to when this dialog's Revert to Published button is pressed.
   */
  private async onRevertButtonPressed(): Promise<void> {
    const result = await GtcDialogs.openMessageDialog(
      this.props.gtcService,
      this.revertDialogMessage?.() ?? ''
    );

    if (this.props.gtcService.activeView.get().ref !== this) {
      return;
    }

    if (result) {
      this.resultObject = {
        wasCancelled: false,
        payload: { type: 'revert' }
      };

      this.props.gtcService.goBack();
    }
  }

  /** @inheritDoc */
  protected isValueValid(value: number, activeInputDef: GtcBaroTransitionAlertAltitudeDialogInputDefinition): boolean {
    return value >= 0 && value <= activeInputDef.maxValue;
  }

  /** @inheritDoc */
  protected getInvalidValueMessage(value: number, activeInputDef: GtcBaroTransitionAlertAltitudeDialogInputDefinition): string | VNode {
    return `Invalid Entry\nValue must be between\n0 and ${activeInputDef.maxValue}`;
  }

  /** @inheritDoc */
  protected getPayload(value: number, activeInputDef: GtcBaroTransitionAlertAltitudeDialogInputDefinition): GtcBaroTransitionAlertAltitudeDialogOutput {
    return {
      type: 'value',
      value: value * activeInputDef.valueFactor,
      unit: activeInputDef.unit
    };
  }

  /** @inheritDoc */
  protected onCleanupRequest(): void {
    this.revertDialogMessage = undefined;
  }

  /** @inheritDoc */
  protected getRootCssClassName(): string {
    return 'baro-trans-alert-altitude-dialog';
  }

  /** @inheritDoc */
  protected renderOtherContents(rootCssClassName: string | undefined): VNode | null {
    return (
      <GtcTouchButton
        label={'Revert to\nPublished'}
        isEnabled={this.isRevertEnabled}
        onPressed={this.onRevertButtonPressed.bind(this)}
        class={`${rootCssClassName}-revert-button`}
      />
    );
  }

  /**
   * Renders this dialog's feet value input.
   * @param ref The reference to which to assign the rendered input.
   * @param value The value to bind to the rendered input.
   * @param isVisible A subscribable to which to bind the visibility of the rendered input.
   * @returns This dialog's feet value input, as a VNode.
   */
  private renderFeetInput(ref: NodeReference<NumberInput>, value: MutableSubscribable<number>, isVisible: Subscribable<boolean>): VNode {
    const cssClass = SetSubject.create([
      'number-dialog-input',
      'baro-trans-alert-altitude-dialog-input',
      'baro-trans-alert-altitude-dialog-input-feet'
    ]);

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
            <div class='baro-trans-alert-altitude-dialog-input-inactive-value baro-trans-alert-altitude-dialog-input-feet-inactive-value'>
              <span class='visibility-hidden'>{('').padStart(leadingZeroCount, '0')}</span>
              <span class='baro-trans-alert-altitude-dialog-input-inactive-value-text'>
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
    const cssClass = SetSubject.create([
      'number-dialog-input',
      'baro-trans-alert-altitude-dialog-input',
      'baro-trans-alert-altitude-dialog-input-feet'
    ]);

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
            <div class='baro-trans-alert-altitude-dialog-input-inactive-value baro-trans-alert-altitude-dialog-input-meters-inactive-value'>
              <span class='visibility-hidden'>{('').padStart(leadingZeroCount, '0')}</span>
              <span class='baro-trans-alert-altitude-dialog-input-inactive-value-text'>
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

  /**
   * Renders this dialog's flight level value input.
   * @param ref The reference to which to assign the rendered input.
   * @param value The value to bind to the rendered input.
   * @param isVisible A subscribable to which to bind the visibility of the rendered input.
   * @returns This dialog's meters value input, as a VNode.
   */
  private renderFlightLevelInput(ref: NodeReference<NumberInput>, value: MutableSubscribable<number>, isVisible: Subscribable<boolean>): VNode {
    const cssClass = SetSubject.create([
      'number-dialog-input',
      'baro-trans-alert-altitude-dialog-input',
      'baro-trans-alert-altitude-dialog-input-fl'
    ]);

    isVisible.sub(val => { cssClass.toggle('hidden', !val); }, true);

    return (
      <NumberInput
        ref={ref}
        value={value}
        digitizeValue={(currentValue, setSignValues, setDigitValues): void => {
          const clamped = MathUtils.clamp(Math.round(currentValue), 0, 999);

          setDigitValues[0](Math.trunc(clamped / 1e2), true);
          setDigitValues[1](Math.trunc((clamped % 1e2) / 1e1), true);
          setDigitValues[2](clamped % 1e1, true);
        }}
        renderInactiveValue={currentValue => {
          const valueText = MathUtils.clamp(currentValue, 0, 999).toFixed(0);

          return (
            <div class='baro-trans-alert-altitude-dialog-input-inactive-value baro-trans-alert-altitude-dialog-input-fl-inactive-value'>
              <span class='baro-trans-alert-altitude-dialog-input-inactive-value-text'>
                {`FL${valueText.padStart(3, ' ')}`}
              </span>
            </div>
          );
        }}
        allowBackFill={true}
        class={cssClass}
      >
        <div>FL</div>
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
}
