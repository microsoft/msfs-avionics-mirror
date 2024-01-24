import { ClockEvents, ConsumerValue, ElectricalEvents, EventBus, SimVarValueType, Subject } from '@microsoft/msfs-sdk';

/**
 * Events on the SR22T electrical system.
 */
export interface Sr22tElectricalSystemEvents {
  /** Battery 1 amps. */
  'sr22_batt_1_amps': number,

  /** Battery 2 amps. */
  'sr22_batt_2_amps': number,

  /** Essential Bus voltage. */
  'sr22_ess_bus_volts': number,
}

/**
 * A battery in the electrical system.
 */
export class Sr22tElectricalSystem {
  private static readonly V_MAX = 25.77;
  private static readonly V_MIN = 23.25;
  private static readonly R = 0.05;

  private readonly batt1AmpsOut = Subject.create(0);
  private readonly batt2AmpsOut = Subject.create(0);
  private readonly essBusVoltsOut = Subject.create(0);

  private readonly batt1Volts = ConsumerValue.create(this.bus.getSubscriber<ElectricalEvents>().on('elec_bat_v_1').atFrequency(1), 0);
  private readonly batt2Volts = ConsumerValue.create(this.bus.getSubscriber<ElectricalEvents>().on('elec_bat_v_2').atFrequency(1), 0);
  private readonly batt1Amps = ConsumerValue.create(this.bus.getSubscriber<ElectricalEvents>().on('elec_bat_a_1').atFrequency(1), 0);
  private readonly batt2Amps = ConsumerValue.create(this.bus.getSubscriber<ElectricalEvents>().on('elec_bat_a_2').atFrequency(1), 0);
  private readonly m1BusVolts = ConsumerValue.create(this.bus.getSubscriber<ElectricalEvents>().on('elec_bus_main_v_1').atFrequency(1), 0);
  private readonly m2BusVolts = ConsumerValue.create(this.bus.getSubscriber<ElectricalEvents>().on('elec_bus_main_v_2').atFrequency(1), 0);

  /**
   * Creates an instance of an ElectricalBattery.
   * @param bus The event bus to use with this instance.
   */
  constructor(private readonly bus: EventBus) {
    const publisher = bus.getPublisher<Sr22tElectricalSystemEvents>();
    this.batt1AmpsOut.sub(v => publisher.pub('sr22_batt_1_amps', v, true, true));
    this.batt2AmpsOut.sub(v => publisher.pub('sr22_batt_2_amps', v, true, true));
    this.essBusVoltsOut.sub(v => publisher.pub('sr22_ess_bus_volts', v, true, true));

    bus.getSubscriber<ClockEvents>().on('simTime').handle(this.update.bind(this));
  }

  /**
   * Updates the state of the electrical system.
   */
  public update(): void {
    const batt1Soc = SimVar.GetSimVarValue('ELECTRICAL BATTERY ESTIMATED CAPACITY PCT:1', SimVarValueType.Percent);
    const batt2Soc = SimVar.GetSimVarValue('ELECTRICAL BATTERY ESTIMATED CAPACITY PCT:2', SimVarValueType.Percent);

    this.batt1AmpsOut.set(this.calculateCurrent(this.batt1Amps.get(), this.batt1Volts.get(), batt1Soc));
    this.batt2AmpsOut.set(this.calculateCurrent(this.batt2Amps.get(), this.batt2Volts.get(), batt2Soc));
    this.essBusVoltsOut.set(this.calculateEssBusVolts(this.batt1Volts.get(), this.m1BusVolts.get(), this.m2BusVolts.get()));
  }

  /**
   * Calculates the current seen on a battery.
   * @param simAmps The number of amps from the sim.
   * @param simVolts The number of volts from the sim.
   * @param percentCharge The amount, in percent from 0 to 100, that the battery is currently charged.
   * @returns The calculated battery current.
   */
  private calculateCurrent(simAmps: number, simVolts: number, percentCharge: number): number {
    let battCurrent = 0;
    if (simAmps < 0) {
      const chargingVolts = Math.max(simVolts, Sr22tElectricalSystem.V_MAX);

      const soc = percentCharge;
      const ocv = soc / 100 * (chargingVolts - Sr22tElectricalSystem.V_MIN) + Sr22tElectricalSystem.V_MIN;

      const chargingPotential = chargingVolts - ocv;
      const chargingCurrent = chargingPotential / Sr22tElectricalSystem.R;
      battCurrent = -chargingCurrent;
    } else {
      battCurrent = simAmps;
    }

    return -battCurrent;
  }

  /**
   * Calculates the voltage of ESS BUS.
   * @param batt1Volts The voltage of battery 1.
   * @param m1BusVolts The voltage of main bus 1.
   * @param m2BusVolts The voltage of main bus 2.
   * @returns The calculated ESS BUS voltage.
   */
  private calculateEssBusVolts(batt1Volts: number, m1BusVolts: number, m2BusVolts: number): number {
    let essBusVolts = 0;
    if (batt1Volts > essBusVolts) { essBusVolts = batt1Volts; }
    if (m1BusVolts > essBusVolts) { essBusVolts = m1BusVolts; }
    if (m2BusVolts > essBusVolts) { essBusVolts = m2BusVolts; }
    return essBusVolts;
  }
}
