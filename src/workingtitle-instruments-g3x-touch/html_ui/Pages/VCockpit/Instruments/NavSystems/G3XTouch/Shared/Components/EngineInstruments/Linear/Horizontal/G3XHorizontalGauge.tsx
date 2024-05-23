import { FSComponent, MappedSubject, Subject, Subscribable, Subscription, VNode, XMLHostedLogicGauge } from '@microsoft/msfs-sdk';

import { G3XBaseGauge } from '../../G3XBaseGauge';
import { G3XHorizontalPointer } from './Elements/G3XHorizontalPointer';
import { G3XHorizontalSingleValueHeader } from './Elements/G3XHorizontalSingleValueHeader';
import { G3XHorizontalColorZone } from './Elements/G3XHorizontalColorZone';
import { G3XHorizontalColorLine } from './Elements/G3XHorizontalColorLine';
import { G3XPeakingGaugeProps } from '../../../G3XGaugesConfigFactory/Gauges/G3XPeakingGaugeProps';

import './G3XHorizontalGauge.css';

/** The basic layout info needed for drawing horizontal gauge parts. */
export type G3XHorizontalBarGaugeGeometry = {
  /** A subject for the minimum bar value. */
  minValue: Subscribable<number>,
  /** A subject for the maximum bar value. */
  maxValue: Subscribable<number>
}

/** A horizontal bar gauge for displaying a single value. */
export class G3XHorizontalGauge<T extends Partial<G3XPeakingGaugeProps> = Partial<G3XPeakingGaugeProps>> extends G3XBaseGauge<T & XMLHostedLogicGauge> {
  protected static readonly GAUGE_VIEWBOX_WIDTH: number = 10;
  protected static readonly GAUGE_VIEWBOX_HEIGHT: number = 14;
  protected static readonly GAUGE_VIEWBOX_TEXT_HEIGHT: number = 14;

  protected readonly zoneGroupRef = FSComponent.createRef<SVGGElement>();
  protected readonly lineGroupRef = FSComponent.createRef<SVGGElement>();

  protected readonly minValue = Subject.create(0);
  protected readonly maxValue = Subject.create(0);
  protected geometry: G3XHorizontalBarGaugeGeometry;

  protected readonly alertSubject = Subject.create(false);
  protected readonly usePeakModeSubject = Subject.create(false);
  protected readonly valueSubject = Subject.create(0);
  protected readonly valuePeakSubject = Subject.create(0);
  protected readonly showPeakVisuals = MappedSubject.create(
    ([peakValue, usePeakMode]) => !!(peakValue > 0 && usePeakMode),
    this.valuePeakSubject,
    this.usePeakModeSubject
  );
  protected readonly peakPointerDisplay = this.showPeakVisuals.map(show => show ? 'block' : 'none');
  protected readonly labelSubject = this.showPeakVisuals.map(show =>
    this.props.title
      ? show
        ? 'Δ' + this.props.title
        : this.props.title
      : ''
  );
  protected readonly headerValueSubject = MappedSubject.create(
    ([value, peakValue, usePeakMode]) => usePeakMode ? value - peakValue : value,
    this.valueSubject,
    this.valuePeakSubject,
    this.usePeakModeSubject
  );
  protected peakValueCandidate = 0;

  private readonly valueSubscription = this.valueSubject.sub((value: number) => {
    if (value > this.peakValueCandidate) {
      this.valuePeakSubject.set(0);
    }
    if (this.valuePeakSubject.get() === 0) {
      if (this.peakValueCandidate > value) {
        this.valuePeakSubject.set(this.peakValueCandidate);
      } else {
        this.peakValueCandidate = value;
      }
    }
  });

  private peakModeSubscription: Subscription | undefined;

  /**
   * Create a horizontal gauge.
   * @param props The properties for the gauge.
   */
  constructor(props: T & XMLHostedLogicGauge) {
    super(props);
    this.geometry = {
      minValue: this.minValue,
      maxValue: this.maxValue
    };
  }

  /** @inheritDoc */
  protected initGauge(): void {
    this.initLogic();
    this.drawZones();
    this.drawLines();
  }

  /**
   * Draw zones.
   */
  protected drawZones(): void {
    if (this.props.colorZones) {
      for (let i = 0; i < this.props.colorZones.length; i++) {
        FSComponent.render(
          <G3XHorizontalColorZone
            logicHost={this.props.logicHost}
            values={this.props.colorZones[i]}
            gaugeMin={this.props.minimum}
            gaugeMax={this.props.maximum}
            geometry={this.geometry}
          />,
          this.zoneGroupRef.instance);
      }
    }
  }

  /**
   * Draw lines.
   */
  protected drawLines(): void {
    if (this.props.colorLines) {
      for (let i = 0; i < this.props.colorLines.length; i++) {
        FSComponent.render(
          <G3XHorizontalColorLine
            logicHost={this.props.logicHost}
            geometry={this.geometry}
            color={this.props.colorLines[i].color}
            position={this.props.colorLines[i].position}
            smoothFactor={this.props.colorLines[i].smoothFactor}
            scaleWidth={G3XHorizontalGauge.GAUGE_VIEWBOX_WIDTH}
            scaleHeight={G3XHorizontalGauge.GAUGE_VIEWBOX_HEIGHT}
          />,
          this.lineGroupRef.instance);
      }
    }
  }

