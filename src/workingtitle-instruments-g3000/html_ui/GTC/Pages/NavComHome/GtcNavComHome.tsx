import {
  AdcEvents, ComSpacing, ConsumerSubject, ControlEvents, DebounceTimer, FSComponent, MappedSubject, NavComSimVars,
  Publisher, RadioType, SetSubject, SoundPacket, SoundServerControlEvents, Subject, UserSetting, VNode, XPDRMode,
  XPDRSimVarEvents
} from '@microsoft/msfs-sdk';

import { TrafficOperatingModeSetting, TrafficUserSettings } from '@microsoft/msfs-garminsdk';

import { ComRadio, ComRadioReceiveMode, G3000ComRadioUserSettings, G3000RadioUtils, PfdUserSettings } from '@microsoft/msfs-wtg3000-common';

import { ChannelSpacing } from '../../Components/FrequencyInput/ChannelInputSlot';
import { FrequencyInput } from '../../Components/FrequencyInput/FrequencyInput';
import { BgImgTouchButton } from '../../Components/TouchButton/BgImgTouchButton';
import { GtcHorizButtonBackgroundImagePaths, GtcVertButtonBackgroundImagePaths } from '../../Components/TouchButton/GtcButtonBackgroundImagePaths';
import { ImgTouchButton } from '../../Components/TouchButton/ImgTouchButton';
import { RoundTouchButton } from '../../Components/TouchButton/RoundTouchButton';
import { ToggleTouchButton } from '../../Components/TouchButton/ToggleTouchButton';
import { TouchButton } from '../../Components/TouchButton/TouchButton';
import { GtcDialogResult } from '../../Dialog/GtcDialogView';
import { GtcFrequencyDialog, GtcFrequencyDialogInputType, GtcFrequencyDialogResult } from '../../Dialog/GtcFrequencyDialog';
import { GtcHardwareControlEvent, GtcInteractionEvent } from '../../GtcService/GtcInteractionEvent';
import { GtcView, GtcViewProps } from '../../GtcService/GtcView';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';
import { GtcNavComTrafficMapButton } from './GtcNavComTrafficMapButton';
import { GtcNavComUtils } from './GtcNavComUtils';
import { GtcTransponderDialog } from './GtcTransponderDialog';

import '../../Components/TouchButton/NumPadTouchButton.css';
import './GtcNavComHome.css';

enum CssClasses {
  ACTIVE_COLOR = 'active-color',
  AUDIO_LABEL = 'audio-label',
  BLACK_TEXT = 'black-text',
  COM_LABEL = 'com-label',
  COM_LABEL_STBY = 'com-label-stby',
  COM_STBY_BORDER = 'com-standby-border',
  COM_STBY_HIGHLIGHT = 'com-standby-highlight',
  FREQUENCY = 'frequency',
  FREQUENCY_STBY = 'frequency-stby',
  FREQUENCY_STBY_LABEL = 'frequency-stby-label',
  HIDDEN = 'visibility-hidden',
  MIC_TRIANGLE = 'mic-triangle',
  MON_TRIANGLE = 'mon-triangle',
  OPACITY_ZERO = 'zero-opacity',
  SPACING_833 = 'spacing-833',
  STBY_COLOR = 'stby-color',
  TRIANGLE = 'triangle',
  TRIANGLE_1 = 'triangle-1',
  TRIANGLE_2 = 'triangle-2',
  XPDR_CODE = 'xpdr-code',
  XPDR_MODE = 'xpdr-mode',
}

const XPDR_STBY_LABEL_TEXT = 'STBY' as const;

/** Component props for GtcNavComHome. */
export interface GtcNavComHomeProps extends GtcViewProps {
  /** Whether TCAS is supported. */
  tcasIsSupported: boolean;
}

/** NAV/COM Home Page */
export class GtcNavComHome extends GtcView<GtcNavComHomeProps> {
  private static readonly FREQ_SWAP_SOUND_PACKET: SoundPacket = {
    key: 'g3000_com_freq_swap',
    sequence: 'tone_freq_swap',
    continuous: false,
    timeout: 5000
  };

  public override readonly title: Subject<string> = Subject.create('NAV / COM Home');
  private readonly isHrz: boolean = this.props.gtcService.isHorizontal;

  private readonly controlPublisher: Publisher<ControlEvents> = this.bus.getPublisher<ControlEvents>();
  private readonly evtSub = this.bus.getSubscriber<AdcEvents & XPDRSimVarEvents & NavComSimVars>();
  private readonly radioBeingTuned: Subject<ComRadio> = this.props.gtcService.radioBeingTuned; // Which radio is currently being tuned
  private readonly buttonEditingModeIsActive = Subject.create<boolean>(false);
  private readonly inputKnobEditingModeIsActive = Subject.create<boolean>(false);
  private highlightStbyButton = false;
  private readonly knobTurnTimer: DebounceTimer = new DebounceTimer();

  private xpdrModeCode: ConsumerSubject<XPDRMode> = ConsumerSubject.create(this.evtSub.on('xpdr_mode_1'), XPDRMode.STBY);
  private readonly xpdrModeLabel = MappedSubject.create(
    GtcNavComHome.ModeLabelMapper,
    this.xpdrModeCode,
    TrafficUserSettings.getManager(this.bus).getSetting('trafficOperatingMode'),
  );
  private readonly xpdrCode: MappedSubject<[number], string> = MappedSubject.create(
    ([code]: readonly [number]): string => Math.round(code).toString().padStart(4, '0'),
    ConsumerSubject.create(this.evtSub.on('xpdr_code_1'), 0),
  );

  private readonly com1ActiveFreq = ConsumerSubject.create(this.evtSub.on('com_active_frequency_1'), 0);
  private readonly com2ActiveFreq = ConsumerSubject.create(this.evtSub.on('com_active_frequency_2'), 0);
  private readonly com1StbyFreq = ConsumerSubject.create(this.evtSub.on('com_standby_frequency_1'), 0);
  private readonly com2StbyFreq = ConsumerSubject.create(this.evtSub.on('com_standby_frequency_2'), 0);

