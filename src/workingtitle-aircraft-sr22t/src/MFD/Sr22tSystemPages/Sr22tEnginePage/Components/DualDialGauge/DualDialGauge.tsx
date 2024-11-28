import {
  ComponentProps, DisplayComponent, EventBus, FSComponent, Subject,
  VNode, SvgPathStream, AffineTransformPathStream, Subscribable
} from '@microsoft/msfs-sdk';

import './DualDialGauge.css';

/** Definition of a single major tick */
export interface MajorTick {
  /** tick value (position) */
  value: number,
  /** tick color */
  color: string,
  /** draw tick label? */
  label: boolean,
}

/** Definition of a single minor tick */
export interface MinorTick {
  /** tick value (position) */
  value: number,
  /** tick color */
  color: string,
}

/** Definition of a single color arc */
export interface ColorArc {
  /** The color of the arc */
  color: string,
  /** Value at which to start the arc */
  start: number,
  /** Value at which to stop the arc */
  stop: number
}

/** Definition of a single gauge */
export interface Gauge {
  /** Number of decimals to show */
  decimals: number,
  /** Value to round to */
  roundTo: number,
  /** The actual value to show */
  gaugeValueSubject: Subscribable<number>,
  /** degrees, deviation from default position */
  gaugeOrientation: number,
  /** 1 = Clockwise, -1 = Counter Clockwise */
  direction: -1 | 1,
  /** Minimum value of the gauge */
  minVal: number,
  /** Maximum value of the gauge */
  maxVal: number,
  /** displayed number divided by tick label number */
  scaleFactor: number,
  /** array of major ticks */
  majorTicks: MajorTick[],
  /** array of minor ticks */
  minorTicks: MinorTick[],
  /** array of color arcs */
  colorArcs: ColorArc[],
}

/** Props for a dual dial gauge */
export interface DualDialGaugeProps extends ComponentProps {
  /** The event bus */
  bus: EventBus,
  /** Label of the gauge */
  gaugeLabel: string,
  /** Gauges */
  gauges: {
    /** Left Gauge */
    leftGauge: Gauge,
    /** Right Gauge */
    rightGauge: Gauge
  },
}

/** Dual Dial Gauge component
 */
export class DualDialGauge extends DisplayComponent<DualDialGaugeProps> {

  private readonly svgPathStream = new SvgPathStream(0.01);
  private readonly transformPathStream = new AffineTransformPathStream(this.svgPathStream);

  /** @inheritdoc
   */
  public onAfterRender(): void {

    this.props.gauges.leftGauge.gaugeValueSubject.sub((v) => {
      this.updateGauge('leftGauge', v);
    }, true);

    this.props.gauges.rightGauge.gaugeValueSubject.sub((v) => {
      this.updateGauge('rightGauge', v);
    }, true);
  }

  /** Maps a number from one range to another
   * @param numberIn self-explanatory
   * @param inMin self-explanatory
   * @param inMax self-explanatory
   * @param outMin self-explanatory
   * @param outMax self-explanatory
   * @returns self-explanatory
   */
  private map(numberIn: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
    return (((numberIn - inMin) / (inMax - inMin)) * (outMax - outMin)) + outMin;
  }

  private gaugeScale = 1.9;     // scale factor for how big to draw the gauge on the screen, unitless
  private gaugeDiameter = 100;  // SVG coordinate system, unitless
  private gaugeViewBoxString = '0 0 ' + this.gaugeDiameter + ' ' + this.gaugeDiameter;
  private whiteArcRadius = 85 / 2;
  private majorTickLength = 9;
  private minorTickLength = 6;
  private angularWidth = 100;     // degrees
  private colorArcRadius = 39;
  private gauges = {
    leftGauge: {
      valueSubject: Subject.create(''),
      needleRef: FSComponent.createRef<SVGPathElement>(),
    },
    rightGauge: {
      valueSubject: Subject.create(''),
      needleRef: FSComponent.createRef<SVGPathElement>(),
    },
  };

