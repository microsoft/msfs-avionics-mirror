import { EventBus } from '../../data/EventBus';
import { NavMath } from '../../geo/NavMath';
import { AhrsEvents } from '../../instruments/Ahrs';
import { Subscription } from '../../sub/Subscription';
import { APValues } from '../APConfig';
import { DirectorState, PlaneDirector } from './PlaneDirector';

/**
 * Options for {@link APHdgHoldDirector}.
 */
export type APHdgHoldDirectorOptions = {
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
 * An autopilot heading hold director.
 * Levels the wings upon activation, and then holds the captured heading
 */
export class APHdgHoldDirector implements PlaneDirector {
  /** bank angle below which we capture the heading */
  private static readonly MIN_BANK_THRESHOLD = 1;

  public state: DirectorState;

  /** @inheritdoc */
  public onActivate?: () => void;

  /** @inheritdoc */
  public onArm?: () => void;

  /** @inheritdoc */
  public driveBank?: (bank: number, rate?: number) => void;

  private currentHeading = 0;
  private currentBank = 0;

  private readonly currentBankSub: Subscription;
  private readonly currentHeadingSub: Subscription;

  private readonly maxBankAngleFunc: () => number;
  private readonly driveBankFunc: (bank: number) => void;

  /** heading captured at wings level, or null if not yet captured */
  private capturedHeading: number | null = null;

  /**
   * Creates an instance of the heading hold director.
   * @param bus The event bus to use with this instance.
   * @param apValues Autopilot values from this director's parent autopilot.
   * @param options Options to configure the new director.
   */
  constructor(
    bus: EventBus,
    private readonly apValues: APValues,
    options?: Readonly<APHdgHoldDirectorOptions>
  ) {
    this.currentBankSub = bus.getSubscriber<AhrsEvents>().on('roll_deg').withPrecision(1).handle((bank) => this.currentBank = bank);
    this.currentHeadingSub = bus.getSubscriber<AhrsEvents>().on('hdg_deg').withPrecision(0).handle((h) => this.currentHeading = h);

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

    this.pauseSubs();
  }
  onDeactivate?: (() => void) | undefined;
  setPitch?: ((pitch: number) => void) | undefined;
  drivePitch?: ((pitch: number, adjustForAoa?: boolean | undefined, adjustForVerticalWind?: boolean | undefined, rate?: number | undefined) => void) | undefined;

  /** Resumes Subscriptions. */
  private resumeSubs(): void {
    this.currentHeadingSub.resume(true);
    this.currentBankSub.resume(true);
  }

  /** Pauses Subscriptions. */
  private pauseSubs(): void {
    this.currentHeadingSub.pause();
    this.currentBankSub.pause();
  }

  /**
   * Activates this director.
   */
  public activate(): void {
    this.resumeSubs();
    this.state = DirectorState.Active;
    this.capturedHeading = null;
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
      if (this.capturedHeading === null && Math.abs(this.currentBank) < APHdgHoldDirector.MIN_BANK_THRESHOLD) {
        this.capturedHeading = this.currentHeading;
      }

      this.driveBankFunc(this.capturedHeading !== null ? this.desiredBank(this.capturedHeading) : 0);
    }
  }

  /**
   * Gets a desired bank from a Target Selected Heading.
   * @param targetHeading The target heading.
   * @returns The desired bank angle.
   */
  private desiredBank(targetHeading: number): number {
    const turnDirection = NavMath.getTurnDirection(this.currentHeading, targetHeading);
    const headingDiff = Math.abs(NavMath.diffAngle(this.currentHeading, targetHeading));

    let baseBank = Math.min(1.25 * headingDiff, this.maxBankAngleFunc());
    baseBank *= (turnDirection === 'left' ? 1 : -1);

    return baseBank;
  }
}