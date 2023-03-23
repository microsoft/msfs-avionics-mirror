/// <reference types="@microsoft/msfs-types/js/simvar" />

import { EventBus, SimVarValueType } from '../../data';
import { NavMath } from '../../geo';
import { GNSSEvents } from '../../instruments';
import { LinearServo } from '../../utils/controllers';
import { APValues } from '../APConfig';
import { APHdgDirectorOptions } from './APHdgDirector';
import { DirectorState, PlaneDirector } from './PlaneDirector';

/**
 * A heading autopilot director.
 */
export class APTrkDirector implements PlaneDirector {
  private static readonly BANK_SERVO_RATE = 10; // degrees per second

  public state: DirectorState;

  /** A callback called when the director activates. */
  public onActivate?: () => void;

  /** A callback called when the director arms. */
  public onArm?: () => void;

  private currentBankRef = 0;
  private currentTrack = 0;
  private toGaTrack = 0;

  private readonly bankServo = new LinearServo(APTrkDirector.BANK_SERVO_RATE);

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

    const ahrs = this.bus.getSubscriber<GNSSEvents>();
    ahrs.on('track_deg_magnetic').withPrecision(0).handle((h) => {
      this.currentTrack = h;
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
      this.toGaTrack = this.currentTrack;
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
          this.toGaTrack = this.currentTrack;
        }
        this.setBank(this.desiredBank(this.toGaTrack));
      } else {
        this.setBank(this.desiredBank(this.apValues.selectedHeading.get()));
      }
    }
  }

  /**
   * Gets a desired bank from a Target Selected Track.
   * @param targetTrack The target track.
   * @returns The desired bank angle.
   */
  private desiredBank(targetTrack: number): number {
    const turnDirection = NavMath.getTurnDirection(this.currentTrack, targetTrack);
    const trackDiff = Math.abs(NavMath.diffAngle(this.currentTrack, targetTrack));

    let baseBank = Math.min(1.25 * trackDiff, this.maxBankAngleFunc());
    baseBank *= (turnDirection === 'left' ? 1 : -1);

    return baseBank;
  }


  /**
   * Sets the desired AP bank angle.
   * @param bankAngle The desired AP bank angle.
   */
  private setBank(bankAngle: number): void {
    if (isFinite(bankAngle)) {
      this.bankServo.rate = APTrkDirector.BANK_SERVO_RATE * SimVar.GetSimVarValue('E:SIMULATION RATE', SimVarValueType.Number);
      this.currentBankRef = this.bankServo.drive(this.currentBankRef, bankAngle);
      SimVar.SetSimVarValue('AUTOPILOT BANK HOLD REF', 'degrees', this.currentBankRef);
    }
  }
}