  /** @inheritdoc
   */
  private updateGauge(gaugeName: 'leftGauge' | 'rightGauge', value: number): void {

    // determine needle angle
    let needleAngle = this.map(
      value / this.props.gauges[gaugeName].scaleFactor,
      this.props.gauges[gaugeName].minVal,
      this.props.gauges[gaugeName].maxVal,
      0,
      this.angularWidth
    );

    // limit needle angle
    if (needleAngle > this.angularWidth) { needleAngle = this.angularWidth; }
    if (needleAngle < 0) { needleAngle = 0; }

    // set needle position and display value
    const angle = (needleAngle * this.props.gauges[gaugeName].direction) - (this.angularWidth / 2) + this.props.gauges[gaugeName].gaugeOrientation;
    this.gauges[gaugeName].needleRef.instance.style.transformOrigin = '50% 50%';
    this.gauges[gaugeName].needleRef.instance.style.transform = `rotate(${angle}deg)`;
    const gaugeValue = value;
    const roundTo = this.props.gauges[gaugeName].roundTo;
    const decimals = this.props.gauges[gaugeName].decimals;
    this.gauges[gaugeName].valueSubject.set((Math.round(gaugeValue / roundTo) * roundTo).toFixed(decimals));
  }

  /** @inheritdoc
   */
  private renderWhiteArc(gaugeName: 'leftGauge' | 'rightGauge'): VNode {

    const startAngle = (-1 * (this.angularWidth - 180) / 2) + this.props.gauges[gaugeName].gaugeOrientation;       // degrees

    // Create white arc with beginning tick
    this.transformPathStream.resetTransform();
    this.transformPathStream.beginPath();
    this.transformPathStream.addTranslation(this.gaugeDiameter / 2, this.gaugeDiameter / 2);  // move to gauge center
    this.transformPathStream.addRotation(startAngle * Avionics.Utils.DEG2RAD, 'before');
    this.transformPathStream.moveTo(-this.whiteArcRadius + this.majorTickLength, 0);
    this.transformPathStream.lineTo(-this.whiteArcRadius, 0); // draw first tick
    this.transformPathStream.arc(
      0,
      0,
      this.whiteArcRadius,
      Math.PI,
      Math.PI + (this.props.gauges[gaugeName].direction * this.angularWidth * Avionics.Utils.DEG2RAD),
      this.props.gauges[gaugeName].direction === 1 ? false : true
    );
    const whiteArcPath = this.svgPathStream.getSvgPath();

    return (
      <path d={whiteArcPath} stroke="white" stroke-width="1px" fill="none" />
    );
  }

