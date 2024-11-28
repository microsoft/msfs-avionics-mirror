import {
  ComponentProps, ConsumerSubject, DisplayComponent, EventBus, FSComponent, HEvent, MappedSubject, SimVarValueType, Subject, VNode, XPDRSimVarEvents
} from '@microsoft/msfs-sdk';

import { Epic2RadioUtils, Epic2TransponderEvents } from '@microsoft/msfs-epic2-shared';

import { TscService } from '../TscService';

import './BottomRow.css';

/** Props for dummy bottom row. */
export interface BottomRowProps extends ComponentProps {
  /** The instrument event bus. */
  bus: EventBus;
  /** tab subject */
  tscService: TscService;
}

/** A bottom row. */
export class BottomRow extends DisplayComponent<BottomRowProps> {

  private readonly Scroll1LabelRef = FSComponent.createRef<HTMLInputElement>();
  private readonly Scroll2LabelRef = FSComponent.createRef<HTMLInputElement>();
  private homeLabelRef = FSComponent.createRef<HTMLElement>();
  private duAndCcdLabelRef = FSComponent.createRef<HTMLElement>();
  private comLabelRef = FSComponent.createRef<HTMLElement>();
  private navLabelRef = FSComponent.createRef<HTMLElement>();
  private xpdrLabelRef = FSComponent.createRef<HTMLElement>();
  private homeLabel2Ref = FSComponent.createRef<HTMLElement>();
  private duAndCcdLabel2Ref = FSComponent.createRef<HTMLElement>();
  private comLabel2Ref = FSComponent.createRef<HTMLElement>();
  private navLabel2Ref = FSComponent.createRef<HTMLElement>();
  private xpdrLabel2Ref = FSComponent.createRef<HTMLElement>();

  private readonly eventName = Subject.create<string | null>(null);
  private readonly showIcons = Subject.create<boolean>(true);
  private readonly hideKnobIcons = Subject.create<boolean>(false);

  protected readonly radioSub = this.props.bus.getSubscriber<XPDRSimVarEvents>();

  private readonly xpdrCode = ConsumerSubject.create(this.radioSub
    .on('xpdr_code_1').whenChanged(), 0);

  /**
   * Toggle the Scroll Label.
   * @param n the tab index.
   */
  private toggleScrollLabelVisibility(n: number): void {
    const labels = [
      { ref: this.homeLabelRef, index: 0 },
      { ref: this.duAndCcdLabelRef, index: 1 },
      { ref: this.comLabelRef, index: 2 },
      { ref: this.navLabelRef, index: 3 },
      { ref: this.xpdrLabelRef, index: 4 },
      { ref: this.homeLabel2Ref, index: 0 },
      { ref: this.duAndCcdLabel2Ref, index: 1 },
      { ref: this.comLabel2Ref, index: 2 },
      { ref: this.navLabel2Ref, index: 3 },
      { ref: this.xpdrLabel2Ref, index: 4 }
    ];

    labels.forEach(label => {
      label.ref.instance.style.display = label.index === n ? 'flex' : 'none';
    });

    this.hideKnobIcons.set(labels.find((label) => label.index === n) === undefined);
  }

  private mapLabelToFreqName = MappedSubject.create(
    ([tabIndex, navlabelName, comLabelName]) => {
      switch (tabIndex) {
        case 2:
          return comLabelName === 'COM1' ? 'COM' : comLabelName;
        case 3:
          return navlabelName;
        case 4:
          return 'XPDR';
        default:
        case 0:
        case 1:
          return '';
      }
    },
    this.props.tscService.tabIndexSubject,
    this.props.tscService.navScrollLabel,
    this.props.tscService.comScrollLabel
  );

