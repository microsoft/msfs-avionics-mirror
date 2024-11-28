import { MathUtils } from '../../math/MathUtils';
import { Accessible } from '../../sub/Accessible';
import { APValues } from '../APValues';
import { DirectorState, PlaneDirector } from './PlaneDirector';

/**
 * A steering command for {@link APRollSteerDirector}.
 */
export type APRollSteerDirectorSteerCommand = {
  /** Whether this command is valid. */
  isValid: boolean;

  /** The desired bank angle, in degrees. Positive values indicate leftward bank. */
  desiredBankAngle: number;
};

/**
 * An object describing the state of an {@link APRollSteerDirector}.
 */
export type APRollSteerDirectorState = {
  /** The current steering command used by the director. */
  steerCommand: Readonly<APRollSteerDirectorSteerCommand>;
};

/**
 * Options for {@link APRollSteerDirector}.
 */
export type APRollSteerDirectorOptions = {
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
   * A function that is called when the director is armed.
   * @param apValues Autopilot values from the director's parent autopilot.
   * @param state Data describing the state of the director.
   */
  onArm?: (apValues: APValues, state: Readonly<APRollSteerDirectorState>) => void;

  /**
   * A function that is called when the director is activated.
   * @param apValues Autopilot values from the director's parent autopilot.
   * @param state Data describing the state of the director.
   */
  onActivate?: (apValues: APValues, state: Readonly<APRollSteerDirectorState>) => void;

  /**
   * A function that is called when the director is deactivated.
   * @param apValues Autopilot values from the director's parent autopilot.
   * @param state Data describing the state of the director.
   */
  onDeactivate?: (apValues: APValues, state: Readonly<APRollSteerDirectorState>) => void;

  /**
   * A function that determines whether the director can remain active once it has already been activated.
   * @param apValues Autopilot values from the director's parent autopilot.
   * @param state Data describing the state of the director.
   * @returns Whether the director can remain active once it has already been activated.
   */
  canArm?: (apValues: APValues, state: Readonly<APRollSteerDirectorState>) => boolean;

  /**
   * A function that determines whether the director can remain active once it has already been activated.
   * @param apValues Autopilot values from the director's parent autopilot.
   * @param state Data describing the state of the director.
   * @returns Whether the director can remain active once it has already been activated.
   */
  canRemainArmed?: (apValues: APValues, state: Readonly<APRollSteerDirectorState>) => boolean;

  /**
   * A function that determines whether the director can activate from an armed state.
   * @param apValues Autopilot values from the director's parent autopilot.
   * @param state Data describing the state of the director.
   * @returns Whether the director can remain active once it has already been activated.
   */
  canActivate?: (apValues: APValues, state: Readonly<APRollSteerDirectorState>) => boolean;

  /**
   * A function that determines whether the director can remain active once it has already been activated.
   * @param apValues Autopilot values from the director's parent autopilot.
   * @param state Data describing the state of the director.
   * @returns Whether the director can remain active once it has already been activated.
   */
  canRemainActive?: (apValues: APValues, state: Readonly<APRollSteerDirectorState>) => boolean;
};

/**
 * An autopilot roll-steering director. This director uses roll-steering commands to drive flight director bank
 * commands.
 */
export class APRollSteerDirector implements PlaneDirector {
  public state: DirectorState;

  /** @inheritDoc */
  public onActivate?: () => void;

  /** @inheritDoc */
  public onArm?: () => void;

  /** @inheritDoc */
  public onDeactivate?: () => void;

  /** @inheritDoc */
  public driveBank?: (bank: number, rate?: number) => void;

  private readonly callbackState: APRollSteerDirectorState = {
    steerCommand: this.steerCommand.get()
  };

  private readonly maxBankAngleFunc: () => number;
  private readonly driveBankFunc: (bank: number) => void;

