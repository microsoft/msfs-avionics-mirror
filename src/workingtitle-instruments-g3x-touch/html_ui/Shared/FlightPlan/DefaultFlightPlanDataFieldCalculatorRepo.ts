import {
  Accessible, AdcEvents, BasicNavAngleUnit, ClockEvents, ConsumerSubject, ConsumerValue, EngineEvents, EventBus,
  GNSSEvents, LNavEvents, LNavUtils, MappedSubject, MappedValue, Subscribable, SubscribableUtils, Subscription,
  UnitType, Value
} from '@microsoft/msfs-sdk';

import { FmsPositionMode, FmsPositionSystemEvents, FmsUtils, LNavDataEvents } from '@microsoft/msfs-garminsdk';

import { FuelTotalizerEvents } from '../Fuel/FuelTotalizerEvents';
import { FlightPlanDataField, FlightPlanDataFieldType } from './FlightPlanDataField';
import { FlightPlanDataFieldCalculator } from './FlightPlanDataFieldCalculator';
import { FlightPlanDataFieldCalculatorRepo } from './FlightPlanDataFieldCalculatorRepo';
import { FlightPlanDataItem, FlightPlanDataItemType, FlightPlanLegDataItemActiveStatus } from './FlightPlanDataItem';

/**
 * Configuration options for {@link DefaultFlightPlanDataFieldCalculatorRepo}.
 */
export type DefaultFlightPlanDataFieldCalculatorRepoOptions = {
  /** Whether sensed fuel flow can be used by the repository's calculators. Defaults to `false`. */
  supportSensedFuelFlow?: boolean;

  /** The type of fuel-on-board data used by the repository's calculators. Defaults to `'none'`. */
  fuelOnBoardType?: 'sensed' | 'totalizer' | 'none';
};

/**
 * An implementation of `FlightPlanDataFieldCalculatorRepo` that retrieves a flight plan data field calculators with
 * default behavior.
 */
export class DefaultFlightPlanDataFieldCalculatorRepo implements FlightPlanDataFieldCalculatorRepo {
  private readonly calculators = new Map<FlightPlanDataFieldType, FlightPlanDataFieldCalculator>();

  private readonly fmsPosIndex: Subscribable<number>;

  private readonly simTime = ConsumerValue.create(null, 0);
  private readonly isOnGround = ConsumerSubject.create(null, false);
  private readonly magVar = ConsumerValue.create(null, 0);

  private readonly fmsPosMode = ConsumerSubject.create(null, FmsPositionMode.None);
  private readonly groundSpeed = ConsumerValue.create(null, 0);

  private readonly fuelFlow = ConsumerSubject.create(null, NaN);
  private readonly fuelOnBoard = ConsumerValue.create(null, NaN);

  private readonly _isUsingPlanSpeed = MappedSubject.create(
    ([isOnGround, fmsPosMode]) => {
      return isOnGround || fmsPosMode === FmsPositionMode.None;
    },
    this.isOnGround,
    this.fmsPosMode
  );
  /** Whether this repository's calculators are currently using fallback flight plan ground speed for calculations. */
  public readonly isUsingPlanSpeed = this._isUsingPlanSpeed as Subscribable<boolean>;

  private readonly nominalGroundSpeed = MappedValue.create(
    ([isUsingPlanSpeed, groundSpeed, planSpeed]) => {
      const nominalGs = isUsingPlanSpeed ? planSpeed : groundSpeed;
      return nominalGs <= 0 ? NaN : nominalGs;
    },
    this._isUsingPlanSpeed,
    this.groundSpeed,
    this.planSpeed
  );

  private readonly _isUsingPlanFuelFlow = MappedSubject.create(
    ([isOnGround, fuelFlow]) => {
      return isOnGround || isNaN(fuelFlow);
    },
    this.isOnGround,
    this.fuelFlow,
  );
  /** Whether this repository's calculators are currently using fallback flight plan fuel flow for calculations. */
  public readonly isUsingPlanFuelFlow = this._isUsingPlanFuelFlow as Subscribable<boolean>;

