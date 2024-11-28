import {
  AvionicsSystemState, ConsumerSubject, ControlEvents, FSComponent, MappedSubject, NavComEvents, Subject, Subscription, VNode, XPDRSimVarEvents
} from '@microsoft/msfs-sdk';

import {
  Epic2CockpitEvents, Epic2TransponderEvents, InputField, KeyboardInputButton, NavComUserSettingManager, TransponderInputFormat, XpdrSystemEvents
} from '@microsoft/msfs-epic2-shared';

import { TscTabContent, TscTabContentProps } from '../Components/TscTabContent';
import { DividerLine } from '../Shared/DividerLine';
import { NumberPad, NumButtonProps } from '../Shared/NumberPad';
import { TscButton, TscButtonStyles } from '../Shared/TscButton';
import { XIcon } from '../Shared/XIcon';

import './XpdrTabContent.css';

/** The XPDR Tab Content props. */
interface XpdrTabContentProps extends TscTabContentProps {
  /** Xpdr index. */
  index: 1 | 2,
  /** The NAV/COM user settings. */
  navComSettings: NavComUserSettingManager,
}
/** The XPDR Tab Content. */
export class XpdrTabContent extends TscTabContent<XpdrTabContentProps> {
  public readonly radioSub = this.props.bus.getSubscriber<NavComEvents & XPDRSimVarEvents & XpdrSystemEvents>();

  private readonly xpdrState = ConsumerSubject.create(this.radioSub.on('xpdr_state_1'), null);
  private readonly xpdrPowered = this.xpdrState.map((state) => state?.current === AvionicsSystemState.On);
  private readonly xpdrCode = ConsumerSubject.create(this.radioSub.on('xpdr_code_1'), 0);
  private readonly xpdrCodeFormatted = MappedSubject.create(([code, powered]) => powered ? code.toFixed().padStart(4, '0') : '----', this.xpdrCode, this.xpdrPowered);

  private readonly numpadOptionButtonStyles: TscButtonStyles = {
    height: '62px',
    width: '115px',
    fontSize: '22px',
    backgroundColor: 'var(--epic2-color-darker-grey)',
    color: 'var(--epic2-color-white)',
    border: '2px solid var(--epic2-color-light-grey)',
    margin: '0px 0px 23px 0px'
  };

  private readonly enterButtonStyle: TscButtonStyles = {
    height: '62px',
    width: '183px',
    fontSize: '22px',
    backgroundColor: 'var(--epic2-color-darker-grey)',
    color: 'var(--epic2-color-white)',
    border: '2px solid var(--epic2-color-light-grey)',
    margin: '18px 0px 24px 0px'
  };

