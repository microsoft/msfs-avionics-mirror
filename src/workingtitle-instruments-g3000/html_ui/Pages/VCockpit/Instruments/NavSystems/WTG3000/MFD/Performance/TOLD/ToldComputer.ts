import {
  AdcEvents,
  AeroMath,
  AirportFacility, AvionicsSystemState, AvionicsSystemStateEvent, ClockEvents, ConsumerSubject, ControlSurfacesEvents, EventBus, FacilityLoader,
  FacilityType, FlightPlannerEvents, ICAO, MappedSubject, MappedSubscribable, OneWayRunway, RunwayUtils, Subject, Subscription, UnitType, UserSetting
} from '@microsoft/msfs-sdk';
import { AdcSystemEvents, Fms } from '@microsoft/msfs-garminsdk';
import {
  ToldConfig, ToldControlEvents, ToldLandingPerformanceResult, ToldLimitExceedance, ToldModule, ToldRunwaySurfaceCondition, ToldTakeoffPerformanceResult,
  ToldThrustReverserSelectable, ToldUserSettings, VSpeedGroupType, VSpeedUserSettingManager, WeightFuelEvents, WeightFuelUserSettings
} from '@microsoft/msfs-wtg3000-common';
import { FmsVSpeedManager } from './FmsVSpeedManager';

/**
 * A computer for TOLD (takeoff/landing) performance calculations.
 */
export class ToldComputer {
  private static readonly CALCULATE_DEBOUNCE_DELAY = 500; // milliseconds

  private static readonly FLAPS_ANGLE_TOLERANCE = 0.5; // degrees

  private readonly toldSettingManager = ToldUserSettings.getManager(this.bus);
  private readonly weightFuelSettingManager = WeightFuelUserSettings.getManager(this.bus);

  private module?: ToldModule;

  private readonly adcStates: ConsumerSubject<AvionicsSystemStateEvent>[] = [];
  private adcIndex?: MappedSubject<AvionicsSystemStateEvent[], number>;

  private readonly rat = ConsumerSubject.create(null, 0);
  private readonly baroSetting = ConsumerSubject.create(null, 29.92);

  private readonly flapsLeftAngle = ConsumerSubject.create(null, 0);
  private readonly flapsRightAngle = ConsumerSubject.create(null, 0);
  private readonly isOnGround = ConsumerSubject.create(null, false);

  private readonly originIcaoSetting = this.toldSettingManager.getSetting('toldOriginIcao');
  private readonly takeoffWeightSetting = this.toldSettingManager.getSetting('toldTakeoffWeight');
  private readonly takeoffRunwaySurfaceSetting = this.toldSettingManager.getSetting('toldTakeoffRunwaySurface');
  private readonly takeoffTemperatureSetting = this.toldSettingManager.getSetting('toldTakeoffTemperature');
  private readonly takeoffUseRatSetting = this.toldSettingManager.getSetting('toldTakeoffUseRat');
  private readonly takeoffPressureSetting = this.toldSettingManager.getSetting('toldTakeoffPressure');
  private readonly takeoffPressureAltitudeSetting = this.toldSettingManager.getSetting('toldTakeoffPressureAltitude');
  private readonly takeoffFlapsIndexSetting = this.toldSettingManager.getSetting('toldTakeoffFlapsIndex');
  private readonly takeoffAntiIceOnSetting = this.toldSettingManager.getSetting('toldTakeoffAntiIceOn');
  private readonly takeoffThrustReverserSetting = this.toldSettingManager.getSetting('toldTakeoffThrustReversers');
  private readonly takeoffSpeedsAcceptedSetting = this.toldSettingManager.getSetting('toldTakeoffVSpeedsAccepted');

  private readonly destinationIcaoSetting = this.toldSettingManager.getSetting('toldDestinationIcao');
  private readonly landingWeightCanUsePredictedSetting = this.toldSettingManager.getSetting('toldLandingCanUsePredictedWeight');
  private readonly landingWeightUsePredictedSetting = this.toldSettingManager.getSetting('toldLandingUsePredictedWeight');
  private readonly landingWeightSetting = this.toldSettingManager.getSetting('toldLandingWeight');
  private readonly landingRunwaySurfaceSetting = this.toldSettingManager.getSetting('toldLandingRunwaySurface');
  private readonly landingTemperatureSetting = this.toldSettingManager.getSetting('toldLandingTemperature');
  private readonly landingPressureSetting = this.toldSettingManager.getSetting('toldLandingPressure');
  private readonly landingPressureAltitudeSetting = this.toldSettingManager.getSetting('toldLandingPressureAltitude');
  private readonly landingFlapsIndexSetting = this.toldSettingManager.getSetting('toldLandingFlapsIndex');
  private readonly landingAntiIceOnSetting = this.toldSettingManager.getSetting('toldLandingAntiIceOn');
  private readonly landingThrustReverserSetting = this.toldSettingManager.getSetting('toldLandingThrustReversers');
  private readonly landingSpeedsAcceptedSetting = this.toldSettingManager.getSetting('toldLandingVSpeedsAccepted');

  private readonly aircraftWeight = ConsumerSubject.create(null, -1);
  private readonly landingWeight = ConsumerSubject.create(null, -1);

  private readonly takeoffFlapsAngle = this.takeoffFlapsIndexSetting.map(index => {
    const flapsOption = this.config.takeoff.flaps?.options[index];

    if (!flapsOption) {
      return undefined;
    } else {
      return flapsOption.extension;
    }
  }).pause();

  private fplOriginIcao = '';
  private fplDestinationIcao = '';

  private readonly originAirport = Subject.create<AirportFacility | null>(null);
  private readonly originRunway = Subject.create<OneWayRunway | null>(null);
  private readonly originOpId = Subject.create(0);

  private readonly takeoffParams = {
    weight: UnitType.POUND.createNumber(NaN),
    runwayLength: UnitType.FOOT.createNumber(NaN),
    runwayElevation: UnitType.FOOT.createNumber(NaN),
    runwayHeading: NaN,
    runwayGradient: NaN,
    runwaySurface: ToldRunwaySurfaceCondition.Dry,
    windDirection: NaN,
    windSpeed: UnitType.KNOT.createNumber(NaN),
    temperature: UnitType.CELSIUS.createNumber(0),
    pressure: UnitType.HPA.createNumber(1013.25),
    pressureAltitude: UnitType.FOOT.createNumber(0),
    flaps: undefined as string | undefined,
    antiIceOn: undefined as boolean | undefined,
    thrustReversers: undefined as boolean | undefined,
    factor: 1,
    rolling: undefined as boolean | undefined,
    lineUp: undefined
  };
  private readonly takeoffResult: ToldTakeoffPerformanceResult = {
    runwayLengthAvailable: undefined,
    weight: undefined,
    pressure: undefined,
    pressureAltitude: undefined,
    temperature: undefined,
    headwind: undefined,
    crosswind: undefined,
    flaps: undefined,
    runwayLengthRequired: -1,
    maxRunwayWeight: -1,
    maxWeight: 0,
    minPressureAltitude: undefined,
    maxPressureAltitude: undefined,
    minTemperature: undefined,
    maxTemperature: undefined,
    maxHeadwind: undefined,
    maxTailwind: undefined,
    maxCrosswind: undefined,
    limitsExceeded: 0,
    vSpeeds: this.vSpeedSettingManager.vSpeedGroups.get(VSpeedGroupType.Takeoff)?.vSpeedDefinitions.map(def => {
      return {
        name: def.name,
        value: def.defaultValue
      };
    }) ?? []
  };
  private readonly lastCalculatedTakeoffResult: ToldTakeoffPerformanceResult = {
    runwayLengthAvailable: undefined,
    weight: undefined,
    pressure: undefined,
    pressureAltitude: undefined,
    temperature: undefined,
    headwind: undefined,
    crosswind: undefined,
    flaps: undefined,
    runwayLengthRequired: -1,
    maxRunwayWeight: -1,
    maxWeight: 0,
    minPressureAltitude: undefined,
    maxPressureAltitude: undefined,
    minTemperature: undefined,
    maxTemperature: undefined,
    maxHeadwind: undefined,
    maxTailwind: undefined,
    maxCrosswind: undefined,
    limitsExceeded: 0,
    vSpeeds: this.vSpeedSettingManager.vSpeedGroups.get(VSpeedGroupType.Takeoff)?.vSpeedDefinitions.map(def => {
      return {
        name: def.name,
        value: def.defaultValue
      };
    }) ?? []
  };
  private isTakeoffResultValid = false;

  private takeoffCalcRequestTime?: number;
  private takeoffUpdateRequestTime?: number;

  private readonly destinationAirport = Subject.create<AirportFacility | null>(null);
  private readonly destinationRunway = Subject.create<OneWayRunway | null>(null);
  private readonly destinationOpId = Subject.create(0);

