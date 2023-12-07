import { AdcEvents, AvionicsSystemState, AvionicsSystemStateEvent, BaseAdcEvents, BasicAvionicsSystem, EventBus, EventBusMetaEvents, Subscription, SystemPowerKey } from '@microsoft/msfs-sdk';

/**
 * Topics for bus events from which ADC data is sourced.
 */
type AdcDataSourceTopics = 'ias'
  | 'indicated_alt' | 'pressure_alt' | 'vertical_speed'
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
 * A Garmin ADC system.
 */
export class AdcSystem extends BasicAvionicsSystem<AdcSystemEvents> {
  protected initializationTime = 15000;

  private readonly dataSourceTopicMap = {
    [`adc_ias_${this.index}`]: `ias_${this.airspeedIndicatorIndex}`,
    [`adc_tas_${this.index}`]: `indicated_tas_${this.airspeedIndicatorIndex}`,
    [`adc_mach_number_${this.index}`]: `indicated_mach_number_${this.airspeedIndicatorIndex}`,
    [`adc_mach_to_kias_factor_${this.index}`]: `indicated_mach_to_kias_factor_${this.airspeedIndicatorIndex}`,
    [`adc_tas_to_ias_factor_${this.index}`]: `indicated_tas_to_ias_factor_${this.airspeedIndicatorIndex}`,
    [`adc_indicated_alt_${this.index}`]: `indicated_alt_${this.altimeterIndex}`,
    [`adc_altimeter_baro_setting_inhg_${this.index}`]: `altimeter_baro_setting_inhg_${this.altimeterIndex}`,
    [`adc_altimeter_baro_preselect_inhg_${this.index}`]: `altimeter_baro_preselect_inhg_${this.altimeterIndex}`,
    [`adc_altimeter_baro_preselect_mb_${this.index}`]: `altimeter_baro_preselect_mb_${this.altimeterIndex}`,
    [`adc_altimeter_baro_preselect_raw_${this.index}`]: `altimeter_baro_preselect_raw_${this.altimeterIndex}`,
    [`adc_altimeter_baro_is_std_${this.index}`]: `altimeter_baro_is_std_${this.altimeterIndex}`,
    [`adc_pressure_alt_${this.index}`]: 'pressure_alt',
    [`adc_vertical_speed_${this.index}`]: 'vertical_speed',
    [`adc_ambient_temp_c_${this.index}`]: 'ambient_temp_c',
    [`adc_ambient_pressure_inhg_${this.index}`]: 'ambient_pressure_inhg',
    [`adc_isa_temp_c_${this.index}`]: 'isa_temp_c',
    [`adc_ram_air_temp_c_${this.index}`]: 'ram_air_temp_c'
  } as const;

  private readonly dataSourceSubscriber = this.bus.getSubscriber<AdcEvents>();

  private readonly dataSubs: Subscription[] = [];

  /**
   * Creates an instance of an ADC system.
   * @param index The index of the ADC.
   * @param bus An instance of the event bus.
   * @param airspeedIndicatorIndex The index of the sim airspeed indicator from which this ADC derives its data.
   * @param altimeterIndex The index of the sim altimeter from which this ADC derives its data.
   * @param powerSource The {@link ElectricalEvents} topic or electricity logic element to which to connect the
   * system's power.
   */
  constructor(
    index: number,
    bus: EventBus,
    private readonly airspeedIndicatorIndex: number,
    private readonly altimeterIndex: number,
    powerSource?: SystemPowerKey | CompositeLogicXMLElement,
  ) {
    super(index, bus, `adc_state_${index}` as const);

    if (powerSource !== undefined) {
      this.connectToPower(powerSource);
    }

    this.startDataPublish();
  }

  /**
   * Starts publishing ADC data on the event bus.
   */
  private startDataPublish(): void {
    for (const topic of Object.keys(this.dataSourceTopicMap)) {
      if (this.bus.getTopicSubscriberCount(topic) > 0) {
        this.onTopicSubscribed(topic as keyof AdcDataEvents);
      }
    }

    this.bus.getSubscriber<EventBusMetaEvents>().on('event_bus_topic_first_sub').handle(topic => {
      if (topic in this.dataSourceTopicMap) {
        this.onTopicSubscribed(topic as keyof AdcDataEvents);
      }
    });
  }

  /**
   * Responds to when someone first subscribes to one of this system's data topics on the event bus.
   * @param topic The topic that was subscribed to.
   */
  private onTopicSubscribed(topic: keyof AdcDataEvents): void {
    const paused = this.state === AvionicsSystemState.Failed || this.state === AvionicsSystemState.Off;

    this.dataSubs.push(this.dataSourceSubscriber.on(this.dataSourceTopicMap[topic]).handle(val => {
      this.publisher.pub(topic, val, false, true);
    }, paused));
  }

  /** @inheritdoc */
  protected onStateChanged(previousState: AvionicsSystemState | undefined, currentState: AvionicsSystemState): void {
    if (currentState === AvionicsSystemState.Failed || currentState === AvionicsSystemState.Off) {
      for (const sub of this.dataSubs) {
        sub.pause();
      }
    } else {
      for (const sub of this.dataSubs) {
        sub.resume(true);
      }
    }
  }
}