/// <reference types="@microsoft/msfs-types/js/simvar" />

import { EventBus, IndexedEventType } from '../data/EventBus';
import { PublishPacer } from '../data/EventBusPacer';
import { SimVarValueType } from '../data/SimVars';
import { AeroMath } from '../math/AeroMath';
import { UnitType } from '../math/NumberUnit';
import { SimVarPublisher, SimVarPublisherEntry } from './BasePublishers';

/**
 * Base events related to air data computer information.
 */
export interface BaseAdcEvents {

  /** The airplane's indicated airspeed, in knots. */
  ias: number;

  /**
   * The airplane's mach number, as calculated from the impact pressure derived from the current indicated airspeed and
   * ambient pressure.
   */
  indicated_mach_number: number;

  /**
   * The airplane's true airspeed, in knots, as calculated from the impact pressure derived from the current indicated
   * airspeed, ambient pressure, and ambient temperature.
   */
  indicated_tas: number;

  /** The airplane's true airspeed, in knots. */
  tas: number;

  /** The airplane's indicated altitude, in feet. */
  indicated_alt: number;

  /** The airplane's pressure altitude, in feet. */
  pressure_alt: number;

  /** The airplane's vertical speed, in feet per minute. */
  vertical_speed: number;

  /** The airplane's radio altitude, in feet. */
  radio_alt: number;

  /** The current altimeter baro setting, in inches of mercury. */
  altimeter_baro_setting_inhg: number;

  /** The current altimeter baro setting, in millibars. */
  altimeter_baro_setting_mb: number;

  /** The current preselected altimeter baro setting, in inches of mercury. */
  altimeter_baro_preselect_inhg: number;

  /** The current preselected altimeter baro setting, in millibars. */
  altimeter_baro_preselect_mb: number;

  /** The current preselected altimeter baro setting, in raw units (1/16th millibar). */
  altimeter_baro_preselect_raw: number;

  /** Whether the altimeter baro setting is set to STD (true=STD, false=set pressure). */
  altimeter_baro_is_std: boolean;

  /** The ambient air density, in slugs per cubic foot */
  ambient_density: number;

  /** The ambient temperature, in degrees Celsius. Same as OAT (Outside Air Temperature). */
  ambient_temp_c: number;

  /** The ambient pressure, in inches of mercury. */
  ambient_pressure_inhg: number;

  /** The current ISA temperature, in degrees Celsius. */
  isa_temp_c: number;

  /** The current ram air temperature, in degrees Celsius. Same as TAT (Total Air Temperature). */
  ram_air_temp_c: number;

  /** The ambient wind velocity, in knots. */
  ambient_wind_velocity: number;

  /** The ambient wind direction, in degrees true. */
  ambient_wind_direction: number;

  /** Whether the plane is on the ground. */
  on_ground: boolean;

  /** The angle of attack, in degrees. */
  aoa: number;

  /** The stall angle of attack of the current aircraft configuration, in degrees. */
  stall_aoa: number;

  /** The zero-lift angle of attack of the current aircraft configuration, in degrees. */
  zero_lift_aoa: number;

  /** The speed of the aircraft in mach. */
  mach_number: number;

  /**
   * The conversion factor from mach to knots indicated airspeed in the airplane's current environment. In other
   * words, the speed of sound in knots indicated airspeed.
   */
  mach_to_kias_factor: number;

  /** The conversion factor from true airspeed to indicated airspeed in the airplane's current environment. */
  tas_to_ias_factor: number;

  /**
   * The conversion factor from indicated mach to knots indicated airspeed in the airplane's current environment.
   */
  indicated_mach_to_kias_factor: number;

  /** The conversion factor from indicated true airspeed to indicated airspeed in the airplane's current environment. */
  indicated_tas_to_ias_factor: number;

  /** The density altitude, in feet */
  density_alt: number;
}

/**
 * Topics indexed by airspeed indicator.
 */
type AdcAirspeedIndexedTopics = 'ias' | 'tas' | 'indicated_tas' | 'indicated_mach_number' | 'mach_to_kias_factor' | 'tas_to_ias_factor'
  | 'indicated_mach_to_kias_factor' | 'indicated_tas_to_ias_factor';

