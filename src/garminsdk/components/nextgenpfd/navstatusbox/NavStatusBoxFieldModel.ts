import {
  BasicNavAngleSubject, BasicNavAngleUnit, ConsumerSubject, EventBus, GNSSEvents, LNavDataEvents, LNavEvents,
  LNavUtils, MappedSubject, MappedSubscribable, MathUtils, NavAngleUnit, NavAngleUnitFamily, NumberUnitInterface,
  NumberUnitSubject, Subject, Subscribable, SubscribableUtils, Subscription, UnitFamily, UnitType
} from '@microsoft/msfs-sdk';
import { NavDataFieldGpsValidity, NavDataFieldModel } from '../../navdatafield/NavDataFieldModel';
import { NavDataFieldType, NavDataFieldTypeModelMap } from '../../navdatafield/NavDataFieldType';
import { NavStatusBoxFieldType } from './NavStatusBoxFieldType';

/**
 * A data model for a navigation status box field.
 */
export interface NavStatusBoxFieldModel<T> extends NavDataFieldModel<T> {
  /**
   * Destroys this model.
   */
  destroy(): void;
}

/**
 * A map from navigation data field type to navigation status box field data model type.
 */
export type NavStatusBoxFieldTypeModelMap = {
  [Type in NavStatusBoxFieldType]: NavStatusBoxFieldModel<NavDataFieldTypeModelMap[Type] extends NavDataFieldModel<infer T> ? T : never>;
}

/**
 * A factory which creates data models for a single type of navigation status box field.
 */
export interface NavStatusBoxFieldTypeModelFactory<T extends NavStatusBoxFieldType> {
  /**
   * Creates a navigation status box field data model for this factory's data field type.
   * @param gpsValidity The subscribable that provides the validity of the GPS data for the models.
   * @returns A navigation status box field data model for this factory's data field type.
   */
  create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavStatusBoxFieldTypeModelMap[T];
}

/**
 * A factory for navigation status box field data models.
 */
export class NavStatusBoxFieldModelFactory implements NavStatusBoxFieldModelFactory {
  private readonly factories = new Map<NavStatusBoxFieldType, NavStatusBoxFieldTypeModelFactory<NavStatusBoxFieldType>>();

  /**
   * Constructor.
   * @param bus The event bus.
   * @param gpsValidity The subscribable that provides the validity of the GPS data for the models.
   * @param lnavIndex The index of the LNAV from which to source data. Defaults to `0`.
   */
  public constructor(
    bus: EventBus,
    private readonly gpsValidity: Subscribable<NavDataFieldGpsValidity>,
    lnavIndex?: number | Subscribable<number>
  ) {
    this.factories.set(NavDataFieldType.BearingToWaypoint, new NavStatusBoxFieldBrgModelFactory(bus, lnavIndex));
    this.factories.set(NavDataFieldType.DistanceToWaypoint, new NavStatusBoxFieldDisModelFactory(bus, lnavIndex));
    this.factories.set(NavDataFieldType.TimeToWaypoint, new NavStatusBoxFieldEteModelFactory(bus, lnavIndex));
  }

  /**
   * Creates a navigation status box field data model for a given type of field.
   * @param type A navigation status box field type.
   * @returns A navigation status box field data model for the given field type.
   * @throws Error if an unsupported field type is specified.
   */
  public create<T extends NavStatusBoxFieldType>(type: T): NavStatusBoxFieldTypeModelMap[T] {
    const model = this.factories.get(type)?.create(this.gpsValidity);

    if (!model) {
      throw new Error(`NavStatusBoxFieldModelFactory: no single-type model factory of data field type [${type}] is registered`);
    }

    return model as NavStatusBoxFieldTypeModelMap[T];
  }
}

/**
 * Creates data models for Bearing to Waypoint navigation status box fields.
 */
