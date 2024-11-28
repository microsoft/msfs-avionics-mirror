import {
  ClockEvents, DisplayComponent, EventBus, FSComponent, MappedSubject, MathUtils, Subject, Subscribable, SvgPathStream, VNode
} from '@microsoft/msfs-sdk';

import { AltitudeTrendVector } from './AltitudeTrendVector';

import './AltitudeTape.css';

/** An altitude bug shown on the altitude tape. */
interface AltitudeBug {
  /** Whether the bug is visible, written by the parent. */
  isHidden: Subject<boolean>;

  /** Whether the bug is parked at the top or bottom of the tape, written by the parent. */
  isParked: Subject<boolean>;

  /** The vertical pixel offset/transform for the bug, written by the parent. */
  offset: Subject<number>;

  /** The bug altitude in feet, or null if none (bug will be hidden). */
  bugAltitude: Subscribable<number | null>;

  /** Whether the bug should park at the bottom when below. */
  parksAtBottom: boolean;

  /** Whether the bug should park at the top of the tape when above. */
  parksAtTop: boolean;

  /** The child node containing the visible bug. */
  node: VNode;
}

/** An altitude bug component interface. Children of the altitude tape should implement this interface. */
export interface AltitudeBugComponent<P> extends DisplayComponent<P> {
  /** Whether the bug should park at the bottom when below. */
  parksAtBottom?: boolean;

  /** Whether the bug should park at the top of the tape when above. */
  parksAtTop?: boolean;

  /** The bug altitude in feet, or null if none (bug will be hidden). */
  bugAltitude: Subscribable<number | null>;
}

/** An altitude bug vnode. */
interface AltitudeBugVNode<P> extends VNode {
  /** @inheritdoc */
  instance: AltitudeBugComponent<P>;
}

/** Props for the altitude tape. */
export interface AltitudeTapeProps {
  /** The event bus. */
  bus: EventBus;
  /** Altitude in feet, or null when invalid. */
  altitude: Subscribable<number | null>;
  /** The current altitude trend, predicted for 6 seconds into the future, in feet, or null when invalid. */
  altitudeTrend: Subscribable<number | null>;
  /** Radio Altitude in feet, or null when invalid. */
  radioAltitude: Subscribable<number | null>;
  /** The children of the display component. */
  children?: AltitudeBugVNode<unknown>[];

}

/** Altitude tape. */
export class AltitudeTape extends DisplayComponent<AltitudeTapeProps> {
  // +/- 550 feet range in a 362 px window
  public static readonly PX_PER_FOOT = 362 / 1100;

  public static readonly TAPE_WINDOW_HEIGHT_PX = 362;

  private readonly svgRef = FSComponent.createRef<SVGElement>();

  private readonly tapeReferenceAlt = Subject.create(0);

  private readonly altDifference = MappedSubject.create(
    ([aircraftAltitude, tapeCentreAltitude]) => aircraftAltitude !== null ? tapeCentreAltitude - aircraftAltitude : 0,
    this.props.altitude,
    this.tapeReferenceAlt,
  );

  private readonly altInvalid = this.props.altitude.map((v) => v === null);

  private readonly radioAltPx = this.props.radioAltitude.map((v) => v !== null
    ? Math.max(0, MathUtils.round(AltitudeTape.TAPE_WINDOW_HEIGHT_PX / 2 - v * AltitudeTape.PX_PER_FOOT, 0.1))
    : 0
  );

  private readonly tapeTransformY = this.altDifference.map((v) => MathUtils.round(-190 - v * AltitudeTape.PX_PER_FOOT, 0.1));

  private needTapeRedraw = true;

  private readonly bugs: AltitudeBug[] = [];

  /** @inheritdoc */
  constructor(props: AltitudeTapeProps) {
    super(props);

    if (this.props.children) {
      for (const child of this.props.children) {
        if (child !== null && typeof child === 'object' && 'instance' in child && child.instance !== null && typeof child.instance === 'object') {
          if ('bugAltitude' in child.instance) {
            const bugComponent = child.instance as unknown as AltitudeBugComponent<unknown>;

            const offset = Subject.create(0);
            const isVisible = Subject.create(false);
            const isParked = Subject.create(false);

            this.bugs.push({
              bugAltitude: bugComponent.bugAltitude,
              parksAtBottom: bugComponent.parksAtBottom ? true : false,
              parksAtTop: bugComponent.parksAtTop ? true : false,
              isHidden: isVisible,
              isParked,
              offset,
              node: child,
            });
          } else {
            console.warn('AltitudeTape: Invalid child component (doesn\'t implement AltitudeBugComponentProps).', child);
          }
        }
      }
    }
  }

  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onAfterRender(node: VNode): void {
    this.altDifference.sub((v) => Math.abs(v) >= 500 && (this.needTapeRedraw = true));
    this.altInvalid.map(() => this.needTapeRedraw = true);

    this.props.bus.getSubscriber<ClockEvents>().on('simTime').handle(this.onUpdate.bind(this));
  }

  /** Called once each cycle to update the tape. */
  public onUpdate(): void {
    if (this.needTapeRedraw) {
      this.needTapeRedraw = false;
      this.redrawTape();
    }

    if (!this.altInvalid.get()) {
      this.recomputeBugs();
    }
  }

