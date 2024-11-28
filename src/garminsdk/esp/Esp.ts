import { MathUtils, Subject, Subscribable } from '@microsoft/msfs-sdk';

import { EspDataProvider } from './EspDataProvider';
import { EspModule } from './EspModule';
import { EspForceController, EspOperatingMode } from './EspTypes';

/**
 * Configuration options for {@link Esp}.
 */
export type EspOptions = {
  /** The above ground height, in feet, at or above which ESP can become armed from a disarmed state. */
  armAglThreshold: number;

  /** The above ground height, in feet, below which ESP becomes disarmed from an armed state. */
  disarmAglThreshold: number;

  /** Whether ESP can become armed when AGL data is invalid. Defaults to `false`. */
  canArmWhenAglInvalid?: boolean;

  /**
   * The minimum pitch angle, in degrees, at which ESP can become armed. Positive angles represent downward pitch.
   * Defaults to `-90`.
   */
  armMinPitchLimit?: number;

  /**
   * The maximum pitch angle, in degrees, at which ESP can become armed. Positive angles represent downward pitch.
   * Defaults to `90`.
   */
  armMaxPitchLimit?: number;

  /** The maximum roll angle magnitude, in degrees, at which ESP can become armed. Defaults to `90`. */
  armRollLimit?: number;

  /**
   * The maximum force ESP is allowed to apply to the pitch control axis to move it in the pitch up direction. A force
   * of magnitude one is the amount of force required to deflect the control axis from the neutral position to maximum
   * deflection (on either side). Defaults to `1`.
   */
  pitchAxisMaxForceUp?: number;

  /**
   * The maximum force ESP is allowed to apply to the pitch control axis to move it in the pitch down direction. A
   * force of magnitude one is the amount of force required to deflect the control axis from the neutral position to
   * maximum deflection (on either side). Defaults to `1`.
   */
  pitchAxisMaxForceDown?: number;

  /**
   * The rate at which the system changes the force applied to the pitch control axis, in units of force per second.
   * Defaults to `0.1`.
   */
  pitchAxisForceRate?: number;

  /**
   * The rate at which the system unloads force applied to the pitch control axis when it is not armed, in units of
   * force per second. Defaults to `1`.
   */
  pitchAxisUnloadRate?: number;

  /**
   * The maximum force ESP is allowed to apply to the roll control axis. A force of magnitude one is the amount of
   * force required to deflect the control axis from the neutral position to maximum deflection (on either side).
   * Defaults to `1`.
   */
  rollAxisMaxForce?: number;

  /**
   * The rate at which the system changes the force applied to the roll control axis, in units of force per second.
   * Defaults to `0.1`.
   */
  rollAxisForceRate?: number;

  /**
   * The rate at which the system unloads force applied to the roll control axis when it is not armed, in units of
   * force per second. Defaults to `1`.
   */
  rollAxisUnloadRate?: number;

  /**
   * The length of the window, in seconds, in which engagement time is tracked. Values less than or equal to zero will
   * cause engagement time to not be tracked. Defaults to `0`.
   */
  engagementTimeWindow?: number;
};

/**
 * A Garmin electronic stability and protection system.
 */
export class Esp {

  private readonly modules: EspModule[] = [];

  private readonly forceController: EspForceController = {
    applyPitchForce: this.applyPitchForce.bind(this),
    applyRollForce: this.applyRollForce.bind(this),
  };

  private readonly armAglThreshold: number;
  private readonly disarmAglThreshold: number;
  private readonly canArmWhenAglInvalid: boolean;

  private readonly armMinPitchLimit: number;
  private readonly armMaxPitchLimit: number;
  private readonly armRollLimit: number;

  private readonly pitchAxisMaxForceUp: number;
  private readonly pitchAxisMaxForceDown: number;
  private readonly pitchAxisForceRate: number;
  private readonly pitchAxisUnloadRate: number;

  private readonly rollAxisMaxForce: number;
  private readonly rollAxisForceRate: number;
  private readonly rollAxisUnloadRate: number;

