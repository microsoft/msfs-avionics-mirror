import {
  AdcEvents, BitFlags, ConsumerSubject, EventBus, ExpSmoother, FSComponent, GNSSEvents, HorizonLayer, HorizonLayerProps, HorizonProjection,
  HorizonProjectionChangeType, MappedSubject, MathUtils, ObjectSubject, Subscribable, UnitType, Vec2Math, Vec2Subject, VNode
} from '@microsoft/msfs-sdk';

/**
 * Component props for FlightPathMarker.
 */
export interface FlightPathMarkerProps extends HorizonLayerProps {
  /** The event bus. */
  bus: EventBus;

  /** Whether to show the flight path marker. */
  show: Subscribable<boolean>;

  /** The minimum ground speed, in knots, required for the flight path marker to be displayed. Defaults to 30 knots. */
  minGroundSpeed?: number;

  /** The lookahead time of the flight path marker, in seconds. Defaults to 60 seconds. */
  lookahead?: number;

  /** The smoothing time constant for ground track and ground speed, in milliseconds. Defaults to `500 / ln(2)`. */
  smoothingTimeConstant?: number;
}

/**
 * A PFD synthetic vision technology (SVT) flight path marker. Displays an icon depicting the estimated position of the
 * airplane projected forward in time given the airplane's current horizontal and vertical speed and track.
 */
export class FlightPathMarker extends HorizonLayer<FlightPathMarkerProps> {
  private static readonly DEFAULT_MIN_GS = 30; // knots
  private static readonly DEFAULT_LOOKAHEAD = 60; // seconds
  private static readonly DEFAULT_SMOOTHING_TIME_CONSTANT = 500 / Math.LN2; // milliseconds

  private static readonly vec2Cache = [Vec2Math.create()];

  private readonly style = ObjectSubject.create({
    position: 'absolute',
    left: 0,
    top: 0,
    display: '',
    transform: 'translate(-50%, -50%) translate3d(0, 0, 0)'
  });

  private readonly minGs = this.props.minGroundSpeed ?? FlightPathMarker.DEFAULT_MIN_GS;
  private readonly lookahead = this.props.lookahead ?? FlightPathMarker.DEFAULT_LOOKAHEAD;
  private readonly smoothingTimeConstant = this.props.smoothingTimeConstant ?? FlightPathMarker.DEFAULT_SMOOTHING_TIME_CONSTANT;

  private readonly gs = ConsumerSubject.create(null, 0);
  private readonly track = ConsumerSubject.create(null, 0);
  private readonly vs = ConsumerSubject.create(null, 0);

  private readonly isFpmVisible = MappedSubject.create(
    ([show, gs]): boolean => {
      return show && gs >= this.minGs;
    },
    this.props.show,
    this.gs
  );

  private readonly groundTrackSmoother = new ExpSmoother(this.smoothingTimeConstant);
  private readonly gsSmoother = new ExpSmoother(this.smoothingTimeConstant);

  private readonly projectedPosition = Vec2Subject.createFromVector(Vec2Math.create());

  private needUpdate = false;

  /** @inheritdoc */
  protected onVisibilityChanged(isVisible: boolean): void {
    if (isVisible) {
      this.style.set('display', '');
    } else {
      this.style.set('display', 'none');
      this.groundTrackSmoother.reset();
      this.gsSmoother.reset();
    }
  }

  /** @inheritdoc */
  public onAttached(): void {
    super.onAttached();

    const sub = this.props.bus.getSubscriber<AdcEvents & GNSSEvents>();

    this.gs.setConsumer(sub.on('ground_speed'));
    this.track.setConsumer(sub.on('track_deg_true'));
    this.vs.setConsumer(sub.on('vertical_speed'));

    this.isFpmVisible.sub(show => { this.setVisible(show); }, true);

    this.gs.sub(() => { this.needUpdate = true; });
    this.track.sub(() => { this.needUpdate = true; });
    this.vs.sub(() => { this.needUpdate = true; });

    this.projectedPosition.sub(position => {
      this.style.set('transform', `translate(-50%, -50%) translate3d(${position[0]}px, ${position[1]}px, 0)`);
    });

    this.needUpdate = true;
  }

  /** @inheritdoc */
  public onProjectionChanged(projection: HorizonProjection, changeFlags: number): void {
    if (BitFlags.isAny(
      changeFlags,
      HorizonProjectionChangeType.Fov
      | HorizonProjectionChangeType.ScaleFactor
      | HorizonProjectionChangeType.Offset
      | HorizonProjectionChangeType.ProjectedOffset
      | HorizonProjectionChangeType.Heading
      | HorizonProjectionChangeType.Pitch
      | HorizonProjectionChangeType.Roll
    )) {
      this.needUpdate = true;
    }
  }

  /** @inheritdoc */
  public onUpdated(time: number, elapsed: number): void {
    if (!this.needUpdate || !this.isVisible()) {
      return;
    }

    const smoothedGs = this.gsSmoother.next(this.gs.get(), elapsed);
    const smoothedTrack = this.smoothGroundTrack(this.track.get(), elapsed);

    const distance = UnitType.KNOT.convertTo(smoothedGs, UnitType.MPS) * this.lookahead;
    const height = UnitType.FPM.convertTo(this.vs.get(), UnitType.MPS) * this.lookahead; // no need to smooth VS since the data we get is already effectively smoothed

    const projected = this.props.projection.projectRelativeSpherical(smoothedTrack, distance, height, FlightPathMarker.vec2Cache[0]);

    this.projectedPosition.set(MathUtils.round(projected[0], 0.1), MathUtils.round(projected[1], 0.1));
  }

  /**
   * Smooths a ground track value.
   * @param track A ground track value.
   * @param dt The elapsed time, in milliseconds, since the last smoothed value was calculated.
   * @returns A smoothed ground track value.
   */
  private smoothGroundTrack(track: number, dt: number): number {
    const last = this.groundTrackSmoother.last();

    if (last !== null && !isNaN(last)) {
      // need to handle wraparounds
      let delta = track - last;
      if (delta > 180) {
        delta = delta - 360;
      } else if (delta < -180) {
        delta = delta + 360;
      }
      track = last + delta;
    }

    const next = last !== null && isNaN(last) ? this.groundTrackSmoother.reset(track) : this.groundTrackSmoother.next(track, dt);
    const normalized = (next + 360) % 360; // enforce range 0-359
    return this.groundTrackSmoother.reset(normalized);
  }

  /** @inheritdoc */
  public onDetached(): void {
    super.onDetached();

    this.destroy();
  }

  /**
   * Renders the component.
   * @returns The component VNode.
   */
  public render(): VNode {
    return (
      <svg viewBox='-30 -30 60 60' class='flight-path-marker' style={this.style}>
        <path
          d='M -14 0 a 14 14 0 1 0 28 0 m 16 0 l -16 0 a 14 14 0 1 0 -28 0 l -16 0 m 30 -14 l 0 -12'
          stroke='var(--flight-path-marker-outline-stroke)' stroke-width='var(--flight-path-marker-outline-stroke-width)' fill='none'
        />
        <path
          d='M -14 0 a 14 14 0 1 0 28 0 m 14 0 l -14 0 a 14 14 0 1 0 -28 0 l -14 0 m 28 -14 l 0 -10'
          stroke='var(--flight-path-marker-stroke)' stroke-width='var(--flight-path-marker-stroke-width)' fill='none'
        />
      </svg>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.isFpmVisible.destroy();
    this.gs.destroy();
    this.track.destroy();
    this.vs.destroy();
  }
}