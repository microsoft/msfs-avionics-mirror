/// <reference types="@microsoft/msfs-types/js/simvar" />

import {
  AdcEvents, AltitudeSelectManager, AltitudeSelectManagerAccelType, AltitudeSelectManagerOptions, APAltitudeModes, APConfig, APEvents, APLateralModes, APVerticalModes, Autopilot,
  ConsumerSubject, ControlEvents, DebounceTimer, DirectorState, EventBus, FlightPlanner, MappedSubject, MinimumsMode, NavComSimVars, NavSourceId, NavSourceType,
  ObjectSubject, PlaneDirector, RadioUtils, SimVarValueType, Subject, UnitType, UserSettingManager, VNavAltCaptureType, VNavState, Wait
} from '@microsoft/msfs-sdk';

import { Epic2FmsEvents, FmsSpeedEvents } from '../Fms';
import { AirGroundDataProviderEvents, DefaultHeadingDataProvider, DefaultStallWarningDataProvider } from '../Instruments';
import { CockpitUserSettings, PfdAllUserSettingTypes } from '../Settings';
import { Epic2OverspeedProtectedDirector } from './directors/Epic2OverspeedProtectedDirector';
import { Epic2ApPanelEvents } from './Epic2ApPanelPublisher';
import { Epic2APStateManager, Epic2APVerticalEvent } from './Epic2APStateManager';
import { Epic2FmaData, Epic2FmaEvents } from './Epic2FmaEvents';
import { Epic2HeadingSyncController } from './Epic2HeadingSyncController';
import { Epic2NavigationSourceEvents } from './Epic2NavSourceEvents';
import { Epic2NavToNavManager } from './Epic2NavToNavManager';

/**
 * Epic 2 autopilot.
 */
export class Epic2Autopilot extends Autopilot {
  /** The amount of time AP abnormal disconnect warning is inhibited after QD presses. */
  private static readonly ABNORMAL_DISENGAGE_INHIBIT_TIME = 500;

  private static readonly ALT_SELECT_OPTIONS: AltitudeSelectManagerOptions = {
    supportMetric: true,
    minValue: UnitType.FOOT.createNumber(0),
    maxValue: UnitType.FOOT.createNumber(45000),
    inputIncrLargeThreshold: 999,
    incrSmall: UnitType.FOOT.createNumber(100),
    incrLarge: UnitType.FOOT.createNumber(1000),
    incrSmallMetric: UnitType.METER.createNumber(50),
    incrLargeMetric: UnitType.METER.createNumber(500),
    accelType: AltitudeSelectManagerAccelType.SmallToLarge,
    accelInputCountThreshold: 5,
    transformSetToIncDec: false
  };

  public readonly externalAutopilotInstalled = Subject.create<boolean>(false);
  protected readonly lateralArmedModeSubject = Subject.create<APLateralModes>(APLateralModes.NONE);
  protected readonly altArmedSubject = Subject.create<boolean>(false);

  protected readonly altSelectManager = new AltitudeSelectManager(this.bus, this.settingsManager, Epic2Autopilot.ALT_SELECT_OPTIONS);
  protected readonly headingSyncController: Epic2HeadingSyncController;

  protected readonly fmaData: ObjectSubject<Epic2FmaData>;
  private fmaUpdateDebounce: NodeJS.Timeout | undefined;

  private nav1IsLoc = false;
  private nav2IsLoc = false;

  protected togaIsOn = false;

  private readonly isAbnormalDisengageActive = Subject.create(false);
  private readonly abnormalDisengageInhibit = new DebounceTimer();

  private readonly cockpitUserSettings = CockpitUserSettings.getManager(this.bus);
  private readonly minimumsModeSetting = this.cockpitUserSettings.getSetting('minimumsMode');
  private readonly baroMinimumsSetting = this.cockpitUserSettings.getSetting('decisionAltitudeFeet');

  private readonly isOnGround = ConsumerSubject.create(this.bus.getSubscriber<AirGroundDataProviderEvents>().on('air_ground_is_on_ground'), false);

