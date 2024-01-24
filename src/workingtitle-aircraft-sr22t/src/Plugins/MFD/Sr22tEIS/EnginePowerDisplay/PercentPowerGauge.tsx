import {
  EventBus, FSComponent, VNode, ComponentProps, DisplayComponent,
  Subject, SvgPathStream, AffineTransformPathStream, Subscribable, MathUtils,
} from '@microsoft/msfs-sdk';

import './PercentPowerGauge.css';

/** Definition of a single arc of color */
export interface ColorArc {
  /** The color of the arc */
  color: string,
  /** Value at which to start the arc */
  start: number,
  /** Value at which to stop the arc */
  stop: number
}

/** Props for a dial gauge */
export interface PercentPowerGaugeProps extends ComponentProps {
  /** The event bus */
  bus: EventBus,
  /** Label of the gauge */
  gaugeLabel: string;
  /** Number of decimals to show */
  decimals: number,
  /** Value to round to */
  roundTo: number,
  /** The actual value to show */
  gaugeValueSubject: Subscribable<number>,
  /** Minimum value of the gauge */
  minVal: number,
  /** Maximum value of the gauge */
  maxVal: number,
  /** displayed number divided by tick label number */
  scaleFactor: number,
  /** array of color arcs */
  colorArcs: ColorArc[],
}

/** The Engine PercentPowerGauge component */
export class PercentPowerGauge extends DisplayComponent<PercentPowerGaugeProps> {

  private readonly svgPathStream = new SvgPathStream(0.01);
  private readonly gaugePathStream = new AffineTransformPathStream(this.svgPathStream);
  private needleRef = FSComponent.createRef<SVGPathElement>();

  /** @inheritdoc
   */
  public onAfterRender(): void {
    this.props.gaugeValueSubject.sub(this.updateGauge.bind(this), true);
  }

  private readonly gaugeDiameter = 100;  // SVG coordinate system, unitless
  private readonly gaugeViewBoxString = '0 0 ' + this.gaugeDiameter + ' ' + this.gaugeDiameter;
  private readonly whiteArcRadius = 85 / 2;
  private readonly majorTickLength = 9;
  private readonly angularWidth = 145;   // degrees
  private readonly startAngle = 0;  // degrees
  private readonly colorArcRadius = 39;
  /** In degrees, showing how much the needle SVG has to rotate to indicate the zero value. */
  private readonly rotationMinValue = -90;
  private readonly rotationMaxValue = this.angularWidth + this.rotationMinValue;
  private readonly valueToAngularUnit = this.angularWidth / (this.props.maxVal - this.props.minVal);
  private valueSubject = Subject.create('');

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

  /**
   * Calculates the rotation position of the needle SVG,
   * relative to its starting position at 0 degree (arrow up), based on the gauge value.
   * @param value The current gauge value.
   * @returns A degree number to rotate the SVG.
   */
  private convertValueToDegree(value: number): number {
    return this.rotationMinValue + value * this.valueToAngularUnit;
  }

  /** @inheritdoc */
  private updateGauge(value: number): void {
    const rotationAngle = MathUtils.clamp(this.convertValueToDegree(value), this.rotationMinValue, this.rotationMaxValue);

    if (this.needleRef.instance !== null || this.needleRef.instance !== undefined) {
      this.needleRef.instance.style.transformOrigin = '50% 50%';
      this.needleRef.instance.style.transform = `rotate(${rotationAngle}deg)`;
    }

    this.valueSubject.set((Math.round(value / this.props.roundTo) * this.props.roundTo).toFixed(this.props.decimals));
  }

  /** Draws the first white tick of the white arc indicating zero value. */
  private drawFirstTickWhiteArc(): void {
    this.gaugePathStream.moveTo(-this.whiteArcRadius + this.majorTickLength, 0);
    this.gaugePathStream.lineTo(-this.whiteArcRadius, 0);
  }

