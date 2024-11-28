import { FSComponent, MappedSubject, Subject, VNode, XMLHostedLogicGauge } from '@microsoft/msfs-sdk';

import { G3XVerticalPointer } from './Elements/G3XVerticalPointer';
import { G3XVerticalGauge } from './G3XVerticalGauge';
import { G3XVerticalColorZone } from './Elements/G3XVerticalColorZone';
import { G3XVerticalTwoRowsDoubleValueHeader } from './Elements/G3XVerticalTwoRowsDoubleValueHeader';
import { G3XDoubleZonesLinearGaugeProps } from '../../../G3XGaugesConfigFactory';
import { G3XVerticalColorLine } from './Elements';
import { G3XHorizontalBarGaugeGeometry } from '../Horizontal';

import './G3XDoubleVerticalGauge.css';

/** A horizontal bar gauge for displaying a single value. */
export class G3XDoubleVerticalGauge extends G3XVerticalGauge<Partial<G3XDoubleZonesLinearGaugeProps>> {
  protected static readonly GAUGE_VIEWBOX_WIDTH = 24;
  protected static readonly GAUGE_VIEWBOX_HEIGHT = 100;
  protected static readonly GAUGE_VIEWBOX_TEXT_HEIGHT = 14;

  private readonly zoneGroupRefLeft = FSComponent.createRef<SVGGElement>();
  private readonly zoneGroupRefRight = FSComponent.createRef<SVGGElement>();
  private readonly lineGroupRefLeft = FSComponent.createRef<SVGGElement>();
  private readonly lineGroupRefRight = FSComponent.createRef<SVGGElement>();

  protected readonly value2Subject = Subject.create(0);
  private readonly value2PeakSubject = Subject.create(0);
  private readonly showPeak2Visuals = MappedSubject.create(
    ([peakValue, usePeakMode]) => !!(peakValue > 0 && usePeakMode),
    this.value2PeakSubject,
    this.usePeakModeSubject
  );
  private readonly peak2PointerDisplay = this.showPeak2Visuals.map(show => show ? 'block' : 'none');
  protected readonly header2ValueSubject = MappedSubject.create(
    ([value, peakValue, usePeakMode]) => usePeakMode ? value - peakValue : value,
    this.value2Subject,
    this.value2PeakSubject,
    this.usePeakModeSubject
  );

  private readonly minValue2 = Subject.create(0);
  private readonly maxValue2 = Subject.create(0);

  protected peak2ValueCandidate = 0;

  private geometry2: G3XHorizontalBarGaugeGeometry;

