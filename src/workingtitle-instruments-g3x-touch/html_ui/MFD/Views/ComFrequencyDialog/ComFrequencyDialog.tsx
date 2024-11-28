import {
  ComRadioTuneEvents, ComSpacing, ConsumerSubject, FSComponent, NavRadioIndex,
  NodeReference, RadioType, Subject, Subscribable, VNode
} from '@microsoft/msfs-sdk';

import { ChannelSpacing } from '../../../Shared/Components/FrequencyInput/ChannelInputSlot';
import { FrequencyInput } from '../../../Shared/Components/FrequencyInput/FrequencyInput';
import { NumberPad } from '../../../Shared/Components/NumberPad/NumberPad';
import { UiImgTouchButton } from '../../../Shared/Components/TouchButton/UiImgTouchButton';
import { UiToggleTouchButton } from '../../../Shared/Components/TouchButton/UiToggleTouchButton';
import { UiValueTouchButton } from '../../../Shared/Components/TouchButton/UiValueTouchButton';
import { G3XTouchFilePaths } from '../../../Shared/G3XTouchFilePaths';
import { AbstractUiView } from '../../../Shared/UiSystem/AbstractUiView';
import { UiDialogResult, UiDialogView } from '../../../Shared/UiSystem/UiDialogView';
import { UiInteractionEvent } from '../../../Shared/UiSystem/UiInteraction';
import { UiKnobId } from '../../../Shared/UiSystem/UiKnobTypes';
import { MfdRadioVolumePopup } from '../MfdRadioVolumePopup/MfdRadioVolumePopup';
import { RadioVolumeShortcutPopup } from '../../../GduDisplay/Gdu460/RadioVolumeShortcutPopup/RadioVolumeShortcutPopup';
import { ComFindFrequencyDialog } from '../FindFrequencyDialog/ComFindFrequencyDialog/ComFindFrequencyDialog';
import { UiViewProps } from '../../../Shared/UiSystem/UiView';
import { UiViewKeys } from '../../../Shared/UiSystem/UiViewKeys';
import { RenderedUiViewEntry, UiViewStackLayer } from '../../../Shared/UiSystem/UiViewTypes';
import { RadiosConfig } from '../../../Shared/AvionicsConfig/RadiosConfig';
import { G3XNavComControlEvents } from '../../../Shared/NavCom/G3XNavComEventPublisher';

import './ComFrequencyDialog.css';

/**
 * A request input for {@link ComFrequencyDialog}.
 */
export interface ComFrequencyDialogInput {
  /** The channel spacing to use when selecting a frequency. */
  spacing: ComSpacing;

  /** The index of the COM radio for which the request is opened. */
  radioIndex: 1 | 2;

  /** The frequency, in hertz, initially loaded into the dialog at the start of the request. */
  initialValue: number;
}

/**
 * A request result returned by {@link ComFrequencyDialog}.
 */
export interface ComFrequencyDialogOutput {
  /** The selected frequency, in hertz. */
  frequency: number;

  /** Whether a frequency transfer was selected. */
  transfer: boolean;
}

/**
 * A COM frequency dialog context.
 */
type ComFrequencyDialogContext = {
  /** This context's COM spacing type. */
  readonly type: ComSpacing;

  /** A reference to this context's frequency input. */
  readonly inputRef: NodeReference<FrequencyInput>;

  /** This context's frequency value. */
  readonly freqValue: Subject<number>;

  /** Whether this context's frequency input is hidden. */
  readonly hidden: Subject<boolean>;
}

/**
 * Component props for {@link ComFrequencyDialog}.
 */
export interface ComFrequencyDialogProps extends UiViewProps {

  /** Radios config. */
  radiosConfig: RadiosConfig;

  /** Whether to use the radio volume shortcut. */
  useRadioVolumeShortcut: Subscribable<boolean>;
}

/**
 * A dialog which allows the user to select a COM radio frequency.
 */
export class ComFrequencyDialog extends AbstractUiView<ComFrequencyDialogProps> implements UiDialogView<ComFrequencyDialogInput, ComFrequencyDialogOutput> {
  private thisNode?: VNode;

  private readonly enterRef = FSComponent.createRef<UiImgTouchButton>();

