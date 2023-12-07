/* eslint-disable max-len */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {
  ComponentProps, ControlPublisher, EventBus, FrequencyBank, FrequencyChangeEvent, FSComponent, IdentChangeEvent, NavComEvents, NavEvents, NavSourceId, NavSourceType, Radio,
  RadioEvents, RadioType, VNode,
} from '@microsoft/msfs-sdk';

import { ComRadioSpacingSettingMode, ComRadioUserSettings } from '@microsoft/msfs-garminsdk';

import { AvionicsComputerSystemEvents } from '../Systems/AvionicsComputerSystem';
import { AvionicsSystemState, AvionicsSystemStateEvent } from '../Systems/G1000AvionicsSystem';
import { FmsHEvent, G1000UiControl } from '../UI';

import './NavComFrequencyElement.css';

/** Props for the NavComFrequencyElement. */
interface NavComFrequencyElementProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
  /** The position of the navcom frequency element. */
  position: 'left' | 'right';
  /** The type of radio that we represent */
  type: RadioType;
  /** The index number of the radio with this element */
  index: number;
  /** The template ID of the instrument with this element. */
  templateId: string
}

/**
 * Representation of the active and standby frequencies of a nav or com radio.
 */
export class NavComFrequencyElement extends G1000UiControl<NavComFrequencyElementProps> {
  private readonly controlPadFrequencyInputMap: Map<FmsHEvent, number> = new Map([
    [FmsHEvent.D0, 0],
    [FmsHEvent.D1, 1],
    [FmsHEvent.D2, 2],
    [FmsHEvent.D3, 3],
    [FmsHEvent.D4, 4],
    [FmsHEvent.D5, 5],
    [FmsHEvent.D6, 6],
    [FmsHEvent.D7, 7],
    [FmsHEvent.D8, 8],
    [FmsHEvent.D9, 9],
    [FmsHEvent.Dot, -1],
  ]);



  private containerRef = FSComponent.createRef<HTMLElement>();
  private selectorBorderElement = FSComponent.createRef<HTMLElement>();
  private selectorArrowElement = FSComponent.createRef<HTMLElement>();
  private activeFreq = FSComponent.createRef<HTMLElement>();
  private standbyFreq = FSComponent.createRef<HTMLElement>();

  private comInputDigit0 = FSComponent.createRef<HTMLElement>();
  private comInputDigit1 = FSComponent.createRef<HTMLElement>();
  private comInputDigit2 = FSComponent.createRef<HTMLElement>();
  private comInputDigit3 = FSComponent.createRef<HTMLElement>();
  private comInputDigit4 = FSComponent.createRef<HTMLElement>();
  private comInputDigit5 = FSComponent.createRef<HTMLElement>();
  private comInputDigit6 = FSComponent.createRef<HTMLElement>();

  private comInputDigits = (this.props.type === RadioType.Com) ?
    [this.comInputDigit0, this.comInputDigit1, this.comInputDigit2, this.comInputDigit3, this.comInputDigit4, this.comInputDigit5, this.comInputDigit6] :
    [this.comInputDigit0, this.comInputDigit1, this.comInputDigit2, this.comInputDigit3, this.comInputDigit4, this.comInputDigit5];

  private ident = FSComponent.createRef<HTMLElement>();

  private isFailed = false;
  private selected = false;

  private isInInputMode = false;
  private radioState: Radio | undefined;

  private digitPosition = 0;
  private previousFrequency = 0;
  private newFrequencyAsString = '';
  private validNextDigitSpace = [1];

  private readonly comRadioSettingManager = ComRadioUserSettings.getManager(this.props.bus);
  private readonly controlPublisher = new ControlPublisher(this.props.bus);

  /**
   * Set this frequency as the active selection visually.
   * @param isSelected Indicates if the frequency should show as selected or not.
   */
  setSelected(isSelected: boolean): void {
    if (this.selectorBorderElement.instance !== null && this.selectorArrowElement.instance !== null) {
      this.selectorBorderElement.instance.style.display = isSelected ? '' : 'none';
      this.selectorArrowElement.instance.style.visibility = isSelected ? 'visible' : 'hidden';
    }
  }

