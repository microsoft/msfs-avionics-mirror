import { FSComponent, VNode } from '@microsoft/msfs-sdk';

import { G3XHorizontalGauge } from '../Horizontal';
import { G3XVerticalColorZone } from './Elements/G3XVerticalColorZone';
import { G3XVerticalColorLine } from './Elements/G3XVerticalColorLine';
import { G3XVerticalPointer } from './Elements/G3XVerticalPointer';
import { G3XVerticalSingleValueHeader } from './Elements/G3XVerticalSingleValueHeader';
import { G3XPeakingGaugeProps } from '../../../G3XGaugesConfigFactory';

import './G3XVerticalGauge.css';

/** A horizontal bar gauge for displaying a single value. */
export class G3XVerticalGauge<T extends Partial<G3XPeakingGaugeProps> = Partial<G3XPeakingGaugeProps>> extends G3XHorizontalGauge<T> {
  protected static readonly GAUGE_VIEWBOX_WIDTH: number = 14;
  protected static readonly GAUGE_VIEWBOX_HEIGHT: number = 100;
  protected static readonly GAUGE_VIEWBOX_TEXT_HEIGHT: number = 14;

  /** @inheritDoc */
  protected drawZones(): void {
    if (this.props.colorZones) {
      for (let i = 0; i < this.props.colorZones.length; i++) {
        FSComponent.render(
          <G3XVerticalColorZone
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

  /** @inheritDoc */
  protected drawLines(): void {
    if (this.props.colorLines) {
      for (let i = 0; i < this.props.colorLines.length; i++) {
        FSComponent.render(
          <G3XVerticalColorLine
            logicHost={this.props.logicHost}
            geometry={this.geometry}
            color={this.props.colorLines[i].color}
            position={this.props.colorLines[i].position}
            smoothFactor={this.props.colorLines[i].smoothFactor}
            scaleWidth={G3XVerticalGauge.GAUGE_VIEWBOX_WIDTH}
            scaleHeight={G3XVerticalGauge.GAUGE_VIEWBOX_HEIGHT}
          />,
          this.lineGroupRef.instance);
      }
    }
  }

  /** @inheritDoc */
  protected renderGauge(): VNode {
    return (
      <div class='single-vert-container'>
        <G3XVerticalSingleValueHeader
          {...this.props}
          label={this.labelSubject}
          alertSubject={this.alertSubject}
          valueSubject={this.headerValueSubject}
          showPeakVisuals={this.showPeakVisuals}
        />
        <div class='inner-frame'>
          <svg
            class='zones-and-lines'
            preserveAspectRatio='none'
            viewBox={`0 0 ${G3XVerticalGauge.GAUGE_VIEWBOX_WIDTH} ${G3XVerticalGauge.GAUGE_VIEWBOX_HEIGHT}`}
          >
            <defs>
              <linearGradient id='colorZoneCoverFill' x1='0%' y1='0%' x2='100%' y2='0%'>
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
                x2={G3XVerticalGauge.GAUGE_VIEWBOX_WIDTH}
                y2={0}
                stroke='white'
                stroke-width='2px'
                vector-effect='non-scaling-stroke'
              />
              <line
                x1={G3XVerticalGauge.GAUGE_VIEWBOX_WIDTH}
                y1={0}
                x2={G3XVerticalGauge.GAUGE_VIEWBOX_WIDTH}
                y2={G3XVerticalGauge.GAUGE_VIEWBOX_HEIGHT}
                stroke='white'
                stroke-width='2px'
                vector-effect='non-scaling-stroke'
              />
              <line
                x1={G3XVerticalGauge.GAUGE_VIEWBOX_WIDTH}
                y1={0}
                x2={G3XVerticalGauge.GAUGE_VIEWBOX_WIDTH}
                y2={G3XVerticalGauge.GAUGE_VIEWBOX_HEIGHT}
                stroke='darkgrey'
                stroke-width='.5px'
                vector-effect='non-scaling-stroke'
              />
              <line
                x1={G3XVerticalGauge.GAUGE_VIEWBOX_WIDTH}
                y1={G3XVerticalGauge.GAUGE_VIEWBOX_HEIGHT}
                x2={0}
                y2={G3XVerticalGauge.GAUGE_VIEWBOX_HEIGHT}
                stroke='white'
                stroke-width='2px'
                vector-effect='non-scaling-stroke'
              />
            </g>
          </svg>
          <svg
            class='inner-lines-frame'
            preserveAspectRatio='none'
            viewBox={`0 0 ${G3XVerticalGauge.GAUGE_VIEWBOX_WIDTH} ${G3XVerticalGauge.GAUGE_VIEWBOX_HEIGHT}`}
          >
            <g class='color-lines-group' ref={this.lineGroupRef} />
          </svg>
          <G3XVerticalPointer {...this.props} valueSubject={this.valueSubject} showAsPeak={false} index={0} label={this.props.cursorText1} />
          {this.props.allowPeakMode && (
            <div
              style={{
                display: this.peakPointerDisplay,
              }}
            >
              <G3XVerticalPointer {...this.props} valueSubject={this.valuePeakSubject} showAsPeak={true} index={0} />
            </div>
          )}
        </div>
      </div>
    );
  }
}


