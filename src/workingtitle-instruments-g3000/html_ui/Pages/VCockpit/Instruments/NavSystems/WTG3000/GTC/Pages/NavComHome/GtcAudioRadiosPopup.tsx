import {
  ComponentProps, ComSpacing, ConsumerSubject, DisplayComponent, FSComponent, MappedSubject, MappedSubscribable, NavComSimVars,
  RadioFrequencyFormatter, SetSubject, SimVarValueType, Subject, Subscribable, SubscribableSet, Subscription, UserSetting, VNode
} from '@microsoft/msfs-sdk';
import { DmeTuneSettingMode, DmeUserSettings, TouchSlider } from '@microsoft/msfs-garminsdk';
import {
  AdfRadio, ComRadio, ComRadioReceiveMode, DmeRadio, G3000ComRadioUserSettings, G3000NavIndicator, G3000RadioType, G3000RadioUtils,
  NavRadio, NavRadioMonitorUserSettings, Radio, RadiosConfig, TunableRadio
} from '@microsoft/msfs-wtg3000-common';
import { BtnImagePath, BtnImagePathHor } from '../../ButtonBackgroundImagePaths';
import { GtcList, GtcListItem } from '../../Components/List';
import { TabbedContainer, TabConfiguration } from '../../Components/Tabs/TabbedContainer';
import { TabbedContent } from '../../Components/Tabs/TabbedContent';
import { GtcImgTouchButton } from '../../Components/TouchButton/GtcImgTouchButton';
import { GtcToggleTouchButton } from '../../Components/TouchButton/GtcToggleTouchButton';
import { GtcTouchButton } from '../../Components/TouchButton/GtcTouchButton';
import { GtcValueTouchButton } from '../../Components/TouchButton/GtcValueTouchButton';
import { GtcDialogResult } from '../../Dialog/GtcDialogView';
import { GtcFrequencyDialog, GtcFrequencyDialogInputType, GtcFrequencyDialogResult } from '../../Dialog/GtcFrequencyDialog';
import { GtcInteractionEvent, GtcInteractionHandler, GtcViewLifecyclePolicy } from '../../GtcService';
import { GtcView, GtcViewProps } from '../../GtcService/GtcView';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';
import { GtcDmeModePopup } from './GtcDmeModePopup';
import { GtcNavComUtils } from './GtcNavComUtils';

import './GtcAudioRadiosPopup.css';

enum CssClasses {
  ACTIVE_COLOR = 'active-color',
  FREQUENCY = 'frequency',
  HIDDEN = 'visibility-hidden',
}

const ACTIVE_FREQ_CLASS = 'active-freq';
const BORDER_CLASS = 'com-border';

/**
 * Subscribables providing the active and standby frequencies for a radio.
 */
type RadioFrequencies = {
  /** The source standby frequency from the event bus. */
  standbySource: ConsumerSubject<number>;

  /** The source active frequency from the event bus. */
  activeSource: ConsumerSubject<number>;

  /** The standby frequency in hertz. */
  standbyHz: MappedSubscribable<number>;

  /** The active frequency in hertz. */
  activeHz: MappedSubscribable<number>;
};

/** Component props for GtcAudioRadiosPopup */
export interface GtcAudioRadiosPopupProps extends GtcViewProps {
  /** A configuration object which defines options for radios. */
  radiosConfig: RadiosConfig;

  /** The indicator for the active nav source. */
  activeNavIndicator: G3000NavIndicator;
}

/**
 * GTC view keys for popups owned by the Audio/Radios popup.
 */
enum GtcAudioRadiosPopupKeys {
  DmeMode = 'DmeMode'
}

/** Audio & Radios */
export class GtcAudioRadiosPopup extends GtcView<GtcAudioRadiosPopupProps> {
  private static readonly COM_25_FORMATTER = RadioFrequencyFormatter.createCom(ComSpacing.Spacing25Khz);
  private static readonly COM_833_FORMATTER = RadioFrequencyFormatter.createCom(ComSpacing.Spacing833Khz);
  private static readonly COM_FREQ_FORMATTER = ([frequency, spacing]: readonly [number, ComSpacing]): string => {
    return spacing === ComSpacing.Spacing833Khz
      ? GtcAudioRadiosPopup.COM_833_FORMATTER(frequency)
      : GtcAudioRadiosPopup.COM_25_FORMATTER(frequency);
  };
  private static readonly NAV_FREQ_FORMATTER = RadioFrequencyFormatter.createNav();
  private static readonly ADF_FREQ_FORMATTER = RadioFrequencyFormatter.createAdf();

  private static readonly DME_TUNE_MODE_TEXT = {
    [DmeTuneSettingMode.Nav1]: 'NAV1',
    [DmeTuneSettingMode.Nav2]: 'NAV2',
    [DmeTuneSettingMode.Hold]: 'HOLD'
  };

  public override readonly title: Subject<string> = Subject.create('Audio & Radios');

  private readonly listRef = FSComponent.createRef<GtcList<any>>();
  private readonly tabsRef = FSComponent.createRef<TabbedContainer>();

  private readonly radioNameFormatter = G3000RadioUtils.radioNameFormatter(this.props.radiosConfig.adfCount, this.props.radiosConfig.dmeCount);

  private readonly evtSub = this.bus.getSubscriber<NavComSimVars>();

  private readonly navRadioMonitorSettingManager = NavRadioMonitorUserSettings.getManager(this.bus);
  private readonly navRadioMonitorSettings = {
    ['NAV1']: {
      monitor: this.navRadioMonitorSettingManager.getSetting('navRadioMonitorSelected1'),
      ident: this.navRadioMonitorSettingManager.getSetting('navRadioMonitorIdentEnabled1')
    },
    ['NAV2']: {
      monitor: this.navRadioMonitorSettingManager.getSetting('navRadioMonitorSelected2'),
      ident: this.navRadioMonitorSettingManager.getSetting('navRadioMonitorIdentEnabled2')
    }
  };