  /**
   * Stuff to do after rendering.
   */
  public onAfterRender(): void {
    const nav = this.props.bus.getSubscriber<RadioEvents>();
    nav.on('set_radio_state').handle(this.onUpdateState);
    nav.on('set_frequency').handle(this.onUpdateFrequency);
    nav.on('set_ident').handle(this.onUpdateIdent);
    nav.on('set_signal_strength').handle(this.onUpdateSignalStrength);
    if (this.props.position === 'left') {
      const navproc = this.props.bus.getSubscriber<NavEvents>();
      navproc.on('cdi_select').handle(this.onUpdateCdiSelect);
    }

    this.props.bus.getSubscriber<AvionicsComputerSystemEvents>()
      .on('avionicscomputer_state_1')
      .handle(this.onComputerStateChanged.bind(this));

    this.props.bus.getSubscriber<AvionicsComputerSystemEvents>()
      .on('avionicscomputer_state_2')
      .handle(this.onComputerStateChanged.bind(this));

    this.standbyFreq.instance.style.display = '';
    this.comInputDigits.every(digit => {
      digit.instance.style.display = 'none';
      return true;
    });

    if (this.props.type === RadioType.Com) {
      this.props.bus.getSubscriber<NavComEvents>().on(`com_transmit_${this.props.index === 1 ? 1 : 2}`).handle(this.onComTransmitChange.bind(this));
    }

    this.controlPublisher.startPublish();
  }

  /**
   * A callaback called when the system screen state changes.
   * @param state The state change event to handle.
   */
  private onComputerStateChanged(state: AvionicsSystemStateEvent): void {
    if (state.index === this.props.index) {
      if (state.previous === undefined && state.current !== AvionicsSystemState.Off) {
        this.setFailed(false);
      } else {
        if (state.current === AvionicsSystemState.On) {
          this.setFailed(false);
        } else {
          this.setFailed(true);
        }
      }
    }
  }

  /**
   * Sets if the display should be failed or not.
   * @param isFailed True if failed, false otherwise.
   */
  private setFailed(isFailed: boolean): void {
    if (isFailed) {
      this.isFailed = true;
      this.containerRef.instance.classList.add('failed-instr');
    } else {
      this.isFailed = false;
      this.containerRef.instance.classList.remove('failed-instr');
    }
  }

  /**
   * Handle a radioo state update event.
   * @param radio The Radio that was updated.
   */
  private onUpdateState = (radio: Radio): void => {
    if (!(radio.radioType == this.props.type && radio.index == this.props.index)) {
      return;
    }

    this.containerRef.instance.classList.toggle('selected', radio.selected);

    if (radio.selected) {
      SimVar.SetSimVarValue(`L:${this.props.templateId}_Selected${radio.radioType == RadioType.Com ? 'Com' : 'Nav'}Index`, 'number', this.props.index);
    }

    if (this.activeFreq.instance !== null) {
      this.activeFreq.instance.textContent = radio.activeFrequency.toFixed(radio.radioType == RadioType.Nav ? 2 : 3);
    }

    if (this.standbyFreq.instance !== null) {
      this.standbyFreq.instance.textContent = radio.standbyFrequency.toFixed(radio.radioType == RadioType.Nav ? 2 : 3);
    }

    if (this.selectorBorderElement.instance !== null && this.selectorArrowElement.instance !== null) {
      this.selectorBorderElement.instance.style.display = radio.selected ? '' : 'none';
      this.selectorArrowElement.instance.style.visibility = radio.selected ? 'visible' : 'hidden';
      this.selected = radio.selected;
    }
    if (this.ident.getOrDefault() !== null) {
      this.ident.instance.textContent = radio.ident;
    }
    this.radioState = radio;
  };


  /**
   * Handle a frequency change event.
   * @param change The FrequencyChangeEvent to process.
   */
  private onUpdateFrequency = (change: FrequencyChangeEvent): void => {
    if (!(change.radio.radioType == this.props.type && change.radio.index == this.props.index)) {
      return;
    }
    switch (change.bank) {
      case FrequencyBank.Active:
        if (this.activeFreq.instance !== null) {
          this.activeFreq.instance.textContent = change.frequency.toFixed(change.radio.radioType == RadioType.Nav ? 2 : 3);
        }
        break;
      case FrequencyBank.Standby:
        if (this.standbyFreq.instance !== null) {
          this.standbyFreq.instance.textContent = change.frequency.toFixed(change.radio.radioType == RadioType.Nav ? 2 : 3);
        }
        break;
    }
  };