  /** Draws the last white tick of the white arc indicating maximum value. */
  private drawLastTickWhiteArc(): void {
    const lastTickAngle = (180 - this.angularWidth) * Avionics.Utils.DEG2RAD;
    const xStart = this.whiteArcRadius * Math.cos(lastTickAngle);
    const yStart = this.whiteArcRadius * Math.sin(lastTickAngle) * -1;
    const ratio = 1 - this.majorTickLength / this.whiteArcRadius;
    const xEnd = xStart * ratio;
    const yEnd = yStart * ratio;
    this.gaugePathStream.moveTo(xStart, yStart);
    this.gaugePathStream.lineTo(xEnd, yEnd);
  }

  /**
   * Renders the outlined white arc covering the gauge.
   * @returns a VNode of SVG path.
   */
  private renderWhiteArc(): VNode {
    this.gaugePathStream.resetTransform();
    this.gaugePathStream.beginPath();
    this.gaugePathStream.addTranslation(this.gaugeDiameter / 2, this.gaugeDiameter / 2);  // move to gauge center

    this.drawFirstTickWhiteArc();
    this.gaugePathStream.arc(0, 0, this.whiteArcRadius, Math.PI, Math.PI + (this.angularWidth * Avionics.Utils.DEG2RAD));
    this.drawLastTickWhiteArc();

    const whiteArcPath = this.svgPathStream.getSvgPath();

    return (
      <path class="gauge-white-arc" d={whiteArcPath} stroke="white" stroke-width="1px" fill="none" />
    );
  }


  /**
   * Renders the color-filled arc indicating the value range of the gauge.
   * @returns a VNode of SVG path.
   */
  private renderColorArc(): VNode[] {

    const colorArcArray: VNode[] = [];

    for (let arcIndex = 0; arcIndex < this.props.colorArcs.length; arcIndex++) {

      const minVal = 0;
      const maxVal = this.props.maxVal - this.props.minVal;
      const start = this.props.colorArcs[arcIndex].start - this.props.minVal;
      const stop = this.props.colorArcs[arcIndex].stop - this.props.minVal;

      // Create color arc
      this.gaugePathStream.resetTransform();
      this.gaugePathStream.beginPath();
      if (this.props.colorArcs[arcIndex].stop - this.props.colorArcs[arcIndex].start > 0
        && this.props.colorArcs[arcIndex].start >= this.props.minVal
        && this.props.colorArcs[arcIndex].stop <= this.props.maxVal) {
        this.gaugePathStream.addTranslation(this.gaugeDiameter / 2, this.gaugeDiameter / 2);  // move to gauge center
        this.gaugePathStream.addRotation(
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
        this.gaugePathStream.moveTo(-this.colorArcRadius, 0);
        this.gaugePathStream.arc(
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

        const colorArcPath = this.svgPathStream.getSvgPath();

        colorArcArray.push(
          <path class="gauge-color-arc" d={colorArcPath} stroke={this.props.colorArcs[arcIndex].color} stroke-width="3.7px" fill="none" />
        );
      }
    }

    return colorArcArray;
  }


  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="percent-power-gauge">
        <svg
          height={this.props.scaleFactor * 100}
          width={this.props.scaleFactor * 100}
          viewBox={this.gaugeViewBoxString}
        >
          {this.renderColorArc()}
          {this.renderWhiteArc()}
          <text x="45%" y="50%" font-size="12px" dominant-baseline="middle" text-anchor="middle" class="dial-gauge-label">{this.props.gaugeLabel}</text>
          <text x="80%" y="50%" font-size="21px" dominant-baseline="middle" text-anchor="middle" class="dial-gauge-value">{this.valueSubject}</text>
          <path
            ref={this.needleRef} id="gauge-needle"
            d="M 50 13 L 55 26 L 45 26 L 50 13 z"
            fill="#fff" stroke="#000" stroke-linecap="square" stroke-width=".3"
          />
        </svg>
      </div>
    );
  }
}