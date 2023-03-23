import {
  AltitudeSelectManager, AltitudeSelectManagerOptions, APAltitudeModes, APConfig, APEvents, APLateralModes, APStateManager,
  APVerticalModes, Autopilot, ConsumerSubject, ConsumerValue, DirectorState, EventBus, FlightPlanner, MappedSubject, MetricAltitudeSettingsManager,
  MinimumsMode, ObjectSubject, SetSubject, SimVarValueType, UnitType, VNavAltCaptureType, VNavState
} from '@microsoft/msfs-sdk';
import { AdcSystemEvents, FmaData, FmaDataEvents, FmaVNavState, GarminVNavManager2, MinimumsDataProvider } from '@microsoft/msfs-garminsdk';

/**
 * A G3000 autopilot.
 */
export class G3000Autopilot extends Autopilot {
  private static readonly ALT_SELECT_OPTIONS: AltitudeSelectManagerOptions = {
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

  private readonly altSelectStops = SetSubject.create<number>();

  private readonly altSelectManager = new AltitudeSelectManager(this.bus, this.settingsManager, G3000Autopilot.ALT_SELECT_OPTIONS, this.altSelectStops);

  private readonly fmaData = ObjectSubject.create<FmaData>({
    verticalActive: APVerticalModes.NONE,
    verticalArmed: APVerticalModes.NONE,
    verticalApproachArmed: APVerticalModes.NONE,
    verticalAltitudeArmed: APAltitudeModes.NONE,
    altitideCaptureArmed: false,
    altitideCaptureValue: -1,
    lateralActive: APLateralModes.NONE,
    lateralArmed: APLateralModes.NONE,
    lateralModeFailed: false,
    vnavState: FmaVNavState.OFF
  });

  private readonly fmaDataPublisher = this.bus.getPublisher<FmaDataEvents>();
  private needPublishFmaData = false;

  private readonly machToKias = ConsumerValue.create(null, 1);
  private readonly selSpeedIsMach = ConsumerSubject.create(null, false);

  /**
   * Creates an instance of the G1000Autopilot.
   * @param bus The event bus.
   * @param flightPlanner This autopilot's associated flight planner.
   * @param config This autopilot's configuration.
   * @param stateManager This autopilot's state manager.
   * @param settingsManager The settings manager to pass to altitude preselect system.
   * @param minimumsDataProvider A provider of minimums data.
   */
  constructor(
    bus: EventBus,
    flightPlanner: FlightPlanner,
    config: APConfig,
    stateManager: APStateManager,
    private readonly settingsManager: MetricAltitudeSettingsManager,
    minimumsDataProvider: MinimumsDataProvider
  ) {
    super(bus, flightPlanner, config, stateManager);

    this.fmaData.sub(() => {
      this.needPublishFmaData = true;
    }, true);

    // Add a stop for the altitude preselector at the minimums altitude if BARO minimums are active.
    MappedSubject.create(minimumsDataProvider.mode, minimumsDataProvider.minimums).sub(([mode, minimums]) => {
      this.altSelectStops.clear();

      if (mode === MinimumsMode.BARO && minimums !== null) {
        this.altSelectStops.add(minimums);
      }
    }, true);
  }

  /**
   * Resets this autopilot. Resets the altitude preselector, sets AP MASTER to off, and deactivates the flight
   * director.
   */
  public reset(): void {
    this.altSelectManager.reset(0, true);
    if (SimVar.GetSimVarValue('AUTOPILOT MASTER', SimVarValueType.Bool) !== 0) {
      SimVar.SetSimVarValue('K:AP_MASTER', SimVarValueType.Number, 0);
    }
    if (SimVar.GetSimVarValue('AUTOPILOT FLIGHT DIRECTOR ACTIVE', SimVarValueType.Bool) !== 0) {
      SimVar.SetSimVarValue('K:TOGGLE_FLIGHT_DIRECTOR', SimVarValueType.Number, 0);
    }
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
  protected monitorAdditionalEvents(): void {
    const sub = this.bus.getSubscriber<APEvents & AdcSystemEvents>();

    // Whenever we switch between mach and IAS hold and we are in manual speed mode, we need to set the value to which
    // we are switching to be equal to the value we are switching from.

    this.machToKias.setConsumer(sub.on('adc_mach_to_kias_factor_1'));
    this.selSpeedIsMach.setConsumer(sub.on('ap_selected_speed_is_mach'));

    const speedIsMachSub = this.selSpeedIsMach.sub(isMach => {
      if (isMach) {
        SimVar.SetSimVarValue('K:AP_MACH_VAR_SET', SimVarValueType.Number, Math.round(this.apValues.selectedIas.get() / this.machToKias.get() * 100));
      } else {
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
      case APVerticalModes.GA:
        armAltCap = true;
        altCapType = this.vnavCaptureType === VNavAltCaptureType.VNAV ? APAltitudeModes.ALTV : APAltitudeModes.ALTS;
        break;
      case APVerticalModes.PATH: {
        altCapType = this.vnavCaptureType === VNavAltCaptureType.VNAV ? APAltitudeModes.ALTV : APAltitudeModes.ALTS;
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
   * Publishes data for the FMA.
   */
  private updateFma(): void {
    const fmaData = this.fmaData;

    const vnavManager = this.vnavManager as GarminVNavManager2;

    let fmaVNavState = FmaVNavState.OFF;

    fmaVNavState = vnavManager.isActive
      ? FmaVNavState.ACTIVE
      : vnavManager.state === VNavState.Enabled_Active ? FmaVNavState.ARMED : FmaVNavState.OFF;

    fmaData.set('verticalApproachArmed', this.verticalApproachArmed);
    fmaData.set('verticalArmed', this.apValues.verticalArmed.get());
    fmaData.set('verticalActive', this.apValues.verticalActive.get());
    fmaData.set('verticalAltitudeArmed', this.verticalAltitudeArmed);
    fmaData.set('altitideCaptureArmed', this.altCapArmed);
    fmaData.set('altitideCaptureValue', this.apValues.capturedAltitude.get());
    fmaData.set('lateralActive', this.apValues.lateralActive.get());
    fmaData.set('lateralArmed', this.apValues.lateralArmed.get());
    fmaData.set('lateralModeFailed', this.lateralModeFailed);
    fmaData.set('vnavState', fmaVNavState);

    if (this.needPublishFmaData) {
      this.needPublishFmaData = false;
      this.fmaDataPublisher.pub('fma_data', Object.assign({}, fmaData.get()), true, true);
    }
  }
}