  /**
   * Handle an ident set event.
   * @param change The IdentChangeEvent to process.
   */
  private onUpdateIdent = (change: IdentChangeEvent): void => {
    if (change.index == this.props.index && this.ident.getOrDefault() !== null) {
      this.ident.instance.textContent = change.ident;
    }
  };

  /**
   * Handle a signal strength set event.
   * @param strength The new strength.
   */
  private onUpdateSignalStrength = (strength: number): void => {
    if (this.ident.getOrDefault() !== null && this.selected) {
      if (strength == 0) {
        if (this.ident.instance.style.display !== 'none') {
          this.ident.instance.style.display = 'none';
        }
      } else {
        if (this.ident.instance.style.display !== '') {
          this.ident.instance.style.display = '';
        }
      }
    }
  };

  /**
   * A callback called when the CDI Source Changes.
   * @param source The current selected CDI Source.
   */
  private onUpdateCdiSelect = (source: NavSourceId): void => {
    if (source.type === NavSourceType.Nav && source.index == this.props.index) {
      this.activeFreq.instance.classList.add('navcom-green');
      this.ident.instance.classList.add('navcom-green');
    } else {
      this.activeFreq.instance.classList.remove('navcom-green');
      this.ident.instance.classList.remove('navcom-green');
    }
  };

  private onComTransmitChange = (transmitting: boolean): void => {
    this.activeFreq.instance.classList.toggle('transmit-selected', transmitting);
  };

  /** @inheritdoc */
  public onInteractionEvent(evt: FmsHEvent): boolean {
    let isHandled = false;
    if (this.radioState?.selected) {
      if ([FmsHEvent.D0, FmsHEvent.D1, FmsHEvent.D2, FmsHEvent.D3, FmsHEvent.D4, FmsHEvent.D5, FmsHEvent.D6, FmsHEvent.D7, FmsHEvent.D8, FmsHEvent.D9, FmsHEvent.Dot].includes(evt)) {
        // Digit handling:
        if (this.isInInputMode === false) {
          // We are entering the data input mode, set up the required variables:
          this.startFrequencyEntry();
        }
        this.handleFrequencyEntry(evt);
        isHandled = true;
      } else {
        // All other events terminate the input mode, canceling the captured input with the sole exception of ENT:
        this.stopFrequencyEntry();
        if (evt === FmsHEvent.ENT) {
          // ENT handling, publish the respective freq change bus event:
          this.controlPublisher.publishEvent(this.radioState.radioType === RadioType.Com ? 'standby_com_freq' : 'standby_nav_freq', this.newFrequencyAsString);
        } else {
          // All other events shall cancel the input and restore the previous frequncy:
          this.onUpdateFrequency({ radio: this.radioState, bank: FrequencyBank.Standby, frequency: this.previousFrequency });
        }
      }
    }
    return isHandled;
  }

  /** Begins frequency entry phase */
  private startFrequencyEntry(): void {
    this.isInInputMode = true;
    this.validNextDigitSpace = [1];
    this.digitPosition = 0;
    this.newFrequencyAsString = this.radioState?.standbyFrequency.toFixed((this.radioState.radioType === RadioType.Com) ? 3 : 2) ?? '000.00';
    this.previousFrequency = this.radioState?.standbyFrequency ?? 0;

    // ...and set up the UI as needed (swap the input digits for the static frequency element):
    this.standbyFreq.instance.style.display = 'none';
    this.comInputDigits.every((digit, index) => {
      digit.instance.style.display = '';
      digit.instance.textContent = this.newFrequencyAsString[index];
      digit.instance.classList.remove('highlight-select');
      return true;
    });
    this.comInputDigits[this.digitPosition].instance.classList.add('highlight-select');
  }

  /** Begins frequency entry phase */
  private stopFrequencyEntry(): void {
    this.isInInputMode = false;

    // ...and set up the UI as needed:
    this.standbyFreq.instance.style.display = '';
    this.comInputDigits.every((digit) => {
      digit.instance.classList.remove('highlight-select');
      digit.instance.style.display = 'none';
      return true;
    });
  }

