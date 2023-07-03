/// <reference types="@microsoft/msfs-types/js/simvar" />

import { EventBus, EventBusMetaEvents, GameStateProvider, IndexedEventType, PublishPacer, SimVarValueType } from '../data';
import { SimVarPublisher, SimVarPublisherEntry } from './BasePublishers';

/**
 * Events relating to the electrical systems.
 */
export interface BaseElectricalEvents {
  /** Master battery power is switched on or not. */
  'elec_master_battery': boolean,

  /** The avionics circuit is on or off. */
  'elec_circuit_avionics_on': boolean,

  /** The navcom 1 circuit is on or off. */
  'elec_circuit_navcom1_on': boolean,

  /** The navcom 2 circuit is on of off. */
  'elec_circuit_navcom2_on': boolean,

  /** The navcom 3 circuit is on of off. */
  'elec_circuit_navcom3_on': boolean,

  /** The first avionics power bus. */
  'elec_av1_bus': boolean,

  /** The second avionics power bus. */
  'elec_av2_bus': boolean,

  /** A voltage value for the main elec bus */
  'elec_bus_main_v': number,

  /** A current value for the main elec bus */
  'elec_bus_main_a': number,

  /** A voltage value for the avionics bus */
  'elec_bus_avionics_v': number,

  /** A current value for the avinoics bus */
  'elec_bus_avionics_a': number,

  /** A voltage value for the generator/alternator 1 bus */
  'elec_bus_genalt_1_v': number,

  /** A voltage value for the generator/alternator 2 bus */
  'elec_bus_genalt_2_v': number,

  /** A voltage value for the generator/alternator 3 bus */
  'elec_bus_genalt_3_v': number,

  /** A voltage value for the generator/alternator 4 bus */
  'elec_bus_genalt_4_v': number,

  /** A voltage value for the generator/alternator 5 bus */
  'elec_bus_genalt_5_v': number,

  /** A voltage value for the generator/alternator 6 bus */
  'elec_bus_genalt_6_v': number,

  /** A current value for the generator/alternator 1 bus */
  'elec_bus_genalt_1_a': number,

  /** A current value for the generator/alternator 2 bus */
  'elec_bus_genalt_2_a': number,

  /** A current value for the generator/alternator 3 bus */
  'elec_bus_genalt_3_a': number,

  /** A current value for the generator/alternator 4 bus */
  'elec_bus_genalt_4_a': number,

  /** A current value for the generator/alternator 5 bus */
  'elec_bus_genalt_5_a': number,

  /** A current value for the generator/alternator 6 bus */
  'elec_bus_genalt_6_a': number,

  /** A voltage value for the battery */
  'elec_bat_v': number,

  /** A current value for the battery */
  'elec_bat_a': number,

  /** A value for if external power is available */
  'elec_ext_power_available': boolean,

  /** A value for if external power is on */
  'elec_ext_power_on': boolean,

  /** A value for if APU generator switch is on */
  'elec_apu_gen_switch': boolean

  /** A value for if APU generator is active */
  'elec_apu_gen_active': boolean

  /** A value for if engine generator switch is on */
  'elec_eng_gen_switch': boolean

  /** A value indicating if a circuit is on */
  'elec_circuit_on': boolean

  /** A value for a circuit switch. */
  'elec_circuit_switch_on': boolean
}

/** Indexed topics. */
type IndexedTopics = 'elec_bus_main_v' | 'elec_bus_main_a' | 'elec_master_battery' | 'elec_circuit_avionics_on'
  | 'elec_bat_v' | 'elec_bat_a' | 'elec_ext_power_available' | 'elec_ext_power_on' | 'elec_apu_gen_active'
  | 'elec_apu_gen_switch' | 'elec_eng_gen_switch' | 'elec_circuit_on' | 'elec_circuit_switch_on';


/** Indexed events. */
type IndexedEvents = {
  [P in keyof Pick<BaseElectricalEvents, IndexedTopics> as IndexedEventType<P>]: BaseElectricalEvents[P];
};

/** Events related to the planes electrical system. */
export type ElectricalEvents = BaseElectricalEvents & IndexedEvents;

/**
 * A publisher for electrical information.
 */
