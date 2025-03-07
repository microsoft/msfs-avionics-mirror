import {
  AdcEvents, ComputedSubject, ConsumerSubject, ControlPublisher, DisplayComponent, EventBus, FSComponent, HEvent, Subject, VNode, XPDRMode, XPDRSimVarEvents,
} from '@microsoft/msfs-sdk';

import { G1000ControlEvents } from '../../../Shared/G1000Events';

import './Transponder.css';
import { AvionicsSystemState, TransponderSystemEvents } from '../../../Shared';

/**
 * The properties on the Attitude component.
 */
interface TransponderProps {

  /** An instance of the event bus. */
  bus: EventBus;

  /** An instance of the control publisher. */
  controlPublisher: ControlPublisher;
}

/**
 * The PFD attitude indicator.
 */
export class Transponder extends DisplayComponent<TransponderProps> {
  private xpdrCodeElement = FSComponent.createRef<HTMLElement>();
  private xpdrModeElement = FSComponent.createRef<HTMLElement>();
  private xpdrIdentElement = FSComponent.createRef<HTMLElement>();
  private codeEdit = {
    editMode: false,
    charIndex: 0,
    tempCode: ''
  };
  private readonly xpdrCodeSubject = ComputedSubject.create(0, (v): string => {
    const roundedCode = Math.round(v);
    return `${isNaN(roundedCode) ? 0 : roundedCode}`.padStart(4, '0');
  });
  private readonly xpdrModeSubject = ComputedSubject.create(XPDRMode.OFF, (v): string => {
    switch (v) {
      case XPDRMode.OFF:
        return 'OFF';
      case XPDRMode.STBY:
        return 'STBY';
      case XPDRMode.ON:
        return 'ON';
      case XPDRMode.ALT:
        return 'ALT';
      case XPDRMode.GROUND:
        return 'GND';
    }

    return 'XXX';
  });
  private readonly isOnGround = ConsumerSubject.create(this.props.bus.getSubscriber<AdcEvents>().on('on_ground').whenChanged(), true);
  private isSystemOff = Subject.create(false);

  /**
   * A callback called after the component renders.
   */
  public onAfterRender(): void {
    const xpdr = this.props.bus.getSubscriber<XPDRSimVarEvents>();
    xpdr.on('xpdr_code_1')
      .whenChanged().handle(this.onXpdrCodeSimUpdate.bind(this));
    xpdr.on('xpdr_mode_1')
      .whenChanged().handle(this.onXpdrModeUpdate.bind(this));
    xpdr.on('xpdr_ident_1').whenChanged().handle((isSending: boolean) => {
      this.xpdrIdentElement.instance.classList.toggle('hide-element', !isSending);
      this.xpdrModeElement.instance.classList.toggle('hide-element', isSending);
    });

    const g1000ControlEvents = this.props.bus.getSubscriber<G1000ControlEvents>();
    g1000ControlEvents.on('xpdr_code_push')
      .handle(this.updateCodeEdit.bind(this));
    g1000ControlEvents.on('xpdr_code_digit')
      .handle(this.editCode.bind(this));

    const transponderSystem = this.props.bus.getSubscriber<TransponderSystemEvents>();
    transponderSystem.on('transponder_state').whenChanged().handle(v => {
      this.isSystemOff.set(v.current !== AvionicsSystemState.On);
    });

    this.isOnGround.sub(onGround => {
      this.xpdrCodeElement.instance.classList.toggle('on-ground', onGround);
      this.xpdrModeElement.instance.classList.toggle('on-ground', onGround);
    }, true);

    this.props.bus.getSubscriber<HEvent>().on('hEvent').handle(this.handleXpdrHEvent.bind(this));
  }

  /**
   * A method to handle XPDR-related Control Pad HEvents.
   * @param evt the name of the HEvent.
   */
  private handleXpdrHEvent(evt: string): void {
    switch (evt) {
      case 'AS1000_CONTROL_PAD_Ident':
        this.props.controlPublisher.publishEvent('xpdr_send_ident_1', true);
        break;
      case 'AS1000_PFD_XPDR_Small_INC':
        this.changeCodeByOne(true);
        break;
      case 'AS1000_PFD_XPDR_Small_DEC':
        this.changeCodeByOne(false);
        break;
      case 'AS1000_PFD_XPDR_Large_INC':
        this.changeCodeByHundreds(true);
        break;
      case 'AS1000_PFD_XPDR_Large_DEC':
        this.changeCodeByHundreds(false);
        break;
    }
  }

  /**
   * Changes the second two digits of the xpdr code by one (tens and ones).
   * @param increment whether to increment or decrement the code.
   */
  private changeCodeByOne(increment: boolean): void {
    // current code will be a rounded number in a padded string, so we parse it as base-8
    const currentCode = parseInt(this.xpdrCodeSubject.get());
    if (isNaN(currentCode)) {
      return;
    }
    let ones = currentCode % 10;
    let tens = Math.floor(currentCode / 10) % 10;
    ones += (increment ? 1 : -1);
    if (ones > 7) {
      ones = 0;
      tens += 1;
      if (tens > 7) {
        tens = 0;
      }
    }
    if (ones < 0) {
      ones = 7;
      tens -= 1;
      if (tens < 0) {
        tens = 7;
      }
    }
    const newCode = (Math.floor(currentCode / 100) * 100) + tens * 10 + ones;
    this.props.controlPublisher.publishEvent('publish_xpdr_code_1', newCode);
  }