  /**
   * Handles the frequency input event
   * @param evt received hEvent
   */
  private handleFrequencyEntry(evt: FmsHEvent): void {
    // Here we handle the input of digits for a radio frequency.
    // Fetch the digit from the event first:
    const digit = this.controlPadFrequencyInputMap.get(evt);
    if (digit !== undefined) {
      // We received a valid input for frequency input:
      if (this.validNextDigitSpace.includes(digit)) {
        const digitAsString = digit.toFixed(0);
        switch (this.digitPosition) {
          case 0:
            this.newFrequencyAsString = digitAsString + this.newFrequencyAsString.substring(1);
            break;
          case 1:
            this.newFrequencyAsString = this.newFrequencyAsString.substring(0, 1) + digitAsString + this.newFrequencyAsString.substring(2);
            break;
          case 2:
            this.newFrequencyAsString = this.newFrequencyAsString.substring(0, 2) + digitAsString + this.newFrequencyAsString.substring(3);
            this.digitPosition++;  // Skip the dot
            break;
          case 4:
            if (digit < 0) {
              // We received the dot while on pos 4, stay on pos 4 and expect the digit the next time:
              this.newFrequencyAsString = this.newFrequencyAsString.substring(0, 3) + '.' + this.newFrequencyAsString.substring(4);
              this.digitPosition--;
            } else {
              // We received the digit at pos 4, auto fill in the dot:
              this.newFrequencyAsString = this.newFrequencyAsString.substring(0, 3) + '.' + digitAsString + this.newFrequencyAsString.substring(5);
            }
            break;
          case 5:
            this.newFrequencyAsString = this.newFrequencyAsString.substring(0, 5) + digitAsString + this.newFrequencyAsString.substring(6);
            break;
          case 6:
            this.newFrequencyAsString = this.newFrequencyAsString.substring(0, 6) + digitAsString;
            break;
        }
        if (this.digitPosition < 6) {
          this.validNextDigitSpace = this.getNextValidFrequencyDigits(digit);
          this.digitPosition++;
        } else {
          // After position 6, we don't consider any further digit as valid:
          this.validNextDigitSpace = [];
        }
        // Update the new frequency on the UI:
        this.comInputDigits.every((inputDigit, index) => {
          inputDigit.instance.textContent = this.newFrequencyAsString[index];
          inputDigit.instance.classList.remove('highlight-select');
          return true;
        });
        this.comInputDigits[this.digitPosition].instance.classList.add('highlight-select');
      }
    }
  }

