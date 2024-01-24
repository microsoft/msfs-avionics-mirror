import {
  AffineTransformPathStream, ComponentProps, DisplayComponent, EventBus, FSComponent, Subject, Subscribable, SvgPathStream, VNode
} from '@microsoft/msfs-sdk';

import './DialGauge.css';

/** Definition of a single arc of color */
export interface ColorArc {
  /** The color of the arc */
  color: string,
  /** Value at which to start the arc */
  start: number,
  /** Value at which to stop the arc */
  stop: number,
  /** Dynamic value at which to start the arc */
  dynamicStart?: Subscribable<number>,
  /** Dynamic value at which to stop the arc */
  dynamicStop?: Subscribable<number>,
  /** SVG path of the arc */
  path?: Subject<string>,
}

/** Props for a dial gauge */
export interface DialGaugeProps extends ComponentProps {
  /** The event bus */
  bus: EventBus,
  /** Scale factor for how big to draw the gauge on the screen, unitless */
  scale: number;
  /** Label of the gauge */
  gaugeLabel: string;
  /** Y position of the gauge label */
  gaugeLabelYPos: number;
  /** Size of the label */
  gaugeLabelSize: number;
  /** Y position of the display number */
  displayNumberYPos: number;
  /** Size of the display number */
  displayNumberSize: string;
  /** Number of decimals to show */
  decimals: number,
  /** Value to round to */
  roundTo: number,
  /** The actual value to show */
  gaugeValueSubject: Subscribable<number>,
  /** number of major ticks (includes both end ticks) */
  majorTickNum: number,
  /** number of minor ticks between one set of adjacent major ticks */
  minorTickNum: number,
  /** Minimum value of the gauge */
  minVal: number,
  /** Maximum value of the gauge */
  maxVal: number,
  /** displayed number divided by tick label number */
  scaleFactor: number,
  /** array of color arcs */
  colorArcs: ColorArc[],
  /** value of the target indicator */
  target?: Subscribable<number>,
}

/** Dial Gauge component */
export class DialGauge extends DisplayComponent<DialGaugeProps> {

  private readonly svgPathStream = new SvgPathStream(0.01);
  private readonly transformPathStream = new AffineTransformPathStream(this.svgPathStream);
  private needleRef = FSComponent.createRef<SVGPathElement>();
  private targetRef = FSComponent.createRef<SVGPathElement>();

