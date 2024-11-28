/// <reference types="@microsoft/msfs-types/coherent/apcontroller" />

import { CdiEvents } from '../cdi/CdiEvents';
import { CdiUtils } from '../cdi/CdiUtils';
import { ControlEvents } from '../data/ControlPublisher';
import { EventBus } from '../data/EventBus';
import { SimVarValueType } from '../data/SimVars';
import { FlightPlanner } from '../flightplan/FlightPlanner';
import { AdcEvents } from '../instruments/Adc';
import { APEvents } from '../instruments/APPublisher';
import { ClockEvents } from '../instruments/Clock';
import { NavComEvents } from '../instruments/NavCom';
import { NavSourceId, NavSourceType } from '../instruments/NavProcessor';
import { MSFSAPStates } from '../navigation/AutopilotListener';
import { Subject } from '../sub/Subject';
import { APConfig } from './APConfig';
import { APControlEvents } from './APControlEvents';
import { AutopilotModeVars } from './APModeVars';
import { APAltitudeModes, APLateralModes, APVerticalModes } from './APTypes';
import { APValues } from './APValues';
import { AutopilotDriver } from './AutopilotDriver';
import { APNoneLateralDirector, APNoneVerticalDirector } from './directors/APNoneDirectors';
import { DirectorState, PlaneDirector } from './directors/PlaneDirector';
import { APModePressEvent, APStateManager } from './managers/APStateManager';
import { NavToNavManager2 } from './managers/NavToNavManager2';
import { VNavManager } from './managers/VNavManager';
import { VNavAltCaptureType, VNavState } from './VerticalNavigation';
import { VNavEvents } from './vnav/VNavEvents';

/**
 * An Autopilot.
 */
export class Autopilot<Config extends APConfig = APConfig> {
  /** This autopilot's nav-to-nav transfer manager. */
  public readonly navToNavManager: NavToNavManager2 | undefined;

  /** This autopilot's VNav Manager. */
  public readonly vnavManager: VNavManager | undefined;

  /** This autopilot's variable bank angle Manager. */
  public readonly variableBankManager: Record<any, any> | undefined;

  /** This autopilot's sim autopilot driver. */
  protected readonly apDriver: AutopilotDriver;

  protected cdiSource: Readonly<NavSourceId> = { type: NavSourceType.Nav, index: 0 };

  protected readonly lateralModes = new Map<number, PlaneDirector>();
  protected readonly verticalModes = new Map<number, PlaneDirector>();

  protected verticalAltitudeArmed: APAltitudeModes = APAltitudeModes.NONE;
  protected verticalApproachArmed: number = APVerticalModes.NONE;
  protected altCapArmed = false;
  protected lateralModeFailed = false;

  protected inClimb = false;
  protected currentAltitude = 0;
  protected vnavCaptureType = VNavAltCaptureType.None;

  protected flightPlanSynced = false;

  /** Can be set to false in child classes to override behavior for certain aircraft. */
  protected requireApproachIsActiveForNavToNav = true;

  protected readonly _apValues = {
    cdiId: this.config.cdiId ?? '',
    cdiSource: Subject.create<Readonly<NavSourceId>>(this.cdiSource, CdiUtils.navSourceIdEquals),
    simRate: Subject.create(0),
    selectedAltitude: Subject.create(0),
    selectedVerticalSpeed: Subject.create(0),
    selectedFlightPathAngle: Subject.create(0),
    selectedIas: Subject.create(0),
    selectedMach: Subject.create(0),
    isSelectedSpeedInMach: Subject.create<boolean>(false),
    selectedPitch: Subject.create(0),
    maxBankId: Subject.create(0),
    maxBankAngle: Subject.create(30),
    maxNoseUpPitchAngle: Subject.create(Infinity),
    maxNoseDownPitchAngle: Subject.create(Infinity),
    selectedHeading: Subject.create(0),
    capturedAltitude: Subject.create(0),
    approachIsActive: Subject.create<boolean>(false),
    approachHasGP: Subject.create<boolean>(false),
    nav1HasGs: Subject.create<boolean>(false),
    nav2HasGs: Subject.create<boolean>(false),
    nav3HasGs: Subject.create<boolean>(false),
    nav4HasGs: Subject.create<boolean>(false),
    lateralActive: Subject.create<APLateralModes>(APLateralModes.NONE),
    verticalActive: Subject.create<APVerticalModes>(APVerticalModes.NONE),
    lateralArmed: Subject.create<APLateralModes>(APLateralModes.NONE),
    verticalArmed: Subject.create<APVerticalModes>(APVerticalModes.NONE),
    apApproachModeOn: Subject.create<boolean>(false)
  };

  public readonly apValues: APValues = this._apValues;

  protected autopilotInitialized = false;

