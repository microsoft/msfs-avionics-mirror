import {
  AdsbOperatingMode, AhrsEvents, ConsumerValue, EventBus, MappedSubject, NumberUnitInterface, Tcas, TcasAlertLevel, TcasIISensitivityParameters,
  TcasOperatingMode, TcasSensitivity, TcasSensitivityParameters, TrafficContact, TrafficInstrument, UnitFamily, UnitType
} from '@microsoft/msfs-sdk';

import { AcasSystemDefinition } from '../AvionicsConfig';
import { Epic2FlightArea } from '../Fms';
import { Epic2LNavDataEvents } from '../Navigation';
import { TcasOperatingModeSetting, TrafficUserSettings } from '../Settings';
import { AdsbSensitivityParameters } from './AdsbSensitivityParameters';
import { Epic2Adsb } from './Epic2Adsb';
import { Epic2TcasIntruder } from './Epic2TcasIntruder';

/**
 * A TCAS II implementation for the Epic2.
 */
export class Epic2TcasII extends Tcas<Epic2TcasIntruder, Epic2TcasIISensitivity> {
  private static readonly MAX_INTRUDER_COUNT = 30;
  private static readonly REAL_TIME_UPDATE_FREQ = 2; // Hz
  private static readonly SIM_TIME_UPDATE_FREQ = 1; // Hz

  private static readonly TA_ON_HYSTERESIS = 2000; // ms
  private static readonly TA_OFF_HYSTERESIS = 8000; // ms

  private readonly settings = TrafficUserSettings.getManager(this.bus);
  private cdiScalingLabel = Epic2FlightArea.EnRoute;

  private readonly raAltitudeInhibitFlag = MappedSubject.create(
    ([radarAlt, isClimbing]): boolean => {
      return radarAlt < (isClimbing ? 900 : 1100);
    },
    this.ownAirplaneSubs.radarAltitude.map(radarAlt => Math.round(radarAlt.asUnit(UnitType.FOOT))),
    this.ownAirplaneSubs.verticalSpeed.map(verticalSpeed => verticalSpeed.number >= 0)
  );

  public readonly maxAngleForBearing = this.config.bearingCone.maxElevation;
  public readonly minAngleForBearing = this.config.bearingCone.minElevation;

  private readonly ownAirplanePitch = ConsumerValue.create(this.bus.getSubscriber<AhrsEvents>().on('actual_pitch_deg').atFrequency(Epic2TcasII.REAL_TIME_UPDATE_FREQ), 0);

  /**
   * Constructor.
   * @param bus The event bus.
   * @param tfcInstrument The traffic instrument which provides traffic contacts for this TCAS.
   * @param adsb The ADS-B system associated with this TCAS, or `null` if this TCAS does not support ADS-B.
   * @param config An ACAS System configuration
   */
  constructor(bus: EventBus, tfcInstrument: TrafficInstrument, public readonly adsb: Epic2Adsb | null, private readonly config: AcasSystemDefinition) {
    super(bus, tfcInstrument, Epic2TcasII.MAX_INTRUDER_COUNT, Epic2TcasII.REAL_TIME_UPDATE_FREQ, Epic2TcasII.SIM_TIME_UPDATE_FREQ);
  }