  private readonly landingParams = {
    weight: UnitType.POUND.createNumber(NaN),
    runwayLength: UnitType.FOOT.createNumber(NaN),
    runwayElevation: UnitType.FOOT.createNumber(NaN),
    runwayHeading: NaN,
    runwayGradient: NaN,
    runwaySurface: ToldRunwaySurfaceCondition.Dry,
    windDirection: NaN,
    windSpeed: UnitType.KNOT.createNumber(NaN),
    temperature: UnitType.CELSIUS.createNumber(0),
    pressure: UnitType.HPA.createNumber(1013.25),
    pressureAltitude: UnitType.FOOT.createNumber(0),
    flaps: undefined as string | undefined,
    antiIceOn: undefined as boolean | undefined,
    thrustReversers: undefined as boolean | undefined,
    factor: 1,
    autothrottleOn: undefined as boolean | undefined
  };
  private readonly landingResult: ToldLandingPerformanceResult = {
    runwayLengthAvailable: undefined,
    weight: undefined,
    pressure: undefined,
    pressureAltitude: undefined,
    temperature: undefined,
    headwind: undefined,
    crosswind: undefined,
    flaps: undefined,
    runwayLengthRequiredRef: -1,
    runwayLengthRequiredRef10: undefined,
    maxRunwayWeight: -1,
    maxWeight: 0,
    minPressureAltitude: undefined,
    maxPressureAltitude: undefined,
    minTemperature: undefined,
    maxTemperature: undefined,
    maxHeadwind: undefined,
    maxTailwind: undefined,
    maxCrosswind: undefined,
    limitsExceeded: 0,
    vSpeeds: this.vSpeedSettingManager.vSpeedGroups.get(VSpeedGroupType.Landing)?.vSpeedDefinitions.map(def => {
      return {
        name: def.name,
        value: def.defaultValue
      };
    }) ?? []
  };
  private readonly lastCalculatedLandingResult: ToldLandingPerformanceResult = {
    runwayLengthAvailable: undefined,
    weight: undefined,
    pressure: undefined,
    pressureAltitude: undefined,
    temperature: undefined,
    headwind: undefined,
    crosswind: undefined,
    flaps: undefined,
    runwayLengthRequiredRef: -1,
    runwayLengthRequiredRef10: undefined,
    maxRunwayWeight: -1,
    maxWeight: 0,
    minPressureAltitude: undefined,
    maxPressureAltitude: undefined,
    minTemperature: undefined,
    maxTemperature: undefined,
    maxHeadwind: undefined,
    maxTailwind: undefined,
    maxCrosswind: undefined,
    limitsExceeded: 0,
    vSpeeds: this.vSpeedSettingManager.vSpeedGroups.get(VSpeedGroupType.Landing)?.vSpeedDefinitions.map(def => {
      return {
        name: def.name,
        value: def.defaultValue
      };
    }) ?? []
  };
  private isLandingResultValid = false;

  private landingCalcRequestTime?: number;
  private landingUpdateRequestTime?: number;

  private isAlive = true;
  private isInit = false;
  private isPaused = false;

  private fmsConfigMiscompareSub?: Subscription;
  private fplOriginDestSub?: Subscription;
  private fplProcDetailsSub?: Subscription;
  private originIcaoSub?: Subscription;
  private destinationIcaoSub?: Subscription;
  private useRatSub?: Subscription;
  private ratPipe?: Subscription;
  private takeoffWeightSub?: Subscription;
  private landingWeightCanUsePredictedState?: MappedSubscribable<boolean>;
  private landingWeightUsePredictedSub?: Subscription;
  private landingWeightCurrentSub?: Subscription;
  private landingWeightPredictedSub?: Subscription;
  private landingWeightDestinationIcaoSub?: Subscription;
  private takeoffPressurePipe?: Subscription;
  private takeoffAntiIceTemperatureState?: MappedSubscribable<readonly [boolean, number]>;
  private takeoffThrustReverserState?: MappedSubscribable<readonly [boolean, ToldRunwaySurfaceCondition, number?, boolean?]>;
  private landingAntiIceTemperatureState?: MappedSubscribable<readonly [boolean, number]>;
  private landingThrustReverserState?: MappedSubscribable<readonly [boolean, ToldRunwaySurfaceCondition, number?, boolean?]>;
  private takeoffSpeedsAcceptedSub?: Subscription;
  private landingSpeedsAcceptedSub?: Subscription;

  private loadEmergencyReturnSub?: Subscription;

  private updateSub?: Subscription;

  private readonly takeoffParamUpdateSubs: Subscription[] = [];
  private readonly takeoffCalcSubs: Subscription[] = [];
  private readonly takeoffCalcNotAcceptedSubs: Subscription[] = [];
  private readonly takeoffCalcAcceptedSubs: Subscription[] = [];
  private readonly takeoffUpdateSubs: Subscription[] = [];

  private readonly landingParamUpdateSubs: Subscription[] = [];
  private readonly landingCalcSubs: Subscription[] = [];
  private readonly landingCalcNotAcceptedSubs: Subscription[] = [];
  private readonly landingCalcAcceptedSubs: Subscription[] = [];
  private readonly landingUpdateSubs: Subscription[] = [];

  /**
   * Constructor.
   * @param bus The event bus.
   * @param facLoader The facility loader.
   * @param fms The FMS.
   * @param adcCount The number of ADC sensors available on the airplane.
   * @param config A TOLD performance calculations configuration object.
   * @param fmsVSpeedManager A manager of FMS-defined V-speed values.
   * @param vSpeedSettingManager A manager of reference V-speed user settings.
   */
  public constructor(
    private readonly bus: EventBus,
    private readonly facLoader: FacilityLoader,
    private readonly fms: Fms,
    private readonly adcCount: number,
    private readonly config: ToldConfig,
    private readonly fmsVSpeedManager: FmsVSpeedManager,
    private readonly vSpeedSettingManager: VSpeedUserSettingManager
  ) {
  }

  /**
   * Initializes this computer.
   * @param module The module to use with this computer.
   * @param paused Whether to initialize this computer as paused. Defaults to `false`.
   * @throws Error if this computer has been destroyed.
   */
  public init(module: ToldModule, paused = false): void {
    if (!this.isAlive) {
      throw new Error('ToldComputer: cannot initialize a dead computer');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    this.module = module;

    this.toldSettingManager.getSetting('toldDatabaseVersion').value = module.getDatabase().getVersionString();
    this.toldSettingManager.getSetting('toldEnabled').value = true;

    this.initDefaultSettings();

    this.initOriginDestAutoUpdateLogic();

    const sub = this.bus.getSubscriber<ClockEvents & AdcEvents & AdcSystemEvents & ControlSurfacesEvents & WeightFuelEvents & ToldControlEvents>();

    this.flapsLeftAngle.setConsumer(sub.on('flaps_left_angle'));
    this.flapsRightAngle.setConsumer(sub.on('flaps_right_angle'));
    this.isOnGround.setConsumer(sub.on('on_ground'));

    this.aircraftWeight.setConsumer(sub.on('weightfuel_aircraft_weight'));
    this.landingWeight.setConsumer(sub.on('weightfuel_landing_weight'));

    // Initialize RAT logic: choose the first ADC system that is working and grab RAT from that system.

    for (let i = 0; i < this.adcCount; i++) {
      this.adcStates[i] = ConsumerSubject.create(sub.on(`adc_state_${i + 1}`), { previous: undefined, current: undefined });
    }

    this.adcIndex = MappedSubject.create(
      (states: readonly AvionicsSystemStateEvent[]) => {
        for (let i = 0; i < states.length; i++) {
          const state = states[i];
          if (state.current === undefined || state.current === AvionicsSystemState.On) {
            return i + 1;
          }
        }

        return -1;
      },
      ...this.adcStates
    );

    this.adcIndex.sub(index => {
      if (index <= 0) {
        this.rat.setConsumer(null);
        this.takeoffUseRatSetting.value = false;
        this.toldSettingManager.getSetting('toldTakeoffCanUseRat').value = false;
      } else {
        this.rat.setConsumer(sub.on(`adc_ram_air_temp_c_${index}`));
        this.toldSettingManager.getSetting('toldTakeoffCanUseRat').value = true;
      }
    }, true);

    const ratPipe = this.ratPipe = this.rat.pipe(this.takeoffTemperatureSetting, rat => Math.round(rat), true);

    this.useRatSub = this.takeoffUseRatSetting.sub(useRat => {
      if (useRat) {
        ratPipe.resume(true);
      } else {
        ratPipe.pause();
      }
    }, true);

    // Initialize origin/dest logic.

    this.originIcaoSub = this.originIcaoSetting.sub(this.onOriginDestIcaoChanged.bind(
      this, this.originOpId, this.originIcaoSetting, this.originAirport, this.originRunway,
    ), true);

    this.destinationIcaoSub = this.destinationIcaoSetting.sub(this.onOriginDestIcaoChanged.bind(
      this, this.destinationOpId, this.destinationIcaoSetting, this.destinationAirport, this.destinationRunway,
    ), true);

    // Initialize runway logic.

    this.originRunway.sub(this.onRunwayChanged.bind(this, true), true);
    this.destinationRunway.sub(this.onRunwayChanged.bind(this, false), true);

    // Initialize pressure setting logic.

    // The MFD uses PFD 1's altimeter setting, no matter which ADC system we get data from, so we will just use
    // index 1.
    this.baroSetting.setConsumer(sub.on('adc_altimeter_baro_setting_inhg_1'));
    this.takeoffPressurePipe = this.baroSetting.pipe(this.takeoffPressureSetting, inHg => UnitType.IN_HG.convertTo(inHg, UnitType.HPA));

    // Initialize takeoff and landing anti-ice setting logic: force anti-ice setting to OFF if above maximum allowed temperature.

    if (this.config.takeoff.antiIce !== undefined) {
      this.takeoffAntiIceTemperatureState = MappedSubject.create(this.takeoffAntiIceOnSetting, this.takeoffTemperatureSetting);
      this.takeoffAntiIceTemperatureState.sub(([antiIceOn, temp]) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if (temp <= Number.MIN_SAFE_INTEGER || temp > this.config.takeoff.antiIce!.maxTemp.asUnit(UnitType.CELSIUS) && antiIceOn) {
          this.takeoffAntiIceOnSetting.value = false;
        }
      }, true);
    }

    if (this.config.landing.antiIce !== undefined) {
      this.landingAntiIceTemperatureState = MappedSubject.create(this.landingAntiIceOnSetting, this.landingTemperatureSetting);
      this.landingAntiIceTemperatureState.sub(([antiIceOn, temp]) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if (temp <= Number.MIN_SAFE_INTEGER || temp > this.config.landing.antiIce!.maxTemp.asUnit(UnitType.CELSIUS) && antiIceOn) {
          this.landingAntiIceOnSetting.value = false;
        }
      }, true);
    }