  /**
   * Creates an instance of the Autopilot.
   * @param bus The event bus.
   * @param flightPlanner This autopilot's associated flight planner.
   * @param config This autopilot's configuration.
   * @param stateManager This autopilot's state manager.
   */
  constructor(
    protected readonly bus: EventBus,
    protected readonly flightPlanner: FlightPlanner,
    protected readonly config: Config,
    public readonly stateManager: APStateManager
  ) {

    if (config.defaultMaxBankAngle !== undefined) {
      this.apValues.maxBankAngle.set(config.defaultMaxBankAngle);
    }

    if (config.defaultMaxNoseUpPitchAngle !== undefined) {
      this.apValues.maxNoseUpPitchAngle.set(config.defaultMaxNoseUpPitchAngle);
    }
    if (config.defaultMaxNoseDownPitchAngle !== undefined) {
      this.apValues.maxNoseDownPitchAngle.set(config.defaultMaxNoseDownPitchAngle);
    }

    this.createDirectors(config);
    this.vnavManager = config.createVNavManager?.(this.apValues);
    this.navToNavManager = config.createNavToNavManager?.(this.apValues);
    this.variableBankManager = config.createVariableBankManager?.(this.apValues);

    if (this.navToNavManager) {
      this.apValues.navToNavArmableNavRadioIndex = this.navToNavManager.getArmableNavRadioIndex.bind(this.navToNavManager);
      this.apValues.navToNavArmableLateralMode = this.navToNavManager.getArmableLateralMode.bind(this.navToNavManager);
      this.apValues.navToNavArmableVerticalMode = this.navToNavManager.getArmableVerticalMode.bind(this.navToNavManager);
      this.apValues.navToNavTransferInProgress = this.navToNavManager.isTransferInProgress.bind(this.navToNavManager);
    }

    this.stateManager.stateManagerInitialized.sub((v) => {
      if (v) {
        this.autopilotInitialized = true;
      } else {
        this.autopilotInitialized = false;
      }
      this.onInitialized();
    });

    this.apDriver = new AutopilotDriver(
      this.bus,
      this.apValues,
      this.stateManager.apMasterOn,
      this.config.autopilotDriverOptions
    );

    this.initLateralModes();
    this.initVerticalModes();
    this.initNavToNavManager();
    this.initVNavManager();
    this.monitorEvents();
  }

  /**
   * Creates this autopilot's directors.
   * @param config This autopilot's configuration.
   */
  protected createDirectors(config: APConfig): void {
    this.createLateralDirectors(config);
    this.createVerticalDirectors(config);
  }

  /**
   * Creates this autopilot's lateral mode directors.
   * @param config This autopilot's configuration.
   */
  protected createLateralDirectors(config: APConfig): void {
    if (config.createLateralDirectors) {
      for (const { mode, director } of config.createLateralDirectors(this.apValues)) {
        if (mode !== APLateralModes.NONE) {
          this.lateralModes.set(mode, director);
        }
      }
    }
    this.lateralModes.set(APLateralModes.NONE, new APNoneLateralDirector());
  }

  /**
   * Creates this autopilot's vertical mode directors.
   * @param config This autopilot's configuration.
   */
  protected createVerticalDirectors(config: APConfig): void {
    if (config.createVerticalDirectors) {
      for (const { mode, director } of config.createVerticalDirectors(this.apValues)) {
        if (mode !== APVerticalModes.NONE) {
          this.verticalModes.set(mode, director);
        }
      }
    }
    this.verticalModes.set(APVerticalModes.NONE, new APNoneVerticalDirector());
  }

  /**
   * Initializes this autopilot's lateral modes.
   */
  protected initLateralModes(): void {
    const setBank = this.apDriver.setBank.bind(this.apDriver);
    const driveBank = this.apDriver.driveBank.bind(this.apDriver);

    for (const [mode, director] of this.lateralModes) {
      this.initLateralModeDirector(mode, director, setBank, driveBank);
    }
  }

  /**
   * Initializes a lateral mode director.
   * @param mode The director's mode.
   * @param director The director to initialize.
   * @param setBank A function that the director can use to set the flight director's commanded bank angle.
   * @param driveBank A function that the director can use to drive the flight director's commanded bank angle.
   */
  protected initLateralModeDirector(
    mode: number,
    director: PlaneDirector,
    setBank?: (bank: number) => void,
    driveBank?: (bank: number, rate?: number) => void
  ): void {
    director.onArm = () => { this.setLateralArmed(mode); };
    director.onActivate = () => { this.setLateralActive(mode); };

    director.setBank = setBank;
    director.driveBank = driveBank;
  }

  /**
   * Initializes this autopilot's vertical modes.
   */
  protected initVerticalModes(): void {
    const setPitch = this.apDriver.setPitch.bind(this.apDriver);
    const drivePitch = this.apDriver.drivePitch.bind(this.apDriver);

    for (const [mode, director] of this.verticalModes) {
      this.initVerticalModeDirector(mode, director, setPitch, drivePitch);
    }
  }