  private readonly nominalFuelFlow = MappedValue.create(
    ([isUsingPlanFuelFlow, fuelFlow, planFuelFlow]) => {
      const nominalFuelFlow = isUsingPlanFuelFlow ? planFuelFlow : fuelFlow;
      return nominalFuelFlow < 0 ? NaN : nominalFuelFlow;
    },
    this._isUsingPlanFuelFlow,
    this.fuelFlow,
    this.planFuelFlow
  );

  private lnavIndex = -1;
  private readonly isLNavIndexValid = Value.create(false);
  private readonly isLNavTracking = ConsumerValue.create(null, false);
  private readonly isLNavDataValid = MappedValue.create(
    ([isLNavIndexValid, isLNavTracking]) => isLNavIndexValid && isLNavTracking,
    this.isLNavIndexValid,
    this.isLNavTracking
  );

  private readonly lnavWptDistance = ConsumerValue.create(null, 0);
  private readonly lnavDtk = ConsumerValue.create(null, 0);

  private isAlive = true;

  private readonly subscriptions: Subscription[] = [
    this.simTime,
    this.isOnGround,
    this.magVar,
    this.fmsPosMode,
    this.groundSpeed,
    this.fuelFlow,
    this.fuelOnBoard,
    this.isLNavTracking,
    this.lnavWptDistance,
    this.lnavDtk
  ];

  /**
   * Creates a new instance of DefaultFlightPlanDataFieldCalculatorRepo.
   * @param bus The event bus.
   * @param fmsPosIndex The index of the FMS geo-positioning system from which the repository's calculators will
   * source data.
   * @param planSpeed The fallback flight plan ground speed, in knots, used by this repository's calculators when the
   * airplane's sensed ground speed cannot be used.
   * @param planFuelFlow The fallback flight plan fuel flow, in gallons per hour, used by this repository's calculators
   * when the airplane's sensed fuel flow cannot be used.
   * @param options Options with which to configure the repository.
   */
  public constructor(
    private readonly bus: EventBus,
    fmsPosIndex: number | Subscribable<number>,
    private readonly planSpeed: Subscribable<number>,
    private readonly planFuelFlow: Subscribable<number>,
    options?: Readonly<DefaultFlightPlanDataFieldCalculatorRepoOptions>
  ) {
    this.fmsPosIndex = SubscribableUtils.toSubscribable(fmsPosIndex, true);

    const sub = bus.getSubscriber<ClockEvents & AdcEvents & GNSSEvents & EngineEvents & FuelTotalizerEvents & FmsPositionSystemEvents>();

    this.simTime.setConsumer(sub.on('simTime'));
    this.isOnGround.setConsumer(sub.on('on_ground'));
    this.magVar.setConsumer(sub.on('magvar'));

    if (options?.supportSensedFuelFlow) {
      this.fuelFlow.setConsumer(sub.on('fuel_flow_total'));
    }
    switch (options?.fuelOnBoardType) {
      case 'sensed':
        this.fuelOnBoard.setConsumer(sub.on('fuel_usable_total'));
        break;
      case 'totalizer':
        this.fuelOnBoard.setConsumer(sub.on('fuel_totalizer_remaining'));
        break;
    }

    this.subscriptions.push(
      this.fmsPosIndex.sub(index => {
        this.fmsPosMode.setConsumer(sub.on(`fms_pos_mode_${index}`));
        this.groundSpeed.setConsumer(sub.on(`fms_pos_ground_speed_${index}`));
      }, true)
    );
  }