export class NavStatusBoxFieldBrgModelFactory implements NavStatusBoxFieldTypeModelFactory<NavDataFieldType.BearingToWaypoint> {
  /**
   * Constructor.
   * @param bus The event bus.
   * @param lnavIndex The index of the LNAV from which to source data. Defaults to `0`.
   */
  constructor(private readonly bus: EventBus, private readonly lnavIndex?: number | Subscribable<number>) {
  }

  /** @inheritDoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavStatusBoxFieldModel<NumberUnitInterface<NavAngleUnitFamily, NavAngleUnit>> {
    return new NavStatusBoxFieldBrgModel(this.bus, gpsValidity, this.lnavIndex);
  }
}

/**
 * Creates data models for Distance to Waypoint navigation status box fields.
 */
export class NavStatusBoxFieldDisModelFactory implements NavStatusBoxFieldTypeModelFactory<NavDataFieldType.DistanceToWaypoint> {
  /**
   * Constructor.
   * @param bus The event bus.
   * @param lnavIndex The index of the LNAV from which to source data. Defaults to `0`.
   */
  constructor(private readonly bus: EventBus, private readonly lnavIndex?: number | Subscribable<number>) {
  }

  /** @inheritDoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavStatusBoxFieldModel<NumberUnitInterface<UnitFamily.Distance>> {
    return new NavStatusBoxFieldDisModel(this.bus, gpsValidity, this.lnavIndex);
  }
}

/**
 * Creates data models for Time To Waypoint navigation status box fields.
 */
export class NavStatusBoxFieldEteModelFactory implements NavStatusBoxFieldTypeModelFactory<NavDataFieldType.TimeToWaypoint> {
  /**
   * Constructor.
   * @param bus The event bus.
   * @param lnavIndex The index of the LNAV from which to source data. Defaults to `0`.
   */
  constructor(private readonly bus: EventBus, private readonly lnavIndex?: number | Subscribable<number>) {
  }

  /** @inheritDoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavStatusBoxFieldModel<NumberUnitInterface<UnitFamily.Duration>> {
    return new NavStatusBoxFieldEteModel(this.bus, gpsValidity, this.lnavIndex);
  }
}

/**
 * A data model for Bearing to Waypoint navigation status box fields.
 */
export class NavStatusBoxFieldBrgModel implements NavStatusBoxFieldModel<NumberUnitInterface<NavAngleUnitFamily, NavAngleUnit>> {
  public readonly value = BasicNavAngleSubject.create(BasicNavAngleUnit.create(true).createNumber(NaN));

  private readonly isLNavIndexValid = Subject.create(false);
  private readonly lnavIsTracking: ConsumerSubject<boolean>;
  private readonly bearing: ConsumerSubject<number>;
  private readonly magVar: ConsumerSubject<number>;

  private readonly state: MappedSubscribable<readonly [NavDataFieldGpsValidity, boolean, boolean, number, number]>;

  private readonly lnavIndexSub?: Subscription;

