import {
  ConsumerSubject, ConsumerValue, FSComponent, MathUtils, MutableSubscribable, NodeReference, ReadonlyFloat64Array,
  Subscription, UserSettingManager, VNode
} from '@microsoft/msfs-sdk';

import { AhrsSystemEvents } from '@microsoft/msfs-garminsdk';

import { DigitInputSlot } from '../../../Shared/Components/NumberInput/DigitInputSlot';
import { NumberInput } from '../../../Shared/Components/NumberInput/NumberInput';
import { UiTouchButton } from '../../../Shared/Components/TouchButton/UiTouchButton';
import { GduUserSettingTypes } from '../../../Shared/Settings/GduUserSettings';
import { UiKnobId } from '../../../Shared/UiSystem/UiKnobTypes';
import { UiViewProps } from '../../../Shared/UiSystem/UiView';
import { UiViewSizeMode } from '../../../Shared/UiSystem/UiViewTypes';
import { AbstractSimpleUiNumberDialog } from '../../Dialogs/AbstractSimpleUiNumberDialog';
import { UiNumberDialogInput } from '../../Dialogs/AbstractUiNumberDialog';

import './SelectedHeadingDialog.css';

/**
 * Component props for {@link SelectedHeadingDialogProps}.
 */
export interface SelectedHeadingDialogProps extends UiViewProps {
  /** A provider of airplane position and heading data. */
  gduSettingManager: UserSettingManager<GduUserSettingTypes>;
}

/**
 * A dialog that allows the user to enter a selected heading value.
 */
export class SelectedHeadingDialog extends AbstractSimpleUiNumberDialog<UiNumberDialogInput, number, SelectedHeadingDialogProps> {
  private readonly setToCurrentRef = FSComponent.createRef<UiTouchButton>();

  private readonly isHeadingDataValid = ConsumerSubject.create(null, false).pause();
  private readonly headingData = ConsumerValue.create(null, 0).pause();

  private readonly subscriptions: Subscription[] = [
    this.isHeadingDataValid,
    this.headingData
  ];

  /** @inheritDoc */
  public onAfterRender(): void {
    super.onAfterRender();

    this.title.set('Select Heading');

    this._knobLabelState.set([
      [UiKnobId.SingleOuter, 'Select Heading'],
      [UiKnobId.SingleInner, 'Select Heading'],
      [UiKnobId.LeftOuter, 'Select Heading'],
      [UiKnobId.LeftInner, 'Select Heading'],
      [UiKnobId.RightOuter, 'Select Heading'],
      [UiKnobId.RightInner, 'Select Heading'],
    ]);

    const sub = this.props.uiService.bus.getSubscriber<AhrsSystemEvents>();
    this.subscriptions.push(
      this.props.gduSettingManager.getSetting('gduAhrsIndex').sub(index => {
        this.isHeadingDataValid.setConsumer(sub.on(`ahrs_heading_data_valid_${index}`));
        this.headingData.setConsumer(sub.on(`ahrs_hdg_deg_${index}`));
      }, false, true)
    );

    this.value.pipe(this.isEnterButtonEnabled, this.isValueValid.bind(this));
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
  protected onRequest(input: UiNumberDialogInput): number {
    const initialValue = MathUtils.clamp(input.initialValue, 0, 360);

    // Focus the Enter button.
    this.focusController.setFocusIndex(1);

    return initialValue;
  }

  /** @inheritDoc */
  protected isValueValid(value: number): boolean {
    return value >= 0 && value <= 360;
  }

  /** @inheritDoc */
  protected getInvalidValueMessage(): string | VNode {
    return 'Invalid Entry\nValue must be between\n0 and 360';
  }

  /** @inheritDoc */
  protected getPayload(value: number): number {
    return value;
  }

  /** @inheritDoc */
  protected getRootCssClassName(): string {
    return 'selected-hdg-dialog';
  }

  /**
   * Responds to when this dialog's 'Set To Current' is pressed.
   */
  private onSetToCurrentPressed(): void {
    const roundedHeading = MathUtils.clamp(Math.round(this.headingData.get()), 0, 360);
    this.inputRef.instance.setValue(roundedHeading === 0 ? 360 : roundedHeading);
    this.setBackButtonStyle('cancel');
  }

  /** @inheritDoc */
  protected renderOtherContents(): VNode | null {
    return (
      <UiTouchButton
        ref={this.setToCurrentRef}
        label={'Set To\nCurrent'}
        isEnabled={this.isHeadingDataValid}
        onPressed={this.onSetToCurrentPressed.bind(this)}
        class='selected-hdg-dialog-current'
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
          const clamped = MathUtils.clamp(Math.round(currentValue), 0, 999);

          setDigitValues[0](Math.trunc((clamped) / 1e1), true);
          setDigitValues[1](clamped % 1e1, true);
        }}
        renderInactiveValue={currentValue => `${MathUtils.clamp(Math.round(currentValue), 0, 999).toString().padStart(3, '0')}°`}
        allowBackFill={true}
        class='number-dialog-input selected-hdg-dialog-input'
      >
        <DigitInputSlot
          characterCount={2}
          minValue={0}
          maxValue={37}
          increment={1}
          wrap={true}
          scale={1e1}
          defaultCharValues={[0, 0]}
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
        <div>°</div>
      </NumberInput>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.setToCurrentRef.getOrDefault()?.destroy();
    super.destroy();
  }
}
