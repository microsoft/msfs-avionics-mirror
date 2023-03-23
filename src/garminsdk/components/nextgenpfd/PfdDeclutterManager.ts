import { ClockEvents, ConsumerSubject, EventBus, Subject, Subscribable, SubscribableUtils, Subscription } from '@microsoft/msfs-sdk';
import { AhrsSystemEvents } from '../../system/AhrsSystem';

/**
 * A manager for the PFD declutter feature. Keeps track of whether the PFD should be decluttered due to unusual
 * airplane attitudes and exposes that information as a subscribable through the `declutter` property.
 */
export class PfdDeclutterManager {
  private readonly _declutter = Subject.create(false);
  /** Whether the PFD should be decluttered. */
  public readonly declutter = this._declutter as Subscribable<boolean>;

  private readonly ahrsIndex: Subscribable<number>;

  private readonly pitchUpThreshold: Subscribable<number>;
  private readonly pitchDownThreshold: Subscribable<number>;
  private readonly rollThreshold: Subscribable<number>;
  private readonly pitchUpHysteresis: Subscribable<number>;
  private readonly pitchDownHysteresis: Subscribable<number>;
  private readonly rollHysteresis: Subscribable<number>;

  private readonly pitch = ConsumerSubject.create(null, 0);
  private readonly roll = ConsumerSubject.create(null, 0);
  private readonly isAttitudeDataValid = ConsumerSubject.create(null, true);

  private isPitchUpOob = false;
  private isPitchDownOob = false;
  private isRollOob = false;

  private isAlive = true;
  private isInit = false;

  private clockSub?: Subscription;
  private ahrsIndexSub?: Subscription;

  /**
   * Constructor.
   * @param bus The event bus.
   * @param ahrsIndex The index of the AHRS that is the source of the attitude data used by this manager.
   * @param pitchUpThreshold The pitch up threshold for declutter, in degrees. Defaults to 30 degrees.
   * @param pitchDownThreshold The pitch down threshold for declutter, in degrees. Defaults to -20 degrees.
   * @param rollThreshold The roll threshold for declutter, in degrees, in either direction. Defaults to 65 degrees.
   * @param pitchUpHysteresis The hysteresis to apply for the pitch up threshold, in degrees. Defaults to 5 degrees.
   * @param pitchDownHysteresis The hysteresis to apply for the pitch down threshold, in degrees. Defaults to 5
   * degrees.
   * @param rollHysteresis The hysteresis to apply for the roll threshold, in degrees. Defaults to 5 degrees.
   */
  public constructor(
    private readonly bus: EventBus,
    ahrsIndex: number | Subscribable<number>,
    pitchUpThreshold: number | Subscribable<number> = 30,
    pitchDownThreshold: number | Subscribable<number> = -20,
    rollThreshold: number | Subscribable<number> = 65,
    pitchUpHysteresis: number | Subscribable<number> = 5,
    pitchDownHysteresis: number | Subscribable<number> = 5,
    rollHysteresis: number | Subscribable<number> = 5
  ) {
    this.ahrsIndex = SubscribableUtils.toSubscribable(ahrsIndex, true);
    this.pitchUpThreshold = SubscribableUtils.toSubscribable(pitchUpThreshold, true);
    this.pitchDownThreshold = SubscribableUtils.toSubscribable(pitchDownThreshold, true);
    this.rollThreshold = SubscribableUtils.toSubscribable(rollThreshold, true);
    this.pitchUpHysteresis = SubscribableUtils.toSubscribable(pitchUpHysteresis, true);
    this.pitchDownHysteresis = SubscribableUtils.toSubscribable(pitchDownHysteresis, true);
    this.rollHysteresis = SubscribableUtils.toSubscribable(rollHysteresis, true);
  }

  /**
   * Initializes this manager. Once initialized, this manager will automatically keep track of whether the PFD should
   * be decluttered until it is destroyed.
   * @throws Error if this manager has been destroyed.
   */
  public init(): void {
    if (!this.isAlive) {
      throw new Error('PfdDeclutterManager: cannot initialize a dead manager');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    const sub = this.bus.getSubscriber<ClockEvents & AhrsSystemEvents>();

    this.ahrsIndexSub = this.ahrsIndex.sub(index => {
      this.pitch.setConsumer(sub.on(`ahrs_pitch_deg_${index}`));
      this.roll.setConsumer(sub.on(`ahrs_roll_deg_${index}`));
      this.isAttitudeDataValid.setConsumer(sub.on(`ahrs_attitude_data_valid_${index}`));
    }, true);

    this.clockSub = sub.on('realTime').handle(this.update.bind(this));
  }

  /**
   * Updates this manager.
   */
  private update(): void {
    if (this.isAttitudeDataValid.get()) {
      const pitch = -this.pitch.get();
      const roll = Math.abs(this.roll.get());

      const pitchUpThreshold = this.pitchUpThreshold.get() - (this.isPitchUpOob ? this.pitchUpHysteresis.get() : 0);
      const pitchDownThreshold = this.pitchDownThreshold.get() + (this.isPitchDownOob ? this.pitchDownHysteresis.get() : 0);
      const rollThreshold = this.rollThreshold.get() - (this.isRollOob ? this.rollHysteresis.get() : 0);

      this.isPitchUpOob = pitch > pitchUpThreshold;
      this.isPitchDownOob = pitch < pitchDownThreshold;
      this.isRollOob = roll > rollThreshold;

      this._declutter.set(this.isPitchUpOob || this.isPitchDownOob || this.isRollOob);
    } else {
      this.isPitchUpOob = false;
      this.isPitchDownOob = false;
      this.isRollOob = false;
      this._declutter.set(false);
    }
  }

  /**
   * Destroys this manager.
   */
  public destroy(): void {
    this.isAlive = false;

    this.pitch.destroy();
    this.roll.destroy();
    this.isAttitudeDataValid.destroy();

    this.clockSub?.destroy();
    this.ahrsIndexSub?.destroy();
  }
}