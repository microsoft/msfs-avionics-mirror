import {
  AdcEvents, AnnunciationType, APEvents, BrakeEvents, CasAlertTransporter, CasRegistrationManager, ClockEvents, ConsumerSubject, ControlSurfacesEvents,
  ElectricalEvents, EngineEvents, EventBus, GNSSEvents, MappedSubject, SimVarValueType, Subject
} from '@microsoft/msfs-sdk';

import { AlertMessage, CasAlertBridgeEvents } from '@microsoft/msfs-wtg1000';

import { Sr22tElectricalSystemEvents } from '../../MFD/Sr22tEcu/Sr22tElectricalSystem';
import { Sr22tSimvarEvents } from '../../MFD/Sr22tSimvarPublisher/Sr22tSimvarPublisher';

import './Sr22tCAS.css';
import '../../Shared/Common/Sr22t_Common.css';

/** CAS logic for the SR22T */
export class Sr22tCAS {

  private readonly subscriber = this.bus.getSubscriber<
    AdcEvents & ControlSurfacesEvents & GNSSEvents & EngineEvents & Sr22tSimvarEvents &
    APEvents & ClockEvents & ElectricalEvents & BrakeEvents & Sr22tElectricalSystemEvents
  >();

  // Source Data
  private readonly sourceData = {

    // Environment
    simTime: ConsumerSubject.create(this.subscriber.on('simTime').withPrecision(-3), 0),    // milliseconds, updates every second
    oat: ConsumerSubject.create(this.subscriber.on('ambient_temp_c').withPrecision(0), 0),  // degrees celcius

    // Air Data
    ias: ConsumerSubject.create(this.subscriber.on('ias').withPrecision(0), 0),                       // KIAS
    agl: ConsumerSubject.create(this.subscriber.on('above_ground_height').withPrecision(0), 0),       // FT
    verticalSpeed: ConsumerSubject.create(this.subscriber.on('vertical_speed').withPrecision(0), 0),  // FT/min
    aoa: ConsumerSubject.create(this.subscriber.on('aoa').withPrecision(1), 0),   // angle of attack, degrees
    stallAoa: SimVar.GetSimVarValue('STALL ALPHA', SimVarValueType.Degree), // stall angle of attack, degrees

    // Engine
    engineRPM: ConsumerSubject.create(this.subscriber.on('rpm_1').withPrecision(0), 0),  // RPM
    manPress: ConsumerSubject.create(this.subscriber.on('eng_manifold_pressure_1').withPrecision(1), 0).map((manPress) => manPress * 2.03602),  // inHg
    oilPress: ConsumerSubject.create(this.subscriber.on('oil_press_1').withPrecision(0), 0),  // PSI
    oilTemp: ConsumerSubject.create(this.subscriber.on('oil_temp_1').withPrecision(0), 0),    // degrees F
    cht1: ConsumerSubject.create(this.subscriber.on('c1_head_temp').withPrecision(0), 0),
    cht2: ConsumerSubject.create(this.subscriber.on('c2_head_temp').withPrecision(0), 0),
    cht3: ConsumerSubject.create(this.subscriber.on('c3_head_temp').withPrecision(0), 0),
    cht4: ConsumerSubject.create(this.subscriber.on('c4_head_temp').withPrecision(0), 0),
    cht5: ConsumerSubject.create(this.subscriber.on('c5_head_temp').withPrecision(0), 0),
    cht6: ConsumerSubject.create(this.subscriber.on('c6_head_temp').withPrecision(0), 0),
    tit1: ConsumerSubject.create(this.subscriber.on('t1_inlet_temp').withPrecision(0), 0),
    tit2: ConsumerSubject.create(this.subscriber.on('t2_inlet_temp').withPrecision(0), 0),

    // Aircraft
    parkBrakePos: ConsumerSubject.create(this.subscriber.on('parking_brake_pos').withPrecision(0), 0),
    gearOnGround: ConsumerSubject.create(this.subscriber.on('gear_is_on_ground'), false),
    flapLeverPosIndex: ConsumerSubject.create(this.subscriber.on('flaps_handle_index'), 0), // 0: 0%, 1: 50%, 2: 100%
    pitotSwitch: ConsumerSubject.create(this.subscriber.on('pitot_heat'), false),

    // Fuel
    leftFuel: ConsumerSubject.create(this.subscriber.on('fuel_left').withPrecision(1), 0),    // gallons
    rightFuel: ConsumerSubject.create(this.subscriber.on('fuel_right').withPrecision(1), 0),  // gallons
    fuelFlow: ConsumerSubject.create(this.subscriber.on('fuel_flow_1').withPrecision(0), 0),  // gallons/hour

    // Electrical
    alt1Amps: ConsumerSubject.create(this.subscriber.on('elec_bus_genalt_1_a').withPrecision(1), 0),   // Amps
    alt2Amps: ConsumerSubject.create(this.subscriber.on('elec_bus_genalt_2_a').withPrecision(1), 0),   // Amps
    essBusVolts: ConsumerSubject.create(this.subscriber.on('sr22_ess_bus_volts').withPrecision(1), 0), // Volts
    m1BusVolts: ConsumerSubject.create(this.subscriber.on('elec_bus_main_v_1').withPrecision(1), 0),   // Volts
    m2BusVolts: ConsumerSubject.create(this.subscriber.on('elec_bus_main_v_2').withPrecision(1), 0),   // Volts
    batt1Amps: ConsumerSubject.create(this.subscriber.on('sr22_batt_1_amps').withPrecision(0), 0),     // Amps
    avionicsOn: ConsumerSubject.create(this.subscriber.on('elec_circuit_avionics_on'), false),
    starterOn: ConsumerSubject.create(this.subscriber.on('eng_starter_on_1'), false),

    // Anti-Ice
    tksMode: ConsumerSubject.create(this.subscriber.on('anti_ice_mode').withPrecision(1), 0), // 0: off, 1: normal, 2: high, 3: max
    tksQtyLeft: ConsumerSubject.create(this.subscriber.on('anti_ice_fluid_qty_left').withPrecision(1), 0), // gallons
    tksQtyRight: ConsumerSubject.create(this.subscriber.on('anti_ice_fluid_qty_right').withPrecision(1), 0), // gallons

    // Auto Pilot
    hdgMode: ConsumerSubject.create(this.subscriber.on('ap_heading_hold'), false),
    hdgBug: ConsumerSubject.create(this.subscriber.on('ap_heading_selected'), 0),
    lastHdgBug: Subject.create(0),
    rolMode: ConsumerSubject.create(this.subscriber.on('ap_bank_hold'), false),
  };

