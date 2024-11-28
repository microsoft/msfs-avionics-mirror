import { EventBus, EventBusMetaEvents, IndexedEventType } from '../data/EventBus';
import { PublishPacer } from '../data/EventBusPacer';
import { GameStateProvider } from '../data/GameStateProvider';
import { SimVarValueType } from '../data/SimVars';
import { BasePublisher, SimVarPublisher } from './BasePublishers';

/**
 * Base events related to electrical systems.
 */
export interface BaseElectricalEvents {
  // ---- BUS ----

  /** The voltage on a bus, in volts. Compatible only with the V2 electrical system. */
  elec_bus_v: number;

  /**
   * The total current drawn by all consumers directly connected to a bus, in amps. Compatible only with the V2
   * electrical system.
   */
  elec_bus_a: number;

  /** The voltage on a bus, in volts. Compatible only with the V1 electrical system. */
  elec_bus_main_v: number;

  /** The current on a bus, in amps. Compatible only with the V1 electrical system. */
  elec_bus_main_a: number;

  /** The voltage on an avionics bus, in volts. */
  elec_bus_avionics_v: number;

  /** The current on an avionics bus, in amps. */
  elec_bus_avionics_a: number;

  /** The voltage on an alternator bus, on volts. */
  elec_bus_genalt_v: number;

  /** The current on an alternator bus, in amps. */
  elec_bus_genalt_a: number;

  // ---- CIRCUIT ----

  /** Whether a circuit is powered. */
  elec_circuit_on: boolean;

  /** Whether a circuit switch is turned on. */
  elec_circuit_switch_on: boolean;

  /** The voltage on a circuit, in volts. Compatible only with the V2 electrical system. */
  elec_circuit_v: number;

  /** The current consumed by a circuit, in amps. Compatible only with the V2 electrical system. */
  elec_circuit_a: number;

  /** Whether a COM radio circuit is powered. */
  elec_circuit_com_on: boolean;

  /** Whether a NAV radio circuit is powered. */
  elec_circuit_nav_on: boolean;

  /** The avionics circuit is on or off. */
  elec_circuit_avionics_on: boolean;

  /** The navcom 1 circuit is on or off. */
  elec_circuit_navcom1_on: boolean;

  /** The navcom 2 circuit is on of off. */
  elec_circuit_navcom2_on: boolean;

  /** The navcom 3 circuit is on of off. */
  elec_circuit_navcom3_on: boolean;

  // ---- LINE ----

  /** Whether a line connection is switched on (closed). Compatible only with the V2 electrical system. */
  elec_line_connection_on: boolean;

  /** Whether a line breaker is in the pulled (open) state. Compatible only with the V2 electrical system. */
  elec_line_breaker_pulled: boolean;

  // ---- BATTERY ----

  /** Whether a battery switch is turned on. */
  elec_master_battery: boolean;

  /** The voltage of a battery, in volts. */
  elec_bat_v: number;

  /**
   * The load on a battery, in amps. Using the V1 electrical system, positive values indicate that the battery is
   * discharging and negative values indicate that the battery is charging. Using the V2 electrical system, this value
   * cannot be negative; positive values indicate that the battery is discharging and a value of zero indicates that
   * the battery is not discharging.
   */
  elec_bat_load: number;

  /** The state of charge of a battery, in percent. */
  elec_bat_soc: number;

  // ---- GENERATOR/ALTERNATOR ----

  /** Whether a generator is switched on. Compatible only with the V2 electrical system. */
  elec_gen_switch_on: boolean;

  /** Whether a generator is providing tension. Compatible only with the V2 electrical system. */
  elec_gen_active: boolean;

  /** The voltage (tension) provided by a generator, in volts. Compatible only with the V2 electrical system. */
  elec_gen_v: number;

  /** The current drawn from a generator, in amps. Compatible only with the V2 electrical system. */
  elec_gen_a: number;

  /** Whether an engine generator switch is turned on. */
  elec_eng_gen_switch: boolean;

  /** Whether an APU generator switch is turned on. */
  elec_apu_gen_switch: boolean;

  /** Whether an APU generator is active. */
  elec_apu_gen_active: boolean;

  // ---- EXTERNAL POWER ----

  /** Whether external power is available. */
  elec_ext_power_available: boolean;

  /** Whether an external power source is switched on. */
  elec_ext_power_on: boolean;

  /** The voltage provided by an external power source, in volts. Compatible only with the V2 electrical system. */
  elec_ext_power_v: number;

  /** The current drawn from an extenral power source, in amps. Compatible only with the V2 electrical system. */
  elec_ext_power_a: number;

  // ---- MISC ----

  /** The first avionics power bus. */
  elec_av1_bus: boolean;

  /** The second avionics power bus. */
  elec_av2_bus: boolean;
}

/**
 * Obligately indexed electrical system topics.
 */
