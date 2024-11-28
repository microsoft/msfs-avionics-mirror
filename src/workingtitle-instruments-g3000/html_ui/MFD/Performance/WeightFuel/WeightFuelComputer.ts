import {
  AdcEvents, ClockEvents, ConsumerSubject, ConsumerValue, EngineEvents, EventBus, ExpSmoother, LNavEvents,
  MappedSubject, Subject, Subscribable, SubscribableUtils, Subscription, UnitType
} from '@microsoft/msfs-sdk';

import { Fms, FmsPositionMode, FmsPositionSystemEvents, LNavDataEvents } from '@microsoft/msfs-garminsdk';

import {
  FuelTotalizerControlEvents, FuelTotalizerEvents, G3000FlightPlannerId, WeightFuelEvents, WeightFuelUserSettings
} from '@microsoft/msfs-wtg3000-common';

/**
 * A computer for weight and fuel calculations.
 */
export class WeightFuelComputer {
  private static readonly FUEL_BURN_SMOOTHING_TAU = 2000 / Math.LN2;

  private readonly publisher = this.bus.getPublisher<WeightFuelEvents>();

  private readonly weightFuelSettingManager = WeightFuelUserSettings.getManager(this.bus);

  private readonly basicEmptyWeightSetting = this.weightFuelSettingManager.getSetting('weightFuelBasicEmpty');
  private readonly crewAndStoresWeightSetting = this.weightFuelSettingManager.getSetting('weightFuelCrewStores');
  private readonly numberOfPassengersSetting = this.weightFuelSettingManager.getSetting('weightFuelNumberPax');
  private readonly avgPassengerWeightSetting = this.weightFuelSettingManager.getSetting('weightFuelAvgPax');
  private readonly cargoWeightSetting = this.weightFuelSettingManager.getSetting('weightFuelCargo');
  private readonly initialFobWeightSetting = this.weightFuelSettingManager.getSetting('weightFuelInitialFob');
  private readonly taxiFuelWeightSetting = this.weightFuelSettingManager.getSetting('weightFuelTaxi');
  private readonly reserveFuelSetting = this.weightFuelSettingManager.getSetting('weightFuelReserves');
  private readonly estHoldingTimeMinsSetting = this.weightFuelSettingManager.getSetting('weightFuelEstHoldingTime');

  private readonly fmsPosIndex: Subscribable<number>;

  private readonly fobHasBeenInitialized = this.initialFobWeightSetting.map(val => val >= 0);

  private readonly fuelTotalizerRemaining = ConsumerSubject.create(null, 0).pause();
  private readonly fuelFlow = ConsumerValue.create(null, 0).pause();

  private readonly isOnGround = ConsumerValue.create(null, false).pause();
  private readonly lnavIsTracking = ConsumerValue.create(null, false).pause();
  private readonly distanceToDestination = ConsumerValue.create(null, 0).pause();

  private readonly fmsPosMode = ConsumerValue.create(null, FmsPositionMode.None).pause();
  private readonly groundSpeed = ConsumerValue.create(null, 0).pause();

  private readonly fuelBurnSmoother = new ExpSmoother(WeightFuelComputer.FUEL_BURN_SMOOTHING_TAU);
  private lastFuelBurnTime?: number;

  private readonly basicOperatingWeight = this.calculateLoadWeights
    ? MappedSubject.create(
      ([basicEmpty, crewAndStores]) => Math.max(basicEmpty, 0) + crewAndStores,
      this.basicEmptyWeightSetting,
      this.crewAndStoresWeightSetting,
    ).pause()
    : ConsumerSubject.create(this.bus.getSubscriber<WeightFuelEvents>().on('weightfuel_basic_operating_weight'), 0).pause();

  private readonly totalPassengerWeight = this.calculateLoadWeights
    ? MappedSubject.create(
      ([quantity, weightEach]) => quantity * weightEach,
      this.numberOfPassengersSetting,
      this.avgPassengerWeightSetting,
    ).pause()
    : ConsumerSubject.create(this.bus.getSubscriber<WeightFuelEvents>().on('weightfuel_total_passenger_weight'), 0).pause();

  private readonly zeroFuelWeight = this.calculateLoadWeights
    ? MappedSubject.create(
      ([basicOperating, totalPassenger, cargo]) => basicOperating + totalPassenger + cargo,
      this.basicOperatingWeight,
      this.totalPassengerWeight,
      this.cargoWeightSetting,
    ).pause()
    : ConsumerSubject.create(this.bus.getSubscriber<WeightFuelEvents>().on('weightfuel_zero_fuel_weight'), 0).pause();

