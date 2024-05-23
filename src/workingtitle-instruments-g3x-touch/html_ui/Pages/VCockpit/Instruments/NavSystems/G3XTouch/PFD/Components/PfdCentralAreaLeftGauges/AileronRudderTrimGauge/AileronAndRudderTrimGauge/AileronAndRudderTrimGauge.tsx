import { ComponentProps, ConsumerSubject, ControlSurfacesEvents, DisplayComponent, EventBus, FSComponent, VNode } from '@microsoft/msfs-sdk';

import './AileronAndRudderTrimGauge.css';


/** The properties for the {@link AileronAndRudderTrimGauge} component. */
export interface AileronAndRudderTrimGaugeProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
}


/** The AileronAndRudderTrimGauge component. */
export class AileronAndRudderTrimGauge extends DisplayComponent<AileronAndRudderTrimGaugeProps> {

  private readonly controlSurfacesPub = this.props.bus.getSubscriber<ControlSurfacesEvents>();

  /** The value of the aileron trim in percent.-100...100 */
  private readonly aileronTrimValue = ConsumerSubject.create(
    this.controlSurfacesPub.on('aileron_trim_pct').whenChanged().withPrecision(0).atFrequency(60, true),
    -1
  );

  /** The value of the rudder trim in percent.-100...100 */
  private readonly rudderTrimValue = ConsumerSubject.create(
    this.controlSurfacesPub.on('rudder_trim_pct').whenChanged().withPrecision(0).atFrequency(60, true),
    -1
  );

  private readonly aileronMarkerXPositionPercentString = this.aileronTrimValue.map((value) => {
    if (isNaN(Number(value))) {
      throw new Error('AileronAndRudderTrimGauge: value is NaN');
    }
    return (Number(value) + 100) / 2 + '%';
  });

  private readonly rudderMarkerXPositionPercentString = this.rudderTrimValue.map((value) => {
    if (isNaN(Number(value))) {
      throw new Error('AileronAndRudderTrimGauge: value is NaN');
    }
    return (Number(value) + 100) / 2 + '%';
  });

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='aileron-and-rudder-trim-gauge'>
        <div class={'left-label'}>
          L
        </div>
        <div class={'body'}>
          {/*horizontal ruler line*/}
          <svg width={'100%'} height={'100%'} class='ruler-frame'>
            <line x1='0' y1='17%' x2='0' y2='83%' class='white' stroke-width='2.5' />
            <line x1='0' y1='50%' x2='100%' y2='50%' class='white' stroke-width='2.5' />
            <line x1='100%' y1='17%' x2='100%' y2='83%' class='white' stroke-width='2.5' />
          </svg>
          {/*value markers*/}
          <svg
            viewBox={'0 0 28 28'}
            width={'18px'}
            height={'18px'}
            class='top-value-marker'
            style={{
              left: this.aileronMarkerXPositionPercentString,
            }}
          >
            <polygon points='0,2 3,0 28,12 28,16 3,28 0,26' fill='white' stroke='black' stroke-width='1' transform='rotate(90) translate(0, -28)'></polygon>
            <text text-anchor='middle' font-color='black' x='14px' y='16px' font-size='18px'>A</text>
          </svg>
          <svg
            viewBox={'0 0 28 28'}
            width={'18px'}
            height={'18px'}
            class='bottom-value-marker'
            style={{
              left: this.rudderMarkerXPositionPercentString,
            }}
          >
            <polygon points='0,2 3,0 28,12 28,16 3,28 0,26' fill='white' stroke='black' stroke-width='1' transform='rotate(270) translate(-28, 0)'></polygon>
            <text text-anchor='middle' font-color='black' x='14px' y='25px' font-size='18px'>R</text>
          </svg>
          {/*horizontal ruler green line (should be on top of value mark)*/}
          <svg width={'100%'} height={'100%'} class='ruler-frame'>
            <line x1='50%' y1='17%' x2='50%' y2='83%' class='green' stroke-width='2.5' />
          </svg>
        </div>
        <div class='right-label'>
          R
        </div>
      </div>
    );
  }
}