/** Topics indexed by altimeter. */
type AdcAltimeterIndexedTopics = 'indicated_alt' | 'altimeter_baro_setting_inhg' | 'altimeter_baro_setting_mb'
  | 'altimeter_baro_preselect_inhg' | 'altimeter_baro_preselect_mb' | 'altimeter_baro_preselect_raw' | 'altimeter_baro_is_std'

/**
 * Topics related to air data computer information that are indexed.
 */
type AdcIndexedTopics = AdcAirspeedIndexedTopics | AdcAltimeterIndexedTopics;

/**
 * Indexed events related to air data computer information.
 */
type AdcIndexedEvents = {
  [P in keyof Pick<BaseAdcEvents, AdcIndexedTopics> as IndexedEventType<P>]: BaseAdcEvents[P];
};

/**
 * Events related to air data computer information.
 */
export interface AdcEvents extends BaseAdcEvents, AdcIndexedEvents {
}

/**
 * An entry describing indicated airspeed-related topics to publish for a single airspeed indicator index.
 */
type IasTopicEntry = {
  /** The name of the SimVar from which to retrieve indicated airspeed. */
  iasSimVar: string;

  /** The name of the SimVar from which to retrieve indicated airspeed. */
  tasSimVar: string;

  /** The most recently retrieved indicated airspeed value, in knots. */
  kias: number;

  /** The most recently retrieved indicated airspeed value, in meters per second. */
  iasMps: number;

  /** The most recently retrieved true airspeed value, in knots. */
  ktas: number;

  /** The most recently retrieved indicated mach number. */
  indicatedMach: number;

  /** The most recently retrieved indicated true airspeed, in knots. */
  indicatedTas: number;

  /** The topic to which to publish indicated airspeed. */
  iasTopic?: 'ias' | `ias_${number}`;

  /** The topic to which to publish true airspeed. */
  tasTopic?: 'tas' | `tas_${number}`;

  /** The topic to which to publish indicated mach number. */
  indicatedMachTopic?: 'indicated_mach_number' | `indicated_mach_number_${number}`;

  /** The topic to which to publish indicated true airspeed. */
  indicatedTasTopic?: 'indicated_tas' | `indicated_tas_${number}`;

  /** The topic to which to publish the conversion factor from mach number to knots indicated airspeed. */
  machToKiasTopic?: 'mach_to_kias_factor' | `mach_to_kias_factor_${number}`;

  /** The topic to which to publish the conversion factor from true airspeed to indicated airspeed. */
  tasToIasTopic?: 'tas_to_ias_factor' | `tas_to_ias_factor_${number}`;

  /** The topic to which to publish the conversion factor from indicated mach number to knots indicated airspeed. */
  indicatedMachToKiasTopic?: 'indicated_mach_to_kias_factor' | `indicated_mach_to_kias_factor_${number}`;

  /** The topic to which to publish the conversion factor from indicated true airspeed to indicated airspeed. */
  indicatedTasToIasTopic?: 'indicated_tas_to_ias_factor' | `indicated_tas_to_ias_factor_${number}`;
};

/**
 * A publisher for air data computer information.
 */
export class AdcPublisher extends SimVarPublisher<AdcEvents> {
  private static readonly TOPIC_REGEXES = {
    'ias': /^ias(?:_(0|(?:[1-9])\d*))?$/,
    'tas': /^tas(?:_(0|(?:[1-9])\d*))?$/,
    'indicated_mach_number': /^indicated_mach_number(?:_(0|(?:[1-9])\d*))?$/,
    'indicated_tas': /^indicated_tas(?:_(0|(?:[1-9])\d*))?$/,
    'mach_to_kias_factor': /^mach_to_kias_factor(?:_(0|(?:[1-9])\d*))?$/,
    'tas_to_ias_factor': /^tas_to_ias_factor(?:_(0|(?:[1-9])\d*))?$/,
    'indicated_mach_to_kias_factor': /^indicated_mach_to_kias_factor(?:_(0|(?:[1-9])\d*))?$/,
    'indicated_tas_to_ias_factor': /^indicated_tas_to_ias_factor(?:_(0|(?:[1-9])\d*))?$/
  };