  private readonly dmeSettingManager = DmeUserSettings.getManager(this.bus);

  private readonly registeredRows = new Map<string, GtcInteractionHandler>();
  private pilotRows?: VNode;

  private readonly selectedRowId = Subject.create<string>('');

  private readonly radioFreqs: Record<Radio, RadioFrequencies> = {
    ['NAV1']: GtcAudioRadiosPopup.createRadioFrequencies('NAV1'),
    ['NAV2']: GtcAudioRadiosPopup.createRadioFrequencies('NAV2'),
    ['COM1']: GtcAudioRadiosPopup.createRadioFrequencies('COM1'),
    ['COM2']: GtcAudioRadiosPopup.createRadioFrequencies('COM2'),
    ['COM3']: GtcAudioRadiosPopup.createRadioFrequencies('COM3'),
    ['ADF1']: GtcAudioRadiosPopup.createRadioFrequencies('ADF1'),
    ['ADF2']: GtcAudioRadiosPopup.createRadioFrequencies('ADF2'),
    ['DME1']: GtcAudioRadiosPopup.createRadioFrequencies('DME1'),
    ['DME2']: GtcAudioRadiosPopup.createRadioFrequencies('DME2')
  };

  private readonly radioMonitoring: Record<Radio, ConsumerSubject<boolean>> = {
    ['NAV1']: ConsumerSubject.create<boolean>(null, false),
    ['NAV2']: ConsumerSubject.create<boolean>(null, false),
    ['COM1']: ConsumerSubject.create<boolean>(null, false),
    ['COM2']: ConsumerSubject.create<boolean>(null, false),
    ['COM3']: ConsumerSubject.create<boolean>(null, false),
    ['ADF1']: ConsumerSubject.create<boolean>(null, false),
    ['ADF2']: ConsumerSubject.create<boolean>(null, false),
    ['DME1']: ConsumerSubject.create<boolean>(null, false),
    ['DME2']: ConsumerSubject.create<boolean>(null, false)
  };

  private readonly radioVolumes: Record<Radio, ConsumerSubject<number>> = {
    ['NAV1']: ConsumerSubject.create(null, 100),
    ['NAV2']: ConsumerSubject.create(null, 100),
    ['COM1']: ConsumerSubject.create(null, 100),
    ['COM2']: ConsumerSubject.create(null, 100),
    ['COM3']: ConsumerSubject.create(null, 100),
    ['ADF1']: ConsumerSubject.create(null, 100),
    ['ADF2']: ConsumerSubject.create(null, 100),
    ['DME1']: ConsumerSubject.create(null, 100),
    ['DME2']: ConsumerSubject.create(null, 100)
  };

  private readonly comSpacing: Record<ComRadio, ConsumerSubject<ComSpacing>> = {
    ['COM1']: ConsumerSubject.create<ComSpacing>(null, ComSpacing.Spacing25Khz),
    ['COM2']: ConsumerSubject.create<ComSpacing>(null, ComSpacing.Spacing25Khz),
    ['COM3']: ConsumerSubject.create<ComSpacing>(null, ComSpacing.Spacing25Khz)
  };

  private readonly comFreqText = {
    ['COM1']: {
      standby: MappedSubject.create(GtcAudioRadiosPopup.COM_FREQ_FORMATTER, this.radioFreqs['COM1'].standbyHz, this.comSpacing['COM1']),
      active: MappedSubject.create(GtcAudioRadiosPopup.COM_FREQ_FORMATTER, this.radioFreqs['COM1'].activeHz, this.comSpacing['COM1'])
    },
    ['COM2']: {
      standby: MappedSubject.create(GtcAudioRadiosPopup.COM_FREQ_FORMATTER, this.radioFreqs['COM2'].standbyHz, this.comSpacing['COM2']),
      active: MappedSubject.create(GtcAudioRadiosPopup.COM_FREQ_FORMATTER, this.radioFreqs['COM2'].activeHz, this.comSpacing['COM2'])
    },
    ['COM3']: {
      standby: MappedSubject.create(GtcAudioRadiosPopup.COM_FREQ_FORMATTER, this.radioFreqs['COM3'].standbyHz, this.comSpacing['COM3']),
      active: MappedSubject.create(GtcAudioRadiosPopup.COM_FREQ_FORMATTER, this.radioFreqs['COM3'].activeHz, this.comSpacing['COM3'])
    }
  };

  private readonly navIdentText = {
    ['NAV1']: MappedSubject.create(
      ([signal, ident]) => signal > 0 ? ident : '',
      ConsumerSubject.create(this.evtSub.on('nav_signal_1'), 0),
      ConsumerSubject.create(this.evtSub.on('nav_ident_1'), ''),
    ).pause(),

    ['NAV2']: MappedSubject.create(
      ([signal, ident]) => signal > 0 ? ident : '',
      ConsumerSubject.create(this.evtSub.on('nav_signal_2'), 0),
      ConsumerSubject.create(this.evtSub.on('nav_ident_2'), ''),
    ).pause()
  };

  private readonly navIdentEnabledText = {
    ['NAV1']: this.navRadioMonitorSettings['NAV1'].ident.map(enabled => enabled ? 'ID' : '').pause(),
    ['NAV2']: this.navRadioMonitorSettings['NAV2'].ident.map(enabled => enabled ? 'ID' : '').pause()
  };

