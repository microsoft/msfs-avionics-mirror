import { ComponentProps, ConsumerSubject, ControlSurfacesEvents, DisplayComponent, EventBus, FSComponent, VNode } from '@microsoft/msfs-sdk';

import './AileronTrimGauge.css';


/** The properties for the {@link HorizontalTrimGauge} component. */
export interface HorizontalTrimGaugeProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
  /**
   * The event to subscribe to for gauge, may be any of *_pct events with values in -100...100 range.
   */
  event: keyof ControlSurfacesEvents & string;
  /**
   * The label to display on the marker.
   */
  markerLabel: string;
}


/** The HorizontalTrimGauge component. */
export class HorizontalTrimGauge extends DisplayComponent<HorizontalTrimGaugeProps> {

  private readonly controlSurfacesPub = this.props.bus.getSubscriber<ControlSurfacesEvents>();

  /** The value of the aileron trim in percent.-100...100 */
  private readonly aileronTrimValue = ConsumerSubject.create(
    this.controlSurfacesPub.on(this.props.event).whenChanged().withPrecision(0).atFrequency(60, true),
    -1
  );

  private readonly markerXPositionPercentString = this.aileronTrimValue.map((value) => {
    if (isNaN(Number(value))) {
      throw new Error('HorizontalTrimGauge: value is NaN');
    }
    return (Number(value) + 100) / 2 + '%';
  });

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='aileron-trim-gauge'>
        <div class={'left-label'}>
          L
        </div>
        <div class={'body'}>
          {/*horizontal ruler line*/}
          <svg width={'100%'} height={'100%'} class='ruler-frame'>
            <line x1='0' y1='0' x2='0' y2='100%' class='white' stroke-width='2.5' />
            <line x1='0' y1='100%' x2='100%' y2='100%' class='white' stroke-width='2.5' />
            <line x1='100%' y1='0' x2='100%' y2='100%' class='white' stroke-width='2.5' />
          </svg>
          {/*value marker*/}
          <svg
            viewBox={'0 0 28 28'}
            width={'18px'}
            height={'18px'}
            class='value-marker'
            style={{
              left: this.markerXPositionPercentString,
            }}
          >
            <polygon points='0,2 3,0 28,12 28,16 3,28 0,26' fill='white' stroke='black' stroke-width='1' transform='rotate(90) translate(0, -28)'></polygon>
            <text text-anchor='middle' font-color='black' x='14px' y='16px' font-size='18px'>{this.props.markerLabel}</text>
          </svg>
        </div>
        <div class='right-label'>
          R
        </div>
      </div>
    );
  }
}