  private needRetrievePressure: boolean;
  private needRetrieveTemperature: boolean;
  private needRetrieveMach: boolean;

  private needPublish!: Readonly<{
    /** Whether `mach_number` needs to be published. */
    'mach_number': boolean;

    /** Whether `ambient_pressure_inhg` needs to be published. */
    'ambient_pressure_inhg': boolean;

    /** Whether `ambient_temp_c` needs to be published. */
    'ambient_temp_c': boolean;
  }>;

  private needPublishIasTopics!: Map<number, IasTopicEntry>;

  private pressure: number;
  private temperature: number;
  private mach: number;

  /**
   * Creates an AdcPublisher.
   * @param bus The event bus to which to publish.
   * @param pacer An optional pacer to use to control the rate of publishing.
   */
  public constructor(bus: EventBus, pacer?: PublishPacer<AdcEvents>) {
    const simvars = new Map<keyof AdcEvents, SimVarPublisherEntry<any>>([
      ['indicated_alt', { name: 'INDICATED ALTITUDE:#index#', type: SimVarValueType.Feet, indexed: true }],
      ['altimeter_baro_setting_inhg', { name: 'KOHLSMAN SETTING HG:#index#', type: SimVarValueType.InHG, indexed: true }],
      ['altimeter_baro_setting_mb', { name: 'KOHLSMAN SETTING MB:#index#', type: SimVarValueType.MB, indexed: true }],
      ['altimeter_baro_preselect_raw', { name: 'L:XMLVAR_Baro#index#_SavedPressure', type: SimVarValueType.Number, indexed: true }],
      ['altimeter_baro_preselect_inhg', { name: 'L:XMLVAR_Baro#index#_SavedPressure', type: SimVarValueType.Number, map: raw => UnitType.HPA.convertTo(raw / 16, UnitType.IN_HG), indexed: true }],
      ['altimeter_baro_preselect_mb', { name: 'L:XMLVAR_Baro#index#_SavedPressure', type: SimVarValueType.Number, map: raw => raw / 16, indexed: true }],
      ['altimeter_baro_is_std', { name: 'L:XMLVAR_Baro#index#_ForcedToSTD', type: SimVarValueType.Bool, indexed: true }],

      ['radio_alt', { name: 'RADIO HEIGHT', type: SimVarValueType.Feet }],
      ['pressure_alt', { name: 'PRESSURE ALTITUDE', type: SimVarValueType.Feet }],
      ['vertical_speed', { name: 'VERTICAL SPEED', type: SimVarValueType.FPM }],
      ['ambient_density', { name: 'AMBIENT DENSITY', type: SimVarValueType.SlugsPerCubicFoot }],
      ['isa_temp_c', { name: 'STANDARD ATM TEMPERATURE', type: SimVarValueType.Celsius }],
      ['ram_air_temp_c', { name: 'TOTAL AIR TEMPERATURE', type: SimVarValueType.Celsius }],
      ['ambient_wind_velocity', { name: 'AMBIENT WIND VELOCITY', type: SimVarValueType.Knots }],
      ['ambient_wind_direction', { name: 'AMBIENT WIND DIRECTION', type: SimVarValueType.Degree }],
      ['on_ground', { name: 'SIM ON GROUND', type: SimVarValueType.Bool }],
      ['aoa', { name: 'INCIDENCE ALPHA', type: SimVarValueType.Degree }],
      ['stall_aoa', { name: 'STALL ALPHA', type: SimVarValueType.Degree }],
      ['zero_lift_aoa', { name: 'ZERO LIFT ALPHA', type: SimVarValueType.Degree }],
      ['density_alt', { name: 'DENSITY ALTITUDE', type: SimVarValueType.Feet }],
    ]);

    super(simvars, bus, pacer);

    this.needPublish ??= {
      'mach_number': false,
      'ambient_pressure_inhg': false,
      'ambient_temp_c': false
    };
    this.needPublishIasTopics ??= new Map();

    this.needRetrievePressure ??= false;
    this.needRetrieveTemperature ??= false;
    this.needRetrieveMach ??= false;

    this.pressure ??= 1013.25;
    this.temperature ??= 0;
    this.mach ??= 0;
  }