  /**
   * Constructor.
   * @param bus The event bus.
   * @param gpsValidity The current validity state of the GPS data for this model.
   * @param lnavIndex The index of the LNAV from which to source data. Defaults to `0`.
   */
  public constructor(
    bus: EventBus,
    gpsValidity: Subscribable<NavDataFieldGpsValidity>,
    lnavIndex?: number | Subscribable<number>
  ) {
    const sub = bus.getSubscriber<GNSSEvents & LNavEvents & LNavDataEvents>();

    this.lnavIsTracking = ConsumerSubject.create<boolean>(null, false);
    this.bearing = ConsumerSubject.create(null, 0);
    this.magVar = ConsumerSubject.create(null, 0);

    lnavIndex ??= 0;

    const resolveLNavConsumers = (index: number): void => {
      if (LNavUtils.isValidLNavIndex(index)) {
        const suffix = LNavUtils.getEventBusTopicSuffix(index);
        this.isLNavIndexValid.set(true);
        this.lnavIsTracking.setConsumer(sub.on(`lnav_is_tracking${suffix}`));
        this.bearing.setConsumer(sub.on(`lnavdata_waypoint_bearing_mag${suffix}`));
      } else {
        this.isLNavIndexValid.set(false);
        this.lnavIsTracking.setConsumer(null);
        this.bearing.setConsumer(null);
      }
    };

    if (SubscribableUtils.isSubscribable(lnavIndex)) {
      this.lnavIndexSub = lnavIndex.sub(resolveLNavConsumers, true);
    } else {
      resolveLNavConsumers(lnavIndex);
    }

    this.magVar.setConsumer(sub.on('magvar'));

    this.state = MappedSubject.create(
      gpsValidity,
      this.isLNavIndexValid,
      this.lnavIsTracking,
      this.bearing,
      this.magVar
    );

    this.state.sub(([gpsValidityState, isLNavIndexValid, isTracking, bearing, magVar]) => {
      this.value.set(
        gpsValidityState !== NavDataFieldGpsValidity.Invalid && isLNavIndexValid && isTracking ? MathUtils.round(bearing, 0.5) : NaN,
        MathUtils.round(magVar, 0.5)
      );
    }, true);
  }

  /** @inheritDoc */
  public destroy(): void {
    this.lnavIndexSub?.destroy();
    this.lnavIsTracking.destroy();
    this.bearing.destroy();
    this.magVar.destroy();
    this.state.destroy();
  }
}

/**
 * A data model for Distance to Waypoint navigation status box fields.
 */
export class NavStatusBoxFieldDisModel implements NavStatusBoxFieldModel<NumberUnitInterface<UnitFamily.Distance>> {
  private static readonly PRECISION = UnitType.KILOMETER.convertTo(0.1, UnitType.NMILE);

  public readonly value = NumberUnitSubject.create(UnitType.NMILE.createNumber(NaN));

  private readonly isLNavIndexValid = Subject.create(false);
  private readonly lnavIsTracking: ConsumerSubject<boolean>;
  private readonly distance: ConsumerSubject<number>;

  private readonly state: MappedSubscribable<readonly [NavDataFieldGpsValidity, boolean, boolean, number]>;

  private readonly lnavIndexSub?: Subscription;

  /**
   * Constructor.
   * @param bus The event bus.
   * @param gpsValidity The current validity state of the GPS data for this model.
   * @param lnavIndex The index of the LNAV from which to source data. Defaults to `0`.
   */
  public constructor(
    bus: EventBus,
    gpsValidity: Subscribable<NavDataFieldGpsValidity>,
    lnavIndex?: number | Subscribable<number>
  ) {
    const sub = bus.getSubscriber<GNSSEvents & LNavEvents & LNavDataEvents>();

    this.lnavIsTracking = ConsumerSubject.create<boolean>(null, false);
    this.distance = ConsumerSubject.create(null, 0);

    lnavIndex ??= 0;

    const resolveLNavConsumers = (index: number): void => {
      if (LNavUtils.isValidLNavIndex(index)) {
        const suffix = LNavUtils.getEventBusTopicSuffix(index);
        this.isLNavIndexValid.set(true);
        this.lnavIsTracking.setConsumer(sub.on(`lnav_is_tracking${suffix}`));
        this.distance.setConsumer(sub.on(`lnavdata_waypoint_distance${suffix}`));
      } else {
        this.isLNavIndexValid.set(false);
        this.lnavIsTracking.setConsumer(null);
        this.distance.setConsumer(null);
      }
    };

    if (SubscribableUtils.isSubscribable(lnavIndex)) {
      this.lnavIndexSub = lnavIndex.sub(resolveLNavConsumers, true);
    } else {
      resolveLNavConsumers(lnavIndex);
    }

    this.state = MappedSubject.create(
      gpsValidity,
      this.isLNavIndexValid,
      this.lnavIsTracking,
      this.distance
    );

    this.state.sub(([gpsValidityState, isLNavIndexValid, isTracking, distance]) => {
      this.value.set(
        gpsValidityState !== NavDataFieldGpsValidity.Invalid && isLNavIndexValid && isTracking
          ? MathUtils.round(distance, NavStatusBoxFieldDisModel.PRECISION)
          : NaN
      );
    }, true);
  }

