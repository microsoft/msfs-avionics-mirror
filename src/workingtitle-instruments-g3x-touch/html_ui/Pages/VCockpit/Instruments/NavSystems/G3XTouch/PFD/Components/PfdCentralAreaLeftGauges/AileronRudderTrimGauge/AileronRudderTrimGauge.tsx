import { ComponentProps, ConsumerSubject, ControlSurfacesEvents, DisplayComponent, EventBus, FSComponent, VNode } from '@microsoft/msfs-sdk';

import './AileronRudderTrimGauge.css';

/** The properties for the {@link AileronRudderTrimGauge} component. */
export interface AileronRudderTrimGaugeProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
  /** Whether the rudder trim gauge should be displayed. */
  useRudderTrim: boolean;
  /** Whether the aileron trim gauge should be displayed. */
  useAileronTrim: boolean;
}

/** The AileronRudderTrimGauge component. */
export class AileronRudderTrimGauge extends DisplayComponent<AileronRudderTrimGaugeProps> {
  private readonly markerWidth = 20;
  private readonly rulerWidth = 80;
  private readonly rulerHeightRudderAndAileron = 40;
  private readonly rulerVerticalFrameHeightRudderOrAileron = 20;

  private readonly controlSurfacesPub = this.props.bus.getSubscriber<ControlSurfacesEvents>();

  /** The value of the aileron trim in percent.-100...100 */
  private readonly aileronTrimValuePCT = ConsumerSubject.create(
    this.controlSurfacesPub.on('aileron_trim_pct').withPrecision(0),
    -1
  );

  private readonly aileronMarkerTransform = this.aileronTrimValuePCT.map((value) => {
    const markerYPositionPX = Math.round(this.rulerWidth * (value + 100) / 200 - this.markerWidth / 2) + 'px';
    return `translate3d(${markerYPositionPX}, 0, 0)`;
  });

  /** The value of the rudder trim in percent.-100...100 */
  private readonly rudderTrimValuePCT = ConsumerSubject.create(
    this.controlSurfacesPub.on('rudder_trim_pct').withPrecision(0),
    -1
  );

  private readonly rudderMarkerTransform = this.rudderTrimValuePCT.map((value) => {
    const markerYPositionPX = Math.round(this.rulerWidth * (value + 100) / 200 - this.markerWidth / 2) + 'px';
    return `translate3d(${markerYPositionPX}, 0, 0)`;
  });

  /** @inheritdoc */
  public render(): VNode {
    return (
      <>
        {this.props.useAileronTrim && this.props.useRudderTrim &&
          this.renderRudderAndAileron()
        }
        {this.props.useAileronTrim && !this.props.useRudderTrim &&
          this.renderRudderOrAileron('aileron')
        }
        {!this.props.useAileronTrim && this.props.useRudderTrim &&
          this.renderRudderOrAileron('rudder')
        }
      </>
    );
  }

