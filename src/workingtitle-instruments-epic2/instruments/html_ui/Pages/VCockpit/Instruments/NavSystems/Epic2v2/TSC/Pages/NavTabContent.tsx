import {
  AvionicsSystemState, ComSpacing, ConsumerSubject, ElectricalEvents, FSComponent, MappedSubject, NavComEvents, SimVarValueType, Subject, Subscribable, VNode,
  XPDRSimVarEvents
} from '@microsoft/msfs-sdk';

import { AdfSystemEvents, Epic2InputFormatters, Epic2InputParsers, FormatterValidator, InputField, KeyboardInputButton } from '@microsoft/msfs-epic2-shared';

import { TscTabContent, TscTabContentProps } from '../Components/TscTabContent';
import { DividerLine } from '../Shared/DividerLine';
import { NumberPad, NumButtonProps } from '../Shared/NumberPad';
import { TscButton, TscButtonStyles } from '../Shared/TscButton';
import { NavButtonConfigProps, TscIconButton } from '../Shared/TscIconButton';
import { XIcon } from '../Shared/XIcon';

import './NavTabContent.css';

/** Format for nav radio frequency. */
class NavFrequencyInputFormat implements FormatterValidator<string> {
  /** @inheritDoc */
  constructor(private adfActive: Subscribable<boolean>, private nullValueDisplay = '□□□□□') {
    this.adfActive.sub((active) => {
      if (active) {
        this.parse = Epic2InputParsers.AdfFrequency();
      } else {
        this.parse = Epic2InputParsers.VhfFrequency(108, 117.975);
      }
    }, true);

  }
  /** @inheritDoc */
  parse = Epic2InputParsers.VhfFrequency(108, 117.975);
  /** @inheritDoc */
  format = Epic2InputFormatters.PlainText();
  nullValueString = this.nullValueDisplay;
}

/** The NAV Tab Content props. */
export interface NavTabContentProps extends TscTabContentProps {
  /** nav scroll label */
  navScrollLabel: Subject<string>;
  /** Nav radio index. */
  index: 1 | 2,
}
/** The Nav Tab Content. */
export class NavTabContent extends TscTabContent<NavTabContentProps> {
  private radioSelection = Subject.create('NAV1');
  public readonly radioSub = this.props.bus.getSubscriber<NavComEvents & XPDRSimVarEvents & ElectricalEvents & AdfSystemEvents>();

  private readonly activeNav1Freq = ConsumerSubject.create(this.radioSub.on('nav_active_frequency_1'), 0);
  private readonly stbyNav1Freq = ConsumerSubject.create(this.radioSub.on('nav_standby_frequency_1'), 0);
  private readonly activeNav2Freq = ConsumerSubject.create(this.radioSub.on('nav_active_frequency_2'), 0);
  private readonly stbyNav2Freq = ConsumerSubject.create(this.radioSub.on('nav_standby_frequency_2'), 0);
  private readonly activeAdfFreq = ConsumerSubject.create(this.radioSub.on('adf_active_frequency_1'), 0);
  private readonly nav1Powered = ConsumerSubject.create(this.radioSub.on('elec_circuit_nav_on_1'), false);
  private readonly nav2Powered = ConsumerSubject.create(this.radioSub.on('elec_circuit_nav_on_2'), false);
  private readonly adfState = ConsumerSubject.create(this.radioSub.on('adf_state_1'), null);
  private readonly adfPowered = this.adfState.map((state) => state?.current === AvionicsSystemState.On);
  private readonly selectedPowered = MappedSubject.create(([selected, nav1Power, nav2Power, adfPower]) => selected === 'NAV1' ? nav1Power : selected === 'NAV2' ? nav2Power : adfPower,
    this.radioSelection, this.nav1Powered, this.nav2Powered, this.adfPowered);

  private readonly spacing = Subject.create(ComSpacing.Spacing25Khz);

  private readonly activeNav1FreqFormatted = MappedSubject.create(this.props.tscService.FrequencyFormatter, this.activeNav1Freq, this.spacing, this.nav1Powered);
  private readonly activeNav2FreqFormatted = MappedSubject.create(this.props.tscService.FrequencyFormatter, this.activeNav2Freq, this.spacing, this.nav2Powered);
  private readonly activeAdfFreqFormatted = MappedSubject.create(([freq, powered]) => powered ? freq.toFixed(1) : '---.-', this.activeAdfFreq, this.adfPowered);
  private readonly stbyNav1FreqFormatted = MappedSubject.create(this.props.tscService.FrequencyFormatter, this.stbyNav1Freq, this.spacing, this.nav1Powered);
  private readonly stbyNav2FreqFormatted = MappedSubject.create(this.props.tscService.FrequencyFormatter, this.stbyNav2Freq, this.spacing, this.nav2Powered);

