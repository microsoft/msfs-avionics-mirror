import {
  ConsumerSubject, ElectricalEvents, FSComponent, MappedSubject, NavComEvents, SimVarValueType, Subject, VNode, XPDRSimVarEvents
} from '@microsoft/msfs-sdk';

import { FrequencyInputFormat, InputField, KeyboardInputButton } from '@microsoft/msfs-epic2-shared';

import { TscTabContent, TscTabContentProps } from '../Components/TscTabContent';
import { DividerLine } from '../Shared/DividerLine';
import { NumberPad, NumButtonProps } from '../Shared/NumberPad';
import { TscButton, TscButtonStyles } from '../Shared/TscButton';
import { NavButtonConfigProps, TscIconButton } from '../Shared/TscIconButton';
import { XIcon } from '../Shared/XIcon';

import './ComTabContent.css';

/** The COM Tab Content props. */
interface ComTabContentProps extends TscTabContentProps {
  /** com scroll label */
  comScrollLabel: Subject<string>;
  /** com radio index. */
  index: 1 | 2,
}
/** The COM Tab Content. */
export class ComTabContent extends TscTabContent<ComTabContentProps> {
  private readonly radioSelection = Subject.create('COM1');
  public readonly radioSub = this.props.bus.getSubscriber<NavComEvents & XPDRSimVarEvents & ElectricalEvents>();

  private readonly activeCom1Freq = ConsumerSubject.create(this.radioSub.on('com_active_frequency_1'), 0);
  private readonly stbyCom1Freq = ConsumerSubject.create(this.radioSub.on('com_standby_frequency_1'), 0);
  private readonly activeCom2Freq = ConsumerSubject.create(this.radioSub.on('com_active_frequency_2'), 0);
  private readonly stbyCom2Freq = ConsumerSubject.create(this.radioSub.on('com_standby_frequency_2'), 0);
  private readonly com1Powered = ConsumerSubject.create(this.radioSub.on('elec_circuit_com_on_1'), false);
  private readonly com2Powered = ConsumerSubject.create(this.radioSub.on('elec_circuit_com_on_2'), false);
  private readonly selectedPowered = MappedSubject.create(([selected, com1Power, com2Power]) => selected === 'COM1' ? com1Power : com2Power, this.radioSelection, this.com1Powered, this.com2Powered);

  private readonly spacingCom1 = ConsumerSubject.create(this.radioSub.on(`com_spacing_mode_${this.props.index}`), 0);
  private readonly spacingCom2 = ConsumerSubject.create(this.radioSub.on(`com_spacing_mode_${this.props.index}`), 0);

  private readonly activeCom1FreqFormatted = MappedSubject.create(this.props.tscService.FrequencyFormatter, this.activeCom1Freq, this.spacingCom1, this.com1Powered);
  private readonly activeCom2FreqFormatted = MappedSubject.create(this.props.tscService.FrequencyFormatter, this.activeCom2Freq, this.spacingCom2, this.com2Powered);
  private readonly stbyCom1FreqFormatted = MappedSubject.create(this.props.tscService.FrequencyFormatter, this.stbyCom1Freq, this.spacingCom1, this.com1Powered);
  private readonly stbyCom2FreqFormatted = MappedSubject.create(this.props.tscService.FrequencyFormatter, this.stbyCom2Freq, this.spacingCom2, this.com2Powered);

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
  private readonly com1ButtonRef = FSComponent.createRef<HTMLInputElement>();
  private readonly com2ButtonRef = FSComponent.createRef<HTMLInputElement>();

  private swapButtonText = Subject.create('SWAP');
  private isActiveCom1 = Subject.create(true);
  private isActiveCom2 = Subject.create(false);

  private tempStbyCom1Data = Subject.create('');
  private tempStbyCom2Data = Subject.create('');

  private activeDisplay = MappedSubject.create(
    ([activeCom1FreqDisp, activeCom2FreqDisp, radioSelection]) => {
      switch (radioSelection) {
        case 'COM2':
          return activeCom2FreqDisp;
        case 'COM1':
        default:
          return activeCom1FreqDisp;
      }
    },
    this.activeCom1FreqFormatted,
    this.activeCom2FreqFormatted,
    this.radioSelection
  );

  private stbyDisplay = MappedSubject.create(
    ([stbyCom1FreqDisp, stbyCom2FreqDisp, tempStbyCom1Data, tempStbyCom2Data, radioSelection]) => {
      switch (radioSelection) {
        case 'COM2':
          return tempStbyCom2Data ? tempStbyCom2Data : stbyCom2FreqDisp;
        case 'COM1':
        default:
          return tempStbyCom1Data ? tempStbyCom1Data : stbyCom1FreqDisp;
      }
    },
    this.stbyCom1FreqFormatted,
    this.stbyCom2FreqFormatted,
    this.tempStbyCom1Data,
    this.tempStbyCom2Data,
    this.radioSelection
  );

  private readonly comButtonConfigs: NavButtonConfigProps[] = [
    {
      isActive: this.isActiveCom1,
      ref: this.com1ButtonRef,
      btnClass: 'com1-btn',
      textClass: 'com1-text',
      circleClass: 'com1-circle',
      text: 'COM1'
    },
    {
      isActive: this.isActiveCom2,
      ref: this.com2ButtonRef,
      btnClass: 'com2-btn',
      textClass: 'com2-text',
      circleClass: 'com2-circle',
      text: 'COM2'
    }
  ];

  private handleClickOnXIcon = (): void => {
    this.activeInputXIconRef.instance.addEventListener('click', () => {
      this.props.tscService.goToHomePage();
    });
  };