  /** @inheritdoc
   */
  private renderTicks(gaugeName: 'leftGauge' | 'rightGauge'): VNode[] {

    const tickArray: VNode[] = [];
    const startAngle = (-1 * (this.angularWidth - 180) / 2) + this.props.gauges[gaugeName].gaugeOrientation;   // degrees
    const direction = this.props.gauges[gaugeName].direction;

    // loop through each major tick
    for (let majorIndex = 0; majorIndex < this.props.gauges[gaugeName].majorTicks.length; majorIndex++) {

      const angle = this.map(
        this.props.gauges[gaugeName].majorTicks[majorIndex].value,
        this.props.gauges[gaugeName].minVal,
        this.props.gauges[gaugeName].maxVal,
        0,
        this.angularWidth
      );

      this.transformPathStream.resetTransform();
      this.transformPathStream.beginPath();
      this.transformPathStream.addTranslation(this.gaugeDiameter / 2, this.gaugeDiameter / 2);  // move to gauge center
      this.transformPathStream.addRotation(startAngle * Avionics.Utils.DEG2RAD, 'before');
      this.transformPathStream.addRotation(angle * direction * Avionics.Utils.DEG2RAD, 'before');
      this.transformPathStream.moveTo(-this.whiteArcRadius + this.majorTickLength, 0);
      this.transformPathStream.lineTo(-this.whiteArcRadius, 0); // create major tick

      const tickPath = this.svgPathStream.getSvgPath();
      tickArray.push(
        <path d={tickPath} stroke={this.props.gauges[gaugeName].majorTicks[majorIndex].color} stroke-width="1px" fill="none" />
      );
    }

    // loop through each minor tick
    for (let minorIndex = 0; minorIndex < this.props.gauges[gaugeName].minorTicks.length; minorIndex++) {

      const angle = this.map(
        this.props.gauges[gaugeName].minorTicks[minorIndex].value,
        this.props.gauges[gaugeName].minVal,
        this.props.gauges[gaugeName].maxVal,
        0,
        this.angularWidth
      );

      this.transformPathStream.resetTransform();
      this.transformPathStream.beginPath();
      this.transformPathStream.addTranslation(this.gaugeDiameter / 2, this.gaugeDiameter / 2);  // move to gauge center
      this.transformPathStream.addRotation(startAngle * Avionics.Utils.DEG2RAD, 'before');
      this.transformPathStream.addRotation(angle * direction * Avionics.Utils.DEG2RAD, 'before');
      this.transformPathStream.moveTo(-this.whiteArcRadius + this.minorTickLength, 0);
      this.transformPathStream.lineTo(-this.whiteArcRadius, 0); // create minor tick

      const tickPath = this.svgPathStream.getSvgPath();
      tickArray.push(
        <path d={tickPath} stroke={this.props.gauges[gaugeName].minorTicks[minorIndex].color} stroke-width="1px" fill="none" />
      );
    }

    return tickArray;
  }

  /** @inheritdoc
   */
  private renderColorArcs(gaugeName: 'leftGauge' | 'rightGauge'): VNode[] {

    const colorArcArray: VNode[] = [];
    const startAngle = (-1 * (this.angularWidth - 180) / 2) + this.props.gauges[gaugeName].gaugeOrientation;   // degrees

    for (let arcIndex = 0; arcIndex < this.props.gauges[gaugeName].colorArcs.length; arcIndex++) {

      const minVal = 0;
      const maxVal = this.props.gauges[gaugeName].maxVal - this.props.gauges[gaugeName].minVal;
      const start = this.props.gauges[gaugeName].colorArcs[arcIndex].start - this.props.gauges[gaugeName].minVal;
      const stop = this.props.gauges[gaugeName].colorArcs[arcIndex].stop - this.props.gauges[gaugeName].minVal;

      // Create color arc
      this.transformPathStream.resetTransform();
      this.transformPathStream.beginPath();
      if (this.props.gauges[gaugeName].colorArcs[arcIndex].stop - this.props.gauges[gaugeName].colorArcs[arcIndex].start > 0
        && this.props.gauges[gaugeName].colorArcs[arcIndex].start >= this.props.gauges[gaugeName].minVal
        && this.props.gauges[gaugeName].colorArcs[arcIndex].stop <= this.props.gauges[gaugeName].maxVal) {
        this.transformPathStream.addTranslation(this.gaugeDiameter / 2, this.gaugeDiameter / 2);  // move to gauge center
        this.transformPathStream.addRotation(
          (
            startAngle +
            (this.map(
              start,
              minVal,
              maxVal,
              0,
              this.angularWidth
            ) * this.props.gauges[gaugeName].direction)
          ) * Avionics.Utils.DEG2RAD, 'before'
        );
        this.transformPathStream.moveTo(-this.colorArcRadius, 0);
        this.transformPathStream.arc(
          0,
          0,
          this.colorArcRadius,
          Math.PI,
          Math.PI + (
            this.map(
              stop - start,
              minVal,
              maxVal,
              0,
              this.angularWidth
            )
            * this.props.gauges[gaugeName].direction * Avionics.Utils.DEG2RAD
          ),
          this.props.gauges[gaugeName].direction === 1 ? false : true
        );

        const colorArcPath = this.svgPathStream.getSvgPath();

        colorArcArray.push(
          <path d={colorArcPath} stroke={this.props.gauges[gaugeName].colorArcs[arcIndex].color} stroke-width="3.7px" fill="none" />
        );
      }
    }

    return colorArcArray;
  }