  /**
   * Initializes a vertical mode director.
   * @param mode The director's mode.
   * @param director The director to initialize.
   * @param setPitch A function that the director can use to set the flight director's commanded pitch angle.
   * @param drivePitch A function that the director can use to drive the flight director's commanded pitch angle.
   */
  protected initVerticalModeDirector(
    mode: number,
    director: PlaneDirector,
    setPitch?: (pitch: number, resetServo?: boolean, maxNoseDownPitch?: number, maxNoseUpPitch?: number) => void,
    drivePitch?: (pitch: number, adjustForAoa?: boolean, adjustForVerticalWind?: boolean, rate?: number, maxNoseDownPitch?: number, maxNoseUpPitch?: number) => void
  ): void {
    switch (mode) {
      case APVerticalModes.ALT:
        director.onArm = () => { this.setVerticalArmed(mode); };
        director.onActivate = () => {
          this.altCapArmed = false;
          this.setVerticalActive(mode);
        };
        break;
      case APVerticalModes.CAP:
        director.onArm = () => {
          this.altCapArmed = true;
          if (this.apValues.verticalArmed.get() === APVerticalModes.ALT) {
            this.verticalModes.get(APVerticalModes.ALT)?.deactivate();
          }
        };
        director.onActivate = () => {
          this.altCapArmed = false;
          this.setVerticalActive(mode);
          this.verticalModes.get(APVerticalModes.ALT)?.arm();
        };
        break;
      case APVerticalModes.PATH:
        director.onArm = () => { this.setVerticalArmed(mode); };
        director.onActivate = () => { this.setVerticalActive(mode); };
        director.onDeactivate = () => { this.vnavManager?.onPathDirectorDeactivated(); };
        break;
      case APVerticalModes.GP:
        director.onArm = () => { this.setVerticalApproachArmed(mode); };
        director.onActivate = () => {
          this.vnavManager?.tryDeactivate(APVerticalModes.NONE);
          this.setVerticalActive(mode);
          this.setVerticalArmed(APVerticalModes.NONE);
          this.setVerticalApproachArmed(APVerticalModes.NONE);
        };
        break;
      case APVerticalModes.GS:
        director.onArm = () => { this.setVerticalApproachArmed(mode); };
        director.onActivate = () => {
          this.setVerticalActive(mode);
          this.verticalModes.get(APVerticalModes.PATH)?.deactivate();
          this.setVerticalArmed(APVerticalModes.NONE);
          this.setVerticalApproachArmed(APVerticalModes.NONE);
        };
        break;
      case APVerticalModes.FLARE:
        director.onArm = () => { this.setVerticalArmed(mode); };
        director.onActivate = () => {
          this.setVerticalActive(mode);
          this.setVerticalArmed(APVerticalModes.NONE);
          this.setVerticalApproachArmed(APVerticalModes.NONE);
        };
        break;
      case APVerticalModes.LEVEL:
        director.onArm = () => { this.setVerticalArmed(mode); };
        director.onActivate = () => {
          this.setVerticalActive(mode);
          this.setVerticalArmed(APVerticalModes.NONE);
          this.setVerticalApproachArmed(APVerticalModes.NONE);
        };
        break;
      default:
        director.onArm = () => { this.setVerticalArmed(mode); };
        director.onActivate = () => { this.setVerticalActive(mode); };
    }

    director.setPitch = setPitch;
    director.drivePitch = drivePitch;
  }

  /**
   * Initializes the Autopilot with the available Nav To Nav Manager.
   */
  protected initNavToNavManager(): void {
    if (this.navToNavManager) {
      this.navToNavManager.onTransferred = (activateLateralMode, activateVerticalMode) => {
        if (activateLateralMode !== APLateralModes.NONE && this.apValues.lateralActive.get() !== activateLateralMode) {
          this.lateralModes.get(activateLateralMode)?.activate();
        }
        if (activateVerticalMode !== APVerticalModes.NONE && this.apValues.verticalActive.get() !== activateVerticalMode) {
          this.verticalModes.get(activateVerticalMode)?.activate();
        }
      };
    }
  }

  /**
   * Initializes the Autopilot with the available VNav Manager.
   */
  protected initVNavManager(): void {
    if (this.vnavManager) {
      this.vnavManager.armMode = (mode: APVerticalModes): void => {
        const armedMode = this.apValues.verticalArmed.get();
        if (mode === APVerticalModes.NONE && (armedMode === APVerticalModes.PATH || armedMode === APVerticalModes.FLC)) {
          this.setVerticalArmed(mode);
        } else {
          this.verticalModes.get(mode)?.arm();
        }
      };
      this.vnavManager.activateMode = (mode: APVerticalModes): void => {
        if (mode === APVerticalModes.NONE && this.apValues.verticalActive.get() === APVerticalModes.PATH) {
          this.verticalModes.get(this.getDefaultVerticalMode())?.activate();
        } else {
          this.verticalModes.get(mode)?.activate();
        }
      };
    }
  }

  /**
   * Update method for the Autopilot.
   */
  public update(): void {
    if (this.autopilotInitialized) {
      this.onBeforeUpdate();
      this.stateManager.onBeforeUpdate();
      this.updateNavToNavManagerBefore();
      this.apDriver.update();
      this.checkModes();
      this.manageAltitudeCapture();
      this.updateModes();
      this.updateNavToNavManagerAfter();
      this.stateManager.onAfterUpdate();
      this.onAfterUpdate();
    }
  }

  /**
   * This method runs each update cycle before the update occurs.
   */
  protected onBeforeUpdate(): void {
    // noop
  }

  /**
   * This method runs each update cycle after the update occurs.
   */
  protected onAfterUpdate(): void {
    // noop
  }

  /**
   * This method runs whenever the initialized state of the Autopilot changes.
   */
  protected onInitialized(): void {
    // noop
  }

  /**
   * Handles input from the State Manager when a lateral mode button is pressed.
   * @param data is the AP Lateral Mode Event Data
   */
  protected lateralPressed(data: APModePressEvent): void {
    const mode = data.mode;
    if (mode !== APLateralModes.NAV && !this.lateralModes.has(mode)) {
      return;
    }
    const set = data.set;
    if (set === undefined || set === false) {
      if (this.deactivateArmedOrActiveLateralMode(mode)) {
        return;
      }
    }
    if (set === undefined || set === true) {
      if (this.config.autoEngageFd !== false && !this.stateManager.isAnyFlightDirectorOn.get()) {
        this.stateManager.setFlightDirector(true);
      } else if (this.config.autoEngageFd === false && !this.stateManager.isAnyFlightDirectorOn.get() && !this.stateManager.apMasterOn.get()) {
        return;
      }
      switch (mode) {
        case APLateralModes.NONE:
          break;
        case APLateralModes.LEVEL:
        case APLateralModes.ROLL:
        case APLateralModes.HEADING:
        case APLateralModes.HEADING_HOLD:
        case APLateralModes.TRACK:
        case APLateralModes.TRACK_HOLD:
        case APLateralModes.LOC:
        case APLateralModes.VOR:
        case APLateralModes.BC:
        case APLateralModes.FMS_LOC:
          this.lateralModes.get(mode)?.arm();
          break;
        case APLateralModes.NAV:
          if (this.cdiSource.type === NavSourceType.Gps) {
            this.lateralModes.get(APLateralModes.GPSS)?.arm();
          } else {
            this.lateralModes.get(APLateralModes.VOR)?.arm();
            this.lateralModes.get(APLateralModes.LOC)?.arm();
          }
          break;
      }
    }
  }