  /** @inheritdoc */
  public init(): void {
    super.init();

    this.bus.getSubscriber<Epic2LNavDataEvents>().on('lnavdata_flight_area')
      .whenChanged().handle(label => { this.cdiScalingLabel = label; });

    this.settings.whenSettingChanged('trafficOperatingMode').handle(mode => {
      switch (mode) {
        case TcasOperatingModeSetting.On:
        case TcasOperatingModeSetting.Standby:
          this.setOperatingMode(TcasOperatingMode.Standby);
          break;
        case TcasOperatingModeSetting.TAOnly:
          this.setOperatingMode(TcasOperatingMode.TAOnly);
          break;
        case TcasOperatingModeSetting.TA_RA:
          if (this.raAltitudeInhibitFlag.get()) {
            this.setOperatingMode(TcasOperatingMode.TAOnly);
          } else {
            this.setOperatingMode(TcasOperatingMode.TA_RA);
          }
          break;
      }
    });

    this.raAltitudeInhibitFlag.sub(inhibit => {
      if (this.settings.getSetting('trafficOperatingMode').value === TcasOperatingModeSetting.TA_RA) {
        this.setOperatingMode(inhibit ? TcasOperatingMode.TAOnly : TcasOperatingMode.TA_RA);
      }
    });

    this.adsb?.init();

    this.settings.whenSettingChanged('trafficAdsbEnabled').handle(adsbEnabled => {
      const len = this.intrudersSorted.length;
      for (let i = 0; i < len; i++) {
        const intruder = this.intrudersSorted[i];

        intruder.updateBearingDisplayCapabilities(adsbEnabled, this.minAngleForBearing, this.maxAngleForBearing);
      }
    });
  }

  /** @inheritdoc */
  protected createSensitivity(): Epic2TcasIISensitivity {
    return new Epic2TcasIISensitivity();
  }

  /** @inheritdoc */
  protected createIntruderEntry(contact: TrafficContact): Epic2TcasIntruder {
    const intruder = new Epic2TcasIntruder(contact, this.simTime, this.ownAirplanePitch);

    intruder.updateBearingDisplayCapabilities(this.adsb?.getOperatingMode() !== AdsbOperatingMode.Standby, this.minAngleForBearing, this.maxAngleForBearing);

    return intruder;
  }

  /**
   * Updates the TCA predictions for all intruders tracked by this system.
   * @param simTime The current sim time, as a UNIX timestamp in milliseconds.
   */
  protected updateIntruderPredictions(simTime: number): void {
    this.ownAirplane.update(simTime);

    const sensitivity = this.sensitivity.selectParameters();
    const len = this.intrudersSorted.length;
    for (let i = 0; i < len; i++) {
      const intruder = this.intrudersSorted[i];

      intruder.updatePrediction(simTime, this.ownAirplane, sensitivity);
      intruder.updateRelativeElevation();
    }
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
  protected canIssueTrafficAdvisory(simTime: number, intruder: Epic2TcasIntruder): boolean {
    if (this.ownAirplaneSubs.isOnGround.get()) {
      return false;
    }

    if (intruder.alertLevel.get() !== TcasAlertLevel.TrafficAdvisory) {
      const dt = simTime - intruder.taOffTime;
      return dt < 0 || dt >= Epic2TcasII.TA_ON_HYSTERESIS;
    }

    return true;
  }

  /** @inheritdoc */
  protected canCancelTrafficAdvisory(simTime: number, intruder: Epic2TcasIntruder): boolean {
    if (this.ownAirplaneSubs.isOnGround.get()) {
      return true;
    }

    const dt = simTime - intruder.taOnTime;
    return dt < 0 || dt >= Epic2TcasII.TA_OFF_HYSTERESIS;
  }

}

/**
 * An implementation of {@link TCASSensitivity} which provides sensitivity parameters for the Epic2 TCAS-II. When
 * ADS-B is operating, Traffic Advisory sensitivity is selected based on the ADS-B Conflict Situational Awareness (CSA)
 * algorithm. When ADS-B is not operating, Traffic Advisory sensitivity is selected based on the TCAS-II algorithm.
 * Resolution Advisory sensitivity is always determined by the TCAS-II algorithm.
 */
export class Epic2TcasIISensitivity implements TcasSensitivity {
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
   * @param flightArea The active flight area.
   * @param radarAltitude The radar altitude of the own airplane.
   */
  public update(
    adsbMode: AdsbOperatingMode,
    altitude: NumberUnitInterface<UnitFamily.Distance>,
    flightArea: Epic2FlightArea,
    radarAltitude: NumberUnitInterface<UnitFamily.Distance>
  ): void {
    this.tcasIILevel = this.tcasIISensitivity.selectLevel(altitude, radarAltitude);
    this.adsbLevel = this.adsbSensitivity.selectLevel(altitude, flightArea, radarAltitude);

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