  /** @inheritDoc */
  protected handleSubscribedTopic(topic: string): void {
    this.needPublish ??= {
      'mach_number': false,
      'ambient_pressure_inhg': false,
      'ambient_temp_c': false
    };
    this.needPublishIasTopics ??= new Map();

    if (
      this.resolvedSimVars.has(topic as any)
      || topic in this.needPublish
      || AdcPublisher.TOPIC_REGEXES['ias'].test(topic)
      || AdcPublisher.TOPIC_REGEXES['tas'].test(topic)
      || AdcPublisher.TOPIC_REGEXES['indicated_mach_number'].test(topic)
      || AdcPublisher.TOPIC_REGEXES['indicated_tas'].test(topic)
      || AdcPublisher.TOPIC_REGEXES['mach_to_kias_factor'].test(topic)
      || AdcPublisher.TOPIC_REGEXES['tas_to_ias_factor'].test(topic)
      || AdcPublisher.TOPIC_REGEXES['indicated_mach_to_kias_factor'].test(topic)
      || AdcPublisher.TOPIC_REGEXES['indicated_tas_to_ias_factor'].test(topic)
    ) {
      // If topic matches an already resolved topic -> start publishing.
      this.onTopicSubscribed(topic as keyof AdcEvents);
    } else {
      // Check if topic matches indexed topic.
      this.tryMatchIndexedSubscribedTopic(topic);
    }
  }