  private isAlive = true;
  private isInit = false;
  private isPaused = true;

  private isOn = false;
  private isArmed = false;
  private isInterrupted = false;
  private isFailed = false;

  private isEngaged = false;
  private desiredPitchAxisForce = 0;
  private desiredRollAxisForce = 0;

  private readonly engagementTimeQueue: number[] = [];
  private engagementTime = 0;

  private lastUpdateTime: number | undefined = undefined;

  private readonly _operatingMode = Subject.create(EspOperatingMode.Off);
  /** This system's current operating mode. */
  public readonly operatingMode = this._operatingMode as Subscribable<EspOperatingMode>;

  private readonly _pitchAxisForce = Subject.create(0);
  /**
   * The force applied to the pitch control axis by this system, scaled such that a force of magnitude one is the
   * amount of force required to deflect the control axis from the neutral position to maximum deflection (on either
   * side). Positive force deflects the control axis to command an increase in pitch angle (i.e. increase downward
   * pitch).
   */
  public readonly pitchAxisForce = this._pitchAxisForce as Subscribable<number>;

  private readonly _rollAxisForce = Subject.create(0);
  /**
   * The force applied to the roll control axis by this system, scaled such that a force of magnitude one is the amount
   * of force required to deflect the control axis from the neutral position to maximum deflection (on either side).
   * Positive force deflects the control axis to command an increase in roll angle (i.e. increase leftward roll).
   */
  public readonly rollAxisForce = this._rollAxisForce as Subscribable<number>;

  /**
   * The length of the window, in seconds, in which engagement time is tracked, or `0` if engagement time is not
   * tracked.
   */
  public readonly engagementTimeWindow: number;

  private readonly _engagementTimeFraction = Subject.create(0);
  /**
   * The amount of time this system spent engaged during the engagement time window, as a fraction of the window
   * length. If engagement time is not tracked, then this value is always equal to zero.
   */
  public readonly engagementTimeFraction = this._engagementTimeFraction as Subscribable<number>;

  /**
   * Creates a new instance of Esp. The system is created in a paused state. Initializing the system and calling
   * `update()` will resume it.
   * @param dataProvider A provider of ESP data.
   * @param options Options with which to configure the system.
   */
  public constructor(
    private readonly dataProvider: EspDataProvider,
    options: Readonly<EspOptions>
  ) {
    this.armAglThreshold = options.armAglThreshold;
    this.disarmAglThreshold = options.disarmAglThreshold;
    this.canArmWhenAglInvalid = options.canArmWhenAglInvalid ?? false;

    this.armMinPitchLimit = options.armMinPitchLimit ?? -90;
    this.armMaxPitchLimit = options.armMaxPitchLimit ?? 90;
    this.armRollLimit = options.armRollLimit ?? 90;

    this.pitchAxisMaxForceUp = Math.max(options.pitchAxisMaxForceUp ?? 1, 0);
    this.pitchAxisMaxForceDown = MathUtils.clamp(options.pitchAxisMaxForceDown ?? 1, 0, 1);
    this.pitchAxisForceRate = options.pitchAxisForceRate ?? 0.1;
    this.pitchAxisUnloadRate = options.pitchAxisUnloadRate ?? 1;
    this.rollAxisMaxForce = MathUtils.clamp(options.rollAxisMaxForce ?? 1, 0, 1);
    this.rollAxisForceRate = options.rollAxisForceRate ?? 0.1;
    this.rollAxisUnloadRate = options.rollAxisUnloadRate ?? 1;

    this.engagementTimeWindow = Math.max(options.engagementTimeWindow ?? 0, 0);
  }

  /**
   * Gets an array containing all modules that have been added to this system.
   * @returns An array containing all modules that have been added to this system.
   */
  public getAllModules(): readonly EspModule[] {
    return this.modules;
  }

