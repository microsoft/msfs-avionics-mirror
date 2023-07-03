import { ConsumerValue } from '../data';
import { ConsumerSubject } from '../data/ConsumerSubject';
import { EventBus, Publisher } from '../data/EventBus';
import { SimVarValueType } from '../data/SimVars';
import { AdcEvents } from '../instruments/Adc';
import { ExpSmoother } from '../math/ExpSmoother';
import { Subscribable } from '../sub/Subscribable';
import { LinearServo } from '../utils/controllers/LinearServo';
import { APValues } from './APConfig';
import { FlightDirectorEvents } from './data/FlightDirectorEvents';
import { VNavUtils } from './VNavUtils';

/**
 * Options for {@link AutopilotDriver}.
 */
export type AutopilotDriverOptions = {
  /** Whether to set internal flight director values (not required for the default sim FD).  */
  setInternalFlightDirector?: boolean;

  /** Whether to provide rudder auto-coordination while the autopilot is engaged. Defaults to `false`. */
  autoCoordinationEnabled?: boolean;

  /** The airplane's maximum rudder deflection, in degrees. Defaults to `25`. */
  maxRudderDeflection?: number;

  /**
   * The factor to multiply with the commanded bank angle to calculate the rudder deflection commanded by rudder
   * auto-coordination. Defaults to `0.3`.
   */
  rudderBankFactor?: number;

  /** The rate used to drive the rudder auto-coordination servo, in degrees per second. Defaults to `1`. */
  rudderServoRate?: number;

  /** The default rate used to drive the pitch servo, in degrees per second. Defaults to `5`. */
  pitchServoRate?: number;

  /** The default rate used to drive the bank servo, in degrees per second. Defaults to `10`. */
  bankServoRate?: number;

  /** The RA height below which zero roll is forced, defaults to none. */
  zeroRollHeight?: number;
};


/**
 * An autopilot driver to set pitch and bank values in the sim AP.
 *
 * This driver follows the sim's convention for negative and positive values:
 * AUTOPILOT BANK HOLD REF/PLANE BANK DEGREES: negative = right, positive = left
 * AUTOPILOT PITCH HOLD REF/PLANE PITCH DEGREES: negative = up, positive = down
 * INCIDENCE ALPHA: negative = down, positive = up
 * AMBIENT WIND Y: negative = down, positive = up
 */
export class AutopilotDriver {
  private static readonly PITCH_SERVO_RATE = 5; // degrees per second
  private static readonly BANK_SERVO_RATE = 10; // degrees per second
  private static readonly RUDDER_SERVO_RATE = 1; // degrees per second

  private static readonly VERTICAL_WIND_SMOOTHING_TAU = 500 / Math.LN2;

  private readonly pitchServoRate: number;
  private readonly pitchServo: LinearServo;
  private _lastPitchSetTime?: number;
  private currentPitchRef = 0;

  private readonly bankServoRate: number;
  private readonly bankServo: LinearServo;
  private _lastBankSetTime?: number;
  private currentBankRef = 0;

  private readonly rudderBankFactor: number = 0.3;
  private readonly maxRudderDeflection: number = 25;
  private autoCoordinationEnabled = false;

  private zeroRollHeight?: number;

  private readonly rudderServoRate: number;
  private readonly rudderServo: LinearServo;
  private rudderSet = 0;

  private readonly verticalWindSmoother = new ExpSmoother(AutopilotDriver.VERTICAL_WIND_SMOOTHING_TAU);
  private verticalWindAverageValue = 0;
  private _lastVerticalWindTime?: number;

  private readonly fdPublisher?: Publisher<FlightDirectorEvents>;

  private readonly onGround = ConsumerSubject.create(null, true);
  private readonly raHeight = ConsumerValue.create<number | null>(null, null);