type IndexedTopics
  = 'elec_bus_v' | 'elec_bus_a'
  | 'elec_bus_main_v' | 'elec_bus_main_a'
  | 'elec_bus_genalt_v' | 'elec_bus_genalt_a'
  | 'elec_circuit_on' | 'elec_circuit_switch_on'
  | 'elec_circuit_v' | 'elec_circuit_a'
  | 'elec_circuit_avionics_on'
  | 'elec_circuit_com_on' | 'elec_circuit_nav_on'
  | 'elec_line_connection_on' | 'elec_line_breaker_pulled'
  | 'elec_gen_switch_on' | 'elec_gen_active' | 'elec_gen_v' | 'elec_gen_a';

/**
 * Optionally indexed electrical system topics.
 */
type OptionallyIndexedTopics
  = 'elec_master_battery'
  | 'elec_bat_v' | 'elec_bat_load' | 'elec_bat_soc'
  | 'elec_ext_power_available' | 'elec_ext_power_on' | 'elec_ext_power_v' | 'elec_ext_power_a'
  | 'elec_apu_gen_active' | 'elec_apu_gen_switch'
  | 'elec_eng_gen_switch';

/**
 * Indexed events related to electrical systems.
 */
type IndexedEvents = {
  [P in keyof Pick<BaseElectricalEvents, IndexedTopics | OptionallyIndexedTopics> as IndexedEventType<P>]: BaseElectricalEvents[P];
};

/**
 * Events related to electrical systems.
 */
export type ElectricalEvents = Omit<BaseElectricalEvents, IndexedTopics> & IndexedEvents;

/**
 * A publisher for electrical information.
 */
export class ElectricalPublisher extends BasePublisher<ElectricalEvents> {
  private readonly simVarPublisher: SimVarPublisher<ElectricalEvents, BaseElectricalEvents>;

  private av1BusLogic: CompositeLogicXMLElement | undefined;
  private av2BusLogic: CompositeLogicXMLElement | undefined;

  private needPublishAv1Bus = false;
  private needPublishAv2Bus = false;

  private flightStarted = false;

