/// <reference types="@microsoft/msfs-types/js/simvar" />

import {
  AdcEvents, AltitudeSelectManager, AltitudeSelectManagerOptions, APAltitudeModes, APConfig, APEvents, APLateralModes, APStateManager, APVerticalModes,
  Autopilot, ConsumerSubject, ControlEvents, DirectorState, EventBus, FlightPlanner, MappedSubject, MetricAltitudeSettingsManager, NavComSimVars, NavSourceType, ObjectSubject,
  RadioUtils, SimVarValueType, Subject, UnitType, VNavAltCaptureType
} from '@microsoft/msfs-sdk';

import { WT21VNavManager } from '../../Shared/Navigation/WT21VNavManager';
import { FmaData, WT21ControlEvents } from '../../Shared/WT21ControlEvents';

/**
 * WT21 autopilot.
 */
export class WT21Autopilot extends Autopilot {
  private static readonly ALT_SELECT_OPTIONS: AltitudeSelectManagerOptions = {
    supportMetric: true,
    minValue: UnitType.FOOT.createNumber(0),
    maxValue: UnitType.FOOT.createNumber(45000),
    inputIncrLargeThreshold: 999,
    incrSmall: UnitType.FOOT.createNumber(100),
    incrLarge: UnitType.FOOT.createNumber(1000),
    incrSmallMetric: UnitType.METER.createNumber(50),
    incrLargeMetric: UnitType.METER.createNumber(500),
    accelInputCountThreshold: 5,
    transformSetToIncDec: false
  };

  public readonly externalAutopilotInstalled = Subject.create<boolean>(false);
  protected readonly lateralArmedModeSubject = Subject.create<APLateralModes>(APLateralModes.NONE);
  protected readonly altArmedSubject = Subject.create<boolean>(false);

  protected readonly altSelectManager = new AltitudeSelectManager(this.bus, this.settingsManager, WT21Autopilot.ALT_SELECT_OPTIONS);

  protected readonly fmaData: ObjectSubject<FmaData>;
  private fmaUpdateDebounce: NodeJS.Timeout | undefined;

  private nav1IsLoc = false;
  private nav2IsLoc = false;

  protected flightPlanSynced = true;

  protected togaIsOn = false;

  /**
   * Creates an instance of the WT21Autopilot.
   * @param bus The event bus.
   * @param flightPlanner This autopilot's associated flight planner.
   * @param config This autopilot's configuration.
   * @param stateManager This autopilot's state manager.
   * @param settingsManager The settings manager to pass to altitude preselect system.
   */
  constructor(
    bus: EventBus, flightPlanner: FlightPlanner, config: APConfig, stateManager: APStateManager,
    private readonly settingsManager: MetricAltitudeSettingsManager
  ) {
    super(bus, flightPlanner, config, stateManager);

    this.fmaData = ObjectSubject.create<FmaData>({
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
      apApproachModeOn: false
    });

    const publisher = this.bus.getPublisher<WT21ControlEvents>();
    this.fmaData.sub(() => {
      // dirty debounce, need better ObjectSubject
      if (this.fmaUpdateDebounce) {
        return;
      }

      this.fmaUpdateDebounce = setTimeout(() => {
        this.fmaUpdateDebounce = undefined;
        publisher.pub('fma_modes', this.fmaData.get(), true);
      }, 0);
    }, true);
  }

  /** @inheritdoc */
  protected onAfterUpdate(): void {
    this.updateFma();
  }

  /** @inheritdoc */
  protected onInitialized(): void {
    this.bus.pub('vnav_set_state', true);

    this.monitorAdditionalEvents();
  }

  /** @inheritdoc */
  protected setLateralActive(mode: APLateralModes): void {
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
      if (lateralArmed === APLateralModes.LOC) {
        this.deactivateArmedOrActiveVerticalMode(APVerticalModes.GS);
        this.lateralModes.get(APLateralModes.LOC)?.deactivate();
      } else if (lateralArmed === APLateralModes.GPSS) {
        this.deactivateArmedOrActiveVerticalMode(APVerticalModes.GP);
        this.lateralModes.get(APLateralModes.GPSS)?.deactivate();
      } else if (lateralActive === APLateralModes.VOR || lateralActive === APLateralModes.LOC || lateralActive === APLateralModes.GPSS) {
        this.lateralModes.get(lateralActive)?.deactivate();
      }
      this.apValues.apApproachModeOn.set(false);
      return;
    }