export class ElectricalPublisher extends SimVarPublisher<ElectricalEvents> {
  private static simvars = new Map<keyof ElectricalEvents, SimVarPublisherEntry<any>>([
    ['elec_master_battery', { name: 'ELECTRICAL MASTER BATTERY:#index#', type: SimVarValueType.Bool, indexed: true }],
    ['elec_circuit_avionics_on', { name: 'CIRCUIT AVIONICS ON:#index#', type: SimVarValueType.Bool, indexed: true }],
    ['elec_circuit_navcom1_on', { name: 'CIRCUIT NAVCOM1 ON', type: SimVarValueType.Bool }],
    ['elec_circuit_navcom2_on', { name: 'CIRCUIT NAVCOM2 ON', type: SimVarValueType.Bool }],
    ['elec_circuit_navcom3_on', { name: 'CIRCUIT NAVCOM3 ON', type: SimVarValueType.Bool }],
    ['elec_bus_main_v', { name: 'ELECTRICAL MAIN BUS VOLTAGE:#index#', type: SimVarValueType.Volts, indexed: true }],
    ['elec_bus_main_a', { name: 'ELECTRICAL MAIN BUS AMPS:#index#', type: SimVarValueType.Amps, indexed: true }],
    ['elec_bus_avionics_v', { name: 'ELECTRICAL AVIONICS BUS VOLTAGE', type: SimVarValueType.Volts }],
    ['elec_bus_avionics_a', { name: 'ELECTRICAL AVIONICS BUS AMPS', type: SimVarValueType.Amps }],
    ['elec_bus_genalt_1_v', { name: 'ELECTRICAL GENALT BUS VOLTAGE:1', type: SimVarValueType.Volts }],
    ['elec_bus_genalt_2_v', { name: 'ELECTRICAL GENALT BUS VOLTAGE:2', type: SimVarValueType.Volts }],
    ['elec_bus_genalt_3_v', { name: 'ELECTRICAL GENALT BUS VOLTAGE:3', type: SimVarValueType.Volts }],
    ['elec_bus_genalt_4_v', { name: 'ELECTRICAL GENALT BUS VOLTAGE:4', type: SimVarValueType.Volts }],
    ['elec_bus_genalt_5_v', { name: 'ELECTRICAL GENALT BUS VOLTAGE:5', type: SimVarValueType.Volts }],
    ['elec_bus_genalt_6_v', { name: 'ELECTRICAL GENALT BUS VOLTAGE:6', type: SimVarValueType.Volts }],
    ['elec_bus_genalt_1_a', { name: 'ELECTRICAL GENALT BUS AMPS:1', type: SimVarValueType.Amps }],
    ['elec_bus_genalt_2_a', { name: 'ELECTRICAL GENALT BUS AMPS:2', type: SimVarValueType.Amps }],
    ['elec_bus_genalt_3_a', { name: 'ELECTRICAL GENALT BUS AMPS:3', type: SimVarValueType.Amps }],
    ['elec_bus_genalt_4_a', { name: 'ELECTRICAL GENALT BUS AMPS:4', type: SimVarValueType.Amps }],
    ['elec_bus_genalt_5_a', { name: 'ELECTRICAL GENALT BUS AMPS:5', type: SimVarValueType.Amps }],
    ['elec_bus_genalt_6_a', { name: 'ELECTRICAL GENALT BUS AMPS:6', type: SimVarValueType.Amps }],
    ['elec_bat_a', { name: 'ELECTRICAL BATTERY LOAD:#index#', type: SimVarValueType.Amps, indexed: true }],
    ['elec_bat_v', { name: 'ELECTRICAL BATTERY VOLTAGE:#index#', type: SimVarValueType.Amps, indexed: true }],
    ['elec_ext_power_available', { name: 'EXTERNAL POWER AVAILABLE:#index#', type: SimVarValueType.Bool, indexed: true }],
    ['elec_ext_power_on', { name: 'EXTERNAL POWER ON:#index#', type: SimVarValueType.Bool, indexed: true }],
    ['elec_apu_gen_switch', { name: 'APU GENERATOR SWITCH:#index#', type: SimVarValueType.Bool, indexed: true }],
    ['elec_apu_gen_active', { name: 'APU GENERATOR ACTIVE:#index#', type: SimVarValueType.Bool, indexed: true }],
    ['elec_eng_gen_switch', { name: 'GENERAL ENG MASTER ALTERNATOR:#index#', type: SimVarValueType.Bool, indexed: true }],
    ['elec_circuit_on', { name: 'CIRCUIT ON:#index#', type: SimVarValueType.Bool, indexed: true }],
    ['elec_circuit_switch_on', { name: 'CIRCUIT SWITCH ON:#index#', type: SimVarValueType.Bool, indexed: true }],
  ]);

  private flightStarted = false;
  private av1BusLogic: CompositeLogicXMLElement | undefined;
  private av2BusLogic: CompositeLogicXMLElement | undefined;

  private avBusList: (keyof ElectricalEvents)[] = ['elec_av1_bus', 'elec_av2_bus'];

  /**
   * Create an ElectricalPublisher
   * @param bus The EventBus to publish to
   * @param pacer An optional pacer to use to control the rate of publishing
   */
  public constructor(bus: EventBus, pacer: PublishPacer<ElectricalEvents> | undefined = undefined) {
    super(ElectricalPublisher.simvars, bus, pacer);

    for (const topic of this.avBusList) {
      if (bus.getTopicSubscriberCount(topic)) {
        this.subscribed.add(topic);
      }
    }

    bus.getSubscriber<EventBusMetaEvents>().on('event_bus_topic_first_sub').handle(
      (event: string) => {
        if (this.avBusList.includes(event as keyof ElectricalEvents)) {
          this.subscribed.add(event as keyof ElectricalEvents);
        }
      }
    );

    // When not starting cold and dark (on runway or in air), electrical power simvars are not properly initialized
    // during loading, so we will ignore all power data until the game enters briefing state.

    const gameStateSub = GameStateProvider.get().sub(state => {
      if (state === GameState.briefing || state === GameState.ingame) {
        gameStateSub.destroy();

        this.flightStarted = true;
      }
    }, false, true);

    gameStateSub.resume(true);
  }

  /** @inheritdoc */
  public onUpdate(): void {
    if (this.flightStarted) {
      super.onUpdate();

      if (this.av1BusLogic && this.subscribed.has('elec_av1_bus')) {
        this.publish('elec_av1_bus', this.av1BusLogic.getValue() !== 0);
      }

      if (this.av2BusLogic && this.subscribed.has('elec_av2_bus')) {
        this.publish('elec_av2_bus', this.av2BusLogic.getValue() !== 0);
      }
    }
  }

  /**
   * Sets the logic element to use for the avionics 1 bus.
   * @param logicElement The logic element to use.
   */
  public setAv1Bus(logicElement: CompositeLogicXMLElement): void {
    this.av1BusLogic = logicElement;
  }

  /**
   * Sets the logic element to use for the avionics 2 bus.
   * @param logicElement The logic element to use.
   */
  public setAv2Bus(logicElement: CompositeLogicXMLElement): void {
    this.av2BusLogic = logicElement;
  }
}