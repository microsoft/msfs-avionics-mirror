import {
  Accessible, APAltCapDirector, APAltDirector, APBackCourseDirector, APConfig, APConfigDirectorEntry, APFLCDirector, APGPDirector,
  APGpsSteerDirector, APGpsSteerDirectorSteerCommand, APGSDirector, APHdgDirector, APLateralModes, APLvlDirector,
  APNavDirector, APPitchDirector, APRollDirector, APTogaPitchDirector, APValues, APVerticalModes, APVNavPathDirector,
  APVSDirector, EventBus, FlightPlanner, MathUtils, PlaneDirector, SimVarValueType, SmoothingPathCalculator
} from '@microsoft/msfs-sdk';

import { MessageService, PerformancePlan, WT21FmsUtils, WT21VNavManager } from '@microsoft/msfs-wt21-shared';

import { WT21APUtils } from './WT21APUtils';
import { WT21NavToNavManager } from './WT21NavToNavManager';
import { WT21VariableBankManager } from './WT21VariableBankManager';

/**
 * A WT21 autopilot configuration.
 */
export class WT21APConfig implements APConfig {
  public defaultLateralMode = APLateralModes.ROLL;
  public defaultVerticalMode = APVerticalModes.PITCH;
  public defaultMaxBankAngle = 35;

  /**
   * Instantiates the AP Config for the Autopilot.
   * @param bus is an instance of the Event Bus.
   * @param flightPlanner is an instance of the flight planner.
   * @param messageService The instance of MessageService to use.
   * @param verticalPathCalculator The instance of the vertical path calculator to use for the vnav director.
   * @param activePerformancePlan The instance of the active performance plan to use for the vnav director.
   * @param gpsSteerCommand The steering command for the GPSS director to follow.
   */
  constructor(
    private readonly bus: EventBus,
    private readonly flightPlanner: FlightPlanner,
    private readonly messageService: MessageService,
    private readonly verticalPathCalculator: SmoothingPathCalculator,
    private readonly activePerformancePlan: PerformancePlan,
    private readonly gpsSteerCommand: Accessible<Readonly<APGpsSteerDirectorSteerCommand>>,
  ) { }

  /** @inheritDoc */
  public createLateralDirectors(apValues: APValues): Iterable<Readonly<APConfigDirectorEntry>> {
    return [
      { mode: APLateralModes.HEADING, director: this.createHeadingDirector(apValues) },
      { mode: APLateralModes.ROLL, director: this.createRollDirector(apValues) },
      { mode: APLateralModes.LEVEL, director: this.createWingLevelerDirector(apValues) },
      { mode: APLateralModes.GPSS, director: this.createGpssDirector(apValues) },
      { mode: APLateralModes.VOR, director: this.createVorDirector(apValues) },
      { mode: APLateralModes.LOC, director: this.createLocDirector(apValues) },
      { mode: APLateralModes.BC, director: this.createBcDirector(apValues) },
      { mode: APLateralModes.TO, director: this.createToLateralDirector(apValues) },
      { mode: APLateralModes.GA, director: this.createGaLateralDirector(apValues) },
    ].filter(entry => entry.director !== undefined) as Iterable<Readonly<APConfigDirectorEntry>>;
  }

  /** @inheritDoc */
  public createVerticalDirectors(apValues: APValues): Iterable<Readonly<APConfigDirectorEntry>> {
    return [
      { mode: APVerticalModes.PITCH, director: this.createPitchDirector(apValues) },
      { mode: APVerticalModes.VS, director: this.createVsDirector(apValues) },
      { mode: APVerticalModes.FLC, director: this.createFlcDirector(apValues) },
      { mode: APVerticalModes.ALT, director: this.createAltHoldDirector(apValues) },
      { mode: APVerticalModes.CAP, director: this.createAltCapDirector(apValues) },
      { mode: APVerticalModes.PATH, director: this.createVNavPathDirector(apValues) },
      { mode: APVerticalModes.GP, director: this.createGpDirector(apValues) },
      { mode: APVerticalModes.GS, director: this.createGsDirector(apValues) },
      { mode: APVerticalModes.TO, director: this.createToVerticalDirector(apValues) },
      { mode: APVerticalModes.GA, director: this.createGaVerticalDirector(apValues) },
    ].filter(entry => entry.director !== undefined) as Iterable<Readonly<APConfigDirectorEntry>>;
  }

