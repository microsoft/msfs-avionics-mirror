import {
  ConsumerSubject, FSComponent, NavRadioIndex, NavRadioTuneEvents, RadioType,
  Subject, Subscribable, VNode
} from '@microsoft/msfs-sdk';

import { FrequencyInput } from '../../../Shared/Components/FrequencyInput/FrequencyInput';
import { NumberPad } from '../../../Shared/Components/NumberPad/NumberPad';
import { NavFindFrequencyDialog } from '../FindFrequencyDialog/NavFindFrequencyDialog/NavFindFrequencyDialog';
import { UiImgTouchButton } from '../../../Shared/Components/TouchButton/UiImgTouchButton';
import { UiValueTouchButton } from '../../../Shared/Components/TouchButton/UiValueTouchButton';
import { G3XTouchFilePaths } from '../../../Shared/G3XTouchFilePaths';
import { RenderedUiViewEntry, UiViewStackLayer } from '../../../Shared/UiSystem/UiViewTypes';
import { AbstractUiView } from '../../../Shared/UiSystem/AbstractUiView';
import { UiDialogResult, UiDialogView } from '../../../Shared/UiSystem/UiDialogView';
import { UiInteractionEvent } from '../../../Shared/UiSystem/UiInteraction';
import { UiKnobId } from '../../../Shared/UiSystem/UiKnobTypes';
import { RadioVolumeShortcutPopup } from '../../../GduDisplay/Gdu460/RadioVolumeShortcutPopup/RadioVolumeShortcutPopup';
import { MfdRadioVolumePopup } from '../MfdRadioVolumePopup/MfdRadioVolumePopup';
import { UiViewProps } from '../../../Shared/UiSystem/UiView';
import { UiViewKeys } from '../../../Shared/UiSystem/UiViewKeys';
import { RadiosConfig } from '../../../Shared/AvionicsConfig/RadiosConfig';
import { G3XNavComControlEvents } from '../../../Shared/NavCom/G3XNavComEventPublisher';

import './NavFrequencyDialog.css';

/**
 * A request input for {@link NavFrequencyDialog}.
 */
export interface NavFrequencyDialogInput {

  /** The index of the NAV radio for which the request is opened. */
  radioIndex: 1 | 2;

  /** The frequency, in hertz, initially loaded into the dialog at the start of the request. */
  initialValue: number;
}

/**
 * A request result returned by {@link NavFrequencyDialog}.
 */
export interface NavFrequencyDialogOutput {
  /** The selected frequency, in hertz. */
  frequency: number;

  /** Whether a frequency transfer was selected. */
  transfer: boolean;
}

/**
 * Component props for {@link ComFrequencyDialog}.
 */
export interface NavFrequencyDialogProps extends UiViewProps {

  /** Radios config. */
  radiosConfig: RadiosConfig;

  /** Whether to use the radio volume shortcut. */
  useRadioVolumeShortcut: Subscribable<boolean>;
}

/**
 * A dialog which allows the user to select a NAV radio frequency.
 */
export class NavFrequencyDialog extends AbstractUiView<NavFrequencyDialogProps> implements UiDialogView<NavFrequencyDialogInput, NavFrequencyDialogOutput> {
  private thisNode?: VNode;

  private readonly inputRef = FSComponent.createRef<FrequencyInput>();
  private readonly enterRef = FSComponent.createRef<UiImgTouchButton>();

  private radioIndex: 1 | 2 = 1;
  private label = Subject.create('');
  private simRadioIndex: NavRadioIndex = 1;

  private readonly inputFreqValue = Subject.create(0);

  private readonly volume = ConsumerSubject.create(null, 1);
  private readonly backButtonLabel = Subject.create('');
  private readonly backButtonImgSrc = Subject.create('');

  private requestIsPending = false;
  private isResumed = false;

  private resolveFunction?: (value: UiDialogResult<NavFrequencyDialogOutput>) => void;
  private resultObject: UiDialogResult<NavFrequencyDialogOutput> = {
    wasCancelled: true,
  };

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this._knobLabelState.set([
      [UiKnobId.SingleOuter, 'Tune Freq'],
      [UiKnobId.SingleInner, 'Tune Freq'],
      [UiKnobId.SingleInnerPush, 'Hold XFER'],
      [UiKnobId.LeftOuter, 'Tune Freq'],
      [UiKnobId.LeftInner, 'Tune Freq'],
      [UiKnobId.LeftInnerPush, 'Hold XFER'],
      [UiKnobId.RightOuter, 'Tune Freq'],
      [UiKnobId.RightInner, 'Tune Freq'],
      [UiKnobId.RightInnerPush, 'Hold XFER']
    ]);

    this.inputRef.instance.isEditingActive.sub(this.onEditingActiveChanged.bind(this));