  private readonly numpadOptionButtonStyles: TscButtonStyles = {
    height: '62px',
    width: '115px',
    fontSize: '22px',
    backgroundColor: 'var(--epic2-color-darker-grey)',
    color: 'var(--epic2-color-white)',
    border: '2px solid var(--epic2-color-light-grey)',
    margin: '0px 0px 23px 0px'
  };

  private readonly swapButtonStyles: TscButtonStyles = {
    height: '62px',
    width: '183px',
    fontSize: '22px',
    backgroundColor: 'var(--epic2-color-darker-grey)',
    color: 'var(--epic2-color-white)',
    border: '2px solid var(--epic2-color-light-grey)',
    margin: '18px 0px 24px 0px'
  };

  private readonly numButtons: NumButtonProps[] = [
    { ref: FSComponent.createRef<HTMLElement>(), value: '1' },
    { ref: FSComponent.createRef<HTMLElement>(), value: '2' },
    { ref: FSComponent.createRef<HTMLElement>(), value: '3' },
    { ref: FSComponent.createRef<HTMLElement>(), value: '4' },
    { ref: FSComponent.createRef<HTMLElement>(), value: '5' },
    { ref: FSComponent.createRef<HTMLElement>(), value: '6' },
    { ref: FSComponent.createRef<HTMLElement>(), value: '7' },
    { ref: FSComponent.createRef<HTMLElement>(), value: '8' },
    { ref: FSComponent.createRef<HTMLElement>(), value: '9' },
    { ref: FSComponent.createRef<HTMLElement>(), value: '/' },
    { ref: FSComponent.createRef<HTMLElement>(), value: '0' },
    { ref: FSComponent.createRef<HTMLElement>(), value: '.' },
  ];
  private readonly stbyInputRef = FSComponent.createRef<InputField<string>>();
  private readonly activeInputXIconRef = FSComponent.createRef<HTMLInputElement>();
  private readonly plusMinusButtonRef = FSComponent.createRef<HTMLInputElement>();
  private readonly nav1ButtonRef = FSComponent.createRef<HTMLInputElement>();
  private readonly nav2ButtonRef = FSComponent.createRef<HTMLInputElement>();
  private readonly adfButtonRef = FSComponent.createRef<HTMLInputElement>();

  private swapButtonText = Subject.create('SWAP');
  private isActiveNav1 = Subject.create(true);
  private isActiveNav2 = Subject.create(false);
  private isActiveAdf = Subject.create(false);

  private tempStbyNav1Data = Subject.create('');
  private tempStbyNav2Data = Subject.create('');
  private tempActiveAdfData = Subject.create('');

  private activeDisplay = MappedSubject.create(
    ([activeNav1FreqDisp, activeNav2FreqDisp, activeAdfFreqDisplay, radioSelection]) => {
      switch (radioSelection) {
        case 'NAV1':
          return activeNav1FreqDisp;
        case 'NAV2':
          return activeNav2FreqDisp;
        case 'ADF':
          return activeAdfFreqDisplay;
        default:
          return activeNav1FreqDisp;
      }
    },
    this.activeNav1FreqFormatted,
    this.activeNav2FreqFormatted,
    this.activeAdfFreqFormatted,
    this.radioSelection
  );

  private stbyDisplay = MappedSubject.create(
    ([stbyNav1FreqDisp, stbyNav2FreqDisp, activeAdfFreqDisplay, tempStbyNav1Data, tempStbyNav2Data, tempActiveAdfData, radioSelection]) => {

      switch (radioSelection) {
        case 'NAV1':
          return tempStbyNav1Data ? tempStbyNav1Data : stbyNav1FreqDisp;
        case 'NAV2':
          return tempStbyNav2Data ? tempStbyNav2Data : stbyNav2FreqDisp;
        case 'ADF':
          return tempActiveAdfData ? tempActiveAdfData : activeAdfFreqDisplay;
        default:
          return tempStbyNav1Data ? tempStbyNav1Data : stbyNav1FreqDisp;
      }
    },
    this.stbyNav1FreqFormatted,
    this.stbyNav2FreqFormatted,
    this.activeAdfFreqFormatted,
    this.tempStbyNav1Data,
    this.tempStbyNav2Data,
    this.tempActiveAdfData,
    this.radioSelection
  );

