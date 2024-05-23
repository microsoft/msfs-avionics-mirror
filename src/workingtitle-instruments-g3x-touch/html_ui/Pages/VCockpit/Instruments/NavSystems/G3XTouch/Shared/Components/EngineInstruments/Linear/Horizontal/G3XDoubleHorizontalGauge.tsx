import { FSComponent, MappedSubject, Subject, VNode } from '@microsoft/msfs-sdk';

import { G3XHorizontalPointer } from './Elements/G3XHorizontalPointer';
import { G3XHorizontalGauge } from './G3XHorizontalGauge';
import { G3XHorizontalTitleOnlyHeader } from './Elements/G3XHorizontalTitleOnlyHeader';

import './G3XDoubleHorizontalGauge.css';

/** A horizontal bar gauge for displaying a double value. */
export class G3XDoubleHorizontalGauge extends G3XHorizontalGauge {
  protected static readonly GAUGE_VIEWBOX_WIDTH = 10;
  protected static readonly GAUGE_VIEWBOX_HEIGHT = 24;
  protected static readonly GAUGE_VIEWBOX_TEXT_HEIGHT = 14;

  protected peak2ValueCandidate = 0;
  protected readonly value2Subject = Subject.create(0);

  private readonly value2PeakSubject = Subject.create<number>(0);
  private readonly showPeak2VisualsSubject = MappedSubject.create(
    ([peakValue, usePeakMode]) => !!(peakValue > 0 && usePeakMode),
    this.value2PeakSubject,
    this.usePeakModeSubject
  );
  private readonly peak2PointerDisplaySubject = this.showPeak2VisualsSubject.map(show => show ? 'block' : 'none');

  /** @inheritDoc */
  protected initGauge(): void {
    super.initGauge();

    if (this.props.value2 !== undefined) {
      this.value2Subject.set(this.props.logicHost?.addLogicAsNumber(
        this.props.value2,
        (val: number) => this.value2Subject.set(val),
        2,
        this.props.smoothFactor
      ));
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
  }

  /** @inheritDoc */
  protected renderGauge(): VNode {
    return (
      <div class='double-horiz-container'>
        <G3XHorizontalTitleOnlyHeader
          {...this.props}
          label={this.labelSubject}
          alertSubject={this.alertSubject}
          showPeakVisuals={this.showPeakVisuals}
        />
        <svg
          class='inner-frame'
          preserveAspectRatio='none'
          viewBox={`0 0 ${G3XDoubleHorizontalGauge.GAUGE_VIEWBOX_WIDTH} ${G3XDoubleHorizontalGauge.GAUGE_VIEWBOX_HEIGHT}`}
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
              y2={G3XDoubleHorizontalGauge.GAUGE_VIEWBOX_HEIGHT}
              stroke='white'
              stroke-width='2px'
              vector-effect='non-scaling-stroke'
            />
            <line
              x1={0}
              y1={G3XDoubleHorizontalGauge.GAUGE_VIEWBOX_HEIGHT / 2}
              x2={G3XDoubleHorizontalGauge.GAUGE_VIEWBOX_WIDTH}
              y2={G3XDoubleHorizontalGauge.GAUGE_VIEWBOX_HEIGHT / 2}
              stroke='white'
              stroke-width='2px'
              vector-effect='non-scaling-stroke'
            />
            <line
              x1={0}
              y1={G3XDoubleHorizontalGauge.GAUGE_VIEWBOX_HEIGHT / 2}
              x2={G3XDoubleHorizontalGauge.GAUGE_VIEWBOX_WIDTH}
              y2={G3XDoubleHorizontalGauge.GAUGE_VIEWBOX_HEIGHT / 2}
              stroke='darkgrey'
              stroke-width='.5px'
              vector-effect='non-scaling-stroke'
            />
            <line
              x1={G3XDoubleHorizontalGauge.GAUGE_VIEWBOX_WIDTH}
              y1={0}
              x2={G3XDoubleHorizontalGauge.GAUGE_VIEWBOX_WIDTH}
              y2={G3XDoubleHorizontalGauge.GAUGE_VIEWBOX_HEIGHT}
              stroke='white'
              stroke-width='2px'
              vector-effect='non-scaling-stroke'
            />
          </g>
          <g class='colour-zone-group' ref={this.zoneGroupRef} />
        </svg>
        <svg
          class='inner-lines-frame'
          preserveAspectRatio='none'
          viewBox={`0 0 ${G3XHorizontalGauge.GAUGE_VIEWBOX_WIDTH} ${G3XHorizontalGauge.GAUGE_VIEWBOX_HEIGHT}`}
        >
          <g class='color-lines-group' ref={this.lineGroupRef} />
        </svg>
        <div class='value_1'>
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
        <div class='value_2'>
          <G3XHorizontalPointer {...this.props} valueSubject={this.value2Subject} showAsPeak={false} index={1} label={this.props.cursorText2} />
          {this.props.allowPeakMode && (
            <div
              style={{
                display: this.peak2PointerDisplaySubject,
              }}
            >
              <G3XHorizontalPointer {...this.props} valueSubject={this.value2PeakSubject} showAsPeak={true} index={1} />
            </div>
          )}
        </div>
      </div>
    );
  }
}