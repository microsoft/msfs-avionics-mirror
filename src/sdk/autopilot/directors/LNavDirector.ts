import { EventBus } from '../../data/EventBus';
import { SimVarValueType } from '../../data/SimVars';
import { FlightPlanner } from '../../flightplan/FlightPlanner';
import { NavSourceType } from '../../instruments/NavProcessor';
import { MathUtils } from '../../math/MathUtils';
import { Subject } from '../../sub/Subject';
import { APValues } from '../APConfig';
import { LNavComputer, LNavInterceptFunc } from '../lnav/LNavComputer';
import { LNavOverrideModule } from '../lnav/LNavOverrideModule';
import { LNavState, LNavSteerCommand } from '../lnav/LNavTypes';
import { DirectorState, ObsDirector, PlaneDirector } from './PlaneDirector';

/**
 * Calculates an intercept angle, in degrees, to capture the desired GPS track for {@link LNavDirector}.
 * @param dtk The desired track, in degrees true.
 * @param xtk The cross-track error, in nautical miles. Negative values indicate that the plane is to the left of the
 * desired track.
 * @param tas The true airspeed of the plane, in knots.
 * @returns The intercept angle, in degrees, to capture the desired track from the navigation signal.
 */
export type LNavDirectorInterceptFunc = LNavInterceptFunc;

/**
 * Options for {@link LNavDirector}.
 */
export type LNavDirectorOptions = {
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
   * A function used to translate DTK and XTK into a track intercept angle. If not defined, a function that computes
   * a default curve tuned for slow GA aircraft will be used.
   */
  lateralInterceptCurve?: LNavDirectorInterceptFunc;

  /**
   * Whether the director supports vector anticipation. If `true`, the director will begin tracking the next flight
   * path vector in advance based on the predicted amount of time required to transition to the new bank angle required
   * to track the upcoming vector. Defaults to `false`.
   */
  hasVectorAnticipation?: boolean;

  /**
   * The bank rate used to determine the vector anticipation distance, in degrees per second. Ignored if
   * `hasVectorAnticipation` is `false`. Defaults to `5`.
   */
  vectorAnticipationBankRate?: number;

  /**
   * The minimum radio altitude, in feet, required for the director to activate, or `undefined` if there is no minimum
   * altitude. Defaults to `undefined`.
   */
  minimumActivationAltitude?: number | undefined;

  /**
   * Whether to disable arming on the director. If `true`, the director will always skip the arming phase and instead
   * immediately activate itself when requested. Defaults to `false`.
   */
  disableArming?: boolean;

  /**
   * Whether to disable auto-suspend at the missed approach point. If `true`, the director will not suspend sequencing
   * once the missed approach point is the active leg. Defaults to `false`.
   */
  disableAutoSuspendAtMissedApproachPoint?: boolean;
};

/**
 * An autopilot director that calculates and follows lateral navigation guidance for an active flight plan.
 * @deprecated
 */
export class LNavDirector implements PlaneDirector {
  public state: DirectorState;

  /** @inheritdoc */
  public onActivate?: () => void;

  /** @inheritdoc */
  public onArm?: () => void;

  /** @inheritdoc */
  public driveBank?: (bank: number, rate?: number) => void;

  private canArm = false;

  private readonly isNavLock = Subject.create<boolean>(false);

  private readonly obsModule?: LNavDirectorObsModule;
  private readonly computer: LNavComputer;

  private readonly maxBankAngleFunc: () => number;
  private readonly driveBankFunc: (bank: number) => void;
  private readonly minimumActivationAltitude: number | undefined;
  private readonly disableArming: boolean;

  /**
   * Creates a new instance of LNavDirector.
   * @param bus The event bus.
   * @param apValues Autopilot values from this director's parent autopilot.
   * @param flightPlanner The flight planner from which to source the active flight plan.
   * @param obsDirector The director used to track OBS courses.
   * @param options Options to configure the new director.
   */
  public constructor(
    private readonly bus: EventBus,
    private readonly apValues: APValues,
    private readonly flightPlanner: FlightPlanner,
    private readonly obsDirector?: ObsDirector,
    options?: Partial<Readonly<LNavDirectorOptions>>
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

    this.minimumActivationAltitude = options?.minimumActivationAltitude;
    this.disableArming = options?.disableArming ?? false;

    this.obsModule = this.obsDirector
      ? new LNavDirectorObsModule(this.obsDirector, this.flightPlanner, this.onObsDirectorActivate.bind(this))
      : undefined;

    this.computer = new LNavComputer(
      0,
      this.bus,
      this.flightPlanner,
      this.obsModule,
      {
        maxBankAngle: this.maxBankAngleFunc,
        intercept: options?.lateralInterceptCurve,
        hasVectorAnticipation: options?.hasVectorAnticipation,
        vectorAnticipationBankRate: options?.vectorAnticipationBankRate,
        disableAutoSuspendAtMissedApproachPoint: options?.disableAutoSuspendAtMissedApproachPoint
      }
    );

    this.isNavLock.sub(newState => {
      SimVar.SetSimVarValue('AUTOPILOT NAV1 LOCK', SimVarValueType.Bool, newState);
    });

    if (this.obsDirector !== undefined) {
      this.obsDirector.driveBank = this.obsDriveBank.bind(this);
    }

    this.state = DirectorState.Inactive;
  }

  /** @inheritDoc */
  public activate(): void {
    this.state = DirectorState.Active;
    if (this.onActivate !== undefined) {
      this.onActivate();
    }
    this.isNavLock.set(true);
  }