  /**
   * Creates an instance of the Epic 2 Autopilot.
   * @param bus The event bus.
   * @param flightPlanner This autopilot's associated flight planner.
   * @param config This autopilot's configuration.
   * @param stateManager This autopilot's state manager.
   * @param settingsManager The settings manager.
   * @param headingDataProvider The heading data provider to synchronize heading when requested.
   * @param stallDataProvider The stall data provider for handling abnormal disengagement due to stalls
   */
  constructor(
    bus: EventBus,
    flightPlanner: FlightPlanner,
    config: APConfig,
    public readonly stateManager: Epic2APStateManager,
    private readonly settingsManager: UserSettingManager<PfdAllUserSettingTypes>,
    private readonly headingDataProvider: DefaultHeadingDataProvider,
    private readonly stallDataProvider: DefaultStallWarningDataProvider,
  ) {
    super(bus, flightPlanner, config, stateManager);

    this.fmaData = ObjectSubject.create<Epic2FmaData>({
      verticalActive: APVerticalModes.NONE,
      verticalArmed: APVerticalModes.NONE,
      verticalApproachArmed: APVerticalModes.NONE,
      verticalAltitudeArmed: APAltitudeModes.NONE,
      altitideCaptureArmed: false,
      altitideCaptureValue: -1,
      lateralActive: APLateralModes.NONE,
      lateralArmed: APLateralModes.NONE,
      lateralModeFailed: false,
      pathArmedError: false,
      apApproachModeOn: false,
      isOverspeedProtectionActive: false,
      isAbnormalDisengageActive: false,
    });

    const fmaPublisher = this.bus.getPublisher<Epic2FmaEvents>();
    this.fmaData.sub(() => {
      // dirty debounce, need better ObjectSubject
      if (this.fmaUpdateDebounce) {
        return;
      }

      this.fmaUpdateDebounce = setTimeout(() => {
        this.fmaUpdateDebounce = undefined;
        fmaPublisher.pub('epic2_fma_data', this.fmaData.get(), true);
      }, 0);
    }, true);
    this.headingSyncController = new Epic2HeadingSyncController(bus, headingDataProvider, settingsManager);
  }

  /** @inheritdoc */
  protected override onBeforeUpdate(): void {
    // TODO VNAV needs fixed so it can stay on in VGP, and then when it's switched off it can deactivate VGP
    // if (this.vnavManager?.state !== VNavState.Enabled_Active) {
    //   const verticalActive = this.apValues.verticalActive.get();
    //   const verticalArmed = this.verticalApproachArmed;
    //   if (verticalActive === APVerticalModes.GP || verticalArmed === APVerticalModes.GP) {
    //     this.verticalModes.get(APVerticalModes.GP)?.deactivate();
    //   }
    // }
  }

  /** @inheritdoc */
  protected override onAfterUpdate(): void {
    this.updateFma();
  }

  /** @inheritdoc */
  protected onInitialized(): void {
    this.bus.pub('vnav_set_state', true);
    this.headingSyncController.init();
    this.monitorAdditionalEvents();
  }

  /**
   * Checks if a director is an overspeed protected director (MxSPD).
   * @param director The director to check.
   * @returns true if the director is an overspeed protected director.
   */
  private static isOverspeedProtectedDirector(director?: PlaneDirector): director is Epic2OverspeedProtectedDirector {
    return director !== undefined && 'isOverspeedProtected' in director;
  }

  /** @inheritdoc */
  protected override initVerticalModes(): void {
    super.initVerticalModes();

    // setup MxSPD overspeed protection
    const getAdjustedPitch = this.apDriver.getAdjustedPitch.bind(this.apDriver);
    for (const director of this.verticalModes.values()) {
      if (Epic2Autopilot.isOverspeedProtectedDirector(director)) {
        director.getAdjustedPitch = getAdjustedPitch;
      }
    }
  }

