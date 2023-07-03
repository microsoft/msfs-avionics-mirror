import { ConsumerValue } from '../../data/ConsumerValue';
import { EventBus } from '../../data/EventBus';
import { NavMath } from '../../geo/NavMath';
import { GNSSEvents, GNSSPublisher } from '../../instruments/GNSS';
import { MathUtils } from '../../math/MathUtils';
import { APValues } from '../APConfig';
import { DirectorState, PlaneDirector } from './PlaneDirector';

/**
 * Options for {@link APTrkDirector}.
 */
export type APTrkDirectorOptions = {
  /**
   * The maximum bank angle, in degrees, supported by the director, or a function which returns it. If not defined,
   * the director will use the maximum bank angle defined by its parent autopilot (via `apValues`). Defaults to
   * `undefined`.
   */
  maxBankAngle?: number | (() => number) | undefined;

  /**
   * The bank rate to enforce when the director commands changes in bank angle, in degrees per second, or a function
   * which returns it. If not undefined, a default bank rate will be used. Defaults to `undefined`.
   */
  bankRate?: number | (() => number) | undefined;

  /**
   * The threshold difference between selected track and current track, in degrees, at which the director unlocks its
   * commanded turn direction and chooses a new optimal turn direction to establish on the selected track, potentially
   * resulting in a turn reversal. Any value less than or equal to 180 degrees effectively prevents the director from
   * locking a commanded turn direction. Any value greater than or equal to 360 degrees will require the selected track
   * to traverse past the current track in the desired turn direction in order for the director to issue a turn
   * reversal. Defaults to `0`.
   */
  turnReversalThreshold?: number;

  /**
   * Whether the director is to be used as a TO/GA lateral mode. If `true`, the director will not control the
   * `AUTOPILOT HEADING LOCK` simvar. Defaults to `false`.
   */
  isToGaMode?: boolean;
};

/**
 * A heading autopilot director.
 */
export class APTrkDirector implements PlaneDirector {
  public state: DirectorState;

  /** @inheritdoc */
  public onActivate?: () => void;

  /** @inheritdoc */
  public onArm?: () => void;

  /** @inheritdoc */
  public driveBank?: (bank: number, rate?: number) => void;

  private toGaTrack = 0;

  private readonly magVar = ConsumerValue.create(null, 0);

  private lastTrackDiff: number | undefined = undefined;
  private readonly turnReversalThreshold: number;
  private lockedTurnDirection: 'left' | 'right' | undefined = undefined;

  private readonly maxBankAngleFunc: () => number;
  private readonly driveBankFunc: (bank: number) => void;

  private readonly isToGaMode: boolean;

  /**
   * Creates a new instance of APHdgDirector.
   * @param bus The event bus to use with this instance.
   * @param apValues Autopilot values from this director's parent autopilot.
   * @param options Options to configure the new director.
   */
  constructor(
    private readonly bus: EventBus,
    private readonly apValues: APValues,
    options?: Readonly<APTrkDirectorOptions>
  ) {
    const maxBankAngleOpt = options?.maxBankAngle ?? undefined;
    switch (typeof maxBankAngleOpt) {
      case 'number':
        this.maxBankAngleFunc = () => maxBankAngleOpt;
        break;
      case 'function':
        this.maxBankAngleFunc = maxBankAngleOpt;
        break;
      default:
        this.maxBankAngleFunc = this.apValues.maxBankAngle.get.bind(this.apValues.maxBankAngle);
    }

    const bankRateOpt = options?.bankRate;
    switch (typeof bankRateOpt) {
      case 'number':
        this.driveBankFunc = bank => {
          if (isFinite(bank) && this.driveBank) {
            this.driveBank(bank, bankRateOpt * this.apValues.simRate.get());
          }
        };
        break;
      case 'function':
        this.driveBankFunc = bank => {
          if (isFinite(bank) && this.driveBank) {
            this.driveBank(bank, bankRateOpt() * this.apValues.simRate.get());
          }
        };
        break;
      default:
        this.driveBankFunc = bank => {
          if (isFinite(bank) && this.driveBank) {
            this.driveBank(bank);
          }
        };
    }

    this.turnReversalThreshold = options?.turnReversalThreshold ?? 0;

    this.isToGaMode = options?.isToGaMode ?? false;

    this.state = DirectorState.Inactive;

    this.magVar.setConsumer(this.bus.getSubscriber<GNSSEvents>().on('magvar'));

    this.pauseSubs();
  }