  /**
   * Sets the index of the LNAV from which this repository's calculators source data.
   * @param index The index of the LNAV to set.
   * @throws Error if this reposity has been destroyed.
   */
  public setLNavIndex(index: number): void {
    if (!this.isAlive) {
      throw new Error('DefaultFlightPlanDataFieldCalculatorRepo: cannot manipulate repository after it has been destroyed');
    }

    if (index === this.lnavIndex) {
      return;
    }

    if (LNavUtils.isValidLNavIndex(index)) {
      const sub = this.bus.getSubscriber<LNavEvents & LNavDataEvents>();
      const suffix = LNavUtils.getEventBusTopicSuffix(index);
      this.isLNavTracking.setConsumer(sub.on(`lnav_is_tracking${suffix}`));
      this.lnavWptDistance.setConsumer(sub.on(`lnavdata_waypoint_distance${suffix}`));
      this.lnavDtk.setConsumer(sub.on(`lnavdata_dtk_true${suffix}`));

      this.isLNavIndexValid.set(true);
    } else {
      this.isLNavTracking.setConsumer(null);
      this.lnavWptDistance.setConsumer(null);
      this.lnavDtk.setConsumer(null);

      this.isLNavIndexValid.set(false);
    }
  }

  /** @inheritDoc */
  public get(type: FlightPlanDataFieldType): FlightPlanDataFieldCalculator {
    if (!this.isAlive) {
      throw new Error('DefaultFlightPlanDataFieldCalculatorRepo: cannot retrieve calculator after repository has been destroyed');
    }

    let calc = this.calculators.get(type);
    if (!calc) {
      calc = this.createCalculator(type);
      this.calculators.set(type, calc);
    }
    return calc;
  }

  /** @inheritDoc */
  private createCalculator(type: FlightPlanDataFieldType): FlightPlanDataFieldCalculator {
    switch (type) {
      case FlightPlanDataFieldType.CumulativeDistance:
        return new FlightPlanDistanceCalculator(true, this.isLNavDataValid, this.lnavWptDistance);
      case FlightPlanDataFieldType.CumulativeEte:
        return new FlightPlanEteCalculator(true, this.isLNavDataValid, this.lnavWptDistance, this.nominalGroundSpeed);
      case FlightPlanDataFieldType.CumulativeFuel:
        return new FlightPlanFuelBurnCalculator(true, this.isLNavDataValid, this.lnavWptDistance, this.nominalGroundSpeed, this.nominalFuelFlow);
      case FlightPlanDataFieldType.Eta:
        return new FlightPlanEtaCalculator(this.simTime, this.isLNavDataValid, this.lnavWptDistance, this.nominalGroundSpeed);
      case FlightPlanDataFieldType.FuelRemaining:
        return new FlightPlanFuelRemainingCalculator(this.fuelOnBoard, this.isLNavDataValid, this.lnavWptDistance, this.nominalGroundSpeed, this.nominalFuelFlow);
      case FlightPlanDataFieldType.Dtk:
        return new FlightPlanDtkCalculator(this.isLNavDataValid, this.lnavDtk, this.magVar);
      case FlightPlanDataFieldType.LegDistance:
        return new FlightPlanDistanceCalculator(false, this.isLNavDataValid, this.lnavWptDistance);
      case FlightPlanDataFieldType.LegEte:
        return new FlightPlanEteCalculator(false, this.isLNavDataValid, this.lnavWptDistance, this.nominalGroundSpeed);
      case FlightPlanDataFieldType.LegFuel:
        return new FlightPlanFuelBurnCalculator(false, this.isLNavDataValid, this.lnavWptDistance, this.nominalGroundSpeed, this.nominalFuelFlow);
      case FlightPlanDataFieldType.Sunrise:
        return new FlightPlanNullCalculator();
      case FlightPlanDataFieldType.Sunset:
        return new FlightPlanNullCalculator();
      default:
        throw new FlightPlanNullCalculator();
    }
  }

  /**
   * Destroys this repository. Once this repository is destroyed, it can longer be manipulated and cannot be used to
   * retrieve calculators.
   */
  public destroy(): void {
    this.isAlive = false;

    for (const sub of this.subscriptions) {
      sub.destroy();
    }
  }
}

