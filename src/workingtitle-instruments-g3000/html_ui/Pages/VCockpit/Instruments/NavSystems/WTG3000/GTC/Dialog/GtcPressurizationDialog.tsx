import { FSComponent, MathUtils, MutableSubscribable, NodeReference, Subject, Unit, UnitFamily, UnitType, VNode } from '@microsoft/msfs-sdk';
import { DigitInputSlot } from '../Components/NumberInput/DigitInputSlot';
import { NumberInput } from '../Components/NumberInput/NumberInput';
import { GtcTouchButton } from '../Components/TouchButton/GtcTouchButton';
import { GtcViewProps } from '../GtcService/GtcView';
import { GtcNumberDialogInput } from './AbstractGtcNumberDialog';
import { AbstractSimpleGtcNumberDialog } from './AbstractSimpleGtcNumberDialog';

import './GtcPressurizationDialog.css';

/**
 * A request result returned by {@link GtcPressurizationDialog} that defines a selected altitude.
 */
export interface GtcPressurizationDialogAltitudeOutput {
  /** The numeric value of the selected altitude. */
  altitude: number;

  /** The unit type of the selected altitude. */
  altitudeUnit: Unit<UnitFamily.Distance>;
}

/**
 * A request result returned by {@link GtcPressurizationDialog}.
 */
export type GtcPressurizationDialogOutput = GtcPressurizationDialogAltitudeOutput | 'use-fms-destination';

/**
 * A request input for {@link GtcPressurizationDialog}.
 */
export interface GtcPressurizationDialogInput extends GtcNumberDialogInput {
  /** The type of dialog to use. */
  type: 'landing' | 'cabin';

  /**
   * The initial altitude unit. If not defined, the initial unit will default to a value based on the units mode.
   */
  initialUnit?: Unit<UnitFamily.Distance>;

  /** Whether the dialog should operate in units of feet or meters. */
  unitsMode: 'feet' | 'meters';
}

/**
 * A dialog which allows the user to select a landing elevation or cabin pressurization altitude.
 */
export class GtcPressurizationDialog extends AbstractSimpleGtcNumberDialog<GtcPressurizationDialogInput, GtcPressurizationDialogOutput> {

  private static readonly UNIT_MODE_PARAMS = {
    ['feet']: {
      min: -1000,
      max: 14000,
      unit: UnitType.FOOT,
      unitText: 'FT'
    },
    ['meters']: {
      min: -305,
      max: 4267,
      unit: UnitType.METER,
      unitText: 'M'
    }
  };

  private readonly signDigitRef = FSComponent.createRef<DigitInputSlot>();
  private readonly fmsButtonRef = FSComponent.createRef<GtcTouchButton>();

  private readonly unitText = Subject.create('');

  private unitsMode: 'feet' | 'meters' = 'feet';
  private useFmsDestinationPressed = false;

  /**
   * Creates an instance of a GtcPressurizationDialog.
   * @param props The props for this component.
   */
  constructor(props: GtcViewProps) {
    super(props);

    this.showSignButton.set(true);
  }

  /** @inheritdoc */
  protected override onRequest(input: GtcPressurizationDialogInput): number {
    this.useFmsDestinationPressed = false;

    if (input.type === 'cabin') {
      this.rootCssClass.delete('pressurization-dialog-ldg-elev');
      this.rootCssClass.add('pressurization-dialog-cabin-alt');
      this._title.set('Cabin Altitude');
    } else {
      this.rootCssClass.add('pressurization-dialog-ldg-elev');
      this.rootCssClass.delete('pressurization-dialog-cabin-alt');
      this._title.set('Landing Elevation');
    }

    this.unitsMode = input.unitsMode;

    const unitModeParams = GtcPressurizationDialog.UNIT_MODE_PARAMS[input.unitsMode];
    const initialUnit = input.initialUnit ?? unitModeParams.unit;

    this.unitText.set(unitModeParams.unitText);

    const initialValue = MathUtils.clamp(initialUnit.convertTo(input.initialValue, unitModeParams.unit), unitModeParams.min, unitModeParams.max);

    return initialValue < 0 ? 10e4 - initialValue : initialValue;
  }

  /** @inheritdoc */
  protected getInvalidValueMessage(): string | VNode {
    const params = GtcPressurizationDialog.UNIT_MODE_PARAMS[this.unitsMode];
    return `Invalid Entry\nValue must be between\n${params.min} and ${params.max}`;
  }

