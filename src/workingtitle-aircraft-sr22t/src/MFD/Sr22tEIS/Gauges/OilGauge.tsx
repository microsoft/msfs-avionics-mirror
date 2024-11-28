import { ComponentProps, DisplayComponent, FSComponent, EventBus, VNode, EngineEvents, ConsumerSubject, ComputedSubject, MathUtils, Subject } from '@microsoft/msfs-sdk';

import './OilGauge.css';

/** Component properties for {@link OilGauge}. */
export interface OilGaugeProps extends ComponentProps {
  /** The event bus. */
  bus: EventBus;
}

/** The EIS Oil Gauge component. */
export class OilGauge extends DisplayComponent<OilGaugeProps> {
  private static readonly OIL_PRESSURE_MIN_WARNING = 10; // PSI
  private static readonly OIL_PRESSURE_MIN_CAUTION = 30; // PSI
  private static readonly OIL_PRESSURE_MAX_WARNING = 100; // PSI
  private static readonly OIL_TEMPERATURE_MAX_WARNING = 240; // °F

  private static readonly OIL_HORIZONTAL_GAUGE_WIDTH = 134; // Pixels
  private static readonly OIL_PRESSURE_GAUGE_RANGE = 100; // 0-100 PSI
  private static readonly OIL_TEMPERATURE_GAUGE_RANGE = 175; // 75-250 °F

  private readonly sub = this.props.bus.getSubscriber<EngineEvents>();

  private readonly oilPress = ConsumerSubject.create(this.sub.on('oil_press_1'), 0);
  private readonly oilTemp = ConsumerSubject.create(this.sub.on('oil_temp_1'), 0);

  private readonly oilPressDisplay = ComputedSubject.create(0, p => p.toFixed(0));
  private readonly oilTempDisplay = ComputedSubject.create(0, p => p.toFixed(0));

  private readonly oilPressPointerRef = FSComponent.createRef<SVGElement>();
  private readonly oilTempPointerRef = FSComponent.createRef<SVGElement>();

  private readonly oilPressCaution = Subject.create(false);
  private readonly oilPressWarning = Subject.create(false);
  private readonly oilTempWarning = Subject.create(false);

  /** @inheritDoc */
  public onAfterRender(): void {
    this.oilPress.sub(v => {
      this.oilPressDisplay.set(v);
      const oilPressPixels = MathUtils.clamp((v / OilGauge.OIL_PRESSURE_GAUGE_RANGE), 0, 1) * OilGauge.OIL_HORIZONTAL_GAUGE_WIDTH;
      this.oilPressPointerRef.instance.style.transform = `translateX(${oilPressPixels}px)`;
      this.oilPressWarning.set(v < OilGauge.OIL_PRESSURE_MIN_WARNING || v > OilGauge.OIL_PRESSURE_MAX_WARNING);
      this.oilPressCaution.set(v >= OilGauge.OIL_PRESSURE_MIN_WARNING && v < OilGauge.OIL_PRESSURE_MIN_CAUTION);
    }, true);
    this.oilTemp.sub(v => {
      this.oilTempDisplay.set(v);
      const oilTempPixels = MathUtils.clamp(((v - 75) / OilGauge.OIL_TEMPERATURE_GAUGE_RANGE), 0, 1) * OilGauge.OIL_HORIZONTAL_GAUGE_WIDTH;
      this.oilTempPointerRef.instance.style.transform = `translateX(${oilTempPixels}px)`;
      this.oilTempWarning.set(v > OilGauge.OIL_TEMPERATURE_MAX_WARNING);
    }, true);
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class="eis-gauge oil-gauge">
        <div class="oil-gauge-row oil-temp">
          <div class={{
            'oil-label': true,
            'warning': this.oilTempWarning,
          }}><span class="warning-wrapper">Oil °F</span></div>
          <div class={{
            'oil-value': true,
            'warning': this.oilTempWarning,
          }}><span class="warning-wrapper">{this.oilTempDisplay}</span></div>
        </div>
        <div class="oil-horizontal-gauge oil-temp">
          <div class="green-section"></div>
          <div class="red-section"></div>
          <svg ref={this.oilTempPointerRef} class={{
            'oil-horizontal-gauge-pointer': true,
            'warning': this.oilTempWarning,
          }} viewBox="0 0 14 17" width="14px" height="17px">
            <path d="M 13 0.5 L 1 0.5 L 8 17.5 L 13 1.5 Z" stroke="#000000" stroke-width="0.5" fill="#FFFFFF"/>
          </svg>
        </div>
        <div class="oil-gauge-row oil-press">
          <div class={{
            'oil-label': true,
            'warning': this.oilPressWarning,
            'caution': this.oilPressCaution,
          }}><span class="warning-wrapper">Oil PSI</span></div>
          <div class={{
            'oil-value': true,
            'warning': this.oilPressWarning,
            'caution': this.oilPressCaution,
          }}><span class="warning-wrapper">{this.oilPressDisplay}</span></div>
        </div>
        <div class="oil-horizontal-gauge oil-press">
          <div class="red-section"></div>
          <div class="yellow-section left"></div>
          <div class="green-section"></div>
          <div class="yellow-section right"></div>
          <svg ref={this.oilPressPointerRef} class={{
            'oil-horizontal-gauge-pointer': true,
            'warning': this.oilPressWarning,
            'caution': this.oilPressCaution,
          }} viewBox="0 0 14 17" width="14px" height="17px">
            <path d="M 13 0.5 L 1 0.5 L 8 17.5 L 13 1.5 Z" stroke="#000000" stroke-width="0.5" fill="#FFFFFF"/>
          </svg>
        </div>
      </div>
    );
  }
}