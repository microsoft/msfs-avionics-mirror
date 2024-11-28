import { EventBus, EventBusMetaEvents, IndexedEventType } from '../data/EventBus';
import { PublishPacer } from '../data/EventBusPacer';
import { SimVarValueType } from '../data/SimVars';
import { UnitType } from '../math/NumberUnit';
import { BasePublisher, SimVarPublisher } from './BasePublishers';

/** The type of engine (see `ENGINE TYPE` simvar). */
export enum EngineType {
  Piston,
  Jet,
  None,
  HeloTurbine,
  Unsupported,
  Turboprop,
}

/**
 * Non-indexed events related to engine information, keyed by base topic.
 */
interface BaseNonIndexedEngineEvents {
  /** A pressure value for vacuum system */
  vac: number;
  /** Total fuel flow rate, in gallons per hour. */
  fuel_flow_total: number;
  /** The amount of fuel remaining (usable + unusable) in all tanks, in gallons. */
  fuel_total: number;
  /** The amount of fuel remaining (usable + unusable)in all tanks, in pounds. */
  fuel_total_weight: number;
  /** The usable amount of fuel remaining in all tanks, in gallons. */
  fuel_usable_total: number;
  /** The usable amount of fuel remaining in all tanks, in pounds. */
  fuel_usable_total_weight: number;
  /** The amount of fuel remaining in all tanks on the left side, in gallons. */
  fuel_left: number;
  /** The amount of fuel remaining in all tanks on the right side, in gallons. */
  fuel_right: number;
  /** The amount of fuel remaining in the left main tank, in gallons. */
  fuel_left_main: number;
  /** The amount of fuel remaining in the left main tank, as a percent of maximum capacity. */
  fuel_left_main_pct: number;
  /** The amount of fuel remaining in the right main tank, in gallons. */
  fuel_right_main: number;
  /** The amount of fuel remaining in the right main tank, as a percent of maximum capacity. */
  fuel_right_main_pct: number;
  /** The amount of fuel remaining in the center tank, in gallons. */
  fuel_center: number;
  /** The fuel weight per gallon, in pounds per gallon. */
  fuel_weight_per_gallon: number;
  /** The state of fuel tank selector 1. */
  fuel_tank_selector_state_1: number;
  /** The state of fuel tank selector 2. */
  fuel_tank_selector_state_2: number;
  /** The state of fuel tank selector 3. */
  fuel_tank_selector_state_3: number;
  /** The state of fuel tank selector 4. */
  fuel_tank_selector_state_4: number;
  /** A hours value for engine 1 total elapsed time. */
  eng_hours_1: number;
  /** The APU rpm in %. */
  apu_pct: number;
  /** The APU stater rpm in %. */
  apu_pct_starter: number;
  /** The APU switch state */
  apu_switch: boolean;
  /** The minimum throttle value, from 0 to -1. */
  throttle_lower_limit: number;
}

/**
 * Engine-indexed events related to engine information, keyed by base topic.
 */
