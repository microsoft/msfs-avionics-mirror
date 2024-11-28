import { APGpsSteerDirectorSteerCommand, APVerticalModes, SimVarValueType, VNavAltCaptureType, VNavPathMode, VNavState } from '@microsoft/msfs-sdk';

import { GarminVNavGlidepathGuidance, GarminVNavGuidance, GarminVNavPathGuidance } from '../vnav/GarminVNavTypes';
import {
  APExternalGlidepathGuidanceSimVars, APExternalGpsSteerCommandSimVars, APExternalVNavGuidanceSimVars,
  APExternalVerticalPathGuidanceSimVars
} from './APExternalGuidanceSimVars';

/**
 * Configuration options for {@link APExternalGuidanceProvider}.
 */
export type APExternalGuidanceProviderOptions = {
  /** Whether the provider supports GPS steering command data. Defaults to `false`. */
  supportGpsSteer?: boolean;

  /** Whether the provider supports VNAV guidance and VNAV path guidance data. Defaults to `false`. */
  supportVNav?: boolean;

  /** Whether the provider supports glidepath guidance data. Defaults to `false`. */
  supportGlidepath?: boolean;
};

/**
 * A provider of external autopilot guidance data. Data are sourced from indexed SimVars whose roots are defined in
 * `APExternalGpsSteerCommandSimVars`, `APExternalVNavGuidanceSimVars`, `APExternalVerticalPathGuidanceSimVars`, and
 * `APExternalGlidepathGuidanceSimVars`.
 */
export class APExternalGuidanceProvider {

  private static readonly GPS_STEER_SIMVAR_UNITS: Record<APExternalGpsSteerCommandSimVars, string> = {
    [APExternalGpsSteerCommandSimVars.IsValid]: SimVarValueType.Bool,
    [APExternalGpsSteerCommandSimVars.IsHeading]: SimVarValueType.Bool,
    [APExternalGpsSteerCommandSimVars.CourseToSteer]: SimVarValueType.Degree,
    [APExternalGpsSteerCommandSimVars.TrackRadius]: SimVarValueType.Number,
    [APExternalGpsSteerCommandSimVars.Dtk]: SimVarValueType.Degree,
    [APExternalGpsSteerCommandSimVars.Xtk]: SimVarValueType.NM,
    [APExternalGpsSteerCommandSimVars.Tae]: SimVarValueType.Degree,
  };

  private static readonly VNAV_SIMVAR_UNITS: Record<APExternalVNavGuidanceSimVars, string> = {
    [APExternalVNavGuidanceSimVars.State]: SimVarValueType.Number,
    [APExternalVNavGuidanceSimVars.IsActive]: SimVarValueType.Bool,
    [APExternalVNavGuidanceSimVars.PathMode]: SimVarValueType.Number,
    [APExternalVNavGuidanceSimVars.ArmedClimbMode]: SimVarValueType.Number,
    [APExternalVNavGuidanceSimVars.ShouldActivateClimbMode]: SimVarValueType.Bool,
    [APExternalVNavGuidanceSimVars.AltitudeCaptureType]: SimVarValueType.Number,
    [APExternalVNavGuidanceSimVars.ShouldCaptureAltitude]: SimVarValueType.Bool,
    [APExternalVNavGuidanceSimVars.AltitudeToCapture]: SimVarValueType.Feet,
  };

  private static readonly VERT_PATH_SIMVAR_UNITS: Record<APExternalVerticalPathGuidanceSimVars, string> = {
    [APExternalVerticalPathGuidanceSimVars.IsValid]: SimVarValueType.Bool,
    [APExternalVerticalPathGuidanceSimVars.Fpa]: SimVarValueType.Degree,
    [APExternalVerticalPathGuidanceSimVars.Deviation]: SimVarValueType.Feet,
  };

  private static readonly GLIDEPATH_SIMVAR_UNITS: Record<APExternalGlidepathGuidanceSimVars, string> = {
    [APExternalGlidepathGuidanceSimVars.ApproachHasGp]: SimVarValueType.Bool,
    [APExternalGlidepathGuidanceSimVars.IsValid]: SimVarValueType.Bool,
    [APExternalGlidepathGuidanceSimVars.CanCapture]: SimVarValueType.Bool,
    [APExternalGlidepathGuidanceSimVars.Fpa]: SimVarValueType.Degree,
    [APExternalGlidepathGuidanceSimVars.Deviation]: SimVarValueType.Feet,
  };

  private readonly supportGpsSteer: boolean;
  private readonly supportVNav: boolean;
  private readonly supportGlidepath: boolean;

  private readonly simVarIds: Record<
    APExternalGpsSteerCommandSimVars | APExternalVNavGuidanceSimVars | APExternalVerticalPathGuidanceSimVars | APExternalGlidepathGuidanceSimVars,
    number
  >;

