/// <reference types="@microsoft/msfs-types/js/simvar" />

import { EventBus, SimVarValueType } from '../../data';
import { LinearServo } from '../../utils/controllers';
import { DirectorState, PlaneDirector } from './PlaneDirector';

/**
 * An autopilot wing leveler director.
 */
export class APLvlDirector implements PlaneDirector {
  private static readonly BANK_SERVO_RATE = 10; // degrees per second

  public state: DirectorState;

  /** A callback called when the wing leveler director activates. */
  public onActivate?: () => void;

  /** A callback called when the wing leveler director arms. */
  public onArm?: () => void;

  private currentBankRef = 0;
  private desiredBank = 0;

  private readonly bankServo = new LinearServo(APLvlDirector.BANK_SERVO_RATE);


  /**
   * Creates an instance of the wing leveler.
   * @param bus The event bus to use with this instance.
   * @param isToGaMode Whether this director is being used as a TO/GA lateral mode
   * (and thus shouldn't set the 'AUTOPILOT WING LEVELER' simvar)
   */
  constructor(private readonly bus: EventBus, private isToGaMode = false) {
    this.state = DirectorState.Inactive;
  }

  /**
   * Activates this director.
   */
  public activate(): void {
    this.state = DirectorState.Active;
    this.desiredBank = 0;
    if (this.onActivate !== undefined) {
      this.onActivate();
    }
    if (!this.isToGaMode) { SimVar.SetSimVarValue('AUTOPILOT WING LEVELER', 'Bool', true); }
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
    if (!this.isToGaMode) { SimVar.SetSimVarValue('AUTOPILOT WING LEVELER', 'Bool', false); }
  }

  /**
   * Updates this director.
   */
  public update(): void {
    if (this.state === DirectorState.Active) {
      this.setBank(this.desiredBank);
    }
  }


  /**
   * Sets the desired AP bank angle.
   * @param bankAngle The desired AP bank angle.
   */
  private setBank(bankAngle: number): void {
    if (isFinite(bankAngle)) {
      this.bankServo.rate = APLvlDirector.BANK_SERVO_RATE * SimVar.GetSimVarValue('E:SIMULATION RATE', SimVarValueType.Number);
      this.currentBankRef = this.bankServo.drive(this.currentBankRef, bankAngle);
      SimVar.SetSimVarValue('AUTOPILOT BANK HOLD REF', 'degrees', this.currentBankRef);
    }
  }
}