interface BaseEngineIndexedEngineEvents {
  /** Engine RPM. */
  rpm: number;
  /** Propeller RPM. */
  prop_rpm: number;
  /** Engine corrected N1 speed, as a percentage of maximum rated speed. */
  n1: number;
  /** Engine uncorrected N1 speed, as a percentage of maximum rated speed. */
  n1_uncorrected: number;
  /** Engine corrected N2 speed, as a percentage of maximum rated speed. */
  n2: number;
  /** Engine uncorrected N2 speed, as a percentage of maximum rated speed. */
  n2_uncorrected: number;
  /** Engine torque, as a percentage of maximum rated torque. */
  torque: number;
  /** The engine fuel flow, in gallons per hour. */
  fuel_flow: number;
  /** The engine fuel flow, in pounds per hour. */
  fuel_flow_pph: number;
  /** The recip engine fuel flow . */
  recip_ff: number;
  /** The engine oil pressure, in pounds per square inch. */
  oil_press: number;
  /** The engine oil temperature, in degrees Fahrenheit. */
  oil_temp: number;
  /** The engine itt. */
  itt: number;
  /** The engine exhaust gas temperature. */
  egt: number;
  /** The engine hydraulic pressure, in pounds per square inch. */
  eng_hyd_press: number;
  /** Whether the engine starter is on. */
  eng_starter_on: boolean;
  /** Whether the engine is combusting. */
  eng_combustion: boolean;
  /** The engine ignition switch state. 0: Off, 1: Auto, 2: On. */
  eng_ignition_switch_state: 0 | 1 | 2;
  /** Whether the engine is igniting. */
  eng_igniting: boolean;
  /** Whether the engine fuel pump is on. */
  eng_fuel_pump_on: boolean;
  /** The engine fuel pump switch state. 0: Off, 1: On, 2: Auto. */
  eng_fuel_pump_switch_state: 0 | 1 | 2;
  /** The Engine Vibration */
  eng_vibration: number;
  /** The engine torque in foot*pounds. */
  torque_moment: number;
  /** The engine manifold pressure, in pounds per square inch. */
  eng_manifold_pressure: number;
  /** Whether reverse thrust is engaged via reverse thrust hold or toggle key events. */
  reverse_thrust_engaged: boolean;
  /** The average engine cylinder head temp (for all cylinders). */
  cylinder_head_temp_avg: number;
  /** The average engine turbine inlet temp (for all turbines). */
  recip_turbine_inlet_temp_avg: number;
  /** The engine turbine inlet temperature, in degrees Celsius. */
  turbine_inlet_temp: number;
  /** Thrust produced in pounds, only applicable to jet engines */
  jet_net_thrust: number;
  /** Whether the engine is on fire. */
  eng_fire: boolean;
  /** Whether the engine starter is active. */
  eng_starter_active: boolean;
}

/**
 * Indexed events related to engine information.
 */
type IndexedEngineEvents = {
  [P in keyof BaseEngineIndexedEngineEvents as IndexedEventType<P>]: BaseEngineIndexedEngineEvents[P];
};

/**
 * Events related to engine information.
 */
export type EngineEvents = BaseNonIndexedEngineEvents & BaseEngineIndexedEngineEvents & IndexedEngineEvents;

/** A publisher for Engine information. */
export class EISPublisher extends BasePublisher<EngineEvents> {
  private readonly engineCount: number;

  private readonly simVarPublisher: SimVarPublisher<EngineEvents>;

  private needPublishTotalFuelFlow = false;
  private readonly totalFuelFlowSimVarIds: number[] = [];

