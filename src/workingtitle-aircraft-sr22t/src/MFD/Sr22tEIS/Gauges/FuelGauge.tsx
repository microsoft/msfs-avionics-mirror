import {
  ComponentProps, ComputedSubject, ConsumerSubject, DisplayComponent, EngineEvents, EventBus, FSComponent, MappedSubject, MathUtils, Subject, Subscribable, VNode
} from '@microsoft/msfs-sdk';
import { FuelTotalizerSimVars } from '@microsoft/msfs-wtg1000';

import './FuelGauge.css';
import { Sr22tEngineComputerEvents } from '../../Sr22tEcu/Sr22tEngineComputer';

/** Component properties for {@link FuelGauge}. */
export interface FuelGaugeProps extends ComponentProps {
  /** The event bus. */
  bus: EventBus;
}

/** The EIS Fuel Gauge component. */
export class FuelGauge extends DisplayComponent<FuelGaugeProps> {
  private readonly sub = this.props.bus.getSubscriber<FuelTotalizerSimVars & EngineEvents>();

  private readonly fuelGalLeft = ConsumerSubject.create(this.sub.on('fuel_left').withPrecision(1), 0);
  private readonly fuelGalRight = ConsumerSubject.create(this.sub.on('fuel_right').withPrecision(1), 0);

  private readonly fuelUsed = ConsumerSubject.create(this.sub.on('burnedFuel').withPrecision(1), 0);
  private readonly fuelUsedDisplay = ComputedSubject.create(0, v => v.toFixed(1));

  /** @inheritDoc */
  public onAfterRender(): void {
    this.fuelUsed.pipe(this.fuelUsedDisplay);
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class="eis-gauge fuel-gauge">
        <div class='fuel-gauge-container'>
          <div class="fuel-qty-gauge">
            <FuelQtyDiagram side={FuelQtyDiagramSide.Left} fuelQtyGallons={this.fuelGalLeft} />
            <div class="fuel-qty-label">
              <div>F</div>
              <div>40</div>
              <div>30</div>
              <div>20</div>
              <div>10</div>
              <div>0</div>
              <div class="fuel-qty-unit-label">GAL</div>
            </div>
            <FuelQtyDiagram side={FuelQtyDiagramSide.Right} fuelQtyGallons={this.fuelGalRight} />
          </div>
          <FuelFlowDiagram bus={this.props.bus} />
        </div>
        <div class='fuel-used'>
          <div class='fuel-used-label'>GAL Used</div>
          <div class='fuel-used-value'>{this.fuelUsedDisplay}</div>
        </div>
      </div>
    );
  }
}

enum FuelQtyDiagramSide {
  Left = 'left',
  Right = 'right',
}

/** Component properties for {@link FuelQtyDiagram}. */
interface FuelQtyDiagramProps extends ComponentProps {
  /** The side of the fuel qty diagram (right side is mirrored) */
  side: FuelQtyDiagramSide;
  /** The fuel quantity in gallons */
  fuelQtyGallons: Subscribable<number>;
}

/** The EIS Fuel Qty Diagram component. */
class FuelQtyDiagram extends DisplayComponent<FuelQtyDiagramProps> {
  private readonly fuelQtyPointerRef = FSComponent.createRef<SVGElement>();
  private readonly fuelQtyCaution = Subject.create(false);

  /** @inheritDoc */
  public onAfterRender(): void {
    this.props.fuelQtyGallons.sub(v => {
      this.fuelQtyPointerRef.instance.style.transform = `translate3d(0, -${MathUtils.clamp(v / 46 * 85, 0, 85)}px, 0)`;
      this.fuelQtyCaution.set(v < 14);
    }, true);
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class={`fuel-qty-diagram ${this.props.side}`}>
        <div class="fuel-diagram-green-column"></div>
        <div class="fuel-diagram-yellow-column"></div>
        <div class="fuel-diagram-section small"></div>
        <div class="fuel-diagram-section"></div>
        <div class="fuel-diagram-section"></div>
        <div class="fuel-diagram-section"></div>
        <svg ref={this.fuelQtyPointerRef} class={{
          'fuel-qty-pointer': true,
          'caution': this.fuelQtyCaution,
        }} viewBox="-0.5 0 20 14" width="18px" height="14px">
          <path d="M 0.5 1 L 0.5 13 L 17.5 6 L 1.5 1 Z" stroke="#000000" stroke-width="0.5" fill="#FFFFFF" />
        </svg>
        <div class="fuel-diagram-label">{this.props.side === FuelQtyDiagramSide.Left ? 'L' : 'R'}</div>
      </div>
    );
  }
}

