import {
  ComponentProps, DisplayComponent, FSComponent, EventBus, VNode, ConsumerSubject, MappedSubject, Subject, Subscription, Subscribable, MathUtils, NumberFormatter
} from '@microsoft/msfs-sdk';
import { Sr22tSimvarEvents } from '../../Sr22tSimvarPublisher/Sr22tSimvarPublisher';

import './EngineTempGauge.css';

/** Component properties for {@link EngineTempGauge}. */
export interface EngineTempGaugeProps extends ComponentProps {
  /** The event bus. */
  bus: EventBus;
}

/** The EIS Engine Temp Gauge component. */
export class EngineTempGauge extends DisplayComponent<EngineTempGaugeProps> {
  private static readonly TIT_WARNING_THRESHOLD = 1750;
  private static readonly CHT_CAUTION_THRESHOLD = 420;
  private static readonly CHT_WARNING_THRESHOLD = 460;

  private readonly sub = this.props.bus.getSubscriber<Sr22tSimvarEvents>();

  // Cylinder SimVars
  private readonly chtSubjects = [
    ConsumerSubject.create(this.sub.on('c1_head_temp').withPrecision(0), 0),
    ConsumerSubject.create(this.sub.on('c2_head_temp').withPrecision(0), 0),
    ConsumerSubject.create(this.sub.on('c3_head_temp').withPrecision(0), 0),
    ConsumerSubject.create(this.sub.on('c4_head_temp').withPrecision(0), 0),
    ConsumerSubject.create(this.sub.on('c5_head_temp').withPrecision(0), 0),
    ConsumerSubject.create(this.sub.on('c6_head_temp').withPrecision(0), 0)
  ];
  private readonly egtSubjects = [
    ConsumerSubject.create(this.sub.on('c1_exhaust_temp').withPrecision(0), 0),
    ConsumerSubject.create(this.sub.on('c2_exhaust_temp').withPrecision(0), 0),
    ConsumerSubject.create(this.sub.on('c3_exhaust_temp').withPrecision(0), 0),
    ConsumerSubject.create(this.sub.on('c4_exhaust_temp').withPrecision(0), 0),
    ConsumerSubject.create(this.sub.on('c5_exhaust_temp').withPrecision(0), 0),
    ConsumerSubject.create(this.sub.on('c6_exhaust_temp').withPrecision(0), 0)
  ];
  // Turbocharger intake temp Sim Vars
  private readonly titSubjects = [
    ConsumerSubject.create(this.sub.on('t1_inlet_temp').withPrecision(0), 0),
    ConsumerSubject.create(this.sub.on('t2_inlet_temp').withPrecision(0), 0)
  ];

  private readonly hottestChtIndex = MappedSubject.create(
    values => this.findHottestIndex(values),
    ...this.chtSubjects
  );

  /** The index of the hottest cylinder EGT or Turbo intake. Indices 0 to 5 correspond to EGT, 6 and 7 to TIT */
  private readonly hottestEgtTitIndex = MappedSubject.create(
    values => this.findHottestIndex(values),
    ...this.egtSubjects, ...this.titSubjects
  );

  private readonly chtCaution = Subject.create(false);
  private readonly chtWarning = Subject.create(false);
  private readonly titWarning = Subject.create(false);

  private readonly hottestChtValue = Subject.create(0);
  private readonly hottestEgtTitValue = ConsumerSubject.create(null, 0);
  private readonly egtFormatter = NumberFormatter.create({ precision: 5 });
  private readonly hottestEgtTitValueDisplay = MappedSubject.create(([temp]) => {
    this.titWarning.set(temp >= EngineTempGauge.TIT_WARNING_THRESHOLD);
    return this.egtFormatter(temp);
  }, this.hottestEgtTitValue);

  private chtValueSub: Subscription | undefined;

