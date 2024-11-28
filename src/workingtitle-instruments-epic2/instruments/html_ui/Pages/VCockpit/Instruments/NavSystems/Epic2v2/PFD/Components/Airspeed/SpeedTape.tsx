import {
  ClockEvents, ComponentProps, DisplayComponent, EventBus, FSComponent, MappedSubject, MathUtils, Subject, Subscribable, SvgPathStream, VNode
} from '@microsoft/msfs-sdk';

import {
  AirGroundDataProvider, AirspeedDataProvider, AutothrottleDataProvider, AutothrottleMode, FlapWarningDataProvider, StallWarningDataProvider
} from '@microsoft/msfs-epic2-shared';

import { SpeedVector } from './SpeedVector';

import './SpeedTape.css';

/** An airspeed bug shown on the airspeed tape. */
interface SpeedBug {
  /** Whether the bug is visible. */
  isHidden: Subject<boolean>;

  /** Whether the bug is parked at the top or bottom of the tape. */
  isParked: Subject<boolean>;

  /** The vertical pixel offset/transform for the bug. */
  offset: Subject<number>;

  /** The bug airspeed in knots, or null if none (bug will be hidden). */
  bugAirspeed: Subscribable<number | null>;

  /** Whether the bug should park at the bottom when below. */
  parksAtBottom: boolean;

  /** Whether the bug should park at the top of the tape when above. */
  parksAtTop: boolean;

  /** The child node containing the visible bug. */
  node: VNode;
}

/** An speed bug component interface. Children of the speed tape should implement this interface. */
export interface SpeedBugComponent<P> extends DisplayComponent<P> {
  /** Whether the bug should park at the bottom when below. */
  parksAtBottom?: boolean;

  /** Whether the bug should park at the top of the tape when above. */
  parksAtTop?: boolean;

  /** The bug airspeed in knots, or null if none (bug will be hidden). */
  bugAirspeed: Subscribable<number | null>;
}

/** A speed bug vnode. */
interface SpeedBugVNode extends VNode {
  /** @inheritdoc */
  instance: SpeedBugComponent<unknown>;
}

/** Props for the speed tape. */
export interface SpeedTapeProps extends ComponentProps {
  /** The event bus. */
  readonly bus: EventBus;
  /** The airspeed data provider to use. */
  readonly airspeedDataProvider: AirspeedDataProvider;
  /** The airspeed data provider to use. */
  readonly autothrottleDataProvider: AutothrottleDataProvider;
  /** The air/ground system data provider to use. */
  readonly airGroundDataProvider: AirGroundDataProvider;
  /** The flap warning data provider to use. */
  readonly flapWarningDataProvider: FlapWarningDataProvider;
  /** The stall warning data provider to use. */
  readonly stallWarningDataProvider: StallWarningDataProvider;
  /** The children of the display component. */
  children?: SpeedBugVNode[];
}

// 30 to 550
// ticks every 10 knots up to 200, every 20 knots after

/** Speed tape. */
export class SpeedTape extends DisplayComponent<SpeedTapeProps> {
  public static readonly PX_PER_KNOT = 362 / 85;

  public static readonly TAPE_WINDOW_HEIGHT_PX = 362;

  private static readonly MIN_SPEED = 30;

  private readonly svgRef = FSComponent.createRef<SVGElement>();

  private readonly tapeReferenceSpeed = Subject.create(SpeedTape.MIN_SPEED);

  private readonly speedDifference = MappedSubject.create(
    ([aircraftSpeed, tapeCentreSpeed]) => aircraftSpeed !== null ? tapeCentreSpeed - Math.max(SpeedTape.MIN_SPEED, aircraftSpeed) : 0,
    this.props.airspeedDataProvider.cas,
    this.tapeReferenceSpeed,
  );

  private readonly speedInvalid = this.props.airspeedDataProvider.cas.map((v) => v === null);

  private readonly tapeTransformY = this.speedDifference.map((v) => MathUtils.round(-190 - v * SpeedTape.PX_PER_KNOT, 0.1));

  private readonly isNotCloseToMaxSpeed = MappedSubject.create(
    ([max, cas]) => cas === null || !isFinite(max) || max - cas > 5,
    this.props.airspeedDataProvider.maxOperatingSpeed,
    this.props.airspeedDataProvider.cas,
  );

  private readonly maxSpeedTransformPx = MappedSubject.create(
    ([vmo, cas]) => isFinite(vmo) && cas !== null
      ? MathUtils.round(MathUtils.clamp(-SpeedTape.TAPE_WINDOW_HEIGHT_PX / 2 + (cas - vmo) * SpeedTape.PX_PER_KNOT, -SpeedTape.TAPE_WINDOW_HEIGHT_PX, 0), 0.1)
      : 0,
    this.props.airspeedDataProvider.maxOperatingSpeed,
    this.props.airspeedDataProvider.cas,
  );

  private readonly maxSpeedTransform = this.maxSpeedTransformPx.map((v) => `translate3d(0px, ${v}px, 0px)`);