  /**
   * Handles input from the State Manager when a vertical mode button is pressed.
   * @param data is the AP Vertical Mode Event Data
   */
  protected verticalPressed(data: APModePressEvent): void {
    const mode = data.mode;
    if (!this.verticalModes.has(mode)) {
      return;
    }
    const set = data.set;
    if ((set === undefined || set === false) && mode !== APVerticalModes.TO) {
      if (this.deactivateArmedOrActiveVerticalMode(mode)) {
        return;
      }
    }
    if (set === undefined || set === true) {
      if (this.config.autoEngageFd !== false && !this.stateManager.isAnyFlightDirectorOn.get()) {
        this.stateManager.setFlightDirector(true);
      } else if (this.config.autoEngageFd === false && !this.stateManager.isAnyFlightDirectorOn.get() && !this.stateManager.apMasterOn.get()) {
        return;
      }
      switch (mode) {
        case APVerticalModes.NONE:
        case APVerticalModes.PATH:
          break;
        case APVerticalModes.ALT:
          if (this.vnavManager?.state !== VNavState.Enabled_Active ||
            (this.vnavManager && this.vnavManager.state === VNavState.Enabled_Active && this.vnavManager.canVerticalModeActivate(mode))) {
            this.setAltHold();
          }
          break;
        case APVerticalModes.PITCH:
        case APVerticalModes.VS:
        case APVerticalModes.FPA:
        case APVerticalModes.FLC:
        case APVerticalModes.LEVEL:
          if (this.vnavManager?.state === VNavState.Enabled_Active && !this.vnavManager.canVerticalModeActivate(mode)) {
            // If the VNav Manager is active, don't activate the mode until VNav Approves.
            this.verticalModes.get(mode)?.arm();
          } else {
            this.verticalModes.get(mode)?.activate();
          }
          break;
        case APVerticalModes.GP:
        case APVerticalModes.GS:
          this.verticalModes.get(mode)?.arm();
          break;
        case APVerticalModes.TO:
        case APVerticalModes.GA:
          this.togaPressed();
      }
    }
  }

  /**
   * Checks if a lateral mode is armed or active and if so, deactivates it.
   * @param mode The lateral mode to check and deactivate.
   * @returns Whether the specified mode was armed or active and deactivated by this method.
   * @deprecated Please use `deactivateArmedOrActiveLateralMode()` instead.
   */
  protected isLateralModeActivatedOrArmed(mode: number): boolean {
    return this.deactivateArmedOrActiveLateralMode(mode);
  }

