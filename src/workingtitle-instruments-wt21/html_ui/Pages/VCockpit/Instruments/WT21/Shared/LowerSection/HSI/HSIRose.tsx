import { AhrsEvents, AvionicsSystemState, AvionicsSystemStateEvent, ComponentProps, DisplayComponent, EventBus, FSComponent, Subject, Subscription, SVGUtils, VNode } from '@microsoft/msfs-sdk';

import { PfdOrMfd } from '../../Map/MapUserSettings';
import { CompassRose } from './CompassRose';
import { HSIBearingPointer } from './HSIBearingPointer';
import { HSICommon } from './HSICommon';
import { HSICourseNeedle } from './HSICourseNeedle';
import { HSIGhostNeedle } from './HSIGhostNeedle';
import { HSIHeadingBug } from './HSIHeadingBug';
import { HSITrackPointer } from './HSITrackPointer';

import './HSIRose.css';
import { AHRSSystemEvents } from '../../Systems';

// eslint-disable-next-line jsdoc/require-jsdoc
interface HSIRoseProps extends ComponentProps {
  // eslint-disable-next-line jsdoc/require-jsdoc
  bus: EventBus;
  // eslint-disable-next-line jsdoc/require-jsdoc
  svgViewBoxSize: number;
  // eslint-disable-next-line jsdoc/require-jsdoc
  mapRangeHalf: Subject<string>;
  // eslint-disable-next-line jsdoc/require-jsdoc
  pfdOrMfd: PfdOrMfd;
}

/** Rose format for the HSI. */
export class HSIRose extends DisplayComponent<HSIRoseProps> {
  private readonly headingRotateElement = FSComponent.createRef<SVGElement>();
  private readonly hsiRoseRef = FSComponent.createRef<HTMLDivElement>();
  private currentHeading = 0;
  private half: number;

  private hdgSub?: Subscription;
  private mockHdgSub?: Subscription;

  /** @inheritdoc */
  public constructor(props: HSIRoseProps) {
    super(props);
    this.half = props.svgViewBoxSize / 2;
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    const ahrs = this.props.bus.getSubscriber<AhrsEvents>();

    this.hdgSub = ahrs.on('hdg_deg')
      .withPrecision(2)
      .handle(hdg => this.handleNewCurrentHeading(hdg));

    const ahrsSub = this.props.bus.getSubscriber<AHRSSystemEvents>();

    ahrsSub.on('ahrs_state').whenChanged()
      .handle(this.onAhrsStateChanged.bind(this));

    this.mockHdgSub = ahrsSub.on('ahrs_init_hdg_deg').withPrecision(2)
      .handle(hdg => this.handleNewCurrentHeading(hdg), true);
  }

