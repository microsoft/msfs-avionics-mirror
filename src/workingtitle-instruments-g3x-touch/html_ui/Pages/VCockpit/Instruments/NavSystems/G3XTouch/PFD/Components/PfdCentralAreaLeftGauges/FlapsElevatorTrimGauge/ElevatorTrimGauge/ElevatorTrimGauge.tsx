import { ComponentProps, ConsumerSubject, ControlSurfacesEvents, DisplayComponent, EventBus, FSComponent, VNode } from '@microsoft/msfs-sdk';

import './ElevatorTrimGauge.css';


/** The properties for the {@link ElevatorTrimGauge} component. */
export interface ElevatorTrimGaugeProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
}


/** The ElevatorTrimGauge component. */
export class ElevatorTrimGauge extends DisplayComponent<ElevatorTrimGaugeProps> {
  private readonly markerHeight = 20;
  private readonly rulerHeight = 80;
  private readonly rulerWidth = 16;

  private readonly controlSurfacesPub = this.props.bus.getSubscriber<ControlSurfacesEvents>();

  /** The value of the elevator trim in percent.-100...100 */
  private readonly elevatorTrimValue = ConsumerSubject.create(
    this.controlSurfacesPub.on('elevator_trim_pct').withPrecision(0),
    -1
  );

  private readonly markerTransform = this.elevatorTrimValue.map((value) => {
    const markerYPositionPX = Math.round(this.rulerHeight * (value + 100) / 200 - this.markerHeight / 2) + 'px';
    return `translate3d(0, ${markerYPositionPX}, 0)`;
  });

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='elevator-trim-gauge'>
        <div class='elevator-trim-gauge-top-label'>
          DN
        </div>
        <div
          class='elevator-trim-gauge-ruler'
          style={{
            width: this.rulerWidth + 'px',
            height: this.rulerHeight + 'px',
          }}
        >
          {/*vertical ruler line*/}
          <svg class='elevator-trim-gauge-ruler-frame'>
            <line x1='0' y1='0' x2='100%' y2='0' class='elevator-trim-gauge-white' stroke-width='2.5' />
            <line x1='0' y1='50%' x2='100%' y2='50%' class='elevator-trim-gauge-green' stroke-width='2.5' />
            <line x1='0' y1='0' x2='0' y2='100%' class='elevator-trim-gauge-white' stroke-width='2.5' />
            <line x1='0' y1='100%' x2='100%' y2='100%' class='elevator-trim-gauge-white' stroke-width='2.5' />
          </svg>
          {/*value marker*/}
          <svg
            viewBox={'0 0 28 28'}
            height={`${this.markerHeight}px`}
            class='elevator-trim-gauge-value-marker'
            style={{
              transform: this.markerTransform,
            }}
          >
            <polygon points='0,2 3,0 28,12 28,16 3,28 0,26' fill='white' stroke='black' stroke-width='1' transform='scale(-1, 1) translate(-28, 0)'></polygon>
            <text text-anchor='middle' font-color='black' x='20px' y='23px' font-size='18px'>E</text>
          </svg>
        </div>
        <div class='elevator-trim-gauge-bottom-label'>
          UP
        </div>
      </div>
    );
  }
}