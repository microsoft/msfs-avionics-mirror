import {
  AdcEvents, AhrsEvents, BasicNavAngleSubject, BasicNavAngleUnit, ClockEvents, EngineEvents, EventBus, FlightPlanCopiedEvent,
  FlightPlanIndicationEvent, FlightPlannerEvents, FlightPlanOriginDestEvent, GNSSEvents, ICAO, LNavEvents, NavAngleUnitFamily, NavMath, NumberUnitInterface,
  NumberUnitSubject, OriginDestChangeType, Subject, Subscribable, UnitFamily, UnitType, VNavDataEvents, VNavEvents
} from '@microsoft/msfs-sdk';

import { Fms } from '../../flightplan/Fms';
import { LNavDataEvents } from '../../navigation/LNavDataEvents';
import { NavDataFieldGpsValidity } from '../navdatafield/NavDataFieldModel';
import { NavDataFieldType } from '../navdatafield/NavDataFieldType';
import {
  NavDataBarFieldConsumerModel, NavDataBarFieldConsumerNumberUnitModel, NavDataBarFieldGenericModel, NavDataBarFieldModel, NavDataBarFieldModelFactory,
  NavDataBarFieldTypeModelMap
} from './NavDataBarFieldModel';

/**
 * A factory which creates data models for a single type of navigation data bar field.
 */
export interface NavDataBarFieldTypeModelFactory<T extends NavDataFieldType> {
  /**
   * Creates a navigation data bar field data model for this factory's data field type.
   * @param gpsValidity The subscribable that provides the validity of the GPS data for the models.
   * @returns A navigation data bar field data model for this factory's data field type.
   */
  create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldTypeModelMap[T];
}

/**
 * A generic implementation of a factory for navigation data bar field data models. For each data field type, a
 * single-type model factory can be registered. Once registered, the single-type model factory is used to create data
 * models for its assigned data field type.
 */
export class GenericNavDataBarFieldModelFactory implements NavDataBarFieldModelFactory {
  private readonly factories = new Map<NavDataFieldType, NavDataBarFieldTypeModelFactory<NavDataFieldType>>();

  /**
   * Creates an instance of aGenericNavDataBarFieldModelFactory.
   * @param gpsValidity The subscribable that provides the validity of the GPS data for the models.
   */
  constructor(private readonly gpsValidity: Subscribable<NavDataFieldGpsValidity>) { }

  /**
   * Registers a single-type model factory with this factory.
   * @param type The data field type of the single-type model factory to register.
   * @param factory The single-type model factory to register.
   */
  public register<T extends NavDataFieldType>(type: T, factory: NavDataBarFieldTypeModelFactory<T>): void {
    this.factories.set(type, factory);
  }

  /**
   * Deregisters a single-type model factory from this factory.
   * @param type The data field type of the single-type model factory to deregister.
   * @returns Whether a single-type model factory was deregistered.
   */
  public deregister<T extends NavDataFieldType>(type: T): boolean {
    return this.factories.delete(type);
  }

  /**
   * Creates a navigation data bar field data model for a given type of field.
   * @param type A data bar field type.
   * @returns A navigation data bar field data model for the given field type.
   * @throws Error if an unsupported field type is specified.
   */
  public create<T extends NavDataFieldType>(type: T): NavDataBarFieldTypeModelMap[T] {
    const model = this.factories.get(type)?.create(this.gpsValidity);

    if (!model) {
      throw new Error(`GenericNavDataBarFieldModelFactory: no single-type model factory of data field type [${type}] is registered`);
    }

    return model as NavDataBarFieldTypeModelMap[T];
  }
}

/**
 * An abstract implementation of {@link NavDataBarFieldTypeModelFactory} which accesses data from the event bus to use
 * to create its data models.
 */
export abstract class EventBusNavDataBarFieldTypeModelFactory<T extends NavDataFieldType, E> implements NavDataBarFieldTypeModelFactory<T> {
  protected readonly sub = this.bus.getSubscriber<E>();

  /**
   * Constructor.
   * @param bus The event bus.
   */
  constructor(private readonly bus: EventBus) {
  }

