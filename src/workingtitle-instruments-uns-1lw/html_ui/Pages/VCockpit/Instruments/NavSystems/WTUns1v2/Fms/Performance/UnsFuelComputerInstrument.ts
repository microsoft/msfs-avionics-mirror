import {
  AdcEvents, ClockEvents, ConsumerValue, EngineEvents, EventBus, GNSSEvents, IndexedEvents, Instrument, MathUtils, NumberToRangeUnion, SimVarDefinition,
  SimVarPublisher, SimVarValueType
} from '@microsoft/msfs-sdk';

import { SensorsConfigBuilder, UnsFuelFlowSensorIndex, UnsFuelFlowSensors } from '../../Config/SensorsConfigBuilder';

/** Events with which to control the {@link UnsFuelComputerInstrument}. */
export interface UnsFuelComputerControlEvents {
  /** Commands the fuel computer to reset the amount of fuel burned to zero. */
  fuel_totalizer_reset: void;
}

/** Simvars to publish. */
enum FuelComputerSimVars {
  TotalBurned = 'L:WT_UNS_Fuel_Burned_Total',
  TotalFlow = 'L:WT_UNS_Fuel_Flow_Total',
}

/** Aircraft-wide events related to the fuel computer. */
interface BaseUnsFuelComputerEvents {
  /** The amount of fuel at the time of liftoff, in pounds, or `null` if takeoff has not yet occurred. */
  fuel_at_departure: number | null;

  /** The amount of fuel burned by all engines, in pounds. */
  fuel_totalizer_burned_total: number;

  /** The current fuel flow to all engines, in PPH. */
  fuel_totalizer_flow_total: number;

  /** Fuel economy in NM/lb based on present ground speed and fuel flow. */
  fuel_economy_ground_speed: number;

  /** Fuel economy in NM/lb based on present true air speed and fuel flow. */
  fuel_economy_true_air_speed: number;

  /** The cumulative number of true air miles flown (i.e. TAS integrated over time). aka **ESAD**, *equivalent still air distance*. */
  true_air_miles_flown: number;
}

/** Indexed events related to the fuel computer. */
interface FuelComputerIndexedTopics {
  /** The amount of fuel burned per engine, in pounds. */
  fuel_totalizer_burned: number;
}

/** Events related to the fuel computer. */
export type UnsFuelComputerEvents<E extends number = number> =
  BaseUnsFuelComputerEvents & IndexedEvents<FuelComputerIndexedTopics, NumberToRangeUnion<E>>;

/** A publisher for fuel computer events. */
export class UnsFuelComputerSimVarPublisher extends SimVarPublisher<UnsFuelComputerEvents> {
  private static simvars = new Map<keyof BaseUnsFuelComputerEvents, SimVarDefinition>([
    ['fuel_totalizer_burned_total', { name: FuelComputerSimVars.TotalBurned, type: SimVarValueType.Pounds }],
    ['fuel_totalizer_flow_total', { name: FuelComputerSimVars.TotalFlow, type: SimVarValueType.PPH }],
  ]);

  // eslint-disable-next-line jsdoc/require-jsdoc
  public constructor(bus: EventBus) {
    super(UnsFuelComputerSimVarPublisher.simvars, bus);
  }
}

/** Data about each fuel sensor. */
interface FuelData {
  /** How much each sensor has burned in pounds. */
  burned: number,
  /** The current flow through the sensor in PPH. */
  flow: ConsumerValue<number>,
}

/** An instrument that tracks fuel state for use by the G3000. */
export class UnsFuelComputerInstrument implements Instrument {
  private readonly fuelData: Map<UnsFuelFlowSensorIndex, FuelData> = new Map();

  private fuelAtDeparture: number | null = null;

  private totalTrueAirMilesFlown = 0;

  private readonly fuelOnBoard = ConsumerValue.create(this.bus.getSubscriber<EngineEvents>().on('fuel_total_weight').atFrequency(1), 0);

  private readonly isOnGround = ConsumerValue.create(this.bus.getSubscriber<AdcEvents>().on('on_ground').whenChanged(), true);

  private readonly groundSpeed = ConsumerValue.create(this.bus.getSubscriber<GNSSEvents>().on('ground_speed'), 0);

  private readonly tas = ConsumerValue.create(this.bus.getSubscriber<AdcEvents>().on('tas'), 0);

  private readonly simTimeMs = ConsumerValue.create(this.bus.getSubscriber<ClockEvents>().on('simTime'), 0);
  private readonly simRate = ConsumerValue.create(this.bus.getSubscriber<ClockEvents>().on('simRate'), 1);
  private previousTimeMs = 0;

  // eslint-disable-next-line jsdoc/require-jsdoc
  constructor(private bus: EventBus, fuelFLowSensors: UnsFuelFlowSensors) {
    fuelFLowSensors.sensors.forEach(sensor => {
      const topic = SensorsConfigBuilder.isLegacyFuelSystemFlowSensor(sensor) ?
        `fuel_flow_pph_${sensor.simEngineIndex}` as const :
        // FIXME Change topic to retrieve fuel line flow instead
        `fuel_flow_pph_${sensor.fuelLineIndex}` as const;

      this.fuelData.set(sensor.index, {
        burned: 0,
        flow: ConsumerValue.create(this.bus.getSubscriber<EngineEvents>().on(topic), 0),
      });
    });
  }