  private readonly _gpsSteerCommand: APGpsSteerDirectorSteerCommand = {
    isValid: false,
    isHeading: false,
    courseToSteer: 0,
    trackRadius: 0,
    dtk: 0,
    xtk: 0,
    tae: 0
  };
  // eslint-disable-next-line jsdoc/require-returns
  /** The current external GPS steer command. */
  public get gpsSteerCommand(): Readonly<APGpsSteerDirectorSteerCommand> {
    return this._gpsSteerCommand;
  }

  private readonly _vnavGuidance: GarminVNavGuidance = {
    state: VNavState.Disabled,
    isActive: false,
    pathMode: VNavPathMode.None,
    armedClimbMode: APVerticalModes.NONE,
    shouldActivateClimbMode: false,
    altitudeCaptureType: VNavAltCaptureType.None,
    shouldCaptureAltitude: false,
    altitudeToCapture: 0
  };
  // eslint-disable-next-line jsdoc/require-returns
  /** The current external VNAV guidance. */
  public get vnavGuidance(): Readonly<GarminVNavGuidance> {
    return this._vnavGuidance;
  }

  private readonly _verticalPathGuidance: GarminVNavPathGuidance = {
    isValid: false,
    fpa: 0,
    deviation: 0
  };
  // eslint-disable-next-line jsdoc/require-returns
  /** The current external vertical path guidance. */
  public get verticalPathGuidance(): Readonly<GarminVNavPathGuidance> {
    return this._verticalPathGuidance;
  }

  private readonly _glidepathGuidance: GarminVNavGlidepathGuidance = {
    approachHasGlidepath: false,
    isValid: false,
    canCapture: false,
    fpa: 0,
    deviation: 0
  };
  // eslint-disable-next-line jsdoc/require-returns
  /** The current external glidepath guidance. */
  public get glidepathGuidance(): Readonly<GarminVNavGlidepathGuidance> {
    return this._glidepathGuidance;
  }

  /**
   * Creates a new instance of APExternalGuidanceProvider.
   * @param index The index of the guidance SimVars from which this provider sources data.
   * @param options Options with which to configure the provider.
   * @throws Error if `index` is not a non-negative integer.
   */
  public constructor(private readonly index: number, options?: Readonly<APExternalGuidanceProviderOptions>) {
    if (!Number.isInteger(index) || index < 0) {
      throw new Error(`APExternalGuidanceProvider: invalid index ${index}`);
    }

    this.supportGpsSteer = options?.supportGpsSteer ?? false;
    this.supportVNav = options?.supportVNav ?? false;
    this.supportGlidepath = options?.supportGlidepath ?? false;

    this.simVarIds = {} as any;
    for (const simVar of Object.values(APExternalGpsSteerCommandSimVars)) {
      this.simVarIds[simVar] = SimVar.GetRegisteredId(`${simVar}_${index}`, APExternalGuidanceProvider.GPS_STEER_SIMVAR_UNITS[simVar], '');
    }
    for (const simVar of Object.values(APExternalVNavGuidanceSimVars)) {
      this.simVarIds[simVar] = SimVar.GetRegisteredId(`${simVar}_${index}`, APExternalGuidanceProvider.VNAV_SIMVAR_UNITS[simVar], '');
    }
    for (const simVar of Object.values(APExternalVerticalPathGuidanceSimVars)) {
      this.simVarIds[simVar] = SimVar.GetRegisteredId(`${simVar}_${index}`, APExternalGuidanceProvider.VERT_PATH_SIMVAR_UNITS[simVar], '');
    }
    for (const simVar of Object.values(APExternalGlidepathGuidanceSimVars)) {
      this.simVarIds[simVar] = SimVar.GetRegisteredId(`${simVar}_${index}`, APExternalGuidanceProvider.GLIDEPATH_SIMVAR_UNITS[simVar], '');
    }
  }

  /**
   * Updates this provider's data.
   */
  public update(): void {
    if (this.supportGpsSteer) {
      this.updateGpsSteerCommand();
    }

    if (this.supportVNav) {
      this.updateVNavGuidance();
      this.updateVerticalPathGuidance();
    }

    if (this.supportGlidepath) {
      this.updateGlidepathGuidance();
    }
  }

