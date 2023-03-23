import { AdcEvents, ClockEvents, ConsumerSubject, EngineEvents, EventBus, NavMath, Subject } from '@microsoft/msfs-sdk';

/**
 * An interface that describes the fuel temperate events..
 */
export interface FuelTempEvents {
  /** The left tank fuel temperatrue in C°. */
  fuel_temp_1: number;
  /** The right tank fuel temperatrue in C°. */
  fuel_temp_2: number;
}

/**
 * A system to simulate fuel temperatures.
 */
export class FuelTempSystemSimple {
  private readonly ramAirTemp = ConsumerSubject.create(this.bus.getSubscriber<AdcEvents>().on('ram_air_temp_c').whenChanged(), 0);
  private readonly leftEngineFuelFlow = ConsumerSubject.create(this.bus.getSubscriber<EngineEvents>().on('fuel_flow_1').whenChanged(), 0);
  private readonly rightEngineFuelFlow = ConsumerSubject.create(this.bus.getSubscriber<EngineEvents>().on('fuel_flow_2').whenChanged(), 0);

  private readonly leftTankTemp = Subject.create(NaN);
  private readonly rightTankTemp = Subject.create(NaN);

  private previousTimestamp = 0;

  /**
   * Ctor
   * @param bus The event bus.
   */
  constructor(private readonly bus: EventBus) {
    bus.getSubscriber<ClockEvents>().on('simTime').atFrequency(1 / 3).handle(this.update.bind(this));

    const publisher = bus.getPublisher<FuelTempEvents>();
    this.leftTankTemp.sub((v) => {
      publisher.pub('fuel_temp_1', v, false, true);
    });
    this.rightTankTemp.sub((v) => {
      publisher.pub('fuel_temp_2', v, false, true);
    });
  }

  /**
   * Updates the fuel temp values.
   * @param timestamp The current simtime timestamp.
   */
  private update(timestamp: number): void {
    this.setInitialTemperatures();

    if (this.previousTimestamp === -1) {
      this.previousTimestamp = timestamp;
    }

    let leftTankTargetTemp = this.ramAirTemp.get();
    let rightTankTargetTemp = this.ramAirTemp.get();

    if (this.leftEngineFuelFlow.get() > 10) {
      const leftLineTargetTemp = 28 + ((-40 - this.ramAirTemp.get()) * -0.1473);
      leftTankTargetTemp += (leftLineTargetTemp - leftTankTargetTemp) * 0.215;
    }

    if (this.rightEngineFuelFlow.get() > 10) {
      const rightLineTargetTemp = 28 + ((-40 - this.ramAirTemp.get()) * -0.1473);
      rightTankTargetTemp += (rightLineTargetTemp - rightTankTargetTemp) * 0.215;
    }

    const deltaTime = NavMath.clamp(timestamp - this.previousTimestamp, 0, 1000);
    const tankTc = 1 / 100;

    this.adjustTemp(leftTankTargetTemp, this.leftTankTemp, tankTc, deltaTime);
    this.adjustTemp(rightTankTargetTemp, this.rightTankTemp, tankTc, deltaTime);
    this.previousTimestamp = timestamp;

  }

  /**
   * Adjusts a temperature towards a target.
   * @param target The target temperature.
   * @param temp The temperature to adjust.
   * @param timeConstant The time constant to use when adjusting the temperature.
   * @param deltaTime The current update delta time.
   */
  private adjustTemp(target: number, temp: Subject<number>, timeConstant: number, deltaTime: number): void {
    const error = target - temp.get();
    const change = Math.sign(error) * (timeConstant / 1000) * deltaTime;
    if (Math.abs(change) >= Math.abs(error)) {
      temp.set(target);
    } else {
      temp.set(temp.get() + change);
    }
  }

  /**
   * Sets the initial temperatures if not already set.
   */
  private setInitialTemperatures(): void {
    if (isNaN(this.leftTankTemp.get())) {
      this.leftTankTemp.set(this.ramAirTemp.get());
    }

    if (isNaN(this.rightTankTemp.get())) {
      this.rightTankTemp.set(this.ramAirTemp.get());
    }
  }
}