  /** @inheritdoc */
  protected getPayload(value: number): GtcPressurizationDialogOutput {
    const payload = this.useFmsDestinationPressed
      ? 'use-fms-destination'
      : {
        altitude: this.useFmsDestinationPressed ? 0 : value < 10e4 ? value : 10e4 - value,
        altitudeUnit: GtcPressurizationDialog.UNIT_MODE_PARAMS[this.unitsMode].unit
      };

    return payload;
  }

  /** @inheritdoc */
  protected getRootCssClassName(): string {
    return 'pressurization-dialog';
  }

  /** @inheritdoc */
  protected override isValueValid(value: number): boolean {
    if (this.useFmsDestinationPressed) {
      return true;
    }

    const params = GtcPressurizationDialog.UNIT_MODE_PARAMS[this.unitsMode];
    const signedValue = value < 10e4 ? value : 10e4 - value;
    return signedValue >= params.min && signedValue <= params.max;
  }

  /** @inheritdoc */
  protected override onBackspacePressed(): void {
    // If the cursor is currently selecting the negative sign, move the cursor one slot to the right before backspacing.
    if (this.inputRef.instance.cursorPosition.get() === 0 && this.value.get() >= 10e4) {
      this.inputRef.instance.placeCursor(1, false);
    }

    this.inputRef.instance.backspace();
  }

  /** @inheritdoc */
  protected override onSignPressed(): void {
    if (!this.inputRef.instance.isEditingActive.get()) {
      this.inputRef.instance.backspace();
    }

    if (this.value.get() < 10e4) {
      // Value is currently positive.
      this.signDigitRef.instance.setChar(0, '10');
    } else {
      // Value is currently negative.
      this.signDigitRef.instance.setChar(0, null);
    }
  }

  /** @inheritdoc */
  protected override renderOtherContents(): VNode | null {
    return (
      <GtcTouchButton
        ref={this.fmsButtonRef}
        label='Use FMS<br>Destination'
        onPressed={() => {
          this.useFmsDestinationPressed = true;
          this.validateValueAndClose();
        }}
        class='pressurization-dialog-use-fms-dest'
      />
    );
  }

  /** @inheritdoc */
  protected renderInput(ref: NodeReference<NumberInput>, value: MutableSubscribable<number>): VNode {
    const valueText = value.map(currentValue => {
      const clamped = MathUtils.clamp(Math.round(Math.abs(currentValue)), 0, 109999);

      if (clamped < 10e4) {
        return clamped.toString();
      } else {
        return `−${clamped - 10e4}`;
      }
    });
    const leadingZeroes = valueText.map(text => ('').padStart(5 - text.length, '0'));

    return (
      <NumberInput
        ref={ref}
        value={value}
        digitizeValue={(currentValue, setSignValues, setDigitValues): void => {
          const clamped = MathUtils.clamp(Math.round(Math.abs(currentValue)), 0, 109999);

          setDigitValues[0](Math.trunc(clamped / 1e4), true);
          setDigitValues[1](Math.trunc((clamped % 1e4) / 1e3), true);
          setDigitValues[2](Math.trunc((clamped % 1e3) / 1e2), true);
          setDigitValues[3](Math.trunc((clamped % 1e2) / 1e1), true);
          setDigitValues[4](clamped % 1e1, true);
        }}
        renderInactiveValue={
          <div class='pressurization-dialog-input-inactive-value'>
            <span class='visibility-hidden'>{leadingZeroes}</span>
            <span class='pressurization-dialog-input-inactive-value-text'>
              {valueText}
              <span class='numberunit-unit-small'>{this.unitText}</span>
            </span>
          </div>
        }
        allowBackFill={true}
        class='number-dialog-input pressurization-dialog-input'
      >
        <DigitInputSlot
          ref={this.signDigitRef}
          characterCount={1}
          minValue={0}
          maxValue={11}
          increment={1}
          wrap={true}
          scale={1e4}
          defaultCharValues={[0]}
          digitizeValue={(currentValue, setCharacters): void => {
            setCharacters[0]((currentValue / 1e4).toString());
          }}
          renderChar={character => {
            if (character === null) {
              return '0';
            } else if (character === '10') {
              return '−';
            } else {
              return character;
            }
          }}
          allowBackfill={value.map(v => v < 10e4)}
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
        <div class='numberunit-unit-small'>{this.unitText}</div>
      </NumberInput>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.fmsButtonRef.getOrDefault()?.destroy();

    super.destroy();
  }
}