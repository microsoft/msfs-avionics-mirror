/// <reference types="@microsoft/msfs-types/js/simvar" />

import { EventBus, SimVarValueType } from '../../data';
import { NavMath } from '../../geo';
import { AhrsEvents } from '../../instruments';
import { Subscription } from '../../sub';
import { LinearServo } from '../../utils/controllers';
import { APValues } from '../APConfig';
import { APHdgDirectorOptions } from './APHdgDirector';
import { DirectorState, PlaneDirector } from './PlaneDirector';

/**
 * An autopilot heading hold director.
 * Levels the wings upon activation, and then holds the captured heading
 */
export class APHdgHoldDirector implements PlaneDirector {
  private static readonly BANK_SERVO_RATE = 10; // degrees per second
  /** bank angle below which we capture the heading */
  private static readonly MIN_BANK_THRESHOLD = 1;

  public state: DirectorState;

  /** A callback called when the heading hold director activates. */
  public onActivate?: () => void;

  /** A callback called when the heading hold director arms. */
  public onArm?: () => void;

  private currentBankRef = 0;
  private currentHeading = 0;
  private currentBank = 0;

  private readonly currentBankSub: Subscription;
  private readonly currentHeadingSub: Subscription;

  private readonly bankServo = new LinearServo(APHdgHoldDirector.BANK_SERVO_RATE);

  private readonly maxBankAngleFunc: () => number;

  /** heading captured at wings level, or null if not yet captured */
  private capturedHeading: number | null = null;

  /**
   * Creates an instance of the heading hold director.
   * @param bus The event bus to use with this instance.
   * @param apValues Autopilot values from this director's parent autopilot.
   * @param options Options to configure the new director. Option values default to the following if not defined:
   * * `maxBankAngle`: `undefined`
   * * `isToGaMode`: `false`
   */
  constructor(
    private readonly bus: EventBus,
    private readonly apValues: APValues,
    options?: Partial<Readonly<APHdgDirectorOptions>>
  ) {
    this.state = DirectorState.Inactive;

    this.currentBankSub = this.bus.getSubscriber<AhrsEvents>().on('roll_deg').withPrecision(1).handle((bank) => this.currentBank = bank);
    this.currentHeadingSub = this.bus.getSubscriber<AhrsEvents>().on('hdg_deg').withPrecision(0).handle((h) => this.currentHeading = h);

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

    this.state = DirectorState.Inactive;
  }

  /**
   * Activates this director.
   */
  public activate(): void {
    this.state = DirectorState.Active;

    this.currentBankSub.resume();
    this.currentHeadingSub.resume();

    this.capturedHeading = null;
    if (this.onActivate !== undefined) {
      this.onActivate();
    }
    SimVar.SetSimVarValue('AUTOPILOT HEADING LOCK', 'Bool', true);
    this.bankServo.reset();
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

    this.currentBankSub.pause();
    this.currentHeadingSub.pause();
  }

  /**
   * Updates this director.
   */
  public update(): void {
    if (this.state === DirectorState.Active) {
      if (this.capturedHeading === null && Math.abs(this.currentBank) < APHdgHoldDirector.MIN_BANK_THRESHOLD) {
        this.capturedHeading = this.currentHeading;
      }
      this.setBank(this.capturedHeading !== null ? this.desiredBank(this.capturedHeading) : 0);
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

  /**
   * Sets the desired AP bank angle.
   * @param bankAngle The desired AP bank angle.
   */
  private setBank(bankAngle: number): void {
    if (isFinite(bankAngle)) {
      this.bankServo.rate = APHdgHoldDirector.BANK_SERVO_RATE * SimVar.GetSimVarValue('E:SIMULATION RATE', SimVarValueType.Number);
      this.currentBankRef = this.bankServo.drive(this.currentBankRef, bankAngle);
      SimVar.SetSimVarValue('AUTOPILOT BANK HOLD REF', 'degrees', this.currentBankRef);
    }
  }
}