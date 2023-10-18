import {
  ControlSurfacesEvents, ControlSurfacesPublisher, EISPublisher, ElectricalEvents, ElectricalPublisher, EngineEvents, EventBus, EventSubscriber, FadecEvents,
  ObjectSubject
} from '@microsoft/msfs-sdk';

import { CJ4FadecPublisher } from '../../../Shared/Fadec/FadecPublisher';
import { FuelTempEvents, FuelTempSystemSimple } from '../../../Shared/Systems/FuelSystemMock';

/**
 * Struct for engine data in WT21.
 */
export interface EisEngineData {
  /**
   * The left engine N1%.
   */
  n1_1: number;
  /**
   * The right engine N1%.
   */
  n1_2: number;
  /**
   * The left engine N2%.
   */
  n2_1: number;
  /**
   * The right engine N2%.
   */
  n2_2: number;
  /**
   * The left engine ITT temperature.
   */
  itt_1: number;
  /**
   * The right engine ITT temperature.
   */
  itt_2: number;
  /**
   * The left engine oil pressure.
   */
  oil_press_1: number;
  /**
   * The right engine oil pressure.
   */
  oil_press_2: number;
  /**
   * The left engine oil temperature.
   */
  oil_temp_1: number;
  /**
   * The right engine oil temperature.
   */
  oil_temp_2: number;
  /**
   * The left engine fuel flow.
   */
  fuel_flow_1: number;
  /**
   * The right engine fuel flow.
   */
  fuel_flow_2: number;
  /**
   * The left engine fuel temperature.
   */
  fuel_temp_1: number;
  /**
   * The right engine fuel temperature.
   */
  fuel_temp_2: number;
  /**
   * The left tank fuel quantity.
   */
  fuel_left: number;
  /**
   * The right tank fuel quantity.
   */
  fuel_right: number;

  /** A hydraulic pressure value for engine 1 */
  eng_hyd_press_1: number;

  /** A hydraulic pressure value for engine 2 */
  eng_hyd_press_2: number;

  /** A value indicating if engine 1 starter is on */
  eng_starter_on_1: boolean;

  /** A value indicating if engine 2 starter is on */
  eng_starter_on_2: boolean;

  /** A value indicating if engine 1 combustion is on */
  eng_combustion_1: boolean;

  /** A value indicating if engine 2 combustion is on */
  eng_combustion_2: boolean;

  /** A value indicating if engine 1 manual ignition is on */
  eng_ignition_switch_state_1: 0 | 1 | 2;

  /** A value indicating if engine 2 manual ignition is on */
  eng_ignition_switch_state_2: 0 | 1 | 2;
}

/**
 * Struct for (secondary) control surfaces data in WT21.
 */
export interface EisSurfacesData {
  /** The handle index for flaps. */
  flaps_left_angle: number;

  /** The percent of applied elevator trim. */
  elevator_trim_pct: number;

  /** The neutral position in percent of the elevator trim. */
  elevator_trim_neutral_pct: number;

  /** The percent of applied aileron trim. */
  aileron_trim_pct: number;

  /** The percent of applied rudder trim. */
  rudder_trim_pct: number;

  /** The gear position index. */
  gear_position: number;
}

/**
 * Struct for electrics data in WT21.
 */
export interface EisElectricsData {
  /** A voltage value for the generator/alternator 1 bus */
  elec_bus_genalt_1_v: number,

  /** A voltage value for the generator/alternator 2 bus */
  elec_bus_genalt_2_v: number,

  /** A current value for the generator/alternator 1 bus */
  elec_bus_genalt_1_a: number,

  /** A current value for the generator/alternator 2 bus */
  elec_bus_genalt_2_a: number,

  /** The voltage value for the battery bus */
  elec_bus_main_v_3: number;

  /** The current value for the battery */
  elec_bat_a_1: number;
}

/**
 * Struct for FADEC data in WT21.
 */
export interface EisFadecData {
  /** FADEC mode for engine 1. */
  fadec_mode_1: string;

  /** FADEC mode for engine 2. */
  fadec_mode_2: string;

  /** FADEC target N1 for engine 1. */
  fadec_tgt_n1_1: number;

  /** FADEC target N1 for engine 2. */
  fadec_tgt_n1_2: number;
}

/**
 * An instrument for gathering engine and systems data.
 */