  /**
   * A callback called when the AHRS system state changes.
   * @param state The state change event to handle.
   */
  private onAhrsStateChanged(state: AvionicsSystemStateEvent): void {
    if (state.current === AvionicsSystemState.On) {
      this.mockHdgSub?.pause();
      this.hdgSub?.resume(true);
    } else {
      this.hdgSub?.pause();
      this.mockHdgSub?.resume(true);
    }
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  public setVisibility(isVisible: boolean): void {
    this.hsiRoseRef.instance.classList.toggle('hidden', !isVisible);
  }

  /** Updates the HSI indicator rotation when the heading changes.
   * @param hdgDeg deg The new heading value. */
  private updateHeadingRotation(hdgDeg: number): void {
    if (this.headingRotateElement.instance !== null) {
      this.headingRotateElement.instance.style.transform = `rotate3d(0, 0, 1, ${-hdgDeg}deg)`;
    }
  }

  /** Rotates the rose when the heading changes.
   * @param newHeading The new heading value in degrees.
   */
  private readonly handleNewCurrentHeading = (newHeading: number): void => {
    this.currentHeading = newHeading;
    this.updateHeadingRotation(newHeading);
  };

  /**
   * Builds the tick marks/triangles on the outside of the compass rose
   * to indicate cardinal direction and 45 degree angles.
   * @returns A collection of tick mark line and triangle elements.
   */
  private buildRoseTicksAndTriangles(): SVGGeometryElement[] {
    const ticks: SVGGeometryElement[] = [];
    const radius = (this.props.svgViewBoxSize / 2) - 23;

    for (let i = 0; i < 360; i += 45) {
      if (i != 270) {
        const length = 20;

        const startX = this.half + (radius - length) * Math.cos(i * Math.PI / 180);
        const startY = this.half + (radius - length) * Math.sin(i * Math.PI / 180);

        const endX = startX + (length * Math.cos(i * Math.PI / 180));
        const endY = startY + (length * Math.sin(i * Math.PI / 180));

        if (i % 18 == 0) {
          ticks.push(
            <line
              x1={startX}
              y1={startY}
              x2={endX}
              y2={endY}
              stroke="var(--wt21-colors-white)"
            />
          );
        } else {
          ticks.push(
            <path
              d={`M ${startX} ${startY} m -9 -17 l 18 0 l -9 17 z`}
              stroke="var(--wt21-colors-white)"
              stroke-linejoin="round"
              transform={`rotate(${i + 90},${startX}, ${startY})`}
              fill="none"
            />
          );
        }
      }
    }
    return ticks;
  }

  /** Builds the TFC ticks.
   * @param radius radius
   * @param tickLength tickLength
   * @returns A collection of tick mark line elements. */
  private buildRoseTFCTicks(radius: number, tickLength: number): SVGLineElement[] {
    const ticks: SVGLineElement[] = [];

    for (let i = 0; i < 360; i += 30) {
      const startX = this.half + (radius - tickLength) * Math.cos(i * Math.PI / 180);
      const startY = this.half + (radius - tickLength) * Math.sin(i * Math.PI / 180);

      const endX = startX + ((tickLength * 2) * Math.cos(i * Math.PI / 180));
      const endY = startY + ((tickLength * 2) * Math.sin(i * Math.PI / 180));

      ticks.push(
        <line
          x1={startX}
          y1={startY}
          x2={endX}
          y2={endY}
          stroke="var(--wt21-colors-gray)"
        />
      );
    }
    return ticks;
  }

  /** @inheritdoc */
  public render(): VNode {
    const { svgViewBoxSize } = this.props;
    const innerCircleRadius = 115;
    const outerRadius = 230;

    return (
      <div class="hsi-rose" ref={this.hsiRoseRef}>
        <svg class="hsi-rose-static" viewBox={`0 0 ${svgViewBoxSize} ${svgViewBoxSize}`}>
          {this.buildRoseTicksAndTriangles()}
          <g class="hsi-tfc-ticks">
            <g class="hsi-tfc-ticks-fixed">
              {this.buildRoseTFCTicks(innerCircleRadius, 7)}
            </g>
            <g class="hsi-tfc-ticks-25NM">
              {this.buildRoseTFCTicks(34, 5.5)}
            </g>
            <g class="hsi-tfc-ticks-10NM">
              {this.buildRoseTFCTicks(68, 5.5)}
            </g>
            <g class="hsi-tfc-ticks-5NM">
              {this.buildRoseTFCTicks(135, 5.5)}
            </g>
          </g>
          <path
            class="hsi-rose-inner-circle"
            d={SVGUtils.describeArc(this.half, this.half, innerCircleRadius, -62, 281)}
            stroke="var(--wt21-colors-gray)"
            fill="none"
            stroke-linecap="round"
          />
          <g transform={`translate(${this.half}, ${this.half})`}>
            {HSICommon.hsiStickAircraftSymbolSVGPath()}
          </g>
        </svg>
        <div class="hsi-rose-range-text">
          <div class="hsi-rose-range-text-inner">{this.props.mapRangeHalf}</div>
        </div>
        <div class="hsi-rose-rotating" ref={this.headingRotateElement}>
          <svg class="hsi-rose-rotating-svg" viewBox={`0 0 ${svgViewBoxSize} ${svgViewBoxSize}`} >
            <CompassRose
              svgViewBoxSize={svgViewBoxSize}
              ticksRadius={outerRadius}
              lettersRadius={183}
              shortTickLength={12}
              longTickLength={24}
              tickDirection={'Inwards'}
            />
            <HSIHeadingBug
              radius={outerRadius}
              bus={this.props.bus}
              svgViewBoxSize={this.props.svgViewBoxSize}
            />
          </svg>
          <HSITrackPointer
            bus={this.props.bus}
            svgViewBoxSize={this.props.svgViewBoxSize}
            radius={outerRadius}
            insideOrOutside={'Inwards'}
          />
          <HSIBearingPointer
            bus={this.props.bus}
            svgViewBoxSize={svgViewBoxSize}
            outerRadius={outerRadius}
            innerRadius={innerCircleRadius}
            bearingPointerNumber={2}
          />
          <HSIBearingPointer
            bus={this.props.bus}
            svgViewBoxSize={svgViewBoxSize}
            outerRadius={outerRadius}
            innerRadius={innerCircleRadius}
            bearingPointerNumber={1}
          />
          {this.props.pfdOrMfd === 'PFD' &&
            <HSIGhostNeedle
              bus={this.props.bus}
              svgViewBoxSize={this.props.svgViewBoxSize}
              outerRadius={outerRadius}
              innerRadius={innerCircleRadius}
            />
          }
          <HSICourseNeedle
            bus={this.props.bus}
            svgViewBoxSize={this.props.svgViewBoxSize}
            outerRadius={outerRadius}
            innerRadius={innerCircleRadius}
          />
        </div>
      </div>
    );
  }
}