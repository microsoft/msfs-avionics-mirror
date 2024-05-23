import { EventBus } from '../../data/EventBus';
import { SimVarValueType } from '../../data/SimVars';
import { Accessible } from '../../sub/Accessible';
import { Subscribable } from '../../sub/Subscribable';
import { SubscribableUtils } from '../../sub/SubscribableUtils';
import { APLateralModes, APValues } from '../APConfig';
import { ApproachGuidanceMode } from '../VerticalNavigation';
import { VNavVars } from '../vnav/VNavEvents';
import { VNavUtils } from '../vnav/VNavUtils';
import { DirectorState, PlaneDirector } from './PlaneDirector';

/**
 * Glidepath guidance for {@link APGPDirector}.
 */
export type APGPDirectorGuidance = {
  /** Whether this guidance is valid. */
  isValid: boolean;

  /** The flight path angle of the glidepath, in degrees. Positive angles indicate a downward-sloping path. */
  fpa: number;

  /**
   * The deviation of the glidepath from the airplane, in feet. Positive values indicate the path lies above the
   * airplane.
   */
  deviation: number;
};

/**
 * Options for {@link APGPDirector}.
 */
export type APGPDirectorOptions = {
  /**
   * The guidance for the director to use. If not defined, then the director will source guidance data from VNAV
   * SimVars at the index defined by `vnavIndex`.
   */
  guidance?: Accessible<Readonly<APGPDirectorGuidance>>;

  /**
   * The index of the VNAV from which the director should source guidance data from SimVars. Ignored if `guidance` is
   * defined. Defaults to `0`.
   */
  vnavIndex?: number | Subscribable<number>;

  /**
   * A function which checks if the director can capture a glidepath from an armed state. If not defined, then the
   * director will capture if the autopilot's active lateral mode is `APLateralModes.GPSS`, the glidepath's flight
   * path angle is greater than zero, and deviation is between 100 and -15 feet.
   */
  canCapture?: (fpa: number, deviation: number) => boolean;

  /**
   * A function which checks if the director can continue tracking a glidepath. If not defined, then the director will
   * continue tracking as long as the autopilot's active lateral mode is `APLateralModes.GPSS`.
   */
  canTrack?: (fpa: number, deviation: number) => boolean;
};

/**
 * An RNAV LPV glidepath autopilot director.
 */
export class APGPDirector implements PlaneDirector {

  public state: DirectorState;

  /** @inheritDoc */
  public onActivate?: () => void;

  /** @inheritDoc */
  public onArm?: () => void;

  /** @inheritDoc */
  public drivePitch?: (pitch: number, adjustForAoa?: boolean, adjustForVerticalWind?: boolean) => void;

  private readonly guidance?: Accessible<Readonly<APGPDirectorGuidance>>;

  private readonly vnavIndex?: Subscribable<number>;

  private deviationSimVar: string = VNavVars.GPVerticalDeviation;
  private fpaSimVar: string = VNavVars.GPFpa;

  private readonly isGuidanceValidFunc: () => boolean;
  private readonly getFpaFunc: () => number;
  private readonly getDeviationFunc: () => number;

  private readonly canCaptureFunc: (fpa: number, deviation: number) => boolean;
  private readonly canTrackFunc: (fpa: number, deviation: number) => boolean;