export class EisInstrument {
  public readonly eisPub: EISPublisher;
  public readonly surfacesPub: ControlSurfacesPublisher;
  public readonly elecPub: ElectricalPublisher;
  public readonly fadecPub: CJ4FadecPublisher;
  private readonly eisSub: EventSubscriber<EngineEvents>;
  private readonly fuelTempSub: EventSubscriber<FuelTempEvents>;
  private readonly surfacesSub: EventSubscriber<ControlSurfacesEvents>;
  private readonly elecSub: EventSubscriber<ElectricalEvents>;
  private readonly fadecSub: EventSubscriber<FadecEvents>;
  private readonly fuelTempSystem: FuelTempSystemSimple;

  public readonly engineData = ObjectSubject.create<EisEngineData>({
    n1_1: 0,
    n1_2: 0,
    n2_1: 0,
    n2_2: 0,
    itt_1: 0,
    itt_2: 0,
    oil_press_1: 0,
    oil_press_2: 0,
    oil_temp_1: 0,
    oil_temp_2: 0,
    fuel_flow_1: 0,
    fuel_flow_2: 0,
    fuel_temp_1: 0,
    fuel_temp_2: 0,
    fuel_left: 0,
    fuel_right: 0,
    eng_hyd_press_1: 0,
    eng_hyd_press_2: 0,
    eng_starter_on_1: false,
    eng_starter_on_2: false,
    eng_combustion_1: false,
    eng_combustion_2: false,
    eng_ignition_switch_state_1: 0,
    eng_ignition_switch_state_2: 0,
  });

  public readonly surfacesData = ObjectSubject.create<EisSurfacesData>({
    flaps_left_angle: 0,
    elevator_trim_pct: 0,
    elevator_trim_neutral_pct: 0,
    aileron_trim_pct: 0,
    rudder_trim_pct: 0,
    gear_position: 0,
  });

  public readonly elecData = ObjectSubject.create<EisElectricsData>({
    elec_bus_genalt_1_v: 0,
    elec_bus_genalt_2_v: 0,
    elec_bus_genalt_1_a: 0,
    elec_bus_genalt_2_a: 0,
    elec_bus_main_v_3: 0,
    elec_bat_a_1: 0,
  });

  public readonly fadecData = ObjectSubject.create<EisFadecData>({
    fadec_mode_1: '',
    fadec_mode_2: '',
    fadec_tgt_n1_1: 0,
    fadec_tgt_n1_2: 0
  });

  /**
   * Create an EisInstrument
   * @param bus The event bus to publish to
   */
  public constructor(bus: EventBus) {
    this.fuelTempSystem = new FuelTempSystemSimple(bus);
    this.eisPub = new EISPublisher(bus);
    this.surfacesPub = new ControlSurfacesPublisher(bus, 3);
    this.elecPub = new ElectricalPublisher(bus);
    this.fadecPub = new CJ4FadecPublisher(bus);
    this.eisSub = bus.getSubscriber<EngineEvents>();
    this.fuelTempSub = bus.getSubscriber<FuelTempEvents>();
    this.surfacesSub = bus.getSubscriber<ControlSurfacesEvents>();
    this.elecSub = bus.getSubscriber<ElectricalEvents>();
    this.fadecSub = bus.getSubscriber<FadecEvents>();
    this.setupSubscriptions();
  }


  /**
   * Sets up the event subscriptions on the event bus.
   */
  private setupSubscriptions(): void {
    for (const event in this.engineData.get()) {
      this.eisSub.on(event as keyof EngineEvents).withPrecision(1).handle((value: any): void => {
        this.engineData.set(event as keyof EisEngineData, value);
      });
    }

    // sub to fuel temp mock
    this.fuelTempSub.on('fuel_temp_1').withPrecision(1).handle((v) => {
      this.engineData.set('fuel_temp_1', v);
    });
    this.fuelTempSub.on('fuel_temp_2').withPrecision(1).handle((v) => {
      this.engineData.set('fuel_temp_2', v);
    });

    for (const event in this.surfacesData.get()) {
      this.surfacesSub.on(event as keyof EisSurfacesData).withPrecision(0).handle((value: number): void => {
        this.surfacesData.set(event as keyof EisSurfacesData, value);
      });
    }

    for (const event in this.elecData.get()) {
      this.elecSub.on(event as keyof ElectricalEvents).withPrecision(1).handle((value: number | boolean): void => {
        // right now we only publish the numerical values here
        this.elecData.set(event as keyof EisElectricsData, value as number);
      });
    }

    for (const event in this.fadecData.get()) {
      this.fadecSub.on(event as keyof FadecEvents).whenChanged().handle((value: string | boolean): void => {
        this.fadecData.set(event as keyof EisFadecData, value as string);
      });
    }
  }
}