/**
 * A calculator that does nothing.
 */
class FlightPlanNullCalculator implements FlightPlanDataFieldCalculator {
  /** @inheritDoc */
  public calculate(): void {
    // noop
  }
}

/**
 * A calculator that calculates flight plan distance values.
 */
class FlightPlanDistanceCalculator implements FlightPlanDataFieldCalculator {
  /**
   * Creates a new instance of FlightPlanDistanceCalculator.
   * @param isCumulative Whether to write cumulative values instead of per-leg values to the data fields of flight plan
   * leg data items.
   * @param isLNavDataValid Whether LNAV data is valid.
   * @param lnavWptDistance The LNAV-calculated distance to the active waypoint, in nautical miles.
   */
  public constructor(
    private readonly isCumulative: boolean,
    private readonly isLNavDataValid: Accessible<boolean>,
    private readonly lnavWptDistance: Accessible<number>
  ) {
  }

  /** @inheritDoc */
  public calculate(dataFieldIndex: number, dataItems: readonly FlightPlanDataItem[], cumulativeDataField: FlightPlanDataField | null): void {
    const isLNavDataValid = this.isLNavDataValid.get();

    let cumulativeDistance = 0;

    for (let i = 0; i < dataItems.length; i++) {
      const item = dataItems[i];

      if (item.type !== FlightPlanDataItemType.Leg) {
        continue;
      }

      const field = item.dataFields[dataFieldIndex].get() as FlightPlanDataField<FlightPlanDataFieldType.CumulativeDistance | FlightPlanDataFieldType.LegDistance> | null;

      if (isLNavDataValid) {
        switch (item.activeStatus.get()) {
          case FlightPlanLegDataItemActiveStatus.To: {
            const legDistance = this.lnavWptDistance.get();
            cumulativeDistance = legDistance;
            field?.value.set(this.isCumulative ? cumulativeDistance : legDistance, UnitType.NMILE);
            break;
          }
          case FlightPlanLegDataItemActiveStatus.Future: {
            const legDistance = UnitType.METER.convertTo(item.leg.calculated?.distanceWithTransitions ?? NaN, UnitType.NMILE);
            cumulativeDistance += legDistance;
            field?.value.set(this.isCumulative ? cumulativeDistance : legDistance, UnitType.NMILE);
            break;
          }
          default:
            field?.value.set(NaN);
        }
      } else {
        field?.value.set(NaN);
      }
    }

    (cumulativeDataField as FlightPlanDataField<FlightPlanDataFieldType.CumulativeDistance | FlightPlanDataFieldType.LegDistance> | null)
      ?.value.set(isLNavDataValid ? cumulativeDistance : NaN, UnitType.NMILE);
  }
}

/**
 * A calculator that calculates flight plan estimated time enroute (ETE) values.
 */
class FlightPlanEteCalculator implements FlightPlanDataFieldCalculator {
  /**
   * Creates a new instance of FlightPlanEteCalculator.
   * @param isCumulative Whether to write cumulative values instead of per-leg values to the data fields of flight plan
   * leg data items.
   * @param isLNavDataValid Whether LNAV data is valid.
   * @param lnavWptDistance The LNAV-calculated distance to the active waypoint, in nautical miles.
   * @param groundSpeed The ground speed, in knots, to use for calculations.
   */
  public constructor(
    private readonly isCumulative: boolean,
    private readonly isLNavDataValid: Accessible<boolean>,
    private readonly lnavWptDistance: Accessible<number>,
    private readonly groundSpeed: Accessible<number>
  ) {
  }

