import {
  Accessible, APValues, APVerticalModes, EventBus, FlightPlanner, GPSSystemState, Subscribable, VNavManager,
  VNavPathCalculator, VNavPathMode, VNavState
} from '@microsoft/msfs-sdk';

import { GarminVNavComputer, GarminVNavComputerOptions } from './GarminVNavComputer';
import { GarminVNavGlidepathGuidance, GarminVNavGuidance } from './GarminVNavTypes';
import { GarminVNavManagerEvents } from './GarminVNavManagerEvents';
import { GarminGlidepathComputer, GarminGlidepathComputerOptions } from './GarminGlidepathComputer';

/**
 * Options for {@link GarminVNavManager2}.
 */
export interface GarminVNavManager2InternalComputerOptions {
  /** Whether to enable Garmin advanced VNAV. */
  enableAdvancedVNav: boolean;

  /** Whether to allow +V approach service levels when no SBAS is present. */
  allowPlusVWithoutSbas: boolean;

  /** Whether to allow approach service levels requiring baro VNAV. */
  allowApproachBaroVNav: boolean;

  /** Whether to allow RNP (AR) approach service levels. */
  allowRnpAr: boolean;

  /** The current GPS system state. */
  gpsSystemState: Subscribable<GPSSystemState>;
}

/**
 * A new Garmin VNav Manager.
 */
export class GarminVNavManager2 implements VNavManager {

  private readonly publisher = this.bus.getPublisher<GarminVNavManagerEvents>();

  /** @inheritDoc */
  public state = VNavState.Disabled;

  /** @inheritDoc */
  public onActivate?: () => void;

  /** @inheritDoc */
  public onDeactivate?: () => void;

  /** @inheritDoc */
  public armMode?: (mode: APVerticalModes) => void;

  /** @inheritDoc */
  public activateMode?: (mode: APVerticalModes) => void;

  private readonly apValues: APValues;

  /** This manager's internal VNAV computer. */
  public readonly vnavComputer?: GarminVNavComputer;

  /** This manager's internal glidepath computer. */
  public readonly glidepathComputer?: GarminGlidepathComputer;

  private readonly guidance?: Accessible<Readonly<GarminVNavGuidance>>;
  private readonly glidePathGuidance?: Accessible<Readonly<GarminVNavGlidepathGuidance>>;

  // eslint-disable-next-line jsdoc/require-returns
  /** Whether VNAV is active. */
  public get isActive(): boolean {
    return this.guidance ? this.guidance.get().isActive : false;
  }

  private inhibitPathMode = false;

