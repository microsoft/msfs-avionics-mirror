import {
  EventBus, MappedSubject, MathUtils, NumberUnitInterface, Subject, Tcas, TcasAdvisoryParameters, TcasAlertLevel, TcasOperatingMode, TcasSensitivity,
  TcasSensitivityParameters, TcasTcaParameters, TrafficContact, TrafficInstrument, UnitFamily, UnitType, Vec2Math
} from '@microsoft/msfs-sdk';

import { TrafficOperatingModeSetting, TrafficUserSettings } from '../settings/TrafficUserSettings';
import { GarminTcasIntruder } from './GarminTcasIntruder';
import { TrafficSystem } from './TrafficSystem';
import { TrafficSystemType } from './TrafficSystemType';

/**
 * Garmin Traffic Information Service.
 */
export class TrafficInfoService extends Tcas<GarminTcasIntruder, TisSensitivity> implements TrafficSystem {
  public static readonly DEFAULT_MAX_INTRUDER_COUNT = 8;
  public static readonly DEFAULT_REAL_TIME_UPDATE_FREQ = 2; // hz
  public static readonly DEFAULT_SIM_TIME_UPDATE_FREQ = 0.2; // hz

  private static readonly MAX_INTRUDER_ALTITUDE_BELOW = UnitType.FOOT.createNumber(3000);
  private static readonly MAX_INTRUDER_ALTITUDE_ABOVE = UnitType.FOOT.createNumber(3500);
  private static readonly MAX_INTRUDER_DISTANCE = UnitType.NMILE.createNumber(7.5);

  private static readonly TA_ON_HYSTERESIS = 2000; // ms
  private static readonly TA_OFF_HYSTERESIS = 8000; // ms

  public readonly type = TrafficSystemType.Tis;
  public readonly adsb = null;

  private readonly _isPowered = Subject.create(true);
  private readonly operatingModeSetting = TrafficUserSettings.getManager(this.bus).getSetting('trafficOperatingMode');
  private readonly operatingModeState = MappedSubject.create(this._isPowered, this.operatingModeSetting);

  /**
   * Constructor.
   * @param bus The event bus.
   * @param tfcInstrument The traffic instrument which provides traffic contacts for this TIS.
   * @param supportsRadarAltitude Whether this TIS supports radar altitude.
   * @param maxIntruderCount The maximum number of intruders tracked at any one time by this TIS. Defaults to
   * {@link TrafficInfoService.DEFAULT_MAX_INTRUDER_COUNT}.
   * @param realTimeUpdateFreq The maximum update frequency (Hz) in real time. Defaults to
   * {@link TrafficInfoService.DEFAULT_REAL_TIME_UPDATE_FREQ}.
   * @param simTimeUpdateFreq The maximum update frequency (Hz) in sim time. Defaults to
   * {@link TrafficInfoService.DEFAULT_SIM_TIME_UPDATE_FREQ}.
   */
  constructor(
    bus: EventBus,
    tfcInstrument: TrafficInstrument,
    private readonly supportsRadarAltitude: boolean,
    maxIntruderCount = TrafficInfoService.DEFAULT_MAX_INTRUDER_COUNT,
    realTimeUpdateFreq = TrafficInfoService.DEFAULT_REAL_TIME_UPDATE_FREQ,
    simTimeUpdateFreq = TrafficInfoService.DEFAULT_SIM_TIME_UPDATE_FREQ
  ) {
    super(bus, tfcInstrument, maxIntruderCount, realTimeUpdateFreq, simTimeUpdateFreq);
  }

  /** @inheritdoc */
  protected createSensitivity(): TisSensitivity {
    return new TisSensitivity();
  }

  /** @inheritdoc */
  public init(): void {
    super.init();

    this.operatingModeState.sub(([isPowered, operatingModeSetting]) => {
      if (!isPowered) {
        this.operatingModeSub.set(TcasOperatingMode.Off);
      } else {
        switch (operatingModeSetting) {
          case TrafficOperatingModeSetting.Operating:
          case TrafficOperatingModeSetting.Auto:
          case TrafficOperatingModeSetting.TAOnly:
            this.operatingModeSub.set(TcasOperatingMode.TAOnly);
            break;
          default:
            this.operatingModeSub.set(TcasOperatingMode.Standby);
        }
      }
    }, true);
  }

  /** @inheritdoc */
  public isPowered(): boolean {
    return this._isPowered.get();
  }

  /** @inheritdoc */
  public setPowered(isPowered: boolean): void {
    this._isPowered.set(isPowered);
  }

