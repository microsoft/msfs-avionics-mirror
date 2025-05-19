import { ComponentProps, DigitScroller, DisplayComponent, FSComponent, MappedSubject, MathUtils, Subscribable, VNode } from '@microsoft/msfs-sdk';

import './VsdAltitudeReadout.css';

/** The digital altitude readout props. */
export interface VsdAltitudeDigitalReadoutProps extends ComponentProps {
  /** Altitude in feet, or null when invalid. */
  altitude: Subscribable<number | null>;
  /** Altitude displayed at the bottom of the window */
  bottomWindowAlt: Subscribable<number>;
  /** Number of pixels per foot */
  pixelPerFoot: Subscribable<number>;
}

/** The digital altitude readout component. */
export class VsdAltitudeDigitalReadout extends DisplayComponent<VsdAltitudeDigitalReadoutProps> {
  private readonly scrollerAltitude = this.props.altitude.map((v) => v !== null ? v : NaN);

  // If altitude is negative, we need the 10000 digit scroller to transition from the zero symbol
  // to the negative sign from 0 to -20 feet.
  private readonly scrollerAltitude10k = this.props.altitude.map((v) => v === null ? NaN : (v >= 0 ? v : (Math.max(-9980 + v, -10000))));

  private readonly windowAltDifference = MappedSubject.create(
    ([alt, bottomAlt]) => alt ? MathUtils.round(alt - bottomAlt, 50) : 0,
    this.props.altitude, this.props.bottomWindowAlt
  );

  private readonly tapeTransformY = MappedSubject.create(([altDiff, pxPerFoot]) => -altDiff * pxPerFoot, this.windowAltDifference, this.props.pixelPerFoot);

  /** @inheritdoc */
  public render(): VNode | null {
    return <div class="vsd-digital-altitude" style={{ transform: this.tapeTransformY.map((v) => `translate3d(0,${v}px,0)`) }}>
      <svg class="vsd-digital-altitude-background" viewBox="0 -31 92 62" style="width: 92px; height: 62px">
        <path class="shadow" d="M 8 -22 l 0 22 l 0 22 l 70 0 l 0 -13 l 10 -9 l -10 -9 l 0 -13 z" />
        <path d="M 8 -22 l 0 22 l 0 22 l 70 0 l 0 -13 l 10 -9 l -10 -9 l 0 -13 z" />
      </svg>
      <div class="vsd-digital-altitude-tumblers">
        <DigitScroller
          value={this.scrollerAltitude10k}
          base={10}
          factor={10000}
          scrollThreshold={9980}
          renderDigit={(digit): string => digit < 0 ? '-' : digit === 0 ? ' ' : (Math.abs(digit) % 10).toString()}
          nanString={' '}
          class='vsd-alt-digit-scroller vsd-alt-ten-thousands-scroller'
        />
        <DigitScroller
          value={this.scrollerAltitude}
          base={10}
          factor={1000}
          scrollThreshold={980}
          renderDigit={(digit): string => (Math.abs(digit) % 10).toString()}
          nanString={' '}
          class='vsd-alt-digit-scroller vsd-alt-thousands-scroller'
        />
        <DigitScroller
          value={this.scrollerAltitude}
          base={10}
          factor={100}
          scrollThreshold={80}
          renderDigit={(digit): string => (Math.abs(digit) % 10).toString()}
          nanString={' '}
          class='vsd-alt-digit-scroller vsd-alt-hundreds-scroller'
        />
        <DigitScroller
          value={this.scrollerAltitude}
          base={5}
          factor={20}
          renderDigit={(digit): string => ((Math.abs(digit) % 5) * 20).toString().padStart(2, '0')}
          nanString={'  '}
          class='vsd-alt-digit-scroller vsd-alt-tens-scroller'
        />
      </div>
    </div>;
  }
}
