import {
  AdcEvents, ClockEvents, ConsumerSubject, ConsumerValue, EngineEvents, EventBus, ExpSmoother, LNavEvents, MappedSubject,
  SimVarValueType, Subject, Subscribable, SubscribableUtils, Subscription, UnitType
} from '@microsoft/msfs-sdk';

import { Fms, FmsPositionMode, FmsPositionSystemEvents, LNavDataEvents } from '@microsoft/msfs-garminsdk';

import { FuelTotalizerControlEvents, FuelTotalizerEvents, G3000FlightPlannerId, WeightFuelSimVars, WeightFuelUserSettings } from '@microsoft/msfs-wtg3000-common';

/**
 * A computer for weight and fuel calculations.
 */
export class WeightFuelComputer {
  private static readonly FUEL_BURN_SMOOTHING_TAU = 2000 / Math.LN2;

  private readonly weightFuelSettingManager = WeightFuelUserSettings.getManager(this.bus);

  private readonly basicEmptyWeightSetting = this.weightFuelSettingManager.getSetting('weightFuelBasicEmpty');
  private readonly crewAndStoresWeightSetting = this.weightFuelSettingManager.getSetting('weightFuelCrewStores');
  private readonly numberOfPassengersSetting = this.weightFuelSettingManager.getSetting('weightFuelNumberPax');
  private readonly avgPassengerWeightSetting = this.weightFuelSettingManager.getSetting('weightFuelAvgPax');
  private readonly cargoWeightSetting = this.weightFuelSettingManager.getSetting('weightFuelCargo');
  private readonly fuelOnBoardWeightSetting = this.weightFuelSettingManager.getSetting('weightFuelInitialFob');
  private readonly estHoldingTimeMinsSetting = this.weightFuelSettingManager.getSetting('weightFuelEstHoldingTime');

  private readonly fmsPosIndex: Subscribable<number>;

  private readonly fobHasBeenInitialized = this.fuelOnBoardWeightSetting.map(val => val >= 0);

  private readonly fuelTotalizerRemaining = ConsumerSubject.create(null, 0);
  private readonly fuelFlow = ConsumerValue.create(null, 0);

  private readonly isOnGround = ConsumerValue.create(null, false);
  private readonly lnavIsTracking = ConsumerValue.create(null, false);
  private readonly distanceToDestination = ConsumerValue.create(null, 0);

  private readonly fmsPosMode = ConsumerValue.create(null, FmsPositionMode.None);
  private readonly groundSpeed = ConsumerValue.create(null, 0);

  private readonly fuelBurnSmoother = new ExpSmoother(WeightFuelComputer.FUEL_BURN_SMOOTHING_TAU);
  private lastFuelBurnTime?: number;

  private readonly basicOperatingWeight: MappedSubject<[number, number], number> = MappedSubject.create(
    ([basicEmpty, crewAndStores]) => Math.max(basicEmpty, 0) + crewAndStores,
    this.basicEmptyWeightSetting,
    this.crewAndStoresWeightSetting,
  ).pause();

  private readonly totalPassengerWeight: MappedSubject<[number, number], number> = MappedSubject.create(
    ([quantity, weightEach]) => quantity * weightEach,
    this.numberOfPassengersSetting,
    this.avgPassengerWeightSetting,
  ).pause();

  private readonly zeroFuelWeight: MappedSubject<[number, number, number], number> = MappedSubject.create(
    ([basicOperating, totalPassenger, cargo]) => basicOperating + totalPassenger + cargo,
    this.basicOperatingWeight,
    this.totalPassengerWeight,
    this.cargoWeightSetting,
  ).pause();

  private readonly fuelOnBoardWeight: MappedSubject<[boolean, number], number> = MappedSubject.create(
    ([hasInitialized, currentTotalizer]) => hasInitialized ?
      Math.max(0, UnitType.GALLON_FUEL.convertTo(currentTotalizer, UnitType.POUND)) : NaN,
    SubscribableUtils.NUMERIC_NAN_EQUALITY,
    this.fobHasBeenInitialized,
    this.fuelTotalizerRemaining,
  ).pause();

  private readonly aircraftWeight: MappedSubject<[number, number], number> = MappedSubject.create(
    ([zeroFuel, fuelOnBoard]) => zeroFuel + fuelOnBoard,
    SubscribableUtils.NUMERIC_NAN_EQUALITY,
    this.zeroFuelWeight,
    this.fuelOnBoardWeight,
  ).pause();

  private readonly landingFuel = Subject.create(NaN, SubscribableUtils.NUMERIC_NAN_EQUALITY);
  private readonly holdingFuel = Subject.create(NaN, SubscribableUtils.NUMERIC_NAN_EQUALITY);

  private readonly landingWeight = MappedSubject.create(
    ([zeroFuel, landingFuel]) => Math.max(zeroFuel + landingFuel, 0),
    SubscribableUtils.NUMERIC_NAN_EQUALITY,
    this.zeroFuelWeight,
    this.landingFuel
  );

