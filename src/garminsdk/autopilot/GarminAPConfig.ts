import {
  Accessible, APAltCapDirector, APAltDirector, APBackCourseDirector, APFLCDirector, APGPDirector, APGpsSteerDirector,
  APGpsSteerDirectorSteerCommand, APGSDirector, APHdgDirector, APLateralModes, APLvlDirector, APNavDirector,
  APPitchDirector, APPitchLvlDirector, APRollDirector, APTogaPitchDirector, APValues, APVerticalModes,
  APVNavPathDirector, APVSDirector, AutopilotDriverOptions, EventBus, FlightPlanner, LNavDirector, NavToNavManager,
  NavToNavManager2, PlaneDirector, Subscribable, VNavManager, VNavPathCalculator
} from '@microsoft/msfs-sdk';

import { Fms } from '../flightplan/Fms';
import { GarminObsDirector } from './directors/GarminObsDirector';
import { GarminAPConfigInterface } from './GarminAPConfigInterface';
import { GarminAPUtils } from './GarminAPUtils';
import { GarminNavToNavManager } from './navtonav/GarminNavToNavManager';
import { GarminNavToNavManager2, GarminNavToNavManager2Guidance, GarminNavToNavManager2Options } from './navtonav/GarminNavToNavManager2';
import { GarminVNavManager2, GarminVNavManager2InternalComputerOptions } from './vnav/GarminVNavManager2';
import { GarminVNavGlidepathGuidance, GarminVNavGuidance, GarminVNavPathGuidance } from './vnav/GarminVNavTypes';

/**
 * Options for configuring a Garmin GPS (LNAV) director.
 */
export type GarminLNavDirectorOptions = {
  /**
   * The steering command to send to the autopilot's GPS roll-steering director. If not defined and the autopilot is
   * configured to source data from a static flight planner or FMS instance, then the autopilot will use a GPS director
   * that is bundled with its own LNAV computer.
   */
  steerCommand?: Accessible<Readonly<APGpsSteerDirectorSteerCommand>>;

  /**
   * Whether to disable arming on the GPS director. If `true`, then the director will skip the arming phase and instead
   * immediately activate itself when requested. Defaults to `false`.
   */
  disableArming?: boolean;
};

/**
 * Options for configuring Garmin autopilot directors.
 */
export type GarminAPConfigDirectorOptions = {
  /** The default rate at which commanded pitch changes, in degrees per second. Defaults to `5`. */
  defaultPitchRate?: number;

  /** The default rate at which commanded bank changes, in degrees per second. Defaults to `10`. */
  defaultBankRate?: number;

  /** The ID of the CDI associated with the autopilot. Defaults to the empty string (`''`). */
  cdiId?: string;

  /** Options for the LNAV director. */
  lnavOptions?: Readonly<GarminLNavDirectorOptions>;

  /**
   * Whether the autopilot should use internal VNAV and glidepath computers. Internal computers require that a vertical
   * path calculator and either flight planner or _static_ (not subscribable) FMS instance be defined. If these
   * conditions are not met and `useInternalVNavComputer` is `true`, then the autopilot will be configured without
   * VNAV or glidepath capability. Defaults to `true`.
   */
  useInternalVNavComputer?: boolean;

  /** Options for the autopilot's internal VNAV and glidepath computers. Ignored if `useInternalVNavComputer` is `false`. */
  vnavOptions?: Readonly<GarminVNavManager2InternalComputerOptions>;

  /** VNAV guidance for the autopilot's VNAV manager to use. Ignored if `useInternalVNavComputer` is `true`. */
  vnavGuidance?: Accessible<Readonly<GarminVNavGuidance>>;

  /** Guidance for the autopilot's VNAV path director to use. Ignored if `useInternalVNavComputer` is `true`. */
  verticalPathGuidance?: Accessible<Readonly<GarminVNavPathGuidance>>;

  /** Guidance for the autopilot's glidepath director to use. Ignored if `useInternalVNavComputer` is `true`. */
  glidepathGuidance?: Accessible<Readonly<GarminVNavGlidepathGuidance>>;

  /** The minimum bank angle, in degrees, supported by the ROL director. Defaults to `6`. */
  rollMinBankAngle?: number;

  /** The maximum bank angle, in degrees, supported by the ROL director. Defaults to `25`. */
  rollMaxBankAngle?: number;

  /** The maximum bank angle, in degrees, supported by the HDG director. Defaults to `25`. */
  hdgMaxBankAngle?: number;

  /** The maximum bank angle, in degrees, supported by the VOR director. Defaults to `25`. */
  vorMaxBankAngle?: number;

  /** The maximum bank angle, in degrees, supported by the LOC director. Defaults to `25`. */
  locMaxBankAngle?: number;

  /** The maximum bank angle, in degrees, supported by the LNAV director. Defaults to `25`. */
  lnavMaxBankAngle?: number;

  /**
   * The maximum bank angle, in degrees, to apply to the HDG, VOR, LOC, and LNAV directors while in Low Bank Mode.
   * Defaults to `15`.
   */
  lowBankAngle?: number;

  /**
   * The threshold difference between selected heading and current heading, in degrees, at which the heading director
   * unlocks its commanded turn direction and chooses a new optimal turn direction to establish on the selected
   * heading, potentially resulting in a turn reversal. Any value less than or equal to 180 degrees effectively
   * prevents the director from locking a commanded turn direction. Any value greater than or equal to 360 degrees will
   * require the selected heading to traverse past the current heading in the desired turn direction in order for the
   * director to issue a turn reversal. Defaults to `331`.
   */
  hdgTurnReversalThreshold?: number;
};