  // Calculated Data
  private readonly calcData = {

    fuelImbalance: MappedSubject.create(
      ([leftFuel, rightFuel]): number => {
        return Math.abs(leftFuel - rightFuel);
      },
      this.sourceData.leftFuel, this.sourceData.rightFuel
    ),

    fuelTotal: MappedSubject.create(
      ([leftFuel, rightFuel]): number => {
        return leftFuel + rightFuel;
      },
      this.sourceData.leftFuel, this.sourceData.rightFuel
    ),

    // returns true when HDG bug is changed
    // returns false 100 ms after that HDG bug change
    hdgBugChange: MappedSubject.create(
      ([hdgBug, lastHdgBug]): boolean => {
        if (hdgBug === lastHdgBug) {
          return false;
        } else {
          setTimeout(() => {
            this.sourceData.lastHdgBug.set(hdgBug);
          }, 100);
          return true;
        }
      },
      this.sourceData.hdgBug, this.sourceData.lastHdgBug,
    ),

    tksQtyTotal: MappedSubject.create(
      ([tksQtyLeft, tksQtyRight]): number => {
        return tksQtyLeft + tksQtyRight;
      },
      this.sourceData.tksQtyLeft, this.sourceData.tksQtyRight,
    ),
  };

  /**
   * Initializes the warning CAS messages and associated alert messages.
   */
  private initWarningMessages(): void {
    const regManager = new CasRegistrationManager(this.bus);

    regManager.register({ uuid: 'anti-ice-qty', message: 'ANTI ICE QTY' });
    this.registerAssociatedAlert({ key: 'anti-ice-qty', title: 'ANTI ICE QTY', message: 'Fluid quantity is low (TKS).' });
    CasAlertTransporter.create(this.bus, 'anti-ice-qty', AnnunciationType.Warning)
      .bind(MappedSubject.create(([tksMode, tksQtyTotal]) => tksMode !== 0 && tksQtyTotal < 0.5, this.sourceData.tksMode, this.calcData.tksQtyTotal), v => v);

    regManager.register({ uuid: 'fuel-imbalance', message: 'FUEL IMBALANCE' });
    this.registerAssociatedAlert({ key: 'fuel-imbalance', title: 'FUEL IMBALANCE', message: 'Fuel quantity imbalance has been detected.' });
    CasAlertTransporter.create(this.bus, 'fuel-imbalance', AnnunciationType.Warning).bind(this.calcData.fuelImbalance, v => v > 12);

    regManager.register({ uuid: 'flaps-ice', message: 'FLAPS ICE' });
    this.registerAssociatedAlert({ key: 'flaps-ice', title: 'FLAPS ICE', message: 'Full flaps prohibited in icing conditions.' });
    CasAlertTransporter.create(this.bus, 'flaps-ice', AnnunciationType.Warning)
      .bind(MappedSubject.create(([flapLeverPosIndex, tksMode]) => flapLeverPosIndex === 2 && tksMode !== 0, this.sourceData.flapLeverPosIndex, this.sourceData.tksMode)
        , v => v);

    regManager.register({ uuid: 'cht-temperature', message: 'CHT' });
    this.registerAssociatedAlert({ key: 'cht-temperature', title: 'CHT', message: 'Cylinder head temperature is high.' });
    CasAlertTransporter.create(this.bus, 'cht-temperature', AnnunciationType.Warning)
      .bind(MappedSubject.create(([cht1, cht2, cht3, cht4, cht5, cht6]) => Math.max(cht1, cht2, cht3, cht4, cht5, cht6) > 460
        , this.sourceData.cht1, this.sourceData.cht2, this.sourceData.cht3, this.sourceData.cht4, this.sourceData.cht5, this.sourceData.cht6)
        , v => v);

    regManager.register({ uuid: 'ess-bus', message: 'ESS BUS' });
    this.registerAssociatedAlert({ key: 'ess-bus', title: 'ESS BUS', message: 'Check essential power bus voltage.' });
    CasAlertTransporter.create(this.bus, 'ess-bus', AnnunciationType.Warning).bind(this.sourceData.essBusVolts, v => v <= 24.4 || 32 < v);

    regManager.register({ uuid: 'fuel-flow', message: 'FUEL FLOW' });
    this.registerAssociatedAlert({ key: 'fuel-flow', title: 'FUEL FLOW', message: 'Check fuel flow.' });
    CasAlertTransporter.create(this.bus, 'fuel-flow', AnnunciationType.Warning).bind(this.sourceData.fuelFlow, v => v > 42);

    regManager.register({ uuid: 'fuel-low-left', message: 'FUEL LOW LEFT' });
    this.registerAssociatedAlert({ key: 'fuel-low-left', title: 'FUEL LOW LEFT', message: 'Check left fuel tank level.' });
    CasAlertTransporter.create(this.bus, 'fuel-low-left', AnnunciationType.Warning).bind(this.sourceData.leftFuel, v => v < 1);

    regManager.register({ uuid: 'fuel-low-right', message: 'FUEL LOW RIGHT' });
    this.registerAssociatedAlert({ key: 'fuel-low-right', title: 'FUEL LOW RIGHT', message: 'Check right fuel tank level.' });
    CasAlertTransporter.create(this.bus, 'fuel-low-right', AnnunciationType.Warning).bind(this.sourceData.rightFuel, v => v < 1);

    regManager.register({ uuid: 'fuel-low-total', message: 'FUEL LOW TOTAL' });
    this.registerAssociatedAlert({ key: 'fuel-low-total', title: 'FUEL LOW TOTAL', message: 'Check fuel tank levels.' });
    CasAlertTransporter.create(this.bus, 'fuel-low-total', AnnunciationType.Warning).bind(this.calcData.fuelTotal, v => v < 9);

    regManager.register({ uuid: 'm-bus-1', message: 'M BUS 1' });
    this.registerAssociatedAlert({ key: 'm-bus-1', title: 'M BUS 1', message: 'Check main power bus 1 voltage.' });
    CasAlertTransporter.create(this.bus, 'm-bus-1', AnnunciationType.Warning).bind(this.sourceData.m1BusVolts, v => v > 32);

    regManager.register({ uuid: 'm-bus-2', message: 'M BUS 2' });
    this.registerAssociatedAlert({ key: 'm-bus-2', title: 'M BUS 2', message: 'Check main power bus 2 voltage.' });
    CasAlertTransporter.create(this.bus, 'm-bus-2', AnnunciationType.Warning).bind(this.sourceData.m2BusVolts, v => v > 32);

    regManager.register({ uuid: 'man-pressure', message: 'MAN PRESSURE', debounceTime: 500 });
    this.registerAssociatedAlert({ key: 'man-pressure', title: 'MAN PRESSURE', message: 'Check manifold pressure.' });
    CasAlertTransporter.create(this.bus, 'man-pressure', AnnunciationType.Warning).bind(this.sourceData.manPress, v => v > 37.5);

    regManager.register({ uuid: 'oil-press', message: 'OIL PRESS' });
    this.registerAssociatedAlert({ key: 'oil-press', title: 'OIL PRESS', message: 'Oil pressure is out of range.' });
    CasAlertTransporter.create(this.bus, 'oil-press', AnnunciationType.Warning).bind(this.sourceData.oilPress, v => v <= 10 || 100 < v);

    regManager.register({ uuid: 'oil-temp', message: 'OIL TEMP' });
    this.registerAssociatedAlert({ key: 'oil-temp', title: 'OIL TEMP', message: 'Oil temperature is high.' });
    CasAlertTransporter.create(this.bus, 'oil-temp', AnnunciationType.Warning).bind(this.sourceData.oilTemp, v => v > 240);

    regManager.register({ uuid: 'engine-rpm', message: 'RPM', debounceTime: 1000 });
    this.registerAssociatedAlert({ key: 'engine-rpm', title: 'RPM', message: 'Check engine RPM.' });
    CasAlertTransporter.create(this.bus, 'engine-rpm', AnnunciationType.Warning).bind(this.sourceData.engineRPM, v => v > 2550);

    regManager.register({ uuid: 'aero-stall', message: 'STALL', debounceTime: 250 });
    this.registerAssociatedAlert({ key: 'aero-stall', title: 'STALL', message: 'Stall warning.' });
    CasAlertTransporter.create(this.bus, 'aero-stall', AnnunciationType.Warning)
      .bind(MappedSubject.create(([aoa, onGround]) => aoa >= this.sourceData.stallAoa && !onGround, this.sourceData.aoa, this.sourceData.gearOnGround), v => v);

    regManager.register({ uuid: 'start-engaged', message: 'START ENGAGED' });
    this.registerAssociatedAlert({ key: 'start-engaged', title: 'START ENGAGED', message: 'Starter is engaged.' });
    CasAlertTransporter.create(this.bus, 'start-engaged', AnnunciationType.Warning).bindStateUpdate((dt, state) => {
      if (this.sourceData.starterOn.get()) {
        state.timeOn += dt;
      } else {
        state.timeOn = 0;
      }

      return state.timeOn >= 30000;
    }, { timeOn: 0 });

    regManager.register({ uuid: 'engine-tit', message: 'TIT', debounceTime: 1000 });
    this.registerAssociatedAlert({ key: 'engine-tit', title: 'TIT', message: 'TIT temperature is high.' });
    CasAlertTransporter.create(this.bus, 'engine-tit', AnnunciationType.Warning)
      .bind(MappedSubject.create(([tit1, tit2]) => Math.max(tit1, tit2) > 1750, this.sourceData.tit1, this.sourceData.tit2), v => v);
  }