  /** @inheritDoc */
  public onAfterRender(): void {
    this.hottestChtIndex.sub(i => {
      this.chtValueSub?.destroy();
      this.chtValueSub = this.chtSubjects[i].pipe(this.hottestChtValue);
    }, true);
    this.hottestEgtTitIndex.sub(i => {
      // indices 0 to 5 correspond to egtIndex
      if (i < 6) {
        this.hottestEgtTitValue.setConsumer(this.sub.on(`c${i + 1}_exhaust_temp` as any).withPrecision(0));
      } else {
        // indices 6 and 7 are titIndex, these have to be translated to 1 and 2
        this.hottestEgtTitValue.setConsumer(this.sub.on(`t${i - 5}_inlet_temp` as any).withPrecision(0));
      }
    }, true);
    this.hottestChtValue.sub(v => {
      this.chtCaution.set(v >= EngineTempGauge.CHT_CAUTION_THRESHOLD && v < EngineTempGauge.CHT_WARNING_THRESHOLD);
      this.chtWarning.set(v >= EngineTempGauge.CHT_WARNING_THRESHOLD);
    }, true);
  }

  /**
   * Returns the index of the hottest cylinder.
   * @param values The temperature values.
   * @returns The index of the hottest cylinder.
   */
  private findHottestIndex(values: readonly number[]): number {
    let hottestIndex = 0;
    for (let i = 1; i < values.length; i++) {
      if (values[i] > values[hottestIndex]) {
        hottestIndex = i;
      }
    }
    return hottestIndex;
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class="eis-gauge engine-temp-gauge">
        <EngineTempDiagram
          diagramClass="cht-diagram"
          bus={this.props.bus}
          hottestIndex={this.hottestChtIndex}
          tempValues={this.chtSubjects}
          minTemp={100}
          maxTemp={500}
          cautionThreshold={420}
          warningThreshold={461}
        />
        <div class="eng-temp-row cht">
          <div class={{
            'eng-temp-label': true,
            'caution': this.chtCaution,
            'warning': this.chtWarning,
          }}><span class="warning-wrapper">CHT °F</span></div>
          <div class={{
            'eng-temp-value': true,
            'caution': this.chtCaution,
            'warning': this.chtWarning,
          }}><span class="warning-wrapper">{this.hottestChtValue}</span></div>
        </div>
        <EngineTempDiagram
          diagramClass="egt-diagram"
          bus={this.props.bus}
          hottestIndex={this.hottestEgtTitIndex.map(i => i < 6 ? i : -1)} // index set to -1 if not in EGT range
          tempValues={this.egtSubjects}
          minTemp={1000}
          maxTemp={1800}
        />
        <EngineTempDiagram
          diagramClass="tit-diagram"
          bus={this.props.bus}
          hottestIndex={this.hottestEgtTitIndex.map(i => i >= 6 ? i - 6 : -1)} // index has to be translated from 6 and 7 to 0 and 1, or -1 if not in TIT range
          tempValues={this.titSubjects}
          minTemp={1000}
          maxTemp={1800}
          warningThreshold={1750}
        />
        <div class="eng-temp-row egt">
          <div class={{
            'eng-temp-label': true,
            'warning': this.titWarning,
          }}><span class="warning-wrapper">EGT/TIT °F</span></div>
          <div class={{
            'eng-temp-value': true,
            'warning': this.titWarning,
          }}><span class="warning-wrapper">{this.hottestEgtTitValueDisplay}</span></div>
        </div>
      </div>
    );
  }
}

/** Component properties for {@link EngineTempDiagram}. */
interface EngineTempDiagramProps extends ComponentProps {
  /** The event bus. */
  bus: EventBus;
  /** The class name to apply to the component container. */
  diagramClass: string;
  /** The index of the hottest cylinder as a subscribable. */
  hottestIndex: Subscribable<number>;
  /** The array cylinder temperature values as subscribables. */
  tempValues: Subscribable<number>[];
  /** The minimum temperature displayed on the diagram, in Fahrenheit */
  minTemp: number;
  /** The maximum temperature displayed on the diagram, in Fahrenheit */
  maxTemp: number;
  /** The caution threshold, in Fahrenheit */
  cautionThreshold?: number;
  /** The warning threshold, in Fahrenheit */
  warningThreshold?: number;
}