  private handleKnobEvents = (event: string, label: string): void => {

    switch (event) {
      case 'TSC_KNOB_L_INNER_PUSH':
        if (label === 'COM') {
          SimVar.SetSimVarValue('K:COM1_RADIO_SWAP', SimVarValueType.Number, 0);
        } else if (label != 'XPDR') {
          SimVar.SetSimVarValue(`K:${label}_RADIO_SWAP`, SimVarValueType.Number, 0);
        }
        return;
      case 'TSC_KNOB_L_INNER_DEC':
        label === 'XPDR' ? this.handleXpdrCodeChange('FINE', -1) :
          SimVar.SetSimVarValue(`K:${label}_RADIO_FRACT_DEC`, SimVarValueType.Number, 0);
        return;
      case 'TSC_KNOB_L_INNER_INC':
        label === 'XPDR' ? this.handleXpdrCodeChange('FINE', 1) :
          SimVar.SetSimVarValue(`K:${label}_RADIO_FRACT_INC`, SimVarValueType.Number, 0);
        return;
      case 'TSC_KNOB_L_OUTER_DEC':
        label === 'XPDR' ? this.handleXpdrCodeChange('COARSE', -1) :
          SimVar.SetSimVarValue(`K:${label}_RADIO_WHOLE_DEC`, SimVarValueType.Number, 0);
        return;
      case 'TSC_KNOB_L_OUTER_INC':
        label === 'XPDR' ? this.handleXpdrCodeChange('COARSE', 1) :
          SimVar.SetSimVarValue(`K:${label}_RADIO_WHOLE_INC`, SimVarValueType.Number, 0);
        return;

      case 'TSC_KNOB_R_INNER_PUSH':
        if (label === 'COM') {
          SimVar.SetSimVarValue('K:COM1_RADIO_SWAP', SimVarValueType.Number, 0);
        } else if (label != 'XPDR') {
          SimVar.SetSimVarValue(`K:${label}_RADIO_SWAP`, SimVarValueType.Number, 0);
        }
        return;
      case 'TSC_KNOB_R_INNER_DEC':
        label === 'XPDR' ? this.handleXpdrCodeChange('COARSE', -1) :
          SimVar.SetSimVarValue(`K:${label}_RADIO_FRACT_DEC`, SimVarValueType.Number, 0);
        return;
      case 'TSC_KNOB_R_INNER_INC':
        label === 'XPDR' ? this.handleXpdrCodeChange('COARSE', 1) :
          SimVar.SetSimVarValue(`K:${label}_RADIO_FRACT_INC`, SimVarValueType.Number, 0);
        return;
      case 'TSC_KNOB_R_OUTER_DEC':
        label === 'XPDR' ? this.handleXpdrCodeChange('FINE', -1) :
          SimVar.SetSimVarValue(`K:${label}_RADIO_WHOLE_DEC`, SimVarValueType.Number, 0);
        return;
      case 'TSC_KNOB_R_OUTER_INC':
        label === 'XPDR' ? this.handleXpdrCodeChange('FINE', 1) :
          SimVar.SetSimVarValue(`K:${label}_RADIO_WHOLE_INC`, SimVarValueType.Number, 0);
        return;

    }
  };

  /**
   * Sets a new transponder code.
   * @param increment Whether to make coarse or fine adjustments
   * @param sign Whether to increment or decrement the code.
   */
  private handleXpdrCodeChange(increment: 'COARSE' | 'FINE', sign: 1 | -1): void {
    Epic2RadioUtils.changeXpdrCode(
      increment,
      sign,
      this.xpdrCode.get(),
      this.props.bus.getPublisher<Epic2TransponderEvents>()
    );
  }


  /** @inheritdoc */
  public onAfterRender(): void {
    this.props.bus.getSubscriber<HEvent>().on('hEvent').handle((event) => {
      if (event.startsWith('TSC_')) {
        this.eventName.set(event);
        this.handleKnobEvents(event, this.mapLabelToFreqName.get());
      }
    });
    this.props.tscService.tabIndexSubject.sub(n => {
      this.showIcons.set(n === 0 || n === 1 ? true : false);
      this.toggleScrollLabelVisibility(n);
    });
  }