/**
 * Options for configuring Garmin autopilots.
 */
export type GarminAPConfigOptions = GarminAPConfigDirectorOptions & {
  /**
   * Whether the autopilot should use mach number calculated from the impact pressure derived from indicated airspeed
   * and ambient pressure instead of the true mach number. Defaults to `false`.
   */
  useIndicatedMach?: boolean;

  /**
   * Guidance for the autopilot's nav-to-nav manager to use. If defined, then a `GarminNavToNavManager2` will be
   * created as the autopilot's nav-to-nav manager and the guidance will be passed to it. If not defined, then a
   * `GarminNavToNavManager` will be created instead if an FMS instance or flight planner is passed to the
   * configuration.
   */
  navToNavGuidance?: GarminNavToNavManager2Guidance;

  /**
   * Options with which to configure the autopilot's `GarminNavToNavManager2` nav-to-nav manager. Ignored if
   * `navToNavGuidance` is undefined.
   */
  navToNavOptions?: Readonly<GarminNavToNavManager2Options>;
}

/**
 * A Garmin Autopilot Configuration.
 */
export class GarminAPConfig implements GarminAPConfigInterface {
  /** The default commanded pitch angle rate, in degrees per second. */
  public static readonly DEFAULT_PITCH_RATE = 5;

  /** The default commanded bank angle rate, in degrees per second. */
  public static readonly DEFAULT_BANK_RATE = 10;

  /** The default minimum bank angle, in degrees, for ROL director. */
  public static readonly DEFAULT_ROLL_MIN_BANK_ANGLE = 6;

  /** The default maximum bank angle, in degrees, for ROL, HDG, NAV, and LNAV directors. */
  public static readonly DEFAULT_MAX_BANK_ANGLE = 25;

  /** The default maximum bank angle, in degrees, in Low Bank Mode. */
  public static readonly DEFAULT_LOW_BANK_ANGLE = 15;

  /** The default HDG director turn direction unlock threshold, in degrees. */
  public static readonly DEFAULT_HDG_DIRECTION_UNLOCK_THRESHOLD = 331;

  public defaultLateralMode = APLateralModes.ROLL;
  public defaultVerticalMode = APVerticalModes.PITCH;
  public defaultMaxBankAngle = GarminAPConfig.DEFAULT_MAX_BANK_ANGLE;

  /** @inheritDoc */
  public readonly cdiId: string;

  public autopilotDriverOptions: AutopilotDriverOptions;

  /**
   * Whether the autopilot should use mach number calculated from the impact pressure derived from indicated airspeed
   * and ambient pressure instead of the true mach number.
   */
  public readonly useIndicatedMach: boolean;

  private readonly flightPlanner?: FlightPlanner;
  private readonly fms?: Fms | Subscribable<Fms>;

  /** Options for the LNAV director. */
  private readonly lnavOptions: Partial<Readonly<GarminLNavDirectorOptions>>;

  private readonly useInternalVNavComputer: boolean;

  private readonly vnavOptions?: Readonly<GarminVNavManager2InternalComputerOptions>;
  private readonly vnavGuidance?: Accessible<Readonly<GarminVNavGuidance>>;

