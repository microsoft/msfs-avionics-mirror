import { FSComponent, MappedSubject, Subject, VNode } from '@microsoft/msfs-sdk';

import { G3XHorizontalPointer } from './Elements/G3XHorizontalPointer';
import { G3XHorizontalGauge } from './G3XHorizontalGauge';
import { G3XHorizontalColorZone } from './Elements/G3XHorizontalColorZone';
import { G3XHorizontalColorLine } from './Elements/G3XHorizontalColorLine';
import { G3XHorizontalOneRowDoubleValueHeader } from './Elements/G3XHorizontalOneRowDoubleValueHeader';

import './G3XTwinHorizontalGauge.css';

/** A horizontal bar gauge for displaying two values.
 * Twin gauge displays two gauges in a row, with a shared title.
 */
export class G3XTwinHorizontalGauge extends G3XHorizontalGauge {
  protected static readonly GAUGE_VIEWBOX_WIDTH = 100;
  protected static readonly GAUGE_VIEWBOX_HEIGHT = 14;
  protected static readonly GAUGE_VIEWBOX_TEXT_HEIGHT = 14;

  protected readonly zoneGroupRefs = {
    l: this.zoneGroupRef,
    r: FSComponent.createRef<SVGGElement>()
  };
  protected readonly lineGroupRefs = {
    l: this.lineGroupRef,
    r: FSComponent.createRef<SVGGElement>()
  };

  protected readonly value2Subject = Subject.create(0);
  private readonly value2PeakSubject = Subject.create(0);
  private readonly showPeak2VisualsSubject = MappedSubject.create(
    ([peakValue, usePeakMode]) => !!(peakValue > 0 && usePeakMode),
    this.value2PeakSubject,
    this.usePeakModeSubject
  );
  protected readonly header2ValueSubject = MappedSubject.create(
    ([value, peakValue, usePeakMode]) => usePeakMode ? value - peakValue : value,
    this.value2Subject,
    this.value2PeakSubject,
    this.usePeakModeSubject
  );
  protected peak2ValueCandidate = 0;

  /** @inheritDoc */
  protected initGauge(): void {
    super.initGauge();

    if (this.props.value2 !== undefined) {
      this.value2Subject.set(this.props.logicHost?.addLogicAsNumber(this.props.value2, (val: number) => {
        this.value2Subject.set(val);
      }, 2, this.props.smoothFactor));
    }

    this.value2Subject.sub((value: number) => {
      if (value > this.peak2ValueCandidate) {
        this.value2PeakSubject.set(0);
      }
      if (this.value2PeakSubject.get() === 0) {
        if (this.peak2ValueCandidate > value) {
          this.value2PeakSubject.set(this.peak2ValueCandidate);
        } else {
          this.peak2ValueCandidate = value;
        }
      }
    });

    this.usePeakModeSubject.sub((usePeak) => {
      if (!usePeak) {
        this.value2PeakSubject.set(0);
        this.peak2ValueCandidate = 0;
      }
    });

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
          this.zoneGroupRefs.r.instance);
      }
    }

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
          this.lineGroupRefs.r.instance);
      }
    }
  }

  /** @inheritDoc */
  protected renderGauge(): VNode {
    return (
      <div class='twin-horiz-container'>
        <G3XHorizontalOneRowDoubleValueHeader
          {...this.props}
          label={this.labelSubject}
          alert={this.alertSubject}
          showPeakVisualsLeft={this.showPeakVisuals}
          showPeakVisualsRight={this.showPeak2VisualsSubject}
          leftValue={this.valueSubject}
          rightValue={this.value2Subject}
        />
        <div class={'gauges-row'}>
          <div class='left-gauge'>
            {this.renderGaugeVisuals('l')}
          </div>
          <div class='right-gauge'>
            {this.renderGaugeVisuals('r')}
          </div>
        </div>
      </div>
    );
  }

  /**
   * render the gauge visuals
   * @param side - left or right placeholder to render
   * @returns A VNode
   */
  private renderGaugeVisuals(side: 'l' | 'r'): VNode {
    return <>
      <svg
        class='inner-frame'
        preserveAspectRatio='none'
        viewBox={`0 0 ${G3XTwinHorizontalGauge.GAUGE_VIEWBOX_WIDTH} ${G3XTwinHorizontalGauge.GAUGE_VIEWBOX_HEIGHT}`}
      >
        <defs>
          <linearGradient id='horizontalColorZoneCoverFill' x1='0%' y1='0%' x2='0%' y2='100%'>
            <stop offset='0%' style='stop-color:rgb(0, 0, 0);stop-opacity:0.45' />
            <stop offset='33%' style='stop-color:rgb(0, 0, 0);stop-opacity:0' />
            <stop offset='66%' style='stop-color:rgb(0, 0, 0);stop-opacity:0' />
            <stop offset='100%' style='stop-color:rgb(0, 0, 0);stop-opacity:0.45' />
          </linearGradient>
        </defs>
        <g>
          <line
            x1={0}
            y1={0}
            x2={0}
            y2={G3XTwinHorizontalGauge.GAUGE_VIEWBOX_HEIGHT}
            stroke='white'
            stroke-width='2px'
            vector-effect='non-scaling-stroke'
          />
          <line
            x1={0}
            y1={G3XTwinHorizontalGauge.GAUGE_VIEWBOX_HEIGHT}
            x2={G3XTwinHorizontalGauge.GAUGE_VIEWBOX_WIDTH}
            y2={G3XTwinHorizontalGauge.GAUGE_VIEWBOX_HEIGHT}
            stroke='white'
            stroke-width='2px'
            vector-effect='non-scaling-stroke'
          />
          <line
            x1={0}
            y1={G3XTwinHorizontalGauge.GAUGE_VIEWBOX_HEIGHT}
            x2={G3XTwinHorizontalGauge.GAUGE_VIEWBOX_WIDTH}
            y2={G3XTwinHorizontalGauge.GAUGE_VIEWBOX_HEIGHT}
            stroke='darkgrey'
            stroke-width='.5px'
            vector-effect='non-scaling-stroke'
          />
          <line
            x1={G3XTwinHorizontalGauge.GAUGE_VIEWBOX_WIDTH}
            y1={0}
            x2={G3XTwinHorizontalGauge.GAUGE_VIEWBOX_WIDTH}
            y2={G3XTwinHorizontalGauge.GAUGE_VIEWBOX_HEIGHT}
            stroke='white'
            stroke-width='2px'
            vector-effect='non-scaling-stroke'
          />
        </g>
        <g class='colour-zone-group' ref={this.zoneGroupRefs[side]} />
      </svg>
      <svg
        class='inner-lines-frame'
        preserveAspectRatio='none'
        viewBox={`0 0 ${G3XHorizontalGauge.GAUGE_VIEWBOX_WIDTH} ${G3XHorizontalGauge.GAUGE_VIEWBOX_HEIGHT}`}
      >
        <g class='color-lines-group' ref={this.lineGroupRefs[side]} />
      </svg>
      <div class='value'>
        <G3XHorizontalPointer
          {...this.props}
          valueSubject={side === 'l' ? this.valueSubject : this.value2Subject}
          showAsPeak={false}
          index={0}
          label={side === 'l' ? this.props.cursorText1 : this.props.cursorText2}
        />
        {this.props.allowPeakMode && (
          <div
            style={{
              display: this.peakPointerDisplay,
            }}
          >
            <G3XHorizontalPointer
              {...this.props}
              valueSubject={side === 'l' ? this.valuePeakSubject : this.value2PeakSubject}
              showAsPeak={true}
              index={0}
            />
          </div>
        )}
      </div>
    </>;
  }
}