  /**
   * Creates the autopilot's heading mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's heading mode director, or `undefined` to omit the director.
   */
  protected createHeadingDirector(apValues: APValues): APHdgDirector {
    return new APHdgDirector(this.bus, apValues, { turnReversalThreshold: 360 });
  }

  /**
   * Creates the autopilot's roll mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's roll mode director, or `undefined` to omit the director.
   */
  protected createRollDirector(apValues: APValues): APRollDirector {
    return new APRollDirector(apValues);
  }

  /**
   * Creates the autopilot's wing level mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's wing level mode director, or `undefined` to omit the director.
   */
  protected createWingLevelerDirector(apValues: APValues): APLvlDirector {
    return new APLvlDirector(apValues);
  }

  /**
   * Creates the autopilot's GPSS mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's GPSS mode director, or `undefined` to omit the director.
   */
  protected createGpssDirector(apValues: APValues): APGpsSteerDirector {
    return new APGpsSteerDirector(apValues, this.gpsSteerCommand, {
      canActivate: (apValuesInner, state) => {
        return state.rollSteerCommand !== null
          && state.rollSteerCommand.isValid
          && Math.abs(state.rollSteerCommand.xtk) < 0.6
          && Math.abs(state.rollSteerCommand.tae) < 110
          && SimVar.GetSimVarValue('RADIO HEIGHT', SimVarValueType.Feet) >= 401;
      },
    });
  }

  /**
   * Creates the autopilot's VOR mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's VOR mode director, or `undefined` to omit the director.
   */
  protected createVorDirector(apValues: APValues): APNavDirector {
    return new APNavDirector(this.bus, apValues, APLateralModes.VOR, { lateralInterceptCurve: WT21APUtils.navInterceptCurve });
  }

  /**
   * Creates the autopilot's localizer mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's localizer mode director, or `undefined` to omit the director.
   */
  protected createLocDirector(apValues: APValues): APNavDirector {
    return new APNavDirector(this.bus, apValues, APLateralModes.LOC, { lateralInterceptCurve: WT21APUtils.navInterceptCurve });
  }

  /**
   * Creates the autopilot's localizer backcourse mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's localizer backcourse mode director, or `undefined` to omit the director.
   */
  protected createBcDirector(apValues: APValues): APBackCourseDirector {
    return new APBackCourseDirector(this.bus, apValues, {
      lateralInterceptCurve: (distanceToSource: number, deflection: number, xtk: number, tas: number) => WT21APUtils.localizerInterceptCurve(deflection, xtk, tas)
    });
  }

  /**
   * Creates the autopilot's takeoff lateral mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's takeoff lateral mode director, or `undefined` to omit the director.
   */
  protected createToLateralDirector(apValues: APValues): PlaneDirector | undefined {
    return new APHdgDirector(this.bus, apValues, { isToGaMode: true });
  }

  /**
   * Creates the autopilot's go-around lateral mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's go-around lateral mode director, or `undefined` to omit the director.
   */
  protected createGaLateralDirector(apValues: APValues): PlaneDirector | undefined {
    return new APHdgDirector(this.bus, apValues, { isToGaMode: true });
  }

  /**
   * Creates the autopilot's pitch mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's pitch mode director, or `undefined` to omit the director.
   */
  protected createPitchDirector(apValues: APValues): APPitchDirector {
    return new APPitchDirector(this.bus, apValues, { minPitch: -20, maxPitch: 25 });
  }