  private readonly dmeTuneModeText = {
    ['DME1']: this.props.radiosConfig.dmeCount > 0
      ? this.dmeSettingManager.getSetting('dme1TuneMode').map(mode => GtcAudioRadiosPopup.DME_TUNE_MODE_TEXT[mode] ?? '').pause()
      : undefined,

    ['DME2']: this.props.radiosConfig.dmeCount > 1
      ? this.dmeSettingManager.getSetting('dme2TuneMode').map(mode => GtcAudioRadiosPopup.DME_TUNE_MODE_TEXT[mode] ?? '').pause()
      : undefined
  };

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

  private readonly markerBeaconMonitoring = ConsumerSubject.create(null, false);
  private readonly markerBeaconHiSenseOn = ConsumerSubject.create(null, false);

  private readonly nav1ActFreqClasses: SetSubject<string> = SetSubject.create([ACTIVE_FREQ_CLASS]);
  private readonly nav2ActFreqClasses: SetSubject<string> = SetSubject.create([ACTIVE_FREQ_CLASS]);
  private readonly com1ActFreqClasses: SetSubject<string> = SetSubject.create([ACTIVE_FREQ_CLASS]);
  private readonly com2ActFreqClasses: SetSubject<string> = SetSubject.create([ACTIVE_FREQ_CLASS]);

  /** @inheritDoc */
  public onAfterRender(): void {
    this.props.gtcService.registerView(
      GtcViewLifecyclePolicy.Static,
      GtcAudioRadiosPopupKeys.DmeMode,
      'NAV_COM',
      (gtcService, controlMode) => {
        return (
          <GtcDmeModePopup
            gtcService={gtcService}
            controlMode={controlMode}
          />
        );
      }
    );

    // Register rows.
    if (this.pilotRows !== undefined) {
      FSComponent.visitNodes(this.pilotRows, node => {
        if (node.instance instanceof GtcAudioRadiosRow) {
          this.registeredRows.set(node.instance.props.id, node.instance);
          return true;
        }

        return false;
      });
    }

    this._activeComponent.set(this.listRef.instance);

    this.initRadioSubs();

    this.comTransmitSetting.sub(radio => { this.selectedRowId.set(radio); }, true);

    this.props.activeNavIndicator.source.sub((source): void => {
      if (source) {
        this.nav1ActFreqClasses.toggle(CssClasses.ACTIVE_COLOR, source.name === 'NAV1');
        this.nav2ActFreqClasses.toggle(CssClasses.ACTIVE_COLOR, source.name === 'NAV2');
      }
    }, true);
  }

  /**
   * Initializes this popup's radio data subscriptions.
   */
  private initRadioSubs(): void {
    // NAV

    this.radioFreqs['NAV1'].standbySource.setConsumer(this.evtSub.on('nav_standby_frequency_1'));
    this.radioFreqs['NAV1'].activeSource.setConsumer(this.evtSub.on('nav_active_frequency_1'));
    this.radioFreqs['NAV2'].standbySource.setConsumer(this.evtSub.on('nav_standby_frequency_2'));
    this.radioFreqs['NAV2'].activeSource.setConsumer(this.evtSub.on('nav_active_frequency_2'));

    this.radioMonitoring['NAV1'].setConsumer(this.evtSub.on('nav_sound_1'));
    this.radioMonitoring['NAV2'].setConsumer(this.evtSub.on('nav_sound_2'));

    this.radioVolumes['NAV1'].setConsumer(this.evtSub.on('nav_volume_1'));
    this.radioVolumes['NAV2'].setConsumer(this.evtSub.on('nav_volume_2'));

    // COM

    this.radioFreqs['COM1'].standbySource.setConsumer(this.evtSub.on('com_standby_frequency_1'));
    this.radioFreqs['COM1'].activeSource.setConsumer(this.evtSub.on('com_active_frequency_1'));
    this.radioFreqs['COM2'].standbySource.setConsumer(this.evtSub.on('com_standby_frequency_2'));
    this.radioFreqs['COM2'].activeSource.setConsumer(this.evtSub.on('com_active_frequency_2'));

    this.radioMonitoring['COM1'].setConsumer(this.evtSub.on('com_receive_1'));
    this.radioMonitoring['COM2'].setConsumer(this.evtSub.on('com_receive_2'));

    this.radioVolumes['COM1'].setConsumer(this.evtSub.on('com_volume_1'));
    this.radioVolumes['COM2'].setConsumer(this.evtSub.on('com_volume_2'));

    this.comSpacing['COM1'].setConsumer(this.evtSub.on('com_spacing_mode_1'));
    this.comSpacing['COM2'].setConsumer(this.evtSub.on('com_spacing_mode_2'));

    // ADF

    if (this.props.radiosConfig.adfCount > 0) {
      this.radioFreqs['ADF1'].standbySource.setConsumer(this.evtSub.on('adf_standby_frequency_1'));
      this.radioFreqs['ADF1'].activeSource.setConsumer(this.evtSub.on('adf_active_frequency_1'));

      this.radioMonitoring['ADF1'].setConsumer(this.evtSub.on('adf_sound_1'));

      this.radioVolumes['ADF1'].setConsumer(this.evtSub.on('adf_volume_1'));
    }

    if (this.props.radiosConfig.adfCount > 1) {
      this.radioFreqs['ADF2'].standbySource.setConsumer(this.evtSub.on('adf_standby_frequency_2'));
      this.radioFreqs['ADF2'].activeSource.setConsumer(this.evtSub.on('adf_active_frequency_2'));

      this.radioMonitoring['ADF2'].setConsumer(this.evtSub.on('adf_sound_2'));

      this.radioVolumes['ADF2'].setConsumer(this.evtSub.on('adf_volume_2'));
    }

    // DME

    if (this.props.radiosConfig.dmeCount > 0) {
      this.radioFreqs['DME1'].activeSource.setConsumer(this.evtSub.on('nav_active_frequency_3'));
      this.radioMonitoring['DME1'].setConsumer(this.evtSub.on('nav_sound_3'));
      this.radioVolumes['DME1'].setConsumer(this.evtSub.on('nav_volume_3'));
    }

    if (this.props.radiosConfig.dmeCount > 1) {
      this.radioFreqs['DME2'].activeSource.setConsumer(this.evtSub.on('nav_active_frequency_4'));
      this.radioMonitoring['DME2'].setConsumer(this.evtSub.on('nav_sound_4'));
      this.radioVolumes['DME2'].setConsumer(this.evtSub.on('nav_volume_4'));
    }

    // Marker Beacon

    this.markerBeaconMonitoring.setConsumer(this.evtSub.on('marker_beacon_sound'));
    this.markerBeaconHiSenseOn.setConsumer(this.evtSub.on('marker_beacon_hisense_on'));
  }

