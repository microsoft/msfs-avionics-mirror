import {
  ComponentProps, ConsumerSubject, ControlSurfacesEvents, DisplayComponent, EventBus, FSComponent, MathUtils, VNode
} from '@microsoft/msfs-sdk';

import { PfdFlapsGaugeConfig, PfdFlapsGaugeScaleRangeDef, PfdFlapsGaugeScaleTickDef } from './PfdFlapsGaugeConfig';

import './PfdFlapsGauge.css';

/**
 * Component props for {@link PfdFlapsGauge}.
 */
export interface PfdFlapsGaugeProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** A configuration object defining options for the gauge. */
  config: PfdFlapsGaugeConfig;
}

/**
 * A PFD flaps gauge.
 */
export class PfdFlapsGauge extends DisplayComponent<PfdFlapsGaugeProps> {
  private readonly markerHeight = 20;
  private readonly rulerHeight = 80;
  private readonly rulerWidth = 16;

  private readonly controlSurfacesPub = this.props.bus.getSubscriber<ControlSurfacesEvents>();

  private readonly flapsValue = ConsumerSubject.create(
    this.controlSurfacesPub.on('flaps_left_angle').withPrecision(0),
    this.props.config.minAngle
  );

  private readonly markerTransform = this.flapsValue.map((value) => {
    const markerYPositionPX = Math.round(this.rulerHeight * (value - this.props.config.minAngle) / (this.props.config.maxAngle - this.props.config.minAngle) - this.markerHeight / 2) + 'px';
    return `translate3d(0, ${markerYPositionPX}, 0)`;
  });

  /**
   * Gets the position along this gauge's scale at which a given angle is located, from 0 (top) to 100 (bottom).
   * @param angle The angle for which to get a scale position, in degrees.
   * @returns The position along this gauge's scale at which the specified angle is located, from 0 (top) to 100
   * (bottom).
   */
  private getScalePositionForAngle(angle: number): number {
    return MathUtils.lerp(angle, this.props.config.minAngle, this.props.config.maxAngle, 0, 100);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='flaps-gauge'>
        <div class='flaps-gauge-top-label'>
          {this.props.config.minAngle.toString()}
        </div>
        <div
          class='flaps-gauge-ruler'
          style={{
            width: this.rulerWidth + 'px',
            height: this.rulerHeight + 'px',
          }}
        >
          {/*vertical ruler frame part 1*/}
          <svg class='flaps-gauge-ruler-frame'>
            <line x1='0%' y1='100%' x2='100%' y2='100%' stroke='white' stroke-width='2.5' />
            <line x1='0' y1='0' x2='100%' y2='0' stroke='white' stroke-width='2.5' />
          </svg>
          {/*value marker*/}
          <svg
            viewBox={'0 0 28 28'}
            height={`${this.markerHeight}px`}
            class='flaps-gauge-value-marker'
            style={{
              transform: this.markerTransform,
            }}
          >
            <polygon points='0,2 3,0 28,12 28,16 3,28 0,26' fill='white' stroke='black' stroke-width='1'></polygon>
            <text text-anchor='middle' font-color='black' x='8px' y='23px' font-size='18px'>F</text>
          </svg>
          {/*flaps-gauge-container for gauge lines, tick-marks and indicator*/}
          <svg class='flaps-gauge-lines-container'>
            {this.renderScaleRanges()}
            {this.renderScaleTicks()}
          </svg>
          {/*vertical ruler frame part 2*/}
          <svg class='flaps-gauge-ruler-frame'>
            <line x1='100%' y1='0' x2='100%' y2='100%' stroke='white' stroke-width='2.5' />
          </svg>
        </div>
        <div class='flaps-gauge-bottom-label'>
          {this.props.config.maxAngle.toString()}
        </div>
      </div>
    );
  }

  /**
   * Renders this gauge's scale ranges.
   * @returns This gauge's scale ranges, as an array of VNodes.
   */
  private renderScaleRanges(): (VNode | null)[] {
    return this.props.config.scaleRanges.map(this.renderScaleRange.bind(this));
  }

  /**
   * Renders a scale range.
   * @param def The definition for the scale range to render.
   * @returns The scale range described by the specified definition, as a VNode.
   */
  private renderScaleRange(def: Readonly<PfdFlapsGaugeScaleRangeDef>): VNode | null {
    const minPosition = MathUtils.clamp(this.getScalePositionForAngle(def.minAngle), 0, 100);
    const maxPosition = MathUtils.clamp(this.getScalePositionForAngle(def.maxAngle), 0, 100);
    const height = maxPosition - minPosition;

    if (height === 0) {
      return null;
    } else {
      return (
        <rect x={'40%'} y={`${minPosition}%`} width={'60%'} height={`${height}%`} fill={def.color} />
      );
    }
  }

  /**
   * Renders this gauge's scale tick marks.
   * @returns This gauge's scale tick marks., as an array of VNodes.
   */
  private renderScaleTicks(): (VNode | null)[] {
    return this.props.config.scaleTicks.map(this.renderScaleTick.bind(this));
  }

  /**
   * Renders a scale tick mark.
   * @param def The definition for the scale tick mark to render.
   * @returns The scale tick mark described by the specified definition, as a VNode.
   */
  private renderScaleTick(def: Readonly<PfdFlapsGaugeScaleTickDef>): VNode | null {
    const position = this.getScalePositionForAngle(def.angle);

    if (position < 0 || position > 100) {
      return null;
    } else {
      return (
        <line x1='0%' y1={`${position}%`} x2='100%' y2={`${position}%`} stroke={def.color} stroke-width={2.5} />
      );
    }
  }
}
