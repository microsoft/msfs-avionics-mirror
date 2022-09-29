import {
  AdsbOperatingMode, DebounceTimer, EventBus, MathUtils, NumberUnitInterface, Tcas, TcasAdvisoryParameters, TcasAlertLevel, TcasOperatingMode, TcasSensitivity,
  TcasSensitivityParameters, TcasTcaParameters, TrafficContact, TrafficInstrument, UnitFamily, UnitType
} from 'msfssdk';

import { CDIScaleLabel, LNavDataEvents } from '../navigation/LNavDataEvents';
import { TrafficOperatingModeSetting, TrafficUserSettings } from '../settings/TrafficUserSettings';
import { AdsbSensitivityParameters } from './AdsbSensitivityParameters';
import { GarminAdsb } from './GarminAdsb';
import { GarminTcasIntruder } from './GarminTcasIntruder';
import { TrafficSystem } from './TrafficSystem';
import { TrafficSystemType } from './TrafficSystemType';

/**
 * Garmin Traffic Advisory System (TAS).
 */
export class TrafficAdvisorySystem extends Tcas<GarminTcasIntruder, TasSensitivity> implements TrafficSystem {
  public static readonly DEFAULT_MAX_INTRUDER_COUNT = 30;
  public static readonly DEFAULT_REAL_TIME_UPDATE_FREQ = 2; // hz
  public static readonly DEFAULT_SIM_TIME_UPDATE_FREQ = 1; // hz

  private static readonly TA_ON_HYSTERESIS = 2000; // ms
  private static readonly TA_OFF_HYSTERESIS = 8000; // ms
  private static readonly TAKEOFF_OPER_DELAY = 8000; // milliseconds
  private static readonly LANDING_STANDBY_DELAY = 24000; // milliseconds

  public readonly type = TrafficSystemType.Tas;

  private readonly operatingModeSetting = TrafficUserSettings.getManager(this.bus).getSetting('trafficOperatingMode');

  private cdiScalingLabel: CDIScaleLabel = CDIScaleLabel.Enroute;

  private readonly operatingModeChangeTimer = new DebounceTimer();

  /**
   * Constructor.
   * @param bus The event bus.
   * @param tfcInstrument The traffic instrument which provides traffic contacts for this TAS.
   * @param adsb The ADS-B system associated with this TAS, or `null` if this TAS does not support ADS-B.
   * @param supportsRadarAltitude Whether this TAS supports radar altitude.
   * @param maxIntruderCount The maximum number of intruders tracked at any one time by this TAS. Defaults to
   * {@link TrafficAdvisorySystem.DEFAULT_MAX_INTRUDER_COUNT}.
   * @param realTimeUpdateFreq The maximum update frequency (Hz) in real time. Defaults to
   * {@link TrafficAdvisorySystem.DEFAULT_REAL_TIME_UPDATE_FREQ}.
   * @param simTimeUpdateFreq The maximum update frequency (Hz) in sim time. Defaults to
   * {@link TrafficAdvisorySystem.DEFAULT_SIM_TIME_UPDATE_FREQ}.
   */
  constructor(
    bus: EventBus,
    tfcInstrument: TrafficInstrument,
    public readonly adsb: GarminAdsb | null,
    private readonly supportsRadarAltitude: boolean,
    maxIntruderCount = TrafficAdvisorySystem.DEFAULT_MAX_INTRUDER_COUNT,
    realTimeUpdateFreq = TrafficAdvisorySystem.DEFAULT_REAL_TIME_UPDATE_FREQ,
    simTimeUpdateFreq = TrafficAdvisorySystem.DEFAULT_SIM_TIME_UPDATE_FREQ
  ) {
    super(bus, tfcInstrument, maxIntruderCount, realTimeUpdateFreq, simTimeUpdateFreq);
  }

  /** @inheritdoc */
  protected createSensitivity(): TasSensitivity {
    return new TasSensitivity();
  }

  /** @inheritdoc */
  public init(): void {
    super.init();

    this.bus.getSubscriber<LNavDataEvents>().on('lnavdata_cdi_scale_label').whenChanged().handle(label => { this.cdiScalingLabel = label; });

    this.operatingModeSetting.sub(value => {
      switch (value) {
        case TrafficOperatingModeSetting.Operating:
        case TrafficOperatingModeSetting.Auto:
        case TrafficOperatingModeSetting.TAOnly:
          this.operatingModeSub.set(TcasOperatingMode.TAOnly);
          break;
        default:
          this.operatingModeSub.set(TcasOperatingMode.Standby);
      }
    }, true);

    this.operatingModeSub.sub(this.cancelOperatingModeChange.bind(this));
    this.ownAirplaneSubs.isOnGround.sub(this.onGroundChanged.bind(this));

    if (!this.ownAirplaneSubs.isOnGround.get()) {
      this.operatingModeSetting.value = TrafficOperatingModeSetting.Operating;
    }

    this.adsb?.init();
  }