  /**
   * Creates a new instance of GarminVNavManager2 that uses VNAV guidance from an external source.
   * @param bus The event bus.
   * @param apValues Autopilot values from this manager's parent autopilot.
   * @param guidance The VNAV guidance to use.
   * @param glidepathGuidance The glidepath guidance to use.
   */
  public constructor(
    bus: EventBus,
    apValues: APValues,
    guidance: Accessible<Readonly<GarminVNavGuidance>> | undefined,
    glidepathGuidance: Accessible<Readonly<GarminVNavGlidepathGuidance>> | undefined
  );
  /**
   * Creates a new instance of GarminVNavManager2 that maintains its own instance of `GarminVNavComputer` from which
   * to source VNAV guidance. The index of the VNAV computer is `0`.
   * @param bus The event bus.
   * @param flightPlanner The flight planner containing the flight plan for which the VNAV computer provides guidance.
   * @param calculator The VNAV path calculator providing the vertical flight path for which the VNAV computer provides
   * guidance.
   * @param apValues Autopilot values from this manager's parent autopilot.
   * @param options Options with which to configure the internal VNAV and glidepath computers.
   */
  public constructor(
    bus: EventBus,
    flightPlanner: FlightPlanner,
    calculator: VNavPathCalculator,
    apValues: APValues,
    options?: Readonly<GarminVNavManager2InternalComputerOptions>
  );
  /**
   * Creates a new instance of GarminVNavManager2 that maintains its own instance of `GarminVNavComputer` from which
   * to source VNAV guidance. The index of the VNAV computer is `0`.
   * @param bus The event bus.
   * @param flightPlanner The flight planner containing the flight plan for which the VNAV computer provides guidance.
   * @param calculator The VNAV path calculator providing the vertical flight path for which the VNAV computer provides
   * guidance.
   * @param apValues Autopilot values from this manager's parent autopilot.
   * @param primaryPlanIndex The index of the flight plan for which the VNAV computer provides vertical guidance.
   * @param options Guidance options with which to configure the VNAV computer.
   */
  public constructor(
    bus: EventBus,
    flightPlanner: FlightPlanner,
    calculator: VNavPathCalculator,
    apValues: APValues,
    primaryPlanIndex: number,
    options?: Partial<Readonly<GarminVNavManager2InternalComputerOptions>>
  );
  // eslint-disable-next-line jsdoc/require-jsdoc
  public constructor(
    private readonly bus: EventBus,
    arg2: APValues | FlightPlanner,
    arg3?: Accessible<Readonly<GarminVNavGuidance>> | VNavPathCalculator,
    arg4?: APValues | Accessible<Readonly<GarminVNavGlidepathGuidance>>,
    arg5?: number | Readonly<GarminVNavManager2InternalComputerOptions>,
    arg6?: Partial<Readonly<GarminVNavManager2InternalComputerOptions>>
  ) {
    if (arg2 instanceof FlightPlanner) {
      this.apValues = arg4 as APValues;

      let options: Readonly<GarminVNavComputerOptions & GarminGlidepathComputerOptions> | undefined;
      if (typeof arg5 === 'number') {
        options = {
          primaryPlanIndex: arg5,
          ...arg6
        };
      } else {
        options = arg5;
      }

      this.vnavComputer = new GarminVNavComputer(
        0,
        bus,
        arg2,
        arg3 as VNavPathCalculator,
        this.apValues,
        options
      );
      this.glidepathComputer = new GarminGlidepathComputer(
        0,
        bus,
        arg2,
        options
      );

      this.guidance = this.vnavComputer.guidance;
      this.glidePathGuidance = this.glidepathComputer.glidepathGuidance;
    } else {
      this.apValues = arg2;
      this.guidance = arg3 as Accessible<Readonly<GarminVNavGuidance>> | undefined;
      this.glidePathGuidance = arg4 as Accessible<Readonly<GarminVNavGlidepathGuidance>> | undefined;
    }
  }

  /** @inheritDoc */
  public setState(): void {
    // noop
  }

  /** @inheritDoc */
  public tryActivate(): void {
    this.vnavComputer?.tryActivate();
    this.publisher.pub('vnav_manager_activated', undefined, true, false);
  }

  /** @inheritDoc */
  public tryDeactivate(): void {
    this.vnavComputer?.tryDeactivate();
    this.publisher.pub('vnav_manager_deactivated', undefined, true, false);
  }

  /** @inheritDoc */
  public canVerticalModeActivate(mode: APVerticalModes): boolean {
    if (this.guidance) {
      const guidance = this.guidance.get();

      if (guidance.armedClimbMode !== APVerticalModes.NONE && (mode === APVerticalModes.FLC || mode === APVerticalModes.VS)) {
        return false;
      }
    }

    return true;
  }

  /** @inheritDoc */
  public onPathDirectorDeactivated(): void {
    // When the PATH director is deactivated, we will set a flag to inhibit re-activation. This is to prevent immediate
    // re-activation of the PATH director while the source of the manager's VNAV guidance has not yet had a chance to
    // respond to the deactivation of PATH.
    this.inhibitPathMode = true;
  }