  /**
   * Gets a module with a given ID that has been added to this system.
   * @param id The ID of the module to get.
   * @returns The module added to this system that has the specified ID, or `undefined` if there is no such module.
   */
  public getModule(id: string): EspModule | undefined {
    for (let i = 0; i < this.modules.length; i++) {
      if (this.modules[i].id === id) {
        return this.modules[i];
      }
    }

    return undefined;
  }

  /**
   * Adds a module to this system. If the module has already been added, then this method does nothing. If the module
   * shares an ID with any module already added to this system, then the previously added module will be removed before
   * the new module is added.
   * @param module The module to add.
   * @throws Error if this system has been destroyed or has been initialized.
   */
  public addModule(module: EspModule): void {
    if (!this.isAlive) {
      throw new Error('Esp: cannot add a module to a dead system');
    }

    if (this.isInit) {
      throw new Error('Esp: cannot add a module to an initialized system');
    }

    if (this.modules.includes(module)) {
      return;
    }

    // Remove any previously added modules with the same ID as the new module.
    for (let i = this.modules.length - 1; i >= 0; i--) {
      if (this.modules[i].id === module.id) {
        this.modules.splice(i, 1);
      }
    }

    this.modules.push(module);
  }

  /**
   * Initializes this system. Once the system is initialized, it can be updated by calling `update()`.
   * @throws Error if this system has been destroyed.
   */
  public init(): void {
    if (!this.isAlive) {
      throw new Error('Esp: cannot initialize a dead system');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    this.initModules();
  }

  /**
   * Initializes this system's modules.
   */
  private initModules(): void {
    for (const module of this.modules) {
      module.onInit();
    }
  }

  /**
   * Sets the master state of this system.
   * @param on The state to set: `true` to turn the system on, and `false` to turn the system off.
   * @throws Error if this system has been destroyed.
   */
  public setMaster(on: boolean): void {
    if (!this.isAlive) {
      throw new Error('Esp: cannot manipulate a dead system');
    }

    this.isOn = on;
    if (!on) {
      this.isArmed = false;
    }
  }

  /**
   * Sets whether pilot action is preventing this system from being engaged.
   * @param interrupt Whether pilot action is preventing this system from being engaged.
   * @throws Error if this system has been destroyed.
   */
  public setInterrupt(interrupt: boolean): void {
    if (!this.isAlive) {
      throw new Error('Esp: cannot manipulate a dead system');
    }

    this.isInterrupted = interrupt;
  }

  /**
   * Sets whether this system has failed.
   * @param failed Whether this system has failed.
   * @throws Error if this system has been destroyed.
   */
  public setFailed(failed: boolean): void {
    if (!this.isAlive) {
      throw new Error('Esp: cannot manipulate a dead system');
    }

    this.isFailed = failed;
    if (failed) {
      this.isArmed = false;
    }
  }

  /**
   * Applies a force to the pitch control axis.
   * @param force The force to apply, scaled such that a force of magnitude one is the amount of force required to
   * deflect the control axis from the neutral position to maximum deflection (on either side). Positive force deflects
   * the control axis to command an increase in pitch angle (i.e. increase downward pitch).
   */
  private applyPitchForce(force: number): void {
    this.desiredPitchAxisForce += force;
  }

  /**
   * Applies a force to the roll control axis.
   * @param force The force to apply, scaled such that a force of magnitude one is the amount of force required to
   * deflect the control axis from the neutral position to maximum deflection (on either side). Positive force deflects
   * the control axis to command an increase in roll angle (i.e. increase leftward roll).
   */
  private applyRollForce(force: number): void {
    this.desiredRollAxisForce += force;
  }

  /**
   * Updates this system.
   * @throws Error if this system has been destroyed.
   */
  public update(): void {
    if (!this.isAlive) {
      throw new Error('Esp: cannot update a dead system');
    }

    if (!this.isInit) {
      return;
    }

    this.isPaused = false;

    const dtSec = this.lastUpdateTime === undefined
      ? 0
      : MathUtils.clamp(this.dataProvider.data.realTime - this.lastUpdateTime, 0, 5000) * this.dataProvider.data.simRate / 1000;

    if (this.engagementTimeWindow > 0) {
      this.updateEngagementTime(dtSec);
    }

    this.isEngaged = false;
    this.desiredPitchAxisForce = 0;
    this.desiredRollAxisForce = 0;

    this.updateOperatingMode();
    this.updateModules();
    this.updateControlAxisForces(dtSec);

    if (this.engagementTimeWindow > 0) {
      // Any operating mode except Armed resets engagement time tracking.
      this._engagementTimeFraction.set(
        this._operatingMode.get() === EspOperatingMode.Armed
          ? MathUtils.clamp(this.engagementTime / this.engagementTimeWindow, 0, 1)
          : 0
      );
    }

    this.lastUpdateTime = this.dataProvider.data.realTime;
  }

  /**
   * Updates this system's tracked engagement time.
   * @param dtSec The elapsed time since the last update, in seconds.
   */
  private updateEngagementTime(dtSec: number): void {
    // Any operating mode except Armed resets engagement time tracking.
    if (this._operatingMode.get() !== EspOperatingMode.Armed && this.engagementTimeQueue.length > 0) {
      this.engagementTimeQueue.length = 0;
    }

    // Update the engagement time queue. The queue contains timestamps of when ESP was engaged and disengaged. The
    // timestamps are expressed relative to the current time (t = 0), with increasing values representing older points
    // in time. Timestamps within the queue are always in ascending order (i.e. timestamps closer to the present are
    // at the beginning). There are no timestamps in the queue that are older than the active time window. The last
    // (oldest) timestamp in the queue always represents an activation point. As you move backwards through the queue,
    // timestamps alternate between engagement and disengagement points.

    for (let i = 0; i < this.engagementTimeQueue.length; i++) {
      // Update the timestamp to reflect its current age.
      const time = this.engagementTimeQueue[i] += dtSec;
      if (time >= this.engagementTimeWindow) {
        // If the timestamp is at least as old as the window, then we need to check if the timestamp is an engagement
        // or disengagement point (we take advantage of the fact that the last timestamp in the queue is always an
        // engagement point and timestamps alternate between engagement and disengagement). If it is an engagement
        // point, then we change the timestamp to the window length. If it is a disengagement point, then we discard
        // it. In either case, we discard all timestamps after the currently iterated one because they are guaranteed
        // to be at least as old as it and so would also fall outside the window.
        if ((this.engagementTimeQueue.length - i) % 2 === 1) {
          this.engagementTimeQueue[i] = this.engagementTimeWindow;
          this.engagementTimeQueue.length = i + 1;
        } else {
          this.engagementTimeQueue.length = i;
        }
        break;
      } else {
        this.engagementTimeQueue[i] = time;
      }
    }

    // If the most recent timestamp in the queue is an engagement point and ESP is not currently engaged, or if the
    // most recent timestamp is a disengagement point (or doesn't exist) and ESP is currently engaged, then we need to
    // queue a new timestamp to represent a disengagement or engagement point, respectively.
    if (this.isEngaged !== (this.engagementTimeQueue.length % 2 === 1)) {
      this.engagementTimeQueue.unshift(0);
    }

    // Use the engagement time queue to count the total amount of time ESP has been engaged within the engagement time
    // window.

    this.engagementTime = 0;
    let engagedSegmentStart: number | null = null;
    for (let i = this.engagementTimeQueue.length - 1; i >= 0; i--) {
      if (engagedSegmentStart === null) {
        engagedSegmentStart = this.engagementTimeQueue[i];
      } else {
        this.engagementTime += engagedSegmentStart - this.engagementTimeQueue[i];
        engagedSegmentStart = null;
      }
    }

    // If the last iterated timestamp (the first timestamp in the queue) was an engagement point, then that means ESP
    // is currently engaged. Therefore, we need to count the time between the present and the last iterated timestamp as
    // engagement time.
    if (engagedSegmentStart !== null) {
      this.engagementTime += engagedSegmentStart;
    }
  }

  /**
   * Updates this system's operating mode.
   */
  private updateOperatingMode(): void {
    if (this.isOn) {
      if (this.isFailed) {
        this._operatingMode.set(EspOperatingMode.Failed);
      } else {
        const data = this.dataProvider.data;
        this.isArmed = !data.isArmingInhibited
          && !data.isOnGround
          && !data.isApOn
          && (
            data.isAglValid
              ? data.agl >= (this.isArmed ? this.disarmAglThreshold : this.armAglThreshold)
              : this.canArmWhenAglInvalid
          )
          && data.isAttitudeValid
          && data.pitch >= this.armMinPitchLimit && data.pitch <= this.armMaxPitchLimit
          && Math.abs(data.roll) <= this.armRollLimit;

        if (!this.isArmed) {
          this._operatingMode.set(EspOperatingMode.Disarmed);
        } else if (this.isInterrupted) {
          this._operatingMode.set(EspOperatingMode.Interrupted);
        } else {
          this._operatingMode.set(EspOperatingMode.Armed);
        }
      }
    } else {
      this._operatingMode.set(EspOperatingMode.Off);
    }
  }

  /**
   * Updates this system's modules.
   */
  private updateModules(): void {
    const canEngage = this._operatingMode.get() === EspOperatingMode.Armed;

    for (let i = 0; i < this.modules.length; i++) {
      const module = this.modules[i];
      module.onUpdate(
        this._operatingMode.get(),
        this.dataProvider.data,
        this.forceController
      );

      this.isEngaged ||= canEngage && module.isEngaged();
    }
  }

  /**
   * Updates this system's applied control axis forces.
   * @param dtSec The elapsed time since the last update, in seconds.
   */
  private updateControlAxisForces(dtSec: number): void {
    let pitchAxisForceTarget = 0;
    let pitchAxisForceRate: number;
    let rollAxisForceTarget = 0;
    let rollAxisForceRate: number;

    if (this._operatingMode.get() === EspOperatingMode.Armed) {
      pitchAxisForceTarget = MathUtils.clamp(this.desiredPitchAxisForce, -this.pitchAxisMaxForceUp, this.pitchAxisMaxForceDown);
      pitchAxisForceRate = this.pitchAxisForceRate;
      rollAxisForceTarget = MathUtils.clamp(this.desiredRollAxisForce, -this.rollAxisMaxForce, this.rollAxisMaxForce);
      rollAxisForceRate = this.rollAxisForceRate;
    } else {
      pitchAxisForceRate = this.pitchAxisUnloadRate;
      rollAxisForceRate = this.rollAxisUnloadRate;
    }

    const pitchAxisForce = this._pitchAxisForce.get();
    if (pitchAxisForceTarget !== pitchAxisForce) {
      this._pitchAxisForce.set(MathUtils.driveLinear(pitchAxisForce, pitchAxisForceTarget, pitchAxisForceRate, dtSec));
    }

    const rollAxisForce = this._rollAxisForce.get();
    if (rollAxisForceTarget !== rollAxisForce) {
      this._rollAxisForce.set(MathUtils.driveLinear(rollAxisForce, rollAxisForceTarget, rollAxisForceRate, dtSec));
    }
  }

  /**
   * Pauses this system. The system will be resumed the next time `update()` is called.
   * @throws Error if this system has been destroyed.
   */
  public pause(): void {
    if (!this.isAlive) {
      throw new Error('Esp: cannot update a dead system');
    }

    if (!this.isInit || this.isPaused) {
      return;
    }

    this.isPaused = true;

    this.lastUpdateTime = undefined;

    for (let i = 0; i < this.modules.length; i++) {
      const module = this.modules[i];
      module.onPause();
    }
  }

  /**
   * Destroys this system. Once destroyed, this system can no longer be initialized, updated, or manipulated.
   */
  public destroy(): void {
    if (!this.isAlive) {
      return;
    }

    this.isAlive = false;

    for (const module of this.modules) {
      module.onDestroy();
    }
  }
}