  /** @inheritDoc */
  public init(): void {
    this.bus.getSubscriber<UnsFuelComputerControlEvents>().on('fuel_totalizer_reset').handle(() => {
      this.fuelData.forEach(data => data.burned = 0);
      SimVar.SetSimVarValue(FuelComputerSimVars.TotalBurned, SimVarValueType.GAL, 0);
    });
  }

  /** @inheritDoc */
  public onUpdate(): void {
    this.publishFuelAtDeparture();

    const timeMs: number = this.simTimeMs.get();
    const maxDt = 1000 + (200 * this.simRate.get());
    if (0 < this.previousTimeMs && this.previousTimeMs < timeMs) {
      const deltaTimeHrs = MathUtils.clamp(timeMs - this.previousTimeMs, 0, maxDt) / (1000 * 60 * 60);
      const fuelBurnedDuringDeltaTimeMs = this.publishFuelTotalizer(deltaTimeHrs);
      const deltaTrueAirMilesFlown = this.publishEsad(deltaTimeHrs);
      this.publishFuelEconomy(deltaTimeHrs, fuelBurnedDuringDeltaTimeMs, deltaTrueAirMilesFlown);
    }
    this.previousTimeMs = timeMs;
  }

  /** Publish fuel at the time of departure. */
  private publishFuelAtDeparture(): void {
    const oldValue = this.fuelAtDeparture;

    if (!this.isOnGround.get() && this.fuelAtDeparture === null) {
      this.fuelAtDeparture = this.fuelOnBoard.get();
    } else if (this.isOnGround.get() && this.fuelAtDeparture !== null) {
      this.fuelAtDeparture = null;
    }

    if (oldValue !== this.fuelAtDeparture) {
      this.bus.getPublisher<UnsFuelComputerEvents>().pub('fuel_at_departure', this.fuelAtDeparture);
    }
  }

  /**
   * Publish fuel totalizer events.
   * @param deltaTimeHrs The time elapsed in hours since the last time the function was called.
   * @returns The total amount of fuel burned during the `deltaTimeMs` period.
   */
  private publishFuelTotalizer(deltaTimeHrs: number): number {
    let totalFuelBurnedLbs = 0;
    let totalFuelFlow = 0;
    let totalDeltaBurned = 0;

    this.fuelData.forEach(({ burned, flow }, index: UnsFuelFlowSensorIndex): void => {
      // Time difference in ms converted to hours, multiplied by the flow in pounds per hour, added to the amount already burned
      const deltaSensorBurned = flow.get() * deltaTimeHrs;
      const newTotalSensorBurnedLbs: number = burned + deltaSensorBurned;

      this.fuelData.set(index, { burned: newTotalSensorBurnedLbs, flow });

      this.bus.getPublisher<UnsFuelComputerEvents>().pub(
        `fuel_totalizer_burned_${index}`,
        newTotalSensorBurnedLbs,
        false,
        false,
      );

      totalFuelBurnedLbs += newTotalSensorBurnedLbs;
      totalFuelFlow += flow.get();
      totalDeltaBurned += deltaSensorBurned;
    });

    SimVar.SetSimVarValue(FuelComputerSimVars.TotalBurned, SimVarValueType.Pounds, totalFuelBurnedLbs);
    SimVar.SetSimVarValue(FuelComputerSimVars.TotalFlow, SimVarValueType.PPH, totalFuelFlow);

    return totalDeltaBurned;
  }

  /**
   * Publish equivalent still air distance.
   * @param deltaTimeHrs The time elapsed in hours since the last time the function was called.
   * @returns The number of true air miles flown during the `deltaTimeMs` period.
   */
  private publishEsad(deltaTimeHrs: number): number {
    const deltaTrueAirMiles = this.tas.get() * deltaTimeHrs;
    this.totalTrueAirMilesFlown += deltaTrueAirMiles;

    this.bus.getPublisher<UnsFuelComputerEvents>().pub(
      'true_air_miles_flown',
      this.totalTrueAirMilesFlown,
      false,
      false,
    );

    return deltaTrueAirMiles;
  }

  /**
   * Publish fuel economy events.
   * @param deltaTimeHrs The time elapsed in hours since the last time the function was called.
   * @param deltaFuelBurned The total amount of fuel burned during the `deltaTimeMs` period in pounds.
   * @param deltaTrueAirMiles The number of true air miles flown during the `deltaTimeMs` period.
   */
  private publishFuelEconomy(deltaTimeHrs: number, deltaFuelBurned: number, deltaTrueAirMiles: number): void {
    this.bus.getPublisher<UnsFuelComputerEvents>().pub(
      'fuel_economy_ground_speed',
      deltaFuelBurned === 0 ? 0 : this.groundSpeed.get() * deltaTimeHrs / deltaFuelBurned,
      false,
      false,
    );
    this.bus.getPublisher<UnsFuelComputerEvents>().pub(
      'fuel_economy_true_air_speed',
      deltaFuelBurned === 0 ? 0 : deltaTrueAirMiles / deltaFuelBurned,
      false,
      false,
    );
  }
}