  private readonly com1Spacing = ConsumerSubject.create(this.evtSub.on('com_spacing_mode_1'), 0)
    .map(GtcNavComHome.SpacingMapper);
  private readonly com2Spacing = ConsumerSubject.create(this.evtSub.on('com_spacing_mode_2'), 0)
    .map(GtcNavComHome.SpacingMapper);

  private readonly com1ActiveFreqDisp = MappedSubject.create(
    GtcNavComHome.ComDigitsMapper, this.com1ActiveFreq, this.com1Spacing);
  private readonly com1StbyFreqDisp = MappedSubject.create(
    GtcNavComHome.ComDigitsMapper, this.com1StbyFreq, this.com1Spacing);
  private readonly com2ActiveFreqDisp = MappedSubject.create(
    GtcNavComHome.ComDigitsMapper, this.com2ActiveFreq, this.com2Spacing);
  private readonly com2StbyFreqDisp = MappedSubject.create(
    GtcNavComHome.ComDigitsMapper, this.com2StbyFreq, this.com2Spacing);
  private readonly com1StbyInputFreq = Subject.create<number>(0);
  private readonly com2StbyInputFreq = Subject.create<number>(0);

  private readonly comRadioSettingManager = G3000ComRadioUserSettings.getManager(this.bus);

  private readonly comTransmitSetting = this.comRadioSettingManager.getSetting('comRadioTransmit');
  private readonly com1ReceiveSetting = this.comRadioSettingManager.getSetting('comRadio1ReceiveMode');
  private readonly com2ReceiveSetting = this.comRadioSettingManager.getSetting('comRadio2ReceiveMode');

  /**
   * Returns the transmitting radio's receiving state.
   * @returns The transmitting radio's receiving state.
   */
  private get currentComReceiveSetting(): UserSetting<ComRadioReceiveMode> {
    return this.comTransmitSetting.get() === 'COM1' ? this.com1ReceiveSetting : this.com2ReceiveSetting;
  }

  /**
   * Returns the currently tunable FrequencyInput instance, based on the selected COM radio and its channel spacing.
   * @returns The currently tunable FrequencyInput instance.
   */
  private get freqInputInstance(): FrequencyInput {
    return (this.radioBeingTuned.get() === 'COM1' ?
      this.com1Spacing.get() === ChannelSpacing.Spacing25Khz ?
        this.freqInput1_25Ref : this.freqInput1_833Ref :
      this.com2Spacing.get() === ChannelSpacing.Spacing25Khz ?
        this.freqInput2_25Ref : this.freqInput2_833Ref
    ).instance;
  }

  /**
   * Returns the currently tunable FrequencyInput value, based on the selected COM radio.
   * @returns The currently tunable FrequencyInput value.
   */
  private get freqInputValue(): Subject<number> {
    return this.radioBeingTuned.get() === 'COM1' ? this.com1StbyInputFreq : this.com2StbyInputFreq;
  }

  /**
   * Returns the currently tunable standby frequency value, based on the selected COM radio.
   * @returns The currently tunable COM standby frequency value.
   */
  private get stbyFreqValue(): ConsumerSubject<number> {
    return this.radioBeingTuned.get() === 'COM1' ? this.com1StbyFreq : this.com2StbyFreq;
  }

  /**
   * Returns the currently tunable standby button "up" background image class set, based on the selected COM radio.
   * @returns The currently tunable standby button "up" background image class set.
   */
  private get stbyUpImgSrc(): Subject<string> {
    return this.radioBeingTuned.get() === 'COM1' ? this.com1StbyFreqUpImgSrc : this.com2StbyFreqUpImgSrc;
  }

  /**
   * Returns whether input cursor editing mode is active.
   * @returns Whether input cursor editing mode is active.
   */
  private get inputCursorEditingModeIsActive(): boolean {
    return this.freqInputInstance.isEditingActive.get();
  }

  private readonly freqInput1_25Ref = FSComponent.createRef<FrequencyInput>();
  private readonly freqInput1_833Ref = FSComponent.createRef<FrequencyInput>();
  private readonly freqInput2_25Ref = FSComponent.createRef<FrequencyInput>();
  private readonly freqInput2_833Ref = FSComponent.createRef<FrequencyInput>();

  private readonly xpdrModeClasses = SetSubject.create<CssClasses>([CssClasses.AUDIO_LABEL, CssClasses.XPDR_MODE]);
  private readonly xpdrCodeClasses = SetSubject.create<CssClasses>([CssClasses.AUDIO_LABEL, CssClasses.XPDR_CODE]);

  private readonly com1ActFreqClasses = SetSubject.create<CssClasses>([CssClasses.FREQUENCY]);
  private readonly com2ActFreqClasses = SetSubject.create<CssClasses>([CssClasses.FREQUENCY]);

  private readonly com1StbyTextLabelClasses =
    SetSubject.create<CssClasses>([CssClasses.COM_LABEL, CssClasses.COM_LABEL_STBY]);
  private readonly com2StbyTextLabelClasses =
    SetSubject.create<CssClasses>([CssClasses.COM_LABEL, CssClasses.COM_LABEL_STBY]);
  private readonly com1StbyFreqLabelClasses =
    SetSubject.create<CssClasses>([CssClasses.FREQUENCY, CssClasses.FREQUENCY_STBY, CssClasses.FREQUENCY_STBY_LABEL]);
  private readonly com2StbyFreqLabelClasses =
    SetSubject.create<CssClasses>([CssClasses.FREQUENCY, CssClasses.FREQUENCY_STBY, CssClasses.FREQUENCY_STBY_LABEL]);

  private readonly com1StbyFreqInput25Classes =
    SetSubject.create<CssClasses>([CssClasses.FREQUENCY, CssClasses.FREQUENCY_STBY, CssClasses.HIDDEN]);
  private readonly com2StbyFreqInput25Classes =
    SetSubject.create<CssClasses>([CssClasses.FREQUENCY, CssClasses.FREQUENCY_STBY, CssClasses.HIDDEN]);
  private readonly com1StbyFreqInput833Classes =
    SetSubject.create<CssClasses>([CssClasses.FREQUENCY, CssClasses.FREQUENCY_STBY, CssClasses.SPACING_833, CssClasses.HIDDEN]);
  private readonly com2StbyFreqInput833Classes =
    SetSubject.create<CssClasses>([CssClasses.FREQUENCY, CssClasses.FREQUENCY_STBY, CssClasses.SPACING_833, CssClasses.HIDDEN]);