  /**
   * Create an EISPublisher
   * @param bus The EventBus to publish to
   * @param pacer An optional pacer to use to control the rate of publishing
   */
  public constructor(bus: EventBus, pacer?: PublishPacer<EngineEvents>) {
    super(bus, pacer);

    const isUsingAdvancedFuelSystem = SimVar.GetSimVarValue('NEW FUEL SYSTEM', SimVarValueType.Bool) !== 0;
    const totalUnusableFuelGal = SimVar.GetSimVarValue('UNUSABLE FUEL TOTAL QUANTITY', SimVarValueType.GAL);
    const totalUnusableFuelLb = UnitType.GALLON_FUEL.convertTo(totalUnusableFuelGal, UnitType.POUND);

    this.simVarPublisher = new SimVarPublisher([
      ['vac', { name: 'SUCTION PRESSURE', type: SimVarValueType.InHG }],
      ['fuel_total', { name: 'FUEL TOTAL QUANTITY', type: SimVarValueType.GAL, map: isUsingAdvancedFuelSystem ? v => v + totalUnusableFuelGal : undefined }],
      ['fuel_total_weight', { name: 'FUEL TOTAL QUANTITY WEIGHT', type: SimVarValueType.Pounds, map: isUsingAdvancedFuelSystem ? v => v + totalUnusableFuelGal : undefined }],
      ['fuel_usable_total', { name: 'FUEL TOTAL QUANTITY', type: SimVarValueType.GAL, map: isUsingAdvancedFuelSystem ? undefined : v => Math.max(v - totalUnusableFuelGal, 0) }],
      ['fuel_usable_total_weight', { name: 'FUEL TOTAL QUANTITY WEIGHT', type: SimVarValueType.Pounds, map: isUsingAdvancedFuelSystem ? undefined : v => Math.max(v - totalUnusableFuelLb, 0) }],
      ['fuel_left', { name: 'FUEL LEFT QUANTITY', type: SimVarValueType.GAL }],
      ['fuel_right', { name: 'FUEL RIGHT QUANTITY', type: SimVarValueType.GAL }],
      ['fuel_left_main', { name: 'FUEL TANK LEFT MAIN QUANTITY', type: SimVarValueType.GAL }],
      ['fuel_left_main_pct', { name: 'FUEL TANK LEFT MAIN LEVEL', type: SimVarValueType.Percent }],
      ['fuel_right_main', { name: 'FUEL TANK RIGHT MAIN QUANTITY', type: SimVarValueType.GAL }],
      ['fuel_right_main_pct', { name: 'FUEL TANK RIGHT MAIN LEVEL', type: SimVarValueType.Percent }],
      ['fuel_center', { name: 'FUEL TANK CENTER QUANTITY', type: SimVarValueType.GAL }],
      ['fuel_weight_per_gallon', { name: 'FUEL WEIGHT PER GALLON', type: SimVarValueType.LBS }],
      ['fuel_tank_selector_state_1', { name: 'FUEL TANK SELECTOR:1', type: SimVarValueType.Number }],
      ['fuel_tank_selector_state_2', { name: 'FUEL TANK SELECTOR:2', type: SimVarValueType.Number }],
      ['fuel_tank_selector_state_3', { name: 'FUEL TANK SELECTOR:3', type: SimVarValueType.Number }],
      ['fuel_tank_selector_state_4', { name: 'FUEL TANK SELECTOR:4', type: SimVarValueType.Number }],
      ['eng_hours_1', { name: 'GENERAL ENG ELAPSED TIME:1', type: SimVarValueType.Hours }],
      ['apu_pct', { name: 'APU PCT RPM', type: SimVarValueType.Percent }],
      ['apu_pct_starter', { name: 'APU PCT STARTER', type: SimVarValueType.Percent }],
      ['apu_switch', { name: 'APU SWITCH', type: SimVarValueType.Bool }],
      ['throttle_lower_limit', { name: 'THROTTLE LOWER LIMIT', type: SimVarValueType.Number }],

      ['rpm', { name: 'GENERAL ENG RPM:#index#', type: SimVarValueType.RPM, indexed: true }],
      ['prop_rpm', { name: 'PROP RPM:#index#', type: SimVarValueType.RPM, indexed: true }],
      ['n1', { name: 'TURB ENG CORRECTED N1:#index#', type: SimVarValueType.Percent, indexed: true }],
      ['n1_uncorrected', { name: 'TURB ENG N1:#index#', type: SimVarValueType.Percent, indexed: true }],
      ['n2', { name: 'TURB ENG CORRECTED N2:#index#', type: SimVarValueType.Percent, indexed: true }],
      ['n2_uncorrected', { name: 'TURB ENG N2:#index#', type: SimVarValueType.Percent, indexed: true }],
      ['torque', { name: 'TURB ENG MAX TORQUE PERCENT:#index#', type: SimVarValueType.Percent, indexed: true }],
      ['fuel_flow', { name: 'ENG FUEL FLOW GPH:#index#', type: SimVarValueType.GPH, indexed: true }],
      ['recip_ff', { name: 'RECIP ENG FUEL FLOW:#index#', type: SimVarValueType.PPH, indexed: true }],
      ['oil_press', { name: 'ENG OIL PRESSURE:#index#', type: SimVarValueType.PSI, indexed: true }],
      ['oil_temp', { name: 'ENG OIL TEMPERATURE:#index#', type: SimVarValueType.Farenheit, indexed: true }],
      ['itt', { name: 'TURB ENG ITT:#index#', type: SimVarValueType.Celsius, indexed: true }],
      ['egt', { name: 'ENG EXHAUST GAS TEMPERATURE:#index#', type: SimVarValueType.Farenheit, indexed: true }],
      ['eng_hyd_press', { name: 'ENG HYDRAULIC PRESSURE:#index#', type: SimVarValueType.PSI, indexed: true }],
      ['eng_starter_on', { name: 'GENERAL ENG STARTER:#index#', type: SimVarValueType.Bool, indexed: true }],
      ['eng_combustion', { name: 'GENERAL ENG COMBUSTION:#index#', type: SimVarValueType.Bool, indexed: true }],
      ['eng_ignition_switch_state', { name: 'TURB ENG IGNITION SWITCH EX1:#index#', type: SimVarValueType.Number, indexed: true }],
      ['eng_igniting', { name: 'TURB ENG IS IGNITING:#index#', type: SimVarValueType.Bool, indexed: true }],
      ['eng_fuel_pump_on', { name: 'GENERAL ENG FUEL PUMP ON:#index#', type: SimVarValueType.Bool, indexed: true }],
      ['eng_fuel_pump_switch_state', { name: 'GENERAL ENG FUEL PUMP SWITCH EX1:#index#', type: SimVarValueType.Number, indexed: true }],
      ['eng_vibration', { name: 'ENG VIBRATION:#index#', type: SimVarValueType.Number, indexed: true }],
      ['fuel_flow_pph', { name: 'ENG FUEL FLOW PPH:#index#', type: SimVarValueType.PPH, indexed: true }],
      ['torque_moment', { name: 'ENG TORQUE:#index#', type: SimVarValueType.FtLb, indexed: true }],
      ['eng_manifold_pressure', { name: 'ENG MANIFOLD PRESSURE:#index#', type: SimVarValueType.PSI, indexed: true }],
      ['reverse_thrust_engaged', { name: 'GENERAL ENG REVERSE THRUST ENGAGED:#index#', type: SimVarValueType.Bool, indexed: true }],
      ['cylinder_head_temp_avg', { name: 'ENG CYLINDER HEAD TEMPERATURE:#index#', type: SimVarValueType.Farenheit, indexed: true }],
      ['recip_turbine_inlet_temp_avg', { name: 'RECIP ENG TURBINE INLET TEMPERATURE:#index#', type: SimVarValueType.Farenheit, indexed: true }],
      ['turbine_inlet_temp', { name: 'TURB ENG INLET TEMPERATURE:#index#', type: SimVarValueType.Celsius, indexed: true }],
      ['jet_net_thrust', { name: 'TURB ENG JET THRUST:#index#', type: SimVarValueType.Pounds, indexed: true }],
      ['eng_fire', { name: 'ENG ON FIRE:#index#', type: SimVarValueType.Bool, indexed: true }],
      ['eng_starter_active', { name: 'GENERAL ENG STARTER ACTIVE:#index#', type: SimVarValueType.Bool, indexed: true }],
    ], bus, pacer);

    this.engineCount = SimVar.GetSimVarValue('NUMBER OF ENGINES', SimVarValueType.Number);

    if (bus.getTopicSubscriberCount('fuel_flow_total') > 0) {
      this.onTopicSubscribed('fuel_flow_total');
    } else {
      bus.getSubscriber<EventBusMetaEvents>().on('event_bus_topic_first_sub').handle(this.onTopicSubscribed.bind(this));
    }
  }

  /**
   * Responds to when a topic is first subscribed to on the event bus.
   * @param topic The subscribed topic.
   */
  private onTopicSubscribed(topic: string): void {
    if (topic === 'fuel_flow_total') {
      this.needPublishTotalFuelFlow = true;

      for (let i = 1; i <= this.engineCount; i++) {
        this.totalFuelFlowSimVarIds.push(SimVar.GetRegisteredId(`ENG FUEL FLOW GPH:${i}`, SimVarValueType.GPH, ''));
      }

      if (this.publishActive) {
        this.publishTotalFuelFlow();
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
    this.simVarPublisher.onUpdate();

    if (this.needPublishTotalFuelFlow) {
      this.publishTotalFuelFlow();
    }
  }

  /**
   * Publishes the `fuel_flow_total` topic.
   */
  private publishTotalFuelFlow(): void {
    let totalFuelFlow = 0;

    for (let i = 0; i < this.totalFuelFlowSimVarIds.length; i++) {
      totalFuelFlow += SimVar.GetSimVarValueFastReg(this.totalFuelFlowSimVarIds[i]);
    }

    this.publish('fuel_flow_total', totalFuelFlow);
  }
}
