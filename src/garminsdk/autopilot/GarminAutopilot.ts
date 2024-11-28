import {
  AdcEvents, AltitudeSelectEvents, AltitudeSelectManager, AltitudeSelectManagerOptions, APAltitudeModes, APEvents, APLateralModes,
  APModePressEvent, APStateManager, APVerticalModes, Autopilot, ConsumerSubject, ConsumerValue, DirectorState,
  EventBus, FlightPlanner, MappedSubject, MetricAltitudeSettingsManager, MinimumsMode, NavSourceType, ObjectSubject,
  PlaneDirector,
  RadioUtils, SetSubject, SimVarValueType, Subject, UnitType, VNavAltCaptureType, VNavState
} from '@microsoft/msfs-sdk';

import { MinimumsDataProvider } from '../minimums/MinimumsDataProvider';
import { GarminAPVars } from './data/GarminAPEvents';
import { FmaData, FmaDataEvents, FmaVNavState } from './FmaData';
import { GarminAPConfigInterface } from './GarminAPConfigInterface';
import { GarminVNavManager2 } from './vnav/GarminVNavManager2';

/**
 * Options with which to configure a {@link GarminAutopilot}.
 */
export type GarminAutopilotOptions = {
  /**
   * Options for the autopilot's altitude select manager. The following default options will be applied if they are not
   * explicitly provided:
   * ```
   * supportMetric: true,
   * minValue: UnitType.FOOT.createNumber(-1000),
   * maxValue: UnitType.FOOT.createNumber(50000),
   * inputIncrLargeThreshold: 999,
   * incrSmall: UnitType.FOOT.createNumber(100),
   * incrLarge: UnitType.FOOT.createNumber(1000),
   * incrSmallMetric: UnitType.METER.createNumber(50),
   * incrLargeMetric: UnitType.METER.createNumber(500),
   * initOnInput: true,
   * initToIndicatedAlt: true,
   * transformSetToIncDec: false
   * ```
   */
  altSelectOptions?: Readonly<Partial<AltitudeSelectManagerOptions>>;

  /**
   * A manager of metric altitude mode user settings. Required for the autopilot's altitude select manager to support
   * metric mode.
   */
  metricAltSettingsManager?: MetricAltitudeSettingsManager;

  /**
   * A provider of minimums data. If defined, the autopilot's altitude select manager will add an additional selected
   * altitude stop at the baro minimums altitude if one is set.
   */
  minimumsDataProvider?: MinimumsDataProvider;

  /** Whether to support mach number as the selected airspeed reference. Defaults to `false`. */
  supportMachSelect?: boolean;
};

/**
 * A Garmin autopilot.
 */
export class GarminAutopilot extends Autopilot<GarminAPConfigInterface> {
  protected static readonly ALT_SELECT_OPTIONS_DEFAULT: AltitudeSelectManagerOptions = {
    supportMetric: true,
    minValue: UnitType.FOOT.createNumber(-1000),
    maxValue: UnitType.FOOT.createNumber(50000),
    inputIncrLargeThreshold: 999,
    incrSmall: UnitType.FOOT.createNumber(100),
    incrLarge: UnitType.FOOT.createNumber(1000),
    incrSmallMetric: UnitType.METER.createNumber(50),
    incrLargeMetric: UnitType.METER.createNumber(500),
    initOnInput: true,
    initToIndicatedAlt: true,
    transformSetToIncDec: false
  };

  protected readonly resetAltSelectInitialization: boolean;

  protected readonly altSelectStops = SetSubject.create<number>();

  protected readonly altSelectManager: AltitudeSelectManager;

  protected readonly isAltSelectInitialized = ConsumerValue.create(null, true);

  protected readonly fmaData = ObjectSubject.create<FmaData>({
    verticalActive: APVerticalModes.NONE,
    verticalArmed: APVerticalModes.NONE,
    verticalApproachArmed: APVerticalModes.NONE,
    verticalAltitudeArmed: APAltitudeModes.NONE,
    altitudeCaptureArmed: false,
    altitudeCaptureValue: -1,
    lateralActive: APLateralModes.NONE,
    lateralArmed: APLateralModes.NONE,
    lateralModeFailed: false,
    vnavState: FmaVNavState.OFF
  });