  /** @inheritDoc */
  public override onResume(): void {
    super.onResume();

    this.tabsRef.instance.resume();
    this.navIdentText['NAV1'].resume();
    this.navIdentText['NAV2'].resume();
    this.navIdentEnabledText['NAV1'].resume();
    this.navIdentEnabledText['NAV2'].resume();
    this.dmeTuneModeText['DME1']?.resume();
    this.dmeTuneModeText['DME2']?.resume();
  }

  /** @inheritDoc */
  public override onPause(): void {
    super.onPause();

    this.tabsRef.instance.pause();
    this.navIdentText['NAV1'].pause();
    this.navIdentText['NAV2'].pause();
    this.navIdentEnabledText['NAV1'].pause();
    this.navIdentEnabledText['NAV2'].pause();
    this.dmeTuneModeText['DME1']?.pause();
    this.dmeTuneModeText['DME2']?.pause();
  }

  /** @inheritDoc */
  public override onGtcInteractionEvent(event: GtcInteractionEvent): boolean {
    if (this._activeComponent.get()?.onGtcInteractionEvent(event)) { return true; }

    const selectedRow = this.registeredRows.get(this.selectedRowId.get());
    return selectedRow?.onGtcInteractionEvent(event) ?? false;
  }

  /**
   * Handles an interaction event for a selected radio.
   * @param radio The selected radio.
   * @param event The interaction event to handle.
   * @returns Whether the event was handled.
   */
  private handleRadioInteractionEvent(radio: Radio, event: GtcInteractionEvent): boolean {
    const isHrz: boolean = this.gtcService.isHorizontal;

    switch (event) {
      case GtcInteractionEvent.MapKnobInc:
        isHrz && G3000RadioUtils.changeRadioVolume(radio, 'INC');
        return isHrz;
      case GtcInteractionEvent.MapKnobDec:
        isHrz && G3000RadioUtils.changeRadioVolume(radio, 'DEC');
        return isHrz;
      case GtcInteractionEvent.CenterKnobInc:
        !isHrz && G3000RadioUtils.changeRadioVolume(radio, 'INC');
        return !isHrz;
      case GtcInteractionEvent.CenterKnobDec:
        !isHrz && G3000RadioUtils.changeRadioVolume(radio, 'DEC');
        return !isHrz;
      case GtcInteractionEvent.InnerKnobInc:
        if (!G3000RadioUtils.isRadioType(radio, G3000RadioType.Dme)) {
          G3000RadioUtils.changeRadioFrequency(radio, 'FRACT', 'INC');
        }
        return true;
      case GtcInteractionEvent.InnerKnobDec:
        if (!G3000RadioUtils.isRadioType(radio, G3000RadioType.Dme)) {
          G3000RadioUtils.changeRadioFrequency(radio, 'FRACT', 'DEC');
        }
        return true;
      case GtcInteractionEvent.OuterKnobInc:
        if (!G3000RadioUtils.isRadioType(radio, G3000RadioType.Dme)) {
          G3000RadioUtils.changeRadioFrequency(radio, 'WHOLE', 'INC');
        }
        return true;
      case GtcInteractionEvent.OuterKnobDec:
        if (!G3000RadioUtils.isRadioType(radio, G3000RadioType.Dme)) {
          G3000RadioUtils.changeRadioFrequency(radio, 'WHOLE', 'DEC');
        }
        return true;
      case GtcInteractionEvent.InnerKnobPush:
        if (G3000RadioUtils.isRadioType(radio, G3000RadioType.Com)) {
          // Toggle COM radios
          this.selectedRowId.set(radio === 'COM1' ? 'COM2' : 'COM1');
        }
        return true;
      case GtcInteractionEvent.InnerKnobPushLong:
        if (!G3000RadioUtils.isRadioType(radio, G3000RadioType.Dme)) {
          G3000RadioUtils.swapRadioFrequency(radio);
        }
        return true;
      case GtcInteractionEvent.MapKnobPush:
        if (isHrz && G3000RadioUtils.isRadioType(radio, G3000RadioType.Nav)) {
          this.toggleNavRadioIdent(radio);
        }
        return isHrz;
      case GtcInteractionEvent.CenterKnobPush:
        if (!isHrz && G3000RadioUtils.isRadioType(radio, G3000RadioType.Nav)) {
          this.toggleNavRadioIdent(radio);
        }
        return !isHrz;
      default:
        return false;
    }
  }

  /**
   * Toggle the NAV radio monitoring of Morse code audio.
   * @param radio Which NAV radio to toggle.
   */
  private toggleNavRadioIdent(radio: NavRadio): void {
    this.navRadioMonitorSettings[radio].ident.value = !this.navRadioMonitorSettings[radio].ident.value;
  }