  /**
   * Renders the rudder and trim gauge.
   * @returns The rudder and trim gauge.
   * */
  private renderRudderAndAileron(): VNode {
    return (
      <div class='aileron-rudder-trim-gauge-rudder-and-aileron'>
        <div class='aileron-rudder-trim-gauge-left-label'>
          L
        </div>
        <div
          class='aileron-rudder-trim-gauge-ruler'
          style={{
            width: this.rulerWidth + 'px',
            height: this.rulerHeightRudderAndAileron + 'px',
          }}
        >
          {/*horizontal ruler frame*/}
          <svg class='aileron-rudder-trim-gauge-ruler-frame'>
            <line x1='0' y1='17%' x2='0' y2='83%' class='aileron-rudder-trim-gauge-white' stroke-width='2.5' />
            <line x1='0' y1='50%' x2='100%' y2='50%' class='aileron-rudder-trim-gauge-white' stroke-width='2.5' />
            <line x1='100%' y1='17%' x2='100%' y2='83%' class='aileron-rudder-trim-gauge-white' stroke-width='2.5' />
          </svg>
          {/*value markers*/}
          <svg
            viewBox={'0 0 28 28'}
            width={this.markerWidth + 'px'}
            class='aileron-rudder-trim-gauge-rudder-and-aileron-top-value-marker'
            style={{
              transform: this.aileronMarkerTransform,
            }}
          >
            <polygon points='0,2 3,0 28,12 28,16 3,28 0,26' fill='white' stroke='black' stroke-width='1' transform='rotate(90) translate(0, -28)'></polygon>
            <text text-anchor='middle' font-color='black' x='14px' y='16px' font-size='18px'>A</text>
          </svg>
          <svg
            viewBox={'0 0 28 28'}
            width={this.markerWidth + 'px'}
            class='aileron-rudder-trim-gauge-rudder-and-aileron-bottom-value-marker'
            style={{
              transform: this.rudderMarkerTransform,
            }}
          >
            <polygon points='0,2 3,0 28,12 28,16 3,28 0,26' fill='white' stroke='black' stroke-width='1' transform='rotate(270) translate(-28, 0)'></polygon>
            <text text-anchor='middle' font-color='black' x='14px' y='25px' font-size='18px'>R</text>
          </svg>
          <svg class={'aileron-rudder-trim-gauge-ruler-frame'}>
            {/*horizontal ruler green line (should be on top of value mark)*/}
            <line x1='50%' y1='17%' x2='50%' y2='83%' class='aileron-rudder-trim-gauge-green' stroke-width='2.5' />
          </svg>
        </div>
        <div class='aileron-rudder-trim-gauge-right-label'>
          R
        </div>
      </div>
    );
  }

  /**
   * Renders the rudder or aileron trim gauge.
   * @param rudderOrTrim - The type of gauge to render.
   * @returns The rudder or aileron trim gauge.
   */
  private renderRudderOrAileron(rudderOrTrim: 'rudder' | 'aileron'): VNode {
    const markerLabel = rudderOrTrim === 'rudder' ? 'R' : 'A';
    const transform = rudderOrTrim === 'rudder' ? this.rudderMarkerTransform : this.aileronMarkerTransform;
    return (
      <div class='aileron-rudder-trim-gauge-rudder-or-aileron'>
        <div class={'aileron-rudder-trim-gauge-left-label'}>
          L
        </div>
        <div
          class={'aileron-rudder-trim-gauge-ruler'}
          style={{
            width: this.rulerWidth + 'px',
            height: this.rulerVerticalFrameHeightRudderOrAileron + 'px',
          }}
        >
          {/*horizontal ruler line*/}
          <svg width={'100%'} height={'100%'} class='g3xt-htg-ruler-frame'>
            <line x1='0' y1='0' x2='0' y2='100%' class='aileron-rudder-trim-gauge-white' stroke-width='2.5' />
            <line x1='0' y1='100%' x2='100%' y2='100%' class='aileron-rudder-trim-gauge-white' stroke-width='2.5' />
            <line x1='100%' y1='0' x2='100%' y2='100%' class='aileron-rudder-trim-gauge-white' stroke-width='2.5' />
          </svg>
          {/*value marker*/}
          <svg
            viewBox={'0 0 28 28'}
            width={'18px'}
            height={'18px'}
            class='aileron-rudder-trim-gauge-rudder-or-aileron-value-marker'
            style={{
              transform: transform,
            }}
          >
            <polygon points='0,2 3,0 28,12 28,16 3,28 0,26' fill='white' stroke='black' stroke-width='1' transform='rotate(90) translate(0, -28)'></polygon>
            <text text-anchor='middle' font-color='black' x='13px' y='17px' font-size='18px'>{markerLabel}</text>
          </svg>
        </div>
        <div class='aileron-rudder-trim-gauge-right-label'>
          R
        </div>
      </div>
    );
  }
}