  /** @inheritDoc */
  protected onTopicSubscribed(topic: keyof AdcEvents): void {
    if (topic in this.needPublish) {
      (this.needPublish as any)[topic] = true;

      switch (topic) {
        case 'ambient_pressure_inhg':
          this.needRetrievePressure = true;
          if (this.publishActive) {
            this.retrieveAmbientPressure(true);
          }
          break;
        case 'ambient_temp_c':
          this.needRetrieveTemperature = true;
          if (this.publishActive) {
            this.retrieveAmbientTemperature(true);
          }
          break;
        case 'mach_number':
          this.needRetrieveMach = true;
          if (this.publishActive) {
            this.retrieveMach(true);
          }
          break;
      }
    } else if (AdcPublisher.TOPIC_REGEXES['ias'].test(topic)) {
      const indexMatch = (topic.match(AdcPublisher.TOPIC_REGEXES['ias']) as RegExpMatchArray)[1];
      const index = indexMatch ? parseInt(indexMatch) : -1;

      const entry = this.getOrCreateIasTopicEntry(index);
      entry.iasTopic = index < 0 ? 'ias' : `ias_${index}`;

      if (this.publishActive) {
        this.retrieveIas(entry, true);
      }
    } else if (AdcPublisher.TOPIC_REGEXES['tas'].test(topic)) {
      const indexMatch = (topic.match(AdcPublisher.TOPIC_REGEXES['tas']) as RegExpMatchArray)[1];
      const index = indexMatch ? parseInt(indexMatch) : -1;

      const entry = this.getOrCreateIasTopicEntry(index);
      entry.tasTopic = index < 0 ? 'tas' : `tas_${index}`;

      if (this.publishActive) {
        this.retrieveTas(entry, true);
      }
    } else if (AdcPublisher.TOPIC_REGEXES['indicated_mach_number'].test(topic)) {
      const indexMatch = (topic.match(AdcPublisher.TOPIC_REGEXES['indicated_mach_number']) as RegExpMatchArray)[1];
      const index = indexMatch ? parseInt(indexMatch) : -1;

      this.needRetrievePressure = true;

      const entry = this.getOrCreateIasTopicEntry(index);
      entry.indicatedMachTopic = index < 0 ? 'indicated_mach_number' : `indicated_mach_number_${index}`;

      if (this.publishActive) {
        this.retrieveAmbientPressure(false);
        this.retrieveIas(entry, false);
        this.retrieveIndicatedMach(entry, true);
      }
    } else if (AdcPublisher.TOPIC_REGEXES['indicated_tas'].test(topic)) {
      const indexMatch = (topic.match(AdcPublisher.TOPIC_REGEXES['indicated_tas']) as RegExpMatchArray)[1];
      const index = indexMatch ? parseInt(indexMatch) : -1;

      this.needRetrievePressure = true;
      this.needRetrieveTemperature = true;

      const entry = this.getOrCreateIasTopicEntry(index);
      entry.indicatedTasTopic = index < 0 ? 'indicated_tas' : `indicated_tas_${index}`;

      if (this.publishActive) {
        this.retrieveAmbientPressure(false);
        this.retrieveAmbientTemperature(false);
        this.retrieveIas(entry, false);
        this.retrieveIndicatedTas(entry, true);
      }
    } else if (AdcPublisher.TOPIC_REGEXES['mach_to_kias_factor'].test(topic)) {
      const indexMatch = (topic.match(AdcPublisher.TOPIC_REGEXES['mach_to_kias_factor']) as RegExpMatchArray)[1];
      const index = indexMatch ? parseInt(indexMatch) : -1;

      this.needRetrievePressure = true;
      this.needRetrieveMach = true;

      const entry = this.getOrCreateIasTopicEntry(index);
      entry.machToKiasTopic = index < 0 ? 'mach_to_kias_factor' : `mach_to_kias_factor_${index}`;

      if (this.publishActive) {
        this.retrieveAmbientPressure(false);
        this.retrieveMach(false);
        this.retrieveIas(entry, false);
        this.publishMachToKias(entry);
      }
    } else if (AdcPublisher.TOPIC_REGEXES['tas_to_ias_factor'].test(topic)) {
      const indexMatch = (topic.match(AdcPublisher.TOPIC_REGEXES['tas_to_ias_factor']) as RegExpMatchArray)[1];
      const index = indexMatch ? parseInt(indexMatch) : -1;

      this.needRetrievePressure = true;
      this.needRetrieveTemperature = true;

      const entry = this.getOrCreateIasTopicEntry(index);
      entry.tasToIasTopic = index < 0 ? 'tas_to_ias_factor' : `tas_to_ias_factor_${index}`;

      if (this.publishActive) {
        this.retrieveAmbientPressure(false);
        this.retrieveAmbientTemperature(false);
        this.retrieveIas(entry, false);
        this.retrieveTas(entry, false);
        this.publishTasToIas(entry);
      }
    } else if (AdcPublisher.TOPIC_REGEXES['indicated_mach_to_kias_factor'].test(topic)) {
      const indexMatch = (topic.match(AdcPublisher.TOPIC_REGEXES['indicated_mach_to_kias_factor']) as RegExpMatchArray)[1];
      const index = indexMatch ? parseInt(indexMatch) : -1;

      this.needRetrievePressure = true;

      const entry = this.getOrCreateIasTopicEntry(index);
      entry.indicatedMachToKiasTopic = index < 0 ? 'indicated_mach_to_kias_factor' : `indicated_mach_to_kias_factor_${index}`;

      if (this.publishActive) {
        this.retrieveAmbientPressure(false);
        this.retrieveIas(entry, false);
        this.retrieveIndicatedMach(entry, false);
        this.publishIndicatedMachToKias(entry);
      }
    } else if (AdcPublisher.TOPIC_REGEXES['indicated_tas_to_ias_factor'].test(topic)) {
      const indexMatch = (topic.match(AdcPublisher.TOPIC_REGEXES['indicated_tas_to_ias_factor']) as RegExpMatchArray)[1];
      const index = indexMatch ? parseInt(indexMatch) : -1;

      this.needRetrievePressure = true;
      this.needRetrieveTemperature = true;

      const entry = this.getOrCreateIasTopicEntry(index);
      entry.indicatedTasToIasTopic = index < 0 ? 'indicated_tas_to_ias_factor' : `indicated_tas_to_ias_factor_${index}`;

      if (this.publishActive) {
        this.retrieveAmbientPressure(false);
        this.retrieveAmbientTemperature(false);
        this.retrieveIas(entry, false);
        this.retrieveIndicatedTas(entry, false);
        this.publishIndicatedTasToIas(entry);
      }
    } else {
      super.onTopicSubscribed(topic);
    }
  }

