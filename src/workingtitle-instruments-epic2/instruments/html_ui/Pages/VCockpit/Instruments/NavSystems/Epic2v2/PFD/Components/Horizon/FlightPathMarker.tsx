import {
  AdcEvents, BitFlags, ConsumerSubject, EventBus, ExpSmoother, FSComponent, GNSSEvents, HorizonLayer, HorizonLayerProps, HorizonProjection,
  HorizonProjectionChangeType, MappedSubject, MathUtils, MutableSubscribable, ObjectSubject, ReadonlyFloat64Array, Subscribable, Subscription, UnitType,
  Vec2Math, Vec2Subject, VNode
} from '@microsoft/msfs-sdk';

import { AirspeedDataProvider } from '@microsoft/msfs-epic2-shared';

import { FlightPathAccelerationChevron } from './FlightPathAccelerationChevron';
import { FlightPathSpeedError } from './FlightPathSpeedError';

import './FlightPathMarker.css';

/**
 * Component props for FlightPathMarker.
 */
export interface FlightPathMarkerProps extends HorizonLayerProps {
  /** The event bus. */
  bus: EventBus;

  /** The airspeed data provider to use. */
  airspeedDataProvider: AirspeedDataProvider;

  /** Whether to show the flight path marker. */
  show: Subscribable<boolean>;

  /** The minimum ground speed, in knots, required for the flight path marker to be displayed. Defaults to 30 knots. */
  minGroundSpeed?: number;

  /** The lookahead time of the flight path marker, in seconds. Defaults to 60 seconds. */
  lookahead?: number;

  /** The smoothing time constant for ground track and ground speed, in milliseconds. Defaults to `500 / ln(2)`. */
  smoothingTimeConstant?: number;

  /** Whether to show the primary (green) marker, or else the secondary (grey) is shown. */
  showPrimary: Subscribable<boolean>;

  /** Whether to show the centre dot in primary mode. */
  hideCentreDot: Subscribable<boolean>;

  /**
   * A mutable subscribable to which to write the displayed position of the flight path vector, as `[x, y]` in pixels
   * using the horizon projection's projected coordinate system. If the flight path vector is not displayed, its
   * position will be written as `[NaN, NaN]`.
   */
  displayedPosition?: MutableSubscribable<any, ReadonlyFloat64Array>;

  /** Whether the PFD is being decluttered */
  declutter: Subscribable<boolean>;
}