  private readonly com1StbyBorderClasses = SetSubject.create<CssClasses>([CssClasses.COM_STBY_BORDER]);
  private readonly com2StbyBorderClasses = SetSubject.create<CssClasses>([CssClasses.COM_STBY_BORDER]);
  private readonly com1StbyHighlightClasses = SetSubject.create<CssClasses>([CssClasses.COM_STBY_HIGHLIGHT, CssClasses.OPACITY_ZERO]);
  private readonly com2StbyHighlightClasses = SetSubject.create<CssClasses>([CssClasses.COM_STBY_HIGHLIGHT, CssClasses.OPACITY_ZERO]);

  private readonly mic1Classes =
    SetSubject.create<CssClasses>([CssClasses.TRIANGLE, CssClasses.MIC_TRIANGLE, CssClasses.TRIANGLE_1]);
  private readonly mic2Classes =
    SetSubject.create<CssClasses>([CssClasses.TRIANGLE, CssClasses.MIC_TRIANGLE, CssClasses.TRIANGLE_2]);
  private readonly mon1Classes =
    SetSubject.create<CssClasses>([CssClasses.TRIANGLE, CssClasses.MON_TRIANGLE, CssClasses.TRIANGLE_1]);
  private readonly mon2Classes =
    SetSubject.create<CssClasses>([CssClasses.TRIANGLE, CssClasses.MON_TRIANGLE, CssClasses.TRIANGLE_2]);

  private readonly com1StbyFreqUpImgSrc = Subject.create(this.isHrz ? GtcHorizButtonBackgroundImagePaths.ComBottomUp : GtcVertButtonBackgroundImagePaths.ComBottomUp);
  private readonly com2StbyFreqUpImgSrc = Subject.create(this.isHrz ? GtcHorizButtonBackgroundImagePaths.ComBottomUp : GtcVertButtonBackgroundImagePaths.ComBottomUp);

  private readonly com1IsReceiving: ConsumerSubject<boolean> = ConsumerSubject.create(this.evtSub.on('com_receive_1'), false);
  private readonly com2IsReceiving: ConsumerSubject<boolean> = ConsumerSubject.create(this.evtSub.on('com_receive_2'), false);

  private static ModeLabelMapper = ([xpdrMode, trafficMode]: readonly [XPDRMode, TrafficOperatingModeSetting]): string => {
    switch (trafficMode) {
      case TrafficOperatingModeSetting.Auto:
        return 'AUTO';
      case TrafficOperatingModeSetting.TAOnly:
        return 'TA Only';
      case TrafficOperatingModeSetting.Standby:
        switch (xpdrMode) {
          case XPDRMode.ALT:
            return 'ALT';
          case XPDRMode.ON:
            return 'ON';
          case XPDRMode.STBY:
            return XPDR_STBY_LABEL_TEXT;
          default:
            return '';
        }
      default:
        return '';
    }
  };

  private static SpacingMapper = (spacing: number): ChannelSpacing.Spacing25Khz | ChannelSpacing.Spacing8_33Khz =>
    spacing === 0 ? ChannelSpacing.Spacing25Khz : ChannelSpacing.Spacing8_33Khz;

  private static ComDigitsMapper = ([freq, spacing]: readonly [number, ChannelSpacing]): string => {
    // Convert to kHz so that all potentially significant digits lie to the left of the decimal point.
    // This prevents floating point rounding errors.
    const freqKhz: number = Math.round(freq * 1e3);
    return spacing === ChannelSpacing.Spacing8_33Khz ?
      (freqKhz / 1000).toFixed(3) :
      // Truncate to 10 kHz
      (Math.trunc(freqKhz / 10) / 100).toFixed(2);
  };