/** Generic EIS Engine Temp Diagram component. */
class EngineTempDiagram extends DisplayComponent<EngineTempDiagramProps> {
  private readonly DISPLAY_RANGE = this.props.maxTemp - this.props.minTemp;

  private readonly cylinderRefs = Array.from({ length: this.props.tempValues.length }, () => {
    return FSComponent.createRef<HTMLDivElement>();
  });

  /** @inheritDoc */
  public onAfterRender(): void {
    this.props.tempValues.forEach((subject, index) => {
      subject.sub(v => {
        this.updateCylinderTempColumn(v, index);
      }, true);
    });
  }

  /**
   * Updates the position of the cylinder temperature column.
   * @param value The temperature value.
   * @param index The index of the cylinder.
   */
  private updateCylinderTempColumn(value: number, index: number): void {
    const pixels = MathUtils.clamp((value - this.props.minTemp) / this.DISPLAY_RANGE * 61, 0, 61);
    if (this.cylinderRefs[index]) {
      this.cylinderRefs[index].instance.style.transform = `translate3d(0, ${-pixels}px, 0)`;
      if (this.props.cautionThreshold) {
        this.cylinderRefs[index].instance.classList.toggle(
          'caution',
          value >= this.props.cautionThreshold && (!this.props.warningThreshold || value < this.props.warningThreshold)
        );
      }
      if (this.props.warningThreshold) {
        this.cylinderRefs[index].instance.classList.toggle(
          'warning',
          value >= this.props.warningThreshold
        );
      }
    }
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class={`engine-temp-diagram-container ${this.props.diagramClass}`}>
        <div class="scale-warning-section cht">
          <div class="scale-warning" />
          <div class="scale-caution" />
        </div>
        <div class="scale-warning-section egt">
          <div class="scale-warning" />
        </div>
        <svg class="diagram-scale cht" viewBox="0 0 10 61" width="10px" height="61px">
          <path d="M 0 0.5 L 9.5 0.5 L 9.5 60.5 M 0 60.5 L 10 60.5 M 9.5 15.5 L 0 15.5 M 9.5 30.5 L 0 30.5 M 9.5 45.5 L 0 45.5"
            stroke="#FFFFFF" stroke-width="1" fill="none"
          />
          <path class="short-scale-lines" d="M 9.5 8.5 L 4 8.5 M 9.5 23.5 L 4 23.5 M 9.5 38.5 L 4 38.5 M 9.5 53.5 L 4 53.5"
            stroke="#FFFFFF" stroke-width="1" fill="none"
          />
        </svg>
        <svg class="diagram-scale egt" viewBox="2 0 8 61" width="8px" height="61px">
          <path d="M 0 0.5 L 9.5 0.5 L 9.5 60.5 M 0 60.5 L 10 60.5 M 9.5 15.5 L 0 15.5 M 9.5 30.5 L 0 30.5 M 9.5 45.5 L 0 45.5"
            stroke="#FFFFFF" stroke-width="1" fill="none"
          />
        </svg>
        <div class="cylinder-container">
          {this.renderCylinders()}
        </div>
        <div class="cylinder-number-row">
          {this.renderCylinderNumbers()}
        </div>
      </div>
    );
  }

  /**
   * Renders the cylinder columns.
   * @returns The array cylinder column VNodes.
   */
  private renderCylinders(): VNode[] {
    return Array.from({ length: this.props.tempValues.length }, (_, i) => {
      return <div class="cylinder-column"><div class="temp-cylinder" ref={this.cylinderRefs[i]}></div></div>;
    });
  }

  /**
   * Renders the cylinder numbers.
   * @returns The array cylinder number VNodes.
   */
  private renderCylinderNumbers(): VNode[] {
    return Array.from({ length: this.props.tempValues.length }, (_, i) => {
      return (
        <div class={{ 'cylinder-number': true, hottest: this.props.hottestIndex.map(v => v === i) }}>
          {this.props.tempValues.length === 2 ? `${i === 0 ? 'L' : 'R'}` : `${i + 1}`}
        </div>
      );
    });
  }
}
