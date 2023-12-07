import {
  AccelerometerEvents, AdcEvents, AhrsEvents, BasicNavAngleSubject, BasicNavAngleUnit, ClockEvents, EngineEvents, EventBus,
  FlightPlanCopiedEvent, FlightPlanIndicationEvent, FlightPlannerEvents, FlightPlanOriginDestEvent, GNSSEvents, ICAO,
  LNavEvents, NavAngleUnit, NavAngleUnitFamily, NavMath, NumberUnitInterface, NumberUnitSubject, OriginDestChangeType,
  PressurizationEvents, Subject, Subscribable, UnitFamily, UnitType, VNavDataEvents, VNavEvents
} from '@microsoft/msfs-sdk';

import { Fms } from '../../flightplan/Fms';
import { LNavDataEvents } from '../../navigation/LNavDataEvents';
import { NavDataFieldGpsValidity } from '../navdatafield/NavDataFieldModel';
import { NavDataFieldType } from '../navdatafield/NavDataFieldType';
import { EventBusNavDataBarFieldTypeModelFactory } from './EventBusNavDataBarFieldTypeModelFactory';
import {
  NavDataBarFieldConsumerValueModel, NavDataBarFieldConsumerValueNumberUnitModel, NavDataBarFieldGenericModel, NavDataBarFieldModel
} from './NavDataBarFieldModel';

/**
 * Creates data models for Above Ground Level navigation data bar fields.
 */