  /** @inheritdoc
   */
  private renderMajorTickLabels(gaugeName: 'leftGauge' | 'rightGauge'): VNode[] {

    const labelArray: VNode[] = [];
    const startAngle = (-1 * (this.angularWidth - 180) / 2) + this.props.gauges[gaugeName].gaugeOrientation;       // degrees
    const minVal = this.props.gauges[gaugeName].minVal;
    const maxVal = this.props.gauges[gaugeName].maxVal;
    const direction = this.props.gauges[gaugeName].direction;
    const spacingScaleFactor = 3 / 4;
    const labelClass = 'dual-dial-gauge-label-small';

    // loop through all major ticks
    for (let majorTickIndex = 0; majorTickIndex < this.props.gauges[gaugeName].majorTicks.length; majorTickIndex++) {

      if (this.props.gauges[gaugeName].majorTicks[majorTickIndex].label) {

        const tickValue = this.props.gauges[gaugeName].majorTicks[majorTickIndex].value;
        const adjustment = (tickValue.toString().length - 2) * 2; // placement adjustment for number of digits

        const angle = this.map(tickValue, minVal, maxVal, 0, this.angularWidth); // degrees
        const totalAngle = (startAngle + (angle * direction)) * Avionics.Utils.DEG2RAD;  // radians

        const labelRadius = -this.whiteArcRadius + this.majorTickLength + (spacingScaleFactor * (6 + adjustment));

        const x = (labelRadius) * Math.cos(totalAngle);
        const y = (labelRadius) * Math.sin(totalAngle);

        labelArray.push(
          <text x={(this.gaugeDiameter / 2) + x} y={(this.gaugeDiameter / 2) + y} dominant-baseline="middle" text-anchor="middle" class={labelClass}>{tickValue.toFixed(0)}</text>
        );
      }
    }

    return (labelArray);
  }