  /** @inheritDoc */
  protected initVerticalModeDirector(
    mode: number,
    director: PlaneDirector,
    setPitch?: (pitch: number, resetServo?: boolean, maxNoseDownPitch?: number, maxNoseUpPitch?: number) => void,
    drivePitch?: (pitch: number, adjustForAoa?: boolean, adjustForVerticalWind?: boolean, rate?: number, maxNoseDownPitch?: number, maxNoseUpPitch?: number) => void
  ): void {
    if (mode === APVerticalModes.GA) {
      // setup NAV selection and arming on GA
      const navSourcePub = this.bus.getPublisher<Epic2NavigationSourceEvents>();
      const fmsNavSource: NavSourceId = {
        type: NavSourceType.Gps,
        index: 1,
      };

      director.onArm = () => { this.setVerticalArmed(mode); };
      director.onActivate = () => {
        navSourcePub.pub('epic2_navsource_course_needle_left_source_set', fmsNavSource, true, false);
        navSourcePub.pub('epic2_navsource_course_needle_right_source_set', fmsNavSource, true, false);
        this.lateralModes.get(APLateralModes.GPSS)?.arm();
      };

      director.setPitch = setPitch;
      director.drivePitch = drivePitch;
    } else {
      super.initVerticalModeDirector(mode, director, setPitch, drivePitch);
    }
  }

  /** @inheritdoc */
  protected setLateralActive(mode: number): void {
    const { lateralActive, lateralArmed } = this.apValues;
    this.checkRollModeActive();
    if (lateralArmed.get() === mode) {
      lateralArmed.set(APLateralModes.NONE);
    }
    if (mode !== lateralActive.get()) {
      const currentMode = this.lateralModes.get(lateralActive.get());
      if (this.apValues.apApproachModeOn.get()) {
        switch (lateralActive.get()) {
          case APLateralModes.LOC:
          case APLateralModes.GPSS:
          case APLateralModes.VOR:
          case APLateralModes.BC:
            if (mode !== APLateralModes.LOC) {
              this.apValues.apApproachModeOn.set(false);
            }
        }
      }
      currentMode?.deactivate();
      lateralActive.set(mode);
    }
  }

  /** @inheritdoc */
  protected approachPressed(set?: boolean): void {
    const approachMode = this.apValues.apApproachModeOn.get();
    const lateralArmed = this.apValues.lateralArmed.get();
    const lateralActive = this.apValues.lateralActive.get();

    if ((set === undefined || set === false) && approachMode === true) {
      if (lateralArmed === APLateralModes.BC) {
        this.deactivateArmedOrActiveVerticalMode(APVerticalModes.GS);
        this.lateralModes.get(APLateralModes.BC)?.deactivate();
      } else if (lateralArmed === APLateralModes.LOC) {
        this.deactivateArmedOrActiveVerticalMode(APVerticalModes.GS);
        this.lateralModes.get(APLateralModes.LOC)?.deactivate();
      } else if (lateralArmed === APLateralModes.GPSS) {
        this.deactivateArmedOrActiveVerticalMode(APVerticalModes.GP);
        this.lateralModes.get(APLateralModes.GPSS)?.deactivate();
      } else if (lateralActive === APLateralModes.VOR || lateralActive === APLateralModes.LOC || lateralActive === APLateralModes.GPSS || lateralActive === APLateralModes.BC) {
        this.lateralModes.get(lateralActive)?.deactivate();
      }
      this.apValues.apApproachModeOn.set(false);
      return;
    }

    if (set === undefined || set === true) {
      switch (this.getArmableApproachType()) {
        case APLateralModes.BC:
          if (this.lateralModes.get(APLateralModes.BC)?.state === DirectorState.Inactive) {
            this.lateralModes.get(APLateralModes.BC)?.arm();
          }
          this.apValues.apApproachModeOn.set(true);
          break;
        case APLateralModes.LOC:
          if (this.lateralModes.get(APLateralModes.LOC)?.state === DirectorState.Inactive) {
            this.lateralModes.get(APLateralModes.LOC)?.arm();
          }
          this.verticalModes.get(APVerticalModes.GS)?.arm();
          this.apValues.apApproachModeOn.set(true);
          break;
        case APLateralModes.GPSS:
          if (this.lateralModes.get(APLateralModes.GPSS)?.state === DirectorState.Inactive) {
            this.lateralModes.get(APLateralModes.GPSS)?.arm();
          }
          if (this.apValues.approachHasGP.get()) {
            this.verticalModes.get(APVerticalModes.GP)?.arm();
          }
          this.apValues.apApproachModeOn.set(true);
          break;
        case APLateralModes.VOR:
          if (this.lateralModes.get(APLateralModes.VOR)?.state === DirectorState.Inactive) {
            this.lateralModes.get(APLateralModes.VOR)?.arm();
          }
          this.apValues.apApproachModeOn.set(true);
          break;
      }
    }
  }

