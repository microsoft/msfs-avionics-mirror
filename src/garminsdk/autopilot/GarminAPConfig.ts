import {
  Accessible, APAltCapDirector, APAltDirector, APBackCourseDirector, APConfigDirectorEntry, APFLCDirector,
  APGPDirector, APGpsSteerDirector, APGpsSteerDirectorSteerCommand, APGSDirector, APHdgDirector, APLateralModes,
  APLvlDirector, APNavDirector, APPitchDirector, APPitchLvlDirector, APRollDirector, APTogaPitchDirector, APValues,
  APVerticalModes, APVNavPathDirector, APVSDirector, AutopilotDriverOptions, EventBus,
  NavToNavManager2, PlaneDirector, VNavManager
} from '@microsoft/msfs-sdk';

import { GarminAPConfigInterface } from './GarminAPConfigInterface';
import { GarminAPUtils } from './GarminAPUtils';
import { GarminNavToNavManager2, GarminNavToNavManager2Guidance, GarminNavToNavManager2Options } from './navtonav/GarminNavToNavManager2';
import { GarminVNavComputer } from './vnav/GarminVNavComputer';
import { GarminVNavManager2 } from './vnav/GarminVNavManager2';
import { GarminVNavGlidepathGuidance, GarminVNavGuidance, GarminVNavPathGuidance } from './vnav/GarminVNavTypes';
import { GarminGlidepathComputer } from './vnav/GarminGlidepathComputer';

/**
 * Options for configuring a Garmin GPS (LNAV) director.
 */
export type GarminLNavDirectorOptions = {
  /**
   * The steering command to send to the autopilot's GPS roll-steering director.
   */
  steerCommand: Accessible<Readonly<APGpsSteerDirectorSteerCommand>>;

  /**
   * Whether to disable arming on the GPS director. If `true`, then the director will skip the arming phase and instead
   * immediately activate itself when requested. Defaults to `false`.
   */
  disableArming?: boolean;
};

/**
 * Options for configuring Garmin autopilots.
 */
