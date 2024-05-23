import { ComponentProps, ConsumerSubject, ControlSurfacesEvents, DisplayComponent, EventBus, FSComponent, VNode } from '@microsoft/msfs-sdk';
import { FlapsGaugeConfig, FlapsGaugeLineComponentConfig, FlapsGaugeRangeComponentConfig, FlapsGaugeTickMarkComponentConfig } from './FlapsGaugeConfig';

import './FlapsGauge.css';

/** The properties for the {@link FlapsGauge} component. */
export interface FlapsGaugeProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
  /** The configuration for the flaps gauge. */
  config: FlapsGaugeConfig;
}

/** The FlapsGauge component. */
export class FlapsGauge extends DisplayComponent<FlapsGaugeProps> {
  private readonly markerHeight = 20;
  private readonly rulerHeight = 80;
  private readonly rulerWidth = 16;

  private readonly controlSurfacesPub = this.props.bus.getSubscriber<ControlSurfacesEvents>();

  private readonly flapsValue = ConsumerSubject.create(
    this.controlSurfacesPub.on('flaps_left_angle').withPrecision(0),
    this.props.config.minFlapsValue
  );

  private readonly markerTransform = this.flapsValue.map((value) => {
    const markerYPositionPX = Math.round(this.rulerHeight * (value - this.props.config.minFlapsValue) / (this.props.config.maxFlapsValue - this.props.config.minFlapsValue) - this.markerHeight / 2) + 'px';
    return `translate3d(0, ${markerYPositionPX}, 0)`;
  });

  /**
   * Draws the static components of the gauge from the config.
   * @returns the static components.
   */
  private drawGaugeStaticComponents(): VNode[] {
    return this.props.config.flapsGaugeComponents.map((componentConfig) => {
      let component: VNode;
      switch (componentConfig.type) {
        case 'line':
          component = this.buildLineElement(componentConfig);
          break;
        case 'tickMark':
          component = this.buildTickMarkElement(componentConfig);
          break;
        case 'range':
          component = this.buildRangeElement(componentConfig);
          break;
      }
      return component;
    });
  }

  /**
   * calculates the y position on a ruler in percent for a given value.
   * @param value - the value to calculate the y position for.
   * @returns the y position in percent.
   */
  private yPositionInPercentNumberForValue(value: number): number {
    return 100 * (value - this.props.config.minFlapsValue) / (this.props.config.maxFlapsValue - this.props.config.minFlapsValue);
  }

  /**
   * builds a coloured line element, from the component config.
   * @param componentConfig - the component config.
   * @returns the line element.
   */
  private buildLineElement(componentConfig: FlapsGaugeLineComponentConfig): VNode {
    const componentYPosition = this.yPositionInPercentNumberForValue(componentConfig.value) + '%';
    return (
      <line x1={0} y1={componentYPosition} x2={'100%'} y2={componentYPosition} stroke={componentConfig.color} stroke-width={2.5} />
    );
  }

  /**
   * builds a tick mark element, from the component config.
   * @param componentConfig - the component config.
   * @returns the tick mark element.
   */
  private buildTickMarkElement(componentConfig: FlapsGaugeTickMarkComponentConfig): VNode {
    const componentYPosition = this.yPositionInPercentNumberForValue(componentConfig.value) + '%';
    return (
      <line x1={0} y1={componentYPosition} x2={'100%'} y2={componentYPosition} stroke={'white'} stroke-width={2.5} />
    );
  }

  /**
   * builds a range element, from the component config.
   * @param componentConfig - the component config.
   * @returns the range element.
   */
  private buildRangeElement(componentConfig: FlapsGaugeRangeComponentConfig): VNode {
    const rangeStartYPositionPercent = this.yPositionInPercentNumberForValue(componentConfig.range[0]);
    const rangeEndYPositionPercent = this.yPositionInPercentNumberForValue(componentConfig.range[1]);
    return (
      <rect x={'40%'} y={`${rangeStartYPositionPercent}%`} width={'60%'} height={`${rangeEndYPositionPercent - rangeStartYPositionPercent}%`} fill={componentConfig.color} />
    );
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='flaps-gauge'>
        <div class='flaps-gauge-top-label'>
          {this.props.config.minFlapsValue.toString()}
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
            {this.drawGaugeStaticComponents()}
          </svg>
          {/*vertical ruler frame part 2*/}
          <svg class='flaps-gauge-ruler-frame'>
            <line x1='100%' y1='0' x2='100%' y2='100%' stroke='white' stroke-width='2.5' />
          </svg>
        </div>
        <div class='flaps-gauge-bottom-label'>
          {this.props.config.maxFlapsValue.toString()}
        </div>
      </div>
    );
  }
}