  /** @inheritdoc */
  protected createIntruderEntry(contact: TrafficContact): GarminTcasIntruder {
    return new GarminTcasIntruder(contact, this.simTime);
  }

  /** @inheritdoc */
  protected filterIntruder(intruder: GarminTcasIntruder): boolean {
    const relativePosVec = intruder.relativePositionVec;

    return TrafficInfoService.MAX_INTRUDER_ALTITUDE_BELOW.compare(-relativePosVec[2], UnitType.METER) >= 0
      && TrafficInfoService.MAX_INTRUDER_ALTITUDE_ABOVE.compare(relativePosVec[2], UnitType.METER) >= 0
      && TrafficInfoService.MAX_INTRUDER_DISTANCE.compare(Vec2Math.abs(relativePosVec), UnitType.METER) >= 0;
  }

  /** @inheritdoc */
  protected updateSensitivity(): void {
    this.sensitivity.update(
      this.ownAirplaneSubs.groundSpeed.get(),
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
      return dt < 0 || dt >= TrafficInfoService.TA_ON_HYSTERESIS;
    }

    return true;
  }

  /** @inheritdoc */
  protected canCancelTrafficAdvisory(simTime: number, intruder: GarminTcasIntruder): boolean {
    if (this.ownAirplaneSubs.isOnGround.get()) {
      return true;
    }

    const dt = simTime - intruder.taOnTime;
    return dt < 0 || dt >= TrafficInfoService.TA_OFF_HYSTERESIS;
  }
}

/**
 * Garmin TIS sensitivity settings.
 */
export class TisSensitivityParameters {
  private static readonly PA = {
    protectedRadius: UnitType.NMILE.createNumber(6),
    protectedHeight: UnitType.FOOT.createNumber(1200)
  };

  private static readonly TA_LEVELS = [
    {
      tau: UnitType.SECOND.createNumber(20),
      protectedRadius: UnitType.NMILE.createNumber(0.2),
      protectedHeight: UnitType.FOOT.createNumber(600)
    },
    {
      tau: UnitType.SECOND.createNumber(30),
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
    // TODO: I couldn't find any specific details on how TIS determines sensitivity levels, so for now this is
    // identical to the TAS algorithm.

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
    return TisSensitivityParameters.PA;
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
    return TisSensitivityParameters.TA_LEVELS[this.selectLevel(groundSpeed, radarAltitude)];
  }

  /**
   * Gets Proximity Advisory sensitivity parameters for a given sensitivity level.
   * @param level A sensitivity level.
   * @returns Proximity Advisory sensitivity parameters for the given sensitivity level.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public getPA(level: number): TcasAdvisoryParameters {
    return TisSensitivityParameters.PA;
  }

  /**
   * Gets Traffic Advisory sensitivity parameters for a given sensitivity level.
   * @param level A sensitivity level.
   * @returns Traffic Advisory sensitivity parameters for the given sensitivity level.
   */
  public getTA(level: number): TcasTcaParameters {
    return TisSensitivityParameters.TA_LEVELS[MathUtils.clamp(level, 0, TisSensitivityParameters.TA_LEVELS.length - 1)];
  }
}

/**
 * An implementation of {@link TCASSensitivity} which provides sensitivity parameters for the Garmin Traffic
 * Information Service.
 */
export class TisSensitivity implements TcasSensitivity {
  private readonly sensitivity = new TisSensitivityParameters();

  private readonly params = {
    parametersPA: this.sensitivity.getPA(0),

    parametersTA: this.sensitivity.getTA(0),

    parametersRA: {
      tau: UnitType.SECOND.createNumber(NaN),
      protectedRadius: UnitType.NMILE.createNumber(NaN),
      protectedHeight: UnitType.FOOT.createNumber(NaN),
      alim: UnitType.FOOT.createNumber(NaN)
    }
  };

  /** @inheritdoc */
  public selectParameters(): TcasSensitivityParameters {
    return this.params;
  }

  /** @inheritdoc */
  public selectRAAlim(): NumberUnitInterface<UnitFamily.Distance> {
    return this.params.parametersRA.alim;
  }

  /**
   * Updates the sensitivity.
   * @param groundSpeed The ground speed of the own airplane.
   * @param radarAltitude The radar altitude of the own airplane.
   */
  public update(
    groundSpeed: NumberUnitInterface<UnitFamily.Speed>,
    radarAltitude?: NumberUnitInterface<UnitFamily.Distance>
  ): void {
    const level = this.sensitivity.selectLevel(groundSpeed, radarAltitude);

    this.params.parametersPA = this.sensitivity.getPA(level);
    this.params.parametersTA = this.sensitivity.getTA(level);
  }
}