    // Initialize takeoff and landing thrust reverser setting logic: if only one thrust reverser setting is selectable, force
    // the selection to that setting.

    if (this.config.takeoff.thrustReverser !== undefined) {
      const checker = this.config.takeoff.thrustReverser.selectable.resolve();

      this.takeoffThrustReverserState = MappedSubject.create(
        this.takeoffThrustReverserSetting,
        this.takeoffRunwaySurfaceSetting,
        this.config.takeoff.flaps === undefined ? Subject.create(undefined) : this.takeoffFlapsIndexSetting,
        this.config.takeoff.antiIce === undefined ? Subject.create(undefined) : this.takeoffAntiIceOnSetting
      );

      this.takeoffThrustReverserState.sub(([reverserOn, surface, flapsIndex, antiIceOn]) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const selectable = checker(surface, flapsIndex === undefined ? undefined : this.config.takeoff.flaps!.options[flapsIndex]?.name, antiIceOn);
        if (reverserOn && selectable === ToldThrustReverserSelectable.OnlyFalse) {
          this.takeoffThrustReverserSetting.value = false;
        } else if (!reverserOn && selectable === ToldThrustReverserSelectable.OnlyTrue) {
          this.takeoffThrustReverserSetting.value = true;
        }
      }, true);
    }

    if (this.config.landing.thrustReverser !== undefined) {
      const checker = this.config.landing.thrustReverser.selectable.resolve();

      this.landingThrustReverserState = MappedSubject.create(
        this.landingThrustReverserSetting,
        this.landingRunwaySurfaceSetting,
        this.config.landing.flaps === undefined ? Subject.create(undefined) : this.landingFlapsIndexSetting,
        this.config.landing.antiIce === undefined ? Subject.create(undefined) : this.landingAntiIceOnSetting
      );

      this.landingThrustReverserState.sub(([reverserOn, surface, flapsIndex, antiIceOn]) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const selectable = checker(surface, flapsIndex === undefined ? undefined : this.config.landing.flaps!.options[flapsIndex]?.name, antiIceOn);
        if (reverserOn && selectable === ToldThrustReverserSelectable.OnlyFalse) {
          this.landingThrustReverserSetting.value = false;
        } else if (!reverserOn && selectable === ToldThrustReverserSelectable.OnlyTrue) {
          this.landingThrustReverserSetting.value = true;
        }
      }, true);
    }

    this.initTakeoffConfigLogic();
    this.initWeightLogic();

    this.initTakeoffParamUpdateListeners();
    this.initTakeoffCalcListeners();
    this.initTakeoffUpdateListeners();

    this.initLandingParamUpdateListeners();
    this.initLandingCalcListeners();
    this.initLandingUpdateListeners();

    this.takeoffSpeedsAcceptedSub = this.takeoffSpeedsAcceptedSetting.sub(this.onTakeoffSpeedsAccepted.bind(this), true);
    this.landingSpeedsAcceptedSub = this.landingSpeedsAcceptedSetting.sub(this.onLandingSpeedsAccepted.bind(this), true);

    this.loadEmergencyReturnSub = sub.on('told_load_emergency_return').handle(this.loadEmergencyReturn.bind(this));

    this.updateSub = sub.on('realTime').handle(this.update.bind(this));

    if (paused) {
      this.pause();
    }
  }

  /**
   * Initializes settings with default values.
   */
  private initDefaultSettings(): void {
    const takeoffOptions = this.config.takeoff;

    if (takeoffOptions.flaps !== undefined) {
      const takeoffFlapsDefault = this.toldSettingManager.getSetting('toldTakeoffFlapsIndexDefault');
      if (takeoffFlapsDefault.value < 0 || takeoffFlapsDefault.value >= takeoffOptions.flaps.options.length) {
        takeoffFlapsDefault.value = takeoffOptions.flaps.defaultIndex;
      }

      this.takeoffFlapsIndexSetting.value = takeoffFlapsDefault.value;
    }

    if (takeoffOptions.rolling !== undefined) {
      const rollingDefault = this.toldSettingManager.getSetting('toldTakeoffRollingDefault');
      if (rollingDefault.value < 0) {
        rollingDefault.value = takeoffOptions.rolling.defaultOption ? 1 : 0;
      }

      this.toldSettingManager.getSetting('toldTakeoffRolling').value = rollingDefault.value === 1;
    }

    const landingOptions = this.config.landing;

    if (landingOptions.flaps !== undefined) {
      const landingFlapsDefault = this.toldSettingManager.getSetting('toldLandingFlapsIndexDefault');
      if (landingFlapsDefault.value < 0 || landingFlapsDefault.value >= landingOptions.flaps.options.length) {
        landingFlapsDefault.value = landingOptions.flaps.defaultIndex;
      }

      this.landingFlapsIndexSetting.value = landingFlapsDefault.value;
    }

    const landingFactorDefault = this.toldSettingManager.getSetting('toldLandingFactorDefault');
    if (landingFactorDefault.value < 0) {
      landingFactorDefault.value = 100;
    }

    this.toldSettingManager.getSetting('toldLandingFactor').value = landingFactorDefault.value;
  }

  /**
   * Initializes the logic that automatically updates the TOLD origin and destination settings based on the primary
   * flight plan origin and destination.
   */
  private initOriginDestAutoUpdateLogic(): void {
    this.onFlightPlanOriginDestChanged();

    const sub = this.bus.getSubscriber<FlightPlannerEvents>();

    this.fplOriginDestSub = sub.on('fplOriginDestChanged').handle(e => {
      if (e.planIndex === Fms.PRIMARY_PLAN_INDEX) {
        this.onFlightPlanOriginDestChanged();
      }
    });

    this.fplProcDetailsSub = sub.on('fplProcDetailsChanged').handle(e => {
      if (e.planIndex === Fms.PRIMARY_PLAN_INDEX) {
        this.onFlightPlanOriginDestChanged();
      }
    });
  }

  /**
   * Initializes the logic that updates the takeoff configuration miscompare flag.
   */
  private initTakeoffConfigLogic(): void {
    const vSpeedFmsConfigMiscompareSettings = this.vSpeedSettingManager.vSpeedGroups.get(VSpeedGroupType.Takeoff)?.vSpeedDefinitions.map(def => {
      return this.vSpeedSettingManager.getSetting(`vSpeedFmsConfigMiscompare_${def.name}`);
    });

    if (!vSpeedFmsConfigMiscompareSettings || vSpeedFmsConfigMiscompareSettings.length === 0) {
      return;
    }

    this.takeoffFlapsAngle.resume();

    const isMiscompare = MappedSubject.create(
      ([configuredAngle, leftAngle, rightAngle, isOnGround]) => {
        return configuredAngle !== undefined && isOnGround && (
          Math.abs(leftAngle - configuredAngle) > ToldComputer.FLAPS_ANGLE_TOLERANCE
          || Math.abs(rightAngle - configuredAngle) > ToldComputer.FLAPS_ANGLE_TOLERANCE
        );
      },
      this.takeoffFlapsAngle,
      this.flapsLeftAngle,
      this.flapsRightAngle,
      this.isOnGround
    );

    this.fmsConfigMiscompareSub = isMiscompare.sub(miscompare => {
      for (let i = 0; i < vSpeedFmsConfigMiscompareSettings.length; i++) {
        vSpeedFmsConfigMiscompareSettings[i].value = miscompare;
      }
    }, true);
  }

  /**
   * Initializes the logic that updates takeoff and landing weights.
   */
  private initWeightLogic(): void {
    // Takeoff weight.

    this.takeoffWeightSub = this.aircraftWeight.sub(weight => {
      if (weight < 0) {
        this.takeoffWeightSetting.value = -1;
      } else {
        const currentTakeoffWeight = this.takeoffWeightSetting.value;
        if (currentTakeoffWeight < 0 || Math.abs(weight - currentTakeoffWeight) >= 10) {
          this.takeoffWeightSetting.value = weight;
        }
      }
    }, true);

    // Landing weight.

    this.landingWeightCanUsePredictedState = this.landingWeight.map(weight => weight >= 0);
    this.landingWeightCanUsePredictedState.sub(canUse => {
      this.landingWeightCanUsePredictedSetting.value = canUse;
      if (!canUse) {
        this.landingWeightUsePredictedSetting.value = false;
      }
    }, true);

    const landingWeightCurrentSub = this.landingWeightCurrentSub = this.aircraftWeight.sub(weight => {
      if (weight < 0) {
        this.landingWeightSetting.value = -1;
      } else {
        const currentLandingWeight = this.landingWeightSetting.value;
        if (currentLandingWeight < 0 || Math.abs(weight - currentLandingWeight) >= 10) {
          this.landingWeightSetting.value = weight;
        }
      }
    }, false, true);

    const landingWeightPredictedSub = this.landingWeightPredictedSub = this.landingWeight.sub(weight => {
      if (weight < 0) {
        this.landingWeightSetting.value = -1;
      } else {
        const currentLandingWeight = this.landingWeightSetting.value;
        if (currentLandingWeight < 0 || Math.abs(weight - currentLandingWeight) >= 10) {
          this.landingWeightSetting.value = weight;
        }
      }
    }, false, true);

    this.landingWeightUsePredictedSub = this.landingWeightUsePredictedSetting.sub(usePredicted => {
      if (usePredicted) {
        landingWeightCurrentSub.pause();
        landingWeightPredictedSub.resume(true);
      } else {
        landingWeightPredictedSub.pause();
        landingWeightCurrentSub.resume(true);
      }
    }, true);

    this.landingWeightDestinationIcaoSub = this.destinationAirport.sub(airport => {
      const flightPlanDestination = this.fms.hasPrimaryFlightPlan() ? this.fms.getPrimaryFlightPlan().destinationAirport : undefined;

      if (this.landingWeightCanUsePredictedSetting.value && flightPlanDestination !== undefined && airport !== null && flightPlanDestination === airport.icao) {
        this.landingWeightUsePredictedSetting.value = true;
      } else {
        this.landingWeightUsePredictedSetting.value = false;
      }
    });
  }

  /**
   * Initializes the listeners that update the takeoff performance calculation parameters.
   */
  private initTakeoffParamUpdateListeners(): void {
    this.takeoffParamUpdateSubs.push(
      this.takeoffWeightSetting.sub(weight => {
        this.takeoffParams.weight.set(weight < 0 ? NaN : weight);
      }, true),
      this.takeoffRunwaySurfaceSetting.sub(surface => {
        this.takeoffParams.runwaySurface = surface;
      }, true),
      this.toldSettingManager.getSetting('toldTakeoffWindDirection').sub(heading => {
        this.takeoffParams.windDirection = heading < 0 ? NaN : heading;
      }, true),
      this.toldSettingManager.getSetting('toldTakeoffWindSpeed').sub(speed => {
        this.takeoffParams.windSpeed.set(speed < 0 ? NaN : speed);
      }, true),
      this.takeoffTemperatureSetting.sub(temperature => {
        this.takeoffParams.temperature.set(temperature <= Number.MIN_SAFE_INTEGER ? NaN : temperature);
      }, true),
      this.takeoffPressureSetting.sub(pressure => {
        pressure = pressure < 0 ? NaN : pressure;

        this.takeoffParams.pressure.set(pressure);

        const pressureAlt = ToldComputer.getRunwayPressureAltitude(this.takeoffParams.runwayElevation.number, pressure);
        this.takeoffPressureAltitudeSetting.value = pressureAlt;
        this.takeoffParams.pressureAltitude.set(pressureAlt);
      }, true),
      this.toldSettingManager.getSetting('toldTakeoffRunwayLength').sub(length => {
        this.takeoffParams.runwayLength.set(length < 0 ? NaN : length);
      }, true),
      this.toldSettingManager.getSetting('toldTakeoffRunwayElevation').sub(elevation => {
        this.takeoffParams.runwayElevation.set(elevation <= Number.MIN_SAFE_INTEGER ? NaN : elevation);

        let pressure = this.takeoffParams.pressure.number;
        pressure = pressure < 0 ? NaN : pressure;

        const pressureAlt = ToldComputer.getRunwayPressureAltitude(this.takeoffParams.runwayElevation.number, pressure);
        this.takeoffPressureAltitudeSetting.value = pressureAlt;
        this.takeoffParams.pressureAltitude.set(pressureAlt);
      }, true),
      this.toldSettingManager.getSetting('toldTakeoffRunwayHeading').sub(heading => {
        this.takeoffParams.runwayHeading = heading < 0 ? NaN : heading;
      }, true),
      this.toldSettingManager.getSetting('toldTakeoffRunwayGradient').sub(gradient => {
        this.takeoffParams.runwayGradient = gradient === Number.MIN_SAFE_INTEGER ? NaN : gradient / 100;
      }, true),
      this.toldSettingManager.getSetting('toldTakeoffFactor').sub(factor => {
        this.takeoffParams.factor = factor / 100;
      }, true)
    );

    if (this.config.takeoff.flaps !== undefined) {
      this.takeoffCalcSubs.push(this.takeoffFlapsIndexSetting.sub(index => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.takeoffParams.flaps = this.config.takeoff.flaps!.options[index]?.name ?? '';
      }, true));
    }

    if (this.config.takeoff.antiIce !== undefined) {
      this.takeoffCalcSubs.push(this.takeoffAntiIceOnSetting.sub(value => {
        this.takeoffParams.antiIceOn = value;
      }, true));
    }

    if (this.config.takeoff.thrustReverser !== undefined) {
      this.takeoffCalcSubs.push(this.takeoffThrustReverserSetting.sub(value => {
        this.takeoffParams.thrustReversers = value;
      }, true));
    }

    if (this.config.takeoff.rolling !== undefined) {
      this.takeoffCalcSubs.push(this.toldSettingManager.getSetting('toldTakeoffRolling').sub(value => {
        this.takeoffParams.rolling = value;
      }, true));
    }
  }

  /**
   * Initializes the listeners that determine when takeoff performance calculations need to be invalidated and
   * re-calculated.
   */
  private initTakeoffCalcListeners(): void {
    // ---- Changes that will always invalidate takeoff calculations ----

    const requestTakeoffCalc = (): void => { this.takeoffCalcRequestTime = Date.now(); };

    this.takeoffCalcSubs.push(
      this.toldSettingManager.getSetting('toldOriginIcao').sub(requestTakeoffCalc),
      this.toldSettingManager.getSetting('toldTakeoffRunwaySurface').sub(requestTakeoffCalc),
      this.toldSettingManager.getSetting('toldTakeoffWindDirection').sub(requestTakeoffCalc),
      this.toldSettingManager.getSetting('toldTakeoffWindSpeed').sub(requestTakeoffCalc),
      this.toldSettingManager.getSetting('toldTakeoffRunwayLength').sub(requestTakeoffCalc),
      this.toldSettingManager.getSetting('toldTakeoffRunwayElevation').sub(requestTakeoffCalc),
      this.toldSettingManager.getSetting('toldTakeoffRunwayHeading').sub(requestTakeoffCalc),
      this.toldSettingManager.getSetting('toldTakeoffRunwayGradient').sub(requestTakeoffCalc),
      this.toldSettingManager.getSetting('toldTakeoffFactor').sub(requestTakeoffCalc)
    );

    if (this.config.takeoff.flaps !== undefined) {
      this.takeoffCalcSubs.push(this.takeoffFlapsIndexSetting.sub(requestTakeoffCalc));
    }

    if (this.config.takeoff.antiIce !== undefined) {
      this.takeoffCalcSubs.push(this.takeoffAntiIceOnSetting.sub(requestTakeoffCalc));
    }

    if (this.config.takeoff.thrustReverser !== undefined) {
      this.takeoffCalcSubs.push(this.takeoffThrustReverserSetting.sub(requestTakeoffCalc));
    }

    if (this.config.takeoff.rolling !== undefined) {
      this.takeoffCalcSubs.push(this.toldSettingManager.getSetting('toldTakeoffRolling').sub(requestTakeoffCalc));
    }

    // ---- Changes that will invalidate takeoff calculations if V-speeds have not yet been accepted ----

    this.takeoffCalcNotAcceptedSubs.push(
      this.takeoffWeightSetting.sub(requestTakeoffCalc, false, true),
      this.takeoffTemperatureSetting.sub(requestTakeoffCalc, false, true),
      this.takeoffPressureSetting.sub(requestTakeoffCalc, false, true),
    );

    // ---- Changes that will invalidate takeoff calculations if V-speeds have been accepted ----

    this.takeoffCalcAcceptedSubs.push(
      this.takeoffTemperatureSetting.sub(() => {
        if (!this.takeoffUseRatSetting.value) {
          requestTakeoffCalc();
        }
      }, false, true),
      this.weightFuelSettingManager.getSetting('weightFuelZeroFuel').sub(requestTakeoffCalc, false, true)
    );
  }

  /**
   * Initializes the listeners that determine when takeoff performance calculations need to be updated after the user
   * has accepted takeoff V-speeds.
   */
  private initTakeoffUpdateListeners(): void {
    // ---- Changes that will always invalidate takeoff calculations ----

    const requestTakeoffUpdate = (): void => { this.takeoffUpdateRequestTime = Date.now(); };

    this.takeoffUpdateSubs.push(
      this.takeoffWeightSetting.sub(requestTakeoffUpdate, false, true),
      this.takeoffPressureSetting.sub(requestTakeoffUpdate, false, true),
      this.takeoffTemperatureSetting.sub(() => {
        if (this.takeoffUseRatSetting.value) {
          requestTakeoffUpdate();
        }
      }, false, true),
    );
  }

  /**
   * Initializes the listeners that update the landing performance calculation parameters.
   */
  private initLandingParamUpdateListeners(): void {
    this.landingParamUpdateSubs.push(
      this.landingWeightSetting.sub(weight => {
        this.landingParams.weight.set(weight < 0 ? NaN : weight);
      }, true),
      this.landingRunwaySurfaceSetting.sub(surface => {
        this.landingParams.runwaySurface = surface;
      }, true),
      this.toldSettingManager.getSetting('toldLandingWindDirection').sub(heading => {
        this.landingParams.windDirection = heading < 0 ? NaN : heading;
      }, true),
      this.toldSettingManager.getSetting('toldLandingWindSpeed').sub(speed => {
        this.landingParams.windSpeed.set(speed < 0 ? NaN : speed);
      }, true),
      this.landingTemperatureSetting.sub(temperature => {
        this.landingParams.temperature.set(temperature <= Number.MIN_SAFE_INTEGER ? NaN : temperature);
      }, true),
      this.landingPressureSetting.sub(pressure => {
        pressure = pressure < 0 ? NaN : pressure;

        this.landingParams.pressure.set(pressure);

        const pressureAlt = ToldComputer.getRunwayPressureAltitude(this.landingParams.runwayElevation.number, pressure);
        this.landingPressureAltitudeSetting.value = pressureAlt;
        this.landingParams.pressureAltitude.set(pressureAlt);
      }, true),
      this.toldSettingManager.getSetting('toldLandingRunwayLength').sub(length => {
        this.landingParams.runwayLength.set(length < 0 ? NaN : length);
      }, true),
      this.toldSettingManager.getSetting('toldLandingRunwayElevation').sub(elevation => {
        this.landingParams.runwayElevation.set(elevation <= Number.MIN_SAFE_INTEGER ? NaN : elevation);

        let pressure = this.landingParams.pressure.number;
        pressure = pressure < 0 ? NaN : pressure;

        const pressureAlt = ToldComputer.getRunwayPressureAltitude(this.landingParams.runwayElevation.number, pressure);
        this.landingPressureAltitudeSetting.value = pressureAlt;
        this.landingParams.pressureAltitude.set(pressureAlt);
      }, true),
      this.toldSettingManager.getSetting('toldLandingRunwayHeading').sub(heading => {
        this.landingParams.runwayHeading = heading < 0 ? NaN : heading;
      }, true),
      this.toldSettingManager.getSetting('toldLandingRunwayGradient').sub(gradient => {
        this.landingParams.runwayGradient = gradient === Number.MIN_SAFE_INTEGER ? NaN : gradient / 100;
      }, true),
      this.toldSettingManager.getSetting('toldLandingFactor').sub(factor => {
        this.landingParams.factor = factor / 100;
      }, true)
    );

    if (this.config.landing.flaps !== undefined) {
      this.landingCalcSubs.push(this.takeoffFlapsIndexSetting.sub(index => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.landingParams.flaps = this.config.takeoff.flaps!.options[index]?.name ?? '';
      }, true));
    }

    if (this.config.landing.antiIce !== undefined) {
      this.landingCalcSubs.push(this.takeoffAntiIceOnSetting.sub(value => {
        this.landingParams.antiIceOn = value;
      }, true));
    }

    if (this.config.landing.thrustReverser !== undefined) {
      this.landingCalcSubs.push(this.takeoffThrustReverserSetting.sub(value => {
        this.landingParams.thrustReversers = value;
      }, true));
    }

    if (this.config.landing.autothrottle !== undefined) {
      this.landingCalcSubs.push(this.toldSettingManager.getSetting('toldLandingAutothrottleOn').sub(value => {
        this.landingParams.autothrottleOn = value;
      }, true));
    }
  }

  /**
   * Initializes the listeners that determine when landing performance calculations need to be invalidated and
   * re-calculated.
   */
  private initLandingCalcListeners(): void {
    // ---- Changes that will always invalidate landing calculations ----

    const requestLandingCalc = (): void => { this.landingCalcRequestTime = Date.now(); };

    this.landingCalcSubs.push(
      this.toldSettingManager.getSetting('toldDestinationIcao').sub(requestLandingCalc),
      this.toldSettingManager.getSetting('toldLandingRunwaySurface').sub(requestLandingCalc),
      this.toldSettingManager.getSetting('toldLandingWindDirection').sub(requestLandingCalc),
      this.toldSettingManager.getSetting('toldLandingWindSpeed').sub(requestLandingCalc),
      this.toldSettingManager.getSetting('toldLandingTemperature').sub(requestLandingCalc),
      this.toldSettingManager.getSetting('toldLandingPressure').sub(requestLandingCalc),
      this.toldSettingManager.getSetting('toldLandingRunwayLength').sub(requestLandingCalc),
      this.toldSettingManager.getSetting('toldLandingRunwayElevation').sub(requestLandingCalc),
      this.toldSettingManager.getSetting('toldLandingRunwayHeading').sub(requestLandingCalc),
      this.toldSettingManager.getSetting('toldLandingRunwayGradient').sub(requestLandingCalc),
      this.toldSettingManager.getSetting('toldLandingFactor').sub(requestLandingCalc)
    );

    if (this.config.landing.flaps !== undefined) {
      this.landingCalcSubs.push(this.landingFlapsIndexSetting.sub(requestLandingCalc));
    }

    if (this.config.landing.antiIce !== undefined) {
      this.landingCalcSubs.push(this.landingAntiIceOnSetting.sub(requestLandingCalc));
    }

    if (this.config.landing.thrustReverser !== undefined) {
      this.landingCalcSubs.push(this.landingThrustReverserSetting.sub(requestLandingCalc));
    }

    if (this.config.landing.autothrottle !== undefined) {
      this.landingCalcSubs.push(this.toldSettingManager.getSetting('toldLandingAutothrottleOn').sub(requestLandingCalc));
    }

    // ---- Changes that will invalidate landing calculations if V-speeds have not yet been accepted ----

    this.landingCalcNotAcceptedSubs.push(
      this.takeoffWeightSetting.sub(requestLandingCalc, false, true)
    );

    // ---- Changes that will invalidate landing calculations if V-speeds have been accepted ----

    this.landingCalcAcceptedSubs.push(
      this.weightFuelSettingManager.getSetting('weightFuelZeroFuel').sub(requestLandingCalc, false, true)
    );
  }

  /**
   * Initializes the listeners that determine when landing performance calculations need to be updated after the user
   * has accepted landing V-speeds.
   */
  private initLandingUpdateListeners(): void {
    // ---- Changes that will always invalidate takeoff calculations ----

    const requestLandingUpdate = (): void => { this.landingUpdateRequestTime = Date.now(); };

    this.landingUpdateSubs.push(
      this.takeoffWeightSetting.sub(requestLandingUpdate, false, true)
    );
  }

  /**
   * Resumes this computer. Once resumed, this computer will perform calculations and updates as necessary until it is
   * paused or destroyed.
   * @throws Error if this computer has been destroyed.
   */
  public resume(): void {
    if (!this.isAlive) {
      throw new Error('ToldComputer: cannot resume a dead computer');
    }

    if (!this.isInit || !this.isPaused) {
      return;
    }

    this.isPaused = false;

    this.rat.resume();
    this.baroSetting.resume();
    this.flapsLeftAngle.resume();
    this.flapsRightAngle.resume();
    this.isOnGround.resume();
    this.aircraftWeight.resume();
    this.landingWeight.resume();

    this.takeoffFlapsAngle.resume();

    this.fmsConfigMiscompareSub?.resume(true);
    this.onFlightPlanOriginDestChanged();
    this.fplOriginDestSub?.resume();
    this.fplProcDetailsSub?.resume();
    this.originIcaoSub?.resume(true);
    this.destinationIcaoSub?.resume(true);
    this.useRatSub?.resume(true);
    this.takeoffWeightSub?.resume(true);
    this.landingWeightCanUsePredictedState?.resume();
    this.landingWeightUsePredictedSub?.resume(true);
    this.landingWeightDestinationIcaoSub?.resume();
    this.takeoffPressurePipe?.resume(true);
    this.takeoffAntiIceTemperatureState?.resume();
    this.takeoffThrustReverserState?.resume();
    this.landingAntiIceTemperatureState?.resume();
    this.landingThrustReverserState?.resume();
    this.takeoffSpeedsAcceptedSub?.resume(true);
    this.landingSpeedsAcceptedSub?.resume(true);
    this.loadEmergencyReturnSub?.resume();
    this.updateSub?.resume(true);
  }

  /**
   * Pauses this computer. Once paused, this computer will not perform any calculations or updates until it is resumed.
   * @throws Error if this computer has been destroyed.
   */
  public pause(): void {
    if (!this.isAlive) {
      throw new Error('ToldComputer: cannot pause a dead computer');
    }

    if (!this.isInit || this.isPaused) {
      return;
    }

    this.isPaused = true;

    this.rat.pause();
    this.baroSetting.pause();
    this.flapsLeftAngle.pause();
    this.flapsRightAngle.pause();
    this.isOnGround.pause();
    this.aircraftWeight.pause();
    this.landingWeight.pause();

    this.takeoffFlapsAngle.pause();

    this.fmsConfigMiscompareSub?.pause();
    this.fplOriginDestSub?.pause();
    this.fplProcDetailsSub?.pause();
    this.originIcaoSub?.pause();
    this.destinationIcaoSub?.pause();
    this.useRatSub?.pause();
    this.ratPipe?.pause();
    this.takeoffWeightSub?.pause();
    this.landingWeightCanUsePredictedState?.pause();
    this.landingWeightUsePredictedSub?.pause();
    this.landingWeightCurrentSub?.pause();
    this.landingWeightPredictedSub?.pause();
    this.landingWeightDestinationIcaoSub?.pause();
    this.takeoffPressurePipe?.pause();
    this.takeoffAntiIceTemperatureState?.pause();
    this.takeoffThrustReverserState?.pause();
    this.landingAntiIceTemperatureState?.pause();
    this.landingThrustReverserState?.pause();
    this.takeoffSpeedsAcceptedSub?.pause();
    this.landingSpeedsAcceptedSub?.pause();
    this.loadEmergencyReturnSub?.pause();
    this.updateSub?.pause();
  }

  /**
   * Resets this computer. Clears any accepted FMS V-speed values and reverts all user-controllable TOLD settings to
   * their defaults. Has no effect if this computer is not initialized.
   * @throws Error if this computer has been destroyed.
   */
  public reset(): void {
    if (!this.isAlive) {
      throw new Error('ToldComputer: cannot reset a dead computer');
    }

    if (!this.isInit) {
      return;
    }

    this.takeoffSpeedsAcceptedSetting.value = false;
    this.landingSpeedsAcceptedSetting.value = false;

    this.initDefaultSettings();

    this.toldSettingManager.getSetting('toldOriginIcao').resetToDefault();
    this.toldSettingManager.getSetting('toldTakeoffRunwaySurface').resetToDefault();
    this.toldSettingManager.getSetting('toldTakeoffWindDirection').resetToDefault();
    this.toldSettingManager.getSetting('toldTakeoffWindSpeed').resetToDefault();
    this.toldSettingManager.getSetting('toldTakeoffTemperature').resetToDefault();
    this.toldSettingManager.getSetting('toldTakeoffUseRat').resetToDefault();
    this.toldSettingManager.getSetting('toldTakeoffAntiIceOn').resetToDefault();
    this.toldSettingManager.getSetting('toldTakeoffThrustReversers').resetToDefault();

    this.toldSettingManager.getSetting('toldDestinationDefaultApplied').resetToDefault();
    this.toldSettingManager.getSetting('toldDestinationIcao').resetToDefault();
    this.toldSettingManager.getSetting('toldLandingUsePredictedWeight').resetToDefault();
    this.toldSettingManager.getSetting('toldLandingRunwaySurface').resetToDefault();
    this.toldSettingManager.getSetting('toldLandingWindDirection').resetToDefault();
    this.toldSettingManager.getSetting('toldLandingWindSpeed').resetToDefault();
    this.toldSettingManager.getSetting('toldLandingTemperature').resetToDefault();
    this.toldSettingManager.getSetting('toldLandingPressure').resetToDefault();
    this.toldSettingManager.getSetting('toldLandingAntiIceOn').resetToDefault();
    this.toldSettingManager.getSetting('toldLandingThrustReversers').resetToDefault();
    this.toldSettingManager.getSetting('toldLandingAutothrottleOn').resetToDefault();
  }

  /**
   * Responds to when the origin or destination of the primary flight plan changes.
   */
  private onFlightPlanOriginDestChanged(): void {
    if (!this.fms.hasPrimaryFlightPlan()) {
      return;
    }

    const plan = this.fms.getPrimaryFlightPlan();

    // ---- Origin ----

    const originAirportIcao = plan.originAirport;
    const originRunway = plan.procedureDetails.originRunway;

    let originIcao = '';

    if (originAirportIcao !== undefined && ICAO.isFacility(originAirportIcao, FacilityType.Airport)) {
      if (originRunway !== undefined) {
        originIcao = RunwayUtils.getRunwayFacilityIcao(originAirportIcao, originRunway);
      } else {
        originIcao = originAirportIcao;
      }
    }

    if (originIcao !== this.fplOriginIcao) {
      this.fplOriginIcao = originIcao;

      if (ICAO.isFacility(originIcao)) {
        this.originIcaoSetting.value = originIcao;
      }
    }

    // ---- Destination ----

    const destinationAirportIcao = plan.destinationAirport;
    const destinationRunway = plan.procedureDetails.destinationRunway;

    let destinationIcao = '';

    if (destinationAirportIcao !== undefined && ICAO.isFacility(destinationAirportIcao, FacilityType.Airport)) {
      if (destinationRunway !== undefined) {
        destinationIcao = RunwayUtils.getRunwayFacilityIcao(destinationAirportIcao, destinationRunway);
      } else {
        destinationIcao = destinationAirportIcao;
      }
    }

    if (destinationIcao !== this.fplDestinationIcao) {
      this.fplDestinationIcao = destinationIcao;

      if (ICAO.isFacility(destinationIcao)) {
        this.destinationIcaoSetting.value = destinationIcao;
      }
    }
  }

  /**
   * Responds to when the origin/destination ICAO changes.
   * @param opIdSubject A subject containing the current operation ID for responding to the ICAO change.
   * @param setting The ICAO setting.
   * @param airportSubject The airport subject associated with the ICAO.
   * @param runwaySubject The runway subject associated with the ICAO.
   * @param icao The new origin/destination ICAO.
   */
  private async onOriginDestIcaoChanged(
    opIdSubject: Subject<number>,
    setting: UserSetting<string>,
    airportSubject: Subject<AirportFacility | null>,
    runwaySubject: Subject<OneWayRunway | null>,
    icao: string,
  ): Promise<void> {
    const airport = airportSubject.get();

    const isRunway = ICAO.isFacility(icao, FacilityType.RWY);
    const isAirport = !isRunway && ICAO.isFacility(icao, FacilityType.Airport);

    if (!isRunway && !isAirport) {
      airportSubject.set(null);
      runwaySubject.set(null);
      return;
    }

    const airportIcao = isAirport ? icao : `A      ${ICAO.getAssociatedAirportIdent(icao)}`.padEnd(12, ' ');
    let airportFacility: AirportFacility;

    if (airport?.icao !== airportIcao) {
      const opId = opIdSubject.get() + 1;
      opIdSubject.set(opId);

      try {
        airportFacility = await this.facLoader.getFacility(FacilityType.Airport, airportIcao);

        if (opId !== opIdSubject.get()) {
          return;
        }

        airportSubject.set(airportFacility);
      } catch {
        console.warn(`ToldComputer: could not retrieve airport facility for ICAO: ${icao}`);

        if (opId !== opIdSubject.get()) {
          return;
        }

        setting.value = '';
        return;
      }
    } else {
      airportFacility = airport;
    }

    if (isRunway) {
      const runway = RunwayUtils.matchOneWayRunwayFromIdent(airportFacility, ICAO.getIdent(icao));
      if (runway === undefined) {
        console.warn(`ToldComputer: could not retrieve runway for ICAO: ${icao}`);
        setting.value = airportFacility.icao;
      } else {
        runwaySubject.set(runway);
      }
    } else {
      runwaySubject.set(null);
    }
  }

  /**
   * Responds to when a takeoff/landing runway changes.
   *
   * If the new runway is `null`, then the associated runway parameters are reset to their uninitialized states. If the
   * new runway is not `null`, then the associated runway parameters are loaded from the database values for the
   * runway.
   * @param isTakeoff Whether the changed runway was the takeoff runway.
   * @param runway The new runway.
   */
  private onRunwayChanged(isTakeoff: boolean, runway: OneWayRunway | null): void {
    const settingString = isTakeoff ? 'Takeoff' : 'Landing';

    const lengthSetting = this.toldSettingManager.getSetting(`told${settingString}RunwayLength`);
    const elevationSetting = this.toldSettingManager.getSetting(`told${settingString}RunwayElevation`);
    const headingSetting = this.toldSettingManager.getSetting(`told${settingString}RunwayHeading`);
    const gradientSetting = this.toldSettingManager.getSetting(`told${settingString}RunwayGradient`);

    if (runway === null) {
      lengthSetting.value = -1;
      elevationSetting.value = Number.MIN_SAFE_INTEGER;
      headingSetting.value = -1;
      gradientSetting.value = Number.MIN_SAFE_INTEGER;
    } else {
      lengthSetting.value = UnitType.METER.convertTo(runway.length - (isTakeoff ? 0 : runway.startThresholdLength), UnitType.FOOT);
      elevationSetting.value = UnitType.METER.convertTo(runway.elevation, UnitType.FOOT);
      headingSetting.value = runway.course;
      gradientSetting.value = runway.gradient * 100;
    }
  }

  /**
   * Responds to when the takeoff V-speeds accepted setting changes.
   * @param accepted Whether the takeoff V-speeds have been accepted.
   */
  private onTakeoffSpeedsAccepted(accepted: boolean): void {
    if (accepted) {
      if (this.isTakeoffResultValid) {
        this.setFmsTakeoffSpeeds(this.lastCalculatedTakeoffResult, false);
      }

      this.takeoffCalcNotAcceptedSubs.forEach(sub => { sub.pause(); });
      this.takeoffCalcAcceptedSubs.forEach(sub => { sub.resume(); });
      this.takeoffUpdateSubs.forEach(sub => { sub.resume(); });
    } else {
      for (let i = 0; i < this.lastCalculatedTakeoffResult.vSpeeds.length; i++) {
        this.fmsVSpeedManager.clearValue(this.lastCalculatedTakeoffResult.vSpeeds[i].name, true);
      }

      this.takeoffUpdateSubs.forEach(sub => { sub.pause(); });
      this.takeoffCalcAcceptedSubs.forEach(sub => { sub.pause(); });
      this.takeoffCalcNotAcceptedSubs.forEach(sub => { sub.resume(); });

      this.takeoffUpdateRequestTime = undefined;
    }
  }

  /**
   * Responds to when the landing V-speeds accepted setting changes.
   * @param accepted Whether the landing V-speeds have been accepted.
   */
  private onLandingSpeedsAccepted(accepted: boolean): void {
    if (accepted) {
      if (this.isLandingResultValid) {
        this.setFmsLandingSpeeds(this.lastCalculatedLandingResult, false);
      }

      this.landingCalcNotAcceptedSubs.forEach(sub => { sub.pause(); });
      this.landingCalcAcceptedSubs.forEach(sub => { sub.resume(); });
      this.landingUpdateSubs.forEach(sub => { sub.resume(); });
    } else {
      for (let i = 0; i < this.lastCalculatedLandingResult.vSpeeds.length; i++) {
        this.fmsVSpeedManager.clearValue(this.lastCalculatedLandingResult.vSpeeds[i].name, true);
      }

      this.landingUpdateSubs.forEach(sub => { sub.pause(); });
      this.landingCalcAcceptedSubs.forEach(sub => { sub.pause(); });
      this.landingCalcNotAcceptedSubs.forEach(sub => { sub.resume(); });

      this.landingUpdateRequestTime = undefined;
    }
  }

  /**
   * Loads takeoff data into landing data for an emergency return.
   */
  private loadEmergencyReturn(): void {
    const originIcao = this.originIcaoSetting.value;

    this.destinationIcaoSetting.value = originIcao;

    this.toldSettingManager.getSetting('toldLandingRunwayLength').value = this.toldSettingManager.getSetting('toldTakeoffRunwayLength').value;

    if (!ICAO.isFacility(originIcao, FacilityType.RWY)) {
      this.toldSettingManager.getSetting('toldLandingRunwayElevation').value = this.toldSettingManager.getSetting('toldTakeoffRunwayElevation').value;
      this.toldSettingManager.getSetting('toldLandingRunwayHeading').value = this.toldSettingManager.getSetting('toldTakeoffRunwayHeading').value;
      this.toldSettingManager.getSetting('toldLandingRunwayGradient').value = this.toldSettingManager.getSetting('toldTakeoffRunwayGradient').value;
    }

    this.landingRunwaySurfaceSetting.value = this.takeoffRunwaySurfaceSetting.value;
    this.toldSettingManager.getSetting('toldLandingWindDirection').value = this.toldSettingManager.getSetting('toldTakeoffWindDirection').value;
    this.toldSettingManager.getSetting('toldLandingWindSpeed').value = this.toldSettingManager.getSetting('toldTakeoffWindSpeed').value;
    this.landingTemperatureSetting.value = this.takeoffTemperatureSetting.value;
    this.landingPressureSetting.value = this.takeoffPressureSetting.value;
  }

  /**
   * Updates this computer.
   * @param realTime The current real (operating system) time, as a UNIX timestamp in milliseconds.
   */
  private update(realTime: number): void {
    if (this.takeoffCalcRequestTime !== undefined && realTime - this.takeoffCalcRequestTime >= ToldComputer.CALCULATE_DEBOUNCE_DELAY) {
      this.takeoffCalcRequestTime = undefined;
      this.takeoffUpdateRequestTime = undefined;
      this.calculateTakeoff();
    } else if (
      this.takeoffCalcRequestTime === undefined // Don't try to update takeoff result if a re-calculate is pending
      && this.takeoffUpdateRequestTime !== undefined
      && realTime - this.takeoffUpdateRequestTime >= ToldComputer.CALCULATE_DEBOUNCE_DELAY
    ) {
      this.takeoffUpdateRequestTime = undefined;
      this.updateTakeoff();
    }

    if (this.landingCalcRequestTime !== undefined && realTime - this.landingCalcRequestTime >= ToldComputer.CALCULATE_DEBOUNCE_DELAY) {
      this.landingCalcRequestTime = undefined;
      this.landingUpdateRequestTime = undefined;
      this.calculateLanding();
    } else if (
      this.landingCalcRequestTime === undefined // Don't try to update landing result if a re-calculate is pending
      && this.landingUpdateRequestTime !== undefined
      && realTime - this.landingUpdateRequestTime >= ToldComputer.CALCULATE_DEBOUNCE_DELAY
    ) {
      this.landingUpdateRequestTime = undefined;
      this.updateLanding();
    }
  }

  /**
   * Attempts to calculate takeoff performance values. Invalidates the current set of takeoff performance values if
   * they exist and removes any previously calculated FMS takeoff V-speed values.
   */
  private calculateTakeoff(): void {
    this.takeoffSpeedsAcceptedSetting.value = false;

    if (!this.canCalculateTakeoff()) {
      this.isTakeoffResultValid = false;
      this.toldSettingManager.getSetting('toldTakeoffCalcResult').value = '';
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const result = this.module!.getDatabase().calculateTakeoffPerformance(this.takeoffParams, this.takeoffResult);
    ToldComputer.copyTakeoffPerformanceResult(result, this.lastCalculatedTakeoffResult);
    this.isTakeoffResultValid = result.limitsExceeded === 0;
    this.toldSettingManager.getSetting('toldTakeoffCalcResult').value = JSON.stringify(result);
  }

  /**
   * Checks whether takeoff performance values can be calculated.
   * @returns Whether takeoff performance values can be calculated.
   */
  private canCalculateTakeoff(): boolean {
    return !this.takeoffParams.weight.isNaN()
      && !this.takeoffParams.temperature.isNaN()
      && !this.takeoffParams.pressure.isNaN()
      && !this.takeoffParams.runwayLength.isNaN()
      && !this.takeoffParams.runwayElevation.isNaN()
      && !this.takeoffParams.pressureAltitude.isNaN()
      && !isNaN(this.takeoffParams.runwayHeading)
      && !isNaN(this.takeoffParams.runwayGradient)
      && !isNaN(this.takeoffParams.windDirection)
      && !this.takeoffParams.windSpeed.isNaN();
  }

  /**
   * Attempts to update takeoff performance values. If takeoff performance values are successfully updated and are
   * valid, then the FMS takeoff V-speed values will also be updated to reflect the new calculated V-speed values.
   * If the takeoff performance values are invalid, then FMS takeoff V-speed values will be removed.
   */
  private updateTakeoff(): void {
    let didUpdate = false;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (this.module!.canUpdateTakeoffResult(this.lastCalculatedTakeoffResult, this.takeoffParams)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const result = this.module!.getDatabase().calculateTakeoffPerformance(this.takeoffParams, this.takeoffResult);
      ToldComputer.copyTakeoffPerformanceResult(result, this.lastCalculatedTakeoffResult);
      this.isTakeoffResultValid = result.limitsExceeded === 0;
      this.toldSettingManager.getSetting('toldTakeoffCalcResult').value = JSON.stringify(result);
      didUpdate = true;
    }

    if (this.isTakeoffResultValid) {
      // Update FMS takeoff V-speeds
      if (didUpdate && this.takeoffSpeedsAcceptedSetting.value) {
        this.setFmsTakeoffSpeeds(this.lastCalculatedTakeoffResult, true);
      }
    } else {
      this.takeoffSpeedsAcceptedSetting.value = false;
    }
  }

  /**
   * Attempts to calculate landing performance values. Invalidates the current set of landing performance values if
   * they exist and removes any previously calculated FMS landing V-speed values.
   */
  private calculateLanding(): void {
    this.landingSpeedsAcceptedSetting.value = false;

    if (!this.canCalculateLanding()) {
      this.isLandingResultValid = false;
      this.toldSettingManager.getSetting('toldLandingCalcResult').value = '';
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const result = this.module!.getDatabase().calculateLandingPerformance(this.landingParams, this.landingResult);
    ToldComputer.copyLandingPerformanceResult(result, this.lastCalculatedLandingResult);
    this.isLandingResultValid = result.limitsExceeded === 0 || result.limitsExceeded === ToldLimitExceedance.Weight;
    this.toldSettingManager.getSetting('toldLandingCalcResult').value = JSON.stringify(result);
  }

  /**
   * Checks whether landing performance values can be calculated.
   * @returns Whether landing performance values can be calculated.
   */
  private canCalculateLanding(): boolean {
    return !this.landingParams.weight.isNaN()
      && !this.landingParams.temperature.isNaN()
      && !this.landingParams.pressure.isNaN()
      && !this.landingParams.runwayLength.isNaN()
      && !this.landingParams.runwayElevation.isNaN()
      && !this.landingParams.pressureAltitude.isNaN()
      && !isNaN(this.landingParams.runwayHeading)
      && !isNaN(this.landingParams.runwayGradient)
      && !isNaN(this.landingParams.windDirection)
      && !this.landingParams.windSpeed.isNaN();
  }

  /**
   * Attempts to update landing performance values. If landing performance values are successfully updated and are
   * valid, then the FMS landing V-speed values will also be updated to reflect the new calculated V-speed values.
   * If the landing performance values are invalid, then FMS landing V-speed values will be removed.
   */
  private updateLanding(): void {
    let didUpdate = false;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (this.module!.canUpdateLandingResult(this.lastCalculatedLandingResult, this.landingParams)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const result = this.module!.getDatabase().calculateLandingPerformance(this.landingParams, this.landingResult);
      ToldComputer.copyLandingPerformanceResult(result, this.lastCalculatedLandingResult);
      this.isTakeoffResultValid = result.limitsExceeded === 0 || result.limitsExceeded === ToldLimitExceedance.Weight;
      this.toldSettingManager.getSetting('toldLandingCalcResult').value = JSON.stringify(result);
      didUpdate = true;
    }

    if (this.isLandingResultValid) {
      // Update FMS takeoff V-speeds
      if (didUpdate && this.landingSpeedsAcceptedSetting.value) {
        this.setFmsLandingSpeeds(this.lastCalculatedLandingResult, true);
      }
    } else {
      this.landingSpeedsAcceptedSetting.value = false;
    }
  }

  /**
   * Sets the FMS-defined values for takeoff V-speeds using a takeoff performance calculation result.
   * @param result The takeoff performance calculation result containing the V-speed values to set.
   * @param isUpdate Whether the values to set are an update of already accepted FMS V-speed values.
   */
  private setFmsTakeoffSpeeds(result: ToldTakeoffPerformanceResult, isUpdate: boolean): void {
    for (let i = 0; i < result.vSpeeds.length; i++) {
      const vSpeed = result.vSpeeds[i];
      this.fmsVSpeedManager.setValue(vSpeed.name, vSpeed.value, !isUpdate, !isUpdate);
    }
  }

  /**
   * Sets the FMS-defined values for landing V-speeds using a landing performance calculation result.
   * @param result The landing performance calculation result containing the V-speed values to set.
   * @param isUpdate Whether the values to set are an update of already accepted FMS V-speed values.
   */
  private setFmsLandingSpeeds(result: ToldLandingPerformanceResult, isUpdate: boolean): void {
    for (let i = 0; i < result.vSpeeds.length; i++) {
      const vSpeed = result.vSpeeds[i];
      this.fmsVSpeedManager.setValue(vSpeed.name, vSpeed.value, !isUpdate, !isUpdate);
    }
  }

  /**
   * Destroys this computer. Once destroyed, this computer will no longer perform any calculations or updates, and
   * cannot be paused or resumed.
   */
  public destroy(): void {
    this.isAlive = false;

    this.adcStates.forEach(state => { state.destroy(); });
    this.rat.destroy();
    this.baroSetting.destroy();
    this.flapsLeftAngle.destroy();
    this.flapsRightAngle.destroy();
    this.isOnGround.destroy();
    this.aircraftWeight.destroy();
    this.landingWeight.destroy();

    this.takeoffFlapsAngle.destroy();

    this.fplOriginDestSub?.destroy();
    this.fplProcDetailsSub?.destroy();
    this.originIcaoSub?.destroy();
    this.destinationIcaoSub?.destroy();
    this.useRatSub?.destroy();
    this.ratPipe?.destroy();
    this.takeoffWeightSub?.destroy();
    this.landingWeightCanUsePredictedState?.destroy();
    this.landingWeightUsePredictedSub?.destroy();
    this.landingWeightCurrentSub?.destroy();
    this.landingWeightPredictedSub?.destroy();
    this.landingWeightDestinationIcaoSub?.destroy();
    this.takeoffPressurePipe?.destroy();
    this.takeoffAntiIceTemperatureState?.destroy();
    this.takeoffThrustReverserState?.destroy();
    this.landingAntiIceTemperatureState?.destroy();
    this.landingThrustReverserState?.destroy();
    this.takeoffSpeedsAcceptedSub?.destroy();
    this.landingSpeedsAcceptedSub?.destroy();
    this.loadEmergencyReturnSub?.destroy();
    this.updateSub?.destroy();

    this.takeoffCalcSubs.forEach(sub => { sub.destroy(); });
    this.takeoffCalcNotAcceptedSubs.forEach(sub => { sub.destroy(); });
    this.takeoffCalcAcceptedSubs.forEach(sub => { sub.destroy(); });
    this.takeoffUpdateSubs.forEach(sub => { sub.destroy(); });

    this.landingCalcSubs.forEach(sub => { sub.destroy(); });
    this.landingCalcNotAcceptedSubs.forEach(sub => { sub.destroy(); });
    this.landingCalcAcceptedSubs.forEach(sub => { sub.destroy(); });
    this.landingUpdateSubs.forEach(sub => { sub.destroy(); });
  }

  /**
   * Gets the pressure altitude at a runway given a runway elevation and QNH setting.
   * @param elevation The runway elevation, in feet.
   * @param qnh The QNH altimeter setting at the runway, in hectopascals.
   * @returns The pressure altitude at the runway, in feet, given the specified elevation and QNH setting.
   */
  private static getRunwayPressureAltitude(elevation: number, qnh: number): number {
    return elevation - UnitType.METER.convertTo(AeroMath.baroPressureAltitudeOffset(qnh), UnitType.FOOT);
  }

  /**
   * Copies a takeoff performance result object to another.
   * @param source The source object to copy from.
   * @param target The target object to copy to.
   * @returns The target performance result object, after the source has been copied to it.
   */
  private static copyTakeoffPerformanceResult(source: ToldTakeoffPerformanceResult, target: ToldTakeoffPerformanceResult): ToldTakeoffPerformanceResult {
    for (const property in source) {
      if (property !== 'vSpeeds') {
        (target as any)[property] = (source as any)[property];
      }
    }

    for (let i = 0; i < target.vSpeeds.length; i++) {
      target.vSpeeds[i].value = source.vSpeeds[i].value;
    }

    return target;
  }

  /**
   * Copies a landing performance result object to another.
   * @param source The source object to copy from.
   * @param target The target object to copy to.
   * @returns The landing performance result object, after the source has been copied to it.
   */
  private static copyLandingPerformanceResult(source: ToldLandingPerformanceResult, target: ToldLandingPerformanceResult): ToldLandingPerformanceResult {
    for (const property in source) {
      if (property !== 'vSpeeds') {
        (target as any)[property] = (source as any)[property];
      }
    }

    for (let i = 0; i < target.vSpeeds.length; i++) {
      target.vSpeeds[i].value = source.vSpeeds[i].value;
    }

    return target;
  }
}