  /** @inheritDoc */
  constructor(props: Partial<G3XDoubleZonesLinearGaugeProps> & XMLHostedLogicGauge) {
    super(props);
    this.geometry2 = {
      minValue: this.minValue2,
      maxValue: this.maxValue2,
    };
  }

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
          this.props.style?.useDoubleZones ? this.zoneGroupRefLeft.instance : this.zoneGroupRef.instance
        );
      }
    }
    if (this.props.colorZones2 && this.props.style?.useDoubleZones) {
      for (let i = 0; i < this.props.colorZones2.length; i++) {
        FSComponent.render(
          <G3XVerticalColorZone
            logicHost={this.props.logicHost}
            values={this.props.colorZones2[i]}
            gaugeMin={this.props.minimum2}
            gaugeMax={this.props.maximum2}
            geometry={this.geometry2}
          />,
          this.zoneGroupRefRight.instance
        );
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
            scaleWidth={G3XDoubleVerticalGauge.GAUGE_VIEWBOX_WIDTH / 2}
            scaleHeight={G3XDoubleVerticalGauge.GAUGE_VIEWBOX_HEIGHT}
          />,
          this.props.style?.useDoubleZones ? this.lineGroupRefLeft.instance : this.lineGroupRef.instance
        );
      }
    }
    if (this.props.colorLines2 && this.props.style?.useDoubleZones) {
      for (let i = 0; i < this.props.colorLines2.length; i++) {
        FSComponent.render(
          <G3XVerticalColorLine
            logicHost={this.props.logicHost}
            geometry={this.geometry2}
            color={this.props.colorLines2[i].color}
            position={this.props.colorLines2[i].position}
            smoothFactor={this.props.colorLines2[i].smoothFactor}
            scaleWidth={G3XDoubleVerticalGauge.GAUGE_VIEWBOX_WIDTH / 2}
            scaleHeight={G3XDoubleVerticalGauge.GAUGE_VIEWBOX_HEIGHT}
          />,
          this.lineGroupRefRight.instance
        );
      }
    }
  }

  /** @inheritDoc */
  protected initGauge(): void {
    super.initGauge();
    if (this.props.minimum2) {
      this.minValue.set(this.props.logicHost?.addLogicAsNumber(this.props.minimum2, (min: number) => {
        this.minValue2.set(min);
      }, 2, this.props.smoothFactor));
    }

    if (this.props.maximum2) {
      this.maxValue.set(this.props.logicHost?.addLogicAsNumber(this.props.maximum2, (max: number) => {
        this.maxValue2.set(max);
      }, 2, this.props.smoothFactor));
    }
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
    const textRow = this.theDiv.instance.querySelector('.values-text-row') as HTMLElement | null;
    if (textRow && this.props.style?.valuesTextRowWidth) {
      textRow.style.width = this.props.style.valuesTextRowWidth;
    }
  }

  /** @inheritDoc */
  protected renderGauge(): VNode {
    return (
      <div class='double-vert-container'>
        <G3XVerticalTwoRowsDoubleValueHeader
          {...this.props}
          label={this.labelSubject}
          alert={this.alertSubject}
          leftValue={this.headerValueSubject}
          rightValue={this.header2ValueSubject}
          showPeakVisualsLeft={this.showPeakVisuals}
          showPeakVisualsRight={this.showPeak2Visuals}
        />
        <div class='inner-frame'>
          <svg
            class='zones-and-lines'
            preserveAspectRatio='none'
            viewBox={`0 0 ${G3XDoubleVerticalGauge.GAUGE_VIEWBOX_WIDTH} ${G3XDoubleVerticalGauge.GAUGE_VIEWBOX_HEIGHT}`}
          >
            <defs>
              <linearGradient id='verticalColorZoneCoverFill' x1='0%' y1='0%' x2='100%' y2='0%'>
                <stop offset='0%' style='stop-color:rgb(0, 0, 0);stop-opacity:0.45' />
                <stop offset='33%' style='stop-color:rgb(0, 0, 0);stop-opacity:0' />
                <stop offset='66%' style='stop-color:rgb(0, 0, 0);stop-opacity:0' />
                <stop offset='100%' style='stop-color:rgb(0, 0, 0);stop-opacity:0.45' />
              </linearGradient>
            </defs>
            {this.props.style?.useDoubleZones && (
              <>
                <g class='colour-zone-group-left' ref={this.zoneGroupRefLeft} />
                <g class='colour-zone-group-right' ref={this.zoneGroupRefRight} />
              </>
            )}
            <g>
              <line
                x1={G3XDoubleVerticalGauge.GAUGE_VIEWBOX_WIDTH / 2}
                y1={0}
                x2={G3XDoubleVerticalGauge.GAUGE_VIEWBOX_WIDTH / 2}
                y2={G3XDoubleVerticalGauge.GAUGE_VIEWBOX_HEIGHT}
                stroke='white'
                stroke-width='2px'
                vector-effect='non-scaling-stroke'
              />
              <line
                x1={G3XDoubleVerticalGauge.GAUGE_VIEWBOX_WIDTH / 2}
                y1={0}
                x2={G3XDoubleVerticalGauge.GAUGE_VIEWBOX_WIDTH / 2}
                y2={G3XDoubleVerticalGauge.GAUGE_VIEWBOX_HEIGHT}
                stroke='darkgrey'
                stroke-width='.5px'
                vector-effect='non-scaling-stroke'
              />
            </g>
            {!this.props.style?.useDoubleZones && (
              <g class='colour-zone-group' ref={this.zoneGroupRef} />
            )}
            <g>
              <line
                x1={0}
                y1={0}
                x2={G3XDoubleVerticalGauge.GAUGE_VIEWBOX_WIDTH}
                y2={0}
                stroke='white'
                stroke-width='2px'
                vector-effect='non-scaling-stroke'
              />
              <line
                x1={G3XDoubleVerticalGauge.GAUGE_VIEWBOX_WIDTH}
                y1={G3XDoubleVerticalGauge.GAUGE_VIEWBOX_HEIGHT}
                x2={0}
                y2={G3XDoubleVerticalGauge.GAUGE_VIEWBOX_HEIGHT}
                stroke='white'
                stroke-width='2px'
                vector-effect='non-scaling-stroke'
              />
            </g>
          </svg>
          <svg
            class='inner-lines-frame'
            preserveAspectRatio='none'
            viewBox={`0 0 ${G3XDoubleVerticalGauge.GAUGE_VIEWBOX_WIDTH} ${G3XDoubleVerticalGauge.GAUGE_VIEWBOX_HEIGHT}`}
          >
            {this.props.style?.useDoubleZones && (
              <>
                <g class='color-lines-group-left' ref={this.lineGroupRefLeft} />
                <g class='color-lines-group-right' ref={this.lineGroupRefRight} />
              </>
            )}
            {!this.props.style?.useDoubleZones && (
              <g class='color-lines-group' ref={this.lineGroupRef} />
            )}
          </svg>
          <div class='value_1'>
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
          <div class='value_2'>
            <G3XVerticalPointer {...this.props} valueSubject={this.value2Subject} showAsPeak={false} index={1} label={this.props.cursorText2} />
            {this.props.allowPeakMode && (
              <div
                style={{
                  display: this.peak2PointerDisplay,
                }}
              >
                <G3XVerticalPointer {...this.props} valueSubject={this.value2PeakSubject} showAsPeak={true} index={1} />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}


