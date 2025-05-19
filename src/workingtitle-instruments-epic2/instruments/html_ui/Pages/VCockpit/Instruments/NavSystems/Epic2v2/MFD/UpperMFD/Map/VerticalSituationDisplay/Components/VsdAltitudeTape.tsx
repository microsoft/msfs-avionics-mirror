import { ClockEvents, DisplayComponent, EventBus, FSComponent, MappedSubject, MathUtils, Subject, Subscribable, VNode } from '@microsoft/msfs-sdk';

import './VsdAltitudeTape.css';

/** Props for the altitude tape. */
export interface VsdAltitudeTapeProps {
  /** The event bus. */
  bus: EventBus;
  /** The altitude at the bottom of the tape, in feet */
  bottomAltitude: Subscribable<number>;
  /** The altitude interval to use */
  altInterval: Subscribable<number>
  /** The number of pixels per foot */
  pixelsPerFoot: Subscribable<number>
}

/** Altitude tape. */
export class VsdAltitudeTape extends DisplayComponent<VsdAltitudeTapeProps> {
  public static readonly TAPE_WINDOW_MAX_ALT = 50000;
  public static readonly TAPE_WINDOW_HEIGHT_PX = 190;
  public static readonly PX_PER_ALT_INTERVAL = 55;

  private readonly svgRef = FSComponent.createRef<SVGElement>();

  private readonly tapeReferenceAlt = Subject.create(0);

  private readonly altDifference = MappedSubject.create(
    ([aircraftAltitude, tapeCentreAltitude]) => aircraftAltitude !== null ? tapeCentreAltitude - aircraftAltitude : 0,
    this.props.bottomAltitude,
    this.tapeReferenceAlt,
  );

  private readonly altInvalid = this.props.bottomAltitude.map((v) => v === null);

  private readonly tapeTransformY = MappedSubject.create(
    ([altitude, tapeReferenceAlt, pxPerFoot]) => {
      const altDisplayDiff = tapeReferenceAlt - altitude;

      return MathUtils.round(-203 - altDisplayDiff * pxPerFoot, 0.1);
    },
    this.props.bottomAltitude, this.tapeReferenceAlt, this.props.pixelsPerFoot
  );

  private needTapeRedraw = true;

  /** @inheritdoc */
  public onAfterRender(): void {
    MappedSubject.create(this.altDifference, this.props.altInterval).sub(([altDiff, altInt]) => Math.abs(altDiff) >= altInt / 2 && (this.needTapeRedraw = true));
    this.props.altInterval.sub(() => this.needTapeRedraw = true);
    this.altInvalid.map(() => this.needTapeRedraw = true);

    this.props.bus.getSubscriber<ClockEvents>().on('simTime').handle(this.onUpdate.bind(this));
  }

  /** Called once each cycle to update the tape. */
  public onUpdate(): void {
    if (this.needTapeRedraw) {
      this.needTapeRedraw = false;
      this.redrawTape();
    }
  }

  /** Redraws the altitude tape. */
  private redrawTape(): void {
    this.svgRef.instance.innerHTML = '';

    const altitude = this.props.bottomAltitude.get();
    const altInterval = this.props.altInterval.get();
    const halfInterval = altInterval / 2;
    const pxPerFoot = this.props.pixelsPerFoot.get();

    // tape is empty if alt is invalid
    if (altitude === null) {
      return;
    }

    const nearestMultiple = MathUtils.round(altitude, altInterval);

    // text
    for (let i = -3; i <= 3; i++) {
      const markerAlt = (nearestMultiple + altInterval * i) / 1000;
      const centreY = -VsdAltitudeTape.PX_PER_ALT_INTERVAL * i;
      markerAlt !== 0 && FSComponent.render(<text x="58" y={centreY + 2} dominant-baseline="middle" text-anchor="end">{markerAlt.toString()}</text>, this.svgRef.instance);
      FSComponent.render(<text x="70" y={centreY + 3} dominant-baseline="middle" text-anchor="end" class='small-alt-text'>0</text>, this.svgRef.instance);
    }

    const altTickRange = altInterval * 3.5;
    // minor ticks every 100 feet
    for (let alt = -altTickRange; alt <= altTickRange; alt += halfInterval) {
      const y = alt * pxPerFoot;
      FSComponent.render(<line x1="89" x2="85" y1={y} y2={y} />, this.svgRef.instance);
    }

    this.tapeReferenceAlt.set(nearestMultiple);
  }

  /** @inheritdoc */
  public render(): VNode {
    return <div class="vsd-altitude-tape">
      <div class="vsd-altitude-tape-border border-box">
        <div class="vsd-altitude-tape-clip">
          <svg
            ref={this.svgRef}
            viewBox="0 -370 89 740"
            style={{
              position: 'absolute',
              left: '0',
              top: '0',
              height: '740px',
              width: '89px',
              transform: this.tapeTransformY.map((v) => `translate3d(0,${v}px,0)`),
            }}
          ></svg>
        </div>
      </div>
    </div>;
  }
}