  /** @inheritdoc */
  protected createIntruderEntry(contact: TrafficContact): GarminTcasIntruder {
    return new GarminTcasIntruder(contact, this.simTime);
  }

  /** @inheritdoc */
  protected updateSensitivity(): void {
    this.sensitivity.update(
      this.adsb?.getOperatingMode() ?? AdsbOperatingMode.Standby,
      this.ownAirplaneSubs.altitude.get(),
      this.ownAirplaneSubs.groundSpeed.get(),
      this.cdiScalingLabel,
      this.supportsRadarAltitude ? this.ownAirplaneSubs.radarAltitude.get() : undefined
    );
  }

  /** @inheritdoc */
  protected canIssueTrafficAdvisory(simTime: number, intruder: GarminTcasIntruder): boolean {
    if (this.ownAirplaneSubs.isOnGround.get()) {
      return false;
    }

    if (intruder.alertLevel.get() !== TcasAlertLevel.TrafficAdvisory) {
      const dt = simTime - intruder.taOffTime;
      return dt < 0 || dt >= TrafficAdvisorySystem.TA_ON_HYSTERESIS;
    }

    return true;
  }

  /** @inheritdoc */
  protected canCancelTrafficAdvisory(simTime: number, intruder: GarminTcasIntruder): boolean {
    if (this.ownAirplaneSubs.isOnGround.get()) {
      return true;
    }

    const dt = simTime - intruder.taOnTime;
    return dt < 0 || dt >= TrafficAdvisorySystem.TA_OFF_HYSTERESIS;
  }

  /**
   * A callback which is called when whether own airplane is on the ground changes.
   * @param isOnGround Whether own airplane is on the ground.
   */
  private onGroundChanged(isOnGround: boolean): void {
    this.cancelOperatingModeChange();

    if (isOnGround) {
      if (this.operatingModeSetting.value === TrafficOperatingModeSetting.Operating) {
        this.scheduleOperatingModeChange(TrafficOperatingModeSetting.Standby, TrafficAdvisorySystem.LANDING_STANDBY_DELAY);
      }
    } else {
      if (this.operatingModeSetting.value === TrafficOperatingModeSetting.Standby) {
        this.scheduleOperatingModeChange(TrafficOperatingModeSetting.Operating, TrafficAdvisorySystem.TAKEOFF_OPER_DELAY);
      }
    }
  }

  /**
   * Schedules a delayed operating mode change.
   * @param toMode The target operating mode.
   * @param delay The delay, in milliseconds.
   */
  private scheduleOperatingModeChange(toMode: TrafficOperatingModeSetting, delay: number): void {
    this.operatingModeChangeTimer.schedule(() => {
      this.operatingModeSetting.value = toMode;
    }, delay);
  }

  /**
   * Cancels the currently scheduled operating mode change, if one exists.
   */
  private cancelOperatingModeChange(): void {
    this.operatingModeChangeTimer.clear();
  }
}

/**
 * Garmin TAS sensitivity settings.
 */
export class TasSensitivityParameters {
  private static readonly PA = {
    protectedRadius: UnitType.NMILE.createNumber(6),
    protectedHeight: UnitType.FOOT.createNumber(1200)
  };

  private static readonly TA_LEVELS = [
    {
      lookaheadTime: UnitType.SECOND.createNumber(20),
      protectedRadius: UnitType.NMILE.createNumber(0.2),
      protectedHeight: UnitType.FOOT.createNumber(600)
    },
    {
      lookaheadTime: UnitType.SECOND.createNumber(30),
      protectedRadius: UnitType.NMILE.createNumber(0.55),
      protectedHeight: UnitType.FOOT.createNumber(800)
    }
  ];

  /**
   * Selects a sensitivity level for a specified environment.
   * @param groundSpeed The ground speed of the own airplane.
   * @param radarAltitude The radar altitude of the own airplane.
   * @returns The sensitivity level for the specified environment.
   */
  public selectLevel(
    groundSpeed: NumberUnitInterface<UnitFamily.Speed>,
    radarAltitude?: NumberUnitInterface<UnitFamily.Distance>
  ): number {
    if ((radarAltitude?.compare(2000, UnitType.FOOT) ?? 1) < 0 || groundSpeed.compare(120, UnitType.KNOT) < 0) {
      return 0;
    } else {
      return 1;
    }
  }

  /**
   * Selects Proximity Advisory sensitivity settings for a specified environment.
   * @param groundSpeed The ground speed of the own airplane.
   * @param radarAltitude The radar altitude of the own airplane.
   * @returns Proximity Advisory sensitivity settings for the specified environment.
   */
  public selectPA(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    groundSpeed: NumberUnitInterface<UnitFamily.Speed>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    radarAltitude?: NumberUnitInterface<UnitFamily.Distance>
  ): TcasAdvisoryParameters {
    return TasSensitivityParameters.PA;
  }