  /** @inheritDoc */
  public arm(): void {
    if (this.state === DirectorState.Inactive) {
      if (this.canArm) {
        this.state = DirectorState.Armed;
        if (this.onArm !== undefined) {
          this.onArm();
        }
        this.isNavLock.set(true);
      }
    }
  }

  /** @inheritDoc */
  public deactivate(): void {
    this.state = DirectorState.Inactive;
    if (this.obsDirector && this.obsDirector.state !== DirectorState.Inactive) {
      this.obsDirector.deactivate();
    }
    this.isNavLock.set(false);
  }

  /** @inheritDoc */
  public update(): void {
    this.obsModule?.setParentDirectorState(this.state);
    this.computer.update();

    const command = this.computer.steerCommand.get();

    // The OBS director handles bank angle commands while it is active.
    if (this.obsModule && this.obsModule.isActive()) {
      return;
    }

    this.canArm = command.isValid;

    if (this.canArm) {
      if (this.state === DirectorState.Active) {
        // If the CDI source is not GPS, then deactivate self unless a nav-to-nav CDI switch is in progress.
        if (
          this.apValues.cdiSource.get()?.type !== NavSourceType.Gps
          && (!this.apValues.navToNavTransferInProgress?.())
        ) {
          this.deactivate();
          return;
        }

        const maxBankAngle = this.maxBankAngleFunc();
        const desiredBank = MathUtils.clamp(command.desiredBankAngle, -maxBankAngle, maxBankAngle);

        if (isFinite(desiredBank)) {
          this.driveBankFunc(desiredBank);
        }
      }
    }

    if (this.state === DirectorState.Armed) {
      this.tryActivate();
    }
  }

  /**
   * Attempts to activate this director from an armed state.
   */
  private tryActivate(): void {
    if (this.disableArming) {
      this.activate();
      return;
    }

    const command = this.computer.steerCommand.get();

    if (
      Math.abs(command.xtk) < 0.6
      && Math.abs(command.tae) < 110
      && (this.minimumActivationAltitude === undefined || SimVar.GetSimVarValue('RADIO HEIGHT', SimVarValueType.Feet) >= this.minimumActivationAltitude)
    ) {
      this.activate();
    }
  }

  /**
   * Responds to when this director's child OBS director is activated.
   */
  private onObsDirectorActivate(): void {
    if (this.state !== DirectorState.Active) {
      this.activate();
    }
  }

  /**
   * A method to support the OBS director's `driveBank()` method.
   * @param bank The desired bank angle, in degrees. Positive values indicate left bank.
   * @param rate The rate at which to drive the commanded bank angle, in degrees per second. If not defined, a default
   * rate will be used.
   */
  private obsDriveBank(bank: number, rate?: number): void {
    this.driveBank && this.driveBank(bank, rate);
  }
}

/**
 * An LNAV computer module for {@link LNavDirector} that wraps an OBS director.
 */
class LNavDirectorObsModule implements LNavOverrideModule {

  private parentDirectorState: DirectorState = DirectorState.Inactive;

  private readonly steerCommand: LNavSteerCommand = {
    isValid: false,
    desiredBankAngle: 0,
    dtk: 0,
    xtk: 0,
    tae: 0
  };

  private _isActive = false;

  /**
   * Creates a new instance of LNavDirectorObsModule.
   * @param obsDirector The director used to track OBS courses.
   * @param flightPlanner The flight planner from which to source the active flight plan.
   * @param onObsDirectorActivate A function which will be called when the OBS director is activated.
   */
  public constructor(
    private readonly obsDirector: ObsDirector,
    private readonly flightPlanner: FlightPlanner,
    private readonly onObsDirectorActivate: () => void
  ) {
  }

  /** @inheritDoc */
  public getSteerCommand(): Readonly<LNavSteerCommand> {
    return this.steerCommand;
  }

  /** @inheritDoc */
  public isActive(): boolean {
    return this._isActive;
  }

  /**
   * Sets this module's parent director state.
   * @param state The state of the parent director.
   */
  public setParentDirectorState(state: DirectorState): void {
    this.parentDirectorState = state;
  }

  /** @inheritDoc */
  public canActivate(): boolean {
    return this.obsDirector.obsActive;
  }

  /** @inheritDoc */
  public activate(lnavState: LNavState): void {
    if (this._isActive) {
      return;
    }

    this._isActive = true;

    lnavState.isSuspended = true;
    lnavState.inhibitedSuspendLegIndex = lnavState.globalLegIndex;

    this.obsDirector.startTracking();
  }

  /** @inheritDoc */
  public deactivate(lnavState: LNavState): void {
    if (!this._isActive) {
      return;
    }

    this._isActive = false;

    this.obsDirector.stopTracking();

    lnavState.isSuspended = false;
  }

  /** @inheritDoc */
  public update(lnavState: LNavState): void {
    const flightPlan = this.flightPlanner.hasActiveFlightPlan() ? this.flightPlanner.getActiveFlightPlan() : undefined;
    const leg = flightPlan ? flightPlan.tryGetLeg(lnavState.globalLegIndex) : null;

    this.obsDirector.setLeg(lnavState.globalLegIndex, leg);

    if (this._isActive) {
      if (this.parentDirectorState === DirectorState.Active && this.obsDirector.state !== DirectorState.Active) {
        this.obsDirector.activate();
        this.onObsDirectorActivate();
      }

      if (this.parentDirectorState === DirectorState.Armed && this.obsDirector.canActivate()) {
        this.obsDirector.activate();
        this.onObsDirectorActivate();
      }

      this.obsDirector.update();
    }
  }
}
