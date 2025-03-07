import {
  Accessible, APAltCapDirector, APAltDirector, APBackCourseDirector, APConfig, APConfigDirectorEntry, APFLCDirector, APGPDirector, APGpsSteerDirector,
  APGpsSteerDirectorSteerCommand, APGSDirector, APHdgDirector, APLateralModes, APLvlDirector, APNavDirector, APRollDirector, APTogaPitchDirector, APTrkDirector,
  APValues, APVerticalModes, APVNavPathDirector, APVSDirector, ClockEvents, ConsumerSubject, EventBus, FacilityLoader, FlightPlanner, MathUtils, PlaneDirector,
  PluginSystem, SimVarValueType, SmoothingPathCalculator, Subscribable, UnitType
} from '@microsoft/msfs-sdk';

import { Epic2AvionicsPlugin, Epic2PluginBinder } from '../Epic2AvionicsPlugin';
import { FlightPlanStore } from '../FlightPlan';
import { Epic2FlightPlans } from '../Fms';
import { Epic2PerformancePlan } from '../Performance';
import { Epic2ApPitchDirector } from './directors/Epic2ApPitchDirector';
import { Epic2ApVorDirector } from './directors/Epic2ApVorDirector';
import { Epic2GaDirector } from './directors/Epic2GaDirector';
import { Epic2OverspeedProtectedDirector } from './directors/Epic2OverspeedProtectedDirector';
import { Epic2APUtils } from './Epic2APUtils';
import { Epic2NavToNavManager } from './Epic2NavToNavManager';
import { Epic2VariableBankManager } from './Epic2VariableBankManager';
import { Epic2VNavManager } from './Epic2VNavManager';
import { Epic2VnavUtils } from './Epic2VnavUtils';

/**
 * An Epic 2 autopilot configuration.
 */
export class Epic2APConfig implements APConfig {
  public defaultLateralMode = APLateralModes.ROLL;
  public defaultVerticalMode = APVerticalModes.PITCH;
  public defaultMaxNoseUpPitchAngle = 20;
  public defaultMaxNoseDownPitchAngle = 20;
  public defaultMaxBankAngle = 35;

  private readonly verticalPredictionFunctions = Epic2VnavUtils.getVerticalPredictionFunctions(this.pluginSystem);

  private readonly simRate = ConsumerSubject.create<number>(null, 1);

  /**
   * Instantiates the AP Config for the Autopilot.
   * @param bus is an instance of the Event Bus.
   * @param facLoader The facility loader.
   * @param flightPlanner is an instance of the flight planner.
   * @param flightPlanStore The flight plan store.
   * @param selectedFmsPosIndex The selected FMS pos system.
   * @param verticalPathCalculator The instance of the vertical path calculator to use for the vnav director.
   * @param activePerformancePlan The instance of the active performance plan to use for the vnav director.
   * @param gpsSteerCommand The steering command for the GPSS director to follow.
   * @param pluginSystem The upper mfd plugin system
   */
  constructor(
    private readonly bus: EventBus,
    private readonly facLoader: FacilityLoader,
    private readonly flightPlanner: FlightPlanner,
    private readonly flightPlanStore: FlightPlanStore,
    private readonly selectedFmsPosIndex: Subscribable<number>,
    private readonly verticalPathCalculator: SmoothingPathCalculator,
    private readonly activePerformancePlan: Epic2PerformancePlan,
    private readonly gpsSteerCommand: Accessible<Readonly<APGpsSteerDirectorSteerCommand>>,
    private readonly pluginSystem: PluginSystem<Epic2AvionicsPlugin, Epic2PluginBinder>,
  ) {
    const sub = this.bus.getSubscriber<ClockEvents>();
    this.simRate.setConsumer(sub.on('simRate'));
  }

