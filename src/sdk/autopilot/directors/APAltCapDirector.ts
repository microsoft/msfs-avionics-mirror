/// <reference types="@microsoft/msfs-types/js/simvar" />

import { SimVarValueType } from '../../data/SimVars';
import { MathUtils } from '../../math/MathUtils';
import { UnitType } from '../../math/NumberUnit';
import { DebounceTimer } from '../../utils/time/DebounceTimer';
import { APValues } from '../APValues';
import { VNavUtils } from '../vnav/VNavUtils';
import { DirectorState, PlaneDirector } from './PlaneDirector';

/**
 * Options for {@link APAltCapDirector}.
 */
export type APAltCapDirectorOptions = {

  /**
   * An optional function that contains the logic for the capturing. Has to return the desired pitch as input for the pitch controller.
   */
  captureAltitude: APAltCapDirectorCaptureFunc | undefined;

  /**
   * A function that returns true if the capturing shall start.
   */
  shouldActivate: APAltCapDirectorActivationFunc | undefined;

  /**
   * The time to inhibit altitude capture when the target altitude is changed, in ms.
   * Setting the time to null disables inhibition.
   * Defaults to 500 ms.
   * Note that if alt capture is already active when the target is changed, this will have no effect.
   */
  targetChangeInhibitTime: number | null;
};

/**
 * A function which calculates a desired pitch angle, in degrees, to capture a target altitude.
 * @param targetAltitude The altitude to capture, in feet.
 * @param indicatedAltitude The current indicated altitude, in feet.
 * @param initialFpa The flight path angle of the airplane, in degrees, when altitude capture was first activated.
 * Positive values indicate a descending path.
 * @param tas The current true airspeed of the airplane, in knots.
 * @returns The desired pitch angle, in degrees, to capture the specified altitude. Positive values indicate nose-up
 * pitch.
 */
export type APAltCapDirectorCaptureFunc = (
  targetAltitude: number,
  indicatedAltitude: number,
  initialFpa: number,
  tas: number
) => number;


/**
 * A function which returns true if the capturing shall be activated
 * @param vs Current vertical speed in [ft/min]
 * @param targetAltitude Target altitude [ft]
 * @param currentAltitude Current altitude [ft]
 * @returns True if the capturing shall be activated
 */
export type APAltCapDirectorActivationFunc = (
  vs: number,
  targetAltitude: number,
  currentAltitude: number) => boolean;

/**
 * An altitude capture autopilot director.
 */
export class APAltCapDirector implements PlaneDirector {
  private static readonly DEFAULT_TARGET_CHANGE_INHIBIT_MS = 500;
  private static readonly EMPTY_FUNCTION = (): void => {};

  private readonly targetChangeInhibitTimer?: DebounceTimer;
  private readonly targetChangeInhibitTime: number | null = APAltCapDirector.DEFAULT_TARGET_CHANGE_INHIBIT_MS;

  public state: DirectorState;

  /** @inheritdoc */
  public onActivate?: () => void;

  /** @inheritdoc */
  public onArm?: () => void;

  /** @inheritdoc */
  public drivePitch?: (pitch: number, adjustForAoa?: boolean, adjustForVerticalWind?: boolean) => void;

  private initialFpa = 0;
  private readonly captureAltitude: APAltCapDirectorCaptureFunc = APAltCapDirector.captureAltitude;
  private readonly shouldActivate: APAltCapDirectorActivationFunc = APAltCapDirector.shouldActivate;

  /**
   * Inhibits altitude capture actrivation for {@link APAltCapDirector.targetChangeInhibitTime}.
   */
  private inhibitAltCapture?: () => void;

  /**
   * Creates an instance of the APAltCapDirector.
   * @param apValues Autopilot data for this director.
   * @param options Optional options object with these:
   * --> shouldActivate: An optional function which returns true if the capturing shall be activated. If not
   * defined, a default function is used.
   * --> captureAltitude: An optional function which calculates desired pitch angles to capture a target altitude. If not
   * defined, a default function is used.
   * --> targetChangeInhibitTime: The time to inhibit altitude capture when the target altitude is changed, in ms.
   * Setting the time to null disables inhibition.
   * Defaults to 500 ms.
   * Note that if alt capture is already active when the target is changed, this will have no effect.
   */
  constructor(
    private readonly apValues: APValues,
    options?: Partial<Readonly<APAltCapDirectorOptions>>
  ) {
    this.state = DirectorState.Inactive;
    if (options?.captureAltitude !== undefined) {
      this.captureAltitude = options.captureAltitude;
    }
    if (options?.shouldActivate !== undefined) {
      this.shouldActivate = options.shouldActivate;
    }
    if (options?.targetChangeInhibitTime !== undefined) {
      this.targetChangeInhibitTime = options.targetChangeInhibitTime;
    }

    if (this.targetChangeInhibitTime !== null) {
      this.targetChangeInhibitTimer = new DebounceTimer();
      this.inhibitAltCapture = () => {
        this.targetChangeInhibitTimer?.schedule(APAltCapDirector.EMPTY_FUNCTION, this.targetChangeInhibitTime!);
      };
      this.apValues.selectedAltitude.sub(this.inhibitAltCapture, false);
    }
  }