  /** @inheritdoc
   */
  public onAfterRender(): void {

    this.props.gaugeValueSubject.sub((v) => {
      this.updateGauge(v);
    }, true);

    this.props.target?.sub((v) => {
      this.updateTarget(v);
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

  private readonly gaugeDiameter = 100;  // SVG coordinate system, unitless
  private readonly gaugeViewBoxString = '0 0 ' + this.gaugeDiameter + ' ' + this.gaugeDiameter;
  private readonly whiteArcRadius = 85 / 2;
  private readonly majorTickLength = 9;
  private readonly minorTickLength = 6;
  private readonly angularWidth = 210;   // degrees
  private readonly startAngle = -1 * (this.angularWidth - 180) / 2;  // degrees
  private readonly colorArcRadius = 39;
  private valueSubject = Subject.create('');

  /** @inheritdoc
   */
  private indicatorAngle(value: number): number {

    // determine idicator angle
    let angle = this.map(
      value / this.props.scaleFactor,
      this.props.minVal,
      this.props.maxVal,
      0,
      this.angularWidth
    );

    // limit idicator angle
    if (angle > this.angularWidth) { angle = this.angularWidth; }
    if (angle < 0) { angle = 0; }

    return angle - (this.angularWidth / 2);
  }

  /** @inheritdoc
   */
  private updateGauge(value: number): void {

    // set idicator position
    const angle = this.indicatorAngle(value);
    if (this.needleRef.instance !== null || this.needleRef.instance !== undefined) {
      this.needleRef.instance.style.transformOrigin = '50% 50%';
      this.needleRef.instance.style.transform = `rotate(${angle}deg)`;
    }

    // set display value
    this.valueSubject.set((Math.round(value / this.props.roundTo) * this.props.roundTo).toFixed(this.props.decimals));
  }

  /** @inheritdoc
   */
  private renderWhiteArc(): VNode {

    // Create white arc with beginning tick
    this.transformPathStream.resetTransform();
    this.transformPathStream.beginPath();
    this.transformPathStream.addTranslation(this.gaugeDiameter / 2, this.gaugeDiameter / 2);  // move to gauge center
    this.transformPathStream.addRotation(this.startAngle * Avionics.Utils.DEG2RAD, 'before');
    this.transformPathStream.moveTo(-this.whiteArcRadius + this.majorTickLength, 0);
    this.transformPathStream.lineTo(-this.whiteArcRadius, 0); // draw first tick
    this.transformPathStream.arc(0, 0, this.whiteArcRadius, Math.PI, Math.PI + (this.angularWidth * Avionics.Utils.DEG2RAD));
    const whiteArcPath = this.svgPathStream.getSvgPath();

    return (
      <div class='dial-gauge-overlay'>
        <svg height={this.props.scale * 100} width={this.props.scale * 100} viewBox={this.gaugeViewBoxString} >
          <path d={whiteArcPath} stroke="white" stroke-width="1px" fill="none" />
        </svg>
      </div>
    );
  }

  /** @inheritdoc
   */
  private renderTicks(): VNode {

    if (this.props.majorTickNum < 2) { this.props.majorTickNum = 2; }
    if (this.props.minorTickNum < 0) { this.props.minorTickNum = 0; }
    this.transformPathStream.resetTransform();
    this.transformPathStream.beginPath();
    this.transformPathStream.addTranslation(this.gaugeDiameter / 2, this.gaugeDiameter / 2);  // move to gauge center
    this.transformPathStream.addRotation((this.startAngle) * Avionics.Utils.DEG2RAD, 'before');

    const minorAngleInc = this.angularWidth / ((this.props.majorTickNum - 1) * (this.props.minorTickNum + 1));

    // loop through each major tick
    for (let majorIndex = 0; majorIndex < this.props.majorTickNum - 1; majorIndex++) {

      // loop through each minor tick
      for (let minorIndex = 0; minorIndex < this.props.minorTickNum; minorIndex++) {
        this.transformPathStream.addRotation(minorAngleInc * Avionics.Utils.DEG2RAD, 'before');
        this.transformPathStream.moveTo(-this.whiteArcRadius + this.minorTickLength, 0);
        this.transformPathStream.lineTo(-this.whiteArcRadius, 0); // create minor tick
      }

      this.transformPathStream.addRotation(minorAngleInc * Avionics.Utils.DEG2RAD, 'before');
      this.transformPathStream.moveTo(-this.whiteArcRadius + this.majorTickLength, 0);
      this.transformPathStream.lineTo(-this.whiteArcRadius, 0); // create major tick
    }
    const tickPath = this.svgPathStream.getSvgPath();

    return (
      <div class='dial-gauge-overlay'>
        <svg height={this.props.scale * 100} width={this.props.scale * 100} viewBox={this.gaugeViewBoxString} >
          <path d={tickPath} stroke="white" stroke-width="1px" fill="none" />
        </svg>
      </div>
    );
  }

  /** @inheritdoc
   */
  private initArcPath(arcIndex: number): void {

    const theArc = this.props.colorArcs[arcIndex];
    theArc.path = Subject.create('');
    this.generateArcPath(arcIndex);

    // Dynamic Arc subs
    theArc.dynamicStart?.sub((v) => {
      theArc.start = v;
      this.generateArcPath(arcIndex);
    }, true);
    theArc.dynamicStop?.sub((v) => {
      theArc.stop = v;
      this.generateArcPath(arcIndex);
    }, true);
  }

  /** @inheritdoc
   */
  private generateArcPath(arcIndex: number): void {

    const minVal = 0;
    const maxVal = this.props.maxVal - this.props.minVal;
    const start = this.props.colorArcs[arcIndex].start - this.props.minVal;
    const stop = this.props.colorArcs[arcIndex].stop - this.props.minVal;
    let path = '';

    // Create color arc
    this.transformPathStream.resetTransform();
    this.transformPathStream.beginPath();
    if (this.props.colorArcs[arcIndex].stop - this.props.colorArcs[arcIndex].start > 0
      && this.props.colorArcs[arcIndex].start >= this.props.minVal
      && this.props.colorArcs[arcIndex].stop <= this.props.maxVal) {
      this.transformPathStream.addTranslation(this.gaugeDiameter / 2, this.gaugeDiameter / 2);  // move to gauge center
      this.transformPathStream.addRotation(
        (
          this.startAngle +
          this.map(
            start,
            minVal,
            maxVal,
            0,
            this.angularWidth
          )
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
          * Avionics.Utils.DEG2RAD
        )
      );

      path = this.svgPathStream.getSvgPath();
    } else {
      path = '';
    }

    this.props.colorArcs[arcIndex].path?.set(path);
  }

  /** @inheritdoc
   */
  private renderColorArcs(): VNode[] {

    const colorArcArray: VNode[] = [];

    for (let arcIndex = 0; arcIndex < this.props.colorArcs.length; arcIndex++) {

      this.initArcPath(arcIndex);

      colorArcArray.push(
        <path d={this.props.colorArcs[arcIndex].path} stroke={this.props.colorArcs[arcIndex].color} stroke-width="3.7px" fill="none" />
      );
    }

    return (
      <div class='dial-gauge-overlay'>
        <svg height={this.props.scale * 100} width={this.props.scale * 100} viewBox={this.gaugeViewBoxString} >
          {colorArcArray}
        </svg>
      </div>
    );
  }

  /** @inheritdoc
   */
  private renderMajorTickLabels(): VNode[] {

    const labelArray: VNode[] = [];

    // loop through all major ticks
    for (let majorTickIndex = 0; majorTickIndex < this.props.majorTickNum; majorTickIndex++) {

      const tickValue = this.map(majorTickIndex, 0, this.props.majorTickNum - 1, this.props.minVal, this.props.maxVal);
      const adjustment = (tickValue.toString().length - 2) * 2; // placement adjustment for number of digits

      const incAngle = this.angularWidth / (this.props.majorTickNum - 1); // degrees
      const totalAngle = (this.startAngle + (incAngle * majorTickIndex)) * Avionics.Utils.DEG2RAD;  // radians

      let spacingScaleFactor = 1;
      let labelClass = 'dial-gauge-label';
      if (incAngle < 25) {
        labelClass = 'dial-gauge-label-small';
        spacingScaleFactor = 3 / 4;
      }

      const labelRadius = -this.whiteArcRadius + this.majorTickLength + (spacingScaleFactor * ((0.75 * this.props.gaugeLabelSize) + adjustment));

      const x = (labelRadius) * Math.cos(totalAngle);
      const y = (labelRadius) * Math.sin(totalAngle);

      labelArray.push(
        <text x={(this.gaugeDiameter / 2) + x} y={(this.gaugeDiameter / 2) + y} dominant-baseline="middle" text-anchor="middle" class={labelClass} font-size={this.props.gaugeLabelSize}>{tickValue.toFixed(0)}</text>
      );
    }

    return (
      <div class='dial-gauge-overlay'>
        <svg height={this.props.scale * 100} width={this.props.scale * 100} viewBox={this.gaugeViewBoxString} >
          {labelArray}
        </svg>
      </div>
    );
  }

  /** @inheritdoc
   */
  private renderTarget(): VNode {
    if (this.props.target !== undefined) {
      return (
        <div class='dial-gauge-overlay'>
          <svg
            height={this.props.scale * 100}
            width={this.props.scale * 100}
            viewBox={this.gaugeViewBoxString}
          >
            <path ref={this.targetRef} d="m46.967 4.5293 3.0335 3.7993 3.0335-3.7993h-3.0335z" fill="#00e0e0" stroke-linejoin="round" stroke-width="1.9895" />
          </svg>
        </div>
      );
    } else {
      return (<></>);
    }
  }

  /** @inheritdoc
   */
  private updateTarget(value: number): void {

    const angle = this.indicatorAngle(value);

    if (this.targetRef.instance !== null || this.targetRef.instance !== undefined) {

      // hide if necessary
      if (value <= 0) {
        this.targetRef.instance.classList.add('hidden');
      } else {
        this.targetRef.instance.classList.remove('hidden');
      }

      this.targetRef.instance.style.transformOrigin = '50% 50%';
      this.targetRef.instance.style.transform = `rotate(${angle}deg)`;
    }
  }

  /** @inheritdoc
   */
  public render(): VNode {

    return (
      <div class='dial-gauge-parent'>
        <div class='dial-gauge-background'>
          <svg
            height={this.props.scale * 100}
            width={this.props.scale * 100}
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
            <text x="50%" y={this.gaugeDiameter * this.props.gaugeLabelYPos} dominant-baseline="middle" text-anchor="middle" class="dial-gauge-label" font-size={this.props.gaugeLabelSize}>{this.props.gaugeLabel}</text>
          </svg>
        </div>

        {this.renderColorArcs()}
        {this.renderWhiteArc()}
        {this.renderTicks()}
        {this.renderMajorTickLabels()}

        <div class='dial-gauge-overlay'>
          <svg
            height={this.props.scale * 100}
            width={this.props.scale * 100}
            viewBox={this.gaugeViewBoxString}
          >
            <path
              ref={this.needleRef}
              d="m49.615 11.971-1.7852 37.398 2.1699.63086 2.1699-.63086-1.7852-37.398-.38476-2.9e-5z"
              fill="#fff" stroke="#000" stroke-linecap="square" stroke-width=".3"
            />
          </svg>
        </div>
        <div class='dial-gauge-overlay'>
          <svg
            height={this.props.scale * 100}
            width={this.props.scale * 100}
            viewBox={this.gaugeViewBoxString}
          >
            <text x="50%" y={this.gaugeDiameter * this.props.displayNumberYPos} dominant-baseline="middle" text-anchor="middle" class="dial-gauge-value" font-size={this.props.displayNumberSize}>{this.valueSubject}</text>
          </svg>
        </div>
        <div class='dial-gauge-overlay'>
          <svg
            height={this.props.scale * 100}
            width={this.props.scale * 100}
            viewBox={this.gaugeViewBoxString}
          >
            <circle cx={this.gaugeDiameter / 2} cy={this.gaugeDiameter / 2} r={9.6 / 2} fill="#393939" />
          </svg>
        </div>

        {this.renderTarget()}
      </div>
    );
  }
}
