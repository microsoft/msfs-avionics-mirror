import {
  AdsbOperatingMode, EventBus, MappedSubject, NumberUnitInterface, Subject, Tcas, TcasAlertLevel, TcasIISensitivityParameters, TcasOperatingMode, TcasSensitivity,
  TcasSensitivityParameters, TrafficContact, TrafficInstrument, UnitFamily, UnitType
} from '@microsoft/msfs-sdk';

import { CDIScaleLabel, LNavDataEvents } from '../navigation/LNavDataEvents';
import { TrafficOperatingModeSetting, TrafficUserSettings } from '../settings/TrafficUserSettings';
import { AdsbSensitivityParameters } from './AdsbSensitivityParameters';
import { GarminAdsb } from './GarminAdsb';
import { GarminTcasIntruder } from './GarminTcasIntruder';
import { TrafficSystem } from './TrafficSystem';
import { TrafficSystemType } from './TrafficSystemType';

/**
 * Garmin TCAS-II.
 */
export class GarminTcasII extends Tcas<GarminTcasIntruder, GarminTcasIISensitivity> implements TrafficSystem {
  public static readonly DEFAULT_MAX_INTRUDER_COUNT = 40;
  public static readonly DEFAULT_REAL_TIME_UPDATE_FREQ = 2; // hz
  public static readonly DEFAULT_SIM_TIME_UPDATE_FREQ = 1; // hz

  private static readonly TA_ON_HYSTERESIS = 2000; // ms
  private static readonly TA_OFF_HYSTERESIS = 8000; // ms

  public readonly type = TrafficSystemType.TcasII;

  private cdiScalingLabel: CDIScaleLabel = CDIScaleLabel.Enroute;

  private readonly _isPowered = Subject.create(true);
  private readonly operatingModeSetting = TrafficUserSettings.getManager(this.bus).getSetting('trafficOperatingMode');
  private readonly operatingModeState = MappedSubject.create(this._isPowered, this.operatingModeSetting);

  private readonly raAltitudeInhibitFlag = MappedSubject.create(
    ([radarAlt, isClimbing]): boolean => {
      return radarAlt < (isClimbing ? 900 : 1100);
    },
    this.ownAirplaneSubs.radarAltitude.map(radarAlt => Math.round(radarAlt.asUnit(UnitType.FOOT))),
    this.ownAirplaneSubs.verticalSpeed.map(verticalSpeed => verticalSpeed.number >= 0)
  );

  /**
   * Constructor.
   * @param bus The event bus.
   * @param tfcInstrument The traffic instrument which provides traffic contacts for this TCAS.
   * @param adsb The ADS-B system associated with this TCAS, or `null` if this TCAS does not support ADS-B.
   * @param maxIntruderCount The maximum number of intruders tracked at any one time by this TCAS. Defaults to
   * {@link GarminTcasII.DEFAULT_MAX_INTRUDER_COUNT}.
   * @param realTimeUpdateFreq The maximum update frequency (Hz) in real time. Defaults to
   * {@link GarminTcasII.DEFAULT_REAL_TIME_UPDATE_FREQ}.
   * @param simTimeUpdateFreq The maximum update frequency (Hz) in sim time. Defaults to
   * {@link GarminTcasII.DEFAULT_SIM_TIME_UPDATE_FREQ}.
   */
  constructor(
    bus: EventBus,
    tfcInstrument: TrafficInstrument,
    public readonly adsb: GarminAdsb | null,
    maxIntruderCount = GarminTcasII.DEFAULT_MAX_INTRUDER_COUNT,
    realTimeUpdateFreq = GarminTcasII.DEFAULT_REAL_TIME_UPDATE_FREQ,
    simTimeUpdateFreq = GarminTcasII.DEFAULT_SIM_TIME_UPDATE_FREQ
  ) {
    super(bus, tfcInstrument, maxIntruderCount, realTimeUpdateFreq, simTimeUpdateFreq);
  }

  /** @inheritdoc */
  protected createSensitivity(): GarminTcasIISensitivity {
    return new GarminTcasIISensitivity();
  }