  private readonly calculatedWeights = [
    this.basicOperatingWeight,
    this.totalPassengerWeight,
    this.zeroFuelWeight,
    this.fuelOnBoardWeight,
    this.aircraftWeight
  ];

  private isAlive = true;
  private isInit = false;
  private isPaused = false;

  private readonly settingPipes: Subscription[] = [];
  private readonly publishSubs: Subscription[] = [];

  private updateSub?: Subscription;

  /**
   * Constructor.
   * @param bus The event bus.
   * @param fms The FMS.
   * @param fmsPosIndex The index of the FMS geo-positioning system that is the source of this computer's ground speed
   * data.
   */
  public constructor(
    private readonly bus: EventBus,
    private readonly fms: Fms<G3000FlightPlannerId>,
    fmsPosIndex: number | Subscribable<number>
  ) {
    this.fmsPosIndex = SubscribableUtils.toSubscribable(fmsPosIndex, true);
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

    this.calculatedWeights.forEach(weight => { weight.resume(); });

    this.settingPipes.push(
      this.basicOperatingWeight.pipe(this.weightFuelSettingManager.getSetting('weightFuelBasicOperating')),
      this.totalPassengerWeight.pipe(this.weightFuelSettingManager.getSetting('weightFuelTotalPassenger')),
      this.zeroFuelWeight.pipe(this.weightFuelSettingManager.getSetting('weightFuelZeroFuel'))
    );

    this.publishSubs.push(
      this.fuelOnBoardWeight.sub(weight => { SimVar.SetSimVarValue(WeightFuelSimVars.FobWeight, SimVarValueType.Pounds, isNaN(weight) ? -1 : weight); }, true),
      this.aircraftWeight.sub(weight => { SimVar.SetSimVarValue(WeightFuelSimVars.AircraftWeight, SimVarValueType.Pounds, isNaN(weight) ? -1 : weight); }, true),
      this.landingFuel.sub(weight => { SimVar.SetSimVarValue(WeightFuelSimVars.LandingFuel, SimVarValueType.Pounds, isNaN(weight) ? Number.MIN_SAFE_INTEGER - 1 : weight); }, true),
      this.landingWeight.sub(weight => { SimVar.SetSimVarValue(WeightFuelSimVars.LandingWeight, SimVarValueType.Pounds, isNaN(weight) ? -1 : weight); }, true),
      this.holdingFuel.sub(weight => { SimVar.SetSimVarValue(WeightFuelSimVars.HoldingFuel, SimVarValueType.Pounds, isNaN(weight) ? -1 : weight); }, true)
    );

    this.updateSub = sub.on('simTime').whenChanged().handle(this.update.bind(this));

    if (paused) {
      this.pause();
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

    this.calculatedWeights.forEach(weight => { weight.resume(); });
    this.settingPipes.forEach(pipe => { pipe.resume(true); });
    this.publishSubs.forEach(sub => { sub.resume(true); });

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

    this.calculatedWeights.forEach(weight => { weight.pause(); });
    this.settingPipes.forEach(pipe => { pipe.pause(); });
    this.publishSubs.forEach(sub => { sub.pause(); });

    this.updateSub?.pause();
  }

  /**
   * Resets the fuel on board setting value to uninitialized, the cargo weight setting value to zero, and the fuel
   * totalizer's fuel remaining value to zero.
   * @throws Error if this computer has been destroyed.
   */
  public reset(): void {
    if (!this.isAlive) {
      throw new Error('WeightFuelComputer: cannot reset a dead computer');
    }

    this.fuelOnBoardWeightSetting.value = -1;
    this.cargoWeightSetting.value = 0;
    this.bus.getPublisher<FuelTotalizerControlEvents>().pub('fuel_totalizer_set_remaining', 0, true, false);
  }

  /**
   * Updates this computer's estimated values based on fuel flow and ground speed.
   * @param simTime The current sim time as a UNIX timestamp in milliseconds.
   */
  private update(simTime: number): void {
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
      return;
    }

    const eteHours = distance / groundSpeed;
    const dt = this.lastFuelBurnTime === undefined ? 0 : simTime - this.lastFuelBurnTime;
    const fuelBurnGal = dt <= 0
      ? this.fuelBurnSmoother.reset(eteHours * fuelFlow)
      : this.fuelBurnSmoother.next(eteHours * fuelFlow, dt);

    const landingFuel = UnitType.GALLON_FUEL.convertTo(this.fuelTotalizerRemaining.get() - fuelBurnGal, UnitType.POUND);

    const holdingTimeHours = Math.max(this.estHoldingTimeMinsSetting.value / 60, 0);
    const holdingFuel = UnitType.GALLON_FUEL.convertTo(holdingTimeHours * fuelFlow, UnitType.POUND);

    this.landingFuel.set(landingFuel);
    this.holdingFuel.set(holdingFuel);

    this.lastFuelBurnTime = simTime;
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

    this.calculatedWeights.forEach(weight => { weight.destroy(); });
    this.settingPipes.forEach(pipe => { pipe.destroy(); });
    this.publishSubs.forEach(sub => { sub.destroy(); });

    this.updateSub?.destroy();
  }
}