  /**
   * Initializes caution CAS messages.
   */
  private initCautionMessages(): void {
    const regManager = new CasRegistrationManager(this.bus);

    regManager.register({ uuid: 'flap-overspeed', message: 'FLAP OVERSPEED', debounceTime: 5000 });
    this.registerAssociatedAlert({ key: 'flap-overspeed', title: 'FLAP OVERSPEED', message: 'Flaps are extended beyond airspeed limitations.' });
    CasAlertTransporter.create(this.bus, 'flap-overspeed', AnnunciationType.Caution)
      .bind(MappedSubject.create(([pos, ias]) => (pos === 1 && ias > 150) || (pos === 2 && ias > 110), this.sourceData.flapLeverPosIndex, this.sourceData.ias), v => v);

    regManager.register({ uuid: 'takeoff-flaps', message: 'TAKEOFF FLAPS', debounceTime: 1000 });
    this.registerAssociatedAlert({ key: 'takeoff-flaps', title: 'TAKEOFF FLAPS', message: 'Flaps not in takeoff configuration.' });
    CasAlertTransporter.create(this.bus, 'takeoff-flaps', AnnunciationType.Caution)
      .bind(MappedSubject.create(([pos, rpm, onGround]) => pos !== 1 && rpm > 2400 && onGround
        , this.sourceData.flapLeverPosIndex, this.sourceData.engineRPM, this.sourceData.gearOnGround)
        , v => v);

    regManager.register({ uuid: 'ai-temp-low', message: 'ANTI ICE TEMP' });
    this.registerAssociatedAlert({ key: 'ai-temp-low', title: 'ANTI ICE TEMP', message: 'Temperature is too low for ice protection (TKS).' });
    CasAlertTransporter.create(this.bus, 'ai-temp-low', AnnunciationType.Caution)
      .bind(MappedSubject.create(([mode, oat]) => mode !== 0 && oat < -34, this.sourceData.tksMode, this.sourceData.oat), v => v);

    regManager.register({ uuid: 'ai-speed-low', message: 'ANTI ICE SPEED' });
    this.registerAssociatedAlert({ key: 'ai-speed-low', title: 'ANTI ICE SPEED', message: 'Airspeed is too low for ice protection (TKS).' });
    CasAlertTransporter.create(this.bus, 'ai-speed-low', AnnunciationType.Caution)
      .bind(MappedSubject.create(([mode, ias]) => mode !== 0 && ias < 95, this.sourceData.tksMode, this.sourceData.ias), v => v);

    regManager.register({ uuid: 'ai-speed-high', message: 'ANTI ICE SPEED' });
    this.registerAssociatedAlert({ key: 'ai-speed-high', title: 'ANTI ICE SPEED', message: 'Airspeed is too high for ice protection (TKS).' });
    CasAlertTransporter.create(this.bus, 'ai-speed-high', AnnunciationType.Caution)
      .bind(MappedSubject.create(([mode, ias]) => mode !== 0 && ias > 177, this.sourceData.tksMode, this.sourceData.ias), v => v);

    regManager.register({ uuid: 'elec-alt-1', message: 'ALT 1' });
    this.registerAssociatedAlert({ key: 'elec-alt-1', title: 'ALT 1', message: 'Check alternator 1 current.' });
    CasAlertTransporter.create(this.bus, 'elec-alt-1', AnnunciationType.Caution).bind(this.sourceData.alt1Amps, v => 0 <= v && v <= 1);

    regManager.register({ uuid: 'elec-alt-2', message: 'ALT 2' });
    this.registerAssociatedAlert({ key: 'elec-alt-2', title: 'ALT 2', message: 'Check alternator 2 current.' });
    CasAlertTransporter.create(this.bus, 'elec-alt-2', AnnunciationType.Caution).bind(this.sourceData.alt2Amps, v => 0 <= v && v <= 1);

    regManager.register({ uuid: 'avionics-off', message: 'AVIONICS OFF' });
    this.registerAssociatedAlert({ key: 'avionics-off', title: 'AVIONICS OFF', message: 'Avionics master switch is off.' });
    CasAlertTransporter.create(this.bus, 'avionics-off', AnnunciationType.Caution).bind(this.sourceData.avionicsOn, v => !v);

    regManager.register({ uuid: 'elec-batt-1', message: 'BATT 1' });
    this.registerAssociatedAlert({ key: 'elec-batt-1', title: 'BATT 1', message: 'Check battery 1 current.' });
    CasAlertTransporter.create(this.bus, 'elec-batt-1', AnnunciationType.Caution).bind(this.sourceData.batt1Amps, v => -59 <= v && v <= -5);

    regManager.register({ uuid: 'park-brake', message: 'PARK BRAKE' });
    this.registerAssociatedAlert({ key: 'park-brake', title: 'PARK BRAKE', message: 'Parking brake is set.' });
    CasAlertTransporter.create(this.bus, 'park-brake', AnnunciationType.Caution).bind(this.sourceData.parkBrakePos, v => v > 0);

    regManager.register({ uuid: 'pitot-heat', message: 'PITOT HEAT REQD', debounceTime: 15000 });
    this.registerAssociatedAlert({ key: 'pitot-heat', title: 'PITOT HEAT REQD', message: 'Pitot heat is required.' });
    CasAlertTransporter.create(this.bus, 'pitot-heat', AnnunciationType.Caution)
      .bind(MappedSubject.create(([on, oat]) => !on && oat < 5, this.sourceData.pitotSwitch, this.sourceData.oat), v => v);

    //Already registered
    CasAlertTransporter.create(this.bus, 'anti-ice-qty', AnnunciationType.Caution)
      .bind(MappedSubject.create(([tksMode, tksQtyTotal]) => tksMode !== 0 && (0.5 <= tksQtyTotal && tksQtyTotal < 1.0),
        this.sourceData.tksMode, this.calcData.tksQtyTotal), v => v);

    CasAlertTransporter.create(this.bus, 'cht-temperature', AnnunciationType.Caution)
      .bind(MappedSubject.create(([cht1, cht2, cht3, cht4, cht5, cht6]) => Math.max(cht1, cht2, cht3, cht4, cht5, cht6) > 420
        , this.sourceData.cht1, this.sourceData.cht2, this.sourceData.cht3, this.sourceData.cht4, this.sourceData.cht5, this.sourceData.cht6)
        , v => v);

    CasAlertTransporter.create(this.bus, 'fuel-imbalance', AnnunciationType.Caution).bind(this.calcData.fuelImbalance, v => {
      return v > 10;
    });
    CasAlertTransporter.create(this.bus, 'fuel-low-total', AnnunciationType.Caution).bind(this.calcData.fuelTotal, v => v <= 14);
    CasAlertTransporter.create(this.bus, 'm-bus-1', AnnunciationType.Caution).bind(this.sourceData.m1BusVolts, v => v <= 24.4);
    CasAlertTransporter.create(this.bus, 'm-bus-2', AnnunciationType.Caution).bind(this.sourceData.m2BusVolts, v => v <= 24.4);
    CasAlertTransporter.create(this.bus, 'man-pressure', AnnunciationType.Caution).bind(this.sourceData.manPress, v => v > 36.5);
    CasAlertTransporter.create(this.bus, 'oil-press', AnnunciationType.Caution).bind(this.sourceData.oilPress, v => (10 <= v && v <= 30) || (60 <= v && v <= 100));
    CasAlertTransporter.create(this.bus, 'oil-temp', AnnunciationType.Caution).bind(this.sourceData.oilTemp, v => v >= 235);
    CasAlertTransporter.create(this.bus, 'start-engaged', AnnunciationType.Caution).bindStateUpdate((dt, state) => {
      if (this.sourceData.starterOn.get()) {
        state.timeOn += dt;
      } else {
        state.timeOn = 0;
      }

      return state.timeOn >= 15000;
    }, { timeOn: 0 });
  }