  /**
   * Activates this director.
   * @param vs Optionally, the current vertical speed, in FPM.
   * @param alt Optionally, the current indicated altitude, in Feet.
   */
  public activate(vs?: number, alt?: number): void {
    this.state = DirectorState.Active;
    if (this.onActivate !== undefined) {
      this.onActivate();
    }
    this.setCaptureFpa(
      vs !== undefined ? vs : SimVar.GetSimVarValue('VERTICAL SPEED', SimVarValueType.FPM),
      alt !== undefined ? alt : SimVar.GetSimVarValue('INDICATED ALTITUDE', SimVarValueType.Feet)
    );
    SimVar.SetSimVarValue('AUTOPILOT ALTITUDE LOCK', 'Bool', true);
  }

  /**
   * Arms this director.
   * This director has no armed mode, so it activates immediately.
   */
  public arm(): void {
    this.state = DirectorState.Armed;
    if (this.onArm !== undefined) {
      this.onArm();
    }
  }

  /**
   * Deactivates this director.
   * @param captured is whether the altitude was captured.
   */
  public deactivate(captured = false): void {
    this.state = DirectorState.Inactive;
    if (!captured) {
      SimVar.SetSimVarValue('AUTOPILOT ALTITUDE LOCK', 'Bool', false);
    }
  }

  /**
   * Updates this director.
   */
  public update(): void {
    if (this.state === DirectorState.Active) {

      this.drivePitch && this.drivePitch(-this.captureAltitude(
        this.apValues.capturedAltitude.get(),
        SimVar.GetSimVarValue('INDICATED ALTITUDE', SimVarValueType.Feet),
        this.initialFpa,
        SimVar.GetSimVarValue('AIRSPEED TRUE', SimVarValueType.Knots)
      ), true, true);

    } else if (this.state === DirectorState.Armed) {
      this.tryActivate();
    }
  }

  /**
   * Attempts to activate altitude capture.
   */
  private tryActivate(): void {
    if (this.targetChangeInhibitTimer?.isPending()) {
      return;
    }

    const selectedAltitude = this.apValues.selectedAltitude.get();
    const vs = SimVar.GetSimVarValue('VERTICAL SPEED', SimVarValueType.FPM);
    const alt = SimVar.GetSimVarValue('INDICATED ALTITUDE', SimVarValueType.Feet);
    if (this.shouldActivate(vs, selectedAltitude, alt)) {
      this.apValues.capturedAltitude.set(Math.round(selectedAltitude));
      this.activate(vs, alt);
    }
  }

  /**
   * A function which returns true if the capturing shall be activated
   * @param vs Current vertical speed in [ft/min]
   * @param targetAltitude Target altitude [ft]
   * @param currentAltitude Current altitude [ft]
   * @returns True if the capturing shall be activated
   */
  private static shouldActivate(vs: number, targetAltitude: number, currentAltitude: number): boolean {
    return (Math.abs(targetAltitude - currentAltitude) <= Math.abs(vs / 6));
  }

  /**
   * Sets the initial capture FPA from the current vs value when capture is initiated.
   * @param vs The current vertical speed, in FPM.
   * @param alt The current indicated altitude, in Feet.
   */
  private setCaptureFpa(vs: number, alt: number): void {
    const altCapDeviation = alt - this.apValues.selectedAltitude.get();

    if (altCapDeviation < 0) {
      vs = Math.max(400, vs);
    } else {
      vs = Math.min(-400, vs);
    }

    const tas = SimVar.GetSimVarValue('AIRSPEED TRUE', SimVarValueType.FPM);
    this.initialFpa = VNavUtils.getFpa(tas, vs);
  }

  /**
   * Calculates a desired pitch angle, in degrees, to capture a target altitude.
   * @param targetAltitude The altitude to capture, in feet.
   * @param indicatedAltitude The current indicated altitude, in feet.
   * @param initialFpa The flight path angle of the airplane, in degrees, when altitude capture was first activated.
   * Positive values indicate a descending path.
   * @param tas The current true airspeed of the airplane, in knots.
   * @returns The desired pitch angle, in degrees, to capture the specified altitude. Positive values indicate nose-up
   * pitch.
   */
  private static captureAltitude(
    targetAltitude: number,
    indicatedAltitude: number,
    initialFpa: number,
    tas: number
  ): number {
    const initialFpaAbs = Math.abs(initialFpa);
    let deltaAltitude = targetAltitude - indicatedAltitude;

    if (deltaAltitude >= 0 && deltaAltitude < 10) {
      deltaAltitude = 10;
    } else if (deltaAltitude < 0 && deltaAltitude > -10) {
      deltaAltitude = -10;
    }

    const desiredClosureTime = MathUtils.lerp(Math.abs(deltaAltitude), 100, 1000, 5, 10, true, true);
    const desiredVs = deltaAltitude / (desiredClosureTime / 60);

    const desiredFpa = MathUtils.clamp(Math.asin(desiredVs / UnitType.KNOT.convertTo(tas, UnitType.FPM)) * Avionics.Utils.RAD2DEG, -initialFpaAbs, initialFpaAbs);
    return MathUtils.clamp(desiredFpa, -15, 15);
  }
}