  /**
   * Selects a radio.
   * @param radio The selected radio.
   */
  private selectRadio(radio: Radio): void {
    const type = G3000RadioUtils.getRadioType(radio);
    const name = this.radioNameFormatter(radio);

    // Set sidebar labels

    let dualKnobLabel: string;
    switch (type) {
      case G3000RadioType.Com:
        dualKnobLabel = this.gtcService.isHorizontal
          ? `${name}\nFreq\nPush:\n1–2\n'Hold:↕`
          : `${name} Freq\nPush: 1–2 Hold:↕`;
        break;
      case G3000RadioType.Nav:
      case G3000RadioType.Adf:
        dualKnobLabel = this.gtcService.isHorizontal
          ? `${name}\nFreq\nHold:↕`
          : `${name} Freq\nHold:↕`;
        break;
      case G3000RadioType.Dme:
        dualKnobLabel = '';
    }

    this._sidebarState.dualConcentricKnobLabel.set(dualKnobLabel);

    if (this.gtcService.isHorizontal) {
      this._sidebarState.mapKnobLabel.set(`Pilot\n${name}\nVolume${type === G3000RadioType.Nav ? '\nPush:\nID' : ''}`);
    } else {
      this._sidebarState.centerKnobLabel.set(`Pilot ${name} Volume${type === G3000RadioType.Nav ? '\nPush: ID' : ''}`);
    }

    if (type === G3000RadioType.Com) {
      this.gtcService.radioBeingTuned.set(radio as ComRadio);
    }
  }

  /**
   * Responds to when a NAV radio toggle button is pressed.
   * @param radio The radio associated with the pressed button.
   */
  private onNavButtonPressed(radio: NavRadio): void {
    this.selectedRowId.set(radio);
  }

  /**
   * Responds to when a COM radio toggle button is pressed.
   * @param radio The radio associated with the pressed button.
   */
  private onComButtonPressed(radio: ComRadio): void {
    this.selectedRowId.set(radio);

    if (this.comTransmitSetting.get() !== radio) {
      // Toggle the receiving state of the radio not currently transmitting
      // This is functionally equivalent to onMonButtonPress() in GtcNavComHome
      const setting = this.currentComReceiveSetting;
      setting.value = setting.value === ComRadioReceiveMode.TransmitOnly ? ComRadioReceiveMode.Both : ComRadioReceiveMode.TransmitOnly;
    }
  }

  /**
   * Responds to when a COM radio MIC button is pressed.
   * @param radio The radio associated with the pressed button.
   */
  private onMicButtonPressed(radio: ComRadio): void {
    this.selectedRowId.set(radio);
    SimVar.SetSimVarValue(`K:COM${radio === 'COM1' ? 1 : 2}_TRANSMIT_SELECT`, 'number', 0);
  }

  /**
   * Responds to when an ADF radio toggle button is pressed.
   * @param radio The radio associated with the pressed button.
   */
  private onAdfButtonPressed(radio: AdfRadio): void {
    this.selectedRowId.set(radio);
    SimVar.SetSimVarValue(`K:RADIO_${radio === 'ADF1' ? 'ADF' : radio}_IDENT_TOGGLE`, 'number', 0);
  }

  /**
   * Responds to when an DME radio toggle button is pressed.
   * @param radio The radio associated with the pressed button.
   */
  private onDmeButtonPressed(radio: DmeRadio): void {
    this.selectedRowId.set(radio);
    SimVar.SetSimVarValue(`K:RADIO_${radio === 'DME1' ? 'VOR3' : 'VOR4'}_IDENT_TOGGLE`, 'number', 0);
  }

  /** @inheritDoc */
  public onOpen(): void {
    const comRadioTransmitting = this.comTransmitSetting.get();

    this.selectedRowId.set(comRadioTransmitting);
    this.listRef.getOrDefault()?.scrollToIndex(comRadioTransmitting === 'COM1' ? 2 : 3, 2, false);
    if (this.gtcService.orientation === 'vertical') {
      this.gtcService.radioBeingTuned.set(comRadioTransmitting);
    }
  }

  /**
   * Responds to when a frequency button is pressed for a tunable radio row.
   * @param radio The radio to tune.
   */
  private async onFrequencyPressed(radio: TunableRadio): Promise<void> {
    this.selectedRowId.set(radio);

    const type = G3000RadioUtils.getRadioType(radio);

    let inputType: GtcFrequencyDialogInputType;
    switch (type) {
      case G3000RadioType.Nav:
        inputType = GtcFrequencyDialogInputType.Nav;
        break;
      case G3000RadioType.Adf:
        inputType = GtcFrequencyDialogInputType.Adf;
        break;
      case G3000RadioType.Com:
        inputType = this.comSpacing[radio as ComRadio].get() === ComSpacing.Spacing25Khz
          ? GtcFrequencyDialogInputType.Com25
          : GtcFrequencyDialogInputType.Com833;
        break;
    }

    const initialValue = this.radioFreqs[radio].standbyHz.get();
    const activeFrequency = this.radioFreqs[radio].activeHz.get();

    const result: GtcDialogResult<GtcFrequencyDialogResult> =
      await GtcNavComUtils
        .openPopup<GtcFrequencyDialog>(this.props.gtcService, GtcViewKeys.FrequencyDialog)
        .ref.request({
          title: `${this.radioNameFormatter(radio)} Standby`,
          type: inputType,
          initialValue,
          activeFrequency,
          showTransferButton: true,
          showFindButton: true,
          radio,
          showAdfModeButtons: type === G3000RadioType.Adf
        });

    if (!result.wasCancelled) {
      const { frequency, transfer } = result.payload;
      G3000RadioUtils.setStandbyRadioFrequency(radio, frequency);
      transfer && G3000RadioUtils.swapRadioFrequency(radio);
    }
  }

