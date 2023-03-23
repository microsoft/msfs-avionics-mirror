/// <reference types="@microsoft/msfs-types/js/simvar" />

import { EventBus, SimVarValueType } from '../../data';
import { NavMath } from '../../geo';
import { AhrsEvents } from '../../instruments';
import { LinearServo } from '../../utils/controllers';
import { APValues } from '../APConfig';
import { DirectorState, PlaneDirector } from './PlaneDirector';

/**
 * Options for {@link APHdgDirector}.
 */
export type APHdgDirectorOptions = {
  /**
   * The maximum bank angle, in degrees, supported by the director, or a function which returns it. If not defined,
   * the director will use the maximum bank angle defined by its parent autopilot (via `apValues`).
   */
  maxBankAngle: number | (() => number) | undefined;

  /**
   * Whether the director is to be used as a TO/GA lateral mode. If `true`, the director will not control the
   * `AUTOPILOT HEADING LOCK` simvar.
   */
  isToGaMode: boolean;
};

/**
 * A heading autopilot director.
 */
export class APHdgDirector implements PlaneDirector {
  private static readonly BANK_SERVO_RATE = 10; // degrees per second

  public state: DirectorState;

  /** A callback called when the director activates. */
  public onActivate?: () => void;

  /** A callback called when the director arms. */
  public onArm?: () => void;

  private currentBankRef = 0;
  private currentHeading = 0;
  private toGaHeading = 0;

  private readonly bankServo = new LinearServo(APHdgDirector.BANK_SERVO_RATE);

  private readonly maxBankAngleFunc: () => number;
  private readonly isToGaMode: boolean;

  /**
   * Creates a new instance of APHdgDirector.
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

    this.isToGaMode = options?.isToGaMode ?? false;

    this.state = DirectorState.Inactive;

    const ahrs = this.bus.getSubscriber<AhrsEvents>();
    ahrs.on('hdg_deg').withPrecision(0).handle((h) => {
      this.currentHeading = h;
    });

  }

  /**
   * Activates this director.
   */
  public activate(): void {
    if (this.onActivate !== undefined) {
      this.onActivate();
    }
    if (!this.isToGaMode) {
      SimVar.SetSimVarValue('AUTOPILOT HEADING LOCK', 'Bool', true);
    } else {
      this.toGaHeading = this.currentHeading;
    }

    this.state = DirectorState.Active;
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
  public async deactivate(): Promise<void> {
    if (!this.isToGaMode) { await SimVar.SetSimVarValue('AUTOPILOT HEADING LOCK', 'Bool', false); }
    this.state = DirectorState.Inactive;
  }

  /**
   * Updates this director.
   */
  public update(): void {
    if (this.state === DirectorState.Active) {
      if (this.isToGaMode) {
        if (Simplane.getIsGrounded()) {
          this.toGaHeading = this.currentHeading;
        }
        this.setBank(this.desiredBank(this.toGaHeading));
      } else {
        this.setBank(this.desiredBank(this.apValues.selectedHeading.get()));
      }
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
      this.bankServo.rate = APHdgDirector.BANK_SERVO_RATE * SimVar.GetSimVarValue('E:SIMULATION RATE', SimVarValueType.Number);
      this.currentBankRef = this.bankServo.drive(this.currentBankRef, bankAngle);
      SimVar.SetSimVarValue('AUTOPILOT BANK HOLD REF', 'degrees', this.currentBankRef);
    }
  }
}