  /**
   * Create an ElectricalPublisher
   * @param bus The EventBus to publish to
   * @param pacer An optional pacer to use to control the rate of publishing
   */
  public constructor(bus: EventBus, pacer?: PublishPacer<ElectricalEvents>) {
    super(bus, pacer);

    this.simVarPublisher = new SimVarPublisher([
      // ---- BUS ----

      ['elec_bus_v', { name: 'ELECTRICAL BUS VOLTAGE:#index#', type: SimVarValueType.Volts, indexed: true, defaultIndex: null }],
      ['elec_bus_a', { name: 'ELECTRICAL BUS AMPS:#index#', type: SimVarValueType.Amps, indexed: true, defaultIndex: null }],
      ['elec_bus_main_v', { name: 'ELECTRICAL MAIN BUS VOLTAGE:#index#', type: SimVarValueType.Volts, indexed: true, defaultIndex: null }],
      ['elec_bus_main_a', { name: 'ELECTRICAL MAIN BUS AMPS:#index#', type: SimVarValueType.Amps, indexed: true, defaultIndex: null }],
      ['elec_bus_avionics_v', { name: 'ELECTRICAL AVIONICS BUS VOLTAGE', type: SimVarValueType.Volts }],
      ['elec_bus_avionics_a', { name: 'ELECTRICAL AVIONICS BUS AMPS', type: SimVarValueType.Amps }],
      ['elec_bus_genalt_v', { name: 'ELECTRICAL GENALT BUS VOLTAGE:#index#', type: SimVarValueType.Volts, indexed: true, defaultIndex: null }],
      ['elec_bus_genalt_a', { name: 'ELECTRICAL GENALT BUS AMPS:#index#', type: SimVarValueType.Amps, indexed: true, defaultIndex: null }],

      // ---- CIRCUIT ----

      ['elec_circuit_on', { name: 'CIRCUIT ON:#index#', type: SimVarValueType.Bool, indexed: true, defaultIndex: null }],
      ['elec_circuit_switch_on', { name: 'CIRCUIT SWITCH ON:#index#', type: SimVarValueType.Bool, indexed: true, defaultIndex: null }],
      ['elec_circuit_v', { name: 'ELECTRICAL CIRCUIT VOLTAGE:#index#', type: SimVarValueType.Volts, indexed: true, defaultIndex: null }],
      ['elec_circuit_a', { name: 'ELECTRICAL CIRCUIT AMPS:#index#', type: SimVarValueType.Amps, indexed: true, defaultIndex: null }],
      ['elec_circuit_com_on', { name: 'CIRCUIT COM ON:#index#', type: SimVarValueType.Bool, indexed: true, defaultIndex: null }],
      ['elec_circuit_nav_on', { name: 'CIRCUIT NAV ON:#index#', type: SimVarValueType.Bool, indexed: true, defaultIndex: null }],
      ['elec_circuit_avionics_on', { name: 'CIRCUIT AVIONICS ON:#index#', type: SimVarValueType.Bool, indexed: true, defaultIndex: null }],
      ['elec_circuit_navcom1_on', { name: 'CIRCUIT NAVCOM1 ON', type: SimVarValueType.Bool }],
      ['elec_circuit_navcom2_on', { name: 'CIRCUIT NAVCOM2 ON', type: SimVarValueType.Bool }],
      ['elec_circuit_navcom3_on', { name: 'CIRCUIT NAVCOM3 ON', type: SimVarValueType.Bool }],

      // ---- LINE ----

      ['elec_line_connection_on', { name: 'LINE CONNECTION ON:#index#', type: SimVarValueType.Bool, indexed: true, defaultIndex: null }],
      ['elec_line_breaker_pulled', { name: 'LINE BREAKER PULLED:#index#', type: SimVarValueType.Bool, indexed: true, defaultIndex: null }],

      // ---- BATTERY ----

      ['elec_master_battery', { name: 'ELECTRICAL MASTER BATTERY:#index#', type: SimVarValueType.Bool, indexed: true }],
      ['elec_bat_load', { name: 'ELECTRICAL BATTERY LOAD:#index#', type: SimVarValueType.Amps, indexed: true }],
      ['elec_bat_v', { name: 'ELECTRICAL BATTERY VOLTAGE:#index#', type: SimVarValueType.Amps, indexed: true }],
      ['elec_bat_soc', { name: 'ELECTRICAL BATTERY ESTIMATED CAPACITY PCT:#index#', type: SimVarValueType.Percent, indexed: true }],

      // ---- GENERATOR/ALTERNATOR ----

      ['elec_gen_switch_on', { name: 'ELECTRICAL GENERATOR SWITCH:#index#', type: SimVarValueType.Bool, indexed: true, defaultIndex: null }],
      ['elec_gen_active', { name: 'ELECTRICAL GENERATOR ACTIVE:#index#', type: SimVarValueType.Bool, indexed: true, defaultIndex: null }],
      ['elec_gen_v', { name: 'ELECTRICAL GENERATOR VOLTAGE:#index#', type: SimVarValueType.Volts, indexed: true, defaultIndex: null }],
      ['elec_gen_a', { name: 'ELECTRICAL GENERATOR AMPS:#index#', type: SimVarValueType.Amps, indexed: true, defaultIndex: null }],
      ['elec_eng_gen_switch', { name: 'GENERAL ENG MASTER ALTERNATOR:#index#', type: SimVarValueType.Bool, indexed: true }],
      ['elec_apu_gen_switch', { name: 'APU GENERATOR SWITCH:#index#', type: SimVarValueType.Bool, indexed: true }],
      ['elec_apu_gen_active', { name: 'APU GENERATOR ACTIVE:#index#', type: SimVarValueType.Bool, indexed: true }],

      // ---- EXTERNAL POWER ----

      ['elec_ext_power_available', { name: 'EXTERNAL POWER AVAILABLE:#index#', type: SimVarValueType.Bool, indexed: true }],
      ['elec_ext_power_on', { name: 'EXTERNAL POWER ON:#index#', type: SimVarValueType.Bool, indexed: true }],
      ['elec_ext_power_v', { name: 'ELECTRICAL EXTERNAL POWER VOLTAGE:#index#', type: SimVarValueType.Volts, indexed: true }],
      ['elec_ext_power_a', { name: 'ELECTRICAL EXTERNAL POWER AMPS:#index#', type: SimVarValueType.Amps, indexed: true }],
    ], bus, pacer);

    for (const topic of ['elec_av1_bus', 'elec_av2_bus']) {
      if (bus.getTopicSubscriberCount(topic) > 0) {
        this.onTopicSubscribed(topic);
      }
    }

    bus.getSubscriber<EventBusMetaEvents>().on('event_bus_topic_first_sub').handle(this.onTopicSubscribed.bind(this));

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

  /**
   * Responds to when a topic is first subscribed to on the event bus.
   * @param topic The subscribed topic.
   */
  private onTopicSubscribed(topic: string): void {
    if (topic === 'elec_av1_bus') {
      this.needPublishAv1Bus = true;

      if (this.publishActive && this.av1BusLogic) {
        this.publishAvBus(topic, this.av1BusLogic);
      }
    } else if (topic === 'elec_av2_bus') {
      this.needPublishAv2Bus = true;

      if (this.publishActive && this.av2BusLogic) {
        this.publishAvBus(topic, this.av2BusLogic);
      }
    }
  }

  /** @inheritDoc */
  public startPublish(): void {
    super.startPublish();

    this.simVarPublisher.startPublish();
  }

  /** @inheritDoc */
  public stopPublish(): void {
    super.stopPublish();

    this.simVarPublisher.stopPublish();
  }

  /** @inheritDoc */
  public onUpdate(): void {
    if (!this.flightStarted) {
      return;
    }

    this.simVarPublisher.onUpdate();

    if (this.av1BusLogic && this.needPublishAv1Bus) {
      this.publishAvBus('elec_av1_bus', this.av1BusLogic);
    }

    if (this.av2BusLogic && this.needPublishAv2Bus) {
      this.publishAvBus('elec_av2_bus', this.av2BusLogic);
    }
  }

  /**
   * Publishes an avionics bus topic.
   * @param topic The topic to publish.
   * @param logicElement The XML logic element from which to retrieve the value to publish to the topic.
   */
  private publishAvBus(topic: keyof ElectricalEvents, logicElement: CompositeLogicXMLElement): void {
    this.publish(topic, logicElement.getValue() !== 0);
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
