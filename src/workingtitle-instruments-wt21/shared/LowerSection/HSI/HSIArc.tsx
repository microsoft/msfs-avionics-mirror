import {
  APEvents, AvionicsSystemState, AvionicsSystemStateEvent, ComponentProps, ConsumerSubject, DisplayComponent, EventBus, FlightPlanner, FSComponent, Subject,
  Subscription, SVGUtils, VNode
} from '@microsoft/msfs-sdk';

import { WT21InstrumentType } from '../../Config';
import { AhrsSystemEvents, AhrsSystemSelectorEvents } from '../../Systems';
import { CompassRose } from './CompassRose';
import { HSIBearingPointer } from './HSIBearingPointer';
import { HSICommon } from './HSICommon';
import { HSICourseNeedle } from './HSICourseNeedle';
import { HSIGhostNeedle } from './HSIGhostNeedle';
import { HSIHeadingBug } from './HSIHeadingBug';
import { HSIArcHeadingVector } from './HSIHeadingVector';
import { HSITrackPointer } from './HSITrackPointer';

import './HSIArc.css';

// eslint-disable-next-line jsdoc/require-jsdoc
interface HSIArcProps extends ComponentProps {
  // eslint-disable-next-line jsdoc/require-jsdoc
  bus: EventBus;
  // eslint-disable-next-line jsdoc/require-jsdoc
  svgViewBoxSize: number;
  // eslint-disable-next-line jsdoc/require-jsdoc
  headingWasSelectedInLast5Seconds: Subject<boolean>;
  // eslint-disable-next-line jsdoc/require-jsdoc
  PPOSMode: boolean;
  // eslint-disable-next-line jsdoc/require-jsdoc
  mapRange: Subject<string>;
  // eslint-disable-next-line jsdoc/require-jsdoc
  mapRangeHalf: Subject<string>;

  /** The instrument type */
  instrumentType: WT21InstrumentType;

  /** An instance of the flight planner. */
  flightPlanner: FlightPlanner;
}

/** Arc format for the HSI. */
export class HSIArc extends DisplayComponent<HSIArcProps> {

  private readonly arcRotatingContentBackgroundRef = FSComponent.createRef<SVGElement>();
  private readonly arcRotatingContentForegroundRef = FSComponent.createRef<SVGElement>();
  private readonly hsiArcRef = FSComponent.createRef<HTMLDivElement>();
  private readonly headingBugRef = FSComponent.createRef<HSIHeadingBug>();
  private readonly headingVectorDashedLineRef = FSComponent.createRef<HSIArcHeadingVector>();
  private readonly headingBugLimitAngle = 69;

  private currentHeading = 0;
  private selectedHeading = 0;
  private circleOffsetY: number;
  private half: number;
  private largeViewBoxSize = 772;
  private halfLarge = this.largeViewBoxSize / 2;

  private hdgSub?: Subscription;
  private mockHdgSub?: Subscription;
  private ahrsStateSub?: Subscription;
  private ahrsHdgValidSub?: Subscription;

  private isAhrsInitializing = false;
  private isAhrsHdgValid = true;
  private readonly selectedAhrs = ConsumerSubject.create(this.props.bus.getSubscriber<AhrsSystemSelectorEvents>().on('ahrs_selected_source_index'), 1);

  /** @inheritdoc */
  constructor(props: HSIArcProps) {
    super(props);

    // All the numbers are proportional to the svg viewBox size.
    // This is so that everything should stay in place regardless of the viewBox size if it changes in the future.
    // If we want we can just go back to noormal numbers, it only takes a few minutes to convert it to one or the other.
    this.circleOffsetY = props.svgViewBoxSize / 8.4;
    this.half = props.svgViewBoxSize / 2;
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    const ahrs = this.props.bus.getSubscriber<AhrsSystemEvents>();
    this.selectedAhrs.sub((ahrsIndex) => {
      this.hdgSub?.destroy();
      this.mockHdgSub?.destroy();
      this.ahrsStateSub?.destroy();
      this.ahrsHdgValidSub?.destroy();

      this.hdgSub = ahrs.on(`ahrs_hdg_deg_${ahrsIndex}`).withPrecision(2).handle(hdg => this.handleNewCurrentHeading(hdg), true);
      this.mockHdgSub = ahrs.on(`ahrs_init_hdg_deg_${ahrsIndex}`).withPrecision(2).handle(hdg => this.handleNewCurrentHeading(hdg), true);
      this.ahrsStateSub = ahrs.on(`ahrs_state_${ahrsIndex}`).whenChanged().handle(this.onAhrsStateChanged.bind(this));
      this.ahrsHdgValidSub = ahrs.on(`ahrs_heading_data_valid_${ahrsIndex}`).handle(this.onAhrsHdgValidityChanged.bind(this));
    }, true);

    const apEvents = this.props.bus.getSubscriber<APEvents>();

    apEvents.on('ap_heading_selected').whenChanged().handle(this.handleNewSelectedHeading);
    this.props.headingWasSelectedInLast5Seconds.sub(this.updateHeadingBugAndVectorLineVisiblity);
  }