  /**
   * Attempts to deactivate an armed or active lateral mode.
   * @param mode The lateral mode to deactivate.
   * @returns Whether the specified mode was armed or active and deactivated by this method.
   */
  protected deactivateArmedOrActiveLateralMode(mode: number): boolean {
    const { lateralActive, lateralArmed } = this.apValues;
    switch (mode) {
      case lateralActive.get():
        this.lateralModes.get(mode)?.deactivate();
        this.lateralModes.get(this.getDefaultLateralMode())?.arm();
        return true;
      case lateralArmed.get():
        this.lateralModes.get(mode)?.deactivate();
        lateralArmed.set(APLateralModes.NONE);
        return true;
      case APLateralModes.NAV: {
        const activeNavMode = lateralActive.get() === APLateralModes.LOC ? APLateralModes.LOC
          : lateralActive.get() === APLateralModes.VOR ? APLateralModes.VOR
            : lateralActive.get() === APLateralModes.GPSS ? APLateralModes.GPSS
              : lateralActive.get() === APLateralModes.FMS_LOC ? APLateralModes.FMS_LOC
                : APLateralModes.NONE;
        if (activeNavMode !== APLateralModes.NONE) {
          if (this.config.onlyDisarmLnavOnOffEvent === undefined || !this.config.onlyDisarmLnavOnOffEvent) {
            this.lateralModes.get(activeNavMode)?.deactivate();
            this.lateralModes.get(this.getDefaultLateralMode())?.arm();
            lateralActive.set(this.getDefaultLateralMode());
          }
        }
        const armedNavMode = lateralArmed.get() === APLateralModes.LOC ? APLateralModes.LOC
          : lateralArmed.get() === APLateralModes.VOR ? APLateralModes.VOR
            : lateralArmed.get() === APLateralModes.GPSS ? APLateralModes.GPSS
              : lateralArmed.get() === APLateralModes.FMS_LOC ? APLateralModes.FMS_LOC
                : APLateralModes.NONE;
        if (armedNavMode !== APLateralModes.NONE) {
          this.lateralModes.get(armedNavMode)?.deactivate();
          lateralArmed.set(APLateralModes.NONE);
        }
        if (armedNavMode !== APLateralModes.NONE || activeNavMode !== APLateralModes.NONE) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Attempts to deactivate an armed or active vertical mode.
   * @param mode The vertical mode to deactivate.
   * @returns Whether the specified mode was armed or active and deactivated by this method.
   */
  protected deactivateArmedOrActiveVerticalMode(mode: number): boolean {
    const { verticalActive, verticalArmed } = this.apValues;
    switch (mode) {
      case verticalActive.get():
        this.verticalModes.get(mode)?.deactivate();
        verticalActive.set(this.getDefaultVerticalMode());
        this.verticalModes.get(verticalActive.get())?.arm();
        return true;
      case verticalArmed.get():
        if (mode !== APVerticalModes.ALT) {
          this.verticalModes.get(mode)?.deactivate();
          verticalArmed.set(APVerticalModes.NONE);
          return true;
        }
        break;
      case this.verticalApproachArmed:
        this.verticalModes.get(mode)?.deactivate();
        this.verticalApproachArmed = APVerticalModes.NONE;
        return true;
    }
    return false;
  }

  /**
   * Handles input from the State Manager when the APPR button is pressed.
   * @param set is whether this event commands a specific set
   */
  protected approachPressed(set?: boolean): void {
    if ((set === undefined || set === false) && this.deactivateArmedOrActiveVerticalMode(APVerticalModes.GP)) {
      this.lateralModes.get(APLateralModes.GPSS)?.deactivate();
      return;
    }
    if ((set === undefined || set === false) && this.deactivateArmedOrActiveVerticalMode(APVerticalModes.GS)) {
      this.lateralModes.get(APLateralModes.LOC)?.deactivate();
      return;
    }
    if (set === undefined || set === true) {
      switch (this.getArmableApproachType()) {
        case APLateralModes.LOC:
          if (this.lateralModes.get(APLateralModes.LOC)?.state === DirectorState.Inactive) {
            this.lateralModes.get(APLateralModes.LOC)?.arm();
          }
          this.verticalModes.get(APVerticalModes.GS)?.arm();
          break;
        case APLateralModes.GPSS:
          if (this.lateralModes.get(APLateralModes.GPSS)?.state === DirectorState.Inactive) {
            this.lateralModes.get(APLateralModes.GPSS)?.arm();
          }
          this.verticalModes.get(APVerticalModes.GP)?.arm();
          break;
      }
    }
  }

  /**
   * Handles input from the State Manager when the TOGA button is pressed
   * (K event AUTO_THROTTLE_TO_GA)
   */
  protected togaPressed(): void {
    const hasToMode = this.verticalModes.has(APVerticalModes.TO) && this.lateralModes.has(APLateralModes.TO);
    const hasGaMode = this.verticalModes.has(APVerticalModes.GA) && this.lateralModes.has(APLateralModes.GA);
    const verticalActive = this.apValues.verticalActive.get();
    const lateralActive = this.apValues.lateralActive.get();
    let toGaWasActive = false;

    if (hasToMode && hasGaMode) {
      if (verticalActive === APVerticalModes.TO || verticalActive === APVerticalModes.GA) {
        this.verticalModes.get(verticalActive)?.deactivate();
        toGaWasActive = true;
      }
      if (lateralActive === APLateralModes.GA || lateralActive === APLateralModes.TO) {
        this.lateralModes.get(lateralActive)?.deactivate();
        toGaWasActive = true;
      }
      if (!toGaWasActive) {
        if (Simplane.getIsGrounded()) {
          this.verticalModes.get(APVerticalModes.TO)?.arm();
          this.lateralModes.get(APLateralModes.TO)?.arm();
        } else {
          if (this.config.deactivateAutopilotOnGa !== false) {
            SimVar.SetSimVarValue('K:AUTOPILOT_OFF', 'number', 0);
          }
          this.verticalModes.get(APVerticalModes.GA)?.arm();
          this.lateralModes.get(APLateralModes.GA)?.arm();
        }
      }
    } else if (hasToMode) {
      if (verticalActive === APVerticalModes.TO) {
        this.verticalModes.get(APVerticalModes.TO)?.deactivate();
        toGaWasActive = true;
      }
      if (lateralActive === APLateralModes.TO) {
        this.lateralModes.get(APLateralModes.TO)?.deactivate();
        toGaWasActive = true;
      }
      if (!toGaWasActive) {
        this.verticalModes.get(APVerticalModes.TO)?.arm();
        this.lateralModes.get(APLateralModes.TO)?.arm();
      }
    }
  }

  /**
   * Returns the AP Lateral Mode that can be armed.
   * @returns The AP Lateral Mode that can be armed.
   */
  protected getArmableApproachType(): number {
    switch (this.cdiSource.type) {
      case NavSourceType.Nav:
        if (this.cdiSource.index === 1 && this.apValues.nav1HasGs.get()) {
          return APLateralModes.LOC;
        } else if (this.cdiSource.index === 2 && this.apValues.nav2HasGs.get()) {
          return APLateralModes.LOC;
        } else if (this.cdiSource.index === 3 && this.apValues.nav3HasGs.get()) {
          return APLateralModes.LOC;
        } else if (this.cdiSource.index === 4 && this.apValues.nav4HasGs.get()) {
          return APLateralModes.LOC;
        }
        break;
      case NavSourceType.Gps:
        if (this.apValues.approachIsActive.get() && this.apValues.approachHasGP.get()) {
          return APLateralModes.GPSS;
        } else if (this.navToNavManager) {
          const navToNavArmableMode = this.navToNavManager.getArmableLateralMode();
          if (navToNavArmableMode !== APLateralModes.NONE) {
            return navToNavArmableMode;
          }
        }
    }
    return APLateralModes.NONE;
  }

  /**
   * Callback to set the lateral active mode.
   * @param mode is the mode being set.
   */
  protected setLateralActive(mode: number): void {
    const { lateralActive, lateralArmed } = this.apValues;
    this.checkRollModeActive();
    if (lateralArmed.get() === mode) {
      lateralArmed.set(APLateralModes.NONE);
    }
    if (mode !== lateralActive.get()) {
      const currentMode = this.lateralModes.get(lateralActive.get());
      currentMode?.deactivate();
      lateralActive.set(mode);
    }
  }

  /**
   * Callback to set the lateral armed mode.
   * @param mode is the mode being set.
   */
  protected setLateralArmed(mode: number): void {
    const { lateralArmed } = this.apValues;
    const currentMode = this.lateralModes.get(lateralArmed.get());
    currentMode?.deactivate();
    lateralArmed.set(mode);
  }

  /**
   * Callback to set the vertical active mode.
   * @param mode is the mode being set.
   */
  protected setVerticalActive(mode: number): void {
    const { verticalActive, verticalArmed } = this.apValues;
    this.checkPitchModeActive();
    if (verticalArmed.get() === mode) {
      verticalArmed.set(APVerticalModes.NONE);
    } else if (this.verticalApproachArmed === mode) {
      this.verticalApproachArmed = APVerticalModes.NONE;
    }
    if (mode !== verticalActive.get()) {
      const currentMode = this.verticalModes.get(verticalActive.get());
      if (currentMode?.state !== DirectorState.Inactive) {
        currentMode?.deactivate();
      }
      verticalActive.set(mode);
    }
  }

  /**
   * Callback to set the vertical armed mode.
   * @param mode is the mode being set.
   */
  protected setVerticalArmed(mode: number): void {
    const { verticalArmed } = this.apValues;
    if (mode !== verticalArmed.get()) {
      const currentMode = this.verticalModes.get(verticalArmed.get());
      if (currentMode?.state !== DirectorState.Inactive) {
        currentMode?.deactivate();
      }
    }
    verticalArmed.set(mode);
  }

  /**
   * Callback to set the vertical approach armed mode.
   * @param mode is the mode being set.
   */
  protected setVerticalApproachArmed(mode: number): void {
    if (this.verticalApproachArmed === mode) {
      return;
    }

    const currentMode = this.verticalModes.get(this.verticalApproachArmed);
    currentMode?.deactivate();
    this.verticalApproachArmed = mode;
  }

  /**
   * Method called when the ALT button is pressed.
   */
  protected setAltHold(): void {
    if (this.verticalModes.has(APVerticalModes.ALT)) {
      const currentAlt = 10 * (this.inClimb ? Math.ceil(this.currentAltitude / 10) : Math.floor(this.currentAltitude / 10));
      this.apValues.capturedAltitude.set(currentAlt);
      this.verticalModes.get(APVerticalModes.ALT)?.activate();
    }
  }

  /**
   * Checks if all the active and armed modes are still in their proper state
   * and takes corrective action if not.
   */
  protected checkModes(): void {
    if (this.lateralModeFailed) {
      this.lateralModeFailed = false;
    }

    if (!this.stateManager.apMasterOn.get() && !this.stateManager.isAnyFlightDirectorOn.get()) {
      return;
    }

    const { lateralActive, lateralArmed, verticalActive, verticalArmed } = this.apValues;

    if (!this.lateralModes.has(lateralActive.get()) || this.lateralModes.get(lateralActive.get())?.state !== DirectorState.Active) {
      if (lateralActive.get() !== APLateralModes.NONE) {
        this.lateralModeFailed = true;
      }
      this.lateralModes.get(this.getDefaultLateralMode())?.arm();
    }
    if (lateralArmed.get() !== APLateralModes.NONE
      && (!this.lateralModes.has(lateralArmed.get()) || this.lateralModes.get(lateralArmed.get())?.state !== DirectorState.Armed)) {
      this.setLateralArmed(APLateralModes.NONE);
    }
    if (!this.verticalModes.has(verticalActive.get()) || this.verticalModes.get(verticalActive.get())?.state !== DirectorState.Active) {
      this.verticalModes.get(this.getDefaultVerticalMode())?.arm();
    }
    if (verticalArmed.get() !== APVerticalModes.NONE
      && (!this.verticalModes.has(verticalArmed.get()) || this.verticalModes.get(verticalArmed.get())?.state !== DirectorState.Armed)) {
      this.setVerticalArmed(APVerticalModes.NONE);
    }
    if (this.verticalApproachArmed !== APVerticalModes.NONE &&
      (!this.verticalModes.has(this.verticalApproachArmed) || this.verticalModes.get(this.verticalApproachArmed)?.state !== DirectorState.Armed)) {
      this.setVerticalApproachArmed(APVerticalModes.NONE);
    }
  }

  /**
   * Runs update on each of the active and armed modes.
   */
  protected updateModes(): void {
    const { lateralActive, lateralArmed, verticalActive, verticalArmed } = this.apValues;

    if (lateralActive.get() !== APLateralModes.NONE && this.lateralModes.has(lateralActive.get())) {
      this.lateralModes.get(lateralActive.get())?.update();
    }
    if (lateralArmed.get() !== APLateralModes.NONE && this.lateralModes.has(lateralArmed.get())) {
      this.lateralModes.get(lateralArmed.get())?.update();
    }
    if (verticalActive.get() !== APVerticalModes.NONE && this.verticalModes.has(verticalActive.get())) {
      this.verticalModes.get(verticalActive.get())?.update();
    }
    if (verticalArmed.get() !== APVerticalModes.NONE && this.verticalModes.has(verticalArmed.get())) {
      this.verticalModes.get(verticalArmed.get())?.update();
    }
    if (this.verticalApproachArmed !== APVerticalModes.NONE && this.verticalModes.has(this.verticalApproachArmed)) {
      this.verticalModes.get(this.verticalApproachArmed)?.update();
    }
    if (this.altCapArmed) {
      this.verticalModes.get(APVerticalModes.CAP)?.update();
    }
    //while vnav and vnav director are one in the same we always want to
    //run the vnav update cycle no matter the director state
    this.vnavManager?.update();
  }

  /**
   * Checks and sets the proper armed altitude mode.
   */
  protected manageAltitudeCapture(): void {
    let altCapType = APAltitudeModes.NONE;
    let armAltCap = false;
    switch (this.apValues.verticalActive.get()) {
      case APVerticalModes.VS:
      case APVerticalModes.FPA:
      case APVerticalModes.FLC:
      case APVerticalModes.PITCH:
      case APVerticalModes.TO:
      case APVerticalModes.GA:
        if (this.inClimb && this.apValues.selectedAltitude.get() > this.currentAltitude) {
          altCapType = APAltitudeModes.ALTS;
          armAltCap = true;
        } else if (!this.inClimb && this.apValues.selectedAltitude.get() < this.currentAltitude) {
          altCapType = APAltitudeModes.ALTS;
          armAltCap = true;
        }
        break;
      case APVerticalModes.PATH: {
        if (!this.inClimb) {
          altCapType = this.vnavCaptureType === VNavAltCaptureType.VNAV ? APAltitudeModes.ALTV : APAltitudeModes.ALTS;
        }
        break;
      }
      case APVerticalModes.CAP:
        altCapType = this.verticalAltitudeArmed;
        break;
    }
    if (this.verticalAltitudeArmed !== altCapType) {
      this.verticalAltitudeArmed = altCapType;
    }
    if (armAltCap && (!this.altCapArmed || this.verticalModes.get(APVerticalModes.CAP)?.state === DirectorState.Inactive)) {
      this.verticalModes.get(APVerticalModes.CAP)?.arm();
    } else if (!armAltCap && this.altCapArmed) {
      this.verticalModes.get(APVerticalModes.CAP)?.deactivate();
      this.altCapArmed = false;
    }
  }

  /**
   * Updates this autopilot's nav-to-nav manager before directors have been updated.
   */
  protected updateNavToNavManagerBefore(): void {
    this.navToNavManager?.onBeforeUpdate();
  }

  /**
   * Updates this autopilot's nav-to-nav manager after directors have been updated.
   */
  protected updateNavToNavManagerAfter(): void {
    this.navToNavManager?.onAfterUpdate();
  }

  /**
   * Monitors subevents and bus events.
   */
  protected monitorEvents(): void {
    this.stateManager.lateralPressed.on((sender, data) => {
      if (this.autopilotInitialized && data !== undefined) {
        this.lateralPressed(data);
      }
    });

    this.stateManager.verticalPressed.on((sender, data) => {
      if (this.autopilotInitialized && data !== undefined) {
        this.verticalPressed(data);
      }
    });

    this.stateManager.approachPressed.on((sender, data) => {
      if (this.autopilotInitialized) {
        this.approachPressed(data);
      }
    });

    this.stateManager.vnavPressed.on((sender, data) => {
      if (this.autopilotInitialized) {
        if (data === true) {
          this.vnavManager?.tryActivate();
        } else {
          this.vnavManager?.tryDeactivate();
        }
      }
    });

    // Sets up the subs for selected speed, selected mach and selected is mach.
    this.monitorApSpeedValues();

    const cdi = this.bus.getSubscriber<CdiEvents>();
    cdi.on(`cdi_select${CdiUtils.getEventBusTopicSuffix(this.apValues.cdiId)}`).handle((src) => {
      this.cdiSource = src;
      this._apValues.cdiSource.set(src);
    });

    const clock = this.bus.getSubscriber<ClockEvents>();
    clock.on('simRate').withPrecision(0).handle(this.apValues.simRate.set.bind(this.apValues.simRate));

    const ap = this.bus.getSubscriber<APEvents>();
    ap.on(`ap_altitude_selected_${this.config.altitudeHoldSlotIndex ?? 1}`).withPrecision(0).handle((alt) => {
      this.apValues.selectedAltitude.set(alt);
    });
    ap.on('ap_heading_selected').withPrecision(0).handle((hdg) => {
      this.apValues.selectedHeading.set(hdg);
    });
    ap.on('ap_pitch_selected').withPrecision(1).handle((pitch) => {
      this.apValues.selectedPitch.set(pitch);
    });
    ap.on('ap_vs_selected').withPrecision(0).handle((ias) => {
      this.apValues.selectedVerticalSpeed.set(ias);
    });
    ap.on('ap_fpa_selected').withPrecision(1).handle((fpa) => {
      this.apValues.selectedFlightPathAngle.set(fpa);
    });

    ap.on('ap_max_bank_id').handle(id => {
      this.apValues.maxBankId.set(id);
    });

    const navproc = this.bus.getSubscriber<NavComEvents>();
    navproc.on('nav_glideslope_1').whenChanged().handle((hasgs) => {
      this.apValues.nav1HasGs.set(hasgs);
    });
    navproc.on('nav_glideslope_2').whenChanged().handle((hasgs) => {
      this.apValues.nav2HasGs.set(hasgs);
    });
    navproc.on('nav_glideslope_3').whenChanged().handle((hasgs) => {
      this.apValues.nav3HasGs.set(hasgs);
    });
    navproc.on('nav_glideslope_4').whenChanged().handle((hasgs) => {
      this.apValues.nav4HasGs.set(hasgs);
    });

    const adc = this.bus.getSubscriber<AdcEvents>();
    adc.on('vertical_speed').withPrecision(0).handle((vs) => {
      this.inClimb = vs < 1 ? false : true;
    });
    adc.on('indicated_alt').withPrecision(0).handle(alt => {
      this.currentAltitude = alt;
    });

    const vnav = this.bus.getSubscriber<VNavEvents>();
    vnav.on('vnav_altitude_capture_type').whenChanged().handle((v) => {
      this.vnavCaptureType = v;
    });

    this.stateManager.apMasterOn.sub(() => {
      if (this.autopilotInitialized) {
        this.handleApFdStateChange();
      }
    });
    this.stateManager.isAnyFlightDirectorOn.sub(() => {
      if (this.autopilotInitialized) {
        this.handleApFdStateChange();
      }
    });

    this.bus.getSubscriber<ControlEvents>().on('approach_available').handle(available => {
      this.apValues.approachIsActive.set(available);
    });

    if (this.config.defaultMaxBankAngle === undefined) {
      ap.on('ap_max_bank_value').handle(value => {
        this.apValues.maxBankAngle.set(value);
      });
    }

    if (this.config.defaultMaxNoseUpPitchAngle === undefined) {
      this.bus.getSubscriber<APControlEvents>().on('ap_set_max_nose_up_pitch').handle(value => {
        this.apValues.maxNoseUpPitchAngle.set(value);
      });
    }
    if (this.config.defaultMaxNoseDownPitchAngle === undefined) {
      this.bus.getSubscriber<APControlEvents>().on('ap_set_max_nose_down_pitch').handle(value => {
        this.apValues.maxNoseDownPitchAngle.set(value);
      });
    }

    if (this.config.publishAutopilotModesAsLVars === true) {
      this.apValues.lateralActive.sub((mode) => SimVar.SetSimVarValue(AutopilotModeVars.LateralActive, SimVarValueType.Number, mode), true);
      this.apValues.lateralArmed.sub((mode) => SimVar.SetSimVarValue(AutopilotModeVars.LateralArmed, SimVarValueType.Number, mode), true);
      this.apValues.verticalActive.sub((mode) => SimVar.SetSimVarValue(AutopilotModeVars.VerticalActive, SimVarValueType.Number, mode), true);
      this.apValues.verticalArmed.sub((mode) => SimVar.SetSimVarValue(AutopilotModeVars.VerticalArmed, SimVarValueType.Number, mode), true);
    }
  }

  /**
   * Overridable method for setting the selected speed values for the A/P to follow.
   */
  protected monitorApSpeedValues(): void {
    const ap = this.bus.getSubscriber<APEvents>();
    ap.on('ap_ias_selected').withPrecision(0).handle((ias) => {
      this.apValues.selectedIas.set(ias);
    });
    ap.on('ap_mach_selected').withPrecision(3).handle((mach) => {
      this.apValues.selectedMach.set(mach);
    });
    ap.on('ap_selected_speed_is_mach').whenChanged().handle((inMach) => {
      this.apValues.isSelectedSpeedInMach.set(inMach);
    });
  }

  /**
   * Additional events to be monitored (to be overridden).
   */
  protected monitorAdditionalEvents(): void {
    //noop
  }

  /**
   * Manages the FD state and the modes when AP/FD are off.
   */
  protected handleApFdStateChange(): void {
    const ap = this.stateManager.apMasterOn.get();
    const fd = this.stateManager.isAnyFlightDirectorOn.get();

    if (ap && !fd && this.config.autoEngageFd !== false) {
      this.stateManager.setFlightDirector(true);
    } else if (!ap && !fd) {
      this.lateralModes.forEach((mode) => {
        if (mode.state !== DirectorState.Inactive) {
          mode.deactivate();
        }
      });
      this.verticalModes.forEach((mode) => {
        if (mode.state !== DirectorState.Inactive) {
          mode.deactivate();
        }
      });
      this.apValues.lateralActive.set(APLateralModes.NONE);
      this.apValues.lateralArmed.set(APLateralModes.NONE);
      this.apValues.verticalActive.set(APVerticalModes.NONE);
      this.apValues.verticalArmed.set(APVerticalModes.NONE);
      this.verticalApproachArmed = APVerticalModes.NONE;
      this.verticalAltitudeArmed = APAltitudeModes.NONE;
      this.altCapArmed = false;
    }
  }

  /**
   * Sets a sim AP mode.
   * @param mode The mode to set.
   * @param enabled Whether or not the mode is enabled or disabled.
   */
  private setSimAP(mode: MSFSAPStates, enabled: boolean): void {
    Coherent.call('apSetAutopilotMode', mode, enabled ? 1 : 0);
  }

  /**
   * Checks if the sim AP is in roll mode and sets it if not.
   */
  protected checkRollModeActive(): void {
    if (!APController.apGetAutopilotModeActive(MSFSAPStates.Bank)) {
      this.setSimAP(MSFSAPStates.Bank, true);
    }
  }

  /**
   * Checks if the sim AP is in pitch mode and sets it if not.
   */
  private checkPitchModeActive(): void {
    if (!APController.apGetAutopilotModeActive(MSFSAPStates.Pitch)) {
      this.setSimAP(MSFSAPStates.Pitch, true);
    }
  }

  /**
   * Get the default lateral mode from APConfig
   * @returns default lateral mode
   */
  protected getDefaultLateralMode(): APLateralModes {
    if (typeof this.config.defaultLateralMode === 'number') {
      return this.config.defaultLateralMode;
    } else {
      return this.config.defaultLateralMode();
    }
  }

  /**
   * Get the default vertical mode from APConfig
   * @returns default vertical mode
   */
  protected getDefaultVerticalMode(): APVerticalModes {
    if (typeof this.config.defaultVerticalMode === 'number') {
      return this.config.defaultVerticalMode;
    } else {
      return this.config.defaultVerticalMode();
    }
  }
}