  private readonly rampWeight = MappedSubject.create(
    ([zeroFuel, initialFob]) => initialFob < 0 ? NaN : zeroFuel + initialFob,
    SubscribableUtils.NUMERIC_NAN_EQUALITY,
    this.zeroFuelWeight,
    this.initialFobWeightSetting
  ).pause();

  private readonly takeoffWeight = MappedSubject.create(
    ([zeroFuelWeight, rampWeight, taxiFuel]) => Math.max(rampWeight - taxiFuel, zeroFuelWeight),
    SubscribableUtils.NUMERIC_NAN_EQUALITY,
    this.zeroFuelWeight,
    this.rampWeight,
    this.taxiFuelWeightSetting
  ).pause();

  private readonly fuelOnBoardWeight = MappedSubject.create(
    ([hasInitialized, currentTotalizer]) => hasInitialized ?
      Math.max(0, UnitType.GALLON_FUEL.convertTo(currentTotalizer, UnitType.POUND)) : NaN,
    SubscribableUtils.NUMERIC_NAN_EQUALITY,
    this.fobHasBeenInitialized,
    this.fuelTotalizerRemaining,
  ).pause();

  private readonly aircraftWeight = MappedSubject.create(
    ([zeroFuel, fuelOnBoard]) => zeroFuel + fuelOnBoard,
    SubscribableUtils.NUMERIC_NAN_EQUALITY,
    this.zeroFuelWeight,
    this.fuelOnBoardWeight,
  ).pause();

  private readonly landingFuel = Subject.create(NaN, SubscribableUtils.NUMERIC_NAN_EQUALITY);
  private readonly holdingFuel = Subject.create(NaN, SubscribableUtils.NUMERIC_NAN_EQUALITY);
  private readonly excessFuel = Subject.create(NaN, SubscribableUtils.NUMERIC_NAN_EQUALITY);

  private readonly landingWeight = MappedSubject.create(
    ([zeroFuel, landingFuel]) => Math.max(zeroFuel + landingFuel, 0),
    SubscribableUtils.NUMERIC_NAN_EQUALITY,
    this.zeroFuelWeight,
    this.landingFuel
  );

  private readonly calculatedWeights: Subscription[] = [
    this.basicOperatingWeight,
    this.totalPassengerWeight,
    this.zeroFuelWeight,
    this.rampWeight,
    this.takeoffWeight,
    this.fuelOnBoardWeight,
    this.aircraftWeight
  ];

  private isAlive = true;
  private isInit = false;
  private isPaused = true;

  private updateSub?: Subscription;

  /**
   * Creates a new instance of WeightFuelComputer.
   * @param bus The event bus.
   * @param fms The FMS.
   * @param fmsPosIndex The index of the FMS geo-positioning system that is the source of this computer's ground speed
   * data.
   * @param calculateLoadWeights Whether this computer calculates loading weights (basic operating weight, total
   * passenger weight, and zero fuel weight).
   */
  public constructor(
    private readonly bus: EventBus,
    private readonly fms: Fms<G3000FlightPlannerId>,
    fmsPosIndex: number | Subscribable<number>,
    private readonly calculateLoadWeights: boolean
  ) {
    this.fmsPosIndex = SubscribableUtils.toSubscribable(fmsPosIndex, true);

    // Initialize published topics.
    if (this.calculateLoadWeights) {
      this.publisher.pub('weightfuel_basic_operating_weight', 0, true, true);
      this.publisher.pub('weightfuel_total_passenger_weight', 0, true, true);
      this.publisher.pub('weightfuel_zero_fuel_weight', 0, true, true);
    }
    this.publisher.pub('weightfuel_ramp_weight', null, true, true);
    this.publisher.pub('weightfuel_takeoff_weight', null, true, true);
    this.publisher.pub('weightfuel_fob_weight', null, true, true);
    this.publisher.pub('weightfuel_aircraft_weight', null, true, true);
    this.publisher.pub('weightfuel_landing_fuel', null, true, true);
    this.publisher.pub('weightfuel_landing_weight', null, true, true);
    this.publisher.pub('weightfuel_holding_fuel', null, true, true);
    this.publisher.pub('weightfuel_excess_fuel', null, true, true);
  }