  /**
   * Render the volume sliders
   * @param value The consumer subject to read from
   * @param event The event string to write to, empty for dummy sliders
   * @param rowId The row to highlight, empty for dummy sliders
   * @returns The rendered volume slider
   */
  // TODO Volume slider pulls whole background with it
  private renderVolumeSlider(value: Subscribable<number>, event?: string, rowId?: string): VNode {
    return (
      <TouchSlider
        bus={this.bus}
        orientation='to-right'
        state={value.map(val => (val / 100))}
        isEnabled={Boolean(event)}
        // TODO Figure out why the params 'state' and 'slider' are needed in the onValueChanged callback
        /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
        onValueChanged={(changedValue, state, slider): void => {
          rowId && this.selectedRowId.set(rowId);
          event && SimVar.SetSimVarValue(`K:${event}`, 'number', changedValue * 100);
        }}
        foreground={
          <svg viewBox='0 0 1 1' preserveAspectRatio='none' class='vol-slider-occlude'>
            <path d='m 0 0 l 0 1 l 1 -1 z' />
          </svg>
        }
        focusOnDrag
        lockFocusOnDrag
        inhibitOnDrag
        changeValueOnDrag
        class='middle-col vol-slider'
      >
        <div class='vol-label'>{value.map(val => `${val.toFixed()}%`)}</div>
      </TouchSlider>
    );
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class="gtc-popup-panel gtc-nav-com-popup audio-radios-popup">
        <TabbedContainer configuration={TabConfiguration.Top} ref={this.tabsRef}>
          <TabbedContent position={1} label="Pilot">

            <div class='list-item header'>
              <span class='header-volume'>Volume</span>
              <span class='header-control'>Control</span>
            </div>
            <GtcList
              ref={this.listRef}
              bus={this.bus}
              sidebarState={this._sidebarState}
              itemsPerPage={4}
              listItemHeightPx={this.gtcService.isHorizontal ? 128 : 70}
              listItemSpacingPx={this.gtcService.isHorizontal ? 8 : 3}
            >
              {this.pilotRows = this.renderPilotRows()}
            </GtcList>

          </TabbedContent>
          <TabbedContent position={2} label="Copilot" disabled={true}></TabbedContent>
          <TabbedContent position={3} label="Pass" disabled={true}></TabbedContent>
        </TabbedContainer>
      </div>
    );
  }

  /**
   * Renders this popup's pilot tab rows.
   * @returns This popup's pilot tab rows, as a VNode.
   */
  private renderPilotRows(): VNode {
    return (
      <>
        {this.renderNavRadioRow('NAV1')}
        {this.renderNavRadioRow('NAV2')}

        {this.renderComRadioRow('COM1')}
        {this.renderComRadioRow('COM2')}

        <GtcAudioRadiosRow
          id='Speaker'
          selectedRowId={this.selectedRowId}
        >
          <GtcToggleTouchButton
            label='Speaker'
            class='left-col'
            state={Subject.create(false)}
            isEnabled={false}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
          />
          {this.renderVolumeSlider(Subject.create(100))}
          <div class='right-col' />
        </GtcAudioRadiosRow>

        <GtcAudioRadiosRow
          id='Recorder'
          selectedRowId={this.selectedRowId}
        >
          <GtcImgTouchButton
            label='Recorder'
            class='left-col recorder'
            imgSrc={BtnImagePathHor.PlayIcon}
            isEnabled={false}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
          />
          {this.renderVolumeSlider(Subject.create(100))}
          <div class='right-col split-col'>
            <GtcImgTouchButton
              class='flex-grow arrow'
              imgSrc={BtnImagePath.PlaybackBackward}
              isEnabled={false}
              isInList
              gtcOrientation={this.props.gtcService.orientation}
            />
            <GtcImgTouchButton
              class='flex-grow arrow'
              imgSrc={BtnImagePath.PlaybackForward}
              isEnabled={false}
              isInList
              gtcOrientation={this.props.gtcService.orientation}
            />
          </div>
        </GtcAudioRadiosRow>

        <GtcAudioRadiosRow
          id='Marker'
          selectedRowId={this.selectedRowId}
          onSelected={() => {
            // Set sidebar labels
            this._sidebarState.dualConcentricKnobLabel.set('');

            // Normally these would be volume labels, but since the sim doesn't support marker volume, we will leave
            // them blank.
            if (this.gtcService.isHorizontal) {
              this._sidebarState.mapKnobLabel.set('');
            } else {
              this._sidebarState.centerKnobLabel.set('');
            }
          }}
        >
          <GtcToggleTouchButton
            label='Marker'
            class='left-col'
            state={this.markerBeaconMonitoring}
            onPressed={() => {
              this.selectedRowId.set('Marker');
              SimVar.SetSimVarValue('K:MARKER_SOUND_TOGGLE', SimVarValueType.Number, 0);
            }}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
          />
          {this.renderVolumeSlider(Subject.create(100))}
          <GtcToggleTouchButton
            label='High Sense'
            class='left-col'
            state={this.markerBeaconHiSenseOn}
            onPressed={(button, state) => {
              this.selectedRowId.set('Marker');
              SimVar.SetSimVarValue('K:MARKER_BEACON_SENSITIVITY_HIGH', SimVarValueType.Number, state.get() ? 0 : 1);
            }}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
          />
        </GtcAudioRadiosRow>

        {this.props.radiosConfig.adfCount > 0 && this.renderAdfRadioRow('ADF1')}
        {this.props.radiosConfig.adfCount > 1 && this.renderAdfRadioRow('ADF2')}

        {this.props.radiosConfig.dmeCount > 0 && this.renderDmeRadioRow('DME1')}
        {this.props.radiosConfig.dmeCount > 1 && this.renderDmeRadioRow('DME2')}

        <GtcAudioRadiosRow
          id='Music'
          selectedRowId={this.selectedRowId}
        >
          <GtcToggleTouchButton
            label='Music'
            class='left-col'
            state={Subject.create(false)}
            isEnabled={false}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
          />
          {this.renderVolumeSlider(Subject.create(100))}
          <GtcTouchButton
            label='Mute Settings'
            class='left-col mute'
            isEnabled={false}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
          />
        </GtcAudioRadiosRow>

        <GtcAudioRadiosRow
          id='Clicks'
          selectedRowId={this.selectedRowId}
        >
          <GtcValueTouchButton
            label='Clicks'
            class='left-col clicks'
            state={Subject.create('Off')}
            isEnabled={false}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
          />
          {this.renderVolumeSlider(Subject.create(100))}
          <div class='right-col' />
        </GtcAudioRadiosRow>
      </>
    );
  }

  /**
   * Renders a NAV radio row.
   * @param radio The row's radio.
   * @returns A NAV radio row, as a VNode.
   */
  private renderNavRadioRow(radio: NavRadio): VNode {
    return (
      <GtcAudioRadiosRow
        id={radio}
        selectedRowId={this.selectedRowId}
        onSelected={this.selectRadio.bind(this, radio)}
        onGtcInteractionEvent={this.handleRadioInteractionEvent.bind(this, radio)}
        class='nav-row'
      >
        <GtcToggleTouchButton
          label={this.radioNameFormatter(radio)}
          class='left-col'
          state={this.navRadioMonitorSettings[radio].monitor}
          onPressed={(button, state) => {
            state.set(!state.get());
            this.onNavButtonPressed(radio);
          }}
          isInList
          gtcOrientation={this.props.gtcService.orientation}
        />
        {this.renderVolumeSlider(this.radioVolumes[radio], `${radio}_VOLUME_SET_EX1`, radio)}
        <GtcTouchButton
          class='right-col freq-button'
          onPressed={() => {
            this.onFrequencyPressed(radio);
          }}
          isInList
          gtcOrientation={this.props.gtcService.orientation}
        >
          <div>
            <div class={this.nav1ActFreqClasses}>{this.radioFreqs[radio].activeHz.map(GtcAudioRadiosPopup.NAV_FREQ_FORMATTER)}</div>
            <div class='stby-freq'>{this.radioFreqs[radio].standbyHz.map(GtcAudioRadiosPopup.NAV_FREQ_FORMATTER)}</div>
          </div>
          <div class='id-column'>
            <div class='nav-id'>{this.navIdentText[radio]}</div>
            <div class='nav-id'>{this.navIdentEnabledText[radio]}</div>
          </div>
        </GtcTouchButton>
      </GtcAudioRadiosRow>
    );
  }

  /**
   * Renders a COM radio row.
   * @param radio The row's radio.
   * @returns A COM radio row, as a VNode.
   */
  private renderComRadioRow(radio: ComRadio): VNode {
    return (
      <GtcAudioRadiosRow
        id={radio}
        selectedRowId={this.selectedRowId}
        onSelected={this.selectRadio.bind(this, radio)}
        onGtcInteractionEvent={this.handleRadioInteractionEvent.bind(this, radio)}
        class='com-row'
      >
        <div class='left-col split-col'>
          <GtcToggleTouchButton
            label={this.radioNameFormatter(radio)}
            class='com-button'
            state={this.radioMonitoring[radio]}
            onPressed={() => this.onComButtonPressed(radio)}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
          />
          <GtcToggleTouchButton
            label='MIC'
            class='mic-button'
            state={this.comTransmitSetting.map(transmitting => transmitting === radio)}
            onPressed={() => this.onMicButtonPressed(radio)}
            isInList
            gtcOrientation={this.props.gtcService.orientation}
          />
        </div>
        {this.renderVolumeSlider(this.radioVolumes[radio], `${radio}_VOLUME_SET`, radio)}
        <GtcTouchButton
          class='right-col freq-button flex-column'
          onPressed={() => {
            this.onFrequencyPressed(radio);
          }}
          isInList
          gtcOrientation={this.props.gtcService.orientation}
        >
          <div class={this.com1ActFreqClasses}>{this.comFreqText[radio].active}</div>
          <div class='stby-freq'>{this.comFreqText[radio].standby}</div>
        </GtcTouchButton>
      </GtcAudioRadiosRow>
    );
  }

  /**
   * Renders an ADF radio row.
   * @param radio The row's radio.
   * @returns An ADF radio row, as a VNode.
   */
  private renderAdfRadioRow(radio: AdfRadio): VNode {
    return (
      <GtcAudioRadiosRow
        id={radio}
        selectedRowId={this.selectedRowId}
        onSelected={this.selectRadio.bind(this, radio)}
        onGtcInteractionEvent={this.handleRadioInteractionEvent.bind(this, radio)}
        class='nav-row'
      >
        <GtcToggleTouchButton
          label={this.radioNameFormatter(radio)}
          class='left-col'
          state={this.radioMonitoring[radio]}
          onPressed={() => {
            this.onAdfButtonPressed(radio);
          }}
          isInList
          gtcOrientation={this.props.gtcService.orientation}
        />
        {this.renderVolumeSlider(this.radioVolumes[radio], radio === 'ADF1' ? 'ADF_VOLUME_SET' : 'ADF2_VOLUME_SET', radio)}
        <GtcTouchButton
          class='right-col freq-button'
          onPressed={() => {
            this.onFrequencyPressed(radio);
          }}
          isInList
          gtcOrientation={this.props.gtcService.orientation}
        >
          <div>
            <div class={ACTIVE_FREQ_CLASS}>{this.radioFreqs[radio].activeHz.map(GtcAudioRadiosPopup.ADF_FREQ_FORMATTER)}</div>
            <div class='stby-freq'>{this.radioFreqs[radio].standbyHz.map(GtcAudioRadiosPopup.ADF_FREQ_FORMATTER)}</div>
          </div>
          <div class='adf-mode-column'>
            <div class='adf-mode-title'>Mode</div>
            <div class='adf-mode-value'>ADF</div>
          </div>
        </GtcTouchButton>
      </GtcAudioRadiosRow>
    );
  }

  /**
   * Renders a DME radio row.
   * @param radio The row's radio.
   * @returns A DME radio row, as a VNode.
   */
  private renderDmeRadioRow(radio: DmeRadio): VNode {
    return (
      <GtcAudioRadiosRow
        id={radio}
        selectedRowId={this.selectedRowId}
        onSelected={this.selectRadio.bind(this, radio)}
        onGtcInteractionEvent={this.handleRadioInteractionEvent.bind(this, radio)}
        class='nav-row'
      >
        <GtcToggleTouchButton
          label={this.radioNameFormatter(radio)}
          class='left-col'
          state={this.radioMonitoring[radio]}
          onPressed={() => {
            this.onDmeButtonPressed(radio);
          }}
          isInList
          gtcOrientation={this.props.gtcService.orientation}
        />
        {this.renderVolumeSlider(this.radioVolumes[radio], radio === 'DME1' ? 'NAV3_VOLUME_SET_EX1' : 'NAV4_VOLUME_SET_EX1', radio)}
        <GtcTouchButton
          class='right-col freq-button'
          onPressed={() => {
            this.selectedRowId.set(radio);
            GtcNavComUtils.openPopup<GtcDmeModePopup>(this.props.gtcService, GtcAudioRadiosPopupKeys.DmeMode)
              .ref.setDmeRadio(radio, this.props.radiosConfig.dmeCount === 1);
          }}
          isInList
          gtcOrientation={this.props.gtcService.orientation}
        >
          <div class={ACTIVE_FREQ_CLASS}>{this.radioFreqs[radio].activeHz.map(GtcAudioRadiosPopup.NAV_FREQ_FORMATTER)}</div>
          <div class='dme-tune-mode'>
            {this.dmeTuneModeText[radio]}
          </div>
        </GtcTouchButton>
      </GtcAudioRadiosRow>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.tabsRef.getOrDefault()?.destroy();

    for (const radio in this.radioFreqs) {
      const freqs = this.radioFreqs[radio as Radio];

      freqs.standbySource.destroy();
      freqs.activeSource.destroy();

      this.radioMonitoring[radio as Radio].destroy();

      this.radioVolumes[radio as Radio].destroy();
    }

    this.comSpacing['COM1'].destroy();
    this.comSpacing['COM2'].destroy();

    this.navIdentText['NAV1'].destroy();
    this.navIdentText['NAV2'].destroy();

    this.navIdentEnabledText['NAV1'].destroy();
    this.navIdentEnabledText['NAV2'].destroy();

    this.dmeTuneModeText['DME1']?.destroy();
    this.dmeTuneModeText['DME2']?.destroy();

    this.markerBeaconMonitoring.destroy();
    this.markerBeaconHiSenseOn.destroy();

    super.destroy();
  }

  /**
   * Creates an uninitialized radio frequencies object.
   * @param radio The radio for which to create the object.
   * @returns A new uninitialized radio frequencies object for the specified radio.
   */
  private static createRadioFrequencies(radio: Radio): RadioFrequencies {
    const factor = G3000RadioUtils.getRadioType(radio) === G3000RadioType.Adf ? 1e3 : 1e6;

    const standbySource = ConsumerSubject.create(null, 0);
    const activeSource = ConsumerSubject.create(null, 0);

    return {
      standbySource,
      activeSource,
      standbyHz: standbySource.map(source => source * factor),
      activeHz: activeSource.map(source => source * factor)
    };
  }
}