  /**
   * Creates an instance of this Autopilot Driver.
   * @param bus An instance of the Event Bus.
   * @param apValues Autopilot values from this driver's parent autopilot.
   * @param apMasterOn Whether the AP is engaged.
   * @param options Options for this driver.
   */
  constructor(
    bus: EventBus,
    private readonly apValues: APValues,
    private readonly apMasterOn: Subscribable<boolean>,
    options?: Readonly<AutopilotDriverOptions>
  ) {
    if (options?.setInternalFlightDirector) {
      this.fdPublisher = bus.getPublisher<FlightDirectorEvents>();
    }

    this.pitchServoRate = options?.pitchServoRate ?? AutopilotDriver.PITCH_SERVO_RATE;
    this.pitchServo = new LinearServo(this.pitchServoRate);
    this.currentPitchRef = SimVar.GetSimVarValue('AUTOPILOT PITCH HOLD REF', SimVarValueType.Degree);

    this.bankServoRate = options?.bankServoRate ?? AutopilotDriver.BANK_SERVO_RATE;
    this.bankServo = new LinearServo(this.bankServoRate);
    this.currentBankRef = SimVar.GetSimVarValue('AUTOPILOT BANK HOLD REF', SimVarValueType.Degree);

    if (options?.autoCoordinationEnabled) {
      if (options.rudderBankFactor !== undefined) {
        this.rudderBankFactor = options.rudderBankFactor;
      }

      if (options.maxRudderDeflection !== undefined) {
        this.maxRudderDeflection = options.maxRudderDeflection;
      }

      this.autoCoordinationEnabled = true;
      this.onGround.setConsumer(bus.getSubscriber<AdcEvents>().on('on_ground'));
      this.raHeight.setConsumer(bus.getSubscriber<AdcEvents>().on('radio_alt'));
      this.apMasterOn.sub(isOn => {
        if (!isOn) {
          this.resetRudder();
        }
      });
      this.onGround.sub(onGround => {
        if (onGround) {
          this.resetRudder();
        }
      });
    }

    if (options?.zeroRollHeight) {
      this.zeroRollHeight = options.zeroRollHeight;
    }

    this.rudderServoRate = (options?.rudderServoRate ?? AutopilotDriver.RUDDER_SERVO_RATE) / this.maxRudderDeflection * 16384;
    this.rudderServo = new LinearServo(this.rudderServoRate);

    this.apValues.simRate.sub(this.onSimRateChanged.bind(this), true);
  }

  /**
   * Responds to when the simulation rate changes.
   * @param simRate The new simulation rate.
   */
  private onSimRateChanged(simRate: number): void {
    this.pitchServo.rate = this.pitchServoRate * simRate;
    this.bankServo.rate = this.bankServoRate * simRate;
    this.rudderServo.rate = this.rudderServoRate * simRate;
  }

  /**
   * Update loop to keep Ambient Wind Y constantly updated.
   */
  public update(): void {
    const verticalWind = SimVar.GetSimVarValue('AMBIENT WIND Y', SimVarValueType.FPM);
    const time = Date.now();

    if (this._lastVerticalWindTime === undefined) {
      this.verticalWindAverageValue = this.verticalWindSmoother.reset(verticalWind);
    } else {
      this.verticalWindAverageValue = this.verticalWindSmoother.next(verticalWind, time - this._lastVerticalWindTime);
    }

    this._lastVerticalWindTime = time;

    if (this.autoCoordinationEnabled && this.apMasterOn.get() === true && this.onGround.get() === false) {
      this.manageAutoRudder();
    }
  }

  /**
   * Drives the commanded autopilot bank angle toward a desired value using a linear servo.
   * @param bank The desired bank angle, in degrees. Positive values indicate left bank.
   * @param rate The rate at which to drive the commanded bank angle, in degrees per second. Defaults to the bank
   * servo's default rate.
   */
  public driveBank(bank: number, rate?: number): void {
    if (isFinite(bank)) {
      const currentTime = Date.now();
      if (this._lastBankSetTime !== undefined) {
        const deltaTime = currentTime - this._lastBankSetTime;
        if (deltaTime > 1000) {
          this.bankServo.reset();
        }
      } else {
        this.bankServo.reset();
      }

      this._lastBankSetTime = currentTime;

      this.setBank(this.bankServo.drive(this.currentBankRef, bank, currentTime, rate), false);

    } else {
      console.warn('AutopilotDriver: Non-finite bank angle was attempted to be set.');
    }
  }

  /**
   * Sets the commanded autopilot bank angle, in degrees.
   * @param bank The commanded bank angle, in degrees. Positive values indicate left bank.
   * @param resetServo Whether to reset the bank servo. Defaults to `true`.
   */
  public setBank(bank: number, resetServo = true): void {
    if (this.zeroRollHeight !== undefined) {
      const raHeight = this.raHeight.get();
      if (raHeight !== null && raHeight < this.zeroRollHeight) {
        bank = 0;
      }
    }

    if (isFinite(bank)) {
      this.currentBankRef = bank;
      SimVar.SetSimVarValue('AUTOPILOT BANK HOLD REF', SimVarValueType.Degree, this.currentBankRef);
      this.fdPublisher?.pub('fd_target_bank', this.currentBankRef, true, true);
    } else {
      console.warn('AutopilotDriver: Non-finite bank angle was attempted to be set.');
    }
    if (resetServo) {
      this._lastBankSetTime = undefined;
    }
  }