  private readonly navButtonConfigs: NavButtonConfigProps[] = [
    {
      isActive: this.isActiveNav1,
      ref: this.nav1ButtonRef,
      btnClass: 'nav1-btn',
      textClass: 'nav1-text',
      circleClass: 'nav1-circle',
      text: 'NAV1'
    },
    {
      isActive: this.isActiveNav2,
      ref: this.nav2ButtonRef,
      btnClass: 'nav2-btn',
      textClass: 'nav2-text',
      circleClass: 'nav2-circle',
      text: 'NAV2'
    },
    {
      isActive: this.isActiveAdf,
      ref: this.adfButtonRef,
      btnClass: 'adf-btn',
      textClass: 'adf-text',
      circleClass: 'adf-circle',
      text: 'ADF'
    }
  ];

  private handleClickOnXIcon = (): void => {
    this.activeInputXIconRef.instance.addEventListener('click', () => {
      this.props.tscService.goToHomePage();
    });
  };

  /**
   * Handles any input from the standby entry tab
   * @param input The input
   * @returns true
   */
  private async handleStbyInput(input: string): Promise<boolean> {
    const radioSubject = this.getStandbyDataForRadio();
    radioSubject.set(input);

    return true;
  }

  /** Swaps the active and standby frequencies */
  private swapActiveStandby(): void {
    SimVar.SetSimVarValue(`K:${this.radioSelection.get()}_RADIO_SWAP`, SimVarValueType.Number, 0);
    this.props.tscService.goToLastViewedTab();
  }

  /**
   * Gets the standby data subject for a given radio selection
   * @returns The standby data subject
   */
  private getStandbyDataForRadio(): Subject<string> {
    switch (this.radioSelection.get()) {
      case 'NAV1':
        return this.tempStbyNav1Data;
      case 'NAV2':
        return this.tempStbyNav2Data;
      case 'ADF':
      default:
        return this.tempActiveAdfData;
    }
  }

  private numPadClickSetup = (): void => {
    this.numButtons.forEach(button => {
      button.ref.instance.addEventListener('click', () => {
        const radioSelection = this.radioSelection.get();
        const originalText = this.getStandbyDataForRadio().get();

        if (button.value === '.' && originalText.endsWith('.')) {
          return;
        }

        let newText = originalText + button.value;
        if (radioSelection !== 'ADF' && newText.length === 3) {
          newText = newText + '.';
        }

        if ((radioSelection === 'ADF' && newText.length > 6) || newText.length > 7) {
          return;
        }

        this.getStandbyDataForRadio().set(newText);
      });
    });
  };

  /**
   * Swaps or enters the frequencies depending on button state
   * @returns nothing
   */
  private handleSwapEnterPress(): void | Promise<void> {
    const radioSelection = this.radioSelection.get();
    if (this.swapButtonText.get() === 'SWAP') {
      return SimVar.SetSimVarValue(`K:${radioSelection}_RADIO_SWAP`, SimVarValueType.Number, 0);
    }

    const text = this.frequencyFormat.parse(this.stbyDisplay.get());

    if (text === null) {
      this.stbyInputRef.getOrDefault()?.inputBoxRef.getOrDefault()?.handleError();
    } else {
      if (radioSelection === 'ADF') {
        SimVar.SetSimVarValue('K:ADF_ACTIVE_SET', 'Frequency ADF BCD32', Avionics.Utils.make_adf_bcd32(Number(text) * 1_000));
      } else {
        SimVar.SetSimVarValue(`K:${radioSelection}_STBY_SET_HZ`, 'Hz', Number(text) * 1000000);
      }

      this.swapButtonText.set('SWAP');
      this.tempStbyNav1Data.set('');
      this.tempStbyNav2Data.set('');
      this.tempActiveAdfData.set('');
    }
  }

  private swapAndEnterButtonTextToggle = (): void => {
    const radioSubject = this.getStandbyDataForRadio();
    radioSubject.sub((value) => this.swapButtonText.set(value.length === 0 ? 'SWAP' : 'ENTER'));
  };