  protected readonly fmaDataPublisher = this.bus.getPublisher<FmaDataEvents>();
  protected needPublishFmaData = false;

  protected readonly machToKias = ConsumerValue.create(null, 1);
  protected readonly selSpeedIsMach = ConsumerSubject.create(null, false);

  protected readonly supportMachSelect: boolean;

  protected readonly isNavModeOn = Subject.create(false);
  protected readonly isApproachModeOn = Subject.create(false);

  protected isApproachModeCommandedOn = false;

  /**
   * Creates a new instance of GarminAutopilot.
   * @param bus The event bus.
   * @param flightPlanner This autopilot's associated flight planner.
   * @param config This autopilot's configuration.
   * @param stateManager This autopilot's state manager.
   * @param options Options with which to configure the new autopilot.
   */
  public constructor(
    bus: EventBus,
    flightPlanner: FlightPlanner,
    config: GarminAPConfigInterface,
    stateManager: APStateManager,
    options?: Readonly<GarminAutopilotOptions>
  ) {
    super(bus, flightPlanner, config, stateManager);

    const altSelectManagerOptions = { ...options?.altSelectOptions } as AltitudeSelectManagerOptions;
    for (const key in GarminAutopilot.ALT_SELECT_OPTIONS_DEFAULT) {
      const opt = key as keyof AltitudeSelectManagerOptions;
      if (altSelectManagerOptions[opt] === undefined) {
        (altSelectManagerOptions[opt] as any) = GarminAutopilot.ALT_SELECT_OPTIONS_DEFAULT[opt];
      }
    }

    this.resetAltSelectInitialization = altSelectManagerOptions.initOnInput === true;

    this.supportMachSelect = options?.supportMachSelect ?? false;

    this.altSelectManager = new AltitudeSelectManager(this.bus, options?.metricAltSettingsManager, altSelectManagerOptions, this.altSelectStops);

    this.fmaData.sub(() => {
      this.needPublishFmaData = true;
    }, true);

    if (options?.minimumsDataProvider) {
      // Add a stop for the altitude preselector at the minimums altitude if BARO minimums are active.
      MappedSubject.create(options.minimumsDataProvider.mode, options.minimumsDataProvider.minimums).sub(([mode, minimums]) => {
        this.altSelectStops.clear();

        if (mode === MinimumsMode.BARO && minimums !== null) {
          this.altSelectStops.add(minimums);
        }
      }, true);
    }

    this.monitorGarminEvents();
  }

  /**
   * Sets the initialized state of this autopilot's selected altitude.
   * @param initialized The state to set.
   */
  public setSelectedAltitudeInitialized(initialized: boolean): void {
    this.altSelectManager.setSelectedAltitudeInitialized(initialized);
  }

  /**
   * Resets this autopilot. Resets the altitude preselector, sets AP MASTER to off, and deactivates the flight
   * director.
   */
  public reset(): void {
    this.altSelectManager.reset(0, this.resetAltSelectInitialization);
    if (SimVar.GetSimVarValue('AUTOPILOT MASTER', SimVarValueType.Bool) !== 0) {
      SimVar.SetSimVarValue('K:AP_MASTER', SimVarValueType.Number, 0);
    }
    if (SimVar.GetSimVarValue('AUTOPILOT FLIGHT DIRECTOR ACTIVE', SimVarValueType.Bool) !== 0) {
      SimVar.SetSimVarValue('K:TOGGLE_FLIGHT_DIRECTOR', SimVarValueType.Number, 0);
    }
  }

