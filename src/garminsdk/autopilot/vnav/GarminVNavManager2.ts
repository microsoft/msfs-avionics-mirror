import {
  Accessible, APValues, APVerticalModes, EventBus, VNavManager, VNavPathMode, VNavState
} from '@microsoft/msfs-sdk';

import { GarminVNavComputer } from './GarminVNavComputer';
import { GarminVNavManagerEvents } from './GarminVNavManagerEvents';
import { GarminVNavGlidepathGuidance, GarminVNavGuidance } from './GarminVNavTypes';
import { GarminGlidepathComputer } from './GarminGlidepathComputer';

/**
 * Options for {@link GarminVNavManager2}.
 */
export interface GarminVNavManager2Options {
  /**
   * A function that creates an internal VNAV computer for the VNAV manager. The internal computer will be updated by
   * the VNAV manager, and the manager will use the internal computer's VNAV and VNAV path guidance.
   * @param apValues The autopilot's state values.
   * @returns An internal VNAV computer for the VNAV manager.
   */
  internalVNavComputer?: (apValues: APValues) => GarminVNavComputer;

  /**
   * A function that creates an internal glidepath computer for the VNAV manager. The internal computer will be updated
   * by the VNAV manager, and the manager will use the internal computer's glidepath guidance.
   * @param apValues The autopilot's state values.
   * @returns An internal glidepath computer for the VNAV manager.
   */
  internalGlidepathComputer?: (apValues: APValues) => GarminGlidepathComputer;

  /** The VNAV guidance to use. Ignored if `internalVNavComputer` is defined. */
  guidance?: Accessible<Readonly<GarminVNavGuidance>> | undefined;

  /** The glidepath guidance to use. Ignored if `internalGlidepathComputer` is defined. */
  glidepathGuidance?: Accessible<Readonly<GarminVNavGlidepathGuidance>> | undefined;
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
  public armMode?: (mode: number) => void;

  /** @inheritDoc */
  public activateMode?: (mode: number) => void;

  // eslint-disable-next-line jsdoc/require-returns
  /** Whether VNAV is active. */
  public get isActive(): boolean {
    return this.guidance ? this.guidance.get().isActive : false;
  }

  /** This manager's internal VNAV computer. */
  public readonly vnavComputer?: GarminVNavComputer;

  /** This manager's internal glidepath computer. */
  public readonly glidepathComputer?: GarminGlidepathComputer;

  private readonly guidance?: Accessible<Readonly<GarminVNavGuidance>>;
  private readonly glidepathGuidance?: Accessible<Readonly<GarminVNavGlidepathGuidance>>;

  private inhibitPathMode = false;

  /**
   * Creates a new instance of GarminVNavManager2 that uses VNAV guidance from an external source.
   * @param bus The event bus.
   * @param apValues Autopilot values from this manager's parent autopilot.
   * @param options Options with which to configure the manager.
   */
  public constructor(
    private readonly bus: EventBus,
    private readonly apValues: APValues,
    options?: Readonly<GarminVNavManager2Options>
  ) {
    if (options) {
      if (options.internalVNavComputer) {
        this.vnavComputer = options.internalVNavComputer(apValues);
        this.guidance = this.vnavComputer.guidance;
      } else {
        this.guidance = options.guidance;
      }

      if (options.internalGlidepathComputer) {
        this.glidepathComputer = options.internalGlidepathComputer(apValues);
        this.glidepathGuidance = this.glidepathComputer.glidepathGuidance;
      } else {
        this.glidepathGuidance = options.glidepathGuidance;
      }
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
  public canVerticalModeActivate(mode: number): boolean {
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
  private armClimb(mode: number): void {
    if (this.apValues.verticalArmed.get() === mode || this.apValues.verticalActive.get() !== APVerticalModes.ALT) {
      return;
    }

    this.armMode && this.armMode(mode);
  }

  /**
   * Activates a climb mode.
   * @param mode The mode to activate.
   */
  private activateClimb(mode: number): void {
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

    if (this.glidepathGuidance) {
      this.apValues.approachHasGP.set(this.glidepathGuidance.get().approachHasGlidepath);
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