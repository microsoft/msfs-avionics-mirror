/// <reference types="@microsoft/msfs-types/js/simvar" />

import { EventBus, IndexedEvents, IndexedEventType } from '../data/EventBus';
import { PublishPacer } from '../data/EventBusPacer';
import { SimVarValueType } from '../data/SimVars';
import { NumberToRangeUnion } from '../utils';
import { SimVarPublisher, SimVarPublisherEntry } from './BasePublishers';

/**
 * An interface that describes the possible Engine Parameter events (non-indexed).
 */
interface BaseEngineEvents {
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
  /** Whether the engine starter is active. */
  eng_starter_active: boolean;
}

/**
 * Topics indexed by engine.
 */
interface EngineIndexedTopics {
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
}

/** Indexed topics. */
type IndexedTopics = 'eng_starter_active';


/** Indexed events. */
type EngineIndexedEvents = {
  [P in keyof Pick<BaseEngineEvents, IndexedTopics> as IndexedEventType<P>]: BaseEngineEvents[P];
};

/** Events related to the planes engines. */
export type EngineEvents<E extends number = number> = BaseEngineEvents & IndexedEvents<EngineIndexedTopics, NumberToRangeUnion<E>> & EngineIndexedEvents;

/** A publisher for Engine information. */
export class EISPublisher extends SimVarPublisher<EngineEvents> {
  private readonly engineCount: number;

  /**
   * Create an EISPublisher
   * @param bus The EventBus to publish to
   * @param pacer An optional pacer to use to control the rate of publishing
   */
  public constructor(bus: EventBus, pacer: PublishPacer<EngineEvents> | undefined = undefined) {

    const isUsingAdvancedFuelSystem = SimVar.GetSimVarValue('NEW FUEL SYSTEM', SimVarValueType.Bool) !== 0;
    const totalUnusableFuelGal = SimVar.GetSimVarValue('UNUSABLE FUEL TOTAL QUANTITY', SimVarValueType.GAL);
    const totalUnusableFuelLb = SimVar.GetSimVarValue('UNUSABLE FUEL TOTAL QUANTITY', SimVarValueType.LBS);

    const nonIndexedSimVars: [keyof BaseEngineEvents, SimVarPublisherEntry<any>][] = [
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
      ['eng_starter_active', { name: 'GENERAL ENG STARTER ACTIVE:#index#', type: SimVarValueType.Bool, indexed: true }],
    ];

    const engineIndexedSimVars: [keyof EngineIndexedTopics, SimVarPublisherEntry<any>][] = [
      ['rpm', { name: 'GENERAL ENG RPM', type: SimVarValueType.RPM }],
      ['prop_rpm', { name: 'PROP RPM', type: SimVarValueType.RPM }],
      ['n1', { name: 'TURB ENG CORRECTED N1', type: SimVarValueType.Percent }],
      ['n1_uncorrected', { name: 'TURB ENG N1', type: SimVarValueType.Percent }],
      ['n2', { name: 'TURB ENG CORRECTED N2', type: SimVarValueType.Percent }],
      ['n2_uncorrected', { name: 'TURB ENG N2', type: SimVarValueType.Percent }],
      ['torque', { name: 'TURB ENG MAX TORQUE PERCENT', type: SimVarValueType.Percent }],
      ['fuel_flow', { name: 'ENG FUEL FLOW GPH', type: SimVarValueType.GPH }],
      ['recip_ff', { name: 'RECIP ENG FUEL FLOW', type: SimVarValueType.PPH }],
      ['oil_press', { name: 'ENG OIL PRESSURE', type: SimVarValueType.PSI }],
      ['oil_temp', { name: 'ENG OIL TEMPERATURE', type: SimVarValueType.Farenheit }],
      ['itt', { name: 'TURB ENG ITT', type: SimVarValueType.Celsius }],
      ['egt', { name: 'ENG EXHAUST GAS TEMPERATURE', type: SimVarValueType.Farenheit }],
      ['eng_hyd_press', { name: 'ENG HYDRAULIC PRESSURE', type: SimVarValueType.PSI }],
      ['eng_starter_on', { name: 'GENERAL ENG STARTER', type: SimVarValueType.Bool }],
      ['eng_combustion', { name: 'GENERAL ENG COMBUSTION', type: SimVarValueType.Bool }],
      ['eng_ignition_switch_state', { name: 'TURB ENG IGNITION SWITCH EX1', type: SimVarValueType.Number }],
      ['eng_igniting', { name: 'TURB ENG IS IGNITING', type: SimVarValueType.Bool }],
      ['eng_fuel_pump_on', { name: 'GENERAL ENG FUEL PUMP ON', type: SimVarValueType.Bool }],
      ['eng_fuel_pump_switch_state', { name: 'GENERAL ENG FUEL PUMP SWITCH EX1', type: SimVarValueType.Number }],
      ['eng_vibration', { name: 'ENG VIBRATION', type: SimVarValueType.Number }],
      ['fuel_flow_pph', { name: 'ENG FUEL FLOW PPH', type: SimVarValueType.PPH }],
    ];

    const simvars = new Map<keyof EngineEvents, SimVarPublisherEntry<any>>(nonIndexedSimVars);

    // add engine-indexed simvars
    const engineCount = SimVar.GetSimVarValue('NUMBER OF ENGINES', SimVarValueType.Number);
    for (const [topic, simvar] of [...engineIndexedSimVars]) {
      // describe the indexed engine topics
      for (let i = 1; i <= engineCount; i++) {
        simvars.set(
          `${topic}_${i}`,
          {
            name: `${simvar.name}:${i}`,
            type: simvar.type,
            map: simvar.map
          }
        );
      }
    }

    super(simvars, bus, pacer);

    this.engineCount = engineCount;

    this.subscribed.add('fuel_flow_total');
  }

  /** @inheritdoc */
  public onUpdate(): void {
    super.onUpdate();

    if (this.subscribed.has('fuel_flow_total')) {
      let totalFuelFlow = 0;

      for (let i = 1; i <= this.engineCount; i++) {
        totalFuelFlow += SimVar.GetSimVarValue(`ENG FUEL FLOW GPH:${i}`, SimVarValueType.GPH);
      }

      this.publish('fuel_flow_total', totalFuelFlow);
    }
  }
}