  /** @inheritDoc */
  protected initVerticalModeDirector(
    mode: number,
    director: PlaneDirector,
    setPitch?: (pitch: number, resetServo?: boolean, maxNoseDownPitch?: number, maxNoseUpPitch?: number) => void,
    drivePitch?: (pitch: number, adjustForAoa?: boolean, adjustForVerticalWind?: boolean, rate?: number, maxNoseDownPitch?: number, maxNoseUpPitch?: number) => void
  ): void {
    if (mode === APVerticalModes.GP) {
      director.onArm = () => { this.setVerticalApproachArmed(mode); };
      director.onActivate = () => {
        this.setVerticalActive(APVerticalModes.GP);
        this.setVerticalArmed(APVerticalModes.NONE);
        this.setVerticalApproachArmed(APVerticalModes.NONE);
      };

      director.setPitch = setPitch;
      director.drivePitch = drivePitch;
    } else {
      super.initVerticalModeDirector(mode, director, setPitch, drivePitch);
    }
  }

  /**
   * Monitors Garmin autopilot-specific events.
   */
  protected monitorGarminEvents(): void {
    this.isNavModeOn.sub(isNavModeOn => { SimVar.SetSimVarValue(GarminAPVars.NavModeOn, SimVarValueType.Bool, isNavModeOn); }, true);
    this.isApproachModeOn.sub(isApproachModeOn => { SimVar.SetSimVarValue(GarminAPVars.ApproachModeOn, SimVarValueType.Bool, isApproachModeOn); }, true);
  }

  /** @inheritDoc */
  protected onInitialized(): void {
    this.monitorAdditionalEvents();
  }

  /** @inheritDoc */
  protected monitorAdditionalEvents(): void {
    const sub = this.bus.getSubscriber<APEvents & AdcEvents & AltitudeSelectEvents>();

    this.isAltSelectInitialized.setConsumer(sub.on('alt_select_is_initialized'));

    if (this.supportMachSelect) {
      // Whenever we switch between mach and IAS hold and we are in manual speed mode, we need to set the value to which
      // we are switching to be equal to the value we are switching from.

      this.machToKias.setConsumer(sub.on(this.config.useIndicatedMach ? 'indicated_mach_to_kias_factor_1' : 'mach_to_kias_factor_1'));
      this.selSpeedIsMach.setConsumer(sub.on('ap_selected_speed_is_mach'));

      const speedIsMachSub = this.selSpeedIsMach.sub(isMach => {
        if (isMach) {
          // Round mach to nearest 0.001.
          SimVar.SetSimVarValue('K:AP_MACH_VAR_SET_EX1', SimVarValueType.Number, Math.round(this.apValues.selectedIas.get() / this.machToKias.get() * 1e3) * 1e3);
        } else {
          // Round IAS to nearest knot.
          SimVar.SetSimVarValue('K:AP_SPD_VAR_SET', SimVarValueType.Number, Math.round(this.apValues.selectedMach.get() * this.machToKias.get()));
        }
      }, false, true);

      sub.on('ap_selected_speed_is_manual').whenChanged().handle(isManual => {
        if (isManual) {
          speedIsMachSub.resume();
        } else {
          speedIsMachSub.pause();
        }
      });
    }
  }