// FIXME Unusal attitude: the primary symbol should turn "green/yellow" when the pitch scale is compressed
// (i.e. it no longer corresponds to the SVS terrain)

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

  private readonly isPrimaryMarkerHidden = MappedSubject.create(
    ([isFpmVisible, isPrimaryVisible]) => !isFpmVisible || !isPrimaryVisible,
    this.props.show,
    this.props.showPrimary,
  );

  private readonly isSecondaryMarkerHidden = MappedSubject.create(
    ([isFpmVisible, isPrimaryVisible]) => !isFpmVisible || isPrimaryVisible,
    this.props.show,
    this.props.showPrimary,
  );

  private readonly isAboveMinGs = this.gs.map((v) => v >= this.minGs);

  private readonly gsSmoother = new ExpSmoother(this.smoothingTimeConstant);

  private readonly projectedPosition = Vec2Subject.create(Vec2Math.create());

  private displayedPositionPipe?: Subscription;

  private needUpdate = false;

  /** @inheritdoc */
  protected onVisibilityChanged(isVisible: boolean): void {
    if (isVisible) {
      this.style.set('display', '');
    } else {
      this.style.set('display', 'none');
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

    this.props.show.sub(show => { this.setVisible(show); }, true);

    this.gs.sub(() => { this.needUpdate = true; });
    this.track.sub(() => { this.needUpdate = true; });
    this.vs.sub(() => { this.needUpdate = true; });

    this.projectedPosition.sub(position => {
      this.style.set('transform', `translate(-50%, -50%) translate3d(${position[0]}px, ${position[1]}px, 0)`);
    });

    this.isAboveMinGs.sub((v) => {
      if (v) {
        this.needUpdate = true;
      } else {
        this.gsSmoother.reset();
        // FPS is centred unless we're going fast enough to compute it
        this.projectedPosition.set(this.props.projection.getOffsetCenterProjected());
      }
    }, true);

    if (this.props.displayedPosition !== undefined) {
      this.projectedPosition.pipe(this.props.displayedPosition);
    }

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
    if (!this.needUpdate || !this.isVisible() || !this.isAboveMinGs.get()) {
      return;
    }

    const smoothedGs = this.gsSmoother.next(this.gs.get(), elapsed);

    const distance = UnitType.KNOT.convertTo(smoothedGs, UnitType.MPS) * this.lookahead;
    const height = UnitType.FPM.convertTo(this.vs.get(), UnitType.MPS) * this.lookahead; // no need to smooth VS since the data we get is already effectively smoothed

    // the projection is track oriented in the epic2.
    const track = this.props.projection.getHeading();

    const projected = this.props.projection.projectRelativeSpherical(track, distance, height, FlightPathMarker.vec2Cache[0]);

    this.projectedPosition.set(MathUtils.round(projected[0], 0.1), MathUtils.round(projected[1], 0.1));
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
      <div class={{ 'flight-path-marker': true, 'hidden': this.props.declutter }} style={this.style}>
        <svg class={{ 'hidden': this.isSecondaryMarkerHidden, 'flight-path-marker-secondary': true }} viewBox='-33 -11 66 22'>
          <path
            d='M -9 0 a 9 9 0 1 0 18 0 m 22 0 l -22 0 a 9 9 0 1 0 -18 0 l -22 0'
            stroke='var(--flight-path-marker-secondary-outline-stroke)' stroke-width='var(--flight-path-marker-secondary-outline-stroke-width)' fill='none'
          />
          <path
            d='M -9 0 a 9 9 0 1 0 18 0 m 22 0 l -22 0 a 9 9 0 1 0 -18 0 l -22 0'
            stroke='var(--flight-path-marker-secondary-stroke)' stroke-width='var(--flight-path-marker-secondary-stroke-width)' fill='none'
          />
        </svg>
        <FlightPathSpeedError airspeedDataProvider={this.props.airspeedDataProvider} isHidden={this.isPrimaryMarkerHidden} />
        <svg class={{ 'hidden': this.isPrimaryMarkerHidden, 'flight-path-marker-primary': true }} viewBox='-60 -30 120 60'>
          <path
            d='M -57 0 l 42 0 a 1 1 0 0 0 30 0 a 1 1 0 0 0 -30 0 m 30 0 l 42 0'
            stroke='var(--flight-path-marker-primary-outline-stroke)' stroke-width='var(--flight-path-marker-primary-outline-stroke-width)' fill='none'
          />
          <path
            d='M -57 0 l 42 0 a 1 1 0 0 0 30 0 a 1 1 0 0 0 -30 0 m 30 0 l 42 0'
            stroke='var(--flight-path-marker-primary-stroke)' stroke-width='var(--flight-path-marker-primary-stroke-width)' fill='none'
          />
          <g class={{ 'hidden': this.props.hideCentreDot }}>
            <circle r='5.5' fill='var(--flight-path-marker-primary-outline-stroke)' stroke='none' />
            <circle r='5' fill='var(--flight-path-marker-primary-stroke)' stroke='none' />
          </g>
        </svg>
        <FlightPathAccelerationChevron airspeedDataProvider={this.props.airspeedDataProvider} isHidden={this.isPrimaryMarkerHidden} />
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.displayedPositionPipe?.destroy();
    this.gs.destroy();
    this.track.destroy();
    this.vs.destroy();
  }
}