  /**
   * Gets the entry describing indicated airspeed-related topics to publish for a given airspeed indicator index, or
   * creates a new one if it does not exist.
   * @param index The airspeed indicator index for which to get an entry, or `-1` for the un-indexed airspeed
   * indicator.
   * @returns An entry describing indicated airspeed-related topics to publish for the specified airspeed indicator
   * index.
   */
  private getOrCreateIasTopicEntry(index: number): IasTopicEntry {
    let entry = this.needPublishIasTopics.get(index);
    if (!entry) {
      entry = {
        iasSimVar: index < 0 ? 'AIRSPEED INDICATED:1' : `AIRSPEED INDICATED:${index}`,
        tasSimVar: index < 0 ? 'AIRSPEED TRUE:1' : `AIRSPEED TRUE:${index}`,
        kias: 0,
        iasMps: 0,
        ktas: 0,
        indicatedMach: 0,
        indicatedTas: 0
      };
      this.needPublishIasTopics.set(index, entry);
    }
    return entry;
  }

  /** @inheritDoc */
  public onUpdate(): void {
    const isSlewing = SimVar.GetSimVarValue('IS SLEW ACTIVE', 'bool');
    if (!isSlewing) {
      if (this.needRetrievePressure) {
        this.retrieveAmbientPressure(this.needPublish['ambient_pressure_inhg']);
      }
      if (this.needRetrieveTemperature) {
        this.retrieveAmbientTemperature(this.needPublish['ambient_temp_c']);
      }
      if (this.needRetrieveMach) {
        this.retrieveMach(this.needPublish['mach_number']);
      }

      for (const entry of this.needPublishIasTopics.values()) {
        this.retrieveIas(entry, true);
        if (entry.tasTopic || entry.tasToIasTopic) {
          this.retrieveTas(entry, true);
        }
        if (entry.indicatedMachTopic || entry.indicatedMachToKiasTopic) {
          this.retrieveIndicatedMach(entry, true);
        }
        if (entry.indicatedTasTopic || entry.indicatedTasToIasTopic) {
          this.retrieveIndicatedTas(entry, true);
        }
        this.publishMachToKias(entry);
        this.publishTasToIas(entry);
        this.publishIndicatedMachToKias(entry);
        this.publishIndicatedTasToIas(entry);
      }

      super.onUpdate();
    }
  }

  /**
   * Retrieves and optionally publishes the current ambient pressure.
   * @param publish Whether to publish the value.
   */
  private retrieveAmbientPressure(publish: boolean): void {
    const pressureInHg = SimVar.GetSimVarValue('AMBIENT PRESSURE', SimVarValueType.InHG);
    this.pressure = UnitType.IN_HG.convertTo(pressureInHg, UnitType.HPA);
    publish && this.publish('ambient_pressure_inhg', pressureInHg);
  }

  /**
   * Retrieves and optionally publishes the current ambient temperature.
   * @param publish Whether to publish the value.
   */
  private retrieveAmbientTemperature(publish: boolean): void {
    this.temperature = SimVar.GetSimVarValue('AMBIENT TEMPERATURE', SimVarValueType.Celsius);
    publish && this.publish('ambient_temp_c', this.temperature);
  }

  /**
   * Retrieves and optionally publishes the airplane's current mach number.
   * @param publish Whether to publish the value.
   */
  private retrieveMach(publish: boolean): void {
    this.mach = SimVar.GetSimVarValue('AIRSPEED MACH', SimVarValueType.Mach);
    publish && this.publish('mach_number', this.mach);
  }

  /**
   * Retrieves and optionally publishes the current indicated airspeed for an airspeed indicator index.
   * @param entry The entry for the airspeed indicator index for which to retrieve the value.
   * @param publish Whether to publish the value.
   */
  private retrieveIas(entry: IasTopicEntry, publish: boolean): void {
    entry.kias = SimVar.GetSimVarValue(entry.iasSimVar, SimVarValueType.Knots);
    entry.iasMps = UnitType.KNOT.convertTo(entry.kias, UnitType.MPS);
    publish && entry.iasTopic && this.publish(entry.iasTopic, entry.kias);
  }