  private readonly contexts: Record<ComSpacing, ComFrequencyDialogContext> = {
    [ComSpacing.Spacing25Khz]: {
      type: ComSpacing.Spacing25Khz,
      inputRef: FSComponent.createRef<FrequencyInput>(),
      freqValue: Subject.create(0),
      hidden: Subject.create<boolean>(true)
    },
    [ComSpacing.Spacing833Khz]: {
      type: ComSpacing.Spacing833Khz,
      inputRef: FSComponent.createRef<FrequencyInput>(),
      freqValue: Subject.create(0),
      hidden: Subject.create<boolean>(true)
    },
  };

  private radioIndex: 1 | 2 = 1;
  private label = Subject.create('');
  private simRadioIndex: NavRadioIndex = 1;
  private activeContext?: ComFrequencyDialogContext;

  private readonly volume = ConsumerSubject.create(null, 1);
  private readonly backButtonLabel = Subject.create('');
  private readonly backButtonImgSrc = Subject.create('');

  private requestIsPending = false;
  private isResumed = false;

  private resolveFunction?: (value: UiDialogResult<ComFrequencyDialogOutput>) => void;
  private resultObject: UiDialogResult<ComFrequencyDialogOutput> = {
    wasCancelled: true,
  };

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this._knobLabelState.set([
      [UiKnobId.SingleOuter, 'Tune Freq'],
      [UiKnobId.SingleInner, 'Tune Freq'],
      [UiKnobId.LeftOuter, 'Tune Freq'],
      [UiKnobId.LeftInner, 'Tune Freq'],
      [UiKnobId.RightOuter, 'Tune Freq'],
      [UiKnobId.RightInner, 'Tune Freq'],
      [UiKnobId.RightInnerPush, 'Hold XFER'],
      [UiKnobId.SingleInnerPush, 'Hold XFER'],
      [UiKnobId.LeftInnerPush, 'Hold XFER'],
    ]);

    for (const context of Object.values(this.contexts)) {
      context.inputRef.instance.isEditingActive.sub(isActive => {
        if (context === this.activeContext) {
          this.onEditingActiveChanged(isActive);
        }
      });
    }

