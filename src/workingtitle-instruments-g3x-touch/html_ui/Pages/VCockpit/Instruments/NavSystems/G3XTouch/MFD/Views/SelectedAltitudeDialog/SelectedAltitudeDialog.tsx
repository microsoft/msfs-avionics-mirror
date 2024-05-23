import {
  ConsumerSubject, FSComponent, MathUtils, MutableSubscribable, NodeReference, ReadonlyFloat64Array,
  Subscription, UserSettingManager, VNode
} from '@microsoft/msfs-sdk';

import { AdcSystemEvents } from '@microsoft/msfs-garminsdk';

import { DigitInputSlot } from '../../../Shared/Components/NumberInput/DigitInputSlot';
import { NumberInput } from '../../../Shared/Components/NumberInput/NumberInput';
import { UiTouchButton } from '../../../Shared/Components/TouchButton/UiTouchButton';
import { G3XTouchFilePaths } from '../../../Shared/G3XTouchFilePaths';
import { G3XSpecialChar } from '../../../Shared/Graphics/Text/G3XSpecialChar';
import { GduUserSettingTypes } from '../../../Shared/Settings/GduUserSettings';
import { UiViewProps } from '../../../Shared/UiSystem/UiView';
import { UiViewSizeMode } from '../../../Shared/UiSystem/UiViewTypes';
import { AbstractSimpleUiNumberDialog } from '../../Dialogs/AbstractSimpleUiNumberDialog';
import { UiNumberDialogInput } from '../../Dialogs/AbstractUiNumberDialog';

import './SelectedAltitudeDialog.css';

/**
 * Component props for {@link SelectedAltitudeDialog}.
 */
export interface SelectedAltitudeDialogProps extends UiViewProps {
  /** A provider of airplane position and heading data. */
  gduSettingManager: UserSettingManager<GduUserSettingTypes>;
}

/**
 * A request input for {@link SelectedAltitudeDialogInput}.
 */
export interface SelectedAltitudeDialogInput extends UiNumberDialogInput {
  /** The minimum valid numeric value allowed by the dialog's input. */
  minimumValue: number;

  /** The maximum valid numeric value allowed by the dialog's input. */
  maximumValue: number;
}

/**
 * A dialog which allows the user to enter a selected altitude reference in feet.
 */
export class SelectedAltitudeDialog extends AbstractSimpleUiNumberDialog<SelectedAltitudeDialogInput, number, SelectedAltitudeDialogProps> {
  private readonly signDigitRef = FSComponent.createRef<DigitInputSlot>();
  private readonly setToCurrentRef = FSComponent.createRef<UiTouchButton>();

  private readonly isAltitudeDataValid = ConsumerSubject.create(null, false).pause();
  private readonly indicatedAlt = ConsumerSubject.create(null, 0).pause();

  private minValue = 0;
  private maxValue = 0;

  private readonly subscriptions: Subscription[] = [
    this.isAltitudeDataValid,
    this.indicatedAlt
  ];

  /** @inheritDoc */
  public onAfterRender(): void {
    super.onAfterRender();

    this.title.set('Select Altitude');
    this.showSignButton.set(true);
    this.backButtonLabel.set('Cancel');
    this.backButtonImgSrc.set(`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_cancel.png`);

    const sub = this.props.uiService.bus.getSubscriber<AdcSystemEvents>();
    this.subscriptions.push(
      this.props.gduSettingManager.getSetting('gduAdcIndex').sub(index => {
        this.isAltitudeDataValid.setConsumer(sub.on(`adc_altitude_data_valid_${index}`));
        this.indicatedAlt.setConsumer(sub.on(`adc_indicated_alt_${index}`));
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

  /** @inheritdoc */
  protected onRequest(input: SelectedAltitudeDialogInput): number {
    this.minValue = input.minimumValue;
    this.maxValue = input.maximumValue;

    // Focus the Enter button.
    this.focusController.setFocusIndex(1);

    return MathUtils.clamp(Math.round(input.initialValue), input.minimumValue, input.maximumValue);
  }

  /** @inheritDoc */
  protected getInvalidValueMessage(): string | VNode {
    const min = Math.ceil(this.minValue);
    const max = Math.floor(this.maxValue);
    return `Invalid Entry\nValue must be between\n${(min)} and ${max}`;
  }

  /** @inheritDoc */
  protected getPayload(value: number): number {
    return value < 10e4 ? value : 10e4 - value;
  }

  /** @inheritDoc */
  protected getRootCssClassName(): string {
    return 'selected-altitude-dialog';
  }

  /** @inheritDoc */
  protected isValueValid(value: number): boolean {
    const signedValue = value < 10e4 ? value : 10e4 - value;
    return signedValue >= this.minValue && signedValue <= this.maxValue;
  }

  /** @inheritDoc */
  protected onBackspacePressed(): void {
    // If the cursor is currently selecting the negative sign, move the cursor one slot to the right before backspacing.
    if (this.inputRef.instance.cursorPosition.get() === 0 && this.value.get() >= 10e4) {
      this.inputRef.instance.placeCursor(1, false);
    }

    this.inputRef.instance.backspace();
  }

  /** @inheritDoc */
  protected onSignPressed(): void {
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

  /**
   * Responds to when this dialog's enter button is pressed.
   */
  private onSetToCurrentPressed(): void {
    this.inputRef.instance.setValue(MathUtils.clamp(Math.round(this.indicatedAlt.get()), this.minValue, this.maxValue));
    this.setBackButtonStyle('cancel');
  }

  /** @inheritDoc */
  protected renderOtherContents(): VNode | null {
    return (
      <UiTouchButton
        ref={this.setToCurrentRef}
        label={'Set To\nCurrent'}
        isEnabled={this.isAltitudeDataValid}
        onPressed={this.onSetToCurrentPressed.bind(this)}
        class='selected-altitude-dialog-current'
      />
    );
  }

  /** @inheritDoc */
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
          <div class='selected-altitude-dialog-input-inactive-value'>
            <span class='visibility-hidden'>{leadingZeroes}</span>
            <span class='selected-altitude-dialog-input-inactive-value-text'>
              {valueText}
              <span class='numberunit-unit-big'>{G3XSpecialChar.Foot}</span>
            </span>
          </div>
        }
        allowBackFill={true}
        class='number-dialog-input selected-altitude-dialog-input'
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
        <div class='numberunit-unit-big'>{G3XSpecialChar.Foot}</div>
      </NumberInput>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.setToCurrentRef.getOrDefault()?.destroy();

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}