  private readonly placardSpeedClipTransform = this.maxSpeedTransformPx.map((v) => `translate3d(0px, ${SpeedTape.TAPE_WINDOW_HEIGHT_PX + v}px, 0px)`);

  private readonly placardSpeedTransform = MappedSubject.create(
    ([placard, cas, maxSpeedTransform]) => isFinite(placard) && cas !== null
      ? `translate3d(0px, ${MathUtils.round(MathUtils.clamp(
        maxSpeedTransform < 0
          ? - 1.5 * SpeedTape.TAPE_WINDOW_HEIGHT_PX - maxSpeedTransform + (cas - placard) * SpeedTape.PX_PER_KNOT
          : -SpeedTape.TAPE_WINDOW_HEIGHT_PX / 2 + (cas - placard) * SpeedTape.PX_PER_KNOT,
        -SpeedTape.TAPE_WINDOW_HEIGHT_PX, 0), 0.1)}px, 0px)`
      : 'translate3d(0px, 0px, 0px)',
    this.props.airspeedDataProvider.maxPlacardSpeed,
    this.props.airspeedDataProvider.cas,
    this.maxSpeedTransformPx,
  );

  private readonly minSpeedTransform = MappedSubject.create(
    ([stallSpeed, cas]) => (stallSpeed !== null && cas !== null)
      ? `translate3d(0px, ${MathUtils.round(MathUtils.clamp(-SpeedTape.TAPE_WINDOW_HEIGHT_PX / 2 + (cas - stallSpeed) * SpeedTape.PX_PER_KNOT, -SpeedTape.TAPE_WINDOW_HEIGHT_PX, 0), 0.1)}px, 0px)`
      : 'translate3d(0px, 0px, 0px)',
    this.props.stallWarningDataProvider.stallWarningCas,
    this.props.airspeedDataProvider.cas,
  );

  private readonly isMinSpeedHidden = MappedSubject.create(
    ([isOnGround, flapValid, cas]) => isOnGround || !flapValid || cas === null,
    this.props.airGroundDataProvider.isOnGround,
    this.props.flapWarningDataProvider.isFlapDataValid,
    this.props.airspeedDataProvider.cas,
  );

  private readonly cautionSpeedTransform?: MappedSubject<[number | null, number | null], string>;

  private readonly isCautionSpeedHidden?: MappedSubject<[boolean, boolean, number | null, AutothrottleMode | null], boolean>;

  private needTapeRedraw = true;

  private readonly bugs: SpeedBug[] = [];

  /** @inheritdoc */
  constructor(props: SpeedTapeProps) {
    super(props);

    if (this.props.children) {
      for (const child of this.props.children) {
        if (child !== null && typeof child === 'object' && 'instance' in child && child.instance !== null && typeof child.instance === 'object') {
          if ('bugAirspeed' in child.instance) {
            const bugComponent = child.instance as unknown as SpeedBugComponent<unknown>;

            const offset = Subject.create(0);
            const isVisible = Subject.create(false);
            const isParked = Subject.create(false);

            this.bugs.push({
              bugAirspeed: bugComponent.bugAirspeed,
              parksAtBottom: bugComponent.parksAtBottom ? true : false,
              parksAtTop: bugComponent.parksAtTop ? true : false,
              isHidden: isVisible,
              isParked,
              offset,
              node: child,
            });
          } else {
            console.warn('SpeedTape: Invalid child component (doesn\'t implement SpeedBugComponentProps).', child);
          }
        }
      }
    }

    if (this.props.autothrottleDataProvider.speedProtectionAvailable) {
      this.isCautionSpeedHidden = MappedSubject.create(
        ([isOnGround, flapValid, cas, atMode]) => atMode === AutothrottleMode.SpeedProtection || isOnGround || !flapValid || cas === null,
        this.props.airGroundDataProvider.isOnGround,
        this.props.flapWarningDataProvider.isFlapDataValid,
        this.props.airspeedDataProvider.cas,
        this.props.autothrottleDataProvider.mode
      );

      this.cautionSpeedTransform = MappedSubject.create(
        ([stallSpeed, cas]) => (stallSpeed !== null && cas !== null)
          ? `translate3d(0px, ${MathUtils.round(MathUtils.clamp(-SpeedTape.TAPE_WINDOW_HEIGHT_PX / 2 + (cas - (stallSpeed * 1.1)) * SpeedTape.PX_PER_KNOT, -SpeedTape.TAPE_WINDOW_HEIGHT_PX, 0), 0.1)}px, 0px)`
          : 'translate3d(0px, 0px, 0px)',
        this.props.stallWarningDataProvider.stallWarningCas,
        this.props.airspeedDataProvider.cas,
      );
    }

    this.isMinSpeedHidden.sub((v) => {
      if (v) {
        this.minSpeedTransform.pause();
      } else {
        this.minSpeedTransform.resume();
      }
    });
  }

  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onAfterRender(node: VNode): void {
    this.speedDifference.sub((v) => Math.abs(v) >= 40 && (this.needTapeRedraw = true));
    this.speedInvalid.map(() => this.needTapeRedraw = true);
    this.props.bus.getSubscriber<ClockEvents>().on('simTime').handle(this.onUpdate.bind(this));
  }