    if (set === undefined || set === true) {
      switch (this.getArmableApproachType()) {
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
  protected getArmableApproachType(): APLateralModes {
    switch (this.cdiSource.type) {
      case NavSourceType.Nav:
        if (this.cdiSource.index === 1 && this.nav1IsLoc) {
          return APLateralModes.LOC;
        } else if (this.cdiSource.index === 2 && this.nav2IsLoc) {
          return APLateralModes.LOC;
        } else {
          return APLateralModes.VOR;
        }
      case NavSourceType.Gps:
        if (this.apValues.approachIsActive.get()) {
          if (this.navToNavManager && this.navToNavManager.canLocArm()) {
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
    const sub = this.bus.getSubscriber<AdcEvents & APEvents>();

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

    const isInMachRegimeSub = Subject.create(false);

    const altSub = ConsumerSubject.create(sub.on('indicated_alt').withPrecision(0), 0).pause();
    altSub.sub((alt: number): void => {
      // Mach hold above 27884 feet, and IAS hold below.
      isInMachRegimeSub.set(alt > 27884);
    });

    // TODO: Support configurable VNAV IAS/Mach speeds
    const machToKiasSub = ConsumerSubject.create(sub.on('mach_to_kias_factor').withPrecision(3), 0).pause();
    machToKiasSub.sub((factor: number): void => {
      // Mach hold when VNAV mach speed is less than VNAV IAS speed, and IAS hold when VNAV IAS speed is less than VNAV mach speed.
      isInMachRegimeSub.set(0.64 * factor < 240);
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

    isVFLCActiveSub.sub(isVFLCActive => {
      isInMachRegimeSub.unsub(machSwitchHandler);

      if (isVFLCActive) {
        altSub.pause();
        machToKiasSub.resume();
      } else {
        machToKiasSub.pause();
        altSub.resume();
      }

      isInMachRegimeSub.sub(machSwitchHandler);
    }, true);

    const radio = this.bus.getSubscriber<NavComSimVars>();
    radio.on('nav_active_frequency_1').whenChanged().handle((freq) => {
      freq = Math.round(freq * 100) / 100;
      this.nav1IsLoc = RadioUtils.isLocalizerFrequency(freq);
    });

    radio.on('nav_active_frequency_2').whenChanged().handle((freq) => {
      freq = Math.round(freq * 100) / 100;
      this.nav2IsLoc = RadioUtils.isLocalizerFrequency(freq);
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
    this.apValues.lateralActive.sub(checkTogaFn);
    this.apValues.verticalActive.sub(checkTogaFn);
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
          armAltCap = true;
        } else if (!this.inClimb && this.apValues.selectedAltitude.get() < this.currentAltitude) {
          altCapType = this.vnavCaptureType === VNavAltCaptureType.VNAV ? APAltitudeModes.ALTV : APAltitudeModes.ALTS;
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
          this.bus.getPublisher<ControlEvents>().pub('activate_missed_approach', true, true);
          this.verticalModes.get(APVerticalModes.GA)?.arm();
          this.lateralModes.get(APLateralModes.GA)?.arm();
          this.bus.getPublisher<ControlEvents>().pub('suspend_sequencing', false, true);
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
   * Evaluates if any TO/GA mode is on.
   * @returns true, if any vertical or lateral mode is TO/GA.
   */
  private evalIsTogaOn(): boolean {
    return ((this.apValues.verticalActive.get() === APVerticalModes.TO || this.apValues.verticalActive.get() === APVerticalModes.GA)
      || (this.apValues.lateralActive.get() === APLateralModes.TO || this.apValues.lateralActive.get() === APLateralModes.GA));
  }

  /**
   * Publishes data for the FMA.
   * @param clear Is to clear the FMA
   */
  private updateFma(clear = false): void {
    const vnavManager = this.vnavManager as WT21VNavManager;
    const fmaTemp = this.fmaData;
    fmaTemp.set('verticalApproachArmed', (clear ? APVerticalModes.NONE : this.verticalApproachArmed));
    fmaTemp.set('verticalArmed', (clear ? APVerticalModes.NONE : this.apValues.verticalArmed.get()));
    fmaTemp.set('verticalActive', (clear ? APVerticalModes.NONE : this.apValues.verticalActive.get()));
    fmaTemp.set('verticalAltitudeArmed', (clear ? APAltitudeModes.NONE : this.verticalAltitudeArmed));
    fmaTemp.set('altitideCaptureArmed', (clear ? false : this.altCapArmed));
    fmaTemp.set('altitideCaptureValue', (clear ? -1 : this.apValues.capturedAltitude.get()));
    fmaTemp.set('lateralActive', (clear ? APLateralModes.NONE : this.apValues.lateralActive.get()));
    fmaTemp.set('lateralArmed', (clear ? APLateralModes.NONE : this.apValues.lateralArmed.get()));
    fmaTemp.set('lateralModeFailed', (clear ? false : this.lateralModeFailed));
    fmaTemp.set('pathArmedError', (clear || vnavManager === undefined ? false : vnavManager.pathArmedError.get()));
    fmaTemp.set('apApproachModeOn', (clear ? false : this.apValues.apApproachModeOn.get()));
  }
}