/** Component properties for {@link FuelFlowDiagram}. */
interface FuelFlowDiagramProps extends ComponentProps {
  /** The event bus */
  bus: EventBus;
}

/** The EIS Fuel Flow Diagram component. */
class FuelFlowDiagram extends DisplayComponent<FuelFlowDiagramProps> {
  private readonly fuelFlowValue = ConsumerSubject.create(this.props.bus.getSubscriber<EngineEvents>().on('fuel_flow_total').withPrecision(1), 0);
  private readonly fuelFlowDisplay = ComputedSubject.create(0, v => v.toFixed(1));

  private readonly fuelFlowPointerRef = FSComponent.createRef<SVGElement>();
  private readonly diagramGreenBandRef = FSComponent.createRef<HTMLDivElement>();
  private readonly diagramCyanLineRef = FSComponent.createRef<HTMLDivElement>();

  private readonly greenBandTop = ConsumerSubject.create(this.props.bus.getSubscriber<Sr22tEngineComputerEvents>().on('ecu-fuelflow-max'), 0); // in gallons per hour
  private readonly greenBandBottom = ConsumerSubject.create(this.props.bus.getSubscriber<Sr22tEngineComputerEvents>().on('ecu-fuelflow-min'), 0); // in gallons per hour
  private readonly cyanBar = ConsumerSubject.create(this.props.bus.getSubscriber<Sr22tEngineComputerEvents>().on('ecu-fuelflow-target'), 0); // in gallons per hour

  /** @inheritDoc */
  public onAfterRender(): void {
    this.fuelFlowValue.sub(v => {
      this.fuelFlowPointerRef.instance.style.transform = `translate3d(0, -${MathUtils.clamp(v / 45 * 85, 0, 85)}px, 0)`;
      this.fuelFlowDisplay.set(v);
    }, true);

    MappedSubject.create(this.greenBandTop, this.greenBandBottom).sub(([top, bottom]) => {
      this.diagramGreenBandRef.instance.classList.toggle('hidden', top === 0 || bottom === 0);
      this.diagramGreenBandRef.instance.style.top = `${MathUtils.clamp(85 - (top / 45 * 85), 0, 85)}px`;
      this.diagramGreenBandRef.instance.style.bottom = `${MathUtils.clamp(bottom / 45 * 85, 0, 85)}px`;
    }, true);

    this.cyanBar.sub(v => {
      this.diagramCyanLineRef.instance.classList.toggle('hidden', v === 0);
      this.diagramCyanLineRef.instance.style.bottom = `${MathUtils.clamp((v / 45 * 85) - 1.5, 0, 85)}px`;
    }, true);
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class="fuel-flow-diagram">
        <div class="diagram-container">
          <div class="diagram-green-band hidden" ref={this.diagramGreenBandRef}></div>
          <div class="diagram-cyan-line hidden" ref={this.diagramCyanLineRef}></div>
          <div class="diagram-border"></div>
          <svg ref={this.fuelFlowPointerRef} class={{
            'fuel-flow-pointer': true,
          }} viewBox="-0.5 0 20 14" width="18px" height="14px">
            <path d="M 0.5 1 L 0.5 13 L 17.5 6 L 1.5 1 Z" stroke="#000000" stroke-width="0.5" fill="#FFFFFF" />
          </svg>
        </div>
        <div class="fuel-flow-value">{this.fuelFlowDisplay}</div>
        <div class="fuel-flow-label"> FFlow GPH</div>
      </div>
    );
  }
}