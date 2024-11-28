import { SimVarPublisher, } from './BasePublishers';
import { EventBus, IndexedEventType } from '../data/EventBus';
import { PublishPacer } from '../data/EventBusPacer';
import { SimVarValueType } from '../data/SimVars';

/** An interface for the liquid dropping system's non-indexed variables. */
interface BaseLiquidDropEvents {
  /** The total maximum volume of all tanks in the dropping system, in gallons */
  liquid_drop_system_max_volume: number;
  /** The total maximum weight of all tanks in the dropping system, in pounds */
  liquid_drop_system_max_weight: number;
  /** The total current volume of all tanks in the dropping system, in gallons */
  liquid_drop_system_volume: number;
  /** The total current weight of all tanks in the dropping system, in pounds */
  liquid_drop_system_weight: number;

  /** The rate of mass at which liquid is being dropped, in pounds per hour */
  liquid_drop_system_drop_flow_rate: number;
  /** The rate of mass at which liquid is being scooped, in pounds per hour */
  liquid_drop_system_scoop_flow_rate: number;
}

/** An interface for the liquid dropping system's indexed variables. */
interface BaseIndexedLiquidDropEvents {
  /** The maximum weight of a tank, in pounds */
  liquid_drop_tank_max_weight: number;
  /** The maximum volume of a tank, in gallons */
  liquid_drop_tank_max_volume: number;
  /** The current volume of a tank, in gallons */
  liquid_drop_tank_volume: number;
  /** The current weight of a tank, in pounds */
  liquid_drop_tank_weight: number;

  /** The rate of mass of liquid being discharged through a door, in pounds per hour */
  liquid_drop_door_flow_rate: number;
  /** How far the door should open, as a percentage where 1 is fully open */
  liquid_drop_door_open_target_pct: number;
  /** How far the door is open, as a percentage where 1 is fully open */
  liquid_drop_door_open_pct: number;

  /** The rate of mass of liquid being scooped, in pounds per hour */
  liquid_drop_scoop_flow_rate: number;
  /** How far the scoop should open, as a percentage where 1 is fully open */
  liquid_drop_scoop_open_target_pct: number;
  /** How far the scoop is open, as a percentage where 1 is fully open */
  liquid_drop_scoop_open_pct: number;
}

/** Indexed liquid dropping events */
type IndexedLiquidDropEvents = {
  [P in keyof BaseIndexedLiquidDropEvents as IndexedEventType<P>]: BaseIndexedLiquidDropEvents[P];
};

/**
 * An interface for the liquid dropping system's variables.
 */
export type LiquidDropEvents = BaseLiquidDropEvents & IndexedLiquidDropEvents

/**
 * A publisher for data from the Modular Liquid Dropping system in the simulator.
 */
export class LiquidDropPublisher extends SimVarPublisher<LiquidDropEvents, BaseLiquidDropEvents & BaseIndexedLiquidDropEvents> {
  /**
   * Create an LiquidDropPublisher
   * @param bus The EventBus to publish to
   * @param pacer An optional pacer to use to control the rate of publishing
   */
  public constructor(bus: EventBus, pacer?: PublishPacer<LiquidDropEvents>) {
    super([
      ['liquid_drop_system_max_volume', { name: 'LIQUID DROPPING TANK TOTAL CAPACITY VOLUME', type: SimVarValueType.GAL }],
      ['liquid_drop_system_max_weight', { name: 'LIQUID DROPPING TANK TOTAL CAPACITY', type: SimVarValueType.Pounds }],
      ['liquid_drop_system_volume', { name: 'LIQUID DROPPING TANK TOTAL CURRENT VOLUME', type: SimVarValueType.GAL }],
      ['liquid_drop_system_weight', { name: 'LIQUID DROPPING TANK TOTAL WEIGHT', type: SimVarValueType.Pounds }],
      ['liquid_drop_system_drop_flow_rate', { name: 'LIQUID DROPPING TOTAL DROPPED FLOW', type: SimVarValueType.PPH }],
      ['liquid_drop_system_scoop_flow_rate', { name: 'LIQUID DROPPING TOTAL SCOOPED FLOW', type: SimVarValueType.PPH }],

      ['liquid_drop_tank_max_volume', { name: 'LIQUID DROPPING TANK CAPACITY VOLUME:#index#', type: SimVarValueType.GAL, indexed: true, defaultIndex: null }],
      ['liquid_drop_tank_max_weight', { name: 'LIQUID DROPPING TANK CAPACITY:#index#', type: SimVarValueType.Pounds, indexed: true, defaultIndex: null }],
      ['liquid_drop_tank_volume', { name: 'LIQUID DROPPING TANK CURRENT VOLUME:#index#', type: SimVarValueType.GAL, indexed: true, defaultIndex: null }],
      ['liquid_drop_tank_weight', { name: 'LIQUID DROPPING TANK WEIGHT:#index#', type: SimVarValueType.Pounds, indexed: true, defaultIndex: null }],
      ['liquid_drop_door_flow_rate', { name: 'LIQUID DROPPING DOOR FLOW:#index#', type: SimVarValueType.PPH, indexed: true, defaultIndex: null }],
      ['liquid_drop_door_open_target_pct', { name: 'LIQUID DROPPING DOOR OPEN TARGET:#index#', type: SimVarValueType.Percent, indexed: true, defaultIndex: null }],
      ['liquid_drop_door_open_pct', { name: 'LIQUID DROPPING DOOR OPEN VALUE:#index#', type: SimVarValueType.Percent, indexed: true, defaultIndex: null }],
      ['liquid_drop_scoop_flow_rate', { name: 'LIQUID DROPPING SCOOP FLOW:#index#', type: SimVarValueType.PPH, indexed: true, defaultIndex: null }],
      ['liquid_drop_scoop_open_target_pct', { name: 'LIQUID DROPPING SCOOP OPEN TARGET:#index#', type: SimVarValueType.Percent, indexed: true, defaultIndex: null }],
      ['liquid_drop_scoop_open_pct', { name: 'LIQUID DROPPING SCOOP OPEN VALUE:#index#', type: SimVarValueType.Percent, indexed: true, defaultIndex: null }],
    ], bus, pacer);
  }
}