/**
 * Component props for GtcAudioRadiosRow.
 */
interface GtcAudioRadiosRowProps extends ComponentProps {
  /** The row's ID. */
  id: string;

  /** The ID of the selected row. */
  selectedRowId: Subscribable<string>;

  /** A callback function to execute when the row is selected. */
  onSelected?: () => void;

  /** A callback function to execute when the row is unselected. */
  onDeselected?: () => void;

  /** A callback function to execute when the row receives an interaction event while selected. */
  onGtcInteractionEvent?: (event: GtcInteractionEvent) => boolean;

  /** CSS class(es) to apply to the row's root element. */
  class?: string | SubscribableSet<string>;
}

/**
 * A selectable row in a GTC audio and radios popup.
 */
class GtcAudioRadiosRow extends DisplayComponent<GtcAudioRadiosRowProps> implements GtcInteractionHandler {
  private readonly rootRef = FSComponent.createRef<GtcListItem>();

  private readonly borderCssClass = SetSubject.create([BORDER_CLASS, 'hidden']);

  private isSelectedSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    if (this.props.selectedRowId.get() === this.props.id) {
      this.props.onSelected && this.props.onSelected();
      this.borderCssClass.delete('hidden');
    }

    this.isSelectedSub = this.props.selectedRowId.sub(selected => {
      if (selected === this.props.id) {
        this.props.onSelected && this.props.onSelected();
        this.borderCssClass.delete('hidden');
      } else {
        this.props.onDeselected && this.props.onDeselected();
        this.borderCssClass.add('hidden');
      }
    });
  }

  /** @inheritdoc */
  public onGtcInteractionEvent(event: GtcInteractionEvent): boolean {
    return this.props.onGtcInteractionEvent === undefined ? false : this.props.onGtcInteractionEvent(event);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <GtcListItem class={this.props.class}>
        {this.props.children}
        <div class={this.borderCssClass}></div>
      </GtcListItem>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.rootRef.getOrDefault()?.destroy();

    this.isSelectedSub?.destroy();

    super.destroy();
  }
}