  /**
   * Method called to delegate altitude capture to the Alt Cap Director.
   * @param altitude The altitude to capture.
   */
  private delegateAltCap(altitude: number): void {
    const verticalActive = this.apValues.verticalActive.get();
    if (verticalActive === APVerticalModes.CAP || verticalActive === APVerticalModes.ALT) {
      return;
    }

    this.apValues.capturedAltitude.set(Math.round(altitude));
    this.activateMode && this.activateMode(APVerticalModes.CAP);
  }

  /**
   * Arms a climb mode. The mode will be armed only if the currently active vertical mode is an altitude hold mode.
   * @param mode The mode to arm.
   */
  private armClimb(mode: APVerticalModes): void {
    if (this.apValues.verticalArmed.get() === mode || this.apValues.verticalActive.get() !== APVerticalModes.ALT) {
      return;
    }

    this.armMode && this.armMode(mode);
  }

  /**
   * Activates a climb mode.
   * @param mode The mode to activate.
   */
  private activateClimb(mode: APVerticalModes): void {
    if (this.apValues.verticalActive.get() === mode) {
      return;
    }

    this.activateMode && this.activateMode(mode);
  }

  /**
   * Disarms climb (FLC) mode.
   */
  private disarmClimb(): void {
    if (this.apValues.verticalArmed.get() === APVerticalModes.FLC) {
      this.armMode && this.armMode(APVerticalModes.NONE);
    }
  }

  /**
   * Arms PATH mode. The mode will be armed only if the currently active vertical mode is not an altitude capture mode.
   */
  private armPath(): void {
    if (this.apValues.verticalArmed.get() === APVerticalModes.PATH || this.apValues.verticalActive.get() === APVerticalModes.CAP) {
      return;
    }

    this.armMode && this.armMode(APVerticalModes.PATH);
  }

  /**
   * Activates PATH mode.
   */
  private activatePath(): void {
    if (this.apValues.verticalActive.get() === APVerticalModes.PATH) {
      return;
    }

    this.activateMode && this.activateMode(APVerticalModes.PATH);
  }

  /**
   * Deactivates and disarms PATH mode.
   */
  private disarmPath(): void {
    if (this.apValues.verticalArmed.get() === APVerticalModes.PATH) {
      this.armMode && this.armMode(APVerticalModes.NONE);
    }

    if (this.apValues.verticalActive.get() === APVerticalModes.PATH) {
      this.activateMode && this.activateMode(APVerticalModes.PITCH);
    }
  }

  /** @inheritDoc */
  public update(): void {
    if (this.vnavComputer) {
      this.vnavComputer.update();
    }
    if (this.glidepathComputer) {
      this.glidepathComputer.update();
    }

    if (this.glidePathGuidance) {
      this.apValues.approachHasGP.set(this.glidePathGuidance.get().approachHasGlidepath);
    }

    if (this.guidance) {
      const guidance = this.guidance.get();

      this.state = guidance.state;

      let hasActivatedMode = false;

      if (guidance.shouldCaptureAltitude) {
        this.delegateAltCap(guidance.altitudeToCapture);
        hasActivatedMode = true;
      }

      if (this.inhibitPathMode && guidance.pathMode !== VNavPathMode.PathActive) {
        this.inhibitPathMode = false;
      }

      if (!hasActivatedMode && !this.inhibitPathMode && guidance.pathMode === VNavPathMode.PathActive) {
        this.activatePath();
        hasActivatedMode = true;
      } else if (guidance.pathMode === VNavPathMode.PathArmed) {
        this.armPath();
      } else {
        this.disarmPath();
      }

      if (guidance.armedClimbMode !== APVerticalModes.NONE) {
        if (!hasActivatedMode && guidance.shouldActivateClimbMode) {
          this.activateClimb(guidance.armedClimbMode);
        } else {
          this.armClimb(guidance.armedClimbMode);
        }
      } else {
        this.disarmClimb();
      }
    }
  }
}