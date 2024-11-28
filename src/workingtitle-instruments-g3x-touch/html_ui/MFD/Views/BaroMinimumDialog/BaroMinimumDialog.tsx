import {
  FSComponent, MathUtils, MinimumsMode, MutableSubscribable, NodeReference, VNode
} from '@microsoft/msfs-sdk';

import { MinimumsDataProvider } from '@microsoft/msfs-garminsdk';

import { DigitInputSlot } from '../../../Shared/Components/NumberInput/DigitInputSlot';
import { NumberInput } from '../../../Shared/Components/NumberInput/NumberInput';
import { UiTouchButton } from '../../../Shared/Components/TouchButton/UiTouchButton';
import { G3XTouchFilePaths } from '../../../Shared/G3XTouchFilePaths';
import { G3XSpecialChar } from '../../../Shared/Graphics/Text/G3XSpecialChar';
import { UiKnobId } from '../../../Shared/UiSystem/UiKnobTypes';
import { UiViewProps } from '../../../Shared/UiSystem/UiView';
import { AbstractSimpleUiNumberDialog } from '../../Dialogs/AbstractSimpleUiNumberDialog';
import { UiNumberDialogInput } from '../../Dialogs/AbstractUiNumberDialog';

import './BaroMinimumDialog.css';

/**
 * Component props for {@link BaroMinimumDialog}.
 */
export interface BaroMinimumDialogProps extends UiViewProps {
  /** A provider of minimums data. */
  minimumsDataProvider: MinimumsDataProvider;
}

/**
 * A request result returned by {@link BaroMinimumDialog} indicating the baro minimum altitude should be cleared.
 */
export type BaroMinimumDialogClearOutput = {
  /** Whether to clear the baro minimum altitude and exit baro minimum mode. */
  clear: true;
};

/**
 * A request result returned by {@link BaroMinimumDialog} indicating a selected baro minimum altitude.
 */
export type BaroMinimumDialogSelectOutput = {
  /** Whether to clear the baro minimum altitude and exit baro minimum mode. */
  clear: false;

  /** The selected minimum altitude, in feet. */
  value: number;
};

/**
 * A request result returned by {@link BaroMinimumDialog}.
 */
export type BaroMinimumDialogOutput = BaroMinimumDialogClearOutput | BaroMinimumDialogSelectOutput;

/**
 * A dialog which allows the user to enter a barometric minimum altitude.
 */
export class BaroMinimumDialog extends AbstractSimpleUiNumberDialog<UiNumberDialogInput, BaroMinimumDialogOutput, BaroMinimumDialogProps> {
  private readonly clearRef = FSComponent.createRef<UiTouchButton>();

  private readonly showClear = this.props.minimumsDataProvider.mode.map(mode => mode === MinimumsMode.BARO);

  /** @inheritDoc */
  public onAfterRender(): void {
    super.onAfterRender();

    this.title.set('Minimum Altitude');
    this.backButtonLabel.set('Cancel');
    this.backButtonImgSrc.set(`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_cancel.png`);

    this._knobLabelState.set([
      [UiKnobId.SingleOuter, 'Minimum Altitude'],
      [UiKnobId.SingleInner, 'Minimum Altitude'],
      [UiKnobId.LeftOuter, 'Minimum Altitude'],
      [UiKnobId.LeftInner, 'Minimum Altitude'],
      [UiKnobId.RightOuter, 'Minimum Altitude'],
      [UiKnobId.RightInner, 'Minimum Altitude'],
    ]);
  }

  /** @inheritDoc */
  protected onRequest(input: UiNumberDialogInput): number {
    const initialValue = MathUtils.clamp(input.initialValue, 0, 99999);

    // Focus the Enter button.
    this.focusController.setFocusIndex(1);

    return initialValue;
  }

  /** @inheritDoc */
  protected isValueValid(value: number): boolean {
    return value >= 0 && value <= 99999;
  }

  /** @inheritDoc */
  protected getInvalidValueMessage(): string | VNode {
    return 'Invalid Entry\nValue must be between\n0 and 99999';
  }

  /** @inheritDoc */
  protected getPayload(value: number): BaroMinimumDialogOutput {
    return {
      clear: false,
      value
    };
  }

  /** @inheritDoc */
  protected getRootCssClassName(): string {
    return 'baro-minimum-dialog';
  }

  /**
   * Responds to when this dialog's clear button is pressed.
   */
  private onClearPressed(): void {
    this.resultObject = {
      wasCancelled: false,
      payload: {
        clear: true
      }
    };
    this.props.uiService.goBackMfd();
  }

  /** @inheritDoc */
  protected renderOtherContents(): VNode | null {
    return (
      <UiTouchButton
        ref={this.clearRef}
        label='Clear'
        isVisible={this.showClear}
        onPressed={this.onClearPressed.bind(this)}
        class='baro-minimum-dialog-clear'
      />
    );
  }

  /** @inheritDoc */
  protected renderInput(ref: NodeReference<NumberInput>, value: MutableSubscribable<number>): VNode {
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
          const valueText = MathUtils.clamp(Math.round(currentValue), 0, 99999).toFixed(0);
          const leadingZeroCount = 5 - valueText.length;

          return (
            <div class='baro-minimum-dialog-input-inactive-value'>
              <span class='visibility-hidden'>{('').padStart(leadingZeroCount, '0')}</span>
              <span class='baro-minimum-dialog-input-inactive-value-text'>
                {valueText}
                <span class='numberunit-unit-big'>{G3XSpecialChar.Foot}</span>
              </span>
            </div>
          );
        }}
        allowBackFill={true}
        class='number-dialog-input baro-minimum-dialog-input'
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
        <div class='numberunit-unit-big'>{G3XSpecialChar.Foot}</div>
      </NumberInput>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.clearRef.getOrDefault()?.destroy();

    this.showClear.destroy();

    super.destroy();
  }
}