  /** @inheritDoc */
  public calculate(dataFieldIndex: number, dataItems: readonly FlightPlanDataItem[], cumulativeDataField: FlightPlanDataField | null): void {
    const isLNavDataValid = this.isLNavDataValid.get();
    const gs = this.groundSpeed.get();

    let cumulativeEte = 0;

    for (let i = 0; i < dataItems.length; i++) {
      const item = dataItems[i];

      if (item.type !== FlightPlanDataItemType.Leg) {
        continue;
      }

      const field = item.dataFields[dataFieldIndex].get() as FlightPlanDataField<FlightPlanDataFieldType.CumulativeEte | FlightPlanDataFieldType.LegEte> | null;

      if (isLNavDataValid) {
        switch (item.activeStatus.get()) {
          case FlightPlanLegDataItemActiveStatus.To: {
            const legEte = this.lnavWptDistance.get() / gs;
            cumulativeEte = legEte;
            field?.value.set(this.isCumulative ? cumulativeEte : legEte, UnitType.HOUR);
            break;
          }
          case FlightPlanLegDataItemActiveStatus.Future: {
            const legEte = UnitType.METER.convertTo(item.leg.calculated?.distanceWithTransitions ?? NaN, UnitType.NMILE) / gs;
            cumulativeEte += legEte;
            field?.value.set(this.isCumulative ? cumulativeEte : legEte, UnitType.HOUR);
            break;
          }
          default:
            field?.value.set(NaN);
        }
      } else {
        field?.value.set(NaN);
      }
    }

    (cumulativeDataField as FlightPlanDataField<FlightPlanDataFieldType.CumulativeEte | FlightPlanDataFieldType.LegEte> | null)
      ?.value.set(isLNavDataValid ? cumulativeEte : NaN, UnitType.HOUR);
  }
}

/**
 * A calculator that calculates flight plan fuel burn values.
 */
class FlightPlanFuelBurnCalculator implements FlightPlanDataFieldCalculator {
  /**
   * Creates a new instance of FlightPlanFuelBurnCalculator.
   * @param isCumulative Whether to write cumulative values instead of per-leg values to the data fields of flight plan
   * leg data items.
   * @param isLNavDataValid Whether LNAV data is valid.
   * @param lnavWptDistance The LNAV-calculated distance to the active waypoint, in nautical miles.
   * @param groundSpeed The ground speed, in knots, to use for calculations.
   * @param fuelFlow The fuel flow, in gallons per hour, to use for calculations.
   */
  public constructor(
    private readonly isCumulative: boolean,
    private readonly isLNavDataValid: Accessible<boolean>,
    private readonly lnavWptDistance: Accessible<number>,
    private readonly groundSpeed: Accessible<number>,
    private readonly fuelFlow: Accessible<number>
  ) {
  }

  /** @inheritDoc */
  public calculate(dataFieldIndex: number, dataItems: readonly FlightPlanDataItem[], cumulativeDataField: FlightPlanDataField | null): void {
    const isLNavDataValid = this.isLNavDataValid.get();
    const gs = this.groundSpeed.get();
    const ff = this.fuelFlow.get();

    let cumulativeFuelBurn = 0;

    for (let i = 0; i < dataItems.length; i++) {
      const item = dataItems[i];

      if (item.type !== FlightPlanDataItemType.Leg) {
        continue;
      }

      const field = item.dataFields[dataFieldIndex].get() as FlightPlanDataField<FlightPlanDataFieldType.CumulativeFuel | FlightPlanDataFieldType.LegFuel> | null;

      if (isLNavDataValid) {
        switch (item.activeStatus.get()) {
          case FlightPlanLegDataItemActiveStatus.To: {
            const legFuelBurn = this.lnavWptDistance.get() / gs * ff;
            cumulativeFuelBurn = legFuelBurn;
            field?.value.set(this.isCumulative ? cumulativeFuelBurn : legFuelBurn, UnitType.GALLON_FUEL);
            break;
          }
          case FlightPlanLegDataItemActiveStatus.Future: {
            const legFuelBurn = UnitType.METER.convertTo(item.leg.calculated?.distanceWithTransitions ?? NaN, UnitType.NMILE) / gs * ff;
            cumulativeFuelBurn += legFuelBurn;
            field?.value.set(this.isCumulative ? cumulativeFuelBurn : legFuelBurn, UnitType.GALLON_FUEL);
            break;
          }
          default:
            field?.value.set(NaN);
        }
      } else {
        field?.value.set(NaN);
      }
    }

    (cumulativeDataField as FlightPlanDataField<FlightPlanDataFieldType.CumulativeFuel | FlightPlanDataFieldType.LegFuel> | null)
      ?.value.set(isLNavDataValid ? cumulativeFuelBurn : NaN, UnitType.GALLON_FUEL);
  }
}

