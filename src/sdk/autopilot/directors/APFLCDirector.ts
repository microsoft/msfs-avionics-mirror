import { SimVarValueType } from '../../data/SimVars';
import { AeroMath } from '../../math/AeroMath';
import { MathUtils } from '../../math/MathUtils';
import { APValues } from '../APConfig';
import { GenericFlcComputer } from '../calculators/GenericFlcComputer';
import { DirectorState, PlaneDirector } from './PlaneDirector';

/**
 * A command for {@link APFLCDirector} to set selected speed targets.
 */
export type APFLCDirectorSetSpeedCommand = {
  /** The selected IAS target to set, in knots, or `undefined` if the selected IAS target should remain unchanged. */
  ias: number | undefined;

  /** The selected mach target to set, or `undefined` if the selected mach target should remain unchanged. */
  mach: number | undefined;

  /** Whether the selected speed target should be in mach, or `undefined` if the setting should remain unchanged. */
  isSelectedSpeedInMach: boolean | undefined;
};

/**
 * Options for {@link APFLCDirector}.
 */
export type APFLCDirectorOptions = {
  /**
   * The maximum absolute pitch up angle, in degrees, supported by the director, or a function which returns it.
   */
  maxPitchUpAngle: number | (() => number);

  /**
   * The maximum absolute pitch down angle, in degrees, supported by the director, or a function which returns it.
   */
  maxPitchDownAngle: number | (() => number);

  /**
   * A function which commands the director to set selected speed targets when the director is activated. The function
   * takes the following as parameters:
   * * The airplane's current indicated airspeed, in knots
   * * The airplane's current mach number
   * * Whether the current selected speed target is in mach
   * * An object which defines commands to set selected speed targets.
   * The function should use the command object to set certain selected IAS and mach targets, and whether the selected
   * speed target should be in mach. Any undefined commands will leave the current settings unchanged.
   */
  setSpeedOnActivation: (currentIas: number, currentMach: number, isSelectedSpeedInMach: boolean, command: APFLCDirectorSetSpeedCommand) => void;
};

/**
 * A Flight Level Change autopilot director.
 */
export class APFLCDirector implements PlaneDirector {

  public state: DirectorState;

  private readonly flcComputer: GenericFlcComputer;

  /** @inheritdoc */
  public onActivate?: () => void;

  /** @inheritdoc */
  public onArm?: () => void;

  /** @inheritdoc */
  public drivePitch?: (pitch: number, adjustForAoa?: boolean, adjustForVerticalWind?: boolean) => void;

  private readonly setSpeedCommand: APFLCDirectorSetSpeedCommand = {
    ias: undefined,
    mach: undefined,
    isSelectedSpeedInMach: undefined
  };

  private readonly maxPitchUpAngleFunc: () => number;
  private readonly maxPitchDownAngleFunc: () => number;
  private readonly setSpeedOnActivationFunc: (currentIas: number, currentMach: number, isSelectedSpeedInMach: boolean, command: APFLCDirectorSetSpeedCommand) => void;

  /**
   * Creates a new instance of APFLCDirector.
   * @param apValues Autopilot values from this director's parent autopilot.
   * @param options Options to configure the new director. Option values default to the following if not defined:
   * * `maxPitchUpAngle`: `15`
   * * `maxPitchDownAngle`: `15`
   * * `setSpeedOnActivation`: A function which sets the selected IAS or mach target to the airplane's current IAS or
   * mach, depending on whether IAS or mach is currently being targeted.
   */
  constructor(private readonly apValues: APValues, options?: Partial<Readonly<APFLCDirectorOptions>>) {
    const maxPitchUpAngleOpt = options?.maxPitchUpAngle ?? undefined;
    switch (typeof maxPitchUpAngleOpt) {
      case 'number':
        this.maxPitchUpAngleFunc = () => maxPitchUpAngleOpt;
        break;
      case 'function':
        this.maxPitchUpAngleFunc = maxPitchUpAngleOpt;
        break;
      default:
        this.maxPitchUpAngleFunc = () => 15;
    }

    const maxPitchDownAngleOpt = options?.maxPitchDownAngle ?? undefined;
    switch (typeof maxPitchDownAngleOpt) {
      case 'number':
        this.maxPitchDownAngleFunc = () => maxPitchDownAngleOpt;
        break;
      case 'function':
        this.maxPitchDownAngleFunc = maxPitchDownAngleOpt;
        break;
      default:
        this.maxPitchDownAngleFunc = () => 15;
    }

    this.setSpeedOnActivationFunc = options?.setSpeedOnActivation ?? APFLCDirector.defaultSetSpeedOnActivation;

    this.state = DirectorState.Inactive;
    this.flcComputer = new GenericFlcComputer({ kP: 2, kI: 0, kD: 0, maxOut: 90, minOut: -90 });
  }