  /**
   * Checks and sets the proper armed altitude mode.
   */
  protected manageAltitudeCapture(): void {
    let altCapType = APAltitudeModes.NONE;
    let armAltCap = false;

    const isAltSelectInitialized = this.isAltSelectInitialized.get();

    switch (this.apValues.verticalActive.get()) {
      case APVerticalModes.VS:
      case APVerticalModes.FLC:
      case APVerticalModes.PITCH:
      case APVerticalModes.TO:
      case APVerticalModes.GA:
      case APVerticalModes.PATH:
        if (this.vnavCaptureType === VNavAltCaptureType.VNAV) {
          armAltCap = true;
          altCapType = APAltitudeModes.ALTV;
        } else if (isAltSelectInitialized) {
          // Only arm ALTS if selected altitude is initialized.
          armAltCap = true;
          altCapType = APAltitudeModes.ALTS;
        }
        break;
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

  /** @inheritDoc */
  protected onAfterUpdate(): void {
    this.updateApproachModeState();
    this.updateNavModeState();
    this.updateFma();
  }

  /**
   * Updates this autopilot's NAV mode state.
   */
  protected updateNavModeState(): void {
    const lateralArmed = this.apValues.lateralArmed.get();
    const lateralActive = this.apValues.lateralActive.get();

    if (
      this.apValues.cdiSource.get().type === NavSourceType.Gps
      && !!this.apValues.navToNavArmableLateralMode && this.apValues.navToNavArmableLateralMode() === lateralArmed
      && lateralArmed !== APLateralModes.NONE
    ) {
      // If nav-to-nav is armed, then NAV mode is on if and only if GPSS is armed or active. Note that this is also the
      // only time when nav mode and approach mode can be on simultaneously.
      this.isNavModeOn.set(
        lateralArmed === APLateralModes.GPSS
        || lateralActive === APLateralModes.GPSS
      );
    } else {
      // If nav-to-nav is not armed, then NAV mode is on if and only if approach mode is not on and one of the
      // NAV-compatible lateral modes is armed or active.
      this.isNavModeOn.set(
        !this.isApproachModeOn.get()
        && (
          lateralArmed === APLateralModes.VOR
          || lateralArmed === APLateralModes.LOC
          || lateralArmed === APLateralModes.BC
          || lateralArmed === APLateralModes.GPSS
          || lateralArmed === APLateralModes.NAV
          || lateralActive === APLateralModes.VOR
          || lateralActive === APLateralModes.LOC
          || lateralActive === APLateralModes.BC
          || lateralActive === APLateralModes.GPSS
          || lateralActive === APLateralModes.NAV
        )
      );
    }
  }

  /**
   * Updates this autopilot's approach mode state.
   */
  protected updateApproachModeState(): void {
    if (this.isApproachModeOn.get()) {
      // Check to see if the approach state should be reset to "off" due to automatic deactivation of modes.
      this.reconcileApproachState();
    }
  }

  /**
   * Publishes data for the FMA.
   */
  protected updateFma(): void {
    const fmaData = this.fmaData;

    const vnavManager = this.vnavManager as GarminVNavManager2 | undefined;

    let fmaVNavState = FmaVNavState.OFF;

    if (vnavManager) {
      fmaVNavState = vnavManager.isActive
        ? FmaVNavState.ACTIVE
        : vnavManager.state === VNavState.Enabled_Active ? FmaVNavState.ARMED : FmaVNavState.OFF;
    }

    fmaData.set('verticalApproachArmed', this.verticalApproachArmed);
    fmaData.set('verticalArmed', this.apValues.verticalArmed.get());
    fmaData.set('verticalActive', this.apValues.verticalActive.get());
    fmaData.set('verticalAltitudeArmed', this.verticalAltitudeArmed);
    fmaData.set('altitudeCaptureArmed', this.altCapArmed);
    fmaData.set('altitudeCaptureValue', this.apValues.capturedAltitude.get());
    fmaData.set('lateralActive', this.apValues.lateralActive.get());
    fmaData.set('lateralArmed', this.apValues.lateralArmed.get());
    fmaData.set('lateralModeFailed', this.lateralModeFailed);
    fmaData.set('vnavState', fmaVNavState);

    if (this.needPublishFmaData) {
      this.needPublishFmaData = false;
      this.fmaDataPublisher.pub('fma_data', Object.assign({}, fmaData.get()), true, true);
    }
  }

  /** @inheritDoc */
  protected lateralPressed(data: APModePressEvent): void {
    const mode = data.mode as APLateralModes;

    if (
      this.isApproachModeOn.get()
      && mode === APLateralModes.NAV
    ) {
      if (data.set === false || data.set === undefined) {
        if (this.apValues.cdiSource.get().type === NavSourceType.Gps && this.apValues.lateralArmed.get() === APLateralModes.LOC) {
          // If LOC is armed for nav-to-nav, then pressing NAV should toggle the armed state of GPSS. If GPSS is
          // toggled off, then LOC/GS stay armed. If GPSS is toggled on, then we need to deactivate approach mode
          // (arming GPSS effectively replaces the armed LOC/GS modes).
          if (!this.deactivateArmedOrActiveLateralMode(APLateralModes.GPSS)) {
            this.deactivateApproachMode(false);
            this.lateralModes.get(APLateralModes.GPSS)?.arm();
          }
        } else {
          // In all cases where LOC is not armed for nav-to-nav, pressing NAV should deactivate the armed or active
          // vertical approach mode while preserving the current armed/active lateral mode.
          this.deactivateApproachMode(true);
        }
      }
    } else {
      super.lateralPressed(data);
    }
  }

  /**
   * Handles input from the State Manager when a vertical mode button is pressed.
   * @param data is the AP Vertical Mode Event Data
   */
  protected verticalPressed(data: APModePressEvent): void {
    if (!this.verticalModes.has(data.mode)) {
      return;
    }

    // If selected altitude is not initialized, then do not allow FLC to be armed or activated.
    if (data.mode === APVerticalModes.FLC && !this.isAltSelectInitialized.get()) {
      if (
        data.set === true
        || (
          data.set === undefined && (
            this.apValues.verticalActive.get() !== APVerticalModes.FLC
            && this.apValues.verticalArmed.get() !== APVerticalModes.FLC
          )
        )
      ) {
        return;
      }
    }

    super.verticalPressed(data);
  }

  /** @inheritDoc */
  protected approachPressed(set?: boolean): void {
    set ??= !this.isApproachModeOn.get();

    if (set === this.isApproachModeOn.get()) {
      return;
    }

    if (set) {
      if (this.config.autoEngageFd !== false && !this.stateManager.isAnyFlightDirectorOn.get()) {
        this.stateManager.setFlightDirector(true);
      } else if (this.config.autoEngageFd === false && !this.stateManager.isAnyFlightDirectorOn.get() && !this.stateManager.apMasterOn.get()) {
        return;
      }
      this.activateApproachMode();
    } else {
      this.deactivateApproachMode(false);
    }
  }

  /**
   * Activates approach mode. Activating approach mode will arm lateral and vertical modes based on the current CDI
   * source and nav-to-nav guidance.
   */
  protected activateApproachMode(): void {
    const cdiSource = this.apValues.cdiSource.get();
    switch (cdiSource.type) {
      case NavSourceType.Nav: {
        if (cdiSource.index >= 1 && cdiSource.index <= 4) {
          const frequency = SimVar.GetSimVarValue(`NAV ACTIVE FREQUENCY:${cdiSource.index}`, SimVarValueType.MHz);
          if (RadioUtils.isLocalizerFrequency(frequency)) {
            this.armModesForApproach(APLateralModes.LOC, APVerticalModes.GS);
          } else {
            // TODO: support VAPP mode
          }

          this.isApproachModeCommandedOn = true;
          this.reconcileApproachState();
        }
        break;
      }
      case NavSourceType.Gps: {
        if (this.apValues.approachIsActive.get() && this.apValues.approachHasGP.get()) {
          // TODO: modes should be armed if RNAV approach is loaded regardless if the approach is active or if
          // glidepath guidance is available.
          this.armModesForApproach(APLateralModes.GPSS, APVerticalModes.GP);
        } else if (this.navToNavManager) {
          const armableLateralMode = this.navToNavManager.getArmableLateralMode();
          const armableVerticalMode = this.navToNavManager.getArmableVerticalMode();
          if (armableLateralMode !== APLateralModes.NONE) {
            this.armModesForApproach(armableLateralMode, armableVerticalMode);
          }
        }

        this.isApproachModeCommandedOn = true;
        this.reconcileApproachState();
        break;
      }
    }
  }

  /**
   * Arms lateral and vertical approach modes. The vertical mode will only be armed if the lateral mode is successfully
   * armed.
   * @param lateralMode The lateral mode to arm.
   * @param verticalMode The vertical mode to arm.
   */
  protected armModesForApproach(lateralMode: APLateralModes, verticalMode: APVerticalModes): void {
    if (lateralMode === APLateralModes.NONE) {
      return;
    }

    const lateralDirector = this.lateralModes.get(lateralMode);
    if (!lateralDirector) {
      return;
    }

    if (lateralDirector.state === DirectorState.Inactive) {
      lateralDirector.arm();
    }

    // If we were unsuccessful in arming the lateral mode, abort now and don't try to arm the vertical mode.
    if (lateralDirector.state === DirectorState.Inactive) {
      return;
    }

    if (verticalMode === APVerticalModes.NONE) {
      return;
    }

    const verticalDirector = this.verticalModes.get(verticalMode);
    if (verticalDirector) {
      verticalDirector.arm();
    }
  }

  /**
   * Deactivates approach mode. Deactivating approach mode will deactivate any armed or active lateral and vertical
   * approach modes.
   * @param preserveLateralMode Whether to preserve armed or active lateral modes. If true, then any armed or active
   * lateral approach mode that is deactivated will be replaced with its non-approach counterpart, if one exists.
   */
  protected deactivateApproachMode(preserveLateralMode: boolean): void {
    this.isApproachModeCommandedOn = false;

    this.deactivateArmedOrActiveVerticalMode(APVerticalModes.GS);
    this.deactivateArmedOrActiveVerticalMode(APVerticalModes.GP);

    if (preserveLateralMode) {
      // TODO: support switching VAPP -> VOR.
    } else {
      if (!this.deactivateArmedOrActiveLateralMode(APLateralModes.LOC)) {
        // Only deactivate GPSS if LOC was not deactivated. We don't want to deactivate GPSS if LOC/GS was armed for
        // nav-to-nav.
        this.deactivateArmedOrActiveLateralMode(APLateralModes.GPSS);
      }
    }

    this.isApproachModeOn.set(false);
  }

  /**
   * Reconciles the nominal approach mode state with the state of this autopilot's directors.
   */
  protected reconcileApproachState(): void {
    const verticalActive = this.apValues.verticalActive.get();
    const lateralArmed = this.apValues.lateralArmed.get();
    const lateralActive = this.apValues.lateralActive.get();

    if (
      this.verticalApproachArmed !== APVerticalModes.NONE
      || verticalActive === APVerticalModes.GS
      || verticalActive === APVerticalModes.GP
    ) {
      // Approach mode is active if one of the approach-specific lateral or vertical modes is armed or active.
      this.isApproachModeCommandedOn = true;
      this.isApproachModeOn.set(true);
    } else if (
      lateralActive === APLateralModes.LOC || lateralArmed === APLateralModes.LOC
      || lateralActive === APLateralModes.BC || lateralArmed === APLateralModes.BC
    ) {
      // If an approach-specific mode is not armed or active and LOC or BC mode (which are optionally associated with
      // approach mode) is armed or active, then approach mode is active if and only if approach mode is already
      // commanded to be active.
      this.isApproachModeOn.set(this.isApproachModeCommandedOn);
    } else {
      this.isApproachModeCommandedOn = false;
      this.isApproachModeOn.set(false);
    }
  }

  /** @inheritDoc */
  protected checkModes(): void {
    // Deactivate alt cap and FLC if selected altitude is not initialized.

    if (!this.isAltSelectInitialized.get()) {
      const verticalActiveMode = this.apValues.verticalActive.get();
      const verticalArmedMode = this.apValues.verticalArmed.get();

      if (verticalActiveMode === APVerticalModes.CAP || verticalActiveMode === APVerticalModes.FLC) {
        this.verticalModes.get(verticalActiveMode)?.deactivate();
      }
      if (verticalArmedMode === APVerticalModes.CAP || verticalArmedMode === APVerticalModes.FLC) {
        this.verticalModes.get(verticalArmedMode)?.deactivate();
      }
    }

    super.checkModes();
  }
}