/**
 * A calculator that calculates flight plan fuel remaining values.
 */
class FlightPlanFuelRemainingCalculator implements FlightPlanDataFieldCalculator {
  /**
   * Creates a new instance of FlightPlanFuelRemainingCalculator.
   * @param fuelOnBoard The current amount of fuel remaining, in gallons, to use for calculations.
   * @param isLNavDataValid Whether LNAV data is valid.
   * @param lnavWptDistance The LNAV-calculated distance to the active waypoint, in nautical miles.
   * @param groundSpeed The ground speed, in knots, to use for calculations.
   * @param fuelFlow The fuel flow, in gallons per hour, to use for calculations.
   */
  public constructor(
    private readonly fuelOnBoard: Accessible<number>,
    private readonly isLNavDataValid: Accessible<boolean>,
    private readonly lnavWptDistance: Accessible<number>,
    private readonly groundSpeed: Accessible<number>,
    private readonly fuelFlow: Accessible<number>
  ) {
  }

  /** @inheritDoc */
  public calculate(dataFieldIndex: number, dataItems: readonly FlightPlanDataItem[], cumulativeDataField: FlightPlanDataField | null): void {
    const fob = this.fuelOnBoard.get();
    const isLNavDataValid = this.isLNavDataValid.get();
    const gs = this.groundSpeed.get();
    const ff = this.fuelFlow.get();

    let cumulativeFuelBurn = 0;

    for (let i = 0; i < dataItems.length; i++) {
      const item = dataItems[i];

      if (item.type !== FlightPlanDataItemType.Leg) {
        continue;
      }

      const field = item.dataFields[dataFieldIndex].get() as FlightPlanDataField<FlightPlanDataFieldType.FuelRemaining> | null;

      if (isLNavDataValid) {
        switch (item.activeStatus.get()) {
          case FlightPlanLegDataItemActiveStatus.To: {
            cumulativeFuelBurn = this.lnavWptDistance.get() / gs * ff;
            field?.value.set(fob - cumulativeFuelBurn, UnitType.GALLON_FUEL);
            break;
          }
          case FlightPlanLegDataItemActiveStatus.Future: {
            cumulativeFuelBurn += UnitType.METER.convertTo(item.leg.calculated?.distanceWithTransitions ?? NaN, UnitType.NMILE) / gs * ff;
            field?.value.set(fob - cumulativeFuelBurn, UnitType.GALLON_FUEL);
            break;
          }
          default:
            field?.value.set(NaN);
        }
      } else {
        field?.value.set(NaN);
      }
    }

    (cumulativeDataField as FlightPlanDataField<FlightPlanDataFieldType.FuelRemaining> | null)
      ?.value.set(isLNavDataValid ? fob - cumulativeFuelBurn : NaN, UnitType.GALLON_FUEL);
  }
}

/**
 * A calculator that calculates flight plan estimated time of arrival (ETA) values.
 */
class FlightPlanEtaCalculator implements FlightPlanDataFieldCalculator {
  /**
   * Creates a new instance of FlightPlanEtaCalculator.
   * @param simTime The current simulation time, as a Javascript timestamp.
   * @param isLNavDataValid Whether LNAV data is valid.
   * @param lnavWptDistance The LNAV-calculated distance to the active waypoint, in nautical miles.
   * @param groundSpeed The ground speed, in knots, to use for calculations.
   */
  public constructor(
    private readonly simTime: Accessible<number>,
    private readonly isLNavDataValid: Accessible<boolean>,
    private readonly lnavWptDistance: Accessible<number>,
    private readonly groundSpeed: Accessible<number>
  ) {
  }

