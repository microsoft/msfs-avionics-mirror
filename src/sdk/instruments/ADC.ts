/// <reference types="@microsoft/msfs-types/js/simvar" />

import { EventBus, IndexedEventType } from '../data/EventBus';
import { PublishPacer } from '../data/EventBusPacer';
import { SimVarValueType } from '../data/SimVars';
import { UnitType } from '../math/NumberUnit';
import { SimVarPublisher, SimVarPublisherEntry } from './BasePublishers';

/**
 * Base events related to air data computer information.
 */
export interface BaseAdcEvents {

  /** The airplane's indicated airspeed, in knots. */
  ias: number;

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

  /** The ambient temperature, in degrees Celsius. */
  ambient_temp_c: number;

  /** The ambient pressure, in inches of mercury. */
  ambient_pressure_inhg: number;

  /** The current ISA temperature, in degrees Celsius. */
  isa_temp_c: number;

  /** The current ram air temperature, in degrees Celsius. */
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
}

/**
 * Topics indexed by airspeed indicator.
 */
type AdcAirspeedIndexedTopics = 'ias' | 'tas' | 'mach_to_kias_factor';

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
 * A publisher for air data computer information.
 */
export class AdcPublisher extends SimVarPublisher<AdcEvents> {
  private mach: number;
  private needUpdateMach: boolean;

  /**
   * Creates an AdcPublisher.
   * @param bus The event bus to which to publish.
   * @param pacer An optional pacer to use to control the rate of publishing.
   */
  public constructor(bus: EventBus, pacer?: PublishPacer<AdcEvents>) {
    const simvars = new Map<keyof AdcEvents, SimVarPublisherEntry<any>>([
      ['ias', { name: 'AIRSPEED INDICATED:#index#', type: SimVarValueType.Knots, indexed: true }],
      ['tas', { name: 'AIRSPEED TRUE:#index#', type: SimVarValueType.Knots, indexed: true }],
      [
        'mach_to_kias_factor',
        {
          name: 'AIRSPEED INDICATED:#index#',
          type: SimVarValueType.Knots,
          map: (kias: number): number => {
            const factor = kias < 1 ? Simplane.getMachToKias(1) : kias / this.mach;
            return isFinite(factor) ? factor : 1;
          },
          indexed: true
        }
      ],

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
      ['ambient_temp_c', { name: 'AMBIENT TEMPERATURE', type: SimVarValueType.Celsius }],
      ['ambient_pressure_inhg', { name: 'AMBIENT PRESSURE', type: SimVarValueType.InHG }],
      ['isa_temp_c', { name: 'STANDARD ATM TEMPERATURE', type: SimVarValueType.Celsius }],
      ['ram_air_temp_c', { name: 'TOTAL AIR TEMPERATURE', type: SimVarValueType.Celsius }],
      ['ambient_wind_velocity', { name: 'AMBIENT WIND VELOCITY', type: SimVarValueType.Knots }],
      ['ambient_wind_direction', { name: 'AMBIENT WIND DIRECTION', type: SimVarValueType.Degree }],
      ['on_ground', { name: 'SIM ON GROUND', type: SimVarValueType.Bool }],
      ['aoa', { name: 'INCIDENCE ALPHA', type: SimVarValueType.Degree }],
      ['stall_aoa', { name: 'STALL ALPHA', type: SimVarValueType.Degree }],
      ['zero_lift_aoa', { name: 'ZERO LIFT ALPHA', type: SimVarValueType.Degree }],
      ['mach_number', { name: 'AIRSPEED MACH', type: SimVarValueType.Mach }],
    ]);

    super(simvars, bus, pacer);

    this.mach = 0;
    this.needUpdateMach ??= false;
  }

  /** @inheritdoc */
  protected onTopicSubscribed(topic: keyof AdcEvents): void {
    super.onTopicSubscribed(topic);

    if (topic.startsWith('mach_to_kias_factor')) {
      this.needUpdateMach = true;
    }
  }

  /** @inheritdoc */
  public onUpdate(): void {
    const isSlewing = SimVar.GetSimVarValue('IS SLEW ACTIVE', 'bool');
    if (!isSlewing) {
      if (this.needUpdateMach) {
        this.mach = SimVar.GetSimVarValue('AIRSPEED MACH', SimVarValueType.Number);
      }

      super.onUpdate();
    }
  }
}