  /** @inheritdoc */
  protected getArmableApproachType(): number {
    switch (this.cdiSource.type) {
      case NavSourceType.Nav: {
        const locCourse = (this.navToNavManager as Epic2NavToNavManager).localizerCourse;
        const heading = this.headingDataProvider.magneticHeading.get() ?? 0;
        const headingDiff = Math.abs(heading - locCourse);

        if (this.cdiSource.index === 1 && this.nav1IsLoc) {
          return headingDiff <= 105 ? APLateralModes.LOC : APLateralModes.BC;
        } else if (this.cdiSource.index === 2 && this.nav2IsLoc) {
          return headingDiff <= 105 ? APLateralModes.LOC : APLateralModes.BC;
        } else {
          return APLateralModes.VOR;
        }
      }
      case NavSourceType.Gps:
        if (this.apValues.approachIsActive.get()) {
          if (this.navToNavManager && this.navToNavManager.getArmableLateralMode() === APLateralModes.LOC) {
            return APLateralModes.LOC;
          } else {
            return APLateralModes.GPSS;
          }
        }
    }
    return APLateralModes.NONE;
  }


  /** @inheritdoc */
  protected monitorAdditionalEvents(): void {
    const sub = this.bus.getSubscriber<AdcEvents & APEvents & Epic2ApPanelEvents & Epic2FmsEvents>();

    const speedIsMachSub = ConsumerSubject.create(sub.on('ap_selected_speed_is_mach'), false);

    // Whenever we switch between mach and ias hold, we need to set the value to which we are switching to be equal to
    // the value we are switching from.
    speedIsMachSub.sub(isMach => {
      if (isMach) {
        SimVar.SetSimVarValue('K:AP_MACH_VAR_SET', SimVarValueType.Number, Math.round(Simplane.getKiasToMach(this.apValues.selectedIas.get()) * 100));
      } else {
        SimVar.SetSimVarValue('K:AP_SPD_VAR_SET', SimVarValueType.Number, Math.round(Simplane.getMachToKias(this.apValues.selectedMach.get())));
      }
    });

    const isVNAVActiveSub = ConsumerSubject.create(sub.on('vnav_active'), false);
    const isFLCActiveSub = ConsumerSubject.create(sub.on('ap_flc_hold'), false);
    const isVFLCActiveSub = MappedSubject.create(
      ([isVNAVActive, isFLCActive]): boolean => isVNAVActive && isFLCActive,
      isVNAVActiveSub, isFLCActiveSub
    );

    const isInMachRegime = Subject.create(false);

    const altSub = ConsumerSubject.create(sub.on('indicated_alt').withPrecision(0), 0).pause();
    altSub.sub((alt: number): void => {
      // Mach hold above 27884 feet, and IAS hold below.
      isInMachRegime.set(alt > 27884);
    });

    // TODO: Support configurable VNAV IAS/Mach speeds
    const machToKiasSub = ConsumerSubject.create(sub.on('mach_to_kias_factor').withPrecision(3), 0).pause();
    machToKiasSub.sub((factor: number): void => {
      // Mach hold when VNAV mach speed is less than VNAV IAS speed, and IAS hold when VNAV IAS speed is less than VNAV mach speed.
      isInMachRegime.set(0.64 * factor < 240);
    });

    const machSwitchHandler = (isMach: boolean): void => {
      if (isVFLCActiveSub.get()) {
        if (isMach) {
          SimVar.SetSimVarValue('K:AP_MACH_VAR_SET', SimVarValueType.Number, 64);
        } else {
          SimVar.SetSimVarValue('K:AP_SPD_VAR_SET', SimVarValueType.Number, 240);
        }
      }
      SimVar.SetSimVarValue('K:AP_MANAGED_SPEED_IN_MACH_SET', SimVarValueType.Number, isMach ? 1 : 0);
    };

    const isInMachRegimeSub = isInMachRegime.sub(machSwitchHandler, false, true);

    isVFLCActiveSub.sub(isVFLCActive => {
      isInMachRegimeSub.pause();

      if (isVFLCActive) {
        altSub.pause();
        machToKiasSub.resume();
      } else {
        machToKiasSub.pause();
        altSub.resume();
      }

      isInMachRegimeSub.resume();
    }, true);

    const radio = this.bus.getSubscriber<NavComSimVars>();
    radio.on('nav_active_frequency_1').whenChanged().handle((freq) => {
      freq = Math.round(freq * 100) / 100;
      this.nav1IsLoc = RadioUtils.isLocalizerFrequency(freq);

      // If the coupled VOR frequency is changed in VOR mode, it will disengage.. if the new frequency is a VOR we re-arm VOR.
      if (this.cdiSource.type === NavSourceType.Nav && this.cdiSource.index === 1 && this.apValues.lateralActive.get() === APLateralModes.VOR) {
        if (!this.nav1IsLoc) {
          Wait.awaitDelay(100).then(() => this.lateralModes.get(APLateralModes.VOR)?.arm());
        }
      }
    });

    radio.on('nav_active_frequency_2').whenChanged().handle((freq) => {
      freq = Math.round(freq * 100) / 100;
      this.nav2IsLoc = RadioUtils.isLocalizerFrequency(freq);

      // If the coupled VOR frequency is changed in VOR mode, it will disengage.. if the new frequency is a VOR we re-arm VOR.
      if (this.cdiSource.type === NavSourceType.Nav && this.cdiSource.index === 2 && this.apValues.lateralActive.get() === APLateralModes.VOR) {
        if (!this.nav2IsLoc) {
          Wait.awaitDelay(100).then(() => this.lateralModes.get(APLateralModes.VOR)?.arm());
        }
      }
    });

    this.apValues.apApproachModeOn.sub(v => {
      if (!v) {
        const verticalActive = this.apValues.verticalActive.get();
        const verticalArmed = this.verticalApproachArmed;
        if (verticalActive === APVerticalModes.GP || verticalArmed === APVerticalModes.GP) {
          this.verticalModes.get(APVerticalModes.GP)?.deactivate();
        } else if (verticalActive === APVerticalModes.GS || verticalArmed === APVerticalModes.GS) {
          this.verticalModes.get(APVerticalModes.GS)?.deactivate();
        }
      }
    });

    const checkTogaFn = (): void => {
      // deactivate toga pitch director when toga was on and now modes aren't
      if (this.togaIsOn === true && this.evalIsTogaOn() === false) {
        this.verticalModes.get(APVerticalModes.TO)?.deactivate();
      }
      this.togaIsOn = this.evalIsTogaOn();
    };
    this.apValues.verticalActive.sub(checkTogaFn);

    this.stateManager.epic2VerticalEvent.on((sender, data) => {
      if (this.autopilotInitialized && data !== undefined) {
        this.onEpic2VerticalEvent(data);
      }
    });

    this.stateManager.epic2HeadingSyncEvent.on(() => this.headingSyncController.sync());

    // TODO generalise to any discont
    sub.on('epic2_fms_end_of_plan_reached').handle(() => {
      const currentMode = this.apValues.lateralActive.get();
      if (currentMode === APLateralModes.GPSS || currentMode === APLateralModes.NAV) {
        this.headingSyncController.sync();
        this.lateralModes.get(APLateralModes.HEADING)?.activate();
      }
    });

    // disconnect AP in stall, and on ground
    this.stallDataProvider.isStallWarningActive.sub((active) => {
      if (active && this.stateManager.apMasterOn.get()) {
        this.stateManager.disengageAutopilot(true);
      }
    });
    this.isOnGround.sub(this.checkApOnGround.bind(this));

    // AP abnormal disengage logic
    this.stateManager.epic2ApIntentionalDisengageEvent.on(() => {
      this.isAbnormalDisengageActive.set(false);
      this.abnormalDisengageInhibit.schedule(() => undefined, Epic2Autopilot.ABNORMAL_DISENGAGE_INHIBIT_TIME);
    });
    this.stateManager.apMasterOn.sub((on) => {
      if (on) {
        this.isAbnormalDisengageActive.set(false);
        this.checkApOnGround();
        this.checkEngageAttitude();
      } else if (!this.abnormalDisengageInhibit.isPending()) {
        // If the AP wasn't i disconnected through one of the normal buttons and their K events, then
        // it must be an abnormal disconnect e.g. due to stick moving, on ground, or stall warning.
        this.isAbnormalDisengageActive.set(true);
      }
    });
    // Set an Lvar for CAS messages, audio etc.
    this.isAbnormalDisengageActive.sub((v) => SimVar.SetSimVarValue('L:WT_Epic2_AP_Abnormal_Disengage', SimVarValueType.Bool, v), true);

    // AP reverts to ROL/PIT when coupling changed
    sub.on('epic2_ap_fd_coupling').whenChanged().handle(() => {
      this.setLateralActive(APLateralModes.ROLL);
      this.setVerticalActive(APVerticalModes.PITCH);
    });

    // In ASEL (not VSEL), rotating the alt wheel activates PIT
    this.apValues.selectedAltitude.sub(() => {
      if (this.apValues.verticalActive.get() === APVerticalModes.CAP && this.vnavManager?.state !== VNavState.Enabled_Active) {
        this.setVerticalActive(APVerticalModes.PITCH);
      }
    });
  }

