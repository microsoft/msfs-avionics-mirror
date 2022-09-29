import {
  APEvents, BitFlags, ConsumerSubject, EventBus, FSComponent, HorizonLayer, HorizonLayerProps, HorizonProjection, HorizonProjectionChangeType, LinearServo,
  MappedSubject, MathUtils, ObjectSubject, SimpleMovingAverage, Subscribable, Vec2Math, Vec2Subject, VNode
} from 'msfssdk';

import { GarminControlEvents } from '../../../instruments/GarminControlEvents';
import { AhrsSystemEvents } from '../../../system/AhrsSystem';

/**
 * The properties for the flight director component.
 */
export interface FlightDirectorProps extends HorizonLayerProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** Whether to show the flight director. */
  show: Subscribable<boolean>;

  /** The maximum relative pitch, in degrees, displayed by the flight director. */
  maxPitch: number;
}

/**
 * A PFD flight director.
 */
export class FlightDirector extends HorizonLayer<FlightDirectorProps> {
  private readonly style = ObjectSubject.create({
    display: '',
    transform: 'translate3d(0, 0, 0)'
  });

  private readonly isFdActive = ConsumerSubject.create(null, false);
  private readonly fdPitch = ConsumerSubject.create(null, 0);
  private readonly fdBank = ConsumerSubject.create(null, 0);

  private readonly isVisibleSubject = MappedSubject.create(
    ([show, isFdActive]): boolean => show && isFdActive,
    this.props.show,
    this.isFdActive
  );

  private readonly bankServo = new LinearServo(5);
  private readonly pitchAverage = new SimpleMovingAverage(20);

  private readonly pitchBank = Vec2Subject.create(Vec2Math.create());

  private fdServoBank = 0;

  private needUpdate = false;

  /** @inheritdoc */
  protected onVisibilityChanged(isVisible: boolean): void {
    if (isVisible) {
      this.style.set('display', '');

      this.fdPitch.resume();
      this.fdBank.resume();

      this.needUpdate = true;
    } else {
      this.style.set('display', 'none');

      this.fdPitch.pause();
      this.fdBank.pause();
    }
  }

  /**
   * A callback called after the component renders.
   */
  public onAttached(): void {
    super.onAttached();

    const sub = this.props.bus.getSubscriber<APEvents & AhrsSystemEvents & GarminControlEvents>();

    const updateHandler = (): void => { this.needUpdate = true; };

    this.fdPitch.setConsumer(sub.on('flight_director_pitch').withPrecision(2)).sub(updateHandler);
    this.fdBank.setConsumer(sub.on('flight_director_bank').withPrecision(2)).sub(updateHandler);

    this.isFdActive.setConsumer(sub.on('flight_director_is_active_1'));

    this.pitchBank.sub(([pitch, bank]) => {
      this.style.set('transform', `translate3d(0px, ${pitch}px, 0px) rotate(${bank}deg)`);
    });

    this.isVisibleSubject.sub(isVisible => {
      this.setVisible(isVisible);
    }, true);

    const notInstalledSub = sub.on('fd_not_installed').handle(value => {
      if (value) {
        notInstalledSub.destroy();
        this.fdPitch.setConsumer(null);
        this.fdBank.setConsumer(null);
        this.isFdActive.setConsumer(null);

        this.needUpdate = false;
        this.setVisible(false);
      }
    }, true);

    notInstalledSub.resume(true);
  }

  /** @inheritdoc */
  public onProjectionChanged(projection: HorizonProjection, changeFlags: number): void {
    if (BitFlags.isAny(
      changeFlags,
      HorizonProjectionChangeType.ScaleFactor
      | HorizonProjectionChangeType.Fov
      | HorizonProjectionChangeType.Pitch
      | HorizonProjectionChangeType.Roll
    )) {
      this.needUpdate = true;
    }
  }

  /** @inheritdoc */
  public onUpdated(): void {
    if (!this.needUpdate || !this.isVisible()) {
      return;
    }

    const pitchResolution = this.props.projection.getScaleFactor() / this.props.projection.getFov();

    const pitch = this.props.projection.getPitch();
    const roll = this.props.projection.getRoll();

    const fdRawPitch = this.fdPitch.get();
    const fdRawBank = this.fdBank.get();

    const averagedFdPitch = this.pitchAverage.getAverage(fdRawPitch);
    const correctedFdPitch = MathUtils.clamp(-averagedFdPitch - pitch, -this.props.maxPitch, this.props.maxPitch); // FD pitch

    this.fdServoBank = this.bankServo.drive(this.fdServoBank, fdRawBank);
    const correctedFdBank = this.fdServoBank + roll;

    this.pitchBank.set(MathUtils.round(-correctedFdPitch * pitchResolution, 0.1), MathUtils.round(-correctedFdBank, 0.1));

    this.needUpdate = false;
  }

  /** @inheritdoc */
  public onDetached(): void {
    super.onDetached();

    this.destroy();
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <svg viewBox='0 0 414 315' class='flight-director-container' style={this.style}>
        <path
          d='M 207 204 l -120 30 l -14 -9 l 134 -22 z'
          fill='var(--flight-director-fill)' stroke='var(--flight-director-stroke)' stroke-width='var(--flight-director-stroke-width)'
        />
        <path
          d='M 73 225 l 0 9 l 14 0 z'
          fill='var(--flight-director-fill)' stroke='var(--flight-director-stroke)' stroke-width='var(--flight-director-stroke-width)'
        />
        <path
          d='M 207 204 l 120 30 l 14 -9 l -134 -22 z'
          fill='var(--flight-director-fill)' stroke='var(--flight-director-stroke)' stroke-width='var(--flight-director-stroke-width)'
        />
        <path
          d='M 341 225 l 0 9 l -14 0 z'
          fill='var(--flight-director-fill)' stroke='var(--flight-director-stroke)' stroke-width='var(--flight-director-stroke-width)'
        />
      </svg>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.isFdActive.destroy();
    this.fdPitch.destroy();
    this.fdBank.destroy();
  }
}