    this.focusController.setActive(true);
  }

  /** @inheritDoc */
  public request(input: NavFrequencyDialogInput): Promise<UiDialogResult<NavFrequencyDialogOutput>> {
    return new Promise((resolve) => {

      this.closeRequest();

      this.resolveFunction = resolve;
      this.resultObject = {
        wasCancelled: true,
      };

      this.requestIsPending = true;
      this.radioIndex = input.radioIndex;

      const definition = this.props.radiosConfig.navDefinitions[this.radioIndex];

      if (!definition) {
        throw new Error(`Radio definition not found for radio index: ${this.radioIndex}`);
      }

      this.simRadioIndex = definition.simIndex;

      this.label.set(this.props.radiosConfig.navDefinitions.length === 1 ? 'NAV Radio' : `NAV ${this.radioIndex}`);

      this.volume.setConsumer(this.props.uiService.bus.getSubscriber<NavRadioTuneEvents>().on(`nav_volume_${this.simRadioIndex}`));

      this.inputRef.instance.setFrequency(input.initialValue);
      this.inputRef.instance.refresh();

      this.backButtonLabel.set('Back');
      this.backButtonImgSrc.set(`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_back.png`);

      this.enterRef.instance.focusSelf();

      this.openRadioVolumeShortcutIfNeeded();
    });
  }

  /** @inheritDoc */
  public onClose(): void {
    super.onClose();
    this.focusController.clearRecentFocus();
    this.closeRequest();
  }

  /** @inheritDoc */
  public onResume(): void {
    super.onResume();
    this.isResumed = true;
    this.focusController.focusRecent();
    this.volume.resume();
    this.openRadioVolumeShortcutIfNeeded();
  }

  /** @inheritDoc */
  public onPause(): void {
    super.onPause();
    this.isResumed = false;
    this.focusController.removeFocus();
    this.volume.pause();
    this.closeRadioVolumeShortcut();
  }

  /** @inheritdoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    switch (event) {
      case UiInteractionEvent.SingleKnobInnerInc:
      case UiInteractionEvent.SingleKnobInnerDec:
      case UiInteractionEvent.SingleKnobOuterInc:
      case UiInteractionEvent.SingleKnobOuterDec:
      case UiInteractionEvent.LeftKnobInnerInc:
      case UiInteractionEvent.LeftKnobInnerDec:
      case UiInteractionEvent.LeftKnobOuterInc:
      case UiInteractionEvent.LeftKnobOuterDec:
      case UiInteractionEvent.RightKnobInnerInc:
      case UiInteractionEvent.RightKnobInnerDec:
      case UiInteractionEvent.RightKnobOuterInc:
      case UiInteractionEvent.RightKnobOuterDec:
        if (this.inputRef.instance.onUiInteractionEvent(event)) {
          this.backButtonLabel.set('Cancel');
          this.backButtonImgSrc.set(`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_cancel.png`);
        }
        return true;
      case UiInteractionEvent.SingleKnobPressLong:
      case UiInteractionEvent.LeftKnobPressLong:
      case UiInteractionEvent.RightKnobPressLong:
        this.validateValueAndClose(true);
        return true;
    }

    return this.focusController.onUiInteractionEvent(event);
  }

  /**
   * Responds to when the editing state of this dialog's input changes.
   * @param isEditingActive Whether editing is active.
   */
  private onEditingActiveChanged(isEditingActive: boolean): void {
    if (isEditingActive) {
      this.backButtonLabel.set('Cancel');
      this.backButtonImgSrc.set(`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_cancel.png`);
    }
  }

  /**
   * Opens the radio volume shortcut popup if the radio volume shortcut is enabled,
   * this dialog is resumed and a request is pending.
   */
  private openRadioVolumeShortcutIfNeeded(): void {
    const isFullScreenAndMFD = !this.props.uiService.isPaneSplit.get() && this.props.uiService.operatingType.get() === 'MFD';
    if (
      this.props.useRadioVolumeShortcut.get()
      && this.isResumed
      && this.requestIsPending
      && !isFullScreenAndMFD
    ) {
      this.props.uiService.closePfdPopup((popup: RenderedUiViewEntry) => popup.key === UiViewKeys.RadioVolumeShortcutPopup);
      this.props.uiService.openPfdPopup<RadioVolumeShortcutPopup>(UiViewKeys.RadioVolumeShortcutPopup, true).ref.request(
        RadioType.Nav,
        this.radioIndex
      );
    }
  }

  /**
   * Closes the radio volume shortcut popup if it is open.
   */
  private closeRadioVolumeShortcut(): void {
    this.props.uiService.closePfdPopup((popup: RenderedUiViewEntry) => popup.key === UiViewKeys.RadioVolumeShortcutPopup);
  }

  /**
   * Validates the currently selected value, and if valid sets the value to be returned for the currently pending
   * request and closes this dialog.
   * @param transfer Whether a transfer was selected.
   */
  private validateValueAndClose(transfer: boolean): void {
    const frequency = this.inputFreqValue.get();

    if (frequency < 108e6 && frequency >= 118e6) {
      return;
    }

    this.resultObject = {
      wasCancelled: false,
      payload: {
        frequency,
        transfer
      }
    };

    this.props.uiService.goBackMfd();
  }

  /**
   * Clears this dialog's pending request and resolves the pending request Promise if one exists.
   */
  private closeRequest(): void {
    if (this.requestIsPending) {
      this.inputRef.instance.deactivateEditing();
      const resolve = this.resolveFunction;
      this.resolveFunction = undefined;
      this.requestIsPending = false;
      resolve && resolve(this.resultObject);
    }
  }

  /**
   * Responds to when one of this dialog's numeral buttons is pressed.
   * @param value The numeric value of the button that was pressed.
   */
  private onNumberPressed(value: number): void {
    this.inputRef.instance.setSlotCharacterValue(value.toString());
  }

  /**
   * Responds to when this dialog's volume button is pressed.
   */
  private onVolumePressed(): void {
    this.props.uiService.openMfdPopup<MfdRadioVolumePopup>(UiViewStackLayer.Overlay, UiViewKeys.MfdRadioVolumePopup).ref.request(
      RadioType.Nav,
      this.radioIndex
    );
  }

  /**
   * Responds to when this dialog's find button is pressed.
   */
  private async onFindPressed(): Promise<void> {
    if (!this.props.uiService.closeMfdPopup((popup: RenderedUiViewEntry) => popup.key === UiViewKeys.NavFindFrequencyDialog && popup.layer === UiViewStackLayer.Overlay)) {
      const result = await this.props.uiService
        .openMfdPopup<NavFindFrequencyDialog>(UiViewStackLayer.Overlay, UiViewKeys.NavFindFrequencyDialog, false, { popupType: 'slideout-top-full' })
        .ref.request({
          radioIndex: this.radioIndex,
        });

      if (!result.wasCancelled) {
        if (result.payload.name) {
          this.props.uiService.bus
            .getPublisher<G3XNavComControlEvents>()
            .pub('add_saved_frequency', {
              radioType: 'nav',
              frequencyType: 'recent',
              frequency: result.payload.frequency / 1e6, // convert to MHz
              name: result.payload.name
            }, true, false);
        }

        this.resultObject = {
          wasCancelled: false,
          payload: {
            frequency: result.payload.frequency,
            transfer: false
          }
        };
        this.props.uiService.goBackMfd();
      }
    }
  }

  /**
   * Responds to when this dialog's backspace button is pressed.
   */
  private onBackspacePressed(): void {
    this.inputRef.instance.backspace();
  }

  /**
   * Responds to when this dialog's back button is pressed.
   */
  private onBackPressed(): void {
    this.props.uiService.goBackMfd();
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='nav-freq-dialog ui-view-panel'>
        <div class='nav-freq-dialog-title'>{this.label}</div>

        <div class='nav-freq-dialog-input-row'>
          <UiImgTouchButton
            label='Find'
            onPressed={this.onFindPressed.bind(this)}
            class='ui-nav-button'
            imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_find.png`}
          />

          <div class='nav-freq-dialog-input-row-center'>
            <div class='nav-freq-dialog-freq-title'>Standby Frequency</div>
            <FrequencyInput
              ref={this.inputRef}
              radioType={RadioType.Nav}
              frequency={this.inputFreqValue}
              class='nav-freq-dialog-input'
            />
          </div>

          <UiImgTouchButton
            label='Backspace'
            imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_backspace.png`}
            onPressed={this.onBackspacePressed.bind(this)}
            class='ui-nav-button'
          />
        </div>

        <NumberPad
          onNumberPressed={this.onNumberPressed.bind(this)}
          class='nav-freq-dialog-numpad'
        />

        <div class='nav-freq-dialog-middle-row'>
          <UiValueTouchButton
            state={this.volume}
            label='Volume'
            onPressed={this.onVolumePressed.bind(this)}
            class='nav-freq-dialog-volume'
            renderValue={volume => `${volume.toFixed(0)}%`}
          />
        </div>

        <div class='nav-freq-dialog-bottom-row'>
          <UiImgTouchButton
            label={this.backButtonLabel}
            imgSrc={this.backButtonImgSrc}
            onPressed={this.onBackPressed.bind(this)}
            focusController={this.focusController}
            class='ui-nav-button'
          />

          <UiImgTouchButton
            label='XFER'
            onPressed={this.validateValueAndClose.bind(this, true)}
            focusController={this.focusController}
            class='ui-nav-button'
            imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_xfer.png`}
          />

          <UiImgTouchButton
            ref={this.enterRef}
            label='Enter'
            imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_enter.png`}
            onPressed={this.validateValueAndClose.bind(this, false)}
            focusController={this.focusController}
            class='ui-nav-button'
          />
        </div>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.closeRequest();

    this.thisNode && FSComponent.shallowDestroy(this.thisNode);
    this.volume.destroy();

    super.destroy();
  }
}
