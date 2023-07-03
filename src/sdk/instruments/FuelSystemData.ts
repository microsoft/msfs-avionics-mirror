/// <reference types="@microsoft/msfs-types/js/simvar" />

import { EventBus, IndexedEventType } from '../data/EventBus';
import { PublishPacer } from '../data/EventBusPacer';
import { SimVarValueType } from '../data/SimVars';
import { SimVarPublisher, SimVarPublisherEntry } from './BasePublishers';

/**
 * Events for fuel system:
 */
export interface BaseFuelSystemEvents {
  /** The valve's switch: */
  fuel_system_valve_switch: boolean;

  /** The valve's actual continous position, in percent, 0 ... 1 */
  fuel_system_valve_open: number;

  /** The pump's switch state */
  fuel_system_pump_switch: boolean;

  /** The pump's active state (ex. false when pump is on but no fuel in tank) */
  fuel_system_pump_active: boolean;

  /** The engines's fuel pressure in psi. */
  fuel_system_engine_pressure: number;

  /** The pressure of a fuel line in psi. */
  fuel_system_line_pressure: number;

  /** The fuel flow of a fuel line in gallons per hour. */
  fuel_system_line_flow: number;

  /** The quantity of fuel in the selected tank (by tank index), in gallons. */
  fuel_system_tank_quantity: number;
}

/** Indexed topics. */
type IndexedTopics = 'fuel_system_valve_switch' | 'fuel_system_valve_open' | 'fuel_system_pump_switch' | 'fuel_system_pump_active' |
  'fuel_system_engine_pressure' | 'fuel_system_line_pressure' | 'fuel_system_line_flow' | 'fuel_system_tank_quantity';


/** Indexed events. */
type FuelSystemIndexedEvents = {
  [P in keyof Pick<BaseFuelSystemEvents, IndexedTopics> as IndexedEventType<P>]: BaseFuelSystemEvents[P];
};

/**
 * Events related to fuel system information.
 */
export interface FuelSystemEvents extends BaseFuelSystemEvents, FuelSystemIndexedEvents {
}

/**
 * A publisher for fuel system information.
 */
export class FuelSystemSimVarPublisher extends SimVarPublisher<FuelSystemEvents> {
  /**
   * Create an FuelSystemSimvarPublisher
   * @param bus The EventBus to publish to
   * @param pacer An optional pacer to use to control the rate of publishing
   */
  public constructor(bus: EventBus, pacer: PublishPacer<FuelSystemEvents> | undefined = undefined) {
    const simvars = new Map<keyof FuelSystemEvents, SimVarPublisherEntry<any>>([
      ['fuel_system_valve_switch', { name: 'FUELSYSTEM VALVE SWITCH:#index#', type: SimVarValueType.Bool, indexed: true }],
      ['fuel_system_valve_open', { name: 'FUELSYSTEM VALVE OPEN:#index#', type: SimVarValueType.Number, indexed: true }],
      ['fuel_system_pump_switch', { name: 'FUELSYSTEM PUMP SWITCH:#index#', type: SimVarValueType.Bool, indexed: true }],
      ['fuel_system_pump_active', { name: 'FUELSYSTEM PUMP ACTIVE:#index#', type: SimVarValueType.Bool, indexed: true }],
      ['fuel_system_engine_pressure', { name: 'FUELSYSTEM ENGINE PRESSURE:#index#', type: SimVarValueType.PSI, indexed: true }],
      ['fuel_system_line_pressure', { name: 'FUELSYSTEM LINE FUEL PRESSURE:#index#', type: SimVarValueType.PSI, indexed: true }],
      ['fuel_system_line_flow', { name: 'FUELSYSTEM LINE FUEL FLOW:#index#', type: SimVarValueType.GPH, indexed: true }],
      ['fuel_system_tank_quantity', { name: 'FUELSYSTEM TANK QUANTITY:#index#', type: SimVarValueType.GAL, indexed: true }],
    ]);

    super(simvars, bus, pacer);
  }

  /** @inheritdoc */
  public onUpdate(): void {
    super.onUpdate();
  }
}