  /**
   * Initialize the logic for the gauge.
   * @throws Error when gauge is configured to display peak values but bus is not provided.
   */
  private initLogic(): void {
    if (this.props.minimum) {
      this.minValue.set(this.props.logicHost?.addLogicAsNumber(this.props.minimum, (min: number) => {
        this.minValue.set(min);
      }, 2, this.props.smoothFactor));
    }

    if (this.props.maximum) {
      this.maxValue.set(this.props.logicHost?.addLogicAsNumber(this.props.maximum, (max: number) => {
        this.maxValue.set(max);
      }, 2, this.props.smoothFactor));
    }

    if (this.props.value1 !== undefined) {
      this.valueSubject.set(this.props.logicHost?.addLogicAsNumber(this.props.value1, (val: number) => {
        this.valueSubject.set(val);
      }, this.props.style?.valuePrecision ?? 2, this.props.smoothFactor));
    }

    if (this.props.redBlink) {
      this.props.logicHost?.addLogicAsNumber(this.props.redBlink, (value: number) => {
        this.alertSubject.set(!!value);
      }, 0);
    }

    if (this.props.allowPeakMode && this.props.peakModeTriggerBusEvent) {
      const sub = this.props.bus?.getSubscriber<any>();
      if (sub) {
        this.peakModeSubscription = sub.on(this.props.peakModeTriggerBusEvent).handle(state => {
          this.usePeakModeSubject.set(state);
        });
      } else {
        throw new Error(`G3XHorizontalGauge: Can not use peak mode - could not subscribe to bus event ${this.props.peakModeTriggerBusEvent}`);
      }
    }

    this.usePeakModeSubject.sub((usePeak) => {
      if (!usePeak) {
        this.valuePeakSubject.set(0);
        this.peakValueCandidate = 0;
      }
    });
  }

  /** @inheritDoc */
  protected renderGauge(): VNode {
    return (
      <div class='single-horiz-container'>
        <G3XHorizontalSingleValueHeader
          {...this.props}
          label={this.labelSubject}
          alertSubject={this.alertSubject}
          valueSubject={this.headerValueSubject}
          showPeakVisuals={this.showPeakVisuals}
        />
        <svg
          class='inner-frame'
          preserveAspectRatio='none'
          viewBox={`0 0 ${G3XHorizontalGauge.GAUGE_VIEWBOX_WIDTH} ${G3XHorizontalGauge.GAUGE_VIEWBOX_HEIGHT}`}
        >
          <defs>
            <linearGradient id='horizontalColorZoneCoverFill' x1='0%' y1='0%' x2='0%' y2='100%'>
              <stop offset='0%' style='stop-color:rgb(0, 0, 0);stop-opacity:0.45' />
              <stop offset='33%' style='stop-color:rgb(0, 0, 0);stop-opacity:0' />
              <stop offset='66%' style='stop-color:rgb(0, 0, 0);stop-opacity:0' />
              <stop offset='100%' style='stop-color:rgb(0, 0, 0);stop-opacity:0.45' />
            </linearGradient>
          </defs>
          <g ref={this.zoneGroupRef} />
          <g>
            <line
              x1={0}
              y1={0}
              x2={0}
              y2={G3XHorizontalGauge.GAUGE_VIEWBOX_HEIGHT}
              stroke='white'
              stroke-width='2px'
              vector-effect='non-scaling-stroke'
            />
            <line
              x1={0}
              y1={G3XHorizontalGauge.GAUGE_VIEWBOX_HEIGHT}
              x2={G3XHorizontalGauge.GAUGE_VIEWBOX_WIDTH}
              y2={G3XHorizontalGauge.GAUGE_VIEWBOX_HEIGHT}
              stroke='white'
              stroke-width='2px'
              vector-effect='non-scaling-stroke'
            />
            <line
              x1={0}
              y1={G3XHorizontalGauge.GAUGE_VIEWBOX_HEIGHT}
              x2={G3XHorizontalGauge.GAUGE_VIEWBOX_WIDTH}
              y2={G3XHorizontalGauge.GAUGE_VIEWBOX_HEIGHT}
              stroke='darkgrey'
              stroke-width='.5px'
              vector-effect='non-scaling-stroke'
            />
            <line
              x1={G3XHorizontalGauge.GAUGE_VIEWBOX_WIDTH}
              y1={0}
              x2={G3XHorizontalGauge.GAUGE_VIEWBOX_WIDTH}
              y2={G3XHorizontalGauge.GAUGE_VIEWBOX_HEIGHT}
              stroke='white'
              stroke-width='2px'
              vector-effect='non-scaling-stroke'
            />
          </g>
        </svg>
        <svg
          class='inner-lines-frame'
          preserveAspectRatio='none'
          viewBox={`0 0 ${G3XHorizontalGauge.GAUGE_VIEWBOX_WIDTH} ${G3XHorizontalGauge.GAUGE_VIEWBOX_HEIGHT}`}
        >
          <g class='color-lines-group' ref={this.lineGroupRef} />
        </svg>
        <G3XHorizontalPointer {...this.props} valueSubject={this.valueSubject} showAsPeak={false} index={0} label={this.props.cursorText1} />
        {this.props.allowPeakMode && (
          <div
            style={{
              display: this.peakPointerDisplay,
            }}
          >
            <G3XHorizontalPointer {...this.props} valueSubject={this.valuePeakSubject} showAsPeak={true} index={0} />
          </div>
        )}
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    super.destroy();
    this.valueSubscription.destroy();
    if (this.peakModeSubscription) {
      this.peakModeSubscription.destroy();
    }
  }
}