  /** Resumes Subscriptions. */
  private resumeSubs(): void {
    this.magVar.resume();
  }

  /** Pauses Subscriptions. */
  private pauseSubs(): void {
    this.magVar.pause();
  }

  /**
   * Activates this director.
   */
  public activate(): void {
    this.resumeSubs();
    if (this.onActivate !== undefined) {
      this.onActivate();
    }
    if (!this.isToGaMode) {
      SimVar.SetSimVarValue('AUTOPILOT HEADING LOCK', 'Bool', true);
    } else {
      this.toGaTrack = this.getMagneticTrack();
    }

    this.state = DirectorState.Active;
  }

  /**
   * Arms this director.
   * This director has no armed mode, so it activates immediately.
   */
  public arm(): void {
    if (this.state == DirectorState.Inactive) {
      this.activate();
    }
  }

  /**
   * Deactivates this director.
   */
  public async deactivate(): Promise<void> {
    if (!this.isToGaMode) { await SimVar.SetSimVarValue('AUTOPILOT HEADING LOCK', 'Bool', false); }
    this.state = DirectorState.Inactive;
    this.pauseSubs();
  }

  /**
   * Updates this director.
   */
  public update(): void {
    if (this.state === DirectorState.Active) {
      let bank = 0;
      if (this.isToGaMode) {
        if (Simplane.getIsGrounded()) {
          this.toGaTrack = this.getMagneticTrack();
        } else {
          bank = this.desiredBank(this.toGaTrack);
        }
      } else {
        bank = this.desiredBank(this.apValues.selectedHeading.get());
      }

      this.driveBankFunc(bank);
    }
  }

  /**
   * Gets a desired bank from a Target Selected Track.
   * @param targetTrack The target track.
   * @returns The desired bank angle.
   */
  private desiredBank(targetTrack: number): number {
    const currentTrack = this.getMagneticTrack();
    const trackDiff = MathUtils.diffAngleDeg(currentTrack, targetTrack);

    let turnDirection: 'left' | 'right' | undefined = undefined;
    let directionalTrackDiff: number;

    if (this.lockedTurnDirection !== undefined) {
      turnDirection = this.lockedTurnDirection;
      directionalTrackDiff = turnDirection === 'left' ? (360 - trackDiff) % 360 : trackDiff;

      if (directionalTrackDiff >= this.turnReversalThreshold) {
        turnDirection = undefined;
      } else if (this.lastTrackDiff !== undefined) {
        // Check if the track difference passed through zero in the positive to negative direction since the last
        // update. If so, we may need to issue a turn reversal.
        const trackDiffDelta = (MathUtils.diffAngleDeg(this.lastTrackDiff, directionalTrackDiff) + 180) % 360 - 180; // -180 to +180
        if (this.lastTrackDiff + trackDiffDelta < 0) {
          turnDirection = undefined;
        }
      }
    }

    if (turnDirection === undefined) {
      turnDirection = NavMath.getTurnDirection(currentTrack, targetTrack);
      directionalTrackDiff = turnDirection === 'left' ? (360 - trackDiff) % 360 : trackDiff;
    }

    if (this.turnReversalThreshold > 180) {
      this.lockedTurnDirection = turnDirection;
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.lastTrackDiff = directionalTrackDiff!;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    let baseBank = Math.min(1.25 * directionalTrackDiff!, this.maxBankAngleFunc());
    baseBank *= (turnDirection === 'left' ? 1 : -1);

    return baseBank;
  }

  /**
   * Gets the instantanious magnetic track.
   * @returns Magnetic Track, in degrees.
   */
  private getMagneticTrack(): number {
    const trueTrack = GNSSPublisher.getInstantaneousTrack();
    return NavMath.normalizeHeading(trueTrack - this.magVar.get());
  }
}