  private readonly rollMinBankAngle: number;
  private readonly rollMaxBankAngle: number;
  private readonly hdgMaxBankAngle: number;
  private readonly vorMaxBankAngle: number;
  private readonly locMaxBankAngle: number;
  private readonly lnavMaxBankAngle: number;
  private readonly lowBankAngle: number;

  private readonly hdgTurnReversalThreshold: number;

  private vnavManager?: GarminVNavManager2;

  private readonly defaultVerticalPathGuidance: GarminVNavPathGuidance = {
    isValid: false,
    fpa: 0,
    deviation: 0
  };
  private readonly verticalPathGuidance: Accessible<Readonly<GarminVNavPathGuidance>>;

  private readonly defaultGlidepathGuidance: GarminVNavGlidepathGuidance = {
    approachHasGlidepath: false,
    isValid: false,
    canCapture: false,
    fpa: 0,
    deviation: 0
  };
  private readonly glidepathGuidance: Accessible<Readonly<GarminVNavGlidepathGuidance>>;

  private readonly navToNavGuidance?: GarminNavToNavManager2Guidance;
  private readonly navToNavOptions?: Readonly<GarminNavToNavManager2Options>;

  /**
   * Creates a new instance of GarminAPConfig.
   * @param bus The event bus.
   * @param flightPlanner The flight planner of the FMS instance from which to source data. The LNAV instance index
   * associated with the flight planner is assumed to be `0`.
   * @param verticalPathCalculator The vertical path calculator to use for the autopilot's internal VNAV and glidepath
   * computers. If not defined, then the internal computers will not be created even if the omission would leave the
   * autopilot without VNAV and glidepath capability.
   * @param options Options to configure the directors.
   * @deprecated
   */
  public constructor(
    bus: EventBus,
    flightPlanner: FlightPlanner,
    verticalPathCalculator?: VNavPathCalculator,
    options?: Readonly<GarminAPConfigOptions>
  );
  /**
   * Creates a new instance of GarminAPConfig.
   * @param bus The event bus.
   * @param fms The FMS instance from which to source data.
   * @param verticalPathCalculator The vertical path calculator to use for the autopilot's internal VNAV and glidepath
   * computers. If not defined, then the internal computers will not be created even if the omission would leave the
   * autopilot without VNAV and glidepath capability.
   * @param options Options to configure the directors.
   */
  public constructor(
    bus: EventBus,
    fms: Fms | Subscribable<Fms>,
    verticalPathCalculator?: VNavPathCalculator,
    options?: Readonly<GarminAPConfigOptions>
  );
  // eslint-disable-next-line jsdoc/require-jsdoc
  public constructor(
    private readonly bus: EventBus,
    arg2: FlightPlanner | Fms | Subscribable<Fms>,
    private readonly verticalPathCalculator?: VNavPathCalculator,
    options?: Readonly<GarminAPConfigOptions>
  ) {
    this.cdiId = options?.cdiId ?? '';

    if (arg2 instanceof FlightPlanner) {
      this.flightPlanner = arg2;
    } else {
      this.fms = arg2;
      if (this.fms instanceof Fms) {
        this.flightPlanner = this.fms.flightPlanner;
      }
    }

    this.autopilotDriverOptions = {
      pitchServoRate: options?.defaultPitchRate ?? GarminAPConfig.DEFAULT_PITCH_RATE,
      bankServoRate: options?.defaultBankRate ?? GarminAPConfig.DEFAULT_BANK_RATE
    };

    this.useIndicatedMach = options?.useIndicatedMach ?? false;

    this.lnavOptions = { ...options?.lnavOptions };

    this.useInternalVNavComputer = options?.useInternalVNavComputer ?? true;

    this.vnavGuidance = options?.vnavGuidance;

    this.vnavOptions = this.useInternalVNavComputer ? options?.vnavOptions : undefined;

    this.verticalPathGuidance = this.useInternalVNavComputer
      ? {
        /** @inheritDoc */
        get: (): Readonly<GarminVNavPathGuidance> => {
          return this.vnavManager && this.vnavManager.vnavComputer
            ? this.vnavManager.vnavComputer.pathGuidance.get()
            : this.defaultVerticalPathGuidance;
        }
      }
      : options?.verticalPathGuidance ?? { get: () => this.defaultVerticalPathGuidance };

    this.glidepathGuidance = this.useInternalVNavComputer
      ? {
        /** @inheritDoc */
        get: (): Readonly<GarminVNavGlidepathGuidance> => {
          return this.vnavManager && this.vnavManager.glidepathComputer
            ? this.vnavManager.glidepathComputer.glidepathGuidance.get()
            : this.defaultGlidepathGuidance;
        }
      }
      : options?.glidepathGuidance ?? { get: () => this.defaultGlidepathGuidance };

    this.navToNavGuidance = options?.navToNavGuidance;

    this.rollMinBankAngle = options?.rollMinBankAngle ?? GarminAPConfig.DEFAULT_ROLL_MIN_BANK_ANGLE;
    this.rollMaxBankAngle = options?.rollMaxBankAngle ?? GarminAPConfig.DEFAULT_MAX_BANK_ANGLE;
    this.hdgMaxBankAngle = options?.hdgMaxBankAngle ?? GarminAPConfig.DEFAULT_MAX_BANK_ANGLE;
    this.vorMaxBankAngle = options?.vorMaxBankAngle ?? GarminAPConfig.DEFAULT_MAX_BANK_ANGLE;
    this.locMaxBankAngle = options?.locMaxBankAngle ?? GarminAPConfig.DEFAULT_MAX_BANK_ANGLE;
    this.lnavMaxBankAngle = options?.lnavMaxBankAngle ?? GarminAPConfig.DEFAULT_MAX_BANK_ANGLE;
    this.lowBankAngle = options?.lowBankAngle ?? GarminAPConfig.DEFAULT_LOW_BANK_ANGLE;
    this.hdgTurnReversalThreshold = options?.hdgTurnReversalThreshold ?? GarminAPConfig.DEFAULT_HDG_DIRECTION_UNLOCK_THRESHOLD;
  }