  /** Called once each cycle to update the tape. */
  public onUpdate(): void {
    if (this.needTapeRedraw) {
      this.needTapeRedraw = false;
      this.redrawTape();
    }

    if (!this.speedInvalid.get()) {
      this.recomputeBugs();
    }
  }

  /** Redraws the speed tape. */
  private redrawTape(): void {
    this.svgRef.instance.innerHTML = '';

    const airspeed = this.props.airspeedDataProvider.cas.get();

    // tape is empty if speed is invalid
    if (airspeed === null) {
      return;
    }

    const nearestMultiple = Math.max(MathUtils.round(airspeed, 10), SpeedTape.MIN_SPEED);

    const svgPathStream = new SvgPathStream(0.01);
    svgPathStream.beginPath();

    // tick every 10 knots, +/- 80 from centre
    for (let i = -80; i <= 80; i += 10) {
      const markerSpeed = nearestMultiple + i;

      // ticks are only every 20 knots above 200
      if (markerSpeed < SpeedTape.MIN_SPEED || markerSpeed > 200 && markerSpeed % 20 !== 0) {
        continue;
      }

      const centreY = -SpeedTape.PX_PER_KNOT * i;

      FSComponent.render(<line class="shadow" x1="49.5" x2="82.5" y1={centreY} y2={centreY} />, this.svgRef.instance);
      FSComponent.render(<line x1="50" x2="82" y1={centreY} y2={centreY} />, this.svgRef.instance);
      FSComponent.render(<text x="46" y={centreY + 2} dominant-baseline="middle" text-anchor="end">{markerSpeed.toString()}</text>, this.svgRef.instance);
    }

    this.tapeReferenceSpeed.set(nearestMultiple);
  }

  /** Recompute the state of bugs. */
  private recomputeBugs(): void {
    let cas = this.props.airspeedDataProvider.cas.get();
    if (cas === null) {
      return;
    }
    cas = Math.max(SpeedTape.MIN_SPEED, cas);

    const topParkingBound = -SpeedTape.TAPE_WINDOW_HEIGHT_PX / 2;
    const bottomParkingBound = SpeedTape.TAPE_WINDOW_HEIGHT_PX / 2;
    const topVisibleBound = topParkingBound - 100;
    const bottomVisibleBound = bottomParkingBound + 100;

    for (const bug of this.bugs) {
      const bugCas = bug.bugAirspeed.get();
      let offset = 0;
      let visible = false;
      let parked = false;

      if (bugCas !== null && bugCas >= SpeedTape.MIN_SPEED) {
        offset = Math.round((cas - bugCas) * SpeedTape.PX_PER_KNOT);
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
  public render(): VNode | null {
    return <div class="speed-tape">
      <svg class="speed-tape-ref-mark" viewBox="0 -2 13 4">
        <line class="shadow" x1="1" x2="10" y1="0" y2="0" />
        <line x1="1" x2="10" y1="0" y2="0" />
      </svg>
      <div class="speed-tape-border border-box">
        <div style="speed-tape-clip">
          <svg ref={this.svgRef} viewBox="0 -370 79 740" style={{
            position: 'absolute',
            left: '0',
            top: '0',
            height: '740px',
            width: '79px',
            transform: this.tapeTransformY.map((v) => `translateY(${v}px)`),
          }}></svg>
        </div>
      </div>
      <SpeedVector casTrendDiff={this.props.airspeedDataProvider.casTrendDiff} scale={SpeedTape.PX_PER_KNOT} halfHeight={SpeedTape.TAPE_WINDOW_HEIGHT_PX / 2} />
      <div
        class={{
          'placard-speed-clip': true,
          'hidden': this.props.airspeedDataProvider.maxPlacardSpeed.map((v) => !isFinite(v)),
        }}
        style={{
          'transform': this.placardSpeedClipTransform,
        }}
      >
        <div
          class="placard-speed-vertical-pole"
          style={{
            'transform': this.placardSpeedTransform,
          }}
        />
      </div>
      {this.props.autothrottleDataProvider.speedProtectionAvailable && <div
        class={{
          'caution-speed-vertical-pole': true,
          'hidden': this.isCautionSpeedHidden ?? true,
        }}
        style={{
          'transform': this.cautionSpeedTransform
        }}
      />}
      <div
        class={{
          'max-speed-vertical-pole': true,
          'hidden': this.isNotCloseToMaxSpeed,
        }}
        style={{
          'transform': this.maxSpeedTransform,
        }}
      />
      <div
        class={{
          'min-speed-vertical-pole': true,
          'hidden': this.isMinSpeedHidden,
        }}
        style={{
          'transform': this.minSpeedTransform,
        }}
      />
      <div
        class={{
          'speed-bug-container': true,
          'hidden': this.speedInvalid,
        }}
      >
        {
          this.bugs.map(
            (bug) => <div
              class={{
                'speed-bug': true,
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
