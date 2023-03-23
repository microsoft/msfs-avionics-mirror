import {
  BasicNavAngleSubject, BasicNavAngleUnit, ConsumerSubject, EventBus, GNSSEvents, LNavDataEvents, LNavEvents,
  MappedSubject, MappedSubscribable, MathUtils, NavAngleUnit, NavAngleUnitFamily, NumberUnitInterface,
  NumberUnitSubject, Subscribable, UnitFamily, UnitType
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
   */
  public constructor(bus: EventBus, private readonly gpsValidity: Subscribable<NavDataFieldGpsValidity>) {
    this.factories.set(NavDataFieldType.BearingToWaypoint, new NavStatusBoxFieldBrgModelFactory(bus));
    this.factories.set(NavDataFieldType.DistanceToWaypoint, new NavStatusBoxFieldDisModelFactory(bus));
    this.factories.set(NavDataFieldType.TimeToWaypoint, new NavStatusBoxFieldEteModelFactory(bus));
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
   */
  constructor(private readonly bus: EventBus) {
  }

  /** @inheritdoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavStatusBoxFieldModel<NumberUnitInterface<NavAngleUnitFamily>> {
    return new NavStatusBoxFieldBrgModel(this.bus, gpsValidity);
  }
}

/**
 * Creates data models for Distance to Waypoint navigation status box fields.
 */
export class NavStatusBoxFieldDisModelFactory implements NavStatusBoxFieldTypeModelFactory<NavDataFieldType.DistanceToWaypoint> {
  /**
   * Constructor.
   * @param bus The event bus.
   */
  constructor(private readonly bus: EventBus) {
  }

  /** @inheritdoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavStatusBoxFieldModel<NumberUnitInterface<UnitFamily.Distance>> {
    return new NavStatusBoxFieldDisModel(this.bus, gpsValidity);
  }
}

/**
 * Creates data models for Time To Waypoint navigation status box fields.
 */
export class NavStatusBoxFieldEteModelFactory implements NavStatusBoxFieldTypeModelFactory<NavDataFieldType.TimeToWaypoint> {
  /**
   * Constructor.
   * @param bus The event bus.
   */
  constructor(private readonly bus: EventBus) {
  }

  /** @inheritdoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavStatusBoxFieldModel<NumberUnitInterface<UnitFamily.Duration>> {
    return new NavStatusBoxFieldEteModel(this.bus, gpsValidity);
  }
}

/**
 * A data model for Bearing to Waypoint navigation status box fields.
 */
export class NavStatusBoxFieldBrgModel implements NavStatusBoxFieldModel<NumberUnitInterface<NavAngleUnitFamily, NavAngleUnit>> {
  public readonly value = BasicNavAngleSubject.create(BasicNavAngleUnit.create(true).createNumber(NaN));

  private readonly lnavIsTracking: ConsumerSubject<boolean>;
  private readonly bearing: ConsumerSubject<number>;
  private readonly magVar: ConsumerSubject<number>;

  private readonly state: MappedSubscribable<readonly [NavDataFieldGpsValidity, boolean, number, number]>;

  /**
   * Constructor.
   * @param bus The event bus.
   * @param gpsValidity The current validity state of the GPS data for this model.
   */
  public constructor(bus: EventBus, gpsValidity: Subscribable<NavDataFieldGpsValidity>) {
    const sub = bus.getSubscriber<GNSSEvents & LNavEvents & LNavDataEvents>();

    this.lnavIsTracking = ConsumerSubject.create(sub.on('lnav_is_tracking'), false);
    this.bearing = ConsumerSubject.create(sub.on('lnavdata_waypoint_bearing_mag'), 0);
    this.magVar = ConsumerSubject.create(sub.on('magvar'), 0);

    this.state = MappedSubject.create(
      gpsValidity,
      this.lnavIsTracking,
      this.bearing,
      this.magVar
    );

    this.state.sub(([gpsValidityState, isTracking, bearing, magVar]) => {
      this.value.set(
        gpsValidityState !== NavDataFieldGpsValidity.Invalid && isTracking ? MathUtils.round(bearing, 0.5) : NaN,
        MathUtils.round(magVar, 0.5)
      );
    }, true);
  }

  /** @inheritdoc */
  public destroy(): void {
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

  private readonly lnavIsTracking: ConsumerSubject<boolean>;
  private readonly distance: ConsumerSubject<number>;

  private readonly state: MappedSubscribable<readonly [NavDataFieldGpsValidity, boolean, number]>;

  /**
   * Constructor.
   * @param bus The event bus.
   * @param gpsValidity The current validity state of the GPS data for this model.
   */
  public constructor(bus: EventBus, gpsValidity: Subscribable<NavDataFieldGpsValidity>) {
    const sub = bus.getSubscriber<GNSSEvents & LNavEvents & LNavDataEvents>();

    this.lnavIsTracking = ConsumerSubject.create(sub.on('lnav_is_tracking'), false);
    this.distance = ConsumerSubject.create(sub.on('lnavdata_waypoint_distance'), 0);

    this.state = MappedSubject.create(
      gpsValidity,
      this.lnavIsTracking,
      this.distance
    );

    this.state.sub(([gpsValidityState, isTracking, distance]) => {
      this.value.set(gpsValidityState !== NavDataFieldGpsValidity.Invalid && isTracking ? MathUtils.round(distance, NavStatusBoxFieldDisModel.PRECISION) : NaN);
    }, true);
  }

  /** @inheritdoc */
  public destroy(): void {
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

  private readonly lnavIsTracking: ConsumerSubject<boolean>;
  private readonly distance: ConsumerSubject<number>;
  private readonly groundSpeed: ConsumerSubject<number>;

  private readonly state: MappedSubscribable<readonly [NavDataFieldGpsValidity, boolean, number, number]>;

  /**
   * Constructor.
   * @param bus The event bus.
   * @param gpsValidity The current validity state of the GPS data for this model.
   */
  public constructor(bus: EventBus, gpsValidity: Subscribable<NavDataFieldGpsValidity>) {
    const sub = bus.getSubscriber<GNSSEvents & LNavEvents & LNavDataEvents>();

    this.lnavIsTracking = ConsumerSubject.create(sub.on('lnav_is_tracking'), false);
    this.distance = ConsumerSubject.create(sub.on('lnavdata_waypoint_distance'), 0);
    this.groundSpeed = ConsumerSubject.create(sub.on('ground_speed'), 0);

    this.state = MappedSubject.create(
      gpsValidity,
      this.lnavIsTracking,
      this.distance,
      this.groundSpeed
    );

    this.state.sub(([gpsValidityState, isTracking, distance, gs]) => {
      let time = NaN;
      if (gpsValidityState !== NavDataFieldGpsValidity.Invalid && isTracking && gs > 30) {
        time = distance / gs;
      }
      this.value.set(MathUtils.round(time, NavStatusBoxFieldEteModel.PRECISION));
    }, true);
  }

  /** @inheritdoc */
  public destroy(): void {
    this.lnavIsTracking.destroy();
    this.distance.destroy();
    this.groundSpeed.destroy();
    this.state.destroy();
  }
}