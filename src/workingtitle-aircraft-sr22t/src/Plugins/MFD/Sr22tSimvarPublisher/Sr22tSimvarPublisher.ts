import { EventBus, SimVarDefinition, SimVarPublisher, SimVarValueType } from '@microsoft/msfs-sdk';

/**
 * Events related to the SR22T
 */
export interface Sr22tSimvarEvents {

  /** The seconds since midnight (zulu time) until sunrise at the aircraft's location. */
  sunrise: number;
  /** The seconds since midnight (zulu time) until sunset at the aircraft's location. */
  sunset: number;

  // Engine Temperatures

  /** The head temp of cylinder 1. */
  c1_head_temp: number;
  /** The head temp of cylinder 2. */
  c2_head_temp: number;
  /** The head temp of cylinder 3. */
  c3_head_temp: number;
  /** The head temp of cylinder 4. */
  c4_head_temp: number;
  /** The head temp of cylinder 5. */
  c5_head_temp: number;
  /** The head temp of cylinder 6. */
  c6_head_temp: number;
  /** The inlet temp of turbine 1. */
  t1_inlet_temp: number;
  /** The inlet temp of turbine 2. */
  t2_inlet_temp: number;
  /** The exhaust gas temp of cylinder 1. */
  c1_exhaust_temp: number;
  /** The exhaust gas temp of cylinder 2. */
  c2_exhaust_temp: number;
  /** The exhaust gas temp of cylinder 3. */
  c3_exhaust_temp: number;
  /** The exhaust gas temp of cylinder 4. */
  c4_exhaust_temp: number;
  /** The exhaust gas temp of cylinder 5. */
  c5_exhaust_temp: number;
  /** The exhaust gas temp of cylinder 6. */
  c6_exhaust_temp: number;


  // Anti Ice

  /** The TKS fluid quiantity (in gallons) in the left tank. */
  anti_ice_fluid_qty_left: number;
  /** The TKS fluid quiantity (in gallons) in the right tank. */
  anti_ice_fluid_qty_right: number;
  /** The current mode of the anti ice system. 0: off, 1: normal, 2: high, 3: max */
  anti_ice_mode: number;
  /** The current Anti-Ice auto tank selection mode. 0: Auto, 1: Left, 2: Right. */
  anti_ice_tank_mode: number;
  /** The flow rate in gallons per hour of the anti ice fluid. */
  anti_ice_fluid_flow_rate: number;


  // Other

  /** Parking brake position, 100: fully engaged, 0: fully disengaged */
  parking_brake_pos: number;
  /** Pitot Heat switch position */
  pitot_heat: boolean;
}

/**
 * A publisher that publishes SR22T simvar events.
 */
export class Sr22tSimvarPublisher extends SimVarPublisher<Sr22tSimvarEvents> {

  private static simvars = new Map<keyof Sr22tSimvarEvents, SimVarDefinition>([

    ['sunrise', { name: 'E:ZULU SUNRISE TIME', type: SimVarValueType.Seconds }],
    ['sunset', { name: 'E:ZULU SUNSET TIME', type: SimVarValueType.Seconds }],

    // Emgine Temperatures
    ['c1_head_temp', { name: 'L:C1_HEAD_TEMP', type: SimVarValueType.Farenheit }],
    ['c2_head_temp', { name: 'L:C2_HEAD_TEMP', type: SimVarValueType.Farenheit }],
    ['c3_head_temp', { name: 'L:C3_HEAD_TEMP', type: SimVarValueType.Farenheit }],
    ['c4_head_temp', { name: 'L:C4_HEAD_TEMP', type: SimVarValueType.Farenheit }],
    ['c5_head_temp', { name: 'L:C5_HEAD_TEMP', type: SimVarValueType.Farenheit }],
    ['c6_head_temp', { name: 'L:C6_HEAD_TEMP', type: SimVarValueType.Farenheit }],
    ['t1_inlet_temp', { name: 'L:T1_INLET_TEMP', type: SimVarValueType.Farenheit }],
    ['t2_inlet_temp', { name: 'L:T2_INLET_TEMP', type: SimVarValueType.Farenheit }],
    ['c1_exhaust_temp', { name: 'L:C1_EXHAUST_TEMP', type: SimVarValueType.Farenheit }],
    ['c2_exhaust_temp', { name: 'L:C2_EXHAUST_TEMP', type: SimVarValueType.Farenheit }],
    ['c3_exhaust_temp', { name: 'L:C3_EXHAUST_TEMP', type: SimVarValueType.Farenheit }],
    ['c4_exhaust_temp', { name: 'L:C4_EXHAUST_TEMP', type: SimVarValueType.Farenheit }],
    ['c5_exhaust_temp', { name: 'L:C5_EXHAUST_TEMP', type: SimVarValueType.Farenheit }],
    ['c6_exhaust_temp', { name: 'L:C6_EXHAUST_TEMP', type: SimVarValueType.Farenheit }],

    // Anti Ice
    ['anti_ice_fluid_qty_left', { name: 'L:WT1000_TKS_QtyLeft', type: SimVarValueType.GAL }],
    ['anti_ice_fluid_qty_right', { name: 'L:WT1000_TKS_QtyRight', type: SimVarValueType.GAL }],
    ['anti_ice_mode', { name: 'L:WT1000_TKS_CurrentMode', type: SimVarValueType.Number }],
    ['anti_ice_tank_mode', { name: 'L:WT1000_TKS_TankMode', type: SimVarValueType.Number }],
    ['anti_ice_fluid_flow_rate', { name: 'L:WT1000_TKS_CurrentFlow', type: SimVarValueType.GPH }],

    // Other
    ['parking_brake_pos', { name: 'L:ParkingBrake_Position', type: SimVarValueType.Number }],
    ['pitot_heat', { name: 'L:DEICE_Pitot_1', type: SimVarValueType.Bool }],
  ]);

  /**
   * Creates an instance of the Sr22tSimvarPublisher.
   * @param bus The event bus to use with this instance.
   */
  constructor(bus: EventBus) {
    super(Sr22tSimvarPublisher.simvars, bus);
  }
}