  /** @inheritdoc */
  public render(): VNode | null {
    return <div class="bottom-row-wrapper">
      {/* <span class={{ 'hidden': this.eventName.map((v) => v === null) }}>{this.eventName}</span> */}
      <div class="scroll-1">
        <div class="scroll-1-label" ref={this.Scroll1LabelRef}>
          <div ref={this.homeLabelRef} class="homeDuCcdLabel1" style={{ 'display': 'flex' }}>
            <div>DU Scroll</div>
          </div>

          <div ref={this.duAndCcdLabelRef} class="homeDuCcdLabel1" style={{ 'display': 'none' }}>
            <div>DU Scroll</div>
          </div>

          <div ref={this.comLabelRef} class="comNavXpdrLabel1" style={{ 'display': 'none', 'flex-direction': 'column' }}>
            <div>{this.props.tscService.comScrollLabel} Freq</div>
            <div>Push Swap</div>
          </div>

          <div ref={this.navLabelRef} class="comNavXpdrLabel1" style={{ 'display': 'none', 'flex-direction': 'column' }}>
            <div>{this.props.tscService.navScrollLabel} Freq</div>
            <div>Push Swap</div>
          </div>

          <div ref={this.xpdrLabelRef} class="comNavXpdrLabel1" style={{ 'display': 'none', 'flex-direction': 'column' }}>
            <div>XPDR Code</div>
            <div>Push Ident</div>
          </div>
        </div>
        <div class={{
          'icon-row-1': true
        }}
        >
          <div class={{
            'icon-1': true,
            'is-hidden': this.showIcons.map((v) => !v)
          }}><svg class="rotate-svg" xmlns="http://www.w3.org/2000/svg" viewBox="59 566 24 24">
              <path d="M 78 571 C 73 565 62 568 61 578 C 61 588 73 592 78 585" />
              <path d="M 80 568 L 82 577 L 74 573 L 80 568 Z" />
              <path d="M 74 583 L 82 580 L 80 589 L 74 583 Z" />
            </svg></div>
          <div class="icon-2"><svg class={{ 'br-circle-half-circle-svg': true, 'knob-disabled': this.hideKnobIcons }} xmlns="http://www.w3.org/2000/svg" viewBox="60 34 29 30">
            <path d="M 78 39 C 65 39 64 57 78 57 M 61 48 L 68 48 M 87 48 L 78 48 " stroke-width="2" fill="none" />
            <circle cx="77" cy="48" r="4" />
          </svg></div>
          <div class={{
            'icon-3': true,
            'is-hidden': this.showIcons.map((v) => !v)
          }}><svg class="rotate-svg" xmlns="http://www.w3.org/2000/svg" viewBox="59 566 24 24">
              <path d="M 78 571 C 73 565 62 568 61 578 C 61 588 73 592 78 585" />
              <path d="M 80 568 L 82 577 L 74 573 L 80 568 Z" />
              <path d="M 74 583 L 82 580 L 80 589 L 74 583 Z" />
            </svg></div>
        </div>
      </div>
      <div class="datalink">Datalink</div>
      <div class="mfd-swap">MFD Swap</div>
      <div class="event">Event</div>
      <div class="scroll-2">
        <div class="scroll-2-label" ref={this.Scroll2LabelRef}>
          <div ref={this.homeLabel2Ref} class="homeDuCcdLabel2" style={{ 'display': 'flex' }}>
            <div>DU Scroll</div>
          </div>

          <div ref={this.duAndCcdLabel2Ref} class="homeDuCcdLabel2" style={{ 'display': 'none' }}>
            <div>DU Scroll</div>
          </div>

          <div ref={this.comLabel2Ref} class="comNavXpdrLabel2" style={{ 'display': 'none', 'flex-direction': 'column' }}>
            <div>{this.props.tscService.comScrollLabel} Freq</div>
            <div>Push Swap</div>
          </div>

          <div ref={this.navLabel2Ref} class="comNavXpdrLabel2" style={{ 'display': 'none', 'flex-direction': 'column' }}>
            <div>{this.props.tscService.navScrollLabel} Freq</div>
            <div>Push Swap</div>
          </div>

          <div ref={this.xpdrLabel2Ref} class="comNavXpdrLabel2" style={{ 'display': 'none', 'flex-direction': 'column' }}>
            <div>XPDR2 Code</div>
            <div>Push Ident</div>
          </div>
        </div>
        <div class="icon-row-2">
          <div class={{
            'icon-4': true,
            'is-hidden': this.showIcons.map((v) => !v)
          }}>
            <svg class="rotate-svg" xmlns="http://www.w3.org/2000/svg" viewBox="59 566 24 24">
              <path d="M 78 571 C 73 565 62 568 61 578 C 61 588 73 592 78 585" />
              <path d="M 80 568 L 82 577 L 74 573 L 80 568 Z" />
              <path d="M 74 583 L 82 580 L 80 589 L 74 583 Z" />
            </svg>
          </div>
          <div class="icon-5">
            <svg class={{ 'br-circle-half-circle-svg': true, 'knob-disabled': this.hideKnobIcons }} xmlns="http://www.w3.org/2000/svg" viewBox="60 34 29 30">
              <path d="M 78 39 C 65 39 64 57 78 57 M 61 48 L 68 48 M 87 48 L 78 48 " stroke-width="2" fill="none" />
              <circle cx="77" cy="48" r="4" />
            </svg>
          </div>
          <div class={{
            'icon-6': true,
            'is-hidden': this.showIcons.map((v) => !v)
          }}>
            <svg class="rotate-svg" xmlns="http://www.w3.org/2000/svg" viewBox="59 566 24 24">
              <path d="M 78 571 C 73 565 62 568 61 578 C 61 588 73 592 78 585" />
              <path d="M 80 568 L 82 577 L 74 573 L 80 568 Z" />
              <path d="M 74 583 L 82 580 L 80 589 L 74 583 Z" />
            </svg>
          </div>
        </div>
      </div>
    </div>;
  }
}