  /**
   * Retrieves and optionally publishes the current true airspeed for an airspeed indicator index.
   * @param entry The entry for the airspeed indicator index for which to retrieve the value.
   * @param publish Whether to publish the value.
   */
  private retrieveTas(entry: IasTopicEntry, publish: boolean): void {
    entry.ktas = SimVar.GetSimVarValue(entry.tasSimVar, SimVarValueType.Knots);
    publish && entry.tasTopic && this.publish(entry.tasTopic, entry.ktas);
  }

  /**
   * Retrieves and optionally publishes the current indicated mach number for an airspeed indicator index.
   * @param entry The entry for the airspeed indicator index for which to retrieve the value.
   * @param publish Whether to publish the value.
   */
  private retrieveIndicatedMach(entry: IasTopicEntry, publish: boolean): void {
    entry.indicatedMach = AeroMath.casToMach(entry.iasMps, this.pressure);
    publish && entry.indicatedMachTopic && this.publish(entry.indicatedMachTopic, entry.indicatedMach);
  }

  /**
   * Retrieves and optionally publishes the current indicated true airspeed for an airspeed indicator index.
   * @param entry The entry for the airspeed indicator index for which to retrieve the value.
   * @param publish Whether to publish the value.
   */
  private retrieveIndicatedTas(entry: IasTopicEntry, publish: boolean): void {
    entry.indicatedTas = UnitType.MPS.convertTo(AeroMath.casToTas(entry.iasMps, this.pressure, this.temperature), UnitType.KNOT);
    publish && entry.indicatedTasTopic && this.publish(entry.indicatedTasTopic, entry.indicatedTas);
  }

  /**
   * Publishes the current conversion factor from mach number to knots indicated airspeed for an airspeed indicator
   * index.
   * @param entry The entry for the airspeed indicator index for which to publish the value.
   */
  private publishMachToKias(entry: IasTopicEntry): void {
    if (!entry.machToKiasTopic) {
      return;
    }

    const factor = entry.kias < 1 || this.mach === 0
      ? 1 / AeroMath.casToMach(1, this.pressure)
      : entry.kias / this.mach;

    this.publish(entry.machToKiasTopic, isFinite(factor) ? factor : 1);
  }

  /**
   * Publishes the current conversion factor from true airspeed to indicated airspeed for an airspeed indicator index.
   * @param entry The entry for the airspeed indicator index for which to publish the value.
   */
  private publishTasToIas(entry: IasTopicEntry): void {
    if (!entry.tasToIasTopic) {
      return;
    }

    const factor = entry.kias < 1 || entry.ktas === 0
      ? 1 / AeroMath.casToTas(1, this.pressure, this.temperature)
      : entry.kias / entry.ktas;

    this.publish(entry.tasToIasTopic, isFinite(factor) ? factor : 1);
  }

  /**
   * Publishes the current conversion factor from indicated mach number to knots indicated airspeed for an airspeed
   * indicator index.
   * @param entry The entry for the airspeed indicator index for which to publish the value.
   */
  private publishIndicatedMachToKias(entry: IasTopicEntry): void {
    if (!entry.indicatedMachToKiasTopic) {
      return;
    }

    const factor = entry.kias < 1 || entry.indicatedMach === 0
      ? 1 / AeroMath.casToMach(1, this.pressure)
      : entry.kias / entry.indicatedMach;

    this.publish(entry.indicatedMachToKiasTopic, isFinite(factor) ? factor : 1);
  }

  /**
   * Publishes the current conversion factor from indicated true airspeed to indicated airspeed for an airspeed
   * indicator index.
   * @param entry The entry for the airspeed indicator index for which to publish the value.
   */
  private publishIndicatedTasToIas(entry: IasTopicEntry): void {
    if (!entry.indicatedTasToIasTopic) {
      return;
    }

    const factor = entry.kias < 1 || entry.indicatedTas === 0
      ? 1 / AeroMath.casToTas(1, this.pressure, this.temperature)
      : entry.kias / entry.indicatedTas;

    this.publish(entry.indicatedTasToIasTopic, isFinite(factor) ? factor : 1);
  }
}