  /**
   * Selects Traffic Advisory sensitivity settings for a specified environment.
   * @param groundSpeed The ground speed of the own airplane.
   * @param radarAltitude The radar altitude of the own airplane.
   * @returns Traffic Advisory sensitivity settings for the specified environment.
   */
  public selectTA(
    groundSpeed: NumberUnitInterface<UnitFamily.Speed>,
    radarAltitude?: NumberUnitInterface<UnitFamily.Distance>
  ): TcasTcaParameters {
    return TasSensitivityParameters.TA_LEVELS[this.selectLevel(groundSpeed, radarAltitude)];
  }

  /**
   * Gets Proximity Advisory sensitivity parameters for a given sensitivity level.
   * @param level A sensitivity level.
   * @returns Proximity Advisory sensitivity parameters for the given sensitivity level.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public getPA(level: number): TcasAdvisoryParameters {
    return TasSensitivityParameters.PA;
  }

  /**
   * Gets Traffic Advisory sensitivity parameters for a given sensitivity level.
   * @param level A sensitivity level.
   * @returns Traffic Advisory sensitivity parameters for the given sensitivity level.
   */
  public getTA(level: number): TcasTcaParameters {
    return TasSensitivityParameters.TA_LEVELS[MathUtils.clamp(level, 0, TasSensitivityParameters.TA_LEVELS.length - 1)];
  }
}

/**
 * An implementation of {@link TCASSensitivity} which provides sensitivity parameters for the Garmin Traffic Advisory
 * System (TAS). When ADS-B is operating, Traffic Advisory sensitivity is selected based on the ADS-B Conflict
 * Situational Awareness (CSA) algorithm. When ADS-B is not operating, Traffic Advisory sensitivity is selected based
 * on the TAS algorithm.
 */
export class TasSensitivity implements TcasSensitivity {
  private readonly adsbTASensitivity = new AdsbSensitivityParameters();
  private readonly tasSensitivity = new TasSensitivityParameters();

  private readonly tasParams = {
    parametersPA: this.tasSensitivity.getPA(0),

    parametersTA: this.tasSensitivity.getTA(0),

    parametersRA: {
      lookaheadTime: UnitType.SECOND.createNumber(NaN),
      protectedRadius: UnitType.NMILE.createNumber(NaN),
      protectedHeight: UnitType.FOOT.createNumber(NaN),
      alim: UnitType.FOOT.createNumber(NaN)
    }
  };

  private readonly adsbParams = {
    parametersPA: this.tasSensitivity.getPA(0),

    parametersTA: this.adsbTASensitivity.getTA(0),

    parametersRA: {
      lookaheadTime: UnitType.SECOND.createNumber(NaN),
      protectedRadius: UnitType.NMILE.createNumber(NaN),
      protectedHeight: UnitType.FOOT.createNumber(NaN),
      alim: UnitType.FOOT.createNumber(NaN)
    }
  };

  private activeParams = this.tasParams;

  /** @inheritdoc */
  public selectParameters(): TcasSensitivityParameters {
    return this.activeParams;
  }

  /** @inheritdoc */
  public selectRAAlim(): NumberUnitInterface<UnitFamily.Distance> {
    return this.tasParams.parametersRA.alim;
  }

  /**
   * Updates the sensitivity.
   * @param adsbMode The ADS-B operating mode.
   * @param altitude The indicated altitude of the own airplane.
   * @param groundSpeed The ground speed of the own airplane.
   * @param cdiScalingLabel The CDI scaling sensitivity of the own airplane.
   * @param radarAltitude The radar altitude of the own airplane.
   */
  public update(
    adsbMode: AdsbOperatingMode,
    altitude: NumberUnitInterface<UnitFamily.Distance>,
    groundSpeed: NumberUnitInterface<UnitFamily.Speed>,
    cdiScalingLabel: CDIScaleLabel,
    radarAltitude?: NumberUnitInterface<UnitFamily.Distance>
  ): void {
    const tasLevel = this.tasSensitivity.selectLevel(groundSpeed, radarAltitude);
    const adsbLevel = this.adsbTASensitivity.selectLevel(altitude, cdiScalingLabel, radarAltitude);

    this.tasParams.parametersPA = this.tasSensitivity.getPA(tasLevel);
    this.tasParams.parametersTA = this.tasSensitivity.getTA(tasLevel);

    this.tasParams.parametersPA = this.tasSensitivity.getPA(tasLevel);
    this.tasParams.parametersTA = this.adsbTASensitivity.getTA(adsbLevel);

    // Right now we just assume every intruder is tracked by ADS-B if ADS-B is operating
    this.activeParams = adsbMode === AdsbOperatingMode.Standby ? this.tasParams : this.adsbParams;
  }
}