  /** @inheritdoc */
  public abstract create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldTypeModelMap[T];
}

/**
 * Creates data models for Bearing to Waypoint navigation data bar fields.
 */
export class NavDataBarFieldBrgModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.BearingToWaypoint, GNSSEvents & LNavEvents & LNavDataEvents> {
  /** @inheritdoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<NumberUnitInterface<NavAngleUnitFamily>> {
    return new NavDataBarFieldConsumerModel(
      BasicNavAngleSubject.create(BasicNavAngleUnit.create(true).createNumber(0)),
      gpsValidity,
      [
        this.sub.on('lnav_is_tracking').whenChanged(),
        this.sub.on('lnavdata_waypoint_bearing_mag').whenChanged(),
        this.sub.on('magvar')
      ],
      [false, 0, 0] as [boolean, number, number],
      (sub, validity, [isTracking, bearing, magVar]) => {
        const gpsValid = validity.get() === NavDataFieldGpsValidity.DeadReckoning || validity.get() === NavDataFieldGpsValidity.Valid;
        sub.set((isTracking.get() && gpsValid) ? bearing.get() : NaN, magVar.get());
      }
    );
  }
}

/**
 * Creates data models for Bearing to Waypoint navigation data bar fields.
 */
export class NavDataBarFieldDestModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.Destination, FlightPlannerEvents> {
  /**
   * Constructor.
   * @param bus The event bus.
   * @param fms The flight management system.
   */
  constructor(bus: EventBus, private readonly fms: Fms) {
    super(bus);
  }