  /**
   * Activates this director.
   */
  public activate(): void {
    this.state = DirectorState.Active;
    this.onActivate && this.onActivate();

    // Handle setting selected speed on activation.

    this.setSpeedCommand.ias = undefined;
    this.setSpeedCommand.mach = undefined;
    this.setSpeedCommand.isSelectedSpeedInMach = undefined;

    this.setSpeedOnActivationFunc(
      SimVar.GetSimVarValue('AIRSPEED INDICATED:1', SimVarValueType.Knots),
      SimVar.GetSimVarValue('AIRSPEED MACH', SimVarValueType.Number),
      this.apValues.isSelectedSpeedInMach.get(),
      this.setSpeedCommand
    );

    if (this.setSpeedCommand.ias !== undefined) {
      SimVar.SetSimVarValue('K:AP_SPD_VAR_SET', SimVarValueType.Number, this.setSpeedCommand.ias);
    }
    if (this.setSpeedCommand.mach !== undefined) {
      SimVar.SetSimVarValue('K:AP_MACH_VAR_SET', SimVarValueType.Number, Math.round(this.setSpeedCommand.mach * 100));
    }
    if (this.setSpeedCommand.isSelectedSpeedInMach !== undefined) {
      SimVar.SetSimVarValue(this.setSpeedCommand.isSelectedSpeedInMach ? 'K:AP_MANAGED_SPEED_IN_MACH_ON' : 'K:AP_MANAGED_SPEED_IN_MACH_OFF', SimVarValueType.Number, 0);
    }

    // Activate sim FLC hold and initialize FLC computer climb mode state

    SimVar.SetSimVarValue('AUTOPILOT FLIGHT LEVEL CHANGE', 'Bool', true);

    const currentAltitude = SimVar.GetSimVarValue('INDICATED ALTITUDE', SimVarValueType.Feet);
    this.flcComputer.activate(this.apValues.selectedAltitude.get() > currentAltitude);
  }

  /**
   * Arms this director.
   * This director can be armed, but it will never automatically activate and remain in the armed state.
   * Therefore we do not resume subs until activation.
   */
  public arm(): void {
    this.state = DirectorState.Armed;
    this.onArm && this.onArm();
  }

  /**
   * Deactivates this director.
   */
  public deactivate(): void {
    this.state = DirectorState.Inactive;
    SimVar.SetSimVarValue('AUTOPILOT FLIGHT LEVEL CHANGE', 'Bool', false);
    this.flcComputer.deactivate();
  }

  /**
   * Updates this director.
   */
  public update(): void {
    if (this.state !== DirectorState.Active) {
      return;
    }

    const currentAltitude = SimVar.GetSimVarValue('INDICATED ALTITUDE', SimVarValueType.Feet);
    this.flcComputer.setClimbMode(this.apValues.selectedAltitude.get() > currentAltitude);

    if (this.apValues.isSelectedSpeedInMach.get()) {
      const mach = this.apValues.selectedMach.get();
      let ias = Simplane.getMachToKias(mach);
      if (!isFinite(ias)) {
        // Sometimes getMachToKias returns a NaN value. If so, fall back to doing the conversion ourselves.
        ias = AeroMath.machToCas(mach, SimVar.GetSimVarValue('AMBIENT PRESSURE', SimVarValueType.HPA));
      }
      this.flcComputer.setTargetSpeed(ias);
    } else {
      this.flcComputer.setTargetSpeed(this.apValues.selectedIas.get());
    }

    this.flcComputer.update();
    const pitchTarget = this.flcComputer.pitchTarget.get();

    // The flcComputer takes care of the aoa adjustment since it needs aoa anyhow,
    // and there is no vertical wind correction for an FLC mode.
    pitchTarget !== null && this.drivePitch && this.drivePitch(MathUtils.clamp(pitchTarget, -this.maxPitchUpAngleFunc(), this.maxPitchDownAngleFunc()), false, false);
  }

  /**
   * Executes default logic for setting selected speed targets when the FLC director is activated. If the current
   * selected speed target is in IAS, then the selected IAS target will be set to the airplane's current indicated
   * airspeed. If the current selected speed target is in mach, then the selected mach target will be set to the
   * airplane's current mach number.
   * @param currentIas The airplane's current indicated airspeed, in knots.
   * @param currentMach The airplane's current mach number.
   * @param isSelectedSpeedInMach Whether the current selected speed target is in mach.
   * @param command The command to set selected speed targets.
   */
  private static defaultSetSpeedOnActivation(currentIas: number, currentMach: number, isSelectedSpeedInMach: boolean, command: APFLCDirectorSetSpeedCommand): void {
    if (isSelectedSpeedInMach) {
      command.mach = currentMach;
    } else {
      command.ias = currentIas;
    }
  }
}