  /**
   * Checks if the AP is on on the ground and disconnects it if so.
   */
  private checkApOnGround(): void {
    if (this.stateManager.apMasterOn.get() && this.isOnGround.get()) {
      this.stateManager.disengageAutopilot(true);
    }
  }

  /**
   * Checks if the AP is within the AP engage pitch and roll range, and disconnects if not.
   */
  private checkEngageAttitude(): void {
    const pitch = SimVar.GetSimVarValue('PLANE PITCH DEGREES', SimVarValueType.Degree);
    const roll = SimVar.GetSimVarValue('PLANE BANK DEGREES', SimVarValueType.Degree);
    // AP engage pitch range is [-10, 20]°, but remember the sim pitch convention is -ve up.
    // AP engage roll range is [-30, 30]°.
    if (pitch < -20 || pitch > 10 || Math.abs(roll) > 30) {
      this.stateManager.disengageAutopilot(true);
    }
  }

  /**
   * Overridable method for setting the selected speed values for the A/P to follow.
   */
  protected override monitorApSpeedValues(): void {
    const speedEvents = this.bus.getSubscriber<FmsSpeedEvents>();
    speedEvents.on('fms_speed_autopilot_target_ias').withPrecision(0).handle((ias) => {
      this.apValues.selectedIas.set(ias);
    });
    speedEvents.on('fms_speed_autopilot_target_mach').withPrecision(3).handle((mach) => {
      this.apValues.selectedMach.set(mach);
    });
    speedEvents.on('fms_speed_autopilot_target_is_mach').whenChanged().handle((inMach) => {
      this.apValues.isSelectedSpeedInMach.set(inMach);
    });
  }

