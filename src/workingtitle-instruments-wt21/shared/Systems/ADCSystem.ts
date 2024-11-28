import {
  AdcEvents, AvionicsSystemState, AvionicsSystemStateEvent, BaseAdcEvents, BasicAvionicsSystem, EventBus,
  EventBusMetaEvents, Subject, Subscription
} from '@microsoft/msfs-sdk';
import { AdcDefinition } from '../Config';

/**
 * Topics for bus events from which ADC data is sourced.
 */
type AdcDataSourceTopics = 'ias'
  | 'indicated_alt' | 'pressure_alt' | 'radio_alt' | 'vertical_speed'
  | 'altimeter_baro_setting_inhg' | 'altimeter_baro_preselect_inhg' | 'altimeter_baro_preselect_mb' | 'altimeter_baro_preselect_raw' | 'altimeter_baro_is_std'
  | 'ambient_temp_c' | 'ambient_pressure_inhg' | 'isa_temp_c' | 'ram_air_temp_c';

/**
 * Data events published by the ADC system.
 */
type AdcDataEvents = {
  [P in keyof Pick<BaseAdcEvents, AdcDataSourceTopics> as `adc_${P}_${number}`]: BaseAdcEvents[P];
};

/**
 * Events fired by the ADC system.
 */
export interface AdcSystemEvents extends AdcDataEvents {
  /** An event fired when the ADC system state changes. */
  [adc_state: `adc_state_${number}`]: AvionicsSystemStateEvent;

  /** An event fired when the ADC system state changes. */
  [adc_altitude_data_valid: `adc_altitude_data_valid_${number}`]: boolean;

  /** An event fired when the ADC system state changes. */
  [adc_airspeed_data_valid: `adc_airspeed_data_valid_${number}`]: boolean;

  /** An event fired when the ADC system state changes. */
  [adc_temperature_data_valid: `adc_temperature_data_valid_${number}`]: boolean;

  /** The airplane's measured true airspeed, in knots. */
  [adc_tas: `adc_tas_${number}`]: number;

  /** The airplane's measured mach number. */
  [adc_mach_number: `adc_mach_number_${number}`]: number;

  /** The conversion factor from measured mach number to knots indicated airspeed in the airplane's current environment. */
  [adc_mach_to_kias_factor: `adc_mach_to_kias_factor_${number}`]: number;

  /** The conversion factor from measured true airspeed to knots indicated airspeed in the airplane's current environment. */
  [adc_tas_to_ias_factor: `adc_tas_to_ias_factor_${number}`]: number;
}

/**
 * A WT21 ADC system.
 */
export class AdcSystem extends BasicAvionicsSystem<AdcSystemEvents> {
  protected initializationTime = 4000;

  private isAltitudeDataValid = true;
  private isAirspeedDataValid = true;
  private isTemperatureDataValid = true;

  private readonly altitudeDataSourceTopicMap = {
    [`adc_indicated_alt_${this.index}`]: `indicated_alt_${this.definition.altimeterIndex}`,
    [`adc_radio_alt_${this.index}`]: 'radio_alt',
    [`adc_pressure_alt_${this.index}`]: 'pressure_alt',
    [`adc_vertical_speed_${this.index}`]: 'vertical_speed',
    [`adc_ambient_pressure_inhg_${this.index}`]: 'ambient_pressure_inhg'
  } as const;

  private readonly airspeedDataSourceTopicMap = {
    [`adc_ias_${this.index}`]: `ias_${this.definition.airspeedIndicatorIndex}`,
    [`adc_mach_number_${this.index}`]: `indicated_mach_number_${this.definition.airspeedIndicatorIndex}`,
    [`adc_mach_to_kias_factor_${this.index}`]: `indicated_mach_to_kias_factor_${this.definition.airspeedIndicatorIndex}`
  } as const;

  private readonly temperatureDataSourceTopicMap = {
    [`adc_tas_${this.index}`]: `indicated_tas_${this.definition.airspeedIndicatorIndex}`,
    [`adc_tas_to_ias_factor_${this.index}`]: `indicated_tas_to_ias_factor_${this.definition.airspeedIndicatorIndex}`,
    [`adc_ambient_temp_c_${this.index}`]: 'ambient_temp_c',
    [`adc_isa_temp_c_${this.index}`]: 'isa_temp_c',
    [`adc_ram_air_temp_c_${this.index}`]: 'ram_air_temp_c'
  } as const;

  private readonly otherDataSourceTopicMap = {
    [`adc_altimeter_baro_setting_inhg_${this.index}`]: `altimeter_baro_setting_inhg_${this.definition.altimeterIndex}`,
    [`adc_altimeter_baro_preselect_inhg_${this.index}`]: `altimeter_baro_preselect_inhg_${this.definition.altimeterIndex}`,
    [`adc_altimeter_baro_preselect_mb_${this.index}`]: `altimeter_baro_preselect_mb_${this.definition.altimeterIndex}`,
    [`adc_altimeter_baro_preselect_raw_${this.index}`]: `altimeter_baro_preselect_raw_${this.definition.altimeterIndex}`,
    [`adc_altimeter_baro_is_std_${this.index}`]: `altimeter_baro_is_std_${this.definition.altimeterIndex}`
  } as const;

  private readonly dataSourceSubscriber = this.bus.getSubscriber<AdcEvents>();

  private readonly altitudeDataSubs: Subscription[] = [];
  private readonly airspeedDataSubs: Subscription[] = [];
  private readonly temperatureDataSubs: Subscription[] = [];
  private readonly otherDataSubs: Subscription[] = [];