  /** @inheritdoc */
  public onAfterRender(): void {
    // Trigger transponder button text color changes
    if (this.props.tcasIsSupported) {
      this.xpdrCodeClasses.add(CssClasses.STBY_COLOR);
      this.xpdrModeLabel.sub((label: string): void => {
        this.xpdrCodeClasses.toggle(CssClasses.ACTIVE_COLOR, label === XPDR_STBY_LABEL_TEXT);
      });
    } else {
      MappedSubject.create(
        ([xpdrMode, onGround]: readonly [XPDRMode, boolean]): void => {
          const shouldBeGreen: boolean = [XPDRMode.ON, XPDRMode.ALT].includes(xpdrMode) && !onGround;
          this.xpdrModeClasses.toggle(CssClasses.ACTIVE_COLOR, shouldBeGreen);
          this.xpdrCodeClasses.toggle(CssClasses.ACTIVE_COLOR, shouldBeGreen);
        },
        this.xpdrModeCode,
        ConsumerSubject.create(this.evtSub.on('on_ground'), true),
      );
    }

    this.radioBeingTuned.sub((radio: ComRadio): void => {
      // Set cyan standby frequency
      this.com1StbyFreqLabelClasses.toggle(CssClasses.STBY_COLOR, radio === 'COM1');
      this.com2StbyFreqLabelClasses.toggle(CssClasses.STBY_COLOR, radio === 'COM2');
      // Set cyan standby border
      this.com1StbyBorderClasses.toggle(CssClasses.OPACITY_ZERO, radio !== 'COM1' && !this.knobTurnTimer.isPending());
      this.com2StbyBorderClasses.toggle(CssClasses.OPACITY_ZERO, radio !== 'COM2' && !this.knobTurnTimer.isPending());

      // Apply highlight to standby button background
      if (this.highlightStbyButton) {
        this.scheduleStbyHighlightRemovalOrSwap('IMMEDIATE_SWAP');
      }
      this.highlightStbyButton = false;
    }, true);

    this.comTransmitSetting.sub(transmittingRadio => {
      this.changeRadioBeingTuned(transmittingRadio);

      const com1IsTransmitting: boolean = transmittingRadio === 'COM1';
      const com2IsTransmitting: boolean = transmittingRadio === 'COM2';
      this.com1ActFreqClasses.toggle(CssClasses.ACTIVE_COLOR, com1IsTransmitting);
      this.com2ActFreqClasses.toggle(CssClasses.ACTIVE_COLOR, com2IsTransmitting);
      this.mic1Classes.toggle(CssClasses.HIDDEN, !com1IsTransmitting);
      this.mic2Classes.toggle(CssClasses.HIDDEN, !com2IsTransmitting);
    }, true);

    this.com1IsReceiving.sub((com1IsReceiving: boolean): void => {
      this.mon1Classes.toggle(CssClasses.HIDDEN, !com1IsReceiving);
    }, true);
    this.com2IsReceiving.sub((com2IsReceiving: boolean): void => {
      this.mon2Classes.toggle(CssClasses.HIDDEN, !com2IsReceiving);
    }, true);

    this.evtSub.on('com_spacing_mode_1').whenChanged()
      .handle((spacing: ComSpacing): void => {
        this.freqInput1_25Ref.instance.deactivateEditing();
        this.freqInput1_833Ref.instance.deactivateEditing();
        this.buttonEditingModeIsActive.set(false);
        this.com1ActFreqClasses.toggle(CssClasses.SPACING_833, spacing === ComSpacing.Spacing833Khz);
        this.com1StbyFreqLabelClasses.toggle(CssClasses.SPACING_833, spacing === ComSpacing.Spacing833Khz);
      });
    this.evtSub.on('com_spacing_mode_2').whenChanged()
      .handle((spacing: ComSpacing): void => {
        this.freqInput2_25Ref.instance.deactivateEditing();
        this.freqInput2_833Ref.instance.deactivateEditing();
        this.buttonEditingModeIsActive.set(false);
        this.com2ActFreqClasses.toggle(CssClasses.SPACING_833, spacing === ComSpacing.Spacing833Khz);
        this.com2StbyFreqLabelClasses.toggle(CssClasses.SPACING_833, spacing === ComSpacing.Spacing833Khz);
      });

    this.freqInput1_25Ref.instance.isEditingActive.sub(this.freqInputCursorEditingModeHandler);
    this.freqInput2_25Ref.instance.isEditingActive.sub(this.freqInputCursorEditingModeHandler);
    this.freqInput1_833Ref.instance.isEditingActive.sub(this.freqInputCursorEditingModeHandler);
    this.freqInput2_833Ref.instance.isEditingActive.sub(this.freqInputCursorEditingModeHandler);

    this.buttonEditingModeIsActive.sub((buttonEditingModeIsActive: boolean): void => {
      // console.log(`Button editing mode is: ${buttonEditingModeIsActive ? 'active' : 'inactive'}`);
      if (buttonEditingModeIsActive) {
        this.freqInputInstance.setFrequency(this.stbyFreqValue.get() * 1e6);
      } else {
        this.inputKnobEditingModeIsActive.set(false);
      }
      // Set button background image
      this.stbyUpImgSrc.set(buttonEditingModeIsActive ?
        (this.isHrz ? GtcHorizButtonBackgroundImagePaths.ComBottomDown : GtcVertButtonBackgroundImagePaths.ComBottomDown) :
        (this.isHrz ? GtcHorizButtonBackgroundImagePaths.ComBottomUp : GtcVertButtonBackgroundImagePaths.ComBottomUp));
    });

    this.inputKnobEditingModeIsActive.sub((inputKnobEditingModeIsActive: boolean): void => {
      // console.log(`Input knob editing mode is: ${inputKnobEditingModeIsActive ? 'active' : 'inactive'}`);
      this.toggleStbyInputsLabelsAndSidebar(inputKnobEditingModeIsActive);
    });
  }

  /** @inheritdoc */
  public onClose(): void {
    this.freqInputInstance.deactivateEditing();
    this.buttonEditingModeIsActive.set(false);
  }

  /**
   * Change which radio is tunable.
   * @param radio The radio to make tunable.  If not supplied, it will swap between COM1 and COM2.
   */
  private changeRadioBeingTuned(radio?: ComRadio): void {
    // Abort if already set
    if (radio === this.radioBeingTuned.get()) {
      return;
    }
    // Deactivate editing modes
    this.freqInputInstance.deactivateEditing();
    this.buttonEditingModeIsActive.set(false);
    // Switch radio
    this.radioBeingTuned.set(radio ?? (this.radioBeingTuned.get() === 'COM1' ? 'COM2' : 'COM1'));
  }

  /**
   * Handle FrequencyInput component editing activity changes.
   * @param inputCursorEditingModeIsActive Whether or not cursor editing mode is active.
   */
  private freqInputCursorEditingModeHandler = (inputCursorEditingModeIsActive: boolean): void => {
    // console.log(`Input cursor editing mode is: ${inputCursorEditingModeIsActive ? 'active' : 'inactive'}`);
    if (!this.inputKnobEditingModeIsActive.get()) {
      this.scheduleStbyHighlightRemovalOrSwap('IMMEDIATE_REMOVAL');
      this.toggleStbyInputsLabelsAndSidebar(inputCursorEditingModeIsActive);
    }
  };

  /**
   * Toggle the visibility of standby button elements and the sidebar buttons.
   * @param editingIsActive Whether or not an editing mode is active.
   */
  private toggleStbyInputsLabelsAndSidebar(editingIsActive: boolean): void {
    const radio: ComRadio = this.radioBeingTuned.get();
    this.com1StbyFreqLabelClasses.toggle(CssClasses.HIDDEN, editingIsActive && radio === 'COM1');
    this.com2StbyFreqLabelClasses.toggle(CssClasses.HIDDEN, editingIsActive && radio === 'COM2');
    this.com1StbyFreqInput25Classes.toggle(CssClasses.HIDDEN,
      !(editingIsActive && radio === 'COM1' && this.com1Spacing.get() === ChannelSpacing.Spacing25Khz));
    this.com2StbyFreqInput25Classes.toggle(CssClasses.HIDDEN,
      !(editingIsActive && radio === 'COM2' && this.com2Spacing.get() === ChannelSpacing.Spacing25Khz));
    this.com1StbyFreqInput833Classes.toggle(CssClasses.HIDDEN,
      !(editingIsActive && radio === 'COM1' && this.com1Spacing.get() === ChannelSpacing.Spacing8_33Khz));
    this.com2StbyFreqInput833Classes.toggle(CssClasses.HIDDEN,
      !(editingIsActive && radio === 'COM2' && this.com2Spacing.get() === ChannelSpacing.Spacing8_33Khz));

    this._sidebarState.slot1.set(editingIsActive ? 'cancel' : null);
    this._sidebarState.slot5.set(editingIsActive ? 'enterEnabled' : null);
  }

