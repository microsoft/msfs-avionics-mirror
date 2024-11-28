import { ComponentProps, DigitScroller, DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';

import { AirspeedDataProvider } from '@microsoft/msfs-epic2-shared';

import './SpeedDigitalReadout.css';

/** The digital airspeed readout props. */
export interface SpeedDigitalReadoutProps extends ComponentProps {
  /** The airspeed data provider to use. */
  airspeedDataProvider: AirspeedDataProvider;
}

// FIXME need red reverse video when overspeed, and amber reverse video when trend line overspeed

/** The digital airspeed readout component. */
export class SpeedDigitalReadout extends DisplayComponent<SpeedDigitalReadoutProps> {
  private readonly scrollerAirspeed = this.props.airspeedDataProvider.cas.map((v) => v !== null ? v : NaN);

  /** @inheritdoc */
  public render(): VNode | null {
    return <div class="digital-speed">
      <svg
        class={{
          'digital-speed-background': true,
          'red': this.props.airspeedDataProvider.isSpeedAboveMax,
          'amber': this.props.airspeedDataProvider.isTrendAboveMax,
        }}
        viewBox="-2 0 89 84" style="width: 89px; height: 84px">
        <path class="shadow" d="M 80 41 l -13 -9 l 0 -30 l -27 0 l 0 20 l -40 0 l 0 38 l 40 0 l 0 20 l 27 0 l 0 -30 z" />
        <path d="M 80 41 l -13 -9 l 0 -30 l -27 0 l 0 20 l -40 0 l 0 38 l 40 0 l 0 20 l 27 0 l 0 -30 z" />
      </svg>
      <div
        class={{
          'digital-speed-tumblers': true,
          'red': this.props.airspeedDataProvider.isSpeedAboveMax,
          'amber': this.props.airspeedDataProvider.isTrendAboveMax,
          'no-text-shadow': this.props.airspeedDataProvider.isTrendAboveMax,
        }}
        style={{ display: this.scrollerAirspeed.map((v) => v !== null && v >= 30 ? 'block' : 'none') }}>
        <DigitScroller
          value={this.scrollerAirspeed}
          base={10}
          factor={100}
          scrollThreshold={98}
          renderDigit={(digit): string => (Math.abs(digit) % 10).toString()}
          nanString={' '}
          class='speed-digit-scroller speed-hundreds-scroller'
        />
        <DigitScroller
          value={this.scrollerAirspeed}
          base={10}
          factor={10}
          scrollThreshold={8}
          renderDigit={(digit): string => (Math.abs(digit) % 10).toString()}
          nanString={' '}
          class='speed-digit-scroller speed-tens-scroller'
        />
        <DigitScroller
          value={this.scrollerAirspeed}
          base={10}
          factor={1}
          renderDigit={(digit): string => (Math.abs(digit) % 10).toString()}
          nanString={' '}
          class='speed-digit-scroller speed-ones-scroller'
        />
      </div>
    </div>;
  }
}
