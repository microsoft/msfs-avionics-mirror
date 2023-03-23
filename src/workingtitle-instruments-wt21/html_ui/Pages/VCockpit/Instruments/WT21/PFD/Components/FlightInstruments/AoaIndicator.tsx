import {
  AvionicsSystemState, AvionicsSystemStateEvent, ComponentProps, ComputedSubject,
  ConsumerSubject, ControlSurfacesEvents, DefaultUserSettingManager, DisplayComponent, EventBus, FSComponent,
  MathUtils, Subject, VNode
} from '@microsoft/msfs-sdk';
import { AOASystemEvents } from '../../../Shared/Systems/AOASystem';

import { PFDSettings, PFDUserSettings } from '../../PFDUserSettings';

import './AoaIndicator.css';

/**
 * The properties for the AoaIndicator component.
 */
interface AoaIndicatorProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
}

/**
 * The AoaIndicator component.
 */
export class AoaIndicator extends DisplayComponent<AoaIndicatorProps> {
  private aoaContainerRef = FSComponent.createRef<HTMLDivElement>();
  private readoutRef = FSComponent.createRef<HTMLDivElement>();
  private arrowBugRef = FSComponent.createRef<HTMLDivElement>();
  private lowRhombusBugRef = FSComponent.createRef<HTMLDivElement>();
  private highRhombusBugRef = FSComponent.createRef<HTMLDivElement>();
  private showHighRhombus = Subject.create(false);
  private showArrow = Subject.create(false);
  private showLowRhombus = Subject.create(false);
  private pixelPerTick = 241.875;
  private pfdSettingsManager!: DefaultUserSettingManager<PFDSettings>;
  private auto = false;
  private flaps = 0;
  private gear = 0;

  private isVisible = Subject.create(false);

  private relativeAoaStr = ComputedSubject.create<number, string>(0, (v: number) => {
    return `.${v.toFixed(2).slice(2)}`;
  });

  private relativeAoa!: ConsumerSubject<number>;

  /**
   * A callback called after the component renders.
   */
  public onAfterRender(): void {
    this.pfdSettingsManager = PFDUserSettings.getManager(this.props.bus);
    const adc = this.props.bus.getSubscriber<AOASystemEvents>();
    const cf = this.props.bus.getSubscriber<ControlSurfacesEvents>();

    this.relativeAoa = ConsumerSubject.create<number>(adc.on('aoasys_aoa_pct').withPrecision(2), 0);
    this.relativeAoa.sub(this.updateAoaDisplay.bind(this));

    this.isVisible.sub((v: boolean) => {
      if (v) {
        this.relativeAoa.resume();
      } else {
        this.relativeAoa.pause();
      }
      this.aoaContainerRef.instance.classList.toggle('hidden', !v);
    }, true);

    cf.on('flaps_left_angle')
      .withPrecision(0)
      .handle(v => this.autoShow(this.auto, v, this.gear));

    cf.on('gear_position')
      .withPrecision(0)
      .handle(v => this.autoShow(this.auto, this.flaps, v));

    this.showHighRhombus.sub((v: boolean) => {
      this.highRhombusBugRef.instance.classList.toggle('hidden', !v);
    });

    this.showArrow.sub((v: boolean) => {
      this.arrowBugRef.instance.classList.toggle('hidden', !v);
    });

    this.showLowRhombus.sub((v: boolean) => {
      this.lowRhombusBugRef.instance.classList.toggle('hidden', !v);
    });

    this.pfdSettingsManager.whenSettingChanged('aoaFormat').handle(f => {
      switch (f) {
        case 'OFF':
          this.aoaContainerRef.instance.classList.add('hidden');
          this.isVisible.set(false);
          this.auto = false;
          break;
        case 'ON':
          this.aoaContainerRef.instance.classList.remove('hidden');
          this.isVisible.set(true);
          this.auto = false;
          break;
        case 'AUTO':
          this.auto = true;
          this.autoShow(true, this.flaps, this.gear);
          break;
      }
    });

    this.updateAoaDisplay(0);

    this.props.bus.getSubscriber<AOASystemEvents>()
      .on('aoa_state').whenChanged()
      .handle(this.onAoaStateChanged.bind(this));
  }

  /**
   * A callback called when the AoA system state changes.
   * @param state The state change event to handle.
   */
  private onAoaStateChanged(state: AvionicsSystemStateEvent): void {
    this.aoaContainerRef.instance.classList.toggle('fail', state.current == AvionicsSystemState.Failed);
    this.aoaContainerRef.instance.classList.toggle('warn', (state.current == AvionicsSystemState.Initializing));
  }

