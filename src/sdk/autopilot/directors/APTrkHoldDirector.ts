import { ConsumerValue } from '../../data/ConsumerValue';
import { EventBus } from '../../data/EventBus';
import { SimVarValueType } from '../../data/SimVars';
import { NavMath } from '../../geo/NavMath';
import { GNSSEvents, GNSSPublisher } from '../../instruments/GNSS';
import { APValues } from '../APValues';
import { DirectorState, PlaneDirector } from './PlaneDirector';

/**
 * Options for {@link APTrkHoldDirector}.
 */
export type APTrkHoldDirectorOptions = {
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
};

/**
 * An autopilot track hold director.
 * Levels the wings upon activation, and then holds the captured track
 */
export class APTrkHoldDirector implements PlaneDirector {
  /** bank angle below which we capture the track */
  private static readonly MIN_BANK_THRESHOLD = 1;

  public state: DirectorState;

  /** @inheritdoc */
  public onActivate?: () => void;

  /** @inheritdoc */
  public onArm?: () => void;

  /** @inheritdoc */
  public driveBank?: (bank: number, rate?: number) => void;

  private readonly magVar = ConsumerValue.create(null, 0);

  private readonly maxBankAngleFunc: () => number;
  private readonly driveBankFunc: (bank: number) => void;

  /** track captured at wings level, or null if not yet captured */
  private capturedTrack: number | null = null;

  /**
   * Creates an instance of the track hold director.
   * @param bus The event bus to use with this instance.
   * @param apValues Autopilot values from this director's parent autopilot.
   * @param options Options to configure the new director. Option values default to the following if not defined:
   * * `maxBankAngle`: `undefined`
   * * `isToGaMode`: `false`
   */
  constructor(
    private readonly bus: EventBus,
    private readonly apValues: APValues,
    options?: Readonly<APTrkHoldDirectorOptions>
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
    this.state = DirectorState.Active;

    this.capturedTrack = null;
    if (this.onActivate !== undefined) {
      this.onActivate();
    }
    SimVar.SetSimVarValue('AUTOPILOT HEADING LOCK', 'Bool', true);
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
  public deactivate(): void {
    this.state = DirectorState.Inactive;
    SimVar.SetSimVarValue('AUTOPILOT HEADING LOCK', 'Bool', false);

    this.pauseSubs();
  }

  /**
   * Updates this director.
   */
  public update(): void {
    if (this.state === DirectorState.Active) {
      if (this.capturedTrack === null) {
        const currentBank = SimVar.GetSimVarValue('PLANE BANK DEGREES', SimVarValueType.Degree);
        if (Math.abs(currentBank) < APTrkHoldDirector.MIN_BANK_THRESHOLD) {
          this.capturedTrack = this.getMagneticTrack();
        }
      }

      this.driveBankFunc(this.capturedTrack !== null ? this.desiredBank(this.capturedTrack) : 0);
    }
  }

  /**
   * Gets a desired bank from a Target Selected Track.
   * @param targetTrack The target track.
   * @returns The desired bank angle.
   */
  private desiredBank(targetTrack: number): number {
    const magneticTrack = this.getMagneticTrack();

    const turnDirection = NavMath.getTurnDirection(magneticTrack, targetTrack);
    const trackDiff = Math.abs(NavMath.diffAngle(magneticTrack, targetTrack));

    let baseBank = Math.min(1.25 * trackDiff, this.maxBankAngleFunc());
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