  /** @inheritdoc */
  public createHeadingDirector(apValues: APValues): APHdgDirector {
    return new APHdgDirector(this.bus, apValues, {
      maxBankAngle: () => apValues.maxBankId.get() === 1 ? Math.min(this.hdgMaxBankAngle, this.lowBankAngle) : this.hdgMaxBankAngle,
      turnReversalThreshold: this.hdgTurnReversalThreshold
    });
  }

  /** @inheritdoc */
  public createRollDirector(apValues: APValues): APRollDirector {
    return new APRollDirector(apValues, { minBankAngle: this.rollMinBankAngle, maxBankAngle: this.rollMaxBankAngle });
  }

  /** @inheritdoc */
  public createWingLevelerDirector(apValues: APValues): APLvlDirector {
    return new APLvlDirector(this.bus, apValues);
  }

  /** @inheritdoc */
  public createPitchLevelerDirector(apValues: APValues): APPitchLvlDirector {
    return new APPitchLvlDirector(apValues);
  }

  /** @inheritdoc */
  public createGpssDirector(apValues: APValues): PlaneDirector | undefined {
    const maxBankAngle = (): number => apValues.maxBankId.get() === 1 ? Math.min(this.lnavMaxBankAngle, this.lowBankAngle) : this.lnavMaxBankAngle;

    if (this.lnavOptions.steerCommand) {
      return new APGpsSteerDirector(
        this.bus,
        apValues,
        this.lnavOptions.steerCommand,
        {
          maxBankAngle,
          canActivate: state => Math.abs(state.xtk) < 0.6 && Math.abs(state.tae) < 110,
          disableArming: this.lnavOptions.disableArming
        }
      );
    } else {
      if (this.flightPlanner) {
        return new LNavDirector(
          this.bus,
          apValues,
          this.flightPlanner,
          new GarminObsDirector(this.bus, apValues, {
            maxBankAngle,
            lateralInterceptCurve: GarminAPUtils.lnavIntercept,
          }),
          {
            maxBankAngle,
            lateralInterceptCurve: GarminAPUtils.lnavIntercept,
            hasVectorAnticipation: true,
            disableArming: this.lnavOptions.disableArming
          }
        );
      } else {
        return undefined;
      }
    }
  }

  /** @inheritdoc */
  public createVorDirector(apValues: APValues): APNavDirector {
    return new APNavDirector(this.bus, apValues, APLateralModes.VOR, {
      maxBankAngle: () => apValues.maxBankId.get() === 1 ? Math.min(this.vorMaxBankAngle, this.lowBankAngle) : this.vorMaxBankAngle,
      lateralInterceptCurve: GarminAPUtils.navIntercept
    });
  }