  /**
   * Publishes a topic to the event bus.
   * @param topic The topic to publish.
   * @param data The data to publish to the topic.
   */
  private publishTopic<T extends keyof {
    [P in keyof WeightFuelEvents as WeightFuelEvents[P] extends number ? P : never]: WeightFuelEvents[P]
  }>(topic: T, data: number): void {
    this.publisher.pub(topic, data, true, true);
  }

  /**
   * Publishes a nullable topic to the event bus.
   * @param topic The topic to publish.
   * @param data The data to publish to the topic. If the data is equal to `NaN`, then `null` will be published
   * instead.
   */
  private publishNullableTopic<T extends keyof {
    [P in keyof WeightFuelEvents as WeightFuelEvents[P] extends number ? never : P]: WeightFuelEvents[P]
  }>(topic: T, data: number): void {
    this.publisher.pub(topic, isNaN(data) ? null : data, true, true);
  }

  /**
   * Initializes this computer.
   * @param paused Whether to initialize this computer as paused. Defaults to `false`.
   * @throws Error if this computer has been destroyed.
   */
  public init(paused = false): void {
    if (!this.isAlive) {
      throw new Error('WeightFuelComputer: cannot initialize a dead computer');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    const sub = this.bus.getSubscriber<ClockEvents & EngineEvents & FuelTotalizerEvents & AdcEvents & LNavEvents & LNavDataEvents & FmsPositionSystemEvents>();

    this.fuelTotalizerRemaining.setConsumer(sub.on('fuel_totalizer_remaining'));
    this.fuelFlow.setConsumer(sub.on('fuel_flow_total'));

    this.lnavIsTracking.setConsumer(sub.on('lnav_is_tracking'));
    this.distanceToDestination.setConsumer(sub.on('lnavdata_destination_distance'));

    this.isOnGround.setConsumer(sub.on('on_ground'));

    this.fmsPosIndex.sub(index => {
      this.fmsPosMode.setConsumer(sub.on(`fms_pos_mode_${index}`));
      this.groundSpeed.setConsumer(sub.on(`fms_pos_ground_speed_${index}`));
    }, true);

    if (this.calculateLoadWeights) {
      this.basicOperatingWeight.sub(this.publishTopic.bind(this, 'weightfuel_basic_operating_weight'), true);
      this.totalPassengerWeight.sub(this.publishTopic.bind(this, 'weightfuel_total_passenger_weight'), true);
      this.zeroFuelWeight.sub(this.publishTopic.bind(this, 'weightfuel_zero_fuel_weight'), true);
    }

    this.rampWeight.sub(this.publishNullableTopic.bind(this, 'weightfuel_ramp_weight'), true);
    this.takeoffWeight.sub(this.publishNullableTopic.bind(this, 'weightfuel_takeoff_weight'), true);
    this.fuelOnBoardWeight.sub(this.publishNullableTopic.bind(this, 'weightfuel_fob_weight'), true);
    this.aircraftWeight.sub(this.publishNullableTopic.bind(this, 'weightfuel_aircraft_weight'), true);
    this.landingFuel.sub(this.publishNullableTopic.bind(this, 'weightfuel_landing_fuel'), true);
    this.landingWeight.sub(this.publishNullableTopic.bind(this, 'weightfuel_landing_weight'), true);
    this.holdingFuel.sub(this.publishNullableTopic.bind(this, 'weightfuel_holding_fuel'), true);
    this.excessFuel.sub(this.publishNullableTopic.bind(this, 'weightfuel_excess_fuel'), true);

    this.updateSub = sub.on('activeSimDuration').handle(this.update.bind(this), true);

    if (!paused) {
      this.resume();
    }
  }

  /**
   * Resumes this computer. Once resumed, this computer will perform calculations and updates as necessary until it is
   * paused or destroyed.
   * @throws Error if this computer has been destroyed.
   */
  public resume(): void {
    if (!this.isAlive) {
      throw new Error('WeightFuelComputer: cannot resume a dead computer');
    }

    if (!this.isInit || !this.isPaused) {
      return;
    }

    this.fobHasBeenInitialized.resume();

    this.fuelTotalizerRemaining.resume();
    this.fuelFlow.resume();

    this.isOnGround.resume();
    this.lnavIsTracking.resume();
    this.distanceToDestination.resume();
    this.fmsPosMode.resume();
    this.groundSpeed.resume();

    for (const weight of this.calculatedWeights) {
      weight.resume(true);
    }

    this.updateSub?.resume(true);
  }

  /**
   * Pauses this computer. Once paused, this computer will not perform any calculations or updates until it is resumed.
   * @throws Error if this computer has been destroyed.
   */
  public pause(): void {
    if (!this.isAlive) {
      throw new Error('WeightFuelComputer: cannot pause a dead computer');
    }

    if (!this.isInit || this.isPaused) {
      return;
    }

    this.fobHasBeenInitialized.pause();

    this.fuelTotalizerRemaining.pause();
    this.fuelFlow.pause();

    this.isOnGround.pause();
    this.lnavIsTracking.pause();
    this.distanceToDestination.pause();
    this.fmsPosMode.pause();
    this.groundSpeed.pause();

    for (const weight of this.calculatedWeights) {
      weight.pause();
    }

    this.updateSub?.pause();
  }

  /**
   * Resets the fuel on board setting value to uninitialized and the fuel totalizer's fuel remaining value to zero.
   * Additionally, if this computer is configured to calculate load weights, also resets the cargo weight setting value
   * to zero.
   * @throws Error if this computer has been destroyed.
   */
  public reset(): void {
    if (!this.isAlive) {
      throw new Error('WeightFuelComputer: cannot reset a dead computer');
    }

    this.initialFobWeightSetting.value = -1;
    this.bus.getPublisher<FuelTotalizerControlEvents>().pub('fuel_totalizer_set_remaining', 0, true, false);

    if (this.calculateLoadWeights) {
      this.cargoWeightSetting.value = 0;
    }
  }

  /**
   * Updates this computer's estimated values based on fuel flow and ground speed.
   * @param activeSimDuration The total amount of simulated time, in milliseconds, that has elapsed since the beginning
   * of the current simulation session.
   */
  private update(activeSimDuration: number): void {
    const fuelFlow = this.fuelFlow.get();
    const groundSpeed = this.groundSpeed.get();
    const distance = this.distanceToDestination.get();

    if (
      fuelFlow === 0
      || groundSpeed < 30
      || distance < 0
      || this.isOnGround.get()
      || !this.lnavIsTracking.get()
      || this.fmsPosMode.get() === FmsPositionMode.None
      || !this.fms.hasPrimaryFlightPlan()
      || this.fms.getPrimaryFlightPlan().destinationAirport === undefined
    ) {
      this.landingFuel.set(NaN);
      this.holdingFuel.set(NaN);
      this.excessFuel.set(NaN);
      return;
    }

    const eteHours = distance / groundSpeed;
    const dt = this.lastFuelBurnTime === undefined ? 0 : activeSimDuration - this.lastFuelBurnTime;
    const fuelBurnGal = dt <= 0
      ? this.fuelBurnSmoother.reset(eteHours * fuelFlow)
      : this.fuelBurnSmoother.next(eteHours * fuelFlow, dt);

    const landingFuel = UnitType.GALLON_FUEL.convertTo(this.fuelTotalizerRemaining.get() - fuelBurnGal, UnitType.POUND);

    const holdingTimeHours = Math.max(this.estHoldingTimeMinsSetting.value / 60, 0);
    const holdingFuel = UnitType.GALLON_FUEL.convertTo(holdingTimeHours * fuelFlow, UnitType.POUND);

    this.landingFuel.set(landingFuel);
    this.holdingFuel.set(holdingFuel);
    this.excessFuel.set(landingFuel - holdingFuel - this.reserveFuelSetting.value);

    this.lastFuelBurnTime = activeSimDuration;
  }

  /**
   * Destroys this computer. Once destroyed, this computer will no longer perform any calculations or updates, and
   * cannot be paused or resumed.
   */
  public destroy(): void {
    this.isAlive = false;

    this.fobHasBeenInitialized.destroy();

    this.fuelTotalizerRemaining.destroy();
    this.fuelTotalizerRemaining.destroy();
    this.fuelFlow.destroy();

    this.isOnGround.destroy();
    this.lnavIsTracking.destroy();
    this.distanceToDestination.destroy();
    this.fmsPosMode.destroy();
    this.groundSpeed.destroy();

    for (const weight of this.calculatedWeights) {
      weight.destroy();
    }

    this.updateSub?.destroy();
  }
}
