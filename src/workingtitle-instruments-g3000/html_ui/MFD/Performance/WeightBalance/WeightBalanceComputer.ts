import { ClockEvents, ConsumerValue, EventBus, Subject, SubscribableUtils, Subscription } from '@microsoft/msfs-sdk';

import {
  G3000WeightBalanceEvents, WeightBalanceConfig, WeightBalanceLoadStationType, WeightBalanceUserSettingManager,
  WeightFuelEvents, WeightFuelUserSettings
} from '@microsoft/msfs-wtg3000-common';

/**
 * Events published by {@link WeightBalanceComputer}.
 */
type PublishedEvents = Pick<WeightFuelEvents, 'weightfuel_basic_operating_weight' | 'weightfuel_total_passenger_weight' | 'weightfuel_zero_fuel_weight'>
  & G3000WeightBalanceEvents;

/**
 * A computer for weight and balance calculations.
 */
export class WeightBalanceComputer {
  private readonly publisher = this.bus.getPublisher<PublishedEvents>();

  private readonly weightFuelSettingManager = WeightFuelUserSettings.getManager(this.bus);

  private readonly emptyMoment = this.config.aircraftEmptyWeight * this.config.aircraftEmptyArm;

  private readonly basicEmptyWeightSetting = this.weightFuelSettingManager.getSetting('weightFuelBasicEmpty');
  private readonly crewWeightSetting = this.weightFuelSettingManager.getSetting('weightFuelCrewStores');
  private readonly cargoWeightSetting = this.weightFuelSettingManager.getSetting('weightFuelCargo');

  private readonly basicOperatingWeight = Subject.create(0);
  private readonly totalPassengerWeight = Subject.create(0);
  private readonly zeroFuelWeight = Subject.create(0);

  private readonly basicEmptyArm = Subject.create(0);
  private readonly zeroFuelMoment = Subject.create(0);

  private readonly takeoffWeight = ConsumerValue.create<number | null>(null, null);
  private readonly fobWeight = ConsumerValue.create<number | null>(null, null);
  private readonly landingFuelWeight = ConsumerValue.create<number | null>(null, null);

  private readonly loadStationSettings = this.weightBalanceSettingManager.loadStationDefs.map(def => {
    return {
      def,
      emptyWeight: this.weightBalanceSettingManager.getSetting(`weightBalanceLoadStationEmptyWeight_${def.id}`),
      emptyArm: this.weightBalanceSettingManager.getSetting(`weightBalanceLoadStationEmptyArm_${def.id}`),
      loadArm: this.weightBalanceSettingManager.getSetting(`weightBalanceLoadStationLoadArm_${def.id}`),
      isEnabled: this.weightBalanceSettingManager.getSetting(`weightBalanceLoadStationEnabled_${def.id}`),
      loadWeight: this.weightBalanceSettingManager.getSetting(`weightBalanceLoadStationLoadWeight_${def.id}`)
    };
  });

  private readonly takeoffArm = Subject.create(NaN, SubscribableUtils.NUMERIC_NAN_EQUALITY);
  private readonly aircraftArm = Subject.create(NaN, SubscribableUtils.NUMERIC_NAN_EQUALITY);
  private readonly landingArm = Subject.create(NaN, SubscribableUtils.NUMERIC_NAN_EQUALITY);

  private isAlive = true;
  private isInit = false;
  private isResumed = false;

  private updateStaticSub?: Subscription;
  private updateDynamicSub?: Subscription;

  /**
   * Creates a new instance of WeightBalanceComputer.
   * @param bus The event bus.
   * @param config A weight and balance configuration object.
   * @param weightBalanceSettingManager A manager for weight and balance user settings.
   */
  public constructor(
    private readonly bus: EventBus,
    private readonly config: WeightBalanceConfig,
    private readonly weightBalanceSettingManager: WeightBalanceUserSettingManager
  ) {
    // Initialize published topics.
    this.basicOperatingWeight.sub(this.publishTopic.bind(this, 'weightfuel_basic_operating_weight'), true);
    this.totalPassengerWeight.sub(this.publishTopic.bind(this, 'weightfuel_total_passenger_weight'), true);
    this.zeroFuelWeight.sub(this.publishTopic.bind(this, 'weightfuel_zero_fuel_weight'), true);
    this.basicEmptyArm.sub(this.publishTopic.bind(this, 'weightbalance_basic_empty_arm'), true);
    this.zeroFuelMoment.sub(this.publishTopic.bind(this, 'weightbalance_zero_fuel_moment'), true);
    this.takeoffArm.sub(this.publishNullableTopic.bind(this, 'weightbalance_takeoff_arm'), true);
    this.aircraftArm.sub(this.publishNullableTopic.bind(this, 'weightbalance_aircraft_arm'), true);
    this.landingArm.sub(this.publishNullableTopic.bind(this, 'weightbalance_landing_arm'), true);
  }