  /**
   * Updates the angle of attack display.
   * @param rv The new relative angle of attack value.
   */
  private updateAoaDisplay(rv: number): void {
    if (rv <= 0.2) {
      this.showHighRhombus.set(false);
      this.showArrow.set(false);
      this.showLowRhombus.set(true);
    } else if (rv >= 0.99) {
      this.showHighRhombus.set(true);
      this.showArrow.set(false);
      this.showLowRhombus.set(false);
    } else {
      this.showHighRhombus.set(false);
      this.showArrow.set(true);
      this.showLowRhombus.set(false);
    }
    this.arrowBugRef.instance.style.transform = `translate3d(0,${this.pixelPerTick * (1 - MathUtils.clamp(rv, 0.18, 1))}px,0)`;
    this.relativeAoaStr.set(rv);
  }

  /**
   * Updates the display status of the angle of attack indicator depending on input
   * @param auto The new angle of attack value.
   * @param flaps The new angle of attack value.
   * @param gear The new angle of attack value.
   */
  private autoShow(auto: boolean, flaps: number, gear: number): void {
    this.flaps = flaps;
    this.gear = gear;
    if (auto) {
      if (flaps >= 15 || gear === 1) {
        this.isVisible.set(true);
      } else {
        this.isVisible.set(false);
      }
    }
  }

  /**
   * Renders the component.
   * @returns The component VNode.
   */
  public render(): VNode {
    return (
      <div class="translucent-box aoa-box" ref={this.aoaContainerRef}>
        <div class="aoa">
          <div class="aoa-title">
            AOA
          </div>

          <div class="aoa-tick-marks">
            <svg width="57" height="220">
              <text x="26" y="21.3" fill="var(--wt21-colors-dark-gray)" text-anchor="end" font-size="21">.0</text>
              <text x="11" y="21.3" fill="var(--wt21-colors-dark-gray)" text-anchor="end" font-size="21">1</text>
              <text x="26" y="67" fill="var(--wt21-colors-dark-gray)" text-anchor="end" font-size="21">.8</text>
              <text x="26" y="117" fill="var(--wt21-colors-dark-gray)" text-anchor="end" font-size="21">.6</text>
              <text x="26" y="163" fill="var(--wt21-colors-dark-gray)" text-anchor="end" font-size="21">.4</text>
              <text x="26" y="215" fill="var(--wt21-colors-dark-gray)" text-anchor="end" font-size="21">.2</text>
              <line x1="31" y1="13.5" x2="46" y2="13.5" stroke="var(--wt21-colors-dark-gray)" stroke-width="1.5"></line>
              <line x1="38" y1="38" x2="46" y2="38" stroke="var(--wt21-colors-dark-gray)" stroke-width="1.5"></line>
              <line x1="31" y1="62" x2="46" y2="62" stroke="var(--wt21-colors-dark-gray)" stroke-width="1.5"></line>
              <line x1="38" y1="87" x2="46" y2="87" stroke="var(--wt21-colors-dark-gray)" stroke-width="1.5"></line>
              <line x1="31" y1="110" x2="46" y2="110" stroke="var(--wt21-colors-dark-gray)" stroke-width="1.5"></line>
              <line x1="38" y1="135" x2="46" y2="135" stroke="var(--wt21-colors-dark-gray)" stroke-width="1.5"></line>
              <line x1="31" y1="158" x2="46" y2="158" stroke="var(--wt21-colors-dark-gray)" stroke-width="1.5"></line>
              <line x1="38" y1="182" x2="46" y2="182" stroke="var(--wt21-colors-dark-gray)" stroke-width="1.5"></line>
              <line x1="31" y1="206.5" x2="46" y2="206.5" stroke="var(--wt21-colors-dark-gray)" stroke-width="1.5"></line>
              <line x1="46" y1="13" x2="46" y2="207" stroke="var(--wt21-colors-dark-gray)" stroke-width="1.5"></line>
            </svg>
          </div>

          <div class="aoa-readout" ref={this.readoutRef}>
            {this.relativeAoaStr}
          </div>

          <div class="aoa-high-rhombus-bug hidden" ref={this.highRhombusBugRef}>
            <svg>
              <path d="m 2 8 l 0 0 l 6 -6 l 19 0 l -6 6 z" fill="none" stroke="var(--wt21-colors-dark-gray)" stroke-width="1.5" />
            </svg>
          </div>

          <div class="aoa-arrow-bug hidden" ref={this.arrowBugRef}>
            <svg>
              <path d="m 8 2 l -6 6 l 6 6 l 19.5 0 l -6 -6 l 6 -6 z" fill="none" stroke="var(--wt21-colors-dark-gray)" stroke-width="1.5" />
            </svg>
          </div>

          <div class="aoa-low-rhombus-bug hidden" ref={this.lowRhombusBugRef}>
            <svg>
              <path d="m 2 8 l 0 0 l 6 6 l 19.5 0 l -6 -6 z" fill="none" stroke="var(--wt21-colors-dark-gray)" stroke-width="1.5" />
            </svg>
          </div>
        </div>
        <div class="fail-box-small">
          AOA
        </div>
      </div>
    );
  }
}