  /**
   * Creates the autopilot's vertical speed mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's vertical speed mode director, or `undefined` to omit the director.
   */
  protected createVsDirector(apValues: APValues): APVSDirector {
    return new APVSDirector(apValues);
  }

  /**
   * Creates the autopilot's flight level change mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's flight level change mode director, or `undefined` to omit the director.
   */
  protected createFlcDirector(apValues: APValues): APFLCDirector {
    return new APFLCDirector(apValues, { maxPitchUpAngle: 25, maxPitchDownAngle: 25 });
  }

  /**
   * Creates the autopilot's altitude hold mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's altitude hold mode director, or `undefined` to omit the director.
   */
  protected createAltHoldDirector(apValues: APValues): APAltDirector {
    return new APAltDirector(apValues);
  }

  /**
   * Creates the autopilot's altitude capture mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's altitude capture mode director, or `undefined` to omit the director.
   */
  protected createAltCapDirector(apValues: APValues): APAltCapDirector {
    return new APAltCapDirector(apValues, { captureAltitude: this.captureAltitude.bind(this) });
  }

  /**
   * Creates the autopilot's VNAV path mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's VNAV path mode director, or `undefined` to omit the director.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected createVNavPathDirector(apValues: APValues): APVNavPathDirector | undefined {
    return new APVNavPathDirector(this.bus);
  }

  /**
   * Creates the autopilot's glidepath mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's glidepath mode director, or `undefined` to omit the director.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected createGpDirector(apValues: APValues): APGPDirector {
    return new APGPDirector(this.bus, apValues);
  }

  /**
   * Creates the autopilot's glideslope mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's glideslope mode director, or `undefined` to omit the director.
   */
  protected createGsDirector(apValues: APValues): APGSDirector {
    return new APGSDirector(this.bus, apValues);
  }

  /**
   * Creates the autopilot's takeoff vertical mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's takeoff vertical mode director, or `undefined` to omit the director.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected createToVerticalDirector(apValues: APValues): APTogaPitchDirector {
    //TODO: This value should be read in from the systems.cfg 'pitch_takeoff_ga' value
    return new APTogaPitchDirector(10);
  }

  /**
   * Creates the autopilot's go-around vertical mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's go-around vertical mode director, or `undefined` to omit the director.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected createGaVerticalDirector(apValues: APValues): APTogaPitchDirector {
    return new APTogaPitchDirector(8);
  }

  private vnavManager?: WT21VNavManager;

  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public createVNavManager(apValues: APValues): WT21VNavManager {
    return this.vnavManager ??= new WT21VNavManager(
      this.bus,
      this.flightPlanner,
      this.verticalPathCalculator,
      this.activePerformancePlan,
      this.messageService,
      apValues,
      WT21FmsUtils.PRIMARY_ACT_PLAN_INDEX,
    );
  }

  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public createNavToNavManager(apValues: APValues): WT21NavToNavManager {
    return new WT21NavToNavManager(this.bus, apValues, this.messageService);
  }

  /** @inheritdoc */
  public createVariableBankManager(apValues: APValues): WT21VariableBankManager {
    return new WT21VariableBankManager(this.bus, apValues);
  }

  /**
   * Method to use for capturing a target altitude.
   * @param targetAltitude is the captured targed altitude
   * @param indicatedAltitude is the current indicated altitude
   * @param initialFpa is the FPA when capture was initiatiated
   * @returns The target pitch value to set.
   */
  private captureAltitude(targetAltitude: number, indicatedAltitude: number, initialFpa: number): number {
    const altCapDeviation = indicatedAltitude - targetAltitude;
    const altCapPitchPercentage = Math.min(Math.abs(altCapDeviation) / 300, 1);
    const desiredPitch = (initialFpa * altCapPitchPercentage);
    return MathUtils.clamp(desiredPitch, -6, 6);
  }
}