  /**
   * Creates an instance of an ADC system.
   * @param index The index of the ADC.
   * @param bus An instance of the event bus.
   * @param definition The ADC config definition
   */
  public constructor(
    index: number,
    bus: EventBus,
    private readonly definition: AdcDefinition,
  ) {
    super(index, bus, `adc_state_${index}` as const);

    this.publisher.pub(`adc_altitude_data_valid_${this.index}`, this.isAltitudeDataValid, false, true);
    this.publisher.pub(`adc_airspeed_data_valid_${this.index}`, this.isAirspeedDataValid, false, true);
    this.publisher.pub(`adc_temperature_data_valid_${this.index}`, this.isTemperatureDataValid, false, true);

    this.connectToPower(this.definition.electricity ?? Subject.create(true));

    this.startDataPublish();
  }

  /**
   * Starts publishing ADC data on the event bus.
   */
  private startDataPublish(): void {
    for (const topic in this.altitudeDataSourceTopicMap) {
      if (this.bus.getTopicSubscriberCount(topic) > 0) {
        this.onTopicSubscribed(topic as keyof AdcDataEvents, this.altitudeDataSourceTopicMap[topic], this.altitudeDataSubs, this.isAltitudeDataValid);
      }
    }
    for (const topic in this.airspeedDataSourceTopicMap) {
      if (this.bus.getTopicSubscriberCount(topic) > 0) {
        this.onTopicSubscribed(topic as keyof AdcDataEvents, this.airspeedDataSourceTopicMap[topic], this.airspeedDataSubs, this.isAirspeedDataValid);
      }
    }
    for (const topic in this.temperatureDataSourceTopicMap) {
      if (this.bus.getTopicSubscriberCount(topic) > 0) {
        this.onTopicSubscribed(topic as keyof AdcDataEvents, this.temperatureDataSourceTopicMap[topic], this.temperatureDataSubs, this.isTemperatureDataValid);
      }
    }
    for (const topic in this.otherDataSourceTopicMap) {
      if (this.bus.getTopicSubscriberCount(topic) > 0) {
        this.onTopicSubscribed(topic as keyof AdcDataEvents, this.otherDataSourceTopicMap[topic], this.otherDataSubs, true);
      }
    }

    this.bus.getSubscriber<EventBusMetaEvents>().on('event_bus_topic_first_sub').handle(topic => {
      if (topic in this.altitudeDataSourceTopicMap) {
        this.onTopicSubscribed(topic as keyof AdcDataEvents, this.altitudeDataSourceTopicMap[topic], this.altitudeDataSubs, this.isAltitudeDataValid);
      } else if (topic in this.airspeedDataSourceTopicMap) {
        this.onTopicSubscribed(topic as keyof AdcDataEvents, this.airspeedDataSourceTopicMap[topic], this.airspeedDataSubs, this.isAirspeedDataValid);
      } else if (topic in this.temperatureDataSourceTopicMap) {
        this.onTopicSubscribed(topic as keyof AdcDataEvents, this.temperatureDataSourceTopicMap[topic], this.temperatureDataSubs, this.isTemperatureDataValid);
      } else if (topic in this.otherDataSourceTopicMap) {
        this.onTopicSubscribed(topic as keyof AdcDataEvents, this.otherDataSourceTopicMap[topic], this.otherDataSubs, true);
      }
    });
  }

  /**
   * Responds to when someone first subscribes to one of this system's data topics on the event bus.
   * @param topic The topic that was subscribed to.
   * @param sourceTopic The topic that is the data source of the subscribed topic.
   * @param dataSubArray The array to which to add the data source subscription created for the subscribed topoic.
   * @param isDataValid Whether the data published to the subscribed topic is currently valid.
   */
  private onTopicSubscribed(
    topic: keyof AdcDataEvents,
    sourceTopic: keyof AdcEvents,
    dataSubArray: Subscription[],
    isDataValid: boolean
  ): void {
    dataSubArray.push(
      this.dataSourceSubscriber.on(sourceTopic).handle(val => {
        this.publisher.pub(topic, val, false, true);
      }, !isDataValid)
    );
  }

  /** @inheritDoc */
  protected onStateChanged(previousState: AvionicsSystemState | undefined, currentState: AvionicsSystemState): void {
    const wasAltitudeDataValid = this.isAltitudeDataValid;
    const wasAirspeedDataValid = this.isAirspeedDataValid;
    const wasTemperatureDataValid = this.isTemperatureDataValid;

    if (currentState === AvionicsSystemState.On) {
      this.isAltitudeDataValid = true;
      this.isAirspeedDataValid = true;
      this.isTemperatureDataValid = true;

      for (const sub of this.altitudeDataSubs) {
        sub.resume(true);
      }
      for (const sub of this.airspeedDataSubs) {
        sub.resume(true);
      }
      for (const sub of this.temperatureDataSubs) {
        sub.resume(true);
      }
    } else {
      this.isAltitudeDataValid = false;
      this.isAirspeedDataValid = false;
      this.isTemperatureDataValid = false;

      for (const sub of this.altitudeDataSubs) {
        sub.pause();
      }
      for (const sub of this.airspeedDataSubs) {
        sub.pause();
      }
      for (const sub of this.temperatureDataSubs) {
        sub.pause();
      }
    }

    wasAltitudeDataValid !== this.isAltitudeDataValid && this.publisher.pub(`adc_altitude_data_valid_${this.index}`, this.isAltitudeDataValid, false, true);
    wasAirspeedDataValid !== this.isAirspeedDataValid && this.publisher.pub(`adc_airspeed_data_valid_${this.index}`, this.isAirspeedDataValid, false, true);
    wasTemperatureDataValid !== this.isTemperatureDataValid && this.publisher.pub(`adc_temperature_data_valid_${this.index}`, this.isTemperatureDataValid, false, true);
  }
}