  /**
   * Updates this provider's GPS steer command.
   */
  private updateGpsSteerCommand(): void {
    this._gpsSteerCommand.isValid = SimVar.GetSimVarValueFastReg(this.simVarIds[APExternalGpsSteerCommandSimVars.IsValid]) !== 0;
    if (this._gpsSteerCommand.isValid) {
      this._gpsSteerCommand.isHeading = SimVar.GetSimVarValueFastReg(this.simVarIds[APExternalGpsSteerCommandSimVars.IsHeading]) !== 0;
      this._gpsSteerCommand.courseToSteer = SimVar.GetSimVarValueFastReg(this.simVarIds[APExternalGpsSteerCommandSimVars.CourseToSteer]);
      this._gpsSteerCommand.trackRadius = SimVar.GetSimVarValueFastReg(this.simVarIds[APExternalGpsSteerCommandSimVars.TrackRadius]);
      this._gpsSteerCommand.dtk = SimVar.GetSimVarValueFastReg(this.simVarIds[APExternalGpsSteerCommandSimVars.Dtk]);
      this._gpsSteerCommand.xtk = SimVar.GetSimVarValueFastReg(this.simVarIds[APExternalGpsSteerCommandSimVars.Xtk]);
      this._gpsSteerCommand.tae = SimVar.GetSimVarValueFastReg(this.simVarIds[APExternalGpsSteerCommandSimVars.Tae]);
    } else {
      this._gpsSteerCommand.isHeading = false;
      this._gpsSteerCommand.courseToSteer = 0;
      this._gpsSteerCommand.trackRadius = 0;
      this._gpsSteerCommand.dtk = 0;
      this._gpsSteerCommand.xtk = 0;
      this._gpsSteerCommand.tae = 0;
    }
  }

  /**
   * Updates this provider's VNAV guidance.
   */
  private updateVNavGuidance(): void {
    this._vnavGuidance.state = SimVar.GetSimVarValueFastReg(this.simVarIds[APExternalVNavGuidanceSimVars.State]);
    this._vnavGuidance.isActive = SimVar.GetSimVarValueFastReg(this.simVarIds[APExternalVNavGuidanceSimVars.IsActive]) !== 0;
    this._vnavGuidance.pathMode = SimVar.GetSimVarValueFastReg(this.simVarIds[APExternalVNavGuidanceSimVars.PathMode]);
    this._vnavGuidance.armedClimbMode = SimVar.GetSimVarValueFastReg(this.simVarIds[APExternalVNavGuidanceSimVars.ArmedClimbMode]);
    this._vnavGuidance.shouldActivateClimbMode = SimVar.GetSimVarValueFastReg(this.simVarIds[APExternalVNavGuidanceSimVars.ShouldActivateClimbMode]) !== 0;
    this._vnavGuidance.altitudeCaptureType = SimVar.GetSimVarValueFastReg(this.simVarIds[APExternalVNavGuidanceSimVars.AltitudeCaptureType]);
    this._vnavGuidance.shouldCaptureAltitude = SimVar.GetSimVarValueFastReg(this.simVarIds[APExternalVNavGuidanceSimVars.ShouldCaptureAltitude]) !== 0;
    this._vnavGuidance.altitudeToCapture = SimVar.GetSimVarValueFastReg(this.simVarIds[APExternalVNavGuidanceSimVars.AltitudeToCapture]);
  }

  /**
   * Updates this provider's vertical path guidance.
   */
  private updateVerticalPathGuidance(): void {
    this._verticalPathGuidance.isValid = SimVar.GetSimVarValueFastReg(this.simVarIds[APExternalVerticalPathGuidanceSimVars.IsValid]) !== 0;
    if (this._verticalPathGuidance.isValid) {
      this._verticalPathGuidance.fpa = SimVar.GetSimVarValueFastReg(this.simVarIds[APExternalVerticalPathGuidanceSimVars.Fpa]);
      this._verticalPathGuidance.deviation = SimVar.GetSimVarValueFastReg(this.simVarIds[APExternalVerticalPathGuidanceSimVars.Deviation]);
    } else {
      this._verticalPathGuidance.fpa = 0;
      this._verticalPathGuidance.deviation = 0;
    }
  }

  /**
   * Updates this provider's glidepath guidance.
   */
  private updateGlidepathGuidance(): void {
    this._glidepathGuidance.approachHasGlidepath = SimVar.GetSimVarValueFastReg(this.simVarIds[APExternalGlidepathGuidanceSimVars.ApproachHasGp]) !== 0;
    this._glidepathGuidance.isValid = SimVar.GetSimVarValueFastReg(this.simVarIds[APExternalGlidepathGuidanceSimVars.IsValid]) !== 0;
    if (this._glidepathGuidance.isValid) {
      this._glidepathGuidance.canCapture = SimVar.GetSimVarValueFastReg(this.simVarIds[APExternalGlidepathGuidanceSimVars.CanCapture]) !== 0;
      this._glidepathGuidance.fpa = SimVar.GetSimVarValueFastReg(this.simVarIds[APExternalGlidepathGuidanceSimVars.Fpa]);
      this._glidepathGuidance.deviation = SimVar.GetSimVarValueFastReg(this.simVarIds[APExternalGlidepathGuidanceSimVars.Deviation]);
    } else {
      this._glidepathGuidance.canCapture = false;
      this._glidepathGuidance.fpa = 0;
      this._glidepathGuidance.deviation = 0;
    }
  }
}