export class NavDataBarFieldAglModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.AboveGroundLevel, GNSSEvents> {
  /** @inheritdoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<NumberUnitInterface<UnitFamily.Distance>> {
    return new NavDataBarFieldConsumerValueModel(
      NumberUnitSubject.create(UnitType.FOOT.createNumber(NaN)),
      gpsValidity,
      [
        this.sub.on('above_ground_height'),
      ],
      [0] as [number],
      (sub, validity, [alt]) => {
        const gpsValid = validity.get() === NavDataFieldGpsValidity.DeadReckoning || validity.get() === NavDataFieldGpsValidity.Valid;
        sub.set(gpsValid ? alt.get() : NaN);
      }
    );
  }
}

/**
 * Creates data models for Bearing to Waypoint navigation data bar fields.
 */
export class NavDataBarFieldBrgModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.BearingToWaypoint, GNSSEvents & LNavEvents & LNavDataEvents> {
  /** @inheritdoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<NumberUnitInterface<NavAngleUnitFamily, NavAngleUnit>> {
    return new NavDataBarFieldConsumerValueModel(
      BasicNavAngleSubject.create(BasicNavAngleUnit.create(true).createNumber(0)),
      gpsValidity,
      [
        this.sub.on('lnav_is_tracking'),
        this.sub.on('lnavdata_waypoint_bearing_mag'),
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
 * Creates data models for Cabin Altitude navigation data bar fields.
 */
export class NavDataBarFieldCabinAltitudeModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.CabinAltitude, PressurizationEvents> {
  /** @inheritdoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<NumberUnitInterface<UnitFamily.Distance>> {
    return new NavDataBarFieldConsumerValueModel(
      NumberUnitSubject.create(UnitType.FOOT.createNumber(NaN)),
      gpsValidity,
      [
        this.sub.on('cabin_altitude'),
      ],
      [0] as [number],
      (sub, validity, [alt]) => {
        sub.set(alt.get());
      }
    );
  }
}

/**
 * Creates data models for Climb Gradient navigation data bar fields.
 */
export class NavDataBarFieldClgModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.ClimbGradient, AdcEvents & GNSSEvents> {
  /** @inheritdoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<number> {
    return new NavDataBarFieldConsumerValueModel(
      Subject.create(NaN),
      gpsValidity,
      [
        this.sub.on('vertical_speed'),
        this.sub.on('ground_speed'),
      ],
      [0, 0] as [number, number],
      (sub, validity, [vs, gs]) => {
        const gpsValid = validity.get() === NavDataFieldGpsValidity.DeadReckoning || validity.get() === NavDataFieldGpsValidity.Valid;
        const gsValue = gs.get();
        if (gpsValid && gsValue >= 30) {
          sub.set(vs.get() / UnitType.KNOT.convertTo(gsValue, UnitType.FPM) * 100);
        } else {
          sub.set(NaN);
        }
      }
    );
  }
}

/**
 * Creates data models for Climb Gradient (height per distance) navigation data bar fields.
 */
export class NavDataBarFieldClmModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.ClimbGradientPerDistance, AdcEvents & GNSSEvents> {
  /** @inheritdoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<NumberUnitInterface<UnitFamily.DistanceRatio>> {
    return new NavDataBarFieldConsumerValueModel(
      NumberUnitSubject.create(UnitType.FOOT_PER_NMILE.createNumber(NaN)),
      gpsValidity,
      [
        this.sub.on('vertical_speed'),
        this.sub.on('ground_speed'),
      ],
      [0, 0] as [number, number],
      (sub, validity, [vs, gs]) => {
        const gpsValid = validity.get() === NavDataFieldGpsValidity.DeadReckoning || validity.get() === NavDataFieldGpsValidity.Valid;
        const gsValue = gs.get();
        if (gpsValid && gsValue >= 30) {
          sub.set(vs.get() / gsValue * 60);
        } else {
          sub.set(NaN);
        }
      }
    );
  }
}

/**
 * Creates data models for Density Altitude navigation data bar fields.
 */
export class NavDataBarFieldDensityAltitudeModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.DensityAltitude, AdcEvents> {
  /** @inheritdoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<NumberUnitInterface<UnitFamily.Distance>> {
    return new NavDataBarFieldConsumerValueModel(
      NumberUnitSubject.create(UnitType.FOOT.createNumber(NaN)),
      gpsValidity,
      [
        this.sub.on('pressure_alt'),
      ],
      [0] as [number],
      (sub, validity, [alt]) => {
        sub.set(alt.get());
      }
    );
  }
}

/**
 * Creates data models for Destination navigation data bar fields.
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
    return new NavDataBarFieldConsumerValueModel(
      NumberUnitSubject.create(UnitType.NMILE.createNumber(NaN)),
      gpsValidity,
      [
        this.sub.on('lnav_is_tracking'),
        this.sub.on('lnavdata_waypoint_distance')
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
    return new NavDataBarFieldConsumerValueModel(
      NumberUnitSubject.create(UnitType.NMILE.createNumber(NaN)),
      gpsValidity,
      [
        this.sub.on('lnav_is_tracking'),
        this.sub.on('lnavdata_destination_distance')
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
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<NumberUnitInterface<NavAngleUnitFamily, NavAngleUnit>> {
    return new NavDataBarFieldConsumerValueModel(
      BasicNavAngleSubject.create(BasicNavAngleUnit.create(true).createNumber(0)),
      gpsValidity,
      [
        this.sub.on('lnav_is_tracking'),
        this.sub.on('lnavdata_dtk_mag'),
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
 * Creates data models for Fuel Economy navigation data bar fields.
 */
export class NavDataBarFieldEcoModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.FuelEconomy, GNSSEvents & EngineEvents> {
  /** @inheritdoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<NumberUnitInterface<UnitFamily.DistancePerWeight>> {
    return new NavDataBarFieldConsumerValueModel(
      NumberUnitSubject.create(UnitType.NMILE_PER_GALLON_FUEL.createNumber(NaN)),
      gpsValidity,
      [
        this.sub.on('fuel_flow_total'),
        this.sub.on('ground_speed'),
      ],
      [0, 0] as [number, number],
      (sub, validity, [ff, gs]) => {
        const gpsValid = validity.get() === NavDataFieldGpsValidity.DeadReckoning || validity.get() === NavDataFieldGpsValidity.Valid;
        const ffValue = ff.get();
        const gsValue = gs.get();
        sub.set(gpsValid && ffValue > 0 && gsValue >= 30 ? gsValue / ffValue : NaN);
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
    return new NavDataBarFieldConsumerValueModel(
      NumberUnitSubject.create(UnitType.HOUR.createNumber(NaN)),
      gpsValidity,
      [
        this.sub.on('fuel_usable_total'),
        this.sub.on('fuel_flow_total')
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
    return new NavDataBarFieldConsumerValueModel(
      NumberUnitSubject.create(UnitType.HOUR.createNumber(NaN)),
      gpsValidity,
      [
        this.sub.on('lnav_is_tracking'),
        this.sub.on('lnavdata_destination_distance'),
        this.sub.on('ground_speed')
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
    return new NavDataBarFieldConsumerValueModel(
      Subject.create(NaN),
      gpsValidity,
      [
        this.sub.on('lnav_is_tracking'),
        this.sub.on('lnavdata_waypoint_distance'),
        this.sub.on('ground_speed'),
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
    return new NavDataBarFieldConsumerValueModel(
      NumberUnitSubject.create(UnitType.HOUR.createNumber(NaN)),
      gpsValidity,
      [
        this.sub.on('lnav_is_tracking'),
        this.sub.on('lnavdata_waypoint_distance'),
        this.sub.on('ground_speed')
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
 * Creates data models for Fuel Flow navigation data bar fields.
 */
export class NavDataBarFieldFuelFlowModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.FuelFlow, EngineEvents> {
  /** @inheritdoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<NumberUnitInterface<UnitFamily.WeightFlux>> {
    return new NavDataBarFieldConsumerValueModel(
      NumberUnitSubject.create(UnitType.GPH_FUEL.createNumber(NaN)),
      gpsValidity,
      [
        this.sub.on('fuel_flow_total'),
      ],
      [0] as [number],
      (sub, validity, [fuelFlow]) => {
        sub.set(fuelFlow.get());
      }
    );
  }
}

/**
 * Creates data models for Flight Level navigation data bar fields.
 */
export class NavDataBarFieldFlightLevelModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.FlightLevel, GNSSEvents> {
  /** @inheritdoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<NumberUnitInterface<UnitFamily.Distance>> {
    return new NavDataBarFieldConsumerValueModel(
      NumberUnitSubject.create(UnitType.FOOT.createNumber(NaN)),
      gpsValidity,
      [
        this.sub.on('gps-position'),
      ],
      [{ lat: 0, long: 0, alt: 0 }] as [LatLongAlt],
      (sub, validity, [latLongAlt]) => {
        const gpsValid = validity.get() === NavDataFieldGpsValidity.DeadReckoning || validity.get() === NavDataFieldGpsValidity.Valid;
        sub.set(gpsValid ? latLongAlt.get().alt : NaN);
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
    return new NavDataBarFieldConsumerValueNumberUnitModel(
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
    return new NavDataBarFieldConsumerValueModel(
      NumberUnitSubject.create(UnitType.GALLON_FUEL.createNumber(NaN)),
      gpsValidity,
      [
        this.sub.on('lnav_is_tracking'),
        this.sub.on('lnavdata_destination_distance'),
        this.sub.on('ground_speed'),
        this.sub.on('fuel_usable_total'),
        this.sub.on('fuel_flow_total')
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
 * Creates data models for G-Meter navigation data bar fields.
 */
export class NavDataBarFieldGMeterModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.GMeter, AccelerometerEvents> {
  /** @inheritdoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<number> {
    return new NavDataBarFieldConsumerValueModel(
      Subject.create(NaN),
      gpsValidity,
      [
        this.sub.on('g_force'),
      ],
      [0] as [number],
      (sub, validity, [g]) => {
        sub.set(g.get());
      }
    );
  }
}

/**
 * Creates data models for GPS Altitude navigation data bar fields.
 */
export class NavDataBarFieldGpsAltitudeModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.GpsAltitude, GNSSEvents> {
  /** @inheritdoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<NumberUnitInterface<UnitFamily.Distance>> {
    return new NavDataBarFieldConsumerValueModel(
      NumberUnitSubject.create(UnitType.FOOT.createNumber(NaN)),
      gpsValidity,
      [
        this.sub.on('gps-position'),
      ],
      [{ lat: 0, long: 0, alt: 0 }] as [LatLongAlt],
      (sub, validity, [latLongAlt]) => {
        const gpsValid = validity.get() === NavDataFieldGpsValidity.DeadReckoning || validity.get() === NavDataFieldGpsValidity.Valid;
        sub.set(gpsValid ? latLongAlt.get().alt : NaN);
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
    return new NavDataBarFieldConsumerValueModel(
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
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<NumberUnitInterface<UnitFamily.TemperatureDelta>> {
    return new NavDataBarFieldConsumerValueModel(
      NumberUnitSubject.create(UnitType.DELTA_CELSIUS.createNumber(NaN)),
      gpsValidity,
      [
        this.sub.on('ambient_temp_c'),
        this.sub.on('isa_temp_c')
      ],
      [0],
      (sub, validity, [sat, isa]) => {
        sub.set(sat.get() - isa.get());
      }
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
    return new NavDataBarFieldConsumerValueModel(
      Subject.create(NaN),
      gpsValidity,
      [
        this.sub.on('lnav_is_tracking'),
        this.sub.on('lnavdata_destination_distance'),
        this.sub.on('ground_speed'),
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
 * Creates data models for Mach Number navigation data bar fields.
 */
export class NavDataBarFieldMachModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.MachNumber, AdcEvents> {
  /** @inheritdoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<number> {
    return new NavDataBarFieldConsumerValueModel(
      Subject.create(NaN),
      gpsValidity,
      [
        this.sub.on('mach_number'),
      ],
      [0] as [number],
      (sub, validity, [mach]) => {
        sub.set(mach.get());
      }
    );
  }
}

/**
 * Creates data models for Outside Air Temperature navigation data bar fields.
 */
export class NavDataBarFieldOatModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.OutsideTemperature, AdcEvents> {
  /** @inheritdoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<NumberUnitInterface<UnitFamily.Temperature>> {
    return new NavDataBarFieldConsumerValueModel(
      NumberUnitSubject.create(UnitType.CELSIUS.createNumber(NaN)),
      gpsValidity,
      [
        this.sub.on('ambient_temp_c'),
      ],
      [0] as [number],
      (sub, validity, [temp]) => {
        sub.set(temp.get());
      }
    );
  }
}

/**
 * Creates data models for Ram Air Temperature navigation data bar fields.
 */
export class NavDataBarFieldRatModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.RamAirTemperature, AdcEvents> {
  /** @inheritdoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<NumberUnitInterface<UnitFamily.Temperature>> {
    return new NavDataBarFieldConsumerValueModel(
      NumberUnitSubject.create(UnitType.CELSIUS.createNumber(NaN)),
      gpsValidity,
      [
        this.sub.on('ram_air_temp_c'),
      ],
      [0] as [number],
      (sub, validity, [temp]) => {
        sub.set(temp.get());
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
    return new NavDataBarFieldConsumerValueNumberUnitModel(
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
    return new NavDataBarFieldConsumerValueModel(
      NumberUnitSubject.create(UnitType.DEGREE.createNumber(NaN)),
      gpsValidity,
      [
        this.sub.on('lnav_is_tracking'),
        this.sub.on('lnavdata_dtk_true'),
        this.sub.on('track_deg_true')
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
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<NumberUnitInterface<NavAngleUnitFamily, NavAngleUnit>> {
    return new NavDataBarFieldConsumerValueModel(
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
 * Creates data models for UTC Time navigation data bar fields.
 */
export class NavDataBarFieldUtcModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.UtcTime, ClockEvents> {
  /** @inheritdoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<number> {
    return new NavDataBarFieldConsumerValueModel(
      Subject.create(NaN),
      gpsValidity,
      [
        this.sub.on('simTime')
      ],
      [NaN] as [number],
      (sub, validity, [time]) => {
        sub.set(time.get());
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
    return new NavDataBarFieldConsumerValueModel(
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
 * Creates data models for Active Waypoint navigation data bar fields.
 */
export class NavDataBarFieldWptModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.Waypoint, LNavDataEvents> {
  /** @inheritDoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<string> {
    return new NavDataBarFieldConsumerValueModel(
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
    return new NavDataBarFieldConsumerValueModel(
      NumberUnitSubject.create(UnitType.NMILE.createNumber(NaN)),
      gpsValidity,
      [
        this.sub.on('lnav_is_tracking'),
        this.sub.on('lnavdata_xtk')
      ],
      [false, 0] as [boolean, number],
      (sub, validity, [isTracking, xtk]) => {
        const gpsValid = validity.get() === NavDataFieldGpsValidity.DeadReckoning || validity.get() === NavDataFieldGpsValidity.Valid;
        sub.set((isTracking.get() && gpsValid) ? xtk.get() : NaN);
      }
    );
  }
}
