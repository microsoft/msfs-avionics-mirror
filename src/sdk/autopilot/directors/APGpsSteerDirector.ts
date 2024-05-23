import { EventBus } from '../../data/EventBus';
import { SimVarValueType } from '../../data/SimVars';
import { NavSourceType } from '../../instruments/NavProcessor';
import { MathUtils } from '../../math/MathUtils';
import { Accessible } from '../../sub/Accessible';
import { Subject } from '../../sub/Subject';
import { APValues } from '../APConfig';
import { DirectorState, PlaneDirector } from './PlaneDirector';

/**
 * A steering command for {@link APGpsSteerDirector}.
 */
export type APGpsSteerDirectorSteerCommand = {
  /** Whether this command is valid. */
  isValid: boolean;

  /** The desired bank angle, in degrees. Positive values indicate left bank. */
  desiredBankAngle: number;

  /** The current desired track, in degrees true. */
  dtk: number;

  /**
   * The current cross-track error, in nautical miles. Positive values indicate that the plane is to the right of the
   * desired track.
   */
  xtk: number;

  /** The current track angle error, in degrees in the range `[-180, 180)`. */
  tae: number;
};

/**
 * An object describing a state used to determine whether {@link APGpsSteerDirector} can be activated.
 */
export type APGpsSteerDirectorActivateState = {
  /**
   * The current cross-track error, in nautical miles. Positive values indicate that the plane is to the right of the
   * desired track.
   */
  xtk: number;

  /** The current track angle error, in degrees in the range `[-180, 180)`. */
  tae: number;

  /** The airplane's current radio altitude, in feet. */
  radioAltitude: number;
};

/**
 * Options for {@link APGpsSteerDirector}.
 */
export type APGpsSteerDirectorOptions = {
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

  /** A function which determines whether the director can be activated from an armed state. */
  canActivate?: (state: Readonly<APGpsSteerDirectorActivateState>) => boolean;

  /**
   * Whether to disable arming on the director. If `true`, then the director will skip the arming phase and instead
   * immediately activate itself when requested. Defaults to `false`.
   */
  disableArming?: boolean;
};

/**
 * An autopilot GPS roll-steering director.
 */
export class APGpsSteerDirector implements PlaneDirector {
  public state: DirectorState;

  /** @inheritdoc */
  public onActivate?: () => void;

  /** @inheritdoc */
  public onArm?: () => void;

  /** @inheritdoc */
  public driveBank?: (bank: number, rate?: number) => void;

  private canArm = false;

  private readonly isNavLock = Subject.create<boolean>(false);

  private readonly activateState: APGpsSteerDirectorActivateState = {
    xtk: 0,
    tae: 0,
    radioAltitude: 0
  };

  private readonly maxBankAngleFunc: () => number;
  private readonly driveBankFunc: (bank: number) => void;
  private readonly canActivateFunc: (state: Readonly<APGpsSteerDirectorActivateState>) => boolean;
  private readonly disableArming: boolean;

  /**
   * Creates a new instance of APGpsSteerDirector.
   * @param bus The event bus.
   * @param apValues Autopilot values from this director's parent autopilot.
   * @param steerCommand The steering command used by this director.
   * @param options Options to configure the new director.
   */
  public constructor(
    private readonly bus: EventBus,
    private readonly apValues: APValues,
    private readonly steerCommand: Accessible<Readonly<APGpsSteerDirectorSteerCommand>>,
    options?: Readonly<APGpsSteerDirectorOptions>
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

    this.canActivateFunc = options?.canActivate ?? (() => true);
    this.disableArming = options?.disableArming ?? false;

    this.isNavLock.sub(newState => {
      SimVar.SetSimVarValue('AUTOPILOT NAV1 LOCK', SimVarValueType.Bool, newState);
    });

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
    this.isNavLock.set(false);
  }

  /** @inheritDoc */
  public update(): void {
    const command = this.steerCommand.get();

    this.canArm = command.isValid;

    if (this.canArm) {
      if (this.state === DirectorState.Armed) {
        this.tryActivate(command);
      }

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
    } else {
      this.deactivate();
    }
  }

  /**
   * Attempts to activate this director from an armed state.
   * @param command The current steering command used by this director.
   */
  private tryActivate(command: Readonly<APGpsSteerDirectorSteerCommand>): void {
    if (this.disableArming) {
      this.activate();
      return;
    }

    this.activateState.xtk = command.xtk;
    this.activateState.tae = command.tae;
    this.activateState.radioAltitude = SimVar.GetSimVarValue('RADIO HEIGHT', SimVarValueType.Feet);

    if (this.canActivateFunc(this.activateState)) {
      this.activate();
    }
  }
}