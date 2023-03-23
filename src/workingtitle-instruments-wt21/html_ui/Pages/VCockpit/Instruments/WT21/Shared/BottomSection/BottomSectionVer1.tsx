import {
  AdcEvents, AvionicsSystemState, AvionicsSystemStateEvent, ComponentProps, ComputedSubject, DisplayComponent,
  EventBus, FSComponent, GNSSEvents, NavComSimVars, Subject, VNode, XPDRMode, XPDRSimVarEvents
} from '@microsoft/msfs-sdk';
import { COMReceiverSystemEvents } from '../Systems';
import { TDRSystemEvents } from '../Systems/TDRSystem';

/**
 * The properties for the BottomSectionVer1 component.
 */
interface BottomSectionVer1Props extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
}

/**
 * The BottomSectionVer1 component.  This has COM1, COM2, ATC2, RAT, UTC
 */
export class BottomSectionVer1 extends DisplayComponent<BottomSectionVer1Props> {
  private readonly xpdrElement = FSComponent.createRef<HTMLDivElement>();
  private readonly com1 = ComputedSubject.create<number, string>(0, (v) => v.toFixed(3));
  private readonly com1Element = FSComponent.createRef<HTMLDivElement>();
  private readonly com2 = ComputedSubject.create<number, string>(0, (v) => v.toFixed(3));
  private readonly com2Element = FSComponent.createRef<HTMLDivElement>();
  private readonly ident = Subject.create<string>('1200');
  private readonly rat = Subject.create<number>(0);

  private readonly time = ComputedSubject.create<number, string>(0, (v) => {
    const hours = Math.floor(v / 60 / 60);
    const minutes = Math.floor(v / 60 % 60);
    const seconds = Math.floor(v % 60);
    return `${hours.toFixed(0).padStart(2, '0')}:${minutes.toFixed(0).padStart(2, '0')}:${seconds.toFixed(0).padStart(2, '0')}`;
  });

  /**
   * A callback called after the component renders.
   */
  public onAfterRender(): void {
    this.props.bus.getSubscriber<NavComSimVars>().on('com_active_frequency_1').whenChangedBy(0.01).handle((v) => this.com1.set(v));
    this.props.bus.getSubscriber<NavComSimVars>().on('com_active_frequency_2').whenChangedBy(0.01).handle((v) => this.com2.set(v));
    this.props.bus.getSubscriber<AdcEvents>().on('ram_air_temp_c').withPrecision(0).handle((v) => this.rat.set(v));
    this.props.bus.getSubscriber<GNSSEvents>().on('zulu_time').atFrequency(10).handle((v) => this.time.set(v));

    const xpdr = this.props.bus.getSubscriber<XPDRSimVarEvents>();
    xpdr.on('xpdr_code_1').whenChanged().handle((v) => this.ident.set(v.toString().padStart(4, '0')));
    xpdr.on('xpdr_mode_1').whenChanged().handle((v) => {
      this.xpdrElement.instance.classList.toggle('stby', v === XPDRMode.STBY);
    });
    xpdr.on('xpdr_ident_1').whenChanged().handle((v) => {
      if (v) {
        this.xpdrElement.instance.classList.remove('ident');
        setTimeout(() => {
          this.xpdrElement.instance.classList.add('ident');
        }, 1);
      }
    });

    this.props.bus.getSubscriber<TDRSystemEvents>()
      .on('tdr_state').whenChanged()
      .handle(this.onTdrStateChanged.bind(this));

    this.props.bus.getSubscriber<COMReceiverSystemEvents>()
      .on('com_state').whenChanged()
      .handle(this.onComReceiverStateChanged.bind(this));
  }

  /**
   * A callback called when the TDR system state changes.
   * @param state The state change event to handle.
   */
  private onTdrStateChanged(state: AvionicsSystemStateEvent): void {
    this.xpdrElement.instance.classList.toggle('off', state.current == AvionicsSystemState.Off);
    this.xpdrElement.instance.classList.toggle('fail', state.current == AvionicsSystemState.Failed);
    this.xpdrElement.instance.classList.toggle('align', state.current == AvionicsSystemState.Initializing);
  }

  /**
   * A callback called when the COM receiver system state changes.
   * @param state The state change event to handle.
   */
  private onComReceiverStateChanged(state: AvionicsSystemStateEvent): void {
    this.com2Element.instance.classList.toggle('fail', state.current !== AvionicsSystemState.On);
  }

  /**
   * Renders the component.
   * @returns The component VNode.
   */
  public render(): VNode {
    return (
      <div class="bottom-section-container">
        <div class="bottom-section-data-container">
          <div class="bottom-section-data-title">COM1</div>
          <div class="bottom-section-data-value" ref={this.com1Element}>{this.com1}</div>
        </div>
        <div class="bottom-section-data-container">
          <div class="bottom-section-data-title">COM2</div>
          <div class="bottom-section-data-value" ref={this.com2Element}>{this.com2}</div>
        </div>
        <div class="bottom-section-data-container xpdr" ref={this.xpdrElement}>
          <div class="bottom-section-data-title">ATC<span class="bottom-section-xpdr-id">1</span></div>
          <div class="bottom-section-data-value" style="min-width:65px">
            <div class="bottom-section-data-value-active">
              {this.ident}
              <span class="bottom-section-xpdr-failed">F</span>
            </div>
            <div class="bottom-section-xpdr-stby">
              STBY
            </div>
          </div>
        </div>
        <div class="bottom-section-data-container">
          <div class="bottom-section-data-title">RAT</div>
          <div class="bottom-section-data-value rat-value" style="min-width:73px">{this.rat}<span class="bottom-section-data-unit">°C</span></div>
        </div>
        <div class="bottom-section-data-container">
          <div class="bottom-section-data-title">UTC</div>
          <div class="bottom-section-data-value">{this.time}</div>
        </div>
      </div>
    );
  }
}