  /** @inheritdoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<string> {
    let destinationIdent = '____';

    const originDestHandler = (event: FlightPlanOriginDestEvent): void => {
      if (event.planIndex === Fms.PRIMARY_PLAN_INDEX && event.type === OriginDestChangeType.DestinationAdded) {
        destinationIdent = event.airport === undefined ? '____' : ICAO.getIdent(event.airport);
      } else if (event.type === OriginDestChangeType.DestinationRemoved) {
        destinationIdent = '____';
      }
    };
    const loadHandler = (event: FlightPlanIndicationEvent): void => {
      if (event.planIndex !== Fms.PRIMARY_PLAN_INDEX) {
        return;
      }

      const primaryPlan = this.fms.getPrimaryFlightPlan();
      destinationIdent = primaryPlan.destinationAirport === undefined ? '____' : ICAO.getIdent(primaryPlan.destinationAirport);
    };
    const copyHandler = (event: FlightPlanCopiedEvent): void => {
      if (event.targetPlanIndex !== Fms.PRIMARY_PLAN_INDEX) {
        return;
      }

      const primaryPlan = this.fms.getPrimaryFlightPlan();
      destinationIdent = primaryPlan.destinationAirport === undefined ? '____' : ICAO.getIdent(primaryPlan.destinationAirport);
    };

    const originDestConsumer = this.sub.on('fplOriginDestChanged');
    originDestConsumer.handle(originDestHandler);

    const loadConsumer = this.sub.on('fplLoaded');
    loadConsumer.handle(loadHandler);

    const copyConsumer = this.sub.on('fplCopied');
    copyConsumer.handle(copyHandler);

    return new NavDataBarFieldGenericModel(
      Subject.create('____'),
      gpsValidity,
      (sub) => {
        sub.set(destinationIdent);
      },
      () => {
        originDestConsumer.off(originDestHandler);
        loadConsumer.off(loadHandler);
        copyConsumer.off(copyHandler);
      }
    );
  }
}

/**
 * Creates data models for Distance to Waypoint navigation data bar fields.
 */
export class NavDataBarFieldDisModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.DistanceToWaypoint, LNavEvents & LNavDataEvents> {
  /** @inheritdoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<NumberUnitInterface<UnitFamily.Distance>> {
    return new NavDataBarFieldConsumerModel(
      NumberUnitSubject.create(UnitType.NMILE.createNumber(NaN)),
      gpsValidity,
      [
        this.sub.on('lnav_is_tracking').whenChanged(),
        this.sub.on('lnavdata_waypoint_distance').whenChanged()
      ],
      [false, 0] as [boolean, number],
      (sub, validity, [isTracking, distance]) => {
        const gpsValid = validity.get() === NavDataFieldGpsValidity.DeadReckoning || validity.get() === NavDataFieldGpsValidity.Valid;
        sub.set((isTracking.get() && gpsValid) ? distance.get() : NaN);
      }
    );
  }
}

/**
 * Creates data models for Distance to Destination navigation data bar fields.
 */
export class NavDataBarFieldDtgModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.DistanceToDestination, LNavEvents & LNavDataEvents> {
  /** @inheritdoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<NumberUnitInterface<UnitFamily.Distance>> {
    return new NavDataBarFieldConsumerModel(
      NumberUnitSubject.create(UnitType.NMILE.createNumber(NaN)),
      gpsValidity,
      [
        this.sub.on('lnav_is_tracking').whenChanged(),
        this.sub.on('lnavdata_destination_distance').whenChanged()
      ],
      [false, 0] as [boolean, number],
      (sub, validity, [isTracking, distance]) => {
        const gpsValid = validity.get() === NavDataFieldGpsValidity.DeadReckoning || validity.get() === NavDataFieldGpsValidity.Valid;
        sub.set((isTracking.get() && gpsValid) ? distance.get() : NaN);
      }
    );
  }
}

/**
 * Creates data models for Desired Track navigation data bar fields.
 */
export class NavDataBarFieldDtkModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.DesiredTrack, GNSSEvents & LNavEvents & LNavDataEvents> {
  /** @inheritdoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<NumberUnitInterface<NavAngleUnitFamily>> {
    return new NavDataBarFieldConsumerModel(
      BasicNavAngleSubject.create(BasicNavAngleUnit.create(true).createNumber(0)),
      gpsValidity,
      [
        this.sub.on('lnav_is_tracking').whenChanged(),
        this.sub.on('lnavdata_dtk_mag').whenChanged(),
        this.sub.on('magvar')
      ],
      [false, 0, 0] as [boolean, number, number],
      (sub, validity, [isTracking, track, magVar]) => {
        const gpsValid = validity.get() === NavDataFieldGpsValidity.DeadReckoning || validity.get() === NavDataFieldGpsValidity.Valid;
        sub.set((isTracking.get() && gpsValid) ? track.get() : NaN, magVar.get());
      }
    );
  }
}

/**
 * Creates data models for Endurance navigation data bar fields.
 */
export class NavDataBarFieldEndModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.Endurance, EngineEvents> {
  /** @inheritdoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<NumberUnitInterface<UnitFamily.Duration>> {
    return new NavDataBarFieldConsumerModel(
      NumberUnitSubject.create(UnitType.HOUR.createNumber(NaN)),
      gpsValidity,
      [
        this.sub.on('fuel_usable_total').whenChanged(),
        this.sub.on('fuel_flow_total').whenChanged()
      ],
      [0, 0] as [number, number],
      (sub, validity, [fuelRemaining, fuelFlow]) => {
        let endurance = NaN;
        const fuelFlowGph = fuelFlow.get();
        if (fuelFlowGph > 0) {
          const fuelGal = fuelRemaining.get();
          endurance = fuelGal / fuelFlowGph;
        }
        sub.set(endurance);
      }
    );
  }
}

/**
 * Creates data models for Time To Destination navigation data bar fields.
 */
export class NavDataBarFieldEnrModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.TimeToDestination, GNSSEvents & LNavEvents & LNavDataEvents> {
  /** @inheritdoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<NumberUnitInterface<UnitFamily.Duration>> {
    return new NavDataBarFieldConsumerModel(
      NumberUnitSubject.create(UnitType.HOUR.createNumber(NaN)),
      gpsValidity,
      [
        this.sub.on('lnav_is_tracking').whenChanged(),
        this.sub.on('lnavdata_destination_distance').whenChanged(),
        this.sub.on('ground_speed').whenChanged()
      ],
      [false, 0, 0] as [boolean, number, number],
      (sub, validity, [isTracking, distance, gs]) => {
        let time = NaN;
        const gpsValid = validity.get() === NavDataFieldGpsValidity.DeadReckoning || validity.get() === NavDataFieldGpsValidity.Valid;

        if (isTracking.get() && gpsValid) {
          const gsKnots = gs.get();
          if (gsKnots > 30) {
            const distanceNM = distance.get();
            time = distanceNM / gsKnots;
          }
        }
        sub.set(time);
      }
    );
  }
}

/**
 * Creates data models for Estimated Time of Arrival navigation data bar fields.
 */
export class NavDataBarFieldEtaModelFactory
  extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.TimeOfWaypointArrival, GNSSEvents & LNavEvents & LNavDataEvents & ClockEvents> {

  /** @inheritdoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<number> {
    return new NavDataBarFieldConsumerModel(
      Subject.create(NaN),
      gpsValidity,
      [
        this.sub.on('lnav_is_tracking').whenChanged(),
        this.sub.on('lnavdata_waypoint_distance').whenChanged(),
        this.sub.on('ground_speed').whenChanged(),
        this.sub.on('simTime')
      ],
      [false, 0, 0, NaN] as [boolean, number, number, number],
      (sub, validity, [isTracking, distance, gs, time]) => {
        let eta = NaN;
        const gpsValid = validity.get() === NavDataFieldGpsValidity.DeadReckoning || validity.get() === NavDataFieldGpsValidity.Valid;

        if (isTracking.get() && gpsValid) {
          const gsKnots = gs.get();
          if (gsKnots > 30) {
            const distanceNM = distance.get();
            eta = UnitType.HOUR.convertTo(distanceNM / gsKnots, UnitType.MILLISECOND) + time.get();
          }
        }
        sub.set(eta);
      }
    );
  }
}

/**
 * Creates data models for Time To Waypoint navigation data bar fields.
 */
export class NavDataBarFieldEteModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.TimeToWaypoint, GNSSEvents & LNavEvents & LNavDataEvents> {
  /** @inheritdoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<NumberUnitInterface<UnitFamily.Duration>> {
    return new NavDataBarFieldConsumerModel(
      NumberUnitSubject.create(UnitType.HOUR.createNumber(NaN)),
      gpsValidity,
      [
        this.sub.on('lnav_is_tracking').whenChanged(),
        this.sub.on('lnavdata_waypoint_distance').whenChanged(),
        this.sub.on('ground_speed').whenChanged()
      ],
      [false, 0, 0] as [boolean, number, number],
      (sub, validity, [isTracking, distance, gs]) => {
        let time = NaN;
        const gpsValid = validity.get() === NavDataFieldGpsValidity.DeadReckoning || validity.get() === NavDataFieldGpsValidity.Valid;

        if (isTracking.get() && gpsValid) {
          const gsKnots = gs.get();
          if (gsKnots > 30) {
            const distanceNM = distance.get();
            time = distanceNM / gsKnots;
          }
        }
        sub.set(time);
      }
    );
  }
}

/**
 * Creates data models for Fuel on Board navigation data bar fields.
 */
export class NavDataBarFieldFobModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.FuelOnBoard, EngineEvents> {
  /** @inheritdoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<NumberUnitInterface<UnitFamily.Weight>> {
    return new NavDataBarFieldConsumerNumberUnitModel(
      gpsValidity,
      this.sub.on('fuel_usable_total'), 0, UnitType.GALLON_FUEL
    );
  }
}

/**
 * Creates data models for Fuel Over Destination navigation data bar fields.
 */
export class NavDataBarFieldFodModelFactory
  extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.FuelOverDestination, GNSSEvents & LNavEvents & LNavDataEvents & EngineEvents> {

  /** @inheritdoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<NumberUnitInterface<UnitFamily.Weight>> {
    return new NavDataBarFieldConsumerModel(
      NumberUnitSubject.create(UnitType.GALLON_FUEL.createNumber(NaN)),
      gpsValidity,
      [
        this.sub.on('lnav_is_tracking').whenChanged(),
        this.sub.on('lnavdata_destination_distance').whenChanged(),
        this.sub.on('ground_speed').whenChanged(),
        this.sub.on('fuel_usable_total').whenChanged(),
        this.sub.on('fuel_flow_total').whenChanged()
      ],
      [false, 0, 0, 0, 0] as [boolean, number, number, number, number],
      (sub, validity, [isTracking, distance, gs, fuelRemaining, fuelFlow]) => {
        let fod = NaN;
        const gpsValid = validity.get() === NavDataFieldGpsValidity.DeadReckoning || validity.get() === NavDataFieldGpsValidity.Valid;

        if (isTracking.get() && gpsValid) {
          const gsKnots = gs.get();
          const fuelFlowGph = fuelFlow.get();
          if (gsKnots > 30 && fuelFlowGph > 0) {
            const distanceNM = distance.get();
            const fuelGal = fuelRemaining.get();
            fod = fuelGal - distanceNM / gsKnots * fuelFlowGph;
          }
        }
        sub.set(fod);
      }
    );
  }
}

/**
 * Creates data models for Ground Speed navigation data bar fields.
 */
export class NavDataBarFieldGsModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.GroundSpeed, GNSSEvents> {
  /** @inheritdoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<NumberUnitInterface<UnitFamily.Speed>> {
    return new NavDataBarFieldConsumerModel(
      NumberUnitSubject.create(UnitType.KNOT.createNumber(NaN)),
      gpsValidity,
      [
        this.sub.on('ground_speed')
      ],
      [0],
      (sub, validity, [gs]) => {
        const gpsValid = validity.get() === NavDataFieldGpsValidity.DeadReckoning || validity.get() === NavDataFieldGpsValidity.Valid;
        sub.set(gpsValid ? gs.get() : NaN);
      }
    );
  }
}

/**
 * Creates data models for ISA navigation data bar fields.
 */
export class NavDataBarFieldIsaModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.ISA, AdcEvents> {
  /** @inheritdoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<NumberUnitInterface<UnitFamily.Temperature>> {
    return new NavDataBarFieldConsumerNumberUnitModel(
      gpsValidity,
      this.sub.on('isa_temp_c'), 0, UnitType.CELSIUS
    );
  }
}

/**
 * Creates data models for Estimated Time of Arrival at Destination navigation data bar fields.
 */
export class NavDataBarFieldLdgModelFactory
  extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.TimeOfDestinationArrival, GNSSEvents & LNavEvents & LNavDataEvents & ClockEvents> {

  /** @inheritdoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<number> {
    return new NavDataBarFieldConsumerModel(
      Subject.create(NaN),
      gpsValidity,
      [
        this.sub.on('lnav_is_tracking').whenChanged(),
        this.sub.on('lnavdata_destination_distance').whenChanged(),
        this.sub.on('ground_speed').whenChanged(),
        this.sub.on('simTime')
      ],
      [false, 0, 0, NaN] as [boolean, number, number, number],
      (sub, validity, [isTracking, distance, gs, time]) => {
        let eta = NaN;
        const gpsValid = validity.get() === NavDataFieldGpsValidity.DeadReckoning || validity.get() === NavDataFieldGpsValidity.Valid;

        if (isTracking.get() && gpsValid) {
          const gsKnots = gs.get();
          if (gsKnots > 30) {
            const distanceNM = distance.get();
            eta = UnitType.HOUR.convertTo(distanceNM / gsKnots, UnitType.MILLISECOND) + time.get();
          }
        }
        sub.set(eta);
      }
    );
  }
}

/**
 * Creates data models for True Airspeed navigation data bar fields.
 */
export class NavDataBarFieldTasModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.TrueAirspeed, AdcEvents> {
  /** @inheritdoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<NumberUnitInterface<UnitFamily.Speed>> {
    return new NavDataBarFieldConsumerNumberUnitModel(
      gpsValidity,
      this.sub.on('tas'), 0, UnitType.KNOT
    );
  }
}

/**
 * Creates data models for Track Angle Error navigation data bar fields.
 */
export class NavDataBarFieldTkeModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.TrackAngleError, GNSSEvents & LNavEvents & LNavDataEvents> {
  /** @inheritdoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<NumberUnitInterface<UnitFamily.Angle>> {
    return new NavDataBarFieldConsumerModel(
      NumberUnitSubject.create(UnitType.DEGREE.createNumber(NaN)),
      gpsValidity,
      [
        this.sub.on('lnav_is_tracking').whenChanged(),
        this.sub.on('lnavdata_dtk_true').whenChanged(),
        this.sub.on('track_deg_true').whenChanged()
      ],
      [false, 0, 0] as [boolean, number, number],
      (sub, validity, [isTracking, dtk, track]) => {
        const gpsValid = validity.get() === NavDataFieldGpsValidity.DeadReckoning || validity.get() === NavDataFieldGpsValidity.Valid;
        sub.set((isTracking.get() && gpsValid) ? NavMath.diffAngle(dtk.get(), track.get()) : NaN);
      }
    );
  }
}

/**
 * Creates data models for Ground Track navigation data bar fields.
 */
export class NavDataBarFieldTrkModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.GroundTrack, GNSSEvents & AhrsEvents> {
  /** @inheritdoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<NumberUnitInterface<NavAngleUnitFamily>> {
    return new NavDataBarFieldConsumerModel(
      BasicNavAngleSubject.create(BasicNavAngleUnit.create(true).createNumber(0)),
      gpsValidity,
      [
        this.sub.on('hdg_deg_true'),
        this.sub.on('ground_speed'),
        this.sub.on('track_deg_magnetic'),
        this.sub.on('magvar')
      ],
      [0, 0, 0, 0] as [number, number, number, number],
      (sub, validity, [hdg, gs, track, magVar]) => {
        const gpsValid = validity.get() === NavDataFieldGpsValidity.DeadReckoning || validity.get() === NavDataFieldGpsValidity.Valid;

        if (gs.get() < 5) {
          sub.set(gpsValid ? hdg.get() : NaN, magVar.get());
        } else {
          sub.set(gpsValid ? track.get() : NaN, magVar.get());
        }
      }
    );
  }
}

/**
 * Creates data models for Vertical Speed Required navigation data bar fields.
 */
export class NavDataBarFieldVsrModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.VerticalSpeedRequired, VNavDataEvents & VNavEvents> {
  /** @inheritdoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<NumberUnitInterface<UnitFamily.Speed>> {
    return new NavDataBarFieldConsumerModel(
      NumberUnitSubject.create(UnitType.FPM.createNumber(NaN)),
      gpsValidity,
      [this.sub.on('vnav_required_vs')],
      [0],
      (sub, validity, [vsrSub]) => {
        const gpsValid = validity.get() === NavDataFieldGpsValidity.DeadReckoning || validity.get() === NavDataFieldGpsValidity.Valid;
        const vsr = vsrSub.get();
        sub.set((gpsValid && vsr !== 0) ? vsr : NaN);
      }
    );
  }
}

/**
 * Creates data models for Active Wpt navigation data bar fields.
 */
export class NavDataBarFieldWptModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.Waypoint, LNavDataEvents> {
  /** @inheritDoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<string> {
    return new NavDataBarFieldConsumerModel(
      Subject.create('_____'),
      gpsValidity,
      [this.sub.on('lnavdata_waypoint_ident')],
      [''],
      (sub, validity, [identSubject]) => {
        const ident = identSubject.get();
        sub.set(ident === '' ? '_____' : ident);
      }
    );
  }
}

/**
 * Creates data models for Cross Track navigation data bar fields.
 */
export class NavDataBarFieldXtkModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.CrossTrack, LNavEvents & LNavDataEvents> {
  /** @inheritdoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<NumberUnitInterface<UnitFamily.Distance>> {
    return new NavDataBarFieldConsumerModel(
      NumberUnitSubject.create(UnitType.NMILE.createNumber(NaN)),
      gpsValidity,
      [
        this.sub.on('lnav_is_tracking').whenChanged(),
        this.sub.on('lnavdata_xtk').whenChanged()
      ],
      [false, 0] as [boolean, number],
      (sub, validity, [isTracking, xtk]) => {
        const gpsValid = validity.get() === NavDataFieldGpsValidity.DeadReckoning || validity.get() === NavDataFieldGpsValidity.Valid;
        sub.set((isTracking.get() && gpsValid) ? xtk.get() : NaN);
      }
    );
  }
}