  /**
   * Changes the first two digits of the xpdr code by one (thousands and hundreds).
   * @param increment whether to increment or decrement the code.
   */
  private changeCodeByHundreds(increment: boolean): void {
    // current code will be a rounded number in a padded string, so we parse it as base-8
    const currentCode = parseInt(this.xpdrCodeSubject.get());
    if (isNaN(currentCode)) {
      return;
    }
    let hundreds = Math.floor(currentCode / 100) % 10;
    let thousands = Math.floor(currentCode / 1000) % 10;
    hundreds += (increment ? 1 : -1);
    if (hundreds > 7) {
      hundreds = 0;
      thousands += 1;
      if (thousands > 7) {
        thousands = 0;
      }
    }
    if (hundreds < 0) {
      hundreds = 7;
      thousands -= 1;
      if (thousands < 0) {
        thousands = 7;
      }
    }
    const newCode = thousands * 1000 + hundreds * 100 + currentCode % 100;
    this.props.controlPublisher.publishEvent('publish_xpdr_code_1', newCode);
  }

  /**
   * A method called when the soft menu sends a G1000 Control Event to edit the xpdr code.
   * @param edit is a bool of whether to edit the code or stop editing the code.
   */
  private updateCodeEdit(edit: boolean): void {
    if (edit && this.xpdrCodeElement.instance !== null) {
      this.codeEdit.charIndex = !this.codeEdit.editMode ? 0 : this.codeEdit.charIndex;
      this.codeEdit.editMode = true;
      this.codeEdit.tempCode = '   ';
      if (this.xpdrModeSubject.getRaw() === XPDRMode.STBY || this.xpdrModeSubject.getRaw() === XPDRMode.OFF) {
        this.xpdrCodeElement.instance.classList.add('highlight-white');
      } else {
        this.xpdrCodeElement.instance.classList.remove('green', 'white', 'grey');
        this.xpdrCodeElement.instance.classList.add('highlight-green');
      }
    } else if (!edit && this.xpdrCodeElement.instance !== null) {
      this.codeEdit.editMode = false;
      this.codeEdit.tempCode = '';
      this.codeEdit.charIndex = 0;
      this.xpdrCodeElement.instance.classList.remove('highlight-green');
      this.xpdrCodeElement.instance.classList.remove('highlight-white');
      this.onXpdrModeUpdate(this.xpdrModeSubject.getRaw());
    }
  }

  /**
   * A method called when the soft menu sends a digit from the xpdr code menu via the g1000 event bus.
   * @param value is the digit sent (0-7; -1 is a backspace).
   */
  private editCode(value: number): void {
    let updatedTempCode = this.codeEdit.tempCode;
    if (value == -1 && this.codeEdit.charIndex > 0) {
      updatedTempCode = updatedTempCode.substring(0, this.codeEdit.charIndex);
      this.codeEdit.charIndex--;
    } else if (value >= 0) {
      updatedTempCode = updatedTempCode + `${value}`;
      this.codeEdit.charIndex++;
    }

    this.codeEdit.tempCode = updatedTempCode;
    this.onXpdrCodeUpdate(parseInt(this.codeEdit.tempCode));

    if (this.codeEdit.charIndex == 4) {
      this.props.controlPublisher.publishEvent('publish_xpdr_code_1', parseInt(updatedTempCode));
      this.codeEdit.charIndex = 0;
      this.updateCodeEdit(false);
    }
  }

  /**
   * A method called when the navcom publisher sends a new xpdr code.
   * @param code is the new xpdr code
   */
  private onXpdrCodeSimUpdate(code: number): void {
    this.onXpdrCodeUpdate(code);
  }

  /**
   * A method called to update the displayed xpdr code.
   * @param code is the new xpdr code
   */
  private onXpdrCodeUpdate(code: number): void {
    this.xpdrCodeSubject.set(code);
  }

  /**
   * A method called when the navcom publisher sends a new xpdr code.
   * @param mode is the new xpdr mode.
   */
  private onXpdrModeUpdate(mode: XPDRMode): void {
    if (this.xpdrModeElement.instance !== null && this.xpdrCodeElement.instance !== null) {
      this.xpdrModeSubject.set(mode);
      this.xpdrModeElement.instance.classList.remove('green', 'white', 'grey');
      this.xpdrCodeElement.instance.classList.remove('green', 'white', 'grey');
      switch (mode) {
        case XPDRMode.OFF:
          this.xpdrModeElement.instance.classList.add('grey');
          this.xpdrCodeElement.instance.classList.add('grey');
          break;
        case XPDRMode.STBY:
          this.xpdrModeElement.instance.classList.add('white');
          this.xpdrCodeElement.instance.classList.add('white');
          break;
        case XPDRMode.ON:
        case XPDRMode.ALT:
        case XPDRMode.GROUND:
          this.xpdrModeElement.instance.classList.add('green');
          this.xpdrCodeElement.instance.classList.add('green');
          break;
      }
    }
  }

  /**
   * Renders the component.
   * @returns The component VNode.
   */
  public render(): VNode {
    return (
      <div class="xpdr-container">
        <div class='xpdr-content' style={{
          'display': this.isSystemOff.map(v => v ? 'none' : 'grid'),
        }}>
          <div class='small-text'>XPDR </div>
          <div ref={this.xpdrCodeElement} class='size20 XPDRValue' data-checklist='XPDRValue'>{this.xpdrCodeSubject}</div>
          <div ref={this.xpdrModeElement} class='size20 XPDRMode' data-checklist='XPDRMode'>&nbsp;{this.xpdrModeSubject}</div><div ref={this.xpdrIdentElement} class='size20 green hide-element'> Ident</div>
        </div>
        <div class="xpdr-fail failed-instr" style={{
          'display': this.isSystemOff.map(v => v ? 'block' : 'none'),
        }}>
          <div class="failed-box">
            XPDR FAIL
          </div>
        </div>
      </div>
    );
  }
}