  private readonly identAndVfrButtonStyles: TscButtonStyles = {
    height: '62px',
    width: '115px',
    fontSize: '22px',
    backgroundColor: 'var(--epic2-color-darker-grey)',
    color: 'var(--epic2-color-white)',
    border: '2px solid var(--epic2-color-light-grey)',
    margin: '0px 0px 22px 0px'
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

  private activeInputLabel = Subject.create('XPDR');
  private tempStbyXpdrData = Subject.create('');

  private stbyDisplay = MappedSubject.create(
    ([stbyXpdrDisp, tempStbyXpdrData]) => tempStbyXpdrData ? tempStbyXpdrData : stbyXpdrDisp,
    this.xpdrCodeFormatted,
    this.tempStbyXpdrData,
  );

  readonly rootRef = FSComponent.createRef<HTMLDivElement>();
  readonly subscriber = this.props.bus.getSubscriber<Epic2CockpitEvents>();

  subs: Subscription[] = [];

  private handleClickOnXIcon = (): void => {
    this.activeInputXIconRef.instance.addEventListener('click', () => {
      this.props.tscService.goToHomePage();
    });
  };

  /** Sets the standby to the active and closes the tab */
  private setStandbyToActiveAndClose(): void {
    this.props.bus.getPublisher<Epic2TransponderEvents>().pub('epic2_xpdr_set_code', Number(this.stbyDisplay.get()), true);
    this.props.tscService.goToLastViewedTab();
  }

  private numPadClickSetup = (): void => {
    this.numButtons.forEach(button => {
      button.ref.instance.addEventListener('click', () => {
        const newText = this.tempStbyXpdrData.get() + button.value;
        if (newText.length > 4) {
          return;
        }
        this.tempStbyXpdrData.set(newText);
      });
    });
  };

  /** Swaps or enters the frequencies depending on button state */
  private async handleEnterPress(): Promise<void> {
    const text = await this.xpdrFormat.parse(this.stbyDisplay.get());

    if (text === null) {
      this.stbyInputRef.getOrDefault()?.inputBoxRef.getOrDefault()?.handleError();
    } else {
      this.props.bus.getPublisher<Epic2TransponderEvents>().pub('epic2_xpdr_set_code', Number(text), true);
      this.tempStbyXpdrData.set('');
    }
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    this.handleClickOnXIcon();
    this.numPadClickSetup();
    this.setStandbyToActiveAndClose();

    super.onAfterRender();
  }

  private readonly xpdrFormat = new TransponderInputFormat();

  /** @inheritdoc */
  public render(): VNode {
    return <div class="tsc-xpdr-tab-content" ref={this.rootRef}>
      <div class="xpdr-active-input-container">
        <p class={'xpdr-active-input-label'}>{this.activeInputLabel} <span class={{ 'xpdr-active-input': true, 'powered': this.xpdrPowered }}>{this.xpdrCodeFormatted}</span></p>
        <KeyboardInputButton bus={this.props.bus} classes='keyboard-button' />
        <XIcon ref={this.activeInputXIconRef} />
      </div>

      <DividerLine class="tsc-divider-line" />
      <div class="stby-number-pad-and-xpdr-buttons">
        <div class="stby-and-number-pad">
          <div class={{ 'xpdr-stby-input-container': true, 'powered': this.xpdrPowered }}>
            <InputField
              ref={this.stbyInputRef}
              onModified={async (input) => { this.tempStbyXpdrData.set(input); return true; }}
              bind={this.stbyDisplay}
              class='xpdr-stby-input'
              textAlign={'right'}
              maxLength={4}
              bus={this.props.bus}
              formatter={this.xpdrFormat}
            />
            <svg class="br-circle-half-circle-svg" xmlns="http://www.w3.org/2000/svg" viewBox="60 34 29 30">
              <path d="M 78 39 C 65 39 64 57 78 57 M 61 48 L 68 48 M 87 48 L 78 48 " stroke-width="2" fill="none" />
              <circle cx="77" cy="48" r="4" />
            </svg>
          </div>

          <div class="xpdr-number-pad-container">
            <NumberPad numButtons={this.numButtons} />
          </div>
        </div>
        <div class="xpdr-number-pad-options-container">
          <div class="number-pad-options-buttons">
            <TscButton label='APPLY/ CLOSE' variant="base" onPressed={() => this.setStandbyToActiveAndClose()} styles={this.numpadOptionButtonStyles} />
            <TscButton label='DELETE' variant="base" onPressed={() => this.tempStbyXpdrData.set(this.tempStbyXpdrData.get().slice(0, -1))} styles={this.numpadOptionButtonStyles} />
            <TscButton label='CLEAR' variant="base" onPressed={() => this.tempStbyXpdrData.set('')} styles={this.numpadOptionButtonStyles} />
            <TscButton label='+/-' variant="base" ref={this.plusMinusButtonRef} styles={this.numpadOptionButtonStyles} />
          </div>

          <div class="xpdr-swap-button-container">
            <TscButton label={'ENTER'} variant="base" onPressed={() => this.handleEnterPress()} styles={this.enterButtonStyle} />
          </div>
        </div>
        <div class="xpdr-buttons-container">
          <div class="xpdr-buttons">
            <TscButton label='IDENT' variant="base" onPressed={() => this.props.bus.getPublisher<ControlEvents>().pub('xpdr_send_ident_1', true)} styles={this.identAndVfrButtonStyles} />
            <TscButton label='VFR' variant="base" onPressed={() => this.props.bus.getPublisher<Epic2TransponderEvents>().pub('epic2_xpdr_toggle_vfr_code', true, true)} styles={this.identAndVfrButtonStyles} />
          </div>
        </div>
      </div>
    </div>;
  }

  /** @inheritdoc */
  public destroy(): void {
    this.subs.map((sub) => sub.destroy());
  }
}