  /** @inheritdoc */
  public createLocDirector(apValues: APValues): APNavDirector {
    return new APNavDirector(this.bus, apValues, APLateralModes.LOC, {
      maxBankAngle: () => apValues.maxBankId.get() === 1 ? Math.min(this.locMaxBankAngle, this.lowBankAngle) : this.locMaxBankAngle,
      lateralInterceptCurve: GarminAPUtils.navIntercept
    });
  }

  /** @inheritdoc */
  public createBcDirector(apValues: APValues): APBackCourseDirector {
    return new APBackCourseDirector(this.bus, apValues, {
      maxBankAngle: () => apValues.maxBankId.get() === 1 ? Math.min(this.locMaxBankAngle, this.lowBankAngle) : this.locMaxBankAngle,
      lateralInterceptCurve: (distanceToSource: number, deflection: number, xtk: number, tas: number) => GarminAPUtils.localizerIntercept(xtk, tas)
    });
  }

  /** @inheritdoc */
  public createPitchDirector(apValues: APValues): APPitchDirector {
    return new APPitchDirector(this.bus, apValues);
  }

  /** @inheritdoc */
  public createVsDirector(apValues: APValues): APVSDirector {
    return new APVSDirector(apValues);
  }

  /** @inheritdoc */
  public createFlcDirector(apValues: APValues): APFLCDirector {
    return new APFLCDirector(apValues, { useIndicatedMach: this.useIndicatedMach });
  }

  /** @inheritdoc */
  public createAltHoldDirector(apValues: APValues): APAltDirector {
    return new APAltDirector(apValues);
  }

  /** @inheritdoc */
  public createAltCapDirector(apValues: APValues): APAltCapDirector {
    return new APAltCapDirector(apValues);
  }

  /** @inheritdoc */
  public createVNavManager(apValues: APValues): VNavManager | undefined {
    if (this.useInternalVNavComputer) {
      if (this.flightPlanner && this.verticalPathCalculator) {
        return this.vnavManager = new GarminVNavManager2(this.bus, this.flightPlanner, this.verticalPathCalculator, apValues, this.vnavOptions);
      } else {
        return undefined;
      }
    } else {
      return this.vnavManager = new GarminVNavManager2(this.bus, apValues, this.vnavGuidance, this.glidepathGuidance);
    }
  }

  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public createVNavPathDirector(apValues: APValues): PlaneDirector | undefined {
    return new APVNavPathDirector(this.bus, { guidance: this.verticalPathGuidance });
  }

  /** @inheritdoc */
  public createGpDirector(apValues: APValues): APGPDirector {
    return new APGPDirector(this.bus, apValues, {
      guidance: this.glidepathGuidance,
      canCapture: this.glidepathGuidance
        ? () => {
          return apValues.lateralActive.get() === APLateralModes.GPSS && this.glidepathGuidance!.get().canCapture;
        }
        : undefined
    });
  }

  /** @inheritdoc */
  public createGsDirector(apValues: APValues): APGSDirector {
    return new APGSDirector(this.bus, apValues);
  }

  /** @inheritdoc */
  public createToVerticalDirector(): PlaneDirector | undefined {
    //TODO: This value should be read in from the systems.cfg 'pitch_takeoff_ga' value

    return new APTogaPitchDirector(10);
  }

  /** @inheritdoc */
  public createGaVerticalDirector(): PlaneDirector | undefined {
    return new APTogaPitchDirector(7.5);
  }

  /** @inheritdoc */
  public createToLateralDirector(apValues: APValues): PlaneDirector | undefined {
    return new APLvlDirector(this.bus, apValues, { isToGaMode: true });
  }

  /** @inheritdoc */
  public createGaLateralDirector(apValues: APValues): PlaneDirector | undefined {
    return new APLvlDirector(this.bus, apValues, { isToGaMode: true });
  }

  /** @inheritdoc */
  public createNavToNavManager(apValues: APValues): NavToNavManager | NavToNavManager2 | undefined {
    if (this.navToNavGuidance) {
      return new GarminNavToNavManager2(this.bus, apValues, this.navToNavGuidance, this.navToNavOptions);
    } if (this.fms) {
      return new GarminNavToNavManager(this.bus, this.fms, apValues);
    } else if (this.flightPlanner) {
      return new GarminNavToNavManager(this.bus, this.flightPlanner, apValues);
    } else {
      return undefined;
    }
  }
}