  /**
   * Gets the standby data subject for a given radio selection
   * @returns The standby data subject
   */
  private getStandbyDataForRadio(): Subject<string> {
    switch (this.radioSelection.get()) {
      case 'COM1':
        return this.tempStbyCom1Data;
      case 'COM2':
      default:
        return this.tempStbyCom2Data;
    }
  }

  /** Swaps the active and standby frequencies*/
  private swapActiveStandby(): void {
    SimVar.SetSimVarValue(`K:${this.radioSelection.get()}_RADIO_SWAP`, SimVarValueType.Number, 0);
    this.props.tscService.goToLastViewedTab();
  }

  private numPadClickSetup = (): void => {
    this.numButtons.forEach(button => {
      button.ref.instance.addEventListener('click', () => {
        const radioSubject = this.getStandbyDataForRadio();
        const originalText = radioSubject.get();

        if (button.value === '.' && originalText.endsWith('.')) {
          return;
        }

        let newText = originalText + button.value;
        if (newText.length === 3) {
          newText = newText + '.';
        }

        if (newText.length > 7) {
          return;
        }

        radioSubject.set(newText);
      });
    });
  };

  /**
   * Swaps or enters the frequencies depending on button state
   * @returns nothing
   */
  private handleSwapEnterPress(): void | Promise<void> {
    if (this.swapButtonText.get() === 'SWAP') {
      return SimVar.SetSimVarValue(`K:${this.radioSelection.get()}_RADIO_SWAP`, SimVarValueType.Number, 0);
    }

    const text = this.frequencyFormat.parse(this.stbyDisplay.get());

    if (text === null) {
      this.stbyInputRef.getOrDefault()?.inputBoxRef.getOrDefault()?.handleError();
    } else {
      SimVar.SetSimVarValue(`K:COM${this.radioSelection.get() === 'COM2' ? '2' : ''}_STBY_RADIO_SET_HZ`, SimVarValueType.Number, Number(text) * 1_000_000);
      this.swapButtonText.set('SWAP');
      this.tempStbyCom1Data.set('');
      this.tempStbyCom2Data.set('');
    }
  }

  private swapAndEnterButtonTextToggle = (): void => {
    const radioSubject = this.getStandbyDataForRadio();
    radioSubject.sub((value) => this.swapButtonText.set(value.length === 0 ? 'SWAP' : 'ENTER'));
  };

  /** Clears the standby input */
  private clearStbyInput(): void {
    const radioSubject = this.getStandbyDataForRadio();
    radioSubject.set('');
  }

  /** Backspaces the standby input */
  private backspaceStbyInput(): void {
    const radioSubject = this.getStandbyDataForRadio();
    radioSubject.set(radioSubject.get().slice(0, -1));
  }

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

  private activeToggleComButtons = (): void => {
    const buttonMappings = [
      { ref: this.com1ButtonRef, isActive: this.isActiveCom1, text: 'COM1' },
      { ref: this.com2ButtonRef, isActive: this.isActiveCom2, text: 'COM2' }
    ];

    buttonMappings.forEach(mapping => {
      mapping.ref.instance.addEventListener('click', () => {
        this.swapButtonText.set('SWAP');
        buttonMappings.forEach(innerMapping => innerMapping.isActive.set(false));
        mapping.isActive.set(true);
        this.radioSelection.set(mapping.text);
        this.props.comScrollLabel.set(mapping.text);
        this.swapAndEnterButtonTextToggle();
      });
    });
  };

  /** @inheritdoc */
  public override onAfterRender(): void {
    this.numPadClickSetup();
    this.activeToggleComButtons();
    this.swapAndEnterButtonTextToggle();
    this.handleClickOnXIcon();

    super.onAfterRender();
  }

  private readonly frequencyFormat = new FrequencyInputFormat();

  /** @inheritdoc */
  public render(): VNode {
    return <div class="tsc-com-tab-content" ref={this.rootRef}>
      <div class="com-active-input-container">
        <p class="com-active-input-label">{this.radioSelection} <span class={{ 'com-active-input': true, 'powered': this.selectedPowered }}>{this.activeDisplay}</span></p>
        <KeyboardInputButton bus={this.props.bus} classes='keyboard-button' />
        <XIcon ref={this.activeInputXIconRef} />
      </div>
      <DividerLine class="tsc-divider-line" />
      <div class="stby-number-pad-and-com-buttons">
        <div class="stby-and-number-pad">
          <div class={{ 'com-stby-input-container': true, 'powered': this.selectedPowered }}>
            <InputField
              ref={this.stbyInputRef}
              topLabel={'STBY'}
              onModified={(input) => this.handleStbyInput(input)}
              bind={this.stbyDisplay}
              class='com-stby-input'
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
          <div class="com-number-pad-container">
            <NumberPad numButtons={this.numButtons} />
          </div>
        </div>
        <div class="com-number-pad-options-container">
          <div class="number-pad-options-buttons">
            <TscButton label='SWAP/ CLOSE' variant="base" onPressed={() => this.swapActiveStandby()} styles={this.numpadOptionButtonStyles} />
            <TscButton label='DELETE' variant="base" onPressed={() => this.backspaceStbyInput()} styles={this.numpadOptionButtonStyles} />
            <TscButton label='CLEAR' variant="base" onPressed={() => this.clearStbyInput()} styles={this.numpadOptionButtonStyles} />
            <TscButton label='+/-' variant="base" isEnabled={false} styles={this.numpadOptionButtonStyles} />
          </div>
          <div class="com-swap-button-container">
            <TscButton label={this.swapButtonText} variant="base" onPressed={() => this.handleSwapEnterPress()} styles={this.swapButtonStyles} />
          </div>
        </div>
        <div class="com-buttons-container">
          <div class="com-buttons">
            {this.comButtonConfigs.map((config) => (
              <TscIconButton config={config} />
            ))}
          </div>
        </div>
      </div>
    </div>;
  }
}
