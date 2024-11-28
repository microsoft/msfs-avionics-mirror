import { ComponentProps, DigitScroller, DisplayComponent, FSComponent, Subscribable, VNode } from '@microsoft/msfs-sdk';

import './AltitudeDigitalReadout.css';

/** The digital altitude readout props. */
export interface AltitudeDigitalReadoutProps extends ComponentProps {
  /** Altitude in feet, or null when invalid. */
  altitude: Subscribable<number | null>;
}

/** The digital altitude readout component. */
export class AltitudeDigitalReadout extends DisplayComponent<AltitudeDigitalReadoutProps> {
  private readonly scrollerAltitude = this.props.altitude.map((v) => v !== null ? v : NaN);
  // If altitude is negative, we need the 10000 digit scroller to transition from the zero symbol
  // to the negative sign from 0 to -20 feet.
  private readonly scrollerAltitude10k = this.props.altitude.map((v) => v === null ? NaN : (v >= 0 ? v : (Math.max(-9980 + v, -10000))));

  private readonly isBelow10KIndicatorHidden = this.props.altitude.map((v) => v === null || v < 0 || v >= 9_980);

  /** @inheritdoc */
  public render(): VNode | null {
    return <div class="digital-altitude">
      <svg class="digital-altitude-background" viewBox="0 -31 92 62" style="width: 92px; height: 62px">
        <path class="shadow" d="M 4 0 l 19 19 l 41 0 l 0 10 l 26 0 l 0 -58 l -26 0 l 0 10 l -40 0 z" />
        <path d="M 4 0 l 19 19 l 41 0 l 0 10 l 26 0 l 0 -58 l -26 0 l 0 10 l -40 0 z" />
      </svg>
      <div class="digital-altitude-tumblers">
        <DigitScroller
          value={this.scrollerAltitude10k}
          base={10}
          factor={10000}
          scrollThreshold={9980}
          renderDigit={(digit): string => digit === 0 ? '$' : digit < 0 ? '-' : (digit % 10).toString()}
          nanString={' '}
          class='alt-digit-scroller alt-ten-thousands-scroller'
        />
        <DigitScroller
          value={this.scrollerAltitude}
          base={10}
          factor={1000}
          scrollThreshold={980}
          renderDigit={(digit): string => (Math.abs(digit) % 10).toString()}
          nanString={' '}
          class='alt-digit-scroller alt-thousands-scroller'
        />
        <DigitScroller
          value={this.scrollerAltitude}
          base={10}
          factor={100}
          scrollThreshold={80}
          renderDigit={(digit): string => (Math.abs(digit) % 10).toString()}
          nanString={' '}
          class='alt-digit-scroller alt-hundreds-scroller'
        />
        <DigitScroller
          value={this.scrollerAltitude}
          base={5}
          factor={20}
          renderDigit={(digit): string => ((Math.abs(digit) % 5) * 20).toString().padStart(2, '0')}
          nanString={'  '}
          class='alt-digit-scroller alt-tens-scroller'
        />
        <img
          src="coui://html_ui/Pages/VCockpit/Instruments/NavSystems/Epic2v2/Assets/Images/digital-alt-barber.png"
          class={{
            'alt-below-10k-indicator': true,
            'hidden': this.isBelow10KIndicatorHidden,
          }}
        />
      </div>
    </div>;
  }
}