  /** @inheritdoc */
  public init(): void {
    super.init();

    this.bus.getSubscriber<LNavDataEvents>().on('lnavdata_cdi_scale_label').whenChanged().handle(label => { this.cdiScalingLabel = label; });

    this.operatingModeState.sub(([isPowered, operatingModeSetting]) => {
      if (!isPowered) {
        this.operatingModeSub.set(TcasOperatingMode.Off);
      } else {
        switch (operatingModeSetting) {
          case TrafficOperatingModeSetting.Operating:
          case TrafficOperatingModeSetting.Auto:
            if (this.raAltitudeInhibitFlag.get()) {
              this.setOperatingMode(TcasOperatingMode.TAOnly);
            } else {
              this.setOperatingMode(TcasOperatingMode.TA_RA);
            }
            break;
          case TrafficOperatingModeSetting.TAOnly:
            this.operatingModeSub.set(TcasOperatingMode.TAOnly);
            break;
          default:
            this.operatingModeSub.set(TcasOperatingMode.Standby);
        }
      }
    }, true);

    this.raAltitudeInhibitFlag.sub(inhibit => {
      if (this._isPowered.get() && this.operatingModeSetting.value === TrafficOperatingModeSetting.Auto) {
        this.setOperatingMode(inhibit ? TcasOperatingMode.TAOnly : TcasOperatingMode.TA_RA);
      }
    });

    this.adsb?.init();
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
  protected updateSensitivity(): void {
    this.sensitivity.update(
      this.adsb?.getOperatingMode() ?? AdsbOperatingMode.Standby,
      this.ownAirplaneSubs.altitude.get(),
      this.cdiScalingLabel,
      this.ownAirplaneSubs.radarAltitude.get()
    );
  }

  /** @inheritdoc */
  protected canIssueTrafficAdvisory(simTime: number, intruder: GarminTcasIntruder): boolean {
    if (this.ownAirplaneSubs.isOnGround.get()) {
      return false;
    }

    if (intruder.alertLevel.get() !== TcasAlertLevel.TrafficAdvisory) {
      const dt = simTime - intruder.taOffTime;
      return dt < 0 || dt >= GarminTcasII.TA_ON_HYSTERESIS;
    }

    return true;
  }

  /** @inheritdoc */
  protected canCancelTrafficAdvisory(simTime: number, intruder: GarminTcasIntruder): boolean {
    if (this.ownAirplaneSubs.isOnGround.get()) {
      return true;
    }

    const dt = simTime - intruder.taOnTime;
    return dt < 0 || dt >= GarminTcasII.TA_OFF_HYSTERESIS;
  }
}

/**
 * An implementation of {@link TCASSensitivity} which provides sensitivity parameters for the Garmin TCAS-II. When
 * ADS-B is operating, Traffic Advisory sensitivity is selected based on the ADS-B Conflict Situational Awareness (CSA)
 * algorithm. When ADS-B is not operating, Traffic Advisory sensitivity is selected based on the TCAS-II algorithm.
 * Resolution Advisory sensitivity is always determined by the TCAS-II algorithm.
 */
export class GarminTcasIISensitivity implements TcasSensitivity {
  private readonly tcasIISensitivity = new TcasIISensitivityParameters();
  private readonly adsbSensitivity = new AdsbSensitivityParameters();

  private readonly tcasIIParams = {
    parametersPA: this.tcasIISensitivity.getPA(0),

    parametersTA: this.tcasIISensitivity.getTA(0),

    parametersRA: this.tcasIISensitivity.getRA(0)
  };

  private readonly adsbParams = {
    parametersPA: this.tcasIISensitivity.getPA(0),

    parametersTA: this.adsbSensitivity.getTA(0),

    parametersRA: this.tcasIISensitivity.getRA(0)
  };

  private tcasIILevel = 0;
  private adsbLevel = 0;

  private activeParams = this.tcasIIParams;

  /** @inheritdoc */
  public selectParameters(): TcasSensitivityParameters {
    return this.activeParams;
  }

  /** @inheritdoc */
  public selectRAAlim(): NumberUnitInterface<UnitFamily.Distance> {
    return this.tcasIISensitivity.getRAAlim(this.tcasIILevel);
  }

  /**
   * Updates the sensitivity.
   * @param adsbMode The ADS-B operating mode.
   * @param altitude The indicated altitude of the own airplane.
   * @param cdiScalingLabel The CDI scaling sensitivity of the own airplane.
   * @param radarAltitude The radar altitude of the own airplane.
   */
  public update(
    adsbMode: AdsbOperatingMode,
    altitude: NumberUnitInterface<UnitFamily.Distance>,
    cdiScalingLabel: CDIScaleLabel,
    radarAltitude: NumberUnitInterface<UnitFamily.Distance>
  ): void {
    this.tcasIILevel = this.tcasIISensitivity.selectLevel(altitude, radarAltitude);
    this.adsbLevel = this.adsbSensitivity.selectLevel(altitude, cdiScalingLabel, radarAltitude);

    this.tcasIIParams.parametersPA = this.tcasIISensitivity.getPA(this.tcasIILevel);
    this.tcasIIParams.parametersTA = this.tcasIISensitivity.getTA(this.tcasIILevel);
    this.tcasIIParams.parametersRA = this.tcasIISensitivity.getRA(this.tcasIILevel);

    this.adsbParams.parametersPA = this.tcasIISensitivity.getPA(this.tcasIILevel);
    this.adsbParams.parametersTA = this.adsbSensitivity.getTA(this.adsbLevel);
    this.adsbParams.parametersRA = this.tcasIISensitivity.getRA(this.tcasIILevel);

    // Right now we just assume every intruder is tracked by ADS-B if ADS-B is operating
    this.activeParams = adsbMode === AdsbOperatingMode.Standby ? this.tcasIIParams : this.adsbParams;
  }
}