  /**
   * Drives the commanded autopilot pitch angle toward a desired value using a linear servo while optionally correcting
   * for angle of attack and vertical wind.
   * @param pitch The desired pitch angle, in degrees. Positive values indicate downward pitch.
   * @param adjustForAoa Whether to adjust the commanded pitch angle for angle of attack. If `true`, the provided pitch
   * angle is treated as a desired flight path angle and a new commanded pitch angle will be calculated to produce the
   * desired FPA given the airplane's current angle of attack. This correction can be used in conjunction with the
   * vertical wind correction. Defaults to `false`.
   * @param adjustForVerticalWind Whether to adjust the commanded pitch angle for vertical wind velocity. If `true`,
   * the provided pitch angle is treated as a desired flight path angle and a new commanded pitch angle will be
   * calculated to produce the desired FPA given the current vertical wind component. This correction can be used in
   * conjunction with the angle of attack correction. Defaults to `false`.
   * @param rate The rate at which to drive the commanded pitch angle, in degrees per second. Defaults to the pitch
   * servo's default rate.
   */
  public drivePitch(pitch: number, adjustForAoa = false, adjustForVerticalWind = false, rate?: number): void {
    if (isFinite(pitch)) {
      //pitch = -5 we want a 5 degree FPA up
      if (adjustForVerticalWind) {
        // with an updraft, we get a down correction value
        // if pitch were normal (+ === up), we would add the correction 5 + (-1) = 4 (pitch adjusted down because of updraft)
        // since pitch is actually inverse (- === up), we want to subtract the correction value -5 - (-1) = -4
        pitch -= this.getVerticalWindCorrection();
      }
      if (adjustForAoa) {
        // if we want to fly an FPA of +5 degrees, we need to add our AOA to our FPA for the desired pitch.
        // if our AOA is 1 degree, we want to set our pitch to 5 + 1 = 6 degrees to achieve a 5 degree FPA.
        // since pitch is inverse and AOA is not, we want to subtract the aoa value -5 - (+1) = -6 (6 degree up pitch)
        // if we are wanting to fly an FPA of -3 degrees, and our AOA is +1 degree, we would set +3 - (+1) = 2 (2 degree down pitch)
        pitch -= SimVar.GetSimVarValue('INCIDENCE ALPHA', SimVarValueType.Degree);
      }

      const currentTime = Date.now();
      if (this._lastPitchSetTime !== undefined) {
        const deltaTime = currentTime - this._lastPitchSetTime;
        if (deltaTime > 1000) {
          this.pitchServo.reset();
        }
      } else {
        this.pitchServo.reset();
      }

      this._lastPitchSetTime = currentTime;

      this.setPitch(this.pitchServo.drive(this.currentPitchRef, pitch, currentTime, rate), false);

    } else {
      console.warn('AutopilotDriver: Non-finite pitch angle was attempted to be set.');
    }
  }

  /**
   * Sets the commanded autopilot pitch angle, in degrees.
   * @param pitch The commanded pitch angle, in degrees. Positive values indicate downward pitch.
   * @param resetServo Whether to reset the pitch servo. Defaults to `true`.
   */
  public setPitch(pitch: number, resetServo = true): void {
    if (isFinite(pitch)) {
      this.currentPitchRef = pitch;
      SimVar.SetSimVarValue('AUTOPILOT PITCH HOLD REF', SimVarValueType.Degree, this.currentPitchRef);
      this.fdPublisher?.pub('fd_target_pitch', this.currentPitchRef, true, true);
    } else {
      console.warn('AutopilotDriver: Non-finite pitch angle was attempted to be set.');
    }
    if (resetServo) {
      this._lastPitchSetTime = undefined;
    }
  }

  /**
   * Gets the vertical wind correction in degrees.
   * @returns The vertical wind correction in degrees.
   */
  private getVerticalWindCorrection(): number {
    // Wind correction FPA will be the FPA required to negate the vertical wind (so negative verticalWindAverageValue)
    return VNavUtils.getFpa(SimVar.GetSimVarValue('AIRSPEED TRUE', SimVarValueType.FPM), -this.verticalWindAverageValue);
  }

  /**
   * Manages the Auto Rudder in Autopilot.
   */
  private manageAutoRudder(): void {
    this.rudderSet = this.rudderServo.drive(this.rudderSet, (this.rudderBankFactor * this.currentBankRef / this.maxRudderDeflection) * 16384);
    SimVar.SetSimVarValue('K:AXIS_RUDDER_SET', SimVarValueType.Number, this.rudderSet);
  }

  /**
   * Resets the rudder to 0.
   */
  private resetRudder(): void {
    SimVar.SetSimVarValue('K:AXIS_RUDDER_SET', SimVarValueType.Number, 0);
    this.rudderServo.reset();
  }
}