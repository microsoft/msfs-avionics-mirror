import { EventBus, IndexedEventType } from '../data/EventBus';
import { PublishPacer } from '../data/EventBusPacer';
import { SimVarValueType } from '../data/SimVars';
import { SimVarPublisher } from './BasePublishers';

/**
 * Events for the hydraulics system
 */
interface BaseIndexedHydraulicsSystemEvents {
  /** The switch state of the hydraulic pump.  */
  hyd_pump_switch_state: boolean;
  /** The reservoir quantity in percent. */
  hyd_reservoir_perc: number;
  /** The hydraulic pressure of this pump */
  hyd_pressure: number;

  /** FS2024 New Hydraulics System */

  /** Whether this hydraulic pump is active */
  hyd_pump_active: boolean;
  /** The hydraulic pressure of this pump, in PSI */
  hyd_pump_pressure: number;
  /** The percentage quantity of this hydraulics reservoir */
  hyd_reservoir_quantity_pct: number;
  /** The quantity of this hydraulics reservoir, in liters */
  hyd_reservoir_quantity: number;
  /** The hydraulic pressure of this reservoir, in PSI */
  hyd_reservoir_pressure: number;
  /** The quantity of this hydraulics accumulator, in liters */
  hyd_accumulator_quantity: number;
  /** The hydraulic pressure of this accumulator, in PSI */
  hyd_accumulator_pressure: number;
  /** Whether the hydraulic valve is open or closed */
  hyd_valve_open: boolean;
}

/**
 * Indexed events related to the hydraulics.
 */
type HydraulicsIndexedEvents = {
  [P in keyof BaseIndexedHydraulicsSystemEvents as IndexedEventType<P>]: BaseIndexedHydraulicsSystemEvents[P];
};

/**
 * Events related to the planes hydraulics.
 */
export type HydraulicsEvents = HydraulicsIndexedEvents

/**
 * A publisher for control surfaces information.
 */
export class HydraulicsPublisher extends SimVarPublisher<HydraulicsEvents, BaseIndexedHydraulicsSystemEvents> {

  /**
   * Create an HydraulicsPublisher.
   * @param bus The EventBus to publish to.
   * @param pacer An optional pacer to use to control the rate of publishing.
   */
  public constructor(bus: EventBus, pacer?: PublishPacer<HydraulicsEvents>) {
    super([
      ['hyd_pump_switch_state', { name: 'HYDRAULIC SWITCH:#index#', type: SimVarValueType.Bool, indexed: true, defaultIndex: null }],
      ['hyd_pressure', { name: 'HYDRAULIC PRESSURE:#index#', type: SimVarValueType.PSI, indexed: true, defaultIndex: null }],
      ['hyd_reservoir_perc', { name: 'HYDRAULIC RESERVOIR PERCENT:#index#', type: SimVarValueType.Percent, indexed: true, defaultIndex: null }],

      // FS2024 New Hydraulics System
      ['hyd_pump_active', { name: 'HYDRAULIC PUMP ACTIVE:#index#', type: SimVarValueType.Bool, indexed: true, defaultIndex: null }],
      ['hyd_pump_pressure', { name: 'HYDRAULIC PUMP PRESSURE:#index#', type: SimVarValueType.PSI, indexed: true, defaultIndex: null }],
      ['hyd_reservoir_quantity_pct', { name: 'HYDRAULIC RESERVOIR PERCENT:#index#', type: SimVarValueType.Percent, indexed: true, defaultIndex: null }],
      ['hyd_reservoir_quantity', { name: 'HYDRAULIC RESERVOIR QUANTITY:#index#', type: SimVarValueType.Liters, indexed: true, defaultIndex: null }],
      ['hyd_reservoir_pressure', { name: 'HYDRAULIC RESERVOIR PRESSURE:#index#', type: SimVarValueType.PSI, indexed: true, defaultIndex: null }],
      ['hyd_accumulator_quantity', { name: 'HYDRAULIC ACCUMULATOR QUANTITY:#index#', type: SimVarValueType.Liters, indexed: true, defaultIndex: null }],
      ['hyd_accumulator_pressure', { name: 'HYDRAULIC ACCUMULATOR PRESSURE:#index#', type: SimVarValueType.PSI, indexed: true, defaultIndex: null }],
      ['hyd_valve_open', { name: 'HYDRAULIC VALVE ACTIVE:#index#', type: SimVarValueType.Bool, indexed: true, defaultIndex: null }],
    ], bus, pacer);
  }
}
