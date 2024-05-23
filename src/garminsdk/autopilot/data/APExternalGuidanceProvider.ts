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

  private readonly supportGpsSteer: boolean;
  private readonly supportVNav: boolean;
  private readonly supportGlidepath: boolean;

  private readonly simVarNames: Record<
    APExternalGpsSteerCommandSimVars | APExternalVNavGuidanceSimVars | APExternalVerticalPathGuidanceSimVars | APExternalGlidepathGuidanceSimVars,
    string
  >;

  private readonly _gpsSteerCommand: APGpsSteerDirectorSteerCommand = {
    isValid: false,
    desiredBankAngle: 0,
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

    this.simVarNames = {} as any;
    for (const simVar of Object.values(APExternalGpsSteerCommandSimVars)) {
      this.simVarNames[simVar] = `${simVar}:${index}`;
    }
    for (const simVar of Object.values(APExternalVNavGuidanceSimVars)) {
      this.simVarNames[simVar] = `${simVar}:${index}`;
    }
    for (const simVar of Object.values(APExternalVerticalPathGuidanceSimVars)) {
      this.simVarNames[simVar] = `${simVar}:${index}`;
    }
    for (const simVar of Object.values(APExternalGlidepathGuidanceSimVars)) {
      this.simVarNames[simVar] = `${simVar}:${index}`;
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
    this._gpsSteerCommand.isValid = SimVar.GetSimVarValue(this.simVarNames[APExternalGpsSteerCommandSimVars.IsValid], SimVarValueType.Bool) !== 0;
    if (this._gpsSteerCommand.isValid) {
      this._gpsSteerCommand.desiredBankAngle = SimVar.GetSimVarValue(this.simVarNames[APExternalGpsSteerCommandSimVars.BankAngle], SimVarValueType.Degree);
      this._gpsSteerCommand.dtk = SimVar.GetSimVarValue(this.simVarNames[APExternalGpsSteerCommandSimVars.Dtk], SimVarValueType.Degree);
      this._gpsSteerCommand.xtk = SimVar.GetSimVarValue(this.simVarNames[APExternalGpsSteerCommandSimVars.Xtk], SimVarValueType.NM);
      this._gpsSteerCommand.tae = SimVar.GetSimVarValue(this.simVarNames[APExternalGpsSteerCommandSimVars.Tae], SimVarValueType.Degree);
    } else {
      this._gpsSteerCommand.desiredBankAngle = 0;
      this._gpsSteerCommand.dtk = 0;
      this._gpsSteerCommand.xtk = 0;
      this._gpsSteerCommand.tae = 0;
    }
  }

  /**
   * Updates this provider's VNAV guidance.
   */
  private updateVNavGuidance(): void {
    this._vnavGuidance.state = SimVar.GetSimVarValue(this.simVarNames[APExternalVNavGuidanceSimVars.State], SimVarValueType.Number);
    this._vnavGuidance.isActive = SimVar.GetSimVarValue(this.simVarNames[APExternalVNavGuidanceSimVars.IsActive], SimVarValueType.Bool) !== 0;
    this._vnavGuidance.pathMode = SimVar.GetSimVarValue(this.simVarNames[APExternalVNavGuidanceSimVars.PathMode], SimVarValueType.Number);
    this._vnavGuidance.armedClimbMode = SimVar.GetSimVarValue(this.simVarNames[APExternalVNavGuidanceSimVars.ArmedClimbMode], SimVarValueType.Number);
    this._vnavGuidance.shouldActivateClimbMode = SimVar.GetSimVarValue(this.simVarNames[APExternalVNavGuidanceSimVars.ShouldActivateClimbMode], SimVarValueType.Bool) !== 0;
    this._vnavGuidance.altitudeCaptureType = SimVar.GetSimVarValue(this.simVarNames[APExternalVNavGuidanceSimVars.AltitudeCaptureType], SimVarValueType.Number);
    this._vnavGuidance.shouldCaptureAltitude = SimVar.GetSimVarValue(this.simVarNames[APExternalVNavGuidanceSimVars.ShouldCaptureAltitude], SimVarValueType.Bool) !== 0;
    this._vnavGuidance.altitudeToCapture = SimVar.GetSimVarValue(this.simVarNames[APExternalVNavGuidanceSimVars.AltitudeToCapture], SimVarValueType.Feet);
  }

  /**
   * Updates this provider's vertical path guidance.
   */
  private updateVerticalPathGuidance(): void {
    this._verticalPathGuidance.isValid = SimVar.GetSimVarValue(this.simVarNames[APExternalVerticalPathGuidanceSimVars.IsValid], SimVarValueType.Bool) !== 0;
    if (this._verticalPathGuidance.isValid) {
      this._verticalPathGuidance.fpa = SimVar.GetSimVarValue(this.simVarNames[APExternalVerticalPathGuidanceSimVars.Fpa], SimVarValueType.Degree);
      this._verticalPathGuidance.deviation = SimVar.GetSimVarValue(this.simVarNames[APExternalVerticalPathGuidanceSimVars.Deviation], SimVarValueType.Feet);
    } else {
      this._verticalPathGuidance.fpa = 0;
      this._verticalPathGuidance.deviation = 0;
    }
  }

  /**
   * Updates this provider's glidepath guidance.
   */
  private updateGlidepathGuidance(): void {
    this._glidepathGuidance.approachHasGlidepath = SimVar.GetSimVarValue(this.simVarNames[APExternalGlidepathGuidanceSimVars.ApproachHasGp], SimVarValueType.Bool) !== 0;
    this._glidepathGuidance.isValid = SimVar.GetSimVarValue(this.simVarNames[APExternalGlidepathGuidanceSimVars.IsValid], SimVarValueType.Bool) !== 0;
    if (this._glidepathGuidance.isValid) {
      this._glidepathGuidance.canCapture = SimVar.GetSimVarValue(this.simVarNames[APExternalGlidepathGuidanceSimVars.CanCapture], SimVarValueType.Bool) !== 0;
      this._glidepathGuidance.fpa = SimVar.GetSimVarValue(this.simVarNames[APExternalGlidepathGuidanceSimVars.Fpa], SimVarValueType.Degree);
      this._glidepathGuidance.deviation = SimVar.GetSimVarValue(this.simVarNames[APExternalGlidepathGuidanceSimVars.Deviation], SimVarValueType.Feet);
    } else {
      this._glidepathGuidance.canCapture = false;
      this._glidepathGuidance.fpa = 0;
      this._glidepathGuidance.deviation = 0;
    }
  }
}