  /**
   * Publishes a topic to the event bus.
   * @param topic The topic to publish.
   * @param data The data to publish to the topic.
   */
  private publishTopic<T extends keyof {
    [P in keyof PublishedEvents as PublishedEvents[P] extends number ? P : never]: PublishedEvents[P]
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
    [P in keyof PublishedEvents as PublishedEvents[P] extends number ? never : P]: PublishedEvents[P]
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
      throw new Error('WeightBalanceComputer: cannot initialize a dead computer');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    const sub = this.bus.getSubscriber<ClockEvents & WeightFuelEvents>();

    this.takeoffWeight.setConsumer(sub.on('weightfuel_takeoff_weight'));
    this.fobWeight.setConsumer(sub.on('weightfuel_fob_weight'));
    this.landingFuelWeight.setConsumer(sub.on('weightfuel_landing_fuel'));

    this.updateStaticSub = sub.on('realTime').atFrequency(1).handle(this.updateStatic.bind(this), true);
    this.updateDynamicSub = sub.on('realTime').handle(this.updateDynamic.bind(this), true);

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
      throw new Error('WeightBalanceComputer: cannot resume a dead computer');
    }

    if (!this.isInit || this.isResumed) {
      return;
    }

    this.isResumed = true;

    this.updateStaticSub!.resume(true);
    this.updateDynamicSub!.resume(true);
  }

  /**
   * Pauses this computer. Once paused, this computer will not perform any calculations or updates until it is resumed.
   * @throws Error if this computer has been destroyed.
   */
  public pause(): void {
    if (!this.isAlive) {
      throw new Error('WeightBalanceComputer: cannot pause a dead computer');
    }

    if (!this.isInit || !this.isResumed) {
      return;
    }

    this.isResumed = false;

    this.updateStaticSub!.pause();
    this.updateDynamicSub!.pause();
  }

  /**
   * Resets all load station load weights to zero.
   * @throws Error if this computer has been destroyed.
   */
  public reset(): void {
    if (!this.isAlive) {
      throw new Error('WeightBalanceComputer: cannot reset a dead computer');
    }

    for (let i = 0; i < this.loadStationSettings.length; i++) {
      const settings = this.loadStationSettings[i];
      settings.loadWeight.resetToDefault();
    }
  }

  /**
   * Updates weight and balance data that only depend on user-selected values.
   */
  private updateStatic(): void {
    let loadStationsEmptyWeight = 0;
    let operatingLoadWeight = 0;
    let passengerLoadWeight = 0;
    let cargoLoadWeight = 0;

    let emptyLoadMoment = 0;
    let loadMoment = 0;

    for (let i = 0; i < this.loadStationSettings.length; i++) {
      const settings = this.loadStationSettings[i];

      if (settings.isEnabled.value) {
        const emptyWeight = settings.emptyWeight.value;
        const loadWeight = settings.loadWeight.value;

        loadStationsEmptyWeight += emptyWeight;

        switch (settings.def.type) {
          case WeightBalanceLoadStationType.Passenger:
            passengerLoadWeight += loadWeight;
            break;
          case WeightBalanceLoadStationType.Cargo:
            cargoLoadWeight += loadWeight;
            break;
          default:
            operatingLoadWeight += loadWeight;
        }

        emptyLoadMoment += emptyWeight * settings.emptyArm.value;
        loadMoment += loadWeight * settings.loadArm.value;
      }
    }

    const basicEmptyWeight = this.config.aircraftEmptyWeight + loadStationsEmptyWeight;
    this.basicEmptyWeightSetting.value = basicEmptyWeight;

    this.crewWeightSetting.value = operatingLoadWeight;
    this.totalPassengerWeight.set(passengerLoadWeight);
    this.cargoWeightSetting.value = cargoLoadWeight;

    const basicOperatingWeight = basicEmptyWeight + operatingLoadWeight;
    this.basicOperatingWeight.set(basicOperatingWeight);

    const zeroFuelWeight = basicOperatingWeight + passengerLoadWeight + cargoLoadWeight;
    this.zeroFuelWeight.set(zeroFuelWeight);

    const basicEmptyMoment = this.emptyMoment + emptyLoadMoment;

    this.basicEmptyArm.set(basicEmptyMoment / basicEmptyWeight);
    this.zeroFuelMoment.set(basicEmptyMoment + loadMoment);
  }

  /**
   * Updates weight and balance data that depend on dynamically computed values.
   */
  private updateDynamic(): void {
    const zeroFuelWeight = this.zeroFuelWeight.get();
    const zeroFuelMoment = this.zeroFuelMoment.get();
    const takeoffWeight = this.takeoffWeight.get();

    if (takeoffWeight === null) {
      this.takeoffArm.set(NaN);
    } else {
      this.takeoffArm.set((zeroFuelMoment + Math.max(takeoffWeight - zeroFuelWeight, 0) * this.config.fuelStationDef.arm) / takeoffWeight);
    }

    const fobWeight = this.fobWeight.get();
    if (fobWeight === null) {
      this.aircraftArm.set(NaN);
    } else {
      const weight = zeroFuelWeight + fobWeight;
      this.aircraftArm.set((zeroFuelMoment + fobWeight * this.config.fuelStationDef.arm) / weight);
    }

    const landingFuelWeight = this.landingFuelWeight.get();
    if (landingFuelWeight === null) {
      this.landingArm.set(NaN);
    } else {
      const weight = zeroFuelWeight + landingFuelWeight;
      this.landingArm.set((zeroFuelMoment + landingFuelWeight * this.config.fuelStationDef.arm) / weight);
    }
  }

  /**
   * Destroys this computer. Once destroyed, this computer will no longer perform any calculations or updates, and
   * cannot be paused or resumed.
   */
  public destroy(): void {
    this.isAlive = false;

    this.takeoffWeight.destroy();
    this.fobWeight.destroy();
    this.landingFuelWeight.destroy();

    this.updateStaticSub?.destroy();
    this.updateDynamicSub?.destroy();
  }
}
