import { EventBus } from '../../data/EventBus';
import { SimVarValueType } from '../../data/SimVars';
import { MathUtils } from '../../math/MathUtils';
import { SimpleMovingAverage } from '../../math/SimpleMovingAverage';
import { Accessible } from '../../sub/Accessible';
import { Subscribable } from '../../sub/Subscribable';
import { SubscribableUtils } from '../../sub/SubscribableUtils';
import { VNavVars } from '../vnav/VNavEvents';
import { VNavUtils } from '../vnav/VNavUtils';
import { DirectorState, PlaneDirector } from './PlaneDirector';

/**
 * Vertical navigation guidance for {@link APVNavPathDirector}.
 */
export type APVNavPathDirectorGuidance = {
  /** Whether this guidance is valid. */
  isValid: boolean;

  /**
   * The flight path angle of the vertical track, in degrees. Positive angles indicate a downward-sloping
   * track.
   */
  fpa: number;

  /**
   * The deviation of the vertical track from the airplane, in feet. Positive values indicate the track lies above
   * the airplane.
   */
  deviation: number;
};

/**
 * Options for {@link APVNavPathDirector}.
 */
export type APVNavPathDirectorOptions = {
  /**
   * The guidance for the director to use. If not defined, then the director will source guidance data from VNAV
   * SimVars at the index defined by `vnavIndex`.
   */
  guidance?: Accessible<Readonly<APVNavPathDirectorGuidance>>;

  /**
   * The index of the VNAV from which the director should source guidance data from SimVars. Ignored if `guidance` is
   * defined. Defaults to `0`.
   */
  vnavIndex?: number | Subscribable<number>;
};

/**
 * A VNAV Path autopilot director.
 */
export class APVNavPathDirector implements PlaneDirector {

  public state: DirectorState;

  /** @inheritDoc */
  public onActivate?: () => void;

  /** @inheritDoc */
  public onArm?: () => void;

  /** @inheritDoc */
  public onDeactivate?: () => void;

  /** @inheritDoc */
  public drivePitch?: (pitch: number, adjustForAoa?: boolean, adjustForVerticalWind?: boolean) => void;

  protected verticalWindAverage = new SimpleMovingAverage(10);

  protected readonly guidance?: Accessible<Readonly<APVNavPathDirectorGuidance>>;

  protected readonly vnavIndex?: Subscribable<number>;

  protected deviationSimVar: string = VNavVars.VerticalDeviation;
  protected fpaSimVar: string = VNavVars.FPA;

  protected readonly isGuidanceValidFunc: () => boolean;
  protected readonly getFpaFunc: () => number;
  protected readonly getDeviationFunc: () => number;

  /**
   * Creates a new instance of APVNavPathDirector.
   * @param bus The event bus.
   * @param options Options with which to configure the director.
   */
  public constructor(bus: EventBus, options?: Readonly<APVNavPathDirectorOptions>) {
    if (options?.guidance) {
      this.guidance = options.guidance;

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.isGuidanceValidFunc = () => this.guidance!.get().isValid;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.getFpaFunc = () => this.guidance!.get().fpa;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.getDeviationFunc = () => this.guidance!.get().deviation;
    } else {
      this.vnavIndex = SubscribableUtils.toSubscribable(options?.vnavIndex ?? 0, true);
      this.vnavIndex.sub(index => {
        if (VNavUtils.isValidVNavIndex(index)) {
          const suffix = index === 0 ? '' : `:${index}`;
          this.deviationSimVar = `${VNavVars.VerticalDeviation}${suffix}`;
          this.fpaSimVar = `${VNavVars.FPA}${suffix}`;
        }
      });

      this.isGuidanceValidFunc = () => true;
      this.getFpaFunc = SimVar.GetSimVarValue.bind(undefined, this.fpaSimVar, SimVarValueType.Degree);
      this.getDeviationFunc = SimVar.GetSimVarValue.bind(undefined, this.deviationSimVar, SimVarValueType.Feet);
    }

    this.state = DirectorState.Inactive;
  }

  /** @inheritDoc */
  public activate(): void {
    this.state = DirectorState.Active;
    SimVar.SetSimVarValue('AUTOPILOT PITCH HOLD', 'Bool', 0);
    if (this.onActivate !== undefined) {
      this.onActivate();
    }
  }

  /** @inheritDoc */
  public arm(): void {
    if (this.state === DirectorState.Inactive) {
      this.state = DirectorState.Armed;
      if (this.onArm !== undefined) {
        this.onArm();
      }
    }
  }

  /** @inheritDoc */
  public deactivate(): void {
    this.state = DirectorState.Inactive;
    this.onDeactivate && this.onDeactivate();
  }

  /** @inheritDoc */
  public update(): void {
    if (this.state === DirectorState.Active) {
      if (!this.isGuidanceValidFunc()) {
        this.deactivate();
        return;
      }

      this.drivePitch && this.drivePitch(this.getDesiredPitch(), true, true);
    }
  }

  /**
   * Gets a desired pitch from the FPA, AOA and Deviation.
   * @returns The desired pitch angle.
   */
  protected getDesiredPitch(): number {
    // FPA uses positive-down convention.
    const fpa = this.getFpaFunc();
    // Deviation is positive if the path lies above the airplane.
    const deviation = this.getDeviationFunc();

    const groundSpeed = SimVar.GetSimVarValue('GROUND VELOCITY', SimVarValueType.Knots);

    const fpaPercentage = Math.max(deviation / (VNavUtils.getPathErrorDistance(groundSpeed) * -1), -1) + 1;

    // We limit desired pitch to avoid divebombing if something like a flight plan change suddenly puts you way above the path
    return Math.min(MathUtils.clamp(fpa * fpaPercentage, -1, fpa + 3), 10);
  }
}