  /** @inheritDoc */
  public destroy(): void {
    this.lnavIndexSub?.destroy();
    this.lnavIsTracking.destroy();
    this.distance.destroy();
    this.state.destroy();
  }
}

/**
 * A data model for Time to Waypoint navigation status box fields.
 */
export class NavStatusBoxFieldEteModel implements NavStatusBoxFieldModel<NumberUnitInterface<UnitFamily.Duration>> {
  private static readonly PRECISION = UnitType.SECOND.convertTo(1, UnitType.HOUR);

  public readonly value = NumberUnitSubject.create(UnitType.HOUR.createNumber(NaN));

  private readonly isLNavIndexValid = Subject.create(false);
  private readonly lnavIsTracking: ConsumerSubject<boolean>;
  private readonly distance: ConsumerSubject<number>;
  private readonly groundSpeed: ConsumerSubject<number>;

  private readonly state: MappedSubscribable<readonly [NavDataFieldGpsValidity, boolean, boolean, number, number]>;

  private readonly lnavIndexSub?: Subscription;

  /**
   * Constructor.
   * @param bus The event bus.
   * @param gpsValidity The current validity state of the GPS data for this model.
   * @param lnavIndex The index of the LNAV from which to source data. Defaults to `0`.
   */
  public constructor(
    bus: EventBus,
    gpsValidity: Subscribable<NavDataFieldGpsValidity>,
    lnavIndex?: number | Subscribable<number>
  ) {
    const sub = bus.getSubscriber<GNSSEvents & LNavEvents & LNavDataEvents>();

    this.lnavIsTracking = ConsumerSubject.create<boolean>(null, false);
    this.distance = ConsumerSubject.create(null, 0);
    this.groundSpeed = ConsumerSubject.create(null, 0);

    lnavIndex ??= 0;

    const resolveLNavConsumers = (index: number): void => {
      if (LNavUtils.isValidLNavIndex(index)) {
        const suffix = LNavUtils.getEventBusTopicSuffix(index);
        this.isLNavIndexValid.set(true);
        this.lnavIsTracking.setConsumer(sub.on(`lnav_is_tracking${suffix}`));
        this.distance.setConsumer(sub.on(`lnavdata_waypoint_distance${suffix}`));
      } else {
        this.isLNavIndexValid.set(false);
        this.lnavIsTracking.setConsumer(null);
        this.distance.setConsumer(null);
      }
    };

    if (SubscribableUtils.isSubscribable(lnavIndex)) {
      this.lnavIndexSub = lnavIndex.sub(resolveLNavConsumers, true);
    } else {
      resolveLNavConsumers(lnavIndex);
    }

    this.groundSpeed.setConsumer(sub.on('ground_speed'));

    this.state = MappedSubject.create(
      gpsValidity,
      this.isLNavIndexValid,
      this.lnavIsTracking,
      this.distance,
      this.groundSpeed
    );

    this.state.sub(([gpsValidityState, isLNavIndexValid, isTracking, distance, gs]) => {
      let time = NaN;
      if (gpsValidityState !== NavDataFieldGpsValidity.Invalid && isLNavIndexValid && isTracking && gs > 30) {
        time = distance / gs;
      }
      this.value.set(MathUtils.round(time, NavStatusBoxFieldEteModel.PRECISION));
    }, true);
  }

  /** @inheritDoc */
  public destroy(): void {
    this.lnavIndexSub?.destroy();
    this.lnavIsTracking.destroy();
    this.distance.destroy();
    this.groundSpeed.destroy();
    this.state.destroy();
  }
}