  /**
   * Checks and sets the proper armed altitude mode.
   */
  protected manageAltitudeCapture(): void {
    let altCapType = APAltitudeModes.NONE;
    let armAltCap = false;
    switch (this.apValues.verticalActive.get()) {
      case APVerticalModes.VS:
      case APVerticalModes.FLC:
      case APVerticalModes.PITCH:
      case APVerticalModes.TO:
        if (this.inClimb && this.apValues.selectedAltitude.get() > this.currentAltitude) {
          altCapType = this.vnavCaptureType === VNavAltCaptureType.VNAV ? APAltitudeModes.ALTV : APAltitudeModes.ALTS;
          armAltCap = this.apValues.selectedAltitude.get() >= this.baroMinimumsSetting.get() + 500;
        } else if (!this.inClimb && this.apValues.selectedAltitude.get() < this.currentAltitude) {
          altCapType = this.vnavCaptureType === VNavAltCaptureType.VNAV ? APAltitudeModes.ALTV : APAltitudeModes.ALTS;
          armAltCap = this.apValues.selectedAltitude.get() >= this.baroMinimumsSetting.get() + 500;
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
      case APVerticalModes.GA:
        if (this.verticalAltitudeArmed !== APAltitudeModes.ALTV && this.minimumsModeSetting.get() === MinimumsMode.BARO) {
          altCapType = APAltitudeModes.ALTS;
          armAltCap = this.apValues.selectedAltitude.get() >= this.baroMinimumsSetting.get() + 500;
        }
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
   * Handles input from the State Manager when the TOGA button is pressed
   * (K event AUTO_THROTTLE_TO_GA)
   */
  protected togaPressed(): void {
    const hasToMode = this.verticalModes.has(APVerticalModes.TO);
    const hasGaMode = this.verticalModes.has(APVerticalModes.GA);
    const verticalActive = this.apValues.verticalActive.get();
    let toGaWasActive = false;

    if (hasToMode && hasGaMode) {
      if (verticalActive === APVerticalModes.TO || verticalActive === APVerticalModes.GA) {
        this.verticalModes.get(verticalActive)?.deactivate();
        toGaWasActive = true;
      }

      if (!toGaWasActive) {
        if (Simplane.getIsGrounded()) {
          this.verticalModes.get(APVerticalModes.TO)?.arm();
        } else {
          this.bus.getPublisher<ControlEvents>().pub('activate_missed_approach', true, true);
          this.verticalModes.get(APVerticalModes.GA)?.arm();
          this.bus.getPublisher<ControlEvents>().pub('suspend_sequencing', false, true);
        }
      }
    } else if (hasToMode) {
      if (verticalActive === APVerticalModes.TO) {
        this.verticalModes.get(APVerticalModes.TO)?.deactivate();
        toGaWasActive = true;
      }
      if (!toGaWasActive) {
        this.verticalModes.get(APVerticalModes.TO)?.arm();
      }
    }
  }

  /**
   * Evaluates if any TO/GA mode is on.
   * @returns true, if any vertical mode is TO/GA.
   */
  private evalIsTogaOn(): boolean {
    return (this.apValues.verticalActive.get() === APVerticalModes.TO || this.apValues.verticalActive.get() === APVerticalModes.GA);
  }

  /**
   * Handles epic2 specific vertical events from the AP state manager.
   * @param event The event that occured.
   */
  protected onEpic2VerticalEvent(event: Epic2APVerticalEvent): void {
    switch (event) {
      case Epic2APVerticalEvent.PitchWheelTurned:
        if (this.apValues.verticalActive.get() === APVerticalModes.ALT) {
          this.setVerticalActive(APVerticalModes.PITCH);
        }
    }
  }

  /**
   * Publishes data for the FMA.
   * @param clear Is to clear the FMA
   */
  private updateFma(clear = false): void {
    const verticalActive = this.apValues.verticalActive.get();

    const fmaTemp = this.fmaData;
    fmaTemp.set('verticalApproachArmed', (clear ? APVerticalModes.NONE : this.verticalApproachArmed));
    fmaTemp.set('verticalArmed', (clear ? APVerticalModes.NONE : this.apValues.verticalArmed.get()));
    fmaTemp.set('verticalActive', (clear ? APVerticalModes.NONE : verticalActive));
    fmaTemp.set('verticalAltitudeArmed', (clear ? APAltitudeModes.NONE : this.verticalAltitudeArmed));
    fmaTemp.set('altitideCaptureArmed', (clear ? false : this.altCapArmed));
    fmaTemp.set('altitideCaptureValue', (clear ? -1 : this.apValues.capturedAltitude.get()));
    fmaTemp.set('lateralActive', (clear ? APLateralModes.NONE : this.apValues.lateralActive.get()));
    fmaTemp.set('lateralArmed', (clear ? APLateralModes.NONE : this.apValues.lateralArmed.get()));
    fmaTemp.set('lateralModeFailed', (clear ? false : this.lateralModeFailed));
    fmaTemp.set('isAbnormalDisengageActive', (clear ? false : this.isAbnormalDisengageActive.get()));

    const verticalDirector = this.verticalModes.get(verticalActive);
    const isOverspeedActive = Epic2Autopilot.isOverspeedProtectedDirector(verticalDirector) && verticalDirector.isOverspeedActive;
    fmaTemp.set('isOverspeedProtectionActive', clear ? false : isOverspeedActive);

    // fmaTemp.set('pathArmedError', (clear || vnavManager === undefined ? false : vnavManager.pathArmedError.get()));
    fmaTemp.set('pathArmedError', false);

    fmaTemp.set('apApproachModeOn', (clear ? false : this.apValues.apApproachModeOn.get()));
  }
}