  private readonly onArmFunc?: (apValues: APValues, state: Readonly<APRollSteerDirectorState>) => void;
  private readonly onActivateFunc?: (apValues: APValues, state: Readonly<APRollSteerDirectorState>) => void;
  private readonly onDeactivateFunc?: (apValues: APValues, state: Readonly<APRollSteerDirectorState>) => void;

  private readonly canArmFunc: (apValues: APValues, state: Readonly<APRollSteerDirectorState>) => boolean;
  private readonly canRemainArmedFunc: (apValues: APValues, state: Readonly<APRollSteerDirectorState>) => boolean;
  private readonly canActivateFunc: (apValues: APValues, state: Readonly<APRollSteerDirectorState>) => boolean;
  private readonly canRemainActiveFunc: (apValues: APValues, state: Readonly<APRollSteerDirectorState>) => boolean;

  /**
   * Creates a new instance of APRollSteerDirector.
   * @param apValues Autopilot values from this director's parent autopilot.
   * @param steerCommand The steering command used by this director.
   * @param options Options to configure the new director.
   */
  public constructor(
    private readonly apValues: APValues,
    private readonly steerCommand: Accessible<Readonly<APRollSteerDirectorSteerCommand>>,
    options?: Readonly<APRollSteerDirectorOptions>
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

    this.onArmFunc = options?.onArm;
    this.onActivateFunc = options?.onActivate;
    this.onDeactivateFunc = options?.onDeactivate;

    this.canArmFunc = options?.canArm ?? ((apValuesInner, state) => state.steerCommand.isValid);
    this.canRemainArmedFunc = options?.canRemainArmed ?? ((apValuesInner, state) => state.steerCommand.isValid);
    this.canActivateFunc = options?.canActivate ?? ((apValuesInner, state) => state.steerCommand.isValid);
    this.canRemainActiveFunc = options?.canRemainActive ?? ((apValuesInner, state) => state.steerCommand.isValid);

    this.state = DirectorState.Inactive;
  }

  /** @inheritDoc */
  public activate(): void {
    this.state = DirectorState.Active;
    this.updateCallbackState();
    this.onActivateFunc && this.onActivateFunc(this.apValues, this.callbackState);
    this.onActivate && this.onActivate();
  }

  /** @inheritDoc */
  public arm(): void {
    if (this.state === DirectorState.Inactive) {
      this.updateCallbackState();
      if (this.canArmFunc(this.apValues, this.callbackState)) {
        this.state = DirectorState.Armed;
        this.onArmFunc && this.onArmFunc(this.apValues, this.callbackState);
        this.onArm && this.onArm();
      }
    }
  }

  /** @inheritDoc */
  public deactivate(): void {
    this.state = DirectorState.Inactive;
    this.updateCallbackState();
    this.onDeactivateFunc && this.onDeactivateFunc(this.apValues, this.callbackState);
    this.onDeactivate && this.onDeactivate();
  }

  /** @inheritDoc */
  public update(): void {
    this.updateCallbackState();

    if (this.state === DirectorState.Armed) {
      if (!this.canRemainArmedFunc(this.apValues, this.callbackState)) {
        this.deactivate();
        return;
      } else {
        this.tryActivate();
      }
    }
    if (this.state === DirectorState.Active) {
      if (!this.canRemainActiveFunc(this.apValues, this.callbackState)) {
        this.deactivate();
        return;
      } else {
        const maxBankAngle = this.maxBankAngleFunc();
        const desiredBankAngle = MathUtils.clamp(this.steerCommand.get().desiredBankAngle, -maxBankAngle, maxBankAngle);

        if (isFinite(desiredBankAngle)) {
          this.driveBankFunc(desiredBankAngle);
        }
      }
    }
  }

  /**
   * Updates this director's callback state.
   */
  private updateCallbackState(): void {
    this.callbackState.steerCommand = this.steerCommand.get();
  }

  /**
   * Attempts to activate this director from an armed state.
   */
  private tryActivate(): void {
    if (this.canActivateFunc(this.apValues, this.callbackState)) {
      this.activate();
    }
  }
}