  /** @inheritDoc */
  public createLateralDirectors(apValues: APValues): Iterable<Readonly<APConfigDirectorEntry>> {
    return [
      { mode: APLateralModes.HEADING, director: this.createHeadingDirector(apValues) },
      { mode: APLateralModes.TRACK, director: this.createTrackDirector(apValues) },
      { mode: APLateralModes.ROLL, director: this.createRollDirector(apValues) },
      { mode: APLateralModes.LEVEL, director: this.createWingLevelerDirector(apValues) },
      { mode: APLateralModes.GPSS, director: this.createGpssDirector(apValues) },
      { mode: APLateralModes.VOR, director: this.createVorDirector(apValues) },
      { mode: APLateralModes.LOC, director: this.createLocDirector(apValues) },
      { mode: APLateralModes.BC, director: this.createBcDirector(apValues) },
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
   * Creates the autopilot's track mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's track mode director, or `undefined` to omit the director.
   */
  protected createTrackDirector(apValues: APValues): APTrkDirector {
    return new APTrkDirector(this.bus, apValues, { turnReversalThreshold: 360 });
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
    return new Epic2ApVorDirector(this.bus, apValues, APLateralModes.VOR, { lateralInterceptCurve: Epic2APUtils.navInterceptCurve });
  }

  /**
   * Creates the autopilot's localizer mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's localizer mode director, or `undefined` to omit the director.
   */
  protected createLocDirector(apValues: APValues): APNavDirector {
    return new APNavDirector(this.bus, apValues, APLateralModes.LOC, { lateralInterceptCurve: Epic2APUtils.navInterceptCurve });
  }

  /**
   * Creates the autopilot's localizer backcourse mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's localizer backcourse mode director, or `undefined` to omit the director.
   */
  protected createBcDirector(apValues: APValues): APBackCourseDirector {
    return new APBackCourseDirector(this.bus, apValues, {
      lateralInterceptCurve: (distanceToSource: number, deflection: number, xtk: number, tas: number) => Epic2APUtils.localizerInterceptCurve(deflection, xtk, tas)
    });
  }

  /**
   * Creates the autopilot's pitch mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's pitch mode director, or `undefined` to omit the director.
   */
  protected createPitchDirector(apValues: APValues): PlaneDirector {
    const pitDirector = new Epic2ApPitchDirector(this.bus, apValues);
    return new Epic2OverspeedProtectedDirector(this.bus, pitDirector);
  }

  /**
   * Creates the autopilot's vertical speed mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's vertical speed mode director, or `undefined` to omit the director.
   */
  protected createVsDirector(apValues: APValues): PlaneDirector {
    const vsDirector = new APVSDirector(apValues);
    return new Epic2OverspeedProtectedDirector(this.bus, vsDirector);
  }

  /**
   * Creates the autopilot's flight level change mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's flight level change mode director, or `undefined` to omit the director.
   */
  protected createFlcDirector(apValues: APValues): PlaneDirector {
    const flcDirector = new APFLCDirector(apValues, { maxPitchUpAngle: 25, maxPitchDownAngle: 25 });
    return new Epic2OverspeedProtectedDirector(this.bus, flcDirector);
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
    return new APAltCapDirector(apValues, {
      shouldActivate: this.shouldActivateAltitudeCapture.bind(this),
      captureAltitude: this.captureAltitude.bind(this)
    });
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
    return new Epic2GaDirector(this.bus);
  }

  /**
   * Creates the autopilot's go-around vertical mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's go-around vertical mode director, or `undefined` to omit the director.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected createGaVerticalDirector(apValues: APValues): APTogaPitchDirector {
    return new Epic2GaDirector(this.bus);
  }

  private vnavManager?: Epic2VNavManager;

  /** @inheritdoc */
  public createVNavManager(apValues: APValues): Epic2VNavManager {
    return this.vnavManager ??= new Epic2VNavManager(
      this.bus,
      this.flightPlanner,
      this.verticalPathCalculator,
      this.activePerformancePlan,
      apValues,
      Epic2FlightPlans.Active,
      this.facLoader,
      this.verticalPredictionFunctions
    );
  }

  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public createNavToNavManager(apValues: APValues): Epic2NavToNavManager {
    return new Epic2NavToNavManager(this.bus, apValues, this.flightPlanStore, this.facLoader, this.selectedFmsPosIndex);
  }

  /** @inheritdoc */
  public createVariableBankManager(apValues: APValues): Epic2VariableBankManager {
    return new Epic2VariableBankManager(this.bus, apValues);
  }

  private static dVsNominal = 100; // Rate, at which altitudes shall be captured [ft/min/s], 200 translates to 0.104g, 100 to 0.052g
  private lastDesiredVs = 0;
  private previousAltCapTimestamp = 0;  // [msec] Timestamp when the capturing will end
  private previousVelY = 0;

  /**
   * A function which returns true if the capturing shall be activated
   * @param currentVs Current vertical speed in [ft/min]
   * @param targetAltitude Target altitude [ft]
   * @param currentAltitude Current altitude [ft]
   * @returns True if the capturing shall be activated
   */
  private shouldActivateAltitudeCapture(currentVs: number, targetAltitude: number, currentAltitude: number): boolean {
    // Determine the altitude capture range, i.e. the altitude deviation from target altitude at which the
    // capturing shall begin to achieve a steady capturing with an average nominal vs-rate of dVsNominal.
    const altCapturingRange = Math.min(((currentVs / 60) ** 2) / (2 * (Epic2APConfig.dVsNominal / 60)) + (Math.abs(currentVs) / 20), 1100);
    const deviationFromTarget = Math.abs(targetAltitude - currentAltitude);
    if (deviationFromTarget <= altCapturingRange) {
      this.lastDesiredVs = currentVs;
      this.previousAltCapTimestamp = Date.now();
      this.previousVelY = SimVar.GetSimVarValue('VELOCITY WORLD Y', 'feet per second');
      return true;
    } else {
      return false;
    }
  }

  /**
   * Method to use for capturing a target altitude.
   * @param targetAltitude is the captured targed altitude
   * @param indicatedAltitude is the current indicated altitude
   * @param initialFpa is the FPA when capture was initiatiated
   * @param tas The current true airspeed of the airplane, in knots.
   * @returns The target pitch value to set.
   */
  private captureAltitude(
    targetAltitude: number,
    indicatedAltitude: number,
    initialFpa: number,
    tas: number
  ): number {
    const newTimestamp = Date.now();
    const cycleDuration = (newTimestamp - this.previousAltCapTimestamp) / 1000.0;
    this.previousAltCapTimestamp = newTimestamp;

    const currentVs = SimVar.GetSimVarValue('VERTICAL SPEED', SimVarValueType.FPM);
    const deltaAltitude = targetAltitude - indicatedAltitude;

    // If active pause is switched on we want to pause the capturing logic as well. The only simvar
    // that reliably freezes in active pause is world velocity Y:
    const newVelY = SimVar.GetSimVarValue('VELOCITY WORLD Y', 'feet per second');
    if (newVelY !== this.previousVelY) {
      // For the actual capturing, we freshly calculate dVsAdaptive in each cycle. For any given delta altitude and vs,
      // dVsAdaptive is the steady decceleration, that would bring us exactly to the target altitude:
      const dVsAdaptive = 60 * ((currentVs / 60) ** 2) / (2 * Math.abs(deltaAltitude));  // [ft/min/s] !

      // We want desiredVs to only converge towards zero, therefore we apply the sign of lastDesiredVs:
      const thisCycleVsReduction = dVsAdaptive * cycleDuration * this.simRate.get() * Math.sign(this.lastDesiredVs);
      if (Math.abs(this.lastDesiredVs) > Math.abs(thisCycleVsReduction)) {
        // Apply the the reduction for this cycle as long as it is smaller than desiredVs:
        this.lastDesiredVs -= thisCycleVsReduction;
      } else {
        // Otherwise set desiredVs like the alt director does:
        this.lastDesiredVs = MathUtils.clamp(10 * deltaAltitude, -500, 500);
      }
    } else {
      this.lastDesiredVs = currentVs;
    }
    this.previousVelY = newVelY;

    return Math.asin(this.lastDesiredVs / UnitType.KNOT.convertTo(tas, UnitType.FPM)) * Avionics.Utils.RAD2DEG;
  }
}