  /** Redraws the altitude tape. */
  private redrawTape(): void {
    this.svgRef.instance.innerHTML = '';

    const altitude = this.props.altitude.get();

    // tape is empty if alt is invalid
    if (altitude === null) {
      return;
    }

    const nearestMultiple = MathUtils.round(altitude, 500);

    const resolution = AltitudeTape.PX_PER_FOOT * 500; // px per 500 feet

    const svgPathStream = new SvgPathStream(0.01);
    svgPathStream.beginPath();

    for (let i = -2; i <= 2; i++) {
      const markerAlt = nearestMultiple + 500 * i;
      // double arrow
      const majorMarker = markerAlt % 1000 === 0;

      const centreY = resolution * i;

      // chevron
      svgPathStream.moveTo(46, centreY + 46);
      svgPathStream.lineTo(0, + centreY);
      svgPathStream.lineTo(46, centreY - 46);

      // double chevron
      if (majorMarker) {
        svgPathStream.moveTo(46, centreY + 46);
        svgPathStream.lineTo(46, centreY + 38);
        svgPathStream.lineTo(8, centreY);
        svgPathStream.lineTo(46, centreY - 38);
        svgPathStream.lineTo(46, centreY - 46);
      }

      // vertical line up to next tick
      if (i !== -2) {
        svgPathStream.lineTo(46, centreY - (resolution - 46));
      }
    }

    FSComponent.render(<path class="shadow" d={svgPathStream.getSvgPath()} />, this.svgRef.instance);
    FSComponent.render(<path d={svgPathStream.getSvgPath()} />, this.svgRef.instance);

    // text
    for (let i = -2; i <= 2; i++) {
      const markerAlt = nearestMultiple + 500 * i;
      const centreY = -resolution * i;
      FSComponent.render(<text x="82" y={centreY + 2} dominant-baseline="middle" text-anchor="end">{markerAlt.toString()}</text>, this.svgRef.instance);
    }

    // minor ticks every 100 feet
    for (let alt = -900; alt <= 900; alt += 100) {
      if (alt % 500 === 0) {
        continue;
      }
      const y = alt * AltitudeTape.PX_PER_FOOT;
      FSComponent.render(<line class="shadow" x1="-0.5" x2="12.5" y1={y} y2={y} />, this.svgRef.instance);
      FSComponent.render(<line x1="0" x2="12" y1={y} y2={y} />, this.svgRef.instance);
    }

    this.tapeReferenceAlt.set(nearestMultiple);
  }

  /** Recompute the state of bugs. */
  private recomputeBugs(): void {
    const altitude = this.props.altitude.get();
    if (altitude === null) {
      return;
    }

    const topParkingBound = -AltitudeTape.TAPE_WINDOW_HEIGHT_PX / 2;
    const bottomParkingBound = AltitudeTape.TAPE_WINDOW_HEIGHT_PX / 2;
    const topVisibleBound = topParkingBound - 100;
    const bottomVisibleBound = bottomParkingBound + 100;

    for (const bug of this.bugs) {
      const bugAlt = bug.bugAltitude.get();
      let offset = 0;
      let visible = false;
      let parked = false;

      if (bugAlt !== null) {
        offset = Math.round((altitude - bugAlt) * AltitudeTape.PX_PER_FOOT);
        if (offset <= topParkingBound) {
          if (bug.parksAtTop) {
            offset = topParkingBound;
            parked = true;
            visible = true;
          } else if (offset >= topVisibleBound) {
            visible = true;
          }
        } else if (offset >= bottomParkingBound) {
          if (bug.parksAtBottom) {
            offset = bottomParkingBound;
            parked = true;
            visible = true;
          } else if (offset <= bottomVisibleBound) {
            visible = true;
          }
        } else {
          visible = true;
        }
      }

      bug.offset.set(MathUtils.round(offset, 0.1));
      bug.isHidden.set(!visible);
      bug.isParked.set(parked);
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return <div class="altitude-tape">
      <svg class="altitude-tape-ref-mark" viewBox="0 -2 13 4">
        <line class="shadow" x1="1" x2="10" y1="0" y2="0" />
        <line x1="1" x2="10" y1="0" y2="0" />
      </svg>
      <div class="altitude-tape-border border-box">
        <div class="altitude-tape-clip" style={{ 'height': this.radioAltPx.map((v) => `${AltitudeTape.TAPE_WINDOW_HEIGHT_PX - v}px`) }}>
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
      <div
        style={{ 'height': this.radioAltPx.map(v => v + 'px') }}
        class={{
          'ra-crosshatched': true,
          'hidden': this.radioAltPx.map(v => v <= 0)
        }}></div>

      <AltitudeTrendVector altitudeTrend={this.props.altitudeTrend} halfHeight={AltitudeTape.TAPE_WINDOW_HEIGHT_PX / 2} scale={AltitudeTape.PX_PER_FOOT} />
      <div
        class={{
          'altitude-bug-container': true,
          'hidden': this.altInvalid,
        }}
      >
        {
          this.bugs.map(
            (bug) => <div
              class={{
                'altitude-bug': true,
                'hidden': bug.isHidden,
                'parked': bug.isParked,
              }}
              style={{
                'transform': bug.offset.map((v) => `translate3d(0,${v}px,0)`),
              }}
            >
              {bug.node}
            </div>
          )
        }
      </div>
    </div>;
  }
}