  private onTopTransponderButtonPressed = (): void => {
    if (this.props.tcasIsSupported) {
      if (this.isHrz || !GtcNavComUtils.closeVertNavComPopup(this.props.gtcService, GtcViewKeys.TransponderMode)) {
        GtcNavComUtils.openPopup(this.props.gtcService, GtcViewKeys.TransponderMode, undefined, undefined, true);
      }
    } else {
      this.controlPublisher.pub('xpdr_send_ident_1', true, true, false);
    }
  };

  private onBottomTransponderButtonPressed = (): void => {
    if (this.isHrz || !GtcNavComUtils.closeVertNavComPopup(this.props.gtcService, GtcViewKeys.Transponder)) {
      this.openTransponderDialog();
    }
  };

  private onAudioRadiosPressed = (): void => {
    if (this.isHrz || !GtcNavComUtils.closeVertNavComPopup(this.props.gtcService, GtcViewKeys.AudioRadios)) {
      GtcNavComUtils.openPopup(this.props.gtcService, GtcViewKeys.AudioRadios, undefined, undefined, true);
    }
  };

  /**
   * Handles a COM radio Standby button press.
   * @param radio The radio whose standby button is being pressed.
   */
  private onStbyButtonPressed(radio: ComRadio): void {
    if (this.isHrz) {
      this.changeRadioBeingTuned(radio);
    } else if (!GtcNavComUtils.closeVertNavComPopup<GtcFrequencyDialog>(this.props.gtcService, GtcViewKeys.FrequencyDialog, dialog => dialog.radio === radio)) {
      this.radioBeingTuned.set(radio);
      this.openFrequencyDialog(radio);
    }
  }

  /** Open the transponder dialog and set the new code if not cancelled. */
  private async openTransponderDialog(): Promise<void> {
    const result: GtcDialogResult<number> = await GtcNavComUtils
      .openPopup<GtcTransponderDialog>(this.props.gtcService, GtcViewKeys.Transponder, undefined, undefined, true)
      .ref.request(parseInt(this.xpdrCode.get()));
    !result.wasCancelled && this.controlPublisher.pub('publish_xpdr_code_1', result.payload, true, false);
  }

  /**
   * Opens the frequency dialog to allow the user to set the standby frequency for a COM radio.
   * @param radio The COM radio for which to open the frequency dialog.
   */
  private async openFrequencyDialog(radio: ComRadio): Promise<void> {
    const spacing: ChannelSpacing = radio === 'COM1' ? this.com1Spacing.get() : this.com2Spacing.get();
    const type: GtcFrequencyDialogInputType = spacing === ChannelSpacing.Spacing25Khz ?
      GtcFrequencyDialogInputType.Com25 : GtcFrequencyDialogInputType.Com833;

    const result: GtcDialogResult<GtcFrequencyDialogResult> =
      await GtcNavComUtils
        .openPopup<GtcFrequencyDialog>(this.props.gtcService, GtcViewKeys.FrequencyDialog, undefined, undefined, true)
        .ref.request({
          title: `${radio} Standby`,
          type,
          initialValue: (radio === 'COM1' ? this.com1StbyFreq : this.com2StbyFreq).get() * 1_000_000,
          activeFrequency: (radio === 'COM1' ? this.com1ActiveFreq : this.com2ActiveFreq).get() * 1_000_000,
          showTransferButton: true,
          showFindButton: true,
          radio
        });

    if (!result.wasCancelled) {
      const { frequency, transfer } = result.payload;
      switch (radio) {
        case 'COM1':
          SimVar.SetSimVarValue('K:COM_STBY_RADIO_SET_HZ', 'number', frequency);
          break;
        case 'COM2':
          SimVar.SetSimVarValue('K:COM2_STBY_RADIO_SET_HZ', 'number', frequency);
          break;
      }
      if (transfer) {
        SimVar.SetSimVarValue(`K:${radio}_RADIO_SWAP`, 'number', 0);
        this.bus.getPublisher<SoundServerControlEvents>().pub('sound_server_play', GtcNavComHome.FREQ_SWAP_SOUND_PACKET, true, false);
      }
    }
  }

  /**
   * Handles a numpad press.
   * @param numeral The numeral pressed.
   */
  private onNumpadPressed(numeral: string): void {
    this.buttonEditingModeIsActive.set(true);
    if (this.inputCursorEditingModeIsActive || ['1', '2', '3'].includes(numeral)) {
      this.freqInputInstance.setSlotCharacterValue(numeral);
    } else {
      this.scheduleStbyHighlightRemovalOrSwap('IMMEDIATE_REMOVAL');
      this.freqInputInstance.setFrequency(118_000_000);
      this.inputKnobEditingModeIsActive.set(true);
    }
  }

  private onMicButtonPressed = (): void => {
    this.highlightStbyButton = true;
    this.comTransmitSetting.value = this.comTransmitSetting.value === 'COM1' ? 'COM2' : 'COM1';
  };

  private onMonButtonPress = (): void => {
    // Toggle the receiving state of the radio not currently transmitting
    const setting = this.currentComReceiveSetting;
    setting.value = setting.value === ComRadioReceiveMode.TransmitOnly ? ComRadioReceiveMode.Both : ComRadioReceiveMode.TransmitOnly;
  };

  /** Confirms and sets the current standby frequency being editing. */
  private confirmFrequency(): void {
    this.setComStbyFreq(true);
    this.buttonEditingModeIsActive.set(false);
  }

  /**
   * Sets the COM radio standby frequencies.
   * @param deactivateEditingAfter Whether or not to deactivate editing on the input after setting the frequency.
   */
  private setComStbyFreq(deactivateEditingAfter: boolean): void {
    const freq: number = this.freqInputValue.get();
    if (118e6 <= freq && freq < 137e6) {
      SimVar.SetSimVarValue(`K:COM${this.radioBeingTuned.get() === 'COM2' ? 2 : ''}_STBY_RADIO_SET_HZ`, 'number', freq);
      deactivateEditingAfter && this.freqInputInstance.deactivateEditing();
    }
  }