    this.focusController.setActive(true);
  }

  /** @inheritDoc */
  public request(input: ComFrequencyDialogInput): Promise<UiDialogResult<ComFrequencyDialogOutput>> {
    return new Promise((resolve) => {

      this.closeRequest();

      this.resolveFunction = resolve;
      this.resultObject = {
        wasCancelled: true,
      };

      this.requestIsPending = true;
      this.radioIndex = input.radioIndex;

      const definition = this.props.radiosConfig.comDefinitions[this.radioIndex];

      if (!definition) {
        throw new Error(`Radio definition not found for radio index: ${this.radioIndex}`);
      }

      this.simRadioIndex = definition.simIndex;

      this.label.set(this.props.radiosConfig.comDefinitions.length === 1 ? 'COM Radio' : `COM ${this.radioIndex}`);

      this.volume.setConsumer(this.props.uiService.bus.getSubscriber<ComRadioTuneEvents>().on(`com_volume_${this.simRadioIndex}`));

      this.activeContext = this.contexts[input.spacing];

      this.activeContext.hidden.set(false);
      this.activeContext.inputRef.instance.setFrequency(input.initialValue);
      this.activeContext.inputRef.instance.refresh();

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

  /** @inheritDoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    switch (event) {
      case UiInteractionEvent.SingleKnobInnerInc:
      case UiInteractionEvent.SingleKnobInnerDec:
      case UiInteractionEvent.SingleKnobOuterInc:
      case UiInteractionEvent.SingleKnobOuterDec:
      case UiInteractionEvent.LeftKnobInnerInc:
      case UiInteractionEvent.LeftKnobOuterInc:
      case UiInteractionEvent.LeftKnobOuterDec:
      case UiInteractionEvent.LeftKnobInnerDec:
      case UiInteractionEvent.RightKnobInnerInc:
      case UiInteractionEvent.RightKnobInnerDec:
      case UiInteractionEvent.RightKnobOuterInc:
      case UiInteractionEvent.RightKnobOuterDec:
        if (this.activeContext?.inputRef.instance.onUiInteractionEvent(event)) {
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
        RadioType.Com,
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
    if (!this.activeContext) {
      return;
    }

    const frequency = this.activeContext?.freqValue.get();

    if (frequency < 118e6 && frequency >= 137e6) {
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
      if (this.activeContext) {
        this.activeContext.inputRef.instance.deactivateEditing();
        this.activeContext.hidden.set(true);
        this.activeContext = undefined;
      }
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
    this.activeContext?.inputRef.instance.setSlotCharacterValue(value.toString());
  }

  /**
   * Responds to when this dialog's find button is pressed.
   */
  private async onFindPressed(): Promise<void> {
    if (this.activeContext && !this.props.uiService.closeMfdPopup(
      (popup: RenderedUiViewEntry) => popup.key === UiViewKeys.ComFindFrequencyDialog && popup.layer === UiViewStackLayer.Overlay)) {
      const result = await this.props.uiService
        .openMfdPopup<ComFindFrequencyDialog>(UiViewStackLayer.Overlay, UiViewKeys.ComFindFrequencyDialog, false, { popupType: 'slideout-top-full' })
        .ref.request({
          radioIndex: this.radioIndex,
          comSpacing: this.activeContext.type,
        });

      if (!result.wasCancelled) {
        if (result.payload.name) {
          this.props.uiService.bus
            .getPublisher<G3XNavComControlEvents>()
            .pub('add_saved_frequency', {
              radioType: 'com',
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
    this.activeContext?.inputRef.instance.backspace();
  }

  /**
   * Responds to when this dialog's back button is pressed.
   */
  private onBackPressed(): void {
    this.props.uiService.goBackMfd();
  }

  /**
   * Responds to when this dialog's volume button is pressed.
   */
  private onVolumePressed(): void {
    this.props.uiService.openMfdPopup<MfdRadioVolumePopup>(UiViewStackLayer.Overlay, UiViewKeys.MfdRadioVolumePopup).ref.request(
      RadioType.Com,
      this.radioIndex
    );
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='com-freq-dialog ui-view-panel'>
        <div class='com-freq-dialog-title'>{this.label}</div>

        <div class='com-freq-dialog-input-row-wrapper'>
          <div class='com-freq-dialog-input-row'>
            <UiImgTouchButton
              label='Find'
              onPressed={this.onFindPressed.bind(this)}
              class='ui-nav-button'
              imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_find.png`}
            />

            <div class='com-freq-dialog-input-row-center'>
              <div class='com-freq-dialog-freq-title'>Standby Frequency</div>

              <FrequencyInput
                ref={this.contexts[ComSpacing.Spacing25Khz].inputRef}
                radioType={RadioType.Com}
                comChannelSpacing={ChannelSpacing.Spacing25Khz}
                frequency={this.contexts[ComSpacing.Spacing25Khz].freqValue}
                class={{ 'com-freq-dialog-input': true, 'hidden': this.contexts[ComSpacing.Spacing25Khz].hidden }}
              />
              <FrequencyInput
                ref={this.contexts[ComSpacing.Spacing833Khz].inputRef}
                radioType={RadioType.Com}
                comChannelSpacing={ChannelSpacing.Spacing8_33Khz}
                frequency={this.contexts[ComSpacing.Spacing833Khz].freqValue}
                class={{ 'com-freq-dialog-input': true, 'hidden': this.contexts[ComSpacing.Spacing833Khz].hidden }}
              />
            </div>

            <UiImgTouchButton
              label='Backspace'
              imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_backspace.png`}
              onPressed={this.onBackspacePressed.bind(this)}
              class='ui-nav-button'
            />
          </div>
        </div>

        <NumberPad
          onNumberPressed={this.onNumberPressed.bind(this)}
          class='com-freq-dialog-numpad'
        />

        <div class='com-freq-dialog-middle-row'>
          <UiToggleTouchButton
            state={Subject.create(false)}
            label='Squelch'
            isEnabled={false}
            class='com-freq-dialog-squelch'
          />

          <UiValueTouchButton
            state={this.volume}
            label='Volume'
            onPressed={this.onVolumePressed.bind(this)}
            class='com-freq-dialog-volume'
            renderValue={volume => `${volume.toFixed(0)}%`}
          />
        </div>

        <div class='com-freq-dialog-bottom-row'>
          <UiImgTouchButton
            label={this.backButtonLabel}
            imgSrc={this.backButtonImgSrc}
            onPressed={this.onBackPressed.bind(this)}
            focusController={this.focusController}
            class='ui-nav-button'
          />

          <UiToggleTouchButton
            state={Subject.create(false)}
            label='Monitor'
            isEnabled={false}
            focusController={this.focusController}
            class='com-freq-dialog-monitor'
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
