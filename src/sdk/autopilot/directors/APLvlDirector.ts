import { EventBus } from '../../data/EventBus';
import { APValues } from '../APConfig';
import { DirectorState, PlaneDirector } from './PlaneDirector';

/**
 * Options for {@link APLvlDirector}.
 */
export type APLvlDirectorOptions = {
  /**
   * The bank rate to enforce when the director commands changes in bank angle, in degrees per second, or a function
   * which returns it. If not undefined, a default bank rate will be used. Defaults to `undefined`.
   */
  bankRate?: number | (() => number) | undefined;

  /**
   * Whether the director is to be used as a TO/GA lateral mode. If `true`, the director will not control the
   * `AUTOPILOT HEADING LOCK` simvar. Defaults to `false`.
   */
  isToGaMode?: boolean;
};

/**
 * An autopilot wing leveler director.
 */
export class APLvlDirector implements PlaneDirector {
  public state: DirectorState;

  /** @inheritdoc */
  public onActivate?: () => void;

  /** @inheritdoc */
  public onArm?: () => void;

  /** @inheritdoc */
  public driveBank?: (bank: number, rate?: number) => void;

  private readonly driveBankFunc: (bank: number) => void;

  private readonly isToGaMode: boolean;

  /**
   * Creates an instance of the wing leveler.
   * @param bus The event bus to use with this instance.
   * @param apValues Autopilot values from this director's parent autopilot.
   * @param options Options to configure the new director.
   */
  constructor(
    private readonly bus: EventBus,
    private readonly apValues: APValues,
    options?: Readonly<APLvlDirectorOptions>
  ) {
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

    this.isToGaMode = options?.isToGaMode ?? false;

    this.state = DirectorState.Inactive;
  }

  /**
   * Activates this director.
   */
  public activate(): void {
    this.state = DirectorState.Active;
    if (this.onActivate !== undefined) {
      this.onActivate();
    }
    if (!this.isToGaMode) { SimVar.SetSimVarValue('AUTOPILOT WING LEVELER', 'Bool', true); }
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
    if (!this.isToGaMode) { SimVar.SetSimVarValue('AUTOPILOT WING LEVELER', 'Bool', false); }
  }

  /**
   * Updates this director.
   */
  public update(): void {
    if (this.state === DirectorState.Active) {
      this.driveBankFunc(0);
    }
  }
}