import { AdcEvents, AvionicsSystemState, AvionicsSystemStateEvent, BaseAdcEvents, BasicAvionicsSystem, EventBus, Subscription, SystemPowerKey } from 'msfssdk';

/**
 * Topics for bus events from which ADC data is sourced.
 */
type AdcDataSourceTopics = 'ias' | 'tas' | 'mach_number' | 'mach_to_kias_factor' | 'indicated_alt' | 'pressure_alt'
  | 'vertical_speed' | 'altimeter_baro_setting_inhg' | 'altimeter_baro_preselect_inhg' | 'altimeter_baro_is_std'
  | 'aoa' | 'ambient_temp_c' | 'ambient_pressure_inhg' | 'ram_air_temp_c';

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
}

/**
 * A Garmin ADC system.
 */
export class AdcSystem extends BasicAvionicsSystem<AdcSystemEvents> {

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
    const sub = this.bus.getSubscriber<AdcEvents>();
    const pub = this.bus.getPublisher<AdcSystemEvents>();
    const paused = this.state === AvionicsSystemState.Failed || this.state === AvionicsSystemState.Off;

    this.dataSubs.push(sub.on(`ias_${this.airspeedIndicatorIndex}`).handle(val => { pub.pub(`adc_ias_${this.index}`, val); }, paused));
    this.dataSubs.push(sub.on(`tas_${this.airspeedIndicatorIndex}`).handle(val => { pub.pub(`adc_tas_${this.index}`, val); }, paused));
    this.dataSubs.push(sub.on(`mach_to_kias_factor_${this.airspeedIndicatorIndex}`).handle(val => { pub.pub(`adc_mach_to_kias_factor_${this.index}`, val); }, paused));
    this.dataSubs.push(sub.on(`indicated_alt_${this.altimeterIndex}`).handle(val => { pub.pub(`adc_indicated_alt_${this.index}`, val); }, paused));
    this.dataSubs.push(sub.on(`altimeter_baro_setting_inhg_${this.altimeterIndex}`).handle(val => { pub.pub(`adc_altimeter_baro_setting_inhg_${this.index}`, val); }, paused));
    this.dataSubs.push(sub.on(`altimeter_baro_preselect_inhg_${this.altimeterIndex}`).handle(val => { pub.pub(`adc_altimeter_baro_preselect_inhg_${this.index}`, val); }, paused));
    this.dataSubs.push(sub.on(`altimeter_baro_is_std_${this.altimeterIndex}`).handle(val => { pub.pub(`adc_altimeter_baro_is_std_${this.index}`, val); }, paused));

    this.dataSubs.push(sub.on('mach_number').handle(val => { pub.pub(`adc_mach_number_${this.index}`, val); }, paused));
    this.dataSubs.push(sub.on('pressure_alt').handle(val => { pub.pub(`adc_pressure_alt_${this.index}`, val); }, paused));
    this.dataSubs.push(sub.on('vertical_speed').handle(val => { pub.pub(`adc_vertical_speed_${this.index}`, val); }, paused));
    this.dataSubs.push(sub.on('aoa').handle(val => { pub.pub(`adc_aoa_${this.index}`, val); }, paused));
    this.dataSubs.push(sub.on('ambient_temp_c').handle(val => { pub.pub(`adc_ambient_temp_c_${this.index}`, val); }, paused));
    this.dataSubs.push(sub.on('ambient_pressure_inhg').handle(val => { pub.pub(`adc_ambient_pressure_inhg_${this.index}`, val); }, paused));
    this.dataSubs.push(sub.on('ram_air_temp_c').handle(val => { pub.pub(`adc_ram_air_temp_c_${this.index}`, val); }, paused));
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