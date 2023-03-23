import { AvionicsSystemStateEvent, BasicAvionicsSystem, EventBus } from '@microsoft/msfs-sdk';

/**
 * The ADC system.
 */
export class ADCSystem extends BasicAvionicsSystem<ADCSystemEvents> {
  protected initializationTime = 4000;

  /**
   * Creates an instance of the ADCSystem.
   * @param index The index of the system.
   * @param bus The instance of the event bus for the system to use.
   */
  constructor(public readonly index: number, protected readonly bus: EventBus) {
    super(index, bus, 'adc_state');
    this.connectToPower('elec_av1_bus');
  }
}

/**
 * Events fired by the magnetometer system.
 */
export interface ADCSystemEvents {
  /** An event fired when the ADC system state changes. */
  'adc_state': AvionicsSystemStateEvent;
}