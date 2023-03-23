/// <reference types="@microsoft/msfs-types/js/simvar" />

import { EventBus, SimVarValueType } from '../../data';
import { AhrsEvents } from '../../instruments';
import { MathUtils } from '../../math';
import { LinearServo } from '../../utils/controllers';
import { APValues } from '../APConfig';
import { DirectorState, PlaneDirector } from './PlaneDirector';

/**
 * Options for control of the roll director.
 */
export type APRollDirectorOptions = {
  /**
   * The minimum bank angle, in degrees, below which the roll director will command wings level, or a function which
   * returns it.
   */
  minBankAngle: number | (() => number);

  /**
   * The maximum bank angle, in degrees, that the roll director will not exceed, or a function which returns it. If not
   * defined, the director will use the maximum bank angle defined by its parent autopilot (via `apValues`).
   */
  maxBankAngle: number | (() => number) | undefined;
};

/**
 * An autopilot roll director.
 */
export class APRollDirector implements PlaneDirector {
  private static readonly BANK_SERVO_RATE = 10; // degrees per second

  public state: DirectorState;

  /** A callback called when the LNAV director activates. */
  public onActivate?: () => void;

  /** A callback called when the LNAV director arms. */
  public onArm?: () => void;

  private currentBankRef = 0;
  private desiredBank = 0;
  private actualBank = 0;

  private readonly bankServo = new LinearServo(APRollDirector.BANK_SERVO_RATE);

  private readonly minBankAngleFunc: () => number;
  private readonly maxBankAngleFunc: () => number;


  /**
   * Creates an instance of the LateralDirector.
   * @param bus The event bus to use with this instance.
   * @param apValues The AP Values.
   * @param options Options to configure the new director. Option values default to the following if not defined:
   * * `minBankAngle`: `0`
   * * `maxBankAngle`: `undefined`
   */
  constructor(private readonly bus: EventBus, private readonly apValues: APValues, options?: Partial<Readonly<APRollDirectorOptions>>) {
    const minBankAngleOpt = options?.minBankAngle ?? 0;
    if (typeof minBankAngleOpt === 'number') {
      this.minBankAngleFunc = () => minBankAngleOpt;
    } else {
      this.minBankAngleFunc = minBankAngleOpt;
    }

    const maxBankAngleOpt = options?.maxBankAngle;
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

    const sub = this.bus.getSubscriber<AhrsEvents>();
    sub.on('roll_deg').withPrecision(1).handle((roll) => {
      this.actualBank = roll;
    });
  }

  /**
   * Activates this director.
   */
  public activate(): void {
    this.state = DirectorState.Active;

    const maxBank = this.maxBankAngleFunc();
    const minBank = this.minBankAngleFunc();

    if (Math.abs(this.actualBank) < minBank) {
      this.desiredBank = 0;
    } else {
      this.desiredBank = MathUtils.clamp(this.actualBank, -maxBank, maxBank);
    }

    if (this.onActivate !== undefined) {
      this.onActivate();
    }

    SimVar.SetSimVarValue('AUTOPILOT BANK HOLD', 'Bool', true);

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
    this.desiredBank = 0;
    SimVar.SetSimVarValue('AUTOPILOT BANK HOLD', 'Bool', false);
  }

  /**
   * Updates this director.
   */
  public update(): void {
    if (this.state === DirectorState.Active) {
      const maxBank = this.maxBankAngleFunc();
      const minBank = this.minBankAngleFunc();

      if (Math.abs(this.actualBank) < minBank) {
        this.desiredBank = 0;
      } else {
        this.desiredBank = MathUtils.clamp(this.actualBank, -maxBank, maxBank);
      }

      this.setBank(this.desiredBank);
    }
  }


  /**
   * Sets the desired AP bank angle.
   * @param bankAngle The desired AP bank angle.
   */
  private setBank(bankAngle: number): void {
    if (isFinite(bankAngle)) {
      this.bankServo.rate = APRollDirector.BANK_SERVO_RATE * SimVar.GetSimVarValue('E:SIMULATION RATE', SimVarValueType.Number);
      this.currentBankRef = this.bankServo.drive(this.currentBankRef, bankAngle);
      SimVar.SetSimVarValue('AUTOPILOT BANK HOLD REF', 'degrees', this.currentBankRef);
    }
  }
}