  /** @inheritdoc
   */
  public render(): VNode {

    return (
      <div class='dual-dial-gauge-parent'>
        <div class='dual-dial-gauge-background'>
          <svg
            height={this.gaugeScale * 100}
            width={this.gaugeScale * 100}
            viewBox={this.gaugeViewBoxString}
          >
            <defs id="defs1">
              <linearGradient id="linearGradient19" x1="8.4558e-8" x2="26.458" y1="26.458" gradientTransform="matrix(3.7795 0 0 3.7795 .000127 0)" gradientUnits="userSpaceOnUse">
                <stop id="stop15" stop-color="#4d4d4d" offset="0" />
                <stop id="stop16" stop-color="#1f1f1f" offset=".32432" />
                <stop id="stop18" stop-color="#1f1f1f" offset=".64489" />
                <stop id="stop17" stop-color="#4d4d4d" offset="1" />
              </linearGradient>
              <radialGradient id="radialGradient19" cx="13.229" cy="13.229" r="12.052" gradientTransform="scale(3.7795)" gradientUnits="userSpaceOnUse">
                <stop id="stop5" stop-color="#717171" offset=".97598" />
                <stop id="stop6" stop-color="#3a3a3a" stop-opacity=".062622" offset="1" />
              </radialGradient>
              <radialGradient id="radialGradient20" cx="13.229" cy="13.229" r="13.229" gradientTransform="scale(3.7795)" gradientUnits="userSpaceOnUse">
                <stop id="stop7" stop-color="#2a2a2a" stop-opacity="0" offset=".96246" />
                <stop id="stop8" stop-color="#1d1d1d" offset="1" />
              </radialGradient>
            </defs>
            <g>
              <path id="path18" d="m50 1.9e-5a50 50 0 00-50 50 50 50 0 0050 50 50 50 0 0050-50 50 50 0 00-50-50zm0 5.6895a44.312 44.312 0 0144.311 44.311 44.312 44.312 0 01-44.311 44.313 44.312 44.312 0 01-44.312-44.313 44.312 44.312 0 0144.312-44.311z" fill="url(#linearGradient19)" />
              <circle id="circle18" cx="50" cy="50" r="45.549" fill="url(#radialGradient19)" opacity=".48136" />
              <path id="path19" d="m50 0a50 50 0 00-50 50 50 50 0 0050 50 50 50 0 0050-50 50 50 0 00-50-50zm0 1.7676a48.232 48.232 0 0148.232 48.232 48.232 48.232 0 01-48.232 48.232 48.232 48.232 0 01-48.232-48.232 48.232 48.232 0 0148.232-48.232z" fill="url(#radialGradient20)" />
            </g>
            <circle cx={this.gaugeDiameter / 2} cy={this.gaugeDiameter / 2} r={88.7 / 2} fill="#000000" />

            <text x="50%" y={this.gaugeDiameter * 0.16} dominant-baseline="middle" text-anchor="middle" class="dual-dial-gauge-label">{this.props.gaugeLabel}</text>
            <text x="42%" y={this.gaugeDiameter * 0.58} dominant-baseline="middle" text-anchor="middle" class="dual-dial-gauge-label">&deg;F</text>
            <text x="64%" y={this.gaugeDiameter * 0.58} dominant-baseline="middle" text-anchor="middle" class="dual-dial-gauge-label">PSI</text>

            {this.renderColorArcs('leftGauge')}
            {this.renderWhiteArc('leftGauge')}
            {this.renderTicks('leftGauge')}
            {this.renderMajorTickLabels('leftGauge')}

            {this.renderColorArcs('rightGauge')}
            {this.renderWhiteArc('rightGauge')}
            {this.renderTicks('rightGauge')}
            {this.renderMajorTickLabels('rightGauge')}
          </svg>
        </div>
        <div class='dual-dial-gauge-overlay'>
          <svg
            height={this.gaugeScale * 100}
            width={this.gaugeScale * 100}
            viewBox={this.gaugeViewBoxString}
          >
            <path
              ref={this.gauges.leftGauge.needleRef}
              d="m49.615 11.971-1.7852 37.398 2.1699.63086 2.1699-.63086-1.7852-37.398-.38476-2.9e-5z"
              fill="#fff" stroke="#000" stroke-linecap="square" stroke-width=".3"
            />
            <text x="36%" y={this.gaugeDiameter * 0.80} dominant-baseline="middle" text-anchor="middle" class="dual-dial-gauge-value">{this.gauges.leftGauge.valueSubject}</text>
          </svg>
        </div>
        <div class='dual-dial-gauge-overlay'>
          <svg
            height={this.gaugeScale * 100}
            width={this.gaugeScale * 100}
            viewBox={this.gaugeViewBoxString}
          >
            <path
              ref={this.gauges.rightGauge.needleRef}
              d="m49.615 11.971-1.7852 37.398 2.1699.63086 2.1699-.63086-1.7852-37.398-.38476-2.9e-5z"
              fill="#fff" stroke="#000" stroke-linecap="square" stroke-width=".3"
            />
            <text x="65%" y={this.gaugeDiameter * 0.80} dominant-baseline="middle" text-anchor="middle" class="dual-dial-gauge-value">{this.gauges.rightGauge.valueSubject}</text>
          </svg>
        </div>
        <div class='dual-dial-gauge-overlay'>
          <svg
            height={this.gaugeScale * 100}
            width={this.gaugeScale * 100}
            viewBox={this.gaugeViewBoxString}
          >
            <circle cx={this.gaugeDiameter / 2} cy={this.gaugeDiameter / 2} r={9.6 / 2} fill="#393939" />
          </svg>
        </div>
      </div>
    );
  }
}