  /** @inheritDoc */
  public calculate(dataFieldIndex: number, dataItems: readonly FlightPlanDataItem[], cumulativeDataField: FlightPlanDataField | null): void {
    const simTime = this.simTime.get();
    const isLNavDataValid = this.isLNavDataValid.get();
    const gs = this.groundSpeed.get();

    let cumulativeEte = 0;

    for (let i = 0; i < dataItems.length; i++) {
      const item = dataItems[i];

      if (item.type !== FlightPlanDataItemType.Leg) {
        continue;
      }

      const field = item.dataFields[dataFieldIndex].get() as FlightPlanDataField<FlightPlanDataFieldType.Eta> | null;

      if (isLNavDataValid) {
        switch (item.activeStatus.get()) {
          case FlightPlanLegDataItemActiveStatus.To:
            cumulativeEte = this.lnavWptDistance.get() / gs * 3600e3;
            field?.value.set(simTime + cumulativeEte);
            break;
          case FlightPlanLegDataItemActiveStatus.Future:
            cumulativeEte += UnitType.METER.convertTo(item.leg.calculated?.distanceWithTransitions ?? NaN, UnitType.NMILE) / gs * 3600e3;
            field?.value.set(simTime + cumulativeEte);
            break;
          default:
            field?.value.set(NaN);
        }
      } else {
        field?.value.set(NaN);
      }
    }

    (cumulativeDataField as FlightPlanDataField<FlightPlanDataFieldType.Eta> | null)
      ?.value.set(isLNavDataValid ? simTime + cumulativeEte : NaN);
  }
}

/**
 * A calculator that calculates flight plan desired track (DTK) values.
 */
class FlightPlanDtkCalculator implements FlightPlanDataFieldCalculator {
  private readonly nominalDtk = new Float64Array(2);
  private readonly unit = BasicNavAngleUnit.create(false);

  /**
   * Creates a new instance of FlightPlanDtkCalculator.
   * @param isLNavDataValid Whether LNAV data is valid.
   * @param lnavDtk The LNAV-calculated desired true track to the active waypoint, in degrees.
   * @param magVar The magnetic variation, in degrees, at the airplane's current position.
   */
  public constructor(
    private readonly isLNavDataValid: Accessible<boolean>,
    private readonly lnavDtk: Accessible<number>,
    private readonly magVar: Accessible<number>,
  ) {
  }

  /** @inheritDoc */
  public calculate(dataFieldIndex: number, dataItems: readonly FlightPlanDataItem[], cumulativeDataField: FlightPlanDataField | null): void {
    const isLNavDataValid = this.isLNavDataValid.get();

    for (let i = 0; i < dataItems.length; i++) {
      const item = dataItems[i];

      if (item.type !== FlightPlanDataItemType.Leg) {
        continue;
      }

      const field = item.dataFields[dataFieldIndex].get() as FlightPlanDataField<FlightPlanDataFieldType.Dtk> | null;

      if (isLNavDataValid) {
        switch (item.activeStatus.get()) {
          case FlightPlanLegDataItemActiveStatus.To:
            this.unit.setMagVar(this.magVar.get());
            field?.value.set(this.lnavDtk.get(), this.unit);
            break;
          case FlightPlanLegDataItemActiveStatus.Future:
            FmsUtils.getNominalLegDtk(item.leg, this.nominalDtk);
            this.unit.setMagVar(this.nominalDtk[1]);
            field?.value.set(this.nominalDtk[0], this.unit);
            break;
          default:
            field?.value.set(NaN);
        }
      } else {
        field?.value.set(NaN);
      }
    }

    (cumulativeDataField as FlightPlanDataField<FlightPlanDataFieldType.Dtk> | null)
      ?.value.set(NaN);
  }
}