  /**
   * Swaps the COM radio frequencies, first setting the standby value if it's being edited.
   * @param radio The radio to swap the frequencies of, defaults to the current radio being tuned if not explicitly set.
   */
  private swapComFreq(radio: ComRadio = this.radioBeingTuned.get()): void {
    if (this.buttonEditingModeIsActive.get() && radio === this.radioBeingTuned.get()) {
      this.confirmFrequency();
    }
    G3000RadioUtils.swapRadioFrequency(radio);
    this.bus.getPublisher<SoundServerControlEvents>().pub('sound_server_play', GtcNavComHome.FREQ_SWAP_SOUND_PACKET, true, false);
  }

  /** @inheritDoc */
  public override onGtcInteractionEvent(event: GtcInteractionEvent): boolean {
    switch (event) {
      case GtcInteractionEvent.MapKnobInc:
        G3000RadioUtils.changeRadioVolume(this.radioBeingTuned.get(), 'INC');
        return true;
      case GtcInteractionEvent.MapKnobDec:
        G3000RadioUtils.changeRadioVolume(this.radioBeingTuned.get(), 'DEC');
        return true;
      case GtcInteractionEvent.InnerKnobInc:
      case GtcInteractionEvent.InnerKnobDec:
      case GtcInteractionEvent.OuterKnobInc:
      case GtcInteractionEvent.OuterKnobDec:
        if (this.buttonEditingModeIsActive.get()) {
          this.inputKnobEditingModeIsActive.set(true);
          this.freqInputInstance.onGtcInteractionEvent(event);
        } else {
          this.onKnobTurnOutsideOfButtonEditingMode(event);
        }
        return true;
      case GtcInteractionEvent.InnerKnobPush:
        if (this.buttonEditingModeIsActive.get()) {
          this.confirmFrequency();
        } else {
          this.highlightStbyButton = true;
          this.changeRadioBeingTuned();
        }
        return true;
      case GtcInteractionEvent.InnerKnobPushLong:
        this.swapComFreq();
        return true;
      case GtcInteractionEvent.ButtonBarCancelPressed:
        this.freqInputInstance.deactivateEditing();
        this.buttonEditingModeIsActive.set(false);
        return true;
      case GtcInteractionEvent.ButtonBarEnterPressed:
        this.confirmFrequency();
        return true;
      default:
        return false;
    }
  }

  /**
   * Handle knob turns when button editing mode is not active.
   * @param event The knob event that triggered the handler.
   */
  private onKnobTurnOutsideOfButtonEditingMode(event: GtcHardwareControlEvent): void {
    this.momentarilyHighlightStbyButton();
    this.freqInputInstance.setFrequency(this.stbyFreqValue.get() * 1e6);
    this.freqInputInstance.onGtcInteractionEvent(event);
    this.setComStbyFreq(false);
  }

  /**
   * Schedule a removal or swapping of highlight styling on the standby frequency buttons.
   * @param behavior Whether to remove the styling immediately or after a delay, or to immediately swap the styling.
   */
  private scheduleStbyHighlightRemovalOrSwap(behavior: 'DELAYED_REMOVAL' | 'IMMEDIATE_REMOVAL' | 'IMMEDIATE_SWAP'): void {
    this.knobTurnTimer.schedule((): void => {
      this.toggleStandbyButtonHighlighting('REMOVE', 'COM1');
      this.toggleStandbyButtonHighlighting('REMOVE', 'COM2');
      behavior === 'IMMEDIATE_SWAP' && this.momentarilyHighlightStbyButton();
    }, behavior === 'DELAYED_REMOVAL' ? 2000 : 0);
  }

  /** Momentarily highlight the standby button. */
  private momentarilyHighlightStbyButton(): void {
    this.toggleStandbyButtonHighlighting('APPLY', this.radioBeingTuned.get());
    this.scheduleStbyHighlightRemovalOrSwap('DELAYED_REMOVAL');
  }

  /**
   * Toggle the highlighted styling of the standby frequency button.
   * @param direction Whether to apply or remove the highlighted styling.
   * @param radio The radio to toggle the styling of.
   */
  private toggleStandbyButtonHighlighting(direction: 'APPLY' | 'REMOVE', radio: ComRadio): void {
    // console.log(direction, radio);
    // The radio parameter needs to be passed specifically for the REMOVE case, because by this time the
    // radio currently being tuned might not the same as the radio whose styling needs to be toggled.
    (radio === 'COM1' ? this.com1StbyTextLabelClasses : this.com2StbyTextLabelClasses)
      .toggle(CssClasses.BLACK_TEXT, direction === 'APPLY');
    (radio === 'COM1' ? this.com1StbyFreqLabelClasses : this.com2StbyFreqLabelClasses)
      .toggle(CssClasses.BLACK_TEXT, direction === 'APPLY');
    (radio === 'COM1' ? this.com1StbyFreqLabelClasses : this.com2StbyFreqLabelClasses)
      .toggle(CssClasses.STBY_COLOR, (direction === 'REMOVE') && (radio === this.radioBeingTuned.get()));
    (radio === 'COM1' ? this.com1StbyHighlightClasses : this.com2StbyHighlightClasses)
      .toggle(CssClasses.OPACITY_ZERO, direction === 'REMOVE');
    (radio === 'COM1' ? this.com1StbyBorderClasses : this.com2StbyBorderClasses)
      .toggle(CssClasses.OPACITY_ZERO, (direction === 'REMOVE') && (radio !== this.radioBeingTuned.get()));
  }