  /**
   * Returns the valid digits at the next digit position for COM entry mode
   * @param digit Received digit at the current position.
   * @returns the valid numbers when entering the next com frequency digit
   */
  private getNextValidComDigits(digit: number): number[] {
    // For COM the valid range is 118.000 - 136.990:
    switch (this.digitPosition) {
      case 0:
        // The second digit can be:
        return [1, 2, 3];

      case 1:
        switch (digit) {
          case 1:
            // If the second digit is 1, the third digit can be:
            return [8, 9];
          case 2:
            // If the second digit is 2, the third digit can be:
            return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
          case 3:
            // If the second digit is 3, the third digit can be:
            return [0, 1, 2, 3, 4, 5, 6];
        }
        break;

      case 2:
      case 3:
        // After the dot, any digit is valid for the fourth digit:
        return [- 1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

      case 4:
        if (this.comRadioSettingManager.getSetting('comRadioSpacing').get() === ComRadioSpacingSettingMode.Spacing25Khz) {
          // If the spacing is 0.025, the sixth digit can be:
          return [0, 2, 5, 7];
        } else {
          // If the spacing is 0.00833, the sixth digit can be:
          return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        }

      case 5:
        if (this.comRadioSettingManager.getSetting('comRadioSpacing').get() === ComRadioSpacingSettingMode.Spacing25Khz) {
          // If the spacing is 0.025, the seventh digit can be:
          switch (digit) {
            case 0:
              // If the sixth digit is 0, the seventh digit can only be:
              return [0];
            case 2:
              // If the sixth digit is 2, the seventh digit can only be:
              return [5];
            case 5:
              // If the sixth digit is 5, the seventh digit can only be:
              return [0];
            case 7:
              // If the sixth digit is 7, the seventh digit can only be:
              return [5];
          }
          break;
        }
    }
    return [];
  }

  /**
   * Returns the valid digits at the next digit position for NAV entry mode
   * @param digit Received digit at the current position.
   * @returns the valid numbers when entering the next nav frequency digit
   */
  getNextValidNavDigits(digit: number): number[] {
    switch (this.digitPosition) {
      case 0:
        // The second digit can be:
        return [0, 1];

      case 1:
        switch (digit) {
          case 0:
            // If the second digit is 0, the third digit can be:
            return [8, 9];
          case 1:
            // If the second digit is 1, the third digit can be:
            return [0, 1, 2, 3, 4, 5, 6, 7];
        }
        break;

      case 2:
        // The fourth digit always needs to be the dot:
        return [-1]; // Next we expect the dot

      case 3:
        // After the dot, any digit is valid for the fifth digit:
        return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

      case 4:
        // The sixth digit can be:
        return [0, 5];

      case 5:
        // The seventh digit can only be:
        return [0];
    }
    return [];
  }

  /**
   * Evaluate the valid digits at the next digit position, based on COM vs NAV and the spacing
   * @param digit Received digit at the current position.
   * @returns the valid numbers when entering the next digit, based on digit position:
   */
  private getNextValidFrequencyDigits(digit: number): number[] {
    if (this.radioState?.radioType === RadioType.Com) {
      return this.getNextValidComDigits(digit);
    } else {
      return this.getNextValidNavDigits(digit);
    }
  }

  /**
   * Render NavCom Freq Element.
   * @returns Vnode containing the element.
   */
  render(): VNode {
    if (this.props.position === 'left') {
      return (
        <div class="navcom-frequencyelement-container" ref={this.containerRef}>
          <div class="failed-box" />
          <div class="navcom-frequencyelement-content">
            <div ref={this.selectorBorderElement} id="navcomselect" class="navcom-selector left"></div>
            <span class="navcom-freqstandby" ref={this.standbyFreq}></span>
            <span class="navcom-freq-digit-input" ref={this.comInputDigit0}>1</span>
            <span class="navcom-freq-digit-input" ref={this.comInputDigit1}>0</span>
            <span class="navcom-freq-digit-input" ref={this.comInputDigit2}>0</span>
            <span class="navcom-freq-digit-input" ref={this.comInputDigit3}>.</span>
            <span class="navcom-freq-digit-input" ref={this.comInputDigit4}>1</span>
            <span class="navcom-freq-digit-input" ref={this.comInputDigit5}>2</span>
            <span ref={this.selectorArrowElement} class="navcom-arrows">
              <svg width="22" height="16">
                <path d="M 12 8 m 0 0.75 l -5 0 l 1 3.25 l 0 1 l -4.5 -5 l 4.5 -5 l 0 1 l -1 3.25 l 10 0 l -1 -3.25 l 0 -1 l 4.5 5 l -4.5 5 l 0 -1 l 1 -3.25 l -5 0 z" fill="cyan" />
              </svg>
            </span>
            <span class="navcom-freqactive" ref={this.activeFreq}></span>
            <div class="navcom-ident" ref={this.ident}></div>
          </div>
        </div>
      );
    } else {
      return (
        <div class="navcom-frequencyelement-container" ref={this.containerRef}>
          <div class="failed-box" />
          <div class="navcom-frequencyelement-content">
            <div ref={this.selectorBorderElement} id="navcomselect" class="navcom-selector right"></div>
            <span class="navcom-freqactive" ref={this.activeFreq}></span>
            <span ref={this.selectorArrowElement} class="navcom-arrows">
              <svg width="25" height="16">
                <path d="M 12 8 m 0 0.75 l -5 0 l 1 3.25 l 0 1 l -4.5 -5 l 4.5 -5 l 0 1 l -1 3.25 l 10 0 l -1 -3.25 l 0 -1 l 4.5 5 l -4.5 5 l 0 -1 l 1 -3.25 l -5 0 z" fill="cyan" />
              </svg>
            </span>
            <span class="navcom-freqstandby" ref={this.standbyFreq}></span>
            <span class="navcom-freq-digit-input" ref={this.comInputDigit0}>1</span>
            <span class="navcom-freq-digit-input" ref={this.comInputDigit1}>0</span>
            <span class="navcom-freq-digit-input" ref={this.comInputDigit2}>0</span>
            <span class="navcom-freq-digit-input" ref={this.comInputDigit3}>.</span>
            <span class="navcom-freq-digit-input" ref={this.comInputDigit4}>1</span>
            <span class="navcom-freq-digit-input" ref={this.comInputDigit5}>2</span>
            <span class="navcom-freq-digit-input" ref={this.comInputDigit6}>0</span>
          </div>
        </div>
      );
    }
  }
}
