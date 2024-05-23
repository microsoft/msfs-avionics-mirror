import { Accessible, APGpsSteerDirectorSteerCommand, APVerticalModes, SimVarValueType, VNavAltCaptureType, VNavPathMode, VNavState } from '@microsoft/msfs-sdk';

import {
  APExternalGlidepathGuidanceSimVars, APExternalGpsSteerCommandSimVars, APExternalVerticalPathGuidanceSimVars,
  APExternalVNavGuidanceSimVars,
  GarminVNavGlidepathGuidance
} from '@microsoft/msfs-garminsdk';

/** Class responsible for publishing to external guidance simvars */
export class GNSExternalGuidancePublisher {
  private readonly simVarNames: Record<
    APExternalGpsSteerCommandSimVars | APExternalVNavGuidanceSimVars | APExternalVerticalPathGuidanceSimVars | APExternalGlidepathGuidanceSimVars,
    string
  >;

  /** @inheritdoc */
  public constructor(private readonly index: number) {
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

    this.initVars();
  }

  /**
   * Initializes all external guidance SimVars.
   */
  private initVars(): void {
    SimVar.SetSimVarValue(this.simVarNames[APExternalGpsSteerCommandSimVars.IsValid], SimVarValueType.Bool, false);
    SimVar.SetSimVarValue(this.simVarNames[APExternalGpsSteerCommandSimVars.BankAngle], SimVarValueType.Degree, 0);
    SimVar.SetSimVarValue(this.simVarNames[APExternalGpsSteerCommandSimVars.Dtk], SimVarValueType.Degree, 0);
    SimVar.SetSimVarValue(this.simVarNames[APExternalGpsSteerCommandSimVars.Xtk], SimVarValueType.NM, 0);
    SimVar.SetSimVarValue(this.simVarNames[APExternalGpsSteerCommandSimVars.Tae], SimVarValueType.Degree, 0);

    SimVar.SetSimVarValue(this.simVarNames[APExternalVNavGuidanceSimVars.State], SimVarValueType.Number, VNavState.Disabled);
    SimVar.SetSimVarValue(this.simVarNames[APExternalVNavGuidanceSimVars.IsActive], SimVarValueType.Bool, 0);
    SimVar.SetSimVarValue(this.simVarNames[APExternalVNavGuidanceSimVars.PathMode], SimVarValueType.Number, VNavPathMode.None);
    SimVar.SetSimVarValue(this.simVarNames[APExternalVNavGuidanceSimVars.ArmedClimbMode], SimVarValueType.Number, APVerticalModes.NONE);
    SimVar.SetSimVarValue(this.simVarNames[APExternalVNavGuidanceSimVars.ShouldActivateClimbMode], SimVarValueType.Bool, false);
    SimVar.SetSimVarValue(this.simVarNames[APExternalVNavGuidanceSimVars.AltitudeCaptureType], SimVarValueType.Number, VNavAltCaptureType.None);
    SimVar.SetSimVarValue(this.simVarNames[APExternalVNavGuidanceSimVars.ShouldCaptureAltitude], SimVarValueType.Bool, false);
    SimVar.SetSimVarValue(this.simVarNames[APExternalVNavGuidanceSimVars.AltitudeToCapture], SimVarValueType.Feet, 0);

    SimVar.SetSimVarValue(this.simVarNames[APExternalVerticalPathGuidanceSimVars.IsValid], SimVarValueType.Bool, false);
    SimVar.SetSimVarValue(this.simVarNames[APExternalVerticalPathGuidanceSimVars.Fpa], SimVarValueType.Degree, 0);
    SimVar.SetSimVarValue(this.simVarNames[APExternalVerticalPathGuidanceSimVars.Deviation], SimVarValueType.Feet, 0);

    SimVar.SetSimVarValue(this.simVarNames[APExternalGlidepathGuidanceSimVars.ApproachHasGp], SimVarValueType.Bool, false);
    SimVar.SetSimVarValue(this.simVarNames[APExternalGlidepathGuidanceSimVars.IsValid], SimVarValueType.Bool, false);
    SimVar.SetSimVarValue(this.simVarNames[APExternalGlidepathGuidanceSimVars.CanCapture], SimVarValueType.Bool, false);
    SimVar.SetSimVarValue(this.simVarNames[APExternalGlidepathGuidanceSimVars.Fpa], SimVarValueType.Degree, 0);
    SimVar.SetSimVarValue(this.simVarNames[APExternalGlidepathGuidanceSimVars.Deviation], SimVarValueType.Feet, 0);
  }

  /**
   * Updates the external guidance SimVars.
   * @param gpsSteerCommand The current LNAV steering command.
   * @param glidepathGuidance The current glidepath guidance.
   */
  public update(
    gpsSteerCommand: Accessible<Readonly<APGpsSteerDirectorSteerCommand>>,
    glidepathGuidance: Accessible<Readonly<GarminVNavGlidepathGuidance>>
  ): void {
    this.updateLnavVars(gpsSteerCommand);
    this.updateGlidepathVars(glidepathGuidance);
  }

  /**
   * Updates the LNAV external guidance SimVars.
   * @param steerCommand The current LNAV steering command.
   */
  private updateLnavVars(steerCommand: Accessible<Readonly<APGpsSteerDirectorSteerCommand>>): void {
    const lnav = steerCommand.get();
    SimVar.SetSimVarValue(this.simVarNames[APExternalGpsSteerCommandSimVars.IsValid], SimVarValueType.Bool, lnav.isValid);
    SimVar.SetSimVarValue(this.simVarNames[APExternalGpsSteerCommandSimVars.BankAngle], SimVarValueType.Degree, lnav.desiredBankAngle);
    SimVar.SetSimVarValue(this.simVarNames[APExternalGpsSteerCommandSimVars.Dtk], SimVarValueType.Degree, lnav.dtk);
    SimVar.SetSimVarValue(this.simVarNames[APExternalGpsSteerCommandSimVars.Xtk], SimVarValueType.NM, lnav.xtk);
    SimVar.SetSimVarValue(this.simVarNames[APExternalGpsSteerCommandSimVars.Tae], SimVarValueType.Degree, lnav.tae);
  }

  /**
   * Updates the glidepath external guidance SimVars.
   * @param glidepathGuidance The current glidepath guidance.
   */
  private updateGlidepathVars(glidepathGuidance: Accessible<Readonly<GarminVNavGlidepathGuidance>>): void {
    const guidance = glidepathGuidance.get();
    SimVar.SetSimVarValue(this.simVarNames[APExternalGlidepathGuidanceSimVars.ApproachHasGp], SimVarValueType.Bool, guidance.approachHasGlidepath);
    SimVar.SetSimVarValue(this.simVarNames[APExternalGlidepathGuidanceSimVars.IsValid], SimVarValueType.Bool, guidance.isValid);
    SimVar.SetSimVarValue(this.simVarNames[APExternalGlidepathGuidanceSimVars.CanCapture], SimVarValueType.Bool, guidance.canCapture);
    SimVar.SetSimVarValue(this.simVarNames[APExternalGlidepathGuidanceSimVars.Fpa], SimVarValueType.Degree, guidance.fpa);
    SimVar.SetSimVarValue(this.simVarNames[APExternalGlidepathGuidanceSimVars.Deviation], SimVarValueType.Feet, guidance.deviation);
  }
}