  /**
   * A callback called when the AHRS system state changes.
   * @param state The state change event to handle.
   */
  private onAhrsStateChanged(state: AvionicsSystemStateEvent): void {
    this.isAhrsInitializing = state.current === AvionicsSystemState.Initializing;
    if (state.current === AvionicsSystemState.Initializing) {
      this.hdgSub?.pause();
      this.mockHdgSub?.resume();
    } else if (state.current === AvionicsSystemState.On && this.isAhrsHdgValid) {
      this.mockHdgSub?.pause();
      this.hdgSub?.resume();
    }
  }

  /**
   * A callback called when the AHRS heading validity changes
   * @param valid Whether the AHRS heading data is valid
   */
  private onAhrsHdgValidityChanged(valid: boolean): void {
    this.isAhrsHdgValid = valid;

    if (!this.isAhrsInitializing) {
      if (valid) {
        this.hdgSub?.resume();
      } else {
        this.hdgSub?.pause();
      }
    }
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  public setVisibility(isVisible: boolean): void {
    this.hsiArcRef.instance.classList.toggle('hidden', !isVisible);
  }

  /** Rotates the arc when the heading changes.
   * @param newHeading The new heading value in degrees.
   */
  private readonly handleNewCurrentHeading = (newHeading: number): void => {
    this.currentHeading = newHeading;
    this.rotateArc();
    this.updateHeadingBugAndVectorLineVisiblity();
  };

  /** Rotates the arc according to the current heading*/
  private rotateArc(): void {
    this.arcRotatingContentBackgroundRef.instance
      .style.transform = `rotate3d(0, 0, 1, ${-this.currentHeading}deg)`;
    this.arcRotatingContentForegroundRef.instance
      .style.transform = `rotate3d(0, 0, 1, ${-this.currentHeading}deg)`;
  }

  private readonly handleNewSelectedHeading = (heading: number): void => {
    this.selectedHeading = heading;
    // TODO Only call this if visibility changes
    this.updateHeadingBugAndVectorLineVisiblity();
  };

  private readonly updateHeadingBugAndVectorLineVisiblity = (): void => {
    this.headingBugRef.instance.setVisibility(this.shouldHeadingBugBeVisible());
    this.headingVectorDashedLineRef.instance.setVisibility(this.shouldHeadingVectorDashedLineBeVisible());
  };

  /** Heading bug is visible when it is on the arc.
   * Otherwise the heading vector dashed line is shown.
   * @returns Whether the heading bug should be visible. */
  private shouldHeadingBugBeVisible(): boolean {
    let combined = (this.selectedHeading - this.currentHeading) % 360;
    if (combined < 0) { combined += 360; }
    return combined < this.headingBugLimitAngle || combined > (360 - this.headingBugLimitAngle);
  }

  /** Heading vector is visible when the bug is not, and for 5 seconds after the selected heading is changed.
   * @returns Whether the heading vector should be visible. */
  private shouldHeadingVectorDashedLineBeVisible(): boolean {
    return this.props.headingWasSelectedInLast5Seconds.get() || !this.shouldHeadingBugBeVisible();
  }

  /**
   * Builds the TFC overlay tick marks.
   * @param radius Radius of the ticks.
   * @param length Length of the ticks.
   * @returns A collection of rose tick line elements.
   */
  private buildTfcTicks(radius: number, length: number): SVGLineElement[] {
    const lines: SVGLineElement[] = [];

    for (let i = 0; i < 360; i += 30) {
      const startX = this.half + (radius - length) * Math.cos(i * Math.PI / 180);
      const startY = this.half + (radius - length) * Math.sin(i * Math.PI / 180) + this.circleOffsetY;

      const endX = startX + ((length * 2) * Math.cos(i * Math.PI / 180));
      const endY = startY + ((length * 2) * Math.sin(i * Math.PI / 180));

      lines.push(
        <line
          x1={startX}
          y1={startY}
          x2={endX}
          y2={endY}
          stroke="var(--wt21-colors-gray)"
          stroke-linecap="round"
        />
      );
    }

    return lines;
  }

  /** @inheritdoc */
  public render(): VNode {
    const { svgViewBoxSize, PPOSMode } = this.props;
    const innerCircleRadius = svgViewBoxSize / 3.73;
    const arcRadius = svgViewBoxSize / 1.86;

    return (
      <div class="hsi-arc" ref={this.hsiArcRef}>
        <div class="hsi-arc-square">
          <svg class="hsi-arc-svg-static-background" viewBox={`0 0 ${svgViewBoxSize} ${svgViewBoxSize}`} >
            <path
              class="hsi-arc-mask"
              d={`${SVGUtils.describeArc(this.half, this.half + this.circleOffsetY, arcRadius, -62.5, 62.5)} L 0 209 L 0 0 L 564 0 L 564 209 Z`}
              stroke="none"
              fill="black"
            />
            <path
              class="hsi-arc-actual"
              d={SVGUtils.describeArc(this.half, this.half + this.circleOffsetY, arcRadius, -62.5, 62.5)}
              stroke="var(--wt21-colors-white)"
              fill="none"
              stroke-linecap="round"
            />
          </svg>
        </div>
        <div class="hsi-arc-rotating-mask">
          <div class="hsi-rotating-large" style={`top: ${-(this.halfLarge - this.half) + this.circleOffsetY}px; transform: translateX(-50%);`}>
            <div class="hsi-arc-rotating" ref={this.arcRotatingContentBackgroundRef}>
              <svg class="hsi-arc-rotating-svg" viewBox={`0 0 ${this.largeViewBoxSize} ${this.largeViewBoxSize}`} >
                <CompassRose
                  svgViewBoxSize={this.largeViewBoxSize}
                  ticksRadius={arcRadius}
                  lettersRadius={322}
                  shortTickLength={7}
                  longTickLength={13}
                  tickDirection={'Outwards'}
                />
                <HSIHeadingBug
                  ref={this.headingBugRef}
                  bus={this.props.bus}
                  svgViewBoxSize={this.largeViewBoxSize}
                  radius={304}
                />
                {/* <rect class="hsi-arc-rotating-debug-center-square" x={this.halfLarge - 8} y={this.halfLarge - 8} width={16} height={16} fill="magenta" />
              <circle class="hsi-arc-rotating-debug-center-circle" cx={this.halfLarge} cy={this.halfLarge} r={148} stroke="white" /> */}
              </svg>
              <HSITrackPointer
                bus={this.props.bus}
                svgViewBoxSize={this.largeViewBoxSize}
                radius={304}
                insideOrOutside={'Outwards'}
              />
            </div>
          </div>
        </div>
        <div class="hsi-arc-square">
          <svg class="hsi-arc-svg-static-foreground" viewBox={`0 0 ${svgViewBoxSize} ${svgViewBoxSize}`} >
            <g class="hsi-arc-static-foreground">
              <g class="hsi-tfc-ticks">
                <g class="hsi-tfc-ticks-fixed">
                  {this.buildTfcTicks(innerCircleRadius, 7)}
                </g>
                <g class="hsi-tfc-ticks-25NM">
                  {this.buildTfcTicks(44, 5.5)}
                </g>
                <g class="hsi-tfc-ticks-10NM">
                  {this.buildTfcTicks(90, 5.5)}
                </g>
                <g class="hsi-tfc-ticks-5NM">
                  {this.buildTfcTicks(178, 5.5)}
                </g>
              </g>
              <path
                class="hsi-arc-inner-circle"
                d={SVGUtils.describeArc(this.half, this.half + this.circleOffsetY, innerCircleRadius, -62, 285)}
                stroke="var(--wt21-colors-gray)"
                fill="none"
                stroke-linecap="round"
              />
            </g>
          </svg>
          <div class="hsi-arc-range-text">
            <div class="hsi-arc-range-text-inner">{this.props.mapRangeHalf}</div>
            <div class="hsi-arc-range-text-outer">{this.props.mapRange}</div>
          </div>
        </div>
        <div class="hsi-arc-rotating-mask-foreground-square">
          <div class="hsi-rotating-large" style={`top: ${-(this.halfLarge - this.half) + this.circleOffsetY}px; transform: translateX(-50%);`}>
            <div class="hsi-arc-rotating" ref={this.arcRotatingContentForegroundRef}>
              <HSIArcHeadingVector
                ref={this.headingVectorDashedLineRef}
                bus={this.props.bus}
                svgViewBoxSize={this.largeViewBoxSize}
                outerRadius={arcRadius}
                innerRadius={innerCircleRadius - 125}
              />
              <HSIBearingPointer
                bus={this.props.bus}
                svgViewBoxSize={this.largeViewBoxSize}
                outerRadius={302}
                innerRadius={innerCircleRadius}
                bearingPointerNumber={2}
              />
              <HSIBearingPointer
                bus={this.props.bus}
                svgViewBoxSize={this.largeViewBoxSize}
                outerRadius={302}
                innerRadius={innerCircleRadius}
                bearingPointerNumber={1}
              />
              {!PPOSMode && this.props.instrumentType === WT21InstrumentType.Pfd &&
                <HSIGhostNeedle
                  bus={this.props.bus}
                  svgViewBoxSize={this.largeViewBoxSize}
                  outerRadius={302}
                  innerRadius={innerCircleRadius}
                />
              }
              {!PPOSMode &&
                <HSICourseNeedle
                  bus={this.props.bus}
                  svgViewBoxSize={this.largeViewBoxSize}
                  outerRadius={302}
                  innerRadius={innerCircleRadius}
                />
              }
            </div>
          </div>
        </div>
        <div class="hsi-arc-square">
          <svg class="hsi-arc-svg-static-foreground" viewBox={`0 0 ${svgViewBoxSize} ${svgViewBoxSize}`} >
            <g class="hsi-arc-static-foreground">
              {!PPOSMode &&
                <g class="hsi-arc-aircraft-symbol" transform={`translate(${this.half}, ${this.half + this.circleOffsetY})`}>
                  {HSICommon.hsiStickAircraftSymbolSVGPath()}
                </g>
              }
            </g>
          </svg>
        </div>
      </div>
    );
  }
}