  /** @inheritDoc */
  public render(): VNode {
    const isHrz: boolean = this.isHrz;
    const transponderClasses: string[] = ['navcom-area-transponder', 'nested-buttons'];
    isHrz && transponderClasses.push('bordered');
    this.props.tcasIsSupported && transponderClasses.push('tcas');

    return (
      <div class="gtc-page gtc-home-page nav-com-home">

        {this.props.gtcService.controlSetup === 'pfd' ?
          <GtcNavComTrafficMapButton
            pfdMapLayoutSettingManager={PfdUserSettings.getAliasedManager(this.props.gtcService.bus, this.props.gtcService.pfdControlIndex)}
            pfdDisplayPaneSettingManager={this.props.gtcService.pfdPaneSettings}
            class='navcom-area-transponder'
          />
          :
          <div class={transponderClasses.join(' ')}>
            <BgImgTouchButton
              class='audio-button-top xpdr-ident'
              label={this.props.tcasIsSupported ? this.xpdrModeLabel.map(mode => `XPDR 1\n${mode}`) : 'XPDR 1\nIDENT'}
              onPressed={this.onTopTransponderButtonPressed}
              upImgSrc={isHrz ? GtcHorizButtonBackgroundImagePaths.XpdrTopUp : GtcVertButtonBackgroundImagePaths.XpdrTopUp}
              downImgSrc={isHrz ? GtcHorizButtonBackgroundImagePaths.XpdrTopDown : GtcVertButtonBackgroundImagePaths.XpdrTopDown}
            />
            <BgImgTouchButton
              class='audio-button-bottom'
              onPressed={this.onBottomTransponderButtonPressed}
              upImgSrc={isHrz ? GtcHorizButtonBackgroundImagePaths.XpdrBottomUp : GtcVertButtonBackgroundImagePaths.XpdrBottomUp}
              downImgSrc={isHrz ? GtcHorizButtonBackgroundImagePaths.XpdrBottomDown : GtcVertButtonBackgroundImagePaths.XpdrBottomDown}
            >
              {!this.props.tcasIsSupported &&
                <div class={this.xpdrModeClasses}>{this.xpdrModeLabel}</div>
              }
              <div class={this.xpdrCodeClasses}>{this.xpdrCode}</div>
            </BgImgTouchButton>
          </div>
        }

        {isHrz &&
          <div class="navcom-area-isolate">
            <TouchButton label={'Pilot\nIsolate'} isEnabled={false}></TouchButton>
          </div>
        }
        {isHrz &&
          <div class="navcom-area-music">
            <ToggleTouchButton label={'Pilot\nMusic 1'} isEnabled={false}
              state={Subject.create(false)}></ToggleTouchButton>
          </div>
        }

        <div class={`navcom-area-audio nested-buttons${isHrz ? ' bordered' : ''}`}>
          <BgImgTouchButton
            class='audio-button-top'
            label={'Audio &\nRadios'}
            onPressed={this.onAudioRadiosPressed}
            upImgSrc={isHrz ? GtcHorizButtonBackgroundImagePaths.XpdrTopUp : GtcVertButtonBackgroundImagePaths.XpdrTopUp}
            downImgSrc={isHrz ? GtcHorizButtonBackgroundImagePaths.XpdrTopDown : GtcVertButtonBackgroundImagePaths.XpdrTopDown}
          />
          <BgImgTouchButton
            class='audio-button-bottom intercom'
            label='Intercom'
            isEnabled={false}
            upImgSrc={isHrz ? GtcHorizButtonBackgroundImagePaths.XpdrBottomUp : GtcVertButtonBackgroundImagePaths.XpdrBottomUp}
            downImgSrc={isHrz ? GtcHorizButtonBackgroundImagePaths.XpdrBottomDown : GtcVertButtonBackgroundImagePaths.XpdrBottomDown}
          ></BgImgTouchButton>
        </div>

        <div class={`navcom-area-com1 nested-buttons${isHrz ? ' bordered' : ''}`}>
          <BgImgTouchButton
            class='com-button-top'
            onPressed={() => this.swapComFreq('COM1')}
            upImgSrc={isHrz ? GtcHorizButtonBackgroundImagePaths.ComTopUp : GtcVertButtonBackgroundImagePaths.ComTopUp}
            downImgSrc={isHrz ? GtcHorizButtonBackgroundImagePaths.ComTopDown : GtcVertButtonBackgroundImagePaths.ComTopDown}
          >
            <div class='com-label com-active-label'>COM1</div>
            <div class={this.com1ActFreqClasses}>{this.com1ActiveFreqDisp}</div>
            <img class='com-arrow' src={GtcHorizButtonBackgroundImagePaths.DoubleArrow}></img>
          </BgImgTouchButton>
          <BgImgTouchButton
            class='com-button-bottom'
            onPressed={() => this.onStbyButtonPressed('COM1')}
            upImgSrc={this.com1StbyFreqUpImgSrc}
            downImgSrc={isHrz ? GtcHorizButtonBackgroundImagePaths.ComBottomDown : GtcVertButtonBackgroundImagePaths.ComBottomDown}
          >
            <img class={this.com1StbyHighlightClasses}
              src={isHrz ? GtcHorizButtonBackgroundImagePaths.ComBottomHighlight : GtcVertButtonBackgroundImagePaths.ComBottomHighlight}></img>
            <div class={this.com1StbyTextLabelClasses}>STBY</div>
            <div class={this.com1StbyFreqLabelClasses}>{this.com1StbyFreqDisp}</div>
            <FrequencyInput
              ref={this.freqInput1_25Ref}
              radioType={RadioType.Com}
              frequency={this.com1StbyInputFreq}
              comChannelSpacing={ChannelSpacing.Spacing25Khz}
              class={this.com1StbyFreqInput25Classes}
            />
            <FrequencyInput
              ref={this.freqInput1_833Ref}
              radioType={RadioType.Com}
              frequency={this.com1StbyInputFreq}
              comChannelSpacing={ChannelSpacing.Spacing8_33Khz}
              class={this.com1StbyFreqInput833Classes}
            />
            {isHrz &&
              <img class={this.com1StbyBorderClasses}
                src={isHrz ? GtcHorizButtonBackgroundImagePaths.ComBottomBorder : GtcVertButtonBackgroundImagePaths.ComBottomBorder}></img>
            }
          </BgImgTouchButton>
        </div>

        <div class={`navcom-area-micmon nested-buttons${isHrz ? ' bordered' : ''}`}>
          <BgImgTouchButton
            label='MIC'
            class='mic-mon-button mic-button'
            onPressed={this.onMicButtonPressed}
            upImgSrc={isHrz ? GtcHorizButtonBackgroundImagePaths.MicUp : GtcVertButtonBackgroundImagePaths.MicUp}
            downImgSrc={isHrz ? GtcHorizButtonBackgroundImagePaths.MicDown : GtcVertButtonBackgroundImagePaths.MicDown}
          >
            <div class={this.mic1Classes}
              style={`background-image: url("${isHrz ? GtcHorizButtonBackgroundImagePaths.TriangleUp : GtcVertButtonBackgroundImagePaths.TriangleLeft}")`}>1</div>
            <div class={this.mic2Classes}
              style={`background-image: url("${isHrz ? GtcHorizButtonBackgroundImagePaths.TriangleDown : GtcVertButtonBackgroundImagePaths.TriangleRight}")`}>2</div>
          </BgImgTouchButton>
          <BgImgTouchButton
            label='MON'
            class='mic-mon-button mon-button'
            onPressed={this.onMonButtonPress}
            upImgSrc={isHrz ? GtcHorizButtonBackgroundImagePaths.MonUp : GtcVertButtonBackgroundImagePaths.MonUp}
            downImgSrc={isHrz ? GtcHorizButtonBackgroundImagePaths.MonDown : GtcVertButtonBackgroundImagePaths.MonDown}
          >
            <div class={this.mon1Classes}
              style={`background-image: url("${isHrz ? GtcHorizButtonBackgroundImagePaths.TriangleUp : GtcVertButtonBackgroundImagePaths.TriangleLeft}")`}>1</div>
            <div class={this.mon2Classes}
              style={`background-image: url("${isHrz ? GtcHorizButtonBackgroundImagePaths.TriangleDown : GtcVertButtonBackgroundImagePaths.TriangleRight}")`}>2</div>
          </BgImgTouchButton>
        </div>

        <div class={`navcom-area-com2 nested-buttons${isHrz ? ' bordered' : ''}`}>
          <BgImgTouchButton
            class='com-button-top'
            onPressed={() => this.swapComFreq('COM2')}
            upImgSrc={isHrz ? GtcHorizButtonBackgroundImagePaths.ComTopUp : GtcVertButtonBackgroundImagePaths.ComTopUp}
            downImgSrc={isHrz ? GtcHorizButtonBackgroundImagePaths.ComTopDown : GtcVertButtonBackgroundImagePaths.ComTopDown}
          >
            <div class='com-label com-active-label'>COM2</div>
            <div class={this.com2ActFreqClasses}>{this.com2ActiveFreqDisp}</div>
            <img class='com-arrow' src={GtcHorizButtonBackgroundImagePaths.DoubleArrow}></img>
          </BgImgTouchButton>
          <BgImgTouchButton
            class='com-button-bottom'
            onPressed={() => this.onStbyButtonPressed('COM2')}
            upImgSrc={this.com2StbyFreqUpImgSrc}
            downImgSrc={isHrz ? GtcHorizButtonBackgroundImagePaths.ComBottomDown : GtcVertButtonBackgroundImagePaths.ComBottomDown}
          >
            <img class={this.com2StbyHighlightClasses}
              src={isHrz ? GtcHorizButtonBackgroundImagePaths.ComBottomHighlight : GtcVertButtonBackgroundImagePaths.ComBottomHighlight}></img>
            <div class={this.com2StbyTextLabelClasses}>STBY</div>
            <div class={this.com2StbyFreqLabelClasses}>{this.com2StbyFreqDisp}</div>
            <FrequencyInput
              ref={this.freqInput2_25Ref}
              radioType={RadioType.Com}
              frequency={this.com2StbyInputFreq}
              comChannelSpacing={ChannelSpacing.Spacing25Khz}
              class={this.com2StbyFreqInput25Classes}
            />
            <FrequencyInput
              ref={this.freqInput2_833Ref}
              radioType={RadioType.Com}
              frequency={this.com2StbyInputFreq}
              comChannelSpacing={ChannelSpacing.Spacing8_33Khz}
              class={this.com2StbyFreqInput833Classes}
            />
            {isHrz &&
              <img class={this.com2StbyBorderClasses}
                src={isHrz ? GtcHorizButtonBackgroundImagePaths.ComBottomBorder : GtcVertButtonBackgroundImagePaths.ComBottomBorder}></img>
            }
          </BgImgTouchButton>
        </div>

        {isHrz &&
          <div class="navcom-area-keypad">
            <ImgTouchButton
              isEnabled={false}
              class='find-button keypad-button top-keypad-button left-keypad-button'
              imgSrc={GtcHorizButtonBackgroundImagePaths.FindIcon}
              label='Find'
            />
            <ImgTouchButton
              class='bksp-button keypad-button top-keypad-button right-keypad-button'
              onPressed={(): void => {
                this.inputCursorEditingModeIsActive && this.freqInputInstance.backspace();
                this.inputKnobEditingModeIsActive.get() && this.freqInputInstance.activateEditing(false);
              }}
              imgSrc={GtcHorizButtonBackgroundImagePaths.BackspaceIcon}
              label='BKSP'
            />

            <div class='keypad'>
              <div class='keypad-background'></div>
              <div class='keypad-background-bottom'>
                <div class='keypad-scooped-corner keypad-background-bottom-left'></div>
                <div class='keypad-scooped-corner keypad-background-bottom-right'></div>
              </div>
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0'].map(numeral => !numeral ? '<span></span>' : (
                <RoundTouchButton
                  label={numeral}
                  class='numpad-touch-button'
                  onPressed={(): void => this.onNumpadPressed(numeral)}
                  orientation="horizontal"
                ></RoundTouchButton>
              ))}
            </div>

            <ImgTouchButton
              isEnabled={false}
              class='play-button keypad-button bottom-keypad-button left-keypad-button'
              imgSrc={GtcHorizButtonBackgroundImagePaths.PlayIcon}
              label='Play'
            />
            <ImgTouchButton
              class='xfer-button keypad-button bottom-keypad-button right-keypad-button'
              onPressed={() => this.swapComFreq()}
              imgSrc={GtcHorizButtonBackgroundImagePaths.DoubleArrow}
              label='XFER'
            />
          </div>
        }

      </div>
    );
  }

}