  /**
   * Initializes the advisory CAS messages.
   */
  private initAdvisoryMessages(): void {
    const regManager = new CasRegistrationManager(this.bus);

    regManager.register({ uuid: 'flaps-climb', message: 'FLAPS CLIMB', debounceTime: 30000 });
    this.registerAssociatedAlert({ key: 'flaps-climb', title: 'FLAPS CLIMB', message: 'Flaps not set for enroute climb.' });
    CasAlertTransporter.create(this.bus, 'flaps-climb', AnnunciationType.Advisory)
      .bind(MappedSubject.create(([pos, agl, vs]) => pos !== 0 && agl > 1000 && vs >= 200,
        this.sourceData.flapLeverPosIndex, this.sourceData.agl, this.sourceData.verticalSpeed), v => v);

    regManager.register({ uuid: 'hdg-mode', message: 'HDG MODE', debounceTime: 600000 });
    this.registerAssociatedAlert({ key: 'hdg-mode', title: 'HDG MODE', message: 'Heading mode active for extended period.' });
    CasAlertTransporter.create(this.bus, 'hdg-mode', AnnunciationType.Advisory)
      .bind(MappedSubject.create(([hdgMode, hdgBugChange]) => hdgMode && !hdgBugChange, this.sourceData.hdgMode, this.calcData.hdgBugChange), v => v);

    regManager.register({ uuid: 'rol-mode', message: 'ROL MODE', debounceTime: 30000 });
    this.registerAssociatedAlert({ key: 'rol-mode', title: 'ROL MODE', message: 'Roll mode is active.' });
    CasAlertTransporter.create(this.bus, 'rol-mode', AnnunciationType.Advisory).bind(this.sourceData.rolMode, v => v);

    regManager.register({ uuid: 'exit-icing', message: 'EXIT ICING', debounceTime: 300000 });
    this.registerAssociatedAlert({ key: 'exit-icing', title: 'EXIT ICING', message: 'Exit icing conditions.' });
    CasAlertTransporter.create(this.bus, 'exit-icing', AnnunciationType.Advisory).bind(this.sourceData.tksMode, v => v !== 0);

    //Already registered
    CasAlertTransporter.create(this.bus, 'anti-ice-qty', AnnunciationType.Advisory)
      .bind(MappedSubject.create(([tksMode, tksQtyTotal]) => tksMode === 0 && tksQtyTotal < 1, this.sourceData.tksMode, this.calcData.tksQtyTotal), v => v);

    CasAlertTransporter.create(this.bus, 'fuel-imbalance', AnnunciationType.Advisory).bind(this.calcData.fuelImbalance, v => v > 8);
  }

  /**
   * Registers an associated alert message.
   * @param alert The alert to register.
   */
  private registerAssociatedAlert(alert: AlertMessage): void {
    this.bus.getPublisher<CasAlertBridgeEvents>().pub('cas_register_associated_message', alert);
  }

  /**
   * Constructor
   * @param bus Eventbus
   */
  constructor(private readonly bus: EventBus) {
    // Initialize all CAS message arrays
    this.initWarningMessages();
    this.initCautionMessages();
    this.initAdvisoryMessages();
  }
}