  /**
   * Creates a new instance of APGPDirector.
   * @param bus The event bus.
   * @param apValues Autopilot values from this director's parent autopilot.
   * @param options Options with which to configure the director.
   */
  public constructor(
    bus: EventBus,
    private readonly apValues: APValues,
    options?: Readonly<APGPDirectorOptions>
  ) {
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
          this.deviationSimVar = `${VNavVars.GPVerticalDeviation}${suffix}`;
          this.fpaSimVar = `${VNavVars.GPFpa}${suffix}`;
        }
      });

      this.isGuidanceValidFunc = () => true;
      this.getFpaFunc = SimVar.GetSimVarValue.bind(undefined, this.fpaSimVar, SimVarValueType.Degree);
      this.getDeviationFunc = SimVar.GetSimVarValue.bind(undefined, this.deviationSimVar, SimVarValueType.Feet);
    }

    this.canCaptureFunc = options?.canCapture ?? APGPDirector.defaultCanCapture.bind(undefined, this.apValues);
    this.canTrackFunc = options?.canTrack ?? APGPDirector.defaultCanTrack.bind(undefined, this.apValues);

    this.state = DirectorState.Inactive;

    apValues.approachHasGP.sub(hasGp => {
      if (this.state !== DirectorState.Inactive && !hasGp) {
        this.deactivate();
      }
    });
  }

  /** @inheritDoc */
  public activate(): void {
    this.state = DirectorState.Active;
    SimVar.SetSimVarValue(VNavVars.GPApproachMode, SimVarValueType.Number, ApproachGuidanceMode.GPActive);
    if (this.onActivate !== undefined) {
      this.onActivate();
    }
    SimVar.SetSimVarValue('AUTOPILOT GLIDESLOPE ACTIVE', 'Bool', true);
    SimVar.SetSimVarValue('AUTOPILOT APPROACH ACTIVE', 'Bool', true);
    SimVar.SetSimVarValue('AUTOPILOT GLIDESLOPE ARM', 'Bool', false);
  }

  /** @inheritDoc */
  public arm(): void {
    if (this.state === DirectorState.Inactive) {
      this.state = DirectorState.Armed;
      SimVar.SetSimVarValue(VNavVars.GPApproachMode, SimVarValueType.Number, ApproachGuidanceMode.GPArmed);
      if (this.onArm !== undefined) {
        this.onArm();
      }
      SimVar.SetSimVarValue('AUTOPILOT GLIDESLOPE ARM', 'Bool', true);
      SimVar.SetSimVarValue('AUTOPILOT GLIDESLOPE ACTIVE', 'Bool', false);
      SimVar.SetSimVarValue('AUTOPILOT APPROACH ACTIVE', 'Bool', true);
    }
  }

  /** @inheritDoc */
  public deactivate(): void {
    this.state = DirectorState.Inactive;
    SimVar.SetSimVarValue(VNavVars.GPApproachMode, SimVarValueType.Number, ApproachGuidanceMode.None);
    SimVar.SetSimVarValue('AUTOPILOT GLIDESLOPE ARM', 'Bool', false);
    SimVar.SetSimVarValue('AUTOPILOT GLIDESLOPE ACTIVE', 'Bool', false);
    SimVar.SetSimVarValue('AUTOPILOT APPROACH ACTIVE', 'Bool', false);
  }

  /** @inheritDoc */
  public update(): void {
    const isGuidanceValid = this.isGuidanceValidFunc();
    let deviation: number | undefined;
    let fpa: number | undefined;

    if (this.state === DirectorState.Armed) {
      fpa = this.getFpaFunc();
      deviation = this.getDeviationFunc();

      if (isGuidanceValid && this.canCaptureFunc(fpa, deviation)) {
        this.activate();
      }
    }

    if (this.state === DirectorState.Active) {
      fpa ??= this.getFpaFunc();
      deviation ??= this.getDeviationFunc();

      if (!isGuidanceValid || !this.canTrackFunc(fpa, deviation)) {
        this.deactivate();
        return;
      }

      const groundSpeed = SimVar.GetSimVarValue('GROUND VELOCITY', SimVarValueType.Knots);
      const fpaPercentage = Math.max(deviation / (VNavUtils.getPathErrorDistance(groundSpeed) * -1), -1) + 1;
      this.drivePitch && this.drivePitch(fpa * fpaPercentage, true, true);
    }
  }

  /**
   * Checks whether the director can capture a glidepath from an armed state using default logic.
   * @param apValues Autopilot values.
   * @param fpa The flight path angle of the glidepath, in degrees. Positive angles indicate a downward-sloping path.
   * @param deviation The deviation of the glidepath from the airplane, in feet. Positive values indicate the path lies
   * above the airplane.
   * @returns Whether the director can capture the glidepath.
   */
  private static defaultCanCapture(apValues: APValues, fpa: number, deviation: number): boolean {
    return apValues.lateralActive.get() === APLateralModes.GPSS
      && fpa > 0
      && deviation <= 100
      && deviation >= -15;
  }

  /**
   * Checks whether the director can continue tracking a glidepath using default logic.
   * @param apValues Autopilot values.
   * @returns Whether the director can continuing tracking the glidepath.
   */
  private static defaultCanTrack(apValues: APValues): boolean {
    return apValues.lateralActive.get() === APLateralModes.GPSS;
  }
}