export type GarminAPConfigOptions = {
  /** The ID of the CDI associated with the autopilot. Defaults to the empty string (`''`). */
  cdiId?: string;

  /**
   * Whether the autopilot should use mach number calculated from the impact pressure derived from indicated airspeed
   * and ambient pressure instead of the true mach number. Defaults to `false`.
   */
  useIndicatedMach?: boolean;

  /** The default rate at which commanded pitch changes, in degrees per second. Defaults to `5`. */
  defaultPitchRate?: number;

  /** The default rate at which commanded bank changes, in degrees per second. Defaults to `10`. */
  defaultBankRate?: number;

  /** Options for the LNAV (GPSS) director. If not defined, then the autopilot will not include an LNAV director */
  lnavOptions?: Readonly<GarminLNavDirectorOptions>;

  /**
   * A function that creates an internal VNAV computer for the autopilot's VNAV manager. The internal computer will be
   * updated by the VNAV manager, and the autopilot will use the internal computer's VNAV and VNAV path guidance.
   * @param apValues The autopilot's state values.
   * @returns An internal VNAV computer for the autopilot's VNAV manager.
   */
  internalVNavComputer?: (apValues: APValues) => GarminVNavComputer;

  /**
   * A function that creates an internal glidepath computer for the autopilot's VNAV manager. The internal computer
   * will be updated by the VNAV manager, and the autopilot will use the internal computer's glidepath guidance.
   * @param apValues The autopilot's state values.
   * @returns An internal glidepath computer for the autopilot's VNAV manager.
   */
  internalGlidepathComputer?: (apValues: APValues) => GarminGlidepathComputer;

  /** VNAV guidance for the autopilot's VNAV manager to use. Ignored if `internalVNavComputer` is defined. */
  vnavGuidance?: Accessible<Readonly<GarminVNavGuidance>>;

  /** Guidance for the autopilot's VNAV path director to use. Ignored if `internalVNavComputer` is defined. */
  verticalPathGuidance?: Accessible<Readonly<GarminVNavPathGuidance>>;

  /** Guidance for the autopilot's glidepath director to use. Ignored if `internalGlidepathComputer` is defined. */
  glidepathGuidance?: Accessible<Readonly<GarminVNavGlidepathGuidance>>;

  /**
   * Guidance for the autopilot's nav-to-nav manager to use. If defined, then a `GarminNavToNavManager2` will be
   * created as the autopilot's nav-to-nav manager and the guidance will be passed to it. If not defined, then the
   * autopilot will not support nav-to-nav.
   */
  navToNavGuidance?: GarminNavToNavManager2Guidance;

  /**
   * Options with which to configure the autopilot's `GarminNavToNavManager2` nav-to-nav manager. Ignored if
   * `navToNavGuidance` is undefined.
   */
  navToNavOptions?: Readonly<GarminNavToNavManager2Options>;

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
   * The target pitch angle, in degrees, commanded by the TO director. Positive values indicate upward pitch. Defaults
   * to `10`.
   */
  toPitchAngle?: number;

  /**
   * The target pitch angle, in degrees, commanded by the GA director. Positive values indicate upward pitch. Defaults
   * to `7.5`.
   */
  gaPitchAngle?: number;

  /**
   * The threshold difference between selected heading and current heading, in degrees, at which the heading director
   * unlocks its commanded turn direction and chooses a new optimal turn direction to establish on the selected
   * heading, potentially resulting in a turn reversal. Any value less than or equal to 180 degrees effectively
   * prevents the director from locking a commanded turn direction. Any value greater than or equal to 360 degrees will
   * require the selected heading to traverse past the current heading in the desired turn direction in order for the
   * director to issue a turn reversal. Defaults to `331`.
   */
  hdgTurnReversalThreshold?: number;

  /** Whether to deactivate the autopilot when GA mode is armed in response to a TO/GA mode button press. Defaults to `true`. */
  deactivateAutopilotOnGa?: boolean;
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

  /** The default target pitch angle, in degrees, commanded by the TO director. Positive values indicate upward pitch. */
  public static readonly DEFAULT_TO_PITCH_ANGLE = 10;

  /** The default target pitch angle, in degrees, commanded by the GA director. Positive values indicate upward pitch. */
  public static readonly DEFAULT_GA_PITCH_ANGLE = 7.5;

  /** The default HDG director turn direction unlock threshold, in degrees. */
  public static readonly DEFAULT_HDG_DIRECTION_UNLOCK_THRESHOLD = 331;

  public defaultLateralMode = APLateralModes.ROLL;
  public defaultVerticalMode = APVerticalModes.PITCH;
  public defaultMaxBankAngle = GarminAPConfig.DEFAULT_MAX_BANK_ANGLE;

  /** @inheritDoc */
  public readonly cdiId: string;

  /** @inheritDoc */
  public readonly deactivateAutopilotOnGa: boolean;

  public autopilotDriverOptions: AutopilotDriverOptions;

  /**
   * Whether the autopilot should use mach number calculated from the impact pressure derived from indicated airspeed
   * and ambient pressure instead of the true mach number.
   */
  public readonly useIndicatedMach: boolean;

  /** Options for the LNAV director. */
  private readonly lnavOptions?: Readonly<GarminLNavDirectorOptions>;

  private readonly rollMinBankAngle: number;
  private readonly rollMaxBankAngle: number;
  private readonly hdgMaxBankAngle: number;
  private readonly vorMaxBankAngle: number;
  private readonly locMaxBankAngle: number;
  private readonly lnavMaxBankAngle: number;
  private readonly lowBankAngle: number;

  private readonly toPitchAngle: number;
  private readonly gaPitchAngle: number;

  private readonly hdgTurnReversalThreshold: number;

  private vnavManager?: GarminVNavManager2;

  private readonly internalVNavComputer?: (apValues: APValues) => GarminVNavComputer;
  private readonly internalGlidepathComputer?: (apValues: APValues) => GarminGlidepathComputer;

  private readonly vnavGuidance?: Accessible<Readonly<GarminVNavGuidance>>;

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
   * @param options Options to configure the directors.
   */
  public constructor(
    private readonly bus: EventBus,
    options?: Readonly<GarminAPConfigOptions>
  ) {
    this.cdiId = options?.cdiId ?? '';
    this.deactivateAutopilotOnGa = options?.deactivateAutopilotOnGa ?? true;

    this.autopilotDriverOptions = {
      pitchServoRate: options?.defaultPitchRate ?? GarminAPConfig.DEFAULT_PITCH_RATE,
      bankServoRate: options?.defaultBankRate ?? GarminAPConfig.DEFAULT_BANK_RATE
    };

    this.useIndicatedMach = options?.useIndicatedMach ?? false;

    if (options?.lnavOptions) {
      this.lnavOptions = { ...options.lnavOptions };
    }

    this.internalVNavComputer = options?.internalVNavComputer;
    this.internalGlidepathComputer = options?.internalGlidepathComputer;

    this.vnavGuidance = options?.vnavGuidance;

    this.verticalPathGuidance = this.internalVNavComputer
      ? {
        /** @inheritDoc */
        get: (): Readonly<GarminVNavPathGuidance> => {
          return this.vnavManager && this.vnavManager.vnavComputer
            ? this.vnavManager.vnavComputer.pathGuidance.get()
            : this.defaultVerticalPathGuidance;
        }
      }
      : options?.verticalPathGuidance ?? { get: () => this.defaultVerticalPathGuidance };

    this.glidepathGuidance = this.internalGlidepathComputer
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

    this.toPitchAngle = options?.toPitchAngle ?? GarminAPConfig.DEFAULT_TO_PITCH_ANGLE;
    this.gaPitchAngle = options?.gaPitchAngle ?? GarminAPConfig.DEFAULT_GA_PITCH_ANGLE;
  }

  /** @inheritDoc */
  public createLateralDirectors(apValues: APValues): Iterable<Readonly<APConfigDirectorEntry>> {
    return [
      { mode: APLateralModes.ROLL, director: this.createRollDirector(apValues) },
      { mode: APLateralModes.LEVEL, director: this.createWingLevelerDirector(apValues) },
      { mode: APLateralModes.HEADING, director: this.createHeadingDirector(apValues) },
      { mode: APLateralModes.TRACK, director: this.createTrackDirector(apValues) },
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
      { mode: APVerticalModes.LEVEL, director: this.createPitchLevelerDirector(apValues) },
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
   * Creates the autopilot's roll mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's roll mode director, or `undefined` to omit the director.
   */
  protected createRollDirector(apValues: APValues): PlaneDirector | undefined {
    return new APRollDirector(apValues, { minBankAngle: this.rollMinBankAngle, maxBankAngle: this.rollMaxBankAngle });
  }

  /**
   * Creates the autopilot's wing level mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's wing level mode director, or `undefined` to omit the director.
   */
  protected createWingLevelerDirector(apValues: APValues): PlaneDirector | undefined {
    return new APLvlDirector(apValues);
  }

  /**
   * Creates the autopilot's heading mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's heading mode director, or `undefined` to omit the director.
   */
  protected createHeadingDirector(apValues: APValues): PlaneDirector | undefined {
    return new APHdgDirector(this.bus, apValues, {
      maxBankAngle: () => apValues.maxBankId.get() === 1 ? Math.min(this.hdgMaxBankAngle, this.lowBankAngle) : this.hdgMaxBankAngle,
      turnReversalThreshold: this.hdgTurnReversalThreshold
    });
  }

  /**
   * Creates the autopilot's track mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's track mode director, or `undefined` to omit the director.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected createTrackDirector(apValues: APValues): PlaneDirector | undefined {
    // TODO
    return undefined;
  }

  /**
   * Creates the autopilot's GPSS mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's GPSS mode director, or `undefined` to omit the director.
   */
  protected createGpssDirector(apValues: APValues): PlaneDirector | undefined {
    if (this.lnavOptions) {
      const maxBankAngle = (): number => apValues.maxBankId.get() === 1 ? Math.min(this.lnavMaxBankAngle, this.lowBankAngle) : this.lnavMaxBankAngle;

      return new APGpsSteerDirector(
        apValues,
        this.lnavOptions.steerCommand,
        {
          maxBankAngle,
          canActivate: this.lnavOptions.disableArming
            ? () => true
            : GarminAPUtils.gpssCanActivate,
        }
      );
    } else {
      return undefined;
    }
  }

  /**
   * Creates the autopilot's VOR mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's VOR mode director, or `undefined` to omit the director.
   */
  protected createVorDirector(apValues: APValues): PlaneDirector | undefined {
    return new APNavDirector(this.bus, apValues, APLateralModes.VOR, {
      maxBankAngle: () => apValues.maxBankId.get() === 1 ? Math.min(this.vorMaxBankAngle, this.lowBankAngle) : this.vorMaxBankAngle,
      canArm: GarminAPUtils.navCanArm,
      canActivate: GarminAPUtils.navCanActivate,
      canRemainActive: GarminAPUtils.navCanRemainActive,
      lateralInterceptCurve: GarminAPUtils.navIntercept
    });
  }

  /**
   * Creates the autopilot's localizer mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's localizer mode director, or `undefined` to omit the director.
   */
  protected createLocDirector(apValues: APValues): PlaneDirector | undefined {
    return new APNavDirector(this.bus, apValues, APLateralModes.LOC, {
      maxBankAngle: () => apValues.maxBankId.get() === 1 ? Math.min(this.locMaxBankAngle, this.lowBankAngle) : this.locMaxBankAngle,
      canArm: GarminAPUtils.navCanArm,
      canActivate: GarminAPUtils.navCanActivate,
      canRemainActive: GarminAPUtils.navCanRemainActive,
      lateralInterceptCurve: GarminAPUtils.navIntercept
    });
  }

  /**
   * Creates the autopilot's localizer backcourse mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's localizer backcourse mode director, or `undefined` to omit the director.
   */
  protected createBcDirector(apValues: APValues): PlaneDirector | undefined {
    return new APBackCourseDirector(this.bus, apValues, {
      maxBankAngle: () => apValues.maxBankId.get() === 1 ? Math.min(this.locMaxBankAngle, this.lowBankAngle) : this.locMaxBankAngle,
      canArm: GarminAPUtils.backCourseCanArm,
      canActivate: GarminAPUtils.backCourseCanActivate,
      canRemainActive: GarminAPUtils.backCourseCanRemainActive,
      lateralInterceptCurve: (distanceToSource: number, deflection: number, xtk: number, tas: number) => GarminAPUtils.localizerIntercept(xtk, tas)
    });
  }

  /**
   * Creates the autopilot's takeoff lateral mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's takeoff lateral mode director, or `undefined` to omit the director.
   */
  protected createToLateralDirector(apValues: APValues): PlaneDirector | undefined {
    return new APLvlDirector(apValues, { omitWingLeveler: true });
  }

  /**
   * Creates the autopilot's go-around lateral mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's go-around lateral mode director, or `undefined` to omit the director.
   */
  protected createGaLateralDirector(apValues: APValues): PlaneDirector | undefined {
    return new APLvlDirector(apValues, { omitWingLeveler: true });
  }

  /**
   * Creates the autopilot's pitch mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's pitch mode director, or `undefined` to omit the director.
   */
  protected createPitchDirector(apValues: APValues): PlaneDirector | undefined {
    return new APPitchDirector(this.bus, apValues);
  }

  /**
   * Creates the autopilot's pitch level mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's pitch level mode director, or `undefined` to omit the director.
   */
  protected createPitchLevelerDirector(apValues: APValues): PlaneDirector | undefined {
    return new APPitchLvlDirector(apValues);
  }

  /**
   * Creates the autopilot's vertical speed mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's vertical speed mode director, or `undefined` to omit the director.
   */
  protected createVsDirector(apValues: APValues): PlaneDirector | undefined {
    return new APVSDirector(apValues);
  }

  /**
   * Creates the autopilot's flight level change mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's flight level change mode director, or `undefined` to omit the director.
   */
  protected createFlcDirector(apValues: APValues): PlaneDirector | undefined {
    return new APFLCDirector(apValues, { useIndicatedMach: this.useIndicatedMach });
  }

  /**
   * Creates the autopilot's altitude hold mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's altitude hold mode director, or `undefined` to omit the director.
   */
  protected createAltHoldDirector(apValues: APValues): PlaneDirector | undefined {
    return new APAltDirector(apValues);
  }

  /**
   * Creates the autopilot's altitude capture mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's altitude capture mode director, or `undefined` to omit the director.
   */
  protected createAltCapDirector(apValues: APValues): PlaneDirector | undefined {
    return new APAltCapDirector(apValues);
  }

  /**
   * Creates the autopilot's VNAV path mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's VNAV path mode director, or `undefined` to omit the director.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected createVNavPathDirector(apValues: APValues): PlaneDirector | undefined {
    return new APVNavPathDirector(this.bus, { guidance: this.verticalPathGuidance });
  }

  /**
   * Creates the autopilot's glidepath mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's glidepath mode director, or `undefined` to omit the director.
   */
  protected createGpDirector(apValues: APValues): PlaneDirector | undefined {
    return new APGPDirector(this.bus, apValues, {
      guidance: this.glidepathGuidance,
      canArm: GarminAPUtils.glidepathCanArm.bind(undefined, apValues),
      canCapture: this.glidepathGuidance
        ? () => {
          return apValues.lateralActive.get() === APLateralModes.GPSS && this.glidepathGuidance!.get().canCapture;
        }
        : undefined
    });
  }

  /**
   * Creates the autopilot's glideslope mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's glideslope mode director, or `undefined` to omit the director.
   */
  protected createGsDirector(apValues: APValues): PlaneDirector | undefined {
    return new APGSDirector(this.bus, apValues, {
      canArm: GarminAPUtils.glideslopeCanArm,
      canActivate: GarminAPUtils.glideslopeCanActivate,
      canRemainActive: GarminAPUtils.glideslopeCanRemainActive
    });
  }

  /**
   * Creates the autopilot's takeoff vertical mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's takeoff vertical mode director, or `undefined` to omit the director.
   */
  protected createToVerticalDirector(apValues: APValues): PlaneDirector | undefined {
    return new APTogaPitchDirector(apValues, { targetPitchAngle: this.toPitchAngle });
  }

  /**
   * Creates the autopilot's go-around vertical mode director.
   * @param apValues The autopilot's state values.
   * @returns The autopilot's go-around vertical mode director, or `undefined` to omit the director.
   */
  protected createGaVerticalDirector(apValues: APValues): PlaneDirector | undefined {
    return new APTogaPitchDirector(apValues, { targetPitchAngle: this.gaPitchAngle });
  }

  /** @inheritDoc */
  public createVNavManager(apValues: APValues): VNavManager | undefined {
    return this.vnavManager = new GarminVNavManager2(this.bus, apValues, {
      internalVNavComputer: this.internalVNavComputer,
      internalGlidepathComputer: this.internalGlidepathComputer,
      guidance: this.vnavGuidance,
      glidepathGuidance: this.glidepathGuidance
    });
  }

  /** @inheritDoc */
  public createNavToNavManager(apValues: APValues): NavToNavManager2 | undefined {
    if (this.navToNavGuidance) {
      return new GarminNavToNavManager2(this.bus, apValues, this.navToNavGuidance, this.navToNavOptions);
    } else {
      return undefined;
    }
  }
}