  /** Clears standby input */
  private clearStbyInput(): void {
    const radioSubject = this.getStandbyDataForRadio();
    radioSubject.set('');
  }

  /**
   * Backspaces the standby input
   */
  private backspaceStbyInput(): void {
    const radioSubject = this.getStandbyDataForRadio();
    radioSubject.set(radioSubject.get().slice(0, -1));
  }

  private activeToggleNavButtons = (): void => {
    const buttonMappings = [
      { ref: this.nav1ButtonRef, isActive: this.isActiveNav1, text: 'NAV1' },
      { ref: this.nav2ButtonRef, isActive: this.isActiveNav2, text: 'NAV2' },
      { ref: this.adfButtonRef, isActive: this.isActiveAdf, text: 'ADF' },
    ];

    buttonMappings.forEach(mapping => {
      mapping.ref.instance.addEventListener('click', () => {
        this.swapButtonText.set('SWAP');
        buttonMappings.forEach(innerMapping => innerMapping.isActive.set(false));
        mapping.isActive.set(true);
        this.radioSelection.set(mapping.text);
        this.props.navScrollLabel.set(mapping.text);
        this.swapAndEnterButtonTextToggle();
      });
    });
  };

  /** @inheritdoc */
  public override onAfterRender(): void {
    this.numPadClickSetup();
    this.activeToggleNavButtons();
    this.swapAndEnterButtonTextToggle();
    this.handleClickOnXIcon();

    super.onAfterRender();
  }

  private readonly frequencyFormat = new NavFrequencyInputFormat(this.isActiveAdf);

  /** @inheritdoc */
  public render(): VNode {
    return <div class="tsc-nav-tab-content" ref={this.rootRef}>
      <div class='nav-active-input-container' >
        <p class={'nav-active-input-label'}>{this.radioSelection} <span class={{ 'nav-active-input': true, 'powered': this.selectedPowered }}>{this.activeDisplay}</span></p>
        <KeyboardInputButton bus={this.props.bus} classes='keyboard-button' />
        <XIcon ref={this.activeInputXIconRef} />
      </div>

      <DividerLine class="tsc-divider-line" />
      <div class="stby-number-pad-and-nav-buttons">
        <div class="stby-and-number-pad">
          <div class={{ 'nav-stby-input-container': true, 'powered': this.selectedPowered }}>
            <InputField
              ref={this.stbyInputRef}
              topLabel={this.isActiveAdf.map((adfActive) => adfActive ? 'ADF ' : 'STBY')}
              onModified={(input) => this.handleStbyInput(input)}
              bind={this.stbyDisplay}
              class='nav-stby-input'
              textAlign={'right'}
              maxLength={7}
              bus={this.props.bus}
              formatter={this.frequencyFormat}
            />
            <svg class="br-circle-half-circle-svg" xmlns="http://www.w3.org/2000/svg" viewBox="60 34 29 30">
              <path d="M 78 39 C 65 39 64 57 78 57 M 61 48 L 68 48 M 87 48 L 78 48 " stroke-width="2" fill="none" />
              <circle cx="77" cy="48" r="4" />
            </svg>
          </div>

          <div class="nav-number-pad-container">
            <NumberPad numButtons={this.numButtons} />
          </div>
        </div>
        <div class="nav-number-pad-options-container">
          <div class="number-pad-options-buttons">
            <TscButton label='SWAP/ CLOSE' variant="base" onPressed={() => this.swapActiveStandby()} styles={this.numpadOptionButtonStyles} />
            <TscButton label='DELETE' variant="base" onPressed={() => this.backspaceStbyInput()} styles={this.numpadOptionButtonStyles} />
            <TscButton label='CLEAR' variant="base" onPressed={() => this.clearStbyInput()} styles={this.numpadOptionButtonStyles} />
            <TscButton label='+/-' variant="base" isEnabled={false} ref={this.plusMinusButtonRef} styles={this.numpadOptionButtonStyles} />
          </div>

          <div class="nav-swap-button-container">
            <TscButton label={this.swapButtonText} variant="base" onPressed={() => this.handleSwapEnterPress()} styles={this.swapButtonStyles} />
          </div>
        </div>
        <div class="navigation-buttons-container">
          <div class="navigation-buttons">
            {this.navButtonConfigs.map((config) => (
              <TscIconButton config={config} />
            ))}
          </div>
        </div>
      </div>
    </div>;
  }
}
